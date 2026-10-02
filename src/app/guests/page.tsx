import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type {
  ContactSubmission,
  Guest,
  GuestPost,
  RsvpSubmission,
  Wedding,
} from "@/lib/supabase/types";
import { GuestsPageBody } from "./guests-page-body";
import { qrSvg } from "@/lib/qr";
import { GUEST_WITH_NOTES, withNotes } from "@/lib/guest-notes";

export default async function GuestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Guests
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before tracking guests.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { data: guestRows } = await supabase
    .from("guests")
    .select(GUEST_WITH_NOTES)
    .eq("wedding_id", wedding.id)
    .order("household", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })
    .returns<Guest[]>();
  const guests = guestRows?.map(withNotes) ?? null;

  const { data: rsvpSubmissions } = await supabase
    .from("rsvp_submissions")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<RsvpSubmission[]>();

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = host ? `${protocol}://${host}` : "";

  const { data: guestPosts } = await supabase
    .from("guest_posts")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false })
    .returns<GuestPost[]>();

  const shareUrl = wedding.public_slug ? `${origin}/w/${wedding.public_slug}/share` : null;
  const shareQrSvg = shareUrl ? await qrSvg(shareUrl) : null;

  const { data: contactSubmissions } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("wedding_id", wedding.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .returns<ContactSubmission[]>();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-16">
      <AppNav email={user.email ?? ""} />
      <GuestsPageBody
        wedding={wedding}
        guests={guests ?? []}
        rsvpSubmissions={rsvpSubmissions ?? []}
        contactSubmissions={contactSubmissions ?? []}
        origin={origin}
        guestPosts={guestPosts ?? []}
        shareUrl={shareUrl}
        shareQrSvg={shareQrSvg}
      />
    </main>
  );
}
