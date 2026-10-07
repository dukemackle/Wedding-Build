import type { Guest, GuestPriority, GuestSide, GuestStatus, GuestType } from "@/lib/supabase/types";
import {
  FIELD_ALIASES,
  parseGuestTable,
  type GuestField,
  type GuestImportValues,
} from "@/lib/guest-import";
import { mapColumns, normaliseHeading } from "@/lib/spreadsheet";
import type { SheetLayout, SheetRow, SiteRow, SyncValues } from "@/lib/sheet-sync";

/**
 * The guest list's side of a linked Google Sheet: which columns are which,
 * and how a guest reads and writes as cells.
 *
 * Reading reuses the importer's parser, so a sheet means the same thing on
 * every sync as it did when it was first imported. Writing produces cells
 * that parser reads back to the same value -- "Confirmed" under RSVP, the
 * partner's first name under Side -- so a round trip never changes anything.
 */

export const GUEST_SYNC_FIELDS = [
  "name",
  "household",
  "email",
  "phone",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "postal_code",
  "country",
  "plus_one",
  "plus_one_name",
  "status",
  "priority",
  "side",
  "guest_type",
  "meal",
  "notes",
  "gift_description",
  "thanked",
] as const satisfies readonly (keyof GuestImportValues)[];

export type GuestSyncField = (typeof GUEST_SYNC_FIELDS)[number];

/** What the importer reads a blank cell as, where that isn't "". */
export const GUEST_BLANK_VALUES: Record<string, string> = {
  status: "pending",
  priority: "must_invite",
};

const BOOLEAN_FIELDS = new Set<string>(["plus_one", "thanked"]);

/**
 * The column that ties a row to its guest, so renaming someone in the sheet
 * updates them rather than adding a stranger and losing the original.
 */
export const SYNC_ID_HEADING = "Sync ID";

function isIdHeading(heading: string) {
  const key = normaliseHeading(heading);
  return key === "syncid" || key === "youdoidoid";
}

/** The headings a sheet Wren creates starts with. */
const NEW_SHEET_HEADINGS: [GuestSyncField, string][] = [
  ["name", "Name"],
  ["household", "Household"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["address_line1", "Street Address"],
  ["address_line2", "Address Line 2"],
  ["city", "City"],
  ["state", "State"],
  ["postal_code", "ZIP"],
  ["country", "Country"],
  ["plus_one", "Plus One"],
  ["plus_one_name", "Plus One Name"],
  ["status", "RSVP"],
  ["priority", "Priority"],
  ["side", "Side"],
  ["guest_type", "Type"],
  ["meal", "Meal"],
  ["notes", "Notes"],
  ["gift_description", "Gift"],
  ["thanked", "Thanked"],
];

/**
 * Columns added to a sheet that lacks them. RSVPs and meal choices arrive on
 * the wedding site, and a linked sheet without anywhere to show them would
 * hide the main thing the link is for.
 */
const ALWAYS_SHOWN: [GuestSyncField, string][] = [
  ["status", "RSVP"],
  ["meal", "Meal"],
];

/** A guest, or a parsed sheet row, as the strings the sync compares. */
export function guestSyncValues(guest: Pick<Guest, GuestSyncField> | GuestImportValues): SyncValues {
  const values: SyncValues = {};
  for (const field of GUEST_SYNC_FIELDS) {
    const raw = (guest as Record<string, unknown>)[field];
    values[field] = BOOLEAN_FIELDS.has(field)
      ? raw
        ? "yes"
        : ""
      : typeof raw === "string"
        ? raw.trim()
        : "";
  }
  return values;
}

export function guestSiteRows(guests: Guest[]): SiteRow[] {
  return guests.map((guest) => ({ id: guest.id, name: guest.name, values: guestSyncValues(guest) }));
}

/** Sync values back into columns for an insert or update. */
export function guestColumnsFromValues(values: SyncValues) {
  const text = (field: GuestSyncField) => values[field]?.trim() || null;
  return {
    name: values.name?.trim() ?? "",
    household: text("household"),
    email: text("email"),
    phone: text("phone"),
    address_line1: text("address_line1"),
    address_line2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    postal_code: text("postal_code"),
    country: text("country"),
    plus_one: values.plus_one === "yes",
    plus_one_name: text("plus_one_name"),
    status: (values.status || "pending") as GuestStatus,
    priority: (values.priority || "must_invite") as GuestPriority,
    side: text("side") as GuestSide | null,
    guest_type: text("guest_type") as GuestType | null,
    meal: text("meal"),
    notes: text("notes"),
    gift_description: text("gift_description"),
    thanked: values.thanked === "yes",
  };
}

const STATUS_CELLS: Record<string, string> = {
  invited: "Invited",
  confirmed: "Confirmed",
  declined: "Declined",
  pending: "Pending",
};

const PRIORITY_CELLS: Record<string, string> = {
  must_invite: "Must invite",
  would_like: "Would like",
  if_room: "If room",
};

const TYPE_CELLS: Record<string, string> = {
  family: "Family",
  friends: "Friends",
  work: "Work",
  other: "Other",
};

function firstName(name: string | null) {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

/**
 * Side, written the way the couple would: by first name. Falls back to A/B
 * when a name is missing or one starts with the other ("Sam" and
 * "Samantha"), since the importer reads a side by the name it starts with.
 */
function sideCell(value: string, partners: { a: string | null; b: string | null }) {
  if (value === "both") return "Both";
  const a = firstName(partners.a);
  const b = firstName(partners.b);
  const clash =
    !a || !b || a.toLowerCase().startsWith(b.toLowerCase()) || b.toLowerCase().startsWith(a.toLowerCase());
  if (value === "a") return clash ? "A" : a;
  if (value === "b") return clash ? "B" : b;
  return "";
}

function cellFor(field: string, value: string, partners: { a: string | null; b: string | null }) {
  if (value === "") return "";
  switch (field) {
    case "status":
      return STATUS_CELLS[value] ?? value;
    case "priority":
      return PRIORITY_CELLS[value] ?? value;
    case "guest_type":
      return TYPE_CELLS[value] ?? value;
    case "side":
      return sideCell(value, partners);
    case "plus_one":
    case "thanked":
      return value === "yes" ? "Yes" : "";
    default:
      return value;
  }
}

export type GuestSheetRead = {
  error?: string;
  rows: SheetRow[];
  layout: SheetLayout;
  hasIdColumn: boolean;
  /** Fields the sheet had a column for before this sync -- what to merge. */
  readFields: string[];
};

/**
 * Reads a sheet's grid for a sync, and works out where everything goes.
 *
 * An empty grid is a sheet Wren just created: it gets the full set of
 * headings, and every guest is added beneath them.
 */
export function readGuestSheet(
  grid: string[][],
  partners: { a: string | null; b: string | null },
): GuestSheetRead {
  const isEmpty = grid.length === 0 || grid[0].every((cell) => cell.trim() === "");
  const heading = isEmpty ? [] : grid[0].map((cell) => cell ?? "");

  const width = Math.max(heading.length, ...grid.map((row) => row.length), 0);
  const addedHeadings: { column: number; heading: string }[] = [];
  const addedFields = new Set<string>();
  let nextColumn = isEmpty ? 0 : width;
  const addColumn = (label: string) => {
    const column = nextColumn++;
    addedHeadings.push({ column, heading: label });
    return column;
  };

  // Where each field is read from, by heading.
  const idAt = heading.findIndex(isIdHeading);
  const forParsing = heading.map((cell, index) => (index === idAt ? "" : cell));
  const { columnField } = mapColumns<GuestField>(forParsing, FIELD_ALIASES);
  const columnOf = (field: GuestField) => columnField.indexOf(field);

  const columns = new Map<string, number>();
  for (const field of GUEST_SYNC_FIELDS) {
    const at = columnOf(field);
    if (at !== -1) columns.set(field, at);
  }
  const first = columnOf("first_name");
  const last = columnOf("last_name");
  // A dietary column is folded into notes on import, so notes can't be
  // written back without mangling it -- leave notes alone in that sheet.
  if (columnOf("dietary") !== -1) columns.delete("notes");

  if (!isEmpty && !columns.has("name") && first === -1 && last === -1) {
    return {
      error:
        "No name column found. The first row must be headings, with a Name column — or First Name and Last Name.",
      rows: [],
      layout: emptyLayout(),
      hasIdColumn: false,
      readFields: [],
    };
  }

  if (isEmpty) {
    for (const [field, label] of NEW_SHEET_HEADINGS) {
      columns.set(field, addColumn(label));
      addedFields.add(field);
    }
  } else {
    for (const [field, label] of ALWAYS_SHOWN) {
      if (!columns.has(field)) {
        columns.set(field, addColumn(label));
        addedFields.add(field);
      }
    }
  }
  const idColumn = idAt !== -1 ? idAt : addColumn(SYNC_ID_HEADING);

  const presentFields = GUEST_SYNC_FIELDS.filter(
    (field) => columns.has(field) || (field === "name" && (first !== -1 || last !== -1)),
  );
  // What the sheet held before this sync: only columns that were there.
  const readable = presentFields.filter((field) => !addedFields.has(field));

  const write: SheetLayout["write"] = (field, value) => {
    const cell = cellFor(field, value, partners);
    if (field === "name" && !columns.has("name")) {
      if (first !== -1 && last !== -1) {
        const parts = cell.split(/\s+/);
        const lastPart = parts.length > 1 ? parts.pop()! : "";
        return [
          { column: first, value: parts.join(" ") },
          { column: last, value: lastPart },
        ];
      }
      return [{ column: first !== -1 ? first : last, value: cell }];
    }
    const column = columns.get(field);
    return column === undefined ? [] : [{ column, value: cell }];
  };

  const layout: SheetLayout = {
    fields: [...presentFields],
    idColumn,
    addedHeadings,
    addedFields,
    write,
  };

  const base = { layout, hasIdColumn: idAt !== -1, readFields: [...readable] };
  if (isEmpty || grid.length < 2) return { rows: [], ...base };

  const parsed = parseGuestTable(
    [forParsing, ...grid.slice(1)],
    partners,
  );
  if (parsed.error) return { error: parsed.error, rows: [], ...base };

  const rows: SheetRow[] = parsed.rows.map((row) => {
    const all = guestSyncValues(row.values);
    const values: SyncValues = {};
    for (const field of readable) values[field] = all[field];
    const id = idAt !== -1 ? (grid[row.line]?.[idAt] ?? "").trim() || null : null;
    return { line: row.line, id, name: row.values.name, values, errors: row.errors };
  });

  return { rows, ...base };
}

function emptyLayout(): SheetLayout {
  return {
    fields: [],
    idColumn: 0,
    addedHeadings: [],
    addedFields: new Set(),
    write: () => [],
  };
}
