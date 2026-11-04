import Link from "next/link";
import { METROS, metroHref } from "@/lib/metros";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto w-full border-t border-hairline px-6 py-6">
      {/* Every page links to the metro hubs, so search engines reach them (and
          through them, every listing) from anywhere on the site. */}
      <nav
        aria-label="Wedding venues by area"
        className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink/50 sm:justify-start"
      >
        <span className="text-ink/60">Wedding venues in</span>
        {METROS.map((metro) => (
          <Link key={metro.slug} href={metroHref("venues", metro)} className="link-underline transition-colors hover:text-ink">
            {metro.name}
          </Link>
        ))}
      </nav>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-xs text-ink/50 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} You Do, I Do LLC</span>
        <nav className="flex items-center gap-4">
          <Link href="/terms" className="link-underline transition-colors hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="link-underline transition-colors hover:text-ink">
            Privacy
          </Link>
          <Link href="/data-sources" className="link-underline transition-colors hover:text-ink">
            Data sources
          </Link>
          <a href="mailto:hello@youdoido.com" className="link-underline transition-colors hover:text-ink">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
