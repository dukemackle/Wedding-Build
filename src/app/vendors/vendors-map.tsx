"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

export function VendorsMap({ vendors }: { vendors: Vendor[] }) {
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
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-forest">{vendor.name}</p>
                <p className="text-xs text-ink/60">
                  {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                </p>
                <p className="mt-1 text-xs text-ink/70">
                  {[vendor.category, vendor.price_tier].filter(Boolean).join(" · ")}
                </p>
                {vendor.contact_email && (
                  <a
                    href={`mailto:${vendor.contact_email}`}
                    className="mt-2 inline-block rounded-full border border-hairline bg-card px-3 py-1 text-xs text-forest hover:border-forest"
                  >
                    Email {vendor.contact_email}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
