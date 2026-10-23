import L from "leaflet";
import { dotIcon } from "@/components/clustered-markers";
import { SAVED_ICON } from "@/lib/venue-type-icons";

/**
 * The badge pin Venues and Vendors share. Up close, a listing's pin is its
 * category's icon in a gold disc, then an optional label (a venue's capacity),
 * with a tail that points at the spot -- so the map reads as the listings
 * rather than as anonymous dots, and a couple can tell a barn from a ballroom,
 * or a florist from a DJ, at a glance. A saved listing swaps its icon for a
 * heart. Further out pins group and shrink to rings (see ClusteredMarkers).
 */
const badgeIcons = new Map<string, L.DivIcon>();

const PIN_HEIGHT = 30;
const TAIL = 7;

export function badgePin({
  glyph,
  label = "",
  active = false,
  saved = false,
  labelled,
}: {
  /** The inside of a 24x24 stroked SVG, from venue-type-icons or vendor-category-icons. */
  glyph: string;
  label?: string;
  active?: boolean;
  saved?: boolean;
  labelled: boolean;
}) {
  if (!labelled) return dotIcon(active ? "#2243B6" : saved ? "#E0A100" : "#14203D", active);

  const key = `${glyph}:${label}:${active}:${saved}`;
  const cached = badgeIcons.get(key);
  if (cached) return cached;

  const background = active ? "#2243B6" : "#14203D";
  // Wide enough for the badge at its hovered size; the badge centres in it,
  // so the tail lands on the spot whatever the font's real digit width.
  const width = label ? 60 + label.length * 9 : 40;
  const height = PIN_HEIGHT + TAIL + 4;
  const icon = L.divIcon({
    className: "",
    html: `<div style="display:flex;justify-content:center;align-items:flex-end;width:${width}px;height:${height}px;">
      <div style="
        position:relative;display:flex;align-items:center;gap:6px;
        height:${PIN_HEIGHT}px;padding:0 ${label ? 10 : 2}px 0 2px;box-sizing:border-box;margin-bottom:${TAIL}px;
        border-radius:${PIN_HEIGHT / 2}px;background:${background};border:2px solid #fff;
        box-shadow:0 2px 8px rgba(20,32,61,.35);
        color:#fff;font:700 12.5px ui-sans-serif,system-ui,sans-serif;white-space:nowrap;
        ${active ? "transform:scale(1.12);transform-origin:50% 100%;" : ""}
      ">
        <span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${saved ? "#fff" : "#FFD301"};">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#14203D" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${saved ? SAVED_ICON : glyph}</svg>
        </span>${label}
        <span style="position:absolute;left:50%;bottom:-${TAIL + 1}px;margin-left:-6px;border:6px solid transparent;border-bottom:0;border-top:${TAIL}px solid ${background};filter:drop-shadow(0 2px 0 #fff);"></span>
      </div>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
  badgeIcons.set(key, icon);
  return icon;
}
