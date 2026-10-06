"use client";

import type { ReactNode } from "react";

/**
 * A listing's phone, website or social link that tells us it was tapped.
 * Couples can still reach a vendor directly; this is how those contacts count
 * toward the leads we show the vendor. The beacon survives the page leaving.
 */
export function TrackedContactLink({
  listingType,
  listingId,
  kind,
  href,
  className,
  children,
}: {
  listingType: "venue" | "vendor";
  listingId: string;
  kind: "phone" | "website" | "social";
  href: string;
  className?: string;
  children: ReactNode;
}) {
  function record() {
    try {
      const body = JSON.stringify({ type: listingType, id: listingId, kind });
      navigator.sendBeacon("/api/contact-click", new Blob([body], { type: "application/json" }));
    } catch {
      // Counting is best effort; the link itself must always work.
    }
  }

  const external = kind !== "phone";
  return (
    <a
      href={href}
      onClick={record}
      onAuxClick={record}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer nofollow" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}

/** tel: href from a listing's phone as written ("(512) 555-0100" -> "tel:5125550100"). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
