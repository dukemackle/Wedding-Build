"use client";

import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, TileLayer } from "react-leaflet";

/**
 * A circle around the pickup town, never a pin: the listing only knows the
 * town's centre, and says so ("Location is approximate"), the way Facebook
 * shows it.
 */
export function ApproxMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={11}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      style={{ height: "100%", width: "100%" }}
    >
      {/* OpenStreetMap's licence and tile policy require the credit on every map. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[latitude, longitude]}
        radius={3000}
        pathOptions={{ color: "#2243B6", weight: 2, fillColor: "#00BFFE", fillOpacity: 0.15 }}
      />
    </MapContainer>
  );
}
