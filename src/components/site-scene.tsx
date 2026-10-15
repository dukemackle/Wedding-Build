"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { useSiteDesign } from "@/components/guest-site-theme";
import { resolveDesign, sceneById, type SceneId } from "@/lib/site-design";
import { ICONS, ICON_SETS } from "@/lib/scene-icons";
import {
  butte,
  cypress,
  grove,
  ground,
  mountain,
  palmTree,
  range,
  roundTree,
  saguaro,
  seeded,
  skyline,
  wildflowers,
  type Rnd,
} from "@/lib/scene-shapes";

/**
 * The drawn setting at the top of the guest site (Background tab › Scene): a
 * landscape along the bottom of it, a strip along its top, or something
 * framing the names. Shapes rather than artwork, each layer mixed from the
 * accent and the background, so one drawing suits every palette and a
 * theme's swatches double as its moods (dusk, misty blue, golden hour...).
 *
 * A band is wider than it is tall and slices to fit, so on a phone the
 * middle of it shows at the same height rather than shrinking to a sliver.
 */

const tint = (pct: number) =>
  `color-mix(in srgb, var(--site-accent) ${pct}%, var(--color-parchment))`;
const shade = (pct: number) =>
  `color-mix(in srgb, var(--site-accent) ${100 - pct}%, var(--color-ink))`;
const fill = (color: string): CSSProperties => ({ fill: color });
/** The theme's second colour, for skies and far hills: peach behind teal peaks. */
const tint2 = (pct: number) =>
  `color-mix(in srgb, var(--site-accent-2, var(--site-accent)) ${pct}%, var(--color-parchment))`;

export function SiteScene({ where }: { where: "band" | "strip" | "surround" }) {
  const design = useSiteDesign();
  const id = useId().replace(/:/g, "");
  const scene = resolveDesign(design).scene;
  if (sceneById(scene).place !== where) return null;

  if (where === "band") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 260"
        preserveAspectRatio="xMidYMax slice"
        className="site-scene pointer-events-none block h-[clamp(120px,21.7vw,340px)] w-full"
      >
        {BANDS[scene]?.(id)}
      </svg>
    );
  }
  if (where === "strip")
    return <div aria-hidden="true">{STRIPS[scene]?.(id)}</div>;
  return <div aria-hidden="true">{SURROUNDS[scene]?.(id)}</div>;
}

/**
 * The picture in a photo layout before the couple has a photo of their own:
 * their scene drawn large, in their colours, rather than an empty box or
 * someone else's stock photo. A landscape stands at the bottom under a sky,
 * and an icon pattern fills the frame. Themes whose scene isn't a landscape
 * get misty ridges, which suit any palette.
 * Fills its (positioned) parent.
 */
export function SceneArtwork() {
  const design = useSiteDesign();
  const id = useId().replace(/:/g, "");
  const scene = resolveDesign(design).scene;
  const place = sceneById(scene).place;
  const sky = `linear-gradient(180deg, color-mix(in srgb, var(--site-accent-2, var(--site-accent)) 24%, #ffffff) 0%, var(--color-parchment) 75%)`;

  const set = scene.startsWith("western") ? "western" : scene.startsWith("ocean") ? "ocean" : null;
  if (set) {
    return (
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ background: tint(10) }}>
        <defs>{scatter(set, `${id}a`)}</defs>
        <rect width="100%" height="100%" fill={`url(#${id}a)`} />
      </svg>
    );
  }

  const land = place === "band" && BANDS[scene] ? scene : "ridges";
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ background: sky }}>
      {/* Ridges draw a sun of their own. */}
      {land !== "ridges" && (
        <span
          className="absolute right-[18%] top-[14%] h-[14%] w-auto rounded-full"
          style={{ aspectRatio: "1", background: tint(12) }}
        />
      )}
      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[58%] w-full">
        {BANDS[land]?.(id)}
      </svg>
    </div>
  );
}

/** Where along a quadratic curve a bulb hangs. */
function onCurve(t: number, p0: number[], p1: number[], p2: number[]) {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * p0[i] + 2 * u * t * p1[i] + t * t * p2[i]);
}

/** A tile of icons, scattered and tilted, for the patterns. */
function scatter(set: keyof typeof ICON_SETS, id: string) {
  const spots: [number, number, number][] = [
    [8, 8, -12],
    [104, 14, 10],
    [56, 62, 0],
    [150, 58, -8],
    [14, 112, 8],
    [96, 118, -14],
    [150, 150, 12],
    [48, 160, -6],
  ];
  return (
    <pattern id={id} width="200" height="200" patternUnits="userSpaceOnUse">
      {ICON_SETS[set].map((icon, i) => (
        <path
          key={icon}
          d={ICONS[icon]}
          transform={`translate(${spots[i][0]} ${spots[i][1]}) rotate(${spots[i][2]} 18 18) scale(0.75)`}
          fill="none"
          stroke="var(--site-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </pattern>
  );
}

/** A row of tiles, one icon each, alternating colour like a quilt. */
function tiles(set: keyof typeof ICON_SETS, id: string) {
  const cells = [tint(28), "var(--color-card)", tint(55), "var(--color-parchment)"];
  return (
    <svg className="block h-[120px] w-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="240" height="120" patternUnits="userSpaceOnUse">
          {ICON_SETS[set].map((icon, i) => {
            const x = (i % 4) * 60;
            const y = Math.floor(i / 4) * 60;
            return (
              <g key={icon}>
                <rect x={x} y={y} width="60" height="60" style={fill(cells[(i + Math.floor(i / 4)) % 4])} />
                <path
                  d={ICONS[icon]}
                  transform={`translate(${x + 10} ${y + 10}) scale(0.83)`}
                  fill="none"
                  stroke="var(--color-ink)"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Icons behind the names, fading out towards the middle so the names stay clear. */
function iconBackdrop(set: keyof typeof ICON_SETS, id: string) {
  const mask = "radial-gradient(ellipse 50% 44% at 50% 50%, transparent 55%, #000 100%)";
  return (
    <svg
      className="site-art pointer-events-none absolute inset-0 h-full w-full opacity-25 sm:opacity-40"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      aria-hidden="true"
    >
      <defs>{scatter(set, id)}</defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

const SNOW = "color-mix(in srgb, #ffffff 86%, var(--site-accent))";
/** Snow lying on the ground, faintly tinted by the theme. */
const snowfield = (pct: number) => `color-mix(in srgb, var(--site-accent-2, var(--site-accent)) ${pct}%, #ffffff)`;
const MIST = "color-mix(in srgb, #ffffff 55%, var(--color-parchment))";

/** A soft band of mist: clear above, thickest just above its foot, clear again below. */
function mistGradient(id: string) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={MIST} stopOpacity="0" />
      <stop offset="0.7" stopColor={MIST} stopOpacity="0.8" />
      <stop offset="1" stopColor={MIST} stopOpacity="0" />
    </linearGradient>
  );
}

/** A mountain with a ragged ridge, a shadowed face and, if `snow`, a cap. */
function peak(rnd: Rnd, cx: number, base: number, h: number, w: number, lit: string, dark: string, snow = 0.3) {
  const m = mountain(rnd, cx, base, h, w, snow);
  return (
    <g key={`${cx}-${h}`}>
      <path d={m.outline} style={fill(lit)} />
      {m.snow && <path d={m.snow} style={fill(SNOW)} />}
      <path d={m.shadow} style={fill(dark)} opacity="0.55" />
    </g>
  );
}

/** Thick round-capped saguaros, sized to their height. */
function cacti(rnd: Rnd, list: [number, number, number][], color: string) {
  return list.map(([x, base, h]) => (
    <path
      key={x}
      d={saguaro(x, base, h, rnd)}
      fill="none"
      stroke={color}
      strokeWidth={h * 0.13}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ));
}

const wave = (y: number, amp: number, len: number, phase = 0) => (x: number) =>
  y + amp * Math.sin(x / len + phase) + amp * 0.5 * Math.sin(x / (len * 0.37) + phase * 2);

/**
 * Pines in stands with clearings between: hazy small trees on the far hills,
 * stands in the middle distance, and two tall stands framing the meadow in
 * front. With `snowy`, snow on the ground and along the boughs.
 */
function forest(id: string, snowy: boolean) {
  const rnd = seeded(7);
  const far = wave(150, 10, 170);
  const mid = wave(192, 8, 140, 1);
  const near = wave(238, 5, 120, 2);
  const lips: string[] = [];
  const snow = snowy ? lips : undefined;
  const farTrees = grove(rnd, 0, 300, far, 12, 26, 9) + grove(rnd, 380, 520, far, 10, 20, 10) + grove(rnd, 640, 1200, far, 12, 28, 9);
  const midTrees =
    grove(rnd, -20, 260, mid, 26, 64, 15, snow) + grove(rnd, 470, 610, mid, 20, 44, 16, snow) + grove(rnd, 820, 1220, mid, 28, 70, 15, snow);
  const backStands = grove(rnd, 120, 380, near, 50, 120, 26, snow) + grove(rnd, 860, 1120, near, 50, 130, 26, snow);
  const frontStands = grove(rnd, 160, 330, near, 70, 190, 38, snow) + grove(rnd, 910, 1060, near, 80, 210, 40, snow);
  return (
    <>
      <defs>{mistGradient(`${id}m`)}</defs>
      <path d="M0 120C180 92 330 104 470 86S760 70 900 96S1100 92 1200 80V260H0Z" style={fill(snowy ? snowfield(16) : tint2(14))} />
      <path d={ground(far)} style={fill(snowy ? snowfield(24) : tint2(24))} />
      <path d={farTrees} style={fill(tint2(36))} />
      <rect y="118" width="1200" height="80" fill={`url(#${id}m)`} />
      <path d={ground(mid)} style={fill(snowy ? snowfield(12) : tint(30))} />
      <path d={midTrees} style={fill(tint(46))} />
      <rect y="176" width="1200" height="60" fill={`url(#${id}m)`} opacity="0.7" />
      <path d={ground(near)} style={fill(snowy ? snowfield(6) : tint(56))} />
      <path d={backStands} style={fill(tint(76))} />
      <path d={frontStands} style={fill(shade(62))} />
      {snowy && <path d={lips.join("")} style={fill(SNOW)} />}
    </>
  );
}

type Draw = Partial<Record<SceneId, (id: string) => ReactNode>>;

const BANDS: Draw = {
  mountains: (id: string) => {
    const rnd = seeded(3);
    const foot = wave(198, 7, 150);
    const near = wave(240, 5, 130, 1);
    return (
      <>
        <defs>{mistGradient(`${id}m`)}</defs>
        <path d={range(rnd, 150, 70)} style={fill(tint2(16))} />
        {peak(rnd, 330, 210, 175, 240, tint(34), tint(60), 0.32)}
        {peak(rnd, 880, 210, 200, 270, tint(34), tint(60), 0.3)}
        {peak(rnd, 610, 210, 120, 180, tint(26), tint(48), 0.28)}
        <rect y="140" width="1200" height="80" fill={`url(#${id}m)`} />
        <path d={ground(foot)} style={fill(tint(38))} />
        <path d={grove(rnd, -20, 420, foot, 18, 46, 13) + grove(rnd, 740, 1220, foot, 20, 50, 13)} style={fill(tint(54))} />
        <path d={ground(near)} style={fill(tint(60))} />
        <path d={grove(rnd, 110, 360, near, 40, 100, 24) + grove(rnd, 880, 1130, near, 40, 110, 24)} style={fill(tint(78))} />
        <path d={grove(rnd, 170, 320, near, 60, 150, 36) + grove(rnd, 930, 1080, near, 70, 165, 38)} style={fill(shade(62))} />
      </>
    );
  },
  ridges: () => (
    <>
      <circle cx="760" cy="120" r="110" style={fill(tint2(10))} opacity="0.7" />
      <circle cx="760" cy="120" r="56" style={fill("color-mix(in srgb, #ffffff 70%, var(--color-parchment))")} />
      <path d="M0 150C150 110 300 120 420 100S700 60 850 110S1050 120 1200 90V260H0Z" style={fill(tint2(20))} />
      <path d="M0 175C200 140 350 160 500 135S800 120 950 150S1100 140 1200 130V260H0Z" style={fill(tint(26))} />
      <path d="M0 200C180 170 380 190 560 168S860 165 1020 185S1140 175 1200 170V260H0Z" style={fill(tint(42))} />
      <path d="M0 222C220 200 420 215 620 198S920 205 1200 200V260H0Z" style={fill(tint(62))} />
      <path d="M0 245C260 228 520 240 760 232S1060 236 1200 230V260H0Z" style={fill(tint(88))} />
    </>
  ),
  lake: (id: string) => {
    const rnd = seeded(5);
    const shore = 152;
    const far = range(rnd, 128, 46, shore);
    const peaks = [peak(rnd, 440, shore, 118, 190, tint(34), tint(60), 0.3), peak(rnd, 800, shore, 138, 220, tint(34), tint(60), 0.3)];
    const trees = grove(rnd, -10, 380, () => shore, 10, 34, 9) + grove(rnd, 560, 690, () => shore, 8, 24, 9) + grove(rnd, 880, 1210, () => shore, 12, 36, 9);
    const bankL = (x: number) => 214 + 0.0009 * (x - 0) ** 2;
    const bankR = (x: number) => 214 + 0.0009 * (1200 - x) ** 2;
    const above = (
      <>
        <path d={far} style={fill(tint2(16))} />
        {peaks}
        <path d={trees} style={fill(tint(50))} />
      </>
    );
    return (
      <>
        <defs>
          {mistGradient(`${id}m`)}
          <clipPath id={`${id}w`}>
            <rect y={shore} width="1200" height={260 - shore} />
          </clipPath>
        </defs>
        {above}
        <rect y={shore} width="1200" height={260 - shore} style={fill(tint(24))} />
        <g clipPath={`url(#${id}w)`} transform={`translate(0 ${shore * 2}) scale(1 -1)`} opacity="0.3">
          {above}
        </g>
        <rect y="110" width="1200" height="50" fill={`url(#${id}m)`} />
        <g stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round">
          <path d="M330 176H430M640 190H790M260 206H330M880 214H960M520 226H620M700 240H760" />
        </g>
        <path d={ground(bankL, -10, 330)} style={fill(tint(58))} />
        <path d={ground(bankR, 870, 1210)} style={fill(tint(58))} />
        <path d={grove(rnd, 0, 270, bankL, 60, 150, 30) + grove(rnd, 930, 1200, bankR, 60, 160, 30)} style={fill(shade(62))} />
      </>
    );
  },
  meadow: () => {
    const rnd = seeded(9);
    const hills = wave(172, 9, 200);
    const pasture = wave(198, 5, 180, 1);
    const near = wave(236, 4, 150, 2);
    const posts: number[] = [];
    for (let x = 10 + rnd() * 30; x < 1200; x += 62 + rnd() * 20) posts.push(x);
    const rail = (dy: number) => posts.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)} ${(near(x) + dy).toFixed(1)}`).join("");
    return (
      <>
        <path d={range(rnd, 150, 60)} style={fill(tint2(16))} />
        {peak(rnd, 280, 168, 70, 150, tint(26), tint(44), 0.22)}
        {peak(rnd, 960, 168, 86, 190, tint(26), tint(44), 0.22)}
        <path d={ground(hills)} style={fill(tint(34))} />
        <path d={grove(rnd, -20, 330, hills, 16, 44, 12) + grove(rnd, 880, 1220, hills, 16, 48, 12)} style={fill(tint(52))} />
        <path d={ground(pasture)} style={fill(tint(44))} />
        {/* A gambrel-roofed barn and its silo, just right of centre so a phone still shows them. */}
        <path d={roundTree(612, pasture(612) + 2, 64, rnd) + roundTree(838, pasture(838) + 2, 52, rnd)} style={fill(tint(64))} />
        <rect x="770" y="140" width="26" height="62" style={fill(tint(64))} />
        <path d="M770 141A13 11 0 0 1 796 141Z" style={fill(tint(76))} />
        <path d="M646 204V164L661 142L705 126L749 142L764 164V204Z" style={fill("var(--site-accent)")} />
        <path d="M646 164L661 142L705 126L749 142L764 164" fill="none" stroke="var(--color-parchment)" strokeWidth="3" strokeLinejoin="round" />
        <rect x="696" y="146" width="18" height="14" style={fill("var(--color-parchment)")} />
        <path d="M684 204V172H726V204M684 172L726 204M726 172L684 204" fill="none" stroke="var(--color-parchment)" strokeWidth="2.5" />
        <path d={ground(near)} style={fill(tint(56))} />
        {/* Split-rail fence following the ground. */}
        <g fill="none" stroke={shade(42)} strokeLinecap="round" strokeLinejoin="round">
          <path d={posts.map((x) => `M${x.toFixed(1)} ${(near(x) + 22).toFixed(1)}V${(near(x) - 20).toFixed(1)}`).join("")} strokeWidth="5" />
          <path d={rail(-14) + rail(2)} strokeWidth="3.5" />
        </g>
      </>
    );
  },
  hills: (id: string) => {
    const rnd = seeded(23);
    const far = wave(122, 14, 210);
    const mid = wave(160, 11, 180, 2);
    const near = wave(196, 6, 240);
    const road = Array.from({ length: 10 }, (_, i) => 720 + i * 26);
    return (
      <>
        <defs>
          <clipPath id={`${id}f`}>
            <path d={ground(near)} />
          </clipPath>
        </defs>
        <path d={ground(far)} style={fill(tint2(18))} />
        <path d={ground(mid)} style={fill(tint(30))} />
        {/* A farmhouse on the hill and cypresses lining the road up to it. */}
        <path d="M262 160V138H318V160Z M328 160V128H350V160Z" style={fill("color-mix(in srgb, #ffffff 60%, var(--color-parchment))")} />
        <path d="M256 140L290 126L324 140Z M324 130L339 120L354 130Z" style={fill(tint2(60))} />
        <path
          d={road.map((x) => cypress(x, mid(x) + 3, 34 + rnd() * 12, rnd)).join("") + [150, 176, 198].map((x) => cypress(x, mid(x) + 3, 40 + rnd() * 14, rnd)).join("")}
          style={fill(tint(56))}
        />
        <path d={ground(near)} style={fill(tint(46))} />
        {/* Vine rows curving down the near slope from the crest. */}
        <g clipPath={`url(#${id}f)`} fill="none" strokeLinecap="round">
          {Array.from({ length: 29 }, (_, i) => {
            const k = i - 14;
            const d = `M${620 + k * 6} 186Q${620 + k * 44} 222 ${620 + k * 120} 300`;
            return (
              <g key={k}>
                <path d={d} stroke={tint(60)} strokeWidth="1.5" />
                <path d={d} stroke={shade(48)} strokeWidth="5" strokeDasharray="1 7" />
              </g>
            );
          })}
        </g>
        <path
          d={[
            [96, 150],
            [136, 112],
            [214, 124],
            [988, 132],
            [1066, 116],
            [1110, 158],
          ]
            .map(([x, h]) => cypress(x, 262, h, rnd))
            .join("")}
          style={fill(shade(60))}
        />
      </>
    );
  },
  waves: () => (
    <>
      <path d="M0 70C150 30 300 110 450 70S750 30 900 70 1150 110 1200 70V260H0Z" style={fill(tint(18))} />
      <path d="M0 115C120 85 240 145 380 115S640 80 800 115 1060 145 1200 110V260H0Z" style={fill(tint(35))} />
      <path d="M0 160C160 125 300 195 460 160S760 125 920 160 1110 190 1200 155V260H0Z" style={fill(tint(58))} />
      <path d="M0 205C140 175 280 235 440 205S720 173 880 207 1100 235 1200 200V260H0Z" style={fill(tint(80))} />
      <path d="M0 240C170 220 320 262 480 240S780 216 940 242 1120 258 1200 238V260H0Z" style={fill(shade(70))} />
    </>
  ),
  palms: () => {
    const rnd = seeded(13);
    const sand = wave(208, 5, 170);
    const dune = wave(238, 6, 140, 1);
    return (
      <>
        <circle cx="820" cy="118" r="44" style={fill(tint2(16))} />
        <rect y="148" width="1200" height="70" style={fill(tint(30))} />
        <rect y="148" width="1200" height="3" style={fill(tint(40))} />
        <g stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round">
          <path d="M760 162H880M790 172H850M420 168H520M600 184H700M180 178H250" />
        </g>
        <path d={ground(wave(204, 2, 60))} style={fill("color-mix(in srgb, #ffffff 75%, var(--color-parchment))")} />
        <path d={ground(sand)} style={fill(tint2(26))} />
        <path d={palmTree(370, sand(370) + 2, 92, 22, rnd) + palmTree(880, sand(880) + 2, 80, -18, rnd)} style={fill(tint(56))} />
        <path d={ground(dune)} style={fill(tint2(40))} />
        <path
          d={
            palmTree(250, dune(250) + 2, 190, 44, rnd) +
            palmTree(300, dune(300) + 2, 136, -34, rnd) +
            palmTree(950, dune(950) + 2, 200, -52, rnd) +
            palmTree(1010, dune(1010) + 2, 128, 26, rnd)
          }
          style={fill(shade(58))}
        />
      </>
    );
  },
  pines: (id: string) => forest(id, false),
  snowforest: (id: string) => forest(id, true),
  frontier: (id: string) => {
    const rnd = seeded(17);
    const far = wave(176, 3, 200);
    const mid = wave(204, 5, 90);
    const near = wave(234, 4, 120);
    const midButtes = butte(rnd, 300, 470, 118, 206) + butte(rnd, 1050, 1190, 138, 206);
    const scrub = Array.from({ length: 26 }, () => {
      const x = rnd() * 1200;
      const r = 3 + rnd() * 6;
      return `M${(x - r).toFixed(1)} ${(near(x) + 10 + rnd() * 16).toFixed(1)}a${r} ${r * 0.7} 0 1 1 ${2 * r} 0Z`;
    }).join("");
    return (
      <>
        <defs>
          <clipPath id={`${id}b`}>
            <path d={midButtes} />
          </clipPath>
        </defs>
        <circle cx="900" cy="78" r="34" style={fill(tint2(16))} />
        <path d={butte(rnd, 60, 250, 106, 178) + butte(rnd, 690, 760, 128, 178) + butte(rnd, 860, 1060, 94, 178)} style={fill(tint2(26))} />
        <path d={ground(far)} style={fill(tint2(26))} />
        <path d={midButtes} style={fill(tint(40))} />
        <g clipPath={`url(#${id}b)`} stroke={tint(28)} strokeWidth="3">
          <path d="M0 138H1200M0 151H1200M0 166H1200M0 184H1200" />
        </g>
        <path d={ground(mid)} style={fill(tint(48))} />
        <path d={ground(near)} style={fill(tint(64))} />
        <path d={scrub} style={fill(tint(78))} />
        {cacti(rnd, [[180, 238, 78], [760, 236, 104], [1010, 238, 64]], shade(55))}
      </>
    );
  },
  sunset: () => {
    const rnd = seeded(19);
    const d1 = wave(180, 10, 160, 1);
    const d2 = wave(208, 9, 190);
    const d3 = wave(240, 6, 150, 2);
    return (
      <>
        <circle cx="600" cy="186" r="170" style={fill(tint(8))} />
        <circle cx="600" cy="186" r="112" style={fill(tint(58))} />
        <path d="M480 150H720V154H480ZM480 164H720V169H480ZM480 177H720V183H480Z" style={fill("var(--color-parchment)")} />
        <path d={ground(d1)} style={fill(tint2(30))} />
        <path d={ground(d2)} style={fill(tint(44))} />
        {cacti(rnd, [[240, d2(240) + 4, 58], [930, d2(930) + 4, 72]], tint(66))}
        <path d={ground(d3)} style={fill(tint(64))} />
      </>
    );
  },
  skyline: (id: string) => {
    const rnd = seeded(29);
    const back = skyline(rnd, -20, 1220, 214, 30, 100);
    const mid = skyline(rnd, -20, 1220, 232, 40, 140);
    const front = skyline(rnd, -20, 1220, 244, 20, 80, true);
    return (
      <>
        <defs>{mistGradient(`${id}m`)}</defs>
        <path d={back.d} style={fill(tint2(22))} />
        <rect y="150" width="1200" height="70" fill={`url(#${id}m)`} />
        <path d={mid.d} style={fill(tint(38))} />
        <path d={front.d} style={fill(tint(62))} />
        <path d={front.lit} style={fill("color-mix(in srgb, #ffffff 70%, var(--site-accent-2, var(--site-accent)))")} opacity="0.85" />
        <rect y="244" width="1200" height="16" style={fill(tint(30))} />
        <g stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round">
          <path d="M120 250H200M380 254H470M640 250H700M860 254H960M1060 250H1120" />
        </g>
      </>
    );
  },
  wildflowers: () => {
    const rnd = seeded(31);
    const far = wave(142, 12, 230);
    const mid = wave(182, 9, 200, 1);
    const near = wave(214, 6, 160);
    const farTrees = [...Array.from({ length: 12 }, (_, i) => 10 + i * 30 + rnd() * 14), ...Array.from({ length: 14 }, (_, i) => 720 + i * 34 + rnd() * 14)]
      .map((x) => roundTree(x, far(x) + 3, 16 + rnd() * 14, rnd))
      .join("");
    const meadow = wildflowers(rnd, -10, 1210, near, 420);
    return (
      <>
        <path d={ground(far)} style={fill(tint2(16))} />
        <path d={farTrees} style={fill(tint2(30))} />
        <path d={ground(mid)} style={fill(tint(28))} />
        <path d={roundTree(840, mid(840) + 4, 116, rnd) + roundTree(910, mid(910) + 4, 60, rnd)} style={fill(shade(60))} />
        <path d={ground(near)} style={fill(tint(44))} />
        <path d={meadow.blades} fill="none" stroke={tint(64)} strokeWidth="1.6" strokeLinecap="round" />
        <path d={meadow.heads[0]} style={fill("color-mix(in srgb, #ffffff 85%, var(--color-parchment))")} />
        <path d={meadow.heads[1]} style={fill(tint2(60))} />
        <path d={meadow.heads[2]} style={fill("var(--site-accent)")} />
      </>
    );
  },
  coast: () => {
    const rnd = seeded(37);
    const cliffTop = wave(124, 4, 90);
    const grassTop = (x: number) => cliffTop(x) - 2;
    // The headland: grassy top running out to a cliff that drops to the sea.
    const edge = 470;
    const top = Array.from({ length: 25 }, (_, i): [number, number] => [-10 + i * 20, cliffTop(-10 + i * 20)]);
    const headland = `M-10 260${top.map(([x, y]) => `L${x} ${y.toFixed(1)}`).join("")}L${edge} ${cliffTop(edge) + 8}L${edge + 16} 170L${edge + 6} 200L${edge + 34} 230L${edge + 50} 260Z`;
    return (
      <>
        <rect y="150" width="1200" height="110" style={fill(tint(26))} />
        <rect y="150" width="1200" height="3" style={fill(tint(36))} />
        <path d="M980 150C1020 136 1080 134 1120 140S1180 146 1210 142V151H980Z" style={fill(tint2(26))} />
        <g stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round">
          <path d="M640 172H760M840 190H960M600 210H680M760 230H900M1000 214H1100M560 246H640" />
        </g>
        <path d={headland} style={fill(tint(56))} />
        <path
          d={`M-10 ${grassTop(-10)}${top.map(([x]) => `L${x} ${grassTop(x).toFixed(1)}`).join("")}L${edge} ${cliffTop(edge) + 8}L${edge} ${cliffTop(edge) + 18}${top
            .slice()
            .reverse()
            .map(([x]) => `L${x} ${(cliffTop(x) + 12 + rnd() * 6).toFixed(1)}`)
            .join("")}Z`}
          style={fill(tint2(40))}
        />
        <g stroke={tint(70)} strokeWidth="2" fill="none" opacity="0.6">
          <path d={`M${edge - 40} 150L${edge - 10} 200M${edge - 80} 170L${edge - 50} 230M${edge - 140} 160L${edge - 120} 210`} />
        </g>
        <path d="M480 256C500 246 520 250 540 244M520 230C534 226 548 228 560 224" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="2.5" strokeLinecap="round" />
        {/* The lighthouse and its keeper's cottage. */}
        <path d="M290 126V108H334V126Z" style={fill("color-mix(in srgb, #ffffff 70%, var(--color-parchment))")} />
        <path d="M284 110L312 96L340 110Z" style={fill(shade(55))} />
        <path d="M241 126L245 62H261L265 126Z" style={fill("color-mix(in srgb, #ffffff 80%, var(--color-parchment))")} />
        <path d="M242.5 104L243.5 90H262.5L263.5 104ZM244.3 78L244.9 68H261.1L261.7 78Z" style={fill("var(--site-accent)")} />
        <rect x="240" y="58" width="26" height="5" style={fill(shade(55))} />
        <rect x="246" y="46" width="14" height="12" style={fill(tint2(30))} />
        <path d="M243 47L253 36L263 47Z" style={fill(shade(55))} />
        <path d="M546 260L560 228L578 222L590 236L604 260Z M612 260L620 244L632 246L640 260Z" style={fill(tint(46))} />
      </>
    );
  },
};

const STRIPS: Draw = {
  rope: (id: string) => (
    <svg className="my-3 block h-5 w-full" aria-hidden="true">
      <defs>
        <pattern id={`${id}r`} width="13" height="20" patternUnits="userSpaceOnUse">
          <ellipse cx="6.5" cy="10" rx="8.5" ry="4.2" transform="rotate(-38 6.5 10)" style={fill(tint(55))} stroke={shade(35)} strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}r)`} />
    </svg>
  ),
  lights: (id: string) => {
    const p0 = [0, 6];
    const p1 = [110, 64];
    const p2 = [220, 6];
    return (
      <svg className="block h-[72px] w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}g`}>
            <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
          </radialGradient>
          <pattern id={`${id}l`} width="220" height="72" patternUnits="userSpaceOnUse">
            <path d="M0 6Q110 64 220 6" fill="none" stroke="var(--color-ink)" strokeOpacity="0.55" strokeWidth="1.4" />
            {[0.14, 0.38, 0.62, 0.86].map((t) => {
              const [x, y] = onCurve(t, p0, p1, p2);
              return (
                <g key={t}>
                  <circle cx={x} cy={y + 9} r="15" fill={`url(#${id}g)`} />
                  <path d={`M${x} ${y}v4`} stroke="var(--color-ink)" strokeOpacity="0.6" strokeWidth="3" />
                  <ellipse cx={x} cy={y + 9} rx="4.5" ry="6" fill="#ffd27a" />
                </g>
              );
            })}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}l)`} />
      </svg>
    );
  },
  shoreline: (id: string) => (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="block h-[84px] w-full sm:h-[120px]" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(78)} />
          <stop offset="1" stopColor={tint(38)} />
        </linearGradient>
      </defs>
      <path d="M0 0H1200V86C1100 98 1000 80 900 92S700 104 600 86S400 70 300 88S100 100 0 84Z" style={fill(tint(10))} />
      <path d="M0 0H1200V74C1100 90 1000 66 880 80S690 96 590 76S400 60 290 78S100 92 0 72Z" fill={`url(#${id}s)`} />
      <path d="M0 72C100 92 200 82 290 78S480 60 590 76S760 96 880 80S1100 90 1200 74" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
      <path d="M0 60C120 74 220 66 300 64S500 50 600 62S780 80 900 68S1100 76 1200 62" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" />
    </svg>
  ),
  "western-tiles": (id: string) => tiles("western", `${id}t`),
  "ocean-tiles": (id: string) => tiles("ocean", `${id}t`),
  garland: () => (
    <div className="flex flex-col">
      <div
        className="h-6"
        style={{
          background:
            "radial-gradient(circle, #f2b134 9px, transparent 10px) 0 0/24px 24px repeat-x, radial-gradient(circle, #e0661f 9px, transparent 10px) 12px 0/24px 24px repeat-x",
        }}
      />
      {/* Strands hanging from it, longer towards the ends. */}
      <div className="flex justify-between px-[3%]">
        {[64, 44, 28, 18, 28, 44, 64].map((h, i) => (
          <span
            key={i}
            className="w-3.5"
            style={{
              height: h,
              background: `radial-gradient(circle, ${i % 2 ? "#e0661f" : "#f2b134"} 6px, transparent 7px) 0 0/14px 14px repeat-y`,
            }}
          />
        ))}
      </div>
    </div>
  ),
  papel: () => (
    <div className="flex justify-center gap-1 overflow-hidden border-t-2 border-ink/70 pt-1">
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          className="relative h-14 w-12 shrink-0 sm:h-16 sm:w-14"
          style={{
            background: ["#e0457b", "#f28c28", "#12a39a", "#f5c518", "#7a5ad0"][
              i % 5
            ],
            clipPath:
              "polygon(0 0,100% 0,100% 82%,85% 100%,70% 82%,50% 100%,30% 82%,15% 100%,0 82%)",
          }}
        >
          <span
            className="absolute inset-x-2 bottom-4 top-2"
            style={{
              background:
                "radial-gradient(circle, var(--color-parchment) 2.5px, transparent 3px) 0 0/11px 11px",
            }}
          />
        </span>
      ))}
    </div>
  ),
  stars: (id: string) => (
    <svg className="block h-14 w-full sm:h-16" aria-hidden="true">
      <defs>
        <pattern
          id={`${id}s`}
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
          y="8"
        >
          <g fill="none" stroke={tint(55)} strokeWidth="1">
            <rect x="14" y="14" width="20" height="20" />
            <rect
              x="14"
              y="14"
              width="20"
              height="20"
              transform="rotate(45 24 24)"
            />
            <circle cx="24" cy="24" r="3" />
            <path d="M0 0l10 10M48 0L38 10M0 48l10-10M48 48L38 38" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" style={fill(shade(85))} />
      <rect width="100%" height="100%" fill={`url(#${id}s)`} />
    </svg>
  ),
  gingham: () => (
    <div
      className="h-10"
      style={{
        backgroundColor: "var(--color-card)",
        backgroundImage: `linear-gradient(90deg, ${tint(40)} 50%, transparent 50%), linear-gradient(${tint(40)} 50%, transparent 50%)`,
        backgroundSize: "22px 22px",
        backgroundBlendMode: "multiply",
      }}
    />
  ),
  stripes: () => (
    <div
      className="h-16"
      style={{
        background:
          "repeating-linear-gradient(180deg, var(--site-accent) 0 10px, var(--color-parchment) 10px 20px)",
      }}
    />
  ),
};

const SURROUNDS: Draw = {
  // A wavy, scalloped border: rows of half-rings along each edge.
  scallop: () => {
    const ring = (at: string) =>
      `radial-gradient(circle at ${at}, transparent 8px, var(--site-accent) 8.5px, var(--site-accent) 10.5px, transparent 11px)`;
    const edge = "pointer-events-none absolute";
    return (
      <>
        <span className={`${edge} inset-x-6 top-4 h-[11px]`} style={{ background: `${ring("11px 11px")} 0 0/22px 22px repeat-x` }} />
        <span className={`${edge} inset-x-6 bottom-4 h-[11px]`} style={{ background: `${ring("11px 0")} 0 0/22px 22px repeat-x` }} />
        <span className={`${edge} inset-y-6 left-4 w-[11px]`} style={{ background: `${ring("11px 11px")} 0 0/22px 22px repeat-y` }} />
        <span className={`${edge} inset-y-6 right-4 w-[11px]`} style={{ background: `${ring("0 11px")} 0 0/22px 22px repeat-y` }} />
      </>
    );
  },
  "western-pattern": (id: string) => iconBackdrop("western", `${id}w`),
  "ocean-pattern": (id: string) => iconBackdrop("ocean", `${id}o`),
  drape: () => {
    const fabric = "color-mix(in srgb, var(--color-card) 65%, #ffffff)";
    const line = "color-mix(in srgb, var(--color-ink) 14%, transparent)";
    const side = (mirror: boolean) => (
      <svg
        viewBox="0 0 100 400"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute top-0 h-full w-14 sm:w-28 ${mirror ? "right-0 -scale-x-100" : "left-0"}`}
        aria-hidden="true"
      >
        <path d="M0 0H92C62 120 72 250 40 320C58 350 70 380 62 400H0Z" fill={fabric} stroke={line} />
        <path d="M30 0C30 110 34 220 22 320M60 0C50 110 52 220 34 320" fill="none" stroke={line} />
        <rect x="18" y="314" width="40" height="8" rx="4" fill="var(--site-accent)" />
      </svg>
    );
    return (
      <>
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 h-[110px] w-full sm:h-[170px]"
          aria-hidden="true"
        >
          <path d="M0 0H1200V30C1000 170 800 170 600 40C400 170 200 170 0 30Z" fill={fabric} stroke={line} />
          <path d="M60 36C250 150 400 140 560 50M140 30C290 120 420 112 560 38M1140 36C950 150 800 140 640 50M1060 30C910 120 780 112 640 38" fill="none" stroke={line} />
        </svg>
        {side(false)}
        {side(true)}
      </>
    );
  },
  clouds: () => {
    const cloud =
      "M6 30h60c8 0 10-10 4-14-2-8-12-8-16-2-4-10-20-10-22 2-6-6-16-2-14 6-8 0-12 8-12 8z M34 22c2-4 8-4 10 0M50 20c2-3 6-3 8 0";
    return (
      <>
        {[
          "left-[3%] top-3 w-16 sm:left-[4%] sm:top-8 sm:w-40",
          "right-[3%] top-6 w-14 sm:right-[4%] sm:top-24 sm:w-36 -scale-x-100",
          "bottom-3 left-[6%] w-12 sm:bottom-10 sm:left-[10%] sm:w-28 -scale-x-100",
          "bottom-4 right-[5%] w-16 sm:bottom-16 sm:right-[8%] sm:w-40",
        ].map((c) => (
          <svg
            key={c}
            viewBox="0 0 80 40"
            className={`site-art pointer-events-none absolute ${c}`}
            aria-hidden="true"
          >
            <path
              d={cloud}
              fill="none"
              stroke="var(--site-accent)"
              strokeOpacity="0.55"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ))}
      </>
    );
  },
  groovy: () => {
    const rings = (colors: string[]) =>
      colors.map((c, i) => `inset 0 0 0 ${(i + 1) * 22}px ${c}`).join(",");
    return (
      <>
        <span
          className="site-art pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full sm:-bottom-24 sm:-left-24 sm:h-80 sm:w-80"
          style={{
            boxShadow: rings([
              "var(--site-accent)",
              tint(60),
              tint(35),
              tint(18),
            ]),
          }}
        />
        <span
          className="site-art pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full sm:-right-20 sm:-top-20 sm:h-64 sm:w-64"
          style={{
            boxShadow: rings([tint(35), "var(--site-accent)", tint(60)]),
          }}
        />
      </>
    );
  },
  frame: () => (
    <>
      <span className="pointer-events-none absolute inset-3 border border-[var(--site-accent)] sm:inset-5" />
      <span className="pointer-events-none absolute inset-[18px] border border-[color-mix(in_srgb,var(--site-accent)_55%,transparent)] sm:inset-7" />
      {[
        "left-2 top-2",
        "right-2 top-2",
        "bottom-2 left-2",
        "bottom-2 right-2",
      ].map((c) => (
        <span
          key={c}
          className={`pointer-events-none absolute h-3 w-3 rotate-45 bg-[var(--site-accent)] sm:h-4 sm:w-4 ${c}`}
        />
      ))}
    </>
  ),
};

/**
 * A scene's picker tile in the editor (Background › Scene): a small top of
 * the page with lines for the names, the scene drawn where it would sit.
 * Drawn three times larger and scaled down, so strips and frames keep their
 * proportions. Takes its colours from the CSS variables on the tile.
 */
export function SceneThumb({ scene }: { scene: SceneId }) {
  const id = useId().replace(/:/g, "");
  const place = sceneById(scene).place;
  return (
    <span aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ background: "var(--color-parchment)" }}>
      <span className="absolute left-0 top-0 flex h-[300%] w-[300%] origin-top-left scale-[0.3333] flex-col">
        {place === "strip" && STRIPS[scene]?.(id)}
        <span className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden">
          {place === "surround" && SURROUNDS[scene]?.(id)}
          <span className="relative block h-5 w-36 rounded-full" style={{ background: "var(--color-ink)" }} />
          <span className="relative block h-3 w-20 rounded-full opacity-50" style={{ background: "var(--color-ink)" }} />
        </span>
        {place === "band" && (
          <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" className="block h-[55%] w-full shrink-0">
            {BANDS[scene]?.(id)}
          </svg>
        )}
      </span>
    </span>
  );
}
