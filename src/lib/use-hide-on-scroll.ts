"use client";

import { useEffect, useRef, useState } from "react";

/** Scroll past this before hiding, so nothing flinches near the top. */
const ARM_AT = 90;
/** Ignore scrolls smaller than this -- trackpads and thumbs jitter. */
const DEADZONE = 6;

/**
 * True while the page is being scrolled down (past the first screenful's
 * top), false once it scrolls back up. Chrome that sits over the page -- the
 * sticky nav, Wren's button -- uses it to get out of the way while reading.
 */
export function useHideOnScrollDown() {
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

  return hidden;
}
