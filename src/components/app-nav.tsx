import Link from "next/link";
import { signOut } from "@/lib/supabase/actions";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/budget", label: "Budget" },
];

export function AppNav({ email }: { email: string }) {
  return (
    <div className="mb-6 flex w-full max-w-2xl items-center justify-between">
      <nav className="flex items-center gap-4">
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
      <div className="flex items-center gap-4">
        <span className="font-mono-numbers text-sm text-ink/60">{email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="font-mono-numbers text-sm text-brass hover:underline"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
