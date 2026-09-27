"use client";

import { useState, useTransition } from "react";
import { LegalNotice } from "@/components/legal-notice";
import { createClient } from "@/lib/supabase/client";
import {
  PREFERRED_VENDOR_CATEGORIES,
  SERVICE_LEVEL_HINTS,
  SERVICE_LEVELS,
  STATES,
  STYLE_TIERS,
  VENUE_SETTINGS,
  VENDOR_POLICIES,
  VENUE_TYPES,
} from "@/lib/wedding-options";
import type { ServiceLevel, VendorPolicy } from "@/lib/supabase/types";
import {
  CLAIM_PHOTO_TYPES,
  MAX_CLAIM_PHOTOS,
  type ClaimDetails,
  type ClaimFaq,
  type ClaimPreferredVendor,
  type ClaimSpace,
  type ClaimSubmission,
} from "@/lib/venue-claim";
import { createClaimPhotoUploads, submitVenueClaim } from "./actions";
import { Field, inputClass, labelClass, PhotoGridEditor, Section, Select, YesNo } from "../form-parts";

const emptySpace: ClaimSpace = { name: "", description: null, capacity: null, setting: null, photo_url: null };

export function ClaimForm({ token, initial }: { token: string; initial: ClaimSubmission }) {
  const [details, setDetails] = useState<ClaimDetails>(initial.details);
  const [amenitiesText, setAmenitiesText] = useState(initial.details.amenities.join(", "));
  const [photos, setPhotos] = useState<string[]>(initial.photoUrls);
  const [vendors, setVendors] = useState<ClaimPreferredVendor[]>(
    initial.preferredVendors.length > 0 ? initial.preferredVendors : [{ category: "", name: "", website: null }],
  );
  const [faqs, setFaqs] = useState<ClaimFaq[]>(initial.faqs);
  const [spaces, setSpaces] = useState<ClaimSpace[]>(initial.spaces);
  const [spaceUploading, setSpaceUploading] = useState<number | null>(null);
  const [submitter, setSubmitter] = useState(initial.submitter);

  const [uploading, setUploading] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof ClaimDetails>(key: K, value: ClaimDetails[K]) =>
    setDetails((d) => ({ ...d, [key]: value }));

  // Straight from the browser to storage, through URLs the server signs for
  // this link only. Returns the public URLs of the ones that made it.
  async function upload(files: File[]): Promise<string[]> {
    const result = await createClaimPhotoUploads(
      token,
      files.map((f) => ({ type: f.type, size: f.size })),
    );
    if (result.error || !result.uploads) {
      setPhotoError(result.error ?? "Couldn't upload those photos.");
      return [];
    }
    const supabase = createClient();
    const added: string[] = [];
    for (const [i, u] of result.uploads.entries()) {
      const { error } = await supabase.storage
        .from("venue-photos")
        .uploadToSignedUrl(u.path, u.token, files[i], { contentType: files[i].type });
      if (error) setPhotoError("Some photos didn't upload -- try adding them again.");
      else added.push(u.publicUrl);
    }
    return added;
  }

  async function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoError(null);
    const chosen = Array.from(files).slice(0, MAX_CLAIM_PHOTOS - photos.length);
    if (chosen.length === 0) {
      setPhotoError(`You can add up to ${MAX_CLAIM_PHOTOS} photos.`);
      return;
    }
    setUploading(chosen.length);
    const added = await upload(chosen);
    setUploading(0);
    setPhotos((p) => [...p, ...added]);
  }

  async function addSpacePhoto(index: number, file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    setSpaceUploading(index);
    const [url] = await upload([file]);
    setSpaceUploading(null);
    if (url) setSpaces((all) => all.map((sp, j) => (j === index ? { ...sp, photo_url: url } : sp)));
  }

  const setSpace = (index: number, patch: Partial<ClaimSpace>) =>
    setSpaces((all) => all.map((sp, j) => (j === index ? { ...sp, ...patch } : sp)));

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
        spaces,
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
  const answered = faqs.filter((f) => f.answer.trim()).length;

  return (
    <form onSubmit={submit} className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
      <div className="flex flex-col gap-6">
        <Section title="The basics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Venue name" className="sm:col-span-2">
              <input value={details.name} onChange={(e) => set("name", e.target.value)} className={inputClass} required />
            </Field>
            <Field label="Street address" className="sm:col-span-2">
              <input
                value={details.address ?? ""}
                onChange={(e) => set("address", e.target.value || null)}
                className={inputClass}
                placeholder="12300 Huber Road"
              />
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
            <Field label="Seated guests (max)">
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={details.capacity ?? ""}
                onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)}
                className={inputClass}
              />
            </Field>
            <Field label="Standing guests (max)">
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={details.capacity_standing ?? ""}
                onChange={(e) => set("capacity_standing", e.target.value ? Number(e.target.value) : null)}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Pricing and what's provided" hint="The first two things couples ask. A starting price is enough -- it doesn't need to be a quote.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Starting price">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/45">$</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={details.price_from ?? ""}
                  onChange={(e) => set("price_from", e.target.value ? Number(e.target.value) : null)}
                  className={`${inputClass} pl-6`}
                />
              </div>
            </Field>
            <Field label="That price covers" className="sm:col-span-2">
              <input
                value={details.price_note ?? ""}
                onChange={(e) => set("price_note", e.target.value || null)}
                className={inputClass}
                placeholder="Full wedding, Saturday · Ceremony only · Weekend buyout"
              />
            </Field>
          </div>
          <p className={`${labelClass} mt-5`}>What does the venue provide?</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(SERVICE_LEVELS) as ServiceLevel[]).map((level) => (
              <label
                key={level}
                className={`cursor-pointer rounded-md border px-3 py-2.5 text-sm transition-colors ${
                  details.service_level === level ? "border-forest bg-forest/5" : "border-hairline hover:border-forest/40"
                }`}
              >
                <input
                  type="radio"
                  name="service_level"
                  checked={details.service_level === level}
                  onChange={() => set("service_level", level)}
                  className="sr-only"
                />
                <span className="block font-medium text-ink">{SERVICE_LEVELS[level]}</span>
                <span className="mt-0.5 block text-xs text-ink/55">{SERVICE_LEVEL_HINTS[level]}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Outside vendors">
              <select
                value={details.vendor_policy ?? ""}
                onChange={(e) => set("vendor_policy", (e.target.value || null) as VendorPolicy | null)}
                className={inputClass}
              >
                <option value="">Choose…</option>
                {(Object.keys(VENDOR_POLICIES) as VendorPolicy[]).map((p) => (
                  <option key={p} value={p}>
                    {VENDOR_POLICIES[p]}
                  </option>
                ))}
              </select>
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
            <Field label="Instagram">
              <input value={details.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value || null)} className={inputClass} placeholder="instagram.com/yourvenue" />
            </Field>
            <Field label="Facebook">
              <input value={details.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value || null)} className={inputClass} placeholder="facebook.com/yourvenue" />
            </Field>
            <Field label="Pinterest">
              <input value={details.pinterest_url ?? ""} onChange={(e) => set("pinterest_url", e.target.value || null)} className={inputClass} placeholder="pinterest.com/yourvenue" />
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
          <PhotoGridEditor photos={photos} setPhotos={setPhotos} uploading={uploading} onAddFiles={addPhotos} />
          {photoError && <p className="mt-3 text-sm text-red-700">{photoError}</p>}
          <p className="mt-3 text-xs text-ink/50">Only upload photos you own or have permission to use.</p>
        </Section>

        <Section
          title="Event spaces"
          hint="Optional. Each ceremony or reception spot on the property -- the barn, the chapel, the oak grove."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {spaces.map((sp, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-md border border-hairline p-3">
                <div className="flex gap-3">
                  <label className="relative flex h-20 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border border-dashed border-forest/40 text-center text-xs text-forest hover:border-forest">
                    {sp.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- just-uploaded storage URLs
                      <img src={sp.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : spaceUploading === i ? (
                      "Uploading…"
                    ) : (
                      "+ Photo"
                    )}
                    <input
                      type="file"
                      accept={CLAIM_PHOTO_TYPES.join(",")}
                      className="sr-only"
                      onChange={(e) => addSpacePhoto(i, e.target.files?.[0])}
                    />
                  </label>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      value={sp.name}
                      onChange={(e) => setSpace(i, { name: e.target.value })}
                      className={inputClass}
                      placeholder="Space name"
                      aria-label="Space name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={sp.setting} onChange={(v) => setSpace(i, { setting: v })} options={VENUE_SETTINGS} placeholder="Setting" />
                      <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={sp.capacity ?? ""}
                        onChange={(e) => setSpace(i, { capacity: e.target.value ? Number(e.target.value) : null })}
                        className={inputClass}
                        placeholder="Guests"
                        aria-label="Space capacity"
                      />
                    </div>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={sp.description ?? ""}
                  onChange={(e) => setSpace(i, { description: e.target.value || null })}
                  className={inputClass}
                  placeholder="What it's used for, what makes it special"
                  aria-label="Space description"
                />
                <button type="button" onClick={() => setSpaces((all) => all.filter((_, j) => j !== i))} className="self-end text-sm text-ink/45 hover:text-ink">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSpaces((all) => [...all, { ...emptySpace }])} className="mt-3 text-sm text-brass hover:underline">
            + Add a space
          </button>
        </Section>

        <Section title="Practical details" hint="Optional, but these settle a lot of back-and-forth emails.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="On-site lodging sleeps">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={details.lodging_sleeps ?? ""}
                onChange={(e) => set("lodging_sleeps", e.target.value ? Number(e.target.value) : null)}
                className={inputClass}
                placeholder="0 if none"
              />
            </Field>
            <Field label="Parking">
              <input
                value={details.parking ?? ""}
                onChange={(e) => set("parking", e.target.value || null)}
                className={inputClass}
                placeholder="120 spaces on site · Shuttle from town"
              />
            </Field>
            <Field label="Wheelchair accessible">
              <YesNo value={details.wheelchair_accessible} onChange={(v) => set("wheelchair_accessible", v)} />
            </Field>
            <Field label="Pets allowed">
              <YesNo value={details.pets_allowed} onChange={(v) => set("pets_allowed", v)} />
            </Field>
          </div>
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

        <Section title="Questions couples ask" hint="We've started you off with the ones couples ask most. Answer any you like -- blank ones are skipped.">
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
                  placeholder="Your answer (leave blank to skip)"
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
        <LegalNotice action="sending this for review" />
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
            {(details.capacity || details.price_from) && (
              <p className="mt-2 font-mono-numbers text-sm text-ink/70">
                {[
                  details.capacity && `Up to ${details.capacity} seated`,
                  details.price_from != null && `From $${details.price_from.toLocaleString()}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {details.service_level && (
              <p className="mt-1 text-xs text-ink/55">{SERVICE_LEVELS[details.service_level]}</p>
            )}
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
          {photos.length} {photos.length === 1 ? "photo" : "photos"} · {spaces.length}{" "}
          {spaces.length === 1 ? "space" : "spaces"} · {answered} answered{" "}
          {answered === 1 ? "question" : "questions"}
        </p>
      </aside>
    </form>
  );
}
