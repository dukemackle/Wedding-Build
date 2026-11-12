/**
 * A template's card as a saved picture: the template on a sample couple,
 * screenshotted at computer width for wide cards and phone width for upright
 * ones (public/site-templates, made by `npm run template-pictures`). Live
 * frames of the couple's own site took seconds a card; these load at once
 * (owner, 2026-11-12: sample couple over their own names, for speed). The
 * card's own aspect picks the picture: 4:3 from `sm` up, upright below, as
 * SitePageThumb does. Designs the couple has made stay live.
 */
export function TemplatePicture({ id, upright = false }: { id: string; upright?: boolean }) {
  const src = (kind: "computer" | "phone") => `/site-templates/${id}-${kind}.webp`;
  return (
    <picture className="absolute inset-0">
      {!upright && <source media="(min-width: 640px)" srcSet={src("computer")} />}
      <img src={src("phone")} alt="" className="h-full w-full object-cover object-top" />
    </picture>
  );
}
