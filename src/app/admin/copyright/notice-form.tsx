"use client";

import { useRef, useState, useTransition } from "react";
import { addCopyrightNotice } from "./actions";

const input = "mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-forest";

export function NoticeForm() {
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  return (
    <form
      ref={form}
      action={(formData) =>
        start(async () => {
          const result = await addCopyrightNotice(formData);
          setError(result.error);
          if (!result.error) form.current?.reset();
        })
      }
      className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"
    >
      <label className="text-ink/70">
        Sent by
        <input name="complainant" required maxLength={300} className={input} placeholder="Name and email" />
      </label>
      <label className="text-ink/70">
        Received
        <input name="received_at" type="date" className={input} />
      </label>
      <label className="text-ink/70 sm:col-span-2">
        Work they say is infringed
        <input name="work" required maxLength={1000} className={input} />
      </label>
      <label className="text-ink/70 sm:col-span-2">
        Link to the content
        <input name="content_url" required maxLength={1000} className={input} inputMode="url" />
      </label>
      <label className="text-ink/70 sm:col-span-2">
        Uploader&apos;s email, if known
        <input name="uploader_email" type="email" maxLength={200} className={input} />
      </label>
      <label className="text-ink/70 sm:col-span-2">
        Notes
        <textarea name="notes" rows={2} maxLength={2000} className={input} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest/90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Log notice"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
