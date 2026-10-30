import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { MAX_DESIGNS } from "@/lib/site-designs";
import { templateById } from "@/lib/site-templates";
import { loadSiteDesigns } from "../load-designs";
import { TemplatesGallery } from "./templates-gallery";

/**
 * Guests › Guest site › Templates: every template, shown as the couple's
 * own site in that look. Picking one opens a full preview; "Customize this template" makes it
 * a new design. `?t=<id>` opens that template's preview straight away.
 */
export default async function GuestSiteTemplatesPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const site = await loadSiteDesigns();
  if (!site.wedding) redirect("/guests/site");

  return (
    <PageShell email={site.user.email ?? ""} width="wide">
      <TemplatesGallery
        base={site.base}
        samplePhotos={!site.photoUrl}
        initialOpen={templateById(t)?.id ?? null}
        full={site.designs.length >= MAX_DESIGNS}
      />
    </PageShell>
  );
}
