import Image from "next/image";
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
      className="flex shrink-0 items-center gap-2"
    >
      <Image
        src="/logo/wren-mark.png"
        alt=""
        width={176}
        height={96}
        priority
        className="h-6 w-auto sm:h-7"
      />
      <span className="font-display text-xl font-semibold tracking-[0.16em] text-forest sm:text-2xl">
        WREN
      </span>
    </Link>
  );
}
