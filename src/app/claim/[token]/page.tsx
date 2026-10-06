import Link from "next/link";
import { LeadsCallout } from "@/components/leads-callout";
import { leadCounts } from "@/lib/listing-leads";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VenueFaq, VenuePreferredVendor, VenueSpace, VenueSubmission } from "@/lib/supabase/types";
import { SUGGESTED_VENUE_QUESTIONS } from "@/lib/wedding-options";
import { detailsFromVenue } from "@/lib/venue-claim";
import { venueForClaimToken } from "@/lib/venue-claim-server";
import { WIDE_WIDTH } from "@/lib/layout";
import { ClaimForm } from "./claim-form";
import { PUBLIC_VENUE_COLUMNS, publicFields, venueHref } from "@/lib/public-listings";

export const metadata = {
  title: "Update your listing",
  // A private link: keep it out of search results even if it gets shared.
  robots: { index: false, follow: false },
};

export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const venue = await venueForClaimToken(token);

  if (!venue) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-forest">This link has expired</h1>
          <p className="mt-3 text-sm text-ink/70">
            Claim links are replaced from time to time. Reply to the email it came in and
            we&apos;ll send you a new one.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-brass hover:underline">
            Go to You Do, I Do &rarr;
          </Link>
        </div>
      </main>
    );
  }

  const admin = createAdminSupabaseClient();
  const [{ data: pending }, { data: faqs }, { data: preferred }, { data: spaces }] = await Promise.all([
    admin
      .from("venue_submissions")
      .select("*")
      .eq("venue_id", venue.id)
      .eq("status", "pending")
      .maybeSingle<VenueSubmission>(),
    admin
      .from("venue_faqs")
      .select("*")
      .eq("venue_id", venue.id)
      .order("sort_order")
      .returns<VenueFaq[]>(),
    admin
      .from("venue_preferred_vendors")
      .select("*")
      .eq("venue_id", venue.id)
      .order("sort_order")
      .returns<VenuePreferredVendor[]>(),
    admin
      .from("venue_spaces")
      .select("*")
      .eq("venue_id", venue.id)
      .order("sort_order")
      .returns<VenueSpace[]>(),
  ]);

  // The questions couples ask most, waiting for an answer. Any the venue
  // already answers aren't repeated; unanswered ones are dropped on submit.
  const liveFaqs = (faqs ?? []).map((f) => ({ question: f.question, answer: f.answer }));
  const asked = new Set(liveFaqs.map((f) => f.question.toLowerCase()));
  const suggested = SUGGESTED_VENUE_QUESTIONS.filter((q) => !asked.has(q.toLowerCase())).map((question) => ({
    question,
    answer: "",
  }));

  // Coming back to the link before we've reviewed: start from what they
  // already sent, not from the live listing, so nothing they typed is lost.
  const initial = pending
    ? {
        // A submission sent before a field existed has no value for it, so
        // those fall back to the live listing.
        details: { ...detailsFromVenue(venue), ...pending.details },
        faqs: pending.faqs,
        preferredVendors: pending.preferred_vendors,
        spaces: pending.spaces ?? [],
        photoUrls: pending.photo_urls,
        submitter: {
          name: pending.submitter_name,
          email: pending.submitter_email,
          role: pending.submitter_role,
          represents: false,
        },
      }
    : {
        details: detailsFromVenue(venue),
        faqs: [...liveFaqs, ...suggested],
        spaces: (spaces ?? []).map((sp) => ({
          name: sp.name,
          description: sp.description,
          capacity: sp.capacity,
          setting: sp.setting,
          photo_url: sp.photo_url,
        })),
        preferredVendors: (preferred ?? []).map((v) => ({
          category: v.category,
          name: v.name,
          website: v.website,
          required: v.required,
        })),
        photoUrls: venue.photo_urls.length > 0 ? venue.photo_urls : venue.image_url ? [venue.image_url] : [],
        // A venue that just listed itself gave us its email a minute ago.
        submitter: {
          name: "",
          email: venue.source === "self-listed" ? (venue.contact_email ?? "") : "",
          role: null,
          represents: false,
        },
      };
  const isNew = venue.source === "self-listed";

  const leads = await leadCounts("venue", venue.id);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
      <div className={`w-full ${WIDE_WIDTH}`}>
        <Link href="/" className="font-display text-xl font-semibold text-forest">
          You Do, I Do
        </Link>
        <p className="mt-8 font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          {isNew ? "Your new listing" : "Your listing"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">{venue.name}</h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          {isNew ? (
            <>
              Add your photos, capacity, prices and the details couples filter by, then send it
              to us. We review every listing and email you when it&apos;s live. We&apos;ve emailed
              you this link too, so you can finish later.
            </>
          ) : (
            <>
              Couples planning weddings on You Do, I Do can already find {venue.name}. Check the details
              below, fix anything that&apos;s wrong, and add your photos and preferred vendors.
              We review every change before it goes live.
            </>
          )}
        </p>
        <LeadsCallout counts={leads} />
        {pending && (
          <p className="mt-4 max-w-2xl rounded-md border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink/80">
            Your earlier changes are waiting for review. Anything you submit now replaces them.
          </p>
        )}
        <ClaimForm
          token={token}
          initial={initial}
          listing={publicFields(venue, PUBLIC_VENUE_COLUMNS)}
          liveHref={venue.active ? venueHref(venue) : null}
        />
      </div>
    </main>
  );
}
