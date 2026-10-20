import type { Metadata } from "next";
import { PendingSubmit } from "@/components/pending-submit";
import { unsubscribe } from "./actions";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; done?: string; error?: string }>;
}) {
  const { e, t, done, error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Email preferences</p>
        {done ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-semibold text-forest">You&apos;re unsubscribed</h1>
            <p className="mt-4 text-sm text-ink/70">
              We won&apos;t send that address any more news or invitations. You&apos;ll still get emails
              you asked for, like RSVPs and replies to your inquiries.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Unsubscribe</h1>
            <p className="mt-4 text-sm text-ink/70">
              Stop news and invitations from You Do, I Do. Emails you asked for, like RSVPs and
              replies to your inquiries, keep coming.
            </p>
            {error && (
              <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error === "1" ? "That doesn't look like an email address." : "Something went wrong. Please try again."}
              </p>
            )}
            <form className="mt-6 flex flex-col gap-4" action={unsubscribe}>
              {t && <input type="hidden" name="t" value={t} />}
              <label className="flex flex-col gap-1 text-sm text-ink">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={e ?? ""}
                  autoComplete="email"
                  className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
                />
              </label>
              <PendingSubmit
                pendingText="Unsubscribing..."
                className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
              >
                Unsubscribe
              </PendingSubmit>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
