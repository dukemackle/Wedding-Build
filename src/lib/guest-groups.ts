import type { Guest, GuestSide, GuestType } from "@/lib/supabase/types";

export const GUEST_SIDES: GuestSide[] = ["a", "b", "both"];

export const GUEST_TYPES: GuestType[] = ["family", "friends", "work", "other"];

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  family: "Family",
  friends: "Friends",
  work: "Work",
  other: "Other",
};

/**
 * The colours a side can be drawn in.
 *
 * Nine, not a colour wheel: the side bar has to read against parchment,
 * and a free picker is how you end up with a pale yellow nobody can see. The
 * dark ones can carry white text; Stone is the neutral default for "Both".
 */
export const SIDE_COLORS = [
  { name: "Forest", value: "#3F6B57" },
  { name: "Brass", value: "#B0762F" },
  { name: "Plum", value: "#7A3F62" },
  { name: "Navy", value: "#2F4A7A" },
  { name: "Rust", value: "#A9512F" },
  { name: "Teal", value: "#2F6E70" },
  { name: "Olive", value: "#6B7233" },
  { name: "Slate", value: "#4A5560" },
  { name: "Stone", value: "#8C8677" },
] as const;

export const DEFAULT_SIDE_A_COLOR = SIDE_COLORS[0].value;
export const DEFAULT_SIDE_B_COLOR = SIDE_COLORS[1].value;
/** Neutral by default: "both" is the absence of a side rather than one more. */
export const DEFAULT_SIDE_BOTH_COLOR = SIDE_COLORS[8].value;

/** A guest with no side gets a dot too -- hollow, so the row still lines up. */
export const UNASSIGNED_COLOR = "#C9C3B6";

export type SideTheme = {
  /** Label per side, in the couple's own names where they've given them. */
  labels: Record<GuestSide, string>;
  colors: Record<GuestSide, string>;
};

function firstName(fullName: string | null, fallback: string) {
  const first = (fullName ?? "").trim().split(/\s+/)[0];
  return first || fallback;
}

/**
 * How the two sides are named and coloured on this wedding.
 *
 * "Both" is the in-laws-to-be, the mutual friends, the couple's own friends
 * from after they met -- a real third bucket on every list, not a mistake.
 */
export function sideTheme({
  partnerAName,
  partnerBName,
  sideAColor,
  sideBColor,
  sideBothColor = null,
}: {
  partnerAName: string | null;
  partnerBName: string | null;
  sideAColor: string | null;
  sideBColor: string | null;
  sideBothColor?: string | null;
}): SideTheme {
  const a = firstName(partnerAName, "Side A");
  const b = firstName(partnerBName, "Side B");
  return {
    labels: {
      a: partnerAName?.trim() ? `${a}'s side` : a,
      b: partnerBName?.trim() ? `${b}'s side` : b,
      both: "Both",
    },
    colors: {
      a: sideAColor || DEFAULT_SIDE_A_COLOR,
      b: sideBColor || DEFAULT_SIDE_B_COLOR,
      both: sideBothColor || DEFAULT_SIDE_BOTH_COLOR,
    },
  };
}

export function guestSideColor(guest: Guest, theme: SideTheme) {
  return guest.side ? theme.colors[guest.side] : UNASSIGNED_COLOR;
}

export function guestSideLabel(guest: Guest, theme: SideTheme) {
  return guest.side ? theme.labels[guest.side] : "No side";
}

export type GuestSort = "name" | "household" | "side" | "type";

export const GUEST_SORT_LABELS: Record<GuestSort, string> = {
  name: "A–Z",
  household: "Household",
  side: "Side",
  type: "Family / friends",
};

function byName(a: Guest, b: Guest) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

/**
 * The list split into the groups the chosen sort implies.
 *
 * A–Z and Household come back as one unnamed group: a heading per letter or
 * per household is more heading than list. Side and type get real headings,
 * because the count per group is the thing being asked for.
 */
export function groupGuests(
  guests: Guest[],
  sort: GuestSort,
  theme: SideTheme,
): { key: string; heading: string | null; color?: string; guests: Guest[] }[] {
  const sorted = [...guests];

  if (sort === "name") {
    sorted.sort(byName);
    return [{ key: "all", heading: null, guests: sorted }];
  }

  if (sort === "household") {
    sorted.sort(
      (a, b) =>
        (a.household ?? "￿").localeCompare(b.household ?? "￿", undefined, {
          sensitivity: "base",
        }) || byName(a, b),
    );
    return [{ key: "all", heading: null, guests: sorted }];
  }

  if (sort === "side") {
    const order: (GuestSide | "none")[] = ["a", "b", "both", "none"];
    return order
      .map((side) => ({
        key: side,
        heading: side === "none" ? "No side set" : theme.labels[side],
        color: side === "none" ? UNASSIGNED_COLOR : theme.colors[side],
        guests: sorted.filter((g) => (g.side ?? "none") === side).sort(byName),
      }))
      .filter((group) => group.guests.length > 0);
  }

  const order: (GuestType | "none")[] = [...GUEST_TYPES, "none"];
  return order
    .map((type) => ({
      key: type,
      heading: type === "none" ? "Not sorted yet" : GUEST_TYPE_LABELS[type],
      guests: sorted.filter((g) => (g.guest_type ?? "none") === type).sort(byName),
    }))
    .filter((group) => group.guests.length > 0);
}
