"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ListingRead } from "@/lib/ai/listing-reader";

type Source = { pdfPath: string; fileName: string } | { websiteUrl: string };

/**
 * "Fill this in for me": reads the business's website or a pricing guide PDF
 * and drafts the form below it. The form decides what to fill (only empty
 * fields), so nothing the business already typed is overwritten, and they
 * still check every field before sending.
 */
export function ImportPanel({
  token,
  bucket,
  defaultWebsite,
  questions,
  createUpload,
  readSource,
  onRead,
}: {
  token: string;
  bucket: string;
  defaultWebsite: string | null;
  questions: string[];
  createUpload: (
    token: string,
    file: { type: string; size: number },
  ) => Promise<{ error?: string; upload?: { path: string; token: string } }>;
  readSource: (token: string, source: Source, questions: string[]) => Promise<{ error?: string; read?: ListingRead }>;
  /** Merges the draft into the form; returns how many fields it filled. */
  onRead: (read: ListingRead) => number;
}) {
  const [website, setWebsite] = useState(defaultWebsite ?? "");
  const [busy, setBusy] = useState<null | "website" | "pdf">(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function run(kind: "website" | "pdf", source: () => Promise<Source | { error: string }>) {
    setMessage(null);
    setBusy(kind);
    try {
      const resolved = await source();
      if ("error" in resolved) {
        setMessage({ kind: "error", text: resolved.error });
        return;
      }
      const result = await readSource(token, resolved, questions);
      if (result.error || !result.read) {
        setMessage({ kind: "error", text: result.error ?? "Couldn't read that -- please try again." });
        return;
      }
      const filled = onRead(result.read);
      setMessage(
        filled > 0
          ? { kind: "ok", text: `Filled in ${filled} ${filled === 1 ? "box" : "boxes"} below. Check each one before you send it.` }
          : { kind: "ok", text: "Everything we found is already filled in below." },
      );
    } finally {
      setBusy(null);
    }
  }

  function readWebsite() {
    if (!website.trim() || busy) return;
    run("website", async () => ({ websiteUrl: website.trim() }));
  }

  function readPdf(file: File | undefined) {
    if (!file) return;
    run("pdf", async () => {
      const started = await createUpload(token, { type: file.type, size: file.size });
      if (started.error || !started.upload) return { error: started.error ?? "Couldn't upload that PDF." };
      const { error } = await createClient()
        .storage.from(bucket)
        .uploadToSignedUrl(started.upload.path, started.upload.token, file, { contentType: "application/pdf" });
      if (error) return { error: "That PDF didn't upload -- please try again." };
      return { pdfPath: started.upload.path, fileName: file.name };
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <section className="rounded-lg border border-brass/40 bg-gradient-to-b from-card to-brass/[0.06] p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl font-semibold text-forest">Fill this in for me</h2>
      <p className="mt-1 text-sm text-ink/60">
        Give us your website or a pricing guide and we&apos;ll draft the boxes below. Only empty boxes get filled,
        and you check everything before it&apos;s sent.
      </p>

      {/* Not a <form>: the panel sits inside the listing form, so Enter here
          is caught to read the site rather than send the listing. */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          inputMode="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              readWebsite();
            }
          }}
          placeholder="yourwebsite.com"
          className="min-w-0 flex-1 rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-forest focus:outline-none"
          disabled={busy !== null}
        />
        <button
          type="button"
          onClick={readWebsite}
          disabled={busy !== null || !website.trim()}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {busy === "website" ? "Reading your site…" : "Read my website"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm text-ink/60">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={busy !== null}
        className="mt-3 w-full rounded-md border border-forest px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest/5 disabled:opacity-60 sm:w-auto"
      >
        {busy === "pdf" ? "Reading your PDF…" : "Upload a pricing guide or brochure (PDF)"}
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf"
        onChange={(e) => readPdf(e.target.files?.[0])}
        className="hidden"
      />

      {busy && <p className="mt-3 text-sm text-ink/60">This can take up to a minute.</p>}
      {message && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            message.kind === "ok" ? "border border-forest/20 bg-forest/5 text-forest" : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}

const isEmpty = (value: unknown) =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);

/** Fills only the empty fields of `details` from a draft. Returns the new details and how many it filled. */
export function mergeDraft<T extends object>(details: T, draft: ListingRead["details"]): { details: T; filled: number } {
  const next = { ...details } as Record<string, unknown>;
  let filled = 0;
  for (const [key, value] of Object.entries(draft)) {
    if (key in next && isEmpty(next[key])) {
      next[key] = value;
      filled += 1;
    }
  }
  return { details: next as T, filled };
}

/** Answers the form's unanswered questions from a draft, and adds new ones it found. */
export function mergeFaqs(
  faqs: { question: string; answer: string }[],
  found: ListingRead["faqs"],
): { faqs: { question: string; answer: string }[]; filled: number } {
  const next = faqs.map((f) => ({ ...f }));
  let filled = 0;
  for (const f of found) {
    const match = next.find((existing) => existing.question.trim().toLowerCase() === f.question.toLowerCase());
    if (match) {
      if (!match.answer.trim()) {
        match.answer = f.answer;
        filled += 1;
      }
    } else if (next.length < 20) {
      next.push(f);
      filled += 1;
    }
  }
  return { faqs: next, filled };
}

/**
 * Adds the vendors a read found to the venue's list. A name already on it is
 * left as typed (its website filled if empty), and blank rows are dropped so
 * the starter row doesn't sit above the found ones.
 */
export function mergeVendors<V extends { category: string; name: string; website: string | null; required?: boolean }>(
  vendors: V[],
  found: ListingRead["vendors"],
  max: number,
): { vendors: V[]; filled: number } {
  const next = vendors.filter((v) => v.name.trim() || v.website).map((v) => ({ ...v }));
  let filled = 0;
  for (const f of found) {
    const match = next.find((existing) => existing.name.trim().toLowerCase() === f.name.toLowerCase());
    if (match) {
      if (!match.website && f.website) {
        match.website = f.website;
        filled += 1;
      }
    } else if (next.length < max) {
      next.push({ ...f } as unknown as V);
      filled += 1;
    }
  }
  return { vendors: next.length > 0 ? next : vendors, filled };
}
