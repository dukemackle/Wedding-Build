"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import type { Vendor } from "@/lib/supabase/types";
import { sendVendorInquiry } from "./actions";

export function InquiryForm({ vendor, onDone }: { vendor: Vendor; onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const sampleMessage = `Hi ${vendor.name}, we're planning our wedding and would love to get a quote for ${vendor.category?.toLowerCase() ?? "your services"}. Could you share availability and pricing?`;

  function handleMessageKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab" && !message) {
      e.preventDefault();
      setMessage(sampleMessage);
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendVendorInquiry(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        onDone();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
      <input type="hidden" name="vendor_id" value={vendor.id} />
      <input type="hidden" name="vendor_name" value={vendor.name} />
      <input type="hidden" name="category" value={vendor.category ?? ""} />
      <label className="flex flex-col gap-1 text-sm text-ink">
        Send to
        <input
          type="email"
          name="recipient_email"
          required
          defaultValue={vendor.contact_email ?? ""}
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Message
        <textarea
          name="message"
          rows={3}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleMessageKeyDown}
          placeholder={sampleMessage}
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
        <span className="text-xs text-ink/50">
          Press Tab to use our suggested message, or write your own.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Phone <span className="text-ink/50">(optional)</span>
        <input
          type="tel"
          name="sender_phone"
          placeholder="So they can call or text you back"
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send inquiry"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
