import { BUDGET_CATEGORIES } from "@/lib/budget-categories";
import { normaliseHeading, readTable } from "@/lib/spreadsheet";

/**
 * Turns a budget spreadsheet into rows ready for insert.
 *
 * Budget sheets are messier than guest lists, and in ways that matter:
 * headings repeat or are wrong, cost cells carry prose alongside the number,
 * and a "payment due" column is as likely to say "two weeks before" as a
 * date. So the column mapping is a value the caller can override rather
 * than something inferred once and trusted.
 */

export type BudgetField =
  | "category"
  | "purchased_from"
  | "amount"
  | "paid_amount"
  | "due_date"
  | "notes";

/** Which spreadsheet column index feeds each field. */
export type BudgetColumnMap = Partial<Record<BudgetField, number>>;

export const BUDGET_FIELD_LABELS: Record<BudgetField, string> = {
  category: "Category",
  purchased_from: "Vendor",
  amount: "Cost",
  paid_amount: "Paid so far",
  due_date: "Date paid or due",
  notes: "Notes",
};

export type BudgetImportValues = {
  /** A Wren category key when the row matched one, otherwise null. */
  category: string | null;
  label: string;
  amount: number | null;
  paid_amount: number | null;
  purchased_from: string | null;
  due_date: string | null;
  notes: string | null;
};

export type BudgetImportRow = {
  line: number;
  /** Category rows update that category; everything else becomes an item. */
  target: "category" | "custom";
  values: BudgetImportValues;
  errors: string[];
};

export type BudgetImportParse = {
  rows: BudgetImportRow[];
  error?: string;
  blankRows: number;
};

/** Every column heading Wren recognises, for the mapping UI's help text. */
export const BUDGET_HEADING_EXAMPLES: Record<BudgetField, string> = {
  category: "Category, Item, Expense",
  purchased_from: "Vendor, Who, Company",
  amount: "Cost, Price, Total, Budget",
  paid_amount: "Paid, Deposit, Amount paid",
  due_date: "Date paid, Payment due",
  notes: "Notes, Comments",
};

const HEADING_ALIASES: Record<string, BudgetField> = {
  category: "category",
  item: "category",
  what: "category",
  expense: "category",
  lineitem: "category",
  vendor: "purchased_from",
  vendorname: "purchased_from",
  who: "purchased_from",
  supplier: "purchased_from",
  company: "purchased_from",
  purchasedfrom: "purchased_from",
  cost: "amount",
  amount: "amount",
  price: "amount",
  total: "amount",
  estimate: "amount",
  quote: "amount",
  budget: "amount",
  actual: "amount",
  paid: "paid_amount",
  paidsofar: "paid_amount",
  amountpaid: "paid_amount",
  deposits: "paid_amount",
  deposit: "paid_amount",
  datepaid: "due_date",
  duedate: "due_date",
  finalpaymentdue: "due_date",
  paymentdue: "due_date",
  due: "due_date",
  notes: "notes",
  note: "notes",
  comments: "notes",
  discount: "notes",
  discountdeal: "notes",
};

/**
 * Headings Wren works out for itself. Naming them means the preview can say
 * so, rather than listing them as columns it didn't understand.
 */
const DERIVED_HEADINGS = new Set([
  "stillowed",
  "remaining",
  "balance",
  "outstanding",
  "owed",
]);

/** Their labels -> our category keys. Everything else becomes an item. */
const CATEGORY_ALIASES: Record<string, string> = {
  venue: "venue",
  venuerental: "venue",
  reception: "venue",
  catering: "catering",
  caterer: "catering",
  catererrentals: "catering",
  food: "catering",
  bar: "bar",
  alcohol: "bar",
  drinks: "bar",
  photography: "photography",
  photographer: "photography",
  photos: "photography",
  videography: "videography",
  videographer: "videography",
  video: "videography",
  florals: "florals",
  floralsdecor: "florals",
  flowers: "florals",
  florist: "florals",
  decor: "florals",
  music: "music",
  musicentertainment: "music",
  entertainment: "music",
  livemusic: "music",
  band: "music",
  dj: "music",
  attire: "attire",
  weddingattire: "attire",
  weddingdress: "attire",
  dress: "attire",
  alterations: "attire",
  bridesmaiddresses: "attire",
  groomsmensuits: "attire",
  suit: "attire",
  tux: "attire",
  planner: "planner",
  weddingplanner: "planner",
  coordinator: "planner",
  stationery: "stationery",
  invitations: "stationery",
  invitationsstationery: "stationery",
  invites: "stationery",
  favors: "favors",
  favorsgifts: "favors",
  gifts: "favors",
  cake: "cake",
  weddingcake: "cake",
  cakedesserts: "cake",
  desserts: "cake",
  transportation: "transportation",
  transport: "transportation",
  shuttle: "transportation",
  rehearsaldinner: "rehearsal_dinner",
  rehearsal: "rehearsal_dinner",
  welcomeparty: "welcome_party",
  welcomedinner: "welcome_party",
  hairmakeup: "hair_makeup",
  hair: "hair_makeup",
  makeup: "hair_makeup",
  beauty: "hair_makeup",
  rings: "rings",
  weddingrings: "rings",
  weddingring: "rings",
  ring: "rings",
  bands: "rings",
  officiant: "officiant",
  minister: "officiant",
  gratuities: "gratuities",
  gratuitiesservicecharges: "gratuities",
  tips: "gratuities",
  servicecharge: "gratuities",
};

const CATEGORY_LABELS = new Map(BUDGET_CATEGORIES.map((c) => [c.key, c.label]));

/**
 * Wren's own keys and labels, normalised the same way a heading is.
 *
 * Built rather than listed because `normaliseHeading` drops underscores --
 * "rehearsal_dinner" arrives as "rehearsaldinner", so comparing raw keys
 * would silently miss every multi-word category.
 */
const CATEGORY_BY_TEXT = new Map<string, string>();
for (const category of BUDGET_CATEGORIES) {
  CATEGORY_BY_TEXT.set(normaliseHeading(category.key), category.key);
  CATEGORY_BY_TEXT.set(normaliseHeading(category.label), category.key);
}

/** Does this cell contain a number we could read as money? */
function looksNumeric(raw: string) {
  return /\d/.test(raw) && /^[^a-zA-Z]*[$(]?\s*\d/.test(raw.trim());
}

/**
 * Pulls the first amount out of a cell, and hands back the cell itself when
 * there was more to it than a number.
 *
 * Real budget cells read "$20,650 ($1,300 of which is for Rancher)" or "$400
 * for sound guy, $250 for Nate + travel". Throwing that away loses the part
 * the couple wrote down on purpose, so it is kept as a note -- whole, not as
 * the remainder, because "for sound guy, $250 for Nate" without its own $400
 * in front of it reads like a different sentence.
 */
export function parseMoney(raw: string): { amount: number | null; leftover: string | null } {
  const text = raw.trim();
  if (!text) return { amount: null, leftover: null };

  const match = text.match(/\$?\s*(\d[\d,]*(?:\.\d+)?)/);
  if (!match) return { amount: null, leftover: /[a-zA-Z]/.test(text) ? text : null };

  const amount = Number(match[1].replace(/,/g, ""));
  const rest = (text.slice(0, match.index ?? 0) + text.slice((match.index ?? 0) + match[0].length))
    .replace(/^[\s,;:()-]+|[\s,;:()-]+$/g, "")
    .trim();

  return {
    amount: Number.isFinite(amount) ? amount : null,
    leftover: rest && /[a-zA-Z0-9]/.test(rest) ? text : null,
  };
}

/**
 * Reads the date formats a spreadsheet actually produces, and admits when a
 * cell isn't a date at all -- "two weeks before" is a real value in a real
 * budget, and belongs in notes rather than being dropped or erroring.
 */
export function parseSheetDate(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // 08.08.26, 08/24/2026, 8-24-26 -- US month-first, which is what these
  // sheets are written in.
  const us = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (us) {
    const [, mm, dd, yy] = us;
    const month = Number(mm);
    const day = Number(dd);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const year = yy.length === 2 ? 2000 + Number(yy) : Number(yy);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
}

/**
 * Guesses which column is which, to be shown as an editable default.
 *
 * Headings come first, but they can't be trusted on their own: this file's
 * own budget tab heads its category, vendor and cost columns all three
 * "Category". Where a heading is a duplicate, the column's contents decide --
 * mostly-numeric becomes an amount, the rest becomes the vendor.
 */
export function detectBudgetColumns(table: string[][]): {
  map: BudgetColumnMap;
  unknownColumns: string[];
  derivedColumns: string[];
} {
  const heading = table[0] ?? [];
  const body = table.slice(1);
  const map: BudgetColumnMap = {};
  const unknownColumns: string[] = [];
  const derivedColumns: string[] = [];
  const leftover: number[] = [];

  heading.forEach((raw, index) => {
    const key = normaliseHeading(raw);
    if (!key) return;
    if (DERIVED_HEADINGS.has(key)) {
      derivedColumns.push(raw.trim());
      return;
    }
    const field = HEADING_ALIASES[key];
    if (!field) {
      unknownColumns.push(raw.trim());
      return;
    }
    if (map[field] === undefined) map[field] = index;
    else leftover.push(index);
  });

  // Duplicate headings: let the data say what they are.
  for (const index of leftover) {
    const cells = body.map((row) => (row[index] ?? "").trim()).filter(Boolean);
    const numeric = cells.filter(looksNumeric).length;
    const mostlyNumeric = cells.length > 0 && numeric / cells.length >= 0.6;

    if (mostlyNumeric && map.amount === undefined) map.amount = index;
    else if (mostlyNumeric && map.paid_amount === undefined) map.paid_amount = index;
    else if (!mostlyNumeric && map.purchased_from === undefined) map.purchased_from = index;
    else unknownColumns.push((heading[index] ?? "").trim() || `Column ${index + 1}`);
  }

  return { map, unknownColumns, derivedColumns };
}

export function budgetCategoryKeyFor(raw: string): string | null {
  const key = normaliseHeading(raw);
  if (!key) return null;
  return CATEGORY_BY_TEXT.get(key) ?? CATEGORY_ALIASES[key] ?? null;
}

export function parseBudgetTable(
  table: string[][],
  map: BudgetColumnMap,
): BudgetImportParse {
  if (table.length === 0) return { rows: [], error: "Nothing to import yet.", blankRows: 0 };
  if (map.category === undefined && map.purchased_from === undefined) {
    return {
      rows: [],
      error: "Tell Wren which column holds the category or the vendor before importing.",
      blankRows: 0,
    };
  }

  const body = table.slice(1);
  if (body.length === 0) {
    return { rows: [], error: "Found headings but no budget rows underneath them.", blankRows: 0 };
  }

  const cellOf = (cells: string[], field: BudgetField) => {
    const at = map[field];
    return at === undefined ? "" : (cells[at] ?? "").trim();
  };

  const numbered = body.map((cells, index) => ({ cells, line: index + 1 }));
  const occupied = numbered.filter(
    ({ cells }) =>
      cellOf(cells, "category") !== "" ||
      cellOf(cells, "purchased_from") !== "" ||
      cellOf(cells, "amount") !== "",
  );
  const blankRows = numbered.length - occupied.length;

  // One line item per category, so the first row claiming a category gets it
  // and later ones become items -- a real sheet lists three Wedding Ring rows
  // and all three are real.
  const claimed = new Set<string>();

  const rows: BudgetImportRow[] = occupied.map(({ cells, line }) => {
    const categoryText = cellOf(cells, "category");
    const vendor = cellOf(cells, "purchased_from") || null;

    const cost = parseMoney(cellOf(cells, "amount"));
    const paid = parseMoney(cellOf(cells, "paid_amount"));

    const dueRaw = cellOf(cells, "due_date");
    const dueDate = parseSheetDate(dueRaw);

    const noteParts = [
      cellOf(cells, "notes") || null,
      cost.leftover,
      paid.leftover ? `Paid: ${paid.leftover}` : null,
      // A payment-due cell that isn't a date still says something useful --
      // labelled, since "two weeks before" on its own says nothing.
      dueRaw && !dueDate ? `Due: ${dueRaw}` : null,
    ].filter((part): part is string => Boolean(part));

    const key = budgetCategoryKeyFor(categoryText);
    const isFirstForCategory = key !== null && !claimed.has(key);
    if (isFirstForCategory && key) claimed.add(key);

    const label = isFirstForCategory && key
      ? CATEGORY_LABELS.get(key) ?? categoryText
      : [categoryText, vendor].filter(Boolean).join(" — ") || vendor || categoryText;

    return {
      line,
      target: isFirstForCategory ? "category" : "custom",
      values: {
        category: isFirstForCategory ? key : null,
        label,
        amount: cost.amount,
        paid_amount: paid.amount,
        purchased_from: vendor,
        due_date: dueDate,
        notes: noteParts.length > 0 ? noteParts.join(" · ") : null,
      },
      errors: label ? [] : ["Needs a category or a vendor name"],
    };
  });

  return { rows, blankRows };
}

export function parseBudgetText(text: string, map?: BudgetColumnMap): BudgetImportParse {
  const table = readTable(text);
  if (table.length === 0) return { rows: [], error: "That sheet looks empty.", blankRows: 0 };
  return parseBudgetTable(table, map ?? detectBudgetColumns(table).map);
}

export const BUDGET_IMPORT_TEMPLATE = [
  "Category",
  "Vendor",
  "Cost",
  "Paid so far",
  "Date paid",
  "Notes",
].join("\t");
