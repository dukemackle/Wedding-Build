import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { normaliseWebsite } from "@/lib/venue-claim";

/**
 * Reads a venue's or vendor's own material -- their website, or a pricing
 * guide / brochure PDF -- and drafts their Wren listing from it.
 *
 * It only drafts: the business sees every filled-in field on their edit form
 * and changes what's wrong before sending, and the admin reviews it after
 * that. So a misread costs a correction, not a wrong listing. It also only
 * fills fields that are still empty, so nothing they typed is overwritten.
 *
 * The PDF goes to the API by URL and the website is fetched by the API's own
 * web fetch tool, for the same reason as the contract reader: a Cloudflare
 * Worker gets 10ms of CPU, far too little to download and encode a file or
 * parse a web page here.
 */
const MODEL = "claude-opus-5";

/** How many reads a listing gets per day. Each one is a paid model call. */
export const MAX_READS_PER_DAY = 5;

export type FieldSpec =
  | { type: "text"; max: number }
  | { type: "int"; max: number }
  | { type: "bool" }
  | { type: "list" }
  | { type: "url" }
  | { type: "email" }
  | { type: "enum"; options: readonly string[] };

export type ListingFields = Record<string, { spec: FieldSpec; hint: string }>;

export type ListingRead = {
  details: Record<string, string | number | boolean | string[]>;
  faqs: { question: string; answer: string }[];
};

function systemPrompt(kind: "venue" | "vendor", fields: ListingFields, questions: string[]) {
  const lines = Object.entries(fields).map(([key, { spec, hint }]) => {
    const shape =
      spec.type === "enum"
        ? `one of ${spec.options.map((o) => JSON.stringify(o)).join(", ")}`
        : spec.type === "int"
          ? "a whole number"
          : spec.type === "bool"
            ? "true or false"
            : spec.type === "list"
              ? "an array of short strings"
              : "a string";
    return `- "${key}" (${shape}): ${hint}`;
  });

  return `You fill in a wedding ${kind}'s listing on You Do, I Do, a wedding-planning site, from the
${kind}'s own material: their website or a brochure / pricing guide.

Fields, all optional:
${lines.join("\n")}

Rules:
- Only use what the material actually says. Leave a field out rather than
  guess. A wrong price or capacity is worse than an empty box.
- Write "about" and "description" in the business's own voice, from their own
  words, tidied up. No marketing superlatives they didn't use.
- Prices: the lowest starting price they state, as a whole number of dollars.
${questions.length > 0 ? `- "faqs": answer any of these the material answers, word the answer from the material:
${questions.map((q) => `  ${JSON.stringify(q)}`).join("\n")}
  You may add up to 4 other questions couples would ask that the material clearly answers.` : `- "faqs": up to 6 questions couples would ask that the material clearly answers.`}

Reply with ONLY a JSON object, no prose around it:
{"details": {"field": value, ...}, "faqs": [{"question": "...", "answer": "..."}]}
If the material isn't about a wedding ${kind} at all, reply {"details": {}, "faqs": []}.`;
}

/** Coerces one model-written value to what the field accepts, or undefined to drop it. */
function coerce(spec: FieldSpec, raw: unknown): string | number | boolean | string[] | undefined {
  switch (spec.type) {
    case "text": {
      const value = typeof raw === "string" ? raw.trim() : "";
      return value ? value.slice(0, spec.max) : undefined;
    }
    case "int": {
      const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace(/[$,\s]/g, "")) : NaN;
      return Number.isFinite(n) && n > 0 && n <= spec.max ? Math.round(n) : undefined;
    }
    case "bool":
      return typeof raw === "boolean" ? raw : undefined;
    case "list": {
      const items = (Array.isArray(raw) ? raw : [])
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, 20);
      return items.length > 0 ? items : undefined;
    }
    case "url": {
      const value = typeof raw === "string" ? normaliseWebsite(raw) : null;
      if (!value) return undefined;
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? value.slice(0, 300) : undefined;
      } catch {
        return undefined;
      }
    }
    case "email": {
      const value = typeof raw === "string" ? raw.trim() : "";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200 ? value : undefined;
    }
    case "enum":
      return typeof raw === "string" && spec.options.includes(raw) ? raw : undefined;
  }
}

/**
 * Counts this read against the listing's daily allowance, before it runs, so
 * a failed read still counts -- a failure is still a paid call.
 */
export async function takeReadAllowance(
  kind: "venue" | "vendor",
  listingId: string,
  purpose: "read" | "write" = "read",
  perDay: number = MAX_READS_PER_DAY,
): Promise<boolean> {
  const admin = createAdminSupabaseClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("listing_reads")
    .select("id", { count: "exact", head: true })
    .eq("listing_kind", kind)
    .eq("listing_id", listingId)
    .eq("purpose", purpose)
    .gte("created_at", since);
  if ((count ?? 0) >= perDay) return false;
  const { error } = await admin.from("listing_reads").insert({ listing_kind: kind, listing_id: listingId, purpose });
  return !error;
}

export async function readListing({
  kind,
  fields,
  questions,
  source,
}: {
  kind: "venue" | "vendor";
  fields: ListingFields;
  questions: string[];
  source: { pdfUrl: string; fileName: string } | { websiteUrl: string };
}): Promise<{ error?: string; read?: ListingRead }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "This isn't switched on yet -- fill the form in by hand for now." };
  }

  const content: Anthropic.Beta.BetaContentBlockParam[] =
    "pdfUrl" in source
      ? [
          { type: "document", source: { type: "url", url: source.pdfUrl }, title: source.fileName },
          { type: "text", text: `Fill in the ${kind}'s listing from this document.` },
        ]
      : [{ type: "text", text: `Fill in the ${kind}'s listing from their website: ${source.websiteUrl}` }];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let text = "";
  try {
    // Streamed: a website read makes several fetches and can run past the
    // non-streaming timeout. Refusals fall back server-side.
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt(kind, fields, questions),
      tools:
        "websiteUrl" in source
          ? [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 5, max_content_tokens: 40000 }]
          : undefined,
      messages: [{ role: "user", content }],
    });
    const response = await stream.finalMessage();
    if (response.stop_reason === "refusal") {
      return { error: "Couldn't read that one -- fill the form in by hand instead." };
    }
    // The answer is the last text block; earlier ones can be narration
    // between web fetches.
    const texts = response.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text");
    text = texts.map((b) => b.text).join("\n");
  } catch (err) {
    if (err instanceof Anthropic.APIError && err.status === 400) {
      return { error: "Couldn't open that file. Try saving it as a PDF again, or use your website instead." };
    }
    return { error: "Couldn't read that just now -- please try again in a minute." };
  }

  const start = text.lastIndexOf('{"details"') >= 0 ? text.lastIndexOf('{"details"') : text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return { error: "Couldn't find your details in that. Try the other option." };

  let parsed: { details?: unknown; faqs?: unknown };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return { error: "Couldn't find your details in that. Try the other option." };
  }

  const rawDetails = (parsed.details && typeof parsed.details === "object" ? parsed.details : {}) as Record<
    string,
    unknown
  >;
  const details: ListingRead["details"] = {};
  for (const [key, { spec }] of Object.entries(fields)) {
    const value = coerce(spec, rawDetails[key]);
    if (value !== undefined) details[key] = value;
  }

  const faqs = (Array.isArray(parsed.faqs) ? parsed.faqs : [])
    .map((f) => {
      const row = f as { question?: unknown; answer?: unknown };
      return {
        question: typeof row.question === "string" ? row.question.trim().slice(0, 200) : "",
        answer: typeof row.answer === "string" ? row.answer.trim().slice(0, 1000) : "",
      };
    })
    .filter((f) => f.question && f.answer)
    .slice(0, 12);

  if (Object.keys(details).length === 0 && faqs.length === 0) {
    return { error: "Couldn't find your details in that. Try the other option, or fill the form in by hand." };
  }
  return { read: { details, faqs } };
}

/** Where a listing's uploaded pricing guides go, inside its photo bucket. */
export function importPrefix(listingId: string) {
  return `claims/${listingId}/imports/`;
}

export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

/**
 * The claim pages' "Fill this in for me", after the token has been resolved
 * to a listing: checks the source is this listing's own upload or a real web
 * address, takes one read from the daily allowance, and reads.
 */
export async function readForListing({
  kind,
  listingId,
  bucket,
  fields,
  questions,
  source,
}: {
  kind: "venue" | "vendor";
  listingId: string;
  bucket: string;
  fields: ListingFields;
  questions: unknown;
  source: { pdfPath: string; fileName: string } | { websiteUrl: string };
}): Promise<{ error?: string; read?: ListingRead }> {
  let resolved: { pdfUrl: string; fileName: string } | { websiteUrl: string };
  if ("pdfPath" in source) {
    // Only a file uploaded through this listing's own link -- never an
    // arbitrary URL handed to the model.
    if (typeof source.pdfPath !== "string" || !source.pdfPath.startsWith(importPrefix(listingId)) || source.pdfPath.includes("..")) {
      return { error: "That file didn't upload properly -- try again." };
    }
    const admin = createAdminSupabaseClient();
    const { data } = await admin.storage.from(bucket).createSignedUrl(source.pdfPath, 60 * 10);
    if (!data?.signedUrl) return { error: "That file didn't upload properly -- try again." };
    resolved = { pdfUrl: data.signedUrl, fileName: String(source.fileName ?? "").slice(0, 120) || "Pricing guide" };
  } else {
    const url = normaliseWebsite(String(source.websiteUrl ?? ""));
    let ok = false;
    try {
      const parsed = url ? new URL(url) : null;
      ok = Boolean(parsed && (parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.hostname.includes("."));
    } catch {
      ok = false;
    }
    if (!url || !ok || url.length > 300) return { error: "That doesn't look like a web address." };
    resolved = { websiteUrl: url };
  }

  if (!(await takeReadAllowance(kind, listingId))) {
    return { error: `That's ${MAX_READS_PER_DAY} reads today -- fill in the rest by hand, or try again tomorrow.` };
  }

  const qs = (Array.isArray(questions) ? questions : [])
    .filter((q): q is string => typeof q === "string")
    .map((q) => q.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 20);

  return readListing({ kind, fields, questions: qs, source: resolved });
}
