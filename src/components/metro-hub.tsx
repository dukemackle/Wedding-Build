import Link from "next/link";
import type { ReactNode } from "react";
import { metroHref, nearbyMetros, type Metro } from "@/lib/metros";

/**
 * The pieces the /venues/in/<metro> and /vendors/in/<metro> hubs share.
 * Approved mockup 2026-11-04 (owner): a fact panel beside the heading, chips,
 * priced cards, then every listing as a plain link list so nothing is hidden
 * behind the map. Server-rendered throughout: the links are the point.
 */

export function HubBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-ink hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type HubFact = { value: string; label: string; highlight?: boolean };

export function HubHero({
  title,
  highlight,
  lede,
  actions,
  facts,
  factsNote,
}: {
  /** Split around `highlight`, which gets the gold underline. */
  title: [string, string];
  highlight: string;
  lede: string;
  actions: ReactNode;
  facts: HubFact[];
  factsNote: string;
}) {
  return (
    <div className="grid gap-6 border-b border-hairline pb-8 pt-3 lg:grid-cols-[1.35fr_1fr] lg:gap-14 lg:pb-10">
      <div>
        <h1 className="mb-4 mt-2 font-display text-[44px] font-medium leading-[1.02] text-ink lg:text-[68px]">
          {title[0]}
          <span className="bg-[linear-gradient(transparent_68%,#ffd301_68%)]">{highlight}</span>
          {title[1]}
        </h1>
        <p className="mb-6 max-w-[40rem] text-[16.5px] leading-relaxed text-ink/80 lg:text-lg">{lede}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 self-end rounded-[20px] bg-[#fbf8f1] p-5 lg:gap-x-6 lg:gap-y-5 lg:p-7">
        {facts.map((fact) => (
          <div key={fact.label}>
            <b
              className={`font-display text-[32px] font-semibold leading-none text-ink lg:text-[40px] ${
                fact.highlight ? "inline-block rounded-lg bg-[#ffd301] px-2.5 py-0.5" : "block"
              }`}
            >
              {fact.value}
            </b>
            <span className="mt-1.5 block text-sm leading-snug text-ink/65">{fact.label}</span>
          </div>
        ))}
        <p className="col-span-2 border-t border-hairline pt-3.5 text-[12.5px] leading-normal text-ink/65">{factsNote}</p>
      </div>
    </div>
  );
}

export function HubButton({ href, primary, children }: { href: string; primary?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`btn-motion inline-flex h-[50px] items-center justify-center rounded-full px-6 font-medium transition-colors ${
        primary ? "bg-[#2243b6] text-white hover:bg-[#1b3796]" : "border-[1.5px] border-ink text-ink hover:bg-ink/5"
      }`}
    >
      {children}
    </Link>
  );
}

export function HubSection({
  title,
  sub,
  eyebrow,
  id,
  children,
}: {
  title: string;
  sub?: string;
  eyebrow?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 scroll-mt-24 py-8 lg:py-11">
      {eyebrow && <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink/60">{eyebrow}</span>}
      <h2 className="mb-1.5 font-display text-[30px] font-semibold leading-tight text-ink lg:text-[38px]">{title}</h2>
      {sub && <p className="mb-5 text-[15.5px] text-ink/65">{sub}</p>}
      {children}
    </section>
  );
}

export type HubChip = { label: string; count?: number; href: string; current?: boolean };

/** Wraps on desktop; one swipeable row on a phone. */
export function HubChips({ chips }: { chips: HubChip[] }) {
  return (
    <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          aria-current={chip.current ? "true" : undefined}
          className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[15px] transition-colors ${
            chip.current ? "border-ink bg-ink text-white" : "border-hairline bg-white text-ink hover:border-ink"
          }`}
        >
          {chip.label}
          {chip.count != null && <span className={`ml-1.5 ${chip.current ? "text-white/75" : "text-ink/55"}`}>{chip.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function HubCard({
  href,
  image,
  name,
  meta,
  price,
}: {
  href: string;
  image: string;
  name: string;
  meta: string;
  price?: string | null;
}) {
  return (
    <Link href={href} className="group grid grid-cols-[120px_1fr] items-center gap-3.5 sm:block">
      {/* eslint-disable-next-line @next/next/no-img-element -- listing photos come from many hosts; the drawings are local SVGs */}
      <img
        src={image}
        alt=""
        loading="lazy"
        className="aspect-[4/3] w-full rounded-xl bg-[#fbf8f1] object-cover transition-opacity group-hover:opacity-90 sm:rounded-[14px]"
      />
      <div>
        <h3 className="text-[16.5px] font-semibold text-ink group-hover:underline sm:mt-3">{name}</h3>
        <p className="mt-0.5 text-sm leading-snug text-ink/65">{meta}</p>
        {price && <p className="mt-1 text-sm font-medium text-ink">{price}</p>}
      </div>
    </Link>
  );
}

export function HubCardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">{children}</div>;
}

export type HubGroup = { id: string; title: string; items: { href: string; name: string; meta?: string | null }[] };

/** Every listing as a plain link, grouped (by town or category). */
export function HubGroupedList({ groups }: { groups: HubGroup[] }) {
  return (
    <div className="space-y-7">
      {groups.map((group) => (
        <div key={group.id} id={group.id} className="scroll-mt-24">
          <h3 className="mb-2 border-b border-hairline pb-1.5 text-[15px] font-semibold text-ink">
            {group.title} <span className="font-normal text-ink/55">{group.items.length}</span>
          </h3>
          <ul className="text-[14.5px] leading-[1.9] sm:columns-2 lg:columns-4 lg:gap-8">
            {group.items.map((item) => (
              <li key={item.href} className="break-inside-avoid">
                <Link href={item.href} className="text-ink hover:underline">
                  {item.name}
                </Link>
                {item.meta && <span className="text-ink/55"> · {item.meta}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function HubTiles({ tiles }: { tiles: { label: string; count: number; href: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="rounded-[14px] border border-hairline bg-white p-4 transition-colors hover:border-ink"
        >
          <b className="block font-medium text-ink">{tile.label}</b>
          <span className="text-[13.5px] text-ink/60">{tile.count}</span>
        </Link>
      ))}
    </div>
  );
}

export function HubEstimateBand({ metro }: { metro: Metro }) {
  return (
    <section className="py-8 lg:py-11">
      <div className="flex flex-col items-start gap-5 rounded-3xl bg-forest px-6 py-7 text-white lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-9">
        <div>
          <h2 className="mb-1.5 font-display text-[30px] font-semibold leading-tight lg:text-[34px]">
            What will your {metro.name} wedding cost?
          </h2>
          <p className="text-white/80">Get a budget for your guest count in about a minute. No signup.</p>
        </div>
        <Link
          href="/estimate"
          className="btn-motion inline-flex h-[50px] w-full shrink-0 items-center justify-center rounded-full bg-[#ffd301] px-6 font-medium text-forest transition-colors hover:bg-[#fff12f] lg:w-auto"
        >
          Estimate my budget
        </Link>
      </div>
    </section>
  );
}

export function HubNearby({ kind, metro }: { kind: "venues" | "vendors"; metro: Metro }) {
  return (
    <HubSection title="Nearby areas">
      <HubChips
        chips={nearbyMetros(metro).map((m) => ({
          label: `${m.name}, ${m.state}`,
          href: metroHref(kind, m),
        }))}
      />
    </HubSection>
  );
}

export function HubNote({ children }: { children: ReactNode }) {
  return <p className="border-t border-hairline pt-6 text-[13px] leading-relaxed text-ink/60">{children}</p>;
}
