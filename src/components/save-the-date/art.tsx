import type { ReactNode } from "react";

/**
 * Decorations a card template can place. Two kinds:
 *
 * - "vector": drawn here, in a local box `w` wide and `w * aspect` tall, in
 *   `currentColor`, so every colourway recolours it. Original to the app.
 * - "image": a public-domain botanical cut-out from /public/site-art (see
 *   docs/site-art-sources.md), kept in its own watercolours.
 */

type VectorArt = { kind: "vector"; label: string; aspect: number; draw: (w: number) => ReactNode };
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
  peony: img("Peony", "peony-pink", 675),
  roses: img("White & pink roses", "roses-white-pink", 824),
  wildRoses: img("Wild roses", "wild-roses", 600),
  sweetPea: img("Sweet pea", "sweet-pea", 641),
  myrtle: img("Myrtle", "myrtle", 548),
  jasmine: img("Jasmine", "jasmine", 621),
  lemon: img("Lemons", "lemon", 703),
};
