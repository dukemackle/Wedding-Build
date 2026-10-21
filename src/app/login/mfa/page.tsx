import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { MfaStep } from "./mfa-step";

/**
 * The admin panel's second sign-in step: an authenticator-app code. The first
 * visit sets the app up; every sign-in after that just asks for the code.
 * Lives under /login rather than /admin because the admin layout itself
 * sends anyone without this step back here.
 */
export default async function MfaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminUser(user)) {
    redirect("/login?error=" + encodeURIComponent("This account doesn't have admin access."));
  }
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") redirect("/admin");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-24">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-10">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin sign-in</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">One more step</h1>
        <MfaStep />
      </div>
    </main>
  );
}
