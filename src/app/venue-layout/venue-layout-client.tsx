"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";

/**
 * Keeps the floor-plan editor off the server entirely.
 *
 * VenueLayoutManager is by far the largest component in the app, and
 * server-rendering it was costing more CPU than a Cloudflare Worker is
 * allowed per request -- the route was returning a Cloudflare 1102
 * ("Worker exceeded resource limits") rather than a page.
 *
 * Nothing is lost by skipping SSR here: the page sits behind auth so it is
 * never crawled, the editor is drag-and-drop and unusable until JavaScript
 * loads anyway, and the server-rendered markup was thrown away at hydration
 * moments later. The 3D view a few files over already does exactly this.
 *
 * `ssr: false` is only legal inside a Client Component, which is the entire
 * reason this wrapper exists -- page.tsx is a Server Component and cannot
 * pass the flag itself.
 */
const VenueLayoutManager = dynamic(
  () => import("./venue-layout-manager").then((m) => m.VenueLayoutManager),
  { ssr: false, loading: VenueLayoutSkeleton },
);

/**
 * Mirrors the real editor's frame -- the same page header with its toolbar
 * row, then the plan card at the canvas height -- so the page doesn't
 * visibly resize when the editor arrives. Only the contents fade in.
 */
function VenueLayoutSkeleton() {
  return (
    <div aria-busy="true">
      <PageHeader
        eyebrow="Venue layout"
        title="Set the"
        accent="room"
        photo="layout"
        toolbar={
          <div className="flex flex-wrap items-center gap-3" aria-hidden="true">
            <span className="h-10 w-32 rounded-full bg-parchment" />
            <span className="h-10 w-64 rounded-full bg-parchment" />
            <span className="h-10 w-28 rounded-full bg-parchment" />
          </div>
        }
      >
        Loading your floor plan…
      </PageHeader>
      <div className="w-full rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-8">
        <div
          className="h-[520px] w-full rounded-lg border border-hairline bg-parchment"
          aria-hidden="true"
        />
      </div>
      <span className="sr-only">Loading the venue layout editor</span>
    </div>
  );
}

export function VenueLayoutClient(
  props: React.ComponentProps<typeof import("./venue-layout-manager").VenueLayoutManager>,
) {
  return <VenueLayoutManager {...props} />;
}
