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

            Two rows by design: the tabs need ~800px on their own, so beside
            the mark and the account links they could never fit on one line. */}
        <div className="relative flex w-full flex-col px-6 py-1">
          <div className="flex items-center justify-between gap-4 2xl:min-h-[76px]">
            <WrenMark />
            <div className="flex min-w-0 items-center justify-end gap-4 2xl:max-w-[calc(50%-330px)]">
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
                className="hidden min-w-0 truncate font-mono-numbers text-sm xl:text-base text-ink/60 hover:text-forest sm:block"
              >
                {email}
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
          {/* On a wide screen the tabs sit in the empty middle of the logo
              row, making the bar one row tall. Only from 2xl, where the
              centred tabs clear the logo and the account links. The layer
              spans the bar, so it lets clicks through except on the tabs. */}
          <div className="hidden sm:block 2xl:pointer-events-none 2xl:absolute 2xl:inset-x-6 2xl:top-1/2 2xl:-translate-y-1/2 2xl:[&>nav>*]:pointer-events-auto">
            <NavLinks badges={badges} />
          </div>
        </div>
      </AutoHideHeader>
      <WeddingAssistantWidget />
    </>
  );
}
