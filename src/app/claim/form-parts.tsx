"use client";

import { useRef } from "react";
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
