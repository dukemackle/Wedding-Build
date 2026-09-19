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

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return isAdminEmail(user?.email);
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
// signed in as the wrong account.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/login?error=" + encodeURIComponent("This account doesn't have admin access."));
  }
}
