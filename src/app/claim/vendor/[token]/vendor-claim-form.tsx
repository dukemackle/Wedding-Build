"use client";

import type { ListingRead } from "@/lib/ai/listing-reader";
import { useRef, useState, useTransition } from "react";
import { LegalNotice } from "@/components/legal-notice";
import { ClaimDone } from "../../claim-done";
import { createClient } from "@/lib/supabase/client";
import { STATES, STYLE_TIERS, VENDOR_PRICE_UNITS } from "@/lib/wedding-options";
import { MAX_CLAIM_PHOTOS, type ClaimFaq } from "@/lib/venue-claim";
import type { VendorClaimDetails, VendorClaimSubmission } from "@/lib/vendor-claim";
import type { Vendor, VendorPriceUnit } from "@/lib/supabase/types";
import { Field, inputClass, labelClass, PhotoGridEditor, Section, Select } from "../../form-parts";
import { createVendorClaimPhotoUploads, submitVendorClaim, createImportUpload, readListingSource } from "./actions";
import { ImportPanel, mergeDraft, mergeFaqs } from "../../import-panel";
import { StepNav, StepRail, type Step } from "../../steps";
import { ListingPreview, PreviewPrompt } from "../../listing-preview";
import { vendorPreview } from "../../preview-data";
import { VendorListing } from "../../../vendors/[id]/vendor-listing";

// The vendor counterpart of the venue claim form (../../[token]/claim-form.tsx):
// fewer sections, since a vendor has no spaces or preferred-vendor list, and
// pricing carries a unit because vendors price so differently. Split into
// steps with the same rail.
export function VendorClaimForm({
  token,
  category,
  initial,
  listing,
  liveHref,
}: {
  token: string;
  category: string | null;
  initial: VendorClaimSubmission;
  /** The vendor's public columns, under the form's details in the preview. */
  listing: Partial<Vendor>;
  liveHref: string | null;
}) {
  const [details, setDetails] = useState<VendorClaimDetails>(initial.details);
  const [amenitiesText, setAmenitiesText] = useState(initial.details.amenities.join(", "));
  const [photos, setPhotos] = useState<string[]>(initial.photoUrls);
  const [faqs, setFaqs] = useState<ClaimFaq[]>(initial.faqs);
  const [submitter, setSubmitter] = useState(initial.submitter);
  const [uploading, setUploading] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof VendorClaimDetails>(key: K, value: VendorClaimDetails[K]) =>
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
    const result = await createVendorClaimPhotoUploads(
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
    for (const [i, u] of result.uploads.entries()) {
      const { error } = await supabase.storage
        .from("vendor-photos")
        .uploadToSignedUrl(u.path, u.token, chosen[i], { contentType: chosen[i].type });
      if (error) setPhotoError("Some photos didn't upload -- try adding them again.");
      else added.push(u.publicUrl);
    }
    setUploading(0);
    setPhotos((p) => [...p, ...added]);
  }

  // "Fill this in for me": only empty boxes are filled, so nothing typed is lost.
  function applyDraft(read: ListingRead) {
    const { amenities, ...rest } = read.details;
    const merged = mergeDraft(details, rest);
    const answered = mergeFaqs(faqs, read.faqs);
    let filled = merged.filled + answered.filled;
    setDetails(merged.details);
    setFaqs(answered.faqs);
    if (Array.isArray(amenities) && !amenitiesText.trim()) {
      setAmenitiesText(amenities.join(", "));
      filled += 1;
    }
    return filled;
  }

  const amenities = () => amenitiesText.split(",").map((a) => a.trim()).filter(Boolean);

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
      const result = await submitVendorClaim(token, {
        details: { ...details, amenities: amenities() },
        faqs,
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

  const preview = previewing && (
    <ListingPreview
      onClose={() => setPreviewing(false)}
      onSend={
        done
          ? undefined
          : () => {
              setPreviewing(false);
              formRef.current?.requestSubmit();
            }
      }
    >
      <VendorListing data={vendorPreview({ ...listing, category }, details, amenities(), photos, faqs)} />
    </ListingPreview>
  );

  if (done) {
    const answeredFaqs = faqs.filter((f) => f.answer.trim()).length;
    return (
      <>
        <ClaimDone
          kind="vendor"
          token={token}
          email={submitter.email}
          liveHref={liveHref}
          onPreview={() => setPreviewing(true)}
          onEdit={() => {
            setDone(false);
            setStep(0);
          }}
          summary={[
            `${photos.length} ${photos.length === 1 ? "photo" : "photos"} sent`,
            `${answeredFaqs} of ${faqs.length} couple questions answered`,
          ]}
        />
        {preview}
      </>
    );
  }

  const answered = faqs.filter((f) => f.answer.trim()).length;
  const location = [details.city, details.state].filter(Boolean).join(", ");

  const steps: Step[] = [
    { title: "The basics", done: Boolean(details.name && details.city && details.state) },
    { title: "Pricing", done: details.price_from != null },
    { title: "Photos", done: photos.length > 0 },
    { title: "Description and contact", done: Boolean(details.description && (details.contact_email || details.contact_phone)) },
    { title: "Questions couples ask", done: answered > 0, optional: true },
    { title: "Preview and send", done: Boolean(submitter.name && submitter.email && submitter.represents) },
  ];
  const stepClass = (i: number) => (step === i ? "flex min-w-0 flex-col gap-6" : "hidden");
  const nav = <StepNav current={step} steps={steps} onBack={() => goTo(step - 1)} onNext={next} />;

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="mt-8 scroll-mt-4 lg:grid lg:grid-cols-[190px_minmax(0,1fr)_300px] lg:items-start lg:gap-10"
    >
      <StepRail steps={steps} current={step} onPick={goTo} />

      <div className="flex min-w-0 flex-col gap-6">
        <fieldset
          ref={(el) => {
            stepRefs.current[0] = el;
          }}
          className={stepClass(0)}
        >
          <ImportPanel
            token={token}
            bucket="vendor-photos"
            defaultWebsite={details.website}
            questions={faqs.filter((f) => !f.answer.trim()).map((f) => f.question)}
            createUpload={createImportUpload}
            readSource={readListingSource}
            onRead={applyDraft}
          />
          <Section title="The basics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Business name" className="sm:col-span-2">
                <input value={details.name} onChange={(e) => set("name", e.target.value)} className={inputClass} required />
              </Field>
              <Field label="Based in (town)">
                <input value={details.city ?? ""} onChange={(e) => set("city", e.target.value || null)} className={inputClass} />
              </Field>
              <Field label="State">
                <Select value={details.state} onChange={(v) => set("state", v)} options={STATES} placeholder="Choose…" />
              </Field>
              <Field label="Area you serve" className="sm:col-span-2">
                <input
                  value={details.service_area ?? ""}
                  onChange={(e) => set("service_area", e.target.value || null)}
                  className={inputClass}
                  placeholder="Austin + 100 miles · All of Central Texas"
                />
              </Field>
            </div>
          </Section>
          {nav}
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[1] = el;
          }}
          className={stepClass(1)}
        >
          <Section title="Pricing" hint="A starting price is enough -- couples use it to shortlist, not as a quote.">
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
              <Field label="Priced">
                <select
                  value={details.price_unit ?? ""}
                  onChange={(e) => set("price_unit", (e.target.value || null) as VendorPriceUnit | null)}
                  className={inputClass}
                >
                  <option value="">Choose…</option>
                  {(Object.keys(VENDOR_PRICE_UNITS) as VendorPriceUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {VENDOR_PRICE_UNITS[u]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Price level">
                <Select value={details.price_tier} onChange={(v) => set("price_tier", v)} options={STYLE_TIERS} placeholder="Choose…" />
              </Field>
              <Field label="That price covers" className="sm:col-span-3">
                <input
                  value={details.price_note ?? ""}
                  onChange={(e) => set("price_note", e.target.value || null)}
                  className={inputClass}
                  placeholder="6 hours of coverage · Buffet, 100-guest minimum · 3-piece band"
                />
              </Field>
            </div>
          </Section>
          {nav}
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[2] = el;
          }}
          className={stepClass(2)}
        >
          <Section title="Photos" hint={`Up to ${MAX_CLAIM_PHOTOS}. The first one is the cover couples see in search.`}>
            <PhotoGridEditor photos={photos} setPhotos={setPhotos} uploading={uploading} onAddFiles={addPhotos} />
            {photoError && <p className="mt-3 text-sm text-red-700">{photoError}</p>}
            <p className="mt-3 text-xs text-ink/50">Only upload photos you own or have permission to use.</p>
          </Section>
          {nav}
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[3] = el;
          }}
          className={stepClass(3)}
        >
          <Section title="Contact" hint="Where couples' quote requests through You Do, I Do are sent.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input type="email" value={details.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value || null)} className={inputClass} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={details.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value || null)} className={inputClass} />
              </Field>
              <Field label="Website" className="sm:col-span-2">
                <input value={details.website ?? ""} onChange={(e) => set("website", e.target.value || null)} className={inputClass} placeholder="yourbusiness.com" />
              </Field>
              <Field label="Instagram">
                <input value={details.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value || null)} className={inputClass} placeholder="instagram.com/you" />
              </Field>
              <Field label="Facebook">
                <input value={details.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value || null)} className={inputClass} placeholder="facebook.com/you" />
              </Field>
              <Field label="Pinterest">
                <input value={details.pinterest_url ?? ""} onChange={(e) => set("pinterest_url", e.target.value || null)} className={inputClass} placeholder="pinterest.com/you" />
              </Field>
            </div>
          </Section>

          <Section title="Describe your business">
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
                <textarea rows={3} value={details.included ?? ""} onChange={(e) => set("included", e.target.value || null)} className={inputClass} />
              </Field>
              <Field label="Anything else couples should know?">
                <textarea
                  rows={3}
                  value={details.good_to_know ?? ""}
                  onChange={(e) => set("good_to_know", e.target.value || null)}
                  className={inputClass}
                  placeholder="How far ahead you book up, deposit, travel fees, anything else"
                />
              </Field>
              <Field label="Services & extras (separate with commas)">
                <input value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </Section>
          {nav}
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[4] = el;
          }}
          className={stepClass(4)}
        >
          <Section
            title="Questions couples ask"
            hint={`We've started you off with what couples ask ${category ? `${category.toLowerCase()} vendors` : "vendors"} most. Answer any you like -- blank ones are skipped.`}
          >
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
          {nav}
        </fieldset>

        <fieldset
          ref={(el) => {
            stepRefs.current[5] = el;
          }}
          className={stepClass(5)}
        >
          <PreviewPrompt onOpen={() => setPreviewing(true)} />
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
                  placeholder="Owner, lead photographer…"
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
              I work for or own {details.name || "this business"} and can make changes to its listing.
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

      <aside className="hidden lg:sticky lg:top-8 lg:block">
        <p className={labelClass}>What couples see</p>
        <div className="overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
          {photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- just-uploaded storage URLs
            <img src={photos[0]} alt="" className="aspect-[16/10] w-full border-b border-hairline object-cover" />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center border-b border-hairline bg-parchment text-xs text-ink/40">
              Add a cover photo
            </div>
          )}
          <div className="p-4">
            <p className="font-display text-lg font-semibold text-forest">{details.name || "Your business"}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-ink/50">
              {[location, category].filter(Boolean).join(" · ")}
            </p>
            {details.price_from != null && (
              <p className="mt-2 font-mono-numbers text-sm text-ink/70">
                From ${details.price_from.toLocaleString()}
                {details.price_unit && ` ${VENDOR_PRICE_UNITS[details.price_unit]}`}
              </p>
            )}
            {details.service_area && <p className="mt-1 text-xs text-ink/55">Serves {details.service_area}</p>}
            {details.description && <p className="mt-2 text-sm text-ink/75">{details.description}</p>}
          </div>
        </div>
        <p className="mt-3 text-xs text-ink/45">
          {photos.length} {photos.length === 1 ? "photo" : "photos"} · {answered} answered{" "}
          {answered === 1 ? "question" : "questions"}
        </p>
        <button type="button" onClick={() => setPreviewing(true)} className="mt-2 text-sm text-brass hover:underline">
          See the full page &rarr;
        </button>
      </aside>
      {preview}
    </form>
  );
}
