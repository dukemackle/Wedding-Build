"use client";

import { useSiteDesign } from "@/components/guest-site-theme";

/**
 * The couple's announcement above everything else (Style › Top of the page):
 * for a moved date or venue, a change of plan, a last call for RSVPs. Guests
 * who saved the old details see it before anything else.
 */
export function SiteNotice() {
  const { notice } = useSiteDesign();
  if (!notice) return null;
  return (
    <div role="status" className="site-notice relative z-20 bg-[var(--site-accent)] px-4 py-2.5 text-center text-[15px] font-medium leading-snug text-[var(--site-on-accent)] sm:text-base">
      {notice}
    </div>
  );
}
