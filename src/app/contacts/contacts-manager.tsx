"use client";

import { useState, useTransition } from "react";
import type { VendorInquiryStatus } from "@/lib/supabase/types";
import { updateVendorFavoriteContact } from "../vendors/actions";
import { updateShortlistContact } from "../venues/actions";

export type VendorContact = {
  id: string;
  name: string;
  category: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  isFavorited: boolean;
  inquiryStatus: VendorInquiryStatus | null;
};

export type VenueContact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

const STATUS_LABELS: Record<VendorInquiryStatus, string> = {
  sent: "Inquiry sent",
  responded: "Responded",
  booked: "Booked",
  declined: "Declined",
};

const STATUS_BADGE_CLASS: Record<VendorInquiryStatus, string> = {
  sent: "border-hairline text-ink/70",
  responded: "border-brass/40 bg-brass/10 text-brass",
  booked: "border-forest/40 bg-forest/10 text-forest",
  declined: "border-red-200 bg-red-50 text-red-700",
};

const inputClass =
  "flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

function ContactLinks({ email, phone }: { email: string | null; phone: string | null }) {
  if (!email && !phone) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-3 text-sm">
      {email && (
        <a href={`mailto:${email}`} className="text-brass hover:underline">
          {email}
        </a>
      )}
      {phone && (
        <a href={`tel:${phone}`} className="text-brass hover:underline">
          {phone}
        </a>
      )}
    </div>
  );
}

function VendorRow({ contact }: { contact: VendorContact }) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateVendorFavoriteContact(formData);
      setSaved(!result?.error);
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-ink">{contact.name}</p>
          <p className="mt-0.5 text-xs text-ink/50">
            {[contact.category, contact.isFavorited ? "Favorited" : null]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
        {contact.inquiryStatus && (
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE_CLASS[contact.inquiryStatus]}`}
          >
            {STATUS_LABELS[contact.inquiryStatus]}
          </span>
        )}
      </div>
      <ContactLinks email={contact.email} phone={contact.phone} />
      {contact.notes && <p className="mt-1 text-sm text-ink/70">{contact.notes}</p>}
      {contact.isFavorited && (
        <form action={handleSave} className="mt-2 flex items-center gap-2">
          <input type="hidden" name="vendor_id" value={contact.id} />
          <input
            type="tel"
            name="contact_phone"
            placeholder="Add a phone number..."
            defaultValue={contact.phone ?? ""}
            onChange={() => setSaved(false)}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
          >
            {isPending ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}

function VenueRow({ contact }: { contact: VenueContact }) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateShortlistContact(formData);
      setSaved(!result?.error);
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <p className="text-ink">{contact.name}</p>
      <ContactLinks email={contact.email} phone={contact.phone} />
      {contact.notes && <p className="mt-1 text-sm text-ink/70">{contact.notes}</p>}
      <form
        action={handleSave}
        className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input type="hidden" name="venue_id" value={contact.id} />
        <input
          type="email"
          name="contact_email"
          placeholder="Add a contact email..."
          defaultValue={contact.email ?? ""}
          onChange={() => setSaved(false)}
          className={inputClass}
        />
        <input
          type="tel"
          name="contact_phone"
          placeholder="Add a phone number..."
          defaultValue={contact.phone ?? ""}
          onChange={() => setSaved(false)}
          className={inputClass}
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

export function ContactsManager({
  venues,
  vendors,
}: {
  venues: VenueContact[];
  vendors: VendorContact[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-forest">Venue</h2>
        {venues.length === 0 ? (
          <p className="mt-4 py-4 text-center text-sm text-ink/50">
            Favorite a venue to add it here.
          </p>
        ) : (
          <div className="mt-4">
            {venues.map((venue) => (
              <VenueRow key={venue.id} contact={venue} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-forest">Vendors</h2>
        {vendors.length === 0 ? (
          <p className="mt-4 py-4 text-center text-sm text-ink/50">
            Favorite a vendor or send an inquiry to add them here.
          </p>
        ) : (
          <div className="mt-4">
            {vendors.map((vendor) => (
              <VendorRow key={vendor.id} contact={vendor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
