"use client";

import { useRef, useState, useTransition } from "react";
import type { RegistryItem } from "@/lib/supabase/types";
import { addRegistryItem, deleteRegistryItem } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function AddRegistryItemForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addRegistryItem(formData);
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
      className="mb-6 rounded-lg border border-hairline bg-parchment p-6"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input
            name="label"
            required
            placeholder="e.g. Amazon Registry, Honeymoon Fund"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Link
          <input
            name="url"
            type="url"
            placeholder="Optional — https://..."
            className={inputClass}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Notes
          <textarea
            name="notes"
            rows={2}
            placeholder="Optional — e.g. how to contribute to a cash fund"
            className={inputClass}
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add registry entry"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function RegistryItemRow({ item }: { item: RegistryItem }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Remove "${item.label}" from your registry?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      const result = await deleteRegistryItem(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-4 last:border-b-0">
      <div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink hover:underline"
          >
            {item.label} ↗
          </a>
        ) : (
          <span className="text-ink">{item.label}</span>
        )}
        {item.notes && <p className="mt-1 text-sm text-ink/70">{item.notes}</p>}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="shrink-0 text-xs text-ink/50 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}

export function RegistryManager({ registryItems }: { registryItems: RegistryItem[] }) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Gift registry</h2>
          <p className="mt-1 text-sm text-ink/70">
            Registry links and cash funds you want to share with guests.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          {showAddForm ? "Close" : "+ Add entry"}
        </button>
      </div>

      {showAddForm && <AddRegistryItemForm onDone={() => setShowAddForm(false)} />}

      {registryItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          No registry entries yet — add your first one above.
        </p>
      ) : (
        registryItems.map((item) => <RegistryItemRow key={item.id} item={item} />)
      )}
    </div>
  );
}
