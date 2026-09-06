import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  BudgetIcon,
  HeadcountIcon,
  VendorsIcon,
  ChecklistIcon,
} from "@/components/icons";

const stats: { value: number; prefix?: string; suffix?: string; label: string }[] = [
  { value: 10, suffix: "+", label: "planning tools in one place" },
  { value: 0, prefix: "$", label: "cost to plan your wedding" },
  { value: 100, suffix: "%", label: "of your data, yours alone" },
];

const features = [
  {
    icon: BudgetIcon,
    title: "Budget",
    body: "Real regional cost estimates that adjust to your guest count, season, and style — then track every dollar against them.",
  },
  {
    icon: HeadcountIcon,
    title: "Guests & seating",
    body: "RSVPs, meal choices, plus-ones, and a drag-and-drop seating chart, all synced to one guest list.",
  },
  {
    icon: VendorsIcon,
    title: "Venues & vendors",
    body: "Shortlist venues, send inquiries, and keep every vendor conversation and quote in one place.",
  },
  {
    icon: ChecklistIcon,
    title: "Checklist & itinerary",
    body: "A running to-do list and a printable day-of run sheet, so nothing falls through the cracks.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center overflow-x-hidden px-6">
      <section className="relative flex w-full max-w-3xl flex-col items-center py-24 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-forest/10 blur-3xl motion-safe:animate-[float_7s_ease-in-out_infinite]"
        />
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Est. 2026
        </p>
        <h1 className="mt-3 font-display text-6xl font-semibold text-forest sm:text-7xl">
          The Wedding Ledger
        </h1>
        <p className="mt-5 max-w-md text-base text-ink/80">
          Budget, venues, guests, and vendors — all in one free account. No
          spreadsheets, no per-vendor logins, no fee.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-forest px-5 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            Sign up free
          </Link>
        </div>
      </section>

      <FadeInSection>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 border-y border-hairline py-10 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="font-mono-numbers text-4xl font-semibold text-forest">
                {stat.prefix}
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </span>
              <p className="mt-1 text-sm text-ink/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeInSection>

      <div className="w-full max-w-3xl py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((feature, i) => (
            <FadeInSection key={feature.title} delayMs={i * 100}>
              <div className="flex h-full flex-col gap-3 rounded-lg border border-hairline bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10">
                  <feature.icon className="h-5 w-5 text-forest" />
                </div>
                <h3 className="font-display text-xl font-semibold text-forest">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink/70">{feature.body}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>

      <FadeInSection>
        <div className="mb-24 w-full max-w-3xl rounded-lg border border-hairline bg-card p-10 text-center shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Ready to start planning?
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Create your account in under a minute — no credit card, ever.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-full bg-forest px-6 py-2 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            Sign up free
          </Link>
        </div>
      </FadeInSection>
    </main>
  );
}
