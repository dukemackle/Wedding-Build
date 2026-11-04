import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { isAdminEmail } from "@/lib/admin";
import { unreadThreadCount } from "@/lib/marketplace-server";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";
import { WeddingAssistantWidget } from "@/components/wedding-assistant-widget";
import { WrenMark } from "@/components/wren-mark";
import { NavLinks } from "@/components/nav-links";
import { AutoHideHeader } from "@/components/auto-hide-header";

export async function AppNav({ email }: { email: string }) {
  // Same allowlist the admin routes enforce, so the nav link and the actual
  // access can't disagree.
  const isAdmin = isAdminEmail(email);

  // Unread marketplace conversations, for the tab's badge. getClaims reads
  // the session token rather than asking Supabase again: the page has
  // already checked who this is.
  const { data: auth } = await (await createClient()).auth.getClaims();
  const userId = auth?.claims.sub;
  const unread = userId ? await unreadThreadCount(userId).catch(() => 0) : 0;
  const badges = { "/marketplace": unread };

  return (
    <>
      <AutoHideHeader>
        {/* Edge to edge on every page, rather than tracking the width of the
            content beneath. Matching each page meant the bar changed width as
            you moved between sections, and on a READING page it was too narrow
            to hold the tab strip at all -- the last tabs clipped to
            "Weddi...". A single full-width bar has neither problem.

            Two rows below lg; one row from lg (see the tab layer below). */}
        <div className="relative flex w-full flex-col px-6 py-1 lg:px-10 2xl:px-14">
          <div className="flex items-center justify-between gap-4 lg:min-h-[72px] 2xl:min-h-[76px]">
            <WrenMark compact />
            <div className="flex min-w-0 items-center justify-end gap-4 lg:max-2xl:gap-3 2xl:max-w-[calc(50%-330px)]">
              {isAdmin && (
                <a
                  href="https://admin.youdoido.com"
                  className="hidden shrink-0 font-mono-numbers text-sm xl:text-base text-brass hover:underline sm:block"
                >
                  Admin
                </a>
              )}
              <Link
                href="/account"
                className="hidden min-w-0 truncate font-mono-numbers text-sm xl:text-base text-ink/60 hover:text-forest sm:block lg:max-2xl:hidden"
              >
                {email}
              </Link>
              {/* Tablet landscape and small laptops: the full address would
                  run into the centred tabs, so it shortens to "Account". */}
              <Link
                href="/account"
                title={email}
                className="hidden shrink-0 font-mono-numbers text-sm text-ink/60 hover:text-forest lg:max-2xl:block"
              >
                Account
              </Link>
              <form action={signOut} className="hidden sm:block">
                <button
                  type="submit"
                  className="shrink-0 font-mono-numbers text-sm xl:text-base text-brass hover:underline"
                >
                  Log out
                </button>
              </form>
              {/* On a phone the account links above move into the menu
                  drawer, leaving this row just the mark and the button. */}
              <MobileNav badges={badges} email={email} isAdmin={isAdmin} />
            </div>
          </div>

          {/* The tab strip is the desktop design and stays exactly as it was.
              A phone gets a different arrangement instead -- see MobileNav --
              because seven tabs needing ~800px can't be made to fit 375px,
              only made to scroll off the edge. */}
          {/* From lg (iPad landscape up) the tabs sit in the empty middle of
              the logo row, making the bar one row tall. Below 2xl the mark
              shrinks and the email becomes "Account" so the centred tabs
              clear both. The layer spans the bar, so it lets clicks through
              except on the tabs. Portrait tablets keep two rows. */}
          <div className="hidden sm:block lg:pointer-events-none lg:absolute lg:inset-x-6 lg:top-1/2 lg:-translate-y-1/2 lg:[&>nav>*]:pointer-events-auto">
            <NavLinks badges={badges} />
          </div>
        </div>
      </AutoHideHeader>
      <WeddingAssistantWidget />
    </>
  );
}
