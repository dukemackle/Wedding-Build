import { fontByCss } from "./site-design";

/**
 * The couple's monogram as a file to take off the site -- for invitations,
 * napkins, signs, a cake topper. Made in the browser from the frame the
 * editor already drew, in their colours, with just the letters it uses of
 * its font embedded, so it prints the same anywhere.
 */

/** What the drawing's CSS variables stand for outside the site. */
export type MonogramColours = { accent: string; onAccent: string; bg: string; face: string };

/** Drawn whole: the site's draw-in animation would leave it blank as a picture. */
const STILL =
  ".orn-draw,.orn-fade{animation:none!important;opacity:1!important;stroke-dasharray:none!important;stroke-dashoffset:0!important}";

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** The monogram's font couldn't be fetched, so nothing was saved. */
export class MonogramFontError extends Error {}

/**
 * The face's @font-face rules for these letters only, fonts inlined. Throws
 * when they can't be fetched: a file in a stand-in serif is worse than none.
 */
async function embeddedFont(face: string, letters: string) {
  const google = fontByCss(face)?.google;
  if (!google) return "";
  try {
    return await fetchFont(google, letters);
  } catch (e) {
    throw e instanceof MonogramFontError ? e : new MonogramFontError(String(e));
  }
}

async function fetchFont(google: string, letters: string) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${google}&text=${encodeURIComponent(letters)}`).then(
    (r) => (r.ok ? r.text() : Promise.reject(new MonogramFontError("font css"))),
  );
  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
  if (!urls.length) throw new MonogramFontError("no font files");
  let inlined = css;
  for (const url of urls) {
    const data = await fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new MonogramFontError("font file"))))
      .then(toDataUrl);
    inlined = inlined.split(url).join(data);
  }
  return inlined;
}

/** A standalone SVG of the drawn frame, `size` px square, on the page colour or clear. */
export async function monogramSvg(
  drawn: SVGSVGElement,
  colours: MonogramColours,
  { size, background, date }: { size: number; background: boolean; date: string | null },
) {
  const svg = drawn.cloneNode(true) as SVGSVGElement;
  // The date line sits under the frame on the site; here it joins the drawing.
  const height = date ? 236 : 200;
  svg.removeAttribute("class");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", `0 0 200 ${height}`);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String((size * height) / 200));
  svg.setAttribute("style", `color:${colours.accent}`);
  if (date) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "text");
    line.setAttribute("x", "100");
    line.setAttribute("y", "224");
    line.setAttribute("text-anchor", "middle");
    line.setAttribute("fill", "currentColor");
    line.setAttribute("letter-spacing", "3.6");
    line.setAttribute("font-size", "12");
    line.style.fontFamily = colours.face;
    line.textContent = date.toUpperCase();
    svg.append(line);
  }
  const letters = new Set<string>();
  svg.querySelectorAll<SVGElement>("text, tspan").forEach((el) => {
    for (const ch of el.textContent ?? "") letters.add(ch);
    if (el.style.fontFamily) el.style.fontFamily = colours.face;
  });
  const font = await embeddedFont(colours.face, [...letters].join(""));
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `${font}${STILL}`;
  svg.prepend(style);
  if (background) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "200");
    rect.setAttribute("height", String(height));
    rect.setAttribute("fill", colours.bg);
    style.after(rect);
  }
  const text = new XMLSerializer()
    .serializeToString(svg)
    .replaceAll("var(--color-parchment)", colours.bg)
    .replaceAll("var(--site-on-accent)", colours.onAccent)
    .replaceAll("var(--site-accent)", colours.accent);
  return { text, width: size, height: (size * height) / 200 };
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Saves the frame as a 2400px-wide PNG on the page colour, or as an SVG on clear that scales to any size. */
export async function downloadMonogram(
  drawn: SVGSVGElement,
  colours: MonogramColours,
  { format, name, date }: { format: "png" | "svg"; name: string; date: string | null },
) {
  if (format === "svg") {
    const { text } = await monogramSvg(drawn, colours, { size: 1200, background: false, date });
    save(new Blob([text], { type: "image/svg+xml" }), `${name}.svg`);
    return;
  }
  const { text, width, height } = await monogramSvg(drawn, colours, { size: 2400, background: true, date });
  const img = new Image();
  img.src = await toDataUrl(new Blob([text], { type: "image/svg+xml" }));
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (blob) save(blob, `${name}.png`);
}
