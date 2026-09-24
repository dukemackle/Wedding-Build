"use client";

import { useState, useTransition } from "react";
import { fileContract, getContractUrl } from "../budget/contract-actions";

export type UnfiledContract = { id: string; file_name: string; created_at: string };

function UnfiledRow({
  contract,
  categories,
}: {
  contract: UnfiledContract;
  categories: { key: string; label: string }[];
}) {
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    const formData = new FormData();
    formData.set("id", contract.id);
    startTransition(async () => {
      const result = await getContractUrl(formData);
      if (result?.error) setError(result.error);
      if (result?.url) window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  function handleFile() {
    const formData = new FormData();
    formData.set("id", contract.id);
    formData.set("category", category);
    setError(undefined);
    startTransition(async () => {
      const result = await fileContract(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <li className="border-b border-hairline py-3 last:border-b-0">
      <button
        type="button"
        onClick={handleOpen}
        disabled={isPending}
        className="block max-w-full truncate text-left text-sm text-forest underline-offset-2 hover:underline disabled:opacity-50"
      >
        {contract.file_name}
      </button>
      <div className="mt-2 flex items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={`What ${contract.file_name} is for`}
          className="min-w-0 flex-1 rounded-md border border-hairline bg-parchment px-2 py-1.5 text-sm text-ink outline-none focus:border-forest"
        >
          <option value="">What&apos;s this for?</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleFile}
          disabled={isPending || !category}
          className="shrink-0 rounded-md border border-hairline px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
        >
          {isPending ? "Filing…" : "File it"}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </li>
  );
}

/**
 * Contracts uploaded on the Checklist, which never asks what they're for.
 * Picking a category moves one onto that vendor's card here and onto the same
 * line of the budget -- it's one row in one table, so there is nothing to copy.
 */
export function UnfiledContracts({
  contracts,
  categories,
}: {
  contracts: UnfiledContract[];
  categories: { key: string; label: string }[];
}) {
  return (
    <ul>
      {contracts.map((contract) => (
        <UnfiledRow key={contract.id} contract={contract} categories={categories} />
      ))}
    </ul>
  );
}
