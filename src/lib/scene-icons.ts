/**
 * Small line drawings for the guest site's icon patterns (site-scene.tsx) and,
 * written out as files by scripts/site-art-icons.mjs, the art library. Each is
 * a stroked path on a 48 x 48 grid, drawn for You Do, I Do.
 */
export const ICONS = {
  hat: "M4 30c6 6 34 6 40 0M10 31c-2-3-1-5 2-5M38 31c2-3 1-5-2-5M13 27c0-9 3-17 7-17 2 0 3 2 4 2s2-2 4-2c4 0 7 8 7 17M13 24c7 2 15 2 22 0",
  boot: "M16 6h14l1 22c4 4 11 5 12 11v3H22l-1 3h-6l-1-3Q12 24 16 6zM17 14q6 4 12 0M14 42h8M24 30l1 2 2 .3-1.5 1.5.4 2-1.9-1-1.9 1 .4-2-1.5-1.5 2-.3z",
  cactus: "M20 44V10a4 4 0 0 1 8 0v34M20 30h-6a4 4 0 0 1-4-4v-8a3 3 0 0 1 6 0v7h4M28 26h5V15a3 3 0 0 1 6 0v11a4 4 0 0 1-4 4h-7M12 44h24",
  skull:
    "M18 16c-6 1-12 0-16-6 1 8 8 12 16 11M30 16c6 1 12 0 16-6-1 8-8 12-16 11M18 15c3-3 9-3 12 0l1 7c0 5-3 7-4 13-1 4-5 4-6 0-1-6-4-8-4-13zM21 21a1.5 1.5 0 1 0 .1 0M27 21a1.5 1.5 0 1 0 .1 0",
  horseshoe: "M15 8C9 14 8 26 13 34c3 5 7 7 11 7s8-2 11-7c5-8 4-20-2-26M19 10c-4 5-5 14-1 21 2 4 4 5 6 5s4-1 6-5c4-7 3-16-1-21",
  badge: "M24 4l5 10h11l-6 10 6 10H29l-5 10-5-10H8l6-10-6-10h11zM24 19a5 5 0 1 0 .1 0",
  sun: "M24 18a6 6 0 1 0 .1 0M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4",
  sparkle: "M24 10c1 8 6 13 14 14-8 1-13 6-14 14-1-8-6-13-14-14 8-1 13-6 14-14z",
  seahorse:
    "M27 7c-5 0-8 3-7 8l-6 2 6 1c0 5 4 8 6 12 2 5-1 9-5 8-3-1-3-5 0-5M27 7c4 0 6 3 5 7-1 3-4 4-4 8 0 3 3 4 3 8M23 12h.1",
  starfish: "M24 5l5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z",
  shell: "M24 40C12 36 7 24 11 15c4-6 22-6 26 0 4 9-1 21-13 25zM24 40l-8-24M24 40l-3-26M24 40l3-26M24 40l8-24",
  fish: "M6 24c6-8 18-10 28 0-10 10-22 8-28 0zM34 24l8-7v14zM14 22h.1M20 18c1 4 1 8 0 12",
  turtle: "M12 26c0-8 6-13 12-13s12 5 12 13zM10 26h28M36 22l6-2-1 5M14 30l-3 5M34 30l3 5M18 16l6 10 6-10M24 13v13",
  coral: "M24 44V24M24 32l-8-6v-8M16 24l-4-6M24 28l9-7v-9M33 18l4-5M24 24V12M24 18l-4-6",
  anchor: "M24 7a3 3 0 1 0 .1 0M24 10v31M17 17h14M10 30c1 8 7 12 14 12s13-4 14-12M7 33l3-4 4 3M41 33l-3-4-4 3",
  bubbles: "M14 34a4 4 0 1 0 .1 0M30 22a6 6 0 1 0 .1 0M34 38a2.5 2.5 0 1 0 .1 0",
} as const;

export type IconId = keyof typeof ICONS;

/** The icons each pattern scatters, in the order they're placed. */
export const ICON_SETS = {
  western: ["hat", "cactus", "boot", "skull", "horseshoe", "sun", "badge", "sparkle"],
  ocean: ["seahorse", "starfish", "shell", "fish", "turtle", "coral", "anchor", "bubbles"],
} as const satisfies Record<string, readonly IconId[]>;
