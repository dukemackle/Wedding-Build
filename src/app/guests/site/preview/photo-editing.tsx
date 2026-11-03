"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSiteDesign } from "@/components/guest-site-theme";
import { removeWeddingPhoto, uploadWeddingPhoto } from "@/app/dashboard/actions";
import { MAX_GALLERY_PHOTOS } from "@/lib/guest-site";
import { PHOTO_HEROES } from "@/lib/site-design";
import { shrinkImage } from "@/lib/shrink-image";
import { addGalleryPhotos, removeGalleryPhoto, replaceGalleryPhoto } from "../../guest-site-actions";
import { CANVAS_MODE, PHOTOS_CHANGED } from "../canvas-messages";

const ROYAL = "#2243B6";
const NAVY = "#14203d";

/** What was clicked: one gallery photo (a sample stands in until there are real ones), or the banner. */
type Target = { kind: "gallery"; id: string; sample: boolean } | { kind: "banner" };
type Rect = { left: number; top: number; width: number; height: number };

function post(data: object) {
  window.parent?.postMessage(data, window.location.origin);
}

/**
 * Click a photo on the page to change it right there (owner, 2026-11-03):
 * a gallery photo, or the banner across the top. A small bar sits on the
 * photo with Replace and Remove; on a sample photo it offers to add the
 * couple's own. The Sections panel still adds photos in bulk.
 *
 * Only the editor's preview mounts this. Uploads go straight from the frame
 * through the same server actions the panel uses, then the frame refreshes
 * and tells the editor to, so the panel's list matches.
 */
export function PhotoEditing({ ownBanner, galleryCount }: { ownBanner: boolean; galleryCount: number }) {
  const { hero } = useSiteDesign();
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nodeRef = useRef<HTMLElement | null>(null);
  // The bar's own width, so it's kept fully on screen near an edge.
  const [barWidth, setBarWidth] = useState(280);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoHero = PHOTO_HEROES.includes(hero);
  const photoHeroRef = useRef(photoHero);
  useEffect(() => {
    photoHeroRef.current = photoHero;
  }, [photoHero]);

  function close() {
    nodeRef.current = null;
    setTarget(null);
    setRect(null);
    setError(null);
  }

  // Editing follows the editor: off while the phone editor previews as guests see it.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === CANVAS_MODE) {
        setOn(Boolean(event.data.on));
        if (!event.data.on) close();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!on) return;
    function onClick(event: MouseEvent) {
      const el = event.target as Element | null;
      if (!el?.closest) return;
      if (el.closest("[data-photo-ui]")) return;
      // Words, placed elements, buttons and links keep their own tools.
      if (el.closest("[data-canvas-ui], [data-site-text], [data-el], a, button, input, select, textarea, label")) {
        close();
        return;
      }
      const photo = el.closest<HTMLElement>("[data-gallery-photo]");
      const heroNode = photoHeroRef.current ? el.closest<HTMLElement>('[data-canvas-section="hero"]') : null;
      const node = photo ?? heroNode;
      if (!node) {
        close();
        return;
      }
      const id = photo?.dataset.galleryPhoto;
      nodeRef.current = node;
      setError(null);
      setTarget(id ? { kind: "gallery", id, sample: id.startsWith("sample-") } : { kind: "banner" });
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [on]);

  // Follows the photo as the page scrolls, a filmstrip slides or images load.
  useEffect(() => {
    if (!target) return;
    let raf = 0;
    const track = () => {
      const node = nodeRef.current;
      if (node?.isConnected) {
        const r = node.getBoundingClientRect();
        setRect((prev) =>
          prev && prev.left === r.left && prev.top === r.top && prev.width === r.width && prev.height === r.height
            ? prev
            : { left: r.left, top: r.top, width: r.width, height: r.height },
        );
      } else if (node) {
        // Re-rendered (a refresh after an upload): find the same photo again.
        const again =
          target.kind === "gallery"
            ? ([...document.querySelectorAll<HTMLElement>(`[data-gallery-photo="${CSS.escape(target.id)}"]`)].find(
                (n) => n.getClientRects().length > 0,
              ) ?? null)
            : document.querySelector<HTMLElement>('[data-canvas-section="hero"]');
        nodeRef.current = again;
        if (!again) setRect(null);
      }
      raf = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(raf);
  }, [target]);

  function done() {
    router.refresh();
    post({ type: PHOTOS_CHANGED });
    setStatus(null);
    close();
  }

  function onPicked(files: File[]) {
    const images = files.filter((f) => f.size > 0 && f.type.startsWith("image/"));
    if (inputRef.current) inputRef.current.value = "";
    if (!target || images.length === 0) return;
    setError(null);
    startTransition(async () => {
      if (target.kind === "banner") {
        setStatus("Uploading…");
        const form = new FormData();
        form.set("kind", "hero");
        form.set("photo", await shrinkImage(images[0]));
        const result = await uploadWeddingPhoto(form);
        if (result?.error) return void (setError(result.error), setStatus(null));
      } else if (!target.sample) {
        setStatus("Uploading…");
        const form = new FormData();
        form.set("id", target.id);
        form.set("photo", await shrinkImage(images[0]));
        const result = await replaceGalleryPhoto(form);
        if (result?.error) return void (setError(result.error), setStatus(null));
      } else {
        // Samples stand in for an empty gallery; the couple's own replace them all.
        const room = Math.max(0, MAX_GALLERY_PHOTOS - galleryCount);
        const picked = images.slice(0, room);
        for (const [i, file] of picked.entries()) {
          setStatus(picked.length > 1 ? `Uploading ${i + 1} of ${picked.length}…` : "Uploading…");
          const form = new FormData();
          form.set("photos", await shrinkImage(file));
          const result = await addGalleryPhotos(form);
          if (result?.error) {
            setStatus(null);
            setError(i > 0 ? `Added ${i} of ${picked.length}. ${result.error}` : result.error);
            if (i > 0) router.refresh();
            return;
          }
        }
      }
      done();
    });
  }

  function remove() {
    if (!target) return;
    const banner = target.kind === "banner";
    if (!confirm(banner ? "Remove your banner photo?" : "Remove this photo from your guest site?")) return;
    setError(null);
    startTransition(async () => {
      setStatus("Removing…");
      const form = new FormData();
      if (banner) form.set("kind", "hero");
      else if (target.kind === "gallery") form.set("id", target.id);
      const result = banner ? await removeWeddingPhoto(form) : await removeGalleryPhoto(form);
      if (result?.error) return void (setError(result.error), setStatus(null));
      done();
    });
  }

  if (!on || !target || !rect) return null;

  const sample = target.kind === "gallery" ? target.sample : !ownBanner;
  const many = target.kind === "gallery" && target.sample;
  const choose =
    target.kind === "banner" ? (ownBanner ? "Replace banner" : "Add your banner photo") : sample ? "Add your photos" : "Replace photo";
  // On the photo near its top edge, kept on screen; a banner's bar sits a little lower, clear of the nav.
  const vw = window.innerWidth;
  const top = Math.min(Math.max(rect.top + (target.kind === "banner" ? 20 : 10), 8), window.innerHeight - 60);
  const half = barWidth / 2 + 8;
  const center = Math.min(Math.max(rect.left + rect.width / 2, half), vw - half);

  return createPortal(
    // data-canvas-ui too, so a press on the bar doesn't unpick the section.
    <div data-photo-ui data-canvas-ui>
      {/* The picked photo, outlined in the selection colour. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          outline: `2px solid ${ROYAL}`,
          outlineOffset: 2,
          borderRadius: 4,
          pointerEvents: "none",
          zIndex: 45,
        }}
      />
      <div
        ref={(node) => {
          if (node && Math.abs(node.offsetWidth - barWidth) > 1) setBarWidth(node.offsetWidth);
        }}
        role="toolbar"
        aria-label={target.kind === "banner" ? "Banner photo" : "Photo"}
        style={{
          position: "fixed",
          left: center,
          top,
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          zIndex: 46,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            borderRadius: 10,
            background: "#fff",
            boxShadow: "0 2px 12px rgba(20,32,61,.22)",
          }}
        >
          <BarButton primary disabled={isPending} onClick={() => inputRef.current?.click()}>
            <Icon>
              <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
            </Icon>
            {status ?? choose}
          </BarButton>
          {!sample && !isPending && (
            <BarButton onClick={remove}>
              <Icon>
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </Icon>
              Remove
            </BarButton>
          )}
          <BarButton label="Close" disabled={isPending} onClick={close}>
            <Icon>
              <path d="M6 6l12 12M18 6L6 18" />
            </Icon>
          </BarButton>
        </div>
        {(error || sample) && (
          <p
            role={error ? "alert" : undefined}
            style={{
              margin: 0,
              maxWidth: 260,
              padding: "4px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,.95)",
              boxShadow: "0 1px 6px rgba(20,32,61,.15)",
              color: error ? "#9b1c1c" : NAVY,
              fontSize: 12,
              lineHeight: 1.35,
              textAlign: "center",
            }}
          >
            {error ?? (target.kind === "banner" ? "This is a sample photo." : "Sample photos — yours replace them all.")}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={many}
          hidden
          onChange={(e) => onPicked(Array.from(e.currentTarget.files ?? []))}
        />
      </div>
    </div>,
    document.body,
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function BarButton({
  children,
  onClick,
  primary = false,
  disabled = false,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 36,
        padding: label ? "0 8px" : "0 12px",
        border: 0,
        borderRadius: 7,
        background: primary ? ROYAL : "transparent",
        color: primary ? "#fff" : NAVY,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: disabled ? "wait" : "pointer",
        opacity: disabled && !primary ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
