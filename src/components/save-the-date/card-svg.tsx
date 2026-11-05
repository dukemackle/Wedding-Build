"use client";

import { isInvitationTemplate } from "@/lib/save-the-date/invitations";
import QRCode from "qrcode";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { fontById } from "@/lib/site-design";
import { BACK_QR, backQrUrl, backTemplate } from "@/lib/save-the-date/back";
import { hasNumericDate, layerText, wrapText } from "@/lib/save-the-date/format";
import { cardPalette, templateById } from "@/lib/save-the-date/templates";
import { ARTBOARD, type CardDoc, type ColorRole, type Layer, type LayerOverride, type Palette, type TextLayer } from "@/lib/save-the-date/types";
import { ART } from "./art";

type Props = {
  doc: CardDoc;
  className?: string;
  /** Editor mode: layers can be picked and dragged. */
  editable?: boolean;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  /** A finished drag, in artboard units. */
  onMove?: (id: string, dx: number, dy: number) => void;
  /** A double-click on words: retype them. */
  onEdit?: (id: string) => void;
  /** Hands over the drawn <svg>, for export. */
  svgRef?: (el: SVGSVGElement | null) => void;
  title?: string;
  /** Editor mode: the "Add your photo" button in an empty photo frame. */
  onAddPhoto?: () => void;
  /** Which side to draw. The back is the Details layout in this design's colours (back.ts). */
  side?: "front" | "back";
  /** The back's website, e.g. youdoido.com/w/alex-and-jordan; null while the site is off. */
  site?: string | null;
};

/** Relative luminance-ish, 0-255: enough to tell a dark paper from a light one. */
function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
}

/** A QR code's dark modules as one path, one unit per module. */
function qrPath(url: string) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  let d = "";
  for (let y = 0; y < modules.size; y++)
    for (let x = 0; x < modules.size; x++) if (modules.get(y, x)) d += `M${x} ${y}h1v1h-1z`;
  return { d, size: modules.size };
}

/** Where scaling pivots: a text's anchor point, a picture's centre. */
function pivot(layer: Layer): [number, number] {
  if (layer.kind === "text") return [layer.x, layer.y];
  if (layer.kind === "photo") return [layer.x + layer.w / 2, layer.y + layer.h / 2];
  const def = ART[layer.art];
  return [layer.x + layer.w / 2, layer.y + (layer.w * (def?.aspect ?? 1)) / 2];
}

/** A drawn layer's box on the artboard, after its move and resize. */
export function layerBox(svg: SVGSVGElement, layer: Layer, o: LayerOverride | undefined) {
  const g = svg.querySelector<SVGGElement>(`[data-layer="${layer.id}"]`);
  if (!g) return null;
  const b = g.getBBox();
  const s = o?.scale ?? 1;
  const [px, py] = pivot(layer);
  return { x: px + s * (b.x - px) + (o?.dx ?? 0), y: py + s * (b.y - py) + (o?.dy ?? 0), w: b.width * s, h: b.height * s };
}

/** How close (artboard units) an edge or centre must come before it snaps. */
const SNAP = 12;

function overrideTransform(layer: Layer, o: LayerOverride | undefined, live: [number, number] | null) {
  const dx = (o?.dx ?? 0) + (live?.[0] ?? 0);
  const dy = (o?.dy ?? 0) + (live?.[1] ?? 0);
  const s = o?.scale ?? 1;
  if (!dx && !dy && s === 1) return undefined;
  const [px, py] = pivot(layer);
  return `translate(${dx} ${dy})${s !== 1 ? ` translate(${px} ${py}) scale(${s}) translate(${-px} ${-py})` : ""}`;
}

/**
 * One card, drawn. The same component is the gallery thumbnail, the editor
 * canvas, the guest's reveal and the source of the PNG/PDF export, so what
 * the couple designs is exactly what guests get.
 */
export function CardSvg({ doc, className, editable, selected, onSelect, onMove, onEdit, svgRef, title, onAddPhoto, side = "front", site = null }: Props) {
  const uid = useId().replace(/:/g, "");
  const back = side === "back";
  const t = back ? backTemplate(templateById(doc.template), doc, site) : templateById(doc.template);
  const rsvp = Boolean(doc.back?.rsvp);
  const qr = useMemo(() => (back ? qrPath(backQrUrl(site, rsvp)) : null), [back, site, rsvp]);
  const palette = cardPalette(doc);
  const pairing = t.pairings.find((p) => p.id === doc.fonts) ?? t.pairings[0];
  const own = useRef<SVGSVGElement | null>(null);

  // Long names shrink to their layer's width rather than running off the card.
  const [fit, setFit] = useState<Record<string, number>>({});
  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    if (!document.fonts) return;
    const bump = () => setFontsTick((n) => n + 1);
    document.fonts.addEventListener("loadingdone", bump);
    document.fonts.ready.then(bump);
    return () => document.fonts.removeEventListener("loadingdone", bump);
  }, []);
  useLayoutEffect(() => {
    const svg = own.current;
    if (!svg) return;
    const next: Record<string, number> = {};
    let changed = false;
    svg.querySelectorAll<SVGTextElement>("text[data-fit]").forEach((el) => {
      const id = el.dataset.fit!;
      const max = Number(el.dataset.max);
      const current = fit[id] ?? 1;
      // Arched text's box is the arch's chord, so measure its run instead.
      const natural = (el.dataset.arc ? el.getComputedTextLength() : el.getBBox().width) / current;
      const want = natural > max ? Math.max(0.3, max / natural) : 1;
      next[id] = want;
      if (Math.abs(want - current) > 0.005) changed = true;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- text can only be measured once drawn
    if (changed) setFit(next);
    // fit is read, not a dependency: re-measuring after our own update would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, fontsTick, side, site]);

  const layers = doc.photo || !t.noPhotoLayers ? t.layers : t.noPhotoLayers;

  // Dragging, in artboard units.
  const [drag, setDrag] = useState<{ id: string; x0: number; y0: number; dx: number; dy: number } | null>(null);
  const toArtboard = (e: { clientX: number; clientY: number }) => {
    const svg = own.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return [p.x, p.y] as const;
  };
  // Snapping: the moving layer's edges and centre line up with the card's
  // centre and with the other layers' edges and centres, measured at the start.
  const snap = useRef<{ box: { x: number; y: number; w: number; h: number }; xs: number[]; ys: number[] } | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const startDrag = (id: string) => (e: ReactPointerEvent) => {
    if (!editable) return;
    e.stopPropagation();
    onSelect?.(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const [x, y] = toArtboard(e);
    const svg = own.current!;
    const me = layers.find((l) => l.id === id);
    const box = me ? layerBox(svg, me, doc.overrides[id]) : null;
    const xs = [ARTBOARD.w / 2];
    const ys = [ARTBOARD.h / 2];
    for (const l of layers) {
      if (l.id === id || l.kind === "photo" || doc.overrides[l.id]?.hidden) continue;
      const b = layerBox(svg, l, doc.overrides[l.id]);
      if (!b || !b.w) continue;
      xs.push(b.x, b.x + b.w / 2, b.x + b.w);
      ys.push(b.y + b.h / 2);
    }
    snap.current = box ? { box, xs, ys } : null;
    setDrag({ id, x0: x, y0: y, dx: 0, dy: 0 });
  };
  const moveDrag = (e: ReactPointerEvent) => {
    if (!drag) return;
    const [x, y] = toArtboard(e);
    let dx = x - drag.x0;
    let dy = y - drag.y0;
    const next: { x?: number; y?: number } = {};
    const sn = snap.current;
    if (sn && !e.altKey) {
      const best = (edges: number[], targets: number[]) => {
        let hit: { by: number; at: number } | null = null;
        for (const edge of edges)
          for (const t of targets) if (Math.abs(t - edge) < SNAP && (!hit || Math.abs(t - edge) < Math.abs(hit.by))) hit = { by: t - edge, at: t };
        return hit;
      };
      const { box } = sn;
      const hx = best([box.x + dx, box.x + box.w / 2 + dx, box.x + box.w + dx], sn.xs);
      if (hx) {
        dx += hx.by;
        next.x = hx.at;
      }
      const hy = best([box.y + box.h / 2 + dy], sn.ys);
      if (hy) {
        dy += hy.by;
        next.y = hy.at;
      }
    }
    if (next.x !== guides.x || next.y !== guides.y) setGuides(next);
    setDrag({ ...drag, dx, dy });
  };
  const endDrag = () => {
    if (!drag) return;
    if (Math.abs(drag.dx) + Math.abs(drag.dy) > 1) onMove?.(drag.id, drag.dx, drag.dy);
    setDrag(null);
    setGuides({});
    snap.current = null;
  };

  // The selected layer's outline, measured after drawing.
  const [box, setBox] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    const g = editable && selected ? own.current?.querySelector<SVGGElement>(`[data-layer="${selected}"]`) : null;
    setBox(g ? g.getBBox() : null);
  }, [editable, selected, doc, fit, drag]);

  const metal = palette.metal;
  const paint = (role: ColorRole | undefined, o?: LayerOverride) =>
    o?.color ?? (role === "accent" && metal ? `url(#foil-${uid})` : palette[role ?? "ink"]);
  const family = (layer: TextLayer, o?: LayerOverride) =>
    fontById(o?.font ?? pairing[layer.font])?.css ?? "serif";

  return (
    <svg
      ref={(el) => {
        own.current = el;
        svgRef?.(el);
      }}
      viewBox={`0 0 ${ARTBOARD.w} ${ARTBOARD.h}`}
      className={className}
      role="img"
      aria-label={title ?? (back ? `Back of the card: ${site ?? "the wedding website"}` : `${isInvitationTemplate(doc.template) ? "Invitation" : "Save the date"}: ${doc.content.nameA} and ${doc.content.nameB}`)}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerDown={editable ? () => onSelect?.(null) : undefined}
      style={{ touchAction: editable ? "none" : undefined }}
    >
      <defs>
        {metal && (
          <linearGradient id={`foil-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={ARTBOARD.w} y2={ARTBOARD.h}>
            <stop offset="0" stopColor={metal[1]} />
            <stop offset="0.28" stopColor={metal[0]} />
            <stop offset="0.5" stopColor={metal[2]} />
            <stop offset="0.72" stopColor={metal[0]} />
            <stop offset="1" stopColor={metal[1]} />
          </linearGradient>
        )}
        <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 1.4 -0.45" />
        </filter>
        <filter id={`mono-${uid}`}>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.12" intercept="-0.04" />
            <feFuncG type="linear" slope="1.12" intercept="-0.04" />
            <feFuncB type="linear" slope="1.12" intercept="-0.04" />
          </feComponentTransfer>
        </filter>
        <filter id={`warm-${uid}`}>
          <feColorMatrix values="1.08 0.05 0 0 0.02  0.02 1 0.02 0 0.01  0 0.02 0.86 0 0  0 0 0 1 0" />
        </filter>
        <filter id={`lift-${uid}`} x="-10%" y="-30%" width="120%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <linearGradient id={`scrimTop-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="1" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={ARTBOARD.w} height={ARTBOARD.h} fill={palette.paper} />

      {layers.map((layer) => {
        const o = doc.overrides[layer.id];
        if (o?.hidden) return null;
        if (layer.kind === "art" && layer.when && (layer.when === "numericDate") !== hasNumericDate(doc.content)) return null;
        const live = drag?.id === layer.id ? ([drag.dx, drag.dy] as [number, number]) : null;
        return (
          <g
            key={layer.id}
            data-layer={layer.id}
            transform={overrideTransform(layer, o, live)}
            onPointerDown={editable ? startDrag(layer.id) : undefined}
            onDoubleClick={editable && layer.kind === "text" ? () => onEdit?.(layer.id) : undefined}
            style={editable ? { cursor: drag?.id === layer.id ? "grabbing" : "grab" } : undefined}
          >
            {renderLayer(layer, o)}
          </g>
        );
      })}

      {t.grain ? (
        <rect width={ARTBOARD.w} height={ARTBOARD.h} filter={`url(#grain-${uid})`} opacity={t.grain * 6} style={{ mixBlendMode: "multiply" }} pointerEvents="none" />
      ) : null}

      {qr && (() => {
        // Drawn over the paper grain, which would speckle the code. Phones read dark modules on a light ground most reliably, so the code
        // takes the darker of paper and ink on the lighter, on a tile if the paper is dark.
        const [dark, lighter] = lum(palette.paper) < lum(palette.ink) ? [palette.paper, palette.ink] : [palette.ink, palette.paper];
        // Too little between them to scan (a dark ink set on a badge): white tile, darkest ink.
        const light = lum(lighter) - lum(dark) < 110 ? "#ffffff" : lighter;
        const pad = 26;
        const k = BACK_QR.w / qr.size;
        return (
          <g data-layer="back-qr" opacity={site ? 1 : 0.35}>
            <rect x={BACK_QR.x - pad} y={BACK_QR.y - pad} width={BACK_QR.w + pad * 2} height={BACK_QR.w + pad * 2} rx={16} fill={light} />
            <path d={qr.d} transform={`translate(${BACK_QR.x} ${BACK_QR.y}) scale(${k})`} fill={dark} shapeRendering="crispEdges" />
          </g>
        );
      })()}

      {editable && drag && guides.x !== undefined && (
        <line data-editor-only x1={guides.x} x2={guides.x} y1={0} y2={ARTBOARD.h} stroke="#00BFFE" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
      )}
      {editable && drag && guides.y !== undefined && (
        <line data-editor-only x1={0} x2={ARTBOARD.w} y1={guides.y} y2={guides.y} stroke="#00BFFE" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
      )}

      {editable && box && (
        <rect
          data-editor-only
          x={box.x - 12}
          y={box.y - 12}
          width={box.width + 24}
          height={box.height + 24}
          transform={(() => {
            const l = layers.find((x) => x.id === selected);
            return l ? overrideTransform(l, doc.overrides[l.id], drag?.id === l.id ? [drag.dx, drag.dy] : null) : undefined;
          })()}
          fill="none"
          stroke="#2243B6"
          strokeWidth={3}
          strokeDasharray="10 7"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      )}
    </svg>
  );

  function renderLayer(layer: Layer, o: LayerOverride | undefined) {
    if (layer.kind === "photo") return renderPhoto(layer);
    if (layer.kind === "art") {
      const def = ART[layer.art];
      if (!def) return null;
      const h = layer.w * def.aspect;
      const cx = layer.x + layer.w / 2;
      const cy = layer.y + h / 2;
      const turn = [layer.rotate ? `rotate(${layer.rotate} ${cx} ${cy})` : "", layer.flip ? `translate(${cx * 2} 0) scale(-1 1)` : ""]
        .filter(Boolean)
        .join(" ");
      if (def.kind === "image") {
        return (
          <image href={def.src} x={layer.x} y={layer.y} width={layer.w} height={h} transform={turn || undefined} opacity={layer.opacity} preserveAspectRatio="xMidYMid meet" />
        );
      }
      const color = o?.color ?? palette[layer.color ?? "accent"];
      const drawn = <g transform={`translate(${layer.x} ${layer.y})`}>{def.draw(layer.w, palette)}</g>;
      if (metal && !o?.color && (layer.color ?? "accent") === "accent") {
        // Foil can't be a currentColor, so the drawing masks a foil-filled card.
        const id = `m-${uid}-${layer.id}`;
        return (
          <g transform={turn || undefined} opacity={layer.opacity}>
            <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={ARTBOARD.w} height={ARTBOARD.h}>
              <g color="#fff">{drawn}</g>
            </mask>
            <rect width={ARTBOARD.w} height={ARTBOARD.h} fill={`url(#foil-${uid})`} mask={`url(#${id})`} />
          </g>
        );
      }
      return (
        <g color={color} transform={turn || undefined} opacity={layer.opacity}>
          {drawn}
        </g>
      );
    }
    return renderText(layer, o);
  }

  function renderText(layer: TextLayer, o: LayerOverride | undefined) {
    let text = o?.text ?? layerText(layer, doc.content);
    if (!text.trim()) return null;
    if (o?.upper ?? layer.upper) text = text.toUpperCase();
    const tracking = o?.tracking ?? layer.tracking;
    const italic = o?.italic ?? layer.italic;
    const weight = o?.bold === undefined ? layer.weight : o.bold ? 700 : (layer.weight ?? 400) >= 600 ? 400 : layer.weight;
    if (layer.wrap && layer.bind !== "names") text = wrapText(text, layer.wrap);
    const lines = text.split("\n");
    const size = layer.size * (fit[layer.id] ?? 1);
    const lh = (layer.lineHeight ?? 1.2) * size;
    const lift = (lines.length - 1) * lh * (layer.valign === "bottom" ? 1 : layer.valign === "middle" ? 0.5 : 0);
    const common = {
      "data-fit": layer.id,
      "data-max": layer.maxWidth,
      fontFamily: family(layer, o),
      fontSize: size,
      fontStyle: italic ? "italic" : undefined,
      fontWeight: weight,
      letterSpacing: tracking ? tracking * size : undefined,
      fill: paint(layer.color, o),
      opacity: layer.opacity,
      filter: layer.shadow ? `url(#lift-${uid})` : undefined,
    };
    if (layer.arc) {
      // Along the top of a circle whose highest point is (x, y), or, flipped,
      // along the bottom of one whose lowest point is (x, y), still upright.
      const r = layer.arc;
      const id = `arc-${uid}-${layer.id}`;
      const d = layer.arcFlip
        ? `M${layer.x - r} ${layer.y - r}A${r} ${r} 0 0 0 ${layer.x + r} ${layer.y - r}`
        : `M${layer.x - r} ${layer.y + r}A${r} ${r} 0 0 1 ${layer.x + r} ${layer.y + r}`;
      return (
        <g>
          <path id={id} d={d} fill="none" />
          <text {...common} data-arc="1" textAnchor="middle">
            <textPath href={`#${id}`} startOffset="50%">
              {lines.join(" ")}
            </textPath>
          </text>
        </g>
      );
    }
    return (
      <text
        {...common}
        x={layer.x}
        y={layer.y - lift}
        textAnchor={layer.anchor ?? "start"}
        transform={layer.rotate ? `rotate(${layer.rotate} ${layer.x} ${layer.y})` : undefined}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={layer.x} dy={i === 0 ? 0 : lh}>
            {line}
          </tspan>
        ))}
      </text>
    );
  }

  function renderPhoto(layer: Extract<Layer, { kind: "photo" }>) {
    const clip = `clip-${uid}-${layer.id}`;
    const shape =
      layer.shape === "oval" ? (
        <ellipse cx={layer.x + layer.w / 2} cy={layer.y + layer.h / 2} rx={layer.w / 2} ry={layer.h / 2} />
      ) : layer.shape === "waveBottom" ? (
        <path d={waveEdge(layer.x, layer.y, layer.w, layer.h)} />
      ) : layer.shape === "arch" ? (
        <path d={`M${layer.x} ${layer.y + layer.h}V${layer.y + layer.w / 2}A${layer.w / 2} ${layer.w / 2} 0 0 1 ${layer.x + layer.w} ${layer.y + layer.w / 2}V${layer.y + layer.h}Z`} />
      ) : (
        <rect x={layer.x} y={layer.y} width={layer.w} height={layer.h} />
      );
    const p = doc.photo;
    if (!p && layer.emptyMonogram) {
      const c = doc.content;
      const initials = `${c.nameA.trim()[0] ?? ""}${c.nameB.trim()[0] ?? ""}`;
      return (
        <g>
          <clipPath id={clip}>{shape}</clipPath>
          <rect x={layer.x} y={layer.y} width={layer.w} height={layer.h} fill={palette.muted} opacity={0.14} clipPath={`url(#${clip})`} />
          <text
            x={layer.x + layer.w / 2}
            y={layer.y + layer.h / 2 + Math.min(layer.w, layer.h) * 0.11}
            textAnchor="middle"
            fontFamily={fontById(pairing.display)?.css ?? "serif"}
            fontStyle="italic"
            fontSize={Math.min(layer.w, layer.h) * 0.32}
            fill={palette.muted}
            opacity={0.8}
          >
            {initials}
          </text>
        </g>
      );
    }
    if (!p) {
      if (!editable) return null;
      // A frame that fills the card sits behind the headline and names, so its
      // button goes in the open space below the middle rather than dead centre.
      const k = Math.min(1, layer.w / 520);
      const cx = layer.x + layer.w / 2;
      const cy = layer.y + layer.h * (layer.h >= 1200 ? 0.63 : 0.5);
      const bw = 380 * k;
      const bh = 84 * k;
      return (
        <g data-editor-only>
          <rect x={layer.x + 40} y={layer.y + 40} width={layer.w - 80} height={layer.h - 80} fill="none" stroke={palette.muted} strokeWidth={2} strokeDasharray="12 10" opacity={0.5} />
          {onAddPhoto && (
            <g
              role="button"
              aria-label="Add your photo"
              style={{ cursor: "pointer" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onAddPhoto();
              }}
            >
              <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={bh / 2} fill="#ffffff" stroke="#14203d" strokeOpacity={0.12} strokeWidth={2} />
              <g transform={`translate(${cx - bw / 2 + 34 * k} ${cy - 15 * k}) scale(${1.25 * k})`} fill="none" stroke="#2243B6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.5-2h7.6l1.5 2h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
                <circle cx="12" cy="12.5" r="3.5" />
              </g>
              <text x={cx + 22 * k} y={cy + 11 * k} textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize={30 * k} fontWeight={600} fill="#14203d">
                Add your photo
              </text>
            </g>
          )}
        </g>
      );
    }
    // Cover the frame, then slide so the focal point stays in view.
    const f = layer.focus;
    const fx = Math.min(100, Math.max(0, p.fx + (f?.dx ?? 0)));
    const fy = Math.min(100, Math.max(0, p.fy + (f?.dy ?? 0)));
    const scale = Math.max(layer.w / p.aspect, layer.h) * p.zoom * (f?.zoom ?? 1);
    const iw = scale * p.aspect;
    const ih = scale;
    const ix = layer.x - (iw - layer.w) * (fx / 100);
    const iy = layer.y - (ih - layer.h) * (fy / 100);
    const s = layer.scrim;
    return (
      <g>
        <clipPath id={clip}>{shape}</clipPath>
        <g clipPath={`url(#${clip})`}>
          <image
            href={p.url}
            x={ix}
            y={iy}
            width={iw}
            height={ih}
            preserveAspectRatio="none"
            filter={p.filter === "none" ? undefined : `url(#${p.filter}-${uid})`}
          />
          {s?.top ? <rect x={layer.x} y={layer.y} width={layer.w} height={layer.h * 0.42} fill={`url(#scrimTop-${uid})`} opacity={s.top} /> : null}
          {s?.bottom ? (
            <rect
              x={layer.x}
              y={layer.y + layer.h * 0.52}
              width={layer.w}
              height={layer.h * 0.48}
              fill={`url(#scrimTop-${uid})`}
              opacity={s.bottom}
              transform={`rotate(180 ${layer.x + layer.w / 2} ${layer.y + layer.h * 0.76})`}
            />
          ) : null}
        </g>
      </g>
    );
  }
}

export type { Palette };

/** A frame whose bottom edge is a gentle wave, like the tide line. */
export function waveEdge(x: number, y: number, w: number, h: number) {
  const amp = h * 0.028;
  const base = y + h - amp;
  let d = `M${x} ${y}H${x + w}V${base}`;
  const n = 3;
  const seg = w / n;
  for (let i = n; i > 0; i--) {
    const x0 = x + i * seg;
    d += `C${x0 - seg * 0.25} ${base + amp} ${x0 - seg * 0.25} ${base + amp} ${x0 - seg * 0.5} ${base}`;
    d += `C${x0 - seg * 0.75} ${base - amp} ${x0 - seg * 0.75} ${base - amp} ${x0 - seg} ${base}`;
  }
  return d + "Z";
}
