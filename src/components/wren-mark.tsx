import { BrandRings } from "@/components/brand-rings";
import Link from "next/link";

/**
 * The Wren lockup that sits at the top-left of every signed-in page.
 *
 * The engraving is cropped from the full logo rather than being the whole
 * logo: the real mark stacks the bird above the wordmark, which is far too
 * tall for a nav bar. `priority` because it is above the fold on every page.
 */
export function WrenMark() {
  return (
    <Link
      href="/dashboard"
      aria-label="Wren — go to your dashboard"
      className="flex shrink-0 items-center gap-2 sm:gap-3"
    >
      <BrandRings className="h-8 w-auto sm:h-10" />
      <span className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        You do, <span className="italic text-[#d99a00]">I do</span>
      </span>
    </Link>
  );
}
