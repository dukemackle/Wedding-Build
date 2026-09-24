"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveWedding } from "./actions";
import type { Venue, Wedding } from "@/lib/supabase/types";
import { STATES, SEASONS, STYLE_TIERS, VENUE_TYPES } from "@/lib/wedding-options";
import { daysUntilWedding } from "@/lib/countdown";
import { CountdownTimer } from "@/components/countdown-timer";
import { PhotoUpload } from "@/components/photo-upload";

/**
 * The couple's picture, and the only place it's set.
 *
 * Falls back to the guest site's banner photo so nobody who already uploaded
 * one sees an empty circle, but a banner cropped to 96px is usually a smear --
 * which is the reason the two are separate now. The pencil is the whole
 * editing affordance; there is no "photo" card any more.
 */
function ProfileAvatar({ wedding }: { wedding: Wedding }) {
  const [editing, setEditing] = useState(false);
  const photo = wedding.profile_photo_url ?? wedding.hero_photo_url;

  return (
    <div className="shrink-0">
      <div className="relative w-24">
        {photo ? (
          <Image
            src={photo}
            alt={[wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ")}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full border-2 border-white/80 object-cover shadow-md"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-hairline bg-parchment">
            <svg
              viewBox="0 0 64 64"
              aria-hidden="true"
              className="h-14 w-14 fill-forest/25"
            >
              <circle cx="24" cy="21" r="10" />
              <circle cx="43" cy="24" r="8.5" />
              <path d="M4 64c0-11 9-19 20-19s20 8 20 19Z" />
              <path d="M33 64c1-9 8-16 17-16s14 6 14 16Z" />
            </svg>
          </div>
        )}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label={photo ? "Change your photo" : "Add a photo"}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-forest text-parchment transition-colors hover:bg-forest/90"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      {editing && (
        <div className="mt-4 rounded-md border border-hairline bg-parchment p-3">
          <p className="mb-2 text-xs text-ink/60">
            A photo of the two of you, shown in this circle. The background is changed with the
            camera button in the top corner.
          </p>
          <PhotoUpload
            kind="profile"
            photoUrl={wedding.profile_photo_url}
            confirmRemove="Remove your profile photo?"
            onDone={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
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
        RSVP deadline
        <input
          type="date"
          name="rsvp_deadline"
          defaultValue={wedding?.rsvp_deadline ?? ""}
          className={selectClass}
        />
      </label>
      <label className={labelClass}>
        Expected headcount
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
        State
        <select
          name="state"
          required
          defaultValue={wedding?.state ?? ""}
          className={selectClass}
        >
          <option value="" disabled>
            Select a state
          </option>
          {STATES.map((state) => (
            <option key={state} value={state}>
              {state}
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

/**
 * The camera button in the banner's corner: changes the background photo.
 *
 * That photo is also the banner on the guest site -- one picture of the two
 * of you across the top of both, rather than two uploads that drift apart.
 */
function CoverPhotoButton({ wedding }: { wedding: Wedding }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // A click anywhere outside the button and popover closes it, as does Escape.
  useEffect(() => {
    if (!editing) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setEditing(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setEditing(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [editing]);

  return (
    <div ref={ref} className="absolute right-4 top-4 z-10 flex flex-col items-end sm:right-6 sm:top-6">
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        aria-expanded={editing}
        className="flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        <span className="hidden sm:inline">
          {wedding.hero_photo_url ? "Change background" : "Add background"}
        </span>
      </button>

      {editing && (
        <div className="mt-2 w-[min(22rem,calc(100vw-4rem))] rounded-lg border border-hairline bg-card p-4 text-left shadow-lg">
          <p className="mb-3 text-xs text-ink/60">
            A wide photo works best. It&apos;s also the banner across the top of your guest site.
          </p>
          <PhotoUpload
            kind="hero"
            photoUrl={wedding.hero_photo_url}
            shape="wide"
            confirmRemove="Remove the background photo? It's also your guest site's banner."
            onDone={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * The banner across the top: who, when, and how long to go.
 *
 * The couple's own background photo when they've set one (the same picture
 * as the guest-site banner), then the booked venue's photo, then plain
 * forest. State, season and style used to show here as chips; they're
 * settings that feed estimates, not anything worth a place on the banner, so
 * they live behind "Edit details".
 */
function WeddingHero({
  wedding,
  bookedVenue,
  onEdit,
}: {
  wedding: Wedding;
  bookedVenue: Venue | null;
  onEdit: () => void;
}) {
  const backdrop = wedding.hero_photo_url ?? bookedVenue?.image_url;
  const venueLine = bookedVenue
    ? [bookedVenue.name, [bookedVenue.city, bookedVenue.state].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" · ")
    : null;

  // The camera button sits outside the section: the section clips to its
  // rounded corners, and would clip the upload popover along with the photo.
  return (
    <div className="relative">
      <CoverPhotoButton wedding={wedding} />
      <section className="relative overflow-hidden rounded-2xl bg-forest shadow-lg">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(199,154,46,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]"
          />
        )}
        {/* Scrim: dark enough at the bottom-left for white type on any photo. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/45 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/45 lg:to-black/10"
        />

        <div className="relative flex flex-col gap-8 p-6 pt-16 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <ProfileAvatar wedding={wedding} />
            <div className="min-w-0">
              {venueLine && (
                <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
                  {venueLine}
                </p>
              )}
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {wedding.partner_a_name} &amp; {wedding.partner_b_name}
              </h1>
              <p className="mt-2 text-lg text-white/85">
                {wedding.wedding_date ? formatDate(wedding.wedding_date) : "Date not set yet"}
              </p>
              <div className="mt-4 lg:mt-3">
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-forest transition-colors hover:bg-parchment"
                >
                  Edit details
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-xl border border-white/15 bg-black/25 p-5 backdrop-blur-md lg:min-w-[380px] lg:py-4">
            {wedding.wedding_date ? (
              <>
                {/* Four large units don't fit a phone's width; the small ones do. */}
                <div className="sm:hidden">
                  <CountdownTimer
                    targetDate={wedding.wedding_date}
                    fallbackLabel={daysUntilWedding(wedding.wedding_date)}
                    tone="light"
                    className="justify-start [&>div:first-child]:pl-0"
                  />
                </div>
                <div className="hidden sm:block">
                  <CountdownTimer
                    targetDate={wedding.wedding_date}
                    fallbackLabel={daysUntilWedding(wedding.wedding_date)}
                    tone="light"
                    size="lg"
                    className="justify-start [&>div:first-child]:pl-0"
                  />
                </div>
              </>
            ) : (
              <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-white/70">
                Add your date to start the countdown
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function WeddingDashboard({
  initialWedding,
  bookedVenue = null,
}: {
  initialWedding: Wedding | null;
  bookedVenue?: Venue | null;
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
    <div className="w-full">
      {initialWedding && (
        <WeddingHero
          wedding={initialWedding}
          bookedVenue={bookedVenue}
          onEdit={() => setIsEditing(true)}
        />
      )}

      {isEditing && (
        <div
          className={`rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-10 ${
            initialWedding ? "mt-6" : ""
          }`}
        >
          {error && (
            <p className="mb-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
          {initialWedding ? (
            <h2 className="mb-6 font-display text-2xl font-semibold text-forest">
              Wedding details
            </h2>
          ) : (
            <>
              <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
                Let&apos;s get started
              </p>
              <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
                Tell us about your wedding
              </h1>
            </>
          )}
          <WeddingForm
            wedding={initialWedding}
            onSave={handleSave}
            pending={isPending}
            onCancel={initialWedding ? () => setIsEditing(false) : undefined}
          />
        </div>
      )}
    </div>
  );
}
