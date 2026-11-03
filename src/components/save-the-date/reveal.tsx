"use client";

import { useState } from "react";
import { downloadIcs } from "@/lib/ics";
import { templateById } from "@/lib/save-the-date/templates";
import { fontById } from "@/lib/site-design";
import type { CardDoc } from "@/lib/save-the-date/types";
import type { ItineraryEvent } from "@/lib/supabase/types";
import { CardSvg } from "./card-svg";

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Mix a hex colour toward black (amount < 0) or white (amount > 0). */
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const to = amount < 0 ? 0 : 255;
  const a = Math.abs(amount);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (to - v) * a));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

type Stage = "closed" | "opening" | "lifting" | "open";

/**
 * What a guest sees: an envelope addressed to them, sealed with the couple's
 * initials. Opening it lifts the card out, then the envelope falls away and
 * the card settles, with Add to calendar and the website under it. Reduced
 * motion skips straight to the open card.
 */
export function Reveal({ doc, guest, siteHref, compact }: { doc: CardDoc; guest: string; siteHref: string; compact?: boolean }) {
  const t = templateById(doc.template);
  const palette = t.palettes.find((p) => p.id === doc.palette) ?? t.palettes[0];
  const pairing = t.pairings.find((p) => p.id === doc.fonts) ?? t.pairings[0];
  const dark = luminance(palette.paper) < 0.35;
  const envelope = dark ? shade(palette.paper, 0.08) : shade(palette.paper, -0.05);
  const inner = dark ? shade(palette.paper, -0.25) : shade(palette.paper, -0.14);
  const writing = dark ? palette.ink : palette.ink;
  const seal = palette.metal ? palette.metal[1] : palette.accent;
  const backdrop = dark ? shade(palette.paper, -0.35) : "#ebe5dc";
  const script = fontById(pairing.script)?.css ?? "serif";
  const caps = fontById(pairing.sans)?.css ?? "sans-serif";

  const [stage, setStage] = useState<Stage>("closed");

  const open = () => {
    if (stage !== "closed") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStage("open");
    setStage("opening");
    setTimeout(() => setStage("lifting"), 650);
    setTimeout(() => setStage("open"), 1650);
  };

  const c = doc.content;
  const initials = `${c.nameA.trim()[0] ?? ""}${c.nameB.trim()[0] ?? ""}`;
  const isOpen = stage === "open";
  const addToCalendar = () => {
    if (!c.date) return;
    downloadIcs({
      id: `save-the-date-${c.date}`,
      event_date: c.date,
      start_time: null,
      end_time: null,
      title: `${c.nameA} & ${c.nameB}'s wedding`,
      location: c.place || null,
      description: `Save the date! Details: ${new URL(siteHref, location.href).href}`,
    } as ItineraryEvent);
  };

  const w = compact ? "min(78%, 300px)" : "min(84vw, 470px, calc((100dvh - 250px) * 0.714))";

  return (
    <div
      className="std-reveal relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: `radial-gradient(120% 80% at 50% 30%, ${shade(backdrop, dark ? 0.06 : 0.35)}, ${backdrop})` }}
      data-stage={stage}
    >
      <p
        className="std-kicker mb-6 text-center text-[11px] uppercase tracking-[0.3em]"
        style={{ color: dark ? shade(palette.muted, 0) : "#6f6458", fontFamily: caps }}
      >
        {isOpen ? "Save the date" : `${c.nameA} & ${c.nameB} sent you something`}
      </p>

      <div className="relative" style={{ width: w, aspectRatio: "1000 / 1400" }}>
        {/* Back of the envelope, its liner showing once the flap lifts. */}
        <div className="std-env std-env-back absolute inset-0 rounded-[6px]" style={{ background: inner, boxShadow: "0 30px 60px -20px rgba(0,0,0,.35)" }}>
          <svg className="absolute inset-x-0 top-0 h-1/2 w-full" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden>
            <defs>
              <pattern id="liner" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" fill={inner} />
                <rect width="2.2" height="6" fill={palette.metal ? palette.metal[1] : palette.accent} opacity="0.55" />
              </pattern>
            </defs>
            <path d="M3 0H97V2L50 60L3 2Z" fill="url(#liner)" />
          </svg>
        </div>

        {/* The card, inside the envelope until it's lifted out. */}
        <button
          type="button"
          onClick={open}
          aria-label={isOpen ? "Your save the date" : "Open your save the date"}
          className="std-card absolute inset-[4%] block cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-[#2243B6]/40"
          disabled={isOpen}
        >
          <CardSvg doc={doc} className="h-full w-full rounded-[3px] shadow-[0_18px_40px_-12px_rgba(0,0,0,.45)]" />
        </button>

        {/* Front pocket: the side and bottom folds, addressed to the guest. */}
        <div className="std-env std-env-front pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0L50 86L100 0V140H0Z" fill={envelope} />
            <path d="M0 0L50 86L100 0" fill="none" stroke={shade(envelope, dark ? 0.12 : -0.12)} strokeWidth="0.3" />
            <path d="M0 140L44 96M100 140L56 96" stroke={shade(envelope, dark ? 0.1 : -0.08)} strokeWidth="0.3" />
          </svg>
          <div className="absolute inset-x-0 bottom-[11%] text-center" style={{ color: writing }}>
            <p style={{ fontFamily: script, fontSize: compact ? 26 : "clamp(28px, 7vw, 38px)", lineHeight: 1.1 }}>{guest}</p>
          </div>
        </div>

        {/* The flap, sealed with their initials. */}
        <div className="std-env std-flap pointer-events-none absolute inset-x-0 top-0 h-[66%]" style={{ transformOrigin: "50% 0" }}>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 92" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0H100V3L50 88L0 3Z" fill={shade(envelope, dark ? 0.05 : -0.025)} />
            <path d="M0 3L50 88L100 3" fill="none" stroke={shade(envelope, dark ? 0.14 : -0.14)} strokeWidth="0.3" />
          </svg>
          <div
            className="std-seal absolute left-1/2 top-[88%] flex aspect-square w-[19%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${shade(seal, 0.25)}, ${seal} 55%, ${shade(seal, -0.25)})`,
              boxShadow: "0 3px 8px rgba(0,0,0,.3), inset 0 0 0 3px rgba(255,255,255,.15)",
              color: dark ? palette.paper : "#fff",
              fontFamily: script,
              fontSize: compact ? 18 : "clamp(18px, 4.6vw, 26px)",
            }}
          >
            {initials}
          </div>
        </div>
      </div>

      <div className="std-actions mt-8 flex min-h-[48px] flex-wrap items-center justify-center gap-3">
        {isOpen ? (
          <>
            {c.date && (
              <button
                type="button"
                onClick={addToCalendar}
                className="rounded-full px-5 py-3 text-sm font-medium"
                style={{ background: dark ? palette.ink : "#14203d", color: dark ? palette.paper : "#fff", fontFamily: caps }}
              >
                Add to calendar
              </button>
            )}
            <a
              href={siteHref}
              className="rounded-full border px-5 py-3 text-sm font-medium"
              style={{ borderColor: dark ? `${palette.ink}55` : "#14203d33", color: dark ? palette.ink : "#14203d", fontFamily: caps }}
            >
              See our wedding website
            </a>
          </>
        ) : (
          <button
            type="button"
            onClick={open}
            className="std-open rounded-full px-6 py-3 text-sm font-medium tracking-wide"
            style={{ background: dark ? palette.ink : "#14203d", color: dark ? palette.paper : "#fff", fontFamily: caps }}
          >
            Open
          </button>
        )}
      </div>
      <p className="mt-6 text-[11px]" style={{ color: dark ? `${palette.muted}aa` : "#8a8178" }}>
        Made with You Do, I Do
      </p>
    </div>
  );
}
