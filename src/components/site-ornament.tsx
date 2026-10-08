import type { ReactNode } from "react";
import { WORD_ORNAMENTS, type OrnamentId } from "@/lib/site-design";

/**
 * The couple's initials in a frame, drawn in the accent colour above their
 * names (Style tab › Monogram). Plain SVG so it takes any palette, stays sharp
 * at any size, and its lines can draw themselves in when the page opens
 * (`.orn-draw` in globals.css; still for guests who ask for less motion).
 */
export function SiteOrnament({
  kind,
  first,
  second,
  size = "sm",
  tone = "dark",
}: {
  kind: OrnamentId;
  first: string;
  second: string;
  size?: "sm" | "lg";
  /** "light" over a photo: the frame in a pale gold rather than the accent. */
  tone?: "light" | "dark";
}) {
  const a = first.trim()[0]?.toUpperCase() ?? "";
  const b = second.trim()[0]?.toUpperCase() ?? "";
  const color = tone === "light" ? "text-[#e9c97a]" : "text-[var(--site-accent)]";
  if (WORD_ORNAMENTS.includes(kind)) return <WordOrnament kind={kind} size={size} color={color} />;
  if (kind === "none" || (!a && !b)) return null;

  if (kind === "rule") {
    const rule = tone === "light" ? "bg-white/45" : "bg-hairline";
    return (
      <div className={`flex items-center justify-center gap-4 ${size === "lg" ? "scale-150" : ""}`}>
        <span className={`h-px w-10 sm:w-14 ${rule}`} aria-hidden="true" />
        <span className={`whitespace-nowrap font-display text-xl tracking-[0.22em] ${color}`}>
          {[a, b].filter(Boolean).join(" · ")}
        </span>
        <span className={`h-px w-10 sm:w-14 ${rule}`} aria-hidden="true" />
      </div>
    );
  }

  const px = size === "lg" ? "h-[200px] w-[200px] sm:h-[240px] sm:w-[240px]" : "h-[112px] w-[112px] sm:h-[128px] sm:w-[128px]";
  return (
    <svg
      viewBox="0 0 200 200"
      className={`site-ornament mx-auto block ${px} ${color}`}
      role="img"
      aria-label={`${a} and ${b}`}
    >
      {DRAWINGS[kind as keyof typeof DRAWINGS](a, b)}
    </svg>
  );
}

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A path that draws itself in: pathLength 1 lets one dash cover any length. */
function Draw({ d, width = 1.4, delay = 0 }: { d: string; width?: number; delay?: number }) {
  return (
    <path
      d={d}
      {...LINE}
      strokeWidth={width}
      pathLength={1}
      className="orn-draw"
      style={{ animationDelay: `calc(${delay}s * var(--motion-speed, 1))` }}
    />
  );
}

function Letters({ children, size = 54, y = 100 }: { children: ReactNode; size?: number; y?: number }) {
  return (
    <text
      x="100"
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="currentColor"
      className="orn-fade"
      style={{ fontFamily: "var(--font-names, var(--font-display))", fontSize: size }}
    >
      {children}
    </text>
  );
}

const pt = (cx: number, cy: number, r: number, deg: number) => {
  const t = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
};

const f = (n: number) => n.toFixed(1);

/** A pointed leaf, base at the origin, tip straight up. */
function leafPath(len: number) {
  const w = len * 0.34;
  return `M0 0 C${f(w)} ${f(-len * 0.3)} ${f(w)} ${f(-len * 0.72)} 0 ${f(-len)} C${f(-w)} ${f(-len * 0.72)} ${f(-w)} ${f(-len * 0.3)} 0 0 Z`;
}

/**
 * One side of a laurel: a stem curving up around the initials, leaves in
 * pairs either side pointing the way it grows, shrinking towards the tip.
 */
function laurelSide(mirror: boolean) {
  const cx = 100;
  const cy = 102;
  const r = 72;
  const from = 112;
  const to = 244;
  const [x0, y0] = pt(cx, cy, r, from);
  const [x1, y1] = pt(cx, cy, r, to);
  const stem = `M${f(x0)} ${f(y0)} A${r} ${r} 0 0 1 ${f(x1)} ${f(y1)}`;
  const leaves: ReactNode[] = [];
  const pairs = 8;
  for (let i = 0; i < pairs; i++) {
    const deg = from + 6 + ((to - from - 10) * i) / (pairs - 1);
    const [x, y] = pt(cx, cy, r, deg);
    const len = 19 - i * 1.1;
    // Along the stem is deg + 180 in the leaf's frame; each leaf leans off it.
    for (const lean of [-34, 30]) {
      leaves.push(
        <path
          key={`${i}${lean}`}
          d={leafPath(lean < 0 ? len : len * 0.9)}
          fill="currentColor"
          className="orn-fade"
          transform={`translate(${f(x)} ${f(y)}) rotate(${f(deg + 180 + lean)})`}
          style={{ animationDelay: `calc(${0.3 + i * 0.09}s * var(--motion-speed, 1))` }}
        />,
      );
    }
  }
  const [tx, ty] = pt(cx, cy, r, to);
  leaves.push(
    <path
      key="tip"
      d={leafPath(12)}
      fill="currentColor"
      className="orn-fade"
      transform={`translate(${f(tx)} ${f(ty)}) rotate(${f(to + 180)})`}
      style={{ animationDelay: `calc(${0.3 + pairs * 0.09}s * var(--motion-speed, 1))` }}
    />,
  );
  return (
    <g transform={mirror ? "translate(200 0) scale(-1 1)" : undefined}>
      <Draw d={stem} width={1.3} />
      {leaves}
    </g>
  );
}

/**
 * A set phrase in its own script, loaded on its own (only this character,
 * for the Chinese) so a theme's fonts don't have to carry it. Screen readers
 * hear the meaning rather than the characters.
 */
const XI_FONT = "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&text=%E5%9B%8D&display=swap";
const AMIRI_FONT = "https://fonts.googleapis.com/css2?family=Amiri&display=swap";

function WordOrnament({ kind, size, color }: { kind: OrnamentId; size: "sm" | "lg"; color: string }) {
  if (kind === "xi") {
    return (
      <>
        <link
          rel="stylesheet"
          href={XI_FONT}
          precedence="default"
        />
        <p
          lang="zh"
          aria-label="Double happiness"
          className={`orn-fade leading-none ${color} ${size === "lg" ? "text-[150px]" : "text-[84px] sm:text-[96px]"}`}
          style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 600 }}
        >
          囍
        </p>
      </>
    );
  }
  return (
    <>
      <link rel="stylesheet" href={AMIRI_FONT} precedence="default" />
      <div className="flex flex-col items-center gap-1">
        <p
          lang="ar"
          dir="rtl"
          className={`orn-fade leading-[1.6] ${color} ${size === "lg" ? "text-[44px]" : "text-[28px] sm:text-[34px]"}`}
          style={{ fontFamily: "'Amiri', serif" }}
        >
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="text-[13px] italic opacity-75">In the name of God, the Most Gracious, the Most Merciful</p>
      </div>
    </>
  );
}

const DRAWINGS: Record<Exclude<OrnamentId, "none" | "rule" | "bismillah" | "xi">, (a: string, b: string) => ReactNode> = {
  compass: (a, b) => (
    <>
      <circle cx="100" cy="100" r="86" {...LINE} strokeWidth={1.2} className="orn-fade" />
      <circle cx="100" cy="100" r="78" {...LINE} strokeWidth={0.7} strokeDasharray="1 4" className="orn-fade" />
      {[0, 90, 180, 270].map((deg) => (
        <path key={deg} d="M100 6L109 56H91Z" fill="currentColor" transform={`rotate(${deg} 100 100)`} className="orn-fade" />
      ))}
      {[45, 135, 225, 315].map((deg) => (
        <path key={deg} d="M100 26L105 58H95Z" fill="currentColor" opacity={0.6} transform={`rotate(${deg} 100 100)`} className="orn-fade" />
      ))}
      <circle cx="100" cy="100" r="42" {...LINE} fill="var(--color-parchment)" strokeWidth={1.4} className="orn-fade" />
      <Letters size={34}>
        {a}
        <tspan fontSize={20} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  wheel: (a, b) => (
    <>
      <Draw d="M100 40 A60 60 0 1 1 99.9 40" width={5} />
      <Draw d="M100 52 A48 48 0 1 1 99.9 52" width={1.2} delay={0.2} />
      {Array.from({ length: 8 }, (_, i) => {
        const [x1, y1] = pt(100, 100, 62, i * 45 - 90);
        const [x2, y2] = pt(100, 100, 86, i * 45 - 90);
        const [cx, cy] = pt(100, 100, 91, i * 45 - 90);
        return (
          <g key={i}>
            <Draw d={`M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}`} width={4} delay={0.3 + i * 0.05} />
            <circle cx={cx} cy={cy} r="5.5" fill="currentColor" className="orn-fade" />
          </g>
        );
      })}
      <Letters size={36}>
        {a}
        <tspan fontSize={20} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  chandelier: (a, b) => (
    <>
      <Draw d="M100 4 L100 44" width={1.2} />
      <ellipse cx="100" cy="52" rx="16" ry="6" {...LINE} strokeWidth={1.4} className="orn-fade" />
      <Draw
        d="M100 58 C80 80 50 84 44 68 M100 58 C120 80 150 84 156 68 M100 58 C90 76 76 78 72 62 M100 58 C110 76 124 78 128 62"
        width={1.4}
        delay={0.2}
      />
      <Draw d="M38 68 H50 M150 68 H162 M66 62 H78 M122 62 H134 M44 68 V54 M156 68 V54 M72 62 V48 M128 62 V48" width={1.4} delay={0.4} />
      {[
        [44, 52],
        [156, 52],
        [72, 46],
        [128, 46],
      ].map(([x, y]) => (
        <path key={x} d={`M${x} ${y}c-3-4 0-8 0-11 0 3 3 7 0 11z`} fill="currentColor" className="orn-fade" />
      ))}
      <Draw d="M100 58 L100 96" width={0.8} delay={0.5} />
      <path d="M100 96 L104 102 L100 108 L96 102 Z" fill="currentColor" className="orn-fade" />
      <Letters size={40} y={150}>
        {a}
        <tspan fontSize={20} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  barndoor: (a, b) => (
    <>
      <Draw d="M28 16 H172" width={2.4} />
      <Draw d="M40 22 H160 V188 H40 Z" width={1.6} delay={0.1} />
      <Draw d="M50 32 H150 V178 H50 Z M50 108 H150" width={0.9} delay={0.3} />
      <Draw d="M50 108 L150 178 M150 108 L50 178" width={1.6} delay={0.5} />
      <Letters size={38} y={70}>
        {a}
        <tspan fontSize={20} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  lace: (a, b) => (
    <>
      <path d={laceEdge()} {...LINE} strokeWidth={1.4} className="orn-fade" />
      <circle cx="100" cy="100" r="74" {...LINE} strokeWidth={1.4} strokeDasharray="0.5 5" className="orn-fade" />
      {Array.from({ length: 24 }, (_, i) => {
        const [x, y] = pt(100, 100, 83, i * 15 + 7.5);
        return <circle key={i} cx={f(x)} cy={f(y)} r="1.6" fill="currentColor" className="orn-fade" />;
      })}
      <Draw d="M100 34 A66 66 0 1 1 99.9 34" width={0.9} delay={0.3} />
      <Letters size={40}>
        {a}
        <tspan fontSize={20} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  scroll: (a, b) => (
    <>
      <Draw d="M40 56 C40 44 46 38 58 38 H142 C154 38 160 44 160 56 V144 C160 156 154 162 142 162 H58 C46 162 40 156 40 144 Z" width={1.4} />
      <Draw d="M48 60 C48 50 52 46 62 46 H138 C148 46 152 50 152 60 V140 C152 150 148 154 138 154 H62 C52 154 48 150 48 140 Z" width={0.7} delay={0.2} />
      {[0, 90, 180, 270].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 100 100)`}>
          <Draw d="M40 56 C26 56 20 44 26 36 C32 28 44 32 42 40 C41 45 35 46 33 42" width={1.3} delay={0.4} />
          <Draw d="M58 38 C58 24 46 18 38 24" width={1.1} delay={0.5} />
        </g>
      ))}
      <Draw d="M78 38 C86 26 94 24 100 30 C106 24 114 26 122 38 M100 30 V22" width={1.1} delay={0.6} />
      <Draw d="M78 162 C86 174 94 176 100 170 C106 176 114 174 122 162 M100 170 V178" width={1.1} delay={0.6} />
      <Letters size={40}>
        {a}
        <tspan fontSize={20} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  oval: (a, b) => (
    <>
      <ellipse cx="100" cy="106" rx="60" ry="82" {...LINE} strokeWidth={1.4} className="orn-fade" />
      <ellipse cx="100" cy="106" rx="52" ry="74" {...LINE} strokeWidth={0.7} className="orn-fade" />
      {Array.from({ length: 36 }, (_, i) => {
        const t = (i * 10 * Math.PI) / 180;
        return <circle key={i} cx={f(100 + 56 * Math.cos(t))} cy={f(106 + 78 * Math.sin(t))} r="1.3" fill="currentColor" className="orn-fade" />;
      })}
      {/* A bow on top. */}
      <Draw d="M100 24 C88 14 76 16 78 24 C80 32 92 28 100 24 C108 28 120 32 122 24 C124 16 112 14 100 24 M100 24 L92 38 M100 24 L108 38" width={1.3} delay={0.4} />
      <Letters size={36} y={86}>
        {a}
      </Letters>
      <Letters size={18} y={110}>
        &amp;
      </Letters>
      <Letters size={36} y={134}>
        {b}
      </Letters>
    </>
  ),

  horseshoe: (a, b) => (
    <>
      {/* Open end up, for luck. */}
      <Draw d="M70 34 C40 52 30 96 46 132 C60 162 82 174 100 174 C118 174 140 162 154 132 C170 96 160 52 130 34" width={9} />
      {[
        [56, 56],
        [44, 86],
        [48, 118],
        [62, 146],
      ].map(([x, y]) => (
        <g key={y}>
          <circle cx={x} cy={y} r="2.2" fill="var(--color-parchment)" className="orn-fade" />
          <circle cx={200 - x} cy={y} r="2.2" fill="var(--color-parchment)" className="orn-fade" />
        </g>
      ))}
      <Letters size={42} y={100}>
        {a}
        <tspan fontSize={22} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  mountain: (a, b) => (
    <>
      <Draw d="M18 150 L74 70 L98 102 L128 56 L182 150 Z" />
      <Draw d="M112 80 L128 56 L144 80 L136 76 L128 84 L120 76 Z" width={1} delay={0.3} />
      <Draw d="M18 162 L182 162" width={0.8} delay={0.5} />
      <circle cx="156" cy="44" r="10" {...LINE} strokeWidth={1.2} className="orn-fade" />
      <Letters size={30} y={182}>
        {a}
        <tspan fontSize={22} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  anchor: (a, b) => (
    <>
      <Draw d="M100 34 L100 168" width={2} />
      <circle cx="100" cy="24" r="10" {...LINE} strokeWidth={2} className="orn-fade" />
      <Draw d="M74 58 L126 58" width={2} delay={0.2} />
      <Draw d="M44 128 C50 160 76 176 100 176 C124 176 150 160 156 128" width={2} delay={0.3} />
      <Draw d="M36 136 L44 124 L56 132 M164 136 L156 124 L144 132" width={2} delay={0.5} />
      <Letters size={36} y={104}>
        <tspan x="66">{a}</tspan>
        <tspan x="134">{b}</tspan>
      </Letters>
    </>
  ),

  mandala: (a, b) => (
    <>
      <circle cx="100" cy="100" r="92" {...LINE} strokeWidth={1.2} strokeDasharray="1 5" className="orn-fade" />
      {Array.from({ length: 16 }, (_, i) => (
        <path
          key={i}
          d="M100 12 C108 24 108 36 100 44 C92 36 92 24 100 12 Z"
          {...LINE}
          strokeWidth={1.1}
          transform={`rotate(${i * 22.5} 100 100)`}
          className="orn-fade"
          style={{ animationDelay: `calc(${i * 0.04}s * var(--motion-speed, 1))` }}
        />
      ))}
      <Draw d="M100 48 A52 52 0 1 1 99.9 48" width={1} delay={0.3} />
      <Letters size={40}>
        {a}
        <tspan fontSize={22} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  star: (a, b) => (
    <>
      <Draw d="M42 42 H158 V158 H42 Z" />
      <Draw d="M100 18 L182 100 L100 182 L18 100 Z" delay={0.2} />
      <Draw d="M100 34 L166 100 L100 166 L34 100 Z" width={0.7} delay={0.4} />
      <Letters size={42}>
        {a}
        <tspan fontSize={22} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  chuppah: (a, b) => (
    <>
      {/* A canopy on poles, the cloth swagged between them. */}
      <Draw d="M36 56 L36 190 M164 56 L164 190 M28 190 L44 190 M156 190 L172 190" width={1.6} />
      <Draw d="M24 56 C52 78 76 78 100 56 C124 78 148 78 176 56" width={1.6} delay={0.2} />
      <Draw d="M24 56 C30 38 46 30 62 30 L138 30 C154 30 170 38 176 56" width={1.6} delay={0.3} />
      <circle cx="36" cy="50" r="6" {...LINE} strokeWidth={1.2} className="orn-fade" />
      <circle cx="164" cy="50" r="6" {...LINE} strokeWidth={1.2} className="orn-fade" />
      <circle cx="100" cy="24" r="5" {...LINE} strokeWidth={1.2} className="orn-fade" />
      <Letters size={38} y={130}>
        {a}
        <tspan fontSize={22} dx={2} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={2} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  laurel: (a, b) => (
    <>
      {laurelSide(false)}
      {laurelSide(true)}
      <Letters size={46}>
        {a}
        <tspan fontSize={26} dx={3} dy={-2}>
          &amp;
        </tspan>
        <tspan dx={3} dy={2}>
          {b}
        </tspan>
      </Letters>
    </>
  ),

  crest: (a, b) => (
    <>
      {/* Frame: a cartouche with a scroll at each side. */}
      <Draw d="M100 22 C140 22 160 58 160 100 C160 142 140 178 100 178 C60 178 40 142 40 100 C40 58 60 22 100 22 Z" />
      <Draw d="M100 30 C134 30 152 62 152 100 C152 138 134 170 100 170 C66 170 48 138 48 100 C48 62 66 30 100 30 Z" width={0.8} delay={0.2} />
      {/* Crown flourish */}
      <Draw d="M86 22 C86 12 94 8 100 14 C106 8 114 12 114 22" delay={0.5} />
      <Draw d="M100 14 L100 4" delay={0.6} />
      <circle cx="100" cy="3" r="2.2" fill="currentColor" className="orn-fade" />
      <Draw d="M86 22 C78 18 72 20 70 26 M114 22 C122 18 128 20 130 26" width={1.1} delay={0.7} />
      {/* Side scrolls */}
      <Draw d="M40 100 C30 96 24 104 30 110 C34 114 40 110 37 105" width={1.2} delay={0.8} />
      <Draw d="M160 100 C170 96 176 104 170 110 C166 114 160 110 163 105" width={1.2} delay={0.8} />
      {/* Ribbon tail */}
      <Draw d="M84 178 C88 190 96 194 100 186 C104 194 112 190 116 178" width={1.2} delay={0.9} />
      <Draw d="M62 100 L72 100 M128 100 L138 100" width={0.8} delay={1} />
      <Letters size={40} y={74}>
        {a}
      </Letters>
      <Letters size={40} y={128}>
        {b}
      </Letters>
    </>
  ),

  ring: (a, b) => (
    <>
      <Draw d="M100 18 A82 82 0 1 1 99.9 18" />
      <Draw d="M100 26 A74 74 0 1 1 99.9 26" width={0.7} delay={0.25} />
      {[0, 90, 180, 270].map((deg) => {
        const [x, y] = pt(100, 100, 78, deg - 90);
        return <circle key={deg} cx={x} cy={y} r="2.6" fill="currentColor" className="orn-fade" />;
      })}
      <Draw d="M100 66 L100 134" width={0.8} delay={0.6} />
      <Letters size={48}>
        <tspan x="72">{a}</tspan>
        <tspan x="128">{b}</tspan>
      </Letters>
    </>
  ),

  arch: (a, b) => (
    <>
      <Draw d="M48 186 L48 92 A52 52 0 0 1 152 92 L152 186 Z" />
      <Draw d="M56 178 L56 93 A44 44 0 0 1 144 93 L144 178 Z" width={0.7} delay={0.25} />
      <path d="M100 22 L104 30 L100 38 L96 30 Z" fill="currentColor" className="orn-fade" />
      <Letters size={38} y={88}>
        {a}
      </Letters>
      <Letters size={18} y={118}>
        &amp;
      </Letters>
      <Letters size={38} y={148}>
        {b}
      </Letters>
    </>
  ),

  diamond: (a, b) => (
    <>
      <Draw d="M100 14 L186 100 L100 186 L14 100 Z" />
      <Draw d="M100 26 L174 100 L100 174 L26 100 Z" width={0.7} delay={0.25} />
      <path d="M100 92 L106 100 L100 108 L94 100 Z" fill="currentColor" className="orn-fade" />
      <Letters size={44}>
        <tspan x="70">{a}</tspan>
        <tspan x="130">{b}</tspan>
      </Letters>
    </>
  ),

  seal: (a, b) => (
    <>
      <path d={sealEdge()} fill="currentColor" className="orn-fade" />
      <circle
        cx="100"
        cy="100"
        r="56"
        fill="none"
        stroke="var(--site-on-accent)"
        strokeOpacity={0.55}
        strokeWidth={1.2}
        className="orn-fade"
      />
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--site-on-accent)"
        className="orn-fade"
        style={{ fontFamily: "var(--font-names, var(--font-display))", fontSize: 44 }}
      >
        {a}
        <tspan fontSize={24} dx={2}>
          &amp;
        </tspan>
        <tspan dx={2}>{b}</tspan>
      </text>
    </>
  ),
};

/** A scalloped lace edge: 24 small arcs around the circle. Fixed, so server and client agree. */
function laceEdge() {
  const parts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const [x0, y0] = pt(100, 100, 88, i * 15);
    const [cx, cy] = pt(100, 100, 98, i * 15 + 7.5);
    const [x1, y1] = pt(100, 100, 88, i * 15 + 15);
    parts.push(`${i === 0 ? `M${f(x0)} ${f(y0)}` : ""} Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`);
  }
  return `${parts.join(" ")} Z`;
}

/** A wax seal's soft, uneven edge: a circle whose radius wobbles. Fixed, so server and client agree. */
function sealEdge() {
  const points: string[] = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    const r = 79 + 3 * Math.sin(5 * t) + 2 * Math.sin(9 * t + 1) + 1.2 * Math.sin(17 * t + 2);
    const [x, y] = pt(100, 100, r, (360 * i) / n);
    points.push(`${i === 0 ? "M" : "L"}${f(x)} ${f(y)}`);
  }
  return `${points.join(" ")} Z`;
}
