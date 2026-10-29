"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { ART } from "@/components/save-the-date/art";
import { CardSvg } from "@/components/save-the-date/card-svg";
import { Reveal } from "@/components/save-the-date/reveal";
import { FONTS, fontById, fontsHrefFor } from "@/lib/site-design";
import { cardPdf, cardPng, saveBlob } from "@/lib/save-the-date/export";
import { TEMPLATES, newCard, templateById } from "@/lib/save-the-date/templates";
import type { CardContent, CardDoc, LayerOverride, Photo } from "@/lib/save-the-date/types";

const STUDIO_FONTS = [
  ...new Set([
    ...TEMPLATES.flatMap((t) => t.pairings.flatMap((p) => [p.display, p.script, p.sans])),
    ...FONTS.map((f) => f.id),
  ]),
];
const FONTS_HREF = fontsHrefFor(STUDIO_FONTS.map((id) => fontById(id)?.css ?? ""));

// ---------------------------------------------------------------- history

type History = { past: CardDoc[]; present: CardDoc; future: CardDoc[]; key: string | null; at: number };
type Action =
  | { type: "set"; doc: CardDoc; key?: string }
  | { type: "undo" }
  | { type: "redo" };

/** Typing in one field within a second is one undo step, not one per letter. */
function reducer(h: History, a: Action): History {
  if (a.type === "undo") {
    if (!h.past.length) return h;
    return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], key: null, at: 0 };
  }
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

type Panel = "templates" | "details" | "style" | "photo" | "layers";

function TemplatePicker({ doc, choose, row }: { doc: CardDoc; choose: (id: string) => void; row?: boolean }) {
  return (
    <div className={row ? "-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1" : "grid grid-cols-2 gap-3"}>
      {TEMPLATES.map((t) => {
        const preview: CardDoc = { ...newCard(t.id, doc.content, doc.photo), overrides: {} };
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

function PhotoPanel({ photo, set }: { photo: Photo | null; set: (p: Photo | null, key?: string) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const pick = (f: File) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => set({ url, aspect: img.naturalWidth / img.naturalHeight, fx: 50, fy: 50, zoom: 1, filter: photo?.filter ?? "none" });
    img.src = url;
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => file.current?.click()} className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white">
          {photo ? "Replace photo" : "Add a photo"}
        </button>
        {photo && (
          <button type="button" onClick={() => set(null)} className="rounded-full border border-hairline px-4 py-2.5 text-sm text-ink">
            Remove
          </button>
        )}
        <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
      </div>
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
  const layer = t.layers.find((l) => l.id === selected);
  const o = (selected && doc.overrides[selected]) || {};
  const palette = t.palettes.find((p) => p.id === doc.palette) ?? t.palettes[0];
  return (
    <div className="space-y-5">
      {layer && (
        <div className="rounded-xl border border-[#2243B6]/30 bg-[#2243B6]/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">{layer.label}</p>
            <button type="button" className="text-xs text-ink/60 underline" onClick={() => override(layer.id, null)}>
              Reset
            </button>
          </div>
          <Slider label="Size" value={o.scale ?? 1} min={0.4} max={2.2} step={0.01} onChange={(scale) => override(layer.id, { ...o, scale }, `scale-${layer.id}`)} />
          <div className="mt-2 flex items-center gap-1">
            <span className="w-16 shrink-0 text-xs text-ink/70">Nudge</span>
            {[
              ["←", -6, 0],
              ["→", 6, 0],
              ["↑", 0, -6],
              ["↓", 0, 6],
            ].map(([label, dx, dy]) => (
              <button
                key={label as string}
                type="button"
                aria-label={`Nudge ${label}`}
                onClick={() => override(layer.id, { ...o, dx: (o.dx ?? 0) + (dx as number), dy: (o.dy ?? 0) + (dy as number) }, `nudge-${layer.id}`)}
                className="h-9 w-9 rounded-md border border-hairline bg-white text-sm text-ink"
              >
                {label}
              </button>
            ))}
          </div>
          {layer.kind === "text" && (
            <label className="mt-3 flex items-center gap-3 text-xs text-ink/70">
              <span className="w-16 shrink-0">Font</span>
              <select className={`${input} py-2 text-sm`} value={o.font ?? ""} onChange={(e) => override(layer.id, { ...o, font: e.target.value || undefined })}>
                <option value="">Template&apos;s choice</option>
                {(["serif", "script", "sans"] as const).map((kind) => (
                  <optgroup key={kind} label={kind === "serif" ? "Serif" : kind === "script" ? "Script" : "Sans serif"}>
                    {FONTS.filter((f) => f.kind === kind).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          )}
          {layer.kind !== "photo" && !(layer.kind === "art" && ART[layer.art]?.kind === "image") && (
            <div className="mt-3 flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-ink/70">Colour</span>
              {(["ink", "accent", "muted"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  aria-label={`Use the ${role} colour`}
                  onClick={() => override(layer.id, { ...o, color: palette[role] })}
                  className={`h-8 w-8 rounded-full ring-offset-2 ${o.color === palette[role] ? "ring-2 ring-[#2243B6]" : "ring-1 ring-ink/15"}`}
                  style={{ background: palette[role] }}
                />
              ))}
              <input
                type="color"
                aria-label="Any colour"
                value={o.color ?? "#000000"}
                onChange={(e) => override(layer.id, { ...o, color: e.target.value }, `color-${layer.id}`)}
                className="h-8 w-10 cursor-pointer rounded border border-hairline bg-white"
              />
            </div>
          )}
        </div>
      )}
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
      <p className="text-xs leading-relaxed text-ink/55">Drag anything on the card to move it. Arrow keys nudge, ⌘Z undoes.</p>
    </div>
  );
}

// ---------------------------------------------------------------- studio

export function Studio({ view }: { view: string }) {
  if (view.startsWith("reveal")) {
    const id = view.split("-")[1] ?? "midnight";
    return (
      <div className="h-dvh">
        <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
        <Reveal doc={newCard(id)} guest="Sam & Riley" siteHref="#" />
      </div>
    );
  }
  return <Editor view={view} />;
}

function Editor({ view }: { view: string }) {
  const [h, dispatch] = useReducer(reducer, null, () => ({
    past: [],
    present: newCard(view === "heirloom" || view === "midnight" ? view : "editorial"),
    future: [],
    key: null,
    at: 0,
  }));
  const doc = h.present;
  const t = templateById(doc.template);
  const [advanced, setAdvanced] = useState(view === "advanced");
  const [selected, setSelected] = useState<string | null>(view === "advanced" ? "names" : null);
  const [panel, setPanel] = useState<Panel | null>(view === "mobile-style" ? "style" : null);
  const [preview, setPreview] = useState<"phone" | "desktop" | null>(view === "preview" ? "phone" : null);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);

  const patch = (p: Partial<CardDoc>, key?: string) => dispatch({ type: "set", doc: { ...doc, ...p }, key });
  const setContent = (c: Partial<CardContent>, key: string) => patch({ content: { ...doc.content, ...c } }, key);
  const override = (id: string, o: LayerOverride | null, key?: string) => {
    const next = { ...doc.overrides };
    if (o) next[id] = o;
    else delete next[id];
    patch({ overrides: next }, key);
  };
  const choose = (id: string) => {
    const fresh = newCard(id, doc.content, doc.photo);
    dispatch({ type: "set", doc: fresh });
    setSelected(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      }
      if (!selected || typing) return;
      const step = e.shiftKey ? 30 : 6;
      const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (move[e.key]) {
        e.preventDefault();
        const o = doc.overrides[selected] ?? {};
        override(selected, { ...o, dx: (o.dx ?? 0) + move[e.key][0], dy: (o.dy ?? 0) + move[e.key][1] }, `nudge-${selected}`);
      }
      if (e.key === "Escape") setSelected(null);
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
    ...(advanced ? [{ id: "layers" as const, label: "Layers" }] : []),
  ];

  const panelBody = (p: Panel, phone: boolean) => {
    switch (p) {
      case "templates":
        return <TemplatePicker doc={doc} choose={choose} row={phone} />;
      case "details":
        return <DetailsPanel c={doc.content} set={setContent} />;
      case "style":
        return <StylePanel doc={doc} patch={patch} />;
      case "photo":
        return <PhotoPanel photo={doc.photo} set={(photo, key) => patch({ photo }, key)} />;
      case "layers":
        return <LayersPanel doc={doc} selected={selected} select={setSelected} override={override} />;
    }
  };

  const modeSwitch = (
    <div className="flex rounded-full bg-ink/[0.06] p-1 text-[13px]" role="group" aria-label="Editor mode">
      {[false, true].map((a) => (
        <button
          key={String(a)}
          type="button"
          onClick={() => {
            setAdvanced(a);
            if (!a) setSelected(null);
            if (!a && panel === "layers") setPanel(null);
          }}
          aria-pressed={advanced === a}
          className={`rounded-full px-3.5 py-1.5 transition ${advanced === a ? "bg-white font-medium text-ink shadow-sm" : "text-ink/60"}`}
        >
          {a ? "Advanced" : "Simple"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-[#f4f1ec] text-ink">
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />

      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-hairline bg-white px-3 lg:h-16 lg:px-5">
        <a href="#" className="flex h-10 items-center gap-1 rounded-full pr-3 pl-2 text-sm text-ink/70 hover:bg-ink/5">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Guests</span>
        </a>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg leading-tight lg:text-xl">Save the date</h1>
          <p className="hidden text-[11px] text-ink/50 lg:block">Draft · saved just now</p>
        </div>
        <div className="mx-auto hidden lg:block">{modeSwitch}</div>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <IconButton label="Undo" onClick={() => dispatch({ type: "undo" })} disabled={!h.past.length}>
            <UndoIcon />
          </IconButton>
          <IconButton label="Redo" onClick={() => dispatch({ type: "redo" })} disabled={!h.future.length}>
            <RedoIcon />
          </IconButton>
          <div className="relative hidden lg:block">
            <button type="button" onClick={() => setMenu((m) => !m)} className="h-10 rounded-full px-4 text-sm text-ink hover:bg-ink/5" aria-expanded={menu}>
              Download
            </button>
            {menu && (
              <div className="absolute right-0 top-12 z-30 w-60 overflow-hidden rounded-xl border border-hairline bg-white py-1 shadow-xl">
                <button type="button" onClick={() => download("png")} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-ink/5">
                  PNG image<span className="block text-xs text-ink/50">3000 × 4200, for texting or posting</span>
                </button>
                <button type="button" onClick={() => download("pdf")} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-ink/5">
                  PDF for printing<span className="block text-xs text-ink/50">5 × 7 in at 600 dpi</span>
                </button>
              </div>
            )}
          </div>
          <button type="button" onClick={() => setPreview("phone")} className="ml-1 h-10 rounded-full bg-ink px-4 text-sm font-medium text-white lg:px-5">
            Preview
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Desktop: designs on the left */}
        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-hairline bg-white xl:block">
          <Section title="Designs" aside={<span className="text-[11px] text-ink/45">{TEMPLATES.length} of 24</span>}>
            <TemplatePicker doc={doc} choose={choose} />
          </Section>
        </aside>

        {/* The card */}
        <main
          className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden p-5 pb-[84px] lg:p-10"
          onPointerDown={() => setSelected(null)}
        >
          <div
            className={`relative lg:w-[min(100%,calc((100dvh-144px)*0.714))] ${panel ? "-mt-[46dvh] w-[min(100%,calc((54dvh-170px)*0.714))] lg:mt-0" : "w-[min(100%,calc((100dvh-180px)*0.714))]"}`}
            style={{ aspectRatio: "1000 / 1400" }}
          >
            <CardSvg
              doc={doc}
              svgRef={(el) => {
                svg.current = el;
              }}
              editable={advanced}
              selected={selected}
              onSelect={setSelected}
              onMove={(id, dx, dy) => {
                const o = doc.overrides[id] ?? {};
                override(id, { ...o, dx: (o.dx ?? 0) + dx, dy: (o.dy ?? 0) + dy });
              }}
              className="h-full w-full rounded-[3px] bg-white shadow-[0_1px_2px_rgba(20,32,61,.08),0_24px_60px_-18px_rgba(20,32,61,.35)]"
            />
          </div>
          {advanced && !selected && (
            <p className="pointer-events-none absolute bottom-[92px] left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1.5 text-xs text-white lg:bottom-5">
              Tap anything on the card to move it
            </p>
          )}
          {busy && <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">{busy}</p>}
        </main>

        {/* Desktop: settings on the right */}
        <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-hairline bg-white lg:block">
          <div className="xl:hidden">
            <Section title="Designs">
              <TemplatePicker doc={doc} choose={choose} row />
            </Section>
          </div>
          {advanced ? (
            <Section title="Layers">{panelBody("layers", false)}</Section>
          ) : (
            <Section title="Your details">{panelBody("details", false)}</Section>
          )}
          {panelBody("style", false)}
          {t.usesPhoto && <Section title="Photo">{panelBody("photo", false)}</Section>}
          {advanced && <Section title="Your details">{panelBody("details", false)}</Section>}
        </aside>
      </div>

      {/* Phone: a tool bar, each tool a sheet over the lower card */}
      <div className="lg:hidden">
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
            {panels.map((p) => (
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
            <button
              type="button"
              onClick={() => {
                setAdvanced(!advanced);
                setSelected(null);
                setPanel(!advanced ? "layers" : null);
              }}
              className="flex h-[52px] flex-1 flex-col items-center justify-center rounded-lg text-[12px] text-ink/70"
            >
              {advanced ? "Simple" : "Advanced"}
            </button>
          </div>
        </nav>
      </div>

      {/* Preview as a guest */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1424]/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Preview as a guest">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-sm">What a guest sees</p>
            <div className="flex rounded-full bg-white/10 p-1 text-[13px]">
              {(["phone", "desktop"] as const).map((d) => (
                <button key={d} type="button" onClick={() => setPreview(d)} className={`rounded-full px-3.5 py-1.5 capitalize ${preview === d ? "bg-white text-ink" : "text-white/80"}`}>
                  {d}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setPreview(null)} className="rounded-full px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
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
