"use client";

import { useState, useTransition } from "react";
import { MOTION_PRESETS, PALETTES, blockKey, type SiteDesign } from "@/lib/site-design";
import { addElement, newElementId, type CanvasElement } from "@/lib/site-canvas";
import { applyTemplate, templateById } from "@/lib/site-templates";
import type { SiteDesignPick } from "@/lib/ai/site-wren";
import { designWithWren, saveFaqDrafts, saveStoryDraft, saveTravelDraft, writeWithWren } from "./wren-actions";
import { PanelLabel } from "./editor-tabs";
import { LegalNotice } from "@/components/legal-notice";

type Change = (patch: Partial<SiteDesign>) => void;

const OFFLINE = "Couldn't reach Wren — check your connection and try again.";

/** Wren's mark: Sky on navy is hers (CLAUDE.md, colour roles). */
function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00BFFE" aria-hidden="true">
      <path d="M12 2l2.1 6.3L20.5 10l-6.4 1.9L12 18.3l-2.1-6.4L3.5 10l6.4-1.7z" />
    </svg>
  );
}

const WREN_BUTTON =
  "flex h-11 items-center justify-center gap-2 rounded-xl bg-[#14203d] px-4 text-sm font-semibold text-white hover:bg-[#14203d]/90 disabled:opacity-60";

/** The editor applies Wren's pick the same way a template click would, plus her palette, art and finish. */
export function applyPick(design: SiteDesign, pick: SiteDesignPick): SiteDesign {
  const template = templateById(pick.template);
  const base = template ? applyTemplate(design, template) : design;
  const palette = PALETTES.find((p) => p.id === pick.palette);
  return {
    ...base,
    ...(palette ? { colors: { bg: palette.bg, ink: palette.ink, heading: palette.heading }, accent: palette.accent } : {}),
    art: pick.art === "none" ? { id: null, placement: "sides" } : { id: pick.art as SiteDesign["art"]["id"], placement: pick.artPlacement },
    background: { ...base.background, pattern: pick.pattern, texture: pick.texture },
    motion: MOTION_PRESETS[pick.motion],
  };
}

/**
 * "Describe your ideal site": a sentence, and Wren picks a template, palette,
 * artwork and finish to match. It's a draft change like any other, so undo
 * puts it back.
 */
export function DescribeSite({ design, onChange }: { design: SiteDesign; onChange: Change }) {
  const [words, setWords] = useState("");
  const [why, setWhy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function build() {
    setError(null);
    setWhy(null);
    start(async () => {
      const result = await designWithWren(words).catch(() => ({ error: OFFLINE, pick: undefined }));
      if (result.error || !result.pick) {
        setError(result.error ?? OFFLINE);
        return;
      }
      onChange(applyPick(design, result.pick));
      setWhy(result.pick.why);
    });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor="describe-site" className="text-[15px] font-semibold text-ink">
        Describe your ideal site
      </label>
      <textarea
        id="describe-site"
        rows={3}
        maxLength={600}
        value={words}
        onChange={(e) => setWords(e.target.value)}
        placeholder="Beachy and relaxed, blue and white, hand-drawn palm trees"
        className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-[15px] leading-normal text-ink placeholder:text-ink/45"
      />
      <button type="button" onClick={build} disabled={busy || words.trim().length < 3} className={WREN_BUTTON}>
        <Sparkle />
        {busy ? "Wren is choosing…" : "Build it with Wren"}
      </button>
      <LegalNotice action="asking Wren" />
      {why ? (
        <p role="status" className="rounded-xl bg-[#2243B6]/[0.06] px-3 py-2.5 text-[13px] leading-normal text-ink/80">
          {why} Undo puts back what you had.
        </p>
      ) : error ? (
        <p role="status" className="text-[13px] text-red-700">{error}</p>
      ) : (
        <p className="text-[13px] leading-normal text-ink/60">
          Uses your names and wedding details, and keeps your words and photos.
        </p>
      )}
    </div>
  );
}

const KINDS = [
  { id: "story", label: "Our story", hint: "How you met, the proposal, a detail only you two would know." },
  { id: "faq", label: "FAQ", hint: "Kids welcome? Plus-ones? Shuttle times? Anything guests keep asking." },
  { id: "travel", label: "Travel notes", hint: "Nearest airport, parking, the hotel block, anything about the day." },
  { id: "welcome", label: "A welcome line", hint: "The mood you want guests to feel when they open the site." },
] as const;

type Kind = (typeof KINDS)[number]["id"];

/**
 * "Wren, write this": a draft of their story, FAQ, travel notes or a welcome
 * line, from their details and a few notes. Nothing reaches the page until
 * they've read it and pressed "Use this".
 */
export function WrenWrite({ design, onChange }: { design: SiteDesign; onChange: Change }) {
  const [kind, setKind] = useState<Kind>("story");
  const [notes, setNotes] = useState("");
  const [text, setText] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[] | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, start] = useTransition();
  const info = KINDS.find((k) => k.id === kind)!;

  function draft() {
    setMessage(null);
    start(async () => {
      const result = await writeWithWren(kind, notes).catch(() => ({ error: OFFLINE, draft: undefined }));
      if (result.error || !result.draft) {
        setMessage({ tone: "error", text: result.error ?? OFFLINE });
        return;
      }
      setText(result.draft.text ?? null);
      setFaqs(result.draft.faqs ?? null);
    });
  }

  function clear(done: string) {
    setText(null);
    setFaqs(null);
    setNotes("");
    setMessage({ tone: "ok", text: done });
  }

  function use() {
    setMessage(null);
    start(async () => {
      if (kind === "welcome" && text) {
        // A welcome line goes on the top of the page, centred, to drag where it suits.
        const el: CanvasElement = {
          id: newElementId(),
          kind: "text",
          text: text.trim(),
          font: "body",
          size: 28,
          color: "heading",
          align: "center",
          bold: false,
          italic: true,
          x: 280,
          y: 24,
          w: 720,
          h: 40,
          rot: 0,
          locked: false,
          hidden: false,
          anim: "none",
        };
        onChange({ canvas: addElement(design.canvas, "hero", 1280, el) });
        clear("Added to the top of your page — drag it where it suits.");
        return;
      }
      if (kind === "faq" && faqs) {
        const result = await saveFaqDrafts(faqs).catch(() => ({ error: OFFLINE, added: 0 }));
        if (result.error) setMessage({ tone: "error", text: result.error });
        else clear(`Added ${result.added} ${result.added === 1 ? "question" : "questions"} to your FAQ.`);
        return;
      }
      if (kind === "travel" && text) {
        const result = await saveTravelDraft(text).catch(() => ({ error: OFFLINE }));
        if (result.error) setMessage({ tone: "error", text: result.error });
        else clear("Saved as your travel notes.");
        return;
      }
      if (kind === "story" && text) {
        const result = await saveStoryDraft("Our story", text).catch(() => ({ error: OFFLINE, block: undefined }));
        if (result.error || !result.block) {
          setMessage({ tone: "error", text: result.error ?? OFFLINE });
          return;
        }
        // New sections go first, where they're easy to find.
        onChange({ sections: [{ id: blockKey(result.block.id), hidden: false }, ...design.sections] });
        clear("Added as a story section. Publish when you're happy with it.");
      }
    });
  }

  const hasDraft = text !== null || faqs !== null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-card p-4">
      <div className="flex items-center gap-2">
        <Sparkle />
        <PanelLabel>Wren, write this</PanelLabel>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="What to write">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={kind === k.id}
            onClick={() => {
              setKind(k.id);
              setText(null);
              setFaqs(null);
              setMessage(null);
            }}
            className={`h-8 rounded-full px-3 text-[13px] ${
              kind === k.id ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75 hover:text-ink"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {!hasDraft ? (
        <>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink/70">
            A few notes (optional)
            <textarea
              rows={3}
              maxLength={1500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={info.hint}
              className="rounded-lg border border-hairline bg-card px-3 py-2 text-[15px] leading-normal text-ink placeholder:text-ink/45"
            />
          </label>
          <button type="button" onClick={draft} disabled={busy} className={WREN_BUTTON}>
            <Sparkle />
            {busy ? "Wren is writing…" : `Draft ${kind === "faq" ? "my FAQ" : info.label.toLowerCase()}`}
          </button>
          <LegalNotice action="asking Wren" />
          <p className="text-[13px] leading-normal text-ink/60">
            Wren uses your wedding details and your notes, and never makes up a date, place or name.
          </p>
        </>
      ) : (
        <>
          {text !== null && (
            <textarea
              aria-label="Draft"
              rows={kind === "welcome" ? 2 : 8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="rounded-lg border border-hairline bg-card px-3 py-2 text-[15px] leading-relaxed text-ink"
            />
          )}
          {faqs?.map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-hairline p-2.5">
              <input
                aria-label={`Question ${i + 1}`}
                value={f.question}
                onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))}
                className="rounded-md bg-ink/[0.03] px-2 py-1.5 text-[14px] font-medium text-ink"
              />
              <textarea
                aria-label={`Answer ${i + 1}`}
                rows={2}
                value={f.answer}
                onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))}
                className="rounded-md bg-ink/[0.03] px-2 py-1.5 text-[14px] leading-normal text-ink/80"
              />
              <button
                type="button"
                onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                className="self-end text-[12px] text-ink/60 underline underline-offset-2 hover:text-ink"
              >
                Leave this one out
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={use} disabled={busy} className={`${WREN_BUTTON} flex-1`}>
              {busy ? "Saving…" : "Use this"}
            </button>
            <button
              type="button"
              onClick={() => {
                setText(null);
                setFaqs(null);
              }}
              disabled={busy}
              className="h-11 rounded-xl border border-hairline px-4 text-sm text-ink hover:border-ink/30"
            >
              Start over
            </button>
          </div>
          <p className="text-[13px] leading-normal text-ink/60">
            {kind === "faq" || kind === "travel"
              ? "Edit anything first. Like the rest of your FAQ and travel notes, this shows on your site as soon as you save it."
              : "Edit anything first. Guests see it once you publish."}
          </p>
        </>
      )}

      {message && (
        <p role="status" className={`text-[13px] ${message.tone === "error" ? "text-red-700" : "text-ink/80"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
