"use client";

import { useEffect, useState, useTransition } from "react";

/**
 * A venue's or vendor's claim link, and an email to send it in.
 *
 * The email is copied, not sent: the first venues hear from the owner's own
 * inbox, which gets opened and answered far more than mail from a platform
 * address. It also keeps each send a deliberate, one-at-a-time act, which is
 * what anti-spam law expects of cold outreach anyway.
 */
export type ClaimLinkTarget = {
  name: string;
  city: string | null;
  contactEmail: string | null;
  kind: "venue" | "vendor";
};

function emailFor(target: ClaimLinkTarget, url: string) {
  const extras = target.kind === "venue" ? "photos and preferred vendors" : "photos and pricing";
  return `Subject: ${target.name} on You Do, I Do

Hi,

I'm building You Do, I Do (wrenwed.com), a wedding-planning app for couples. ${target.name} is already listed for couples planning weddings${target.city ? ` around ${target.city}` : ""}, using the details on your website.

This private link lets you check those details, fix anything that's wrong, and add your own ${extras}. It's free, there's no account to set up, and nothing changes on your listing until we've reviewed it:

${url}

If you'd rather not be listed, just reply and I'll take it down.

Thanks,
[Your name]
You Do, I Do · [your business mailing address]`;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export function ClaimLinkPanel({
  target,
  getLink,
  newLink,
  onClose,
}: {
  target: ClaimLinkTarget;
  getLink: () => Promise<{ error?: string; url?: string }>;
  newLink: () => Promise<{ error?: string; url?: string }>;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getLink();
      if (result.error) setError(result.error);
      else setUrl(result.url ?? null);
    });
    // Fetched once when the panel opens; the parent re-creates getLink each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function regenerate() {
    if (!confirm("Make a new link? The old one will stop working.")) return;
    startTransition(async () => {
      const result = await newLink();
      if (result.error) setError(result.error);
      else setUrl(result.url ?? null);
    });
  }

  return (
    <div className="mt-2 rounded-md border border-hairline bg-parchment p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">Claim link for {target.name}</p>
        <button type="button" onClick={onClose} className="text-xs text-ink/50 hover:text-ink">
          Close
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      {!url && !error && <p className="mt-2 text-sm text-ink/50">Getting the link…</p>}
      {url && (
        <>
          <p className="mt-2 break-all rounded border border-hairline bg-card px-3 py-2 font-mono-numbers text-xs text-ink/80">
            {url}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyButton text={url} label="Copy link" />
            <CopyButton text={emailFor(target, url)} label="Copy email" />
            <button
              type="button"
              onClick={regenerate}
              disabled={isPending}
              className="rounded-md border border-hairline px-3 py-1 text-xs text-ink/60 hover:border-forest disabled:opacity-60"
            >
              New link
            </button>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            {target.contactEmail ? `Send to ${target.contactEmail} from your own inbox. ` : "No email on file — use their website's contact form. "}
            Fill in your name and mailing address first; cold emails legally need a real postal address.
          </p>
        </>
      )}
    </div>
  );
}
