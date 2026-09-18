"use client";

import { useState, useTransition } from "react";
import type { ContractTask } from "@/lib/ai/contract-reader";
import {
  deletePlanningContract,
  saveContractTasks,
  summariseContract,
  uploadPlanningContract,
} from "./contract-actions";

export type PlanningContract = {
  id: string;
  file_name: string;
  summary: string | null;
  summarised_at: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ContractRow({ contract }: { contract: PlanningContract }) {
  const [summary, setSummary] = useState(contract.summary);
  const [tasks, setTasks] = useState<ContractTask[] | null>(null);
  /** Which proposed tasks are ticked, by index. All start ticked. */
  const [chosen, setChosen] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleRead() {
    const formData = new FormData();
    formData.set("contract_id", contract.id);
    setError(undefined);
    setAdded(null);
    startTransition(async () => {
      const result = await summariseContract(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSummary(result.summary ?? null);
      setTasks(result.tasks ?? []);
      setChosen(new Set((result.tasks ?? []).map((_, index) => index)));
    });
  }

  function toggle(index: number) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleAdd() {
    if (!tasks) return;
    const picked = tasks.filter((_, index) => chosen.has(index));
    const formData = new FormData();
    formData.set("tasks", JSON.stringify(picked));
    formData.set("file_name", contract.file_name);
    setError(undefined);
    startTransition(async () => {
      const result = await saveContractTasks(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAdded(result.added ?? 0);
      setTasks(null);
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("contract_id", contract.id);
    setConfirmingDelete(false);
    startTransition(async () => {
      const result = await deletePlanningContract(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm text-ink">{contract.file_name}</span>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleRead}
            disabled={isPending}
            className="rounded-md border border-hairline bg-card px-3 py-1 text-xs text-forest transition-colors hover:border-forest disabled:opacity-50"
          >
            {isPending ? "Reading…" : summary ? "Read it again" : "Summarise & find dates"}
          </button>
          {confirmingDelete ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-xs text-ink/60 hover:underline"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-800 hover:underline"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-xs text-ink/45 hover:text-red-800 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {summary && (
        <p className="mt-2 whitespace-pre-line text-sm text-ink/75">{summary}</p>
      )}

      {tasks !== null && tasks.length === 0 && (
        <p className="mt-2 text-sm text-ink/60">
          Wren didn&apos;t find any dated tasks in this one.
        </p>
      )}

      {tasks !== null && tasks.length > 0 && (
        <div className="mt-3 rounded-md border border-hairline bg-card p-3">
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} found
          </p>
          {/* Nothing is written until these are ticked and added -- they're
              dates with money behind them, and Wren's reading of a contract
              is a starting point, not the contract. */}
          <p className="mt-1 text-xs text-ink/60">
            Check each against the contract before adding it — Wren quotes where it got the date.
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {tasks.map((task, index) => (
              <li key={index}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={chosen.has(index)}
                    onChange={() => toggle(index)}
                    className="mt-1 h-3.5 w-3.5 shrink-0 accent-[var(--color-forest)]"
                  />
                  <span className="min-w-0">
                    <span className="text-ink">{task.title}</span>
                    <span className="ml-2 font-mono-numbers text-xs text-ink/55">
                      {task.due_date ? formatDate(task.due_date) : "no date given"}
                    </span>
                    {task.notes && (
                      <span className="mt-0.5 block text-xs text-ink/50">{task.notes}</span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || chosen.size === 0}
            className="mt-3 rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
          >
            {isPending ? "Adding…" : `Add ${chosen.size} to checklist`}
          </button>
        </div>
      )}

      {added !== null && (
        <p className="mt-2 text-sm text-forest">
          Added {added} {added === 1 ? "task" : "tasks"} to your checklist.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

export function ContractPanel({ contracts }: { contracts: PlanningContract[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    setError(undefined);
    startTransition(async () => {
      const result = await uploadPlanningContract(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <h2 className="font-display text-2xl font-semibold text-forest">Contracts</h2>
      <p className="mt-1 text-sm text-ink/70">
        Keep your signed vendor contracts here, and let Wren read one for you — it writes a plain
        summary and pulls out the dates you have to act on, ready to add to your checklist.
      </p>
      {/* Says plainly what leaves Wren, because a contract holds full legal
          names, an address and payment details. */}
      <p className="mt-1 text-xs text-ink/55">
        Files are stored privately and only you and your partner can open them. Reading one sends
        that document to Anthropic&apos;s API — nothing is sent until you press the button, and
        Wren&apos;s reading is a starting point, not legal advice.
      </p>

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={isPending}
        className="mt-3 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-forest"
      />
      {isPending && <p className="mt-2 text-sm text-ink/60">Working…</p>}
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}

      {contracts.length > 0 && (
        <div className="mt-4 border-t border-hairline">
          {contracts.map((contract) => (
            <ContractRow key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
}
