import Image from "next/image";
import type { Venue, VenueSpace, VenueSpacePlan } from "@/lib/supabase/types";
import { metresToFeet, planAreaSqFt, planCorners, planSizeLabel } from "@/lib/venue-plans";
import { DesignHereButton, type DesignContext } from "./design-here";
import { ConfirmedMark } from "@/components/confirmed-badge";
import { confirmedByOwner } from "@/lib/public-listings";
import { SERVICE_LEVELS } from "@/lib/wedding-options";
import { KeyStats, REPLY_SHORT, SectionHeading, type KeyStat } from "@/components/listing-parts";

/**
 * The parts of a venue listing that only exist once a venue has filled in its
 * own details through the claim link. Each renders nothing when the venue
 * hasn't supplied it, so an imported listing looks exactly as it did.
 */

const card = "scroll-mt-24 rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8";

/** The strip's short wording for the outside-vendor rule (the full one is on the claim form). */
const VENDOR_POLICY_SHORT = {
  any: "Any vendors",
  preferred: "Outside OK",
  required: "Their list only",
} as const;

/**
 * Capacity, what's provided, vendor policy and how quickly they reply, large
 * under the name: the facts couples shortlist on. Price isn't here -- it
 * leads the contact card beside it, and saying it twice in one glance reads
 * as a mistake.
 */
export function VenueKeyFacts({ venue }: { venue: Venue }) {
  const years = venue.founded_year ? new Date().getFullYear() - venue.founded_year : 0;
  const stats: (KeyStat | false | null | 0 | undefined)[] = [
    venue.capacity && {
      value: venue.capacity.toLocaleString(),
      label: "seated guests",
      mark: confirmedByOwner(venue, "capacity") ? <ConfirmedMark /> : null,
    },
    venue.capacity_standing && {
      value: venue.capacity_standing.toLocaleString(),
      label: "standing",
      mark: confirmedByOwner(venue, "capacity_standing") ? <ConfirmedMark /> : null,
    },
    venue.service_level && {
      value: SERVICE_LEVELS[venue.service_level],
      label: "what's provided",
      mark: confirmedByOwner(venue, "service_level") ? <ConfirmedMark /> : null,
    },
    venue.vendor_policy && {
      value: VENDOR_POLICY_SHORT[venue.vendor_policy],
      label: "outside vendors",
      mark: confirmedByOwner(venue, "vendor_policy") ? <ConfirmedMark /> : null,
    },
    years > 0 && { value: String(years), label: years === 1 ? "year hosting" : "years hosting" },
    venue.reply_time && { value: REPLY_SHORT[venue.reply_time], label: "to reply" },
  ];
  return <KeyStats stats={stats.filter((s): s is KeyStat => Boolean(s))} />;
}

/** A space's floor plan, drawn to scale and labelled in feet. */
function PlanDrawing({ plan, name }: { plan: VenueSpacePlan; name: string }) {
  const pts = planCorners(plan);
  const big = Math.max(plan.width_m, plan.length_m);
  const pad = big * 0.14;
  const text = big / 26;
  // A light grid every 10 ft, so the size reads at a glance.
  const step = 10 / 3.28084;
  const lines: number[] = [];
  for (let g = step; g < big; g += step) lines.push(g);
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${plan.width_m + pad * 2} ${plan.length_m + pad * 2}`}
      role="img"
      aria-label={`Floor plan of ${name}, ${planSizeLabel(plan)}`}
      className="aspect-[16/10] w-full border-b border-hairline bg-parchment"
    >
      <defs>
        <clipPath id={`plan-${plan.space_id}`}>
          <polygon points={pts.map((p) => p.join(",")).join(" ")} />
        </clipPath>
      </defs>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="#fff" />
      <g clipPath={`url(#plan-${plan.space_id})`} stroke="#00BFFE" strokeOpacity={0.35} strokeWidth={big / 400}>
        {lines.map((g) => (
          <g key={g}>
            {g < plan.width_m && <line x1={g} y1={0} x2={g} y2={plan.length_m} />}
            {g < plan.length_m && <line x1={0} y1={g} x2={plan.width_m} y2={g} />}
          </g>
        ))}
      </g>
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="#14203d"
        strokeWidth={big / 110}
        strokeLinejoin="round"
      />
      <g fill="#14203d" fillOpacity={0.65} fontSize={text} style={{ fontFamily: "var(--font-mono-numbers)" }}>
        <text x={plan.width_m / 2} y={-pad / 3} textAnchor="middle">
          {metresToFeet(plan.width_m)} ft
        </text>
        <text
          x={-pad / 3}
          y={plan.length_m / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${-pad / 3} ${plan.length_m / 2})`}
        >
          {metresToFeet(plan.length_m)} ft
        </text>
      </g>
    </svg>
  );
}

export function VenueSpaces({
  spaces,
  plans = [],
  design,
}: {
  spaces: VenueSpace[];
  plans?: VenueSpacePlan[];
  design?: DesignContext;
}) {
  if (spaces.length === 0) return null;
  const planBySpace = new Map(plans.map((p) => [p.space_id, p]));
  return (
    <section id="spaces" className={card}>
      <SectionHeading eyebrow="The spaces" title="Event spaces" />
      {plans.length > 0 && (
        <p className="mt-1 text-sm text-ink/60">
          Floor plans at real size. Set out your tables and dance floor in the room itself.
        </p>
      )}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {spaces.map((sp) => {
          const plan = planBySpace.get(sp.id);
          return (
            <div key={sp.id} className="flex flex-col overflow-hidden rounded-md border border-hairline">
              {plan ? (
                <PlanDrawing plan={plan} name={sp.name} />
              ) : (
                sp.photo_url && (
                  <Image
                    src={sp.photo_url}
                    alt={sp.name}
                    width={480}
                    height={300}
                    className="aspect-[16/10] w-full border-b border-hairline object-cover"
                  />
                )
              )}
              <div className="flex flex-1 flex-col p-4">
                <p className="font-display text-lg font-semibold text-forest">{sp.name}</p>
                {(sp.setting || sp.capacity) && (
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-ink/50">
                    {[sp.setting, sp.capacity && `Up to ${sp.capacity} guests`].filter(Boolean).join(" · ")}
                  </p>
                )}
                {plan && (
                  <p className="mt-1 font-mono-numbers text-xs text-ink/70">
                    {planSizeLabel(plan)} · {planAreaSqFt(plan).toLocaleString()} sq ft
                  </p>
                )}
                {sp.description && <p className="mt-2 whitespace-pre-line text-sm text-ink/75">{sp.description}</p>}
                {plan && design && (
                  <div className="mt-auto pt-4">
                    <DesignHereButton spaceId={sp.id} context={design} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function VenueGoodToKnow({ venue }: { venue: Venue }) {
  const yesNo = (v: boolean | null) => (v === null ? null : v ? "Yes" : "No");
  const rows = [
    ["On-site lodging", venue.lodging_sleeps ? `Sleeps ${venue.lodging_sleeps}` : venue.lodging_sleeps === 0 ? "None" : null],
    ["Parking", venue.parking],
    ["Wheelchair accessible", yesNo(venue.wheelchair_accessible)],
    ["Pets allowed", yesNo(venue.pets_allowed)],
  ].filter((r): r is [string, string] => Boolean(r[1]));
  if (rows.length === 0) return null;
  return (
    <section className={card}>
      <SectionHeading eyebrow="The venue" title="Practical details" />
      {rows.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-hairline py-2 text-sm">
              <dt className="text-ink/60">{label}</dt>
              <dd className="text-right text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** The venue's website and social profiles, shown as buttons under its name. */
export function venueLinks(venue: Venue): [string, string][] {
  return [
    ["Website", venue.website],
    ["Instagram", venue.instagram_url],
    ["Facebook", venue.facebook_url],
    ["Pinterest", venue.pinterest_url],
    ["TikTok", venue.tiktok_url],
    ["YouTube", venue.youtube_url],
    ["Reviews", venue.reviews_url],
  ].filter((l): l is [string, string] => Boolean(l[1]));
}
