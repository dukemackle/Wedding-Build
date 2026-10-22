import { currentVenueType, type VenueCategory } from "@/lib/wedding-options";

/**
 * One small line drawing per venue category, as the inside of a 24x24 SVG
 * drawn with a stroke and no fill. They are strings rather than components
 * because the map pins are Leaflet divIcons, which take HTML; the filter menu
 * draws the same strings through <VenueTypeIcon>, so a couple learns on the
 * menu what the pin on the map means.
 */
const VENUE_TYPE_ICONS: Record<VenueCategory, string> = {
  "Barn & Farm": '<path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6M9 14l6 6M15 14l-6 6"/>',
  Ranch: '<path d="M7 20c-3-4-3-11 1-14 2-1.5 6-1.5 8 0 4 3 4 10 1 14"/><path d="M7 20H5M17 20h2"/><circle cx="7.5" cy="10" r=".6"/><circle cx="16.5" cy="10" r=".6"/><circle cx="7" cy="14" r=".6"/><circle cx="17" cy="14" r=".6"/>',
  "Historic Mansion & Estate": '<path d="M3 21V11l9-7 9 7v10M2 21h20"/><path d="M10 21v-4h4v4M6 13h2M16 13h2M11 10h2"/>',
  "Chapel & Church": '<path d="M12 2v5M10 4h4M6 21v-9l6-5 6 5v9z"/><path d="M10 21v-4a2 2 0 014 0v4"/>',
  Ballroom: '<path d="M12 3v3M5 9h14M7 9l5-3 5 3M8 9v5M12 9v5M16 9v5M7 14h10"/><path d="M8 14l-1 3M16 14l1 3M12 14v3"/>',
  "Hotel & Resort": '<path d="M3 18h18M5 18a7 7 0 0114 0M12 11V8M10 8h4"/><path d="M4 21h16"/>',
  "Garden & Park": '<path d="M12 21V11"/><circle cx="12" cy="7" r="3"/><path d="M12 16c-3 0-5-2-6-4 3 0 5 1 6 4M12 18c3 0 5-2 6-4-3 0-5 1-6 4"/>',
  "Lake & River": '<path d="M3 8c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 13c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>',
  "Mountain & Lodge": '<path d="M2 20l7-12 4 6 2-3 7 9z"/><path d="M7.5 10.5l1.5 1 1.5-1"/>',
  "Beach & Coast": '<path d="M3 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M12 15V5M12 5c-4 0-7 3-7 5h14c0-2-3-5-7-5"/>',
  "Vineyard & Winery": '<circle cx="9" cy="10" r="2.5"/><circle cx="15" cy="10" r="2.5"/><circle cx="12" cy="14.5" r="2.5"/><circle cx="12" cy="19.5" r="1.5"/><path d="M12 7.5V3l3-1"/>',
  "Restaurant & Brewery": '<path d="M6 8h9v11a2 2 0 01-2 2H8a2 2 0 01-2-2z"/><path d="M15 11h2a2 2 0 012 2v2a2 2 0 01-2 2h-2M6 8a2.5 2.5 0 013-3 3 3 0 015 .5A2 2 0 0115 8"/>',
  "Country Club & Golf": '<path d="M8 21V3l9 4-9 4"/><ellipse cx="12" cy="21" rx="7" ry="1.5"/>',
  "Industrial Loft & Warehouse": '<path d="M3 21V11l5 3v-3l5 3v-3l5 3V4h3v17z"/><path d="M3 21h18M7 17h2M12 17h2"/>',
  "Museum, Gallery & Rooftop": '<path d="M3 9l9-5 9 5M4 20h16M6 10v8M10 10v8M14 10v8M18 10v8"/>',
};

/** Two linked rings, for a venue with no category on file. */
const UNKNOWN_ICON = '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>';

/** Shown on a saved venue's pin, in place of its category. */
export const SAVED_ICON =
  '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" fill="#E0A100" stroke="#E0A100"/>';

export function venueTypeIconPaths(value: string | null | undefined): string {
  const type = currentVenueType(value);
  return type ? VENUE_TYPE_ICONS[type] : UNKNOWN_ICON;
}
