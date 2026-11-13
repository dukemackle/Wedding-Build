/**
 * The closing band's photo: the champagne toast, fixed. The owner chose it
 * on 2026-11-13 over the old per-visit rotation (toast, waterfront,
 * sparklers). Free under the Unsplash licence; not in the hero rotation.
 */
export function ClosingPhoto() {
  return (
    <>
      <img
        src="/landing/closing-toast-2000.webp"
        srcSet="/landing/closing-toast-1000.webp 1000w, /landing/closing-toast-2000.webp 2000w"
        sizes="100vw"
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <p className="absolute bottom-2 right-3 z-10 text-[11px] text-white/70">Photo: Al Elmes, Unsplash</p>
    </>
  );
}
