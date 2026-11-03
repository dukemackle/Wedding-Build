"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { GlMap } from "@/components/gl-map";
import { FitToPins } from "@/components/map-fit-bounds";
import {
  ClusteredMarkers,
  dotLook,
  type PinLook,
} from "@/components/clustered-markers";
import type { MapView } from "@/lib/map-view";
import { formatPrice, type PinnedMarketListing } from "@/lib/marketplace";

/**
 * Pins carry the price up close, the way Zillow's do. Listings arrive already
 * nudged off their town's centre (see pinListings).
 */
const priceLooks = new Map<string, PinLook>();

function priceLook(price: string, labelled: boolean): PinLook {
  if (!labelled) return dotLook("#2243B6");
  const cached = priceLooks.get(price);
  if (cached) return cached;
  const look: PinLook = {
    key: price,
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      height:26px;padding:0 9px;border-radius:13px;
      background:#2243B6;border:2px solid #fff;
      box-shadow:0 1px 5px rgba(0,0,0,.32);
      color:#fff;font:700 12px ui-sans-serif,system-ui,sans-serif;
      white-space:nowrap;cursor:pointer;box-sizing:border-box;
    ">${price}</div>`,
    anchor: "center",
    popupOffset: 13,
  };
  priceLooks.set(price, look);
  return look;
}

const CONTINENTAL_US_CENTER: [number, number] = [39.8, -98.6];

export function MarketplaceMap({
  listings,
  onViewChange,
}: {
  listings: PinnedMarketListing[];
  onViewChange?: (view: MapView) => void;
}) {
  const points = useMemo(
    () => listings.map((l) => [l.latitude, l.longitude] as [number, number]),
    [listings],
  );

  return (
    <div className="h-full w-full">
      <GlMap center={CONTINENTAL_US_CENTER} zoom={3}>
        <FitToPins points={points} />
        <ClusteredMarkers
          items={listings}
          onViewChange={onViewChange}
          pin={(listing, labelled) =>
            priceLook(formatPrice(listing.price_cents), labelled)
          }
          popupWidth={180}
          popup={(listing) => (
            <Link
              href={`/marketplace/${listing.id}`}
              className="block w-[180px]"
            >
              {listing.photo_urls[0] && (
                <Image
                  src={listing.photo_urls[0]}
                  alt={listing.title}
                  width={180}
                  height={180}
                  className="aspect-square w-full rounded-md object-cover"
                />
              )}
              <p className="pt-2 font-semibold text-forest">
                {formatPrice(listing.price_cents, listing.listing_type)}
              </p>
              <p className="line-clamp-2 text-xs text-ink/80">
                {listing.title}
              </p>
            </Link>
          )}
        />
      </GlMap>
    </div>
  );
}
