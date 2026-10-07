/**
 * The player address for a YouTube or Vimeo link a couple pastes, in any of
 * the forms those sites hand out, or null when it isn't one. YouTube plays
 * from its no-cookie domain, so a guest isn't tracked until they press play.
 */
export function videoEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const youtube = (id: string | null | undefined) =>
    id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;

  if (host === "youtu.be") return youtube(url.pathname.slice(1));
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") return youtube(url.searchParams.get("v"));
    const [, kind, id] = url.pathname.split("/");
    if (kind === "embed" || kind === "shorts" || kind === "live") return youtube(id);
    return null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").find((part) => /^\d+$/.test(part));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

/** A link a guest can safely open: http or https only. */
export function safeLink(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
