"use client";

import { SheetSyncBar } from "@/components/sheet-sync-bar";
import type { SheetLinkView, SiteChanges } from "@/lib/sheet-link-server";
import { readGuestSheet } from "@/lib/guest-sheet";
import { syncGuestSheet } from "./sheet-actions";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  household: "Household",
  email: "Email",
  phone: "Phone",
  address_line1: "Address",
  address_line2: "Address line 2",
  city: "City",
  state: "State",
  postal_code: "ZIP",
  country: "Country",
  plus_one: "Plus one",
  plus_one_name: "Plus one's name",
  status: "RSVP",
  priority: "Priority",
  side: "Side",
  guest_type: "Type",
  meal: "Meal",
  notes: "Notes",
  gift_description: "Gift",
  thanked: "Thanked",
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
  status: { invited: "Invited", confirmed: "Confirmed", declined: "Declined", pending: "Pending" },
  priority: { must_invite: "Must invite", would_like: "Would like", if_room: "If room" },
  guest_type: { family: "Family", friends: "Friends", work: "Work", other: "Other" },
  plus_one: { yes: "Yes" },
  thanked: { yes: "Yes" },
};

export function GuestSheetSync({
  link,
  changes,
  canEdit,
  partnerAName,
  partnerBName,
}: {
  link: SheetLinkView | null;
  changes: SiteChanges | null;
  canEdit: boolean;
  partnerAName: string | null;
  partnerBName: string | null;
}) {
  const partners = { a: partnerAName, b: partnerBName };
  const names = [partnerAName, partnerBName]
    .map((name) => (name ?? "").trim().split(/\s+/)[0])
    .filter(Boolean);
  const sideLabels: Record<string, string> = {
    a: names[0] || "Partner A",
    b: names[1] || "Partner B",
    both: "Both",
  };

  return (
    <SheetSyncBar
      kind="guests"
      link={link}
      changes={changes}
      canEdit={canEdit}
      noun={{ one: "guest", many: "guests" }}
      description="Edit your guests in either place — changes go both ways when you sync, and RSVPs show up in the sheet."
      newSheetTitle={names.length === 2 ? `${names[0]} & ${names[1]} — guest list` : "Our guest list"}
      tabTitle="Guests"
      readGrid={(grid) => readGuestSheet(grid, partners)}
      sync={syncGuestSheet}
      fieldLabel={(field) => FIELD_LABELS[field] ?? field}
      valueLabel={(field, value) =>
        field === "side" ? (sideLabels[value] ?? value) : (VALUE_LABELS[field]?.[value] ?? value)
      }
    />
  );
}
