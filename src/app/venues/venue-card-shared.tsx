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
      aria-pressed={shortlisted}
      aria-label={shortlisted ? "Remove from favorites" : "Add to favorites"}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-60 ${
        shortlisted
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-parchment text-ink hover:border-forest"
      }`}
    >
      <span aria-hidden="true">{shortlisted ? "♥" : "♡"}</span>
      {shortlisted ? "Favorited" : "Favorite"}
    </button>
  );
}
