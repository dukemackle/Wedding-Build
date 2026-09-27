import Link from "next/link";

/** The "by doing X, you agree" line that sits next to any submit button that
 *  sends Wren someone's details. Keep it beside the button: the notice only
 *  binds when it's seen at the moment of agreeing. */
export function LegalNotice({ action, className = "" }: { action: string; className?: string }) {
  return (
    <p className={`text-xs text-ink/55 ${className}`}>
      By {action}, you agree to our{" "}
      <Link href="/terms" target="_blank" className="underline hover:text-ink">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" target="_blank" className="underline hover:text-ink">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
