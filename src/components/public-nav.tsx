import Link from "next/link";
import { WrenMark } from "@/components/wren-mark";
import { AutoHideHeader } from "@/components/auto-hide-header";

/**
 * The bar a logged-out visitor sees on the public venue and vendor pages.
 * Same edge-to-edge frame as AppNav, one row: the mark, the two things they
 * can browse, and the way in. On a phone the browse links drop out -- the
 * page itself is the browse screen -- and only Log in and Sign up remain.
 */
export function PublicNav({ next }: { next?: string }) {
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <AutoHideHeader>
      <div className="flex w-full items-center justify-between gap-4 px-6 py-2">
        <WrenMark href="/" />
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/venues" className="hidden text-sm text-ink/70 hover:text-forest sm:block xl:text-base">
            Venues
          </Link>
          <Link href="/vendors" className="hidden text-sm text-ink/70 hover:text-forest sm:block xl:text-base">
            Vendors
          </Link>
          <Link href={`/login${q}`} className="shrink-0 text-sm text-brass hover:underline xl:text-base">
            Log in
          </Link>
          <Link
            href={`/signup${q}`}
            className="shrink-0 rounded-full bg-forest px-4 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            Sign up free
          </Link>
        </div>
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
}: {
  noun: "venue" | "vendor";
  next: string;
  website?: string | null;
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
          <a href={website} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-brass hover:underline">
            {website}
          </a>
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
