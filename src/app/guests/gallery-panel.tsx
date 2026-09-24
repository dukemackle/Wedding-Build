"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { WeddingGalleryPhoto } from "@/lib/supabase/types";
import { MAX_GALLERY_PHOTOS } from "@/lib/guest-site";
import { shrinkImage } from "@/lib/shrink-image";
import { addGalleryPhotos, removeGalleryPhoto } from "./guest-site-actions";

/** The couple's photo gallery on the guest site: a grid of what's up, and an add button. */
export function GalleryPanel({ photos }: { photos: WeddingGalleryPhoto[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const full = photos.length >= MAX_GALLERY_PHOTOS;

  // One request per photo: several full-size photos in one request would
  // blow the 6MB server-action body cap.
  function handleAdd(formData: FormData) {
    const files = (formData.getAll("photos") as File[]).filter((f) => f.size > 0);
    startTransition(async () => {
      for (const file of files) {
        const single = new FormData();
        single.set("photos", await shrinkImage(file));
        const result = await addGalleryPhotos(single);
        if (result?.error) {
          setError(result.error);
          return;
        }
      }
      setError(undefined);
      formRef.current?.reset();
    });
  }

  function handleRemove(id: string) {
    if (!confirm("Remove this photo from your guest site?")) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await removeGalleryPhoto(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <p className="text-sm text-ink/70">
        A few pictures of the two of you, shown under the banner. The first one is shown largest.{" "}
        <span className="text-ink/50">
          {photos.length} of {MAX_GALLERY_PHOTOS}
        </span>
      </p>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <Image
                src={photo.photo_url}
                alt=""
                width={200}
                height={200}
                className="aspect-square w-full rounded-md border border-hairline object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(photo.id)}
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

      {!full && (
        <form ref={formRef} action={handleAdd} className="mt-4 flex flex-wrap items-center gap-3">
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
