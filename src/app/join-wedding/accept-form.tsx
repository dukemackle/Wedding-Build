"use client";

import { useState, useTransition } from "react";
import { acceptWeddingInvite } from "./actions";

export function AcceptInviteForm({ token }: { token: string }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleAccept(formData: FormData) {
    startTransition(async () => {
      const result = await acceptWeddingInvite(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleAccept} className="mt-6">
      <input type="hidden" name="token" value={token} />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Joining..." : "Accept invite"}
      </button>
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
    </form>
  );
}
