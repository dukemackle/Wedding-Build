"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import type { Venue, VenueShortlistEntry } from "@/lib/supabase/types";
import { toggleShortlist, updateShortlistNotes } from "../actions";
import { BookedVenueButton } from "../venue-card-shared";
import { announceSaved, useSavedSync } from "@/lib/saved-sync";
import { InquiryForm } from "../inquiry-form";
import { TrackedContactLink, telHref } from "@/components/tracked-contact-link";
import { useFinishIntent } from "@/components/signup-sheet";
import type { SignupIntent } from "@/lib/signup-intent";

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
  signedIn,
}: {
  venue: Venue & { latitude: number; longitude: number };
  isShortlisted: boolean;
  signedIn: boolean;
}) {
  return (
    <VenuesMap
      venues={[venue]}
      shortlistedIds={isShortlisted ? new Set([venue.id]) : new Set()}
      center={[venue.latitude, venue.longitude]}
      zoom={12}
      signedIn={signedIn}
      heightClassName="h-[280px] w-full overflow-hidden rounded-md border border-hairline"
    />
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
  then,
}: {
  venue: Venue;
  isShortlisted: boolean;
  isBooked: boolean;
  shortlistEntry: VenueShortlistEntry | null;
  then?: SignupIntent;
}) {
  // The heart is in the listing's header; the notes here follow it.
  const [isShortlisted, setIsShortlisted] = useState(initialShortlisted);
  useSavedSync("venue", venue.id, setIsShortlisted);
  const [isBooked, setIsBooked] = useState(initialBooked);
  const [showInquiry, setShowInquiry] = useState(false);
  useFinishIntent(then, {
    save: () => {
      if (initialShortlisted) return;
      const formData = new FormData();
      formData.set("venue_id", venue.id);
      formData.set("is_shortlisted", "false");
      toggleShortlist(formData).then((result) => !result?.error && announceSaved("venue", venue.id, true));
    },
    ask: () => setShowInquiry(true),
  });

  return (
    <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <BookedVenueButton
          venueId={venue.id}
          isBooked={isBooked}
          onToggled={(bookedId) => setIsBooked(Boolean(bookedId))}
        />
      </div>

      {isShortlisted && (
        <ShortlistNotesField venueId={venue.id} notes={shortlistEntry?.notes ?? null} />
      )}

      {(venue.contact_phone || venue.website) && (
        <div className="mt-4 flex flex-col gap-1 border-t border-hairline pt-4 text-sm text-ink/80">
          {venue.contact_phone && (
            <TrackedContactLink
              listingType="venue"
              listingId={venue.id}
              kind="phone"
              href={telHref(venue.contact_phone)}
              className="hover:underline"
            >
              {venue.contact_phone}
            </TrackedContactLink>
          )}
          {venue.website && (
            <TrackedContactLink
              listingType="venue"
              listingId={venue.id}
              kind="website"
              href={venue.website}
              className="text-brass hover:underline"
            >
              {venue.website}
            </TrackedContactLink>
          )}
        </div>
      )}

      {!showInquiry ? (
        <button
          type="button"
          onClick={() => setShowInquiry(true)}
          className="mt-4 w-full rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
        >
          Request info
        </button>
      ) : (
        <InquiryForm venue={venue} onDone={() => setShowInquiry(false)} />
      )}
    </div>
  );
}
