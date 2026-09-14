import Image from "next/image";
import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { AnimatedCounter } from "@/components/animated-counter";
import { HomeEstimatorCard } from "@/components/home-estimator-card";
import {
  HeadcountIcon,
  VendorsIcon,
  ChecklistIcon,
  BudgetIcon,
  AttireIcon,
  GuestbookIcon,
  GlobeIcon,
  WrenBirdIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import type { RegionalCostData } from "@/lib/supabase/types";

const stats: { value: number; prefix?: string; suffix?: string; label: string }[] = [
  { value: 15, suffix: "+", label: "planning tools in one place" },
  { value: 0, prefix: "$", label: "cost to plan your wedding" },
  { value: 0, suffix: "%", label: "of your data sold to third parties" },
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
  {
    icon: AttireIcon,
    title: "Attire",
    body: "Track dresses, suits, and rings — buy or rent, who's covering what, and when to order by.",
  },
  {
    icon: GuestbookIcon,
    title: "Guestbook",
    body: "Guests can leave a photo and message right from their RSVP, turned into a keepsake digital guestbook.",
  },
  {
    icon: GlobeIcon,
    title: "Public wedding site",
    body: "A free shareable site with your schedule and RSVP form — no separate website builder needed.",
  },
  {
    icon: WrenBirdIcon,
    title: "Ask Wren",
    body: "A built-in assistant that can answer questions about your budget, guest list, or what to do next.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: regionalData } = await supabase
    .from("regional_cost_data")
    .select("*")
    .returns<RegionalCostData[]>();

  return (
    <main className="flex flex-1 flex-col items-center overflow-x-hidden px-6">
      <section className="relative grid w-full max-w-6xl grid-cols-1 items-center gap-10 py-10 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-forest/10 blur-3xl motion-safe:animate-[float_7s_ease-in-out_infinite]"
        />
        <div className="flex flex-col items-start text-left">
          <Image
            src="/logo/wren-logo-hero.png"
            alt="Wren Wedding Planning"
            width={1452}
            height={856}
            priority
            className="h-auto w-full max-w-[34rem]"
          />
          <p className="mt-3 w-full max-w-[34rem] text-center font-display text-xl italic text-ink/70">
            Wedding planning, made easy.
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            Build your <span className="text-brass italic">dream</span> wedding.
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink/80">
            Plan, budget, venues, guests, and celebrate — all in one free account.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/signup"
              className="btn-motion rounded-full bg-forest px-6 py-2.5 font-display text-lg text-parchment transition-colors hover:bg-forest/90"
            >
              Sign up free
            </Link>
            <Link
              href="/login"
              className="btn-motion btn-motion-brass rounded-full border border-hairline bg-parchment px-6 py-2.5 font-display text-lg text-forest transition-colors hover:border-forest"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="w-full max-w-xl lg:justify-self-end">
          <HomeEstimatorCard regionalData={regionalData ?? []} />
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

      <div className="w-full max-w-5xl py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
