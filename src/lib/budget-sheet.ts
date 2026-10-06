import type { BudgetCustomItem } from "@/lib/supabase/types";
import { parseMoney, parseSheetDate } from "@/lib/budget-import";
import { normaliseHeading } from "@/lib/spreadsheet";
import type { SheetLayout, SheetRow, SiteRow, SyncValues } from "@/lib/sheet-sync";

/**
 * The budget's side of a linked Google Sheet.
 *
 * Unlike the guest list, this syncs a tab Wren lays out itself ("You Do, I
 * Do budget"), added to the couple's workbook or a new sheet -- not their
 * own budget tab. Real budget sheets keep a price and a sentence in one cell,
 * and spread notes across three columns; the importer untangles that once,
 * but writing back into it would garble it. A tab with one thing per column
 * reads and writes cleanly forever.
 *
 * Rows are the standard categories (id "category:<key>", name fixed, cost
 * blank = use the estimate) and the couple's own items (their own id).
 */

export const BUDGET_SYNC_FIELDS = [
  "name",
  "purchased_from",
  "amount",
  "paid_amount",
  "paid_by",
  "due_date",
  "notes",
] as const;

export type BudgetSyncField = (typeof BUDGET_SYNC_FIELDS)[number];

export const BUDGET_TAB_TITLE = "You Do, I Do budget";

const HEADINGS: Record<BudgetSyncField, string> = {
  name: "Item",
  purchased_from: "Vendor",
  amount: "Cost",
  paid_amount: "Paid so far",
  paid_by: "Paid by",
  due_date: "Due",
  notes: "Notes",
};

const ALIASES: Record<string, BudgetSyncField> = {
  item: "name",
  category: "name",
  name: "name",
  vendor: "purchased_from",
  purchasedfrom: "purchased_from",
  cost: "amount",
  amount: "amount",
  price: "amount",
  paidsofar: "paid_amount",
  paid: "paid_amount",
  amountpaid: "paid_amount",
  paidby: "paid_by",
  whospaying: "paid_by",
  due: "due_date",
  duedate: "due_date",
  datedue: "due_date",
  paymentdue: "due_date",
  notes: "notes",
  note: "notes",
};

/** A total someone added under the list isn't an item to import. */
const TOTAL_NAMES = new Set(["total", "totals", "grandtotal", "subtotal", "sum"]);

export const CATEGORY_ID_PREFIX = "category:";

export function isCategoryId(id: string) {
  return id.startsWith(CATEGORY_ID_PREFIX);
}

function money(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return "";
  return String(Math.round(Number(value) * 100) / 100);
}

/** What the page already shows for a category line or a custom item. */
export type BudgetSiteLine = {
  id: string;
  label: string;
  amount: number | null;
  paid_amount: number | null;
  purchased_from: string | null;
  paid_by: string | null;
  due_date: string | null;
  notes: string | null;
};

export function budgetSyncValues(line: BudgetSiteLine): SyncValues {
  return {
    name: line.label.trim(),
    purchased_from: line.purchased_from?.trim() ?? "",
    amount: money(line.amount),
    paid_amount: money(line.paid_amount),
    paid_by: line.paid_by?.trim() ?? "",
    due_date: line.due_date ?? "",
    notes: line.notes?.trim() ?? "",
  };
}

export function budgetSiteRows(lines: BudgetSiteLine[]): SiteRow[] {
  return lines.map((line) => ({ id: line.id, name: line.label, values: budgetSyncValues(line) }));
}

export function customItemLine(item: BudgetCustomItem): BudgetSiteLine {
  return {
    id: item.id,
    label: item.label,
    amount: item.amount,
    paid_amount: item.paid_amount,
    purchased_from: item.purchased_from,
    paid_by: item.paid_by,
    due_date: item.due_date,
    notes: item.notes,
  };
}

/** Sync values back into columns, for a category line or a custom item. */
export function budgetColumnsFromValues(values: SyncValues) {
  const text = (field: BudgetSyncField) => values[field]?.trim() || null;
  const number = (field: BudgetSyncField) => (values[field] ? Number(values[field]) : null);
  return {
    label: values.name?.trim() ?? "",
    amount: number("amount"),
    paid_amount: number("paid_amount"),
    purchased_from: text("purchased_from"),
    paid_by: text("paid_by"),
    due_date: text("due_date"),
    notes: text("notes"),
  };
}

export function readBudgetSheet(grid: string[][]): {
  error?: string;
  rows: SheetRow[];
  layout: SheetLayout;
  hasIdColumn: boolean;
  readFields: string[];
} {
  const isEmpty = grid.length === 0 || grid[0].every((cell) => cell.trim() === "");
  const heading = isEmpty ? [] : grid[0];
  const width = Math.max(heading.length, ...grid.map((row) => row.length), 0);

  const columns = new Map<string, number>();
  let idColumn = -1;
  heading.forEach((cell, index) => {
    const key = normaliseHeading(cell);
    if (key === "syncid") idColumn = index;
    const field = ALIASES[key];
    if (field && !columns.has(field)) columns.set(field, index);
  });
  const readFields = BUDGET_SYNC_FIELDS.filter((field) => columns.has(field));
  const hasIdColumn = idColumn !== -1;

  // Ours is a tab Wren made, so every column belongs in it: put back any
  // the couple removed.
  const addedHeadings: { column: number; heading: string }[] = [];
  const addedFields = new Set<string>();
  let next = isEmpty ? 0 : width;
  for (const field of BUDGET_SYNC_FIELDS) {
    if (columns.has(field)) continue;
    columns.set(field, next);
    addedHeadings.push({ column: next, heading: HEADINGS[field] });
    addedFields.add(field);
    next++;
  }
  if (!hasIdColumn) {
    idColumn = next;
    addedHeadings.push({ column: next, heading: "Sync ID" });
  }

  const layout: SheetLayout = {
    fields: [...BUDGET_SYNC_FIELDS],
    idColumn,
    addedHeadings,
    addedFields,
    write: (field, value) => {
      const column = columns.get(field);
      if (column === undefined) return [];
      // Numbers as numbers, so the couple's own SUM still adds them up.
      const isMoney = field === "amount" || field === "paid_amount";
      return [{ column, value: isMoney && value !== "" ? Number(value) : value }];
    },
  };

  const rows: SheetRow[] = [];
  for (let line = 1; line < grid.length; line++) {
    const cells = grid[line] ?? [];
    const cell = (field: BudgetSyncField) => {
      const at = columns.get(field);
      return at === undefined || addedFields.has(field) ? "" : (cells[at] ?? "").trim();
    };
    const raw = Object.fromEntries(BUDGET_SYNC_FIELDS.map((field) => [field, cell(field)]));
    if (Object.values(raw).every((value) => value === "")) continue;
    if (TOTAL_NAMES.has(normaliseHeading(raw.name))) continue;

    const errors: string[] = [];
    const values: SyncValues = {};
    for (const field of readFields) {
      const text = raw[field];
      if (field === "amount" || field === "paid_amount") {
        const parsed = parseMoney(text);
        if (text && parsed.amount === null) errors.push(`${HEADINGS[field]} "${text}" isn't an amount`);
        values[field] = money(parsed.amount);
      } else if (field === "due_date") {
        const date = parseSheetDate(text);
        if (text && !date) errors.push(`Due "${text}" isn't a date — try 2026-08-24`);
        values[field] = date ?? "";
      } else {
        values[field] = text;
      }
    }
    if (!raw.name) errors.push("Needs an item name");

    const id = hasIdColumn ? (cells[idColumn] ?? "").trim() || null : null;
    rows.push({ line, id, name: raw.name, values, errors });
  }

  return { rows, layout, hasIdColumn, readFields: [...readFields] };
}
