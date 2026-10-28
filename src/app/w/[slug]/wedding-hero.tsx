"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/site-motion";
import type { PublicWedding } from "@/lib/supabase/types";
import { StaggerWords } from "@/components/stagger-words";
import { CountdownTimer } from "@/components/countdown-timer";
import { daysUntilWedding } from "@/lib/countdown";
import { HeroActions } from "./hero-actions";
import { useSiteDesign } from "@/components/guest-site-theme";
import { bannerPhoto, monogramDate, motionPreset, PHOTO_HEROES, resolveDesign } from "@/lib/site-design";
import { SiteOrnament } from "@/components/site-ornament";
import { SiteArt } from "@/components/site-art";
import { SiteText } from "@/components/site-text";
import { SceneArtwork, SiteScene } from "@/components/site-scene";
import { SiteSection } from "@/components/site-section";
import { CANVAS_WIDTH } from "@/lib/layout";
import { creditLinks, isLibraryPhoto, parseCredit } from "@/lib/photo-credit";

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
  poster = false,
}: {
  wedding: PublicWedding;
  tone: "light" | "dark";
  bigMark?: boolean;
  /** Names set huge, in capitals unless the face is a script. */
  poster?: boolean;
}) {
  const design = useSiteDesign();
  const { joiner, stacked } = design.names;
  const first = wedding.partner_a_name ?? "";
  const second = wedding.partner_b_name ?? "";
  const names = `${first} ${joiner} ${second}`.trim();
  const location = [wedding.venue_name, wedding.venue_city, wedding.venue_state]
    .filter(Boolean)
    .join(", ");
  const { motion, ornament, occasion } = design;
  // Capitals never suit a script face, whatever was picked.
  const script = resolveDesign(design).scriptNames;
  const capitals = (poster || design.names.capitals) && !script;
  const renewal = occasion.kind === "renewal";
  const years = renewal && occasion.since ? yearsBetween(occasion.since, wedding.wedding_date) : null;
  // The gentle word-by-word rise is the "Straight in" default; the other
  // openings bring the names in their own way, and "None" means none.
  // Off with the shimmer: its gradient can't reach into the words' own layers.
  const stagger = motion.opening === "none" && motionPreset(motion) !== "none" && !motion.shimmer;
  // Poster names are sized to the screen, so a long single name ("Maximiliano")
  // would run off a phone. Cap the size so the longest word fits the width.
  const longest = Math.max(4, ...names.split(/\s+/).map((w) => w.length));
  const posterSize = `min(clamp(3.75rem,15vw,10rem), calc((100vw - 3rem) / ${(longest * (capitals ? 0.72 : 0.6)).toFixed(2)}))`;

  return (
    <div className="relative z-10 w-full px-6 text-center">
      <SiteOrnament
        kind={bigMark && ornament === "none" ? "crest" : ornament}
        first={(design.monogram.swap ? wedding.partner_b_name : wedding.partner_a_name) ?? ""}
        second={(design.monogram.swap ? wedding.partner_a_name : wedding.partner_b_name) ?? ""}
        size={bigMark ? "lg" : "sm"}
        tone={tone}
        date={monogramDate(design.monogram.date, wedding.wedding_date)}
      />

      <SiteText
        slot="hero.kicker"
        as="p"
        className={`${bigMark ? "mt-8" : "mt-5"} font-mono-numbers text-[11px] uppercase tracking-[0.24em] ${
          tone === "light" ? "text-white/80" : "text-brass"
        }`}
      >
        {renewal ? "We're renewing our vows" : <>You&apos;re invited</>}
      </SiteText>

      <SiteText
        slot="hero.names"
        as="h1"
        className={`site-names mt-3 font-display font-medium [font-style:var(--site-name-style,normal)] [font-weight:var(--site-name-weight,500)] ${
          poster
            ? `mx-auto max-w-[14ch] ${capitals ? "uppercase leading-[0.9] tracking-tight" : "leading-[1.1]"}`
            : `${stacked ? "text-[clamp(2.5rem,9vw,3.75rem)]" : "text-[clamp(2.75rem,8vw,5.5rem)]"} leading-[1.02] ${capitals ? "uppercase tracking-[0.03em]" : ""}`
        } ${
          tone === "light" ? "text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.28)]" : "text-forest"
        }`}
        style={{
          fontFamily: "var(--font-names, var(--font-display))",
          ...(poster ? { fontSize: posterSize } : {}),
        }}
      >
        {stacked && first && second ? (
          // One name above the other, the joiner small between them, as on a printed invitation.
          <>
            <span className="block">{stagger ? <StaggerWords text={first} /> : first}</span>
            <span className="my-[0.3em] block text-[0.34em] normal-case leading-none tracking-normal [font-style:italic]">
              {joiner}
            </span>
            <span className="block">{stagger ? <StaggerWords text={second} /> : second}</span>
          </>
        ) : stagger ? (
          <StaggerWords text={names} />
        ) : (
          names
        )}
      </SiteText>

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
          flipboard={motion.flipboard}
        />
      )}

      <HeroActions wedding={wedding} location={location} tone={tone} />
    </div>
  );
}

/** "Aspen Lakes Lodge, Sisters, OR": where it is, for directions and the calendar. */
function locationOf(wedding: PublicWedding) {
  return [wedding.venue_name, wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
}

/** "9.4.27", as a postmark has it. */
function shortDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${m}.${d}.${String(y).slice(2)}`;
}

function initialsOf(wedding: PublicWedding, swap: boolean) {
  const a = wedding.partner_a_name?.trim()?.[0]?.toUpperCase() ?? "";
  const b = wedding.partner_b_name?.trim()?.[0]?.toUpperCase() ?? "";
  return swap ? [b, a] : [a, b];
}

/*
 * The pieces of the side-set layouts (masthead, postcard, cover, initials,
 * stamp), which arrange the words their own way rather than centring
 * HeroContent. Same slots, so retyped words carry over between layouts.
 */

function HeroKicker({ tone, className = "" }: { tone: "light" | "dark"; className?: string }) {
  const { occasion } = useSiteDesign();
  return (
    <SiteText
      slot="hero.kicker"
      as="p"
      className={`font-mono-numbers text-[11px] uppercase tracking-[0.24em] ${tone === "light" ? "text-white/85" : "text-brass"} ${className}`}
    >
      {occasion.kind === "renewal" ? "We're renewing our vows" : <>You&apos;re invited</>}
    </SiteText>
  );
}

function HeroNames({ wedding, tone, className }: { wedding: PublicWedding; tone: "light" | "dark"; className: string }) {
  const design = useSiteDesign();
  const script = resolveDesign(design).scriptNames;
  const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(` ${design.names.joiner} `);
  return (
    <SiteText
      slot="hero.names"
      as="h1"
      className={`site-names font-display font-medium [font-style:var(--site-name-style,normal)] [font-weight:var(--site-name-weight,500)] [text-wrap:balance] ${
        design.names.capitals && !script ? "uppercase" : ""
      } ${tone === "light" ? "text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.28)]" : "text-forest"} ${className}`}
      style={{ fontFamily: "var(--font-names, var(--font-display))" }}
    >
      {names}
    </SiteText>
  );
}

function HeroDateLine({
  wedding,
  tone,
  className = "",
  stacked = false,
}: {
  wedding: PublicWedding;
  tone: "light" | "dark";
  className?: string;
  /** The date over the place rather than beside it. */
  stacked?: boolean;
}) {
  const parts = [wedding.wedding_date ? formatDate(wedding.wedding_date) : null, locationOf(wedding) || null].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className={`text-sm ${tone === "light" ? "text-white/90" : "text-ink/70"} ${className}`}>
      {stacked ? parts.map((p, i) => <span key={i} className="block">{p}</span>) : parts.join(" · ")}
    </p>
  );
}

/**
 * The date, place and reply-by as labelled facts, then the buttons: in a row
 * across the page (the masthead) or as a short list (initials).
 */
function HeroFacts({ wedding, className = "", list = false }: { wedding: PublicWedding; className?: string; list?: boolean }) {
  const deadline = wedding.rsvp_deadline ? formatDate(wedding.rsvp_deadline).replace(/^\w+, /, "") : null;
  const place = [wedding.venue_name, [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ")].filter(Boolean).join(", ");
  const facts = [
    wedding.wedding_date ? ["The date", formatDate(wedding.wedding_date)] : null,
    place ? ["The place", place] : null,
    deadline ? ["Reply by", deadline] : null,
  ].filter((x): x is string[] => x !== null);
  if (list) {
    return (
      <div className={className}>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-[15px]">
          {facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="pt-0.5 font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/60">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <HeroActions wedding={wedding} location={locationOf(wedding)} tone="dark" align="start" />
      </div>
    );
  }
  return (
    <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end ${className}`}>
      {facts.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/60">{k}</p>
          <p className="mt-1 font-display text-xl text-forest lg:text-2xl">{v}</p>
        </div>
      ))}
      <div className="sm:col-span-2 lg:col-span-1 lg:col-start-4 [&>div]:mt-0">
        <HeroActions wedding={wedding} location={locationOf(wedding)} tone="dark" align="start" />
      </div>
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
 * The top of the page with the theme's scene (Background tab › Scene): a strip
 * along its top, a landscape along its bottom. Clouds, rings and frames go
 * inside the layouts with no photo, where they can't sit on a face.
 */
export function WeddingHero({ wedding }: { wedding: PublicWedding }) {
  const { hero } = useSiteDesign();
  // With no photo yet, a photo layout draws the scene as its picture, so it
  // isn't drawn again around it.
  const illustrated = !bannerPhoto(wedding) && PHOTO_HEROES.includes(hero);
  // A free-library banner always shows its photographer (Unsplash's rule),
  // whenever the layout shows the banner at all.
  const credit = wedding.hero_photo_url && PHOTO_HEROES.includes(hero) ? parseCredit(wedding.hero_photo_credit) : null;
  const links = credit ? creditLinks(credit) : null;
  return (
    <div className="mb-10 flex flex-col">
      {!illustrated && <SiteScene where="strip" />}
      <SiteSection sectionKey="hero">
        <HeroLayout wedding={wedding} />
      </SiteSection>
      {credit && links && (
        <p className="px-4 pt-2 text-right text-[11px] text-ink/60 sm:px-6">
          Photo by{" "}
          <a href={links.photographer} target="_blank" rel="noopener noreferrer" className="underline">
            {credit.name}
          </a>{" "}
          on{" "}
          <a href={links.library} target="_blank" rel="noopener noreferrer" className="underline">
            Unsplash
          </a>
        </p>
      )}
      {!illustrated && <SiteScene where="band" />}
    </div>
  );
}

const HeroPhotosContext = createContext<string[]>([]);

/** The gallery's photos, for the layouts that use more than the banner (collage, slideshow). */
export function HeroPhotosProvider({ photos, children }: { photos: string[]; children: ReactNode }) {
  return <HeroPhotosContext.Provider value={photos}>{children}</HeroPhotosContext.Provider>;
}

const ONES = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
  "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
const UNITS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

function ordinalWords(n: number) {
  if (n < 20) return ONES[n];
  if (n === 20) return "twentieth";
  if (n === 30) return "thirtieth";
  return `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}`;
}

function underHundred(n: number) {
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${UNITS[n % 10]}` : "");
}

/** "Saturday, the fifth of December, two thousand twenty-six": as a printed invitation words it. */
export function invitationDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const when = new Date(Date.UTC(y, m - 1, d));
  const weekday = when.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const month = when.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const year = y >= 2000 && y < 2100 ? `two thousand${y % 100 ? ` ${underHundred(y % 100)}` : ""}` : String(y);
  return { day: `${weekday}, the ${ordinalWords(d)} of ${month}`, year };
}

/**
 * The invitation layout's words: the couple's names and date set the way a
 * printed invitation has them, on a paper card, with the usual buttons under it.
 */
function InvitationContent({ wedding }: { wedding: PublicWedding }) {
  const design = useSiteDesign();
  const renewal = design.occasion.kind === "renewal";
  const date = wedding.wedding_date ? invitationDate(wedding.wedding_date) : null;
  const place = [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
  const location = [wedding.venue_name, wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
  const line = "text-[15px] italic leading-relaxed text-ink/75 sm:text-base";
  return (
    <div className="relative z-10 w-full px-4 text-center">
      <SiteOrnament
        kind={design.ornament}
        first={(design.monogram.swap ? wedding.partner_b_name : wedding.partner_a_name) ?? ""}
        second={(design.monogram.swap ? wedding.partner_a_name : wedding.partner_b_name) ?? ""}
      />
      <SiteText slot="hero.kicker" as="p" className={`mt-6 ${line}`}>
        Together with their families
      </SiteText>
      <SiteText
        slot="hero.names"
        as="h1"
        className="site-names mt-4 font-display text-[clamp(2.5rem,7vw,4.75rem)] font-medium leading-[1.05] text-forest [font-style:var(--site-name-style,normal)]"
        style={{ fontFamily: "var(--font-names, var(--font-display))" }}
      >
        {wedding.partner_a_name}
        <span className="mx-auto my-1 block text-[0.45em] italic text-brass">and</span>
        {wedding.partner_b_name}
      </SiteText>
      <p className={`mt-5 ${line}`}>
        {renewal ? "invite you to celebrate the renewal of their vows" : "request the pleasure of your company at the celebration of their marriage"}
      </p>
      {date && (
        <p className="mt-5 text-[13px] uppercase tracking-[0.22em] text-ink sm:text-sm">
          {date.day}
          <br />
          {date.year}
        </p>
      )}
      {(wedding.venue_name || place) && (
        <p className="mt-4 text-[13px] uppercase tracking-[0.22em] text-ink/70 sm:text-sm">
          {wedding.venue_name}
          {wedding.venue_name && place && <br />}
          {place}
        </p>
      )}
      <HeroActions wedding={wedding} location={location} tone="dark" />
    </div>
  );
}

/**
 * A small arrow at the foot of the screen-filling layouts, so guests know
 * there's more below. Takes them to the end of the top of the page.
 */
function ScrollCue({ tone, className = "" }: { tone: "light" | "dark"; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      aria-label="Scroll to the rest of the page"
      onClick={(e) => {
        const top = e.currentTarget.closest("header")?.getBoundingClientRect().bottom;
        if (top !== undefined) window.scrollTo({ top: top + window.scrollY, behavior: reduced ? "auto" : "smooth" });
      }}
      className={`absolute bottom-3 left-1/2 z-10 -translate-x-1/2 p-2 transition-opacity hover:opacity-100 ${
        tone === "light" ? "text-white opacity-80" : "text-ink opacity-45"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-7 w-7 ${reduced ? "" : "site-scroll-cue"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

/** The banner and gallery photos crossfading, five seconds each; still under reduced motion. */
function Slideshow({ photos }: { photos: string[] }) {
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (reduced || photos.length < 2) return;
    const t = setInterval(() => setAt((i) => (i + 1) % photos.length), 5000);
    return () => clearInterval(t);
  }, [reduced, photos.length]);
  return (
    <>
      {photos.map((src, i) => (
        <Image
          key={src}
          src={src}
          unoptimized={isLibraryPhoto(src)}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1600ms] ease-in-out ${i === at ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </>
  );
}

/**
 * The top of the guest site, in the couple's chosen layout (Style tab):
 * the photo across the top with a card over it, photo and names side by
 * side, or an arched photo above the names. Until there's a photo, the
 * photo layouts show the theme's scene as the picture (SceneArtwork).
 */
function HeroLayout({ wedding }: { wedding: PublicWedding }) {
  const design = useSiteDesign();
  const { hero, art } = design;
  const photo = bannerPhoto(wedding);
  const gallery = useContext(HeroPhotosContext);

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
  if (hero === "text") {
    return (
      <header className="site-hero-plain relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-card)_0%,var(--color-parchment)_60%)] px-6 pb-16 pt-24">
        <SiteArt art={art} />
        <SiteScene where="surround" />
        <HeroContent wedding={wedding} tone="dark" />
      </header>
    );
  }

  // Poster: the names as big as the screen allows, over the photo (darkened
  // so they read) or straight on the page.
  if (hero === "poster") {
    return (
      <header className="relative flex min-h-[calc(var(--site-vh,1vh)*64)] items-center overflow-hidden py-16 lg:min-h-[calc(var(--site-vh,1vh)*80)]">
        {photo ? (
          <>
            <div className="site-hero-photo absolute inset-0 bg-[var(--site-photo)]">
              <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
            </div>
            <span className="absolute inset-0 bg-black/40" aria-hidden="true" />
          </>
        ) : (
          <>
            <SiteArt art={art} />
            <SiteScene where="surround" />
          </>
        )}
        <HeroContent wedding={wedding} tone={photo ? "light" : "dark"} poster />
        <ScrollCue tone={photo ? "light" : "dark"} />
      </header>
    );
  }

  // Framed card: the names on a card with a fine double border, over the
  // photo or, without one, over a band of the accent colour.
  if (hero === "card") {
    return (
      <header
        className="relative overflow-hidden px-4 py-14 sm:px-8 lg:py-24"
        style={photo ? undefined : { background: "var(--site-accent)" }}
      >
        {photo && (
          <div className="site-hero-photo absolute inset-0 bg-[var(--site-photo)]">
            <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
          </div>
        )}
        <div className="relative z-10 mx-auto max-w-2xl bg-card p-2 shadow-lg sm:p-3">
          <div className="border border-[var(--site-accent)] p-1.5">
            <div className="border border-[color-mix(in_srgb,var(--site-accent)_40%,transparent)] py-12 sm:py-16">
              <HeroContent wedding={wedding} tone="dark" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (hero === "split") {
    // From lg the photo takes three fifths and the full height of the
    // screen, the names the rest, with the couple's artwork in the
    // column's corners. On a phone, the photo first and the names under it.
    return (
      <header className="grid lg:min-h-[calc(var(--site-vh,1vh)*92)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="site-hero-photo relative h-[calc(var(--site-vh,1vh)*46)] min-h-[300px] overflow-hidden bg-[var(--site-photo)] lg:h-auto">
          {photo ? (
            <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="hero-kenburns object-cover" />
          ) : (
            <SceneArtwork />
          )}
        </div>
        <div className={`relative flex items-center justify-center overflow-hidden py-14 lg:py-20 ${art.id ? "max-sm:pb-40" : ""}`}>
          {/* Tucked into the corners: the column is too narrow to flank the names.
              A phone leaves the bottom corner room so it can't cover the buttons. */}
          <SiteArt art={{ ...art, placement: "corners" }} />
          <HeroContent wedding={wedding} tone="dark" />
          <ScrollCue tone="dark" className="hidden lg:block" />
        </div>
      </header>
    );
  }

  // Invitation: a paper card with the names and date worded like the printed
  // invitation, under an arched photo when there is one.
  if (hero === "invitation") {
    return (
      <header className="relative overflow-hidden px-4 py-12 sm:px-8 lg:py-20">
        <SiteArt art={art} />
        <SiteScene where="surround" />
        <div className="site-invitation relative z-10 mx-auto max-w-2xl bg-card px-6 py-12 shadow-[0_18px_44px_rgb(0_0_0_/_0.12)] sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-3 border border-[color-mix(in_srgb,var(--site-accent)_35%,transparent)]" aria-hidden="true" />
          {photo && (
            <div className="relative mx-auto mb-8 w-[min(230px,64%)] rounded-[200px_200px_4px_4px] border border-[var(--site-accent)] p-2">
              <div className="site-hero-photo relative aspect-[4/5] overflow-hidden rounded-[190px_190px_2px_2px] bg-[var(--site-photo)]">
                <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="230px" className="hero-kenburns object-cover" />
              </div>
            </div>
          )}
          <InvitationContent wedding={wedding} />
        </div>
      </header>
    );
  }

  // Slideshow: the banner, then the gallery, fading one into the next behind
  // the names, darkened enough that they read on every photo.
  if (hero === "slideshow") {
    const photos = [photo, ...gallery].filter((x): x is string => Boolean(x)).slice(0, 6);
    return (
      <header className="relative flex min-h-[calc(var(--site-vh,1vh)*70)] items-center overflow-hidden py-16 lg:min-h-[calc(var(--site-vh,1vh)*82)]">
        <div className="site-hero-photo absolute inset-0 bg-[var(--site-photo)]">
          {photos.length ? <Slideshow photos={photos} /> : <SceneArtwork />}
        </div>
        {photos.length > 0 && <span className="absolute inset-0 bg-black/40" aria-hidden="true" />}
        <HeroContent wedding={wedding} tone={photos.length ? "light" : "dark"} />
        <ScrollCue tone={photos.length ? "light" : "dark"} />
      </header>
    );
  }

  // Collage: the banner large with two gallery photos layered over its
  // corners, beside the names on a computer and above them on a phone.
  if (hero === "collage") {
    const [second, third] = gallery.filter((x) => x !== photo);
    const tile = "site-hero-photo absolute overflow-hidden bg-[var(--site-photo)] shadow-[0_14px_34px_rgb(0_0_0_/_0.18)] ring-4 ring-[var(--color-card)]";
    return (
      <header className="grid items-center gap-10 px-4 pb-12 pt-10 sm:px-8 lg:min-h-[calc(var(--site-vh,1vh)*78)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-6 lg:px-12">
        <div className="relative mx-auto aspect-[5/4] w-full max-w-[640px]">
          <div className={`${tile} inset-y-[6%] left-[8%] right-[14%]`}>
            {photo ? <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" /> : <SceneArtwork />}
          </div>
          {second && (
            <div className={`${tile} bottom-0 right-0 h-[42%] w-[34%] rotate-[4deg]`}>
              <Image src={second} unoptimized={isLibraryPhoto(second)} alt="" fill sizes="(min-width: 1024px) 16vw, 34vw" className="object-cover" />
            </div>
          )}
          {third && (
            <div className={`${tile} left-0 top-0 h-[34%] w-[28%] -rotate-[5deg]`}>
              <Image src={third} unoptimized={isLibraryPhoto(third)} alt="" fill sizes="(min-width: 1024px) 13vw, 28vw" className="object-cover" />
            </div>
          )}
        </div>
        <HeroContent wedding={wedding} tone="dark" />
      </header>
    );
  }

  // Magazine cover: the photo wide across the top, the names huge under it
  // and set left, then the date, place and reply-by in a ruled row.
  if (hero === "masthead") {
    return (
      <header>
        <div className="site-hero-photo relative h-[calc(var(--site-vh,1vh)*46)] min-h-[300px] overflow-hidden bg-[var(--site-photo)] lg:h-[calc(var(--site-vh,1vh)*62)]">
          {photo ? (
            <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
          ) : (
            <SceneArtwork />
          )}
        </div>
        <div className={`mx-auto w-full ${CANVAS_WIDTH} px-4 sm:px-6 lg:px-16`}>
          <HeroKicker className="mt-7" tone="dark" />
          <HeroNames wedding={wedding} tone="dark" className="mt-2 text-[clamp(3.25rem,12.5vw,11.5rem)] leading-[0.9] tracking-[-0.02em]" />
          <HeroFacts wedding={wedding} className="mt-8 border-t border-ink pt-5" />
        </div>
      </header>
    );
  }

  // Postcard: the photo as a tilted postcard with a round postmark, the
  // names beside it on a computer and under it on a phone.
  if (hero === "postcard") {
    const place = [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
    return (
      <header className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-10 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-14">
        <div className="relative mx-auto w-full max-w-[560px] -rotate-[2.5deg] bg-white p-3 pb-12 shadow-[0_18px_40px_rgb(0_0_0_/_0.18)] sm:p-3.5 sm:pb-14">
          <div className="site-hero-photo relative aspect-[4/3] overflow-hidden bg-[var(--site-photo)]">
            {photo ? (
              <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="(min-width: 1024px) 560px, 90vw" className="hero-kenburns object-cover" />
            ) : (
              <SceneArtwork />
            )}
          </div>
          {/* The card is always white, so its caption is always dark. */}
          <p className="absolute bottom-3 left-4 font-display text-lg italic text-[#1f2a44] sm:bottom-4">
            {wedding.venue_city ? `Greetings from ${wedding.venue_city}` : "Wish you were here"}
          </p>
          {(place || wedding.wedding_date) && (
            <span className="absolute -right-3 -top-6 flex h-24 w-24 rotate-12 items-center justify-center rounded-full border-2 border-dashed border-[var(--site-accent)] bg-parchment px-2 text-center font-mono-numbers text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[var(--site-accent)] sm:-right-6 sm:h-28 sm:w-28" aria-hidden="true">
              <span>
                {place}
                {wedding.wedding_date && <span className="block">{shortDate(wedding.wedding_date)}</span>}
              </span>
            </span>
          )}
        </div>
        <div className="relative text-center lg:text-left">
          <SiteArt art={{ ...art, placement: "corners" }} />
          <HeroKicker tone="dark" />
          <HeroNames wedding={wedding} tone="dark" className="mt-3 text-[clamp(3rem,7.4vw,6.5rem)] leading-[0.98]" />
          <HeroDateLine wedding={wedding} tone="dark" className="mt-5" />
          <HeroActions wedding={wedding} location={locationOf(wedding)} tone="dark" align="responsive" />
        </div>
      </header>
    );
  }

  // Photo cover: the photo fills the screen and the names sit over its lower
  // corner, the date, place and buttons across from them.
  if (hero === "cover") {
    const tone = photo ? "light" : "dark";
    return (
      <header className="relative flex min-h-[calc(var(--site-vh,1vh)*86)] flex-col justify-end overflow-hidden lg:min-h-[calc(var(--site-vh,1vh)*94)]">
        <div className="site-hero-photo absolute inset-0 bg-[var(--site-photo)]">
          {photo ? (
            <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
          ) : (
            <SceneArtwork />
          )}
        </div>
        {photo && (
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0_/_0.28),transparent_28%,transparent_42%,rgb(0_0_0_/_0.68))]" aria-hidden="true" />
        )}
        <div className="relative z-10 flex w-full flex-col gap-2 px-6 pb-12 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-14 lg:pb-16">
          <div className="min-w-0">
            <HeroKicker tone={tone} />
            <HeroNames wedding={wedding} tone={tone} className="mt-3 text-[clamp(3.25rem,10vw,9.5rem)] leading-[0.92]" />
          </div>
          <div className="shrink-0 lg:pb-2 lg:text-right">
            <HeroDateLine wedding={wedding} tone={tone} className="mt-3 uppercase tracking-[0.2em] lg:mt-0" stacked />
            <HeroActions wedding={wedding} location={locationOf(wedding)} tone={tone} align="end" />
          </div>
        </div>
      </header>
    );
  }

  // Initials: the couple's initials huge in the accent, the names and the
  // details beside them, a wide photo under both (first on a phone).
  if (hero === "initials") {
    const [a, b] = initialsOf(wedding, design.monogram.swap);
    return (
      <header className={`mx-auto flex w-full ${CANVAS_WIDTH} flex-col px-5 pb-12 pt-6 sm:px-8 lg:px-12 lg:pb-16 lg:pt-12`}>
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          {a && b && (
            <p
              className="flex items-end leading-[0.78] tracking-[-0.04em] text-[var(--site-accent)] text-[clamp(8rem,24vw,24rem)] max-lg:hidden"
              style={{ fontFamily: "var(--font-names, var(--font-display))" }}
              aria-hidden="true"
            >
              {a}
              <span className="mx-[0.12em] mb-[0.06em] inline-block h-[0.7em] w-[2px] bg-[var(--color-ink)] opacity-40" />
              {b}
            </p>
          )}
          <div className="min-w-0">
            <HeroKicker tone="dark" />
            <HeroNames wedding={wedding} tone="dark" className="mt-3 text-[clamp(2.6rem,4.8vw,4rem)] leading-[1.02]" />
            <HeroFacts wedding={wedding} className="mt-7" list />
          </div>
        </div>
        <div className="site-hero-photo relative -mx-5 mb-8 h-[280px] overflow-hidden bg-[var(--site-photo)] max-lg:order-first sm:mx-0 lg:mb-0 lg:mt-12 lg:h-[440px]">
          {photo ? (
            <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
          ) : (
            <SceneArtwork />
          )}
        </div>
      </header>
    );
  }

  // Stamped: the photo in a thick white border with a round stamp of the
  // year and place on its corner, the names beside it.
  if (hero === "stamp") {
    const year = wedding.wedding_date?.slice(0, 4);
    const place = [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
    return (
      <header className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-16 pt-10 sm:px-10 lg:grid-cols-2 lg:pb-24 lg:pt-16">
        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="site-hero-photo relative aspect-[5/4] overflow-hidden border-[10px] border-white bg-[var(--site-photo)] shadow-[0_14px_30px_rgb(60_40_20_/_0.22)]">
            {photo ? (
              <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="(min-width: 1024px) 560px, 90vw" className="hero-kenburns object-cover" />
            ) : (
              <SceneArtwork />
            )}
          </div>
          {year && (
            <span className="absolute -bottom-8 right-2 flex h-24 w-24 -rotate-[10deg] items-center justify-center rounded-full bg-[var(--site-accent)] px-2 text-center text-[var(--site-on-accent)] shadow-[0_0_0_5px_var(--color-parchment),0_0_0_7px_var(--site-accent)] sm:-left-8 sm:right-auto sm:h-32 sm:w-32" aria-hidden="true">
              <span className="font-mono-numbers text-[9px] uppercase leading-relaxed tracking-[0.16em] sm:text-[11px]">
                Est.
                <span className="block font-display text-2xl normal-case leading-none tracking-normal sm:text-3xl">{year}</span>
                {place}
              </span>
            </span>
          )}
        </div>
        <div className="relative text-center lg:text-left">
          <SiteArt art={{ ...art, placement: "corners" }} />
          <HeroKicker tone="dark" />
          <HeroNames wedding={wedding} tone="dark" className="mt-3 text-[clamp(3rem,7.6vw,6.75rem)] font-bold leading-[0.95]" />
          <HeroDateLine wedding={wedding} tone="dark" className="mt-5 font-display text-xl text-ink" stacked />
          <HeroActions wedding={wedding} location={locationOf(wedding)} tone="dark" align="responsive" />
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
            {photo ? (
            <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="310px" className="hero-kenburns object-cover" />
          ) : (
            <SceneArtwork />
          )}
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
      <div className="site-hero-photo relative h-[calc(var(--site-vh,1vh)*52)] min-h-[320px] w-full overflow-hidden bg-[var(--site-photo)] lg:h-[calc(var(--site-vh,1vh)*62)]">
        {photo ? (
            <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
          ) : (
            <SceneArtwork />
          )}
      </div>
      <div className={`relative -mt-24 w-[calc(100%-2rem)] max-w-2xl bg-card py-10 shadow-sm sm:py-12 ${CARD_RADIUS}`}>
        <HeroContent wedding={wedding} tone="dark" />
      </div>
    </header>
  );
}
