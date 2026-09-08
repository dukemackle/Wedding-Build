"use client";

import { useState, useTransition } from "react";
import type { Venue } from "@/lib/supabase/types";
import { REGIONS, STATES, VENUE_TYPES } from "@/lib/wedding-options";
import { createVenue, setVenueActive, updateVenue } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function VenueForm({
  venue,
  onDone,
}: {
  venue?: Venue;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const action = venue ? updateVenue : createVenue;
      if (venue) formData.set("id", venue.id);
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        onDone();
      }
    });
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Name
        <input name="name" required defaultValue={venue?.name ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Venue type
        <select name="venue_type" defaultValue={venue?.venue_type ?? ""} className={inputClass}>
          <option value="">—</option>
          {VENUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Region
        <select name="region" defaultValue={venue?.region ?? ""} className={inputClass}>
          <option value="">—</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        State
        <select name="state" defaultValue={venue?.state ?? ""} className={inputClass}>
          <option value="">—</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        City
        <input name="city" defaultValue={venue?.city ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Capacity
        <input
          name="capacity"
          type="number"
          min="0"
          defaultValue={venue?.capacity ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Price tier
        <input
          name="price_tier"
          placeholder="$, $$, or $$$"
          defaultValue={venue?.price_tier ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Image URL
        <input name="image_url" defaultValue={venue?.image_url ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Latitude
        <input
          name="latitude"
          type="number"
          step="any"
          defaultValue={venue?.latitude ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Longitude
        <input
          name="longitude"
          type="number"
          step="any"
          defaultValue={venue?.longitude ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Description
        <textarea
          name="description"
          rows={2}
          defaultValue={venue?.description ?? ""}
          className={inputClass}
        />
      </label>
      {error && <p className="text-sm text-red-800 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : venue ? "Save changes" : "Add venue"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function VenueRow({ venue }: { venue: Venue }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const formData = new FormData();
    formData.set("id", venue.id);
    formData.set("active", String(!venue.active));
    startTransition(async () => {
      await setVenueActive(formData);
    });
  }

  if (editing) {
    return (
      <div className="border-b border-hairline py-4 last:border-b-0">
        <VenueForm venue={venue} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-b border-hairline py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className={venue.active ? "text-ink" : "text-ink/40 line-through"}>{venue.name}</p>
        <p className="mt-0.5 text-xs text-ink/50">
          {[venue.venue_type, venue.city, venue.state].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={toggleActive}
          disabled={isPending}
          className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest disabled:opacity-60"
        >
          {venue.active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}

export function AdminVenuesManager({ venues }: { venues: Venue[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/60">{venues.length} venues</p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            + Add venue
          </button>
        )}
      </div>
      {adding && (
        <div className="mb-4 border-b border-hairline pb-4">
          <VenueForm onDone={() => setAdding(false)} />
        </div>
      )}
      {venues.map((venue) => (
        <VenueRow key={venue.id} venue={venue} />
      ))}
      {venues.length === 0 && !adding && <p className="text-sm text-ink/50">No venues yet.</p>}
    </div>
  );
}
