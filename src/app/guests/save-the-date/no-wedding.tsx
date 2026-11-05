import Link from "next/link";

/** Both save-the-date screens, before the couple has a wedding. */
export function NoWedding() {
  return (
    <div className="rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
      <h1 className="font-display text-3xl font-semibold text-forest">Set up your wedding first</h1>
      <p className="mt-4 text-ink/70">Add your names and date on the Dashboard, and they&apos;ll be on your card when you start.</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
