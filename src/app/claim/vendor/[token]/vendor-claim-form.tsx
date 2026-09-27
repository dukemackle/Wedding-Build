"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATES } from "@/lib/wedding-options";
import { CLAIM_PHOTO_TYPES } from "@/lib/venue-claim";
import {
  VENDOR_LISTING_CATEGORIES,
  VENDOR_PRICE_TIERS,
  type VendorClaimDetails,
  type VendorClaimSubmission,
} from "@/lib/vendor-claim";
import { createVendorPhotoUpload, submitVendorClaim } from "./actions";

const inputClass =
  "w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-forest focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/55";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl font-semibold text-forest">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

/**
 * The vendor's listing, as they'd like it. A smaller cousin of the venue
 * claim form: vendors have one photo and no spaces, FAQs or preferred vendors.
 */
export function VendorClaimForm({ token, initial }: { token: string; initial: VendorClaimSubmission }) {
  const [details, setDetails] = useState<VendorClaimDetails>(initial.details);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial.photoUrl);
  const [submitter, setSubmitter] = useState(initial.submitter);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof VendorClaimDetails>(key: K, value: VendorClaimDetails[K]) =>
    setDetails((d) => ({ ...d, [key]: value }));

  async function choosePhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    setUploading(true);
    const result = await createVendorPhotoUpload(token, { type: file.type, size: file.size });
    if (result.error || !result.upload) {
      setPhotoError(result.error ?? "Couldn't upload that photo.");
    } else {
      const { error } = await createClient()
        .storage.from("vendor-photos")
        .uploadToSignedUrl(result.upload.path, result.upload.token, file, { contentType: file.type });
      if (error) setPhotoError("The photo didn't upload -- try again.");
      else setPhotoUrl(result.upload.publicUrl);
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    startTransition(async () => {
      const result = await submitVendorClaim(token, { details, photoUrl, submitter });
      if (result.error) setErrors([result.error]);
      else if (result.errors?.length) setErrors(result.errors);
      else {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (done) {
    return (
      <div className="mt-8 max-w-2xl rounded-lg border border-hairline bg-card p-8 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-forest">Thanks — we&apos;ve got it</h2>
        <p className="mt-3 text-ink/70">
          We&apos;ll review your listing and email {submitter.email} once it&apos;s live. You can come back to
          this link any time to make changes.
        </p>
      </div>
    );
  }

  const location = [details.city, details.state].filter(Boolean).join(", ");

  return (
    <form onSubmit={submit} className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-10">
      <div className="flex flex-col gap-6">
        <Section title="The basics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business name" className="sm:col-span-2">
              <input value={details.name} onChange={(e) => set("name", e.target.value)} className={inputClass} required />
            </Field>
            <Field label="Main service" className="sm:col-span-2">
              <select
                value={details.category ?? ""}
                onChange={(e) => set("category", e.target.value || null)}
                className={inputClass}
                required
              >
                <option value="">Choose…</option>
                {VENDOR_LISTING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Town">
              <input value={details.city ?? ""} onChange={(e) => set("city", e.target.value || null)} className={inputClass} />
            </Field>
            <Field label="State">
              <select value={details.state ?? ""} onChange={(e) => set("state", e.target.value || null)} className={inputClass}>
                <option value="">Choose…</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="What couples get" hint="Couples filter by price level and read the rest on your listing.">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Price level">
              <select
                value={details.price_tier ?? ""}
                onChange={(e) => set("price_tier", e.target.value || null)}
                className={inputClass}
              >
                <option value="">Choose…</option>
                {Object.entries(VENDOR_PRICE_TIERS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Short description">
              <input
                value={details.description ?? ""}
                onChange={(e) => set("description", e.target.value || null)}
                className={inputClass}
                maxLength={200}
                placeholder="One line couples see on your card"
              />
            </Field>
            <Field label="About">
              <textarea
                value={details.about ?? ""}
                onChange={(e) => set("about", e.target.value || null)}
                className={inputClass}
                rows={5}
                maxLength={3000}
                placeholder="Your style, how you work, what makes you different"
              />
            </Field>
            <Field label="What's included">
              <textarea
                value={details.included ?? ""}
                onChange={(e) => set("included", e.target.value || null)}
                className={inputClass}
                rows={4}
                maxLength={2000}
                placeholder="Hours of coverage, delivery and setup, packages…"
              />
            </Field>
          </div>
        </Section>

        <Section title="Photo" hint="One photo that shows your work. It's the first thing couples see.">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- just-uploaded storage URL
              <img src={photoUrl} alt="" className="aspect-[16/10] w-full rounded-md border border-hairline object-cover sm:w-56" />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center rounded-md border-2 border-dashed border-hairline text-xs text-ink/45 sm:w-56">
                No photo yet
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="rounded-md border border-forest px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest/5 disabled:opacity-60"
              >
                {uploading ? "Uploading…" : photoUrl ? "Replace photo" : "Add a photo"}
              </button>
              {photoUrl && (
                <button type="button" onClick={() => setPhotoUrl(null)} className="text-sm text-ink/60 hover:underline">
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept={CLAIM_PHOTO_TYPES.join(",")}
              onChange={(e) => choosePhoto(e.target.files?.[0])}
              className="hidden"
            />
          </div>
          {photoError && <p className="mt-2 text-sm text-red-700">{photoError}</p>}
        </Section>

        <Section title="Contact" hint="Where couples' inquiries through Wren are sent.">
          <Field label="Business email">
            <input
              type="email"
              value={details.contact_email ?? ""}
              onChange={(e) => set("contact_email", e.target.value || null)}
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="About you" hint="So we can confirm the listing and let you know when it's live. Not shown on the listing.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Your name">
              <input value={submitter.name} onChange={(e) => setSubmitter((s) => ({ ...s, name: e.target.value }))} className={inputClass} required />
            </Field>
            <Field label="Your email">
              <input type="email" value={submitter.email} onChange={(e) => setSubmitter((s) => ({ ...s, email: e.target.value }))} className={inputClass} required />
            </Field>
            <Field label="Your role" className="sm:col-span-2">
              <input
                value={submitter.role ?? ""}
                onChange={(e) => setSubmitter((s) => ({ ...s, role: e.target.value || null }))}
                className={inputClass}
                placeholder="Owner, studio manager…"
              />
            </Field>
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={submitter.represents}
              onChange={(e) => setSubmitter((s) => ({ ...s, represents: e.target.checked }))}
              className="mt-0.5 h-4 w-4 accent-forest"
            />
            I own or work for {details.name || "this business"} and can make changes to its listing.
          </label>
        </Section>

        {errors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">A few things to fix first:</p>
            <ul className="mt-1 list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || uploading}
          className="w-full rounded-md bg-forest px-5 py-3 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60 sm:w-auto sm:self-start"
        >
          {isPending ? "Sending…" : "Send for review"}
        </button>
      </div>

      {/* Desktop only: the card couples will see, updating as they type. */}
      <aside className="hidden lg:sticky lg:top-8 lg:block">
        <p className={labelClass}>What couples see</p>
        <div className="overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- just-uploaded storage URL
            <img src={photoUrl} alt="" className="aspect-[16/10] w-full border-b border-hairline object-cover" />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center border-b border-hairline bg-parchment text-xs text-ink/40">
              Add a photo
            </div>
          )}
          <div className="p-4">
            <p className="font-display text-lg font-semibold text-forest">{details.name || "Your business"}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-ink/50">
              {[details.category, location].filter(Boolean).join(" · ")}
            </p>
            {details.price_tier && <p className="mt-1 text-sm text-ink/80">{details.price_tier}</p>}
            {details.description && <p className="mt-2 text-sm text-ink/75">{details.description}</p>}
          </div>
        </div>
      </aside>
    </form>
  );
}
