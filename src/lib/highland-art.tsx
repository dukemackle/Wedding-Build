import type { ReactNode } from "react";
import { seeded } from "./scene-shapes";

/**
 * Highland (suites wave 2, docs/suites-wave-2.md): a muted moorland in
 * painted layers, shared by the save-the-date card (art.tsx) and the guest
 * site's "Highland moor" scene (site-scene.tsx), so the two match.
 *
 * Colours come in as strings, so the card passes hex from its palette and the
 * site passes CSS colour-mixes of its own variables. Everything is drawn
 * from a fixed seed, so it renders the same on the server and the client.
 */

export type MoorColours = {
  /** The farthest ridge, almost sky. */
  far: string;
  /** The big dark hill on the left. */
  hill: string;
  /** The lighter slope behind it on the right. */
  slope: string;
  /** The ground the grass grows from. */
  near: string;
  /** Grass blades: light, mid, dark, and a rust accent. */
  grass: [string, string, string, string];
};

const f = (v: number) => Math.round(v * 10) / 10;

/** A soft ridge line across `w` at height `y`: a few sine waves, no corners. */
function ridge(w: number, h: number, y: number, amp: number, seed: number, rise = 0) {
  const r = seeded(seed);
  const waves = [0, 1, 2].map((i) => ({ len: w * (0.9 - i * 0.28) * (0.8 + r() * 0.4), ph: r() * 6.3, a: amp / (i + 1) }));
  const at = (x: number) => y - (rise * x) / w + waves.reduce((s, v) => s + v.a * Math.sin((x / v.len) * 6.283 + v.ph), 0);
  let d = `M-20 ${f(at(-20))}`;
  for (let x = 0; x <= w + 20; x += w / 60) d += `L${f(x)} ${f(at(x))}`;
  return { d: `${d}L${w + 20} ${f(h * 1.25)}L-20 ${f(h * 1.25)}Z`, at };
}

/** Painterly roughness: ragged edges, then streaks of shade like dry brush. */
function roughFilter(id: string, w: number) {
  return (
    <filter id={id} x="-3%" y="-10%" width="106%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.018" numOctaves="3" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={f(w * 0.014)} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.11" numOctaves="2" seed="9" result="m" />
      <feColorMatrix in="m" values="0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 -2.2 1.25" result="streak" />
      <feComposite in="streak" in2="d" operator="in" result="s" />
      <feComponentTransfer in="s" result="s2">
        <feFuncA type="linear" slope="0.32" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="d" />
        <feMergeNode in="s2" />
      </feMerge>
    </filter>
  );
}

/**
 * The moor in a `w` x `h` box: far ridge, two hills, near ground, and tall
 * grass in loose strokes across the front.
 */
export function Moorland({ w, h, colours, id }: { w: number; h: number; colours: MoorColours; id: string }): ReactNode {
  const far = ridge(w, h, h * 0.3, h * 0.05, 11);
  // The slope climbs to the right; the big hill falls away from the left
  // until it sinks under the near ground.
  const slope = ridge(w, h, h * 0.48, h * 0.04, 5, h * 0.18);
  const hill = ridge(w, h, h * 0.22, h * 0.05, 17, -h * 0.62);
  const near = ridge(w, h, h * 0.7, h * 0.035, 23);

  // Grass in clumps: each tuft fans its blades out from one root, small and
  // pale at the back, tall and darker at the front, a few rust stems among them.
  const r = seeded(31);
  const blades: ReactNode[] = [];
  // Stroke weight follows the height, so a wide, short site band gets fine grass.
  const unit = h / 560;
  const tufts = Math.round(w / 5.5);
  for (let t = 0; t < tufts; t++) {
    const depth = r() ** 0.8;
    const cx = r() * (w + 60) - 30;
    const top = near.at(cx) + h * 0.02;
    const root = top + depth * (h - top) * 0.95;
    const tall = h * (0.07 + depth * 0.32) * (0.7 + r() * 0.5);
    const n = 4 + Math.floor(r() * 7);
    for (let i = 0; i < n; i++) {
      const spread = (i / (n - 1 || 1) - 0.5) * 2;
      const len = tall * (0.55 + r() * 0.5) * (1 - Math.abs(spread) * 0.3);
      const lean = (spread * 0.45 + (r() - 0.5) * 0.35 + 0.08) * len;
      const x = cx + spread * 6 * unit;
      const tone = r() < 0.06 ? 3 : depth > 0.7 ? (r() < 0.5 ? 2 : 1) : depth > 0.35 ? (r() < 0.5 ? 1 : 0) : 0;
      const sw = (0.9 + depth * 2.4) * unit * 1.5;
      blades.push(
        <path
          key={`${t}-${i}`}
          d={`M${f(x)} ${f(root)}Q${f(x + lean * 0.15)} ${f(root - len * 0.55)} ${f(x + lean)} ${f(root - len)}`}
          style={{ stroke: colours.grass[tone] }}
          strokeWidth={f(sw)}
          opacity={f(0.5 + depth * 0.5)}
        />,
      );
    }
  }

  return (
    <g>
      <defs>
        {roughFilter(`${id}-rough`, w)}
        <filter id={`${id}-haze`}>
          <feGaussianBlur stdDeviation={f(w * 0.003)} />
        </filter>
      </defs>
      <path d={far.d} style={{ fill: colours.far }} filter={`url(#${id}-haze)`} />
      <g filter={`url(#${id}-rough)`}>
        <path d={slope.d} style={{ fill: colours.slope }} />
        <path d={hill.d} style={{ fill: colours.hill }} />
        <path d={near.d} style={{ fill: colours.near }} />
      </g>
      <g fill="none" strokeLinecap="round">
        {blades}
      </g>
    </g>
  );
}

/** A painted sky: warm at the top, cool lower down, with a faint mottle. */
export function MoorSky({ w, h, top, mid, bottom, id }: { w: number; h: number; top: string; mid: string; bottom: string; id: string }): ReactNode {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: top }} />
          <stop offset="0.45" style={{ stopColor: mid }} />
          <stop offset="1" style={{ stopColor: bottom }} />
        </linearGradient>
        <filter id={`${id}-mottle`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves="4" seed="3" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.4 0.75" />
        </filter>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-sky)`} />
      <rect width={w} height={h} filter={`url(#${id}-mottle)`} opacity="0.35" />
    </g>
  );
}
