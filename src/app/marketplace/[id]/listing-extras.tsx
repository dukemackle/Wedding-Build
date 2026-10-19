"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ApproxMap = dynamic(() => import("./approx-map").then((m) => m.ApproxMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-parchment" />,
});

/** The approximate-location map, loaded only in the browser (Leaflet can't render on the server). */
export function ApproxLocation({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <div className="h-32 overflow-hidden rounded-lg border border-hairline">
      <ApproxMap latitude={latitude} longitude={longitude} />
    </div>
  );
}

/**
 * Share a listing: the phone's own share sheet where there is one, otherwise
 * the link copied. How a dress gets to a partner or a maid of honour.
 */
export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissed, or not allowed here: fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing more to try.
    }
  }

  return (
    <button type="button" onClick={share} className={className}>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
