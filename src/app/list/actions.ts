"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { STATES } from "@/lib/wedding-options";
import { clean, EMAIL } from "@/lib/venue-claim";
import { VENDOR_LISTING_CATEGORIES } from "@/lib/vendor-claim";
import { ensureClaimLink } from "@/lib/venue-claim-server";
import { ensureVendorClaimLink } from "@/lib/vendor-claim-server";

export type NewListing = {
  kind: "venue" | "vendor";
  category: string | null;
  name: string;
  city: string;
  state: string;
  address: string;
  submitterName: string;
  email: string;
  /** Hidden from people; a bot that fills every field fills this too. */
  company: string;
};

/**
 * Starts a listing for a business that isn't on Wren yet.
 *
 * Creates it as an inactive row -- couples can't see it -- with a private edit
 * link, and sends the business straight to that link to add the details and
 * photos. It only goes live when the admin approves what they send from there,
 * so a stranger typing here can at worst leave an invisible row behind.
 */
export async function startListing(
  input: NewListing,
): Promise<{ error?: string; errors?: string[]; next?: string }> {
  if (clean(input.company)) return { error: "Something went wrong -- please try again." };

  const kind = input.kind === "venue" || input.kind === "vendor" ? input.kind : null;
  const name = clean(input.name);
  const city = clean(input.city);
  const state = clean(input.state);
  const address = clean(input.address);
  const category = clean(input.category);
  const submitterName = clean(input.submitterName);
  const email = clean(input.email).toLowerCase();

  const errors: string[] = [];
  if (!kind) errors.push("Choose whether you're a venue or a vendor.");
  if (kind === "vendor" && !(VENDOR_LISTING_CATEGORIES as readonly string[]).includes(category)) {
    errors.push("Pick what kind of vendor you are.");
  }
  if (!name) errors.push("Your business needs a name.");
  if (name.length > 120) errors.push("That business name is too long.");
  if (!city || city.length > 80) errors.push("Tell us the town you're based in.");
  if (!(STATES as readonly string[]).includes(state)) errors.push("Pick your state.");
  if (address.length > 200) errors.push("That address is too long.");
  if (!submitterName || submitterName.length > 120) errors.push("Tell us your name.");
  if (!EMAIL.test(email) || email.length > 200) errors.push("We need a business email to send your edit link to.");
  if (errors.length > 0 || !kind) return { errors };

  const admin = createAdminSupabaseClient();
  const table = kind === "venue" ? "venues" : "vendors";

  // Already listed (a live, real listing with the same name in the same
  // state): send them to Edit my listing rather than creating a duplicate
  // couples would see twice.
  const { data: existing } = await admin
    .from(table)
    .select("id")
    .ilike("name", name.replace(/[%_\\]/g, "\\$&"))
    .eq("state", state)
    .eq("active", true)
    .eq("is_sample", false)
    .limit(1);
  if ((existing ?? []).length > 0) {
    return {
      error: `${name} is already on Wren. Use "Edit my listing" to update it -- if we don't have your email on file, reply to any Wren email or write to hello@wrenwed.com and we'll send you the link.`,
    };
  }

  const row: Record<string, string | boolean | null> = {
    name,
    city,
    state,
    contact_email: email,
    active: false,
    is_sample: false,
    source: "self-listed",
    ...(kind === "venue" ? { address: address || null } : { category }),
  };
  const { data: created, error } = await admin.from(table).insert(row).select("id").single<{ id: string }>();
  if (error || !created) return { error: "Couldn't start your listing -- please try again." };

  const url = kind === "venue" ? await ensureClaimLink(created.id) : await ensureVendorClaimLink(created.id);
  if (!url) return { error: "Couldn't start your listing -- please try again." };

  // Best effort: they're about to land on the link anyway. This is so they can
  // find it again if they close the tab halfway through.
  if (process.env.RESEND_API_KEY) {
    try {
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: email,
        subject: `Your ${name} listing on Wren`,
        text: `Hi ${submitterName},\n\nHere's the private link to finish your ${name} listing on Wren:\n\n${url}\n\nIt's the only way into your listing, so keep it to yourself. Once you send your details, we'll review them and email you when you're live. Use the same link any time you want to make changes.\n\nThanks,\nWren`,
      });
    } catch {
      // Nothing to do.
    }
  }

  return { next: new URL(url).pathname };
}

/**
 * Emails the edit link for every listing on file under this address.
 *
 * Always answers the same way, whether or not anything matched, so the form
 * can't be used to check which businesses use which email. The link only goes
 * to an address already on file for the listing, so typing someone else's
 * email just sends them their own link.
 */
export async function requestEditLinks(rawEmail: string): Promise<{ error?: string }> {
  const email = clean(rawEmail).toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return { error: "That doesn't look like an email address." };

  const admin = createAdminSupabaseClient();
  const pattern = email.replace(/[%_\\]/g, "\\$&");

  // A listing is theirs if its contact email is this one, or if they've had a
  // change approved from this address before (the venue's public contact email
  // is often a shared inbox, not the person who manages the listing).
  const [venues, vendors, venueSubs, vendorSubs] = await Promise.all([
    admin.from("venues").select("id, name").ilike("contact_email", pattern).eq("is_sample", false),
    admin.from("vendors").select("id, name").ilike("contact_email", pattern).eq("is_sample", false),
    admin.from("venue_submissions").select("venue_id").ilike("submitter_email", pattern).eq("status", "approved"),
    admin.from("vendor_submissions").select("vendor_id").ilike("submitter_email", pattern).eq("status", "approved"),
  ]);

  const venueIds = new Map<string, string>((venues.data ?? []).map((v) => [v.id, v.name]));
  const vendorIds = new Map<string, string>((vendors.data ?? []).map((v) => [v.id, v.name]));
  const extraVenues = (venueSubs.data ?? []).map((s) => s.venue_id).filter((id) => !venueIds.has(id));
  const extraVendors = (vendorSubs.data ?? []).map((s) => s.vendor_id).filter((id) => !vendorIds.has(id));
  if (extraVenues.length > 0) {
    const { data } = await admin.from("venues").select("id, name").in("id", extraVenues);
    for (const v of data ?? []) venueIds.set(v.id, v.name);
  }
  if (extraVendors.length > 0) {
    const { data } = await admin.from("vendors").select("id, name").in("id", extraVendors);
    for (const v of data ?? []) vendorIds.set(v.id, v.name);
  }

  const links: string[] = [];
  for (const [id, name] of venueIds) {
    const url = await ensureClaimLink(id);
    if (url) links.push(`${name}\n${url}`);
  }
  for (const [id, name] of vendorIds) {
    const url = await ensureVendorClaimLink(id);
    if (url) links.push(`${name}\n${url}`);
  }

  if (links.length > 0 && process.env.RESEND_API_KEY) {
    try {
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: email,
        subject: links.length === 1 ? "Your Wren listing link" : "Your Wren listing links",
        text: `Here's the private link to update your listing on Wren:\n\n${links.join("\n\n")}\n\nWe review changes before they go live. If you didn't ask for this, you can ignore it -- nothing changes unless someone uses the link.\n\nThanks,\nWren`,
      });
    } catch {
      return { error: "Couldn't send the email just now -- please try again." };
    }
  }

  return {};
}
