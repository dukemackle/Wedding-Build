import Link from "next/link";
import { signOut } from "@/lib/supabase/actions";
import { WeddingAssistantWidget } from "@/components/wedding-assistant-widget";
import { AssistantLauncherButton } from "@/components/assistant-launcher-button";
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
      <header className="static -mx-6 -mt-16 mb-8 w-auto border-b border-hairline bg-card/95 backdrop-blur sm:sticky sm:top-0 sm:z-30">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <AssistantLauncherButton />
            <NavLinks />
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            {isAdmin && (
              <a
                href="https://admin.wrenwed.com"
                className="font-mono-numbers text-sm text-brass hover:underline"
              >
                Admin
              </a>
            )}
            <Link
              href="/account"
              className="min-w-0 truncate font-mono-numbers text-sm text-ink/60 hover:text-forest"
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
      </header>
      <WeddingAssistantWidget />
    </>
  );
}
