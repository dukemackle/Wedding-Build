"use client";

import { useState, useTransition } from "react";
import { toggleVendorFavorite } from "./actions";

export function VendorFavoriteButton({
  vendorId,
  isFavorited,
}: {
  vendorId: string;
  isFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const formData = new FormData();
    formData.set("vendor_id", vendorId);
    formData.set("is_favorited", String(favorited));

    startTransition(async () => {
      const result = await toggleVendorFavorite(formData);
      if (!result?.error) {
        setFavorited((v) => !v);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-60 ${
        favorited
          ? "border-forest bg-forest text-parchment"
          : "border-hairline bg-parchment text-ink hover:border-forest"
      }`}
    >
      <span aria-hidden="true">{favorited ? "♥" : "♡"}</span>
      {favorited ? "Favorited" : "Favorite"}
    </button>
  );
}
