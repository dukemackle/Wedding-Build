import type { SiteTemplate } from "@/lib/site-templates";

/**
 * "Match my photo": the main colours of a couple's photo, and how well each
 * template's palette sits with them. Runs in the browser on a canvas -- the
 * photo is never uploaded anywhere by this.
 */

export type PhotoColor = { hex: string; weight: number };

type Lab = [number, number, number];

function toLab([r, g, b]: number[]): Lab {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbHex = (rgb: number[]) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

function dist(a: Lab, b: Lab) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * The photo's main colours, biggest share first: a small k-means over a
 * 64-pixel thumbnail. Seeded evenly through the pixels so the same photo
 * always gives the same answer.
 */
export function extractPhotoColors(img: HTMLImageElement, k = 6): PhotoColor[] {
  const size = 64;
  const canvas = document.createElement("canvas");
  const scale = size / Math.max(img.naturalWidth, img.naturalHeight);
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  // Throws for a cross-origin photo without CORS headers; the caller says so.
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const px: number[][] = [];
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 200) px.push([data[i], data[i + 1], data[i + 2]]);
  if (px.length === 0) return [];

  let centres = Array.from({ length: k }, (_, i) => px[Math.floor(((i + 0.5) * px.length) / k)].slice());
  let groups: number[][][] = [];
  for (let round = 0; round < 12; round++) {
    groups = centres.map(() => []);
    for (const p of px) {
      let best = 0;
      let bestD = Infinity;
      centres.forEach((c, j) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      });
      groups[best].push(p);
    }
    centres = groups.map((g, j) =>
      g.length ? [0, 1, 2].map((ch) => g.reduce((s, p) => s + p[ch], 0) / g.length) : centres[j],
    );
  }
  return centres
    .map((c, j) => ({ hex: rgbHex(c), weight: groups[j].length / px.length }))
    .filter((c) => c.weight > 0.02)
    .sort((a, b) => b.weight - a.weight);
}

/**
 * How far a template's palette is from the photo, lower is closer. The
 * accent and headings should echo a colour in the photo (any of them, a
 * small bouquet counts); the background should suit the photo's overall
 * lightness, so a moody photo leans to the dark palettes.
 */
export function photoDistance(colors: PhotoColor[], t: SiteTemplate) {
  if (colors.length === 0) return 0;
  const labs = colors.map((c) => ({ lab: toLab(hexRgb(c.hex)), weight: c.weight }));
  // A tiny share of a colour still counts, but a little less than a big one.
  const nearest = (hex: string) => {
    const lab = toLab(hexRgb(hex));
    return Math.min(...labs.map((c) => dist(lab, c.lab) * (1.25 - 0.5 * Math.min(c.weight * 3, 1))));
  };
  const meanL = labs.reduce((s, c) => s + c.lab[0] * c.weight, 0) / labs.reduce((s, c) => s + c.weight, 0);
  const bgL = toLab(hexRgb(t.palette.bg))[0];
  const lightness = Math.abs((meanL < 38 ? 15 : 92) - bgL) * 0.35;
  return nearest(t.palette.accent) + 0.7 * nearest(t.palette.heading) + lightness;
}
