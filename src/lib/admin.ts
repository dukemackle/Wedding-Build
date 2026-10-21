import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * The addresses allowed into the admin panel.
 *
 * ADMIN_EMAIL takes a comma-separated list, not just one address. A single
 * value meant moving admin access to a different account was a cliff: change
 * the variable and the old account loses the panel the instant the new one
 * is meant to take over, with nothing to fall back on if that account can't
 * sign in. A list lets both work during a handover, and the old one gets
 * removed afterwards.
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allowed = adminEmails();
  return allowed.length > 0 && allowed.includes(email.toLowerCase());
}

/**
 * An admin is a listed address the account has proven it owns. Without the
 * confirmation check, signing up as an unregistered listed address would be
 * enough wherever Supabase lets accounts in before the email is confirmed.
 */
export function isAdminUser(
  user: { email?: string; email_confirmed_at?: string | null } | null | undefined,
): boolean {
  return Boolean(user?.email_confirmed_at) && isAdminEmail(user?.email);
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return isAdminUser(user);
}

/**
 * Whether this session has passed the second sign-in step (an authenticator
 * code). Admin reads every couple's data, so a password alone isn't enough:
 * a reused or phished password would otherwise open all of it. The level
 * comes from the access token getUser() has just validated.
 */
async function passedSecondStep(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return !error && data?.currentLevel === "aal2";
}

/**
 * The signed-in admin, or null -- for code that answers rather than
 * redirects (Ask Wren's server actions). Same rule as requireAdmin().
 */
export async function currentAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user) || !(await passedSecondStep(supabase))) return null;
  return user;
}

// Call at the top of every admin page/layout and every admin server
// action -- the layout gate alone doesn't protect an action invoked
// directly, so each action re-checks independently.
//
// Every failure here goes to /login, never /dashboard -- /dashboard
// isn't a real page on the admin subdomain, it just bounces back to
// /admin, which would re-run this check and redirect again, looping
// forever. /login itself never redirects a signed-in visitor away, so
// it's a safe landing spot whether the visitor is signed out or just
// signed in as the wrong account. An admin who hasn't entered an
// authenticator code this session goes to /login/mfa, which sets one up
// the first time. (Lost the phone? Remove the factor in the Supabase
// dashboard, Authentication > Users, and the next sign-in sets up a new one.)
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/login?error=" + encodeURIComponent("This account doesn't have admin access."));
  }

  if (!(await passedSecondStep(supabase))) {
    redirect("/login/mfa");
  }
}
