import Image from "next/image";
import type { SiteBlock } from "@/lib/supabase/types";
import { safeLink, videoEmbedUrl } from "@/lib/video-embed";

const CARD = "site-card rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm";

/** Whether a block has anything to show yet -- empty ones stay off the page. */
export function blockHasContent(block: SiteBlock) {
  if (block.kind === "photo") return Boolean(block.photo_url);
  if (block.kind === "video") return Boolean(videoEmbedUrl(block.url));
  if (block.kind === "link") return Boolean(safeLink(block.url));
  return Boolean(block.body);
}

/**
 * A photo, story or quote the couple added. Returns null until it has
 * something in it, so an empty block never shows guests a blank card.
 */
export function SiteBlockView({ block }: { block: SiteBlock }) {
  if (block.kind === "story" && block.body) {
    return (
      <div className={`${CARD} text-center`}>
        {block.heading && (
          <h2 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{block.heading}</h2>
        )}
        <div className="mx-auto mt-4 max-w-[60ch] whitespace-pre-line text-left leading-relaxed text-ink/80 sm:text-center">
          {block.body}
        </div>
      </div>
    );
  }

  if (block.kind === "quote" && block.body) {
    return (
      <figure className="px-4 py-6 text-center sm:px-10">
        <blockquote className="font-display text-2xl italic leading-snug text-forest sm:text-3xl">
          &ldquo;{block.body}&rdquo;
        </blockquote>
        {block.attribution && (
          <figcaption className="mt-4 font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            {block.attribution}
          </figcaption>
        )}
      </figure>
    );
  }

  const embed = block.kind === "video" ? videoEmbedUrl(block.url) : null;
  if (embed) {
    return (
      <figure>
        <div className="relative aspect-video w-full overflow-hidden rounded-[min(var(--site-radius,1rem),1.5rem)] bg-[var(--site-photo)]">
          <iframe
            src={embed}
            title={block.heading ?? "Video"}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        {block.heading && <figcaption className="mt-3 text-center text-sm text-ink/70">{block.heading}</figcaption>}
      </figure>
    );
  }

  const href = block.kind === "link" ? safeLink(block.url) : null;
  if (href) {
    return (
      <div className={`${CARD} text-center`}>
        {block.body && <p className="mx-auto max-w-[50ch] whitespace-pre-line leading-relaxed text-ink/80">{block.body}</p>}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-motion inline-block rounded-md bg-forest px-6 py-3 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 ${block.body ? "mt-5" : ""}`}
        >
          {block.heading || "Open the link"} <span aria-hidden="true">↗</span>
        </a>
      </div>
    );
  }

  if (block.kind === "photo" && block.photo_url) {
    return (
      <figure>
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[min(var(--site-radius,1rem),1.5rem)] bg-[var(--site-photo)]">
          <Image src={block.photo_url} alt={block.heading ?? ""} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
        </div>
        {block.heading && <figcaption className="mt-3 text-center text-sm text-ink/70">{block.heading}</figcaption>}
      </figure>
    );
  }

  return null;
}
