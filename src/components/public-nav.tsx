import Link from "next/link";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import { WrenMark } from "@/components/wren-mark";
import { AutoHideHeader } from "@/components/auto-hide-header";

/**
 * The bar a logged-out visitor sees on the landing page and the public venue
 * and vendor pages. Same edge-to-edge frame as AppNav, one row: the mark, the
 * places to look, and Log in. Signing up is the page's own button ("Start
 * planning" on the landing hero), so the bar doesn't repeat it. On a phone the
 * links fold into a menu beside Log in.
 */
export function PublicNav({ next }: { next?: string }) {
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  const links = [
    { href: "/venues", label: "Venues" },
    { href: "/vendors", label: "Vendors" },
    { href: "/list", label: "For businesses" },
  ];
  return (
    <AutoHideHeader>
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <WrenMark href="/" />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-7">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hidden text-[15px] text-ink/80 hover:text-forest sm:block xl:text-base">
              {l.label}
            </Link>
          ))}
          <Link
            href={`/login${q}`}
            className="shrink-0 px-2 py-3 text-[15px] font-medium text-ink hover:text-forest sm:px-0 xl:text-base"
          >
            Log in
          </Link>
          <details className="group relative sm:hidden">
            <summary
              aria-label="Menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center text-ink [&::-webkit-details-marker]:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
                <path d="M6 6l12 12M18 6L6 18" className="hidden group-open:block" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full mt-2 flex w-56 flex-col rounded-2xl border border-hairline bg-card p-2 shadow-lg">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-xl px-4 py-3 text-base text-forest hover:bg-parchment">
                  {l.label}
                </Link>
              ))}
              <Link
                href={`/signup${q}`}
                className="mt-1 rounded-full bg-forest px-4 py-3 text-center text-base font-medium text-parchment"
              >
                Start planning
              </Link>
            </div>
          </details>
        </nav>
      </div>
    </AutoHideHeader>
  );
}

/**
 * Stands in for the save / contact box on a listing when nobody is signed in.
 * The website stays visible; phone and email come with an account, so the
 * inquiry goes through the product.
 */
export function SignupPrompt({
  noun,
  next,
  website,
  listingId,
}: {
  noun: "venue" | "vendor";
  next: string;
  website?: string | null;
  /** Counts a click on the website as a lead for this listing. */
  listingId?: string;
}) {
  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <p className="font-display text-lg font-semibold text-forest">
        {noun === "venue" ? "Save it, compare it, ask about dates" : "Save them, compare quotes, get in touch"}
      </p>
      <p className="mt-1 text-sm text-ink/70">
        A free account lets you favorite this {noun}, contact them, and keep it next to your budget and guest count.
      </p>
      <Link
        href={`/signup${q}`}
        className="mt-4 block w-full rounded-md bg-forest px-4 py-2.5 text-center text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
      >
        {noun === "venue" ? "Request info — sign up free" : "Request a quote — sign up free"}
      </Link>
      <p className="mt-2 text-center text-sm text-ink/60">
        Have an account?{" "}
        <Link href={`/login${q}`} className="text-brass hover:underline">
          Log in
        </Link>
      </p>
      {website && (
        <div className="mt-4 border-t border-hairline pt-4 text-sm">
          {listingId ? (
            <TrackedContactLink
              listingType={noun}
              listingId={listingId}
              kind="website"
              href={website}
              className="break-all text-brass hover:underline"
            >
              {website}
            </TrackedContactLink>
          ) : (
            <a href={website} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-brass hover:underline">
              {website}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** The heart on a result card, for a logged-out visitor: a way to sign up. */
export function SignupHeart({ next }: { next: string }) {
  return (
    <Link
      href={`/signup?next=${encodeURIComponent(next)}`}
      aria-label="Sign up to save favorites"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-base text-forest shadow-sm transition-colors hover:text-brass"
    >
      <span aria-hidden="true">♡</span>
    </Link>
  );
}

/** A result card's action row, for a logged-out visitor. */
export function SignupCardButton({ next }: { next: string }) {
  return (
    <Link
      href={`/signup?next=${encodeURIComponent(next)}`}
      className="w-full rounded-full border border-hairline bg-card px-3 py-1.5 text-center text-sm text-forest transition-colors hover:border-forest"
    >
      Request a quote
    </Link>
  );
}
