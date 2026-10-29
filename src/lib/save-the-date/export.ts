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

async function paint(drawn: SVGSVGElement, scale: number, type: "image/png" | "image/jpeg") {
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
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("export failed"))), type, 0.95),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 3000 x 4200 px: a 5x7 at 600 dpi, or a crisp phone wallpaper. */
export const cardPng = (drawn: SVGSVGElement) => paint(drawn, 3, "image/png");

/**
 * A one-page 5x7 in PDF with the card at 600 dpi, for printing at home or a
 * print shop. Written by hand (one JPEG on one page) rather than pulling in a
 * PDF library for it.
 */
export async function cardPdf(drawn: SVGSVGElement): Promise<Blob> {
  const jpeg = new Uint8Array(await (await paint(drawn, 3, "image/jpeg")).arrayBuffer());
  const W = 360; // 5 in at 72 pt
  const H = 504; // 7 in
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
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  obj(4, [
    `<< /Type /XObject /Subtype /Image /Width ${ARTBOARD.w * 3} /Height ${ARTBOARD.h * 3} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    jpeg,
    "\nendstream",
  ]);
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xref = length;
  push(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
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
