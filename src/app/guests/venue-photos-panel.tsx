"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { MAX_VENUE_PHOTOS } from "@/lib/guest-site";
import { shrinkImage } from "@/lib/shrink-image";
import { addVenuePhoto, removeVenuePhoto } from "./guest-site-actions";

/**
 * The couple's own pictures of their venue. Any they add replace the
 * listing's photos in the venue section, and the first stands in as the
 * banner until they add a banner photo of their own.
 */
export function VenuePhotosPanel({ photos, listed }: { photos: string[]; listed: boolean }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const room = MAX_VENUE_PHOTOS - photos.length;

  function handleAdd(formData: FormData) {
    const files = (formData.getAll("photos") as File[]).filter((f) => f.size > 0).slice(0, room);
    startTransition(async () => {
      for (const file of files) {
        const single = new FormData();
        single.set("photo", await shrinkImage(file));
        const result = await addVenuePhoto(single);
        if (result?.error) {
          setError(result.error);
          return;
        }
      }
      setError(undefined);
      formRef.current?.reset();
    });
  }

  function handleRemove(url: string) {
    if (!confirm("Remove this venue photo from your guest site?")) return;
    startTransition(async () => {
      const result = await removeVenuePhoto(url);
      setError(result?.error);
    });
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">Your venue photos</p>
      <p className="mt-1 text-[13px] leading-normal text-ink/60">
        {listed
          ? "Have better pictures of the place? Add your own and guests see those instead of the listing's."
          : "Show guests where they're headed: the barn, the garden, the view from the ceremony spot."}{" "}
        <span className="text-ink/50">
          {photos.length} of {MAX_VENUE_PHOTOS}
        </span>
      </p>

      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((url) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt=""
                width={200}
                height={150}
                className="aspect-[4/3] w-full rounded-md border border-hairline object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={isPending}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white hover:bg-black/80"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {room > 0 && (
        <form ref={formRef} action={handleAdd} className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            required
            className="block min-w-0 max-w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-parchment file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-forest"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {isPending ? "Uploading…" : "Add photos"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}
