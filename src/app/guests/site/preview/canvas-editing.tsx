"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useSiteDesign } from "@/components/guest-site-theme";
import {
  GRID,
  alignPatch,
  duplicateElement,
  findElement,
  holdsElements,
  moveLayer,
  removeElement,
  snap,
  updateElement,
  type CanvasElement,
  type LayerMove,
  type SiteCanvas,
} from "@/lib/site-canvas";
import {
  CANVAS_COMMIT,
  CANVAS_FRAMES,
  CANVAS_KEY,
  CANVAS_MODE,
  CANVAS_PANEL,
  CANVAS_SELECT,
  type CanvasFrames,
  type CanvasSelection,
} from "../canvas-messages";

// Selection is Royal blue, snap guides Sky (CLAUDE.md palette).
const ROYAL = "#2243B6";
const SKY = "#00BFFE";
const NAVY = "#14203d";
// Tints of the two, for hover fills and quiet text.
const ROYAL_TINT = "rgb(34 67 182 / 0.1)";
const NAVY_SOFT = "rgb(20 32 61 / 0.65)";
const NAVY_LINE = "rgb(20 32 61 / 0.08)";
/** How close, in screen pixels, an edge has to come to a guide to snap to it. */
const SNAP_PX = 6;
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type Handle = (typeof HANDLES)[number];

type Box = Pick<CanvasElement, "x" | "y" | "w" | "h" | "rot">;

type Gesture = {
  kind: "move" | "rotate" | Handle;
  key: string;
  id: string;
  node: HTMLElement;
  layer: HTMLElement;
  startX: number;
  startY: number;
  start: Box;
  /** Screen pixels per frame unit. */
  scale: number;
  w: number;
  h: number;
  others: Box[];
  moved: boolean;
  /** For corner resizes of text: the size the words started at. */
  fontSize: number | null;
};

function post(data: object) {
  window.parent?.postMessage(data, window.location.origin);
}

function layerOf(key: string) {
  return document.querySelector<HTMLElement>(`[data-canvas-layer="${CSS.escape(key)}"]`);
}

function sectionNode(key: string) {
  return document.querySelector<HTMLElement>(`[data-canvas-section="${CSS.escape(key)}"]`);
}

function elementNode(key: string, id: string) {
  return layerOf(key)?.querySelector<HTMLElement>(`[data-el="${CSS.escape(id)}"]`) ?? null;
}

/** Puts a box on an element's node straight away, ahead of the round trip through the editor. */
function paint(node: HTMLElement, box: Box) {
  node.style.setProperty("--x", String(box.x));
  node.style.setProperty("--y", String(box.y));
  node.style.setProperty("--w", String(box.w));
  node.style.setProperty("--h", String(box.h));
  node.style.setProperty("--r", `${box.rot}deg`);
}

/**
 * Free-element editing inside the editor's preview frame (Editor v2, phase
 * 2): pick, drag, resize from the corners and sides, rotate, snap to the 8px
 * grid and to the section's and other elements' centres and edges, a floating
 * bar and a right-click menu. Only the preview page mounts it, so none of
 * this reaches guests.
 *
 * The frame never keeps a design of its own: each finished gesture is sent
 * up as a whole new canvas, the editor records it for undo and saves it, and
 * the design comes back down like any other change. During a drag the
 * element's own CSS variables are moved directly, so it follows the pointer
 * without a re-render per frame.
 */
export function CanvasEditing() {
  const { canvas } = useSiteDesign();
  const canvasRef = useRef(canvas);
  const [on, setOn] = useState(false);
  const [sel, setSel] = useState<CanvasSelection>(null);
  const selRef = useRef(sel);
  // The box mid-gesture, until the design it was made against is replaced.
  const [live, setLiveState] = useState<{ box: Box; base: SiteCanvas } | null>(null);
  const setLive = (box: Box | null) => setLiveState(box ? { box, base: canvasRef.current } : null);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [menu, setMenu] = useState<{ left: number; top: number } | null>(null);
  const [typing, setTyping] = useState(false);
  // The picked element's laid-out height in frame units: text grows with its words.
  const [textHeight, setTextHeight] = useState<{ id: string; h: number } | null>(null);
  const gesture = useRef<Gesture | null>(null);

  useEffect(() => {
    canvasRef.current = canvas;
  }, [canvas]);
  useEffect(() => {
    selRef.current = sel;
  }, [sel]);

  const selected = sel?.id ? findElement(canvas, sel.section, sel.id) : null;
  const liveBox = live && live.base === canvas ? live.box : null;
  const box: Box | null = liveBox ?? selected;

  function pick(next: CanvasSelection, tell = true) {
    setSel(next);
    selRef.current = next;
    setMenu(null);
    if (tell) post({ type: CANVAS_SELECT, selection: next });
  }

  function commit(next: SiteCanvas) {
    canvasRef.current = next;
    post({ type: CANVAS_COMMIT, canvas: next });
  }

  // Messages from the editor.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === CANVAS_MODE) {
        setOn(Boolean(event.data.on));
        if (!event.data.on) pick(null, false);
      }
      if (event.data?.type === CANVAS_SELECT) {
        const next = event.data.selection as CanvasSelection;
        pick(next, false);
        if (next?.id) elementNode(next.section, next.id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        else if (next) sectionNode(next.section)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The editor places new elements and lines things up against each
  // section's size, so it's told whenever that changes.
  useEffect(() => {
    let frame = 0;
    function report() {
      const frames: CanvasFrames = {};
      document.querySelectorAll<HTMLElement>("[data-canvas-section]").forEach((node) => {
        const key = node.dataset.canvasSection!;
        if (!holdsElements(key)) return;
        const rect = node.getBoundingClientRect();
        const heading = node.querySelector("h2, blockquote, figcaption")?.textContent?.trim();
        frames[key] = {
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          label: key === "hero" ? "Top of the page" : heading ? heading.slice(0, 40) : "Your block",
        };
      });
      post({ type: CANVAS_FRAMES, frames });
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(report);
    }
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [canvas]);

  // Text grows with its words, so its box is measured rather than stored.
  useLayoutEffect(() => {
    if (!sel?.id || selected?.kind !== "text") return;
    const node = elementNode(sel.section, sel.id);
    const layer = layerOf(sel.section);
    const w = canvas.sections[sel.section]?.w;
    if (!node || !layer || !w) return;
    const id = sel.id;
    const observer = new ResizeObserver(() => {
      const scale = layer.getBoundingClientRect().width / w;
      setTextHeight({ id, h: node.offsetHeight / scale });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [sel, selected, canvas]);

  function startGesture(kind: Gesture["kind"], key: string, id: string, event: PointerEvent, capture: Element) {
    const section = canvasRef.current.sections[key];
    const el = findElement(canvasRef.current, key, id);
    const node = elementNode(key, id);
    const layer = layerOf(key);
    const wrapper = sectionNode(key);
    if (!section || !el || !node || !layer || !wrapper) return;
    const scale = layer.getBoundingClientRect().width / section.w;
    gesture.current = {
      kind,
      key,
      id,
      node,
      layer,
      startX: event.clientX,
      startY: event.clientY,
      start: { x: el.x, y: el.y, w: el.w, h: el.kind === "text" ? node.offsetHeight / scale : el.h, rot: el.rot },
      scale,
      w: section.w,
      h: wrapper.getBoundingClientRect().height / scale,
      others: section.elements.filter((o) => o.id !== id && !o.hidden),
      moved: false,
      fontSize: el.kind === "text" ? el.size : null,
    };
    (capture as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function startTyping(key: string, id: string) {
    const words = elementNode(key, id)?.querySelector<HTMLElement>(".site-el-words");
    if (!words) return;
    setTyping(true);
    setMenu(null);
    const before = words.innerText;
    words.contentEditable = "plaintext-only";
    words.focus();
    document.getSelection()?.selectAllChildren(words);
    function finish() {
      words!.removeEventListener("blur", finish);
      words!.removeEventListener("keydown", onKey);
      words!.removeAttribute("contenteditable");
      setTyping(false);
      const text = words!.innerText.replace(/\n{3,}/g, "\n\n").trim().slice(0, 500);
      if (text === before.trim()) return;
      const section = canvasRef.current.sections[key];
      const layer = layerOf(key);
      const node = elementNode(key, id);
      if (!text) {
        commit(removeElement(canvasRef.current, key, id));
        pick(null);
        return;
      }
      const scale = layer && section ? layer.getBoundingClientRect().width / section.w : 1;
      const h = node ? Math.max(GRID, Math.round(node.offsetHeight / scale)) : undefined;
      commit(updateElement(canvasRef.current, key, id, { text, ...(h ? { h } : {}) } as Partial<CanvasElement>));
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" || (event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        words!.blur();
      }
    }
    words.addEventListener("blur", finish);
    words.addEventListener("keydown", onKey);
  }

  // Picking and dragging. Attached to the document so a press anywhere on
  // the page is seen first, before the page's own handlers.
  useEffect(() => {
    if (!on) return;

    function onDown(event: PointerEvent) {
      if (event.button !== 0) return;
      const target = event.target as Element;
      if (target.closest("[data-canvas-ui]")) return;
      const current = selRef.current;
      const handle = target.closest<HTMLElement>("[data-canvas-handle]");
      if (handle && current?.id) {
        event.preventDefault();
        startGesture(handle.dataset.canvasHandle as Gesture["kind"], current.section, current.id, event, handle);
        return;
      }
      const elNode = target.closest<HTMLElement>("[data-el]");
      const layer = elNode?.closest<HTMLElement>("[data-canvas-layer]");
      if (elNode && layer) {
        const key = layer.dataset.canvasLayer!;
        const id = elNode.dataset.el!;
        if (current?.id === id && elNode.querySelector("[contenteditable='plaintext-only']")) return;
        event.preventDefault();
        if (current?.id !== id || current.section !== key) pick({ section: key, id });
        const el = findElement(canvasRef.current, key, id);
        if (el && !el.locked) startGesture("move", key, id, event, elNode);
        return;
      }
      // Headings and names keep phase 1's click-to-restyle.
      if (target.closest("[data-site-text]")) {
        if (current) pick(null);
        return;
      }
      const section = target.closest<HTMLElement>("[data-canvas-section]");
      const key = section?.dataset.canvasSection ?? null;
      if (key) {
        if (current?.section !== key || current.id) pick({ section: key, id: null });
      } else if (current) {
        pick(null);
      }
    }

    function onMove(event: PointerEvent) {
      const g = gesture.current;
      if (!g) return;
      const dx = (event.clientX - g.startX) / g.scale;
      const dy = (event.clientY - g.startY) / g.scale;
      if (!g.moved && Math.hypot(event.clientX - g.startX, event.clientY - g.startY) < 3) return;
      g.moved = true;
      const free = event.altKey;
      let next: Box;
      let lines = { x: [] as number[], y: [] as number[] };
      if (g.kind === "move") {
        [next, lines] = snapMove({ ...g.start, x: g.start.x + dx, y: g.start.y + dy }, g, free);
      } else if (g.kind === "rotate") {
        const rect = g.layer.getBoundingClientRect();
        const cx = rect.left + (g.start.x + g.start.w / 2) * g.scale;
        const cy = rect.top + (g.start.y + g.start.h / 2) * g.scale;
        let angle = (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI + 90;
        if (angle > 180) angle -= 360;
        if (!free) angle = Math.round(angle / 15) * 15;
        next = { ...g.start, rot: Math.round(angle) };
      } else {
        next = resize(g, dx, dy, free);
      }
      if (g.fontSize !== null && g.kind.length === 2) {
        // A text box's corners scale the words with it.
        g.node.querySelector<HTMLElement>(".site-el-words")?.style.setProperty("--fs", String(scaledFont(g, next)));
      }
      paint(g.node, next);
      setLive(next);
      setGuides(lines);
    }

    function onUp() {
      const g = gesture.current;
      gesture.current = null;
      setGuides({ x: [], y: [] });
      if (!g?.moved) {
        setLive(null);
        return;
      }
      const box = readBox(g.node);
      const el = findElement(canvasRef.current, g.key, g.id);
      if (["x", "y", "w", "h", "rot"].every((k) => box[k as keyof Box] === Math.round(g.start[k as keyof Box]))) {
        setLive(null);
        return;
      }
      const patch: Partial<CanvasElement> = { ...box };
      if (el?.kind === "text") {
        if (g.fontSize !== null && g.kind.length === 2) (patch as Partial<typeof el>).size = scaledFont(g, box);
        patch.h = Math.max(GRID, Math.round(g.node.offsetHeight / g.scale));
      }
      // The live box stays up until the design comes back with the change.
      commit(updateElement(canvasRef.current, g.key, g.id, patch));
    }

    function onContextMenu(event: MouseEvent) {
      const target = event.target as Element;
      const elNode = target.closest<HTMLElement>("[data-el]");
      const layer = elNode?.closest<HTMLElement>("[data-canvas-layer]");
      if (!elNode || !layer) return;
      event.preventDefault();
      pick({ section: layer.dataset.canvasLayer!, id: elNode.dataset.el! });
      setMenu({ left: event.clientX, top: event.clientY });
    }

    function onDoubleClick(event: MouseEvent) {
      const elNode = (event.target as Element).closest<HTMLElement>("[data-el]");
      const current = selRef.current;
      if (!elNode || !current?.id || elNode.dataset.el !== current.id) return;
      const el = findElement(canvasRef.current, current.section, current.id);
      if (el?.kind === "text" && !el.locked) startTyping(current.section, el.id);
    }

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    document.documentElement.dataset.canvasOn = "";
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
      delete document.documentElement.dataset.canvasOn;
    };
    // The handlers read everything through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  function act(action: "duplicate" | "delete" | "lock" | "hide" | LayerMove | "centre" | "position" | "edit") {
    const current = selRef.current;
    setMenu(null);
    if (!current?.id) return;
    const { section: key, id } = current;
    const c = canvasRef.current;
    const el = findElement(c, key, id);
    if (!el) return;
    if (action === "duplicate") {
      const [next, copy] = duplicateElement(c, key, id);
      commit(next);
      if (copy) pick({ section: key, id: copy });
    } else if (action === "delete") {
      commit(removeElement(c, key, id));
      pick(null);
    } else if (action === "lock") {
      commit(updateElement(c, key, id, { locked: !el.locked }));
    } else if (action === "hide") {
      commit(updateElement(c, key, id, { hidden: true }));
      pick(null);
    } else if (action === "centre") {
      commit(updateElement(c, key, id, alignPatch(el, "centre", c.sections[key]!.w, 0)));
    } else if (action === "position") {
      post({ type: CANVAS_PANEL, panel: "position" });
    } else if (action === "edit") {
      startTyping(key, id);
    } else {
      commit(moveLayer(c, key, id, action));
    }
  }

  // Keys while the frame has focus. Undo and redo belong to the editor.
  useEffect(() => {
    if (!on) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && (key === "z" || key === "y")) {
        event.preventDefault();
        post({ type: CANVAS_KEY, action: key === "z" && !event.shiftKey ? "undo" : "redo" });
        return;
      }
      const current = selRef.current;
      if (!current?.id) return;
      const el = findElement(canvasRef.current, current.section, current.id);
      if (!el) return;
      if (event.key === "Escape") {
        pick(null);
      } else if (event.key === "Delete" || event.key === "Backspace") {
        act("delete");
      } else if (mod && key === "d") {
        act("duplicate");
      } else if (event.key === "Enter" && el.kind === "text") {
        act("edit");
      } else if (event.key.startsWith("Arrow") && !el.locked) {
        const step = event.altKey ? 1 : event.shiftKey ? GRID * 4 : GRID;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        commit(updateElement(canvasRef.current, current.section, current.id, { x: el.x + dx, y: el.y + dy }));
      } else {
        return;
      }
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  // The menu closes on any scroll or click elsewhere.
  useEffect(() => {
    if (!menu) return;
    const close = (event: Event) => {
      if (!(event.target as Element)?.closest?.("[data-canvas-ui]")) setMenu(null);
    };
    window.addEventListener("scroll", close, true);
    document.addEventListener("pointerdown", close, true);
    return () => {
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("pointerdown", close, true);
    };
  }, [menu]);

  if (!on) return null;

  const layer = sel ? layerOf(sel.section) : null;
  const sectionW = sel ? (canvas.sections[sel.section]?.w ?? null) : null;
  const shown = box && selected && !selected.hidden;
  const height = selected?.kind === "text" && !liveBox ? (textHeight?.id === selected.id ? textHeight.h : selected.h) : (box?.h ?? 0);

  return (
    <>
      <style>{editorCss(sel)}</style>
      {layer &&
        sectionW &&
        shown &&
        createPortal(
          <>
            <Selection box={{ ...box, h: height }} locked={selected.locked} text={selected.kind === "text"} />
            {!liveBox && !typing && (
              <FloatingBar
                box={{ ...box, h: height }}
                locked={selected.locked}
                text={selected.kind === "text"}
                onAct={act}
                onMore={(rect) => setMenu({ left: rect.left, top: rect.bottom + 6 })}
              />
            )}
            {guides.x.map((x) => (
              <span key={`x${x}`} aria-hidden="true" style={guideStyle("x", x)} />
            ))}
            {guides.y.map((y) => (
              <span key={`y${y}`} aria-hidden="true" style={guideStyle("y", y)} />
            ))}
          </>,
          layer,
        )}
      {menu && selected && (
        <ContextMenu at={menu} locked={selected.locked} text={selected.kind === "text"} onAct={act} />
      )}
    </>
  );
}

/** The box as last painted on the node, in frame units, snapped to whole numbers. */
function readBox(node: HTMLElement): Box {
  const read = (name: string) => Number.parseFloat(node.style.getPropertyValue(name));
  return {
    x: Math.round(read("--x")),
    y: Math.round(read("--y")),
    w: Math.max(GRID, Math.round(read("--w"))),
    h: Math.max(1, Math.round(read("--h"))),
    rot: Math.round(Number.parseFloat(node.style.getPropertyValue("--r")) || 0),
  };
}

function scaledFont(g: Gesture, box: Box) {
  return Math.max(8, Math.min(400, Math.round((g.fontSize ?? 16) * (box.w / g.start.w))));
}

/**
 * A move, snapped: to the section's edges and centre, then to other
 * elements' edges and centres, then to the grid. Alt places freely.
 */
function snapMove(box: Box, g: Gesture, free: boolean): [Box, { x: number[]; y: number[] }] {
  if (free) return [{ ...box, x: Math.round(box.x), y: Math.round(box.y) }, { x: [], y: [] }];
  const threshold = SNAP_PX / g.scale;
  const xs = [0, g.w / 2, g.w, ...g.others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])];
  const ys = [0, g.h / 2, g.h, ...g.others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])];
  const fit = (start: number, size: number, lines: number[]) => {
    let best: { shift: number; line: number } | null = null;
    for (const edge of [start, start + size / 2, start + size]) {
      for (const line of lines) {
        const shift = line - edge;
        if (Math.abs(shift) <= threshold && (!best || Math.abs(shift) < Math.abs(best.shift))) best = { shift, line };
      }
    }
    return best;
  };
  const sx = fit(box.x, box.w, xs);
  const sy = fit(box.y, box.h, ys);
  const x = sx ? box.x + sx.shift : snap(box.x);
  const y = sy ? box.y + sy.shift : snap(box.y);
  // Every guide the snapped box now touches, not just the one that pulled it.
  const touching = (start: number, size: number, lines: number[]) =>
    [...new Set(lines.filter((l) => [start, start + size / 2, start + size].some((e) => Math.abs(e - l) < 0.5)))];
  return [
    { ...box, x: Math.round(x), y: Math.round(y) },
    { x: sx ? touching(x, box.w, xs) : [], y: sy ? touching(y, box.h, ys) : [] },
  ];
}

/**
 * A resize from one handle, worked out in the element's own rotated frame so
 * the opposite corner or side stays put. Corners keep the proportions.
 */
function resize(g: Gesture, dx: number, dy: number, free: boolean): Box {
  const { start } = g;
  const kind = g.kind as Handle;
  const theta = (start.rot * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const lx = dx * cos + dy * sin;
  const ly = -dx * sin + dy * cos;
  const sx = kind.includes("e") ? 1 : kind.includes("w") ? -1 : 0;
  const sy = kind.includes("s") ? 1 : kind.includes("n") ? -1 : 0;
  const round = (n: number) => Math.max(GRID, free ? Math.round(n) : snap(n));
  let w = sx ? round(start.w + sx * lx) : start.w;
  let h = sy ? round(start.h + sy * ly) : start.h;
  if (sx && sy) {
    const ratio = start.w / start.h;
    if (Math.abs(w / start.w) >= Math.abs(h / start.h)) h = Math.max(1, Math.round(w / ratio));
    else w = Math.max(GRID, Math.round(h * ratio));
  }
  const dw = w - start.w;
  const dh = h - start.h;
  // The centre moves by half the growth, turned back into page axes.
  const cx = (sx * dw) / 2;
  const cy = (sy * dh) / 2;
  const centreX = start.x + start.w / 2 + cx * cos - cy * sin;
  const centreY = start.y + start.h / 2 + cx * sin + cy * cos;
  return { ...start, w, h, x: Math.round(centreX - w / 2), y: Math.round(centreY - h / 2) };
}

/** A box placed in its layer the same way the element itself is (globals.css, .site-el). */
function placed(box: Box): CSSProperties {
  return {
    position: "absolute",
    left: `calc(${box.x} / var(--W) * 100cqw)`,
    top: `calc(${box.y} / var(--W) * 100cqw)`,
    width: `calc(${box.w} / var(--W) * 100cqw)`,
    height: `calc(${box.h} / var(--W) * 100cqw)`,
    transform: `rotate(${box.rot}deg)`,
  };
}

function Selection({ box, locked, text }: { box: Box; locked: boolean; text: boolean }) {
  return (
    <div aria-hidden="true" style={{ ...placed(box), outline: `2px solid ${ROYAL}`, outlineOffset: 1, zIndex: 20 }}>
      {!locked &&
        HANDLES.filter((h) => !(text && (h === "n" || h === "s"))).map((h) => (
          <span key={h} data-canvas-handle={h} style={handleStyle(h)} />
        ))}
      {!locked && (
        <span data-canvas-handle="rotate" title="Rotate" style={rotateStyle}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ROYAL} strokeWidth="2.6" strokeLinecap="round" style={{ pointerEvents: "none" }}>
            <path d="M20 12a8 8 0 1 1-2.3-5.6" />
            <path d="M20 4v4h-4" />
          </svg>
        </span>
      )}
    </div>
  );
}

const CURSORS: Record<Handle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

function handleStyle(h: Handle): CSSProperties {
  const side = h.length === 1;
  const vertical = h === "n" || h === "s";
  const w = side ? (vertical ? 20 : 6) : 12;
  const ht = side ? (vertical ? 6 : 20) : 12;
  const x = h.includes("w") ? "0%" : h.includes("e") ? "100%" : "50%";
  const y = h.includes("n") ? "0%" : h.includes("s") ? "100%" : "50%";
  return {
    position: "absolute",
    left: x,
    top: y,
    width: w,
    height: ht,
    transform: "translate(-50%, -50%)",
    background: "#fff",
    border: `1.5px solid ${ROYAL}`,
    borderRadius: side ? 3 : 999,
    boxShadow: "0 1px 3px rgba(20,32,61,.25)",
    cursor: CURSORS[h],
    pointerEvents: "auto",
    touchAction: "none",
  };
}

const rotateStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "100%",
  width: 24,
  height: 24,
  marginTop: 14,
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  border: `1.5px solid ${ROYAL}`,
  borderRadius: 999,
  boxShadow: "0 1px 3px rgba(20,32,61,.25)",
  cursor: "grab",
  pointerEvents: "auto",
  touchAction: "none",
};

function guideStyle(axis: "x" | "y", at: number): CSSProperties {
  return axis === "x"
    ? { position: "absolute", top: "-100vh", bottom: "-100vh", left: `calc(${at} / var(--W) * 100cqw)`, width: 1, background: SKY, zIndex: 30, pointerEvents: "none" }
    : { position: "absolute", left: 0, right: 0, top: `calc(${at} / var(--W) * 100cqw)`, height: 1, background: SKY, zIndex: 30, pointerEvents: "none" };
}

function FloatingBar({
  box,
  locked,
  text,
  onAct,
  onMore,
}: {
  box: Box;
  locked: boolean;
  text: boolean;
  onAct: (action: "duplicate" | "delete" | "lock" | "edit") => void;
  onMore: (rect: DOMRect) => void;
}) {
  // Above the element, or below it when it's at the very top of the section.
  const above = box.y > 72;
  return (
    <div
      data-canvas-ui
      role="toolbar"
      aria-label="Element"
      style={{
        position: "absolute",
        left: `calc(${box.x + box.w / 2} / var(--W) * 100cqw)`,
        top: above ? `calc(${box.y} / var(--W) * 100cqw - 56px)` : `calc(${box.y + box.h} / var(--W) * 100cqw + 52px)`,
        transform: "translateX(-50%)",
        display: "flex",
        gap: 2,
        padding: 4,
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 2px 10px rgba(20,32,61,.18)",
        zIndex: 40,
        pointerEvents: "auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {text && !locked && (
        <BarButton label="Edit words" onClick={() => onAct("edit")}>
          <path d="M4 20h4L19 9l-4-4L4 16v4z" />
        </BarButton>
      )}
      <BarButton label={locked ? "Unlock" : "Lock"} pressed={locked} onClick={() => onAct("lock")}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d={locked ? "M8 11V8a4 4 0 0 1 8 0v3" : "M8 11V8a4 4 0 0 1 7.5-2"} />
      </BarButton>
      <BarButton label="Duplicate" onClick={() => onAct("duplicate")}>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </BarButton>
      <BarButton label="Delete" onClick={() => onAct("delete")}>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </BarButton>
      <BarButton label="More" onClick={(e) => onMore(e.currentTarget.getBoundingClientRect())}>
        <circle cx="5" cy="12" r="1.2" />
        <circle cx="12" cy="12" r="1.2" />
        <circle cx="19" cy="12" r="1.2" />
      </BarButton>
    </div>
  );
}

function BarButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        borderRadius: 8,
        cursor: "pointer",
        background: pressed ? ROYAL_TINT : "transparent",
        color: pressed ? ROYAL : NAVY,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

type MenuAction = "duplicate" | "delete" | "lock" | "hide" | LayerMove | "centre" | "position" | "edit";

function ContextMenu({
  at,
  locked,
  text,
  onAct,
}: {
  at: { left: number; top: number };
  locked: boolean;
  text: boolean;
  onAct: (action: MenuAction) => void;
}) {
  const groups: [MenuAction, string, string?][][] = [
    [
      ...(text && !locked ? [["edit", "Edit words", "Enter"] as [MenuAction, string, string]] : []),
      ["duplicate", "Duplicate", "Ctrl+D"],
      ["delete", "Delete", "Del"],
      ["lock", locked ? "Unlock" : "Lock"],
      ["hide", "Hide"],
    ],
    [
      ["forward", "Bring forward"],
      ["backward", "Send backward"],
      ["front", "Bring to front"],
      ["back", "Send to back"],
    ],
    [
      ["centre", "Centre in section"],
      ["position", "Position…"],
    ],
  ];
  // Kept on screen near the right and bottom edges.
  const left = Math.min(at.left, window.innerWidth - 228);
  const top = Math.min(at.top, window.innerHeight - 340);
  return (
    <div
      data-canvas-ui
      role="menu"
      style={{
        position: "fixed",
        left,
        top,
        width: 220,
        padding: 6,
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 6px 24px rgba(20,32,61,.22)",
        zIndex: 1000,
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        color: NAVY,
      }}
    >
      {groups.map((group, i) => (
        <div key={i} style={i ? { borderTop: `1px solid ${NAVY_LINE}`, marginTop: 4, paddingTop: 4 } : undefined}>
          {group.map(([action, label, keys]) => (
            <button
              key={action}
              type="button"
              role="menuitem"
              onClick={() => onAct(action)}
              className="canvas-menu-item"
              style={{
                width: "100%",
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
                border: 0,
                borderRadius: 6,
                background: "transparent",
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
                textAlign: "left",
              }}
            >
              {label}
              {keys && <span style={{ color: NAVY_SOFT, fontSize: 12 }}>{keys}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Hover outlines, the picked section's outline and the menu's hover, for the frame only. */
function editorCss(sel: CanvasSelection) {
  const picked = sel && !sel.id ? `[data-canvas-section="${CSS.escape(sel.section)}"]` : null;
  return `
[data-canvas-on] .site-el { cursor: move; touch-action: none; }
[data-canvas-on] .site-el:hover { outline: 1px solid ${ROYAL}; outline-offset: 1px; }
[data-canvas-on] .site-el-words[contenteditable] { cursor: text; outline: none; user-select: text; }
[data-canvas-on] [data-canvas-section]:hover:not(:has(.site-el:hover, [data-site-text]:hover)) { outline: 1px dashed rgb(34 67 182 / 0.6); outline-offset: -1px; }
${picked ? `${picked}, ${picked}:hover { outline: 2px solid ${ROYAL} !important; outline-offset: -2px; }` : ""}
.canvas-menu-item:hover { background: ${ROYAL_TINT} !important; color: ${ROYAL}; }
[data-canvas-on] .site-canvas { overflow: visible; }
`;
}
