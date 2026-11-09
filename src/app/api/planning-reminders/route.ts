import { refuseUnlessSecret } from "@/lib/batch-secret";
import { logAutomationRun } from "@/lib/automation-log";
import { logError } from "@/lib/error-log";
import {
  PLANNING_REMINDERS,
  daysUntilWedding,
  openTasks,
  reminderDue,
  reminderEmailHtml,
  reminderEmailText,
  type ReminderEmail,
} from "@/lib/planning-reminders";
import { INQUIRY_FROM_ADDRESS, getResendClient } from "@/lib/resend";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { listAllUsers } from "@/lib/supabase/fetch-all";
import { normalizeEmail, oneClickUnsubscribeUrl, unsubscribeUrl } from "@/lib/unsubscribe";

// The daily pass that sends planning reminders (src/lib/planning-reminders.ts).
// Called by .github/workflows/planning-reminders.yml with
// PLANNING_REMINDER_SECRET, the same pattern as the spend reminders; no
// Claude routine, no new service.
//
// Per wedding: skip test weddings, weddings with no date or a past one, and a
// reminder whose checklist tasks are all ticked. Each reminder is claimed in
// planning_reminders_sent before it is sent, so it goes out at most once.
// Recipients are the owner and partners who can edit, minus anyone who turned
// reminders off or whose mail bounced.
//
// Safety: until PLANNING_REMINDERS_LIVE is "on", only addresses in
// ADMIN_EMAIL are mailed (and nothing is recorded for anyone else), so this
// can run in production before the owner has seen it work.
//
// `?sample=1` instead mails every reminder, with made-up details, to
// ADMIN_EMAIL only, and records nothing: the owner's way to see them all.

/** Resend's free plan is 100 emails a day for the whole account; leave room for RSVPs and logins. */
const MAX_PER_RUN = 40;

type WeddingRow = {
  id: string;
  user_id: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string;
  venue_id: string | null;
  own_venue_name: string | null;
};

type Outgoing = { weddingId: string; key: string; weddingDate: string; to: string; email: ReminderEmail };

const adminEmails = () =>
  (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => normalizeEmail(e)).filter(Boolean);

export async function POST(request: Request) {
  const refused = refuseUnlessSecret(request, process.env.PLANNING_REMINDER_SECRET, "Planning reminders aren't switched on.");
  if (refused) return refused;
  if (!process.env.RESEND_API_KEY || !process.env.UNSUBSCRIBE_SECRET) {
    // No unsubscribe link means no send: every reminder carries one.
    return Response.json({ error: "RESEND_API_KEY or UNSUBSCRIBE_SECRET isn't set." }, { status: 503 });
  }
  if (new URL(request.url).searchParams.get("sample") === "1") return sample();

  const response = await run();
  const result = (await response.clone().json().catch(() => ({}))) as { sent?: number; weddings?: number; error?: string };
  await logAutomationRun(
    "planning_reminders",
    response.ok,
    result.error ?? `${result.sent ?? 0} reminders sent across ${result.weddings ?? 0} weddings`,
  );
  return response;
}

async function message(o: Pick<Outgoing, "to" | "email">) {
  const oneClick = await oneClickUnsubscribeUrl(o.to, "reminders");
  return {
    from: INQUIRY_FROM_ADDRESS,
    to: o.to,
    subject: o.email.reminder.subject,
    text: reminderEmailText(o.email),
    html: reminderEmailHtml(o.email),
    headers: {
      "List-Unsubscribe": `<${oneClick}>, <mailto:hello@youdoido.com?subject=stop%20reminders>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

async function run(): Promise<Response> {
  const admin = createAdminSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + PLANNING_REMINDERS[0].daysBefore * 86_400_000).toISOString().slice(0, 10);

  const { data: weddings, error } = await admin
    .from("weddings")
    .select("id, user_id, partner_a_name, partner_b_name, wedding_date, venue_id, own_venue_name")
    .eq("is_test", false)
    .not("wedding_date", "is", null)
    .gt("wedding_date", today)
    .lte("wedding_date", horizon)
    .returns<WeddingRow[]>();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Which reminder each wedding is in the window for, before any other reads.
  const due = (weddings ?? []).flatMap((w) => {
    const daysOut = daysUntilWedding(w.wedding_date, today);
    const reminder = reminderDue(daysOut);
    if (!reminder) return [];
    if (reminder.skipIfVenue && (w.venue_id || w.own_venue_name)) return [];
    return [{ w, daysOut, reminder }];
  });
  if (!due.length) return Response.json({ sent: 0, weddings: 0 });
  const ids = due.map((d) => d.w.id);

  const titles = [...new Set(due.flatMap((d) => d.reminder.tasks))];
  const [sent, checklist, members, users] = await Promise.all([
    admin.from("planning_reminders_sent").select("wedding_id, reminder_key").in("wedding_id", ids),
    admin.from("checklist_items").select("wedding_id, title, completed").in("wedding_id", ids).in("title", titles),
    admin.from("wedding_members").select("wedding_id, user_id").in("wedding_id", ids).eq("role", "edit"),
    listAllUsers(admin),
  ]);
  if (sent.error || checklist.error || members.error) {
    return Response.json({ error: (sent.error ?? checklist.error ?? members.error)!.message }, { status: 500 });
  }
  const already = new Set((sent.data ?? []).map((r) => `${r.wedding_id}:${r.reminder_key}`));
  const emailOf = new Map(
    users.data.users.filter((u) => u.email && u.email_confirmed_at).map((u) => [u.id, normalizeEmail(u.email!)]),
  );

  const outgoing: Outgoing[] = [];
  for (const { w, daysOut, reminder } of due) {
    if (already.has(`${w.id}:${reminder.key}`)) continue;
    const open = openTasks(reminder, (checklist.data ?? []).filter((t) => t.wedding_id === w.id));
    if (!open) continue;
    const userIds = [w.user_id, ...(members.data ?? []).filter((m) => m.wedding_id === w.id).map((m) => m.user_id)];
    const names = [w.partner_a_name, w.partner_b_name].filter(Boolean).join(" & ") || null;
    for (const to of new Set(userIds.map((id) => emailOf.get(id)).filter((e): e is string => Boolean(e)))) {
      const unsub = await unsubscribeUrl(to, "reminders");
      outgoing.push({
        weddingId: w.id,
        key: reminder.key,
        weddingDate: w.wedding_date,
        to,
        email: { reminder, names, weddingDate: w.wedding_date, daysOut, open, unsubscribeUrl: unsub! },
      });
    }
  }

  // Owner-only until switched on, then minus opt-outs and bounces.
  const live = process.env.PLANNING_REMINDERS_LIVE === "on";
  const owners = new Set(adminEmails());
  const addresses = [...new Set(outgoing.map((o) => o.to))];
  const [optOuts, bounces] = addresses.length
    ? await Promise.all([
        admin.from("planning_reminder_opt_outs").select("email").in("email", addresses),
        admin.from("email_bounces").select("email").in("email", addresses),
      ])
    : [{ data: [] }, { data: [] }];
  const blocked = new Set([...(optOuts.data ?? []), ...(bounces.data ?? [])].map((r) => r.email));
  const sendable = outgoing.filter((o) => !blocked.has(o.to) && (live || owners.has(o.to)));

  // Whole weddings only, so partners get the same reminder on the same day.
  const byWedding = new Map<string, Outgoing[]>();
  for (const o of sendable) byWedding.set(o.weddingId, [...(byWedding.get(o.weddingId) ?? []), o]);
  const batch: Outgoing[] = [];
  for (const group of byWedding.values()) {
    if (batch.length + group.length > MAX_PER_RUN) break; // the rest go tomorrow; every window is a week or more
    batch.push(...group);
  }
  if (!batch.length) return Response.json({ sent: 0, weddings: 0 });

  // Claim first: the primary key turns away a reminder already claimed, even by an overlapping run.
  const claims = [...byWedding.keys()]
    .filter((id) => batch.some((o) => o.weddingId === id))
    .map((id) => {
      const group = byWedding.get(id)!;
      return { wedding_id: id, reminder_key: group[0].key, wedding_date: group[0].weddingDate, recipients: group.length };
    });
  const { data: claimed, error: claimError } = await admin
    .from("planning_reminders_sent")
    .upsert(claims, { onConflict: "wedding_id,reminder_key", ignoreDuplicates: true })
    .select("wedding_id");
  if (claimError) return Response.json({ error: claimError.message }, { status: 500 });
  const mine = new Set((claimed ?? []).map((r) => r.wedding_id));
  const toSend = batch.filter((o) => mine.has(o.weddingId));
  if (!toSend.length) return Response.json({ sent: 0, weddings: 0 });

  try {
    const { error: sendError } = await getResendClient().batch.send(await Promise.all(toSend.map(message)));
    if (sendError) throw new Error(sendError.message);
  } catch (e) {
    // Release the claims so tomorrow's run tries again; nothing went out.
    const released = claims
      .filter((c) => mine.has(c.wedding_id))
      .map((c) => `and(wedding_id.eq.${c.wedding_id},reminder_key.eq.${c.reminder_key})`);
    await admin.from("planning_reminders_sent").delete().or(released.join(","));
    await logError("planning", "planningReminders", e);
    return Response.json({ error: e instanceof Error ? e.message : "Send failed." }, { status: 502 });
  }
  return Response.json({ sent: toSend.length, weddings: mine.size });
}

/** Every reminder with sample details, to ADMIN_EMAIL only. Records nothing. */
async function sample(): Promise<Response> {
  const to = adminEmails();
  if (!to.length) return Response.json({ error: "ADMIN_EMAIL isn't set." }, { status: 503 });
  const date = new Date(Date.now() + 200 * 86_400_000).toISOString().slice(0, 10);
  const emails = await Promise.all(
    to.flatMap((address) =>
      PLANNING_REMINDERS.map(async (reminder) => {
        const email: ReminderEmail = {
          reminder,
          names: "Sam & Riley",
          weddingDate: date,
          daysOut: reminder.daysBefore,
          open: reminder.tasks,
          unsubscribeUrl: (await unsubscribeUrl(address, "reminders"))!,
        };
        const m = await message({ to: address, email });
        return { ...m, subject: `[Sample] ${m.subject}` };
      }),
    ),
  );
  const { error } = await getResendClient().batch.send(emails);
  if (error) return Response.json({ error: error.message }, { status: 502 });
  return Response.json({ sample: emails.length });
}
