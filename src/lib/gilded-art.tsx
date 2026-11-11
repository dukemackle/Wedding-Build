import type { ReactNode } from "react";

/**
 * Gilded (suites wave 2, docs/suites-wave-2.md): fine line-drawn flowers --
 * a magnolia branch, an orchid spray and a blossom branch -- that run off one
 * edge, shared by the save-the-date card (art.tsx) and the guest site's
 * "Gold flowers" scene and section sprigs (site-scene.tsx, section-layout.tsx),
 * so the two match. Drawn for You Do, I Do; nothing traced.
 *
 * Every line is `currentColor`, so one drawing serves every colourway (gold
 * foil, white on a dark card, blue ink). Petals and leaves are filled with
 * `knock` so what's in front hides what's behind, as in a pen drawing: the
 * card passes its paper (or black inside a foil mask), the site its page
 * colour. Everything is in one 1000 x 1400 space, the card's; the flowers
 * keep to x < 470, and the site shows that strip.
 */

type P = { knock: string; sw: number };

const f = (v: number) => Math.round(v * 10) / 10;

/** A petal or leaf pointing up from (0, 0): `l` long, `w` wide, its tip bent by `bend` (fraction of l). */
function blade(l: number, w: number, bend = 0, round = 0.5) {
  const tx = bend * l;
  const a = 0.12 + round * 0.25;
  return (
    `M0 0C${f(w * 0.95)} ${f(-l * a)} ${f(w * 0.8 + tx * 0.6)} ${f(-l * 0.82)} ${f(tx)} ${f(-l)}` +
    `C${f(-w * 0.75 + tx * 0.6)} ${f(-l * 0.84)} ${f(-w * 0.95)} ${f(-l * a)} 0 0Z`
  );
}

/** Lines along a blade from its base, like engraved shading: `n` of them, `reach` of its length. */
function hatch(l: number, w: number, n: number, reach: number, side: 1 | -1 | 0 = 0) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const off = side === 0 ? t * w * 0.9 : side * (0.15 + (t + 0.5) * 0.45) * w;
    const len = l * reach * (1 - Math.abs(t) * 0.5);
    d += `M${f(off * 0.25)} ${f(-l * 0.04)}Q${f(off * 0.9)} ${f(-len * 0.5)} ${f(off * 0.8)} ${f(-len)}`;
  }
  return d;
}

/** A magnolia petal: widest above the middle, a rounded tip. */
function spoon(l: number, w: number, bend = 0) {
  const tx = bend * l;
  return (
    `M0 0C${f(w * 0.45)} ${f(-l * 0.12)} ${f(w * 1.02)} ${f(-l * 0.5)} ${f(w * 0.68 + tx * 0.7)} ${f(-l * 0.86)}` +
    `C${f(w * 0.45 + tx)} ${f(-l * 1.06)} ${f(-w * 0.45 + tx)} ${f(-l * 1.06)} ${f(-w * 0.68 + tx * 0.7)} ${f(-l * 0.86)}` +
    `C${f(-w * 1.02)} ${f(-l * 0.5)} ${f(-w * 0.45)} ${f(-l * 0.12)} 0 0Z`
  );
}

const at = (x: number, y: number, rot = 0, s = 1) => `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})`;

/** A leaf with its midrib and a few veins. */
function Leaf({ x, y, rot, l, w, bend = 0.05, p }: { x: number; y: number; rot: number; l: number; w: number; bend?: number; p: P }) {
  let veins = "";
  for (let i = 1; i <= 4; i++) {
    const t = i / 5.2;
    const cx = bend * l * t * t;
    const span = w * 0.62 * Math.sin(Math.PI * Math.min(0.95, t + 0.12));
    veins += `M${f(cx)} ${f(-l * t)}q${f(span * 0.5)} ${f(-l * 0.04)} ${f(span)} ${f(-l * 0.11)}`;
    veins += `M${f(cx)} ${f(-l * t)}q${f(-span * 0.5)} ${f(-l * 0.04)} ${f(-span)} ${f(-l * 0.11)}`;
  }
  return (
    <g transform={at(x, y, rot)}>
      <path d={blade(l, w, bend, 0.45)} fill={p.knock} />
      <path d={`M0 0Q${f(bend * l * 0.3)} ${f(-l * 0.5)} ${f(bend * l)} ${f(-l * 0.97)}`} fill="none" />
      <path d={veins} fill="none" strokeWidth={p.sw * 0.55} />
    </g>
  );
}

/** A tapering branch along a quadratic curve, drawn as its outline. */
function Twig({ from, ctrl, to, w0, w1, p }: { from: [number, number]; ctrl: [number, number]; to: [number, number]; w0: number; w1: number; p: P }) {
  const pts: [number, number][] = [];
  const left: string[] = [];
  const right: string[] = [];
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * ctrl[0] + t * t * to[0];
    const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * ctrl[1] + t * t * to[1];
    const dx = 2 * (1 - t) * (ctrl[0] - from[0]) + 2 * t * (to[0] - ctrl[0]);
    const dy = 2 * (1 - t) * (ctrl[1] - from[1]) + 2 * t * (to[1] - ctrl[1]);
    const len = Math.hypot(dx, dy) || 1;
    const half = (w0 + (w1 - w0) * t) / 2;
    pts.push([x, y]);
    left.push(`${f(x - (dy / len) * half)} ${f(y + (dx / len) * half)}`);
    right.unshift(`${f(x + (dy / len) * half)} ${f(y - (dx / len) * half)}`);
  }
  return <path d={`M${left.join("L")}L${right.join("L")}Z`} fill={p.knock} strokeLinejoin="round" />;
}

/** A magnolia in side view, a cup of petals opening up from (0, 0), `s` tall. */
function MagnoliaBloom({ x, y, rot, s, p }: { x: number; y: number; rot: number; s: number; p: P }) {
  const back: [number, number, number, number][] = [
    // rotation, length, width, bend
    [-38, 0.8, 0.22, -0.16],
    [34, 0.86, 0.22, 0.16],
    [-6, 1, 0.24, 0.03],
  ];
  const front: [number, number, number, number][] = [
    [-16, 0.94, 0.27, -0.07],
    [14, 0.97, 0.28, 0.08],
    // One petal opened out and curling away.
    [62, 0.72, 0.2, 0.24],
  ];
  return (
    <g transform={at(x, y, rot)}>
      {back.map(([r, l, w, b], i) => (
        <g key={`b${i}`} transform={`rotate(${r})`}>
          <path d={spoon(s * l, s * w, b)} fill={p.knock} />
          <path d={hatch(s * l, s * w, 3, 0.3)} fill="none" strokeWidth={p.sw * 0.5} />
        </g>
      ))}
      {front.map(([r, l, w, b], i) => (
        <g key={`f${i}`} transform={`rotate(${r})`}>
          <path d={spoon(s * l, s * w, b)} fill={p.knock} />
          <path d={`M0 ${f(-s * 0.05)}Q${f(s * b * 0.4)} ${f(-s * l * 0.45)} ${f(s * b * 0.8)} ${f(-s * l * 0.72)}`} fill="none" strokeWidth={p.sw * 0.6} />
          <path d={hatch(s * l, s * w, 5, 0.42, i ? 1 : -1)} fill="none" strokeWidth={p.sw * 0.45} />
        </g>
      ))}
      {/* The cup at the base and two small sepals. */}
      <path d={`M${f(-s * 0.12)} ${f(-s * 0.03)}Q0 ${f(s * 0.1)} ${f(s * 0.12)} ${f(-s * 0.03)}`} fill={p.knock} />
      <g transform="rotate(-60)">
        <path d={blade(s * 0.2, s * 0.07, 0.1)} fill={p.knock} />
      </g>
      <g transform="rotate(64)">
        <path d={blade(s * 0.18, s * 0.06, -0.1)} fill={p.knock} />
      </g>
    </g>
  );
}

/** A closed magnolia bud on a short stem. */
function MagnoliaBud({ x, y, rot, s, p }: { x: number; y: number; rot: number; s: number; p: P }) {
  return (
    <g transform={at(x, y, rot)}>
      <path d={blade(s, s * 0.26, 0.04, 0.7)} fill={p.knock} />
      <path d={`M${f(s * 0.02)} ${f(-s * 0.02)}Q${f(s * 0.16)} ${f(-s * 0.5)} ${f(s * 0.04)} ${f(-s * 0.98)}`} fill="none" strokeWidth={p.sw * 0.6} />
      <g transform="rotate(-24)">
        <path d={blade(s * 0.42, s * 0.12, 0.08)} fill={p.knock} />
      </g>
    </g>
  );
}

/** An orchid face on, centred on (0, 0), `s` across. */
function OrchidBloom({ x, y, rot, s, p }: { x: number; y: number; rot: number; s: number; p: P }) {
  const parts: [number, number, number, number, number][] = [
    // rotation, length, width, bend, roundness
    [146, 0.48, 0.15, 0.04, 0.4],
    [-146, 0.48, 0.15, -0.04, 0.4],
    [0, 0.5, 0.17, 0, 0.45],
    [-80, 0.5, 0.3, -0.12, 0.95],
    [80, 0.5, 0.3, 0.12, 0.95],
  ];
  return (
    <g transform={at(x, y, rot)}>
      {parts.map(([r, l, w, b, round], i) => (
        <g key={i} transform={`rotate(${r})`}>
          <path d={blade(s * l, s * w, b, round)} fill={p.knock} />
          <path d={hatch(s * l, s * w, i > 2 ? 5 : 3, i > 2 ? 0.55 : 0.6)} fill="none" strokeWidth={p.sw * 0.4} />
        </g>
      ))}
      {/* The lip: a little cup with two curled side lobes, and the column above it. */}
      <path
        d={`M${f(-s * 0.06)} ${f(s * 0.02)}C${f(-s * 0.16)} ${f(s * 0.12)} ${f(-s * 0.1)} ${f(s * 0.3)} 0 ${f(s * 0.3)}C${f(s * 0.1)} ${f(s * 0.3)} ${f(s * 0.16)} ${f(s * 0.12)} ${f(s * 0.06)} ${f(s * 0.02)}Z`}
        fill={p.knock}
      />
      <path d={`M${f(-s * 0.1)} ${f(s * 0.06)}q${f(-s * 0.06)} ${f(-s * 0.06)} ${f(-s * 0.02)} ${f(-s * 0.11)}M${f(s * 0.1)} ${f(s * 0.06)}q${f(s * 0.06)} ${f(-s * 0.06)} ${f(s * 0.02)} ${f(-s * 0.11)}`} fill="none" />
      <path d={`M0 ${f(s * 0.08)}L0 ${f(s * 0.24)}`} fill="none" strokeWidth={p.sw * 0.5} />
      <ellipse cx="0" cy={f(-s * 0.02)} rx={f(s * 0.045)} ry={f(s * 0.06)} fill={p.knock} />
    </g>
  );
}

/** A five-petal blossom face on. */
function Blossom({ x, y, rot, r, p }: { x: number; y: number; rot: number; r: number; p: P }) {
  return (
    <g transform={at(x, y, rot)}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={blade(r, r * 0.62, 0, 1)} fill={p.knock} />
          <path d={`M0 ${f(-r * 0.2)}L0 ${f(-r * 0.55)}`} fill="none" strokeWidth={p.sw * 0.4} />
        </g>
      ))}
      <circle r={f(r * 0.16)} fill={p.knock} />
      {[20, 92, 164, 236, 308].map((a) => (
        <circle key={a} cx={f(Math.cos((a * Math.PI) / 180) * r * 0.3)} cy={f(Math.sin((a * Math.PI) / 180) * r * 0.3)} r={f(p.sw * 0.7)} fill="currentColor" stroke="none" />
      ))}
    </g>
  );
}

const Bud = ({ x, y, rot, r, p }: { x: number; y: number; rot: number; r: number; p: P }) => (
  <g transform={at(x, y, rot)}>
    <path d={`M0 0L0 ${f(r * 0.8)}`} fill="none" />
    <path d={blade(r * 1.3, r * 0.5, 0.05, 0.9)} fill={p.knock} />
  </g>
);

/** The magnolia branch, rising from the bottom-left corner. */
export function MagnoliaBranch({ knock, sw = 2.4 }: { knock: string; sw?: number }): ReactNode {
  const p = { knock, sw };
  return (
    <g>
      <Leaf x={70} y={1330} rot={-112} l={250} w={78} bend={-0.08} p={p} />
      <Leaf x={150} y={1180} rot={-58} l={230} w={72} bend={0.06} p={p} />
      <Twig from={[-40, 1470]} ctrl={[150, 1220]} to={[262, 905]} w0={22} w1={9} p={p} />
      <Twig from={[120, 1260]} ctrl={[40, 1060]} to={[70, 880]} w0={9} w1={4} p={p} />
      <Leaf x={212} y={1070} rot={66} l={200} w={62} bend={0.12} p={p} />
      <Leaf x={196} y={1100} rot={-16} l={170} w={56} bend={-0.1} p={p} />
      <MagnoliaBud x={70} y={885} rot={-8} s={150} p={p} />
      <MagnoliaBloom x={262} y={905} rot={18} s={250} p={p} />
    </g>
  );
}

/** The orchid spray, arching in from the left edge. */
export function OrchidSpray({ knock, sw = 2.4 }: { knock: string; sw?: number }): ReactNode {
  const p = { knock, sw };
  return (
    <g>
      <path d="M-40 410C80 360 260 420 400 590" fill="none" />
      <Leaf x={-20} y={480} rot={70} l={260} w={80} bend={-0.12} p={p} />
      <OrchidBloom x={70} y={430} rot={-8} s={190} p={p} />
      <OrchidBloom x={215} y={455} rot={10} s={160} p={p} />
      <OrchidBloom x={325} y={525} rot={22} s={126} p={p} />
      <Bud x={378} y={570} rot={130} r={26} p={p} />
      <Bud x={402} y={600} rot={150} r={18} p={p} />
    </g>
  );
}

/** The blossom branch, running in off the top edge. */
export function BlossomBranch({ knock, sw = 2.4 }: { knock: string; sw?: number }): ReactNode {
  const p = { knock, sw };
  return (
    <g>
      <Twig from={[-30, 40]} ctrl={[180, 70]} to={[440, 250]} w0={12} w1={4} p={p} />
      <Twig from={[160, 72]} ctrl={[230, 10]} to={[300, -30]} w0={6} w1={3} p={p} />
      <Leaf x={120} y={66} rot={150} l={70} w={24} p={p} />
      <Leaf x={330} y={170} rot={20} l={66} w={22} p={p} />
      <Leaf x={250} y={20} rot={70} l={58} w={20} p={p} />
      <Blossom x={60} y={76} rot={10} r={40} p={p} />
      <Blossom x={210} y={100} rot={40} r={34} p={p} />
      <Blossom x={282} y={-2} rot={-20} r={30} p={p} />
      <Blossom x={360} y={210} rot={5} r={28} p={p} />
      <Bud x={420} y={252} rot={115} r={16} p={p} />
      <Bud x={160} y={40} rot={-30} r={14} p={p} />
      <Bud x={300} y={140} rot={160} r={13} p={p} />
    </g>
  );
}

/** All three, as they sit down the left of the card (1000 x 1400). */
export function GildedSpray({ knock, sw = 2.4 }: { knock: string; sw?: number }): ReactNode {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <BlossomBranch knock={knock} sw={sw} />
      <OrchidSpray knock={knock} sw={sw} />
      <MagnoliaBranch knock={knock} sw={sw} />
    </g>
  );
}

/** One small magnolia on a sprig with a leaf and a bud, in a 200 x 120 box: the mark above a section. */
export function GildedSprig({ knock, sw = 1.6 }: { knock: string; sw?: number }): ReactNode {
  const p = { knock, sw };
  return (
    <g fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <Twig from={[22, 104]} ctrl={[80, 98]} to={[118, 78]} w0={4} w1={2.5} p={p} />
      <Leaf x={70} y={100} rot={-38} l={52} w={17} bend={-0.1} p={p} />
      <Leaf x={92} y={95} rot={112} l={44} w={15} bend={0.1} p={p} />
      <MagnoliaBud x={40} y={102} rot={-62} s={34} p={p} />
      <MagnoliaBloom x={118} y={80} rot={42} s={74} p={p} />
    </g>
  );
}
