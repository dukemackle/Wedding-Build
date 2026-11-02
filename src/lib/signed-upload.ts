/**
 * Sends a file straight from the browser to Supabase Storage on a URL made by
 * createSignedUploadUrl, reporting progress (0-1) as it goes. The same
 * request supabase-js's uploadToSignedUrl makes, over XHR because fetch
 * can't report upload progress.
 */
export function putToSignedUrl(signedUrl: string, file: Blob, onProgress?: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = "";
      try {
        message = JSON.parse(xhr.responseText)?.message ?? "";
      } catch {}
      reject(new Error(xhr.status === 413 || /size/i.test(message) ? "too large" : `upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.ontimeout = () => reject(new Error("network"));
    xhr.timeout = 120_000;
    xhr.send(body);
  });
}
