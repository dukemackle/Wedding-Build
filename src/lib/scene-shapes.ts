/**
 * Path generators for the drawn landscapes on the guest site
 * (src/components/site-scene.tsx). Each takes a seeded `rnd` so no two trees
 * or peaks are alike, yet a scene draws exactly the same on every visit and
 * on the server and the client. They return SVG path data only; colour is
 * the scene's business.
 */

export type Rnd = () => number;
type Pt = [number, number];

/** A fixed run of "random" numbers in [0, 1) (mulberry32). */
export function seeded(seed: number): Rnd {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => v.toFixed(1);
/**
 * A closed polygon. Every shape is wound the same way as `circle`, so where
 * shapes in one path overlap they add up rather than cutting holes in each
 * other (nonzero fill). `raw` keeps the order given, for paths that carry on.
 */
export function poly(p: Pt[], raw = false): string {
  let area = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    area += x1 * y2 - x2 * y1;
  }
  const pts = !raw && area > 0 ? p.slice().reverse() : p;
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${n(x)} ${n(y)}`).join("") + "Z";
}
const circle = (x: number, y: number, r: number) =>
  `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;

/** A ragged line from a to b: midpoint displacement across the line, halving each pass. */
function jag(a: Pt, b: Pt, amp: number, depth: number, rnd: Rnd): Pt[] {
  if (depth === 0) return [a, b];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const off = (rnd() - 0.5) * amp;
  const m: Pt = [(a[0] + b[0]) / 2 - (dy / len) * off, (a[1] + b[1]) / 2 + (dx / len) * off];
  return [...jag(a, m, amp / 2, depth - 1, rnd), ...jag(m, b, amp / 2, depth - 1, rnd).slice(1)];
}

/** A ground line `f` closed down to the bottom of the band. */
export function ground(f: (x: number) => number, x0 = 0, x1 = 1200, bottom = 260): string {
  const steps = Math.ceil((x1 - x0) / 20);
  const p: Pt[] = Array.from({ length: steps + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / steps;
    return [x, f(x)];
  });
  return poly([...p, [x1, bottom], [x0, bottom]]);
}

/** A long range of far mountains: a ragged skyline closed to the bottom. */
export function range(rnd: Rnd, y: number, rise: number, bottom = 260): string {
  const knots: Pt[] = [[-10, y]];
  for (let x = 60 + rnd() * 80; x < 1210; x += 120 + rnd() * 160) {
    knots.push([x - 40 - rnd() * 40, y - rise * (0.15 + rnd() * 0.2)]);
    knots.push([x, y - rise * (0.55 + rnd() * 0.45)]);
  }
  knots.push([1210, y]);
  const line = knots.slice(1).reduce<Pt[]>((acc, k) => [...acc, ...jag(acc[acc.length - 1], k, rise * 0.25, 3, rnd).slice(1)], [knots[0]]);
  return poly([...line, [1210, bottom], [-10, bottom]]);
}

/**
 * A mountain: its outline, the shadowed face to the right of a crease down
 * from the summit, and a cap of snow that runs unevenly down the gullies
 * (empty when `snow` is 0).
 */
export function mountain(rnd: Rnd, cx: number, base: number, h: number, w: number, snow = 0.3) {
  const top: Pt = [cx + (rnd() - 0.5) * w * 0.25, base - h];
  const left = jag([cx - w, base], top, h * 0.22, 5, rnd);
  const right = jag(top, [cx + w, base], h * 0.22, 5, rnd);
  const crease = jag(top, [top[0] + w * (0.1 + rnd() * 0.25), base], w * 0.3, 5, rnd);
  const outline = poly([...left, ...right.slice(1)]);
  const shadow = poly([...right, ...crease.slice().reverse()]);
  if (!snow) return { outline, shadow, snow: "" };

  const line = top[1] + h * snow;
  const upL = left.slice().reverse().filter((p, i, a) => i === 0 || a[i - 1][1] < line);
  const upR = right.filter((p, i, a) => i === 0 || a[i - 1][1] < line);
  const a = upL[upL.length - 1];
  const b = upR[upR.length - 1];
  // The lower edge: drips of snow down the gullies, back from right to left.
  const drips: Pt[] = [];
  const k = 7;
  for (let i = 1; i < k; i++) {
    const x = b[0] + ((a[0] - b[0]) * i) / k;
    drips.push([x, line + (i % 2 ? h * (0.04 + rnd() * 0.12) : -h * rnd() * 0.06)]);
  }
  return { outline, shadow, snow: poly([...upL.slice().reverse(), ...upR.slice(1), ...drips]) };
}

/**
 * One conifer: tiers of drooping boughs widening towards the base, each a
 * little different, on a short trunk. With `snow`, a lip of snow along the
 * top of each bough is added to it.
 */
export function pine(cx: number, base: number, h: number, rnd: Rnd, snow?: string[]): string {
  const w = h * (0.22 + rnd() * 0.08);
  const trunk = h * 0.07;
  const crown = base - trunk;
  const top = base - h;
  const tiers = 6 + Math.floor(rnd() * 3);
  const lean = (rnd() - 0.5) * h * 0.06;
  type Tier = { from: Pt; c: Pt; tip: Pt; notch: Pt };
  const side = (dir: 1 | -1) => {
    const out: Tier[] = [];
    let prevY = top;
    let from: Pt = [cx + lean, top];
    for (let i = 0; i < tiers; i++) {
      const t = (i + 1) / tiers;
      const y = top + (crown - top) * Math.pow(t, 0.85);
      const span = y - prevY;
      const reach = w * (0.14 + 0.86 * Math.pow(t, 0.9)) * (0.85 + rnd() * 0.3);
      const x0 = cx + lean * (1 - t);
      const tier: Tier = {
        from,
        c: [x0 + dir * reach * 0.5, prevY + span * 0.8],
        tip: [x0 + dir * reach, y + span * (0.12 + rnd() * 0.2)],
        notch: [x0 + dir * reach * (0.4 + rnd() * 0.12), y - span * 0.02],
      };
      out.push(tier);
      from = tier.notch;
      prevY = y;
    }
    return out;
  };
  const r = side(1);
  const l = side(-1);
  const tw = Math.max(1.5, h * 0.03);
  let d = `M${n(cx + lean)} ${n(top)}`;
  r.forEach((t, i) => {
    d += `Q${n(t.c[0])} ${n(t.c[1])} ${n(t.tip[0])} ${n(t.tip[1])}`;
    if (i < r.length - 1) d += `L${n(t.notch[0])} ${n(t.notch[1])}`;
  });
  d += `L${n(cx + tw)} ${n(crown)}V${n(base)}H${n(cx - tw)}V${n(crown)}`;
  // Back up the left side: each bough from its tip to where it began.
  for (let i = l.length - 1; i >= 0; i--) {
    const t = l[i];
    d += `L${n(t.tip[0])} ${n(t.tip[1])}Q${n(t.c[0])} ${n(t.c[1])} ${n(t.from[0])} ${n(t.from[1])}`;
  }
  d += "Z";

  if (snow) {
    const lip = h * 0.035;
    for (const t of [...r, ...l]) {
      const at = (s: number): Pt => {
        const u = 1 - s;
        return [
          u * u * t.from[0] + 2 * u * s * t.c[0] + s * s * t.tip[0],
          u * u * t.from[1] + 2 * u * s * t.c[1] + s * s * t.tip[1],
        ];
      };
      const along = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map(at);
      const upper = along.map(([x, y], i): Pt => [x, y - lip * Math.sin((Math.PI * (i + 1)) / (along.length + 1))]);
      snow.push(poly([...upper, ...along.slice().reverse()]));
    }
  }
  return d;
}

/**
 * A stand of pines between x0 and x1 at irregular gaps, tallest in the middle
 * of the stand and thinning towards its edges, each standing on `on(x)`.
 */
export function grove(
  rnd: Rnd,
  x0: number,
  x1: number,
  on: (x: number) => number,
  minH: number,
  maxH: number,
  gap: number,
  snow?: string[],
): string {
  const trees: Pt[] = [];
  for (let x = x0 + rnd() * gap; x < x1; x += gap * (0.45 + rnd() * 0.9)) {
    const swell = Math.sin(Math.PI * ((x - x0) / (x1 - x0))) ** 0.6;
    if (rnd() > 0.35 + swell) continue;
    trees.push([x, minH + (maxH - minH) * swell * (0.6 + rnd() * 0.4)]);
  }
  // Taller trees first, so the shorter ones stand in front of them.
  return trees
    .sort((a, b) => b[1] - a[1])
    .map(([x, h]) => pine(x, on(x) + 2, h, rnd, snow))
    .join("");
}

/** An Italian cypress: a tall, narrow flame. */
export function cypress(cx: number, base: number, h: number, rnd: Rnd): string {
  const w = h * (0.1 + rnd() * 0.04);
  const top = base - h;
  const tip = cx + (rnd() - 0.5) * w * 0.4;
  return (
    `M${n(cx - w * 0.3)} ${n(base)}` +
    `C${n(cx - w * 1.15)} ${n(base - h * 0.3)} ${n(cx - w * 0.6)} ${n(base - h * 0.8)} ${n(tip)} ${n(top)}` +
    `C${n(cx + w * 0.6)} ${n(base - h * 0.8)} ${n(cx + w * 1.15)} ${n(base - h * 0.3)} ${n(cx + w * 0.3)} ${n(base)}Z`
  );
}

/** A broad tree: a short trunk under a canopy of overlapping rounds. */
export function roundTree(cx: number, base: number, h: number, rnd: Rnd): string {
  const r = h * 0.24;
  const crownY = base - h + r * 1.1;
  const tw = h * 0.04;
  let d = poly([
    [cx - tw * 1.6, base],
    [cx - tw, crownY + r],
    [cx - r * 0.5, crownY + r * 0.2],
    [cx, crownY + r * 0.7],
    [cx + r * 0.5, crownY + r * 0.1],
    [cx + tw, crownY + r],
    [cx + tw * 1.6, base],
  ]);
  const blobs = 6 + Math.floor(rnd() * 3);
  for (let i = 0; i < blobs; i++) {
    const a = (Math.PI * i) / (blobs - 1);
    const rr = r * (0.55 + rnd() * 0.3);
    d += circle(cx - Math.cos(a) * r * 1.3, crownY - Math.sin(a) * r * 0.75 + r * 0.25, rr);
  }
  d += circle(cx, crownY, r * 1.05);
  return d;
}

/**
 * A palm: a tapering trunk curving by `lean`, and fronds with a serrated
 * underside drooping from its crown.
 */
export function palmTree(x: number, base: number, h: number, lean: number, rnd: Rnd): string {
  const top: Pt = [x + lean, base - h];
  const c: Pt = [x + lean * 0.1, base - h * 0.55];
  const at = (s: number): Pt => {
    const u = 1 - s;
    return [u * u * x + 2 * u * s * c[0] + s * s * top[0], u * u * base + 2 * u * s * c[1] + s * s * top[1]];
  };
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const s = i / 12;
    const [px, py] = at(s);
    const [qx, qy] = at(Math.min(1, s + 0.01));
    const len = Math.hypot(qx - px, qy - py) || 1;
    const half = h * (0.04 - 0.018 * s);
    left.push([px - ((qy - py) / len) * -half, py - ((qx - px) / len) * half]);
    right.push([px + ((qy - py) / len) * -half, py + ((qx - px) / len) * half]);
  }
  let d = poly([...left, ...right.reverse()]);

  // Fronds arch out to either side and droop, the higher ones shorter.
  const lifts = [0.75, 0.42, 0.12, -0.2];
  for (const dir of [-1, 1] as const) {
    for (const lift of lifts) {
      const e = lift + (rnd() - 0.5) * 0.18;
      const len = h * (0.52 + rnd() * 0.14) * (1 - Math.max(0, e) * 0.3);
      const ctrl: Pt = [top[0] + dir * len * 0.55, top[1] - len * (Math.sin(e) * 0.8 + 0.18)];
      const tip: Pt = [top[0] + dir * len * Math.cos(e) * 0.95, top[1] - len * Math.sin(e) * 0.3 + len * 0.42];
      const spine = (s: number): Pt => {
        const u = 1 - s;
        return [u * u * top[0] + 2 * u * s * ctrl[0] + s * s * tip[0], u * u * top[1] + 2 * u * s * ctrl[1] + s * s * tip[1]];
      };
      const upper: Pt[] = [];
      const lower: Pt[] = [];
      for (let k = 0; k <= 30; k++) {
        const s = k / 30;
        const [sx, sy] = spine(s);
        const wdt = len * 0.06 * Math.sin(Math.PI * Math.min(1, 0.15 + s * 0.9));
        upper.push([sx, sy - wdt * 0.35]);
        lower.push([sx + dir * (k % 2 ? -wdt * 0.5 : 0), sy + wdt * (k % 2 ? 1.5 : 0.7)]);
      }
      d += poly([...upper, ...lower.reverse()]);
    }
  }
  return d;
}

/** A saguaro, as a centre line for a thick round-capped stroke. */
export function saguaro(x: number, base: number, h: number, rnd: Rnd): string {
  let d = `M${n(x)} ${n(base)}V${n(base - h)}`;
  const arm = (dir: 1 | -1, y: number) => {
    const out = h * (0.18 + rnd() * 0.08);
    const up = h * (0.2 + rnd() * 0.15);
    return `M${n(x)} ${n(y)}H${n(x + dir * out * 0.6)}Q${n(x + dir * out)} ${n(y)} ${n(x + dir * out)} ${n(y - out * 0.4)}V${n(y - up)}`;
  };
  d += arm(rnd() > 0.5 ? 1 : -1, base - h * (0.45 + rnd() * 0.1));
  if (rnd() > 0.3) d += arm(rnd() > 0.5 ? 1 : -1, base - h * (0.6 + rnd() * 0.1));
  return d;
}

/**
 * A mesa or butte: a ragged flat top, steep cliffs, and talus slopes
 * flaring out to the ground.
 */
export function butte(rnd: Rnd, x0: number, x1: number, top: number, base: number): string {
  const cliff = top + (base - top) * (0.5 + rnd() * 0.15);
  const flare = (base - top) * 0.7;
  const tl: Pt = [x0, top + rnd() * 4];
  const tr: Pt = [x1, top + rnd() * 4];
  const leftCliff = jag([x0 - 4, cliff], tl, 10, 3, rnd);
  const topEdge = jag(tl, tr, 4, 4, rnd);
  const rightCliff = jag(tr, [x1 + 4, cliff], 10, 3, rnd);
  return (
    poly([...leftCliff, ...topEdge.slice(1), ...rightCliff.slice(1)], true).slice(0, -1) +
    `Q${n(x1 + flare * 0.25)} ${n(base - 4)} ${n(x1 + flare)} ${n(base)}H${n(x0 - flare)}Q${n(x0 - flare * 0.25)} ${n(base - 4)} ${n(x0 - 4)} ${n(cliff)}Z`
  );
}

/**
 * A city skyline between x0 and x1 standing on `base`: blocks of varied
 * height and width, some stepped, some with a spire or a water tower.
 * Returns the outline and, for the nearer layers, a scatter of windows.
 */
export function skyline(rnd: Rnd, x0: number, x1: number, base: number, minH: number, maxH: number, windows = false) {
  let d = "";
  let lit = "";
  for (let x = x0; x < x1; ) {
    const w = 26 + rnd() * 44;
    const h = minH + (maxH - minH) * rnd() ** 1.4;
    const top = base - h;
    d += poly([
      [x, base],
      [x, top],
      [x + w, top],
      [x + w, base],
    ]);
    const kind = rnd();
    if (kind < 0.18) {
      // Stepped crown.
      d += poly([
        [x + w * 0.15, top + 1],
        [x + w * 0.15, top - h * 0.08],
        [x + w * 0.85, top - h * 0.08],
        [x + w * 0.85, top + 1],
      ]);
      d += poly([
        [x + w * 0.32, top - h * 0.08 + 1],
        [x + w * 0.32, top - h * 0.15],
        [x + w * 0.68, top - h * 0.15],
        [x + w * 0.68, top - h * 0.08 + 1],
      ]);
    } else if (kind < 0.3) {
      // A spire.
      d += poly([
        [x + w * 0.35, top + 1],
        [x + w * 0.5, top - h * 0.35],
        [x + w * 0.65, top + 1],
      ]);
    } else if (kind < 0.4) {
      // A water tower on legs.
      const tx = x + w * (0.3 + rnd() * 0.3);
      d += poly([
        [tx - 7, top + 1],
        [tx - 6, top - 8],
        [tx + 6, top - 8],
        [tx + 7, top + 1],
      ]);
      d += poly([
        [tx - 9, top - 8],
        [tx - 9, top - 22],
        [tx, top - 28],
        [tx + 9, top - 22],
        [tx + 9, top - 8],
      ]);
    }
    if (windows) {
      for (let wy = top + 8; wy < base - 8; wy += 11) {
        for (let wx = x + 5; wx < x + w - 7; wx += 9) {
          if (rnd() < 0.3) lit += `M${n(wx)} ${n(wy)}h4v5h-4Z`;
        }
      }
    }
    x += w + (rnd() < 0.25 ? 4 + rnd() * 10 : -2);
  }
  return { d, lit };
}

/** Grass blades and flower heads scattered along the front of a meadow. */
export function wildflowers(rnd: Rnd, x0: number, x1: number, on: (x: number) => number, count: number) {
  let blades = "";
  const heads: string[][] = [[], [], []];
  for (let i = 0; i < count; i++) {
    const x = x0 + rnd() * (x1 - x0);
    const y = on(x) + 4 + rnd() * 30;
    const h = 10 + rnd() * 22;
    const bend = (rnd() - 0.5) * 10;
    blades += `M${n(x)} ${n(y)}Q${n(x + bend * 0.3)} ${n(y - h * 0.6)} ${n(x + bend)} ${n(y - h)}`;
    if (rnd() < 0.45) heads[Math.floor(rnd() * 3)].push(circle(x + bend, y - h, 2.6 + rnd() * 2.6));
  }
  return { blades, heads: heads.map((h) => h.join("")) };
}
