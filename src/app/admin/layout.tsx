import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/venues", label: "Venues" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="mb-6 flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="rounded-full bg-brass/10 px-2 py-0.5 font-mono-numbers text-xs uppercase tracking-wide text-brass">
            Admin
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono-numbers text-sm text-ink/70 transition-colors hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="font-mono-numbers text-sm text-brass hover:underline">
          &larr; Back to app
        </Link>
      </div>
      <div className="w-full max-w-4xl">{children}</div>
    </main>
  );
}
