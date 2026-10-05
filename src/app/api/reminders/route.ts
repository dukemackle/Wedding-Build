import { refuseBatchCaller } from "@/lib/batch-secret";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import {
  LOOKAHEAD_DAYS,
  buildDigest,
  digestEmail,
  isEmpty,
  isoDay,
  weekStart,
  type DigestPayment,
  type DigestTask,
} from "@/lib/weekly-digest";

// The Monday email. The cron in custom-worker.ts calls this hourly on Mondays
// (from inside the Worker, with BATCH_IMPORT_SECRET), and each call handles up
// to MAX_WEDDINGS weddings that haven't had this week's note yet, so a run
// stays well under Workers Free's 50 subrequests: a fixed handful of queries
// plus one Resend batch call, whatever the count.

/** Per run. Kept low so a run's emails (one per planner) fit one Resend batch of 100. */
const MAX_WEDDINGS = 30;

type WeddingRow = {
  id: string;
  user_id: string;
  member_ids: string[];
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string | null;
};

export async function POST(request: Request) {
  const refused = refuseBatchCaller(request);
  if (refused) return refused;
  if (!process.env.RESEND_API_KEY) return Response.json({ error: "RESEND_API_KEY missing." }, { status: 503 });

  const now = new Date();
  const today = isoDay(now);
  const week = weekStart(now);
  const horizon = new Date(now);
  horizon.setUTCDate(horizon.getUTCDate() + LOOKAHEAD_DAYS);
  const until = isoDay(horizon);

  const admin = createAdminSupabaseClient();
  const [{ data: weddings, error: weddingsError }, { data: done }] = await Promise.all([
    admin
      .from("weddings")
      .select("id, user_id, member_ids, partner_a_name, partner_b_name, wedding_date")
      .or(`wedding_date.is.null,wedding_date.gte.${today}`)
      .returns<WeddingRow[]>(),
    admin.from("reminder_digests").select("wedding_id").eq("week_start", week).returns<{ wedding_id: string }[]>(),
  ]);
  if (weddingsError) return Response.json({ error: weddingsError.message }, { status: 500 });

  const handled = new Set((done ?? []).map((d) => d.wedding_id));
  const batch = (weddings ?? []).filter((w) => !handled.has(w.id)).slice(0, MAX_WEDDINGS);
  if (batch.length === 0) return Response.json({ week, processed: 0, sent: 0, remaining: 0 });
  const ids = batch.map((w) => w.id);

  const [lines, custom, tasks, users, prefs] = await Promise.all([
    admin
      .from("budget_line_items")
      .select("wedding_id, label, override_value, paid_amount, due_date")
      .in("wedding_id", ids)
      .not("due_date", "is", null)
      .lte("due_date", until)
      .returns<{ wedding_id: string; label: string; override_value: number | null; paid_amount: number | null; due_date: string }[]>(),
    admin
      .from("budget_custom_items")
      .select("wedding_id, label, amount, paid_amount, due_date")
      .in("wedding_id", ids)
      .not("due_date", "is", null)
      .lte("due_date", until)
      .returns<{ wedding_id: string; label: string; amount: number; paid_amount: number | null; due_date: string }[]>(),
    admin
      .from("checklist_items")
      .select("wedding_id, title, due_date")
      .in("wedding_id", ids)
      .eq("completed", false)
      .not("due_date", "is", null)
      .lte("due_date", until)
      .returns<{ wedding_id: string; title: string; due_date: string }[]>(),
    // One page of users covers us until 1,000 accounts; past that, page through.
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("email_preferences").select("user_id").eq("weekly_digest", false).returns<{ user_id: string }[]>(),
  ]);
  for (const result of [lines, custom, tasks]) {
    if (result.error) return Response.json({ error: result.error.message }, { status: 500 });
  }

  const emailById = new Map((users.data?.users ?? []).map((u) => [u.id, u.email]));
  const optedOut = new Set((prefs.data ?? []).map((p) => p.user_id));

  const paymentsFor = new Map<string, DigestPayment[]>();
  const tasksFor = new Map<string, DigestTask[]>();
  const push = <T,>(map: Map<string, T[]>, key: string, value: T) => map.set(key, [...(map.get(key) ?? []), value]);

  for (const l of lines.data ?? []) {
    // Without a set price the line is only an estimate: remind, but quote no
    // amount. With one, skip it once it's paid off.
    if (l.override_value === null) {
      if ((l.paid_amount ?? 0) > 0) continue;
      push(paymentsFor, l.wedding_id, { label: l.label, owed: null, dueDate: l.due_date });
      continue;
    }
    const owed = l.override_value - (l.paid_amount ?? 0);
    if (owed > 0.005) push(paymentsFor, l.wedding_id, { label: l.label, owed, dueDate: l.due_date });
  }
  for (const c of custom.data ?? []) {
    const owed = c.amount - (c.paid_amount ?? 0);
    if (owed > 0.005) push(paymentsFor, c.wedding_id, { label: c.label, owed, dueDate: c.due_date });
  }
  for (const t of tasks.data ?? []) push(tasksFor, t.wedding_id, { title: t.title, dueDate: t.due_date });

  const emails: { from: string; to: string; subject: string; text: string }[] = [];
  const log: { wedding_id: string; week_start: string; recipients: number }[] = [];
  for (const w of batch) {
    const digest = buildDigest(paymentsFor.get(w.id) ?? [], tasksFor.get(w.id) ?? [], today);
    const recipients = isEmpty(digest)
      ? []
      : [w.user_id, ...w.member_ids]
          .filter((id, i, all) => all.indexOf(id) === i && !optedOut.has(id))
          .map((id) => emailById.get(id))
          .filter((e): e is string => Boolean(e));
    if (recipients.length > 0) {
      const daysToGo = w.wedding_date
        ? Math.round((Date.parse(`${w.wedding_date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)
        : null;
      const coupleNames = [w.partner_a_name, w.partner_b_name].filter(Boolean).join(" & ") || null;
      const { subject, text } = digestEmail(digest, { coupleNames, daysToGo });
      for (const to of recipients) emails.push({ from: INQUIRY_FROM_ADDRESS, to, subject, text });
    }
    log.push({ wedding_id: w.id, week_start: week, recipients: recipients.length });
  }

  // Send first, then record: a failed send is retried next hour rather than
  // marked done. Batches cap at 100 emails, so split if planners push past it.
  const resend = getResendClient();
  for (let i = 0; i < emails.length; i += 100) {
    const { error } = await resend.batch.send(emails.slice(i, i + 100));
    if (error) return Response.json({ error: error.message, sentBeforeError: i }, { status: 502 });
  }
  const { error: logError } = await admin.from("reminder_digests").upsert(log, { onConflict: "wedding_id,week_start" });
  if (logError) return Response.json({ error: logError.message }, { status: 500 });

  return Response.json({
    week,
    processed: batch.length,
    sent: emails.length,
    remaining: (weddings ?? []).filter((w) => !handled.has(w.id)).length - batch.length,
  });
}
