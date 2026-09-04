import Link from "next/link";
import { signOut } from "@/lib/supabase/actions";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/budget", label: "Budget" },
  { href: "/guests", label: "Guests" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/venues", label: "Venues" },
  { href: "/vendors", label: "Vendors" },
  { href: "/attire", label: "Attire" },
];

export function AppNav({
  email,
  maxWidthClassName = "max-w-2xl",
}: {
  email: string;
  maxWidthClassName?: string;
}) {
  return (
    <div
      className={`mb-6 flex w-full ${maxWidthClassName} flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono-numbers text-sm text-forest hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
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
    </div>
  );
}
