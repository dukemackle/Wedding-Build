/** How many photos can take turns behind the dashboard. */
export const MAX_DASHBOARD_PHOTOS = 8;

/** Focus point per photo URL, as [x, y] percentages. */
export type PhotoFocus = Record<string, [number, number]>;

/**
 * The CSS position that keeps a photo's focus point in view when it's
 * cropped (object-position), and that its slow zoom grows from
 * (transform-origin). Centre when none has been set.
 */
export function focusPosition(focus: PhotoFocus | null | undefined, url: string): string {
  const point = focus?.[url];
  return point ? `${point[0]}% ${point[1]}%` : "50% 50%";
}
