import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { applyTemplate, TEMPLATES } from "@/lib/site-templates";
import { DesignsHome } from "./designs-home";
import { loadSiteDesigns } from "./load-designs";
import { LAST_DESIGN_COOKIE } from "./resume";

/**
 * Guests › Guest site: the couple's designs, the live one marked, and
 * templates to start another from. Each design opens in the editor at
 * /guests/site/edit/[id]. Coming back here reopens the design last being
 * edited on this device, unless "Your designs" (?designs) asked for the list.
 */
export default async function GuestSiteDesignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [site, query, jar] = await Promise.all([loadSiteDesigns(), searchParams, cookies()]);
  const last = jar.get(LAST_DESIGN_COOKIE)?.value;
  if (!("designs" in query) && last && site.designs?.some((d) => d.id === last)) {
    redirect(`/guests/site/edit/${encodeURIComponent(last)}`);
  }

  if (!site.wedding) {
    return (
      <PageShell email={site.user.email ?? ""} width="reading">
        <div className="rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-forest">Set up your wedding first</h1>
          <p className="mt-4 text-ink/70">Add your wedding details on the Dashboard before designing your guest site.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell email={site.user.email ?? ""} width="wide">
      <DesignsHome
        designs={site.designs}
        starters={TEMPLATES.map((t) => ({
          id: t.id,
          name: t.name,
          blurb: t.blurb,
          design: applyTemplate(site.base, t),
        }))}
        liveUrl={site.liveUrl}
      />
    </PageShell>
  );
}
