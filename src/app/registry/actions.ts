"use server";

import { revalidatePath } from "next/cache";
import { requireEditableWedding } from "@/lib/wedding-access";
import {
  cleanHandle,
  parseProductPage,
  safeUrl,
  storeFromUrl,
  type PayMethod,
  type ProductDetails,
} from "@/lib/registry";

function revalidate(slug: string | null) {
  revalidatePath("/registry");
  revalidatePath("/guests/site", "layout");
  if (slug) revalidatePath(`/w/${slug}`);
}

function text(formData: FormData, key: string, max: number): string | null {
  const value = ((formData.get(key) as string) || "").trim();
  return value ? value.slice(0, max) : null;
}

function money(formData: FormData, key: string): number | null {
  const raw = ((formData.get(key) as string) || "").replace(/[$,\s]/g, "");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n < 1_000_000 ? Math.round(n * 100) / 100 : null;
}

/** Blocks links to this machine or a private network, which a product page never is. */
function isPublicHost(host: string) {
  return !(
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    host.includes(":")
  );
}

/**
 * Fills in a gift from its link. Best effort: a store that answers with a
 * robot check gives back nothing, and the couple types the rest.
 */
export async function readProductLink(
  rawUrl: string,
): Promise<ProductDetails & { store: string | null; error?: string }> {
  const { wedding, noWedding } = await requireEditableWedding();
  const empty = { title: null, image: null, price: null, store: null };
  if (!wedding) return { ...empty, error: noWedding };

  const url = safeUrl(rawUrl);
  if (!url || !isPublicHost(new URL(url).hostname)) {
    return { ...empty, error: "That doesn't look like a link to a product page." };
  }
  const store = storeFromUrl(url);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; YouDoIDo/1.0; +https://youdoido.com) registry link preview",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok || !(response.headers.get("content-type") ?? "").includes("html")) {
      return { ...empty, store };
    }
    const html = (await response.text()).slice(0, 1_000_000);
    return { ...parseProductPage(html, url), store };
  } catch {
    return { ...empty, store };
  }
}

/** Adds a gift or fund, or (with an id) saves changes to one. */
export async function saveRegistryGift(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const kind = formData.get("kind") === "fund" ? "fund" : "gift";
  const title = text(formData, "title", 200);
  if (!title) return { error: kind === "fund" ? "Give the fund a name." : "Give the gift a name." };

  const rawUrl = text(formData, "url", 2000);
  const url = safeUrl(rawUrl);
  if (rawUrl && !url) return { error: "That link doesn't look right. It should start with https://" };

  const quantity = Math.min(99, Math.max(1, Math.round(Number(formData.get("quantity")) || 1)));
  const row = {
    kind,
    title,
    url,
    image_url: safeUrl(text(formData, "image_url", 2000)),
    store: kind === "gift" ? text(formData, "store", 80) ?? storeFromUrl(url) : null,
    price: kind === "gift" ? money(formData, "price") : null,
    quantity: kind === "gift" ? quantity : 1,
    goal: kind === "fund" ? money(formData, "goal") : null,
    note: text(formData, "note", 600),
    updated_at: new Date().toISOString(),
  };

  const id = formData.get("id") as string | null;
  const { error } = id
    ? await supabase.from("registry_gifts").update(row).eq("id", id).eq("wedding_id", wedding.id)
    : await supabase.from("registry_gifts").insert({ ...row, wedding_id: wedding.id });
  if (error) return { error: error.message };

  revalidate(wedding.public_slug);
  return {};
}

export async function deleteRegistryGift(id: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const { error } = await supabase.from("registry_gifts").delete().eq("id", id).eq("wedding_id", wedding.id);
  if (error) return { error: error.message };
  revalidate(wedding.public_slug);
  return {};
}

/** Frees a claimed gift again, for a guest who changed their mind or a claim that's a mistake. */
export async function releaseClaimAsCouple(id: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const { error } = await supabase.from("registry_claims").delete().eq("id", id).eq("wedding_id", wedding.id);
  if (error) return { error: error.message };
  revalidate(wedding.public_slug);
  return {};
}

/** How guests pay into a fund, and where gifts ship. */
export async function saveGiftSettings(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const update: Record<string, string | null> = { gift_ship_to: text(formData, "gift_ship_to", 400) };
  for (const method of ["venmo", "paypal", "cashapp", "zelle"] as PayMethod[]) {
    const raw = text(formData, `gift_${method}`, 200);
    const handle = raw ? cleanHandle(method, raw) : null;
    if (raw && !handle) {
      return {
        error:
          method === "zelle"
            ? "For Zelle, use the email or phone number your bank has on file."
            : `That ${method === "cashapp" ? "Cash App $cashtag" : method === "venmo" ? "Venmo username" : "PayPal.me name"} doesn't look right.`,
      };
    }
    update[`gift_${method}`] = handle;
  }

  const { error } = await supabase.from("weddings").update(update).eq("id", wedding.id);
  if (error) return { error: error.message };
  revalidate(wedding.public_slug);
  return {};
}
