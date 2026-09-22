import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { isAdminEmail } from "@/lib/admin";
import { signOut } from "@/lib/supabase/actions";
import { WeddingAssistantWidget } from "@/components/wedding-assistant-widget";
import { WrenMark } from "@/components/wren-mark";
import { NavLinks } from "@/components/nav-links";
import { AutoHideHeader } from "@/components/auto-hide-header";
import { navWidthClass, type PageWidth } from "@/lib/layout";

export function AppNav({
  email,
  width = "standard",
}: {
  email: string;
  /**
   * The width of the page beneath, so the nav's edges line up with it rather
   * than running wider than some pages and narrower than others.
   */
  width?: PageWidth;
}) {
  // Same allowlist the admin routes enforce, so the nav link and the actual
  // access can't disagree.
  const isAdmin = isAdminEmail(email);

  return (
    <>
      <AutoHideHeader>
        {/* Two rows by design. The tabs need ~800px on their own, so beside
            the mark and the account links they could never fit on one line --
            which is what used to make them wrap into three stacked rows.
            Giving them a row of their own fixes that. */}
        <div className={`mx-auto flex w-full flex-col gap-2 px-6 py-3 ${navWidthClass(width)}`}>
          <div className="flex items-center justify-between gap-4">
            <WrenMark />
            <div className="flex min-w-0 items-center justify-end gap-4">
              {isAdmin && (
                <a
                  href="https://admin.wrenwed.com"
                  className="shrink-0 font-mono-numbers text-sm text-brass hover:underline"
                >
                  Admin
                </a>
              )}
              <Link
                href="/account"
                className="hidden min-w-0 truncate font-mono-numbers text-sm text-ink/60 hover:text-forest sm:block"
              >
                {email}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="shrink-0 font-mono-numbers text-sm text-brass hover:underline"
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
          <div className="hidden sm:block">
            <NavLinks />
          </div>
        </div>
      </AutoHideHeader>
      <WeddingAssistantWidget />
    </>
  );
}
