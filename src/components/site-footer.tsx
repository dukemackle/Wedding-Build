import Link from "next/link";
import { AMAZON_DISCLOSURE, AMAZON_TAG } from "@/lib/amazon";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto w-full border-t border-hairline px-6 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-xs text-ink/50 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} You Do, I Do</span>
        <nav className="flex items-center gap-4">
          <Link href="/terms" className="link-underline transition-colors hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="link-underline transition-colors hover:text-ink">
            Privacy
          </Link>
          <a href="mailto:hello@youdoido.com" className="link-underline transition-colors hover:text-ink">
            Contact
          </a>
        </nav>
      </div>
      {AMAZON_TAG && <p className="mx-auto mt-3 w-full max-w-5xl text-center text-[11px] text-ink/40 sm:text-left">{AMAZON_DISCLOSURE}</p>}
    </footer>
  );
}
