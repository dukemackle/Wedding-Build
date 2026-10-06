/**
 * A backstop, not a limit couples should ever meet: they can add as many
 * photos as they like, but one runaway upload loop shouldn't fill storage.
 * The backdrop only ever loads the photo showing and the one after it, so a
 * big set costs nothing on page load.
 */
export const MAX_DASHBOARD_PHOTOS = 500;

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
