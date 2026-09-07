"use client";

import { useEffect, useRef, useState } from "react";

const formatters: Record<"number" | "currency", (n: number) => string> = {
  number: (n) => String(n),
  currency: (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
};

// Counts up from 0 to `value` once the element scrolls into view. Renders
// the final value immediately (no animation) when the user prefers reduced
// motion, or before the observer has ever fired (first paint, no JS yet).
// `format` is a named preset rather than a function prop -- a Server
// Component parent can't hand a Client Component a function reference.
export function AnimatedCounter({
  value,
  format = "number",
  durationMs = 900,
  className,
}: {
  value: number;
  format?: "number" | "currency";
  durationMs?: number;
  className?: string;
}) {
  const formatFn = formatters[format];
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setHasAnimated(true);

        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min(1, (now - start) / durationMs);
          const eased = 1 - (1 - progress) ** 3;
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        setDisplay(0);
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {formatFn(display)}
    </span>
  );
}
