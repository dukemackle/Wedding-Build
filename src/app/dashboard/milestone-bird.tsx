"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BirdCheer } from "@/components/bird-cheer";

const MILESTONES = new Set([100, 30, 7, 1]);

function daysLeft(weddingDate: string) {
  const target = new Date(`${weddingDate}T00:00:00`).getTime();
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
}

type Piece = {
  dx: number;
  dy: number;
  spin: number;
  color: string;
  left: number;
};

/**
 * On 100, 30, 7 and 1 days to go, the bird pops up with confetti the first
 * time the dashboard is opened that day. Worked out on the client (the
 * server doesn't know the couple's local date) and remembered per day in
 * localStorage so it doesn't replay on every visit.
 */
export function MilestoneBird({ weddingDate }: { weddingDate: string }) {
  const [moment, setMoment] = useState<{
    days: number;
    pieces: Piece[];
  } | null>(null);

  useEffect(() => {
    const days = daysLeft(weddingDate);
    if (!MILESTONES.has(days)) return;
    const key = `wren-milestone-${weddingDate}-${days}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: show it anyway, it's once per page load at worst.
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const colours = ["#e0a100", "#14203d", "#55acee", "#e0526b"];
    const pieces = reduced
      ? []
      : Array.from({ length: 60 }, (_, i) => ({
          dx: (Math.random() - 0.5) * 900,
          dy: 250 + Math.random() * 500,
          spin: (Math.random() - 0.5) * 900,
          color: colours[i % colours.length],
          left: 50 + (Math.random() - 0.5) * 20,
        }));
    // Reads the clock and storage, so it can only be decided after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoment({ days, pieces });
  }, [weddingDate]);

  if (!moment) return null;
  const message =
    moment.days === 1 ? "Tomorrow's the day!" : `${moment.days} days to go!`;
  return (
    <>
      <BirdCheer message={message} />
      {moment.pieces.length > 0 &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
            aria-hidden="true"
          >
            {moment.pieces.map((p, i) => (
              <span
                key={i}
                className="site-confetti absolute top-[18%] h-2.5 w-1.5 rounded-[1px]"
                style={
                  {
                    left: `${p.left}%`,
                    background: p.color,
                    "--dx": `${p.dx}px`,
                    "--dy": `${p.dy}px`,
                    "--spin": `${p.spin}deg`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
