"use client";

import { useState } from "react";

/**
 * An email input that catches the mistake people actually make.
 *
 * Nothing can tell whether an address exists without sending to it -- that's
 * what the confirmation email is for. What's worth catching before then is a
 * mistyped provider: someone who enters gmial.com gets a confirmation link
 * sent into the void, sees "check your email", finds nothing, and concludes
 * the product is broken. They never learn it was one letter.
 *
 * So: compare the domain against the handful of providers nearly everyone
 * uses, and if it's one small edit away, offer the correction. Offer, not
 * enforce -- real domains sit close to common ones (fastmail.fm vs
 * fastmail.com), and a signup form that refuses a valid address is worse
 * than one that asks.
 */

/**
 * Domains we treat as correct.
 *
 * Two jobs: these are what a typo gets corrected *to*, and an address already
 * on one of them is never questioned. That second job is why the list runs
 * past the big providers -- mail.com is one letter from gmail.com and
 * entirely real, so leaving it out meant offering to "fix" a valid address.
 * Any legitimate provider sitting close to a popular one belongs here.
 */
const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "comcast.net",
  "me.com",
  "mac.com",
  "live.com",
  "msn.com",
  "verizon.net",
  "sbcglobal.net",
  "mail.com",
  "gmx.com",
  "zoho.com",
  "proton.me",
  "protonmail.com",
  "fastmail.com",
  "hey.com",
];

/**
 * Edit distance counting a transposition as one edit, not two.
 *
 * That distinction is the whole feature: gmial.com is the commonest Gmail
 * typo there is, and plain Levenshtein scores it 2 -- the same as genuinely
 * different domains. Counting swapped letters as one edit catches it while
 * a threshold of 1 keeps real domains alone.
 */
function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 99;

  const rows: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }
  return rows[a.length][b.length];
}

function suggestDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;

  const domain = email.slice(at + 1).toLowerCase();
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;

  // Exactly one edit. Two starts correcting domains that were never typos.
  for (const candidate of COMMON_DOMAINS) {
    if (editDistance(domain, candidate) === 1) {
      return `${email.slice(0, at)}@${candidate}`;
    }
  }
  return null;
}

export function EmailField({
  name = "email",
  defaultValue,
  autoComplete,
}: {
  name?: string;
  defaultValue?: string;
  autoComplete?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [suggestion, setSuggestion] = useState<string | null>(null);

  return (
    <>
      <input
        type="email"
        name={name}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (suggestion) setSuggestion(null);
        }}
        onBlur={(e) => setSuggestion(suggestDomain(e.target.value))}
        className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
      />
      {suggestion && (
        <p className="text-xs text-ink/70">
          Did you mean{" "}
          <button
            type="button"
            onClick={() => {
              setValue(suggestion);
              setSuggestion(null);
            }}
            className="font-medium text-brass hover:underline"
          >
            {suggestion}
          </button>
          ?
        </p>
      )}
    </>
  );
}
