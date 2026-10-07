"use client";

import Image from "next/image";
import type { PublicWedding } from "@/lib/supabase/types";
import { StaggerWords } from "@/components/stagger-words";
import { CountdownTimer } from "@/components/countdown-timer";
import { daysUntilWedding } from "@/lib/countdown";
import { HeroActions } from "./hero-actions";
import { useSiteDesign } from "@/components/guest-site-theme";
import { motionPreset } from "@/lib/site-design";
import { SiteOrnament } from "@/components/site-ornament";
import { SiteArt } from "@/components/site-art";
import { SiteScene } from "@/components/site-scene";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function HeroContent({
  wedding,
  tone,
  bigMark = false,
}: {
  wedding: PublicWedding;
  tone: "light" | "dark";
  bigMark?: boolean;
}) {
  const names = `${wedding.partner_a_name ?? ""} & ${wedding.partner_b_name ?? ""}`.trim();
  const location = [wedding.venue_name, wedding.venue_city, wedding.venue_state]
    .filter(Boolean)
    .join(", ");
  const { motion, ornament, occasion } = useSiteDesign();
  const renewal = occasion.kind === "renewal";
  const years = renewal && occasion.since ? yearsBetween(occasion.since, wedding.wedding_date) : null;
  // The gentle word-by-word rise is the "Straight in" default; the other
  // openings bring the names in their own way, and "None" means none.
  const stagger = motion.opening === "none" && motionPreset(motion) !== "none";

  return (
    <div className="relative z-10 w-full px-6 text-center">
      <SiteOrnament
        kind={bigMark && ornament === "none" ? "crest" : ornament}
        first={wedding.partner_a_name ?? ""}
        second={wedding.partner_b_name ?? ""}
        size={bigMark ? "lg" : "sm"}
        tone={tone}
      />

      <p
        className={`${bigMark ? "mt-8" : "mt-5"} font-mono-numbers text-[11px] uppercase tracking-[0.24em] ${
          tone === "light" ? "text-white/80" : "text-brass"
        }`}
      >
        {renewal ? "We're renewing our vows" : <>You&apos;re invited</>}
      </p>

      <h1
        className={`site-names mt-3 font-display text-[clamp(2.75rem,8vw,5.5rem)] font-medium leading-[1.02] [font-style:var(--site-name-style,normal)] [font-weight:var(--site-name-weight,500)] ${
          tone === "light" ? "text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.28)]" : "text-forest"
        }`}
        style={{ fontFamily: "var(--font-names, var(--font-display))" }}
      >
        {stagger ? <StaggerWords text={names} /> : names}
      </h1>

      {renewal && occasion.since && (
        <p className={`mt-3 font-display text-lg italic ${tone === "light" ? "text-white/90" : "text-forest"}`}>
          Married {formatDate(occasion.since).replace(/^\w+, /, "")}
          {years !== null && years > 0 ? ` · ${years} ${years === 1 ? "year" : "years"} together` : ""}
        </p>
      )}

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
          live={motion.ticking}
        />
      )}

      <HeroActions wedding={wedding} location={location} tone={tone} />
    </div>
  );
}

/** Whole years from one date to another (or to today). */
function yearsBetween(from: string, to: string | null) {
  const a = new Date(`${from}T00:00:00`);
  const b = to ? new Date(`${to}T00:00:00`) : new Date();
  let years = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) years -= 1;
  return years;
}

// Cards and frames take the theme's corner, capped: a pill-shaped theme
// (999px buttons) would otherwise turn the name card into a stadium.
const CARD_RADIUS = "rounded-[min(var(--site-radius,1rem),1.5rem)]";

/**
 * The top of the page with the theme's scene (Style tab › Scene): a strip
 * along its top, a landscape along its bottom. Clouds, rings and frames go
 * inside the layouts with no photo, where they can't sit on a face.
 */
export function WeddingHero({ wedding }: { wedding: PublicWedding }) {
  return (
    <div className="mb-10 flex flex-col">
      <SiteScene where="strip" />
      <HeroLayout wedding={wedding} />
      <SiteScene where="band" />
    </div>
  );
}

/**
 * The top of the guest site, in the couple's chosen layout (Style tab):
 * the photo across the top with a card over it, photo and names side by
 * side, or an arched photo above the names. Without a photo there's nothing
 * to lay out, so every layout falls back to the names on their own.
 */
function HeroLayout({ wedding }: { wedding: PublicWedding }) {
  const { hero, art } = useSiteDesign();
  const photo = wedding.hero_photo_url;

  // Monogram: the crest is the picture, large, with a fine double rule
  // framing the whole top of the page. Works the same with or without a photo.
  if (hero === "monogram") {
    return (
      <header className="px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-16">
        <div className="mx-auto max-w-4xl border border-[color-mix(in_srgb,var(--site-accent)_45%,transparent)] p-1.5">
          <div className="relative overflow-hidden border border-[color-mix(in_srgb,var(--site-accent)_25%,transparent)] py-14 lg:py-20">
            <SiteArt art={art} />
            <SiteScene where="surround" />
            <HeroContent wedding={wedding} tone="dark" bigMark />
          </div>
        </div>
      </header>
    );
  }

  // No photo yet is the common first-run state, so it gets its own
  // deliberate treatment rather than an empty grey band. "Text only" is the
  // same page chosen on purpose.
  if (!photo || hero === "text") {
    return (
      <header className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-card)_0%,var(--color-parchment)_60%)] px-6 pb-16 pt-24">
        <SiteArt art={art} />
        <SiteScene where="surround" />
        <HeroContent wedding={wedding} tone="dark" />
      </header>
    );
  }

  if (hero === "split") {
    // Side by side from lg; on a phone, the photo first and the names under it.
    return (
      <header className="grid lg:min-h-[78vh] lg:grid-cols-2">
        <div className="site-hero-photo relative h-[46vh] min-h-[300px] overflow-hidden bg-[var(--site-photo)] lg:h-auto">
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
      <header className="relative flex flex-col items-center overflow-hidden px-6 pb-12 pt-14 lg:pt-20">
        <SiteArt art={art} />
        <SiteScene where="surround" />
        <div className="relative z-10 rounded-[200px_200px_8px_8px] border border-[var(--site-accent)] p-2.5">
          <div className="site-hero-photo relative h-[340px] w-[250px] overflow-hidden rounded-[190px_190px_4px_4px] bg-[var(--site-photo)] sm:h-[420px] sm:w-[310px]">
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
    <header className="flex flex-col items-center">
      <div className="site-hero-photo relative h-[52vh] min-h-[320px] w-full overflow-hidden bg-[var(--site-photo)] lg:h-[62vh]">
        <Image src={photo} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
      </div>
      <div className={`relative -mt-24 w-[calc(100%-2rem)] max-w-2xl bg-card py-10 shadow-sm sm:py-12 ${CARD_RADIUS}`}>
        <HeroContent wedding={wedding} tone="dark" />
      </div>
    </header>
  );
}
