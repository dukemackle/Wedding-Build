"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  PREFERRED_VENDOR_CATEGORIES,
  STATES,
  STYLE_TIERS,
  VENUE_SETTINGS,
  VENUE_TYPES,
} from "@/lib/wedding-options";
import {
  CLAIM_PHOTO_TYPES,
  MAX_CLAIM_PHOTOS,
  type ClaimDetails,
  type ClaimFaq,
  type ClaimPreferredVendor,
  type ClaimSubmission,
} from "@/lib/venue-claim";
import { createClaimPhotoUploads, submitVenueClaim } from "./actions";

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

function Select({
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

export function ClaimForm({ token, initial }: { token: string; initial: ClaimSubmission }) {
  const [details, setDetails] = useState<ClaimDetails>(initial.details);
  const [amenitiesText, setAmenitiesText] = useState(initial.details.amenities.join(", "));
  const [photos, setPhotos] = useState<string[]>(initial.photoUrls);
  const [vendors, setVendors] = useState<ClaimPreferredVendor[]>(
    initial.preferredVendors.length > 0 ? initial.preferredVendors : [{ category: "", name: "", website: null }],
  );
  const [faqs, setFaqs] = useState<ClaimFaq[]>(initial.faqs);
  const [submitter, setSubmitter] = useState(initial.submitter);

  const [uploading, setUploading] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ClaimDetails>(key: K, value: ClaimDetails[K]) =>
    setDetails((d) => ({ ...d, [key]: value }));

  async function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoError(null);
    const chosen = Array.from(files).slice(0, MAX_CLAIM_PHOTOS - photos.length);
    if (chosen.length === 0) {
      setPhotoError(`You can add up to ${MAX_CLAIM_PHOTOS} photos.`);
      return;
    }
    setUploading(chosen.length);
    const result = await createClaimPhotoUploads(
      token,
      chosen.map((f) => ({ type: f.type, size: f.size })),
    );
    if (result.error || !result.uploads) {
      setPhotoError(result.error ?? "Couldn't upload those photos.");
      setUploading(0);
      return;
    }
    const supabase = createClient();
    const added: string[] = [];
    for (const [i, upload] of result.uploads.entries()) {
      const { error } = await supabase.storage
        .from("venue-photos")
        .uploadToSignedUrl(upload.path, upload.token, chosen[i], { contentType: chosen[i].type });
      if (error) setPhotoError("Some photos didn't upload -- try adding them again.");
      else added.push(upload.publicUrl);
      setUploading((n) => n - 1);
    }
    setPhotos((p) => [...p, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    startTransition(async () => {
      const result = await submitVenueClaim(token, {
        details: {
          ...details,
          amenities: amenitiesText.split(",").map((a) => a.trim()).filter(Boolean),
        },
        faqs,
        preferredVendors: vendors,
        photoUrls: photos,
        submitter,
      });
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
          We&apos;ll review your changes and email {submitter.email} once they&apos;re live. You can come
          back to this link any time to make more changes.
        </p>
      </div>
    );
  }

  const cover = photos[0];
  const location = [details.city, details.state].filter(Boolean).join(", ");
  const namedVendors = vendors.filter((v) => v.name.trim());

  return (
    <form onSubmit={submit} className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
      <div className="flex flex-col gap-6">
        <Section title="The basics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Venue name" className="sm:col-span-2">
              <input value={details.name} onChange={(e) => set("name", e.target.value)} className={inputClass} required />
            </Field>
            <Field label="Town">
              <input value={details.city ?? ""} onChange={(e) => set("city", e.target.value || null)} className={inputClass} />
            </Field>
            <Field label="State">
              <Select value={details.state} onChange={(v) => set("state", v)} options={STATES} placeholder="Choose…" />
            </Field>
            <Field label="Venue type">
              <Select value={details.venue_type} onChange={(v) => set("venue_type", v)} options={VENUE_TYPES} placeholder="Choose…" />
            </Field>
            <Field label="Setting">
              <Select value={details.setting} onChange={(v) => set("setting", v)} options={VENUE_SETTINGS} placeholder="Choose…" />
            </Field>
            <Field label="Max guests">
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={details.capacity ?? ""}
                onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)}
                className={inputClass}
              />
            </Field>
            <Field label="Price level">
              <Select value={details.price_tier} onChange={(v) => set("price_tier", v)} options={STYLE_TIERS} placeholder="Choose…" />
            </Field>
          </div>
        </Section>

        <Section title="Contact" hint="Where couples' inquiries through Wren are sent.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email">
              <input type="email" value={details.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value || null)} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={details.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value || null)} className={inputClass} />
            </Field>
            <Field label="Website" className="sm:col-span-2">
              <input value={details.website ?? ""} onChange={(e) => set("website", e.target.value || null)} className={inputClass} placeholder="yourvenue.com" />
            </Field>
          </div>
        </Section>

        <Section title="Describe your venue">
          <div className="flex flex-col gap-4">
            <Field label="One-line description">
              <input
                value={details.description ?? ""}
                onChange={(e) => set("description", e.target.value || null)}
                maxLength={200}
                className={inputClass}
                placeholder="What a couple should know at a glance"
              />
            </Field>
            <Field label="About">
              <textarea rows={5} value={details.about ?? ""} onChange={(e) => set("about", e.target.value || null)} className={inputClass} />
            </Field>
            <Field label="What's included">
              <textarea
                rows={3}
                value={details.included ?? ""}
                onChange={(e) => set("included", e.target.value || null)}
                className={inputClass}
                placeholder="Tables and chairs, bridal suite, day-of coordinator…"
              />
            </Field>
            <Field label="Amenities (separate with commas)">
              <input
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                className={inputClass}
                placeholder="On-site lodging, Climate-controlled, Wheelchair accessible"
              />
            </Field>
          </div>
        </Section>

        <Section title="Photos" hint={`Up to ${MAX_CLAIM_PHOTOS}. The first one is the cover couples see in search.`}>
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
            onChange={(e) => addPhotos(e.target.files)}
          />
          {photoError && <p className="mt-3 text-sm text-red-700">{photoError}</p>}
          <p className="mt-3 text-xs text-ink/50">Only upload photos you own or have permission to use.</p>
        </Section>

        <Section
          title="Preferred vendors"
          hint="The caterers, photographers, florists and others you recommend. Couples see these on your listing, with a link to each."
        >
          <div className="flex flex-col gap-3">
            {vendors.map((v, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-hairline p-3 sm:grid-cols-[160px_1fr_1fr_auto] sm:items-center sm:border-0 sm:p-0">
                <Select
                  value={v.category || null}
                  onChange={(c) => setVendors((all) => all.map((x, j) => (j === i ? { ...x, category: c ?? "" } : x)))}
                  options={PREFERRED_VENDOR_CATEGORIES}
                  placeholder="Category"
                />
                <input
                  value={v.name}
                  onChange={(e) => setVendors((all) => all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  className={inputClass}
                  placeholder="Business name"
                  aria-label="Vendor name"
                />
                <input
                  value={v.website ?? ""}
                  onChange={(e) => setVendors((all) => all.map((x, j) => (j === i ? { ...x, website: e.target.value || null } : x)))}
                  className={inputClass}
                  placeholder="Website"
                  aria-label="Vendor website"
                />
                <button
                  type="button"
                  onClick={() => setVendors((all) => all.filter((_, j) => j !== i))}
                  className="justify-self-end px-2 text-sm text-ink/45 hover:text-ink"
                  aria-label="Remove vendor"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setVendors((all) => [...all, { category: "", name: "", website: null }])}
            className="mt-3 text-sm text-brass hover:underline"
          >
            + Add a vendor
          </button>
        </Section>

        <Section title="Questions couples ask" hint="Optional. Deposits, curfews, outside alcohol, rain plans…">
          <div className="flex flex-col gap-4">
            {faqs.map((f, i) => (
              <div key={i} className="flex flex-col gap-2 border-b border-hairline pb-4 last:border-b-0">
                <input
                  value={f.question}
                  onChange={(e) => setFaqs((all) => all.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))}
                  className={inputClass}
                  placeholder="Question"
                  aria-label="Question"
                />
                <textarea
                  rows={2}
                  value={f.answer}
                  onChange={(e) => setFaqs((all) => all.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))}
                  className={inputClass}
                  placeholder="Answer"
                  aria-label="Answer"
                />
                <button type="button" onClick={() => setFaqs((all) => all.filter((_, j) => j !== i))} className="self-end text-sm text-ink/45 hover:text-ink">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFaqs((all) => [...all, { question: "", answer: "" }])} className="mt-3 text-sm text-brass hover:underline">
            + Add a question
          </button>
        </Section>

        <Section title="About you" hint="So we can confirm the changes and let you know when they're live. Not shown on the listing.">
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
                placeholder="Owner, events manager…"
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
            I work for or own {details.name || "this venue"} and can make changes to its listing.
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
          disabled={isPending || uploading > 0}
          className="w-full rounded-md bg-forest px-5 py-3 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60 sm:w-auto sm:self-start"
        >
          {isPending ? "Sending…" : "Send for review"}
        </button>
      </div>

      {/* Desktop only: what couples will see, updating as they type. A phone
          has no room beside the form, and scrolling past a preview to reach
          the fields would be worse than not having one. */}
      <aside className="hidden lg:sticky lg:top-8 lg:block">
        <p className={labelClass}>What couples see</p>
        <div className="overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- just-uploaded storage URLs
            <img src={cover} alt="" className="aspect-[16/10] w-full border-b border-hairline object-cover" />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center border-b border-hairline bg-parchment text-xs text-ink/40">
              Add a cover photo
            </div>
          )}
          <div className="p-4">
            <p className="font-display text-lg font-semibold text-forest">{details.name || "Your venue"}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-ink/50">
              {[location, details.setting, details.venue_type].filter(Boolean).join(" · ")}
            </p>
            {details.capacity && <p className="mt-2 font-mono-numbers text-sm text-ink/70">Up to {details.capacity} guests</p>}
            {details.description && <p className="mt-2 text-sm text-ink/75">{details.description}</p>}
            {namedVendors.length > 0 && (
              <div className="mt-4 border-t border-hairline pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Preferred vendors</p>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {namedVendors.slice(0, 5).map((v, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate text-ink">{v.name}</span>
                      <span className="shrink-0 text-ink/45">{v.category}</span>
                    </li>
                  ))}
                  {namedVendors.length > 5 && <li className="text-ink/45">+{namedVendors.length - 5} more</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-ink/45">
          {photos.length} {photos.length === 1 ? "photo" : "photos"} · {faqs.length}{" "}
          {faqs.length === 1 ? "question" : "questions"}
        </p>
      </aside>
    </form>
  );
}
