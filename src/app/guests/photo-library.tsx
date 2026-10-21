"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LibraryPhoto } from "@/lib/unsplash";
import { creditLinks, UNSPLASH_HOME } from "@/lib/photo-credit";
import { searchPhotoLibrary, setLibraryBanner } from "./photo-library-actions";

const IDEAS = ["Garden", "Beach", "Mountains", "Vineyard", "Flowers", "City lights", "Desert", "Forest"];

/**
 * "Find a free photo" under the banner upload: searches the free library
 * (Unsplash) and makes a pick the banner. Landscape, safe-search results
 * only; each shows its photographer, as Unsplash asks. Photos of people
 * aren't model-released, so the hint steers couples to places and details.
 */
export function PhotoLibrary() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [photos, setPhotos] = useState<LibraryPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [, startChoose] = useTransition();

  function search(q: string, nextPage = 1) {
    setQuery(q);
    setError(null);
    startSearch(async () => {
      const result = await searchPhotoLibrary(q, nextPage);
      if (result.error) return setError(result.error);
      setSearched(q);
      setPage(nextPage);
      setTotalPages(result.totalPages ?? 0);
      setPhotos((prev) => (nextPage > 1 ? [...prev, ...(result.photos ?? [])] : (result.photos ?? [])));
    });
  }

  function choose(photo: LibraryPhoto) {
    setChoosing(photo.id);
    setError(null);
    startChoose(async () => {
      const result = await setLibraryBanner(photo.id);
      setChoosing(null);
      if (result.error) return setError(result.error);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-brass hover:underline">
        Or find a free photo &rarr;
      </button>
    );
  }

  return (
    <section aria-label="Free photos" className="rounded-lg border border-hairline bg-card p-4">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) search(query);
        }}
        className="flex gap-2"
      >
        <label className="sr-only" htmlFor="photo-library-q">
          Search free photos
        </label>
        <input
          id="photo-library-q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search free photos, e.g. lake at sunset"
          className="min-w-0 flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="shrink-0 rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment hover:bg-forest/90 disabled:opacity-60"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {IDEAS.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => search(idea)}
            className="min-h-9 rounded-full border border-hairline px-3 text-sm text-ink hover:border-forest/50"
          >
            {idea}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-ink/60">
        Places and details work best. Photos of people come without their permission to appear on your site, so
        pick ones without faces.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {searched && !searching && photos.length === 0 && !error && (
        <p className="mt-4 text-sm text-ink/70">Nothing found for &ldquo;{searched}&rdquo;. Try a simpler word.</p>
      )}

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => {
            const links = creditLinks(photo.credit);
            return (
              <li key={photo.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => choose(photo)}
                  disabled={choosing !== null}
                  aria-label={`Use ${photo.alt || "this photo"} as your banner`}
                  className="group relative block aspect-[3/2] w-full overflow-hidden rounded-md bg-[var(--color-hairline)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest disabled:opacity-70"
                >
                  {/* Shown from Unsplash's own servers, as their terms ask. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {choosing === photo.id ? "Setting as banner..." : "Use as banner"}
                  </span>
                </button>
                <p className="mt-1 truncate text-xs text-ink/60">
                  <a href={links.photographer} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {photo.credit.name}
                  </a>
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {photos.length > 0 && page < totalPages && (
        <button
          type="button"
          onClick={() => search(searched, page + 1)}
          disabled={searching}
          className="mt-3 text-sm font-medium text-brass hover:underline disabled:opacity-60"
        >
          {searching ? "Loading..." : "More photos"}
        </button>
      )}

      <p className="mt-4 text-xs text-ink/60">
        Photos from{" "}
        <a href={UNSPLASH_HOME} target="_blank" rel="noopener noreferrer" className="underline">
          Unsplash
        </a>
        . Your site credits the photographer under the banner.
      </p>
    </section>
  );
}
