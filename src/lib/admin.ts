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
// A signed-out visitor goes to /login (admin.wrenwed.com has its own
// separate session, so this is the common case there) rather than
// /dashboard -- on the admin subdomain /dashboard isn't a real page,
// it just bounces back to /admin, which would re-run this check and
// redirect to /dashboard again, looping forever.
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
    redirect("/dashboard");
  }
}
