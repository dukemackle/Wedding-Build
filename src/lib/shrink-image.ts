/**
 * Scales a photo down in the browser before it's uploaded.
 *
 * A phone photo is routinely 4-8MB, over both the 5MB limit and the 6MB
 * server-action body cap in next.config.ts -- and at a reception, on venue
 * wifi, a full-size upload is the difference between posting and giving up.
 * 2000px on the long edge is sharper than anything the site displays.
 *
 * An iPhone HEIC the browser can't decode (anywhere but Safari) is converted
 * to JPEG first, with a decoder loaded only when one turns up. Anything else
 * the browser can't decode is returned untouched, and the server decides.
 */
export async function shrinkImage(file: File, maxEdge = 2000, quality = 0.85): Promise<File> {
  if (!isImage(file) || file.type === "image/gif") return file;
  try {
    const bitmap = await decode(file);
    // HEIC always becomes JPEG: only Safari can show it. A JPEG is always
    // re-encoded too, however small: drawing it to a canvas drops its EXIF,
    // which on a phone photo includes where it was taken (GPS), and these
    // photos are served at public URLs. PNG, WebP and GIF pass through when
    // small, to keep transparency; phone cameras don't write them.
    const heic = /hei[cf]/i.test(file.type) || HEIC.test(file.name);
    const reencode = heic || isJpeg(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 2 * 1024 * 1024 && !reencode) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || (blob.size >= file.size && !reencode)) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

const HEIC = /\.(heic|heif)$/i;

function isJpeg(file: File) {
  return file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name);
}

// Some browsers hand over an iPhone photo with an empty type, so the name counts too.
function isImage(file: File) {
  return file.type.startsWith("image/") || HEIC.test(file.name);
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch (err) {
    if (!/hei[cf]/i.test(file.type) && !HEIC.test(file.name)) throw err;
    const { default: heic2any } = await import("heic2any");
    const jpeg = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    return createImageBitmap(Array.isArray(jpeg) ? jpeg[0] : jpeg);
  }
}
