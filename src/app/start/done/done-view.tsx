import Link from "next/link";
import { WrenMark } from "@/components/wren-mark";
import { WIDE_WIDTH } from "@/lib/layout";
import type { WeddingEstimate } from "@/lib/estimator";
import type { Wedding } from "@/lib/supabase/types";

/** To the nearest $100: an estimate shouldn't look more exact than it is. */
function money(n: number) {
  return `$${(Math.round(n / 100) * 100).toLocaleString("en-US")}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** What /start/done shows, given the saved wedding and its estimate (null when there's nothing to estimate from). */
export function DoneView({
  wedding,
  estimate,
}: {
  wedding: Pick<Wedding, "partner_a_name" | "partner_b_name" | "wedding_date" | "state" | "style_tier" | "guest_count_override">;
  estimate: WeddingEstimate | null;
}) {
  const guests = wedding.guest_count_override;
  const describe = [wedding.style_tier ? `A ${wedding.style_tier} wedding` : "A wedding", `for about ${guests} guests`, `in ${wedding.state}`].join(" ");

  const steps = [
    {
      href: "/venues",
      title: "Find your venue",
      body: "Your date, guest count and most vendors depend on it, so it’s the first big decision.",
    },
    {
      href: "/guests",
      title: "Start your guest list",
      body: "A rough list now tells you how big a venue you need. Bring it in from a spreadsheet if you have one.",
    },
    {
      href: "/checklist",
      title: "See your checklist",
      body: wedding.wedding_date
        ? `Timed to ${formatDate(wedding.wedding_date)}, so you’ll know what’s due this month and what can wait.`
        : "Everything to do, in order. Add your date and each task gets a due date.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center border-b border-hairline px-4 sm:h-[72px] sm:px-10">
        <WrenMark href="/dashboard" />
      </header>

      <main
        id="main-content"
        className={`mx-auto grid w-full ${WIDE_WIDTH} flex-1 gap-10 px-4 pb-32 pt-10 sm:px-10 lg:grid-cols-[5fr_6fr] lg:gap-[72px] lg:pb-16 lg:pt-16`}
      >
        <section className="animate-page-in flex flex-col">
          <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">All set</span>
          <h1 className="mt-3 font-display text-[40px] font-semibold leading-[1.04] text-forest sm:text-6xl">
            Your plan is ready, {wedding.partner_a_name} &amp; {wedding.partner_b_name}
          </h1>
          <p className="mt-4 max-w-[460px] text-base leading-relaxed text-ink/80 sm:text-lg">
            {wedding.wedding_date
              ? "I’ve set up your budget, checklist and countdown from what you told me."
              : "I’ve set up your dashboard from what you told me."}{" "}
            Here’s where I’d start.
          </p>

          {estimate ? (
            <div className="mt-8 rounded-2xl border-2 border-[#ffd301] bg-card p-5 shadow-[0_18px_44px_-20px_rgb(224_161_0/0.55)] sm:p-7">
              <p className="text-sm text-ink/80 sm:text-[15px]">{describe} usually comes to about</p>
              <p className="mt-1.5 font-mono-numbers text-4xl font-medium tabular-nums text-ink sm:text-[46px]">
                {money(estimate.total)}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/70 sm:text-sm">
                Most land between {money(estimate.low)} and {money(estimate.high)}. Your budget starts from this; change
                any line whenever you like.
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-hairline bg-card p-5 shadow-sm sm:p-7">
              <p className="text-[15px] leading-relaxed text-ink/80">
                Tell me where the wedding is and roughly how many guests, and I’ll estimate your budget. You can add
                both from your dashboard whenever you know.
              </p>
            </div>
          )}

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-parchment px-4 pb-7 pt-3 lg:static lg:mt-9 lg:border-0 lg:bg-transparent lg:p-0">
            <Link
              href="/dashboard"
              className="flex h-[52px] items-center justify-center rounded-md bg-forest text-base font-medium text-parchment transition-colors hover:bg-forest/90 lg:inline-flex lg:h-12 lg:px-8"
            >
              Go to my dashboard
            </Link>
          </div>
        </section>

        <section aria-labelledby="first-steps" className="flex flex-col gap-3 lg:pt-8">
          <h2 id="first-steps" className="mb-1 font-display text-2xl font-semibold text-forest sm:text-[28px]">
            Three good first steps
          </h2>
          {steps.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-start gap-4 rounded-xl border border-hairline bg-card px-4 py-4 transition-colors hover:border-forest sm:gap-5 sm:px-6 sm:py-5"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono-numbers text-sm sm:h-9 sm:w-9 ${
                  i === 0 ? "bg-forest text-parchment" : "border border-forest text-forest"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-base font-medium text-ink sm:text-lg">{s.title}</span>
                <span className="text-sm leading-relaxed text-ink/70 sm:text-[15px]">{s.body}</span>
              </span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
