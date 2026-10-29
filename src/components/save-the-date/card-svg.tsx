"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { fontById } from "@/lib/site-design";
import { layerText } from "@/lib/save-the-date/format";
import { templateById } from "@/lib/save-the-date/templates";
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
  /** Hands over the drawn <svg>, for export. */
  svgRef?: (el: SVGSVGElement | null) => void;
  title?: string;
};

/** Where scaling pivots: a text's anchor point, a picture's centre. */
function pivot(layer: Layer): [number, number] {
  if (layer.kind === "text") return [layer.x, layer.y];
  if (layer.kind === "photo") return [layer.x + layer.w / 2, layer.y + layer.h / 2];
  const def = ART[layer.art];
  return [layer.x + layer.w / 2, layer.y + (layer.w * (def?.aspect ?? 1)) / 2];
}

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
export function CardSvg({ doc, className, editable, selected, onSelect, onMove, svgRef, title }: Props) {
  const uid = useId().replace(/:/g, "");
  const t = templateById(doc.template);
  const palette = t.palettes.find((p) => p.id === doc.palette) ?? t.palettes[0];
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
      const natural = el.getBBox().width / current;
      const want = natural > max ? Math.max(0.3, max / natural) : 1;
      next[id] = want;
      if (Math.abs(want - current) > 0.005) changed = true;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- text can only be measured once drawn
    if (changed) setFit(next);
    // fit is read, not a dependency: re-measuring after our own update would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, fontsTick]);

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
  const startDrag = (id: string) => (e: ReactPointerEvent) => {
    if (!editable) return;
    e.stopPropagation();
    onSelect?.(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const [x, y] = toArtboard(e);
    setDrag({ id, x0: x, y0: y, dx: 0, dy: 0 });
  };
  const moveDrag = (e: ReactPointerEvent) => {
    if (!drag) return;
    const [x, y] = toArtboard(e);
    setDrag({ ...drag, dx: x - drag.x0, dy: y - drag.y0 });
  };
  const endDrag = () => {
    if (!drag) return;
    if (Math.abs(drag.dx) + Math.abs(drag.dy) > 1) onMove?.(drag.id, drag.dx, drag.dy);
    setDrag(null);
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

  const layers = doc.photo || !t.noPhotoLayers ? t.layers : t.noPhotoLayers;

  return (
    <svg
      ref={(el) => {
        own.current = el;
        svgRef?.(el);
      }}
      viewBox={`0 0 ${ARTBOARD.w} ${ARTBOARD.h}`}
      className={className}
      role="img"
      aria-label={title ?? `Save the date: ${doc.content.nameA} and ${doc.content.nameB}`}
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
        const live = drag?.id === layer.id ? ([drag.dx, drag.dy] as [number, number]) : null;
        return (
          <g
            key={layer.id}
            data-layer={layer.id}
            transform={overrideTransform(layer, o, live)}
            onPointerDown={editable ? startDrag(layer.id) : undefined}
            style={editable ? { cursor: drag?.id === layer.id ? "grabbing" : "grab" } : undefined}
          >
            {renderLayer(layer, o)}
          </g>
        );
      })}

      {t.grain ? (
        <rect width={ARTBOARD.w} height={ARTBOARD.h} filter={`url(#grain-${uid})`} opacity={t.grain * 6} style={{ mixBlendMode: "multiply" }} pointerEvents="none" />
      ) : null}

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
      const drawn = <g transform={`translate(${layer.x} ${layer.y})`}>{def.draw(layer.w)}</g>;
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
    let text = layerText(layer, doc.content);
    if (!text.trim()) return null;
    if (layer.upper) text = text.toUpperCase();
    const lines = text.split("\n");
    const size = layer.size * (fit[layer.id] ?? 1);
    const lh = (layer.lineHeight ?? 1.2) * size;
    return (
      <text
        data-fit={layer.id}
        data-max={layer.maxWidth}
        x={layer.x}
        y={layer.y}
        fontFamily={family(layer, o)}
        fontSize={size}
        fontStyle={layer.italic ? "italic" : undefined}
        fontWeight={layer.weight}
        letterSpacing={layer.tracking ? layer.tracking * size : undefined}
        textAnchor={layer.anchor ?? "start"}
        fill={paint(layer.color, o)}
        opacity={layer.opacity}
        filter={layer.shadow ? `url(#lift-${uid})` : undefined}
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
      ) : layer.shape === "arch" ? (
        <path d={`M${layer.x} ${layer.y + layer.h}V${layer.y + layer.w / 2}A${layer.w / 2} ${layer.w / 2} 0 0 1 ${layer.x + layer.w} ${layer.y + layer.w / 2}V${layer.y + layer.h}Z`} />
      ) : (
        <rect x={layer.x} y={layer.y} width={layer.w} height={layer.h} />
      );
    const p = doc.photo;
    if (!p) {
      return editable ? (
        <g data-editor-only>
          <rect x={layer.x + 40} y={layer.y + 40} width={layer.w - 80} height={layer.h - 80} fill="none" stroke={palette.muted} strokeWidth={2} strokeDasharray="12 10" opacity={0.5} />
        </g>
      ) : null;
    }
    // Cover the frame, then slide so the focal point stays in view.
    const scale = Math.max(layer.w / p.aspect, layer.h) * p.zoom;
    const iw = scale * p.aspect;
    const ih = scale;
    const ix = layer.x - (iw - layer.w) * (p.fx / 100);
    const iy = layer.y - (ih - layer.h) * (p.fy / 100);
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
