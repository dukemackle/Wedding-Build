"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { adminSearch, type SearchGroup, type SearchHit } from "./search-actions";

/**
 * One box that finds anything in the admin: pages by name straight away, and
 * couples, venues, vendors, claims and feedback from the database as you type.
 * Ctrl/⌘-K focuses it from anywhere; arrows and Enter pick a result.
 */
export function AdminSearch({ pages, onNavigate }: { pages: SearchHit[]; onNavigate?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchGroup[]>([]);
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<{ top: number; left: number; width: number } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    let stale = false;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const groups = await adminSearch(term);
        if (!stale) setResults(groups);
      });
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [q]);

  const term = q.trim().toLowerCase();
  const pageHits = term ? pages.filter((p) => p.title.toLowerCase().includes(term)) : [];
  const groups = [
    ...(pageHits.length ? [{ label: "Pages", hits: pageHits }] : []),
    ...(term.length >= 2 ? results : []),
  ];
  const flat = groups.flatMap((g) => g.hits);

  // Pinned to the window rather than the input's parent: the desktop sidebar
  // scrolls, so a dropdown wider than it would otherwise be clipped.
  function place() {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    const wide = window.innerWidth >= 1024;
    setBox({ top: rect.bottom + 4, left: rect.left, width: wide ? Math.max(rect.width, 384) : rect.width });
  }

  function go(hit: SearchHit) {
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(hit.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let index = -1;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
          place();
        }}
        onFocus={() => {
          setOpen(true);
          place();
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        placeholder="Search everything…"
        aria-label="Search the admin"
        className="w-full rounded-md border border-hairline bg-parchment px-3 py-1.5 pr-10 text-sm text-ink placeholder:text-ink/40 focus:border-forest focus:outline-none"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-hairline px-1 font-mono-numbers text-[10px] text-ink/40 lg:block">
        ⌘K
      </kbd>

      {open && box && term.length > 0 && (
        <div
          style={box}
          className="fixed z-50 max-h-[70vh] overflow-y-auto rounded-md border border-hairline bg-card py-1 shadow-lg"
        >
          {groups.map((group) => (
            <div key={group.label} className="py-1">
              <p className="px-3 py-1 font-mono-numbers text-[10.5px] uppercase tracking-[0.12em] text-ink/45">
                {group.label}
              </p>
              {group.hits.map((hit) => {
                index += 1;
                const i = index;
                return (
                  <button
                    key={`${group.label}-${hit.href}-${hit.title}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(hit)}
                    onMouseEnter={() => setActive(i)}
                    className={`block w-full px-3 py-1.5 text-left text-sm ${
                      i === active ? "bg-forest/10 text-forest" : "text-ink/80"
                    }`}
                  >
                    <span className="block truncate">{hit.title}</span>
                    {hit.detail && <span className="block truncate text-xs text-ink/50">{hit.detail}</span>}
                  </button>
                );
              })}
            </div>
          ))}
          {flat.length === 0 && (
            <p className="px-3 py-2 text-sm text-ink/50">
              {term.length < 2 ? "Keep typing…" : pending ? "Searching…" : "Nothing matches."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
