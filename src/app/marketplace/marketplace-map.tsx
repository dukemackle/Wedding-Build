"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FitToPins } from "@/components/map-fit-bounds";
import { ClusteredMarkers, dotIcon } from "@/components/clustered-markers";
import { MAP_MIN_ZOOM, US_MAP_BOUNDS, type MapView } from "@/lib/map-view";
import { formatPrice, type PinnedMarketListing } from "@/lib/marketplace";

/**
 * Pins carry the price up close, the way Zillow's do. Listings arrive already
 * nudged off their town's centre (see pinListings).
 */
const priceIcons = new Map<string, L.DivIcon>();

function priceIcon(price: string, labelled: boolean) {
  if (!labelled) return dotIcon("#2243B6");
  const cached = priceIcons.get(price);
  if (cached) return cached;
  const width = 20 + price.length * 7.5;
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      height:26px;padding:0 9px;border-radius:13px;
      background:#2243B6;border:2px solid #fff;
      box-shadow:0 1px 5px rgba(0,0,0,.32);
      color:#fff;font:700 12px ui-sans-serif,system-ui,sans-serif;
      white-space:nowrap;
    ">${price}</div>`,
    iconSize: [width, 26],
    iconAnchor: [width / 2, 13],
  });
  priceIcons.set(price, icon);
  return icon;
}

const CONTINENTAL_US_CENTER: [number, number] = [39.8, -98.6];

export function MarketplaceMap({
  listings,
  onViewChange,
}: {
  listings: PinnedMarketListing[];
  onViewChange?: (view: MapView) => void;
}) {
  const points = useMemo(() => listings.map((l) => [l.latitude, l.longitude] as [number, number]), [listings]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={CONTINENTAL_US_CENTER}
        zoom={4}
        scrollWheelZoom
        minZoom={MAP_MIN_ZOOM}
        maxBounds={US_MAP_BOUNDS}
        maxBoundsViscosity={0.8}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToPins points={points} />
        <ClusteredMarkers
          items={listings}
          onViewChange={onViewChange}
          renderPin={(listing, labelled) => (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
              icon={priceIcon(formatPrice(listing.price_cents), labelled)}
            >
              <Popup minWidth={180}>
                <Link href={`/marketplace/${listing.id}`} className="block w-[180px]">
                  {listing.photo_urls[0] && (
                    <Image
                      src={listing.photo_urls[0]}
                      alt={listing.title}
                      width={180}
                      height={180}
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  )}
                  <p className="pt-2 font-semibold text-forest">{formatPrice(listing.price_cents)}</p>
                  <p className="line-clamp-2 text-xs text-ink/80">{listing.title}</p>
                </Link>
              </Popup>
            </Marker>
          )}
        />
      </MapContainer>
    </div>
  );
}
