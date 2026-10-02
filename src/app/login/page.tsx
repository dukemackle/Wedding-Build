import Link from "next/link";
import { PendingSubmit } from "@/components/pending-submit";
import { headers } from "next/headers";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;
  // The admin panel signs in here too, and everything outside /admin
  // redirects away on that host -- so no business links there.
  const isAdminHost = (await headers()).get("host") === "admin.youdoido.com";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 sm:px-6 sm:py-24 md:flex-row md:items-start md:gap-7">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Log in
        </h1>

        {message && (
          <p className="mt-4 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <form className="mt-6 flex flex-col gap-4" action={login}>
          {next && <input type="hidden" name="next" value={next} />}
          <label className="flex flex-col gap-1 text-sm text-ink">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Password
            <input
              type="password"
              name="password"
              required
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <Link
            href="/forgot-password"
            className="self-end text-sm text-brass hover:underline"
          >
            Forgot password?
          </Link>
          <PendingSubmit
            pendingText="Logging in..."
            className="mt-2 rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            Log in
          </PendingSubmit>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          Don&apos;t have an account?{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="font-medium text-brass hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Beside the login card on a wide screen, below it on a phone -- so
          couples still meet the form they came for first. */}
      {!isAdminHost && (
        <div className="w-full max-w-sm rounded-lg border border-hairline bg-gradient-to-b from-card to-brass/[0.06] p-6 shadow-sm sm:p-8 md:max-w-[340px]">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">For venues &amp; vendors</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-forest">Run a wedding business?</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Get listed where couples plan. Free, with no account or password: we email you a private link
            whenever you want to make changes.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/list"
              className="rounded-md bg-forest px-4 py-2 text-center font-medium text-parchment transition-colors hover:bg-forest/90"
            >
              List your business
            </Link>
            <Link
              href="/list/edit"
              className="rounded-md border border-forest px-4 py-2 text-center font-medium text-forest transition-colors hover:bg-forest/5"
            >
              Edit my listing
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink/55">Every listing is reviewed before it goes live.</p>
        </div>
      )}
    </main>
  );
}
