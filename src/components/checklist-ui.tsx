"use client";

import { createPortal } from "react-dom";

/**
 * The checklist's visual pieces, shared by the real page and the landing demo
 * so the two can't drift apart: the progress ring, the stage timeline, the
 * tick box with its sparkle, the urgency-coloured due chip and each stage's
 * drawn icon. Colours come from the 2026-09-28 palette (Gold, Lemon, Royal
 * blue, Sky, Aqua); motion lives in globals.css under "Checklist journey".
 */

export type StageState = "done" | "here" | "todo" | "own";

/** Gold arc that fills as tasks get ticked, with the percentage inside. */
export function ProgressRing({
  done,
  total,
  size = 104,
}: {
  done: number;
  total: number;
  size?: number;
}) {
  const stroke = size > 90 ? 10 : 8;
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% of your checklist done`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f1ea" strokeWidth={stroke} />
        <circle
          className="cl-ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#FFD301"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - (total > 0 ? done / total : 0))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ ["--cl-ring" as string]: c }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-display font-bold leading-none text-forest"
        style={{ fontSize: size * 0.31 }}
      >
        {pct}%
      </span>
    </div>
  );
}

/** A stage's dot on the timeline: gold tick, pulsing royal blue, or outline. */
export function StageNode({ state, num, size = 32 }: { state: StageState; num: string; size?: number }) {
  const look = {
    done: "bg-[#FFD301] text-forest",
    here: "cl-node-here bg-[#2243B6] text-white",
    todo: "border-2 border-[#d9d3c5] bg-card text-forest",
    own: "border-2 border-dashed border-[#5AE4FF] bg-card text-forest",
  }[state];
  return (
    <span
      aria-hidden="true"
      className={`relative z-[1] flex shrink-0 items-center justify-center rounded-full font-mono-numbers text-[13px] font-medium ${look}`}
      style={{ width: size, height: size }}
    >
      {state === "done" ? <TickMark className="h-[15px] w-[15px]" strokeWidth={3} /> : num}
    </span>
  );
}

/**
 * The line joining one node to the next. Gold once the stage is done, so the
 * timeline fills up behind you as you go.
 */
export function StageLine({ done, left = 15, top = 38 }: { done: boolean; left?: number; top?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -bottom-2.5 w-[3px] rounded-full ${done ? "bg-[#FFD301]" : "bg-hairline"}`}
      style={{ left, top }}
    />
  );
}

/** "You're here", royal blue with an aqua dot. */
export function HereBadge({ children = "You're here" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-[#2243B6] px-3 text-[12.5px] font-semibold tracking-[0.04em] text-white">
      <span className="h-[7px] w-[7px] rounded-full bg-[#5AE4FF]" />
      {children}
    </span>
  );
}

/**
 * The round tick box. Ticking fills it gold, draws the tick and throws six
 * little sparks; only a tick just made animates, not every done row on load.
 */
export function TaskTick({
  on,
  justTicked,
  onClick,
  disabled,
}: {
  on: boolean;
  justTicked: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const animate = on && justTicked;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={on ? "Mark as not done" : "Mark as done"}
      className={`relative mt-px flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        animate ? "cl-tick-pop " : ""
      }${on ? "border-[#FFD301] bg-[#FFD301] text-forest" : "border-forest bg-card hover:bg-[#FFF12F]"}`}
    >
      {on && (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3.2} aria-hidden="true">
          <path
            d="m5 13 4 4L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animate ? "wren-tick-draw" : undefined}
          />
        </svg>
      )}
      {animate &&
        ["s1", "s2", "s3", "s4", "s5", "s6"].map((s) => (
          <span key={s} aria-hidden="true" className={`cl-spark cl-${s}`} />
        ))}
    </button>
  );
}

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${dateStr}T00:00:00`).getTime() - today.getTime()) / 86400000);
}

function formatDue(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/**
 * Due date, coloured by how soon: red overdue, sky within 30 days, gold within
 * three months, outlined after that. Navy text on the light fills.
 */
export function DueChip({ date, completed }: { date: string; completed?: boolean }) {
  const days = daysUntil(date);
  const tone = completed
    ? "bg-[#f3f1ea] text-ink/65 font-medium"
    : days < 0
      ? "bg-red-50 text-red-800"
      : days <= 30
        ? "bg-[#00BFFE] text-forest"
        : days <= 90
          ? "bg-[#FFD301] text-forest"
          : "border-[1.5px] border-[#d9d3c5] bg-card text-ink/75 font-medium";
  return (
    <span
      className={`inline-flex h-[26px] items-center whitespace-nowrap rounded-full px-[11px] text-[13px] font-semibold ${tone}`}
    >
      {!completed && days < 0 ? "Overdue: " : "Due "}
      {formatDue(date)}
    </span>
  );
}

/** What the chip colours mean, under the list on wide screens. */
export function DueLegend() {
  const items = [
    ["bg-red-50 border border-red-200", "Overdue"],
    ["bg-[#00BFFE]", "Next 30 days"],
    ["bg-[#FFD301]", "Within 3 months"],
    ["border-[1.5px] border-[#d9d3c5] bg-card", "Later"],
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink/75">
      {items.map(([swatch, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${swatch}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

export function TickMark({ className = "", strokeWidth = 2.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

/** A drawn icon per stage, on a lemon tile. Own tasks get a pencil. */
export function StageIcon({ phase, size = 64 }: { phase: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    // A compass: where it all starts.
    foundation: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5z" />
      </>
    ),
    // A venue with a peaked roof and doors.
    venue: (
      <>
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
    // Two people.
    vendors: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" />
        <circle cx="16.5" cy="9" r="2.4" />
        <path d="M15.5 14.2c2.4.2 4.3 2 4.8 4.8" />
      </>
    ),
    // A hanger.
    look: (
      <>
        <path d="M12 5.5c-1.2 0-2 .8-2 1.8 0 1.2 1 1.5 2 2.3" />
        <path d="M12 9.6 3.6 15.8c-.7.5-.3 1.6.5 1.6h15.8c.8 0 1.2-1.1.5-1.6L12 9.6" />
      </>
    ),
    // An envelope.
    announce: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="m3.5 7 8.5 6.5L20.5 7" />
      </>
    ),
    // A padlock.
    lock: (
      <>
        <rect x="5" y="10.5" width="14" height="10" rx="2" />
        <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        <path d="M12 14.5v2.5" />
      </>
    ),
    // A clipboard with a tally.
    count: (
      <>
        <rect x="5" y="5" width="14" height="16" rx="2" />
        <path d="M9 3.5h6v3H9z" />
        <path d="M9 12h6M9 16h4" />
      </>
    ),
    // A calendar with the day ringed.
    week: (
      <>
        <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
        <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
        <circle cx="12" cy="15" r="2" />
      </>
    ),
    // A heart.
    after: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
    own: (
      <>
        <path d="M4 20h4L19 9l-4-4L4 16z" />
        <path d="m13.5 6.5 4 4" />
      </>
    ),
  };
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-[18px] bg-[#FFF12F] text-forest"
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.53}
        height={size * 0.53}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[phase] ?? paths.own}
      </svg>
    </span>
  );
}

/**
 * A short burst of palette confetti for finishing a whole stage. The pieces
 * are spread by a fixed formula rather than Math.random so render stays
 * pure; remount (new `key`) to fire again. Nothing under reduced motion.
 */
export function StageConfetti() {
  if (typeof document === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const colours = ["#ffd301", "#00bffe", "#2243b6", "#fff12f", "#5ae4ff"];
  const spread = (i: number, salt: number) => {
    const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className="site-confetti absolute top-[18%] h-2.5 w-1.5 rounded-[1px]"
          style={
            {
              left: `${50 + (spread(i, 1) - 0.5) * 20}%`,
              background: colours[i % colours.length],
              "--dx": `${(spread(i, 2) - 0.5) * 700}px`,
              "--dy": `${250 + spread(i, 3) * 400}px`,
              "--spin": `${(spread(i, 4) - 0.5) * 900}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
}
