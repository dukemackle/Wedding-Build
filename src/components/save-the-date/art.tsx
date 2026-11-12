import type { ReactNode } from "react";
import type { Palette } from "@/lib/save-the-date/types";
import { contrast, mix } from "@/lib/site-design";
import { MoorSky, Moorland } from "@/lib/highland-art";
import { GildedSpray } from "@/lib/gilded-art";

/**
 * Decorations a card template can place. Two kinds:
 *
 * - "vector": drawn here, in a local box `w` wide and `w * aspect` tall, in
 *   `currentColor`, so every colourway recolours it. Original to the app.
 * - "image": a public-domain botanical cut-out from /public/site-art (see
 *   docs/site-art-sources.md), kept in its own watercolours.
 */

/** Most drawings use currentColor; a few multi-colour ones read the palette. */
type VectorArt = { kind: "vector"; label: string; aspect: number; draw: (w: number, palette: Palette) => ReactNode };
type ImageArt = { kind: "image"; label: string; aspect: number; src: string };
export type ArtDef = VectorArt | ImageArt;

const img = (label: string, file: string, width: number): ImageArt => ({
  kind: "image",
  label,
  aspect: 900 / width,
  src: `/site-art/${file}.webp`,
});

/**
 * Batch A suites (2026-11-11): watercolours cut from the owner's approved
 * reference mockups, text removed and the paper keyed out, in
 * /public/site-art/batch-a. Interim art: screen resolution, not print
 * (docs/batch-a-suites.md lists the final assets still needed).
 */
const batchA = (label: string, file: string, w: number, h: number): ImageArt => ({
  kind: "image",
  label,
  aspect: h / w,
  src: `/site-art/batch-a/${file}.webp`,
});


/** A four-point sparkle centred on (x, y). */
function sparkle(x: number, y: number, r: number, key: string | number) {
  const k = r * 0.18;
  return (
    <path
      key={key}
      d={`M${x} ${y - r}C${x + k} ${y - k} ${x + k} ${y - k} ${x + r} ${y}C${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + r}C${x - k} ${y + k} ${x - k} ${y + k} ${x - r} ${y}C${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - r}Z`}
      fill="currentColor"
    />
  );
}

/** A scalloped edge around a w x h box, `r` per scallop. */
function scallopPath(w: number, h: number, r: number) {
  const across = Math.max(2, Math.round(w / (r * 2)));
  const down = Math.max(2, Math.round(h / (r * 2)));
  const sx = w / across / 2;
  const sy = h / down / 2;
  let d = `M0 0`;
  for (let i = 0; i < across; i++) d += `A${sx} ${sx} 0 0 1 ${(i + 1) * sx * 2} 0`;
  for (let i = 0; i < down; i++) d += `A${sy} ${sy} 0 0 1 ${w} ${(i + 1) * sy * 2}`;
  for (let i = across; i > 0; i--) d += `A${sx} ${sx} 0 0 1 ${(i - 1) * sx * 2} ${h}`;
  for (let i = down; i > 0; i--) d += `A${sy} ${sy} 0 0 1 0 ${(i - 1) * sy * 2}`;
  return d + "Z";
}

// Sparkles for the night sky, in a 760 x 560 box: kept to the edges so the
// type in the middle has clear sky.
const STARS: [number, number, number][] = [
  [70, 60, 22], [690, 90, 16], [150, 230, 9], [610, 250, 12], [40, 400, 13], [720, 380, 24],
  [250, 40, 7], [520, 30, 9], [380, 120, 6], [110, 520, 8], [660, 520, 10], [300, 300, 4],
  [470, 330, 5], [20, 180, 5], [740, 230, 6],
];
const DOTS: [number, number][] = [
  [200, 110], [560, 160], [90, 320], [690, 300], [330, 210], [430, 60], [20, 520], [740, 470],
  [610, 420], [160, 450], [480, 480], [270, 520],
];

/** A five-point star centred on (x, y). */
function star5(x: number, y: number, r: number, key?: string | number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.42 : r;
    return `${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a)).toFixed(2)}`;
  });
  return <polygon key={key} points={pts.join(" ")} fill="currentColor" />;
}

/** A five-point star in a given colour (for multi-colour drawings). */
function star5Path(x: number, y: number, r: number, fill: string) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.42 : r;
    return `${Math.round((x + rr * Math.cos(a)) * 100) / 100},${Math.round((y + rr * Math.sin(a)) * 100) / 100}`;
  });
  return <polygon points={pts.join(" ")} fill={fill} />;
}

/** One majolica tile, 100 x 100: a round-petalled flower, leaves, and quarter-discs that become circles where tiles meet. */
function tile(x: number, y: number, key: string, paper: string) {
  return (
    <g key={key} transform={`translate(${x} ${y})`}>
      <rect width={100} height={100} fill="currentColor" opacity={0.1} />
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a} 50 50)`}>
          <circle cx={50} cy={31} r={13} fill="currentColor" opacity={0.9} />
          <path d="M50 50C60 46 70 38 74 26C62 28 54 38 50 50Z" fill="currentColor" opacity={0.45} />
          <path d="M0 30A30 30 0 0 0 30 0H0Z" fill="currentColor" opacity={0.75} />
          <path d="M0 18A18 18 0 0 0 18 0" fill="none" stroke={paper} strokeWidth={2.5} />
        </g>
      ))}
      <circle cx={50} cy={50} r={10} fill={paper} />
      <circle cx={50} cy={50} r={5} fill="currentColor" />
      <rect width={100} height={100} fill="none" stroke={paper} strokeWidth={1.5} opacity={0.8} />
    </g>
  );
}

/** A hand-drawn wave line across `w`, wobbling a little so it doesn't look ruled. */
function wave(w: number, y: number, amp: number, len: number, phase: number) {
  let d = `M${-len} ${y}`;
  for (let x = -len + phase; x < w + len; x += len) {
    const wobble = Math.sin(x * 0.013) * amp * 0.25;
    d += `Q${x + len / 4} ${y - amp - wobble} ${x + len / 2} ${y}T${x + len} ${y}`;
  }
  return d;
}

export const ART: Record<string, ArtDef> = {
  panel: {
    kind: "vector",
    label: "Panel",
    aspect: 1060 / 780,
    draw: (w) => <rect width={w} height={(w * 1060) / 780} rx={22} fill="currentColor" />,
  },
  lineFrame: {
    kind: "vector",
    label: "Line frame",
    aspect: 1310 / 910,
    draw: (w) => <rect x={1} y={1} width={w - 2} height={(w * 1310) / 910 - 2} fill="none" stroke="currentColor" strokeWidth={2} />,
  },
  rule: {
    kind: "vector",
    label: "Rule",
    aspect: 0.02,
    draw: (w) => <line x1={0} x2={w} y1={w * 0.01} y2={w * 0.01} stroke="currentColor" strokeWidth={2} />,
  },
  diamondRule: {
    kind: "vector",
    label: "Diamond rule",
    aspect: 0.1,
    draw: (w) => {
      const c = w / 2;
      const y = w * 0.05;
      return (
        <g stroke="currentColor" fill="none" strokeWidth={1.6}>
          <line x1={0} x2={c - 16} y1={y} y2={y} />
          <line x1={c + 16} x2={w} y1={y} y2={y} />
          <path d={`M${c} ${y - 7}L${c + 7} ${y}L${c} ${y + 7}L${c - 7} ${y}Z`} fill="currentColor" />
        </g>
      );
    },
  },
  scallopFrame: {
    kind: "vector",
    label: "Scalloped frame",
    aspect: 1310 / 910,
    draw: (w) => {
      const h = w * (1310 / 910);
      return (
        <g fill="none" stroke="currentColor">
          <rect x={0} y={0} width={w} height={h} strokeWidth={1.4} />
          <path d={scallopPath(w - 36, h - 36, 13)} transform="translate(18 18)" strokeWidth={1.2} />
        </g>
      );
    },
  },
  archFrame: {
    kind: "vector",
    label: "Arch",
    aspect: 1240 / 840,
    draw: (w) => {
      const h = w * (1240 / 840);
      const r = w / 2;
      const arch = (inset: number) =>
        `M${inset} ${h - inset}L${inset} ${r}A${r - inset} ${r - inset} 0 0 1 ${w - inset} ${r}L${w - inset} ${h - inset}Z`;
      return (
        <g fill="none" stroke="currentColor">
          <path d={arch(0)} strokeWidth={2.4} />
          <path d={arch(16)} strokeWidth={1} />
        </g>
      );
    },
  },
  moon: {
    kind: "vector",
    label: "Crescent moon",
    aspect: 1,
    draw: (w) => {
      const r = w / 2;
      return (
        <path
          d={`M${r * 1.25} ${r * 0.08}A${r * 0.92} ${r * 0.92} 0 1 0 ${r * 1.25} ${r * 1.92}A${r * 0.74} ${r * 0.74} 0 1 1 ${r * 1.25} ${r * 0.08}Z`}
          fill="currentColor"
        />
      );
    },
  },
  starfield: {
    kind: "vector",
    label: "Stars",
    aspect: 560 / 760,
    draw: (w) => {
      const s = w / 760;
      return (
        <g transform={`scale(${s})`}>
          {STARS.map(([x, y, r], i) => sparkle(x, y, r, i))}
          {DOTS.map(([x, y], i) => (
            <circle key={`d${i}`} cx={x} cy={y} r={2.2} fill="currentColor" />
          ))}
        </g>
      );
    },
  },
  seaHorizon: {
    kind: "vector",
    label: "Moonlit sea",
    aspect: 240 / 760,
    draw: (w) => {
      const s = w / 760;
      // The glint: short strokes narrowing toward the viewer.
      const glint = [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const y = 128 + i * 15;
        const half = 54 - i * 6.5;
        return <line key={i} x1={380 - half} x2={380 + half} y1={y} y2={y} strokeWidth={2 - i * 0.18} />;
      });
      return (
        <g transform={`scale(${s})`} fill="none" stroke="currentColor" strokeLinecap="round">
          {/* Headland on the right, low hills on the left. */}
          <path d="M760 118C700 112 660 70 610 64C580 60 560 36 520 30C500 28 486 46 470 60C450 80 420 104 380 114" strokeWidth={1.8} />
          <path d="M0 116C40 104 80 92 120 96C160 100 190 84 230 88C270 92 300 108 330 114" strokeWidth={1.4} />
          <line x1={0} x2={760} y1={118} y2={118} strokeWidth={1.4} />
          {glint}
          <path d="M40 160C120 154 200 166 280 160M480 162C560 156 640 168 720 160M90 200C170 194 230 206 300 200M470 204C540 198 610 210 680 202" strokeWidth={1} opacity={0.7} />
        </g>
      );
    },
  },
  vline: {
    kind: "vector",
    label: "Vertical rule",
    aspect: 314,
    draw: (w) => <line x1={w / 2} x2={w / 2} y1={0} y2={w * 314} stroke="currentColor" strokeWidth={2} />,
  },
  square: {
    kind: "vector",
    label: "Square",
    aspect: 1,
    draw: (w) => <rect width={w} height={w} fill="currentColor" />,
  },
  sunDisc: {
    kind: "vector",
    label: "Setting sun",
    aspect: 1,
    draw: (w) => <circle cx={w / 2} cy={w / 2} r={w / 2} fill="currentColor" />,
  },
  sunRing: {
    kind: "vector",
    label: "Sun",
    aspect: 1,
    draw: (w) => (
      <g fill="none" stroke="currentColor">
        <circle cx={w / 2} cy={w / 2} r={w / 2 - 2} strokeWidth={2} />
        <circle cx={w / 2} cy={w / 2} r={w / 2 - 16} strokeWidth={1} opacity={0.6} />
      </g>
    ),
  },
  sunsetBands: {
    kind: "vector",
    label: "Retro sunset",
    aspect: 0.58,
    draw: (w, pal) => {
      const h = w * 0.58;
      const cx = w / 2;
      const half = (r: number, fill: string, key: string) => (
        <path key={key} d={`M${cx - r} ${h}A${r} ${r} 0 0 1 ${cx + r} ${h}Z`} fill={fill} />
      );
      const sun = h * 0.4;
      // Paper-coloured slats across the sun's lower half.
      const slats = [0.12, 0.3, 0.5, 0.72].map((t, i) => (
        <rect key={i} x={cx - sun} y={h - sun * (0.62 - t * 0.6)} width={sun * 2} height={6 + i * 4} fill={pal.paper} />
      ));
      return (
        <g>
          {half(h, pal.muted, "a")}
          {half(h * 0.84, pal.ink, "b")}
          {half(h * 0.68, pal.accent, "c")}
          {half(h * 0.54, pal.paper, "d")}
          {half(sun, pal.accent, "e")}
          {slats}
        </g>
      );
    },
  },
  tileBorder: {
    kind: "vector",
    label: "Tile border",
    aspect: 1.4,
    draw: (w, pal) => {
      const s = w / 1000;
      const tiles: ReactNode[] = [];
      for (let i = 0; i < 10; i++) {
        tiles.push(tile(i * 100, 0, `t${i}`, pal.paper), tile(i * 100, 1300, `b${i}`, pal.paper));
      }
      for (let j = 1; j < 13; j++) tiles.push(tile(0, j * 100, `l${j}`, pal.paper), tile(900, j * 100, `r${j}`, pal.paper));
      return (
        <g transform={`scale(${s})`}>
          {tiles}
          <rect x={112} y={112} width={776} height={1176} fill="none" stroke="currentColor" strokeWidth={2} />
          <rect x={120} y={120} width={760} height={1160} fill="none" stroke="currentColor" strokeWidth={0.8} />
        </g>
      );
    },
  },
  doubleRule: {
    kind: "vector",
    label: "Double rule",
    aspect: 0.03,
    draw: (w) => (
      <g stroke="currentColor">
        <line x1={0} x2={w} y1={2} y2={2} strokeWidth={4} />
        <line x1={0} x2={w} y1={w * 0.03 - 2} y2={w * 0.03 - 2} strokeWidth={1.4} />
      </g>
    ),
  },
  westernFrame: {
    kind: "vector",
    label: "Starred frame",
    aspect: 1320 / 920,
    draw: (w) => {
      const h = w * (1320 / 920);
      return (
        <g>
          <rect x={2} y={2} width={w - 4} height={h - 4} fill="none" stroke="currentColor" strokeWidth={4} />
          <rect x={18} y={18} width={w - 36} height={h - 36} fill="none" stroke="currentColor" strokeWidth={1.4} />
          {[
            [44, 44],
            [w - 44, 44],
            [44, h - 44],
            [w - 44, h - 44],
          ].map(([x, y], i) => star5(x, y, 13, i))}
          {star5(w / 2, 18, 9, "top")}
          {star5(w / 2, h - 18, 9, "bottom")}
        </g>
      );
    },
  },
  waves: {
    kind: "vector",
    label: "Waves",
    aspect: 0.44,
    draw: (w, pal) => {
      const lines: [number, number, number, number, string, number][] = [
        [60, 10, 180, 0, "currentColor", 2.4],
        [120, 14, 240, 70, pal.ink, 1.6],
        [190, 12, 200, 40, "currentColor", 2],
        [260, 18, 280, 120, pal.ink, 1.2],
        [330, 10, 220, 10, "currentColor", 1.6],
        [395, 14, 260, 90, pal.ink, 1],
      ];
      const first = wave(w, 60, 10, 180, 0);
      return (
        <g fill="none" strokeLinecap="round">
          {/* The sea itself, so a sun drawn behind it sinks into the water. */}
          <path d={`${first}V${w * 0.44 + 20}H-200Z`} fill={pal.paper} stroke="none" />
          <path d={`${wave(w, 250, 18, 280, 120)}V${w * 0.44 + 20}H-200Z`} fill="currentColor" opacity={0.07} stroke="none" />
          {lines.map(([y, amp, len, phase, color, sw], i) => (
            <path key={i} d={wave(w, y, amp, len, phase)} stroke={color} strokeWidth={sw} opacity={i % 2 ? 0.55 : 0.9} />
          ))}
        </g>
      );
    },
  },
  engravedFrame: {
    kind: "vector",
    label: "Engraved frame",
    aspect: 1300 / 900,
    draw: (w) => {
      const h = w * (1300 / 900);
      const i = 22;
      const r = 34;
      // Inner frame with notched (concave) corners.
      const notched = `M${i + r} ${i}H${w - i - r}A${r} ${r} 0 0 0 ${w - i} ${i + r}V${h - i - r}A${r} ${r} 0 0 0 ${w - i - r} ${h - i}H${i + r}A${r} ${r} 0 0 0 ${i} ${h - i - r}V${i + r}A${r} ${r} 0 0 0 ${i + r} ${i}Z`;
      const corners = [
        [i, i],
        [w - i, i],
        [i, h - i],
        [w - i, h - i],
      ];
      return (
        <g fill="none" stroke="currentColor">
          <rect x={1} y={1} width={w - 2} height={h - 2} strokeWidth={1.6} />
          <path d={notched} strokeWidth={0.9} />
          {corners.map(([x, y], k) => (
            <path key={k} d={`M${x} ${y - 7}L${x + 7} ${y}L${x} ${y + 7}L${x - 7} ${y}Z`} fill="currentColor" stroke="none" />
          ))}
        </g>
      );
    },
  },
  laurelCrest: {
    kind: "vector",
    label: "Laurel crest",
    aspect: 1,
    draw: (w) => {
      const c = w / 2;
      const r = w * 0.4;
      // Leaves along each lower arc, pointing up toward the top.
      const leaves: ReactNode[] = [];
      for (const side of [-1, 1]) {
        for (let k = 0; k < 9; k++) {
          const a = Math.PI / 2 + side * (0.25 + k * 0.17);
          // Rounded: server and browser trig can differ in the last digit.
          const x = Math.round((c + r * 1.12 * Math.cos(a)) * 100) / 100;
          const y = Math.round((c + r * 1.12 * Math.sin(a)) * 100) / 100;
          const turn = Math.round(((a * 180) / Math.PI + (side > 0 ? 90 : -90) + side * 25) * 100) / 100;
          leaves.push(<ellipse key={`${side}${k}`} cx={x} cy={y} rx={w * 0.018} ry={w * 0.05} transform={`rotate(${turn} ${x} ${y})`} fill="currentColor" />);
        }
      }
      return (
        <g>
          <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={1.4} />
          <circle cx={c} cy={c} r={r - 8} fill="none" stroke="currentColor" strokeWidth={0.7} />
          {leaves}
        </g>
      );
    },
  },
  ovalFrame: {
    kind: "vector",
    label: "Oval frame",
    aspect: 600 / 480,
    draw: (w) => {
      const h = w * (600 / 480);
      return (
        <g fill="none" stroke="currentColor">
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} strokeWidth={2} />
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 12} ry={h / 2 - 12} strokeWidth={0.8} />
        </g>
      );
    },
  },
  airmailBorder: {
    kind: "vector",
    label: "Airmail border",
    aspect: 1.4,
    draw: (w, pal) => {
      const s = w / 1000;
      const band = 30;
      // Diagonal stripes, red and blue by turns, clipped to a band round the edge.
      const stripes: ReactNode[] = [];
      for (let i = -1400; i < 1000 + 1400; i += 44) {
        stripes.push(<path key={i} d={`M${i} 0L${i + 22} 0L${i + 22 + 1400} 1400L${i + 1400} 1400Z`} fill={(i / 44) % 2 ? pal.ink : pal.accent} />);
      }
      const id = `airmail-${pal.id}`;
      return (
        <g transform={`scale(${s})`}>
          <clipPath id={id}>
            <path d={`M0 0H1000V1400H0Z M${band} ${band}V${1400 - band}H${1000 - band}V${band}Z`} clipRule="evenodd" />
          </clipPath>
          <g clipPath={`url(#${id})`}>{stripes}</g>
        </g>
      );
    },
  },
  /** Postmark: a narrower airmail edge in the accent and muted colours (red and blue by default), so the ink stays for the type. */
  airmailSoft: {
    kind: "vector",
    label: "Airmail border",
    aspect: 1.4,
    draw: (w, pal) => {
      const s = w / 1000;
      const band = 22;
      const stripes: ReactNode[] = [];
      for (let i = -1400; i < 1000 + 1400; i += 40) {
        stripes.push(<path key={i} d={`M${i} 0L${i + 20} 0L${i + 20 + 1400} 1400L${i + 1400} 1400Z`} fill={(i / 40) % 2 ? pal.muted : pal.accent} />);
      }
      const id = `airmail-soft-${pal.id}`;
      return (
        <g transform={`scale(${s})`}>
          <clipPath id={id}>
            <path d={`M0 0H1000V1400H0Z M${band} ${band}V${1400 - band}H${1000 - band}V${band}Z`} clipRule="evenodd" />
          </clipPath>
          <g clipPath={`url(#${id})`}>{stripes}</g>
        </g>
      );
    },
  },
  stamp: {
    kind: "vector",
    label: "Stamp",
    aspect: 1.2,
    draw: (w, pal) => {
      const h = w * 1.2;
      const r = w * 0.028;
      const holes: ReactNode[] = [];
      for (let x = r * 2; x < w; x += r * 3) holes.push(<circle key={`t${x}`} cx={x} cy={0} r={r} />, <circle key={`b${x}`} cx={x} cy={h} r={r} />);
      for (let y = r * 2; y < h; y += r * 3) holes.push(<circle key={`l${y}`} cx={0} cy={y} r={r} />, <circle key={`r${y}`} cx={w} cy={y} r={r} />);
      const m = w * 0.1;
      const iw = w - m * 2;
      const ih = h - m * 2.6;
      return (
        <g>
          <mask id={`perf-${pal.id}`}>
            <rect width={w} height={h} fill="#fff" />
            <g fill="#000">{holes}</g>
          </mask>
          <g mask={`url(#perf-${pal.id})`}>
            <rect width={w} height={h} fill="#fffdf8" />
            <rect x={m} y={m} width={iw} height={ih} fill={pal.accent} opacity={0.18} />
            {/* A little coast at sunset: sun, sea, a headland. */}
            <circle cx={m + iw * 0.62} cy={m + ih * 0.5} r={iw * 0.17} fill={pal.accent} />
            <path d={`M${m} ${m + ih * 0.62}H${m + iw}V${m + ih}H${m}Z`} fill={pal.ink} opacity={0.85} />
            <path d={`M${m} ${m + ih * 0.64}C${m + iw * 0.2} ${m + ih * 0.4} ${m + iw * 0.32} ${m + ih * 0.42} ${m + iw * 0.46} ${m + ih * 0.64}Z`} fill={pal.ink} />
            {[0.72, 0.8, 0.88].map((t) => (
              <line key={t} x1={m + iw * 0.5} x2={m + iw * 0.76} y1={m + ih * t} y2={m + ih * t} stroke="#fffdf8" strokeWidth={2} opacity={0.6} />
            ))}
            <rect x={m} y={m} width={iw} height={ih} fill="none" stroke={pal.ink} strokeWidth={1.5} />
            <text x={w / 2} y={h - m * 0.75} textAnchor="middle" fontSize={w * 0.09} fill={pal.ink} fontFamily="Georgia, serif" letterSpacing={2}>
              LOVE
            </text>
          </g>
        </g>
      );
    },
  },
  postmark: {
    kind: "vector",
    label: "Postmark",
    aspect: 0.5,
    draw: (w) => {
      const r = w * 0.22;
      const cx = r + 4;
      const cy = w * 0.25;
      return (
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <circle cx={cx} cy={cy} r={r} strokeWidth={2.4} />
          <circle cx={cx} cy={cy} r={r * 0.68} strokeWidth={1.2} />
          {/* Cancellation waves running off to the right. */}
          {[-0.36, -0.12, 0.12, 0.36].map((t, i) => {
            const y = cy + t * r * 2;
            let d = `M${cx + r + 10} ${y}`;
            for (let x = cx + r + 10; x < w; x += 40) d += `q10 -6 20 0t20 0`;
            return <path key={i} d={d} strokeWidth={2.2} />;
          })}
        </g>
      );
    },
  },
  addressLines: {
    kind: "vector",
    label: "Address lines",
    aspect: 0.33,
    draw: (w) => (
      <g stroke="currentColor" strokeWidth={1.2}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={0} x2={w} y1={20 + i * 110} y2={20 + i * 110} />
        ))}
      </g>
    ),
  },
  decoFrame: {
    kind: "vector",
    label: "Deco frame",
    aspect: 1.4,
    draw: (w) => {
      const s = w / 1000;
      const cx = 500;
      const fanY = 400;
      const rays: ReactNode[] = [];
      for (let a = 0; a <= 180; a += 7.5) {
        const t = (a * Math.PI) / 180;
        const x1 = Math.round((cx - 120 * Math.cos(t)) * 100) / 100;
        const y1 = Math.round((fanY - 120 * Math.sin(t)) * 100) / 100;
        const x2 = Math.round((cx - 230 * Math.cos(t)) * 100) / 100;
        const y2 = Math.round((fanY - 230 * Math.sin(t)) * 100) / 100;
        rays.push(<line key={a} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.2} />);
      }
      // Stepped corners.
      const step = (x: number, y: number, dx: number, dy: number, k: string) => (
        <path key={k} d={`M${x} ${y + dy * 90}V${y + dy * 30}H${x + dx * 30}V${y}H${x + dx * 90}`} strokeWidth={2} />
      );
      return (
        <g transform={`scale(${s})`} fill="none" stroke="currentColor">
          <rect x={40} y={40} width={920} height={1320} strokeWidth={2.4} />
          <rect x={56} y={56} width={888} height={1288} strokeWidth={0.8} />
          {step(76, 76, 1, 1, "a")}
          {step(924, 76, -1, 1, "b")}
          {step(76, 1324, 1, -1, "c")}
          {step(924, 1324, -1, -1, "d")}
          {rays}
          <path d={`M${cx - 120} ${fanY}A120 120 0 0 1 ${cx + 120} ${fanY}`} strokeWidth={2} />
          <path d={`M${cx - 230} ${fanY}A230 230 0 0 1 ${cx + 230} ${fanY}`} strokeWidth={2.4} />
          <path d={`M${cx - 244} ${fanY}A244 244 0 0 1 ${cx + 244} ${fanY}`} strokeWidth={0.8} />
          <path d={`M${cx - 60} ${fanY}A60 60 0 0 1 ${cx + 60} ${fanY}`} fill="currentColor" stroke="none" />
          <line x1={cx - 300} x2={cx + 300} y1={fanY} y2={fanY} strokeWidth={1.2} />
          {/* Side pilasters. */}
          {[110, 124, 876, 890].map((x) => (
            <line key={x} x1={x} x2={x} y1={520} y2={1150} strokeWidth={x % 2 ? 0.8 : 1.6} />
          ))}
          {/* Chevron at the foot. */}
          {[0, 18, 36].map((d) => (
            <path key={d} d={`M${cx - 90 + d} ${1210 - d * 0.5}L${cx} ${1170 - d * 0.5 + d * 0.9}L${cx + 90 - d} ${1210 - d * 0.5}`} strokeWidth={1.4} />
          ))}
        </g>
      );
    },
  },
  bow: {
    kind: "vector",
    label: "Ribbon bow",
    aspect: 0.62,
    draw: (w, pal) => {
      const s = w / 340;
      const edge = pal.ink;
      return (
        <g transform={`scale(${s})`} stroke={edge} strokeWidth={1.6} strokeLinejoin="round" strokeOpacity={0.55}>
          {/* Tails first, loops over them, the knot on top. */}
          <path d="M160 100C140 140 110 175 70 205L92 212L84 230C130 196 160 160 172 108Z" fill="currentColor" />
          <path d="M180 100C200 140 230 175 270 205L248 212L256 230C210 196 180 160 168 108Z" fill="currentColor" />
          <path d="M170 92C130 40 60 20 30 50C8 74 30 120 80 122C120 124 150 110 170 96Z" fill="currentColor" />
          <path d="M170 92C210 40 280 20 310 50C332 74 310 120 260 122C220 124 190 110 170 96Z" fill="currentColor" />
          <path d="M60 72C90 66 130 78 160 92M280 72C250 66 210 78 180 92" fill="none" strokeOpacity={0.35} />
          <ellipse cx={170} cy={96} rx={18} ry={22} fill="currentColor" />
        </g>
      );
    },
  },
  laurelArch: {
    kind: "vector",
    label: "Laurel arch",
    aspect: 1.35,
    draw: (w) => {
      const h = w * 1.35;
      const r = w / 2 - 20;
      const cx = w / 2;
      const top = r + 20;
      // Points along the arch from the bottom-left, up and over, to the bottom-right,
      // each with the outward direction there (degrees).
      const pts: [number, number, number][] = [];
      const legSteps = 16;
      for (let i = 0; i < legSteps; i++) {
        const y = h - 10 - ((h - 10 - top) * i) / legSteps;
        pts.push([cx - r, y, 180]);
      }
      for (let i = 0; i <= 44; i++) {
        const a = Math.PI + (Math.PI * i) / 44;
        pts.push([cx + r * Math.cos(a), top + r * Math.sin(a), (a * 180) / Math.PI]);
      }
      for (let i = legSteps - 1; i >= 0; i--) {
        const y = h - 10 - ((h - 10 - top) * i) / legSteps;
        pts.push([cx + r, y, 0]);
      }
      const leaves: ReactNode[] = [];
      const half = pts.length / 2;
      pts.forEach(([x, y, dir], i) => {
        // Two branches grow from the feet and meet at the top: each leaf
        // leans forward along its branch, alternating sides.
        const forward = i < half ? dir + 90 : dir - 90;
        const side = i % 2 ? 1 : -1;
        const turn = Math.round((forward + side * 34) * 100) / 100;
        const rad = (turn * Math.PI) / 180;
        const len = 19 + (i % 3) * 2;
        const lx = Math.round((x + Math.cos(rad) * len) * 100) / 100;
        const ly = Math.round((y + Math.sin(rad) * len) * 100) / 100;
        leaves.push(<ellipse key={i} cx={lx} cy={ly} rx={len} ry={len * 0.36} transform={`rotate(${turn} ${lx} ${ly})`} fill="currentColor" />);
        if (i % 9 === 4) {
          const bx = Math.round((x - Math.cos(rad) * 10) * 100) / 100;
          const by = Math.round((y - Math.sin(rad) * 10) * 100) / 100;
          leaves.push(<circle key={`b${i}`} cx={bx} cy={by} r={5.5} fill="currentColor" />);
        }
      });
      return (
        <g>
          <path d={`M${cx - r} ${h - 10}V${top}A${r} ${r} 0 0 1 ${cx + r} ${top}V${h - 10}`} fill="none" stroke="currentColor" strokeWidth={1.6} />
          {leaves}
        </g>
      );
    },
  },
  filmStrip: {
    kind: "vector",
    label: "Film strip",
    aspect: 1240 / 380,
    draw: (w) => {
      const s = w / 380;
      const holes: ReactNode[] = [];
      for (let y = 18; y < 1230; y += 38) {
        holes.push(<rect key={`l${y}`} x={10} y={y} width={14} height={20} rx={3} />, <rect key={`r${y}`} x={356} y={y} width={14} height={20} rx={3} />);
      }
      return (
        <g transform={`scale(${s})`}>
          <rect width={380} height={1240} fill="currentColor" />
          <g fill="#f4f1ea" opacity={0.92}>{holes}</g>
        </g>
      );
    },
  },
  greaseCircle: {
    kind: "vector",
    label: "Grease-pencil circle",
    aspect: 1.15,
    draw: (w) => {
      const h = w * 1.15;
      // Drawn in one loose stroke that overshoots where it meets itself.
      return (
        <path
          d={`M${w * 0.12} ${h * 0.3}C${w * 0.28} ${h * 0.02} ${w * 0.82} ${h * -0.02} ${w * 0.95} ${h * 0.38}C${w * 1.04} ${h * 0.72} ${w * 0.66} ${h * 1.02} ${w * 0.36} ${h * 0.96}C${w * 0.06} ${h * 0.9} ${w * -0.02} ${h * 0.52} ${w * 0.1} ${h * 0.26}C${w * 0.16} ${h * 0.14} ${w * 0.26} ${h * 0.08} ${w * 0.36} ${h * 0.05}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={w * 0.022}
          strokeLinecap="round"
          opacity={0.85}
        />
      );
    },
  },
  tape: {
    kind: "vector",
    label: "Paper tape",
    aspect: 0.3,
    draw: (w) => {
      const h = w * 0.3;
      // Torn ends: a little zig-zag down each side.
      const right = Array.from({ length: 7 }, (_, i) => `L${i % 2 ? w - 5 : w} ${Math.round((h * (i + 1)) / 7)}`).join("");
      const left = Array.from({ length: 7 }, (_, i) => `L${i % 2 ? 5 : 0} ${Math.round(h - (h * (i + 1)) / 7)}`).join("");
      return <path d={`M0 0H${w}${right}H0${left}Z`} fill="currentColor" opacity={0.72} />;
    },
  },
  sunburstBadge: {
    kind: "vector",
    label: "Label badge",
    aspect: 1,
    draw: (w, pal) => {
      const c = w / 2;
      const pts = Array.from({ length: 96 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 96;
        const r = i % 2 ? c * 0.93 : c;
        return `${Math.round((c + r * Math.cos(a)) * 100) / 100},${Math.round((c + r * Math.sin(a)) * 100) / 100}`;
      });
      return (
        <g>
          <polygon points={pts.join(" ")} fill={pal.accent} />
          <circle cx={c} cy={c} r={c * 0.89} fill={pal.onPhoto} />
          <circle cx={c} cy={c} r={c * 0.84} fill="none" stroke={pal.ink} strokeWidth={3} />
          <circle cx={c} cy={c} r={c * 0.66} fill="none" stroke={pal.ink} strokeWidth={1.2} opacity={0.6} />
          {[-1, 1].map((side) => (
            <g key={side}>{star5Path(c + side * c * 0.75, c, c * 0.035, pal.accent)}</g>
          ))}
        </g>
      );
    },
  },
  ribbonBanner: {
    kind: "vector",
    label: "Ribbon",
    aspect: 0.11,
    draw: (w, pal) => {
      const h = w * 0.11;
      const t = h * 0.18;
      return (
        <g>
          {/* Tails behind, then the band. */}
          <path d={`M0 ${t}H${w * 0.12}V${h}H0L${w * 0.04} ${(t + h) / 2}Z`} fill={pal.accent} />
          <path d={`M${w} ${t}H${w * 0.88}V${h}H${w}L${w * 0.96} ${(t + h) / 2}Z`} fill={pal.accent} />
          <path d={`M${w * 0.1} ${h}L${w * 0.12} ${h - t}H${w * 0.12}Z M${w * 0.9} ${h}L${w * 0.88} ${h - t}Z`} fill={pal.ink} opacity={0.5} />
          <rect x={w * 0.1} y={0} width={w * 0.8} height={h - t} fill={pal.accent} />
          <rect x={w * 0.1} y={h * 0.08} width={w * 0.8} height={1.5} fill={pal.onPhoto} opacity={0.6} />
          <rect x={w * 0.1} y={h - t - h * 0.1} width={w * 0.8} height={1.5} fill={pal.onPhoto} opacity={0.6} />
        </g>
      );
    },
  },
  gingham: {
    kind: "vector",
    label: "Gingham",
    aspect: 1.4,
    draw: (w) => {
      const s = w / 1000;
      const bands: ReactNode[] = [];
      for (let i = 0; i < 1000; i += 70) bands.push(<rect key={`v${i}`} x={i} y={0} width={35} height={1400} />);
      for (let j = 0; j < 1400; j += 70) bands.push(<rect key={`h${j}`} x={0} y={j} width={1000} height={35} />);
      return (
        <g transform={`scale(${s})`} fill="currentColor" opacity={0.2}>
          {bands}
        </g>
      );
    },
  },
  plaque: {
    kind: "vector",
    label: "Card",
    aspect: 860 / 640,
    draw: (w, pal) => {
      const h = w * (860 / 640);
      return (
        <g>
          <rect x={6} y={10} width={w} height={h} rx={10} fill="#000" opacity={0.08} />
          <rect width={w} height={h} rx={10} fill={pal.onPhoto} />
          <rect x={16} y={16} width={w - 32} height={h - 32} rx={6} fill="none" stroke={pal.accent} strokeWidth={1.6} strokeDasharray="2 7" strokeLinecap="round" />
        </g>
      );
    },
  },
  ropeFrame: {
    kind: "vector",
    label: "Rope border",
    aspect: 1300 / 900,
    draw: (w) => {
      const h = w * (1300 / 900);
      const twists: ReactNode[] = [];
      const step = 13;
      // Short slanted strands, close together, read as twisted rope.
      const side = (x0: number, y0: number, x1: number, y1: number, k: string) => {
        const len = Math.hypot(x1 - x0, y1 - y0);
        const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
        for (let d = 0; d <= len; d += step) {
          const x = Math.round((x0 + ((x1 - x0) * d) / len) * 100) / 100;
          const y = Math.round((y0 + ((y1 - y0) * d) / len) * 100) / 100;
          twists.push(<ellipse key={`${k}${d}`} cx={x} cy={y} rx={9} ry={5} transform={`rotate(${Math.round(angle + 50)} ${x} ${y})`} />);
        }
      };
      side(10, 10, w - 10, 10, "t");
      side(w - 10, 10, w - 10, h - 10, "r");
      side(w - 10, h - 10, 10, h - 10, "b");
      side(10, h - 10, 10, 10, "l");
      return (
        <g fill="none" stroke="currentColor" strokeWidth={2.4}>
          {twists}
        </g>
      );
    },
  },
  brandBar: {
    kind: "vector",
    label: "Brand bar",
    aspect: 0.08,
    draw: (w) => <line x1={10} x2={w - 10} y1={w * 0.04} y2={w * 0.04} stroke="currentColor" strokeWidth={16} strokeLinecap="round" />,
  },
  deckle: {
    kind: "vector",
    label: "Deckled edge",
    aspect: 1.4,
    draw: (w) => {
      const s = w / 1000;
      // A fixed wobble (not random, so server and browser draw the same edge).
      const jag = (i: number) => Math.round((Math.sin(i * 12.9898) * 43758.5453) % 1 * 7 * 100) / 100;
      let edge = "M30 30";
      let i = 0;
      for (let x = 30; x <= 970; x += 14) edge += `L${x} ${30 + jag(i++)}`;
      for (let y = 30; y <= 1370; y += 14) edge += `L${970 - jag(i++)} ${y}`;
      for (let x = 970; x >= 30; x -= 14) edge += `L${x} ${1370 - jag(i++)}`;
      for (let y = 1370; y >= 30; y -= 14) edge += `L${30 + jag(i++)} ${y}`;
      edge += "Z";
      return (
        <g transform={`scale(${s})`}>
          <path d={`M0 0H1000V1400H0Z${edge}`} fillRule="evenodd" fill="currentColor" opacity={0.09} />
          <path d={edge} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.18} />
        </g>
      );
    },
  },
  // Highland (suites wave 2): a painted sky over the whole card and a moor
  // along the bottom, coloured from the palette (accent = the land).
  moorSky: {
    kind: "vector",
    label: "Painted sky",
    aspect: 1.4,
    draw: (w, pal) => (
      <MoorSky
        id={`moorsky-${pal.id}`}
        w={w}
        h={w * 1.4}
        top={mix(pal.paper, "#f3dcb2", 0.45)}
        mid={pal.paper}
        bottom={mix(pal.paper, "#aab6bd", 0.42)}
      />
    ),
  },
  moorland: {
    kind: "vector",
    label: "Moorland",
    aspect: 0.56,
    draw: (w, pal) => (
      <Moorland
        id={`moor-${pal.id}`}
        w={w}
        h={w * 0.56}
        colours={{
          far: mix(mix(pal.paper, "#8f9ba3", 0.35), pal.accent, 0.25),
          hill: mix(pal.accent, pal.ink, 0.45),
          slope: mix(mix(pal.accent, "#9a7f5c", 0.45), pal.paper, 0.25),
          near: mix(pal.accent, "#a8843f", 0.5),
          grass: [mix("#d8b874", pal.accent, 0.15), mix("#a98b4c", pal.accent, 0.3), mix(pal.accent, pal.ink, 0.6), "#9a5a35"],
        }}
      />
    ),
  },
  // Gilded (suites wave 2): line-drawn flowers running off the left edge, a
  // panel over their right-hand ends and a fine double frame round it. Petals
  // hide what's behind them with the paper, or with black inside a foil mask
  // (card-svg sets --art-knock there).
  gildedFlowers: {
    kind: "vector",
    label: "Line flowers",
    aspect: 1.4,
    draw: (w, pal) => (
      <g transform={`scale(${w / 1000})`}>
        <GildedSpray knock={`var(--art-knock, ${pal.paper})`} />
      </g>
    ),
  },
  gildedPanel: {
    kind: "vector",
    label: "Panel",
    aspect: 1.4,
    draw: (w, pal) => (
      <rect
        x={w * 0.42}
        y={w * 0.15}
        width={w * 0.52}
        height={w * 1.1}
        fill={contrast(pal.paper, "#000000") > 9 ? mix(pal.paper, "#ffffff", 0.6) : mix(pal.paper, "#000000", 0.18)}
      />
    ),
  },
  gildedFrame: {
    kind: "vector",
    label: "Gold frame",
    aspect: 1.4,
    draw: (w) => (
      <g fill="none" stroke="currentColor">
        <rect x={w * 0.42} y={w * 0.15} width={w * 0.52} height={w * 1.1} strokeWidth={w * 0.0028} />
        <rect x={w * 0.432} y={w * 0.162} width={w * 0.496} height={w * 1.076} strokeWidth={w * 0.0012} />
      </g>
    ),
  },
  // A pen swash (owner, 2026-11-11: the old wavy line with a loop looked
  // cheap): two strokes swelling from a small lozenge and tapering to a
  // hairline at each end, as a broad nib draws them.
  flourish: {
    kind: "vector",
    label: "Flourish",
    aspect: 0.16,
    draw: (w) => {
      const h = w * 0.16;
      const c = w / 2;
      const m = h * 0.5;
      const half = `M${c - 14} ${m - 0.8}C${c - w * 0.16} ${m - 2.6} ${w * 0.2} ${m + 6} ${w * 0.05} ${m - 2.5}C${w * 0.2} ${m + 8.5} ${c - w * 0.16} ${m + 2.8} ${c - 14} ${m + 0.8}Z`;
      return (
        <g fill="currentColor">
          <path d={half} />
          <path d={half} transform={`translate(${w} 0) scale(-1 1)`} />
          <path d={`M${c} ${m - 5}L${c + 5} ${m}L${c} ${m + 5}L${c - 5} ${m}Z`} />
        </g>
      );
    },
  },
  // ---- Batch A suites ----
  highlandStd: batchA("Alpine lake", "highland-std", 1024, 1434),
  highlandInv: batchA("Alpine lake", "highland-std", 1024, 1434),
  highlandForest: batchA("Pines and rocks", "highland-forest", 162, 170),
  shorelineStd: batchA("Palm on the shore", "sh-std", 1000, 1400),
  shorelineInv: batchA("Palms on the shore", "sh-inv", 1000, 1400),
  regattaStd: batchA("Lighthouse and hydrangeas", "rg-save-the-date", 1000, 610),
  regattaInv: batchA("Sailboat on the bay", "rg-invitation", 1000, 610),
  rivieraStd: batchA("Riviera terrace", "fr-save-the-date", 1000, 670),
  rivieraInv: batchA("Riviera sea", "fr-invitation", 1000, 670),
  postmarkStd: batchA("Tuscan villa", "pm-std", 1000, 527),
  postmarkInv: batchA("Tuscan vineyards", "pm-inv", 1000, 525),
  sonoranStd: batchA("Sonoran desert", "sd-std", 1000, 1400),
  sonoranInv: batchA("Sonoran desert (invitation)", "sd-inv", 1000, 1400),
  gardenStd: batchA("Garden arch over the lake", "ga-save-the-date", 1500, 920),
  gardenInv: batchA("Lake and villa", "ga-invitation", 1500, 920),
  joshuaStd: batchA("Joshua tree at sunset", "jt-save-the-date", 1500, 800),
  joshuaInv: batchA("Joshua tree at sunset (invitation)", "jt-invitation", 1500, 800),
  terraceStd: batchA("Bougainvillea terrace", "terrace-std", 1000, 1400),
  coastalStd: batchA("Big Sur coast", "coastal-std", 1024, 1434),
  coastalFoot: batchA("Coast and poppies", "coastal-foot", 1024, 410),
  heirloomStd: batchA("Peony corners", "heirloom-std", 1000, 1400),
  heirloomInv: batchA("Peony corners (invitation)", "heirloom-inv", 1000, 1400),
  heirloomTop: batchA("Peony cluster", "heirloom-corner-top", 560, 800),
  heirloomBottom: batchA("Peony cluster (lower)", "heirloom-corner-bottom", 620, 620),
  wildflowerFrame: batchA("Wildflower meadow", "wildflower-card", 1000, 1400),
  wildflowerLeft: batchA("Wildflowers (left)", "wildflower-left", 300, 1400),
  wildflowerRight: batchA("Wildflowers (right)", "wildflower-right", 300, 1400),
  /** Black-tie: a heavier outer rule and a fine inner one, like an engraved card's border. */
  doubleFrame: {
    kind: "vector",
    label: "Double frame",
    aspect: 1.4,
    draw: (w) => {
      const s = w / 1000;
      return (
        <g fill="none" stroke="currentColor" transform={`scale(${s})`}>
          <rect x={30} y={30} width={940} height={1340} strokeWidth={3} />
          <rect x={44} y={44} width={912} height={1312} strokeWidth={1} />
        </g>
      );
    },
  },
  /** Two short rules with a small diamond between them, spaced wide. */
  diamondSpan: {
    kind: "vector",
    label: "Diamond rules",
    aspect: 0.03,
    draw: (w) => {
      const y = w * 0.015;
      const c = w / 2;
      return (
        <g stroke="currentColor" fill="currentColor" strokeWidth={1.6}>
          <line x1={0} x2={w * 0.24} y1={y} y2={y} />
          <line x1={w * 0.76} x2={w} y1={y} y2={y} />
          <path d={`M${c} ${y - 8}L${c + 8} ${y}L${c} ${y + 8}L${c - 8} ${y}Z`} stroke="none" />
        </g>
      );
    },
  },
  peony: img("Peony", "peony-pink", 675),
  roses: img("White & pink roses", "roses-white-pink", 824),
  wildRoses: img("Wild roses", "wild-roses", 600),
  sweetPea: img("Sweet pea", "sweet-pea", 641),
  myrtle: img("Myrtle", "myrtle", 548),
  jasmine: img("Jasmine", "jasmine", 621),
  lemon: img("Lemons", "lemon", 703),
  iris: img("Iris", "iris-blue", 432),
  poppy: img("Poppy", "poppy", 629),
  anemone: img("Anemone", "anemone-red", 740),
  mallow: img("Mallow", "mallow", 787),
  lilyValley: img("Lily of the valley", "lily-of-the-valley", 654),
  tulip: img("Tulip", "tulip-striped", 528),
  cherries: img("Wild cherries", "wild-cherries", 773),
  bayLaurel: img("Bay laurel", "bay-laurel", 668),
};
