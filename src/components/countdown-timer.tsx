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

// Ticks every second on the client only -- the server (and the client's
// first paint, before the effect below runs) always shows fallbackLabel,
// so hydration never mismatches on the current time.
export function CountdownTimer({
  targetDate,
  fallbackLabel,
  className,
}: {
  targetDate: string;
  fallbackLabel: string;
  className?: string;
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

  if (!parts) {
    return <span className={className}>{fallbackLabel}</span>;
  }

  return (
    <span className={className}>
      {parts.days}d {String(parts.hours).padStart(2, "0")}h{" "}
      {String(parts.minutes).padStart(2, "0")}m {String(parts.seconds).padStart(2, "0")}s to go
    </span>
  );
}
