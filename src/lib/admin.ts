import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(user?.email && adminEmail && user.email.toLowerCase() === adminEmail);
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

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!(user.email && adminEmail && user.email.toLowerCase() === adminEmail)) {
    redirect("/login?error=" + encodeURIComponent("This account doesn't have admin access."));
  }
}
