import { fetchFont } from "@/lib/monogram-download";
import { fontByCss } from "@/lib/site-design";
import { ARTBOARD } from "./types";

/**
 * The drawn card as a file, made in the browser from the very SVG on screen
 * (no server, no flattened copy kept anywhere): pictures and the letters each
 * font needs are inlined, then it's painted onto a canvas at print size.
 */

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** A standalone copy of the card's SVG, everything it needs inside it. */
export async function standaloneSvg(drawn: SVGSVGElement): Promise<string> {
  const svg = drawn.cloneNode(true) as SVGSVGElement;
  svg.querySelectorAll("[data-editor-only]").forEach((el) => el.remove());
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", String(ARTBOARD.w));
  svg.setAttribute("height", String(ARTBOARD.h));
  svg.removeAttribute("class");
  svg.removeAttribute("style");

  // Pictures: inline each once.
  const images = [...svg.querySelectorAll("image")];
  const cache = new Map<string, Promise<string>>();
  await Promise.all(
    images.map(async (el) => {
      const href = el.getAttribute("href") ?? "";
      if (!href || href.startsWith("data:")) return;
      const abs = new URL(href, location.href).href;
      if (!cache.has(abs)) cache.set(abs, fetch(abs).then((r) => r.blob()).then(toDataUrl));
      el.setAttribute("href", await cache.get(abs)!);
    }),
  );

  // Fonts: only the letters each face draws.
  const letters = new Map<string, Set<string>>();
  svg.querySelectorAll("text").forEach((el) => {
    const family = el.getAttribute("font-family") ?? "";
    const set = letters.get(family) ?? new Set<string>();
    for (const ch of el.textContent ?? "") set.add(ch);
    letters.set(family, set);
  });
  const css = await Promise.all(
    [...letters].map(([family, set]) => {
      const google = fontByCss(family)?.google;
      return google ? fetchFont(google, [...set].join("")) : "";
    }),
  );
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = css.join("\n");
  svg.prepend(style);
  return new XMLSerializer().serializeToString(svg);
}

async function paintCanvas(drawn: SVGSVGElement, scale: number) {
  const text = await standaloneSvg(drawn);
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = ARTBOARD.w * scale;
    canvas.height = ARTBOARD.h * scale;
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: "image/png" | "image/jpeg") =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("export failed"))), type, 0.95),
  );

const paint = async (drawn: SVGSVGElement, scale: number, type: "image/png" | "image/jpeg") =>
  toBlob(await paintCanvas(drawn, scale), type);

/** 1/8 in of bleed at 600 dpi: the card's edges carried past the trim. */
const BLEED_PX = 75;

/**
 * The card with BLEED_PX added on every side, filled by stretching the card's
 * outermost row or column of pixels outward (corners take the corner pixel).
 * A print shop trims back to 5x7, so a cutter a hair off leaves paper colour or
 * photo, never a white sliver.
 */
function withBleed(card: HTMLCanvasElement) {
  const b = BLEED_PX;
  const { width: w, height: h } = card;
  const out = document.createElement("canvas");
  out.width = w + 2 * b;
  out.height = h + 2 * b;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(card, b, b);
  ctx.drawImage(card, 0, 0, 1, h, 0, b, b, h); // left
  ctx.drawImage(card, w - 1, 0, 1, h, w + b, b, b, h); // right
  ctx.drawImage(card, 0, 0, w, 1, b, 0, w, b); // top
  ctx.drawImage(card, 0, h - 1, w, 1, b, h + b, w, b); // bottom
  ctx.drawImage(card, 0, 0, 1, 1, 0, 0, b, b);
  ctx.drawImage(card, w - 1, 0, 1, 1, w + b, 0, b, b);
  ctx.drawImage(card, 0, h - 1, 1, 1, 0, h + b, b, b);
  ctx.drawImage(card, w - 1, h - 1, 1, 1, w + b, h + b, b, b);
  return out;
}

/** 1200 x 1680 JPEG: the picture in the email and in link previews. */
export const cardJpeg = (drawn: SVGSVGElement) => paint(drawn, 1.2, "image/jpeg");

/** 3000 x 4200 px: a 5x7 at 600 dpi, or a crisp phone wallpaper. */
export const cardPng = (drawn: SVGSVGElement) => paint(drawn, 3, "image/png");

/**
 * A PDF of the card at 600 dpi for a print shop, one page per side (front,
 * then back): 5.25 x 7.25 in with 1/8 in bleed, and a TrimBox marking the 5x7
 * the shop cuts to. Written by hand (one JPEG per page) rather than pulling in
 * a PDF library for it.
 */
export async function cardPdf(...sides: SVGSVGElement[]): Promise<Blob> {
  const jpegs: { data: Uint8Array; w: number; h: number }[] = [];
  for (const drawn of sides) {
    const image = withBleed(await paintCanvas(drawn, 3));
    jpegs.push({ data: new Uint8Array(await (await toBlob(image, "image/jpeg")).arrayBuffer()), w: image.width, h: image.height });
  }
  const bleed = 9; // 1/8 in at 72 pt
  const W = 360 + 2 * bleed; // 5 in trim
  const H = 504 + 2 * bleed; // 7 in trim
  const trim = `[${bleed} ${bleed} ${W - bleed} ${H - bleed}]`;
  const enc = new TextEncoder();
  const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
  const parts: (string | Uint8Array)[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (p: string | Uint8Array) => {
    parts.push(p);
    length += typeof p === "string" ? enc.encode(p).length : p.length;
  };
  const obj = (n: number, body: string | (string | Uint8Array)[]) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
    (Array.isArray(body) ? body : [body]).forEach(push);
    push(`\nendobj\n`);
  };
  // Objects: 1 catalog, 2 page tree, then page, image and contents for each side.
  const page = (i: number) => 3 + i * 3;
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, `<< /Type /Pages /Kids [${jpegs.map((_, i) => `${page(i)} 0 R`).join(" ")}] /Count ${jpegs.length} >>`);
  jpegs.forEach((jpeg, i) => {
    const n = page(i);
    obj(n, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /BleedBox [0 0 ${W} ${H}] /TrimBox ${trim} /Resources << /XObject << /Im0 ${n + 1} 0 R >> >> /Contents ${n + 2} 0 R >>`);
    obj(n + 1, [
      `<< /Type /XObject /Subtype /Image /Width ${jpeg.w} /Height ${jpeg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.data.length} >>\nstream\n`,
      jpeg.data,
      "\nendstream",
    ]);
    obj(n + 2, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });
  const count = 3 + jpegs.length * 3;
  const xref = length;
  push(`xref\n0 ${count}\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`);
  push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
