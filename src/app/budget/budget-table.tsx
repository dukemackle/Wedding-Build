"use client";

import { useState, useTransition } from "react";
import type { ComponentType } from "react";
import {
  addBudgetCustomItem,
  deleteBudgetCustomItem,
  hideBudgetCategory,
  sendBudgetReminder,
  unhideBudgetCategory,
  updateBudgetCustomItem,
  updateBudgetLineItem,
} from "./actions";
import {
  VenueIcon,
  CateringIcon,
  BarIcon,
  PhotographyIcon,
  VideographyIcon,
  FloralsIcon,
  MusicIcon,
  AttireIcon,
  PlannerIcon,
  StationeryIcon,
  FavorsIcon,
  CakeIcon,
  TransportationIcon,
  ToastIcon,
  BuntingIcon,
  HairMakeupIcon,
  RingsIcon,
  OfficiantIcon,
  GratuitiesIcon,
  ServiceChargeIcon,
  SalesTaxIcon,
  ContingencyIcon,
  CustomItemIcon,
  BellIcon,
  NotesIcon,
  PaperclipIcon,
  TrashIcon,
  CheckIcon,
  InsuranceIcon,
  AlterationsIcon,
  PartyAttireIcon,
  MoreIcon,
  ChevronDownIcon,
} from "@/components/icons";
import {
  BUDGET_SECTIONS,
  type BudgetSectionKey,
} from "@/lib/budget-categories";
import { SpreadsheetLink } from "@/components/spreadsheet-link";
import type { BudgetContract } from "@/lib/supabase/types";
import { ContractsPanel } from "./contracts-panel";
import { BudgetImportPanel } from "./budget-import-panel";
import { BudgetSummary } from "./budget-summary";
import { PlusIcon } from "@/components/page-header";
import { BirdCheer } from "@/components/bird-cheer";

export const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  venue: VenueIcon,
  catering: CateringIcon,
  bar: BarIcon,
  photography: PhotographyIcon,
  videography: VideographyIcon,
  florals: FloralsIcon,
  music: MusicIcon,
  attire: AttireIcon,
  planner: PlannerIcon,
  stationery: StationeryIcon,
  favors: FavorsIcon,
  cake: CakeIcon,
  transportation: TransportationIcon,
  rehearsal_dinner: ToastIcon,
  welcome_party: BuntingIcon,
  hair_makeup: HairMakeupIcon,
  rings: RingsIcon,
  alterations: AlterationsIcon,
  wedding_party_attire: PartyAttireIcon,
  insurance: InsuranceIcon,
  officiant: OfficiantIcon,
  gratuities: GratuitiesIcon,
  service_charge: ServiceChargeIcon,
  sales_tax: SalesTaxIcon,
  contingency: ContingencyIcon,
};

export type BudgetRow = {
  key: string;
  label: string;
  isPerGuest: boolean;
  computed: number | null;
  override: number | null;
  paidAmount: number | null;
  /** Discounts and credits on this line; already taken off what they pay. */
  savedAmount: number | null;
  section: BudgetSectionKey;
  purchasedFrom: string | null;
  paidBy: string | null;
  dueDate: string | null;
  notes: string | null;
  imageUrl: string | null;
  suggestions: string[];
};

type AmountField = "override_value" | "paid_amount" | "saved_amount";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function csvField(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function money(value: number | null) {
  return value == null ? "" : String(value);
}

/**
 * One definition, so the CSV and the Excel file can't drift apart -- and so
 * the headings we export are ones Wren's own budget importer reads back.
 *
 * Estimate and Cost are both here on purpose: side by side, "what this
 * usually runs" against "what we're actually paying" is the thing Wren's
 * budget has that a spreadsheet doesn't, and it's what makes this worth
 * sending to whoever is helping pay for the wedding.
 *
 * No totals row. It would read well and then come back in as a phantom
 * $59,542 line item the next time someone imported the file -- and the page
 * already shows the totals.
 */
const EXPORT_COLUMNS: { header: string; value: (row: BudgetRow) => string }[] = [
  { header: "Category", value: (r) => r.label },
  { header: "Vendor", value: (r) => r.purchasedFrom ?? "" },
  { header: "Wren estimate", value: (r) => money(r.computed) },
  { header: "Cost", value: (r) => money(r.override) },
  { header: "Paid so far", value: (r) => money(r.paidAmount) },
  {
    header: "Still owed",
    value: (r) => {
      const cost = r.override ?? r.computed;
      return cost == null ? "" : String(Math.max(0, cost - (r.paidAmount ?? 0)));
    },
  },
  { header: "Paid by", value: (r) => r.paidBy ?? "" },
  { header: "Due date", value: (r) => r.dueDate ?? "" },
  { header: "Notes", value: (r) => r.notes ?? "" },
];

function exportFileName(extension: string) {
  return `budget-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

async function downloadBudgetXlsx(rows: BudgetRow[]) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const data = [
    EXPORT_COLUMNS.map((col) => ({ value: col.header, fontWeight: "bold" as const })),
    ...rows.map((row) => EXPORT_COLUMNS.map((col) => ({ value: col.value(row) }))),
  ];
  await writeXlsxFile(data, {
    columns: EXPORT_COLUMNS.map((col) => ({ width: Math.max(12, col.header.length + 4) })),
  }).toFile(exportFileName("xlsx"));
}

function downloadBudgetCsv(rows: BudgetRow[]) {
  const body = rows.map((row) =>
    EXPORT_COLUMNS.map((col) => csvField(col.value(row))).join(","),
  );
  const csv = [EXPORT_COLUMNS.map((c) => c.header).join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName("csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const numberInputClass =
  "w-full rounded-md border border-hairline bg-parchment px-2 py-1.5 text-right font-mono-numbers text-sm text-ink outline-none focus:border-[#2243B6] lg:text-[15px]";

/** Quieter than the other two: it's for the record, and empty on most lines. */
const savedInputClass =
  "w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-right font-mono-numbers text-sm text-[#9a6b00] outline-none placeholder:text-ink/25 hover:border-hairline focus:border-[#2243B6] focus:bg-card lg:text-[15px]";

/**
 * The wide-screen row: icon, name, estimate, actual, saved, paid, menu. The
 * section's column labels use the same tracks, so if one changes, change both.
 */
const ROW_GRID =
  "lg:grid-cols-[2.75rem_minmax(0,1fr)_5.5rem_6.5rem_5.5rem_8.75rem_2rem] lg:gap-x-3 2xl:grid-cols-[2.75rem_minmax(0,1fr)_6.5rem_7.5rem_6.5rem_10rem_2rem] 2xl:gap-x-4";

/** "Due Aug 28", turning urgent inside a week and red once it's passed. */
function dueStatus(dateStr: string): { text: string; tone: "overdue" | "soon" | "set" } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateStr}T00:00:00`);
  const label = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return { text: `Overdue · ${label}`, tone: "overdue" };
  if (days === 0) return { text: "Due today", tone: "soon" };
  if (days <= 7) return { text: `Due in ${days} day${days === 1 ? "" : "s"} · ${label}`, tone: "soon" };
  return { text: `Due ${label}`, tone: "set" };
}

/**
 * The line's icon in a ring that fills royal blue as it's paid, turning gold
 * with a check once it's paid in full -- how far along each line is, readable
 * down the page without reading a number.
 */
function PaidRing({
  pct,
  full,
  icon: Icon,
}: {
  pct: number;
  full: boolean;
  icon: ComponentType<{ className?: string }>;
}) {
  const circumference = 2 * Math.PI * 20;
  return (
    <div className="relative col-start-1 row-start-1 h-11 w-11 self-start lg:row-end-3">
      <svg viewBox="0 0 44 44" aria-hidden="true" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r="20" fill="none" stroke="#ece8df" strokeWidth="3" />
        {pct > 0 && (
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke={full ? "#FFD301" : "#2243B6"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(circumference * pct) / 100} ${circumference}`}
            className="transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none"
          />
        )}
      </svg>
      <span
        className={`absolute inset-[5px] flex items-center justify-center rounded-full transition-colors ${
          full ? "bg-[#FFD301] text-forest" : "bg-[#fff8d1] text-[#9a6b00]"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {full && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-card bg-[#2243B6] text-white">
          <CheckIcon className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
  );
}

function BudgetRowItem({
  row,
  payerSuggestions,
  onSaveAmounts,
  onSaveDetails,
  onDelete,
  deleteLabel,
  deleteConfirm,
  contracts,
  isCustom,
  onEdited,
}: {
  row: BudgetRow;
  payerSuggestions: string[];
  onSaveAmounts: (formData: FormData) => Promise<{ error?: string }>;
  onSaveDetails: (formData: FormData) => Promise<{ error?: string }>;
  onDelete: () => Promise<{ error?: string }>;
  deleteLabel: string;
  deleteConfirm: string;
  contracts: BudgetContract[];
  /** Custom items file contracts by id; category rows by their category key. */
  isCustom: boolean;
  /** Hands the table something it can offer to undo. */
  onEdited: (edit: BudgetEdit) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  // Details and Contract share the space under the row, so opening one closes the other.
  function toggleDetails() {
    setShowContracts(false);
    setShowDetails((v) => !v);
  }
  function toggleContracts() {
    setShowDetails(false);
    setShowContracts((v) => !v);
  }
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [actualInput, setActualInput] = useState(row.override != null ? String(row.override) : "");
  const [paidInput, setPaidInput] = useState(row.paidAmount != null ? String(row.paidAmount) : "");
  const [savedInput, setSavedInput] = useState(row.savedAmount != null ? String(row.savedAmount) : "");
  const [menuOpen, setMenuOpen] = useState(false);
  /**
   * What was in the paid box before "Paid in full" filled it.
   *
   * Ticking the box on a line that's part-paid overwrites a real number the
   * couple typed, so unticking has to give it back rather than leaving zero.
   * Session-only: after a reload the stored figure IS the full amount, and
   * unticking clears it, which is what the page is showing anyway.
   */
  const [paidBeforeFull, setPaidBeforeFull] = useState<string | null>(null);
  // Counts each "paid in full" click, so the tick pops and Wren cheers again
  // every time rather than only the first.
  const [paidCheer, setPaidCheer] = useState(0);

  const effectiveValue = row.override ?? row.computed ?? 0;
  const liveActual = Number(actualInput) || effectiveValue;
  const livePaid = Number(paidInput) || 0;
  const paidPct = liveActual > 0 ? Math.min(100, (livePaid / liveActual) * 100) : 0;
  const isFullyPaid = liveActual > 0 && livePaid >= liveActual;
  const datalistId = `purchased-from-${row.key}`;
  const payerDatalistId = `paid-by-${row.key}`;
  const Icon = CATEGORY_ICONS[row.key] ?? CustomItemIcon;

  /** Writes all three amounts, whichever one the edit touched. */
  function saveAmounts(next: { actual: string; paid: string; saved: string }) {
    const formData = new FormData();
    formData.set("category", row.key);
    formData.set("override_value", next.actual);
    formData.set("paid_amount", next.paid);
    formData.set("saved_amount", next.saved);
    return onSaveAmounts(formData);
  }

  function handleAmountBlur(field: AmountField, value: string) {
    const next = {
      actual: field === "override_value" ? value : actualInput,
      paid: field === "paid_amount" ? value : paidInput,
      saved: field === "saved_amount" ? value : savedInput,
    };

    // What the server last told us, which is what undo puts back -- not the
    // local input, which is already carrying the new value by now.
    const was = {
      actual: row.override != null ? String(row.override) : "",
      paid: row.paidAmount != null ? String(row.paidAmount) : "",
      saved: row.savedAmount != null ? String(row.savedAmount) : "",
    };
    const changed = next.actual !== was.actual || next.paid !== was.paid || next.saved !== was.saved;

    startTransition(async () => {
      const result = await saveAmounts(next);
      setError(result?.error);
      if (result?.error || !changed) return;

      const amount =
        field === "override_value" ? next.actual : field === "paid_amount" ? next.paid : next.saved;
      const what = field === "override_value" ? "cost" : field === "paid_amount" ? "paid" : "saved";
      onEdited({
        label: `${row.label} ${what} set to ${amount ? currency.format(Number(amount)) : "—"}`,
        undo: () => {
          setActualInput(was.actual);
          setPaidInput(was.paid);
          setSavedInput(was.saved);
          return saveAmounts(was);
        },
      });
    });
  }

  /** Fills the paid box with the line's own total, or puts back what was there. */
  function handlePaidInFull(checked: boolean) {
    if (liveActual <= 0) return;
    const next = checked ? String(liveActual) : (paidBeforeFull ?? "");
    setPaidBeforeFull(checked ? paidInput : null);
    setPaidInput(next);
    if (checked) setPaidCheer((n) => n + 1);
    handleAmountBlur("paid_amount", next);
  }

  function handleSaveDetails(formData: FormData) {
    formData.set("category", row.key);
    startTransition(async () => {
      const result = await onSaveDetails(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setShowDetails(false);
      }
    });
  }

  function handleDelete() {
    setConfirmingDelete(false);
    startTransition(async () => {
      const result = await onDelete();
      if (result?.error) setError(result.error);
    });
  }

  function handleSendReminder() {
    const formData = new FormData();
    formData.set("label", row.label);
    formData.set("amount_text", currency.format(effectiveValue));
    formData.set("due_date", row.dueDate ?? "");
    setIsSendingReminder(true);
    startTransition(async () => {
      const result = await sendBudgetReminder(formData);
      setIsSendingReminder(false);
      if (result?.error) {
        setError(result.error);
      } else {
        setReminderSent(true);
        setTimeout(() => setReminderSent(false), 3000);
      }
    });
  }

  // The row's amounts, chips and menu. Who's paying, when it's due and notes
  // live in the details form the chips open.
  const actionOpen = showDetails || showContracts || confirmingDelete || reminderSent || !!error;
  const due = row.dueDate ? dueStatus(row.dueDate) : null;
  const liveSaved = Number(savedInput) || 0;
  const chipClass =
    "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium transition-[transform,box-shadow,background-color,border-color] hover:-translate-y-px hover:shadow-[0_2px_6px_rgb(20_32_61/0.08)] motion-reduce:transform-none";
  const emptyChipClass = `${chipClass} border-dashed border-[#d8d2c4] text-ink/55 hover:border-[#2243B6] hover:text-[#2243B6]`;

  return (
    <div className={`border-b border-hairline last:border-b-0${menuOpen ? " relative z-30" : ""}`}>
      {paidCheer > 0 && isFullyPaid && <BirdCheer key={paidCheer} message={`${row.label} is paid in full!`} />}
      <div
        className={`${paidCheer > 0 && isFullyPaid ? "paid-glow " : ""}grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 transition-colors hover:bg-parchment/50 ${ROW_GRID} lg:px-6`}
      >
        <PaidRing pct={paidPct} full={isFullyPaid} icon={Icon} />

        <div className="col-start-2 row-start-1 min-w-0">
          <p className="truncate text-[15px] font-medium text-ink lg:text-base">{row.label}</p>
          {(row.purchasedFrom || row.isPerGuest) && (
            <p className="truncate text-[13px] text-ink/55">
              {row.purchasedFrom ?? "scales with guest count"}
            </p>
          )}
        </div>

        {/* Est. / Actual / Paid. Labelled cells on a phone; on a wide screen
            lg:contents dissolves the wrapper so each lands in its column. */}
        <div className="col-start-1 col-end-4 row-start-3 grid grid-cols-[0.8fr_1fr_1.35fr] gap-2 lg:contents">
          <label className="flex flex-col gap-0.5 lg:col-start-3 lg:row-start-1 lg:block lg:text-right">
            <span className="font-mono-numbers text-[10px] uppercase tracking-[0.14em] text-ink/45 lg:hidden">
              Estimate
            </span>
            <span className="py-1.5 font-mono-numbers text-sm text-ink/55 lg:py-0">
              {row.computed !== null ? currency.format(row.computed) : "—"}
            </span>
          </label>
          <label className="flex flex-col gap-0.5 lg:col-start-4 lg:row-start-1">
            <span className="font-mono-numbers text-[10px] uppercase tracking-[0.14em] text-ink/45 lg:hidden">
              Actual
            </span>
            <input
              type="number"
              min={0}
              value={actualInput}
              placeholder="0"
              aria-label={`Actual cost for ${row.label}`}
              onChange={(e) => setActualInput(e.target.value)}
              onBlur={(e) => handleAmountBlur("override_value", e.target.value)}
              className={numberInputClass}
            />
          </label>
          <label className="hidden lg:col-start-5 lg:row-start-1 lg:block">
            <input
              type="number"
              min={0}
              value={savedInput}
              placeholder="—"
              title="Discounts and credits. Enter the cost after them; this is for the record."
              aria-label={`Amount saved on ${row.label}`}
              onChange={(e) => setSavedInput(e.target.value)}
              onBlur={(e) => handleAmountBlur("saved_amount", e.target.value)}
              className={savedInputClass}
            />
          </label>
          <label className="flex flex-col gap-0.5 lg:col-start-6 lg:row-start-1">
            <span className="font-mono-numbers text-[10px] uppercase tracking-[0.14em] text-ink/45 lg:hidden">
              Paid
            </span>
            <span className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                value={paidInput}
                placeholder="0"
                aria-label={`Amount paid for ${row.label}`}
                onChange={(e) => setPaidInput(e.target.value)}
                onBlur={(e) => handleAmountBlur("paid_amount", e.target.value)}
                className={`${numberInputClass} min-w-0`}
              />
              <button
                key={paidCheer}
                type="button"
                onClick={() => handlePaidInFull(!isFullyPaid)}
                disabled={liveActual <= 0 || isPending}
                aria-pressed={isFullyPaid}
                title={isFullyPaid ? "Paid in full -- click to undo" : "Mark paid in full"}
                aria-label={`Paid in full for ${row.label}`}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:opacity-40 ${
                  isFullyPaid
                    ? `border-[#2243B6] bg-[#2243B6] text-white ${paidCheer > 0 ? "paid-pop" : ""}`
                    : "border-[#c9d3f2] text-transparent hover:border-[#2243B6] hover:text-[#2243B6]/50"
                }`}
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          </label>
        </div>

        <div className="relative col-start-3 row-start-1 justify-self-end lg:col-start-7">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={`More for ${row.label}`}
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/45 transition-colors hover:bg-parchment hover:text-forest"
          >
            <MoreIcon className="h-[18px] w-[18px]" />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                tabIndex={-1}
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="menu"
                onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
                className="absolute right-0 top-9 z-30 w-56 overflow-hidden rounded-xl border border-hairline bg-card py-1 text-sm shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  autoFocus
                  disabled={isSendingReminder}
                  onClick={() => {
                    setMenuOpen(false);
                    handleSendReminder();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-ink hover:bg-parchment"
                >
                  <BellIcon className="h-4 w-4 text-ink/50" /> Email me a reminder
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmingDelete(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-800 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" /> {deleteLabel}
                </button>
              </div>
            </>
          )}
        </div>

        {/* What's set shows what it is; what isn't is a faint dashed chip to
            add it. On a phone, paid and saved are chips too, since there's no
            Saved column there. */}
        <div className="col-start-2 col-end-4 row-start-2 flex flex-wrap items-center gap-1.5 lg:col-end-7">
          {livePaid > 0 && (
            <span
              className={`${chipClass} border-transparent lg:hidden ${
                isFullyPaid ? "bg-[#2243B6] text-white" : "bg-[#eef1fb] text-[#2243B6]"
              }`}
            >
              {isFullyPaid ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" /> Paid in full
                </>
              ) : (
                `${currency.format(livePaid)} paid`
              )}
            </span>
          )}
          {liveSaved > 0 && (
            <span className={`${chipClass} border-transparent bg-[#fff8d1] text-[#9a6b00] lg:hidden`}>
              ✦ Saved {currency.format(liveSaved)}
            </span>
          )}
          {due ? (
            <button
              type="button"
              onClick={toggleDetails}
              className={`${chipClass} ${
                due.tone === "overdue"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : due.tone === "soon"
                    ? "border-[#2243B6] bg-[#2243B6] text-white"
                    : "border-[#c9d3f2] bg-card text-[#2243B6]"
              }`}
            >
              <BellIcon className="h-3.5 w-3.5" /> {due.text}
            </button>
          ) : (
            !isFullyPaid && (
              <button type="button" onClick={toggleDetails} className={emptyChipClass}>
                <BellIcon className="h-3.5 w-3.5" /> Due date
              </button>
            )
          )}
          <button
            type="button"
            onClick={toggleContracts}
            aria-expanded={showContracts}
            className={
              contracts.length > 0 ? `${chipClass} border-hairline bg-card text-forest` : emptyChipClass
            }
          >
            <PaperclipIcon className="h-3.5 w-3.5" />
            {contracts.length > 0
              ? `${contracts.length} contract${contracts.length === 1 ? "" : "s"}`
              : "Contract"}
          </button>
          <button
            type="button"
            onClick={toggleDetails}
            aria-expanded={showDetails}
            className={
              row.notes
                ? `${chipClass} border-hairline bg-card text-forest`
                : `${emptyChipClass.replace("inline-flex ", "")} hidden sm:inline-flex`
            }
          >
            <NotesIcon className="h-3.5 w-3.5" /> {row.notes ? "Note" : "Details"}
          </button>
        </div>
      </div>

      {actionOpen && (
        <div className="flex flex-col gap-3 bg-parchment/40 px-1 pb-4 pt-1 sm:px-2 sm:pl-8">
      {/* An in-page confirm rather than window.confirm(): the native dialog
          looks nothing like the app and is dismissed by reflex, which is
          exactly the accidental delete it is supposed to prevent. */}
      {confirmingDelete && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-900">{deleteConfirm}</p>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full border border-red-200 bg-card px-3 py-1 font-mono-numbers text-xs text-ink/70 transition-colors hover:border-forest hover:text-forest"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full bg-red-800 px-3 py-1 font-mono-numbers text-xs text-parchment transition-colors hover:bg-red-900 disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      )}

      {reminderSent && <p className="text-xs text-forest">Reminder sent to your email.</p>}
      {error && <p className="text-sm text-red-800">{error}</p>}

      {showContracts && (
        <ContractsPanel rowKey={row.key} isCustom={isCustom} contracts={contracts} />
      )}

      {showDetails && (
        <form
          action={handleSaveDetails}
          className="flex flex-col items-start gap-2 rounded-md border border-hairline bg-parchment p-3"
        >
          <input
            type="text"
            name="purchased_from"
            list={row.suggestions.length > 0 ? datalistId : undefined}
            placeholder="Purchased from (optional)"
            defaultValue={row.purchasedFrom ?? ""}
            className="w-full rounded-md border border-hairline bg-card px-2 py-1 text-sm text-ink outline-none focus:border-forest sm:w-64"
          />
          {row.suggestions.length > 0 && (
            <datalist id={datalistId}>
              {row.suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          )}
          <input
            type="text"
            name="paid_by"
            list={payerSuggestions.length > 0 ? payerDatalistId : undefined}
            placeholder="Paid by (optional)"
            defaultValue={row.paidBy ?? ""}
            className="w-full rounded-md border border-hairline bg-card px-2 py-1 text-sm text-ink outline-none focus:border-forest sm:w-64"
          />
          {payerSuggestions.length > 0 && (
            <datalist id={payerDatalistId}>
              {payerSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          )}
          <label className="flex w-full flex-col gap-1 text-xs text-ink/70 sm:w-64">
            Due date (optional)
            <input
              type="date"
              name="due_date"
              defaultValue={row.dueDate ?? ""}
              className="w-full rounded-md border border-hairline bg-card px-2 py-1 text-sm text-ink outline-none focus:border-forest"
            />
          </label>
          {/* The Saved column is wide-screen only, so a phone sets it here. */}
          <label className="flex w-full flex-col gap-1 text-xs text-ink/70 sm:w-64 lg:hidden">
            Saved (discounts and credits)
            <input
              type="number"
              name="saved_amount"
              min={0}
              value={savedInput}
              onChange={(e) => setSavedInput(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-hairline bg-card px-2 py-1 text-sm text-ink outline-none focus:border-forest"
            />
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Notes (optional)"
            defaultValue={row.notes ?? ""}
            className="w-full rounded-md border border-hairline bg-card px-2 py-1 text-sm text-ink outline-none focus:border-forest sm:w-64"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-3 py-1 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="rounded-md border border-hairline px-3 py-1 text-sm text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
        </div>
      )}
    </div>
  );
}

/** A change the table offers to take back, and how to take it back. */
type BudgetEdit = {
  /** What it was, in the couple's words -- "Venue Rental set to $19,000". */
  label: string;
  undo: () => Promise<{ error?: string } | void>;
};

function AddItemForm({
  onDone,
  payerSuggestions,
  section,
}: {
  onDone: () => void;
  payerSuggestions: string[];
  section: BudgetSectionKey;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addBudgetCustomItem(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        onDone();
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="m-4 grid grid-cols-1 gap-3 rounded-lg border border-hairline bg-parchment p-4 sm:grid-cols-2"
    >
      <input type="hidden" name="section" value={section} />
      <label className="flex flex-col gap-1 text-sm text-ink">
        Item name
        <input
          name="label"
          required
          placeholder="e.g. Wedding bands, Photo booth"
          className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Amount
        <input
          type="number"
          name="amount"
          min={0}
          required
          className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Paid by
        <input
          name="paid_by"
          list={payerSuggestions.length > 0 ? "add-item-paid-by" : undefined}
          placeholder="Optional"
          className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
        />
        {payerSuggestions.length > 0 && (
          <datalist id="add-item-paid-by">
            {payerSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        )}
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Due date
        <input
          type="date"
          name="due_date"
          className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      {error && <p className="text-sm text-red-800 sm:col-span-2">{error}</p>}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add item"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function BudgetTable({
  rows,
  customItems,
  hiddenCategories,
  total,
  totalActual,
  budgetTarget,
  chartItems,
  quotedCount,
  payerSuggestions,
  contractsByRowKey,
  spreadsheetUrl,
}: {
  rows: BudgetRow[];
  customItems: BudgetRow[];
  hiddenCategories: { key: string; label: string }[];
  total: number;
  totalActual: number;
  budgetTarget: number | null;
  chartItems: { key: string; label: string; amount: number }[];
  quotedCount: number;
  payerSuggestions: string[];
  /** A Google Sheet they've imported from before, if there is one. */
  spreadsheetUrl: string | null;
  /** Keyed by BudgetRow.key -- a category key for standard rows, an id for custom ones. */
  contractsByRowKey: Record<string, BudgetContract[]>;
}) {
  /** The section whose "Add a line" form is open. */
  const [addingTo, setAddingTo] = useState<BudgetSectionKey | null>(null);
  // Fees are worked out from everything else, so they start folded away.
  const [collapsed, setCollapsed] = useState<Set<BudgetSectionKey>>(() => new Set(["fees"]));

  function toggleSection(key: BudgetSectionKey) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  const [showImport, setShowImport] = useState(false);
  const [isPending, startTransition] = useTransition();
  /**
   * The one change that can be taken back.
   *
   * Deliberately one step, not a stack: what people want here is to undo the
   * amount they just fat-fingered, and a stack that survives nothing would
   * promise more than it keeps. It lives in memory, so a reload clears it --
   * which is honest, since by then the page shows the saved figure and there
   * is nothing visibly to take back.
   */
  const [lastEdit, setLastEdit] = useState<BudgetEdit | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | undefined>(undefined);

  function handleUndo() {
    if (!lastEdit) return;
    setIsUndoing(true);
    setUndoError(undefined);
    startTransition(async () => {
      const result = await lastEdit.undo();
      setIsUndoing(false);
      if (result?.error) setUndoError(result.error);
      else setLastEdit(null);
    });
  }
  const allRows = [...rows, ...customItems];
  const contractCount = allRows.filter((r) => (contractsByRowKey[r.key] ?? []).length > 0).length;

  function handleUnhide(categoryKey: string) {
    const formData = new FormData();
    formData.set("category", categoryKey);
    startTransition(async () => {
      await unhideBudgetCategory(formData);
    });
  }

  function renderRow(row: BudgetRow, isCustom: boolean) {
    if (!isCustom) {
      return (
        <BudgetRowItem
          key={row.key}
          row={row}
          payerSuggestions={payerSuggestions}
          onSaveAmounts={updateBudgetLineItem}
          onSaveDetails={updateBudgetLineItem}
          onDelete={() => {
            const formData = new FormData();
            formData.set("category", row.key);
            return hideBudgetCategory(formData);
          }}
          deleteLabel="Remove from your budget"
          deleteConfirm={`Remove "${row.label}" from your budget? You can add it back later.`}
          contracts={contractsByRowKey[row.key] ?? []}
          isCustom={false}
          onEdited={setLastEdit}
        />
      );
    }
    return (
      <BudgetRowItem
        key={row.key}
        row={row}
        payerSuggestions={payerSuggestions}
        onSaveAmounts={(formData) => {
          formData.set("id", row.key);
          formData.set("label", row.label);
          formData.set("amount", formData.get("override_value") as string);
          return updateBudgetCustomItem(formData);
        }}
        onSaveDetails={(formData) => {
          formData.set("id", row.key);
          formData.set("label", row.label);
          formData.set("amount", String(row.override ?? 0));
          return updateBudgetCustomItem(formData);
        }}
        onDelete={() => {
          const formData = new FormData();
          formData.set("id", row.key);
          return deleteBudgetCustomItem(formData);
        }}
        deleteLabel="Remove item"
        deleteConfirm={`Remove "${row.label}" from the budget?`}
        contracts={contractsByRowKey[row.key] ?? []}
        isCustom
        onEdited={setLastEdit}
      />
    );
  }

  const sections = BUDGET_SECTIONS.map((section) => {
    const sectionRows = rows.filter((r) => r.section === section.key);
    const sectionCustom = customItems.filter((r) => r.section === section.key);
    const all = [...sectionRows, ...sectionCustom];
    return {
      ...section,
      sectionRows,
      sectionCustom,
      count: all.length,
      total: all.reduce((sum, r) => sum + (r.override ?? r.computed ?? 0), 0),
      paid: all.reduce((sum, r) => sum + (r.paidAmount ?? 0), 0),
    };
  }).filter((section) => section.count > 0 || addingTo === section.key);

  return (
    <div className="mt-8 w-full">
      <div className="overflow-hidden rounded-[18px] border border-hairline bg-card shadow-sm">
      <BudgetSummary
        totalEstimate={total}
        totalActual={totalActual}
        totalPaid={allRows.reduce((sum, r) => sum + (r.paidAmount ?? 0), 0)}
        totalSaved={allRows.reduce((sum, r) => sum + (r.savedAmount ?? 0), 0)}
        target={budgetTarget}
        categoryCount={allRows.length}
        contractCount={contractCount}
        items={chartItems}
        quotedCount={quotedCount}
        headerAction={
          <>
            <button
              type="button"
              onClick={() => setShowImport((v) => !v)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                showImport
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-card text-ink hover:border-forest"
              }`}
            >
              {showImport ? "Close" : "Import a spreadsheet"}
            </button>
            <button
              type="button"
              onClick={() => downloadBudgetXlsx(allRows)}
              disabled={allRows.length === 0}
              className="rounded-full border border-hairline bg-card px-3 py-1 text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
            >
              Export Excel
            </button>
            <button
              type="button"
              onClick={() => downloadBudgetCsv(allRows)}
              disabled={allRows.length === 0}
              className="rounded-full border border-hairline bg-card px-3 py-1 text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
            >
              Export CSV
            </button>
          </>
        }
      />

      {showImport && (
        <div className="border-b border-hairline px-5 pt-5 sm:px-6">
          <BudgetImportPanel onDone={() => setShowImport(false)} />
        </div>
      )}

      </div>

      {sections.map((section) => {
        const isCollapsed = collapsed.has(section.key);
        const pct = section.total > 0 ? Math.min(100, (section.paid / section.total) * 100) : 0;
        return (
          <section
            key={section.key}
            className="mt-4 overflow-hidden rounded-[18px] border border-hairline bg-card shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              aria-expanded={!isCollapsed}
              className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-parchment/40 lg:px-6 ${
                isCollapsed ? "" : "border-b border-hairline"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-parchment text-ink/60 transition-transform motion-reduce:transition-none ${
                  isCollapsed ? "-rotate-90" : ""
                }`}
              >
                <ChevronDownIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-2xl font-bold leading-none text-forest lg:text-[28px]">
                  {section.label}
                </span>
                <span className="mt-1 block font-mono-numbers text-[11px] uppercase tracking-[0.1em] text-ink/50">
                  {section.key === "fees"
                    ? "Worked out from the lines above"
                    : `${section.count} ${section.count === 1 ? "line" : "lines"}`}
                </span>
              </span>
              <span className="ml-auto shrink-0 text-right">
                <span className="block font-mono-numbers text-base font-semibold text-ink">
                  {currency.format(section.total)}
                </span>
                <span className="block text-xs text-ink/60">{currency.format(section.paid)} paid</span>
                <span className="ml-auto mt-1.5 block h-1 w-24 overflow-hidden rounded-full bg-[#eef1fb] lg:w-32">
                  <span
                    className="block h-full rounded-full bg-[#2243B6] transition-[width] duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </span>
            </button>

            {!isCollapsed && (
              <>
                {/* Column labels, wide screens only; same tracks as ROW_GRID. */}
                <div
                  className={`hidden border-b border-hairline bg-parchment/50 px-6 py-2 font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/45 lg:grid ${ROW_GRID}`}
                >
                  <span className="col-start-2">Category</span>
                  <span className="text-right">Estimate</span>
                  <span className="pr-2 text-right">Actual</span>
                  <span
                    className="pr-2 text-right"
                    title="Discounts and credits. Enter the cost after them; this is for the record."
                  >
                    Saved
                  </span>
                  <span>Paid</span>
                </div>
                <div className="rise-stagger">
                  {section.sectionRows.map((row) => renderRow(row, false))}
                  {section.sectionCustom.map((row) => renderRow(row, true))}
                </div>
                {section.key !== "fees" &&
                  (addingTo === section.key ? (
                    <AddItemForm
                      section={section.key}
                      onDone={() => setAddingTo(null)}
                      payerSuggestions={payerSuggestions}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingTo(section.key)}
                      className="flex w-full items-center gap-2 border-t border-hairline px-4 py-3 text-sm font-medium text-[#2243B6] transition-colors hover:bg-[#eef1fb]/50 lg:px-6"
                    >
                      <PlusIcon /> Add a line to {section.label}
                    </button>
                  ))}
              </>
            )}
          </section>
        );
      })}

      {/* Sticky rather than pinned to the top of the card: the edit that needs
          undoing might be twenty rows down, and an undo you have to scroll
          back to find is one nobody uses. */}
      {lastEdit && (
        <div className="sticky bottom-4 z-10 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-hairline bg-card px-4 py-2 text-xs text-ink shadow-md">
            <span className="truncate">{lastEdit.label}</span>
            <button
              type="button"
              onClick={handleUndo}
              disabled={isUndoing}
              className="shrink-0 font-medium text-brass hover:underline disabled:opacity-50"
            >
              {isUndoing ? "Undoing…" : "Undo"}
            </button>
            <button
              type="button"
              onClick={() => setLastEdit(null)}
              aria-label="Dismiss"
              className="shrink-0 text-ink/40 hover:text-ink"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {undoError && (
        <p className="px-5 pt-2 text-center text-xs text-red-800 sm:px-6">{undoError}</p>
      )}


      <div className="px-1 pb-2">
      {spreadsheetUrl && !showImport && (
        <div className="mt-2 flex justify-end">
          <SpreadsheetLink url={spreadsheetUrl} />
        </div>
      )}

      {hiddenCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
          <span className="text-xs text-ink/50">Not tracking:</span>
          {hiddenCategories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => handleUnhide(category.key)}
              disabled={isPending}
              className="rounded-full border border-hairline px-3 py-1 text-xs text-ink transition-colors hover:border-forest"
            >
              + {category.label}
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
