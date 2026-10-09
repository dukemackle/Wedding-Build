"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReplay, useSiteDesign } from "@/components/guest-site-theme";
import { artById, fontById } from "@/lib/site-design";
import {
  colorCss,
  elementsBottom,
  filterCss,
  holdsElements,
  phoneBoxes,
  readingOrder,
  type CanvasElement,
  type PhoneBox,
} from "@/lib/site-canvas";

/**
 * One section of the guest site with whatever the couple placed in it
 * (src/lib/site-canvas.ts): its card style, and, for the hero and custom
 * blocks, their free elements over the usual content.
 *
 * Plain positioned HTML and CSS: the editor's dragging and handles live in
 * the preview frame only (src/app/guests/site/preview/canvas-editing.tsx),
 * so guests never download them. On a computer each element sits where it
 * was put, scaled with the section; on a phone the elements stack under the
 * section's content in reading order (the `.site-canvas` rules in
 * globals.css).
 */
export function SiteSection({
  sectionKey,
  className,
  style,
  children,
}: {
  sectionKey: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { canvas } = useSiteDesign();
  const section = canvas.sections[sectionKey];
  const blockStyle = section?.style ?? undefined;

  if (!holdsElements(sectionKey)) {
    return (
      <div data-canvas-section={sectionKey} data-block-style={blockStyle} className={className} style={style}>
        {children}
      </div>
    );
  }

  const shown = (section?.elements ?? []).filter((el) => !el.hidden);
  const order = new Map(readingOrder(shown).map((el, i) => [el.id, i]));
  const w = section?.w ?? 1280;
  // A phone layout placed by hand; otherwise phones stack (globals.css).
  const free = section?.phone.mode === "free" ? phoneBoxes(section) : null;
  const phoneBottom = free ? Math.max(0, ...[...free.values()].map((b) => b.y + b.h)) : 0;
  const offPhone = new Set(section?.phone.hidden ?? []);

  return (
    <div
      data-canvas-section={sectionKey}
      data-block-style={blockStyle}
      className={`site-canvas ${free ? "site-canvas-phone-free" : ""} ${className ?? ""}`}
      style={style}
    >
      <div className="site-canvas-content">{children}</div>
      <div
        data-canvas-layer={sectionKey}
        className="site-canvas-layer"
        style={
          {
            "--W": w,
            "--B": elementsBottom(shown),
            ...(free ? { "--PW": section!.phone.w, "--PB": phoneBottom } : {}),
          } as CSSProperties
        }
      >
        {shown.map((el) => (
          <SiteElement
            key={el.id}
            el={el}
            order={order.get(el.id) ?? 0}
            phone={free?.get(el.id) ?? null}
            offPhone={offPhone.has(el.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function SiteElement({
  el,
  order,
  phone = null,
  offPhone = false,
}: {
  el: CanvasElement;
  order: number;
  /** Its box in a hand-placed phone layout. */
  phone?: PhoneBox | null;
  offPhone?: boolean;
}) {
  const vars = {
    "--x": el.x,
    "--y": el.y,
    "--w": el.w,
    "--h": el.h,
    "--r": `${el.rot}deg`,
    ...(phone
      ? {
          "--px": phone.x,
          "--py": phone.y,
          "--pw": phone.w,
          "--ph": phone.h,
          "--pr": `${phone.rot}deg`,
          ...(phone.size !== null ? { "--pfs": phone.size } : {}),
        }
      : {}),
    order,
  } as CSSProperties;
  // Replay motion, or a new choice in the editor, plays the animation again.
  const replay = useReplay();

  return (
    <div
      data-el={el.id}
      data-off-phone={offPhone || undefined}
      data-anim={el.anim !== "none" ? el.anim : undefined}
      className={`site-el site-el-${el.kind}`}
      style={vars}
    >
      <div key={`${el.anim}-${replay}`} className={`site-el-in ${el.kind === "text" ? "" : "h-full w-full"}`}>
        <ElementBody el={el} />
      </div>
    </div>
  );
}

function ElementBody({ el }: { el: CanvasElement }) {
  if (el.kind === "text") {
    const font =
      el.font === "display"
        ? "var(--font-names, var(--font-display))"
        : el.font === "body"
          ? "var(--font-body)"
          : (fontById(el.font)?.css ?? "var(--font-body)");
    return (
      <div
        // Remounted when the words change, so React never fights the browser
        // over text the couple has just typed into it in the editor.
        key={el.text}
        className="site-el-words"
        style={
          {
            "--fs": el.size,
            fontFamily: font,
            color: colorCss(el.color),
            textAlign: el.align,
            fontWeight: el.bold ? 700 : 400,
            fontStyle: el.italic ? "italic" : "normal",
          } as CSSProperties
        }
      >
        {el.text}
      </div>
    );
  }

  if (el.kind === "art") {
    const piece = artById(el.art);
    if (!piece) return null;
    const flip = el.flip ? { transform: "scaleX(-1)" } : undefined;
    if (piece.kind !== "line") {
      // eslint-disable-next-line @next/next/no-img-element -- a static file, sized by its box
      return <img src={piece.src} alt="" className="h-full w-full object-contain" style={flip} />;
    }
    return (
      <div
        aria-hidden="true"
        className="h-full w-full"
        style={{
          ...flip,
          background: colorCss(el.color),
          WebkitMaskImage: `url(${piece.src})`,
          maskImage: `url(${piece.src})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    );
  }

  if (el.kind === "shape") {
    const color = colorCss(el.color);
    const radius = el.shape === "circle" ? "50%" : el.shape === "arch" ? "9999px 9999px 0 0" : el.shape === "line" ? "9999px" : "0";
    return (
      <div
        aria-hidden="true"
        className="site-el-shape h-full w-full"
        style={{
          borderRadius: radius,
          ...(el.outline && el.shape !== "line"
            ? { border: "var(--site-el-stroke) solid", borderColor: color }
            : { background: color }),
        }}
      />
    );
  }

  // Crop is the focus point and zoom; the frame shapes the box around it.
  const radius =
    el.frame === "circle" ? "50%" : el.frame === "arch" ? "9999px 9999px 0 0" : el.frame === "rounded" ? "8%" : undefined;
  const framed =
    el.frame === "polaroid"
      ? { padding: "5% 5% 16%", background: "#ffffff", boxShadow: "0 6px 18px rgb(0 0 0 / 0.16)" }
      : el.frame === "border"
        ? { padding: "3%", border: "var(--site-el-stroke) solid var(--site-accent)" }
        : undefined;
  const origin = `${el.fx}% ${el.fy}%`;
  return (
    <div className="h-full w-full" style={framed}>
      <div className="h-full w-full overflow-hidden" style={{ borderRadius: radius }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the couple's own upload, any size */}
        <img
          src={el.src}
          alt={el.alt}
          loading="lazy"
          className="h-full w-full object-cover"
          style={{
            objectPosition: origin,
            transform: el.zoom > 1 ? `scale(${el.zoom})` : undefined,
            transformOrigin: origin,
            filter: el.filter !== "none" ? filterCss(el.filter) : undefined,
          }}
        />
      </div>
    </div>
  );
}
