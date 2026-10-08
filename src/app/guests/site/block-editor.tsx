"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { SiteBlock } from "@/lib/supabase/types";
import { shrinkImage } from "@/lib/shrink-image";
import { updateSiteBlock } from "./block-actions";

const FIELD =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";
const LABEL = "mb-1 block text-sm text-ink";

/** The words (and photo) of one custom block, in the Sections tab. */
export function BlockEditor({ block }: { block: SiteBlock }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ error?: string; saved?: boolean }>({});

  function save(formData: FormData) {
    startTransition(async () => {
      const photo = formData.get("photo") as File | null;
      if (photo && photo.size > 0) formData.set("photo", await shrinkImage(photo));
      const result = await updateSiteBlock(formData);
      setMessage(result.error ? { error: result.error } : { saved: true });
    });
  }

  return (
    <form action={save} className="flex flex-col gap-4" onChange={() => setMessage({})}>
      <input type="hidden" name="id" value={block.id} />
      <input type="hidden" name="kind" value={block.kind} />

      {(block.kind === "video" || block.kind === "link") && (
        <div>
          <label className={LABEL} htmlFor={`url-${block.id}`}>
            {block.kind === "video" ? "YouTube or Vimeo link" : "Web address"}
          </label>
          <input
            id={`url-${block.id}`}
            name="url"
            type="url"
            inputMode="url"
            defaultValue={block.url ?? ""}
            placeholder={block.kind === "video" ? "https://youtu.be/…" : "https://"}
            className={FIELD}
          />
          <p className="mt-1 text-xs text-ink/60">
            {block.kind === "video"
              ? "Your engagement film, a slideshow, or the livestream on the day. Use Share › Copy link on the video."
              : "A livestream, a playlist, a hotel booking page, the shuttle times…"}
          </p>
        </div>
      )}

      {block.kind === "photo" && (
        <div>
          {block.photo_url && (
            <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-md bg-ink/5">
              <Image src={block.photo_url} alt="" fill sizes="360px" className="object-cover" />
            </div>
          )}
          <label className={LABEL} htmlFor={`photo-${block.id}`}>
            {block.photo_url ? "Replace the photo" : "Photo"}
          </label>
          <input id={`photo-${block.id}`} type="file" name="photo" accept="image/*" className="text-sm" />
        </div>
      )}

      {block.kind !== "quote" && (
        <div>
          <label className={LABEL} htmlFor={`heading-${block.id}`}>
            {block.kind === "photo" || block.kind === "video"
              ? "Caption (optional)"
              : block.kind === "link"
                ? "Button text"
                : "Heading"}
          </label>
          <input
            id={`heading-${block.id}`}
            name="heading"
            defaultValue={block.heading ?? ""}
            placeholder={
              block.kind === "story"
                ? "How it started"
                : block.kind === "link"
                  ? "Watch the livestream"
                  : block.kind === "video"
                    ? "Our engagement film"
                    : "The night they asked"
            }
            className={FIELD}
          />
        </div>
      )}

      {block.kind !== "photo" && block.kind !== "video" && (
        <div>
          <label className={LABEL} htmlFor={`body-${block.id}`}>
            {block.kind === "quote" ? "Quote" : block.kind === "link" ? "A line about it (optional)" : "Your story"}
          </label>
          <textarea
            id={`body-${block.id}`}
            name="body"
            defaultValue={block.body ?? ""}
            rows={block.kind === "quote" || block.kind === "link" ? 3 : 7}
            placeholder={
              block.kind === "quote"
                ? "Whatever our souls are made of, his and mine are the same."
                : block.kind === "link"
                  ? "Can't make it? Watch live from 3:30pm Pacific."
                  : "We met at a friend's barbecue in 2019…"
            }
            className={FIELD}
          />
        </div>
      )}

      {block.kind === "quote" && (
        <div>
          <label className={LABEL} htmlFor={`attribution-${block.id}`}>
            Who said it (optional)
          </label>
          <input
            id={`attribution-${block.id}`}
            name="attribution"
            defaultValue={block.attribution ?? ""}
            placeholder="Emily Brontë"
            className={FIELD}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {message.error && <p className="text-sm text-red-700">{message.error}</p>}
        {message.saved && <p className="text-sm text-ink/60">Saved — it&apos;s on your site now.</p>}
      </div>
    </form>
  );
}
