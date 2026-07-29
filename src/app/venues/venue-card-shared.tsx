"use client";

import { useState, useTransition } from "react";
import { toggleShortlist } from "./actions";

export function ShortlistButton({
  venueId,
  isShortlisted,
}: {
  venueId: string;
  isShortlisted: boolean;
}) {
  const [shortlisted, setShortlisted] = useState(isShortlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const formData = new FormData();
    formData.set("venue_id", venueId);
    formData.set("is_shortlisted", String(shortlisted));

    startTransition(async () => {
      const result = await toggleShortlist(formData);
      if (!result?.error) {
        setShortlisted((v) => !v);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-60 ${
        shortlisted
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-parchment text-ink hover:border-forest"
      }`}
    >
      {shortlisted ? "✓ Shortlisted" : "+ Shortlist"}
    </button>
  );
}
