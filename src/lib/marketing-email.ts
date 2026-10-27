import "server-only";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { normalizeEmail, oneClickUnsubscribeUrl, unsubscribeUrl } from "@/lib/unsubscribe";

/**
 * The only way to send marketing email: newsletters, product news, promos,
 * re-engagement, invitations to list or claim a business. Transactional mail
 * (RSVPs, inquiries, claim links someone asked for) keeps using Resend
 * directly and must never carry promotion.
 *
 * CAN-SPAM, checked here rather than trusted to each caller (docs/legal.md):
 * - a physical postal address in the footer (MARKETING_POSTAL_ADDRESS);
 * - a working unsubscribe link plus the List-Unsubscribe headers mail apps
 *   turn into their own button (UNSUBSCRIBE_SECRET);
 * - nobody who opted out or whose mail bounced;
 * - couples only with a recorded, confirmed opt-in. Businesses may get one
 *   invitation unless they opted out (the vendor-outreach skill's rules on
 *   volume and follow-ups still apply).
 * Missing configuration refuses the send instead of sending without it.
 */

export type MarketingAudience = "couple" | "business";

export type MarketingSendResult =
  | { sent: true }
  | { sent: false; reason: "not-configured" | "opted-out" | "bounced" | "no-consent" | "send-failed" };

export function marketingEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY && process.env.UNSUBSCRIBE_SECRET && process.env.MARKETING_POSTAL_ADDRESS?.trim(),
  );
}

async function hasConfirmedOptIn(email: string): Promise<boolean> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("marketing_consents")
    .select("opted_in, user_id")
    .eq("email", email)
    .maybeSingle<{ opted_in: boolean; user_id: string | null }>();
  if (!data?.opted_in || !data.user_id) return false;
  // The box is ticked before the address is confirmed, so a signup typed with
  // someone else's address must not put them on a list.
  const { data: user } = await admin.auth.admin.getUserById(data.user_id);
  return Boolean(user?.user?.email_confirmed_at && normalizeEmail(user.user.email ?? "") === email);
}

export async function sendMarketingEmail(input: {
  to: string;
  audience: MarketingAudience;
  subject: string;
  text: string;
  from?: string;
  replyTo?: string;
}): Promise<MarketingSendResult> {
  if (!marketingEmailConfigured()) return { sent: false, reason: "not-configured" };
  const to = normalizeEmail(input.to);
  const admin = createAdminSupabaseClient();

  const [optOut, bounce] = await Promise.all([
    admin.from("outreach_opt_outs").select("email").eq("email", to).maybeSingle(),
    admin.from("email_bounces").select("email").eq("email", to).maybeSingle(),
  ]);
  if (optOut.data) return { sent: false, reason: "opted-out" };
  if (bounce.data) return { sent: false, reason: "bounced" };
  if (input.audience === "couple" && !(await hasConfirmedOptIn(to))) return { sent: false, reason: "no-consent" };

  const [pageUrl, oneClickUrl] = await Promise.all([unsubscribeUrl(to), oneClickUnsubscribeUrl(to)]);
  if (!pageUrl || !oneClickUrl) return { sent: false, reason: "not-configured" };

  const footer = [
    "",
    "--",
    `Don't want these emails? Unsubscribe: ${pageUrl}`,
    `You Do, I Do LLC · ${process.env.MARKETING_POSTAL_ADDRESS!.trim()}`,
  ].join("\n");

  try {
    const { error } = await getResendClient().emails.send({
      from: input.from ?? INQUIRY_FROM_ADDRESS,
      to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: `${input.text.trimEnd()}\n${footer}`,
      headers: {
        "List-Unsubscribe": `<${oneClickUrl}>, <mailto:hello@youdoido.com?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    return error ? { sent: false, reason: "send-failed" } : { sent: true };
  } catch {
    return { sent: false, reason: "send-failed" };
  }
}
