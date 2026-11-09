/**
 * The /cities page's helpers: which region a hub sits in, and where its pin
 * goes on the US outline in public/us-map.svg.
 *
 * The outline is us-atlas's states-albers-10m (Census Bureau data, ISC
 * licence): Albers USA at 975x610, simplified. `usMapPoint` is the same
 * projection d3 uses for the lower 48 (checked against d3-geo to 0.01px), so
 * a new metro gets its pin without regenerating anything. Alaska and Hawaii
 * are insets in that projection and get no pin (null).
 */

export const REGIONS = ["West", "Southwest", "Midwest", "South", "Mid-Atlantic", "Northeast"] as const;
export type Region = (typeof REGIONS)[number];

const REGION_OF: Record<string, Region> = {
  Alaska: "West", California: "West", Colorado: "West", Hawaii: "West", Idaho: "West", Montana: "West",
  Nevada: "West", Oregon: "West", Utah: "West", Washington: "West", Wyoming: "West",
  Arizona: "Southwest", "New Mexico": "Southwest", Oklahoma: "Southwest", Texas: "Southwest",
  Illinois: "Midwest", Indiana: "Midwest", Iowa: "Midwest", Kansas: "Midwest", Michigan: "Midwest",
  Minnesota: "Midwest", Missouri: "Midwest", Nebraska: "Midwest", "North Dakota": "Midwest", Ohio: "Midwest",
  "South Dakota": "Midwest", Wisconsin: "Midwest",
  Alabama: "South", Arkansas: "South", Florida: "South", Georgia: "South", Kentucky: "South", Louisiana: "South",
  Mississippi: "South", "North Carolina": "South", "South Carolina": "South", Tennessee: "South",
  "West Virginia": "South",
  Delaware: "Mid-Atlantic", "District of Columbia": "Mid-Atlantic", Maryland: "Mid-Atlantic",
  "New Jersey": "Mid-Atlantic", Pennsylvania: "Mid-Atlantic", Virginia: "Mid-Atlantic",
  Connecticut: "Northeast", Maine: "Northeast", Massachusetts: "Northeast", "New Hampshire": "Northeast",
  "New York": "Northeast", "Rhode Island": "Northeast", Vermont: "Northeast",
};

export function regionOf(state: string): Region {
  return REGION_OF[state] ?? "West";
}

export const US_MAP = { src: "/us-map.svg", width: 975, height: 610 } as const;

const RAD = Math.PI / 180;
const P0 = 29.5 * RAD;
const P1 = 45.5 * RAD;
const N = (Math.sin(P0) + Math.sin(P1)) / 2;
const C = 1 + Math.sin(P0) * (2 * N - Math.sin(P0));
const R0 = Math.sqrt(C) / N;

function conic(lng: number, lat: number): [number, number] {
  const x = (lng + 96) * RAD * N;
  const r = Math.sqrt(C - 2 * N * Math.sin(lat * RAD)) / N;
  return [r * Math.sin(x), R0 - r * Math.cos(x)];
}

const CENTRE = conic(-96.6, 38.7);

/** A lower-48 point on the 975x610 outline, or null for Alaska and Hawaii. */
export function usMapPoint(lat: number, lng: number): { x: number; y: number } | null {
  if (lat < 24 || lat > 50 || lng < -125 || lng > -66) return null;
  const [x, y] = conic(lng, lat);
  return { x: 487.5 + 1300 * (x - CENTRE[0]), y: 305 - 1300 * (y - CENTRE[1]) };
}
