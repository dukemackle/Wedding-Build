"use client";

import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useMemo } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { BaseMapLayer } from "@/components/base-map-layer";
import { FitToPins } from "@/components/map-fit-bounds";
import { CityOutline } from "@/components/city-outline";
import { ClusteredMarkers } from "@/components/clustered-markers";
import { badgePin } from "@/components/badge-pin";
import { vendorCategoryIconPaths } from "@/lib/vendor-category-icons";
import { MAP_MIN_ZOOM, US_MAP_BOUNDS, type MapView } from "@/lib/map-view";
import type { VendorListing } from "@/lib/public-listings";

const CONTINENTAL_US_CENTER: [number, number] = [39.8, -98.6];

export function VendorsMap({
  vendors,
  favoritedIds,
  onSelectVendor,
  onViewChange,
  heightClassName,
  outline,
}: {
  vendors: VendorListing[];
  favoritedIds?: Set<string>;
  onSelectVendor?: (vendorId: string) => void;
  onViewChange?: (view: MapView) => void;
  heightClassName?: string;
  /** The picked city, outlined on the map. */
  outline?: { city: string; state: string };
}) {
  const pinned = useMemo(
    () =>
      vendors.filter(
        (v): v is VendorListing & { latitude: number; longitude: number } =>
          v.latitude != null && v.longitude != null,
      ),
    [vendors],
  );
  const points = useMemo(
    () => pinned.map((p) => [p.latitude, p.longitude] as [number, number]),
    [pinned],
  );

  return (
    <div
      className={
        heightClassName ?? "h-[520px] w-full overflow-hidden rounded-md border border-hairline"
      }
    >
      <MapContainer
        center={CONTINENTAL_US_CENTER}
        zoom={4}
        scrollWheelZoom
        minZoom={MAP_MIN_ZOOM}
        maxBounds={US_MAP_BOUNDS}
        maxBoundsViscosity={0.8}
        style={{ height: "100%", width: "100%" }}
      >
        <BaseMapLayer />
        {outline && <CityOutline city={outline.city} state={outline.state} />}
        <FitToPins points={points} />
        <ClusteredMarkers
          items={pinned}
          onViewChange={onViewChange}
          renderPin={(vendor, labelled) => (
          <Marker key={vendor.id} position={[vendor.latitude, vendor.longitude]} icon={badgePin({
              glyph: vendorCategoryIconPaths(vendor.category),
              saved: favoritedIds?.has(vendor.id),
              labelled,
            })}>
            <Popup minWidth={200}>
              <div className="w-[200px]">
                {vendor.image_url && (
                  <Image
                    src={vendor.image_url}
                    alt={vendor.name}
                    width={200}
                    height={125}
                    className="aspect-[8/5] w-full rounded-md border border-hairline object-cover"
                  />
                )}
                <div className="pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-forest">{vendor.name}</p>
                    {vendor.price_tier && (
                      <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-[11px] text-brass">
                        {vendor.price_tier}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink/60">
                    {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-ink/70">{vendor.category}</p>
                  {onSelectVendor && (
                    <button
                      type="button"
                      onClick={() => onSelectVendor(vendor.id)}
                      className="mt-1.5 text-xs font-medium text-brass hover:underline"
                    >
                      View details &rarr;
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
          )}
        />
      </MapContainer>
    </div>
  );
}
