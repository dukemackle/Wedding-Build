"use client";

import type { ListingRead } from "@/lib/ai/listing-reader";
import { useRef, useState, useTransition } from "react";
import { LegalNotice } from "@/components/legal-notice";
import { ClaimDone } from "../claim-done";
import { createClient } from "@/lib/supabase/client";
import {
  AMENITY_OPTIONS,
  INCLUDED_OPTIONS,
  PREFERRED_VENDOR_CATEGORIES,
  PRICE_BASES,
  PRICE_BASIS_HINTS,
  SERVICE_LEVEL_HINTS,
  SERVICE_LEVELS,
  STATES,
  STYLE_TIERS,
  VENUE_SETTINGS,
  VENDOR_POLICIES,
  VENUE_TYPES,
} from "@/lib/wedding-options";
import type { PriceBasis, ServiceLevel, VendorPolicy } from "@/lib/supabase/types";
import { priceHeadline } from "@/lib/venue-pricing";
import {
  CLAIM_PHOTO_TYPES,
  MAX_CLAIM_PHOTOS,
  MAX_PRICE_OPTIONS,
  MAX_PREFERRED_VENDORS,
  type ClaimDetails,
  type ClaimFaq,
  type ClaimPreferredVendor,
  type ClaimSpace,
  type ClaimSubmission,
} from "@/lib/venue-claim";
import { createClaimPhotoUploads, submitVenueClaim, createImportUpload, readListingSource, writeListingText } from "./actions";
import { ImportPanel, mergeDraft, mergeFaqs, mergeVendors } from "../import-panel";
import { ChipPicker, Field, inputClass, labelClass, PhotoGridEditor, Section, Select, WriteHelper, YesNo } from "../form-parts";
import { StepNav, StepRail, type Step } from "../steps";

const emptySpace: ClaimSpace = { name: "", description: null, capacity: null, setting: null, photo_url: null };

// One tap adds a row already named, so most venues only type the number.
const PRICE_SUGGESTIONS = ["Saturday", "Friday", "Sunday", "Weekday", "Weekend buyout", "Extra day", "Off-season"];

const SOCIALS = [
  ["instagram_url", "Instagram"],
  ["tiktok_url", "TikTok"],
  ["facebook_url", "Facebook"],
  ["pinterest_url", "Pinterest"],
  ["youtube_url", "YouTube"],
] as const;

const PRICE_COVERS_PLACEHOLDER: Record<PriceBasis, string> = {
  rental: "Saturday, 10 hours, up to 150 guests",
  package: "Ceremony + reception, food and bar for 100",
  per_person: "Dinner, bar and cake; 75-guest minimum",
  minimum: "Food and drink, Saturday evening",
  ask: "",
};

export function ClaimForm({ token, initial }: { token: string; initial: ClaimSubmission }) {
  const [details, setDetails] = useState<ClaimDetails>(initial.details);
  const [writeNotes, setWriteNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>(initial.photoUrls);
  const [vendors, setVendors] = useState<ClaimPreferredVendor[]>(
    initial.preferredVendors.length > 0 ? initial.preferredVendors : [{ category: "", name: "", website: null, required: false }],
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
  const [step, setStep] = useState(0);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

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

  // "Fill this in for me": only empty boxes are filled, so nothing typed is lost.
  function applyDraft(read: ListingRead) {
    const merged = mergeDraft(details, read.details);
    const answered = mergeFaqs(faqs, read.faqs);
    const listed = mergeVendors(vendors, read.vendors, MAX_PREFERRED_VENDORS);
    setDetails(merged.details);
    setFaqs(answered.faqs);
    setVendors(listed.vendors);
    return merged.filled + answered.filled + listed.filled;
  }

  // What the writer is told besides their own words: only what's on the form.
  const writeFor = (field: "description" | "about") => () =>
    writeListingText(
      token,
      field,
      {
        name: details.name,
        town: [details.city, details.state].filter(Boolean).join(", "),
        type: details.venue_type,
        setting: details.setting,
        "seated guests": details.capacity,
        "standing guests": details.capacity_standing,
        provided: details.service_level && SERVICE_LEVELS[details.service_level],
        included: details.included_items.join(", "),
        amenities: details.amenities.join(", "),
        "event spaces": spaces.map((sp) => sp.name).filter(Boolean).join(", "),
        "current one-liner": field === "about" ? details.description : null,
      },
      writeNotes,
    );

  const setOption = (index: number, patch: Partial<{ label: string; amount: number | null }>) =>
    set(
      "price_options",
      details.price_options.map((o, j) => (j === index ? { ...o, ...patch } : o)),
    );

  function goTo(i: number) {
    setStep(i);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Next checks only this step's required boxes; the rail lets them jump
  // anywhere, so submit re-checks every step and opens the first one short.
  function next() {
    if (stepRefs.current[step]?.reportValidity() === false) return;
    goTo(step + 1);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = stepRefs.current.findIndex((el) => el && !el.checkValidity());
    if (invalid >= 0) {
      setStep(invalid);
      requestAnimationFrame(() => stepRefs.current[invalid]?.reportValidity());
      return;
    }
    setErrors([]);
    startTransition(async () => {
      const result = await submitVenueClaim(token, {
        details,
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
    const answeredFaqs = faqs.filter((f) => f.answer.trim()).length;
    return (
      <ClaimDone
        kind="venue"
        token={token}
        email={submitter.email}
        summary={[
          `${photos.length} ${photos.length === 1 ? "photo" : "photos"} sent`,
          `${answeredFaqs} of ${faqs.length} couple questions answered`,
          ...(spaces.length > 0 ? [`${spaces.length} ${spaces.length === 1 ? "space" : "spaces"} described`] : []),
        ]}
      />
    );
  }

  const cover = photos[0];
  const location = [details.city, details.state].filter(Boolean).join(", ");
  const namedVendors = vendors.filter((v) => v.name.trim());
  const answered = faqs.filter((f) => f.answer.trim()).length;
  const price = priceHeadline(details);

  const steps: Step[] = [
    { title: "The basics", done: Boolean(details.name && details.city && details.state && details.venue_type && details.capacity) },
    { title: "Pricing", done: details.price_basis !== null },
    { title: "Photos and spaces", done: photos.length > 0 },
    { title: "Description and contact", done: Boolean(details.description && (details.contact_email || details.contact_phone)) },
    { title: "Details couples ask", done: answered > 0 || namedVendors.length > 0, optional: true },
    { title: "Send it", done: Boolean(submitter.name && submitter.email && submitter.represents) },
  ];

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="mt-8 scroll-mt-4 lg:grid lg:grid-cols-[190px_minmax(0,1fr)_300px] lg:items-start lg:gap-10">
      <StepRail steps={steps} current={step} onPick={goTo} />

      <div className="flex min-w-0 flex-col gap-6">
        <fieldset
          ref={(el) => {
            stepRefs.current[0] = el;
          }}
          className={step === 0 ? "flex min-w-0 flex-col gap-6" : "hidden"}
        >
          <ImportPanel
            token={token}
            bucket="venue-photos"
            defaultWebsite={details.website}
            questions={faqs.filter((f) => !f.answer.trim()).map((f) => f.question)}
            createUpload={createImportUpload}
            readSource={readListingSource}
            onRead={applyDraft}
          />
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
          <StepNav current={step} steps={steps} onBack={() => goTo(step - 1)} onNext={next} />
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[1] = el;
          }}
          className={step === 1 ? "flex min-w-0 flex-col gap-6" : "hidden"}
        >
          <Section
            title="Pricing and what's provided"
            hint="Cost is the first thing couples ask. A starting point is enough -- it's not a quote, and it saves you emails from couples who aren't a fit."
          >
            <p className={labelClass}>How does your pricing work?</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRICE_BASES) as PriceBasis[]).map((basis) => (
                <button
                  key={basis}
                  type="button"
                  aria-pressed={details.price_basis === basis}
                  onClick={() => set("price_basis", details.price_basis === basis ? null : basis)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    details.price_basis === basis
                      ? "border-forest bg-forest text-parchment"
                      : "border-hairline bg-card text-ink hover:border-forest/50"
                  }`}
                >
                  {PRICE_BASES[basis]}
                </button>
              ))}
            </div>
            {details.price_basis === "ask" ? (
              <p className="mt-4 rounded-md bg-parchment px-3 py-2.5 text-sm text-ink/70">
                Your listing will say <span className="font-medium text-ink">Ask for pricing</span>, and couples can
                send you an inquiry. You can add a price any time.
              </p>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label={details.price_basis ? PRICE_BASIS_HINTS[details.price_basis] : "Starting price"}>
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
                      placeholder={PRICE_COVERS_PLACEHOLDER[details.price_basis ?? "rental"]}
                    />
                  </Field>
                </div>

                <p className={`${labelClass} mt-5`}>Other prices (optional)</p>
                <p className="-mt-0.5 mb-2 text-xs text-ink/55">Different days, a weekend buyout, an extra day -- whatever couples ask about.</p>
                {details.price_options.length > 0 && (
                  <div className="mb-3 flex flex-col gap-2">
                    {details.price_options.map((o, i) => (
                      <div key={i} className="grid grid-cols-[minmax(0,1fr)_104px_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
                        <input
                          value={o.label}
                          onChange={(e) => setOption(i, { label: e.target.value })}
                          className={inputClass}
                          placeholder="Friday or Sunday"
                          aria-label="What this price is for"
                        />
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/45">$</span>
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={o.amount ?? ""}
                            onChange={(e) => setOption(i, { amount: e.target.value ? Number(e.target.value) : null })}
                            className={`${inputClass} pl-6`}
                            aria-label={`Price for ${o.label || "this option"}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => set("price_options", details.price_options.filter((_, j) => j !== i))}
                          className="px-1 text-sm text-ink/45 hover:text-ink"
                          aria-label="Remove price"
                        >
                          <span aria-hidden className="text-lg leading-none sm:hidden">×</span>
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {details.price_options.length < MAX_PRICE_OPTIONS && (
                  <div className="flex flex-wrap gap-2">
                    {PRICE_SUGGESTIONS.filter((label) => !details.price_options.some((o) => o.label === label)).map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => set("price_options", [...details.price_options, { label, amount: null }])}
                        className="rounded-full border border-dashed border-forest/40 px-3 py-1 text-sm text-forest hover:border-forest"
                      >
                        + {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => set("price_options", [...details.price_options, { label: "", amount: null }])}
                      className="rounded-full border border-dashed border-forest/40 px-3 py-1 text-sm text-forest hover:border-forest"
                    >
                      + Other
                    </button>
                  </div>
                )}
              </>
            )}

            <p className={`${labelClass} mt-6`}>What does the venue provide?</p>
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

            <p className={`${labelClass} mt-6`}>What&apos;s included? Tap all that apply</p>
            <ChipPicker options={INCLUDED_OPTIONS} value={details.included_items} onChange={(v) => set("included_items", v)} />
            <Field label="Anything else included?" className="mt-4">
              <input
                value={details.included ?? ""}
                onChange={(e) => set("included", e.target.value || null)}
                className={inputClass}
                placeholder="Two hours of rehearsal time, golf cart shuttles…"
              />
            </Field>

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
          <StepNav current={step} steps={steps} onBack={() => goTo(step - 1)} onNext={next} />
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[2] = el;
          }}
          className={step === 2 ? "flex min-w-0 flex-col gap-6" : "hidden"}
        >
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
          <StepNav current={step} steps={steps} onBack={() => goTo(step - 1)} onNext={next} />
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[3] = el;
          }}
          className={step === 3 ? "flex min-w-0 flex-col gap-6" : "hidden"}
        >
          <Section title="Describe your venue" hint="Short on time? Tap ✨ and Wren drafts it from a few words.">
            <div className="flex flex-col gap-4">
              <div>
                <Field label="One-line description">
                  <input
                    value={details.description ?? ""}
                    onChange={(e) => set("description", e.target.value || null)}
                    maxLength={200}
                    className={inputClass}
                    placeholder="What a couple should know at a glance"
                  />
                </Field>
                <WriteHelper
                  noun="venue"
                  notes={writeNotes}
                  setNotes={setWriteNotes}
                  write={writeFor("description")}
                  onUse={(text) => set("description", text)}
                />
              </div>
              <div>
                <Field label="About">
                  <textarea rows={5} value={details.about ?? ""} onChange={(e) => set("about", e.target.value || null)} className={inputClass} />
                </Field>
                <WriteHelper
                  noun="venue"
                  notes={writeNotes}
                  setNotes={setWriteNotes}
                  write={writeFor("about")}
                  onUse={(text) => set("about", text)}
                />
              </div>
              <Field label="Anything else couples should know?">
                <textarea
                  rows={3}
                  value={details.good_to_know ?? ""}
                  onChange={(e) => set("good_to_know", e.target.value || null)}
                  className={inputClass}
                  placeholder="How far ahead you book up, deposit, noise curfew, anything else"
                />
              </Field>
              <div>
                <p className={labelClass}>Amenities -- tap all that apply</p>
                <ChipPicker options={AMENITY_OPTIONS} value={details.amenities} onChange={(v) => set("amenities", v)} />
              </div>
            </div>
          </Section>

          <Section title="Contact" hint="Where couples' inquiries through You Do, I Do are sent. For social media, your @handle is fine.">
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
              {SOCIALS.map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    value={details[key] ?? ""}
                    onChange={(e) => set(key, e.target.value || null)}
                    className={inputClass}
                    placeholder="@yourvenue or a link"
                  />
                </Field>
              ))}
              <Field label="Reviews page" className="sm:col-span-2">
                <input
                  value={details.reviews_url ?? ""}
                  onChange={(e) => set("reviews_url", e.target.value || null)}
                  className={inputClass}
                  placeholder="Your Google, The Knot or WeddingWire reviews link"
                />
              </Field>
            </div>
          </Section>
          <StepNav current={step} steps={steps} onBack={() => goTo(step - 1)} onNext={next} />
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[4] = el;
          }}
          className={step === 4 ? "flex min-w-0 flex-col gap-6" : "hidden"}
        >
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
            hint="The caterers, photographers, florists and others you work with. Tick “Required” when couples must book that one from your list -- they see required and recommended vendors separately."
          >
            <div className="flex flex-col gap-3">
              {vendors.map((v, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-hairline p-3 sm:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-center sm:border-0 sm:p-0">
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
                  <label className="flex items-center gap-1.5 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={v.required === true}
                      onChange={(e) => setVendors((all) => all.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)))}
                      className="accent-brass"
                    />
                    Required
                  </label>
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
              onClick={() => setVendors((all) => [...all, { category: "", name: "", website: null, required: false }])}
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
          <StepNav current={step} steps={steps} onBack={() => goTo(step - 1)} onNext={next} />
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[5] = el;
          }}
          className={step === 5 ? "flex min-w-0 flex-col gap-6" : "hidden"}
        >
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
          <StepNav
            current={step}
            steps={steps}
            onBack={() => goTo(step - 1)}
            onNext={next}
            finish={
              <button
                type="submit"
                disabled={isPending || uploading > 0}
                className="w-full rounded-md bg-forest px-5 py-3 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60 sm:w-auto"
              >
                {isPending ? "Sending…" : "Send for review"}
              </button>
            }
          />
          <LegalNotice action="sending this for review" />
        </fieldset>

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
            {(details.capacity || price) && (
              <p className="mt-2 font-mono-numbers text-sm text-ink/70">
                {[
                  details.capacity && `Up to ${details.capacity} seated`,
                  price,
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
