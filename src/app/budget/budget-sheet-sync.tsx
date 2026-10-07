"use client";

import { SheetSyncBar } from "@/components/sheet-sync-bar";
import type { SheetLinkView, SiteChanges } from "@/lib/sheet-link-server";
import { BUDGET_TAB_TITLE, readBudgetSheet } from "@/lib/budget-sheet";
import { syncBudgetSheet } from "./sheet-actions";

const FIELD_LABELS: Record<string, string> = {
  name: "Item",
  purchased_from: "Vendor",
  amount: "Cost",
  paid_amount: "Paid so far",
  paid_by: "Paid by",
  due_date: "Due",
  notes: "Notes",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function BudgetSheetSync({
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
  const names = [partnerAName, partnerBName]
    .map((name) => (name ?? "").trim().split(/\s+/)[0])
    .filter(Boolean);

  return (
    <SheetSyncBar
      kind="budget"
      link={link}
      changes={changes}
      canEdit={canEdit}
      noun={{ one: "item", many: "items" }}
      description="Adds a tidy “You Do, I Do budget” tab — to your own workbook or a new sheet — and keeps costs, payments and due dates in step both ways."
      newSheetTitle={names.length === 2 ? `${names[0]} & ${names[1]} — wedding budget` : "Our wedding budget"}
      tabTitle={BUDGET_TAB_TITLE}
      createInWorkbook
      readGrid={readBudgetSheet}
      sync={syncBudgetSheet}
      fieldLabel={(field) => FIELD_LABELS[field] ?? field}
      valueLabel={(field, value) =>
        (field === "amount" || field === "paid_amount") && value ? currency.format(Number(value)) : value
      }
    />
  );
}
