"use client";

import Image from "next/image";
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
  CustomItemIcon,
  BellIcon,
  NotesIcon,
  PaperclipIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { SpreadsheetLink } from "@/components/spreadsheet-link";
import type { BudgetContract } from "@/lib/supabase/types";
import { ContractsPanel } from "./contracts-panel";
import { BudgetImportPanel } from "./budget-import-panel";
import { BudgetSummary } from "./budget-summary";

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
  officiant: OfficiantIcon,
  gratuities: GratuitiesIcon,
};

export type BudgetRow = {
  key: string;
  label: string;
  isPerGuest: boolean;
  computed: number | null;
  override: number | null;
  paidAmount: number | null;
  purchasedFrom: string | null;
  paidBy: string | null;
  dueDate: string | null;
  notes: string | null;
  imageUrl: string | null;
  suggestions: string[];
};

function formatDueDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateStr}T00:00:00`) < today;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberInputClass =
  "w-24 rounded-md border border-hairline bg-parchment px-2 py-1 text-right font-mono-numbers text-sm text-ink outline-none focus:border-forest";
const iconButtonClass =
  "rounded-md p-1.5 text-ink/40 transition-colors hover:bg-parchment hover:text-forest";

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
  defaultExpanded,
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
  /** Seeded by the table's expand-all, which remounts rows to apply it. */
  defaultExpanded: boolean;
  /** Hands the table something it can offer to undo. */
  onEdited: (edit: BudgetEdit) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDetails, setShowDetails] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [actualInput, setActualInput] = useState(row.override != null ? String(row.override) : "");
  const [paidInput, setPaidInput] = useState(row.paidAmount != null ? String(row.paidAmount) : "");
  /**
   * What was in the paid box before "Paid in full" filled it.
   *
   * Ticking the box on a line that's part-paid overwrites a real number the
   * couple typed, so unticking has to give it back rather than leaving zero.
   * Session-only: after a reload the stored figure IS the full amount, and
   * unticking clears it, which is what the page is showing anyway.
   */
  const [paidBeforeFull, setPaidBeforeFull] = useState<string | null>(null);

  const effectiveValue = row.override ?? row.computed ?? 0;
  const liveActual = Number(actualInput) || effectiveValue;
  const livePaid = Number(paidInput) || 0;
  const paidPct = liveActual > 0 ? Math.min(100, (livePaid / liveActual) * 100) : 0;
  const isFullyPaid = liveActual > 0 && livePaid >= liveActual;
  const datalistId = `purchased-from-${row.key}`;
  const payerDatalistId = `paid-by-${row.key}`;
  const Icon = CATEGORY_ICONS[row.key] ?? CustomItemIcon;

  /** Writes both amounts, whichever one the edit touched. */
  function saveAmounts(nextActual: string, nextPaid: string) {
    const formData = new FormData();
    formData.set("category", row.key);
    formData.set("override_value", nextActual);
    formData.set("paid_amount", nextPaid);
    return onSaveAmounts(formData);
  }

  function handleAmountBlur(field: "override_value" | "paid_amount", value: string) {
    const nextActual = field === "override_value" ? value : actualInput;
    const nextPaid = field === "paid_amount" ? value : paidInput;

    // What the server last told us, which is what undo puts back -- not the
    // local input, which is already carrying the new value by now.
    const wasActual = row.override != null ? String(row.override) : "";
    const wasPaid = row.paidAmount != null ? String(row.paidAmount) : "";
    const changed = nextActual !== wasActual || nextPaid !== wasPaid;

    startTransition(async () => {
      const result = await saveAmounts(nextActual, nextPaid);
      setError(result?.error);
      if (result?.error || !changed) return;

      const amount = field === "override_value" ? nextActual : nextPaid;
      const what = field === "override_value" ? "cost" : "paid";
      onEdited({
        label: `${row.label} ${what} set to ${amount ? currency.format(Number(amount)) : "—"}`,
        undo: () => {
          setActualInput(wasActual);
          setPaidInput(wasPaid);
          return saveAmounts(wasActual, wasPaid);
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

  // What's worth seeing without opening the row: the name, the two numbers,
  // and whether it's paid. Everything else -- who's paying, when it's due,
  // notes, the action buttons -- only matters once you're working on that one
  // line, so it waits behind the chevron.
  return (
    <div className="border-b border-hairline last:border-b-0">
      <div className="px-1 py-2.5 transition-colors hover:bg-parchment/50 sm:grid sm:grid-cols-[1fr_7rem_7.5rem_11rem] sm:items-center sm:gap-4 sm:px-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full min-w-0 items-center gap-2 text-left"
        >
          <ChevronDownIcon
            className={`h-3.5 w-3.5 shrink-0 text-ink/35 transition-transform ${
              expanded ? "" : "-rotate-90"
            }`}
          />
          <Icon className="h-4 w-4 shrink-0 text-brass" />
          <span className="min-w-0 truncate text-ink">
            {row.label}
            {row.purchasedFrom && <span className="text-ink/45"> · {row.purchasedFrom}</span>}
            {!row.purchasedFrom && row.isPerGuest && (
              <span className="text-ink/45"> · scales with guest count</span>
            )}
          </span>
          {/* Surfaced on the collapsed row so filed paperwork is visible
              without opening all nineteen lines one at a time. */}
          {contracts.length > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-forest">
              <PaperclipIcon className="h-3.5 w-3.5" />
              <span className="font-mono-numbers text-[10px]">{contracts.length}</span>
            </span>
          )}
          {row.dueDate && isOverdue(row.dueDate) && (
            <span className="shrink-0 font-mono-numbers text-[10px] uppercase tracking-wider text-red-700">
              Overdue
            </span>
          )}
        </button>

        {/* sm:contents dissolves this wrapper at the breakpoint so the three
            cells become grid items of the row above -- one stacked block on a
            phone, aligned columns on anything wider. */}
        <div className="mt-2 flex items-center gap-3 pl-[1.4rem] sm:contents">
          <span className="font-mono-numbers text-sm text-ink/60 sm:text-right">
            {row.computed !== null ? currency.format(row.computed) : "—"}
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
          <span className="flex flex-1 items-center gap-2 sm:flex-none">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest/10 sm:w-20 sm:flex-none">
              <span
                className="block h-1.5 rounded-full bg-forest transition-[width]"
                style={{ width: `${paidPct}%` }}
              />
            </span>
            <span className="w-14 shrink-0 text-right font-mono-numbers text-[11px] text-ink/55">
              {livePaid <= 0
                ? "—"
                : paidPct >= 100
                  ? "Paid"
                  : `${Math.round(paidPct)}%`}
            </span>
          </span>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 bg-parchment/40 px-1 pb-4 pt-1 sm:px-2 sm:pl-8">
          <div className="flex flex-wrap items-start gap-3">
            {row.imageUrl && (
              <Image
                src={row.imageUrl}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-md border border-hairline object-cover"
              />
            )}
            <div className="min-w-0">
              {row.paidBy && <p className="text-xs text-ink/60">Paid by {row.paidBy}</p>}
              {row.dueDate && (
                <p
                  className={`text-xs ${isOverdue(row.dueDate) ? "text-red-700" : "text-ink/60"}`}
                >
                  Due {formatDueDate(row.dueDate)}
                  {isOverdue(row.dueDate) ? " — overdue" : ""}
                </p>
              )}
              {row.notes && <p className="mt-1 text-sm text-ink/70">{row.notes}</p>}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-ink/50">
              <span className="flex items-center gap-3">
                Paid
                {/* Settling a line in full is the single most common thing to
                    record here, and it's a number the row already knows --
                    so it shouldn't need typing. */}
                <label
                  className={`flex items-center gap-1.5 ${
                    liveActual > 0 ? "cursor-pointer text-ink/60" : "text-ink/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isFullyPaid}
                    disabled={liveActual <= 0 || isPending}
                    onChange={(e) => handlePaidInFull(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[var(--color-forest)]"
                  />
                  Paid in full
                </label>
              </span>
              <span className="font-mono-numbers">
                {currency.format(livePaid)} of {currency.format(liveActual)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-forest/10">
                <div
                  className="h-2 rounded-full bg-forest transition-[width]"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <input
                type="number"
                min={0}
                value={paidInput}
                placeholder="0"
                aria-label={`Amount paid for ${row.label}`}
                onChange={(e) => setPaidInput(e.target.value)}
                onBlur={(e) => handleAmountBlur("paid_amount", e.target.value)}
                className={numberInputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSendReminder}
              disabled={isSendingReminder}
              title="Send a payment reminder to yourself"
              className={`${iconButtonClass} ${reminderSent ? "text-forest" : ""}`}
            >
              <BellIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              title="Notes and payment details"
              className={`${iconButtonClass} ${showDetails ? "bg-parchment text-forest" : ""}`}
            >
              <NotesIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowContracts((v) => !v)}
              title={
                contracts.length > 0
                  ? `${contracts.length} contract${contracts.length === 1 ? "" : "s"}`
                  : "Attach a contract"
              }
              className={`${iconButtonClass} ${
                contracts.length > 0 ? "text-forest" : ""
              } ${showContracts ? "bg-parchment text-forest" : ""}`}
            >
              <PaperclipIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete((open) => !open)}
              disabled={isPending}
              title={deleteLabel}
              aria-expanded={confirmingDelete}
              className={`${iconButtonClass} ${confirmingDelete ? "bg-red-50 text-red-800" : ""}`}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

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
}: {
  onDone: () => void;
  payerSuggestions: string[];
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
      className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-hairline bg-parchment p-4 sm:grid-cols-2"
    >
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
  const [showAddForm, setShowAddForm] = useState(false);
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
  // Bumping this key remounts every row, which resets each row's own
  // `expanded` state -- simpler and less error-prone than lifting open/closed
  // for twenty rows into here just to support one button.
  const [expandKey, setExpandKey] = useState(0);
  const [allExpanded, setAllExpanded] = useState(false);

  const allRows = [...rows, ...customItems];
  const contractCount = allRows.filter((r) => (contractsByRowKey[r.key] ?? []).length > 0).length;

  function toggleAll() {
    setAllExpanded((v) => !v);
    setExpandKey((k) => k + 1);
  }

  function handleUnhide(categoryKey: string) {
    const formData = new FormData();
    formData.set("category", categoryKey);
    startTransition(async () => {
      await unhideBudgetCategory(formData);
    });
  }

  return (
    <div className="mt-8 w-full overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
      <BudgetSummary
        totalEstimate={total}
        totalActual={totalActual}
        target={budgetTarget}
        categoryCount={allRows.length}
        contractCount={contractCount}
        items={chartItems}
        quotedCount={quotedCount}
        headerAction={
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
        }
      />

      {showImport && (
        <div className="border-b border-hairline px-5 pt-5 sm:px-6">
          <BudgetImportPanel onDone={() => setShowImport(false)} />
        </div>
      )}

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

      {/* Column labels, so the totals above are visibly the sum of what's
          below rather than three numbers floating over a list. */}
      <div className="hidden border-b border-hairline bg-parchment/50 py-2 sm:grid sm:px-8 sm:grid-cols-[1fr_7rem_7.5rem_11rem] sm:items-center sm:gap-4">
        <span className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/45">
          Category
        </span>
        <span className="text-right font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/45">
          Estimate
        </span>
        <span className="text-right font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/45">
          Actual
        </span>
        {/* The progress bar had no label at all, so the one column that
            answers "how much of this have we actually paid?" read as
            decoration. Paid sits over the bar; Expand all keeps the right
            edge, above the percentage it lines up with. */}
        <span className="flex items-center justify-between gap-2">
          <span className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/45">
            Paid
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="font-mono-numbers text-[11px] text-brass hover:underline"
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </span>
      </div>

      <div className="px-5 sm:px-6">

      {rows.map((row) => (
        <BudgetRowItem
          key={`${row.key}-${expandKey}`}
          defaultExpanded={allExpanded}
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
      ))}

      {customItems.map((row) => (
        <BudgetRowItem
          key={`${row.key}-${expandKey}`}
          defaultExpanded={allExpanded}
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
            formData.set("paid_amount", String(row.paidAmount ?? ""));
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
      ))}

      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
      {/* Import moved up to the card header; Add item stays down here, next to
          the list it appends to. */}
      {showAddForm ? (
        <AddItemForm onDone={() => setShowAddForm(false)} payerSuggestions={payerSuggestions} />
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-hairline py-3 text-sm text-ink/60 transition-colors hover:border-forest hover:text-forest"
        >
          <span className="text-lg leading-none">+</span> Add item
        </button>
      )}

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
