"use client";

import { useRef, useState, useTransition } from "react";
import type { BudgetCustomItem } from "@/lib/supabase/types";
import { addBudgetCustomItem, updateBudgetCustomItem, deleteBudgetCustomItem } from "./actions";
import { CustomItemIcon } from "@/components/icons";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

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

function ItemFields({
  item,
  payerSuggestions,
}: {
  item?: BudgetCustomItem;
  payerSuggestions: string[];
}) {
  const payerDatalistId = `paid-by-${item?.id ?? "new"}`;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Item name
        <input
          name="label"
          required
          placeholder="e.g. Wedding bands, Photo booth"
          defaultValue={item?.label ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Amount
        <input
          type="number"
          name="amount"
          min={0}
          required
          defaultValue={item?.amount ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Purchased from
        <input
          name="purchased_from"
          placeholder="Optional"
          defaultValue={item?.purchased_from ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Paid by
        <input
          name="paid_by"
          list={payerSuggestions.length > 0 ? payerDatalistId : undefined}
          placeholder="Optional"
          defaultValue={item?.paid_by ?? ""}
          className={inputClass}
        />
        {payerSuggestions.length > 0 && (
          <datalist id={payerDatalistId}>
            {payerSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        )}
      </label>
      <label className={labelClass}>
        Due date
        <input
          type="date"
          name="due_date"
          defaultValue={item?.due_date ?? ""}
          className={inputClass}
        />
      </label>
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
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addBudgetCustomItem(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
        onDone();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-4 rounded-lg border border-hairline bg-parchment p-4"
    >
      <ItemFields payerSuggestions={payerSuggestions} />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
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

function ItemRow({
  item,
  payerSuggestions,
}: {
  item: BudgetCustomItem;
  payerSuggestions: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateBudgetCustomItem(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Remove "${item.label}" from the budget?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      const result = await deleteBudgetCustomItem(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (isEditing) {
    return (
      <div className="border-b border-hairline py-4 last:border-b-0">
        <form action={handleSave}>
          <input type="hidden" name="id" value={item.id} />
          <ItemFields item={item} payerSuggestions={payerSuggestions} />
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-4 last:border-b-0">
      <div>
        <p className="flex items-center gap-2 text-ink">
          <CustomItemIcon className="h-4 w-4 shrink-0 text-brass" />
          {item.label}
        </p>
        {item.purchased_from && (
          <p className="mt-1 text-xs text-brass">Purchased from {item.purchased_from}</p>
        )}
        {item.paid_by && <p className="mt-1 text-xs text-ink/50">Paid by {item.paid_by}</p>}
        {item.due_date && (
          <p className={`mt-1 text-xs ${isOverdue(item.due_date) ? "text-red-700" : "text-ink/50"}`}>
            Due {formatDueDate(item.due_date)}
            {isOverdue(item.due_date) ? " — overdue" : ""}
          </p>
        )}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono-numbers text-ink">{currency.format(item.amount)}</span>
        <button onClick={() => setIsEditing(true)} className="text-xs text-brass hover:underline">
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-ink/50 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export function BudgetCustomItems({
  items,
  payerSuggestions,
}: {
  items: BudgetCustomItem[];
  payerSuggestions: string[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <span className="font-display text-2xl font-semibold text-forest">
            Additional items
          </span>
          <p className="mt-1 text-sm text-ink/70">
            Anything that doesn&apos;t fit the categories above — {currency.format(total)} so far.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          {showAddForm ? "Close" : "+ Add item"}
        </button>
      </div>

      {showAddForm && (
        <AddItemForm onDone={() => setShowAddForm(false)} payerSuggestions={payerSuggestions} />
      )}

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          No additional items yet — add your first one above.
        </p>
      ) : (
        items.map((item) => (
          <ItemRow key={item.id} item={item} payerSuggestions={payerSuggestions} />
        ))
      )}
    </div>
  );
}
