"use client";

import { useState } from "react";

export function ReferralCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied -- nothing to fall back to here
    }
  }

  return (
    <div className="mt-8 w-full max-w-2xl rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        Your referral code
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-forest/10 px-4 py-2 font-mono-numbers text-lg font-semibold text-forest">
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-3 text-sm text-ink/70">
        It&apos;s already included whenever you message a vendor from the Vendors page. If you
        book someone another way, mention this code so it&apos;s credited to your account.
      </p>
    </div>
  );
}
