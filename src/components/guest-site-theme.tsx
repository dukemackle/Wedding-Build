"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ALL_FONTS_HREF,
  designCssVars,
  DEFAULT_SITE_DESIGN,
  parseSiteDesign,
  siteFontsHref,
  type SiteDesign,
  type TextSlotId,
} from "@/lib/site-design";

/** What the editor sends into its preview frame whenever the draft changes. */
export const DESIGN_MESSAGE = "wren:site-design";
/** "Replay motion": play every entrance again from the top. */
export const REPLAY_MESSAGE = "wren:replay";
/** The Motion tab's "Try it" for confetti, which needs an RSVP to fire otherwise. */
export const CONFETTI_MESSAGE = "wren:confetti";
/** Must match RSVP_YES_EVENT in site-motion.tsx (not imported: that file imports this one). */
const RSVP_YES_EVENT = "wren:rsvp-yes";
/** What the preview frame sends up once it can receive a design. */
export const READY_MESSAGE = "wren:preview-ready";
/** Both ways: the preview says which words were clicked; the editor clears it (slot null). */
export const TEXT_SELECT_MESSAGE = "wren:text-select";
/** Preview to editor: the couple retyped a slot's words. */
export const TEXT_EDIT_MESSAGE = "wren:text-edit";

type TextEditing = {
  /** True only in the editor's preview frame. */
  editable: boolean;
  selected: TextSlotId | null;
  select: (slot: TextSlotId | null) => void;
};

const DesignContext = createContext<SiteDesign>(DEFAULT_SITE_DESIGN);
const ReplayContext = createContext(0);
const TextEditingContext = createContext<TextEditing>({ editable: false, selected: null, select: () => {} });

/**
 * The design in force: the published one on the live site, the draft (as it
 * changes) in the editor's preview. For the parts of the page whose markup,
 * not just colour, depends on it -- the hero layout, section order.
 */
export function useSiteDesign() {
  return useContext(DesignContext);
}

/** Goes up by one each time the editor asks to replay the motion. */
export function useReplay() {
  return useContext(ReplayContext);
}

/** For SiteText: whether words can be clicked and retyped here, and which are picked. */
export function useTextEditing() {
  return useContext(TextEditingContext);
}

function postToEditor(data: object) {
  window.parent?.postMessage(data, window.location.origin);
}

/**
 * Wraps the guest site in a couple's theme.
 *
 * On the live site it just sets the colours and fonts. As the editor's preview
 * (`preview`) it also takes new designs from the editor by postMessage, so a
 * theme click restyles the page instantly instead of reloading it, and it
 * stops links and forms from working -- an RSVP sent from the preview would be
 * a real one.
 */
export function GuestSiteTheme({
  design: initial,
  preview = false,
  children,
}: {
  design: SiteDesign;
  preview?: boolean;
  children: ReactNode;
}) {
  const [design, setDesign] = useState(initial);
  const [replay, setReplay] = useState(0);
  const [selected, setSelected] = useState<TextSlotId | null>(null);
  // For the click handler, which is attached once.
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const textEditing = useMemo<TextEditing>(
    () => ({
      editable: preview,
      selected,
      select(slot) {
        setSelected(slot);
        postToEditor({ type: TEXT_SELECT_MESSAGE, slot });
      },
    }),
    [preview, selected],
  );

  useEffect(() => {
    if (!preview) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === DESIGN_MESSAGE) setDesign(parseSiteDesign(event.data.design));
      if (event.data?.type === REPLAY_MESSAGE) {
        window.scrollTo(0, 0);
        setReplay((r) => r + 1);
      }
      if (event.data?.type === CONFETTI_MESSAGE) window.dispatchEvent(new Event(RSVP_YES_EVENT));
      if (event.data?.type === TEXT_SELECT_MESSAGE) setSelected(event.data.slot ?? null);
    }
    function block(event: Event) {
      const target = event.target as Element | null;
      if (event.type === "submit") {
        event.preventDefault();
        return;
      }
      const link = target?.closest?.("a[href]");
      if (link && !link.getAttribute("href")?.startsWith("#")) event.preventDefault();
      // A click anywhere but on editable words puts the text toolbar away.
      if (!target?.closest?.("[data-site-text]")) {
        if (selectedRef.current) {
          setSelected(null);
          postToEditor({ type: TEXT_SELECT_MESSAGE, slot: null });
        }
      }
    }
    window.addEventListener("message", onMessage);
    document.addEventListener("click", block, true);
    document.addEventListener("submit", block, true);
    postToEditor({ type: READY_MESSAGE });
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", block, true);
      document.removeEventListener("submit", block, true);
    };
  }, [preview]);

  return (
    <>
      {/* React hoists this into <head>. The preview loads every face up
          front so switching theme or font doesn't flash a fallback. */}
      <link
        rel="stylesheet"
        href={preview ? ALL_FONTS_HREF : siteFontsHref(design)}
        precedence="default"
      />
      <div
        className="guest-site flex flex-1 flex-col bg-parchment font-body text-ink"
        style={designCssVars(design) as CSSProperties}
        data-scroll={design.motion.scroll}
        data-photo={design.motion.photo}
        data-opening={design.motion.opening}
        data-bg-scope={design.background.scope}
        data-bg-on={design.background.pattern !== "none" || design.background.texture !== "none" || undefined}
      >
        <DesignContext.Provider value={design}>
          <ReplayContext.Provider value={replay}>
            <TextEditingContext.Provider value={textEditing}>{children}</TextEditingContext.Provider>
          </ReplayContext.Provider>
        </DesignContext.Provider>
        <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 py-6 text-xs text-ink/50">
          <Link href="/" className="hover:text-ink">
            Made with You Do, I Do
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
        </footer>
      </div>
    </>
  );
}
