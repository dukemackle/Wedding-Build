"use client";

import { useRef, useState, useTransition } from "react";
import type { Venue, VenueFaq } from "@/lib/supabase/types";
import { STATES, STYLE_TIERS, VENUE_SETTINGS, VENUE_TYPES } from "@/lib/wedding-options";
import {
  addVenueFaq,
  createVenue,
  deleteVenueFaq,
  setVenueActive,
  updateVenue,
} from "./actions";

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
        Setting
        <select name="setting" defaultValue={venue?.setting ?? ""} className={inputClass}>
          <option value="">—</option>
          {VENUE_SETTINGS.map((s) => (
            <option key={s} value={s}>
              {s}
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
        <select name="price_tier" defaultValue={venue?.price_tier ?? ""} className={inputClass}>
          <option value="">—</option>
          {STYLE_TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Image URL
        <input name="image_url" defaultValue={venue?.image_url ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Contact email
        <input
          name="contact_email"
          type="email"
          defaultValue={venue?.contact_email ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Contact phone
        <input name="contact_phone" defaultValue={venue?.contact_phone ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Website
        <input name="website" defaultValue={venue?.website ?? ""} className={inputClass} />
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
      <label className={`${labelClass} sm:col-span-2`}>
        About <span className="text-ink/50">(longer write-up, shown on the venue page)</span>
        <textarea name="about" rows={4} defaultValue={venue?.about ?? ""} className={inputClass} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        What&apos;s included
        <textarea
          name="included"
          rows={3}
          placeholder="e.g. Two nights at the lodge, $4,000 in event rentals with setup and takedown"
          defaultValue={venue?.included ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Amenities <span className="text-ink/50">(comma separated)</span>
        <input
          name="amenities"
          placeholder="Bridal suite, On-site parking, Rain backup, Pet friendly"
          defaultValue={venue?.amenities?.join(", ") ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input type="checkbox" name="is_sample" defaultChecked={venue?.is_sample ?? false} />
        Sample / placeholder listing (not a real vendor)
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

function VenueFaqEditor({ venue, faqs }: { venue: Venue; faqs: VenueFaq[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    formData.set("venue_id", venue.id);
    formData.set("sort_order", String(faqs.length));
    startTransition(async () => {
      const result = await addVenueFaq(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
      }
    });
  }

  function handleDelete(faqId: string) {
    const formData = new FormData();
    formData.set("id", faqId);
    formData.set("venue_id", venue.id);
    startTransition(async () => {
      const result = await deleteVenueFaq(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mt-4 border-t border-hairline pt-4">
      <p className="text-sm text-ink">
        FAQs <span className="text-ink/50">({faqs.length})</span>
      </p>

      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="mt-2 flex items-start justify-between gap-3 rounded-md border border-hairline bg-parchment p-3"
        >
          <div>
            <p className="text-sm text-ink">{faq.question}</p>
            <p className="mt-0.5 text-xs text-ink/60">{faq.answer}</p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(faq.id)}
            disabled={isPending}
            className="shrink-0 text-xs text-ink/50 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <form ref={formRef} action={handleAdd} className="mt-3 flex flex-col gap-2">
        <input name="question" placeholder="Question" className={inputClass} />
        <textarea name="answer" rows={2} placeholder="Answer" className={inputClass} />
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md border border-hairline px-3 py-1.5 text-sm text-ink hover:border-forest disabled:opacity-60"
        >
          {isPending ? "Adding..." : "+ Add FAQ"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

function VenueRow({ venue, faqs }: { venue: Venue; faqs: VenueFaq[] }) {
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
        <VenueFaqEditor venue={venue} faqs={faqs} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-b border-hairline py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className={venue.active ? "text-ink" : "text-ink/40 line-through"}>
          {venue.name}
          {venue.is_sample && (
            <span className="ml-2 rounded-full border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/40">
              Sample
            </span>
          )}
        </p>
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

export function AdminVenuesManager({
  venues,
  faqsByVenueId,
}: {
  venues: Venue[];
  faqsByVenueId: Record<string, VenueFaq[]>;
}) {
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
        <VenueRow key={venue.id} venue={venue} faqs={faqsByVenueId[venue.id] ?? []} />
      ))}
      {venues.length === 0 && !adding && <p className="text-sm text-ink/50">No venues yet.</p>}
    </div>
  );
}
