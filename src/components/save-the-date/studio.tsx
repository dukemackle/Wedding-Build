"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { saveTheDatePhotoUrl, startSaveTheDatePhotoUpload } from "@/app/guests/save-the-date/actions";
import { shrinkImage } from "@/lib/shrink-image";
import { putToSignedUrl } from "@/lib/signed-upload";
import { CardSvg, layerBox } from "./card-svg";
import { CardToolbar } from "./card-toolbar";
import { Reveal } from "./reveal";
import { FONTS, fontById } from "@/lib/site-design";
import { FONTS_HREF } from "@/lib/save-the-date/fonts";
import { cardPdf, cardPng, saveBlob } from "@/lib/save-the-date/export";
import { FAMILIES, SHORT, TEMPLATES, newCard, templateById } from "@/lib/save-the-date/templates";
import type { CardContent, CardDoc, LayerOverride, Photo } from "@/lib/save-the-date/types";

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
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink/70">{label}</span>
      {children}
    </label>
  );
}

const input =
  "w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition focus:border-[#2243B6] focus:ring-2 focus:ring-[#2243B6]/15";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-3 text-xs text-ink/70">
      <span className="w-16 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-8 w-full accent-[#2243B6]" />
    </label>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

const UndoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

// ---------------------------------------------------------------- panels

type Panel = "templates" | "details" | "style" | "photo" | "layers" | "download";

function TemplatePicker({ doc, choose, row, samples }: { doc: CardDoc; choose: (id: string) => void; row?: boolean; samples: boolean }) {
  const [family, setFamily] = useState<string | null>(null);
  const shown = family ? TEMPLATES.filter((t) => t.family === family) : TEMPLATES;
  const chip = (label: string, value: string | null) => (
    <button
      key={label}
      type="button"
      onClick={() => setFamily(value)}
      aria-pressed={family === value}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${family === value ? "border-[#2243B6] bg-[#2243B6]/[0.06] font-medium text-[#2243B6]" : "border-hairline text-ink/70 hover:border-ink/25"}`}
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
          const preview: CardDoc = { ...newCard(t.id, doc.content, doc.photo, samples), overrides: {} };
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

function StylePanel({ doc, patch }: { doc: CardDoc; patch: (p: Partial<CardDoc>, key?: string) => void }) {
  const t = templateById(doc.template);
  return (
    <>
      <Section title="Colours">
        <div className="flex flex-wrap gap-3">
          {t.palettes.map((p) => {
            const active = p.id === doc.palette;
            return (
              <button key={p.id} type="button" onClick={() => patch({ palette: p.id })} className="text-center" aria-pressed={active}>
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full ring-offset-2 transition ${active ? "ring-2 ring-[#2243B6]" : "ring-1 ring-ink/15"}`}
                  style={{ background: p.paper }}
                >
                  <span className="h-6 w-6 rounded-full" style={{ background: p.metal ? `linear-gradient(135deg, ${p.metal[0]}, ${p.metal[2]})` : p.accent }} />
                  <span className="-ml-2 h-6 w-6 rounded-full border-2" style={{ background: p.ink, borderColor: p.paper }} />
                </span>
                <span className="mt-1 block text-[11px] text-ink/70">{p.label}</span>
              </button>
            );
          })}
        </div>
      </Section>
      <Section title="Lettering">
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
                  <span className="mt-0.5 block text-[10px] uppercase tracking-[0.25em] text-ink/60" style={{ fontFamily: fontById(p.sans)?.css }}>
                    {p.label}
                  </span>
                </span>
                {active && <span className="text-xs font-medium text-[#2243B6]">In use</span>}
              </button>
            );
          })}
        </div>
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
};

/**
 * The Save the Date Studio: designs on the left, the card in the middle,
 * settings on the right (a tool bar and sheets on a phone). See
 * docs/save-the-date-studio.md.
 */
/** The two downloads and how to get the card printed: the desktop menu and the phone sheet. */
function DownloadOptions({ download, sheet }: { download: (kind: "png" | "pdf") => void; sheet?: boolean }) {
  const item = sheet
    ? "block w-full rounded-xl border border-hairline px-4 py-3 text-left text-[15px] hover:bg-ink/5"
    : "block w-full px-4 py-2.5 text-left text-sm hover:bg-ink/5";
  return (
    <div className={sheet ? "space-y-2" : ""}>
      <button type="button" onClick={() => download("png")} className={item}>
        PNG image<span className="block text-xs text-ink/50">3000 × 4200, for texting or posting</span>
      </button>
      <button type="button" onClick={() => download("pdf")} className={item}>
        PDF for printing<span className="block text-xs text-ink/50">5 × 7 in at 600 dpi, with ⅛ in bleed</span>
      </button>
      <div className={`${sheet ? "" : "mx-3 mb-2 mt-1"} rounded-lg bg-parchment px-3 py-2.5 text-xs leading-relaxed text-ink/70`}>
        <p className="font-medium text-ink">Printing it</p>
        <p className="mt-1">
          Take the PDF to any print shop (FedEx Office, Staples or a local printer) and ask for 5 × 7 on
          matte cardstock, 110–130 lb, trimmed to size.
        </p>
        <p className="mt-1">Order one per household plus about ten spares. A7 envelopes fit.</p>
      </div>
    </div>
  );
}

export function SaveTheDateStudio({ initial, version: savedVersion = null, persist = false, photos = [], backHref = "/guests", backLabel = "Guests", view = "", note = "Prototype · nothing is saved", sendHref, cardId, title = "Save the date" }: StudioProps) {
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
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<"phone" | "desktop" | null>(view === "preview" ? "phone" : null);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);

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
    const fresh = newCard(id, doc.content, doc.photo, !persist);
    commit({ type: "set", doc: fresh });
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

  const download = async (kind: "png" | "pdf") => {
    if (!svg.current) return;
    setMenu(false);
    setBusy(kind === "png" ? "Making your PNG…" : "Making your PDF…");
    try {
      const name = `save-the-date-${doc.content.nameA}-${doc.content.nameB}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      saveBlob(kind === "png" ? await cardPng(svg.current) : await cardPdf(svg.current), `${name}.${kind}`);
    } finally {
      setBusy(null);
    }
  };

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
        return <TemplatePicker samples={!persist} doc={doc} choose={choose} row={phone} />;
      case "details":
        return <DetailsPanel c={doc.content} set={setContent} />;
      case "style":
        return <StylePanel doc={doc} patch={patch} />;
      case "photo":
        return <PhotoPanel photo={doc.photo} set={(photo, key) => patch({ photo }, key)} library={photos} persist={persist} />;
      case "layers":
        return <LayersPanel doc={doc} selected={selected} select={pick} override={override} />;
      case "download":
        return <DownloadOptions download={download} sheet />;
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
          <IconButton label="Undo" onClick={() => commit({ type: "undo" })} disabled={!h.past.length}>
            <UndoIcon />
          </IconButton>
          {/* Phones keep Undo only, to leave room for Preview and Send. */}
          <span className={sendHref ? "hidden sm:contents" : "contents"}>
            <IconButton label="Redo" onClick={() => commit({ type: "redo" })} disabled={!h.future.length}>
              <RedoIcon />
            </IconButton>
          </span>
          <div className="relative hidden lg:block">
            <button type="button" onClick={() => setMenu((m) => !m)} className="h-10 rounded-full px-4 text-sm text-ink hover:bg-ink/5" aria-expanded={menu}>
              Download
            </button>
            {menu && (
              <div className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-xl border border-hairline bg-white py-1 shadow-xl">
                <DownloadOptions download={download} />
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
          <Section title="Designs" aside={<span className="text-[11px] text-ink/45">{TEMPLATES.length} designs</span>}>
            <TemplatePicker samples={!persist} doc={doc} choose={choose} />
          </Section>
        </aside>

        {/* The card */}
        <main
          className="relative flex min-w-0 flex-1 select-none items-center justify-center overflow-hidden p-5 pb-[84px] lg:px-10 lg:pb-6 lg:pt-[76px]"
          onPointerDown={() => pick(null)}
        >
          {/* Desktop: the toolbar, or a hint, in the strip above the card */}
          <div className="absolute inset-x-4 top-4 z-10 hidden text-center lg:block" onPointerDown={(e) => e.stopPropagation()}>
            {toolbar ?? (
              <p className="pointer-events-none mt-2 inline-block rounded-full bg-ink/80 px-3 py-1.5 text-xs text-white">Drag anything to move it, click it to style it</p>
            )}
          </div>
          <div
            className={`relative lg:w-[min(100%,calc((100dvh-164px)*0.714))] ${panel ? "-mt-[46dvh] w-[min(100%,calc((54dvh-170px)*0.714))] lg:mt-0" : "w-[min(100%,calc((100dvh-180px)*0.714))]"}`}
            style={{ aspectRatio: "1000 / 1400" }}
          >
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
              onMove={(id, dx, dy) => {
                const o = doc.overrides[id] ?? {};
                override(id, { ...o, dx: (o.dx ?? 0) + dx, dy: (o.dy ?? 0) + dy });
              }}
              className="h-full w-full rounded-[3px] bg-white shadow-[0_1px_2px_rgba(20,32,61,.08),0_24px_60px_-18px_rgba(20,32,61,.35)]"
            />
          </div>
          {!picked && !panel && (
            <p className="pointer-events-none absolute bottom-[92px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/80 px-3 py-1.5 text-xs text-white lg:hidden">
              Drag anything to move it, tap to style it
            </p>
          )}
          {busy && <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">{busy}</p>}
        </main>

        {/* Desktop: settings on the right */}
        <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-hairline bg-white lg:block">
          <div className="xl:hidden">
            <Section title="Designs">
              <TemplatePicker samples={!persist} doc={doc} choose={choose} row />
            </Section>
          </div>
          <Section title="Layers">{panelBody("layers", false)}</Section>
          {panelBody("style", false)}
          {t.usesPhoto && <Section title="Photo">{panelBody("photo", false)}</Section>}
          <Section title="Your details">{panelBody("details", false)}</Section>
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
          <div className="flex items-center justify-between gap-1 px-2 pt-1.5">
            {[...panels, { id: "download" as const, label: "Download" }].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPanel(panel === p.id ? null : p.id)}
                aria-pressed={panel === p.id}
                className={`flex h-[52px] flex-1 flex-col items-center justify-center rounded-lg text-[12px] transition ${panel === p.id ? "bg-[#2243B6]/[0.07] font-medium text-[#2243B6]" : "text-ink/70"}`}
              >
                {p.label}
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
                <Reveal key={preview} doc={doc} guest="Sam & Riley" siteHref="#" compact={preview === "phone"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
