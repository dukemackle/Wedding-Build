/**
 * What the guest site editor and its preview frame say to each other about
 * free elements (phase 2 of Editor v2). Kept apart from guest-site-theme.tsx,
 * which guests download, since only the editor and its frame use these.
 */

/** Both ways: what's picked. `id` null means the section itself. */
export const CANVAS_SELECT = "wren:canvas-select";
/** Frame to editor: a finished drag, resize, rotate or menu action, as the whole new canvas. */
export const CANVAS_COMMIT = "wren:canvas-commit";
/** Frame to editor: each section that holds elements, and its size now in the frame. */
export const CANVAS_FRAMES = "wren:canvas-frames";
/** Editor to frame: editing on (computer preview) or off (phone preview). */
export const CANVAS_MODE = "wren:canvas-mode";
/** Frame to editor: open the Position panel. */
export const CANVAS_PANEL = "wren:canvas-panel";
/** Frame to editor: undo or redo pressed while the frame had focus. */
export const CANVAS_KEY = "wren:canvas-key";

export type CanvasSelection = { section: string; id: string | null } | null;

/** Pixel sizes in the frame, plus a name for the Elements list. */
export type CanvasFrames = Record<string, { w: number; h: number; label: string }>;
