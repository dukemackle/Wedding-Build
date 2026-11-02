"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { WeddingGalleryPhoto } from "@/lib/supabase/types";
import { MAX_GALLERY_PHOTOS } from "@/lib/guest-site";
import { shrinkImage } from "@/lib/shrink-image";
import { addGalleryPhotos, removeGalleryPhoto, reorderGalleryPhotos } from "./guest-site-actions";
import { PhotoLibrary } from "./photo-library";

/** The couple's photo gallery on the guest site: a reorderable grid of what's up, and an add button. */
export function GalleryPanel({ photos: saved, library = false }: { photos: WeddingGalleryPhoto[]; library?: boolean }) {
  // Local order so moves show instantly; resyncs when the server sends a new list.
  const [photos, setPhotos] = useState(saved);
  const [lastSaved, setLastSaved] = useState(saved);
  if (saved !== lastSaved) {
    setLastSaved(saved);
    setPhotos(saved);
  }
  const [dragFrom, setDragFrom] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | undefined>(undefined);
  const [dragging, setDragging] = useState(false);
  const room = Math.max(0, MAX_GALLERY_PHOTOS - photos.length);
  const full = room === 0;

  // Uploads start as soon as photos are picked or dropped, however many.
  // One request per photo: several full-size photos in one request would
  // blow the 6MB server-action body cap.
  function upload(picked: File[]) {
    const images = picked.filter((f) => f.size > 0 && f.type.startsWith("image/"));
    if (images.length === 0) return;
    const files = images.slice(0, room);
    const leftOut = images.length - files.length;
    setError(undefined);
    setProgress({ done: 0, total: files.length });
    startTransition(async () => {
      for (const [i, file] of files.entries()) {
        const single = new FormData();
        single.set("photos", await shrinkImage(file));
        const result = await addGalleryPhotos(single);
        if (result?.error) {
          setError(i > 0 ? `Added ${i} of ${files.length}. ${result.error}` : result.error);
          setProgress(undefined);
          return;
        }
        setProgress({ done: i + 1, total: files.length });
      }
      setProgress(undefined);
      if (leftOut > 0) {
        setError(`The gallery holds ${MAX_GALLERY_PHOTOS} photos, so ${leftOut} didn't fit.`);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [photo] = next.splice(from, 1);
    next.splice(to, 0, photo);
    setPhotos(next);
    setError(undefined);
    startTransition(async () => {
      const result = await reorderGalleryPhotos(next.map((p) => p.id));
      if (result?.error) {
        setError(result.error);
        setPhotos(saved);
      }
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
        {photos.length > 1 && <span className="block text-ink/50">Use the arrows<span className="pointer-coarse:hidden">, or drag a photo,</span> to change the order.</span>}
      </p>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragEnd={() => setDragFrom(undefined)}
              onDragOver={(e) => {
                if (dragFrom !== undefined) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom !== undefined) move(dragFrom, i);
                setDragFrom(undefined);
              }}
              className={`group relative cursor-grab active:cursor-grabbing ${dragFrom === i ? "opacity-40" : ""}`}
            >
              <Image
                src={photo.photo_url}
                alt=""
                width={200}
                height={200}
                draggable={false}
                className="aspect-square w-full rounded-md border border-hairline object-cover"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  Largest
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(photo.id)}
                disabled={isPending}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white hover:bg-black/80"
              >
                &times;
              </button>
              {photos.length > 1 && (
                <div className="absolute inset-x-1 bottom-1 flex justify-between">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={isPending || i === 0}
                    aria-label="Move earlier"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white hover:bg-black/80 disabled:invisible"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={isPending || i === photos.length - 1}
                    aria-label="Move later"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white hover:bg-black/80 disabled:invisible"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!full && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!isPending) upload(Array.from(e.dataTransfer.files));
          }}
          className={`mt-4 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            isPending ? "cursor-wait" : "cursor-pointer hover:border-forest hover:bg-parchment"
          } ${dragging ? "border-forest bg-parchment" : "border-hairline"}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={isPending}
            onChange={(e) => upload(Array.from(e.target.files ?? []))}
            className="sr-only"
          />
          {progress ? (
            <span className="text-sm font-medium text-ink">
              Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total}…
            </span>
          ) : (
            <>
              <span className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment">Add photos</span>
              <span className="mt-1 text-sm text-ink/60">
                Pick as many as you like at once<span className="pointer-coarse:hidden">, or drag them here</span>. Room for {room} more.
              </span>
            </>
          )}
          {progress && (
            <span className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-hairline">
              <span
                className="block h-full rounded-full bg-forest transition-all"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </span>
          )}
        </label>
      )}
      {!full && library && (
        <div className="mt-4">
          <PhotoLibrary target="gallery" />
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}
