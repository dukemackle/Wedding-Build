"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import {
  addDashboardPhoto,
  removeDashboardPhoto,
  saveWedding,
  setDashboardPhotoFocus,
} from "./actions";
import type { Venue, Wedding } from "@/lib/supabase/types";
import { STATES, SEASONS, STYLE_TIERS, VENUE_TYPES } from "@/lib/wedding-options";
import { daysUntilWedding } from "@/lib/countdown";
import { CountdownTimer } from "@/components/countdown-timer";
import { MilestoneBird } from "./milestone-bird";
import { shrinkImage } from "@/lib/shrink-image";
import { MAX_DASHBOARD_PHOTOS, focusPosition, type PhotoFocus } from "@/lib/dashboard-photos";
import { PhotoBackdrop } from "./photo-backdrop";
import { PhotoFocusPicker } from "./photo-focus-picker";

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
 * The "Photos" pill and its popover: the photos that take turns behind the
 * dashboard. Several files can be picked at once; each goes up on its own so
 * every one stays under the upload cap, and a failure stops the rest.
 */
function PhotosButton({ wedding }: { wedding: Wedding }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  // "3 of 12" while a batch goes up, one at a time.
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const photos = wedding.dashboard_photo_urls ?? [];
  const room = MAX_DASHBOARD_PHOTOS - photos.length;
  // The photo whose focus point is being set, and the points as tapped --
  // kept here so the dot moves at once rather than after the save.
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<PhotoFocus>(wedding.dashboard_photo_focus ?? {});
  const editing = selected && photos.includes(selected) ? selected : null;

  // A click anywhere outside the button and popover closes it, as does Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleFiles(files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, room);
    if (picked.length === 0) return;
    startTransition(async () => {
      for (const [i, file] of picked.entries()) {
        setProgress({ done: i + 1, total: picked.length });
        const formData = new FormData();
        formData.set("photo", await shrinkImage(file));
        const result = await addDashboardPhoto(formData);
        if (result?.error) {
          setError(result.error);
          break;
        }
        setError(undefined);
      }
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleFocus(url: string, x: number, y: number) {
    const point: [number, number] = [Math.round(x), Math.round(y)];
    setFocus((f) => ({ ...f, [url]: point }));
    startTransition(async () => {
      const result = await setDashboardPhotoFocus(url, point[0], point[1]);
      setError(result?.error);
    });
  }

  function handleRemove(url: string) {
    if (!confirm("Remove this photo from your dashboard?")) return;
    startTransition(async () => {
      const result = await removeDashboardPhoto(url);
      setError(result?.error);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
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
          <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        {photos.length > 0 ? "Photos" : "Add photos"}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[min(24rem,calc(100vw-3rem))] rounded-lg border border-hairline bg-card p-4 text-left shadow-lg">
          <p className="text-xs text-ink/60">
            Photos of the two of you, shown behind your dashboard one at a time. Up to{" "}
            {MAX_DASHBOARD_PHOTOS}.
            {photos.length === 0 && wedding.hero_photo_url && (
              <> Until you add some, it shows your guest site banner.</>
            )}
          </p>

          {photos.length > 0 && (
            <ul className="-mx-1 mt-3 grid max-h-[min(18rem,40vh)] grid-cols-4 gap-2 overflow-y-auto px-1 pt-1.5">
              {photos.map((url) => (
                <li key={url} className="group relative aspect-square">
                  <button
                    type="button"
                    onClick={() => setSelected(editing === url ? null : url)}
                    aria-pressed={editing === url}
                    aria-label="Choose what stays in view"
                    className={`absolute inset-0 overflow-hidden rounded-md border ${
                      editing === url ? "border-[#2243B6] ring-2 ring-[#2243B6]" : "border-hairline"
                    }`}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                      style={{ objectPosition: focusPosition(focus, url) }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    disabled={isPending}
                    aria-label="Remove this photo"
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-forest text-xs leading-none text-parchment hover:bg-forest/90"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {editing ? (
            <PhotoFocusPicker
              url={editing}
              point={focus[editing] ?? [50, 50]}
              onPick={(x, y) => handleFocus(editing, x, y)}
            />
          ) : (
            photos.length > 0 && (
              <p className="mt-2 text-xs text-ink/50">Tap a photo to choose what stays in view.</p>
            )
          )}

          <div className="mt-3 flex items-center gap-3">
            <label
              className={`rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors ${
                room > 0 && !isPending ? "cursor-pointer hover:bg-forest/90" : "opacity-60"
              }`}
            >
              {progress ? `Uploading ${progress.done} of ${progress.total}…` : isPending ? "Saving…" : "Choose photos"}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={room <= 0 || isPending}
                onChange={(e) => handleFiles(e.target.files)}
                className="sr-only"
              />
            </label>
            <span className="text-xs text-ink/50">
              {room > 0 ? `${room} more` : "That's the most it holds"}
            </span>
          </div>
          {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * The top of the dashboard: who, when, and how long to go.
 *
 * With photos (the couple's own, else their guest site banner, else the
 * booked venue) they fill the whole page behind everything and this sits
 * straight on them, white type over the navy wash. With none it's a navy
 * panel. State, season and style live behind "Edit details"; they feed
 * estimates and don't earn a place up here.
 */
function WeddingHero({
  wedding,
  bookedVenue,
  onEdit,
  canEdit,
  actions,
}: {
  wedding: Wedding;
  bookedVenue: Venue | null;
  onEdit: () => void;
  canEdit: boolean;
  actions?: ReactNode;
}) {
  const own = wedding.dashboard_photo_urls ?? [];
  const fallback = wedding.hero_photo_url ?? bookedVenue?.image_url;
  const photos = own.length > 0 ? own : fallback ? [fallback] : [];
  const onPhoto = photos.length > 0;
  const venueLine = bookedVenue
    ? [bookedVenue.name, [bookedVenue.city, bookedVenue.state].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <>
      <PhotoBackdrop photos={photos} focus={wedding.dashboard_photo_focus} />
      <section
        className={
          onPhoto
            ? "relative"
            : "relative overflow-visible rounded-2xl bg-forest shadow-lg"
        }
      >
        {!onPhoto && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(199,154,46,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]"
          />
        )}

        <div
          className={`relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between ${
            onPhoto
              ? // The photo gets the first screen: on desktop the names sit
                // low and the cards start below the fold's midpoint.
                "pt-20 pb-2 sm:pt-28 lg:min-h-[calc(62vh-6rem)] lg:px-2 lg:pt-24"
              : "p-6 pt-12 sm:p-10 lg:px-10 lg:py-8"
          }`}
        >
          <div className="min-w-0 [text-shadow:0_2px_18px_rgba(0,0,0,0.35)]">
            {venueLine && (
              <p className="font-mono-numbers text-xs font-medium uppercase tracking-[0.2em] text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
                {venueLine}
              </p>
            )}
            <h1 className="mt-2 font-display text-5xl font-semibold leading-tight text-white lg:text-7xl">
              {wedding.partner_a_name} &amp; {wedding.partner_b_name}
            </h1>
            <p className="mt-2 text-lg text-white/90 lg:text-xl">
              {wedding.wedding_date ? formatDate(wedding.wedding_date) : "Date not set yet"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 [text-shadow:none]">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-forest transition-colors hover:bg-parchment"
                >
                  Edit details
                </button>
              )}
              {actions}
              {canEdit && <PhotosButton wedding={wedding} />}
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-xl border border-white/15 bg-[#14203d]/85 p-5 shadow-lg backdrop-blur-md lg:min-w-[380px] lg:py-4">
            {wedding.wedding_date ? (
              <>
                <MilestoneBird weddingDate={wedding.wedding_date} />
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
    </>
  );
}

export function WeddingDashboard({
  initialWedding,
  bookedVenue = null,
  canEdit = true,
  heroActions,
}: {
  initialWedding: Wedding | null;
  bookedVenue?: Venue | null;
  /** False for someone invited with view-only access. */
  canEdit?: boolean;
  /** Extra pills beside "Edit details" -- the "Invite to plan" button. */
  heroActions?: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(!initialWedding);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      let result: Awaited<ReturnType<typeof saveWedding>>;
      try {
        result = await saveWedding(formData);
      } catch {
        setError("We couldn't save your wedding details. Please try again in a moment.");
        return;
      }
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
          canEdit={canEdit}
          actions={heroActions}
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
