/**
 * When a guest's photo was taken, as phone wall-clock time "YYYY-MM-DDTHH:MM:SS".
 *
 * Read from the original file, before shrinkImage re-encodes it and drops the
 * EXIF. Falls back to the time on the device right now: a photo posted from
 * the table a minute after it was taken is close enough to land in the right
 * itinerary chapter, and one picked from the camera roll the next day says so
 * in its EXIF when it has any. No time zone on purpose (0159).
 */
export async function photoTakenAt(file: File | null): Promise<string> {
  if (file && file.size > 0) {
    try {
      const head = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
      const found = exifDateTimeOriginal(head);
      if (found) return found;
    } catch {
      // Unreadable -- fall through to the device clock.
    }
  }
  return localNow();
}

function localNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const EXIF_IFD_POINTER = 0x8769;
const DATE_TIME_ORIGINAL = 0x9003;

/**
 * Finds the "Exif\0\0" block (a JPEG's APP1 segment, or the Exif item near the
 * start of an iPhone HEIC) and reads DateTimeOriginal out of its TIFF header.
 */
function exifDateTimeOriginal(view: DataView): string | null {
  for (let i = 0; i + 14 < view.byteLength; i++) {
    // "Exif" 00 00
    if (view.getUint32(i) !== 0x45786966 || view.getUint16(i + 4) !== 0) continue;
    const tiff = i + 6;
    const order = view.getUint16(tiff);
    if (order !== 0x4949 && order !== 0x4d4d) continue;
    const little = order === 0x4949;
    if (view.getUint16(tiff + 2, little) !== 42) continue;
    const ifd0 = tiff + view.getUint32(tiff + 4, little);
    const exifIfd = findTag(view, ifd0, EXIF_IFD_POINTER, little);
    if (exifIfd === null) return null;
    const at = findTag(view, tiff + exifIfd, DATE_TIME_ORIGINAL, little);
    if (at === null) return null;
    return parseExifDate(view, tiff + at);
  }
  return null;
}

/** A tag's value (or value offset) in one IFD, or null. */
function findTag(view: DataView, ifd: number, tag: number, little: boolean): number | null {
  if (ifd + 2 > view.byteLength) return null;
  const count = view.getUint16(ifd, little);
  for (let n = 0; n < count; n++) {
    const entry = ifd + 2 + n * 12;
    if (entry + 12 > view.byteLength) return null;
    if (view.getUint16(entry, little) === tag) return view.getUint32(entry + 8, little);
  }
  return null;
}

/** "YYYY:MM:DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS". */
function parseExifDate(view: DataView, offset: number): string | null {
  if (offset + 19 > view.byteLength) return null;
  let text = "";
  for (let i = 0; i < 19; i++) text += String.fromCharCode(view.getUint8(offset + i));
  const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(text);
  if (!m || m[1] === "0000") return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
}
