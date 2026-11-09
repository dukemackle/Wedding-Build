import { BrandRings } from "@/components/brand-rings";
import Link from "next/link";

/**
 * The Wren lockup that sits at the top-left of every signed-in page.
 *
 * The engraving is cropped from the full logo rather than being the whole
 * logo: the real mark stacks the bird above the wordmark, which is far too
 * tall for a nav bar. `priority` because it is above the fold on every page.
 */
/** `compact`: a size smaller between lg and 2xl, where the signed-in bar
 *  fits the tabs beside it on one row. */
export function WrenMark({ href = "/dashboard", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      aria-label={href === "/dashboard" ? "You Do, I Do — go to your dashboard" : "You Do, I Do — home"}
      className="flex shrink-0 items-center gap-2 sm:gap-3"
    >
      <BrandRings className={`h-8 w-auto sm:h-10 ${compact ? "lg:max-2xl:h-8" : ""}`} />
      <span className={`font-display text-2xl font-semibold text-ink sm:text-3xl ${compact ? "lg:max-2xl:text-2xl" : ""}`}>
        You do, <span className="italic text-[#d99a00]">I do</span>
      </span>
    </Link>
  );
}
