import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { PublicNav } from "@/components/public-nav";
import { CtaCard } from "@/components/cta-card";
import { HomeEstimatorCard } from "@/components/home-estimator-card";
import { HeroSlideshow } from "@/components/landing/hero-slideshow";
import { LandingFeatures } from "@/components/landing/landing-features";
import { STANDARD_WIDTH, WIDE_WIDTH } from "@/lib/layout";
import { createClient } from "@/lib/supabase/server";
import type { RegionalCostData } from "@/lib/supabase/types";

export default async function Home() {
  const supabase = await createClient();
  const [{ data: regionalData }, { count: venueCount }, { count: vendorCount }] = await Promise.all([
    supabase.from("regional_cost_data").select("*").returns<RegionalCostData[]>(),
    supabase.from("venues").select("id", { count: "exact", head: true }).eq("active", true).eq("is_sample", false),
    supabase.from("vendors").select("id", { count: "exact", head: true }).eq("active", true).eq("is_sample", false),
  ]);
  // Live counts, rounded down so the row doesn't change every time a batch lands.
  const roughly = (n: number | null) => (n && n >= 100 ? `${(Math.floor(n / 100) * 100).toLocaleString("en-US")}+` : null);
  const venues = roughly(venueCount);
  const vendors = roughly(vendorCount);
  const coverage =
    venues && vendors ? `${venues} venues and ${vendors} vendors across all 50 states and DC` : null;

  return (
    <main className="flex flex-1 flex-col items-center overflow-x-hidden px-6">
      <PublicNav />

      {/* Hero, approved 2026-10-21 (direction B, https://claude.ai/artifact/Nk7e6ynP1YcrYgQvUdSKS4):
          real wedding photographs (a slow slideshow), full width and running up under the nav,
          one short line and one button. Replaces 2026-10-20's "product is the
          hero" layout, which the owner felt didn't read as a wedding site.
          `landing-photo` lets the nav go clear and white over it (globals.css). */}
      <section className="landing-photo relative -mx-6 -mt-[73px] flex min-h-[640px] flex-col justify-end self-stretch overflow-hidden bg-forest sm:min-h-[720px] sm:justify-center">
        <HeroSlideshow />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_16_32/0.45)_0%,rgb(10_16_32/0.05)_25%,rgb(10_16_32/0.45)_50%,rgb(10_16_32/0.85)_100%)] sm:bg-[linear-gradient(180deg,rgb(10_16_32/0.5)_0%,rgb(10_16_32/0)_22%),linear-gradient(90deg,rgb(10_16_32/0.75)_0%,rgb(10_16_32/0.45)_45%,rgb(10_16_32/0.1)_75%)]"
        />
        <div className={`relative mx-auto w-full ${WIDE_WIDTH} px-6 pb-12 pt-28 text-white sm:pb-24 sm:pt-32`}>
          <h1 className="max-w-[52rem] font-display text-[52px] [text-shadow:0_2px_24px_rgb(10_16_32/0.35)] font-medium leading-[1.02] sm:text-7xl lg:text-[92px] lg:leading-none">
            Wedding planning, <span className="italic text-[#ffd301] sm:block">made easy.</span>
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-white/90 sm:mt-6 sm:text-[21px]">
            Everything you need to plan your wedding. Free for couples.
          </p>
          <Link
            href="/signup"
            className="btn-motion mt-6 flex h-14 items-center justify-center rounded-full bg-[#ffd301] px-10 text-[17px] font-medium text-forest transition-colors hover:bg-[#fff12f] sm:mt-9 sm:inline-flex sm:h-[60px] sm:text-lg"
          >
            Start planning
          </Link>
        </div>
      </section>

      <div className={`relative z-10 mt-10 w-full ${STANDARD_WIDTH} sm:-mt-20`}>
        <HomeEstimatorCard regionalData={regionalData ?? []} />
      </div>

      {coverage && <p className="mt-10 text-center text-sm text-ink/70 sm:mt-12 sm:text-[15px]">{coverage}</p>}

      <div className={`w-full ${WIDE_WIDTH} py-16`}>
        <FadeInSection>
          <LandingFeatures />
        </FadeInSection>
      </div>

      <FadeInSection>
        <CtaCard
          title="Ready to start planning?"
          body="Create your account in under a minute — no credit card needed."
          href="/signup"
          label="Start planning"
          className="mb-24 max-w-3xl"
        />
      </FadeInSection>
    </main>
  );
}
