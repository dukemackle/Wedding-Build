"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { saveWedding } from "./actions";
import type { Wedding } from "@/lib/supabase/types";
import { REGIONS, SEASONS, STYLE_TIERS, VENUE_TYPES } from "@/lib/wedding-options";

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? "" : "s"} to go`;
  if (diffDays === 0) return "Today!";
  return `Married ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const selectClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function WeddingForm({
  wedding,
  onSave,
  pending,
  onCancel,
}: {
  wedding: Wedding | null;
  onSave: (formData: FormData) => void;
  pending: boolean;
  onCancel?: () => void;
}) {
  return (
    <form action={onSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Partner A&apos;s name
        <input
          name="partner_a_name"
          required
          defaultValue={wedding?.partner_a_name ?? ""}
          className={selectClass}
        />
      </label>
      <label className={labelClass}>
        Partner B&apos;s name
        <input
          name="partner_b_name"
          required
          defaultValue={wedding?.partner_b_name ?? ""}
          className={selectClass}
        />
      </label>
      <label className={labelClass}>
        Wedding date
        <input
          type="date"
          name="wedding_date"
          required
          defaultValue={wedding?.wedding_date ?? ""}
          className={selectClass}
        />
      </label>
      <label className={labelClass}>
        Guest count override
        <input
          type="number"
          name="guest_count_override"
          min={0}
          placeholder="Optional"
          defaultValue={wedding?.guest_count_override ?? ""}
          className={selectClass}
        />
      </label>
      <label className={labelClass}>
        Region
        <select
          name="region"
          required
          defaultValue={wedding?.region ?? ""}
          className={selectClass}
        >
          <option value="" disabled>
            Select a region
          </option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Season
        <select
          name="season"
          required
          defaultValue={wedding?.season ?? ""}
          className={selectClass}
        >
          <option value="" disabled>
            Select a season
          </option>
          {SEASONS.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Style tier
        <select
          name="style_tier"
          required
          defaultValue={wedding?.style_tier ?? ""}
          className={selectClass}
        >
          <option value="" disabled>
            Select a style
          </option>
          {STYLE_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Venue type
        <select
          name="venue_type"
          required
          defaultValue={wedding?.venue_type ?? ""}
          className={selectClass}
        >
          <option value="" disabled>
            Select a venue type
          </option>
          {VENUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <div className="col-span-full mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono-numbers text-xs uppercase tracking-wide text-ink/50">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function WeddingSummary({
  wedding,
  onEdit,
}: {
  wedding: Wedding;
  onEdit: () => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {wedding.hero_photo_url && (
          <Image
            src={wedding.hero_photo_url}
            alt={`${wedding.partner_a_name} & ${wedding.partner_b_name}`}
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-full border border-hairline object-cover shadow-sm"
          />
        )}
        <div>
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            {wedding.wedding_date ? daysUntil(wedding.wedding_date) : "Date not set"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-forest">
            {wedding.partner_a_name} &amp; {wedding.partner_b_name}
          </h1>
          {wedding.wedding_date && (
            <p className="mt-1 text-ink/70">{formatDate(wedding.wedding_date)}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-6 sm:grid-cols-4">
        <DetailRow label="Region" value={wedding.region ?? "—"} />
        <DetailRow label="Season" value={wedding.season ?? "—"} />
        <DetailRow label="Style" value={wedding.style_tier ?? "—"} />
        <DetailRow label="Venue type" value={wedding.venue_type ?? "—"} />
      </div>
      {wedding.guest_count_override !== null && (
        <p className="mt-4 font-mono-numbers text-sm text-ink/70">
          Guest count override: {wedding.guest_count_override}
        </p>
      )}

      <button
        onClick={onEdit}
        className="mt-6 rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
      >
        Edit details
      </button>
    </div>
  );
}

export function WeddingDashboard({
  initialWedding,
}: {
  initialWedding: Wedding | null;
}) {
  const [isEditing, setIsEditing] = useState(!initialWedding);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await saveWedding(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
      {error && (
        <p className="mb-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {!initialWedding && (
        <>
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Let&apos;s get started
          </p>
          <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
            Tell us about your wedding
          </h1>
        </>
      )}

      {isEditing ? (
        <WeddingForm
          wedding={initialWedding}
          onSave={handleSave}
          pending={isPending}
          onCancel={initialWedding ? () => setIsEditing(false) : undefined}
        />
      ) : (
        initialWedding && (
          <WeddingSummary wedding={initialWedding} onEdit={() => setIsEditing(true)} />
        )
      )}
    </div>
  );
}
