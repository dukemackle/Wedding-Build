"use client";

import { useState, useTransition } from "react";
import { announceSaved, useSavedSync } from "@/lib/saved-sync";
import { toggleVendorFavorite } from "./actions";

export function VendorFavoriteButton({
  vendorId,
  isFavorited,
  onToggled,
  overlay = false,
  glass = false,
}: {
  vendorId: string;
  isFavorited: boolean;
  onToggled?: (isFavorited: boolean) => void;
  /** Render as a bare heart for sitting on top of a card photo. */
  overlay?: boolean;
  /** A white heart for the frosted bar over a listing's photo on a phone. */
  glass?: boolean;
}) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();
  useSavedSync("vendor", vendorId, (saved) => {
    setFavorited(saved);
    onToggled?.(saved);
  });

  function handleClick() {
    const formData = new FormData();
    formData.set("vendor_id", vendorId);
    formData.set("is_favorited", String(favorited));

    startTransition(async () => {
      const result = await toggleVendorFavorite(formData);
      if (!result?.error) announceSaved("vendor", vendorId, !favorited);
    });
  }

  const label = favorited ? "Remove from saved" : "Save";

  if (glass) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={favorited}
        aria-label={label}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors disabled:opacity-60 ${
          favorited ? "text-[#FFD301]" : "text-white"
        }`}
      >
        <span aria-hidden="true">{favorited ? "♥" : "♡"}</span>
      </button>
    );
  }

  if (overlay) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={favorited}
        aria-label={label}
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-base shadow-sm transition-colors disabled:opacity-60 ${
          favorited ? "text-brass" : "text-forest hover:text-brass"
        }`}
      >
        <span aria-hidden="true">{favorited ? "♥" : "♡"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-60 ${
        favorited
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-parchment text-ink hover:border-forest"
      }`}
    >
      <span aria-hidden="true">{favorited ? "♥" : "♡"}</span>
      {favorited ? "Saved" : "Save"}
    </button>
  );
}
