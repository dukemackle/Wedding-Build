import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { PublicNav } from "@/components/public-nav";
import { CtaCard } from "@/components/cta-card";
import { HomeEstimatorCard } from "@/components/home-estimator-card";
import { LandingFeatures } from "@/components/landing/landing-features";
import { WIDE_WIDTH } from "@/lib/layout";
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
  const facts = [
    roughly(venueCount) && { strong: roughly(venueCount), rest: "venues" },
    roughly(vendorCount) && { strong: roughly(vendorCount), rest: "vendors" },
    { strong: null, rest: "All 50 states and DC" },
    { strong: null, rest: "Free for couples, start to finish" },
  ].filter((f): f is { strong: string | null; rest: string } => Boolean(f));

  return (
    <main className="flex flex-1 flex-col items-center overflow-x-hidden px-6">
      <PublicNav />

      {/* Hero, approved 2026-10-20 (direction A, https://claude.ai/artifact/QyvNJE735cjYK7Rf8XDWzi):
          the product is the hero. One headline in the brand's own words, the
          live estimator as the hero's gold moment, and on a computer a glimpse
          of the dashboard behind it. The mockup's guest-site phone was left
          out: three overlapping cards read as clutter. */}
      <section className={`grid w-full ${WIDE_WIDTH} grid-cols-1 items-center gap-10 pb-10 pt-20 sm:pt-10 lg:grid-cols-[11fr_10fr] lg:gap-14 lg:pb-14 lg:pt-12`}>
        <div className="flex flex-col">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.18em] text-brass">Free wedding planning</p>
          <h1 className="mt-4 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.01em] text-ink sm:text-6xl lg:text-[76px]">
            Everything before <span className="italic text-brass">&ldquo;I&nbsp;do,&rdquo;</span> made a whole lot easier.
          </h1>
          <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-ink/80 sm:text-lg lg:text-[19px]">
            Your budget, guest list, venues, vendors and wedding website in one calm place. Free for couples, start
            to finish.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="btn-motion flex h-[52px] items-center justify-center rounded-full bg-forest px-7 text-base font-medium text-parchment transition-colors hover:bg-forest/90 sm:text-[17px]"
            >
              Start planning free
            </Link>
            <Link
              href="/estimate"
              className="btn-motion btn-motion-brass hidden h-[52px] items-center justify-center rounded-full border border-hairline bg-card px-6 text-[17px] text-forest transition-colors hover:border-forest sm:flex"
            >
              See what your wedding costs
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink/70">
            Venue or vendor?{" "}
            <Link href="/list" className="font-medium text-brass hover:underline">
              List your business free
            </Link>
          </p>
        </div>

        <div className="relative w-full lg:h-[620px]">
          {/* A glimpse of the dashboard, behind the estimator. Decoration only. */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-2 hidden w-[440px] rotate-2 overflow-hidden rounded-2xl bg-card shadow-[0_30px_60px_-30px_rgb(20_32_61/0.35)] lg:block"
          >
            <div className="flex h-[88px] items-center justify-between bg-forest px-6">
              <span className="font-display text-3xl font-semibold text-parchment">Maya &amp; Jordan</span>
              <span className="font-mono-numbers text-[13px] text-parchment/85">236 days to go</span>
            </div>
            <div className="flex flex-col gap-1.5 px-6 py-4">
              <span className="font-mono-numbers text-[10px] uppercase tracking-[0.18em] text-brass">Your next step</span>
              <span className="font-display text-2xl font-semibold text-forest">Book your caterer</span>
              <span className="mt-1.5 grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-1 rounded-full ${i < 3 ? "bg-forest" : i === 3 ? "bg-[#ffd301]" : "bg-hairline"}`} />
                ))}
              </span>
            </div>
          </div>

          <div className="relative z-10 lg:absolute lg:left-0 lg:top-[188px] lg:w-[440px]">
            <HomeEstimatorCard regionalData={regionalData ?? []} />
          </div>

        </div>
      </section>

      <ul className={`grid w-full ${WIDE_WIDTH} grid-cols-2 gap-x-6 gap-y-2 border-t border-hairline py-6 text-sm text-ink/80 sm:text-[15px] lg:flex lg:justify-between`}>
        {facts.map((f) => (
          <li key={f.rest}>
            {f.strong && <strong className="font-mono-numbers font-medium text-forest">{f.strong}</strong>} {f.rest}
          </li>
        ))}
      </ul>

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
          label="Sign up free"
          className="mb-24 max-w-3xl"
        />
      </FadeInSection>
    </main>
  );
}
