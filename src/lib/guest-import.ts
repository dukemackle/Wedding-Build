import type { GuestPriority, GuestStatus } from "@/lib/supabase/types";
import { mapColumns, readTable } from "@/lib/spreadsheet";

/**
 * Turns a guest spreadsheet into rows ready for insert.
 *
 * Takes a 2D array of cells rather than a file, so the same code handles a
 * pasted table, an uploaded .csv, an uploaded .xlsx and a Google Sheet. The
 * client uses it to preview; the server uses it again to decide, so a
 * doctored payload can't put anything past validation.
 */

export type GuestImportValues = {
  name: string;
  household: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  plus_one: boolean;
  plus_one_name: string | null;
  status: GuestStatus;
  priority: GuestPriority;
  meal: string | null;
  notes: string | null;
  thanked: boolean;
  gift_description: string | null;
};

/** Fields a column can map to, including the two that merge into `name`. */
type GuestField = keyof GuestImportValues | "first_name" | "last_name";

export type GuestImportRow = {
  /** 1-based row number as the person counts them, header excluded. */
  line: number;
  values: GuestImportValues;
  errors: string[];
};

export type GuestImportParse = {
  rows: GuestImportRow[];
  error?: string;
  unknownColumns: string[];
};

/**
 * Real guest lists never use our column names, so the aliases matter more
 * than the canonical ones. First/last name are separate columns on almost
 * every list people actually keep, and get joined below.
 */
const FIELD_ALIASES: Record<string, GuestField> = {
  name: "name",
  fullname: "name",
  guest: "name",
  guestname: "name",
  firstname: "first_name",
  first: "first_name",
  givenname: "first_name",
  lastname: "last_name",
  last: "last_name",
  surname: "last_name",
  familyname: "last_name",
  household: "household",
  householdid: "household",
  family: "household",
  party: "household",
  email: "email",
  emailaddress: "email",
  contactemail: "email",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  cell: "phone",
  address: "address_line1",
  streetaddress: "address_line1",
  addressline: "address_line1",
  addressline1: "address_line1",
  address1: "address_line1",
  street: "address_line1",
  mailingaddress: "address_line1",
  addressline2: "address_line2",
  address2: "address_line2",
  apt: "address_line2",
  apartment: "address_line2",
  unit: "address_line2",
  suite: "address_line2",
  city: "city",
  town: "city",
  state: "state",
  province: "state",
  zip: "postal_code",
  zipcode: "postal_code",
  postalcode: "postal_code",
  postcode: "postal_code",
  country: "country",
  plusone: "plus_one",
  plusones: "plus_one",
  guestof: "plus_one",
  plusonename: "plus_one_name",
  plusoneguest: "plus_one_name",
  status: "status",
  rsvp: "status",
  rsvpstatus: "status",
  attending: "status",
  priority: "priority",
  tier: "priority",
  invitetier: "priority",
  meal: "meal",
  mealchoice: "meal",
  entree: "meal",
  dinner: "meal",
  notes: "notes",
  note: "notes",
  comments: "notes",
  thanked: "thanked",
  thankyousent: "thanked",
  gift: "gift_description",
  giftdescription: "gift_description",
  giftreceived: "gift_description",
};

const VALID_STATUSES: GuestStatus[] = ["invited", "confirmed", "declined", "pending"];

function parseStatus(raw: string): GuestStatus {
  const value = raw.trim().toLowerCase();
  if (!value) return "invited";
  if (VALID_STATUSES.includes(value as GuestStatus)) return value as GuestStatus;
  // The words people actually type in an RSVP column.
  if (["yes", "y", "attending", "accepted", "coming"].includes(value)) return "confirmed";
  if (["no", "n", "declined", "regrets", "not coming"].includes(value)) return "declined";
  if (["maybe", "tbd", "waiting", "no reply"].includes(value)) return "pending";
  return "invited";
}

function parsePriority(raw: string): GuestPriority {
  const value = raw.trim().toLowerCase();
  if (!value) return "must_invite";
  // Numeric tiers are how spreadsheets express this -- 1 is the A-list.
  if (value === "1" || value === "a") return "must_invite";
  if (value === "2" || value === "b") return "would_like";
  if (value === "3" || value === "c") return "if_room";
  if (value.includes("must")) return "must_invite";
  if (value.includes("would")) return "would_like";
  if (value.includes("room")) return "if_room";
  return "must_invite";
}

function parseYesNo(raw: string): boolean {
  const value = raw.trim().toLowerCase();
  return ["yes", "y", "true", "1", "x", "✓"].includes(value);
}

export function parseGuestTable(table: string[][]): GuestImportParse {
  if (table.length === 0) {
    return { rows: [], error: "Nothing to import yet.", unknownColumns: [] };
  }

  const { columnField, unknownColumns } = mapColumns<GuestField>(table[0], FIELD_ALIASES);

  const hasName =
    columnField.includes("name") ||
    columnField.includes("first_name") ||
    columnField.includes("last_name");

  if (!hasName) {
    return {
      rows: [],
      error:
        "No name column found. The first row must be headings, with a Name column — or First Name and Last Name.",
      unknownColumns,
    };
  }

  const body = table.slice(1);
  if (body.length === 0) {
    return { rows: [], error: "Found headings but no guests underneath them.", unknownColumns };
  }

  const rows = body.map((cells, index) => {
    const cell = (field: GuestField) => {
      const at = columnField.indexOf(field);
      return at === -1 ? "" : (cells[at] ?? "").trim();
    };

    const errors: string[] = [];

    // A single Name column wins if present; otherwise join the two halves,
    // which is how nearly every real guest list is actually kept.
    const whole = cell("name");
    const name = whole || [cell("first_name"), cell("last_name")].filter(Boolean).join(" ");
    if (!name) errors.push("Name is required");

    const email = cell("email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Email "${email}" doesn't look like an address`);
    }

    const plusOneName = cell("plus_one_name");
    const plusOneCell = cell("plus_one");
    // A named plus one is a plus one, whether or not the yes/no column says so.
    const plusOne = parseYesNo(plusOneCell) || Boolean(plusOneName);

    const values: GuestImportValues = {
      name,
      household: cell("household") || null,
      email: email || null,
      phone: cell("phone") || null,
      address_line1: cell("address_line1") || null,
      address_line2: cell("address_line2") || null,
      city: cell("city") || null,
      state: cell("state") || null,
      postal_code: cell("postal_code") || null,
      country: cell("country") || null,
      plus_one: plusOne,
      plus_one_name: plusOneName || null,
      status: parseStatus(cell("status")),
      priority: parsePriority(cell("priority")),
      meal: cell("meal") || null,
      notes: cell("notes") || null,
      thanked: parseYesNo(cell("thanked")),
      gift_description: cell("gift_description") || null,
    };

    return { line: index + 1, values, errors };
  });

  return { rows, unknownColumns };
}

/** Convenience for CSV/TSV text, which the Google Sheet path still uses. */
export function parseGuestText(text: string): GuestImportParse {
  const table = readTable(text);
  if (table.length === 0) {
    return { rows: [], error: "That sheet looks empty.", unknownColumns: [] };
  }
  return parseGuestTable(table);
}

/** The heading row to hand someone starting from a blank sheet. */
export const GUEST_IMPORT_TEMPLATE = [
  "First Name",
  "Last Name",
  "Household",
  "Email",
  "Phone",
  "Street Address",
  "City",
  "State",
  "ZIP",
  "Plus One Name",
  "RSVP",
  "Tier",
  "Meal",
  "Notes",
].join("\t");
