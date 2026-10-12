"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function remainingParts(targetDate: string): Parts | null {
  const target = new Date(`${targetDate}T00:00:00`).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const TONE = {
  // Over a photo, with the hero's scrim behind it.
  light: {
    number: "text-white",
    caption: "text-white/70",
    divider: "bg-white/25",
    fallback: "text-white/85",
  },
  // On parchment or a card.
  dark: {
    number: "text-forest",
    caption: "text-ink/45",
    divider: "bg-hairline",
    fallback: "text-brass",
  },
} as const;

function Unit({
  value,
  label,
  tone,
  pad,
  size,
  flip = true,
  board = false,
}: {
  value: number;
  label: string;
  tone: keyof typeof TONE;
  pad: boolean;
  size: "sm" | "lg";
  /** Flip the number over when it changes (off for seconds -- too busy). */
  flip?: boolean;
  /** Each number on its own split-flap tile, flipping every change. */
  board?: boolean;
}) {
  const t = TONE[tone];
  if (board) {
    const tile = tone === "light" ? "bg-black/45 text-white" : "bg-ink text-parchment";
    return (
      <div className={size === "lg" ? "px-1.5 sm:px-2.5" : "px-1 sm:px-2"}>
        <div
          className={`relative overflow-hidden rounded-md shadow-sm [perspective:400px] ${tile} ${
            size === "lg" ? "min-w-[3.6rem] px-2.5 py-2 sm:min-w-[4.4rem]" : "min-w-[3rem] px-2 py-1.5"
          }`}
        >
          <p
            key={value}
            className={`wren-flip text-center font-mono-numbers tabular-nums leading-none ${
              size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {pad ? String(value).padStart(2, "0") : value}
          </p>
          {/* The split across the middle of the tile. */}
          <span className="absolute inset-x-0 top-1/2 h-px bg-black/35" aria-hidden="true" />
        </div>
        <p className={`mt-2 text-center font-mono-numbers text-[9px] uppercase tracking-[0.2em] ${t.caption}`}>
          {label}
        </p>
      </div>
    );
  }
  return (
    <div className={`relative ${size === "lg" ? "px-4 sm:px-6" : "px-3 sm:px-4"}`}>
      <span
        className={`absolute left-0 top-[14%] h-[58%] w-px first:hidden ${t.divider}`}
        aria-hidden="true"
      />
      {/* tabular-nums keeps the row from twitching sideways every second */}
      {/* Keyed on the value so each change remounts it and replays the flip. */}
      <p
        key={flip ? value : undefined}
        className={`font-mono-numbers tabular-nums leading-none ${flip ? "wren-flip" : ""} ${t.number} ${
          size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
        }`}
      >
        {pad ? String(value).padStart(2, "0") : value}
      </p>
      <p
        className={`mt-2 font-mono-numbers text-[9px] uppercase tracking-[0.2em] ${t.caption}`}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * Ticks every second on the client only -- the server (and the client's
 * first paint, before the effect below runs) always shows fallbackLabel,
 * so hydration never mismatches on the current time.
 */
export function CountdownTimer({
  targetDate,
  fallbackLabel,
  className,
  tone = "dark",
  size = "sm",
  live = true,
  flipboard = false,
}: {
  targetDate: string;
  fallbackLabel: string;
  className?: string;
  tone?: keyof typeof TONE;
  size?: "sm" | "lg";
  /** false: just the fallback label ("120 days to go"), no ticking clock. */
  live?: boolean;
  /** Split-flap tiles instead of plain numbers. */
  flipboard?: boolean;
}) {
  const [ticked, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    if (!live) return;
    function tick() {
      setParts(remainingParts(targetDate));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, live]);

  const parts = live ? ticked : null;

  // Before the first tick, and after the wedding has passed, there are no
  // units to count -- show the plain label instead of four zeroes.
  if (!parts) {
    return (
      <p
        className={`font-mono-numbers text-sm uppercase tracking-[0.2em] ${TONE[tone].fallback} ${className ?? ""}`}
      >
        {fallbackLabel}
      </p>
    );
  }

  return (
    <div className={`flex justify-center ${className ?? ""}`}>
      <Unit value={parts.days} label="Days" tone={tone} pad={false} size={size} board={flipboard} />
      <Unit value={parts.hours} label="Hours" tone={tone} pad size={size} board={flipboard} />
      <Unit value={parts.minutes} label="Minutes" tone={tone} pad size={size} board={flipboard} />
      <Unit value={parts.seconds} label="Seconds" tone={tone} pad size={size} flip={false} board={flipboard} />
    </div>
  );
}
