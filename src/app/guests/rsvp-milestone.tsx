"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BirdCheer } from "@/components/bird-cheer";

const MILESTONES = [25, 50, 100, 150, 200, 250, 300];

type Piece = { dx: number; dy: number; spin: number; color: string; left: number };

/**
 * When the number of guests coming passes 25, 50, 100 and so on, Wren pops
 * up with confetti the next time the guest list is opened. The page isn't
 * live, so "passed" means "higher than the last milestone this browser
 * cheered", kept per wedding in localStorage so each one plays once.
 */
export function RsvpMilestone({ confirmed, weddingId }: { confirmed: number; weddingId: string }) {
  const [moment, setMoment] = useState<{ count: number; pieces: Piece[] } | null>(null);

  useEffect(() => {
    const reached = MILESTONES.filter((m) => confirmed >= m).pop();
    if (!reached) return;
    const key = `ydid-rsvp-milestone-${weddingId}`;
    try {
      if (Number(localStorage.getItem(key)) >= reached) return;
      localStorage.setItem(key, String(reached));
    } catch {
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours = ["#ffd301", "#00bffe", "#2243b6", "#fff12f", "#5ae4ff"];
    const pieces = reduced
      ? []
      : Array.from({ length: 50 }, (_, i) => ({
          dx: (Math.random() - 0.5) * 800,
          dy: 250 + Math.random() * 450,
          spin: (Math.random() - 0.5) * 900,
          color: colours[i % colours.length],
          left: 50 + (Math.random() - 0.5) * 20,
        }));
    // Reads storage, so it can only be decided after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoment({ count: reached, pieces });
  }, [confirmed, weddingId]);

  if (!moment) return null;
  return (
    <>
      <BirdCheer message={`${moment.count} guests are coming!`} wave />
      {moment.pieces.length > 0 &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
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
