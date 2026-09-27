"use client";

import Image from "next/image";
import type { PublicWedding } from "@/lib/supabase/types";
import { StaggerWords } from "@/components/stagger-words";
import { CountdownTimer } from "@/components/countdown-timer";
import { daysUntilWedding } from "@/lib/countdown";
import { HeroActions } from "./hero-actions";
import { useSiteDesign } from "@/components/guest-site-theme";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function initialsOf(a: string | null, b: string | null) {
  return [a, b]
    .map((name) => name?.trim()?.[0]?.toUpperCase())
    .filter(Boolean)
    .join(" · ");
}

function Monogram({ initials, tone }: { initials: string; tone: "light" | "dark" }) {
  if (!initials) return null;
  const rule = tone === "light" ? "bg-white/45" : "bg-hairline";
  const text = tone === "light" ? "text-[#e9c97a]" : "text-brass";
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={`h-px w-10 sm:w-14 ${rule}`} aria-hidden="true" />
      <span className={`font-display text-xl tracking-[0.22em] ${text}`}>{initials}</span>
      <span className={`h-px w-10 sm:w-14 ${rule}`} aria-hidden="true" />
    </div>
  );
}

function HeroContent({ wedding, tone }: { wedding: PublicWedding; tone: "light" | "dark" }) {
  const names = `${wedding.partner_a_name ?? ""} & ${wedding.partner_b_name ?? ""}`.trim();
  const location = [wedding.venue_name, wedding.venue_city, wedding.venue_state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full px-6 text-center">
      <Monogram initials={initialsOf(wedding.partner_a_name, wedding.partner_b_name)} tone={tone} />

      <p
        className={`mt-5 font-mono-numbers text-[11px] uppercase tracking-[0.24em] ${
          tone === "light" ? "text-white/80" : "text-brass"
        }`}
      >
        You&apos;re invited
      </p>

      <h1
        className={`mt-3 font-display text-[clamp(2.75rem,8vw,5.5rem)] font-medium leading-[1.02] [font-style:var(--site-name-style,normal)] [font-weight:var(--site-name-weight,500)] ${
          tone === "light" ? "text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.28)]" : "text-forest"
        }`}
      >
        <StaggerWords text={names} />
      </h1>

      {(wedding.wedding_date || location) && (
        <p className={`mt-4 text-sm ${tone === "light" ? "text-white/85" : "text-ink/60"}`}>
          {[wedding.wedding_date ? formatDate(wedding.wedding_date) : null, location]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      {wedding.wedding_date && (
        <CountdownTimer
          targetDate={wedding.wedding_date}
          fallbackLabel={daysUntilWedding(wedding.wedding_date)}
          tone={tone}
          size="lg"
          className="mt-8"
        />
      )}

      <HeroActions wedding={wedding} location={location} tone={tone} />
    </div>
  );
}

// Cards and frames take the theme's corner, capped: a pill-shaped theme
// (999px buttons) would otherwise turn the name card into a stadium.
const CARD_RADIUS = "rounded-[min(var(--site-radius,1rem),1.5rem)]";

/**
 * The top of the guest site, in the couple's chosen layout (Style tab):
 * the photo across the top with a card over it, photo and names side by
 * side, or an arched photo above the names. Without a photo there's nothing
 * to lay out, so every layout falls back to the names on their own.
 */
export function WeddingHero({ wedding }: { wedding: PublicWedding }) {
  const { hero } = useSiteDesign();
  const photo = wedding.hero_photo_url;

  // No photo yet is the common first-run state, so it gets its own
  // deliberate treatment rather than an empty grey band.
  if (!photo) {
    return (
      <header className="mb-10 bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-card)_0%,var(--color-parchment)_60%)] px-6 pb-16 pt-24">
        <HeroContent wedding={wedding} tone="dark" />
      </header>
    );
  }

  if (hero === "split") {
    // Side by side from lg; on a phone, the photo first and the names under it.
    return (
      <header className="mb-10 grid lg:min-h-[78vh] lg:grid-cols-2">
        <div className="relative h-[46vh] min-h-[300px] overflow-hidden bg-[var(--site-photo)] lg:h-auto">
          <Image src={photo} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="hero-kenburns object-cover" />
        </div>
        <div className="flex items-center justify-center py-14 lg:py-20">
          <HeroContent wedding={wedding} tone="dark" />
        </div>
      </header>
    );
  }

  if (hero === "framed") {
    return (
      <header className="mb-10 flex flex-col items-center px-6 pb-12 pt-14 lg:pt-20">
        <div className="rounded-[200px_200px_8px_8px] border border-[var(--site-accent)] p-2.5">
          <div className="relative h-[340px] w-[250px] overflow-hidden rounded-[190px_190px_4px_4px] bg-[var(--site-photo)] sm:h-[420px] sm:w-[310px]">
            <Image src={photo} alt="" fill priority sizes="310px" className="hero-kenburns object-cover" />
          </div>
        </div>
        <div className="mt-8 w-full">
          <HeroContent wedding={wedding} tone="dark" />
        </div>
      </header>
    );
  }

  // Full photo: the photo across the top, and a card holding the names that
  // overlaps its lower edge.
  return (
    <header className="mb-10 flex flex-col items-center">
      <div className="relative h-[52vh] min-h-[320px] w-full overflow-hidden bg-[var(--site-photo)] lg:h-[62vh]">
        <Image src={photo} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
      </div>
      <div className={`relative -mt-24 w-[calc(100%-2rem)] max-w-2xl bg-card py-10 shadow-sm sm:py-12 ${CARD_RADIUS}`}>
        <HeroContent wedding={wedding} tone="dark" />
      </div>
    </header>
  );
}
