import type { ComponentType, ReactNode, SVGProps } from "react";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import {
  ArrowUpRightIcon,
  CheckIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  PinterestIcon,
  StarIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";
import { REPLY_TIMES, type ReplyTime } from "@/lib/business-facts";

/**
 * Pieces shared by the venue and vendor listing pages, so the two siblings
 * read the same: the key-stats strip, section headings with a gold label,
 * the in-page section links, the social buttons, the "what's included"
 * checklist and the joined price-and-contact card.
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

export type KeyStat = { value: string; label: string; mark?: ReactNode };

/**
 * The few numbers a couple shortlists on, large, right under the name:
 * "8 years in business · ~45 weddings a year · replies in 1 day".
 * Short values get the big serif; worded ones ("Venue only") a smaller size.
 */
export function KeyStats({ stats }: { stats: KeyStat[] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="mt-5 grid grid-cols-2 gap-y-4 border-y border-hairline py-4 sm:flex sm:flex-wrap sm:gap-y-3 sm:divide-x sm:divide-hairline">
      {stats.map((s) => {
        const short = s.value.length <= 8;
        return (
          <div key={s.label} className="flex flex-col-reverse pr-4 sm:px-6 sm:first:pl-0">
            <dt className="mt-0.5 text-xs uppercase tracking-wide text-ink/55">{s.label}</dt>
            <dd
              className={`font-display font-semibold leading-tight text-forest ${short ? "text-3xl" : "text-xl sm:pt-1.5"}`}
            >
              {s.value}
              {s.mark}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** "Same day", "1 day"... for the stats strip. */
export const REPLY_SHORT: Record<ReplyTime, string> = {
  same_day: "Same day",
  one_day: "1 day",
  few_days: "2–3 days",
  week: "1 week",
};

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
const SOCIAL_ICONS: Record<string, Icon> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  Pinterest: PinterestIcon,
  TikTok: TikTokIcon,
  YouTube: YouTubeIcon,
  Reviews: StarIcon,
};

/** Social profiles as round icon buttons under the name; the website lives in the contact card. */
export function SocialLinks({
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
  const social = links.filter(([label]) => label !== "Website");
  if (social.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {social.map(([label, href]) => {
        const Icon = SOCIAL_ICONS[label] ?? GlobeIcon;
        return (
          <TrackedContactLink
            key={label}
            listingType={listingType}
            listingId={listingId}
            kind="social"
            href={href}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 bg-card text-forest shadow-sm transition-all hover:-translate-y-px hover:border-brass hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="sr-only">
              {label === "Reviews" ? "Reviews" : `${label} profile`} (opens in a new tab)
            </span>
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

/** The line under "Request a quote": how fast they reply, else what sending involves. */
export function requestSubtext(replyTime: ReplyTime | null | undefined): string {
  return replyTime ? `Usually replies ${REPLY_TIMES[replyTime]}` : "Free · your date and guest count are filled in";
}

const tel = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const rowClass =
  "flex items-center justify-between gap-4 border-t border-hairline px-6 py-3.5 text-sm transition-colors hover:bg-parchment";

/**
 * The price, the contact box and one row per way to reach them (website,
 * phone, directions) as one card, so the price sits right above the button
 * that acts on it. The inner box's own card styling is dropped.
 */
export function ContactPanel({
  listingType,
  listingId,
  price,
  website,
  phone,
  directions,
  children,
}: {
  listingType: "venue" | "vendor";
  listingId: string;
  price?: ReactNode;
  website?: string | null;
  /** Signed-in visitors only; the public columns don't carry it. */
  phone?: string | null;
  directions?: { href: string; address: string | null } | null;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
      {price && <div className="border-b border-hairline px-6 pb-4 pt-5">{price}</div>}
      <div className="[&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none">{children}</div>
      {website && (
        <TrackedContactLink listingType={listingType} listingId={listingId} kind="website" href={website} className={rowClass}>
          <span className="min-w-0">
            <span className="block truncate font-medium text-forest">{host(website)}</span>
            <span className="block text-xs text-ink/55">Their website</span>
          </span>
          <ArrowUpRightIcon className="h-5 w-5 shrink-0 text-brass" />
        </TrackedContactLink>
      )}
      {phone && (
        <TrackedContactLink listingType={listingType} listingId={listingId} kind="phone" href={tel(phone)} className={rowClass}>
          <span>
            <span className="block font-medium text-forest">{phone}</span>
            <span className="block text-xs text-ink/55">Call them</span>
          </span>
          <PhoneIcon className="h-5 w-5 shrink-0 text-brass" />
        </TrackedContactLink>
      )}
      {directions && (
        <a href={directions.href} target="_blank" rel="noreferrer" className={rowClass}>
          <span className="min-w-0">
            <span className="block font-medium text-forest">Get directions</span>
            {directions.address && <span className="block truncate text-xs text-ink/55">{directions.address}</span>}
          </span>
          <MapPinIcon className="h-5 w-5 shrink-0 text-brass" />
        </a>
      )}
    </div>
  );
}
