import Link from "next/link";

/**
 * The "Ready to plan?" sign-up card, shared by the homepage and the Estimator
 * so the two stay identical: the page's one gold moment, with a slowly
 * flowing gold border, a few twinkles, and a button with a shine across it.
 * `row` puts the button beside the text from 1024px, for a wide column.
 */
export function CtaCard({
  title,
  body,
  href,
  label,
  eyebrow = "Free for couples",
  row = false,
  className = "",
}: {
  title: string;
  body: string;
  href: string;
  label: string;
  eyebrow?: string;
  row?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`gold-flow-border w-full rounded-3xl p-[2px] shadow-[0_24px_60px_-24px_rgba(224,161,0,0.7)] ${className}`}
    >
      <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-gradient-to-b from-white via-white to-[#fff8e1] px-6 py-12 text-center sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-[#ffe45c]/40 blur-3xl" />
        <span aria-hidden="true" className="gold-twinkle absolute left-[12%] top-8 text-lg text-brass">✦</span>
        <span aria-hidden="true" className="gold-twinkle absolute bottom-10 right-[14%] text-sm text-brass [animation-delay:0.8s]">✦</span>
        <span aria-hidden="true" className="gold-twinkle absolute left-[22%] bottom-8 text-xs text-brass [animation-delay:1.6s]">✦</span>
        <div
          className={`relative ${row ? "lg:flex lg:items-center lg:justify-between lg:gap-8 lg:text-left" : ""}`}
        >
          <div>
            <p className="font-mono-numbers text-[11px] uppercase tracking-[0.3em] text-[#9a6b00]">
              {eyebrow}
            </p>
            <h2
              className={`mt-3 font-display text-3xl font-semibold text-forest text-balance sm:text-5xl ${row ? "lg:text-4xl" : ""}`}
            >
              {title}
            </h2>
            <p
              className={`mx-auto mt-3 max-w-md text-sm text-ink/70 sm:text-base ${row ? "lg:mx-0" : ""}`}
            >
              {body}
            </p>
          </div>
          <Link
            href={href}
            className={`gold-shine relative mt-8 inline-flex shrink-0 overflow-hidden rounded-full bg-gradient-to-r from-[#c98a00] via-[#f2b400] to-[#ffc629] px-9 py-3.5 font-mono-numbers text-sm font-semibold uppercase tracking-[0.15em] text-forest shadow-[0_8px_30px_-6px_rgba(224,161,0,0.6)] transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass ${row ? "lg:mt-0" : ""}`}
          >
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}
