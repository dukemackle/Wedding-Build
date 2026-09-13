import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-hairline px-6 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-xs text-ink/50 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} Wren</span>
        <nav className="flex items-center gap-4">
          <Link href="/terms" className="transition-colors hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-ink">
            Privacy
          </Link>
          <a href="mailto:wrenwed.com@gmail.com" className="transition-colors hover:text-ink">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
