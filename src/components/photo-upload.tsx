"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { removeWeddingPhoto, uploadWeddingPhoto } from "@/app/dashboard/actions";
import type { WeddingPhotoKind } from "@/app/dashboard/actions";
import { shrinkImage } from "@/lib/shrink-image";

/**
 * Upload for either of the wedding's two photos.
 *
 * One component rather than two because the difference between them is a
 * column name and a crop, not behaviour. What differs is where each is edited:
 * the hero photo on the guest site page where the banner appears, the profile
 * photo on the dashboard where the avatar appears. Editing a picture somewhere
 * other than where it shows up is how you end up with a "hero photo" box on a
 * page that has no hero.
 */
export function PhotoUpload({
  kind,
  photoUrl,
  shape = "circle",
  confirmRemove,
  onDone,
}: {
  kind: WeddingPhotoKind;
  photoUrl: string | null;
  /** Circle for an avatar, wide for a banner -- shown as it will appear. */
  shape?: "circle" | "wide";
  confirmRemove: string;
  onDone?: () => void;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleUpload(formData: FormData) {
    formData.set("kind", kind);
    startTransition(async () => {
      const photo = formData.get("photo") as File | null;
      if (photo && photo.size > 0) formData.set("photo", await shrinkImage(photo));
      const result = await uploadWeddingPhoto(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      formRef.current?.reset();
      onDone?.();
    });
  }

  function handleRemove() {
    if (!confirm(confirmRemove)) return;
    const formData = new FormData();
    formData.set("kind", kind);
    startTransition(async () => {
      const result = await removeWeddingPhoto(formData);
      if (result?.error) setError(result.error);
      else onDone?.();
    });
  }

  return (
    <div>
      {photoUrl && (
        <Image
          src={photoUrl}
          alt=""
          width={400}
          height={400}
          className={
            shape === "circle"
              ? "mb-3 h-24 w-24 rounded-full border border-hairline object-cover"
              : "mb-3 h-36 w-full max-w-md rounded-md border border-hairline object-cover"
          }
        />
      )}

      <form ref={formRef} action={handleUpload} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          className="block text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-parchment file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-forest"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Uploading…" : photoUrl ? "Replace" : "Upload"}
        </button>
        {photoUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs text-ink/50 hover:underline"
          >
            Remove
          </button>
        )}
      </form>
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}
