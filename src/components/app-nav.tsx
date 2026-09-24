import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { isAdminEmail } from "@/lib/admin";
import { signOut } from "@/lib/supabase/actions";
import { WeddingAssistantWidget } from "@/components/wedding-assistant-widget";
import { WrenMark } from "@/components/wren-mark";
import { NavLinks } from "@/components/nav-links";
import { AutoHideHeader } from "@/components/auto-hide-header";

export function AppNav({ email }: { email: string }) {
  // Same allowlist the admin routes enforce, so the nav link and the actual
  // access can't disagree.
  const isAdmin = isAdminEmail(email);

  return (
    <>
      <AutoHideHeader>
        {/* Edge to edge on every page, rather than tracking the width of the
            content beneath. Matching each page meant the bar changed width as
            you moved between sections, and on a READING page it was too narrow
            to hold the tab strip at all -- the last tabs clipped to
            "Weddi...". A single full-width bar has neither problem.

            Two rows by design: the tabs need ~800px on their own, so beside
            the mark and the account links they could never fit on one line. */}
        <div className="flex w-full flex-col px-6 py-1">
          <div className="flex items-center justify-between gap-4">
            <WrenMark />
            <div className="flex min-w-0 items-center justify-end gap-4">
              {isAdmin && (
                <a
                  href="https://admin.wrenwed.com"
                  className="shrink-0 font-mono-numbers text-sm xl:text-base text-brass hover:underline"
                >
                  Admin
                </a>
              )}
              <Link
                href="/account"
                className="hidden min-w-0 truncate font-mono-numbers text-sm xl:text-base text-ink/60 hover:text-forest sm:block"
              >
                {email}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="shrink-0 font-mono-numbers text-sm xl:text-base text-brass hover:underline"
                >
                  Log out
                </button>
              </form>
              {/* Sits in the row that already exists rather than claiming one
                  of its own -- a whole line of height back on a phone. */}
              <MobileNav />
            </div>
          </div>

          {/* The tab strip is the desktop design and stays exactly as it was.
              A phone gets a different arrangement instead -- see MobileNav --
              because seven tabs needing ~800px can't be made to fit 375px,
              only made to scroll off the edge. */}
          {/* On a wide screen the tabs rise into the empty middle of the logo
              row -- same two-row arrangement, less height. Only from 2xl,
              where the centred tabs clear the logo and the account links. */}
          <div className="hidden sm:block 2xl:-mt-3">
            <NavLinks />
          </div>
        </div>
      </AutoHideHeader>
      <WeddingAssistantWidget />
    </>
  );
}
