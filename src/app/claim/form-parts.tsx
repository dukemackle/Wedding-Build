"use client";

import { useRef, useState, useTransition } from "react";
import { MAX_CLAIM_PHOTOS, CLAIM_PHOTO_TYPES } from "@/lib/venue-claim";

// The pieces the venue and vendor claim forms are both built from.

export const inputClass =
  "w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-forest focus:outline-none";
export const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/55";

export function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl font-semibold text-forest">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function YesNo({ value, onChange }: { value: boolean | null; onChange: (value: boolean | null) => void }) {
  return (
    <select
      value={value === null ? "" : value ? "yes" : "no"}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value === "yes")}
      className={inputClass}
    >
      <option value="">Not saying</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  );
}


export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={inputClass}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}


/**
 * The photo grid on a claim form: the cover first, make-cover and remove on
 * each, placeholders while uploads run, and an add tile until the cap.
 */
export function PhotoGridEditor({
  photos,
  setPhotos,
  uploading,
  onAddFiles,
}: {
  photos: string[];
  setPhotos: (update: (photos: string[]) => string[]) => void;
  uploading: number;
  onAddFiles: (files: FileList | null) => Promise<void>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((url, i) => (
          <div key={url} className="group relative overflow-hidden rounded-md border border-hairline">
            {/* eslint-disable-next-line @next/next/no-img-element -- just-uploaded storage URLs */}
            <img src={url} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-forest px-2 py-0.5 text-[10px] uppercase tracking-wide text-parchment">
                Cover
              </span>
            )}
            <div className="flex justify-between gap-1 border-t border-hairline bg-card px-2 py-1.5 text-xs">
              {i > 0 ? (
                <button type="button" onClick={() => setPhotos((p) => [url, ...p.filter((u) => u !== url)])} className="text-brass hover:underline">
                  Make cover
                </button>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => setPhotos((p) => p.filter((u) => u !== url))} className="text-ink/50 hover:text-ink">
                Remove
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-hairline text-xs text-ink/50">
            Uploading…
          </div>
        ))}
        {photos.length + uploading < MAX_CLAIM_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading > 0}
            className="flex aspect-[4/3] flex-col items-center justify-center rounded-md border border-dashed border-forest/40 text-sm text-forest transition-colors hover:border-forest hover:bg-forest/5 disabled:opacity-50"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="mt-1">Add photos</span>
          </button>
        )}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={CLAIM_PHOTO_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={async (e) => {
          await onAddFiles(e.target.files);
          if (fileInput.current) fileInput.current.value = "";
        }}
      />
    </>
  );
}


/**
 * Tap-to-pick tags with an "add another" box: faster than typing a comma list,
 * and couples get the same names across venues to compare. Anything the
 * business adds itself shows as a removable chip after the standard ones.
 */
export function ChipPicker({
  options,
  value,
  onChange,
  addLabel = "+ Add another",
}: {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  addLabel?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const lower = new Set(value.map((v) => v.toLowerCase()));
  const extras = value.filter((v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()));
  const toggle = (item: string) =>
    onChange(lower.has(item.toLowerCase()) ? value.filter((v) => v.toLowerCase() !== item.toLowerCase()) : [...value, item]);
  const add = () => {
    const item = draft.trim().slice(0, 60);
    if (item && !lower.has(item.toLowerCase())) onChange([...value, item]);
    setDraft("");
    setAdding(false);
  };
  const chip = "rounded-full border px-3 py-1.5 text-sm transition-colors";
  return (
    <div className="flex flex-wrap gap-2">
      {[...options, ...extras].map((item) => {
        const on = lower.has(item.toLowerCase());
        return (
          <button
            key={item}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(item)}
            className={`${chip} ${on ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-ink hover:border-forest/50"}`}
          >
            {on && <span aria-hidden className="mr-1">✓</span>}
            {item}
          </button>
        );
      })}
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            } else if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          className={`${chip} w-44 border-forest bg-card text-ink focus:outline-none`}
          placeholder="Type, then Enter"
          aria-label="Add your own"
        />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`${chip} border-dashed border-forest/40 text-forest hover:border-forest`}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

/**
 * "Help me write this": they jot a few words, Wren drafts the text, and they
 * use it, ask for another, or ignore it. Nothing lands in the box unasked.
 */
export function WriteHelper({
  notes,
  setNotes,
  write,
  onUse,
  noun,
}: {
  notes: string;
  setNotes: (notes: string) => void;
  write: () => Promise<{ error?: string; text?: string }>;
  onUse: (text: string) => void;
  noun: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = () => {
    setError(null);
    startTransition(async () => {
      const result = await write();
      if (result.error) setError(result.error);
      else setDraft(result.text ?? null);
    });
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-1.5 text-sm font-medium text-brass hover:underline">
        ✨ Help me write this
      </button>
    );
  }
  return (
    <div className="mt-2 rounded-md border border-brass/40 bg-brass/5 p-3">
      <label className="block text-sm text-ink/80">
        What makes your {noun} special? A few words is plenty.
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} mt-1.5`}
          placeholder="Ocean views, 200 guests, outdoor ceremony lawn, modern"
        />
      </label>
      {draft && (
        <div className="mt-3 rounded-md border border-hairline bg-card p-3 text-sm whitespace-pre-line text-ink">{draft}</div>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        {draft && (
          <button
            type="button"
            onClick={() => {
              onUse(draft);
              setDraft(null);
              setOpen(false);
            }}
            className="rounded-md bg-forest px-3 py-1.5 font-medium text-parchment hover:bg-forest/90"
          >
            Use this
          </button>
        )}
        <button
          type="button"
          onClick={run}
          disabled={isPending}
          className={draft ? "text-brass hover:underline disabled:opacity-50" : "rounded-md bg-forest px-3 py-1.5 font-medium text-parchment hover:bg-forest/90 disabled:opacity-60"}
        >
          {isPending ? "Writing…" : draft ? "Try again" : "Write it for me"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-ink/50 hover:text-ink">
          Close
        </button>
      </div>
    </div>
  );
}
