import { refuseUnlessSecret } from "@/lib/batch-secret";
import { INQUIRY_FROM_ADDRESS, getResendClient } from "@/lib/resend";
import { BILLING_CYCLES, REMINDER_DAYS, daysUntil, formatUsd, rolledRenewal, type OpsService } from "@/lib/spend";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

// The daily pass over Spend & renewals. First, subscriptions whose renewal
// date has passed move on to their next one (they renew themselves). Then the
// owner gets one email about yearly and one-time items due within
// REMINDER_DAYS, once per renewal date (ops_services.reminded_for); monthly
// bills are left out, since a reminder every month for each is noise. Called
// daily by .github/workflows/spend-reminders.yml with SPEND_REMINDER_SECRET
// (set in Cloudflare and in GitHub Actions); one Supabase read, one send.

function line(s: OpsService, today: Date): string {
  const days = daysUntil(s.next_renewal!, today);
  const when = days < 0 ? `was due ${s.next_renewal}` : days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"} (${s.next_renewal})`;
  const price = s.amount_cents === null ? "price unknown" : `${formatUsd(s.amount_cents)} ${BILLING_CYCLES[s.billing_cycle].toLowerCase()}`;
  return `- ${s.name}: ${price}, ${when}${s.paid_with ? `, ${s.paid_with}` : ""}`;
}

export async function POST(request: Request) {
  const refused = refuseUnlessSecret(request, process.env.SPEND_REMINDER_SECRET, "Spend reminders aren't switched on.");
  if (refused) return refused;

  const today = new Date();
  const horizon = new Date(today.getTime() + REMINDER_DAYS * 86_400_000).toISOString().slice(0, 10);
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("ops_services")
    .select("*")
    .eq("status", "active")
    .lte("next_renewal", horizon)
    .order("next_renewal")
    .returns<OpsService[]>();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const rolled = rows.flatMap((s) => {
    const next = rolledRenewal(s, today);
    return next === s.next_renewal ? [] : [{ ...s, next_renewal: next }];
  });
  await Promise.all(rolled.map((s) => admin.from("ops_services").update({ next_renewal: s.next_renewal }).eq("id", s.id)));
  const rolledIds = new Set(rolled.map((s) => s.id));

  const due = [...rows.filter((s) => !rolledIds.has(s.id)), ...rolled]
    .filter((s) => s.billing_cycle !== "monthly" && s.next_renewal! <= horizon && s.reminded_for !== s.next_renewal)
    .sort((a, b) => a.next_renewal!.localeCompare(b.next_renewal!));
  if (due.length === 0) return Response.json({ sent: 0, rolled: rolled.length });

  const to = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (to.length === 0 || !process.env.RESEND_API_KEY) {
    return Response.json({ error: "ADMIN_EMAIL or RESEND_API_KEY isn't set." }, { status: 503 });
  }

  const { error: sendError } = await getResendClient().emails.send({
    from: INQUIRY_FROM_ADDRESS,
    to,
    subject: due.length === 1 ? `${due[0].name} renews soon` : `${due.length} renewals coming up`,
    text: [
      "Coming up on Spend & renewals:",
      "",
      ...due.map((s) => line(s, today)),
      "",
      "Subscriptions move to their next date by themselves. Anything else, check or update here: https://admin.youdoido.com/admin/spend",
    ].join("\n"),
  });
  if (sendError) return Response.json({ error: sendError.message }, { status: 502 });

  // One update per row, at most a handful; a failed one just means a repeat email tomorrow.
  await Promise.all(due.map((s) => admin.from("ops_services").update({ reminded_for: s.next_renewal }).eq("id", s.id)));
  return Response.json({ sent: due.length, rolled: rolled.length });
}
