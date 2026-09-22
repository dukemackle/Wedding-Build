import { PhotoUpload } from "@/components/photo-upload";

/**
 * The guest site's banner photo, edited where the banner is.
 *
 * This used to be a card on the dashboard called "Hero photo" -- a page with
 * no hero on it, describing a picture the couple couldn't see from there. It
 * belongs beside the rest of the guest site settings, next to the link that
 * shows what it looks like.
 */
export function HeroPhotoPanel({ photoUrl }: { photoUrl: string | null }) {
  return (
    <div>
      <p className="max-w-2xl text-sm text-ink/70">
        Shown across the top of your guest site. A wide shot works best — it&apos;s cropped to a
        band, so anything important near the edges gets cut.
      </p>
      <div className="mt-4">
        <PhotoUpload
          kind="hero"
          photoUrl={photoUrl}
          shape="wide"
          confirmRemove="Remove the banner photo from your guest site?"
        />
      </div>
    </div>
  );
}
