import Image from "next/image";
import type { PublicWedding } from "@/lib/supabase/types";
import { StaggerWords } from "@/components/stagger-words";
import { CountdownTimer } from "@/components/countdown-timer";
import { daysUntilWedding } from "@/lib/countdown";

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
        className={`mt-3 font-display text-[clamp(2.75rem,8vw,5.5rem)] font-medium leading-[1.02] ${
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
    </div>
  );
}

export function WeddingHero({ wedding }: { wedding: PublicWedding }) {
  // No photo yet is the common first-run state, so it gets its own
  // deliberate treatment on parchment rather than an empty grey band.
  if (!wedding.hero_photo_url) {
    return (
      <header className="-mx-6 -mt-16 mb-10 bg-[radial-gradient(120%_90%_at_50%_0%,#ffffff_0%,var(--color-parchment)_60%)] px-6 pb-16 pt-24">
        <HeroContent wedding={wedding} tone="dark" />
      </header>
    );
  }

  return (
    <header className="relative -mx-6 -mt-16 mb-10 flex h-[78vh] min-h-[520px] items-center justify-center overflow-hidden">
      <Image
        src={wedding.hero_photo_url}
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-kenburns object-cover"
      />
      {/* Scrim: the photo is the couple's, so it can be anything -- this
          keeps the names legible over a bright sky or a dark forest alike. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-forest/30 via-forest/10 to-forest/80"
        aria-hidden="true"
      />
      <div className="relative">
        <HeroContent wedding={wedding} tone="light" />
      </div>
      <span
        className="hero-scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70"
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </header>
  );
}
