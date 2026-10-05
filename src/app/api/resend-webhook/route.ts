import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

// Resend's webhook: what happened to the mail we sent, and mail sent to us.
//
//   email.bounced (Permanent), email.complained, email.suppressed
//       -> email_bounces, so couples are told an address is dead before they
//          write to it, and the data audit can find stale listing emails.
//   email.received
//       -> inbox_messages, then forwarded to the admin inbox. Until this,
//          nothing received at @youdoido.com, so privacy@ (named on the
//          privacy page) and replies to hello@ went nowhere.
//
// Signed by Resend with RESEND_WEBHOOK_SECRET (the "whsec_..." value on the
// webhook in Resend's dashboard). Setup steps: docs/email-playbook.md.

type Event =
  | { type: "email.bounced"; data: { to: string[]; bounce: { type: string; message: string } } }
  | { type: "email.complained"; data: { to: string[] } }
  | { type: "email.suppressed"; data: { to: string[]; suppressed: { type: string; message: string } } }
  | { type: "email.received"; data: { email_id: string; from: string; to: string[]; subject: string } }
  | { type: string; data: unknown };

/** Bodies longer than this are cut: the forward carries the full message. */
const MAX_BODY = 20_000;

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  // Unset means switched off, not open to anyone.
  if (!secret) return Response.json({ error: "Webhook isn't switched on." }, { status: 503 });

  const payload = await request.text();
  const resend = getResendClient();
  let event: Event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    }) as Event;
  } catch {
    return Response.json({ error: "Bad signature." }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  if (event.type === "email.bounced" || event.type === "email.complained" || event.type === "email.suppressed") {
    const e = event as Extract<Event, { type: "email.bounced" | "email.complained" | "email.suppressed" }>;
    // A soft bounce (full mailbox, server down) can clear up; only a
    // permanent one means the address is gone.
    if (e.type === "email.bounced" && e.data.bounce.type !== "Permanent") return Response.json({ ok: true });
    const reason = e.type === "email.bounced" ? "bounce" : e.type === "email.complained" ? "complaint" : "suppressed";
    const detail =
      e.type === "email.bounced" ? e.data.bounce.message : e.type === "email.suppressed" ? e.data.suppressed.message : null;
    const rows = e.data.to.map((to) => ({
      email: to.trim().toLowerCase(),
      reason,
      detail,
      last_event_at: new Date().toISOString(),
    }));
    const { error } = await admin.from("email_bounces").upsert(rows);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (event.type === "email.received") {
    const { email_id: emailId, from, to, subject } = (event as Extract<Event, { type: "email.received" }>).data;
    const { data: full } = await resend.emails.receiving.get(emailId);
    const { error } = await admin.from("inbox_messages").upsert(
      {
        resend_email_id: emailId,
        from_address: from,
        to_addresses: to,
        subject,
        body_text: full?.text?.slice(0, MAX_BODY) ?? null,
      },
      { onConflict: "resend_email_id", ignoreDuplicates: true },
    );
    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Our own sending address writing to us would be a loop, so it isn't passed on.
    const adminEmail = process.env.ADMIN_EMAIL?.split(",")[0]?.trim();
    if (adminEmail && !from.toLowerCase().includes("@youdoido.com")) {
      const { error: forwardError } = await resend.emails.receiving.forward(
        { emailId, to: adminEmail, from: INQUIRY_FROM_ADDRESS },
        { idempotencyKey: `forward-${emailId}` },
      );
      if (!forwardError) {
        await admin.from("inbox_messages").update({ forwarded: true }).eq("resend_email_id", emailId);
      }
    }
    return Response.json({ ok: true });
  }

  // Delivered, opened and the rest: nothing to do, but not an error either.
  return Response.json({ ok: true });
}
