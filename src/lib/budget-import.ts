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
  | "deposit_amount"
  | "paid_by"
  | "due_date"
  | "notes";

/** A single-column field, i.e. everything except notes. */
export type BudgetSingleField = Exclude<BudgetField, "notes">;

/**
 * Which spreadsheet column feeds each field.
 *
 * Notes takes several, because a budget sheet keeps its prose in separate
 * columns -- a Discount/Deal, a Deposits, a payment-terms column -- and all
 * of it is worth keeping.
 */
export type BudgetColumnMap = Partial<Record<BudgetSingleField, number>> & {
  notes?: number[];
};

export const BUDGET_FIELD_LABELS: Record<BudgetField, string> = {
  category: "Category",
  purchased_from: "Vendor",
  amount: "Cost",
  paid_amount: "Paid so far",
  deposit_amount: "Deposit",
  paid_by: "Paid by",
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
  paid_by: string | null;
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
  paid_amount: "Paid, Paid so far, Amount paid",
  deposit_amount: "Deposit, Retainer — counts as paid if Paid so far is blank",
  paid_by: "Paid by, Who's paying",
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
  deposits: "deposit_amount",
  deposit: "deposit_amount",
  retainer: "deposit_amount",
  depositpaid: "deposit_amount",
  paidby: "paid_by",
  whospaying: "paid_by",
  payer: "paid_by",
  datepaid: "due_date",
  duedate: "due_date",
  datedue: "due_date",
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
 * Headings that fit a field but shouldn't outrank a plainer one for it.
 *
 * A sheet with both "Date Paid" and "Final payment due" means the latter for
 * Wren's due date, so the one that says "due" should win it -- and these are
 * held back a pass to make sure it does.
 */
const WEAK_HEADINGS = new Set([
  "total",
  "budget",
  "estimate",
  "quote",
  "actual",
  "datepaid",
  "item",
  "what",
  "expense",
  "who",
  "company",
]);

/** Headings that are already the word "notes", so prefixing adds nothing. */
const PLAIN_NOTE_HEADINGS = new Set(["notes", "note", "comments", "comment"]);

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
  const noteColumns: number[] = [];
  const weak: { index: number; field: BudgetSingleField }[] = [];
  const leftover: number[] = [];

  const claim = (field: BudgetSingleField, index: number) => {
    if (map[field] === undefined) map[field] = index;
    else leftover.push(index);
  };

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
    if (field === "notes") {
      noteColumns.push(index);
      return;
    }
    if (WEAK_HEADINGS.has(key)) weak.push({ index, field });
    else claim(field, index);
  });

  // Held-back headings go second, so they only take a field nothing plainer
  // wanted -- "Deposits" never beats "Paid so far" to the paid column.
  for (const { index, field } of weak) claim(field, index);

  // Duplicate or unplaceable headings: let the data say what they are, and
  // keep anything still homeless as a note rather than dropping it. The
  // heading was one Wren recognises, so the cell under it says something.
  for (const index of leftover.sort((a, b) => a - b)) {
    const cells = body.map((row) => (row[index] ?? "").trim()).filter(Boolean);
    const numeric = cells.filter(looksNumeric).length;
    const mostlyNumeric = cells.length > 0 && numeric / cells.length >= 0.6;

    if (mostlyNumeric && map.amount === undefined) map.amount = index;
    else if (mostlyNumeric && map.paid_amount === undefined) map.paid_amount = index;
    else if (!mostlyNumeric && map.purchased_from === undefined) map.purchased_from = index;
    else noteColumns.push(index);
  }

  if (noteColumns.length > 0) map.notes = noteColumns.sort((a, b) => a - b);

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

  const heading = table[0] ?? [];

  const cellOf = (cells: string[], field: BudgetSingleField) => {
    const at = map[field];
    return at === undefined ? "" : (cells[at] ?? "").trim();
  };

  /**
   * Each note column's cell, named by its own heading.
   *
   * "Deposits: $1,000 refundable for incidentals" carries what the couple
   * wrote; the same text without its heading reads like a stray number.
   */
  const notesOf = (cells: string[]) =>
    (map.notes ?? [])
      .map((at) => {
        const text = (cells[at] ?? "").trim();
        if (!text) return null;
        const key = normaliseHeading(heading[at] ?? "");
        const label = key && !PLAIN_NOTE_HEADINGS.has(key) ? (heading[at] ?? "").trim() : "";
        return label ? `${label}: ${text}` : text;
      })
      .filter((part): part is string => Boolean(part));

  const numbered = body.map((cells, index) => ({ cells, line: index + 1 }));
  const occupied = numbered.filter(
    ({ cells }) =>
      cellOf(cells, "category") !== "" ||
      cellOf(cells, "purchased_from") !== "" ||
      cellOf(cells, "amount") !== "",
  );
  const blankRows = numbered.length - occupied.length;

  // One line item per category, so one row claims it and the rest become
  // items -- a real sheet lists three Wedding Ring rows and all three are
  // real. The row with a cost claims it where there is one: the category line
  // is where the money shows, so a priced Wedding Dress should own "Attire"
  // rather than an empty Alterations row that happened to come first.
  const firstPriced = new Map<string, number>();
  const firstAny = new Map<string, number>();
  for (const { cells, line } of occupied) {
    const key = budgetCategoryKeyFor(cellOf(cells, "category"));
    if (!key) continue;
    if (!firstAny.has(key)) firstAny.set(key, line);
    if (!firstPriced.has(key) && parseMoney(cellOf(cells, "amount")).amount !== null) {
      firstPriced.set(key, line);
    }
  }

  const rows: BudgetImportRow[] = occupied.map(({ cells, line }) => {
    const categoryText = cellOf(cells, "category");
    const vendor = cellOf(cells, "purchased_from") || null;

    const cost = parseMoney(cellOf(cells, "amount"));
    const paid = parseMoney(cellOf(cells, "paid_amount"));
    // A deposit is money that has actually left the account, so where a sheet
    // records one and nothing under "Paid so far", it IS what's been paid.
    // It never overrides a real paid figure -- a $1,000 refundable hold on a
    // line already showing $6,840 paid is not a second payment.
    const deposit = parseMoney(cellOf(cells, "deposit_amount"));

    const dueRaw = cellOf(cells, "due_date");
    const dueDate = parseSheetDate(dueRaw);

    const noteParts = [
      ...notesOf(cells),
      cost.leftover,
      paid.leftover ? `Paid: ${paid.leftover}` : null,
      deposit.leftover ? `Deposit: ${deposit.leftover}` : null,
      // A payment-due cell that isn't a date still says something useful --
      // labelled, since "two weeks before" on its own says nothing.
      dueRaw && !dueDate ? `Due: ${dueRaw}` : null,
    ].filter((part): part is string => Boolean(part));

    const key = budgetCategoryKeyFor(categoryText);
    const isFirstForCategory =
      key !== null && (firstPriced.get(key) ?? firstAny.get(key)) === line;

    // "Photo booth — Brick & Oak", unless the category text already names the
    // vendor -- which it does in a file Wren exported, and re-importing that
    // shouldn't grow "Photo booth — Brick & Oak — Brick & Oak".
    const namesVendor = Boolean(vendor) && categoryText.includes(vendor as string);
    const label = isFirstForCategory && key
      ? CATEGORY_LABELS.get(key) ?? categoryText
      : namesVendor
        ? categoryText
        : [categoryText, vendor].filter(Boolean).join(" — ") || vendor || categoryText;

    return {
      line,
      target: isFirstForCategory ? "category" : "custom",
      values: {
        category: isFirstForCategory ? key : null,
        label,
        amount: cost.amount,
        paid_amount: paid.amount ?? deposit.amount,
        purchased_from: vendor,
        paid_by: cellOf(cells, "paid_by") || null,
        due_date: dueDate,
        notes: noteParts.length > 0 ? noteParts.join(" · ") : null,
      },
      errors: label ? [] : ["Needs a category or a vendor name"],
    };
  });

  return { rows, blankRows };
}

/**
 * A row that would add a nameless $0 item.
 *
 * These are left out unless asked for. An unpriced row that fills a real
 * category line is worth having -- it carries the vendor's name onto a line
 * that already exists -- but an unpriced extra is a new row in the budget
 * with nothing in it, and a budget full of those looks like the spreadsheet
 * the couple was trying to leave.
 */
export function isUnpricedExtra(row: BudgetImportRow) {
  return row.target === "custom" && row.values.amount === null;
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
