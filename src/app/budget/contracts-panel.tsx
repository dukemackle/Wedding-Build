"use client";

import { useRef, useState, useTransition } from "react";
import type { BudgetContract } from "@/lib/supabase/types";
import { TrashIcon } from "@/components/icons";
import { uploadContract, deleteContract, getContractUrl } from "./contract-actions";

function formatSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ContractsPanel({
  rowKey,
  isCustom,
  contracts,
}: {
  rowKey: string;
  /** Category rows are addressed by their key; custom items by their id. */
  isCustom: boolean;
  contracts: BudgetContract[];
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [opening, setOpening] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function targetFields(formData: FormData) {
    formData.set(isCustom ? "custom_item_id" : "category", rowKey);
  }

  function handleUpload(file: File) {
    const formData = new FormData();
    targetFields(formData);
    formData.set("file", file);
    setError(undefined);
    startTransition(async () => {
      const result = await uploadContract(formData);
      if (result?.error) setError(result.error);
      if (fileInput.current) fileInput.current.value = "";
    });
  }

  function handleDelete(contract: BudgetContract) {
    if (!confirm(`Delete "${contract.file_name}"? This can't be undone.`)) return;
    const formData = new FormData();
    formData.set("id", contract.id);
    startTransition(async () => {
      const result = await deleteContract(formData);
      if (result?.error) setError(result.error);
    });
  }

  /**
   * The bucket is private, so there's no URL to put in an href ahead of time.
   * Each click mints a fresh short-lived signed URL, then opens it -- which
   * also means a link can't be shared or bookmarked usefully.
   */
  function handleOpen(contract: BudgetContract) {
    const formData = new FormData();
    formData.set("id", contract.id);
    setOpening(contract.id);
    setError(undefined);
    startTransition(async () => {
      const result = await getContractUrl(formData);
      setOpening(null);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.url) window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="mt-3 rounded-md border border-hairline bg-parchment p-4">
      <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/50">
        Contracts &amp; documents
      </p>

      {contracts.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {contracts.map((contract) => {
            const size = formatSize(contract.file_size);
            return (
              <li
                key={contract.id}
                className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-card px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => handleOpen(contract)}
                  disabled={isPending}
                  className="min-w-0 flex-1 text-left disabled:opacity-50"
                >
                  <span className="block truncate text-sm text-forest underline-offset-2 hover:underline">
                    {opening === contract.id ? "Opening…" : contract.file_name}
                  </span>
                  <span className="mt-0.5 block font-mono-numbers text-[11px] text-ink/50">
                    {formatDate(contract.created_at)}
                    {size ? ` · ${size}` : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(contract)}
                  disabled={isPending}
                  aria-label={`Delete ${contract.file_name}`}
                  className="rounded-md p-1.5 text-ink/40 transition-colors hover:bg-parchment hover:text-forest disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink/60">
          No contracts yet. Add the signed agreement, a quote, or an invoice so it&apos;s here
          when you need it.
        </p>
      )}

      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-hairline bg-card px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest">
        <input
          ref={fileInput}
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,image/*"
          disabled={isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        {isPending ? "Uploading…" : "+ Add a file"}
      </label>

      <p className="mt-2 text-[11px] text-ink/50">
        PDF, Word, or a photo — up to 15MB. Only you and your partner can open these.
      </p>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
