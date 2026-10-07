"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { useSiteDesign } from "@/components/guest-site-theme";
import { resolveDesign, sceneById, type SceneId } from "@/lib/site-design";

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
        className="site-scene pointer-events-none block h-[clamp(96px,16vw,220px)] w-full"
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

type Draw = Partial<Record<SceneId, (id: string) => ReactNode>>;

const BANDS: Draw = {
  mountains: (id: string) => (
    <>
      <defs>{pinesPattern(`${id}p`, shade(55))}</defs>
      <circle cx="820" cy="70" r="46" style={fill(tint(14))} />
      <path
        d="M0 140L120 90 220 120 340 40 460 110 560 70 700 130 820 50 960 115 1080 75 1200 120V260H0Z"
        style={fill(tint(30))}
      />
      <path
        d="M0 175L150 112 262 162 400 98 520 170 640 120 780 180 900 108 1040 170 1200 125V260H0Z"
        style={fill(tint(58))}
      />
      <path
        d="M0 205L180 158 320 205 480 150 620 212 760 165 920 212 1080 170 1200 205V260H0Z"
        style={fill(tint(85))}
      />
      <rect y="200" width="1200" height="60" fill={`url(#${id}p)`} />
    </>
  ),
  hills: () => (
    <>
      <circle cx="300" cy="80" r="40" style={fill(tint(14))} />
      <path
        d="M0 150C200 90 360 100 560 140S960 90 1200 130V260H0Z"
        style={fill(tint(28))}
      />
      <path
        d="M0 190C240 140 420 150 640 185S1000 140 1200 175V260H0Z"
        style={fill(tint(55))}
      />
      <path
        d="M0 230C260 190 520 200 760 225S1060 200 1200 215V260H0Z"
        style={fill(tint(85))}
      />
      {/* Vine rows on the near hill. */}
      <g
        stroke={tint(30)}
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
        fill="none"
      >
        <path d={`M0 246C260 210 520 218 760 240S1060 218 1200 232`} />
        <path d={`M0 258C260 222 520 232 760 254S1060 232 1200 246`} />
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
