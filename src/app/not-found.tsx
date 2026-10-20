import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { LostPage, primaryAction, secondaryAction } from "@/components/lost-page";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/**
 * Any URL that doesn't exist, and any page that calls notFound() (an old
 * listing, a guest-site slug that's gone). Signed-in couples are pointed back
 * to their dashboard; visitors to the home page and the venue search.
 */
export default async function NotFound() {
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user ? (user.email ?? "") : null;
  } catch {
    // A 404 should never fail because sign-in couldn't be checked.
  }
  const signedIn = email !== null;

  return (
    <PageShell email={email} width="reading">
      <LostPage
        eyebrow="Page not found"
        title="This page isn’t here"
        actions={
          <>
            <Link href={signedIn ? "/dashboard" : "/"} className={primaryAction}>
              {signedIn ? "Back to your dashboard" : "Go to the home page"}
            </Link>
            <Link href="/venues" className={secondaryAction}>
              Browse venues
            </Link>
          </>
        }
      >
        <p>The link may be out of date, or the page has moved. Nothing of yours has gone anywhere.</p>
      </LostPage>
    </PageShell>
  );
}
