"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Scroll past this before hiding, so the bar never flinches near the top. */
const ARM_AT = 90;
/** Ignore scrolls smaller than this -- trackpads and thumbs jitter. */
const DEADZONE = 6;

/**
 * A sticky header that gets out of the way going down and comes back going up.
 *
 * The bar is worth having within reach on long pages -- Budget and Guests run
 * well past a screen -- but pinning it permanently spends vertical room on
 * every screen, and it is two rows tall.
 */
export function AutoHideHeader({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    lastY.current = window.scrollY;

    function read() {
      frame.current = null;
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (Math.abs(delta) < DEADZONE) return;
      lastY.current = y;

      // Near the top there is nothing to reclaim, and an overscroll bounce on
      // iOS reports a negative y that would otherwise read as "scrolling up".
      if (y < ARM_AT) {
        setHidden(false);
        return;
      }
      setHidden(delta > 0);
    }

    function onScroll() {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(read);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

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
      className={`sticky top-0 z-30 -mx-6 -mt-16 mb-8 self-stretch border-b border-hairline/50 bg-parchment/40 backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 motion-reduce:transition-none ${
        // Reduced motion keeps it pinned rather than teleporting it away.
        hidden ? "-translate-y-full motion-reduce:translate-y-0" : "translate-y-0"
      }`}
    >
      {children}
    </header>
  );
}
