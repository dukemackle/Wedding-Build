import Link from "next/link";

/**
 * The "Ready to plan?" sign-up card, shared by the homepage and the Estimator
 * so the two stay identical: a white card outlined and lit in Gold, with a
 * Gold button. Gold is too light for white text, so the button's words are navy.
 * `row` puts the button beside the text from 1024px, for a wide column.
 */
export function CtaCard({
  title,
  body,
  href,
  label,
  row = false,
  className = "",
}: {
  title: string;
  body: string;
  href: string;
  label: string;
  row?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`w-full rounded-lg border-2 border-[#FFD301] bg-card p-8 text-center shadow-[0_8px_30px_-6px_rgba(255,211,1,0.55)] sm:p-10 ${
        row ? "lg:flex lg:items-center lg:justify-between lg:gap-8 lg:text-left" : ""
      } ${className}`}
    >
      <div>
        <h2 className="font-display text-3xl font-semibold text-forest">{title}</h2>
        <p className={`mx-auto mt-2 max-w-md text-sm text-ink/70 ${row ? "lg:mx-0 lg:max-w-none" : ""}`}>
          {body}
        </p>
      </div>
      <Link
        href={href}
        className={`btn-motion mt-6 inline-block shrink-0 rounded-full bg-[#FFD301] px-7 pb-3 pt-2 font-display text-lg font-semibold text-[#14203d] shadow-md hover:bg-[#FFF12F] ${
          row ? "lg:mt-0" : ""
        }`}
      >
        {label}
      </Link>
    </div>
  );
}
