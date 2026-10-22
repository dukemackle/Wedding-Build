import Link from "next/link";
import { thenHref, type SignupIntent } from "@/lib/signup-intent";

const card = "rounded-lg border border-hairline bg-card p-6 shadow-sm";

/**
 * Signed in, no wedding yet: the one step between a new account and the save
 * or inquiry they signed up for. /start comes back here and finishes it.
 */
export function SetupFirst({
  name,
  href,
  then,
  noun,
}: {
  name: string;
  href: string;
  then?: SignupIntent;
  noun: "venues" | "vendors";
}) {
  if (!then) {
    return (
      <div className={`${card} text-sm text-ink/70`}>
        <Link href="/start" className="text-brass hover:underline">
          Set up your wedding
        </Link>{" "}
        to save {noun} and contact them.
      </div>
    );
  }
  return (
    <div className={card}>
      <p className="font-display text-lg font-semibold text-forest">One step left</p>
      <p className="mt-1 text-sm text-ink/70">
        Tell us your names and roughly when, and we&apos;ll{" "}
        {then === "save" ? `save ${name} for you` : `bring you back to ask ${name} about your date`}.
      </p>
      <Link
        href={`/start?next=${encodeURIComponent(thenHref(href, then))}`}
        className="mt-4 block w-full rounded-md bg-forest px-4 py-2.5 text-center text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
      >
        Set up your wedding
      </Link>
    </div>
  );
}
