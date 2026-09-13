"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const EXIT_MS = 300;
const ENTER_MS = 400;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// A route change can't just remount-and-fade-in (the old page vanishes
// the instant Next swaps content) if we also want it to fade *out*
// first. So this holds onto the outgoing page's already-rendered
// element tree in state, plays the exit transition against it, and
// only swaps to the new `children` once that's finished -- a small
// hand-rolled stand-in for what a library's presence/exit animation
// does, without pulling one in.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [shown, setShown] = useState(children);
  const [phase, setPhase] = useState<"idle" | "exiting" | "entering">("idle");
  const prevPathname = useRef(pathname);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (pathname === prevPathname.current) {
      // Same route re-rendering for another reason (e.g. a server
      // action revalidated it) -- just swap content, no transition.
      setShown(children);
      return;
    }
    prevPathname.current = pathname;

    if (reducedMotion.current) {
      setShown(children);
      return;
    }

    setPhase("exiting");
    const exitTimer = setTimeout(() => {
      setShown(children);
      setPhase("entering");
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("idle"));
      });
      return () => cancelAnimationFrame(raf1);
    }, EXIT_MS);

    return () => clearTimeout(exitTimer);
    // Only a real pathname change should replay the exit/enter sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isExiting = phase === "exiting";
  const isEntering = phase === "entering";
  const duration = isExiting ? EXIT_MS : ENTER_MS;

  return (
    <div
      className="flex flex-1 flex-col"
      style={{
        opacity: isExiting || isEntering ? 0 : 1,
        transform: isExiting
          ? "translateY(-10px)"
          : isEntering
            ? "translateY(10px)"
            : "translateY(0)",
        transition: isEntering ? "none" : `opacity ${duration}ms ${EASE}, transform ${duration}ms ${EASE}`,
      }}
    >
      {shown}
    </div>
  );
}
