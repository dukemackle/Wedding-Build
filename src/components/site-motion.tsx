"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useReplay, useSiteDesign } from "@/components/guest-site-theme";
import { MOTION_SPEED } from "@/lib/site-design";

/** Fired by the RSVP form when a guest says yes; confetti listens for it. */
export const RSVP_YES_EVENT = "wren:rsvp-yes";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Guests who ask their device for less motion get the still version of everything. */
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/**
 * One section of the guest site, shown as it scrolls into view. How it
 * arrives (fade, slide, zoom, or not at all) is CSS keyed on the wrapper's
 * data-scroll, so this only has to say when.
 */
export function SiteReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="site-reveal" data-shown={shown ? "" : undefined}>
      {children}
    </div>
  );
}

/**
 * Remounts its children when the editor's "Replay motion" is pressed, so
 * every entrance plays again from the start. On the live site the count
 * never changes.
 */
export function Replayable({ children }: { children: ReactNode }) {
  const replay = useReplay();
  return <div key={replay} className="contents">{children}</div>;
}

/** The envelope, petals and confetti: the motion that sits over the page. */
export function SiteMotion({ initials }: { initials: string }) {
  const { motion } = useSiteDesign();
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <>
      {motion.opening === "envelope" && <Envelope initials={initials} />}
      {motion.petals && <Petals speed={MOTION_SPEED[motion.speed]} />}
      {motion.confetti && <Confetti />}
    </>
  );
}

function Envelope({ initials }: { initials: string }) {
  // Removed once it has faded, so it never sits invisibly over the page.
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <div
      className="site-envelope fixed inset-0 z-50 flex items-center justify-center bg-parchment"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setDone(true);
      }}
      aria-hidden="true"
    >
      <div
        className="relative h-[170px] w-[260px] border border-[var(--site-accent)] bg-card"
        style={{ perspective: 600 }}
      >
        <div className="site-envelope-flap absolute inset-x-0 top-0 h-[100px] origin-top">
          <svg width="260" height="100" viewBox="0 0 260 100" fill="none" className="h-full w-full">
            <path d="M0 0 L130 92 L260 0" stroke="var(--site-accent)" strokeWidth="1.2" />
            <circle cx="130" cy="88" r="11" fill="var(--site-accent)" />
          </svg>
        </div>
        <div className="absolute inset-x-0 bottom-6 text-center font-display text-[22px] text-ink">{initials}</div>
      </div>
    </div>
  );
}

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: 3 + ((i * 7.3) % 94),
  duration: 7 + (i % 4) * 1.5,
  delay: (i * 0.9) % 7,
  size: 8 + (i % 3) * 3,
}));

function Petals({ speed }: { speed: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="site-petal absolute top-0 bg-[var(--site-accent)]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            borderRadius: `${p.size}px 0 ${p.size}px 0`,
            animationDuration: `${p.duration * speed}s`,
            animationDelay: `${p.delay * speed}s`,
          }}
        />
      ))}
    </div>
  );
}

type Burst = { id: number; pieces: { dx: number; dy: number; spin: number; color: string; left: number }[] };

/**
 * A burst from the top of the screen when a guest RSVPs yes. Also fires on
 * the editor's "Try it", since the preview's RSVP form is switched off.
 */
function Confetti() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    function fire() {
      const colours = ["var(--site-accent)", "var(--color-ink)", "var(--color-card)", "#e9c97a"];
      const burst: Burst = {
        id: Date.now(),
        pieces: Array.from({ length: 70 }, (_, i) => ({
          dx: (Math.random() - 0.5) * 900,
          dy: 250 + Math.random() * 500,
          spin: (Math.random() - 0.5) * 900,
          color: colours[i % colours.length],
          left: 50 + (Math.random() - 0.5) * 20,
        })),
      };
      setBursts((b) => [...b, burst]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== burst.id)), 1800);
    }
    window.addEventListener(RSVP_YES_EVENT, fire);
    return () => window.removeEventListener(RSVP_YES_EVENT, fire);
  }, []);

  if (bursts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {bursts.flatMap((b) =>
        b.pieces.map((p, i) => (
          <span
            key={`${b.id}-${i}`}
            className="site-confetti absolute top-[18%] h-2.5 w-1.5 rounded-[1px]"
            style={
              {
                left: `${p.left}%`,
                background: p.color,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--spin": `${p.spin}deg`,
              } as React.CSSProperties
            }
          />
        )),
      )}
    </div>
  );
}
