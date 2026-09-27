"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LegalNotice } from "@/components/legal-notice";
import { STATES, VENDOR_LISTING_CATEGORIES } from "@/lib/wedding-options";
import { startListing, type NewListing } from "./actions";

const inputClass =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

const STEPS = ["What you do", "Your business", "Details & photos", "We review it"];

/**
 * The first half of listing a business: enough to create the listing. The
 * details and photos are the second half, on the private edit link this
 * sends them to -- the same page they'll use to make changes later, so
 * there's one form to learn rather than two.
 *
 * Desktop shows both sections at once beside a step list; a phone shows one
 * section at a time with Next / Back.
 */
export function ListForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState<NewListing>({
    kind: "vendor",
    category: null,
    name: "",
    city: "",
    state: "",
    address: "",
    submitterName: "",
    email: "",
    company: "",
  });
  const [kindChosen, setKindChosen] = useState(false);
  const set = <K extends keyof NewListing>(key: K, value: NewListing[K]) => setForm((f) => ({ ...f, [key]: value }));

  const stepOneDone = kindChosen && (form.kind === "venue" || Boolean(form.category));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    startTransition(async () => {
      const result = await startListing(form);
      if (result.next) router.push(result.next);
      else setErrors(result.errors ?? [result.error ?? "Something went wrong -- please try again."]);
    });
  }

  const tile = (on: boolean) =>
    `rounded-lg border p-4 text-left transition-colors ${
      on ? "border-2 border-forest bg-forest/[0.04]" : "border-hairline bg-card hover:border-forest/40"
    }`;
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition-colors ${
      on ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-ink hover:border-forest/40"
    }`;

  return (
    <form onSubmit={submit} className="md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-start md:gap-8">
      {/* Desktop: where they are in the whole process, including the half on the next page. */}
      <aside className="hidden rounded-lg border border-hairline bg-card p-6 shadow-sm md:sticky md:top-8 md:block">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">List your business</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-forest">Get in front of couples</h1>
        <ol className="mt-5 flex flex-col gap-3 text-sm">
          {STEPS.map((label, i) => {
            const current = i < 2;
            return (
              <li key={label} className={`flex items-center gap-3 ${current ? "font-medium text-forest" : "text-ink/55"}`}>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    current ? "border-forest bg-forest text-parchment" : "border-hairline"
                  }`}
                >
                  {i + 1}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
        <p className="mt-5 text-xs leading-relaxed text-ink/60">
          Free, and no password to remember: we email you a private link to your listing, and you use it
          whenever you want to make changes. Every listing is reviewed before it goes live.
        </p>
      </aside>

      <div className="flex flex-col gap-5">
        {/* Phone: a heading and progress instead of the step list. */}
        <div className="md:hidden">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            List your business · Step {step} of 4
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-hairline">
            <div className="h-1.5 rounded-full bg-forest transition-all" style={{ width: `${step * 25}%` }} />
          </div>
        </div>

        <section className={`${step === 1 ? "" : "hidden md:block"} rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-7`}>
          <h2 className="font-display text-2xl font-semibold text-forest">What do you do?</h2>
          <p className="mt-1 text-sm text-ink/60">This decides where you show up on Wren.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                set("kind", "venue");
                setKindChosen(true);
              }}
              className={tile(kindChosen && form.kind === "venue")}
            >
              <span className="block font-medium text-ink">A venue</span>
              <span className="mt-0.5 block text-xs text-ink/60">Couples hold their ceremony or reception at your place</span>
            </button>
            <button
              type="button"
              onClick={() => {
                set("kind", "vendor");
                setKindChosen(true);
              }}
              className={tile(kindChosen && form.kind === "vendor")}
            >
              <span className="block font-medium text-ink">A vendor</span>
              <span className="mt-0.5 block text-xs text-ink/60">You provide a service: photos, flowers, food, music…</span>
            </button>
          </div>

          {kindChosen && form.kind === "vendor" && (
            <div className="mt-5">
              <p className="text-sm font-medium text-ink">
                What&apos;s your main service? <span className="font-normal text-ink/55">Couples browse by this</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {VENDOR_LISTING_CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => set("category", c)} className={chip(form.category === c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 text-xs text-ink/55">
            Already on Wren? Use{" "}
            <Link href="/list/edit" className="font-medium text-brass hover:underline">
              Edit my listing
            </Link>{" "}
            instead, so you don&apos;t end up listed twice.
          </p>
          <button
            type="button"
            disabled={!stepOneDone}
            onClick={() => setStep(2)}
            className="mt-5 w-full rounded-md bg-forest px-4 py-2.5 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50 md:hidden"
          >
            Next
          </button>
        </section>

        <section className={`${step === 2 ? "" : "hidden md:block"} rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-7`}>
          <h2 className="font-display text-2xl font-semibold text-forest">Your business</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Business name
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} required maxLength={120} />
            </label>
            {form.kind === "venue" && (
              <label className={`${labelClass} sm:col-span-2`}>
                <span>
                  Street address <span className="text-xs text-ink/55">Puts you on the map</span>
                </span>
                <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputClass} maxLength={200} />
              </label>
            )}
            <label className={labelClass}>
              Town
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} required maxLength={80} />
            </label>
            <label className={labelClass}>
              State
              <select value={form.state} onChange={(e) => set("state", e.target.value)} className={inputClass} required>
                <option value="">Choose…</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Your name
              <input value={form.submitterName} onChange={(e) => set("submitterName", e.target.value)} className={inputClass} required maxLength={120} />
            </label>
            <label className={labelClass}>
              <span>
                Business email <span className="text-xs text-ink/55">Where we send your link</span>
              </span>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} required />
            </label>
            {/* Honeypot: hidden from people and screen readers, filled by bots. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              className="hidden"
            />
          </div>

          <p className="mt-5 text-sm text-ink/60">
            Next you&apos;ll add your photos, prices and the details couples filter by. We&apos;ll also email you
            the link, so you can finish later.
          </p>

          {errors.length > 0 && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errors.length === 1 ? (
                errors[0]
              ) : (
                <ul className="list-disc pl-5">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-forest px-4 py-2.5 font-medium text-forest md:hidden"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isPending || !stepOneDone}
              className="flex-1 rounded-md bg-forest px-5 py-2.5 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50 md:flex-none"
            >
              {isPending ? (
                "Starting…"
              ) : (
                <>
                  <span className="md:hidden">Continue</span>
                  <span className="hidden md:inline">Continue to details &amp; photos</span>
                </>
              )}
            </button>
          </div>
          <LegalNotice action="continuing" className="mt-3" />
          {!stepOneDone && (
            <p className="mt-2 hidden text-xs text-ink/55 md:block">Choose what you do above first.</p>
          )}
        </section>
      </div>
    </form>
  );
}
