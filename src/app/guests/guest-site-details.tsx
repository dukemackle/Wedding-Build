"use client";

import { useRef, useState, useTransition } from "react";
import type { Wedding, WeddingAccommodation, WeddingFaq } from "@/lib/supabase/types";
import {
  addAccommodation,
  addWeddingFaq,
  deleteAccommodation,
  deleteWeddingFaq,
  updateGuestSiteDetails,
} from "./guest-site-actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function DressAndTravel({ wedding }: { wedding: Wedding }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateGuestSiteDetails(formData);
      if (result?.error) {
        setError(result.error);
        setSaved(false);
      } else {
        setError(undefined);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form action={handleSave} className="flex flex-col gap-3">
      <label className={labelClass}>
        Dress code
        <input
          name="dress_code"
          placeholder="e.g. Black tie optional — tuxedo or dark suit, gown or cocktail dress"
          defaultValue={wedding.dress_code ?? ""}
          className={inputClass}
        />
        <span className="text-xs text-ink/50">
          Be specific — &quot;black tie optional&quot; means little on its own.
        </span>
      </label>
      <label className={labelClass}>
        Getting there &amp; parking
        <textarea
          name="travel_notes"
          rows={3}
          placeholder="Nearest airport, driving directions, where to park, shuttle times..."
          defaultValue={wedding.travel_notes ?? ""}
          className={inputClass}
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Saving..." : saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}

function Accommodations({ items }: { items: WeddingAccommodation[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    formData.set("sort_order", String(items.length));
    startTransition(async () => {
      const result = await addAccommodation(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
      }
    });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await deleteAccommodation(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-3 border-b border-hairline py-3 last:border-b-0"
        >
          <div className="min-w-0">
            <p className="text-ink">{item.name}</p>
            {item.address && <p className="mt-0.5 text-xs text-ink/50">{item.address}</p>}
            {item.notes && <p className="mt-1 text-sm text-ink/70">{item.notes}</p>}
            {item.booking_url && (
              <p className="mt-1 truncate text-xs text-brass">{item.booking_url}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            disabled={isPending}
            className="shrink-0 text-xs text-ink/50 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <form
        ref={formRef}
        action={handleAdd}
        className="mt-4 grid grid-cols-1 gap-3 rounded-md border border-hairline bg-parchment p-4 sm:grid-cols-2"
      >
        <label className={labelClass}>
          Hotel or stay
          <input name="name" required placeholder="The Lodge at Sisters" className={inputClass} />
        </label>
        <label className={labelClass}>
          Address
          <input name="address" placeholder="Optional" className={inputClass} />
        </label>
        <label className={labelClass}>
          Booking link
          <input
            name="booking_url"
            type="url"
            placeholder="https://..."
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Notes
          <input
            name="notes"
            placeholder="Room block under 'Smith Wedding', rate held until May 1"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60 sm:col-span-2"
        >
          {isPending ? "Adding..." : "+ Add place to stay"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

function Faqs({ faqs }: { faqs: WeddingFaq[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    formData.set("sort_order", String(faqs.length));
    startTransition(async () => {
      const result = await addWeddingFaq(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
      }
    });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await deleteWeddingFaq(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="flex items-start justify-between gap-3 border-b border-hairline py-3 last:border-b-0"
        >
          <div>
            <p className="text-ink">{faq.question}</p>
            <p className="mt-0.5 text-sm text-ink/70">{faq.answer}</p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(faq.id)}
            disabled={isPending}
            className="shrink-0 text-xs text-ink/50 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <form
        ref={formRef}
        action={handleAdd}
        className="mt-4 flex flex-col gap-3 rounded-md border border-hairline bg-parchment p-4"
      >
        <input
          name="question"
          required
          placeholder="Can we bring our kids?"
          className={inputClass}
        />
        <textarea
          name="answer"
          rows={2}
          required
          placeholder="We love your little ones, but this is an adults-only celebration."
          className={inputClass}
        />
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
        >
          {isPending ? "Adding..." : "+ Add question"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

export function GuestSiteDetails({
  wedding,
  faqs,
  accommodations,
}: {
  wedding: Wedding;
  faqs: WeddingFaq[];
  accommodations: WeddingAccommodation[];
}) {
  const [tab, setTab] = useState<"details" | "stays" | "faq">("details");

  const tabs = [
    { key: "details" as const, label: "Dress code & travel" },
    { key: "stays" as const, label: `Places to stay (${accommodations.length})` },
    { key: "faq" as const, label: `FAQ (${faqs.length})` },
  ];

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <h2 className="font-display text-2xl font-semibold text-forest">Guest site details</h2>
      <p className="mt-1 text-sm text-ink/70">
        The questions guests ask over and over. Anything you fill in here shows up on your guest
        site; anything you leave blank stays hidden.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              tab === t.key
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-parchment text-ink hover:border-forest"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "details" && <DressAndTravel wedding={wedding} />}
        {tab === "stays" && <Accommodations items={accommodations} />}
        {tab === "faq" && <Faqs faqs={faqs} />}
      </div>
    </div>
  );
}
