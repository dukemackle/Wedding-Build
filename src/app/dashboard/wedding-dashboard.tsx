"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import {
  addDashboardPhoto,
  removeDashboardPhoto,
  saveWedding,
  setDashboardPhotoFocus,
  setDashboardPhotoSource,
} from "./actions";
import type { Venue, Wedding } from "@/lib/supabase/types";
import { STATES, SEASONS, STYLE_TIERS, VENUE_TYPES, currentVenueType } from "@/lib/wedding-options";
import { daysUntilWedding } from "@/lib/countdown";
import { CountdownTimer } from "@/components/countdown-timer";
import { MilestoneBird } from "./milestone-bird";
import { shrinkImage } from "@/lib/shrink-image";
import {
  INSPIRATION_PHOTOS,
  MAX_DASHBOARD_PHOTOS,
  focusPosition,
  inspirationThumb,
  photoCredit,
  resolvePhotoSource,
  type PhotoFocus,
  type PhotoSource,
} from "@/lib/dashboard-photos";
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
  const [date, setDate] = useState(wedding?.wedding_date ?? "");
  const was = wedding?.wedding_date;
  const moveBy =
    was && date && date !== was ? Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${was}T00:00:00Z`)) / 86_400_000) : 0;
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
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={selectClass}
        />
      </label>
      {moveBy !== 0 && (
        <label className="flex items-start gap-2 rounded-md bg-[#2243B6]/[0.06] px-3 py-2 text-[13px] text-ink sm:col-span-2">
          <input type="checkbox" name="shift_schedule" defaultChecked className="mt-0.5 h-4 w-4 shrink-0 accent-[#2243B6]" />
          <span>
            Move my schedule {Math.abs(moveBy)} day{Math.abs(moveBy) === 1 ? "" : "s"} {moveBy > 0 ? "later" : "earlier"} too,
            so the rehearsal, ceremony and everything else keep their place around the new date.
          </span>
        </label>
      )}
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
          defaultValue={wedding?.state ?? ""}
          className={selectClass}
        >
          <option value="">Not sure yet</option>
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
          defaultValue={wedding?.season ?? ""}
          className={selectClass}
        >
          <option value="">Not sure yet</option>
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
          defaultValue={wedding?.style_tier ?? ""}
          className={selectClass}
        >
          <option value="">Not sure yet</option>
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
          defaultValue={currentVenueType(wedding?.venue_type) ?? ""}
          className={selectClass}
        >
          <option value="">Not sure yet</option>
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

type VenuePhotos = { name: string | null; photos: string[] };

/**
 * The "Photos" pill and its popover (a sheet from the bottom on a phone):
 * which photos play behind the dashboard -- the couple's own, their venue's,
 * or the inspiration set -- and, for their own, uploading and framing them.
 * Several files can be picked at once; each goes up on its own so every one
 * stays under the upload cap, and a failure stops the rest.
 */
function PhotosButton({
  wedding,
  sets,
  selected,
  onChoose,
  venueName,
  toggle,
}: {
  wedding: Wedding;
  sets: Record<PhotoSource, readonly string[]>;
  /** The option shown as chosen: what plays, or "own" while it's still empty. */
  selected: PhotoSource;
  /** Updates what plays at once; the popover saves it. */
  onChoose: (source: PhotoSource | null) => void;
  venueName: string | null;
  toggle?: ReactNode;
}) {
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
  const [picked, setPicked] = useState<string | null>(null);
  const [focus, setFocus] = useState<PhotoFocus>(wedding.dashboard_photo_focus ?? {});
  const editing = picked && photos.includes(picked) ? picked : null;

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
    const chosen = Array.from(files ?? []).slice(0, room);
    if (chosen.length === 0) return;
    startTransition(async () => {
      for (const [i, file] of chosen.entries()) {
        setProgress({ done: i + 1, total: chosen.length });
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

  function choose(source: PhotoSource) {
    onChoose(source);
    startTransition(async () => {
      const result = await setDashboardPhotoSource(source);
      if (result?.error) {
        setError(result.error);
        onChoose(wedding.dashboard_photo_source ?? null);
      } else {
        setError(undefined);
      }
    });
  }

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const options: { key: PhotoSource; label: string; detail: string; disabled?: boolean }[] = [
    {
      key: "own",
      label: "Your photos",
      detail:
        photos.length > 0
          ? `${plural(photos.length, "photo")} of the two of you`
          : wedding.hero_photo_url
            ? "Your guest site banner, until you add some"
            : "Add photos of the two of you",
    },
    {
      key: "venue",
      label: venueName ?? "Your venue",
      detail:
        sets.venue.length > 0
          ? plural(sets.venue.length, "photo") + " of your venue"
          : venueName
            ? "No photos of it yet"
            : "Save a venue to use its photos",
      disabled: sets.venue.length === 0,
    },
    { key: "inspiration", label: "Inspiration", detail: "Wedding photos we picked" },
  ];
  const strip = selected === "venue" ? sets.venue : selected === "inspiration" ? sets.inspiration : [];

  return (
    // On a phone the popover is a sheet along the bottom of the screen.
    <div ref={ref} className="sm:relative">
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
        Photos
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Photos behind your dashboard"
          className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-hairline bg-card px-4 pt-2 pb-6 text-left shadow-[0_-10px_30px_rgba(20,32,61,0.3)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:z-20 sm:mt-2 sm:max-h-none sm:w-[25rem] sm:overflow-visible sm:rounded-lg sm:border sm:p-4 sm:shadow-lg"
        >
          <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-hairline sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Behind your dashboard</p>
              <p className="mt-0.5 text-xs text-ink/60">Pick what plays, one photo at a time.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-11 w-11 items-center justify-center text-xl text-ink/60 hover:text-ink sm:hidden"
            >
              ×
            </button>
          </div>

          <div role="radiogroup" aria-label="Which photos play" className="mt-3 flex flex-col gap-2">
            {options.map((o) => {
              const on = o.key === selected;
              const thumb = sets[o.key][0];
              return (
                <button
                  key={o.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={o.disabled}
                  onClick={() => choose(o.key)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-lg border-2 py-1.5 pr-3 pl-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                    on ? "border-[#2243B6] bg-[#2243B6]/5" : "border-hairline hover:border-ink/20"
                  }`}
                >
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-parchment text-ink/40">
                    {thumb ? (
                      <Image
                        src={o.key === "inspiration" ? inspirationThumb(thumb) : thumb}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                        style={o.key === "own" ? { objectPosition: focusPosition(focus, thumb) } : undefined}
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </span>
                  <span className="flex min-w-0 grow flex-col">
                    <span className="truncate text-sm font-semibold text-ink">{o.label}</span>
                    <span className="text-xs text-ink/60">{o.detail}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                      on ? "border-[#2243B6]" : "border-hairline"
                    }`}
                  >
                    {on && <span className="h-2 w-2 rounded-full bg-[#2243B6]" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-hairline pt-3">
            {selected === "own" ? (
              <>
                <p className="text-xs text-ink/60">Up to {MAX_DASHBOARD_PHOTOS}.</p>
                {photos.length > 0 && (
                  <ul className="-mx-1 mt-2 grid max-h-[min(18rem,40vh)] grid-cols-4 gap-2 overflow-y-auto px-1 pt-1.5">
                    {photos.map((url) => (
                      <li key={url} className="group relative aspect-square">
                        <button
                          type="button"
                          onClick={() => setPicked(editing === url ? null : url)}
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

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <label
                    className={`whitespace-nowrap rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors ${
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
                  <span className="whitespace-nowrap text-xs text-ink/50">
                    {room > 0 ? `${room} more` : "That's the most it holds"}
                  </span>
                  {toggle && <div className="ml-auto">{toggle}</div>}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-ink/60">
                  {selected === "venue"
                    ? `From ${venueName ?? "your venue"}. Add your own any time under Your photos.`
                    : "Credited to each photographer on screen."}
                </p>
                <ul className="mt-2 grid grid-cols-6 gap-1.5">
                  {strip.slice(0, 6).map((url) => (
                    <li key={url} className="relative aspect-square overflow-hidden rounded-md bg-parchment">
                      <Image
                        src={selected === "inspiration" ? inspirationThumb(url) : url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
                {toggle && <div className="mt-3 flex justify-end">{toggle}</div>}
              </>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
        </div>
      )}
    </div>
  );
}

// Whether this browser has the backdrop photos switched off. Kept per device
// in localStorage: it's a viewing preference, not part of the wedding.
const PHOTOS_OFF_KEY = "wren-dashboard-photos-off";
const photosOffListeners = new Set<() => void>();

function readPhotosOff() {
  try {
    return localStorage.getItem(PHOTOS_OFF_KEY) === "1";
  } catch {
    return false;
  }
}

function setPhotosOff(off: boolean) {
  try {
    if (off) localStorage.setItem(PHOTOS_OFF_KEY, "1");
    else localStorage.removeItem(PHOTOS_OFF_KEY);
  } catch {
    // Storage blocked: the toggle just won't outlast the visit.
  }
  photosOffListeners.forEach((fn) => fn());
}

function usePhotosOff() {
  return useSyncExternalStore(
    (fn) => {
      photosOffListeners.add(fn);
      return () => photosOffListeners.delete(fn);
    },
    readPhotosOff,
    () => false,
  );
}

/**
 * Turns the photos behind the dashboard off and on. A pill on the hero for
 * view-only collaborators; for editors it sits in the Photos popover.
 */
function PhotosToggle({ off, inPopover = false }: { off: boolean; inPopover?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => setPhotosOff(!off)}
      aria-pressed={off}
      title={off ? "Show your photos behind the dashboard" : "Hide the photos behind the dashboard"}
      className={
        inPopover
          ? "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline px-3 py-1 text-xs font-medium text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
          : "flex items-center gap-1.5 rounded-full border border-white/50 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
      }
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
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="3" />
        {!off && <path d="M4 4l16 16" />}
      </svg>
      {off ? "Show photos" : "Hide photos"}
    </button>
  );
}

/**
 * The top of the dashboard: who, when, and how long to go.
 *
 * Photos fill the whole page behind everything and this sits straight on
 * them, white type over the navy wash: the couple's own (else their guest
 * site banner), their venue's, or the inspiration set, as they choose, or
 * the first of those that has any. With photos hidden it's a navy panel. State, season and style live behind "Edit details"; they feed
 * estimates and don't earn a place up here.
 */
function WeddingHero({
  wedding,
  bookedVenue,
  venuePhotos,
  onEdit,
  canEdit,
  actions,
}: {
  wedding: Wedding;
  bookedVenue: Venue | null;
  venuePhotos: VenuePhotos;
  onEdit: () => void;
  canEdit: boolean;
  actions?: ReactNode;
}) {
  const ownPhotos = wedding.dashboard_photo_urls ?? [];
  const sets: Record<PhotoSource, readonly string[]> = {
    own: ownPhotos.length > 0 ? ownPhotos : wedding.hero_photo_url ? [wedding.hero_photo_url] : [],
    venue: venuePhotos.photos,
    inspiration: INSPIRATION_PHOTOS.map((p) => p.src),
  };
  // Set at once on a choice, before the save comes back.
  const [chosen, setChosen] = useState<PhotoSource | null>(wedding.dashboard_photo_source ?? null);
  const source = resolvePhotoSource(chosen, sets);
  const available = sets[source] as string[];
  // The photo on screen, so an inspiration one can carry its credit.
  const [showing, setShowing] = useState<string | null>(null);
  const credit = source === "inspiration" && showing ? photoCredit(showing) : null;
  const photosOff = usePhotosOff();
  const photos = photosOff ? [] : available;
  const onPhoto = photos.length > 0;
  const venueLine = bookedVenue
    ? [bookedVenue.name, [bookedVenue.city, bookedVenue.state].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <>
      <PhotoBackdrop key={source} photos={photos} focus={wedding.dashboard_photo_focus} onShow={setShowing} />
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
            <div className="mt-4 flex flex-wrap items-center gap-2 max-sm:relative [text-shadow:none]">
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
              {canEdit ? (
                <PhotosButton
                  wedding={wedding}
                  sets={sets}
                  selected={chosen === "own" ? "own" : source}
                  onChoose={setChosen}
                  venueName={venuePhotos.name}
                  toggle={<PhotosToggle off={photosOff} inPopover />}
                />
              ) : (
                <PhotosToggle off={photosOff} />
              )}
            </div>
            {onPhoto && credit && (
              <p className="mt-3 text-[11px] text-white/75 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
                Photo: {credit}, Unsplash
              </p>
            )}
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
  venuePhotos = { name: null, photos: [] },
  canEdit = true,
  heroActions,
}: {
  initialWedding: Wedding | null;
  bookedVenue?: Venue | null;
  /** The booked (else most recently saved) venue's photos, for the backdrop. */
  venuePhotos?: VenuePhotos;
  /** False for someone invited with view-only access. */
  canEdit?: boolean;
  /** Extra pills beside "Edit details" -- the "Invite to plan" button. */
  heroActions?: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(!initialWedding);

  // "Add your date" on the next-step card links to #edit-details: open the
  // form, then drop the hash so the same link works again.
  useEffect(() => {
    function openFromHash() {
      if (window.location.hash !== "#edit-details") return;
      setIsEditing(true);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
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
          venuePhotos={venuePhotos}
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
