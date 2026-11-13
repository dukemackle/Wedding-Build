"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Venue, VenueArt, VenueArtStyle } from "@/lib/supabase/types";
import {
  TALL_ART_PROMPT,
  VENUE_ART_BUCKET,
  VENUE_ART_STYLES,
  venueArtFileName,
  wideArtPrompt,
  type VenueArtStyleDef,
} from "@/lib/venue-art";
import {
  approveVenueArt,
  createVenueArtUpload,
  deleteVenueArt,
  reopenVenueArt,
  saveVenueArtUpload,
  startVenueArt,
} from "./actions";

export type ArtRow = VenueArt & { wideUrl: string | null; tallUrl: string | null };
export type ArtVenue = Pick<
  Venue,
  "id" | "name" | "slug" | "city" | "state" | "photo_urls" | "photo_marketing_ok" | "photo_marketing_ok_at" | "photo_credit"
> & { art: ArtRow[] };

type Stage = "withdrawn" | "todo" | "draft" | "approved";

function stageOf(v: ArtVenue): Stage {
  if (!v.photo_marketing_ok) return "withdrawn";
  if (v.art.length === 0) return "todo";
  return v.art.some((a) => a.status === "draft") ? "draft" : "approved";
}

const GROUPS: { stage: Stage; title: string }[] = [
  { stage: "withdrawn", title: "Consent withdrawn: delete" },
  { stage: "todo", title: "Needs art" },
  { stage: "draft", title: "In progress" },
  { stage: "approved", title: "Approved" },
];

const place = (v: Pick<Venue, "city" | "state">) => [v.city, v.state].filter(Boolean).join(", ");
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

export function VenueArtManager({ venues }: { venues: ArtVenue[] }) {
  const ordered = useMemo(
    () => GROUPS.flatMap((g) => venues.filter((v) => stageOf(v) === g.stage).map((v) => ({ v, stage: g.stage }))),
    [venues],
  );
  const [selectedId, setSelectedId] = useState<string | null>(ordered[0]?.v.id ?? null);
  const selected = venues.find((v) => v.id === selectedId) ?? null;

  if (venues.length === 0) {
    return (
      <div className="rounded-lg border border-hairline bg-card p-8 text-center">
        <p className="font-medium text-ink">No venues to paint yet.</p>
        <p className="mt-1 text-sm text-ink/60">
          A venue appears here once it ticks &ldquo;Photos OK to feature&rdquo; on its claim form and the claim is
          approved.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      {/* Phone: one dropdown. Desktop: the grouped list beside the workspace. */}
      <label className="block lg:hidden">
        <span className="text-xs font-medium uppercase tracking-wide text-ink/50">Venue</span>
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mt-1 w-full rounded-md border border-hairline bg-card px-3 py-2.5 text-sm"
        >
          {GROUPS.map((g) => {
            const rows = ordered.filter((o) => o.stage === g.stage);
            return rows.length ? (
              <optgroup key={g.stage} label={g.title}>
                {rows.map(({ v }) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </optgroup>
            ) : null;
          })}
        </select>
      </label>

      <nav aria-label="Venues" className="hidden space-y-5 lg:sticky lg:top-6 lg:block">
        {GROUPS.map((g) => {
          const rows = ordered.filter((o) => o.stage === g.stage);
          if (!rows.length) return null;
          return (
            <section key={g.stage}>
              <h2
                className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${g.stage === "withdrawn" ? "text-red-700" : "text-ink/50"}`}
              >
                {g.title} <span className="font-mono-numbers font-normal">· {rows.length}</span>
              </h2>
              <ul className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-card">
                {rows.map(({ v }) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(v.id)}
                      aria-current={v.id === selectedId ? "true" : undefined}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-parchment focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-forest ${v.id === selectedId ? "bg-brass/10" : ""}`}
                    >
                      <Thumb src={v.photo_urls?.[0]} className="h-10 w-10" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{v.name}</span>
                        <span className="block truncate text-xs text-ink/55">
                          {place(v) || "No location"}
                          {v.art.length > 0 && ` · ${v.art.map((a) => styleLabel(a.style)).join(", ")}`}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </nav>

      {selected && <Workspace key={selected.id} venue={selected} />}
    </div>
  );
}

function styleLabel(id: VenueArtStyle) {
  return VENUE_ART_STYLES.find((s) => s.id === id)?.label ?? id;
}

function Thumb({ src, className = "" }: { src: string | null | undefined; className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded bg-parchment ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- listing photos come from many hosts
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
    </span>
  );
}

function Workspace({ venue }: { venue: ArtVenue }) {
  const router = useRouter();
  const withdrawn = !venue.photo_marketing_ok;
  const ready = VENUE_ART_STYLES.filter((s) => s.line);
  const [styleId, setStyleId] = useState<VenueArtStyle>(venue.art[0]?.style ?? ready[0].id);
  const style = VENUE_ART_STYLES.find((s) => s.id === styleId) as VenueArtStyleDef;
  const art = venue.art.find((a) => a.style === styleId) ?? null;
  const photos = venue.photo_urls ?? [];
  const [photo, setPhoto] = useState<string | null>(art?.source_photo_url ?? photos[0] ?? null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function pickStyle(id: VenueArtStyle) {
    setStyleId(id);
    const existing = venue.art.find((a) => a.style === id);
    setPhoto(existing?.source_photo_url ?? photos[0] ?? null);
    setMessage(null);
  }

  /** Makes sure a row exists for this style and photo; returns its id. */
  async function ensureArt(): Promise<string | null> {
    if (!photo) return null;
    if (art && art.source_photo_url === photo) return art.id;
    const res = await startVenueArt(venue.id, styleId, photo);
    if (res.error || !res.id) {
      setMessage({ kind: "error", text: res.error ?? "Couldn't save." });
      return null;
    }
    router.refresh();
    return res.id;
  }

  function copy(text: string, label: string) {
    startTransition(async () => {
      if (!(await ensureArt())) return;
      try {
        await navigator.clipboard.writeText(text);
        setMessage({ kind: "ok", text: `${label} copied. Paste it into ChatGPT.` });
      } catch {
        setMessage({ kind: "error", text: "Your browser blocked copying. Select the text below instead." });
      }
    });
  }

  function upload(size: "wide" | "tall", file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      setMessage(null);
      const id = await ensureArt();
      if (!id) return;
      const started = await createVenueArtUpload(id, size, { type: file.type, size: file.size });
      if (started.error || !started.upload) {
        setMessage({ kind: "error", text: started.error ?? "Couldn't upload." });
        return;
      }
      const { error } = await createClient()
        .storage.from(VENUE_ART_BUCKET)
        .uploadToSignedUrl(started.upload.path, started.upload.token, file, { contentType: file.type });
      if (error) {
        setMessage({ kind: "error", text: "The upload didn't finish. Try again." });
        return;
      }
      const saved = await saveVenueArtUpload(id, size, started.upload.path);
      if (saved.error) setMessage({ kind: "error", text: saved.error });
      else setMessage({ kind: "ok", text: `${size === "wide" ? "Wide" : "Tall"} version uploaded.` });
      router.refresh();
    });
  }

  function run(action: () => Promise<{ error?: string }>, done: string) {
    startTransition(async () => {
      const res = await action();
      setMessage(res.error ? { kind: "error", text: res.error } : { kind: "ok", text: done });
      router.refresh();
    });
  }

  const photoChanged = !!art && !!photo && art.source_photo_url !== photo;

  return (
    <div className="space-y-6" aria-busy={pending}>
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-hairline bg-card p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold text-forest">{venue.name}</h2>
          <p className="mt-0.5 text-sm text-ink/60">
            {place(venue) || "No location"}
            {venue.photo_credit && <> · Photo: {venue.photo_credit}</>}
            {day(venue.photo_marketing_ok_at) && <> · Consent {day(venue.photo_marketing_ok_at)}</>}
          </p>
        </div>
        <Link href={`/admin/venues/${venue.id}`} className="text-sm text-forest hover:underline">
          Open listing
        </Link>
      </header>

      {withdrawn ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-5">
          <p className="font-medium text-red-800">This venue withdrew its photo consent.</p>
          <p className="mt-1 text-sm text-red-800/80">
            Delete its art within 30 days of the withdrawal (Terms §6). Nothing here is shown to couples.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {venue.art.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => deleteVenueArt(a.id), "Deleted.")}
                  className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  Delete {styleLabel(a.style)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <Step n={1} title="Pick the photo" hint="The best shot of where they say “I do”, ideally with no people in it.">
            {photos.length === 0 ? (
              <p className="text-sm text-ink/60">This listing has no photos yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setPhoto(url)}
                    aria-pressed={photo === url}
                    aria-label={`Photo ${i + 1}`}
                    className={`relative aspect-[4/3] overflow-hidden rounded-md bg-parchment ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${photo === url ? "ring-2 ring-brass" : "opacity-80 hover:opacity-100"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- listing photos come from many hosts */}
                    <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            {photo && (
              <p className="mt-3 text-sm">
                <a href={photo} target="_blank" rel="noreferrer" className="text-forest hover:underline">
                  Open full size
                </a>
                <span className="text-ink/50"> and save it, then attach it in ChatGPT.</span>
              </p>
            )}
            {photoChanged && (
              <p className="mt-2 text-sm text-amber-800">
                Different from the photo this {style.label.toLowerCase()} art was painted from. Copying the prompt or
                uploading switches it and puts the art back to Draft.
              </p>
            )}
          </Step>

          <Step n={2} title="Pick a style" hint="Every venue in a style uses the same prompt, so they look like one artist’s set.">
            <div className="flex flex-wrap gap-2">
              {VENUE_ART_STYLES.map((s) => {
                const existing = venue.art.find((a) => a.style === s.id);
                const on = s.id === styleId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!s.line}
                    onClick={() => pickStyle(s.id)}
                    aria-pressed={on}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${on ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-ink hover:border-forest/40"}`}
                  >
                    {s.label}
                    {!s.line && <span className="ml-1 text-xs">· soon</span>}
                    {existing && (
                      <span className={`ml-1.5 text-xs ${on ? "text-parchment/75" : "text-ink/50"}`}>
                        · {existing.status === "approved" ? "approved" : "draft"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink/50">Suits {style.suits}.</p>
          </Step>

          <Step n={3} title="Copy into ChatGPT" hint="One chat per venue. Turn off ChatGPT’s “Improve the model for everyone” first.">
            <ol className="space-y-3 text-sm">
              <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button
                  type="button"
                  disabled={pending || !photo}
                  onClick={() => copy(wideArtPrompt(style), "Wide prompt")}
                  className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment disabled:opacity-60"
                >
                  Copy wide prompt
                </button>
                <span className="text-ink/60">Attach the photo, paste, send.</span>
              </li>
              <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button
                  type="button"
                  disabled={pending || !photo}
                  onClick={() => copy(TALL_ART_PROMPT, "Tall prompt")}
                  className="rounded-md border border-hairline bg-card px-4 py-2 text-sm font-medium text-forest hover:border-forest/40 disabled:opacity-60"
                >
                  Copy tall prompt
                </button>
                <span className="text-ink/60">Same chat, once you like the wide one.</span>
              </li>
            </ol>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-ink/60 hover:text-forest">Show the prompt</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-parchment p-3 font-sans text-xs leading-relaxed text-ink/75">
                {wideArtPrompt(style)}
                {"\n\nThen:\n"}
                {TALL_ART_PROMPT}
              </pre>
            </details>
          </Step>

          <Step
            n={4}
            title="Upload and compare"
            hint="Put each painting beside the photo. If anything was added, moved or lost, redo it in ChatGPT."
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
              <Figure label="Original photo" ratio="aspect-[3/2]" src={photo} className="md:col-span-2 xl:col-span-1" />
              <UploadSlot
                label="Wide · 1536×1024"
                ratio="aspect-[3/2]"
                src={art?.wideUrl ?? null}
                fileName={venueArtFileName(venue.slug, styleId, "wide")}
                disabled={pending || !photo}
                onFile={(f) => upload("wide", f)}
              />
              <UploadSlot
                label="Tall · 1024×1536"
                ratio="aspect-[2/3]"
                className="w-1/2 md:w-auto"
                src={art?.tallUrl ?? null}
                fileName={venueArtFileName(venue.slug, styleId, "tall")}
                disabled={pending || !photo}
                onFile={(f) => upload("tall", f)}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
              {art?.status === "approved" ? (
                <>
                  <span className="rounded-full bg-brass/15 px-3 py-1 text-sm font-medium text-forest">
                    Approved {day(art.approved_at)}
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => reopenVenueArt(art.id), "Back to draft.")}
                    className="text-sm text-ink/60 hover:text-forest"
                  >
                    Redo
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={pending || !art?.wide_path || !art?.tall_path || photoChanged}
                  onClick={() => art && run(() => approveVenueArt(art.id), "Approved.")}
                  className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment disabled:opacity-50"
                >
                  Approve {style.label.toLowerCase()}
                </button>
              )}
              {art && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Delete the ${style.label.toLowerCase()} art for ${venue.name}?`))
                      run(() => deleteVenueArt(art.id), "Deleted.");
                  }}
                  className="ml-auto text-sm text-ink/40 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </Step>
        </>
      )}

      <p aria-live="polite" className={`min-h-5 text-sm ${message?.kind === "error" ? "text-red-700" : "text-ink/60"}`}>
        {pending ? "Working…" : message?.text}
      </p>
    </div>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-hairline bg-card p-4 sm:p-5">
      <div className="mb-3 flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest font-mono-numbers text-xs font-semibold text-parchment">
          {n}
        </span>
        <div>
          <h3 className="font-medium text-ink">{title}</h3>
          <p className="text-sm text-ink/55">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Figure({
  label,
  ratio,
  src,
  className = "",
}: {
  label: string;
  ratio: string;
  src: string | null;
  className?: string;
}) {
  return (
    <figure className={className}>
      <figcaption className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink/50">{label}</figcaption>
      <div className={`relative overflow-hidden rounded-md bg-parchment ${ratio}`}>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element -- listing photos come from many hosts
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
    </figure>
  );
}

function UploadSlot({
  label,
  ratio,
  src,
  fileName,
  disabled,
  onFile,
  className = "",
}: {
  className?: string;
  label: string;
  ratio: string;
  src: string | null;
  fileName: string;
  disabled: boolean;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <figure className={className}>
      <figcaption className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink/50">{label}</figcaption>
      <label
        className={`group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-ink/20 bg-parchment/60 focus-within:ring-2 focus-within:ring-forest hover:border-forest/50 ${ratio} ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- signed URL from the private bucket */}
            <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-forest opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              Replace
            </span>
          </>
        ) : (
          <span className="px-3 text-center text-sm text-ink/55">
            <span className="block font-medium text-forest">Upload</span>
            <span className="block text-xs">PNG, WebP or JPEG</span>
          </span>
        )}
        <input
          type="file"
          accept="image/png,image/webp,image/jpeg"
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      <p className="mt-1 truncate text-xs text-ink/45" title={fileName}>
        {fileName}
      </p>
    </figure>
  );
}
