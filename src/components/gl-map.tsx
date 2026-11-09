"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type Map as GlMapInstance } from "maplibre-gl";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { loadMapStyle } from "@/lib/map-tiles";
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  US_MAP_BOUNDS,
  US_MAP_BOUNDS_PHONE,
} from "@/lib/map-view";

/**
 * Every map in the app: MapLibre drawing the base map, pins and outlines on
 * the GPU, so zooming glides continuously (trackpad, wheel or pinch) and stays
 * sharp the whole way, the way Zillow's does. It replaced Leaflet, which
 * zoomed in steps by stretching a picture of the map and redrawing at the end
 * (blurry mid-zoom, then a snap).
 *
 * Children (pins, outlines, fit-to-pins) get the map from useGlMap() and are
 * only rendered once it exists.
 */
const MapContext = createContext<GlMapInstance | null>(null);

export function useGlMap() {
  const map = useContext(MapContext);
  if (!map) throw new Error("useGlMap must be used inside <GlMap>");
  return map;
}

/** Runs `fn` once the style can take sources and layers; returns an undo. */
export function whenStyleReady(map: GlMapInstance, fn: () => void) {
  if (map.isStyleLoaded()) {
    fn();
    return () => {};
  }
  let done = false;
  const handler = () => {
    if (done || !map.isStyleLoaded()) return;
    done = true;
    map.off("styledata", handler);
    fn();
  };
  map.on("styledata", handler);
  return () => {
    done = true;
    map.off("styledata", handler);
  };
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function GlMap({
  center,
  zoom,
  interactive = true,
  zoomControls = interactive,
  bounded = true,
  className,
  children,
}: {
  /** [lat, lng], the way the rest of the app writes points. */
  center: [number, number];
  zoom: number;
  interactive?: boolean;
  zoomControls?: boolean;
  /** Keep panning within US_MAP_BOUNDS (the browse maps). */
  bounded?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GlMapInstance | null>(null);
  // Only ever rendered in the browser (the maps load with ssr: false).
  const [noWebGL] = useState(
    () => typeof window !== "undefined" && !supportsWebGL(),
  );
  // The starting view is read once; children move the map after that.
  const initial = useRef({ center, zoom, interactive, zoomControls, bounded });

  useEffect(() => {
    if (noWebGL) return;
    let cancelled = false;
    let instance: GlMapInstance | null = null;
    let observer: ResizeObserver | null = null;
    const { center, zoom, interactive, zoomControls, bounded } =
      initial.current;

    void loadMapStyle().then((style) => {
      if (cancelled || !container.current) return;
      instance = new maplibregl.Map({
        container: container.current,
        style,
        center: [center[1], center[0]],
        zoom,
        minZoom: MAP_MIN_ZOOM,
        maxZoom: MAP_MAX_ZOOM,
        maxBounds: bounded
          ? window.innerWidth < 1024
            ? US_MAP_BOUNDS_PHONE
            : US_MAP_BOUNDS
          : undefined,
        interactive,
        renderWorldCopies: false,
        // A flat street map: no tilting or spinning by accident.
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      });
      instance.touchZoomRotate.disableRotation();
      instance.keyboard.disableRotation();
      if (zoomControls) {
        instance.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-left",
        );
      }
      // MapLibre only re-measures on window resizes; the browse screens resize
      // the map's box on their own (the results sheet, Safari mid-layout).
      observer = new ResizeObserver(() => instance?.resize());
      observer.observe(container.current);
      setMap(instance);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      instance?.remove();
      setMap(null);
    };
  }, [noWebGL]);

  return (
    <div
      className={className ?? "h-full w-full"}
      style={{ position: "relative" }}
    >
      {/* Inline: MapLibre gives its container `position: relative`, which would
          beat a class and collapse it to no height. */}
      <div
        ref={container}
        className="ydid-map"
        style={{ position: "absolute", inset: 0 }}
      />
      {noWebGL && (
        <div className="absolute inset-0 flex items-center justify-center bg-parchment p-6 text-center text-sm text-ink/60">
          This browser can&rsquo;t draw the map. The list still has every
          result.
        </div>
      )}
      {map && <MapContext.Provider value={map}>{children}</MapContext.Provider>}
    </div>
  );
}
