"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitGuestPost } from "./actions";
import { shrinkImage } from "@/lib/shrink-image";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

/**
 * Post a photo and/or a message to the wall.
 *
 * Mostly opened from a phone at a reception table, so it's three fields and a
 * big button. The name is remembered on this device so a second or third post
 * during the night is just "pick photo, send".
 */
export function GuestPostForm({
  weddingId,
  coupleNames,
}: {
  weddingId: string;
  coupleNames: string;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  // Filled after mount, not as a default value: the server can't see this
  // device's storage, and a mismatched first render is a hydration error.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wren-guest-name");
      if (saved && nameRef.current && !nameRef.current.value) nameRef.current.value = saved;
    } catch {
      // Storage blocked -- the field just starts empty.
    }
  }, [sent]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const photo = formData.get("photo") as File | null;
      if (photo && photo.size > 0) formData.set("photo", await shrinkImage(photo));
      const result = await submitGuestPost(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      try {
        localStorage.setItem("wren-guest-name", String(formData.get("name") ?? ""));
      } catch {
        // Private mode -- they'll type their name again, that's all.
      }
      setError(undefined);
      setPreview(null);
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-md border border-forest/40 bg-forest/10 px-4 py-4 text-forest">
        <p className="font-medium">Thank you — it&apos;s on its way.</p>
        <p className="mt-1 text-sm text-forest/80">
          It&apos;ll appear on the wall once {coupleNames} have seen it.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment hover:bg-forest/90"
        >
          Post another
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="wedding_id" value={weddingId} />

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-hairline bg-parchment text-center transition-colors hover:border-forest">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local blob preview, not a served image
          <img src={preview} alt="" className="max-h-80 w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 py-10">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-8 w-8 text-forest/60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span className="text-sm font-medium text-forest">Choose or take a photo</span>
          </span>
        )}
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </label>

      <label className={labelClass}>
        Your name
        <input
          name="name"
          required
          maxLength={120}
          ref={nameRef}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        A message (optional)
        <textarea
          name="message"
          rows={3}
          maxLength={500}
          placeholder="A toast, a memory, a congratulations…"
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="btn-motion rounded-md bg-forest px-4 py-3 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Posting…" : "Post to the wall"}
      </button>
    </form>
  );
}
