"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { openRsvpsNow, saveTheDatePhotoUrl, startSaveTheDatePhotoUpload } from "@/app/guests/save-the-date/actions";
import { rsvpNotOpenYet } from "@/lib/rsvp-opening";
import { shrinkImage } from "@/lib/shrink-image";
import { putToSignedUrl } from "@/lib/signed-upload";
import { CardSvg, layerBox } from "./card-svg";
import { CardToolbar } from "./card-toolbar";
import { Reveal } from "./reveal";
import { FONTS, contrast, fontById } from "@/lib/site-design";
import { FONTS_HREF } from "@/lib/save-the-date/fonts";
import { cardPdf, cardPng, saveBlob } from "@/lib/save-the-date/export";
import { CUSTOM_PALETTE, FAMILIES, SHORT, TEMPLATES, cardPalette, keepColours, newCard, templateById } from "@/lib/save-the-date/templates";
import type { CardColours, CardContent, CardDoc, LayerOverride, Photo } from "@/lib/save-the-date/types";

export { FONTS_HREF };

// ---------------------------------------------------------------- history

type History = { past: CardDoc[]; present: CardDoc; future: CardDoc[]; key: string | null; at: number };
type Action =
  | { type: "set"; doc: CardDoc; key?: string }
  /** Fills in something the card was missing (a photo's proportions) without an undo step. */
  | { type: "fill"; doc: CardDoc }
  | { type: "undo" }
  | { type: "redo" };

/** Typing in one field within a second is one undo step, not one per letter. */
function reducer(h: History, a: Action): History {
  if (a.type === "undo") {
    if (!h.past.length) return h;
    return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], key: null, at: 0 };
  }
  if (a.type === "fill") return { ...h, present: a.doc };
  if (a.type === "redo") {
    if (!h.future.length) return h;
    return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), key: null, at: 0 };
  }
  const now = Date.now();
  const merge = a.key && a.key === h.key && now - h.at < 1000;
  return {
    past: merge ? h.past : [...h.past, h.present].slice(-80),
    present: a.doc,
    future: [],
    key: a.key ?? null,
    at: now,
  };
}

// ---------------------------------------------------------------- small UI

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-b border-hairline px-5 py-5 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <ToolIcon name={title} className="h-[18px] w-[18px] text-[#2243B6]" />
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * A desktop settings section that folds shut to its title and what's chosen,
 * so the whole list of settings fits on screen. One is open at a time.
 */
function Fold({ title, summary, open, onToggle, children }: { title: string; summary?: ReactNode; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="border-b border-hairline">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#2243B6]/[0.03]">
        <ToolIcon name={title} className="h-5 w-5 shrink-0 text-[#2243B6]" />
        <span className="text-[15px] font-semibold text-ink">{title}</span>
        {!open && summary && <span className="ml-auto flex min-w-0 items-center gap-2 truncate text-sm text-ink/75">{summary}</span>}
        <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 text-ink/60 transition-transform ${open ? "ml-auto rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink/80">{label}</span>
      {children}
    </label>
  );
}

const input =
  "w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition focus:border-[#2243B6] focus:ring-2 focus:ring-[#2243B6]/15";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-3 text-[13px] font-medium text-ink/80">
      <span className="w-16 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-8 w-full accent-[#2243B6]" />
    </label>
  );
}

function IconButton({ label, onClick, disabled, showLabel, children }: { label: string; onClick: () => void; disabled?: boolean; showLabel?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-30 ${showLabel ? "lg:px-3" : ""}`}
    >
      {children}
      {showLabel && <span className="hidden text-sm font-medium lg:inline">{label}</span>}
    </button>
  );
}

const UndoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
  </svg>
);
const RedoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
  </svg>
);

/** Small line icons for section headings and the phone's tool bar. */
const ICON_PATHS: Record<string, string> = {
  designs: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  details: "M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4",
  colours: "M12 3a9 9 0 100 18c1 0 1.6-.8 1.6-1.7 0-1.2-1-1.6-1-2.6 0-.9.8-1.7 1.7-1.7H17a4 4 0 004-4C21 6.6 17 3 12 3zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01",
  lettering: "M4 19l5-14 5 14M5.8 14h6.4M15 15.5c0-1.8 1.4-2.5 3-2.5h2v6M20 15c0 2-1.3 4-3 4-1.2 0-2-.7-2-1.8",
  photo: "M4 6h16v13H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01",
  layers: "M12 4l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  back: "M9 3h10v14H9zM5 7v12a2 2 0 002 2h9M12 8h4M12 11h4",
};
const ICON_FOR: Record<string, string> = {
  templates: "designs", designs: "designs", "your details": "details", details: "details",
  style: "colours", colours: "colours", lettering: "lettering", photo: "photo", layers: "layers", download: "download", "back of the card": "back",
};
function ToolIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const d = ICON_PATHS[ICON_FOR[name.toLowerCase()] ?? name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

// ---------------------------------------------------------------- panels

type Panel = "templates" | "details" | "style" | "photo" | "layers" | "download";
/** The desktop settings sections, which fold. */
type FoldId = "designs" | "details" | "back" | "colours" | "lettering" | "photo" | "layers";
const FOLDS: FoldId[] = ["details", "back", "colours", "lettering", "photo", "layers"];

function TemplatePicker({ doc, choose, row }: { doc: CardDoc; choose: (id: string) => void; row?: boolean }) {
  const [family, setFamily] = useState<string | null>(null);
  const shown = family ? TEMPLATES.filter((t) => t.family === family) : TEMPLATES;
  const chip = (label: string, value: string | null) => (
    <button
      key={label}
      type="button"
      onClick={() => setFamily(value)}
      aria-pressed={family === value}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${family === value ? "border-[#2243B6] bg-[#2243B6] text-white shadow-sm" : "border-ink/15 bg-white text-ink/80 hover:border-[#2243B6]/50 hover:text-[#2243B6]"}`}
    >
      {label}
    </button>
  );
  return (
    <div>
      <div className={`mb-3 flex gap-1.5 ${row ? "-mx-5 overflow-x-auto px-5 pb-1" : "flex-wrap"}`} role="group" aria-label="Filter designs by style">
        {chip("All", null)}
        {FAMILIES.map((f) => chip(SHORT[f] ?? f, f))}
      </div>
      <div className={row ? "-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1" : "grid grid-cols-2 gap-3"}>
        {shown.map((t) => {
          // Photo designs show a sample photo until the couple adds theirs, so it's
          // clear which ones take one. Choosing one doesn't carry the sample over.
          const preview: CardDoc = keepColours({ ...newCard(t.id, doc.content, doc.photo, true), overrides: {} }, doc);
          const active = t.id === doc.template;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => choose(t.id)}
              className={`group snap-start text-left ${row ? "w-[104px] shrink-0" : ""}`}
              aria-pressed={active}
            >
              <span
                className={`block overflow-hidden rounded-md ring-offset-2 transition ${active ? "ring-2 ring-[#2243B6]" : "ring-1 ring-ink/10 group-hover:ring-ink/30"}`}
              >
                <CardSvg doc={preview} className="block w-full" title={`${t.name} template`} />
              </span>
              <span className="mt-1.5 block text-[13px] font-medium text-ink">{t.name}</span>
              <span className="block text-[11px] text-ink/55">{t.family}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The printed card's back (website, QR code, travel line). Off by default:
 * most couples who only send online don't need one.
 */
function BackPanel({
  doc,
  site,
  patch,
  show,
  rsvpOpensOn,
}: {
  doc: CardDoc;
  site: string | null;
  patch: (p: Partial<CardDoc>, key?: string) => void;
  show: (side: "front" | "back") => void;
  /** The wedding's RSVP opening day (null = open now); undefined in the prototype, where nothing is saved. */
  rsvpOpensOn?: string | null;
}) {
  const back = doc.back ?? { on: false, travel: "" };
  const [opensOn, setOpensOn] = useState(rsvpOpensOn);
  const [rsvpNote, setRsvpNote] = useState<string | null>(null);
  const closed = rsvpNotOpenYet(opensOn);
  const askRsvp = async (on: boolean) => {
    patch({ back: { ...back, rsvp: on } });
    setRsvpNote(null);
    if (on && back.on) show("back");
    // Asking for replies on the card opens them on the site, or the code would land on "not open yet".
    if (on && closed && opensOn !== undefined) {
      const res = await openRsvpsNow();
      if (res.error) setRsvpNote(res.error);
      else setOpensOn(null);
    }
  };
  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#2243B6]"
          checked={back.on}
          onChange={(e) => {
            patch({ back: { ...back, on: e.target.checked } });
            show(e.target.checked ? "back" : "front");
          }}
        />
        <span className="text-[15px] leading-snug text-ink">
          Add a back for printing
          <span className="mt-0.5 block text-xs text-ink/55">Your website and a QR code to it, in this design&apos;s colours. Guests online can turn the card over.</span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#2243B6]"
          checked={Boolean(back.rsvp)}
          onChange={(e) => askRsvp(e.target.checked)}
        />
        <span className="text-[15px] leading-snug text-ink">
          Ask guests to RSVP now
          <span className="mt-0.5 block text-xs text-ink/55">
            The QR code and the online card&apos;s button go straight to your RSVP form. Your invitation can follow as the formal one.
          </span>
        </span>
      </label>
      {rsvpNote ? (
        <p className="rounded-lg bg-[#FFF12F]/25 px-3 py-2.5 text-xs leading-relaxed text-ink">{rsvpNote}</p>
      ) : back.rsvp && site && opensOn !== undefined ? (
        <p className="rounded-lg bg-[#2243B6]/[0.06] px-3 py-2.5 text-xs leading-relaxed text-ink">
          RSVPs are open on your website. Replies land in{" "}
          <a href="/guests#invitations" className="font-medium text-[#2243B6] underline">Guests › Invitations &amp; RSVPs</a>.
        </p>
      ) : !back.rsvp && closed && opensOn ? (
        <p className="text-xs leading-relaxed text-ink/60">
          RSVPs open on your website on {new Date(`${opensOn}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}, so the code shows your travel and stays until then.
        </p>
      ) : null}
      {back.on && (
        <>
          {!site && (
            <p className="rounded-lg bg-[#FFF12F]/25 px-3 py-2.5 text-xs leading-relaxed text-ink">
              Your website isn&apos;t on yet, so the code has nowhere to go. Turn it on in{" "}
              <a href="/guests/site" className="font-medium text-[#2243B6] underline">Guests › Website</a>; until then the PDF prints the front only.
            </p>
          )}
          <Field label="Travel line (optional)">
            <input
              className={input}
              maxLength={90}
              placeholder="e.g. Rooms held at the Hotel Californian until May 1"
              value={back.travel}
              onChange={(e) => patch({ back: { ...back, travel: e.target.value } }, "back-travel")}
            />
          </Field>
        </>
      )}
    </div>
  );
}

function DetailsPanel({ c, set }: { c: CardContent; set: (patch: Partial<CardContent>, key: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="First name">
          <input className={input} value={c.nameA} onChange={(e) => set({ nameA: e.target.value }, "nameA")} />
        </Field>
        <Field label="Second name">
          <input className={input} value={c.nameB} onChange={(e) => set({ nameB: e.target.value }, "nameB")} />
        </Field>
      </div>
      <Field label="Wedding date">
        <input type="date" className={input} value={c.date ?? ""} onChange={(e) => set({ date: e.target.value || null }, "date")} />
      </Field>
      <Field label="Or write the date your way">
        <input className={input} placeholder="e.g. Summer 2028, or 12–14 June 2028" value={c.dateText} onChange={(e) => set({ dateText: e.target.value }, "dateText")} />
      </Field>
      <Field label="Where">
        <input className={input} value={c.place} onChange={(e) => set({ place: e.target.value }, "place")} />
      </Field>
      <Field label="Closing line">
        <input className={input} value={c.note} onChange={(e) => set({ note: e.target.value }, "note")} />
      </Field>
    </div>
  );
}

const COLOUR_FIELDS: { key: keyof CardColours; label: string }[] = [
  { key: "paper", label: "Background" },
  { key: "ink", label: "Lettering" },
  { key: "accent", label: "Accent" },
];

function ColoursPicker({ doc, patch }: { doc: CardDoc; patch: (p: Partial<CardDoc>, key?: string) => void }) {
  const t = templateById(doc.template);
  const custom = doc.palette === CUSTOM_PALETTE && !!doc.colours;
  const ring = (active: boolean) => `flex h-14 w-14 items-center justify-center rounded-full ring-offset-2 transition ${active ? "ring-2 ring-[#2243B6]" : "ring-1 ring-ink/15"}`;
  // First time in: start from the colourway on screen, so the card doesn't jump.
  const useOwn = () => {
    const now = cardPalette(doc);
    patch({ palette: CUSTOM_PALETTE, colours: doc.colours ?? { paper: now.paper, ink: now.ink, accent: now.metal ? now.metal[1] : now.accent } });
  };
  const own = doc.colours;
  const hard = custom && own && contrast(own.ink, own.paper) < 3;
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {t.palettes.map((p) => {
          const active = !custom && p.id === doc.palette;
          return (
            <button key={p.id} type="button" onClick={() => patch({ palette: p.id })} className="text-center" aria-pressed={active}>
              <span className={ring(active)} style={{ background: p.paper }}>
                <span className="h-6 w-6 rounded-full" style={{ background: p.metal ? `linear-gradient(135deg, ${p.metal[0]}, ${p.metal[2]})` : p.accent }} />
                <span className="-ml-2 h-6 w-6 rounded-full border-2" style={{ background: p.ink, borderColor: p.paper }} />
              </span>
              <span className="mt-1.5 block text-xs font-medium text-ink/80">{p.label}</span>
            </button>
          );
        })}
        <button type="button" onClick={useOwn} className="text-center" aria-pressed={custom}>
          <span className={ring(custom)} style={{ background: own ? own.paper : "conic-gradient(#2243B6, #00BFFE, #5AE4FF, #FFF12F, #FFD301, #2243B6)" }}>
            {own ? (
              <>
                <span className="h-6 w-6 rounded-full" style={{ background: own.accent }} />
                <span className="-ml-2 h-6 w-6 rounded-full border-2" style={{ background: own.ink, borderColor: own.paper }} />
              </>
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg leading-none text-[#14203d] shadow-sm">+</span>
            )}
          </span>
          <span className="mt-1.5 block text-xs font-medium text-ink/80">Your colours</span>
        </button>
      </div>
      {custom && own && (
        <div className="mt-4 space-y-2 rounded-xl border border-hairline bg-white p-3">
          <p className="text-xs text-ink/70">Match your wedding colours. They stay with you if you change design.</p>
          {COLOUR_FIELDS.map((f) => (
            <label key={f.key} className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1 hover:bg-ink/[0.03]">
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-ink/20" style={{ background: own[f.key] }}>
                <input
                  type="color"
                  value={own[f.key]}
                  onChange={(e) => patch({ colours: { ...own, [f.key]: e.target.value } }, `colour-${f.key}`)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`${f.label} colour`}
                />
              </span>
              <span className="flex-1 text-sm font-medium text-ink">{f.label}</span>
              <span className="font-mono text-xs uppercase text-ink/55">{own[f.key]}</span>
            </label>
          ))}
          {hard && <p className="text-xs text-[#9a6b00]">Your lettering may be hard to read on this background. Try a darker or lighter shade.</p>}
        </div>
      )}
    </div>
  );
}

/** A folded Colours heading: the three colours in use, then their name. */
function PaletteSummary({ doc }: { doc: CardDoc }) {
  const p = cardPalette(doc);
  return (
    <>
      <span className="flex shrink-0">
        {[p.paper, p.ink, p.metal ? p.metal[1] : p.accent].map((c, i) => (
          <span key={i} className={`h-4 w-4 rounded-full ring-1 ring-ink/20 ${i ? "-ml-1" : ""}`} style={{ background: c }} />
        ))}
      </span>
      <span className="truncate">{p.label}</span>
    </>
  );
}

/** A folded Lettering heading: "Aa" in the chosen face, then its name. */
function LetteringSummary({ doc }: { doc: CardDoc }) {
  const t = templateById(doc.template);
  const p = t.pairings.find((x) => x.id === doc.fonts) ?? t.pairings[0];
  return (
    <>
      <span className="text-lg leading-none text-ink" style={{ fontFamily: fontById(p.display)?.css }}>Aa</span>
      <span className="truncate">{p.label}</span>
    </>
  );
}

function LetteringPicker({ doc, patch }: { doc: CardDoc; patch: (p: Partial<CardDoc>, key?: string) => void }) {
  const t = templateById(doc.template);
  return (
    <div className="space-y-2">
      {t.pairings.map((p) => {
        const active = p.id === doc.fonts;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => patch({ fonts: p.id })}
            aria-pressed={active}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${active ? "border-[#2243B6] bg-[#2243B6]/[0.04]" : "border-hairline hover:border-ink/25"}`}
          >
            <span>
              <span className="block text-[22px] leading-tight text-ink" style={{ fontFamily: fontById(p.display)?.css }}>
                {doc.content.nameA || "Alex"}{" "}
                <span style={{ fontFamily: fontById(p.script)?.css }}>&amp;</span>
              </span>
              <span className="mt-0.5 block text-[11px] uppercase tracking-[0.22em] text-ink/70" style={{ fontFamily: fontById(p.sans)?.css }}>
                {p.label}
              </span>
            </span>
            {active && <span className="text-xs font-medium text-[#2243B6]">In use</span>}
          </button>
        );
      })}
    </div>
  );
}

/** The phone's Style sheet: colours and lettering together. */
function StylePanel({ doc, patch }: { doc: CardDoc; patch: (p: Partial<CardDoc>, key?: string) => void }) {
  return (
    <>
      <Section title="Colours">
        <ColoursPicker doc={doc} patch={patch} />
      </Section>
      <Section title="Lettering">
        <LetteringPicker doc={doc} patch={patch} />
      </Section>
    </>
  );
}

/** A picture's width / height, read by loading it. */
function measure(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight || 1.5);
    img.onerror = () => reject(new Error("That photo couldn't be opened."));
    img.src = url;
  });
}

/** Shrinks a photo in the browser and puts it straight into Storage; returns its public URL. */
async function uploadCardPhoto(file: File): Promise<string> {
  const ready = await shrinkImage(file);
  const started = await startSaveTheDatePhotoUpload(ready.name);
  if (!started.path || !started.signedUrl) throw new Error(started.error ?? "Couldn't upload that photo.");
  await putToSignedUrl(started.signedUrl, ready);
  const done = await saveTheDatePhotoUrl(started.path);
  if (!done.url) throw new Error(done.error ?? "Couldn't upload that photo.");
  return done.url;
}

function PhotoPanel({
  photo,
  set,
  library,
  persist,
}: {
  photo: Photo | null;
  set: (p: Photo | null, key?: string) => void;
  /** Photos the couple already has: banner, dashboard, gallery. */
  library: string[];
  /** Uploads go to Storage (a real card) rather than staying in this tab (the prototype). */
  persist: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const choose = async (url: string) => {
    setError(null);
    try {
      const aspect = await measure(url);
      set({ url, aspect, fx: 50, fy: 50, zoom: 1, filter: photo?.filter ?? "none" });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const pick = async (f: File) => {
    setBusy(true);
    setError(null);
    try {
      await choose(persist ? await uploadCardPhoto(f) : URL.createObjectURL(f));
    } catch (e) {
      setError(e instanceof Error && e.message !== "too large" ? e.message : "That photo is too large. Try one under 6MB.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };
  return (
    <div className="space-y-4">
      {library.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-ink/70">Your photos</p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {library.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => choose(url)}
                aria-label="Use this photo"
                aria-pressed={photo?.url === url}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-md ring-offset-2 ${photo?.url === url ? "ring-2 ring-[#2243B6]" : "ring-1 ring-ink/10 hover:ring-ink/30"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a thumbnail of the couple's own Storage photo */}
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => file.current?.click()}
          disabled={busy}
          className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Uploading…" : photo ? "Upload another" : "Upload a photo"}
        </button>
        {photo && (
          <button type="button" onClick={() => set(null)} className="rounded-full border border-hairline px-4 py-2.5 text-sm text-ink">
            Remove
          </button>
        )}
        <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
      </div>
      {error && <p className="text-sm text-[#b42318]">{error}</p>}
      {photo && (
        <>
          <div className="space-y-1">
            <Slider label="Left–right" value={photo.fx} min={0} max={100} step={1} onChange={(fx) => set({ ...photo, fx }, "fx")} />
            <Slider label="Up–down" value={photo.fy} min={0} max={100} step={1} onChange={(fy) => set({ ...photo, fy }, "fy")} />
            <Slider label="Zoom" value={photo.zoom} min={1} max={2.5} step={0.01} onChange={(zoom) => set({ ...photo, zoom }, "zoom")} />
          </div>
          <div className="flex gap-2">
            {(["none", "mono", "warm"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => set({ ...photo, filter: f })}
                aria-pressed={photo.filter === f}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition ${photo.filter === f ? "border-[#2243B6] bg-[#2243B6]/[0.06] text-[#2243B6]" : "border-hairline text-ink/80"}`}
              >
                {f === "none" ? "Colour" : f === "mono" ? "Black & white" : "Warm"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LayersPanel({
  doc,
  selected,
  select,
  override,
}: {
  doc: CardDoc;
  selected: string | null;
  select: (id: string | null) => void;
  override: (id: string, o: LayerOverride | null, key?: string) => void;
}) {
  const t = templateById(doc.template);
  return (
    <div className="space-y-5">
      <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-white">
        {[...t.layers].reverse().map((l) => {
          const hidden = doc.overrides[l.id]?.hidden;
          return (
            <li key={l.id} className={`flex items-center ${l.id === selected ? "bg-[#2243B6]/[0.05]" : ""}`}>
              <button type="button" onClick={() => select(l.id)} className={`flex-1 px-4 py-2.5 text-left text-sm ${hidden ? "text-ink/35 line-through" : "text-ink"}`}>
                {l.label}
                <span className="ml-2 text-[11px] text-ink/40">{l.kind === "text" ? "Text" : l.kind === "photo" ? "Photo" : "Art"}</span>
              </button>
              <button
                type="button"
                onClick={() => override(l.id, { ...doc.overrides[l.id], hidden: !hidden })}
                className="px-4 py-2.5 text-xs text-ink/60 hover:text-ink"
              >
                {hidden ? "Show" : "Hide"}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-relaxed text-ink/55">
        Drag anything on the card to move it; it snaps to the centre and to the other pieces (hold ⌥ to stop it snapping). Click something to style it, double-click words to
        retype them. Arrow keys nudge, ⌘Z undoes.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- studio


type SaveState = "saved" | "pending" | "saving" | "error" | "stale";

/** Which side the card area shows. "both" is desktop only: a phone shows the front. */
type Side = "front" | "back" | "both";

type StudioProps = {
  initial: CardDoc;
  /** The saved row's updated_at; null before the first save. */
  version?: string | null;
  /** Autosave to the couple's card. Off for the prototype, where nothing is kept. */
  persist?: boolean;
  /** Photos the couple already has, offered in the Photo panel. */
  photos?: string[];
  backHref?: string;
  /** The back link's word on desktop. */
  backLabel?: string;
  /** Prototype screenshots open on a panel or mode ("advanced", "preview", "mobile-style"). */
  view?: string;
  /** Shown in place of the save status when nothing is saved (the prototype, a view-only partner). */
  note?: string;
  /** Where Send goes (the couple's real card only). */
  sendHref?: string;
  /** The heading in the top bar: the design's name on a couple's card. */
  title?: string;
  /** The saved card's id, for autosave (the couple's real card only). */
  cardId?: string;
  /** The wedding website as printed on the back (youdoido.com/w/…); null while it's off. */
  site?: string | null;
  /** The wedding's RSVP opening day (null = open now); left out in the prototype. */
  rsvpOpensOn?: string | null;
};

/**
 * The Save the Date Studio: designs on the left, the card in the middle,
 * settings on the right (a tool bar and sheets on a phone). See
 * docs/save-the-date-studio.md.
 */
/** The two downloads and how to get the card printed: the desktop menu and the phone sheet. */
function DownloadOptions({ download, sheet, back }: { download: (kind: "png" | "pdf") => void; sheet?: boolean; back?: "on" | "nosite" | "back-shown" | null }) {
  const item = sheet
    ? "block w-full rounded-xl border border-hairline px-4 py-3 text-left text-[15px] hover:bg-ink/5"
    : "block w-full px-4 py-2.5 text-left text-sm hover:bg-ink/5";
  return (
    <div className={sheet ? "space-y-2" : ""}>
      <button type="button" onClick={() => download("png")} className={item}>
        PNG image<span className="block text-xs text-ink/50">3000 × 4200, for texting or posting{back === "back-shown" ? " (the back, as shown)" : ""}</span>
      </button>
      <button type="button" onClick={() => download("pdf")} className={item}>
        PDF for printing
        <span className="block text-xs text-ink/50">
          5 × 7 in at 600 dpi, with ⅛ in bleed
          {back === "on" || back === "back-shown" ? ". Two pages: front, then back" : back === "nosite" ? ". Front only until your website is on" : ""}
        </span>
      </button>
      <div className={`${sheet ? "" : "mx-3 mb-2 mt-1"} rounded-lg bg-parchment px-3 py-2.5 text-xs leading-relaxed text-ink/70`}>
        <p className="font-medium text-ink">Printing it</p>
        <p className="mt-1">
          Take the PDF to any print shop (FedEx Office, Staples or a local printer) and ask for 5 × 7 on
          matte cardstock, 110–130 lb, trimmed to size{back === "on" || back === "back-shown" ? ", printed double-sided" : ""}.
        </p>
        <p className="mt-1">Order one per household plus about ten spares. A7 envelopes fit.</p>
      </div>
    </div>
  );
}

export function SaveTheDateStudio({ initial, version: savedVersion = null, persist = false, photos = [], backHref = "/guests", backLabel = "Guests", view = "", note = "Prototype · nothing is saved", sendHref, cardId, title = "Save the date", site = null, rsvpOpensOn }: StudioProps) {
  const [h, dispatch] = useReducer(reducer, null, () => ({
    past: [],
    present: initial,
    future: [],
    key: null,
    at: 0,
  }));
  const doc = h.present;
  const t = templateById(doc.template);
  const [selected, setSelected] = useState<string | null>(view === "advanced" ? "names" : null);
  const [panel, setPanel] = useState<Panel | null>(view === "mobile-style" ? "style" : null);
  const [fold, setFold] = useState<FoldId | null>("details");
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<"phone" | "desktop" | null>(view === "preview" ? "phone" : null);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const backSvg = useRef<SVGSVGElement | null>(null);
  const [side, setSide] = useState<Side>(view === "back" ? "back" : view === "both" ? "both" : "front");

  // Autosave: a change marks the card unsaved; 900ms after the last change it
  // goes to /api/save-the-date. Saves run one after another so each carries
  // the version the previous one returned.
  const [save, setSave] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const version = useRef(savedVersion);
  const lastSaved = useRef(initial);
  const stale = useRef(false);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const commit = (a: Action) => {
    dispatch(a);
    if (persist && !stale.current) setSave("pending");
  };
  useEffect(() => {
    if (!persist || doc === lastSaved.current || stale.current) return;
    const timer = setTimeout(() => {
      chain.current = chain.current.then(async () => {
        if (stale.current) return;
        setSave("saving");
        try {
          const res = await fetch("/api/save-the-date", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: cardId, doc, version: version.current }),
          });
          const out: { error?: string; stale?: boolean; version?: string } = await res.json();
          if (out.version) {
            version.current = out.version;
            lastSaved.current = doc;
            setSave("saved");
            setSaveError(null);
          } else {
            stale.current = Boolean(out.stale);
            setSave(out.stale ? "stale" : "error");
            setSaveError(out.error ?? "Couldn't save your card.");
          }
        } catch {
          setSave("error");
          setSaveError("Couldn't save. Check your connection; we'll try again with your next change.");
        }
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [doc, persist, cardId]);
  // Leaving with changes not yet saved asks first.
  useEffect(() => {
    if (!persist || save === "saved") return;
    const warn = (ev: BeforeUnloadEvent) => ev.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [persist, save]);
  // A starting photo from the wedding comes without its proportions (aspect 0): read them here.
  useEffect(() => {
    const p = initial.photo;
    if (!p || p.aspect > 0) return;
    measure(p.url)
      .then((aspect) => dispatch({ type: "fill", doc: { ...initial, photo: { ...p, aspect } } }))
      .catch(() => dispatch({ type: "fill", doc: { ...initial, photo: null } }));
  }, [initial]);

  // Coming back to a card opens the settings section that was open last time
  // (this browser only). The card itself is saved above.
  const foldKey = `std-studio-fold:${cardId ?? "prototype"}`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(foldKey) as FoldId | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage only exists in the browser, after hydration
      if (saved && FOLDS.includes(saved)) setFold(saved);
    } catch {}
  }, [foldKey]);
  // A remembered Photo section on a design without one opens Your details instead.
  const shownFold: FoldId | null = fold === "photo" && !t.usesPhoto ? "details" : fold;
  const openFold = (f: FoldId) => {
    const next = shownFold === f ? null : f;
    setFold(next);
    try {
      // Designs only folds on narrower desktops (it has its own column on wide
      // ones), so it isn't what the studio reopens on.
      if (next && next !== "designs") localStorage.setItem(foldKey, next);
      else if (!next) localStorage.removeItem(foldKey);
    } catch {}
  };
  /** The empty photo frame's button: the Photo section on desktop, the Photo sheet on a phone. */
  const addPhoto = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      if (shownFold !== "photo") openFold("photo");
    } else {
      setSelected(null);
      setPanel("photo");
    }
  };

  const status = !persist
    ? note
    : save === "saved"
      ? "Saved"
      : save === "saving"
        ? "Saving…"
        : save === "pending"
          ? "Unsaved changes"
          : "Not saved";

  const patch = (p: Partial<CardDoc>, key?: string) => commit({ type: "set", doc: { ...doc, ...p }, key });
  const setContent = (c: Partial<CardContent>, key: string) => patch({ content: { ...doc.content, ...c } }, key);
  const override = (id: string, o: LayerOverride | null, key?: string) => {
    const next = { ...doc.overrides };
    if (o) next[id] = o;
    else delete next[id];
    patch({ overrides: next }, key);
  };
  const pick = (id: string | null) => {
    if (id && side === "back") setSide("front");
    setSelected(id);
    setEditing(false);
    if (id) setPanel(null);
  };
  const shownLayers = doc.photo || !t.noPhotoLayers ? t.layers : t.noPhotoLayers;
  const picked = shownLayers.find((l) => l.id === selected && !doc.overrides[l.id]?.hidden) ?? null;
  const centre = () => {
    if (!picked || !svg.current) return;
    const o = doc.overrides[picked.id] ?? {};
    const b = layerBox(svg.current, picked, o);
    if (b) override(picked.id, { ...o, dx: (o.dx ?? 0) + 500 - (b.x + b.w / 2) });
  };
  const toolbar = picked && (
    <CardToolbar
      key={picked.id}
      doc={doc}
      layer={picked}
      editing={editing}
      setEditing={setEditing}
      override={(o, key) => override(picked.id, o, key)}
      setContent={setContent}
      centre={centre}
      onDone={() => pick(null)}
    />
  );
  const choose = (id: string) => {
    const fresh = keepColours(newCard(id, doc.content, doc.photo, !persist), doc);
    commit({ type: "set", doc: { ...fresh, back: doc.back } });
    setSelected(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        commit({ type: e.shiftKey ? "redo" : "undo" });
      }
      if (!selected || typing) return;
      const step = e.shiftKey ? 30 : 6;
      const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (move[e.key]) {
        e.preventDefault();
        const o = doc.overrides[selected] ?? {};
        override(selected, { ...o, dx: (o.dx ?? 0) + move[e.key][0], dy: (o.dy ?? 0) + move[e.key][1] }, `nudge-${selected}`);
      }
      if (e.key === "Escape") pick(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const withBack = Boolean(doc.back?.on);
  const printsBack = withBack && Boolean(site);
  const download = async (kind: "png" | "pdf") => {
    if (!svg.current) return;
    setMenu(false);
    setBusy(kind === "png" ? "Making your PNG…" : "Making your PDF…");
    try {
      const name = `save-the-date-${doc.content.nameA}-${doc.content.nameB}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      // The PNG is the side on screen; the PDF is both sides once the back has a website to point to.
      const pngBack = side === "back" && withBack && backSvg.current;
      const pages = printsBack && backSvg.current ? [svg.current, backSvg.current] : [svg.current];
      saveBlob(
        kind === "png" ? await cardPng(pngBack ? backSvg.current! : svg.current) : await cardPdf(...pages),
        `${name}${kind === "png" && pngBack ? "-back" : ""}.${kind}`,
      );
    } finally {
      setBusy(null);
    }
  };

  const backState = !withBack ? null : !site ? "nosite" : side === "back" ? "back-shown" : "on";
  const showBack = (s: Side) => {
    setSide(s);
    if (s === "back") pick(null);
  };
  const both = withBack && side === "both";
  /** The back's settings, from a click on the back itself. */
  const backSettings = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      if (shownFold !== "back") openFold("back");
    } else setPanel("details");
  };

  // Desktop offers Both; a phone is too narrow for two cards.
  const sideSwitch = (sides: Side[]) => (
    <div className="inline-flex rounded-full border border-hairline bg-white p-1 text-[13px] shadow-sm" role="group" aria-label="Side of the card">
      {sides.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => showBack(s)}
          aria-pressed={side === s || (s === "front" && side === "both" && !sides.includes("both"))}
          className={`rounded-full px-4 py-1.5 capitalize ${side === s || (s === "front" && side === "both" && !sides.includes("both")) ? "bg-ink text-white" : "text-ink/70 hover:text-ink"}`}
        >
          {s}
        </button>
      ))}
    </div>
  );

  const panels: { id: Panel; label: string }[] = [
    { id: "templates", label: "Designs" },
    { id: "details", label: "Details" },
    { id: "style", label: "Style" },
    ...(t.usesPhoto ? [{ id: "photo" as const, label: "Photo" }] : []),
    { id: "layers", label: "Layers" },
  ];

  const panelBody = (p: Panel, phone: boolean) => {
    switch (p) {
      case "templates":
        return <TemplatePicker doc={doc} choose={choose} row={phone} />;
      case "details":
        return phone ? (
          <div className="space-y-5">
            <DetailsPanel c={doc.content} set={setContent} />
            <div className="border-t border-hairline pt-4">
              <BackPanel doc={doc} site={site} patch={patch} show={showBack} rsvpOpensOn={rsvpOpensOn} />
            </div>
          </div>
        ) : (
          <DetailsPanel c={doc.content} set={setContent} />
        );
      case "style":
        return <StylePanel doc={doc} patch={patch} />;
      case "photo":
        return <PhotoPanel photo={doc.photo} set={(photo, key) => patch({ photo }, key)} library={photos} persist={persist} />;
      case "layers":
        return <LayersPanel doc={doc} selected={selected} select={pick} override={override} />;
      case "download":
        return <DownloadOptions download={download} sheet back={backState} />;
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#f4f1ec] text-ink">
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-hairline bg-white px-3 lg:h-16 lg:px-5">
        <a href={backHref} className="flex h-10 items-center gap-1 rounded-full pr-3 pl-2 text-sm text-ink/70 hover:bg-ink/5">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">{backLabel}</span>
        </a>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg leading-tight lg:text-xl">{title}</h1>
          <p className={`truncate text-[11px] ${save === "error" || save === "stale" ? "text-[#b42318]" : "text-ink/50"}`} role="status">
            {status}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Undo" showLabel onClick={() => commit({ type: "undo" })} disabled={!h.past.length}>
            <UndoIcon />
          </IconButton>
          {/* Phones keep Undo only, to leave room for Preview and Send. */}
          <span className={sendHref ? "hidden sm:contents" : "contents"}>
            <IconButton label="Redo" showLabel onClick={() => commit({ type: "redo" })} disabled={!h.future.length}>
              <RedoIcon />
            </IconButton>
          </span>
          <div className="relative hidden lg:block">
            <button type="button" onClick={() => setMenu((m) => !m)} className="ml-1 flex h-10 items-center gap-1.5 rounded-full border border-ink/25 px-4 text-sm font-medium text-ink transition hover:border-ink/50 hover:bg-ink/[0.03]" aria-expanded={menu}>
              <ToolIcon name="download" className="h-4 w-4" />
              Download
            </button>
            {menu && (
              <div className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-xl border border-hairline bg-white py-1 shadow-xl">
                <DownloadOptions download={download} back={backState} />
              </div>
            )}
          </div>
          {sendHref ? (
            <>
              <button
                type="button"
                onClick={() => setPreview("phone")}
                className="ml-1 h-10 rounded-full border border-hairline px-3.5 text-sm font-medium text-ink hover:border-ink/30 lg:px-4"
              >
                Preview
              </button>
              <a href={sendHref} className="ml-1 flex h-10 items-center rounded-full bg-ink px-4 text-sm font-medium text-white lg:px-5">
                Send
              </a>
            </>
          ) : (
            <button type="button" onClick={() => setPreview("phone")} className="ml-1 h-10 rounded-full bg-ink px-4 text-sm font-medium text-white lg:px-5">
              Preview
            </button>
          )}
        </div>
      </header>

      {persist && saveError && (save === "error" || save === "stale") && (
        <div role="alert" className="flex items-center justify-center gap-3 bg-[#fef3f2] px-4 py-2 text-sm text-[#b42318]">
          <span>{saveError}</span>
          {save === "stale" && (
            <button type="button" onClick={() => window.location.reload()} className="font-medium underline">
              Reload
            </button>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Desktop: designs on the left */}
        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-hairline bg-white xl:block">
          <Section title="Designs" aside={<span className="text-xs text-ink/60">{TEMPLATES.length} designs</span>}>
            <TemplatePicker doc={doc} choose={choose} />
          </Section>
        </aside>

        {/* The card */}
        <main
          className="relative flex min-w-0 flex-1 select-none items-center justify-center overflow-hidden p-5 pb-[84px] lg:px-10 lg:pb-6 lg:pt-[76px]"
          onPointerDown={() => pick(null)}
        >
          {/* Desktop: the toolbar, or a hint, in the strip above the card */}
          <div className="absolute inset-x-4 top-4 z-10 hidden text-center lg:block" onPointerDown={(e) => e.stopPropagation()}>
            {toolbar ??
              (withBack ? (
                sideSwitch(["front", "back", "both"])
              ) : (
                <p className="pointer-events-none mt-2 inline-block rounded-full bg-ink/80 px-3 py-1.5 text-xs text-white">Drag anything to move it, click it to style it</p>
              ))}
          </div>
          <div
            className={`relative ${both ? "lg:w-[min(calc(50%-12px),calc((100dvh-164px)*0.714))] lg:-translate-x-[calc(50%+12px)]" : "lg:w-[min(100%,calc((100dvh-164px)*0.714))]"} ${panel ? "-mt-[46dvh] w-[min(100%,calc((54dvh-170px)*0.714))] lg:mt-0" : "w-[min(100%,calc((100dvh-180px)*0.714))]"}`}
            style={{ aspectRatio: "1000 / 1400" }}
          >
            {withBack && (
              <div
                role="button"
                tabIndex={-1}
                aria-label="Back of the card: open its settings"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  backSettings();
                }}
                className={`absolute left-0 top-0 h-full w-full cursor-pointer ${side === "back" ? "" : both ? "invisible lg:visible lg:left-[calc(100%+24px)]" : "invisible"}`}
              >
                <CardSvg
                  doc={doc}
                  side="back"
                  site={site}
                  svgRef={(el) => {
                    backSvg.current = el;
                  }}
                  className="h-full w-full rounded-[3px] bg-white shadow-[0_1px_2px_rgba(20,32,61,.08),0_24px_60px_-18px_rgba(20,32,61,.35)]"
                />
              </div>
            )}
            <CardSvg
              doc={doc}
              svgRef={(el) => {
                svg.current = el;
              }}
              editable
              selected={selected}
              onSelect={pick}
              onEdit={(id) => {
                pick(id);
                setEditing(true);
              }}
              onAddPhoto={t.usesPhoto ? addPhoto : undefined}
              onMove={(id, dx, dy) => {
                const o = doc.overrides[id] ?? {};
                override(id, { ...o, dx: (o.dx ?? 0) + dx, dy: (o.dy ?? 0) + dy });
              }}
              className={`h-full w-full rounded-[3px] bg-white shadow-[0_1px_2px_rgba(20,32,61,.08),0_24px_60px_-18px_rgba(20,32,61,.35)] ${withBack && side === "back" ? "invisible" : ""}`}
            />
            {/* Phone: the side switch under the card (desktop has it in the strip above). */}
            {withBack && !panel && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 lg:hidden" onPointerDown={(e) => e.stopPropagation()}>
                {sideSwitch(["front", "back"])}
              </div>
            )}
          </div>
          {!picked && !panel && !(withBack && side === "back") && (
            <p className="pointer-events-none absolute bottom-[92px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/80 px-3 py-1.5 text-xs text-white lg:hidden">
              Drag anything to move it, tap to style it
            </p>
          )}
          {busy && <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">{busy}</p>}
        </main>

        {/* Desktop: settings on the right */}
        <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-hairline bg-white lg:block">
          <div className="xl:hidden">
            <Fold title="Designs" summary={t.name} open={shownFold === "designs"} onToggle={() => openFold("designs")}>
              <TemplatePicker doc={doc} choose={choose} row />
            </Fold>
          </div>
          <Fold
            title="Your details"
            summary={[doc.content.nameA, doc.content.nameB].filter(Boolean).join(" & ")}
            open={shownFold === "details"}
            onToggle={() => openFold("details")}
          >
            {panelBody("details", false)}
          </Fold>
          <Fold
            title="Back of the card"
            summary={withBack ? (doc.back?.rsvp ? "RSVP & QR code" : "Website & QR code") : doc.back?.rsvp ? "RSVP online" : <span className="font-medium text-[#2243B6]">Add one</span>}
            open={shownFold === "back"}
            onToggle={() => openFold("back")}
          >
            <BackPanel doc={doc} site={site} patch={patch} show={showBack} rsvpOpensOn={rsvpOpensOn} />
          </Fold>
          <Fold title="Colours" summary={<PaletteSummary doc={doc} />} open={shownFold === "colours"} onToggle={() => openFold("colours")}>
            <ColoursPicker doc={doc} patch={patch} />
          </Fold>
          <Fold title="Lettering" summary={<LetteringSummary doc={doc} />} open={shownFold === "lettering"} onToggle={() => openFold("lettering")}>
            <LetteringPicker doc={doc} patch={patch} />
          </Fold>
          {t.usesPhoto && (
            <Fold
              title="Photo"
              summary={doc.photo ? "Added" : <span className="font-medium text-[#2243B6]">Add one</span>}
              open={shownFold === "photo"}
              onToggle={() => openFold("photo")}
            >
              {panelBody("photo", false)}
            </Fold>
          )}
          <Fold title="Layers" summary={`${shownLayers.length} pieces`} open={shownFold === "layers"} onToggle={() => openFold("layers")}>
            {panelBody("layers", false)}
          </Fold>
        </aside>
      </div>

      {/* Phone: a tool bar, each tool a sheet over the lower card */}
      <div className="lg:hidden">
        {toolbar && !panel && (
          <div className="fixed inset-x-2 bottom-[76px] z-30" onPointerDown={(e) => e.stopPropagation()}>
            {toolbar}
          </div>
        )}
        {panel && (
          <div className="fixed inset-x-0 bottom-[68px] z-20 h-[46dvh] overflow-y-auto rounded-t-2xl border-t border-hairline bg-white shadow-[0_-12px_40px_-12px_rgba(20,32,61,.25)]">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 pb-2 pt-3">
              <span className="mx-auto h-1 w-10 rounded-full bg-ink/15" aria-hidden />
            </div>
            <div className={panel === "style" ? "" : "px-5 pb-5"}>{panelBody(panel, true)}</div>
          </div>
        )}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between gap-0.5 px-1.5 pt-1.5">
            {[...panels, { id: "download" as const, label: "Download" }].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPanel(panel === p.id ? null : p.id)}
                aria-pressed={panel === p.id}
                className={`flex h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-medium transition ${panel === p.id ? "bg-[#2243B6]/10 text-[#2243B6]" : "text-ink/75 active:bg-ink/5"}`}
              >
                <ToolIcon name={p.id} className="h-[22px] w-[22px]" />
                <span className="truncate">{p.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Preview as a guest */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1424]/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Preview as a guest">
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6 sm:py-4">
            <p className="whitespace-nowrap text-[15px] font-semibold leading-tight sm:text-lg"><span className="sm:hidden">Guest view</span><span className="hidden sm:inline">What a guest sees</span></p>
            <div className="flex rounded-full bg-white/10 p-1 text-[13px]">
              {(["phone", "desktop"] as const).map((d) => (
                <button key={d} type="button" onClick={() => setPreview(d)} className={`rounded-full px-3.5 py-1.5 capitalize ${preview === d ? "bg-white text-ink" : "text-white/80"}`}>
                  {d}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setPreview(null)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[15px] font-semibold text-ink shadow-md transition hover:bg-white/90 sm:px-5 sm:py-2.5 sm:text-base">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
              Close
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <div
              className={`overflow-hidden bg-white shadow-2xl ${preview === "phone" ? "h-[min(780px,100%)] w-auto rounded-[36px] border-[10px] border-black" : "h-[min(720px,100%)] w-[min(1180px,100%)] rounded-xl"}`}
              style={preview === "phone" ? { aspectRatio: "390 / 844" } : undefined}
            >
              <div className="h-full overflow-y-auto">
                <Reveal key={preview} doc={doc} guest="Sam & Riley" siteHref="#" site={site} compact={preview === "phone"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
