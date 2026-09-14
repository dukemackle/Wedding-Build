"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Vendor } from "@/lib/supabase/types";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #1F3D2E;
    border: 2px solid #A9843C;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const CONTINENTAL_US_CENTER: [number, number] = [39.8, -98.6];

export function VendorsMap({
  vendors,
  onSelectVendor,
}: {
  vendors: Vendor[];
  onSelectVendor?: (vendorId: string) => void;
}) {
  const pinned = vendors.filter(
    (v): v is Vendor & { latitude: number; longitude: number } =>
      v.latitude != null && v.longitude != null,
  );

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-md border border-hairline">
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
        {pinned.map((vendor) => (
          <Marker key={vendor.id} position={[vendor.latitude, vendor.longitude]} icon={pinIcon}>
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
