/**
 * Coming back to the guest site picks up where the couple left off
 * (owner, 2026-11-03): Guests › Guest site reopens the design they were last
 * editing, on the panel, section and preview they had open. Leaving through
 * "Your designs" goes back to the list, and the list is then where they left off.
 */

/** The design last open in the editor, read by /guests/site to reopen it. Per device. */
export const LAST_DESIGN_COOKIE = "site-editor-last";

/** "Your designs" from inside the editor: the list, not a bounce back into the editor. */
export const DESIGNS_LIST_HREF = "/guests/site?designs";

export function rememberDesign(designId: string) {
  document.cookie = `${LAST_DESIGN_COOKIE}=${encodeURIComponent(designId)}; path=/guests/site; max-age=${60 * 60 * 24 * 60}; samesite=lax`;
}

export function forgetDesign() {
  document.cookie = `${LAST_DESIGN_COOKIE}=; path=/guests/site; max-age=0; samesite=lax`;
}

/** What was open inside a design's editor, kept on this device. */
export type EditorView<Tab extends string, Section extends string> = {
  tab: Tab;
  lastTab?: Tab;
  section: Section | null;
  device: "desktop" | "phone";
};

const viewKey = (designId: string) => `site-editor-view:${designId}`;

export function readView<Tab extends string, Section extends string>(designId: string): Partial<EditorView<Tab, Section>> | null {
  try {
    const raw = JSON.parse(localStorage.getItem(viewKey(designId)) ?? "null");
    return raw && typeof raw === "object" ? raw : null;
  } catch {
    return null;
  }
}

export function keepView<Tab extends string, Section extends string>(designId: string, view: EditorView<Tab, Section>) {
  try {
    localStorage.setItem(viewKey(designId), JSON.stringify(view));
  } catch {
    // No storage: the editor just opens on Design next time.
  }
}
