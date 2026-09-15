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
}: {
  value: number;
  label: string;
  tone: keyof typeof TONE;
  pad: boolean;
  size: "sm" | "lg";
}) {
  const t = TONE[tone];
  return (
    <div className={`relative ${size === "lg" ? "px-4 sm:px-6" : "px-3 sm:px-4"}`}>
      <span
        className={`absolute left-0 top-[14%] h-[58%] w-px first:hidden ${t.divider}`}
        aria-hidden="true"
      />
      {/* tabular-nums keeps the row from twitching sideways every second */}
      <p
        className={`font-mono-numbers tabular-nums leading-none ${t.number} ${
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
}: {
  targetDate: string;
  fallbackLabel: string;
  className?: string;
  tone?: keyof typeof TONE;
  size?: "sm" | "lg";
}) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    function tick() {
      setParts(remainingParts(targetDate));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

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
      <Unit value={parts.days} label="Days" tone={tone} pad={false} size={size} />
      <Unit value={parts.hours} label="Hours" tone={tone} pad size={size} />
      <Unit value={parts.minutes} label="Minutes" tone={tone} pad size={size} />
      <Unit value={parts.seconds} label="Seconds" tone={tone} pad size={size} />
    </div>
  );
}
