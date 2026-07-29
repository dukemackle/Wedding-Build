"use client";

import { useState, useTransition } from "react";
import type { Venue, VenueShortlistEntry } from "@/lib/supabase/types";
import { REGIONS, VENUE_TYPES } from "@/lib/wedding-options";
import { toggleShortlist, updateShortlistNotes } from "./actions";

function ShortlistButton({
  venueId,
  isShortlisted,
}: {
  venueId: string;
  isShortlisted: boolean;
}) {
  const [shortlisted, setShortlisted] = useState(isShortlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const formData = new FormData();
    formData.set("venue_id", venueId);
    formData.set("is_shortlisted", String(shortlisted));

    startTransition(async () => {
      const result = await toggleShortlist(formData);
      if (!result?.error) {
        setShortlisted((v) => !v);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-60 ${
        shortlisted
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-parchment text-ink hover:border-forest"
      }`}
    >
      {shortlisted ? "✓ Shortlisted" : "+ Shortlist"}
    </button>
  );
}

function VenueCard({ venue, isShortlisted }: { venue: Venue; isShortlisted: boolean }) {
  return (
    <div className="flex flex-col rounded-lg border border-hairline bg-parchment p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-display text-xl font-semibold text-forest">{venue.name}</h3>
        {venue.price_tier && (
          <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-brass">
            {venue.price_tier}
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-wide text-ink/50">
        {[venue.region, venue.venue_type].filter(Boolean).join(" · ")}
      </p>
      {venue.capacity && (
        <p className="mt-1 font-mono-numbers text-sm text-ink/70">
          Up to {venue.capacity} guests
        </p>
      )}
      {venue.description && (
        <p className="mt-3 text-sm text-ink/80">{venue.description}</p>
      )}
      <div className="mt-4">
        <ShortlistButton venueId={venue.id} isShortlisted={isShortlisted} />
      </div>
    </div>
  );
}

function ShortlistNotes({ entry, venueName }: { entry: VenueShortlistEntry; venueName: string }) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateShortlistNotes(formData);
      setSaved(!result?.error);
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <p className="text-ink">{venueName}</p>
      <form action={handleSave} className="mt-2 flex items-start gap-3">
        <input type="hidden" name="venue_id" value={entry.venue_id} />
        <textarea
          name="notes"
          rows={2}
          placeholder="Notes (pricing, availability, questions to ask)..."
          defaultValue={entry.notes ?? ""}
          onChange={() => setSaved(false)}
          className="flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
        >
          {isPending ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </form>
    </div>
  );
}

export function VenuesManager({
  venues,
  shortlist,
}: {
  venues: Venue[];
  shortlist: VenueShortlistEntry[];
}) {
  const [regionFilter, setRegionFilter] = useState<string | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");

  const shortlistedIds = new Set(shortlist.map((s) => s.venue_id));
  const venueById = new Map(venues.map((v) => [v.id, v]));

  const filteredVenues = venues.filter(
    (v) =>
      (regionFilter === "all" || v.region === regionFilter) &&
      (typeFilter === "all" || v.venue_type === typeFilter),
  );

  return (
    <div className="flex flex-col gap-8">
      {shortlist.length > 0 && (
        <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Your shortlist
          </h2>
          <div className="mt-4">
            {shortlist.map((entry) => {
              const venue = venueById.get(entry.venue_id);
              if (!venue) return null;
              return <ShortlistNotes key={entry.id} entry={entry} venueName={venue.name} />;
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setRegionFilter("all")}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              regionFilter === "all"
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-parchment text-ink hover:border-forest"
            }`}
          >
            All regions
          </button>
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => setRegionFilter(region)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                regionFilter === region
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter("all")}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              typeFilter === "all"
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-parchment text-ink hover:border-forest"
            }`}
          >
            All venue types
          </button>
          {VENUE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                typeFilter === type
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {filteredVenues.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">
            No venues match these filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                isShortlisted={shortlistedIds.has(venue.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
