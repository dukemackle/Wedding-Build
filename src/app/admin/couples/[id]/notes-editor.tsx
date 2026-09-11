"use client";

import { useState, useTransition } from "react";
import { updateCoupleNotes } from "../actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

export function NotesEditor({
  weddingId,
  notes,
  tags,
}: {
  weddingId: string;
  notes: string | null;
  tags: string[];
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("wedding_id", weddingId);
    startTransition(async () => {
      const result = await updateCoupleNotes(formData);
      if (result?.error) {
        setError(result.error);
        setSaved(false);
      } else {
        setError(undefined);
        setSaved(true);
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      onChange={() => setSaved(false)}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm text-ink">
        Tags
        <input
          name="tags"
          defaultValue={tags.join(", ")}
          placeholder="VIP, high budget, needs follow-up"
          className={inputClass}
        />
        <span className="text-xs text-ink/50">Comma-separated.</span>
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Notes
        <textarea
          name="notes"
          rows={4}
          defaultValue={notes ?? ""}
          placeholder="Internal notes about this couple -- never shown to them."
          className={inputClass}
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        {saved && !isPending && <span className="text-sm text-forest">Saved.</span>}
      </div>
    </form>
  );
}
