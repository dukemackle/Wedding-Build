import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/supabase/actions";
import { WeddingAssistantWidget } from "@/components/wedding-assistant-widget";
import { NavLinks } from "@/components/nav-links";

export function AppNav({
  email,
  maxWidthClassName = "max-w-2xl",
}: {
  email: string;
  maxWidthClassName?: string;
}) {
  const isAdmin =
    Boolean(email) && email.toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return (
    <div
      className={`mb-6 flex w-full ${maxWidthClassName} flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="shrink-0">
          <Image src="/icon.png" alt="Wren" width={32} height={32} className="h-8 w-8" />
        </Link>
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
        <span className="truncate font-mono-numbers text-sm text-ink/60">{email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="shrink-0 font-mono-numbers text-sm text-brass hover:underline"
          >
            Log out
          </button>
        </form>
      </div>
      <WeddingAssistantWidget />
    </div>
  );
}
