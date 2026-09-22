"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FitToPins } from "@/components/map-fit-bounds";
import type { Vendor } from "@/lib/supabase/types";

/**
 * Pins carry the vendor's category, matching what the card leads with, so the
 * map reads as the listings rather than as anonymous dots.
 */
function categoryIcon(category: string | null) {
  if (!category) {
    return L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#1F3D2E;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }

  // Escaped: categories are operator-entered text and go into an HTML string.
  const label = category.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;",
  );
  const width = 22 + category.length * 6.5;
  return L.divIcon({
    className: "",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      height:26px;padding:0 9px;border-radius:13px;
      background:#1F3D2E;border:2px solid #fff;
      box-shadow:0 1px 5px rgba(0,0,0,.32);
      color:#fff;font:700 12px ui-sans-serif,system-ui,sans-serif;
      white-space:nowrap;
    ">${label}</div>`,
    iconSize: [width, 26],
    iconAnchor: [width / 2, 13],
  });
}

const CONTINENTAL_US_CENTER: [number, number] = [39.8, -98.6];

export function VendorsMap({
  vendors,
  onSelectVendor,
  heightClassName,
}: {
  vendors: Vendor[];
  onSelectVendor?: (vendorId: string) => void;
  heightClassName?: string;
}) {
  const pinned = vendors.filter(
    (v): v is Vendor & { latitude: number; longitude: number } =>
      v.latitude != null && v.longitude != null,
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
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToPins points={pinned.map((p) => [p.latitude, p.longitude] as [number, number])} />
        {pinned.map((vendor) => (
          <Marker key={vendor.id} position={[vendor.latitude, vendor.longitude]} icon={categoryIcon(vendor.category)}>
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
                  {vendor.contact_email && (
                    <a
                      href={`mailto:${vendor.contact_email}`}
                      className="mt-2 block rounded-full border border-hairline bg-card px-3 py-1 text-center text-xs text-forest hover:border-forest"
                    >
                      Email {vendor.contact_email}
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
