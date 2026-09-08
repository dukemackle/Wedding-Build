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
export async function requireAdmin() {
  if (!(await isCurrentUserAdmin())) {
    redirect("/dashboard");
  }
}
