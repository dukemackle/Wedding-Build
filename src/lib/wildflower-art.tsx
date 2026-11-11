import type { ReactNode } from "react";
import { contrast, mix } from "@/lib/site-design";

/**
 * Wildflower (suites wave 2, item 3; docs/suites-wave-2.md): five single
 * stems -- poppy, cornflower, cosmos, lavender and daisy -- drawn once, and
 * arrangements that lay them out (wreath, side arcs, corner, top garland,
 * scatter, an all-over pattern). Shared by the save-the-date card (art.tsx)
 * and the guest site's Wildflower scenes and section posies (site-scene.tsx,
 * section-layout.tsx), so the two match. Drawn for You Do, I Do; nothing
 * traced or copied.
 *
 * Two moods from the same shapes:
 * - "soft": faded colours with a fine ink outline, like an old seed packet;
 * - "bright": flat saturated colour, no outline, details in a darker shade.
 *
 * A stem stands on (0, 0) and grows up to about y = -290.
 */

export type Mood = "soft" | "bright";
export type StemKind = "poppy" | "cornflower" | "cosmos" | "lavender" | "daisy";
export type Arrangement = "wreath" | "arcs" | "corner" | "garland" | "scatter" | "pattern";

/** Guest-site palettes (site-design PALETTES) whose wildflowers are soft; every other page gets bright. */
export const SOFT_SITE_PALETTES = new Set(["wf-cornflower", "wf-butter", "wf-blush"]);

export const ARRANGEMENTS: { id: Arrangement; label: string }[] = [
  { id: "wreath", label: "Wreath" },
  { id: "arcs", label: "Side arcs" },
  { id: "corner", label: "Corners" },
  { id: "garland", label: "Top garland" },
  { id: "scatter", label: "Scatter" },
  { id: "pattern", label: "All-over" },
];

type Pair = [string, string];
/** The colours a mood paints with, each light then dark. */
export type Flora = {
  poppy: Pair;
  corn: Pair;
  cosmos: Pair;
  lav: Pair;
  daisy: Pair;
  eye: Pair;
  leaf: Pair;
  pod: string;
  /** Soft's outline; null for bright. */
  line: string | null;
  /** A hairline round white petals when they would vanish into the paper. */
  edge: string | null;
};

const BRIGHT = {
  poppy: ["#f0412a", "#b8211a"],
  corn: ["#2b5fdc", "#1a3a9e"],
  cosmos: ["#ff5c9e", "#d1307a"],
  lav: ["#9160dc", "#5f37a6"],
  daisy: ["#ffffff", "#ece6d8"],
  eye: ["#ffc61a", "#d98e00"],
  leaf: ["#3a9a4c", "#1f6b35"],
  pod: "#2a1d24",
} satisfies Omit<Flora, "line" | "edge">;

const SOFT = {
  poppy: ["#de8f78", "#b4654f"],
  corn: ["#8199c8", "#5c74a3"],
  cosmos: ["#e8b2bf", "#c48694"],
  lav: ["#ab9cc6", "#7d6d9d"],
  daisy: ["#fbf7ec", "#e6dcc8"],
  eye: ["#dcb35e", "#b08734"],
  leaf: ["#95a27c", "#6c7a59"],
  pod: "#5a4440",
} satisfies Omit<Flora, "line" | "edge">;

/** A mood's colours on this paper, with this ink. */
export function flora(mood: Mood, paper: string, ink: string): Flora {
  const base = mood === "bright" ? BRIGHT : SOFT;
  const toPaper = (p: Pair, t: number): Pair => [mix(p[0], paper, t), mix(p[1], paper, t)];
  const c: Flora = {
    ...(mood === "soft"
      ? {
          poppy: toPaper(base.poppy, 0.12),
          corn: toPaper(base.corn, 0.12),
          cosmos: toPaper(base.cosmos, 0.12),
          lav: toPaper(base.lav, 0.12),
          daisy: base.daisy,
          eye: toPaper(base.eye, 0.1),
          leaf: toPaper(base.leaf, 0.12),
          pod: base.pod,
        }
      : base),
    line: mood === "soft" ? mix(ink, paper, 0.42) : null,
    edge: null,
  };
  // Cornflowers on a blue card, leaves on a green one: lift them off the paper.
  if (contrast(c.corn[0], paper) < 2) c.corn = ["#5ab8ff", "#2f86d8"];
  if (contrast(c.leaf[0], paper) < 3) c.leaf = [mix(c.leaf[0], "#ffffff", 0.4), mix(c.leaf[0], "#ffffff", 0.15)];
  if (contrast(c.daisy[0], paper) < 1.3) c.edge = mix(paper, ink, 0.3);
  return c;
}

const f = (v: number) => Math.round(v * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A small seeded random, so every render draws the same arrangement. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A narrow leaf or blade pointing up from (0, 0). */
function blade(l: number, w: number, bend = 0) {
  const tx = bend * l;
  return `M0 0Q${f(w)} ${f(-l * 0.45)} ${f(tx)} ${f(-l)}Q${f(-w + tx * 0.2)} ${f(-l * 0.5)} 0 0Z`;
}

/** A deeply lobed leaf (poppy), pointing up from (0, 0). */
function lobed(l: number, w: number, n = 4) {
  let right = "";
  let left = "";
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 0.6) / n;
    const t2 = (i + 1) / n;
    const wi = w * (1 - 0.6 * t1);
    right += `Q${f(wi * 0.7)} ${f(-l * t0 - l * 0.04)} ${f(wi)} ${f(-l * t1)}Q${f(wi * 0.35)} ${f(-l * t1)} ${f(w * 0.14 * (1 - t2))} ${f(-l * t2 * 0.97)}`;
  }
  for (let i = n - 1; i >= 0; i--) {
    const t0 = i / n;
    const t1 = (i + 0.6) / n;
    const wi = w * (1 - 0.6 * t1);
    left += `Q${f(-wi * 0.35)} ${f(-l * t1)} ${f(-wi)} ${f(-l * t1)}Q${f(-wi * 0.7)} ${f(-l * t0 - l * 0.04)} ${f(-w * 0.14 * (1 - t0))} ${f(-l * t0)}`;
  }
  return `M0 0${right}L0 ${f(-l)}${left}Z`;
}

/** A poppy petal: a broad fan with a crumpled top, its base at (0, 0). */
function fan(r: number) {
  return (
    `M0 0C${f(-r * 0.35)} ${f(-r * 0.1)} ${f(-r * 0.86)} ${f(-r * 0.35)} ${f(-r * 0.8)} ${f(-r * 0.7)}` +
    `C${f(-r * 0.74)} ${f(-r * 1.0)} ${f(-r * 0.38)} ${f(-r * 1.04)} ${f(-r * 0.2)} ${f(-r * 0.92)}` +
    `C${f(-r * 0.06)} ${f(-r * 1.05)} ${f(r * 0.12)} ${f(-r * 1.02)} ${f(r * 0.26)} ${f(-r * 0.94)}` +
    `C${f(r * 0.46)} ${f(-r * 1.06)} ${f(r * 0.8)} ${f(-r * 0.96)} ${f(r * 0.82)} ${f(-r * 0.66)}` +
    `C${f(r * 0.86)} ${f(-r * 0.36)} ${f(r * 0.36)} ${f(-r * 0.1)} 0 0Z`
  );
}

/** A cosmos petal: a wedge with a three-toothed tip. */
const COSMOS_PETAL = "M0 0C-9 -8 -15 -26 -12.5 -40L-7.5 -36.5L-3.5 -41.5L0.5 -37L4.5 -41.5L8 -36.5L12.5 -40C15 -26 9 -8 0 0Z";
/** A cornflower floret: a funnel with a toothed mouth. */
const FLORET = "M-2 0L-7 -25L-11 -29L-6.5 -28.5L-5.5 -34L-2.5 -29.5L0 -35.5L2.5 -29.5L5.5 -34L6.5 -28.5L11 -29L7 -25L2 0Z";
/** A daisy petal. */
const RAY = "M0 0C-5 -6 -6.5 -27 0 -36C6.5 -27 5 -6 0 0Z";

type C = { c: Flora };

/** Stroke props for a filled shape: soft's outline, or none. */
const ol = (c: Flora, w = 1.3) => (c.line ? { stroke: c.line, strokeWidth: w, strokeLinejoin: "round" as const } : {});

function stalk(d: string, c: Flora, w: number) {
  return <path d={d} fill="none" stroke={c.leaf[1]} strokeWidth={w} strokeLinecap="round" />;
}

/* ---------- Heads, centred on (0, 0), the stem joining from below. ---------- */

function PoppyHead({ c }: C) {
  const back = mix(c.poppy[0], c.poppy[1], 0.45);
  return (
    <g>
      <path d={fan(60)} transform="translate(-4 22) rotate(-46)" fill={back} {...ol(c)} />
      <path d={fan(60)} transform="translate(4 22) rotate(46)" fill={back} {...ol(c)} />
      <path d={fan(62)} transform="translate(0 20)" fill={c.poppy[0]} {...ol(c)} />
      <path d="M0 20Q-6 -2 -20 -26M0 20Q2 -6 4 -34M0 20Q8 -2 22 -24" fill="none" stroke={c.poppy[1]} strokeWidth={1.4} opacity={0.55} />
      <ellipse cx={0} cy={-6} rx={14} ry={9} fill={c.pod} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={f(Math.cos(a) * 19)} cy={f(-6 + Math.sin(a) * 12)} r={2.3} fill={c.pod} />;
      })}
      <path d={fan(54)} transform="translate(0 32) scale(1.18 0.6)" fill={c.poppy[0]} {...ol(c, 2)} />
      <path d="M0 31Q-10 22 -24 14M0 31Q1 22 3 12M0 31Q11 22 26 15" fill="none" stroke={c.poppy[1]} strokeWidth={1.4} opacity={0.6} />
    </g>
  );
}

function CornflowerHead({ c }: C) {
  const outer = [-78, -58, -38, -18, 2, 22, 42, 62, 80];
  return (
    <g>
      {outer.map((a, i) => (
        <path key={a} d={FLORET} transform={`translate(0 -6) rotate(${a}) scale(${i % 2 ? 0.92 : 1.05})`} fill={i % 2 ? mix(c.corn[0], c.corn[1], 0.35) : c.corn[0]} {...ol(c, 1)} />
      ))}
      {[-24, 0, 24].map((a) => (
        <path key={a} d={FLORET} transform={`translate(0 -4) rotate(${a}) scale(0.62)`} fill={c.corn[1]} {...ol(c, 1)} />
      ))}
      <path d="M-13 30C-16 14 -11 0 0 -4C11 0 16 14 13 30Q0 36 -13 30Z" fill={mix(c.leaf[0], c.leaf[1], 0.5)} {...ol(c, 1.1)} />
      <path d="M-9 10q4 3 8 0q4 3 8 0M-11 19q5 3 11 0q5 3 11 0M-8 27q4 3 8 0q4 3 8 0" fill="none" stroke={mix(c.leaf[0], "#ffffff", 0.35)} strokeWidth={1.2} />
    </g>
  );
}

function CosmosHead({ c }: C) {
  return (
    <g transform="scale(1 0.84)">
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45 + 10})`}>
          <path d={COSMOS_PETAL} fill={c.cosmos[0]} {...ol(c, 1.1)} />
          <path d="M0 -4L0 -30M-3 -6Q-6 -18 -6 -28M3 -6Q6 -18 6 -28" fill="none" stroke={c.cosmos[1]} strokeWidth={1} opacity={0.6} />
        </g>
      ))}
      <circle r={10} fill={c.eye[0]} {...ol(c, 1)} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return <circle key={i} cx={f(Math.cos(a) * 6)} cy={f(Math.sin(a) * 6)} r={1.6} fill={c.eye[1]} />;
      })}
    </g>
  );
}

function DaisyHead({ c }: C) {
  const edge = c.line ?? c.edge;
  const rays = (n: number, s: number, rot: number, fill: string) =>
    Array.from({ length: n }, (_, i) => (
      <path key={i} d={RAY} transform={`rotate(${f((i * 360) / n + rot)}) scale(${s})`} fill={fill} {...(edge ? { stroke: edge, strokeWidth: 1 } : {})} />
    ));
  return (
    <g transform="scale(1 0.86)">
      {rays(11, 0.82, 16, c.daisy[1])}
      {rays(18, 1, 0, c.daisy[0])}
      <circle r={10} fill={c.eye[0]} {...ol(c, 1)} />
      <circle cx={-3} cy={-3} r={4.5} fill={mix(c.eye[0], "#ffffff", 0.45)} />
      <path d="M3 6a2 2 0 1 0 0.1 0M7 1a1.6 1.6 0 1 0 0.1 0M-2 8a1.6 1.6 0 1 0 0.1 0" fill={c.eye[1]} />
    </g>
  );
}

/** A lavender spike, its base at (0, 0), `n` whorls up to about -150. */
function LavenderSpike({ c, n = 11 }: C & { n?: number }) {
  const out: ReactNode[] = [];
  for (let j = 0; j < n; j++) {
    const y = -j * 12.5;
    const s = 1 - j * 0.045;
    const fill = j % 2 ? c.lav[1] : c.lav[0];
    const dx = Math.sin(j * 0.9) * 1.5;
    out.push(
      <g key={j} transform={`translate(${f(dx)} ${f(y)}) scale(${f(s)})`}>
        <ellipse cx={-5} cy={-2} rx={4.4} ry={7} transform="rotate(-28 -5 -2)" fill={fill} {...ol(c, 0.9)} />
        <ellipse cx={5} cy={-2} rx={4.4} ry={7} transform="rotate(28 5 -2)" fill={fill} {...ol(c, 0.9)} />
        <ellipse cx={0} cy={-6} rx={3.8} ry={6} fill={j % 2 ? c.lav[0] : c.lav[1]} {...ol(c, 0.9)} />
      </g>,
    );
  }
  return <g>{out}</g>;
}

/* ---------- Whole stems, standing on (0, 0). ---------- */

function Poppy({ c }: C) {
  return (
    <g>
      <path d={lobed(110, 26)} transform="translate(-2 -6) rotate(-34)" fill={c.leaf[0]} {...ol(c, 1.1)} />
      <path d={lobed(80, 20)} transform="translate(2 -34) rotate(38)" fill={mix(c.leaf[0], c.leaf[1], 0.35)} {...ol(c, 1.1)} />
      {stalk("M2 -140Q40 -196 54 -168", c, 2.4)}
      <ellipse cx={54} cy={-158} rx={8} ry={12.5} transform="rotate(18 54 -158)" fill={c.leaf[0]} {...ol(c, 1)} />
      <path d="M50 -168q4 6 2 14M57 -167q2 6 -1 13" fill="none" stroke={c.leaf[1]} strokeWidth={1} />
      {stalk("M0 0Q-20 -150 6 -262", c, 3.6)}
      <g transform="translate(6 -284) rotate(6)">
        <PoppyHead c={c} />
      </g>
    </g>
  );
}

function Cornflower({ c }: C) {
  return (
    <g>
      <path d={blade(96, 5.5, 0.12)} transform="translate(2 -30) rotate(-26)" fill={c.leaf[0]} {...ol(c, 1)} />
      <path d={blade(86, 5, -0.1)} transform="translate(4 -90) rotate(30)" fill={c.leaf[0]} {...ol(c, 1)} />
      <path d={blade(70, 4.5, 0.1)} transform="translate(6 -150) rotate(-22)" fill={mix(c.leaf[0], c.leaf[1], 0.3)} {...ol(c, 1)} />
      {stalk("M0 0Q12 -140 -4 -250", c, 3)}
      {stalk("M4 -170Q30 -196 38 -224", c, 2)}
      <g transform="translate(38 -232) rotate(18) scale(0.55)">
        <CornflowerHead c={c} />
      </g>
      <g transform="translate(-4 -276) rotate(-4)">
        <CornflowerHead c={c} />
      </g>
    </g>
  );
}

/** A thread-leaved cosmos leaf, as lines along a curved midrib. */
function threadLeaf(l: number) {
  let d = `M0 0Q${f(l * 0.3)} ${f(-l * 0.4)} ${f(l * 0.2)} ${f(-l)}`;
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    const x = l * 0.3 * 2 * t * (1 - t) + l * 0.2 * t * t;
    const y = -l * 0.4 * 2 * t * (1 - t) - l * t * t;
    const s = l * 0.22 * (1 - t * 0.5);
    d += `M${f(x)} ${f(y)}q${f(s * 0.7)} ${f(-s * 0.3)} ${f(s)} ${f(-s * 0.9)}M${f(x)} ${f(y)}q${f(-s * 0.7)} ${f(-s * 0.2)} ${f(-s * 0.9)} ${f(-s * 0.9)}`;
  }
  return d;
}

function Cosmos({ c }: C) {
  return (
    <g>
      <path d={threadLeaf(70)} transform="translate(0 -40) rotate(-40)" fill="none" stroke={c.leaf[0]} strokeWidth={1.8} strokeLinecap="round" />
      <path d={threadLeaf(60)} transform="translate(-6 -120) rotate(44)" fill="none" stroke={c.leaf[0]} strokeWidth={1.8} strokeLinecap="round" />
      {stalk("M0 0Q-16 -150 -2 -262", c, 2.4)}
      {stalk("M-9 -150Q-36 -180 -44 -206", c, 1.8)}
      <ellipse cx={-45} cy={-214} rx={6} ry={8.5} fill={c.cosmos[1]} {...ol(c, 1)} />
      <g transform="translate(-2 -270) rotate(-8)">
        <CosmosHead c={c} />
      </g>
    </g>
  );
}

function Lavender({ c }: C) {
  return (
    <g>
      <path d={blade(70, 3.5, 0.1)} transform="translate(0 -6) rotate(-18)" fill={mix(c.leaf[0], c.lav[0], 0.25)} {...ol(c, 0.9)} />
      <path d={blade(60, 3.5, -0.1)} transform="translate(0 -6) rotate(20)" fill={mix(c.leaf[0], c.lav[0], 0.25)} {...ol(c, 0.9)} />
      {stalk("M0 0Q8 -100 -2 -150", c, 2.4)}
      {stalk("M2 -60Q22 -110 26 -150", c, 1.8)}
      <g transform="translate(26 -152) rotate(10) scale(0.7)">
        <LavenderSpike c={c} n={9} />
      </g>
      <g transform="translate(-2 -152) rotate(-3)">
        <LavenderSpike c={c} />
      </g>
    </g>
  );
}

function Daisy({ c }: C) {
  return (
    <g>
      <path d={blade(54, 13, 0.15)} transform="translate(0 -4) rotate(-40)" fill={c.leaf[0]} {...ol(c, 1)} />
      <path d={blade(46, 11, -0.15)} transform="translate(0 -4) rotate(36)" fill={mix(c.leaf[0], c.leaf[1], 0.3)} {...ol(c, 1)} />
      {stalk("M0 0Q14 -130 4 -240", c, 2.6)}
      {stalk("M6 -110Q-24 -150 -34 -176", c, 2)}
      <g transform="translate(-36 -182) rotate(-22) scale(0.6)">
        <DaisyHead c={c} />
      </g>
      <g transform="translate(4 -246) rotate(4)">
        <DaisyHead c={c} />
      </g>
    </g>
  );
}

/** A wisp of grass for filling between stems. */
function Grass({ c }: C) {
  return (
    <g fill="none" stroke={mix(c.leaf[0], c.leaf[1], 0.2)} strokeWidth={1.8} strokeLinecap="round">
      <path d="M0 0Q-6 -60 -22 -120M0 0Q4 -70 12 -140M0 0Q10 -40 34 -86" />
    </g>
  );
}

const STEMS: Record<StemKind, (p: C) => ReactNode> = { poppy: Poppy, cornflower: Cornflower, cosmos: Cosmos, lavender: Lavender, daisy: Daisy };
const HEADS: Record<StemKind, (p: C) => ReactNode> = {
  poppy: PoppyHead,
  cornflower: CornflowerHead,
  cosmos: CosmosHead,
  lavender: ({ c }) => (
    <g transform="translate(0 70)">
      <LavenderSpike c={c} n={10} />
    </g>
  ),
  daisy: DaisyHead,
};

export const STEM_KINDS: StemKind[] = ["poppy", "cornflower", "cosmos", "lavender", "daisy"];

/** One stem, standing on (0, 0). */
export function WildStem({ kind, c }: { kind: StemKind; c: Flora }) {
  const S = STEMS[kind];
  return <S c={c} />;
}

/* ---------- Arrangements. ---------- */

type Place = { kind: StemKind | "grass"; x: number; y: number; rot: number; s: number; flip?: boolean; head?: boolean };

/** Rotation that turns "up" (0, -1) to point along (dx, dy). */
const along = (dx: number, dy: number) => (Math.atan2(dx, -dy) * 180) / Math.PI;

// Poppy and daisy lead (the boldest heads), lavender and cornflower between.
const ORDER: StemKind[] = ["poppy", "lavender", "daisy", "cornflower", "cosmos", "poppy", "daisy", "lavender", "cosmos", "cornflower"];

/** A box to arrange in, and the middle to keep clear for the words. */
export type Box = { w: number; h: number; clear?: { x: number; y: number; w: number; h: number } };

function wreath({ w, h }: Box, seed: number): Place[] {
  const rnd = seeded(seed);
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - Math.min(w, h) * 0.14;
  const ry = h / 2 - Math.min(w, h) * 0.14;
  const n = Math.max(16, Math.round((Math.PI * (rx + ry)) / 92));
  const out: Place[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 + rnd() * 0.08;
    const out_ = i % 2 ? 26 : -18;
    const x = cx + (rx + out_) * Math.cos(t);
    const y = cy + (ry + out_) * Math.sin(t);
    const rot = along(-rx * Math.sin(t), ry * Math.cos(t)) + (rnd() - 0.5) * 22;
    if (i % 2 === 1) out.push({ kind: "grass", x, y, rot: rot + 20, s: 1 });
    out.push({ kind: ORDER[i % ORDER.length], x, y, rot, s: 0.74 + rnd() * 0.16, flip: i % 2 === 1 });
  }
  return out;
}

/** Stems along a curve from `a` to `b` (bulging through `ctrl`), each pointing towards `b`. */
function sweep(a: [number, number], ctrl: [number, number], b: [number, number], n: number, s: [number, number], rnd: () => number, start = 0): Place[] {
  const out: Place[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const u = 1 - t;
    const x = u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0];
    const y = u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1];
    const dx = 2 * u * (ctrl[0] - a[0]) + 2 * t * (b[0] - ctrl[0]);
    const dy = 2 * u * (ctrl[1] - a[1]) + 2 * t * (b[1] - ctrl[1]);
    const rot = along(dx, dy) + (rnd() - 0.5) * 26;
    if (i % 2 === 0) out.push({ kind: "grass", x, y, rot: rot - 25, s: 1.1 });
    out.push({ kind: ORDER[(i + start) % ORDER.length], x, y, rot, s: s[0] + (s[1] - s[0]) * (1 - t) * rnd() + (s[1] - s[0]) * 0.3, flip: (i + start) % 2 === 1 });
  }
  return out;
}

const mirror = (p: Place[], w: number): Place[] => p.map((q) => ({ ...q, x: w - q.x, rot: -q.rot, flip: !q.flip }));

function arcs({ w, h }: Box, seed: number): Place[] {
  const rnd = seeded(seed);
  const m = Math.min(w, h);
  const n = Math.max(7, Math.round(h / 95));
  const left = sweep([m * 0.1, h * 0.97], [-m * 0.06, h * 0.5], [m * 0.11, h * 0.14], n, [0.9, 1.2], rnd);
  return [...left, ...mirror(sweep([m * 0.1, h * 0.97], [-m * 0.06, h * 0.5], [m * 0.11, h * 0.14], n, [0.9, 1.2], rnd, 3), w)];
}

function cornerFan(x: number, y: number, from: number, to: number, n: number, s: [number, number], rnd: () => number, start: number): Place[] {
  const out: Place[] = [];
  for (let i = 0; i < n; i++) {
    const a = from + ((to - from) * (i + 0.5)) / n;
    const mid = 1 - Math.abs(i - (n - 1) / 2) / n;
    const dx = Math.cos(rad(a));
    const dy = Math.sin(rad(a));
    out.push({ kind: "grass", x: x + dx * 10, y: y + dy * 10, rot: along(dx, dy) + 12, s: 0.9 });
    out.push({ kind: ORDER[(i + start) % ORDER.length], x, y, rot: along(dx, dy) + (rnd() - 0.5) * 8, s: s[0] + (s[1] - s[0]) * mid, flip: i % 2 === 1 });
  }
  return out;
}

function corner({ w, h }: Box, seed: number): Place[] {
  const rnd = seeded(seed);
  const m = Math.min(w, h);
  const k = m / 1000;
  return [
    ...cornerFan(-m * 0.03, -m * 0.03, 4, 86, 11, [1.25 * k, 1.85 * k], rnd, 0),
    ...cornerFan(-m * 0.02, -m * 0.02, 20, 70, 5, [0.9 * k, 1.1 * k], rnd, 3),
    ...cornerFan(w + m * 0.03, h + m * 0.03, 186, 264, 8, [0.95 * k, 1.35 * k], rnd, 2),
  ];
}

function garland({ w, h }: Box, seed: number): Place[] {
  const rnd = seeded(seed);
  const dip = Math.min(h * 0.16, w * 0.22);
  const n = Math.max(5, Math.round(w / 95));
  const half = sweep([-w * 0.02, dip * 0.15], [w * 0.22, dip * 1.25], [w * 0.47, dip], n, [0.72, 0.9], rnd);
  return [...half, ...mirror(sweep([-w * 0.02, dip * 0.15], [w * 0.22, dip * 1.25], [w * 0.47, dip], n, [0.72, 0.9], rnd, 2), w), { kind: "poppy", x: w / 2, y: dip + 30, rot: 0, s: 0.95, head: true }];
}

function scatter({ w, h, clear }: Box, seed: number): Place[] {
  const rnd = seeded(seed);
  const cell = 210;
  const out: Place[] = [];
  let i = 0;
  for (let y = cell * 0.4; y < h; y += cell * 0.86) {
    for (let x = (Math.round(y / cell) % 2) * cell * 0.5 + cell * 0.3; x < w; x += cell) {
      const px = x + (rnd() - 0.5) * cell * 0.5;
      const py = y + (rnd() - 0.5) * cell * 0.4;
      const pad = 60;
      if (clear && px > clear.x - pad && px < clear.x + clear.w + pad && py > clear.y - pad && py < clear.y + clear.h + pad) continue;
      out.push({ kind: ORDER[i++ % ORDER.length], x: px, y: py, rot: (rnd() - 0.5) * 70, s: 0.95 + rnd() * 0.3, head: true, flip: rnd() > 0.5 });
    }
  }
  return out;
}

/** The arrangement's placements in a box. */
export function arrange(kind: Arrangement, box: Box, seed = 7): Place[] {
  if (kind === "wreath") return wreath(box, seed);
  if (kind === "arcs") return arcs(box, seed);
  if (kind === "corner") return corner(box, seed);
  if (kind === "garland") return garland(box, seed);
  return scatter(box, seed);
}

function Placed({ p, c }: { p: Place; c: Flora }) {
  const t = `translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.rot)}) scale(${p.flip ? -f(p.s) : f(p.s)} ${f(p.s)})`;
  if (p.kind === "grass") return <g transform={t}><Grass c={c} /></g>;
  const H = HEADS[p.kind];
  return <g transform={t}>{p.head ? <H c={c} /> : <WildStem kind={p.kind} c={c} />}</g>;
}

/** An arrangement drawn into `box` (all but "pattern", which tiles: see WildPattern). */
export function Wildflowers({ arrangement, box, c, seed }: { arrangement: Exclude<Arrangement, "pattern">; box: Box; c: Flora; seed?: number }) {
  const places = arrange(arrangement, box, seed);
  return (
    <g>
      {places.map((p, i) => (
        <Placed key={i} p={p} c={c} />
      ))}
    </g>
  );
}

/** The all-over pattern's tile: 240 x 300, four short stems and a cosmos head. */
export const PATTERN_TILE = { w: 240, h: 300 };

export function PatternTile({ c }: { c: Flora }) {
  const items: Place[] = [
    { kind: "poppy", x: 56, y: 150, rot: -12, s: 0.5 },
    { kind: "lavender", x: 176, y: 140, rot: 14, s: 0.48, flip: true },
    { kind: "daisy", x: 184, y: 296, rot: -10, s: 0.48 },
    { kind: "cornflower", x: 60, y: 300, rot: 16, s: 0.46, flip: true },
    { kind: "cosmos", x: 122, y: 222, rot: -24, s: 0.62, head: true },
  ];
  return (
    <g>
      {items.map((p, i) => (
        <Placed key={i} p={p} c={c} />
      ))}
    </g>
  );
}

/**
 * The all-over pattern as an SVG <pattern>, for a <rect fill="url(#id)">:
 * the tile twice side by side, the second dropped half a tile, so it reads
 * as a print rather than a grid. `scale` sizes it.
 */
export function WildPattern({ id, c, scale = 1 }: { id: string; c: Flora; scale?: number }) {
  const { w, h } = PATTERN_TILE;
  // Each copy also drawn a tile higher, so stems running over the foot of one
  // carry on at the top of the next.
  const at: [number, number][] = [[0, 0], [0, -h], [w, h / 2], [w, -h / 2]];
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={w * 2 * scale} height={h * scale}>
      <g transform={`scale(${scale})`}>
        {at.map(([x, y]) => (
          <g key={`${x} ${y}`} transform={`translate(${x} ${y})${x ? " scale(-1 1) translate(" + -w + " 0)" : ""}`}>
            <PatternTile c={c} />
          </g>
        ))}
      </g>
    </pattern>
  );
}

/**
 * A small posy of three stems, for over a section of the site:
 * which three turns with `i`, so each section gets its own.
 */
export function WildPosy({ c, i = 0 }: { c: Flora; i?: number }) {
  const k = (n: number) => STEM_KINDS[(i + n) % STEM_KINDS.length];
  return (
    <g>
      <g transform="rotate(-48) scale(0.6)">
        <WildStem kind={k(1)} c={c} />
      </g>
      <g transform="rotate(48) scale(-0.6 0.6)">
        <WildStem kind={k(2)} c={c} />
      </g>
      <g transform="scale(0.66)">
        <WildStem kind={k(0)} c={c} />
      </g>
    </g>
  );
}
