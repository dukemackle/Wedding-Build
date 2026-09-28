import { BrandRings } from "@/components/brand-rings";
import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { AnimatedCounter } from "@/components/animated-counter";
import { HomeEstimatorCard } from "@/components/home-estimator-card";
import { LandingFeatures } from "@/components/landing/landing-features";
import { WIDE_WIDTH } from "@/lib/layout";
import { createClient } from "@/lib/supabase/server";
import type { RegionalCostData } from "@/lib/supabase/types";

const stats: { value: number; prefix?: string; suffix?: string; label: string }[] = [
  { value: 15, suffix: "+", label: "planning tools in one place" },
  { value: 0, prefix: "$", label: "cost to plan your wedding" },
  { value: 50, label: "states covered" },
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
          className="pointer-events-none absolute -top-10 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-brass/15 blur-3xl motion-safe:animate-[float_7s_ease-in-out_infinite]"
        />
        <div className="flex flex-col items-start text-left">
          <div className="flex w-full max-w-[34rem] flex-col items-center">
            <BrandRings className="h-auto w-full max-w-88 sm:max-w-112" />
            <p className="mt-2 font-display text-5xl font-semibold text-ink sm:text-6xl">
              You do, <span className="italic text-[#d99a00]">I do</span>
            </p>
          </div>
          <p className="mt-4 w-full max-w-[34rem] text-center font-display text-xl italic text-ink/70">
            You do the dreaming. We do the planning.
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            Build your <span className="italic text-[#d99a00]">dream</span> wedding.
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink/80">
            Plan, budget, venues, guests, and celebrate — all in one free account.
          </p>
          {/* Centred in the same column the logo and tagline are centred in,
              so the block reads as one piece rather than a centred mark over
              a left-aligned stack. */}
          <div className="mt-6 flex w-full max-w-[34rem] items-center justify-center gap-3">
            <Link
              href="/signup"
              className="btn-motion rounded-full border border-transparent bg-forest px-6 pb-3 pt-2 font-display text-lg text-parchment transition-colors hover:bg-forest/90"
            >
              Sign up free
            </Link>
            <Link
              href="/login"
              className="btn-motion btn-motion-brass rounded-full border border-hairline bg-parchment px-6 pb-3 pt-2 font-display text-lg text-forest transition-colors hover:border-forest"
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

      <div className={`w-full ${WIDE_WIDTH} py-16`}>
        <FadeInSection>
          <LandingFeatures />
        </FadeInSection>
      </div>

      <FadeInSection>
        {/* The page's one gold moment: a slowly flowing gold border, the rings
            large and faint behind, and a button with a shine across it. */}
        <div className="gold-flow-border mb-24 w-full max-w-3xl rounded-3xl p-[2px] shadow-[0_24px_60px_-24px_rgba(224,161,0,0.7)]">
          <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-gradient-to-b from-white via-white to-[#fff8e1] px-6 py-12 text-center sm:px-12 sm:py-14">
            <BrandRings className="pointer-events-none absolute -bottom-10 -right-12 w-64 opacity-[0.12] sm:w-80" />
            <div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-[#ffe45c]/40 blur-3xl" />
            <span aria-hidden="true" className="gold-twinkle absolute left-[12%] top-8 text-lg text-brass">✦</span>
            <span aria-hidden="true" className="gold-twinkle absolute bottom-10 right-[14%] text-sm text-brass [animation-delay:0.8s]">✦</span>
            <span aria-hidden="true" className="gold-twinkle absolute left-[22%] bottom-8 text-xs text-brass [animation-delay:1.6s]">✦</span>
            <div className="relative">
              <p className="font-mono-numbers text-[11px] uppercase tracking-[0.3em] text-[#9a6b00]">
                Free for couples
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-forest text-balance sm:text-5xl">
                Ready to start planning?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-ink/70 sm:text-base">
                Create your account in under a minute — no credit card, ever.
              </p>
              <Link
                href="/signup"
                className="gold-shine relative mt-8 inline-flex overflow-hidden rounded-full bg-gradient-to-r from-[#c98a00] via-[#f2b400] to-[#ffc629] px-9 py-3.5 font-mono-numbers text-sm font-semibold uppercase tracking-[0.15em] text-forest shadow-[0_8px_30px_-6px_rgba(224,161,0,0.6)] transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </FadeInSection>
    </main>
  );
}
