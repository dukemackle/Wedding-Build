"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { pageWidthClass, type PageWidth } from "@/lib/layout";
import { AdminIcon } from "./admin-icons";
import { activePage, adminGroups, pageFor, type PendingClaims } from "./admin-pages";
import { AdminSearch } from "./admin-search";

export type { PendingClaims } from "./admin-pages";

// Every built page, for the search box's "Pages" group.
function searchablePages(claims: PendingClaims) {
  return adminGroups(claims)
    .flatMap((g) => g.links)
    .filter((l) => !l.soon)
    .map((l) => ({ href: l.href, title: l.label, keywords: l.keywords }));
}

function NavList({ pendingClaims, onNavigate }: { pendingClaims: PendingClaims; onNavigate?: () => void }) {
  const pathname = usePathname();
  const all = adminGroups(pendingClaims);
  const active = activePage(pathname, all.flatMap((g) => g.links))?.href;

  return (
    <nav className="flex flex-col">
      {all.map((group, i) => (
        <div key={group.title ?? i} className={i > 0 ? "mt-5" : ""}>
          {group.title && (
            <p className="mb-1.5 flex items-center gap-2 px-2 font-mono-numbers text-[10.5px] uppercase tracking-[0.14em] text-white/60">
              <span className={`h-2 w-2 rounded-[2px] ${group.dot}`} aria-hidden />
              {group.title}
            </p>
          )}
          {group.links.map((link) =>
            link.soon ? (
              <span
                key={link.href}
                title="Not built yet"
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-white/35"
              >
                <AdminIcon name={link.icon} />
                {link.label}
                <span className="ml-auto rounded-full border border-white/20 px-1.5 text-[10px]">soon</span>
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                aria-current={active === link.href ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#FFD301] ${
                  active === link.href ? "bg-white/15 font-medium text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <AdminIcon name={link.icon} className={`h-4 w-4 shrink-0 ${link.icon === "wren" ? "text-[#00BFFE]" : "opacity-80"}`} />
                {link.label}
                {!!link.badge && (
                  <span className="ml-auto rounded-full bg-[#FFD301] px-1.5 font-mono-numbers text-[11px] font-medium text-forest">
                    {link.badge}
                  </span>
                )}
              </Link>
            ),
          )}
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <Image src="/icon.png" alt="You Do, I Do" width={28} height={28} className="h-7 w-7 shrink-0 rounded-md" />
      <span className="rounded-full bg-[#FFD301] px-2 py-0.5 font-mono-numbers text-xs font-medium uppercase tracking-wide text-forest">
        Admin
      </span>
    </Link>
  );
}

const backToApp = (
  <a href="https://youdoido.com/dashboard" className="font-mono-numbers text-sm text-[#FFD301] hover:underline">
    &larr; Back to app
  </a>
);

/**
 * The admin menu: a navy sidebar on a wide screen, a navy top bar with a menu
 * button on a phone. Each link has its own icon and each group its own colour
 * dot, so pages can be found by shape and colour, not only by reading.
 */
export function AdminNav({ pendingClaims }: { pendingClaims: PendingClaims }) {
  const [open, setOpen] = useState(false);
  const waiting = pendingClaims.venues + pendingClaims.vendors + pendingClaims.reports + pendingClaims.market;

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto bg-[#14203d] px-3 py-5 lg:flex">
        <div className="mb-4 px-2">
          <Brand />
        </div>
        <AdminSearch pages={searchablePages(pendingClaims)} />
        <div className="mt-2.5 mb-5 px-2">{backToApp}</div>
        <NavList pendingClaims={pendingClaims} />
      </aside>

      <div className="sticky top-0 z-30 bg-[#14203d] lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white"
          >
            {open ? "Close" : "Menu"}
            {!open && waiting > 0 && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-[#FFD301]" />}
          </button>
        </div>
        <div className="px-4 pb-3">
          <AdminSearch pages={searchablePages(pendingClaims)} onNavigate={() => setOpen(false)} />
          <div className="mt-2 px-1">{backToApp}</div>
        </div>
        {open && (
          <div className="max-h-[calc(100vh-57px)] overflow-y-auto border-t border-white/10 px-3 py-4">
            <NavList pendingClaims={pendingClaims} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}

/**
 * The line above every admin page title: the page's icon in its group's
 * colour and the group name, so each page shows where it sits.
 */
export function AdminEyebrow({ label }: { label?: string }) {
  const found = pageFor(usePathname());
  const tile = found?.group.tile ?? "bg-forest text-white";
  return (
    <p className="flex items-center gap-2.5 font-mono-numbers text-xs uppercase tracking-[0.16em] text-ink/60">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${tile}`} aria-hidden>
        <AdminIcon name={found?.page.icon ?? "home"} className="h-[18px] w-[18px]" />
      </span>
      {label ?? found?.group.title ?? "Admin"}
    </p>
  );
}

// Pages composed for the room a wide screen gives them. Everything else keeps
// the width it was designed at until it gets the same treatment.
const WIDTH_BY_PATH: Record<string, PageWidth> = {
  "/admin": "wide",
  "/admin/venues": "canvas",
  "/admin/vendors": "canvas",
  "/admin/ask": "wide",
  "/admin/audit-log": "wide",
  "/admin/errors": "wide",
};

export function AdminContent({ children }: { children: React.ReactNode }) {
  const width = WIDTH_BY_PATH[usePathname()] ?? "standard";
  return <div className={`mx-auto w-full ${pageWidthClass(width)}`}>{children}</div>;
}
