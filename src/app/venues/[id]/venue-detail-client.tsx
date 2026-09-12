"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import type { Venue, VenueShortlistEntry } from "@/lib/supabase/types";
import {
  sendVenueInquiry,
  updateShortlistNotes,
} from "../actions";
import { BookedVenueButton, ShortlistButton } from "../venue-card-shared";

const VenuesMap = dynamic(() => import("../venues-map").then((m) => m.VenuesMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] w-full items-center justify-center rounded-md border border-hairline text-sm text-ink/50">
      Loading map...
    </div>
  ),
});

export function VenueMapEmbed({
  venue,
  isShortlisted,
}: {
  venue: Venue & { latitude: number; longitude: number };
  isShortlisted: boolean;
}) {
  return (
    <VenuesMap
      venues={[venue]}
      shortlistedIds={isShortlisted ? new Set([venue.id]) : new Set()}
      center={[venue.latitude, venue.longitude]}
      zoom={12}
      heightClassName="h-[280px] w-full overflow-hidden rounded-md border border-hairline"
    />
  );
}

function InquiryForm({ venue, onDone }: { venue: Venue; onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendVenueInquiry(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        onDone();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
      <input type="hidden" name="venue_id" value={venue.id} />
      <input type="hidden" name="venue_name" value={venue.name} />
      <label className="flex flex-col gap-1 text-sm text-ink">
        Send to
        <input
          type="email"
          name="recipient_email"
          required
          defaultValue={venue.contact_email ?? ""}
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Message
        <textarea
          name="message"
          rows={3}
          required
          defaultValue={`Hi ${venue.name}, we're planning our wedding and would love to get more information about hosting with you — availability, pricing, and what's included. Could you share more details?`}
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send inquiry"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ShortlistNotesField({ venueId, notes }: { venueId: string; notes: string | null }) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateShortlistNotes(formData);
      setSaved(!result?.error);
    });
  }

  return (
    <form action={handleSave} className="mt-4 flex items-start gap-3 border-t border-hairline pt-4">
      <input type="hidden" name="venue_id" value={venueId} />
      <textarea
        name="notes"
        rows={2}
        placeholder="Notes (pricing, availability, questions to ask)..."
        defaultValue={notes ?? ""}
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
  );
}

export function VenueDetailClient({
  venue,
  isShortlisted: initialShortlisted,
  isBooked: initialBooked,
  shortlistEntry,
}: {
  venue: Venue;
  isShortlisted: boolean;
  isBooked: boolean;
  shortlistEntry: VenueShortlistEntry | null;
}) {
  const [isShortlisted, setIsShortlisted] = useState(initialShortlisted);
  const [isBooked, setIsBooked] = useState(initialBooked);
  const [showInquiry, setShowInquiry] = useState(false);

  return (
    <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <ShortlistButton
          venueId={venue.id}
          isShortlisted={isShortlisted}
          onToggled={setIsShortlisted}
        />
        <BookedVenueButton
          venueId={venue.id}
          isBooked={isBooked}
          onToggled={(bookedId) => setIsBooked(Boolean(bookedId))}
        />
      </div>

      {isShortlisted && (
        <ShortlistNotesField venueId={venue.id} notes={shortlistEntry?.notes ?? null} />
      )}

      {(venue.contact_email || venue.contact_phone || venue.website) && (
        <div className="mt-4 flex flex-col gap-1 border-t border-hairline pt-4 text-sm text-ink/80">
          {venue.contact_phone && <p>{venue.contact_phone}</p>}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer"
              className="text-brass hover:underline"
            >
              {venue.website}
            </a>
          )}
        </div>
      )}

      {!showInquiry ? (
        <button
          type="button"
          onClick={() => setShowInquiry(true)}
          className="mt-4 rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          Request info
        </button>
      ) : (
        <InquiryForm venue={venue} onDone={() => setShowInquiry(false)} />
      )}
    </div>
  );
}
