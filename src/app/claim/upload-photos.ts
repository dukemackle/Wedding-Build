import { shrinkImage } from "@/lib/shrink-image";

type Send = (formData: FormData) => Promise<{ error?: string; url?: string }>;

/**
 * Shrinks each photo in the browser (which also drops a phone JPEG's EXIF
 * location), then sends it to the claim link's server action one at a time:
 * ten full-size phone photos would be far past a server action's body limit.
 * Returns the public URLs of the ones that made it, and the first problem.
 */
export async function uploadClaimPhotos(files: File[], send: Send): Promise<{ urls: string[]; error?: string }> {
  const urls: string[] = [];
  let error: string | undefined;
  for (const file of files) {
    try {
      const formData = new FormData();
      formData.set("photo", await shrinkImage(file));
      const result = await send(formData);
      if (result.url) urls.push(result.url);
      else error ??= result.error ?? "Some photos didn't upload -- try adding them again.";
    } catch {
      error ??= "Some photos didn't upload -- try adding them again.";
    }
  }
  return { urls, error };
}
