/**
 * Scales a photo down in the browser before it's uploaded.
 *
 * A phone photo is routinely 4-8MB, over both the 5MB limit and the 6MB
 * server-action body cap in next.config.ts -- and at a reception, on venue
 * wifi, a full-size upload is the difference between posting and giving up.
 * 2000px on the long edge is sharper than anything the site displays.
 *
 * Anything the browser can't decode (HEIC outside Safari, say) is returned
 * untouched, and the server's own checks decide.
 */
export async function shrinkImage(file: File, maxEdge = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 2 * 1024 * 1024) {
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
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
