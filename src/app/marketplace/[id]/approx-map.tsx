"use client";

import { useMemo } from "react";
import { GlMap } from "@/components/gl-map";
import { MapShape, circleFeature } from "@/components/map-shape";

/**
 * A circle around the pickup town, never a pin: the listing only knows the
 * town's centre, and says so ("Location is approximate"), the way Facebook
 * shows it.
 */
export function ApproxMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const circle = useMemo(() => circleFeature(latitude, longitude, 3000), [latitude, longitude]);
  return (
    <GlMap center={[latitude, longitude]} zoom={10} interactive={false} bounded={false}>
      <MapShape data={circle} color="#2243B6" weight={2} fillColor="#00BFFE" fillOpacity={0.15} />
    </GlMap>
  );
}
