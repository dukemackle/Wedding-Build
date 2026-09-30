"use client";

import type { ReactNode } from "react";
import { useHideOnScrollDown } from "@/lib/use-hide-on-scroll";

/**
 * A sticky header that gets out of the way going down and comes back going up.
 *
 * The bar is worth having within reach on long pages -- Budget and Guests run
 * well past a screen -- but pinning it permanently spends vertical room on
 * every screen, and it is two rows tall.
 */
export function AutoHideHeader({ children }: { children: ReactNode }) {
  const hidden = useHideOnScrollDown();

  return (
    <header
      // self-stretch, not w-auto: most pages centre their children with
      // `items-center`, and a flex item in a centred column shrinks to its own
      // content rather than filling the line. That is why the bar used to stop
      // short of the edges everywhere except Venues and Vendors, whose main
      // doesn't centre. Stretching makes it span the page, and -mx-6 carries it
      // out past main's padding to the viewport edge.
      //
      // Mostly see-through with a heavy blur, so the page's parchment and its
      // green/brass washes carry on up under the bar instead of stopping at a
      // white slab. The blur keeps the tabs legible over whatever scrolls by.
      className={`sticky top-0 z-30 -mx-6 -mt-16 mb-4 self-stretch border-b border-hairline/50 bg-parchment/40 backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 motion-reduce:transition-none ${
        // Reduced motion keeps it pinned rather than teleporting it away.
        hidden ? "-translate-y-full motion-reduce:translate-y-0" : "translate-y-0"
      }`}
    >
      {children}
    </header>
  );
}
