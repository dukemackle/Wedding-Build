"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { useSiteDesign } from "@/components/guest-site-theme";
import { resolveDesign, sceneById, type SceneId } from "@/lib/site-design";
import { ICONS, ICON_SETS } from "@/lib/scene-icons";

/**
 * The drawn setting at the top of the guest site (Style tab › Scene): a
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

function pinesPattern(id: string, color: string, w = 26, h = 70): ReactNode {
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      <path
        d={`M${w / 2} 4L4 30h5L2 50h7L0 ${h}h${w}L${w - 9} 50h7L${w - 9} 30h5z`}
        style={fill(color)}
      />
    </pattern>
  );
}


const SNOW = "color-mix(in srgb, #ffffff 86%, var(--site-accent))";

/** A peak with a lit face, a shaded face and a cap of snow. */
function peak(cx: number, base: number, h: number, w: number, lit: string, dark: string, key?: string) {
  const top = base - h;
  const snow = [
    [cx, top],
    [cx + w * 0.3, top + h * 0.3],
    [cx + w * 0.17, top + h * 0.25],
    [cx + w * 0.06, top + h * 0.34],
    [cx - w * 0.06, top + h * 0.24],
    [cx - w * 0.17, top + h * 0.32],
    [cx - w * 0.3, top + h * 0.3],
  ]
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(0)} ${y.toFixed(0)}`)
    .join(" ");
  return (
    <g key={key}>
      <path d={`M${cx - w} ${base}L${cx} ${top}L${cx + w} ${base}Z`} style={fill(lit)} />
      <path
        d={`M${cx} ${top}L${cx + w} ${base}L${cx + w * 0.3} ${base}L${cx + w * 0.08} ${top + h * 0.5}Z`}
        style={fill(dark)}
      />
      <path d={`${snow}Z`} style={fill(SNOW)} />
    </g>
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

type Draw = Partial<Record<SceneId, (id: string) => ReactNode>>;

const BANDS: Draw = {
  mountains: (id: string) => (
    <>
      <defs>{pinesPattern(`${id}p`, shade(55))}</defs>
      <path d="M0 150C200 110 420 130 600 100S1000 110 1200 120V260H0Z" style={fill(tint(14))} />
      {peak(300, 232, 180, 230, tint(36), tint(54), "a")}
      {peak(860, 232, 205, 260, tint(36), tint(54), "b")}
      {peak(580, 232, 125, 170, tint(28), tint(44), "c")}
      <rect y="190" width="1200" height="70" fill={`url(#${id}p)`} />
      <path d="M0 236C300 222 900 226 1200 234V260H0Z" style={fill(tint(80))} />
      <path d="M560 260C590 248 650 246 640 238S600 230 620 226" fill="none" stroke={tint(20)} strokeWidth="10" strokeLinecap="round" />
    </>
  ),
  ridges: () => (
    <>
      <circle cx="760" cy="120" r="110" style={fill(tint(6))} opacity="0.7" />
      <circle cx="760" cy="120" r="56" style={fill("color-mix(in srgb, #ffffff 70%, var(--site-accent))")} />
      <path d="M0 150C150 110 300 120 420 100S700 60 850 110S1050 120 1200 90V260H0Z" style={fill(tint(14))} />
      <path d="M0 175C200 140 350 160 500 135S800 120 950 150S1100 140 1200 130V260H0Z" style={fill(tint(26))} />
      <path d="M0 200C180 170 380 190 560 168S860 165 1020 185S1140 175 1200 170V260H0Z" style={fill(tint(42))} />
      <path d="M0 222C220 200 420 215 620 198S920 205 1200 200V260H0Z" style={fill(tint(62))} />
      <path d="M0 245C260 228 520 240 760 232S1060 236 1200 230V260H0Z" style={fill(tint(88))} />
    </>
  ),
  lake: (id: string) => {
    const peaks = (
      <>
        <path d="M0 130C250 100 500 115 700 95S1000 105 1200 110V156H0Z" style={fill(tint(16))} />
        {peak(420, 156, 125, 190, tint(36), tint(54), "a")}
        {peak(800, 156, 145, 220, tint(36), tint(54), "b")}
      </>
    );
    const reeds = [40, 58, 70, 96, 1080, 1100, 1118, 1140, 1166];
    return (
      <>
        <defs>
          {pinesPattern(`${id}p`, shade(55), 16, 50)}
          <clipPath id={`${id}w`}>
            <rect y="156" width="1200" height="104" />
          </clipPath>
        </defs>
        {peaks}
        <rect y="156" width="1200" height="104" style={fill(tint(24))} />
        <g clipPath={`url(#${id}w)`} transform="translate(0 312) scale(1 -1)" opacity="0.35">
          {peaks}
        </g>
        <rect y="132" width="1200" height="26" fill={`url(#${id}p)`} />
        <g stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round">
          <path d="M300 190H420M640 206H800M200 226H280M880 230H990M500 244H600" />
        </g>
        <g fill="none" stroke={shade(55)} strokeWidth="3" strokeLinecap="round">
          {reeds.map((x, i) => (
            <path key={x} d={`M${x} 262C${x + (i % 2 ? 6 : -4)} 240 ${x + (i % 2 ? 2 : -8)} 226 ${x + (i % 2 ? 8 : -2)} ${206 + (i % 3) * 8}`} />
          ))}
        </g>
      </>
    );
  },
  meadow: (id: string) => (
    <>
      <defs>{pinesPattern(`${id}p`, shade(58), 20, 56)}</defs>
      {peak(300, 170, 92, 140, tint(30), tint(46), "a")}
      {peak(470, 170, 112, 150, tint(30), tint(46), "b")}
      {peak(900, 170, 128, 200, tint(30), tint(46), "c")}
      <rect y="138" width="1200" height="56" fill={`url(#${id}p)`} />
      <path d="M0 186C400 176 800 182 1200 184V260H0Z" style={fill(tint(34))} />
      {/* A barn and its silo, right of centre. */}
      <rect x="1000" y="150" width="22" height="54" rx="11" style={fill(tint(60))} />
      <path d="M900 204V164L920 146H970L990 164V204Z" style={fill("var(--site-accent)")} />
      <path d="M930 204V178H960V204M930 178L960 204M960 178L930 204" fill="none" stroke="var(--color-parchment)" strokeWidth="2.5" />
      {/* Split-rail fence along the front. */}
      <g stroke={shade(40)} strokeWidth="5" strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M${i * 80 + 20} 216V258`} />
        ))}
        <path d="M0 226H1200M0 242H1200" strokeWidth="4" />
      </g>
    </>
  ),
  hills: (id: string) => (
    <>
      <defs>
        <clipPath id={`${id}f`}>
          <path d="M0 150C300 140 900 140 1200 150V260H0Z" />
        </clipPath>
      </defs>
      <path d="M0 120C160 60 320 70 460 110S760 40 940 90S1120 80 1200 100V260H0Z" style={fill(tint(24))} />
      <path d="M0 150C220 110 420 120 620 140S1000 110 1200 140V260H0Z" style={fill(tint(40))} />
      <path d="M0 150C300 140 900 140 1200 150V260H0Z" style={fill(tint(62))} />
      {/* Vine rows running to a point on the horizon. */}
      <g clipPath={`url(#${id}f)`} stroke={shade(45)} strokeWidth="6" strokeLinecap="round" strokeDasharray="2 9">
        {Array.from({ length: 31 }, (_, i) => (
          <path key={i} d={`M600 140L${-1200 + i * 120} 290`} />
        ))}
      </g>
    </>
  ),
  waves: () => (
    <>
      <path
        d="M0 70C150 30 300 110 450 70S750 30 900 70 1150 110 1200 70V260H0Z"
        style={fill(tint(18))}
      />
      <path
        d="M0 115C120 85 240 145 380 115S640 80 800 115 1060 145 1200 110V260H0Z"
        style={fill(tint(35))}
      />
      <path
        d="M0 160C160 125 300 195 460 160S760 125 920 160 1110 190 1200 155V260H0Z"
        style={fill(tint(58))}
      />
      <path
        d="M0 205C140 175 280 235 440 205S720 173 880 207 1100 235 1200 200V260H0Z"
        style={fill(tint(80))}
      />
      <path
        d="M0 240C170 220 320 262 480 240S780 216 940 242 1120 258 1200 238V260H0Z"
        style={fill(shade(70))}
      />
    </>
  ),
  pines: (id: string) => (
    <>
      <defs>
        {pinesPattern(`${id}a`, tint(40), 34, 92)}
        {pinesPattern(`${id}b`, tint(90), 44, 120)}
      </defs>
      <path
        d="M0 200C300 180 600 196 900 186S1100 190 1200 196V260H0Z"
        style={fill(tint(10))}
      />
      <rect x="10" y="118" width="1200" height="92" fill={`url(#${id}a)`} />
      <rect x="-12" y="140" width="1224" height="120" fill={`url(#${id}b)`} />
    </>
  ),
  frontier: () => (
    <>
      <circle cx="900" cy="90" r="40" style={fill(tint(14))} />
      <path
        d="M0 170H120L150 120H300L330 170H520L560 140H640L660 170H860L900 100H1040L1080 170H1200V260H0Z"
        style={fill(tint(30))}
      />
      <path
        d="M0 210H240L270 180H380L410 210H700L730 170H820L850 210H1200V260H0Z"
        style={fill(tint(55))}
      />
      <path d="M0 236H1200V260H0Z" style={fill(tint(85))} />
      {[180, 760, 1010].map((x, i) => (
        <path
          key={x}
          transform={`translate(${x} ${i === 1 ? 150 : 166}) scale(${i === 1 ? 0.9 : 0.7})`}
          d="M14 92V14a6 6 0 0 1 12 0v78zM14 54H6a6 6 0 0 1-6-6V32a4 4 0 0 1 8 0v14h6zM26 46h6V26a4 4 0 0 1 8 0v20a6 6 0 0 1-6 6h-8z"
          style={fill(tint(85))}
        />
      ))}
    </>
  ),
  sunset: () => (
    <>
      {[
        [300, 22],
        [240, 45],
        [180, 70],
        [120, 100],
      ].map(([r, pct]) => (
        <path
          key={r}
          d={`M${600 - r} 260A${r} ${r} 0 0 1 ${600 + r} 260Z`}
          style={fill(pct === 100 ? "var(--site-accent)" : tint(pct))}
        />
      ))}
      <path d="M0 250H1200V260H0Z" style={fill(shade(80))} />
    </>
  ),
};

const STRIPS: Draw = {
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
          "left-[4%] top-8 w-28 sm:w-40",
          "right-[4%] top-24 w-24 sm:w-36 -scale-x-100",
          "bottom-10 left-[10%] w-20 sm:w-28 -scale-x-100",
          "bottom-16 right-[8%] w-28 sm:w-40",
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
          className="site-art pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full sm:h-80 sm:w-80"
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
          className="site-art pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full sm:h-64 sm:w-64"
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
