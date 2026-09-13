"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "./actions";

export function DeleteAccountForm() {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleDelete(formData: FormData) {
    startTransition(async () => {
      const result = await deleteAccount(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleDelete} className="mt-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-ink">
        Type <span className="font-mono-numbers font-semibold">DELETE</span> to confirm
        <input
          id="delete-confirmation"
          name="confirmation"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-red-800"
        />
      </label>
      <button
        type="submit"
        disabled={confirmation !== "DELETE" || isPending}
        className="self-start rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-800 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-red-800"
      >
        {isPending ? "Deleting..." : "Permanently delete my account"}
      </button>
      {error && <p className="text-sm text-red-800">{error}</p>}
    </form>
  );
}
