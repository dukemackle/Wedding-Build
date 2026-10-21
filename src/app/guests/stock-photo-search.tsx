"use client";

import { useState, useTransition } from "react";
import type { StockPhoto } from "@/lib/unsplash";
import { addStockPhoto, searchStockPhotos } from "./guest-site-actions";

// Unsplash asks for its links to carry our app name (see src/lib/unsplash.ts).
const UNSPLASH_LINK = "https://unsplash.com/?utm_source=youdoido&utm_medium=referral";
const IDEAS = ["Vineyard", "Mountains", "Beach sunset", "Wildflowers", "City skyline", "Rings"];

/**
 * "Search free photos" beside the upload for the banner and the gallery: type
 * a place or a mood, tap a photo, it's on the site with its photographer
 * credited at the bottom. Closed, it's one quiet link, so uploading their
 * own photos stays the obvious thing to do.
 */
export function StockPhotoSearch({ target, onDone }: { target: "hero" | "gallery"; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ query: string; photos: StockPhoto[]; page: number; more: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [searching, startSearch] = useTransition();
  const [, startAdd] = useTransition();

  function search(q: string, page = 1) {
    if (!q.trim()) return;
    setError(null);
    startSearch(async () => {
      const r: Awaited<ReturnType<typeof searchStockPhotos>> = await searchStockPhotos(q, page).catch(() => ({
        error: "Couldn't reach the server — check your connection.",
      }));
      if (r.error) return setError(r.error);
      const photos = r.photos ?? [];
      setResults((prev) => ({
        query: q,
        page,
        more: Boolean(r.more),
        photos: page > 1 && prev ? [...prev.photos, ...photos] : photos,
      }));
    });
  }

  function add(photo: StockPhoto) {
    setError(null);
    setAdding(photo.id);
    startAdd(async () => {
      const r = await addStockPhoto(photo.id, target).catch(() => ({ error: "Couldn't reach the server — check your connection." }));
      setAdding(null);
      if (r.error) return setError(r.error);
      setAdded((s) => new Set(s).add(photo.id));
      onDone?.();
      if (target === "hero") setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-sm font-medium text-[#2243B6] underline-offset-2 hover:underline"
      >
        Or search free photos
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-hairline bg-card p-3 sm:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(query);
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={target === "hero" ? "A place or a mood: Tuscany, desert, snow…" : "Search photos"}
          aria-label="Search free photos"
          autoFocus
          className="min-w-0 flex-1 rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-[#2243B6] focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="shrink-0 rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment hover:bg-forest/90 disabled:opacity-60"
        >
          {searching ? "Searching…" : "Search"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close photo search"
          className="shrink-0 rounded-md px-2 text-xl leading-none text-ink/50 hover:text-ink"
        >
          ×
        </button>
      </form>

      {!results && (
        <div className="mt-3 flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => {
                setQuery(idea);
                search(idea);
              }}
              className="rounded-full border border-hairline px-3 py-1 text-xs text-ink/75 hover:border-[#2243B6] hover:text-ink"
            >
              {idea}
            </button>
          ))}
        </div>
      )}

      {results && results.photos.length === 0 && !searching && (
        <p className="mt-3 text-sm text-ink/60">Nothing for “{results.query}”. Try a broader word, like a place or a season.</p>
      )}

      {results && results.photos.length > 0 && (
        <>
          <p className="mt-3 text-xs text-ink/55">
            {target === "hero" ? "Tap one to make it your banner." : "Tap to add to your gallery."} The photographer is
            credited at the bottom of your site.
          </p>
          <div className="mt-2 grid max-h-[26rem] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
            {results.photos.map((photo) => {
              const done = added.has(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => add(photo)}
                  disabled={adding !== null || done}
                  aria-label={`${done ? "Added: " : "Use "}${photo.alt || "photo"} by ${photo.photographer}`}
                  className="group relative block overflow-hidden rounded-md border border-hairline text-left disabled:cursor-default"
                >
                  {/* A plain img: these are Unsplash's own resized thumbnails, so nothing to optimise. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.thumb} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-[11px] text-white">
                    {photo.photographer}
                  </span>
                  {(done || adding === photo.id) && (
                    <span className="absolute inset-0 flex items-center justify-center bg-[#14203d]/55 text-sm font-medium text-white">
                      {done ? "Added ✓" : "Adding…"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {results.more && (
            <button
              type="button"
              onClick={() => search(results.query, results.page + 1)}
              disabled={searching}
              className="mt-3 w-full rounded-md border border-hairline py-2 text-sm text-ink/75 hover:text-ink disabled:opacity-60"
            >
              {searching ? "Loading…" : "More photos"}
            </button>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <p className="mt-3 text-[11px] text-ink/45">
        Photos from{" "}
        <a href={UNSPLASH_LINK} target="_blank" rel="noopener noreferrer" className="underline">
          Unsplash
        </a>
        , free to use.
      </p>
    </div>
  );
}
