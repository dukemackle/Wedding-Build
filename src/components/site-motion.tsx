"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useReplay, useSiteDesign } from "@/components/guest-site-theme";
import { MOTION_SPEED, NO_BACKGROUND, SEALS, backgroundLayers, resolveDesign, type FallingId } from "@/lib/site-design";

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

/** The envelope, what falls, and the RSVP burst: the motion that sits over the page. */
export function SiteMotion({ initials }: { initials: string }) {
  const { motion, envelope } = useSiteDesign();
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <>
      {/* Keyed so switching "wait for a tap" starts it afresh. */}
      {motion.opening === "envelope" && <Envelope key={String(envelope.tap)} initials={initials} />}
      {motion.falling !== "none" && <Falling kind={motion.falling} speed={MOTION_SPEED[motion.speed]} />}
      {motion.confetti && <Confetti kind={motion.falling} />}
    </>
  );
}

/** A wax blob: a circle with a slightly uneven, pressed-out edge. */
const SEAL_EDGE = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  const r = 30 + [1.8, -0.6, 1.2, -1.4, 0.8, 2, -0.9, 0.4][i % 8];
  return `${i ? "L" : "M"}${(32 + Math.cos(a) * r).toFixed(1)} ${(32 + Math.sin(a) * r).toFixed(1)}`;
}).join("") + "Z";

/**
 * The envelope opening: a lined envelope sealed in wax with the couple's
 * initials (Motion › When the page opens). It opens by itself, or waits for
 * a tap -- with a fallback so no guest is ever stuck behind it.
 */
function Envelope({ initials }: { initials: string }) {
  const { envelope } = useSiteDesign();
  const resolved = resolveDesign(useSiteDesign());
  // Removed once it has faded, so it never sits invisibly over the page.
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(!envelope.tap);
  // A tap-to-open envelope still opens by itself after a while, so no guest is stuck.
  useEffect(() => {
    if (!envelope.tap) return;
    const t = setTimeout(() => setOpen(true), 9000);
    return () => clearTimeout(t);
  }, [envelope.tap]);
  if (done) return null;
  const wax = SEALS.find((x) => x.id === envelope.seal)?.hex ?? resolved.accent;
  const liner = backgroundLayers({ ...NO_BACKGROUND, pattern: envelope.liner });
  const flap = "polygon(0 0, 100% 0, 50% 100%)";
  return (
    <div
      className="site-envelope fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-parchment"
      data-wait={open ? undefined : ""}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setDone(true);
      }}
      onClick={() => setOpen(true)}
      aria-hidden={open || undefined}
      role={open ? undefined : "button"}
      aria-label={open ? undefined : "Open the invitation"}
      tabIndex={open ? undefined : 0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
    >
      <div
        className="relative aspect-[1.55] w-[min(86vw,580px)] rounded-[3px] bg-card shadow-[0_18px_40px_rgb(0_0_0_/_0.16)]"
        style={{ perspective: 900 }}
      >
        {/* The back folds: two side flaps and the bottom, as faint creases. */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 155 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 100 L66 52 M155 100 L89 52" stroke="var(--color-ink)" strokeOpacity={0.12} strokeWidth={0.6} fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="site-envelope-flap absolute inset-x-0 top-0 h-[62%] origin-top [transform-style:preserve-3d]">
          {/* Outside: the card colour with an edge line. Inside: the liner. */}
          <div className="absolute inset-0 bg-card [backface-visibility:hidden]" style={{ clipPath: flap, backgroundImage: "linear-gradient(to bottom, transparent 40%, rgb(0 0 0 / 0.05))" }}>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0 L50 100 L100 0" stroke="var(--color-ink)" strokeOpacity={0.28} strokeWidth={1} fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]"
            style={{
              clipPath: flap,
              backgroundColor: "color-mix(in srgb, var(--site-accent) 14%, var(--color-card))",
              backgroundImage: liner.image,
              backgroundSize: liner.size,
            }}
          />
          <svg
            viewBox="0 0 64 64"
            className="site-envelope-seal absolute bottom-0 left-1/2 h-[42%] max-h-[124px] min-h-[68px] w-auto -translate-x-1/2 translate-y-1/2 drop-shadow-[0_3px_4px_rgb(0_0_0_/_0.25)] [backface-visibility:hidden]"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="seal-shine" cx="38%" cy="32%" r="70%">
                <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
                <stop offset="0.55" stopColor="#ffffff" stopOpacity={0} />
                <stop offset="1" stopColor="#000000" stopOpacity={0.25} />
              </radialGradient>
            </defs>
            <path d={SEAL_EDGE} fill={wax} />
            <path d={SEAL_EDGE} fill="url(#seal-shine)" />
            <circle cx="32" cy="32" r="21" fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={1.4} />
            <circle cx="32" cy="32.6" r="21" fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={0.8} />
            {/* Pressed into the wax: a shadow under, a highlight over. */}
            {[
              { dy: 0.7, fill: "#000", opacity: 0.35 },
              { dy: 0, fill: "#fff", opacity: 0.6 },
            ].map((t) => (
              <text
                key={t.fill}
                x="32"
                y={32.5 + t.dy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={t.fill}
                fillOpacity={t.opacity}
                style={{ fontFamily: "var(--font-monogram, var(--font-names, var(--font-display)))", fontSize: initials.length > 3 ? 13 : 17 }}
              >
                {initials}
              </text>
            ))}
          </svg>
        </div>
      </div>
      {!open && <p className="site-envelope-hint text-[13px] uppercase tracking-[0.24em] text-ink/60">Tap to open</p>}
    </div>
  );
}

export type Kind = Exclude<FallingId, "none">;

const MAPLE =
  "M12 2l1.5 4 2.5-1-.5 3.5 4-1-1.5 3.5 3 1-4.5 3 1 2.5-4.5-1-.5 5.5h-1l-.5-5.5-4.5 1 1-2.5-4.5-3 3-1-1.5-3.5 4 1L8 5l2.5 1z";
const LEAF = "M12 2C7 6 4 10 5 15c.6 3 3.5 5 7 5s6.4-2 7-5c1-5-2-9-7-13zM12 7v15";
const HEART =
  "M12 21s-7.5-4.6-9.6-9C.8 8.4 3 4.5 6.6 4.5c2.3 0 4 1.3 5.4 3.1 1.4-1.8 3.1-3.1 5.4-3.1 3.6 0 5.8 3.9 4.2 7.5-2.1 4.4-9.6 9-9.6 9z";
const SPARKLE = "M12 2l1.9 6.6L20.5 10l-6.6 1.9L12 18.5l-1.9-6.6L3.5 10l6.6-1.4z";
const BUTTERFLY =
  "M12 7.5c-1.2-3-4.6-5.4-7.6-4.6C2 3.6 2.6 7.8 4.6 10c-2 1.6-2.2 5.2.6 6.2 2.6.9 5.2-1.6 6.3-4.2h1c1.1 2.6 3.7 5.1 6.3 4.2 2.8-1 2.6-4.6.6-6.2 2-2.2 2.6-6.4.2-7.1-3-.8-6.4 1.6-7.6 4.6z";
/** Eight rounded petals around a centre. */
const MARIGOLD = Array.from({ length: 8 }, (_, k) => {
  const a = (k * Math.PI) / 4;
  const [x, y] = [12 + Math.cos(a) * 6.2, 12 + Math.sin(a) * 6.2];
  return `M${(x + 3.6).toFixed(2)} ${y.toFixed(2)}a3.6 3.6 0 1 0-7.2 0a3.6 3.6 0 1 0 7.2 0z`;
}).join("");
/** Marigolds, lanterns and sparklers glow warm whatever the palette. */
const WARM = "color-mix(in srgb, var(--site-accent) 35%, #FFD301)";

/** Confetti mixes the theme's accent with its ink and the brand gold. */
const CONFETTI_COLOURS = ["var(--site-accent)", "var(--color-ink)", "#FFD301"];

/** One falling thing, drawn in the accent colour. `i` varies shape and colour. */
export function Shape({ kind, i, size }: { kind: Kind; i: number; size: number }) {
  const svg = (d: string, stroke = false) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className="block" aria-hidden="true">
      <path
        d={d}
        fill={stroke ? "none" : "currentColor"}
        stroke={stroke ? "currentColor" : undefined}
        strokeWidth={stroke ? 1.6 : undefined}
      />
    </svg>
  );
  switch (kind) {
    case "petals":
      return (
        <span
          className="block bg-current"
          style={{ width: size, height: size * 1.4, borderRadius: `${size}px 0 ${size}px 0` }}
        />
      );
    case "hearts":
      return svg(HEART);
    case "confetti":
      return (
        <span
          className="block rounded-[1px]"
          style={{
            width: i % 3 === 0 ? size * 0.4 : size * 0.7,
            height: i % 3 === 0 ? size * 1.5 : size * 0.7,
            background: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
          }}
        />
      );
    case "rice":
      return <span className="block rounded-full bg-current" style={{ width: size * 0.35, height: size * 0.6 }} />;
    case "snow":
      return (
        <span
          className="block rounded-full"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            background: "color-mix(in srgb, var(--site-accent) 40%, white)",
            boxShadow: "0 0 6px color-mix(in srgb, var(--site-accent) 30%, white)",
          }}
        />
      );
    case "leaves":
      return i % 2 === 0 ? svg(MAPLE) : svg(LEAF);
    case "rings":
      return i % 3 === 0 ? (
        svg(SPARKLE)
      ) : (
        <svg width={size * 1.4} height={size} viewBox="0 0 34 24" className="block" aria-hidden="true">
          <circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="22" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M22 2.5l1.6 1.8-1.6 1.8-1.6-1.8z" fill="currentColor" />
        </svg>
      );
    case "bubbles":
      return (
        <span
          className="block rounded-full border border-current"
          style={{
            width: size * 1.4,
            height: size * 1.4,
            background:
              "radial-gradient(circle at 32% 30%, rgba(255,255,255,0.9) 0 12%, transparent 13%), color-mix(in srgb, var(--site-accent) 12%, transparent)",
          }}
        />
      );
    case "lanterns":
      return (
        <span
          className="block"
          style={{
            width: size * 0.8,
            height: size * 1.1,
            borderRadius: "38% 38% 28% 28%",
            background: `linear-gradient(${WARM}, color-mix(in srgb, var(--site-accent) 60%, #FFD301))`,
            boxShadow: `0 0 12px 3px color-mix(in srgb, ${WARM} 70%, transparent)`,
          }}
        />
      );
    case "marigolds":
      return (
        <span className="block" style={{ color: WARM }}>
          <svg width={size} height={size} viewBox="0 0 24 24" className="block" aria-hidden="true">
            <path d={MARIGOLD} fill="currentColor" />
            <circle cx="12" cy="12" r="3.2" fill="var(--site-accent)" />
          </svg>
        </span>
      );
    case "sparklers":
      return (
        <span className="block" style={{ color: WARM, filter: `drop-shadow(0 0 4px ${WARM})` }}>
          {svg(SPARKLE)}
        </span>
      );
    case "butterflies":
      return svg(BUTTERFLY);
    case "fireflies":
      return (
        <span
          className="block rounded-full"
          style={{
            width: size * 0.45,
            height: size * 0.45,
            background: "color-mix(in srgb, var(--site-accent) 55%, #FFD301)",
            boxShadow: "0 0 10px 3px color-mix(in srgb, var(--site-accent) 45%, #FFD301)",
          }}
        />
      );
  }
}

/**
 * How each kind moves. `drift` falls with a sway, `rise` floats up from the
 * bottom, `wander` hangs in place and blinks. Durations are seconds and
 * scale with the Speed setting.
 */
const KINDS: Record<
  Kind,
  { count: number; move: "drift" | "rise" | "wander"; size: [number, number]; duration: [number, number]; sway: number; spin: number; flutter?: boolean; opacity: number }
> = {
  petals: { count: 14, move: "drift", size: [8, 14], duration: [7, 11.5], sway: 40, spin: 300, opacity: 0.5 },
  hearts: { count: 12, move: "drift", size: [10, 16], duration: [8, 12], sway: 30, spin: 40, opacity: 0.5 },
  confetti: { count: 22, move: "drift", size: [8, 12], duration: [6, 9], sway: 50, spin: 0, flutter: true, opacity: 0.6 },
  rice: { count: 26, move: "drift", size: [8, 12], duration: [4, 6.5], sway: 12, spin: 200, opacity: 0.5 },
  snow: { count: 24, move: "drift", size: [6, 14], duration: [10, 16], sway: 30, spin: 0, opacity: 0.75 },
  leaves: { count: 12, move: "drift", size: [14, 22], duration: [9, 13], sway: 60, spin: 260, flutter: true, opacity: 0.55 },
  rings: { count: 10, move: "drift", size: [12, 18], duration: [9, 13], sway: 30, spin: 120, opacity: 0.55 },
  bubbles: { count: 12, move: "rise", size: [10, 22], duration: [9, 14], sway: 25, spin: 0, opacity: 0.6 },
  fireflies: { count: 16, move: "wander", size: [10, 14], duration: [5, 9], sway: 40, spin: 0, opacity: 0.9 },
  lanterns: { count: 10, move: "rise", size: [12, 20], duration: [12, 18], sway: 30, spin: 0, opacity: 0.75 },
  marigolds: { count: 14, move: "drift", size: [16, 24], duration: [8, 12], sway: 40, spin: 220, opacity: 0.6 },
  sparklers: { count: 18, move: "wander", size: [8, 14], duration: [3, 6], sway: 20, spin: 0, opacity: 0.9 },
  butterflies: { count: 9, move: "drift", size: [14, 20], duration: [11, 16], sway: 70, spin: 30, flutter: true, opacity: 0.55 },
};

/** Spread between two numbers by a fixed pattern, so server and client agree. */
const spread = ([lo, hi]: [number, number], i: number, step: number) => lo + (((i * step) % 10) / 10) * (hi - lo);

/**
 * Over the page, but kept faint and small so the words stay readable through
 * it. `contained` keeps it inside its parent instead of the screen, for the
 * landing page's demo.
 */
export function Falling({ kind, speed, contained = false }: { kind: Kind; speed: number; contained?: boolean }) {
  const k = KINDS[kind];
  return (
    <div
      className={`pointer-events-none inset-0 overflow-hidden text-[var(--site-accent)] ${contained ? "absolute" : "fixed z-40"}`}
      aria-hidden="true"
    >
      {Array.from({ length: k.count }, (_, i) => {
        const duration = spread(k.duration, i, 3) * speed;
        return (
          <span
            key={i}
            className={`site-fall site-fall-${k.move} absolute`}
            style={
              {
                left: `${3 + ((i * 7.3) % 94)}%`,
                top: k.move === "wander" ? `${8 + ((i * 13.7) % 84)}%` : undefined,
                animationDuration: `${duration}s`,
                animationDelay: `${-((i * 1.7) % duration)}s`,
                "--sway": `${(i % 2 ? 1 : -1) * k.sway}px`,
                "--spin": `${(i % 3 ? 1 : -1) * k.spin}deg`,
                "--o": k.opacity,
              } as React.CSSProperties
            }
          >
            <span
              className={k.flutter ? "site-flutter block" : "block"}
              style={k.flutter ? { animationDuration: `${(1.4 + (i % 4) * 0.4) * speed}s` } : undefined}
            >
              <Shape kind={kind} i={i} size={spread(k.size, i, 7)} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

type Burst = { id: number; pieces: { dx: number; dy: number; spin: number; left: number; size: number }[] };

/** Bursts in the falling shape where it reads as a toss; otherwise classic confetti. */
const BURST_KINDS: Kind[] = ["petals", "hearts", "confetti", "leaves", "rings", "marigolds"];

/**
 * A burst from the top of the screen when a guest RSVPs yes. Also fires on
 * the editor's "Try it", since the preview's RSVP form is switched off.
 */
function Confetti({ kind }: { kind: FallingId }) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const shape: Kind = kind !== "none" && BURST_KINDS.includes(kind) ? kind : "confetti";

  useEffect(() => {
    function fire() {
      const burst: Burst = {
        id: Date.now(),
        pieces: Array.from({ length: 60 }, () => ({
          dx: (Math.random() - 0.5) * 900,
          dy: 250 + Math.random() * 500,
          spin: (Math.random() - 0.5) * 900,
          left: 50 + (Math.random() - 0.5) * 20,
          size: 9 + Math.random() * 6,
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
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden text-[var(--site-accent)]" aria-hidden="true">
      {bursts.flatMap((b) =>
        b.pieces.map((p, i) => (
          <span
            key={`${b.id}-${i}`}
            className="site-confetti absolute top-[18%]"
            style={
              {
                left: `${p.left}%`,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--spin": `${p.spin}deg`,
              } as React.CSSProperties
            }
          >
            <Shape kind={shape} i={i} size={shape === "confetti" ? 10 : p.size} />
          </span>
        )),
      )}
    </div>
  );
}
