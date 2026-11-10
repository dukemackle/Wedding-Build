import type { ComponentType, ReactNode, SVGProps } from "react";
import { TrackedContactLink, telHref } from "@/components/tracked-contact-link";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  PhoneIcon,
  PinterestIcon,
  StarIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";
import { REPLY_TIMES, type ReplyTime } from "@/lib/business-facts";

/**
 * Pieces shared by the venue and vendor listing pages, so the two siblings
 * read the same: section headings with a gold label, the in-page section
 * links, the website and social buttons, the "what's included" checklist and
 * the joined price-and-contact panel.
 */

export const listingCard = "scroll-mt-24 rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8";

/** A gold label over a larger serif title, so each section says what it is at a glance. */
export function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brass">
        <span aria-hidden className="h-px w-5 bg-brass" />
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-display text-2xl font-semibold text-forest">{title}</h2>
      {sub && <p className="mt-1 text-sm text-ink/60">{sub}</p>}
    </div>
  );
}

/** Wide screens only: a row of jump links to the sections this listing has. */
export function ListingSectionNav({ sections }: { sections: [id: string, label: string][] }) {
  if (sections.length < 3) return null;
  return (
    <nav aria-label="On this page" className="hidden border-b border-hairline lg:block">
      <ul className="-mb-px flex flex-wrap gap-x-6">
        {sections.map(([id, label]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="inline-block border-b-2 border-transparent pb-3 text-sm font-medium text-ink/60 transition-colors hover:border-brass hover:text-forest"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
const LINK_ICONS: Record<string, Icon> = {
  Website: GlobeIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  Pinterest: PinterestIcon,
  TikTok: TikTokIcon,
  YouTube: YouTubeIcon,
  Reviews: StarIcon,
};

/** The website (the main one) and social profiles, as tracked buttons. */
export function ListingLinks({
  listingType,
  listingId,
  links,
  className = "",
}: {
  listingType: "venue" | "vendor";
  listingId: string;
  links: [label: string, href: string][];
  className?: string;
}) {
  if (links.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map(([label, href]) => {
        const Icon = LINK_ICONS[label] ?? GlobeIcon;
        const main = label === "Website";
        return (
          <TrackedContactLink
            key={label}
            listingType={listingType}
            listingId={listingId}
            kind={main ? "website" : "social"}
            href={href}
            className={`group inline-flex items-center gap-2 rounded-full border py-2 pl-3.5 pr-3 text-sm font-medium shadow-sm transition-all hover:-translate-y-px hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
              main
                ? "border-forest bg-forest text-parchment hover:border-brass"
                : "border-forest/20 bg-card text-forest hover:border-brass"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <ArrowUpRightIcon
              className={`h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none ${
                main ? "text-brass" : "text-ink/40 group-hover:text-brass"
              }`}
            />
          </TrackedContactLink>
        );
      })}
    </div>
  );
}

/** Splits a typed or pasted list ("• a\n• b", "- a\n- b") into its items; null when it's prose. */
export function listItems(text: string | null | undefined): string[] | null {
  if (!text) return null;
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/^[\s•·\-*–—▪◦]+/, "").trim())
    .filter(Boolean);
  if (lines.length < 3 || lines.some((l) => l.length > 160)) return null;
  // Prose broken over a few lines isn't a list: most lines of a list don't end a sentence.
  const sentences = lines.filter((l) => /[.!?]$/.test(l)).length;
  return sentences > lines.length / 2 ? null : lines;
}

/** "What's included" as a two-column checklist with gold ticks. */
export function IncludedChecklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-ink sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brass/20 text-forest">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span className="leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The price and the contact box as one card, so the price sits right above
 * the button that acts on it. The inner box's own card styling is dropped.
 */
export function ContactPanel({
  price,
  replyTime,
  children,
}: {
  price?: ReactNode;
  replyTime?: ReplyTime | null;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
      {price && <div className="border-b border-hairline px-6 pb-4 pt-5">{price}</div>}
      <div className="[&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none">{children}</div>
      {replyTime && (
        <p className="flex items-center gap-2 border-t border-hairline bg-parchment px-6 py-3 text-sm text-ink/70">
          <ClockIcon className="h-4 w-4 text-brass" />
          Usually replies {REPLY_TIMES[replyTime]}
        </p>
      )}
    </div>
  );
}

/** Tap-to-call as a full-width outlined button. */
export function PhoneButton({
  listingType,
  listingId,
  phone,
}: {
  listingType: "venue" | "vendor";
  listingId: string;
  phone: string;
}) {
  return (
    <TrackedContactLink
      listingType={listingType}
      listingId={listingId}
      kind="phone"
      href={telHref(phone)}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-forest/20 px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:border-brass"
    >
      <PhoneIcon className="h-4 w-4" />
      {phone}
    </TrackedContactLink>
  );
}
