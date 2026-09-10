import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token_hash?: string; type?: string; code?: string }>;
}) {
  const { error, token_hash, type, code } = await searchParams;

  // The reset-password email's link isn't editable in this Supabase project
  // without custom SMTP, so it uses Supabase's own default confirmation
  // link -- which can land here as either a token_hash (email OTP) or a
  // code (PKCE), depending on project config. Handle both, then redirect
  // to the bare /reset-password so the form below renders with a plain
  // session instead of leftover verification params in the URL.
  if (token_hash && type) {
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    if (verifyError) {
      redirect("/login?error=" + encodeURIComponent("That reset link is invalid or has expired."));
    }
    redirect("/reset-password");
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      redirect("/login?error=" + encodeURIComponent("That reset link is invalid or has expired."));
    }
    redirect("/reset-password");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Set a new password
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Reset password
        </h1>

        {error && (
          <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <form className="mt-6 flex flex-col gap-4" action={updatePassword}>
          <label className="flex flex-col gap-1 text-sm text-ink">
            New password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Confirm new password
            <input
              type="password"
              name="confirm_password"
              required
              minLength={6}
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
