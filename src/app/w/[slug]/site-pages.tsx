"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { SHOW_SECTION_MESSAGE, useSiteDesign, useTextEditing } from "@/components/guest-site-theme";
import { blockIdOf, type SectionKey } from "@/lib/site-design";
import { SectionLayout } from "./section-layout";

type Page = { id: string; label: string; keys: SectionKey[] };

// More than this many tabs and the rest go under "More" on a computer.
const MAX_TABS = 7;

/**
 * The guest site as tabs or as one long page (Sections › How guests get
 * around).
 *
 * With tabs, Home is the top of the page and every titled section is a tab
 * of its own, in the couple's order. An untitled block (a quote, a photo)
 * stays with the tab before it. Each tab is a #link (#rsvp, #travel), so the
 * RSVP button, invitation emails and the Back button all land on the right
 * one. On a computer the tabs run across a bar; on a phone they open from a
 * Menu button. RSVP stays in the bar on both.
 */
export function SitePages({
  hero,
  sections,
  photos,
  labels,
  title,
}: {
  hero: ReactNode;
  sections: Partial<Record<SectionKey, ReactNode>>;
  photos: string[];
  /** Each section's tab name; null for a block that joins the tab before it. */
  labels: Partial<Record<SectionKey, string | null>>;
  /** The couple's names, for the bar. */
  title: string;
}) {
  const design = useSiteDesign();
  const { editable } = useTextEditing();
  const tabs = design.navigation === "tabs";

  const pages = useMemo(() => {
    const list: Page[] = [{ id: "home", label: "Home", keys: [] }];
    const taken = new Set(["home"]);
    for (const x of design.sections) {
      if (x.hidden || sections[x.id] == null) continue;
      const label = labels[x.id];
      if (!label) {
        list[list.length - 1].keys.push(x.id);
        continue;
      }
      let id = blockIdOf(x.id) ? slugify(label) || "section" : x.id;
      for (let n = 2; taken.has(id); n++) id = `${slugify(label) || "section"}-${n}`;
      taken.add(id);
      list.push({ id, label, keys: [x.id] });
    }
    return list;
  }, [design.sections, sections, labels]);

  const hash = useSyncExternalStore(tabs ? subscribeHash : noSubscribe, () => window.location.hash, () => "");
  const active = useMemo(() => {
    let id = decodeURIComponent(hash.replace(/^#/, ""));
    if (id === "photo-wall") id = "wall";
    return pages.find((p) => p.id === id) ?? pages.find((p) => p.keys.includes(id as SectionKey)) ?? pages[0];
  }, [hash, pages]);
  const contentRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // Opening a section in the editor opens its tab in the preview.
  useEffect(() => {
    if (!tabs || !editable) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== SHOW_SECTION_MESSAGE) return;
      const page = pages.find((p) => p.keys.includes(event.data.section));
      if (page) setHash(page.id, true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [tabs, editable, pages]);

  // After a tab is picked, screen readers start at its content.
  useEffect(() => {
    if (moved.current) contentRef.current?.focus({ preventScroll: true });
    moved.current = false;
  }, [active.id]);

  const go = useCallback((id: string) => {
    moved.current = true;
    setHash(id, false);
  }, []);

  if (!tabs) {
    return (
      <>
        {hero}
        <SectionLayout sections={sections} photos={photos} />
      </>
    );
  }

  const index = pages.indexOf(active);
  const next = pages[index + 1];

  return (
    <>
      <SiteBar pages={pages} active={active.id} go={go} title={title} />
      <div ref={contentRef} tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {active.id === "home" && hero}
        {active.keys.length > 0 && (
          <div className={active.id === "home" ? "pt-8" : "pt-8 sm:pt-12"}>
            <SectionLayout key={active.id} sections={sections} photos={photos} only={active.keys} />
          </div>
        )}
        {pages.length > 1 && (
          <div className="flex justify-center px-4 pb-16 pt-2">
            <a
              href={next ? `#${next.id}` : "#"}
              onClick={(e) => {
                e.preventDefault();
                go(next ? next.id : "home");
              }}
              className="btn-motion inline-flex items-center gap-2 rounded-full border border-forest/30 px-5 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
            >
              {next ? (
                <>
                  Next: {next.label} <span aria-hidden="true">→</span>
                </>
              ) : (
                "Back to home"
              )}
            </a>
          </div>
        )}
      </div>
    </>
  );
}

// The open tab lives in the address (#rsvp), so Back, Forward, a shared link
// and any #link on the page (the top of the page's RSVP button) all move it.
// pushState fires no event of its own, hence TAB_EVENT.
const TAB_EVENT = "wren:site-tab";

// One long page leaves #links to the browser.
const noSubscribe = () => () => {};

function subscribeHash(onChange: () => void) {
  const changed = (e: Event) => {
    if (e.type !== TAB_EVENT || !(e as CustomEvent<boolean>).detail) window.scrollTo(0, 0);
    onChange();
  };
  window.addEventListener("hashchange", changed);
  window.addEventListener("popstate", changed);
  window.addEventListener(TAB_EVENT, changed);
  return () => {
    window.removeEventListener("hashchange", changed);
    window.removeEventListener("popstate", changed);
    window.removeEventListener(TAB_EVENT, changed);
  };
}

/** Opens a tab; `quiet` (from the editor) replaces the address and keeps the scroll. */
function setHash(id: string, quiet: boolean) {
  const url = `${window.location.pathname}${window.location.search}${id === "home" ? "" : `#${id}`}`;
  if (quiet) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
  window.dispatchEvent(new CustomEvent(TAB_EVENT, { detail: quiet }));
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/**
 * The bar across the top. A computer gets the tabs in a row, the overflow
 * under "More"; a phone gets the names, RSVP and a Menu button that opens
 * the tabs as a full-screen list.
 */
function SiteBar({
  pages,
  active,
  go,
  title,
}: {
  pages: Page[];
  active: string;
  go: (id: string) => void;
  title: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLLIElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const rsvp = pages.find((p) => p.id === "rsvp");
  const links = pages.filter((p) => p !== rsvp);
  const inRow = links.length > MAX_TABS ? links.slice(0, MAX_TABS - 1) : links;
  const inMore = links.slice(inRow.length);

  useEffect(() => {
    if (!menuOpen && !moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setMoreOpen(false);
    };
    const onClick = (e: globalThis.MouseEvent) => {
      if (moreOpen && !moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen, moreOpen]);

  // The open menu holds the screen: the page behind it doesn't scroll.
  useEffect(() => {
    if (!menuOpen) return;
    firstLink.current?.focus();
    const was = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = was;
    };
  }, [menuOpen]);

  const pick = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    setMoreOpen(false);
    go(id);
  };
  const href = (id: string) => (id === "home" ? "#" : `#${id}`);

  const rsvpButton = rsvp && (
    <a
      href="#rsvp"
      onClick={pick("rsvp")}
      aria-current={active === "rsvp" ? "page" : undefined}
      className="btn-motion shrink-0 rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
    >
      RSVP
    </a>
  );

  // The menu sits beside the bar, not in it: the bar's blur would pin a
  // fixed child to the bar instead of the screen.
  return (
    <>
    <nav
      aria-label="Wedding website"
      className="site-bar sticky top-0 z-30 border-b border-hairline bg-parchment/95 backdrop-blur supports-[backdrop-filter]:bg-parchment/85"
    >
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:h-16 lg:px-10">
        <a
          href="#"
          onClick={pick("home")}
          className="min-w-0 truncate text-lg text-forest [font-family:var(--font-names,var(--font-display))] [font-style:var(--site-name-style)] lg:text-xl"
        >
          {title}
        </a>

        {/* Computer: the tabs in a row. */}
        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {inRow.map((p) => (
            <li key={p.id}>
              <a
                href={href(p.id)}
                onClick={pick(p.id)}
                aria-current={active === p.id ? "page" : undefined}
                className={`relative block whitespace-nowrap rounded-md px-3 py-2 text-[15px] transition-colors after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--site-accent)] after:transition-transform after:duration-200 motion-reduce:after:transition-none ${
                  active === p.id ? "text-forest after:scale-x-100" : "text-ink/70 after:scale-x-0 hover:text-forest"
                }`}
              >
                {p.label}
              </a>
            </li>
          ))}
          {inMore.length > 0 && (
            <li ref={moreRef} className="relative">
              <button
                type="button"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((o) => !o)}
                className={`flex items-center gap-1 rounded-md px-3 py-2 text-[15px] transition-colors hover:text-forest ${
                  inMore.some((p) => p.id === active) ? "text-forest" : "text-ink/70"
                }`}
              >
                More
                <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`}>
                  <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {moreOpen && (
                <ul className="absolute right-0 top-full mt-2 min-w-48 rounded-lg border border-hairline bg-card py-1.5 shadow-lg">
                  {inMore.map((p) => (
                    <li key={p.id}>
                      <a
                        href={href(p.id)}
                        onClick={pick(p.id)}
                        aria-current={active === p.id ? "page" : undefined}
                        className={`block px-4 py-2 text-[15px] hover:bg-ink/5 ${active === p.id ? "font-medium text-forest" : "text-ink/80"}`}
                      >
                        {p.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
        </ul>
        <div className="flex items-center gap-2 max-lg:ml-auto lg:ml-3">
          {rsvpButton}
          {/* Phone: everything else behind Menu. */}
          {links.length > 1 && (
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5 text-sm font-medium text-ink lg:hidden"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path d="M3 6h14M3 10h14M3 14h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Menu
            </button>
          )}
        </div>
      </div>
    </nav>

      {menuOpen && (
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="site-menu fixed inset-0 z-50 flex flex-col overflow-y-auto bg-parchment lg:hidden"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-hairline px-4 sm:px-6">
            <span className="min-w-0 truncate text-lg text-forest [font-family:var(--font-names,var(--font-display))] [font-style:var(--site-name-style)]">{title}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5 text-sm font-medium text-ink"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Close
            </button>
          </div>
          <ul className="flex flex-col px-6 py-4 sm:px-10">
            {links.map((p, i) => (
              <li key={p.id} className="site-menu-item border-b border-hairline" style={{ animationDelay: `${i * 30}ms` }}>
                <a
                  ref={i === 0 ? firstLink : undefined}
                  href={href(p.id)}
                  onClick={pick(p.id)}
                  aria-current={active === p.id ? "page" : undefined}
                  className="flex items-center justify-between gap-3 py-4 font-display text-2xl text-forest"
                >
                  {p.label}
                  {active === p.id && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--site-accent)]" />}
                </a>
              </li>
            ))}
          </ul>
          {rsvp && (
            <div className="mt-auto px-6 pb-8 pt-4 sm:px-10">
              <a
                href="#rsvp"
                onClick={pick("rsvp")}
                className="btn-motion block rounded-full bg-forest py-3.5 text-center text-base font-medium text-parchment"
              >
                RSVP
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
