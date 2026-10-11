import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { ALL_FONTS_HREF } from "@/lib/site-design";
import { MAX_DESIGNS } from "@/lib/site-designs";
import { templateById } from "@/lib/site-templates";
import { loadSiteDesigns } from "../load-designs";
import { TemplatesGallery } from "./templates-gallery";

/**
 * Guests › Guest site › Templates: every template, drawn in the couple's
 * names. Picking one opens a full preview; "Customize this template" makes it
 * a new design. `?t=<id>` opens that template's preview straight away.
 */
export default async function GuestSiteTemplatesPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const site = await loadSiteDesigns();
  if (!site.wedding) redirect("/guests/site");

  return (
    <PageShell email={site.user.email ?? ""} width="wide">
      <link rel="stylesheet" href={ALL_FONTS_HREF} precedence="default" />
      <TemplatesGallery
        base={site.base}
        names={site.names}
        dateLine={site.dateLine}
        photoUrl={site.photoUrl}
        initialOpen={templateById(t)?.id ?? null}
        full={site.designs.length >= MAX_DESIGNS}
      />
    </PageShell>
  );
}
