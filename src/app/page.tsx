import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Est. 2026
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-forest">
          The Wedding Ledger
        </h1>
        <p className="mt-4 text-base text-ink/80">
          Budget, venues, guests, and vendors — all in one account.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
