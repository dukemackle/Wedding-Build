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
  TrashIcon,
} from "@/components/icons";

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
}: {
  row: BudgetRow;
  payerSuggestions: string[];
  onSaveAmounts: (formData: FormData) => Promise<{ error?: string }>;
  onSaveDetails: (formData: FormData) => Promise<{ error?: string }>;
  onDelete: () => Promise<{ error?: string }>;
  deleteLabel: string;
  deleteConfirm: string;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [actualInput, setActualInput] = useState(row.override != null ? String(row.override) : "");
  const [paidInput, setPaidInput] = useState(row.paidAmount != null ? String(row.paidAmount) : "");

  const effectiveValue = row.override ?? row.computed ?? 0;
  const liveActual = Number(actualInput) || effectiveValue;
  const livePaid = Number(paidInput) || 0;
  const paidPct = liveActual > 0 ? Math.min(100, (livePaid / liveActual) * 100) : 0;
  const datalistId = `purchased-from-${row.key}`;
  const payerDatalistId = `paid-by-${row.key}`;
  const Icon = CATEGORY_ICONS[row.key] ?? CustomItemIcon;

  function handleAmountBlur(field: "override_value" | "paid_amount", value: string) {
    const formData = new FormData();
    formData.set("category", row.key);
    formData.set("override_value", field === "override_value" ? value : actualInput);
    formData.set("paid_amount", field === "paid_amount" ? value : paidInput);
    startTransition(async () => {
      const result = await onSaveAmounts(formData);
      setError(result?.error);
    });
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
    if (!confirm(deleteConfirm)) return;
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

  return (
    <div className="flex flex-col gap-3 border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {row.imageUrl && (
            <Image
              src={row.imageUrl}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-md border border-hairline object-cover"
            />
          )}
          <div>
            <p className="flex items-center gap-2 text-ink">
              <Icon className="h-4 w-4 shrink-0 text-brass" />
              {row.label}
            </p>
            {row.isPerGuest && <p className="text-xs text-ink/50">Scales with guest count</p>}
            {row.purchasedFrom && (
              <p className="mt-1 text-xs text-brass">Purchased from {row.purchasedFrom}</p>
            )}
            {row.paidBy && <p className="mt-1 text-xs text-ink/50">Paid by {row.paidBy}</p>}
            {row.dueDate && (
              <p className={`mt-1 text-xs ${isOverdue(row.dueDate) ? "text-red-700" : "text-ink/50"}`}>
                Due {formatDueDate(row.dueDate)}
                {isOverdue(row.dueDate) ? " — overdue" : ""}
              </p>
            )}
            {row.notes && <p className="mt-1 text-sm text-ink/70">{row.notes}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {row.computed !== null && (
            <label className="flex flex-col items-end gap-1 text-xs text-ink/50">
              Estimate
              <span className="font-mono-numbers text-sm text-ink/70">
                {currency.format(row.computed)}
              </span>
            </label>
          )}
          <label className="flex flex-col items-end gap-1 text-xs text-ink/50">
            Actual
            <input
              type="number"
              min={0}
              value={actualInput}
              placeholder="0"
              onChange={(e) => setActualInput(e.target.value)}
              onBlur={(e) => handleAmountBlur("override_value", e.target.value)}
              className={numberInputClass}
            />
          </label>
          <div className="flex items-center gap-1 pb-1">
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
              onClick={handleDelete}
              disabled={isPending}
              title={deleteLabel}
              className={iconButtonClass}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between text-xs text-ink/50">
          <span>Paid</span>
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
            onChange={(e) => setPaidInput(e.target.value)}
            onBlur={(e) => handleAmountBlur("paid_amount", e.target.value)}
            className={numberInputClass}
          />
        </div>
      </div>

      {reminderSent && <p className="text-xs text-forest">Reminder sent to your email.</p>}
      {error && <p className="text-sm text-red-800">{error}</p>}

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
  );
}

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
  payerSuggestions,
}: {
  rows: BudgetRow[];
  customItems: BudgetRow[];
  hiddenCategories: { key: string; label: string }[];
  total: number;
  payerSuggestions: string[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUnhide(categoryKey: string) {
    const formData = new FormData();
    formData.set("category", categoryKey);
    startTransition(async () => {
      await unhideBudgetCategory(formData);
    });
  }

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex items-baseline justify-between border-b border-hairline pb-6">
        <span className="font-display text-2xl font-semibold text-forest">Estimated total</span>
        <span className="font-mono-numbers text-3xl text-forest">{currency.format(total)}</span>
      </div>

      {rows.map((row) => (
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
        />
      ))}

      {customItems.map((row) => (
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
        />
      ))}

      {showAddForm ? (
        <AddItemForm onDone={() => setShowAddForm(false)} payerSuggestions={payerSuggestions} />
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="mt-2 flex w-full items-center gap-2 rounded-md border border-dashed border-hairline py-3 text-sm text-ink/60 transition-colors hover:border-forest hover:text-forest"
        >
          <span className="text-lg leading-none">+</span> Add item
        </button>
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
  );
}
