"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SiteDesign } from "@/lib/site-design";
import { MAX_DESIGNS } from "@/lib/site-designs";
import { createDesign, deleteDesign, makeDesignLive, renameDesign, setSharedWording } from "./actions";
import type { DesignSummary } from "./load-designs";
import { SitePageThumb } from "./site-page-thumb";

type Starter = { id: string; name: string; blurb: string; design: SiteDesign };

/**
 * Your designs (the approved mockup): every design the couple has made, the
 * live one marked, each with a menu to open, make live, rename, duplicate,
 * share wording or delete. Below, a row of templates to start another from.
 */
export function DesignsHome({
  designs,
  starters,
  templateCount,
  liveUrl,
}: {
  designs: DesignSummary[];
  starters: Starter[];
  templateCount: number;
  liveUrl: string | null;
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const full = designs.length >= MAX_DESIGNS;
  const live = designs.find((d) => d.live);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">Your guest site</h1>
          <p className="mt-1 text-ink/60">
            {!designs.length
              ? "Pick a template to start. You can make a few designs and choose your favourite."
              : !live
                ? "None of these is live yet. Open one and publish it when you're happy."
                : liveUrl
                  ? <>Guests see the one marked Live at <span className="break-all">{liveUrl.replace(/^https?:\/\//, "")}</span></>
                  : <>Your site is off, so guests can&rsquo;t see any of these. Turn it on and they&rsquo;ll see &ldquo;{live.name}&rdquo;.</>}
          </p>
        </div>
        <div className="flex shrink-0 gap-2.5">
          {liveUrl && live && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(liveUrl).then(
                  () => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  },
                  () => setError("Couldn't copy the link. It's " + liveUrl),
                );
              }}
              className="h-11 rounded-full border border-hairline bg-card px-5 text-sm font-medium text-ink hover:border-ink/30"
            >
              {copied ? "Link copied" : "Copy link"}
            </button>
          )}
          {!full && (
            <Link
              href="/guests/site/templates"
              className="flex h-11 items-center rounded-full bg-[#2243B6] px-5 text-sm font-medium text-white hover:bg-[#2243B6]/90"
            >
              + New design
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:gap-6 lg:grid-cols-4">
        {designs.map((d) => (
          <DesignCard
            key={d.id}
            design={d}
            canAdd={!full}
            siteOn={Boolean(liveUrl)}
            menuOpen={menuFor === d.id}
            onMenu={(open) => setMenuFor(open ? d.id : null)}
            onError={setError}
          />
        ))}
        {!full ? (
          <Link href="/guests/site/templates" className="group flex flex-col">
            <span className="flex aspect-[4/5] flex-col items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-ink/20 bg-card text-sm text-ink/60 group-hover:border-ink/40 sm:aspect-[4/3]">
              <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#2243B6] text-2xl text-white">
                +
              </span>
              {designs.length ? "Start a new design" : "Pick a template"}
            </span>
          </Link>
        ) : (
          <p className="col-span-2 self-center text-sm text-ink/60 lg:col-span-1">
            That&apos;s {MAX_DESIGNS} designs, the most you can keep. Delete one to start another.
          </p>
        )}
      </div>

      <div className="mt-12 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-forest sm:text-[28px]">Start from a template</h2>
        <Link href="/guests/site/templates" className="shrink-0 text-sm font-medium text-[#2243B6] hover:underline">
          See all {templateCount} →
        </Link>
      </div>
      <div className="-mx-6 mt-4 flex gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-5 sm:overflow-visible sm:px-0">
        {starters.map((t) => (
          <Link key={t.id} href={`/guests/site/templates?t=${t.id}`} className="group flex w-[42%] shrink-0 flex-col sm:w-auto">
            <span className="relative block aspect-[4/5] overflow-hidden rounded-[14px] border border-hairline group-hover:border-ink/30 sm:aspect-[4/3]">
              <SitePageThumb design={t.design} />
            </span>
            <span className="mt-2.5 truncate font-medium text-ink">{t.name}</span>
            <span className="line-clamp-2 text-[13px] leading-snug text-ink/55">{t.blurb}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DesignCard({
  design: d,
  canAdd,
  siteOn,
  menuOpen,
  onMenu,
  onError,
}: {
  design: DesignSummary;
  siteOn: boolean;
  canAdd: boolean;
  menuOpen: boolean;
  onMenu: (open: boolean) => void;
  onError: (message: string | null) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(d.name);

  function run(action: () => Promise<{ error?: string; id?: string }>, after?: (id?: string) => void) {
    onError(null);
    start(async () => {
      const result = await action().catch(() => ({ error: "Couldn't reach the server — check your connection." }) as { error?: string; id?: string });
      if (result.error) {
        onError(result.error);
        return;
      }
      onMenu(false);
      setRenaming(false);
      if (after) after(result.id);
      else router.refresh();
    });
  }

  const item = "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[15px] hover:bg-ink/5 disabled:opacity-40 sm:py-2 sm:text-sm";

  return (
    <div className={`relative flex flex-col ${pending ? "opacity-60" : ""}`}>
      <Link href={`/guests/site/edit/${d.id}`} className="group block">
        <span className="relative block aspect-[4/5] overflow-hidden rounded-[14px] border border-hairline group-hover:border-ink/30 sm:aspect-[4/3]">
          <SitePageThumb design={d.design} />
        </span>
      </Link>
      <button
        type="button"
        aria-label={`More for ${d.name}`}
        aria-expanded={menuOpen}
        onClick={() => onMenu(!menuOpen)}
        className="absolute right-2 top-2 flex h-8 w-10 items-center justify-center rounded-[10px] bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.15)] hover:bg-white/90"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      <div className="mt-2.5 flex min-w-0 items-center gap-2">
        <Link href={`/guests/site/edit/${d.id}`} className="truncate font-medium text-ink hover:underline">
          {d.name}
        </Link>
        {/* "Live" only while the site is actually on; with it off, the chosen
            design says so rather than claiming guests can see it. */}
        {d.live &&
          (siteOn ? (
            <span className="shrink-0 rounded-full bg-[#FFD301] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#14203d]">
              Live
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-ink/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink/55">
              Site off
            </span>
          ))}
      </div>
      <span className="truncate text-[13px] text-ink/55" suppressHydrationWarning>
        Edited {ago(d.updatedAt)}
        {d.sharedWording ? "" : " · own wording"}
      </span>

      {menuOpen && (
        <>
          {/* Tapping anywhere else closes it; on a phone it also dims the page under the sheet. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => {
              onMenu(false);
              setRenaming(false);
            }}
            className="fixed inset-0 z-40 cursor-default bg-[#14203d]/40 sm:bg-transparent"
          />
          <div
            role="menu"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[18px] bg-white text-ink px-2.5 pb-6 pt-2 shadow-[0_-10px_40px_rgba(20,32,61,0.3)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-2 sm:top-12 sm:w-64 sm:rounded-xl sm:p-1.5 sm:pb-1.5 sm:shadow-[0_8px_30px_rgba(20,32,61,0.2)]"
          >
            <span aria-hidden="true" className="mx-auto mb-2 block h-1 w-10 rounded bg-ink/20 sm:hidden" />
            <p className="truncate px-3 pb-1 text-xs font-medium text-ink/50 sm:hidden">{d.name}</p>
            {renaming ? (
              <form
                className="flex flex-col gap-2 p-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => renameDesign(d.id, name));
                }}
              >
                <label className="text-xs font-medium text-ink/60" htmlFor={`name-${d.id}`}>
                  Name
                </label>
                <input
                  id={`name-${d.id}`}
                  autoFocus
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-lg border border-hairline px-3 text-base text-ink sm:text-sm"
                />
                <button type="submit" disabled={pending} className="h-10 rounded-lg bg-[#2243B6] text-sm font-medium text-white">
                  Save name
                </button>
              </form>
            ) : (
              <>
                <Link role="menuitem" href={`/guests/site/edit/${d.id}`} className={item}>
                  Open
                </Link>
                {!d.live && (
                  <button
                    role="menuitem"
                    type="button"
                    disabled={pending}
                    className={item}
                    onClick={() => {
                      if (confirm(`Make “${d.name}” the site guests see? It goes live straight away.`)) {
                        run(() => makeDesignLive(d.id));
                      }
                    }}
                  >
                    Make this the live site
                  </button>
                )}
                <button role="menuitem" type="button" className={item} onClick={() => setRenaming(true)}>
                  Rename
                </button>
                <button
                  role="menuitem"
                  type="button"
                  disabled={pending || !canAdd}
                  className={item}
                  onClick={() => run(() => createDesign({ copyOf: d.id }))}
                >
                  Duplicate
                </button>
                <div className="my-1 h-px bg-hairline" />
                <button
                  role="menuitemcheckbox"
                  aria-checked={d.sharedWording}
                  type="button"
                  disabled={pending}
                  className={`${item} justify-between gap-3`}
                  onClick={() => {
                    if (
                      !d.sharedWording &&
                      !confirm("This design's own wording will be replaced by your shared wording. Carry on?")
                    ) {
                      return;
                    }
                    run(() => setSharedWording(d.id, !d.sharedWording));
                  }}
                >
                  Use my shared wording
                  <span
                    aria-hidden="true"
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${d.sharedWording ? "bg-[#2243B6]" : "bg-ink/20"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${d.sharedWording ? "right-0.5" : "left-0.5"}`}
                    />
                  </span>
                </button>
                <p className="px-3 pb-2 text-xs leading-snug text-ink/55">
                  {d.sharedWording
                    ? "On: your headings' words match your other linked designs."
                    : "Off: this design keeps its own words in its headings."}
                </p>
                <div className="my-1 h-px bg-hairline" />
                <button
                  role="menuitem"
                  type="button"
                  disabled={pending || d.live}
                  title={d.live ? "Make another design live first" : undefined}
                  className={`${item} text-red-700`}
                  onClick={() => {
                    if (confirm(`Delete “${d.name}”? This can't be undone.`)) run(() => deleteDesign(d.id));
                  }}
                >
                  {d.live ? "Can't delete the live design" : "Delete"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** "2 hours ago", "yesterday", "3 days ago". */
function ago(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 30],
    ["month", 12],
    ["year", Infinity],
  ];
  let value = seconds;
  for (const [unit, size] of steps) {
    if (Math.abs(value) < size) return unit === "second" ? "just now" : format.format(Math.round(value), unit);
    value /= size;
  }
  return "";
}
