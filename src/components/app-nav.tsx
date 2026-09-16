import Link from "next/link";
import { signOut } from "@/lib/supabase/actions";
import { WeddingAssistantWidget } from "@/components/wedding-assistant-widget";
import { WrenMark } from "@/components/wren-mark";
import { NavLinks } from "@/components/nav-links";

export function AppNav({
  email,
}: {
  email: string;
  /** @deprecated the nav bar now uses a fixed width so it fits in one row on every page; kept optional so existing call sites don't need to change. */
  maxWidthClassName?: string;
}) {
  const isAdmin =
    Boolean(email) && email.toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return (
    <>
      {/* Not sticky: the header scrolls away with the page. Nothing passes
          underneath it any more, so it doesn't need the translucent fill or
          the backdrop blur that a pinned bar does. */}
      <header className="static -mx-6 -mt-16 mb-8 w-auto border-b border-hairline bg-card">
        {/* Two rows by design. The tabs need ~800px on their own, so beside
            the mark and the account links they could never fit on one line
            inside the 1152px cap -- which is what used to make them wrap
            into three stacked rows. Giving them the full width fixes that. */}
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3">
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
            </div>
          </div>

          <NavLinks />
        </div>
      </header>
      <WeddingAssistantWidget />
    </>
  );
}
