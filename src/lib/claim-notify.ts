import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

// The "X updated its listing" email to the owner. The review queue is the
// record; this is what lets them triage from the inbox: which kind of
// listing, where they came from, whether the sender is plausibly the
// business, and what they changed.

type Kind = "venue" | "vendor";

type Listing = {
  id: string;
  slug: string;
  name: string;
  source: string | null;
  contact_email: string | null;
  created_at: string;
  photo_urls: string[] | null;
  image_url: string | null;
} & Record<string, unknown>;

type Submitted = {
  submitter: { name: string; email: string; role: string | null };
  details: Record<string, unknown> & { name: string };
  faqs: unknown[];
  photoUrls: string[];
};

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" });

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null) || (!a && !b);

export async function claimNotification(
  kind: Kind,
  listing: Listing,
  value: Submitted,
  labels: Record<string, string>,
): Promise<{ subject: string; text: string }> {
  const admin = createAdminSupabaseClient();
  const d = value.details;
  const isNew = listing.source === "self-listed";
  const idCol = kind === "venue" ? "venue_id" : "vendor_id";

  const [{ data: link }, { data: inquiries }, { data: events }, { count: earlier }] = await Promise.all([
    admin.from(`${kind}_claim_links`).select("created_at").eq(idCol, listing.id).maybeSingle<{ created_at: string }>(),
    admin
      .from(`${kind}_inquiries`)
      .select("wedding_id, recipient_email, sent_at")
      .eq(idCol, listing.id)
      .returns<{ wedding_id: string; recipient_email: string | null; sent_at: string }[]>(),
    admin
      .from("events")
      .select("name, wedding_id")
      .eq("listing_kind", kind)
      .eq("listing_id", listing.id)
      .in("name", ["listing_viewed", "listing_saved", "listing_booked"])
      .returns<{ name: string; wedding_id: string | null }[]>(),
    admin
      .from(`${kind}_submissions`)
      .select("id", { count: "exact", head: true })
      .eq(idCol, listing.id)
      .eq("status", "approved"),
  ]);

  // Test weddings (the owner's own) don't count as couple interest.
  const weddingIds = [...new Set([...(inquiries ?? []), ...(events ?? [])].map((r) => r.wedding_id).filter(Boolean))];
  const { data: weddings } = weddingIds.length
    ? await admin.from("weddings").select("id").in("id", weddingIds).eq("is_test", false)
    : { data: [] };
  const real = new Set((weddings ?? []).map((w: { id: string }) => w.id));
  const realInquiries = (inquiries ?? []).filter((i) => real.has(i.wedding_id));
  const countOf = (name: string) => (events ?? []).filter((e) => e.name === name && e.wedding_id && real.has(e.wedding_id)).length;

  // How they got here. Nothing records it directly, so it's inferred from
  // where claim links are handed out: /list, a couple's inquiry email (only
  // when sent to the listing's own address), or the admin/outreach.
  const listedEmail = listing.contact_email?.toLowerCase() ?? null;
  const linkedInquiries = (inquiries ?? []).filter((i) => listedEmail && i.recipient_email?.toLowerCase() === listedEmail);
  const latestLinked = linkedInquiries.map((i) => i.sent_at).sort().at(-1);
  let found: string;
  if (isNew) found = `Listed themselves at youdoido.com/list (started ${date(listing.created_at)})`;
  else if (latestLinked)
    found = `Most likely a couple's inquiry email, which carries the claim link (${linkedInquiries.length} sent to their listed address, latest ${date(latestLinked)})`;
  else
    found = `Not from a couple's inquiry -- a claim link you sent (outreach or copied from the admin), or "find my listing" at youdoido.com/list${link ? `. Current link made ${date(link.created_at)}` : ""}`;

  // Is the sender plausibly the business?
  const sender = value.submitter.email.toLowerCase();
  const domain = sender.split("@")[1] ?? "";
  const website = typeof d.website === "string" ? d.website.toLowerCase() : "";
  let identity: string;
  if (listedEmail && sender === listedEmail) identity = "Sender's email matches the listing's contact email";
  else if (domain && website.includes(domain)) identity = `Sender's email is on the business's own domain (${domain})`;
  else if (listedEmail) identity = `CHECK: sender's email differs from the listing's contact email (${listing.contact_email})`;
  else identity = "Listing had no contact email on file, so nothing to match against";

  // What changed.
  const changed = Object.keys(d)
    .filter((k) => k in listing && !same(d[k], listing[k]))
    .map((k) => labels[k] ?? k);
  const had = new Set([...(listing.photo_urls ?? []), listing.image_url].filter(Boolean));
  const newPhotos = value.photoUrls.filter((u) => !had.has(u)).length;

  const typeLine =
    kind === "venue"
      ? ["Venue", d.venue_type, d.capacity ? `seats ${d.capacity}` : null]
      : ["Vendor", d.category ?? listing.category];
  const place = [d.city, d.state].filter(Boolean).join(", ");
  const contact = [
    ["Phone", d.contact_phone],
    ["Email", d.contact_email],
    ["Website", d.website],
    ["Instagram", d.instagram_url],
    ["Facebook", d.facebook_url],
    ["Pinterest", d.pinterest_url],
  ].filter(([, v]) => v) as [string, string][];

  const kindWord = kind === "venue" ? "Venue" : "Vendor";
  const subject = isNew
    ? `New ${kind} listing: ${d.name}${place ? ` (${place})` : ""}`
    : `${kindWord} update: ${d.name}${place ? ` (${place})` : ""}`;

  const lines = [
    `${value.submitter.name} (${value.submitter.email})${value.submitter.role ? `, ${value.submitter.role},` : ""} submitted ${isNew ? "a new listing" : "changes"} for ${d.name}.`,
    "",
    `What: ${typeLine.filter(Boolean).join(" · ")}${place ? ` · ${place}` : ""}`,
    `How they found us: ${found}`,
    `Who: ${identity}`,
    `History: ${earlier ? `claimed before (${earlier} approved update${earlier === 1 ? "" : "s"})` : "first time claiming"}`,
    `Couple interest: ${countOf("listing_viewed")} viewed, ${countOf("listing_saved")} saved, ${realInquiries.length} inquired, ${countOf("listing_booked")} booked`,
    "",
    "Contact",
    ...(contact.length ? contact.map(([k, v]) => `  ${k}: ${v}`) : ["  (none given)"]),
    "",
    "Changes",
    `  ${isNew ? "New listing" : changed.length ? changed.join(", ") : "No field changes"}`,
    `  Photos: ${newPhotos} new, ${value.photoUrls.length} total · FAQs: ${value.faqs.length}`,
    "",
    `Review: https://admin.youdoido.com/admin/${kind}s/claims`,
    ...(isNew ? [] : [`Live listing: https://youdoido.com/${kind}s/${listing.slug}`]),
    "",
    "Reply to this email to reach them directly.",
  ];
  return { subject, text: lines.join("\n") };
}
