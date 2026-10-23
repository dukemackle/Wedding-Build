/**
 * One small line drawing per vendor category, as the inside of a 24x24 SVG
 * drawn with a stroke and no fill -- the vendor twin of venue-type-icons.ts.
 * Strings, because the map pins are Leaflet divIcons, which take HTML; the
 * Category menu draws the same strings through <VendorCategoryIcon>, so the
 * menu teaches what the pin on the map means.
 */
const VENDOR_CATEGORY_ICONS: Record<string, string> = {
  Catering:
    '<path d="M7 3v6a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3M5 11v10"/><path d="M17 3c-1.5 0-3 1.8-3 5s1.5 5 3 5 3-1.8 3-5-1.5-5-3-5ZM17 13v8"/>',
  Bar: '<path d="M4 4h16l-7 8v7M9 19h6"/>',
  Photography:
    '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="14" r="3.5"/>',
  Videography:
    '<path d="M3 6h13a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/><path d="M17 10.5 22 7v10l-5-3.5Z"/>',
  Florals:
    '<circle cx="12" cy="12" r="2.25"/><circle cx="12" cy="6" r="2.75"/><circle cx="12" cy="18" r="2.75"/><circle cx="6" cy="12" r="2.75"/><circle cx="18" cy="12" r="2.75"/>',
  Music: '<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  Cake:
    '<path d="M12 3v3M11 6h2a1 1 0 0 1 1 1v1H10V7a1 1 0 0 1 1-1Z"/><path d="M4 12c1-1.5 2.5-1.5 3.5 0s2.5 1.5 3.5 0 2.5-1.5 3.5 0 2.5 1.5 3.5 0"/><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M4 16h16"/>',
  Desserts: '<path d="M6 12h12l-2 8H8z"/><path d="M6 12a6 5 0 0 1 12 0M12 7V5"/><path d="M10 12l1 8M14 12l-1 8"/>',
  Planning:
    '<path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z"/><path d="M6 6h12a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/><path d="M8 12h8M8 16h5"/>',
  Transportation:
    '<path d="M4 16V11l2-5h10l3 5v5M2 16h20"/><circle cx="7" cy="16.5" r="1.75"/><circle cx="17" cy="16.5" r="1.75"/>',
  "Hair & Makeup":
    '<path d="M8 11a4 4 0 1 1 8 0c0 2.5-1 4-1 6a3 3 0 0 1-6 0c0-2-1-3.5-1-6Z"/><path d="M9 8c-1-2-.5-4 1-5M15 8c1-2 .5-4-1-5"/><circle cx="17" cy="17" r="2.5"/><path d="m18.8 18.8 2.2 2.2"/>',
  Rentals: '<path d="M7 3v18M17 13v8M7 13h10M7 9h10M7 5h10"/>',
  Officiant: '<path d="M12 3v7M9 6h6M7 21c0-4 2-6 5-6s5 2 5 6"/><circle cx="12" cy="13" r="2.5"/>',
  "Stationery & Invitations": '<path d="M3 6h18v12H3Z"/><path d="m3 6 9 7 9-7"/>',
  "Decor & Lighting": '<path d="M3 6h18M5 6l2.5 5L10 6M11 6l2.5 5L16 6M17 6l2 4 2-4"/>',
  "Photo Booth": '<path d="M7 2h10v20H7z"/><path d="M9 4h6v4H9zM9 10h6v4H9zM9 16h6v4H9z"/>',
  "Bridal & Formalwear": '<path d="M12 6.5a1.75 1.75 0 1 0-1.75-1.75"/><path d="M2 18.5 12 6.5l10 12-4 2-6-3.5-6 3.5Z"/>',
};

/** A shop front, for a vendor with no category on file (or "Other"). */
const UNKNOWN_ICON =
  '<path d="M4 10V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"/><path d="M3 10h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9.5 10v2a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2"/>';

export function vendorCategoryIconPaths(category: string | null | undefined): string {
  return (category && VENDOR_CATEGORY_ICONS[category]) || UNKNOWN_ICON;
}

/**
 * The drawing a photo-less vendor card shows, in the venue drawings' style
 * (navy line art, Aqua wall, one Gold accent). Files in public/vendor-types/.
 */
const VENDOR_CATEGORY_DRAWINGS: Record<string, string> = {
  Catering: "catering",
  Bar: "bar",
  Photography: "photography",
  Videography: "videography",
  Florals: "florals",
  Music: "music",
  Cake: "cake",
  Desserts: "desserts",
  Planning: "planning",
  Transportation: "transportation",
  "Hair & Makeup": "hair-makeup",
  Rentals: "rentals",
  Officiant: "officiant",
  "Stationery & Invitations": "stationery",
  "Decor & Lighting": "decor-lighting",
  "Photo Booth": "photo-booth",
  "Bridal & Formalwear": "bridal-formalwear",
};

export function vendorCategoryImage(category: string | null | undefined): string {
  return `/vendor-types/${(category && VENDOR_CATEGORY_DRAWINGS[category]) || "other"}.svg`;
}
