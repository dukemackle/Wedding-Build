"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { uploadHeroPhoto, removeHeroPhoto } from "./actions";

export function HeroPhotoUpload({ photoUrl }: { photoUrl: string | null }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleUpload(formData: FormData) {
    startTransition(async () => {
      const result = await uploadHeroPhoto(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
      }
    });
  }

  function handleRemove() {
    if (!confirm("Remove your hero photo?")) return;
    startTransition(async () => {
      const result = await removeHeroPhoto();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-8 w-full max-w-2xl rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
      <h2 className="font-display text-2xl font-semibold text-forest">Hero photo</h2>
      <p className="mt-1 text-sm text-ink/70">
        A real photo of the two of you, shown at the top of your public wedding site.
      </p>

      {photoUrl && (
        <Image
          src={photoUrl}
          alt="Your hero photo"
          width={200}
          height={200}
          className="mt-4 h-32 w-32 rounded-full border border-hairline object-cover"
        />
      )}

      <form ref={formRef} action={handleUpload} className="mt-4 flex flex-wrap items-center gap-3">
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
          {isPending ? "Uploading..." : photoUrl ? "Replace" : "Upload"}
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
