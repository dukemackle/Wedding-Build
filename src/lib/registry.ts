/**
 * Small pieces the registry shares between the couple's page and the guest
 * site: where a gift is from, how a guest pays into a fund, and reading a
 * product page for its name, picture and price.
 */

export const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });

const STORES: [RegExp, string][] = [
  [/(^|\.)amazon\./, "Amazon"],
  [/(^|\.)target\.com$/, "Target"],
  [/(^|\.)walmart\.com$/, "Walmart"],
  [/(^|\.)crateandbarrel\.com$/, "Crate & Barrel"],
  [/(^|\.)williams-sonoma\.com$/, "Williams Sonoma"],
  [/(^|\.)potterybarn\.com$/, "Pottery Barn"],
  [/(^|\.)westelm\.com$/, "West Elm"],
  [/(^|\.)bedbathandbeyond\.com$/, "Bed Bath & Beyond"],
  [/(^|\.)macys\.com$/, "Macy's"],
  [/(^|\.)kohls\.com$/, "Kohl's"],
  [/(^|\.)costco\.com$/, "Costco"],
  [/(^|\.)ikea\.com$/, "IKEA"],
  [/(^|\.)wayfair\.com$/, "Wayfair"],
  [/(^|\.)etsy\.com$/, "Etsy"],
  [/(^|\.)zola\.com$/, "Zola"],
  [/(^|\.)theknot\.com$/, "The Knot"],
  [/(^|\.)withjoy\.com$/, "Joy"],
  [/(^|\.)honeyfund\.com$/, "Honeyfund"],
  [/(^|\.)rei\.com$/, "REI"],
  [/(^|\.)surlatable\.com$/, "Sur La Table"],
  [/(^|\.)anthropologie\.com$/, "Anthropologie"],
  [/(^|\.)bestbuy\.com$/, "Best Buy"],
  [/(^|\.)homedepot\.com$/, "Home Depot"],
  [/(^|\.)kitchenaid\.com$/, "KitchenAid"],
  [/(^|\.)lecreuset\.com$/, "Le Creuset"],
];

/** "Amazon" for an amazon.com link, else the bare domain ("brooklinen.com"). */
export function storeFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return STORES.find(([pattern]) => pattern.test(host))?.[1] ?? host;
  } catch {
    return null;
  }
}

/** Only http(s) links reach a guest's browser. */
export function safeUrl(value: string | null | undefined): string | null {
  const url = (value ?? "").trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export type PayMethod = "venmo" | "paypal" | "cashapp" | "zelle";

export type PayHandles = {
  gift_venmo: string | null;
  gift_paypal: string | null;
  gift_cashapp: string | null;
  gift_zelle: string | null;
};

export const PAY_LABELS: Record<PayMethod, string> = {
  venmo: "Venmo",
  paypal: "PayPal",
  cashapp: "Cash App",
  zelle: "Zelle",
};

/** A handle as the couple might type it ("@sam-lee", "$samlee", a pasted link), cleaned. */
export function cleanHandle(method: PayMethod, value: string): string | null {
  let v = value.trim();
  if (!v) return null;
  if (method === "zelle") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[\d\s().+-]{10,20}$/.test(v) ? v.slice(0, 80) : null;
  }
  v = v.replace(/^https?:\/\/(www\.)?(venmo\.com\/(u\/)?|paypal\.me\/|cash\.app\/)/i, "");
  v = v.split(/[/?#]/)[0].replace(/^[@$]/, "");
  const pattern = method === "venmo" ? /^[A-Za-z0-9_-]{2,30}$/ : /^[A-Za-z0-9_-]{1,30}$/;
  return pattern.test(v) ? v : null;
}

/** Where the "Send with …" button goes, with the amount filled in when the app supports it. */
export function payLink(method: PayMethod, handle: string, amount: number | null, note: string): string | null {
  const amt = amount && amount > 0 ? String(Math.round(amount * 100) / 100) : null;
  switch (method) {
    case "venmo": {
      const params = new URLSearchParams({ txn: "pay", note });
      if (amt) params.set("amount", amt);
      return `https://venmo.com/${encodeURIComponent(handle)}?${params}`;
    }
    case "paypal":
      return `https://paypal.me/${encodeURIComponent(handle)}${amt ? `/${amt}USD` : ""}`;
    case "cashapp":
      return `https://cash.app/$${encodeURIComponent(handle)}${amt ? `/${amt}` : ""}`;
    case "zelle":
      return null;
  }
}

export function payMethods(handles: PayHandles): { method: PayMethod; handle: string }[] {
  return (["venmo", "paypal", "cashapp", "zelle"] as const)
    .map((method) => ({ method, handle: handles[`gift_${method}`] ?? "" }))
    .filter((m) => m.handle);
}

export type ProductDetails = {
  title: string | null;
  image: string | null;
  price: number | null;
};

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html: string, names: string[]): string | null {
  for (const name of names) {
    const escaped = name.replace(/[:.]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${escaped}["'][^>]*content=["']([^"']*)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${escaped}["']`, "i"),
    ];
    for (const pattern of patterns) {
      const value = html.match(pattern)?.[1];
      if (value && value.trim()) return decodeEntities(value);
    }
  }
  return null;
}

function toPrice(value: string | null | undefined): number | null {
  if (!value) return null;
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 && n < 1_000_000 ? Math.round(n * 100) / 100 : null;
}

/**
 * Reads what a product page says about itself: Open Graph tags first, then
 * schema.org Product data, then the page title. Big stores sometimes answer a
 * server with a robot check instead, so any of these can come back empty and
 * the couple fills in the rest.
 */
export function parseProductPage(html: string, pageUrl: string): ProductDetails {
  const head = html.slice(0, 600_000);
  let title = meta(head, ["og:title", "twitter:title"]);
  let image = meta(head, ["og:image:secure_url", "og:image", "twitter:image"]);
  let price = toPrice(
    meta(head, ["product:price:amount", "og:price:amount", "price", "twitter:data1"]),
  );

  if (!title || !price || !image) {
    for (const block of head.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const data = JSON.parse(block[1]);
        const nodes: unknown[] = Array.isArray(data) ? data : data?.["@graph"] ?? [data];
        for (const node of nodes as Record<string, unknown>[]) {
          const type = node?.["@type"];
          if (type !== "Product" && !(Array.isArray(type) && type.includes("Product"))) continue;
          title ??= typeof node.name === "string" ? decodeEntities(node.name) : null;
          const img = Array.isArray(node.image) ? node.image[0] : node.image;
          image ??= typeof img === "string" ? img : (img as { url?: string } | undefined)?.url ?? null;
          const offers = (Array.isArray(node.offers) ? node.offers[0] : node.offers) as
            | Record<string, unknown>
            | undefined;
          price ??= toPrice(String(offers?.price ?? offers?.lowPrice ?? ""));
        }
      } catch {
        // A malformed block is someone else's bug; skip it.
      }
    }
  }

  if (!title) {
    const tag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    title = tag ? decodeEntities(tag) : null;
  }
  if (title && /robot|captcha|access denied|page not found/i.test(title)) title = null;

  if (image) {
    try {
      image = new URL(image, pageUrl).toString();
    } catch {
      image = null;
    }
  }

  return { title: title ? title.slice(0, 200) : null, image: safeUrl(image), price };
}
