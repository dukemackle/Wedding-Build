import type { ReactNode } from "react";
import type { Palette } from "@/lib/save-the-date/types";

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
  peony: img("Peony", "peony-pink", 675),
  roses: img("White & pink roses", "roses-white-pink", 824),
  wildRoses: img("Wild roses", "wild-roses", 600),
  sweetPea: img("Sweet pea", "sweet-pea", 641),
  myrtle: img("Myrtle", "myrtle", 548),
  jasmine: img("Jasmine", "jasmine", 621),
  lemon: img("Lemons", "lemon", 703),
};
