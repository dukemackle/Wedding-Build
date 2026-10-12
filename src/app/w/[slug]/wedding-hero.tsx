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
  const names = `${wedding.partner_a_name ?? ""} & ${wedding.partner_b_name ?? ""}`.trim();
  const location = [wedding.venue_name, wedding.venue_city, wedding.venue_state]
    .filter(Boolean)
    .join(", ");
  const design = useSiteDesign();
  const { motion, ornament, occasion } = design;
  const capitals = poster && !resolveDesign(design).scriptNames;
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
            : "text-[clamp(2.75rem,8vw,5.5rem)] leading-[1.02]"
        } ${
          tone === "light" ? "text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.28)]" : "text-forest"
        }`}
        style={{
          fontFamily: "var(--font-names, var(--font-display))",
          ...(poster ? { fontSize: posterSize } : {}),
        }}
      >
        {stagger ? <StaggerWords text={names} /> : names}
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
  return (
    <div className="mb-10 flex flex-col">
      {!illustrated && <SiteScene where="strip" />}
      <SiteSection sectionKey="hero">
        <HeroLayout wedding={wedding} />
      </SiteSection>
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
  const { hero, art } = useSiteDesign();
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
      <header className="relative flex min-h-[64vh] items-center overflow-hidden py-16 lg:min-h-[80vh]">
        {photo ? (
          <>
            <div className="site-hero-photo absolute inset-0 bg-[var(--site-photo)]">
              <Image src={photo} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
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
            <Image src={photo} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
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
    // Side by side from lg; on a phone, the photo first and the names under it.
    return (
      <header className="grid lg:min-h-[78vh] lg:grid-cols-2">
        <div className="site-hero-photo relative h-[46vh] min-h-[300px] overflow-hidden bg-[var(--site-photo)] lg:h-auto">
          {photo ? (
            <Image src={photo} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="hero-kenburns object-cover" />
          ) : (
            <SceneArtwork />
          )}
        </div>
        <div className="flex items-center justify-center py-14 lg:py-20">
          <HeroContent wedding={wedding} tone="dark" />
        </div>
      </header>
    );
  }

  // Invitation: a paper card with the names and date worded like the printed
  // invitation, on the page (or over the photo, softened, when there is one).
  if (hero === "invitation") {
    return (
      <header className="relative overflow-hidden px-4 py-12 sm:px-8 lg:py-20">
        <SiteArt art={art} />
        <SiteScene where="surround" />
        <div className="site-invitation relative z-10 mx-auto max-w-xl bg-card px-6 py-12 shadow-[0_18px_44px_rgb(0_0_0_/_0.12)] sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-3 border border-[color-mix(in_srgb,var(--site-accent)_35%,transparent)]" aria-hidden="true" />
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
      <header className="relative flex min-h-[70vh] items-center overflow-hidden py-16 lg:min-h-[82vh]">
        <div className="site-hero-photo absolute inset-0 bg-[var(--site-photo)]">
          {photos.length ? <Slideshow photos={photos} /> : <SceneArtwork />}
        </div>
        {photos.length > 0 && <span className="absolute inset-0 bg-black/40" aria-hidden="true" />}
        <HeroContent wedding={wedding} tone={photos.length ? "light" : "dark"} />
      </header>
    );
  }

  // Collage: the banner large with two gallery photos layered over its
  // corners, beside the names on a computer and above them on a phone.
  if (hero === "collage") {
    const [second, third] = gallery.filter((x) => x !== photo);
    const tile = "site-hero-photo absolute overflow-hidden bg-[var(--site-photo)] shadow-[0_14px_34px_rgb(0_0_0_/_0.18)] ring-4 ring-[var(--color-card)]";
    return (
      <header className="grid items-center gap-10 px-4 pb-12 pt-10 sm:px-8 lg:min-h-[78vh] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-6 lg:px-12">
        <div className="relative mx-auto aspect-[5/4] w-full max-w-[640px]">
          <div className={`${tile} inset-y-[6%] left-[8%] right-[14%]`}>
            {photo ? <Image src={photo} alt="" fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" /> : <SceneArtwork />}
          </div>
          {second && (
            <div className={`${tile} bottom-0 right-0 h-[42%] w-[34%] rotate-[4deg]`}>
              <Image src={second} alt="" fill sizes="(min-width: 1024px) 16vw, 34vw" className="object-cover" />
            </div>
          )}
          {third && (
            <div className={`${tile} left-0 top-0 h-[34%] w-[28%] -rotate-[5deg]`}>
              <Image src={third} alt="" fill sizes="(min-width: 1024px) 13vw, 28vw" className="object-cover" />
            </div>
          )}
        </div>
        <HeroContent wedding={wedding} tone="dark" />
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
            <Image src={photo} alt="" fill priority sizes="310px" className="hero-kenburns object-cover" />
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
      <div className="site-hero-photo relative h-[52vh] min-h-[320px] w-full overflow-hidden bg-[var(--site-photo)] lg:h-[62vh]">
        {photo ? (
            <Image src={photo} alt="" fill priority sizes="100vw" className="hero-kenburns object-cover" />
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
