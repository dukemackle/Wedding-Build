import Image from "next/image";
import type { Venue, VenueSpace, VenueSpacePlan } from "@/lib/supabase/types";
import { metresToFeet, planAreaSqFt, planCorners, planSizeLabel } from "@/lib/venue-plans";
import { DesignHereButton, type DesignContext } from "./design-here";
import { ConfirmedMark } from "@/components/confirmed-badge";
import { confirmedByOwner } from "@/lib/public-listings";
import { SERVICE_LEVEL_HINTS, SERVICE_LEVELS, VENDOR_POLICIES } from "@/lib/wedding-options";
import { TrackedContactLink } from "@/components/tracked-contact-link";

/**
 * The parts of a venue listing that only exist once a venue has filled in its
 * own details through the claim link. Each renders nothing when the venue
 * hasn't supplied it, so an imported listing looks exactly as it did.
 */

const card = "mt-6 rounded-lg border border-hairline bg-card p-6 shadow-sm";

/**
 * What's provided, capacity, vendor policy: the facts couples shortlist on.
 * Price isn't here -- it leads the action box beside it, and saying it twice
 * in one glance reads as a mistake.
 */
export function VenueKeyFacts({ venue }: { venue: Venue }) {
  type Fact = { label: string; value: string; note: string | null; confirmed: boolean };
  const facts: (Fact | false | null | 0 | undefined)[] = [
    venue.service_level && {
      label: "What's provided",
      value: SERVICE_LEVELS[venue.service_level],
      note: SERVICE_LEVEL_HINTS[venue.service_level],
      confirmed: confirmedByOwner(venue, "service_level"),
    },
    (venue.capacity || venue.capacity_standing) && {
      label: "Guests",
      value: [venue.capacity && `${venue.capacity} seated`, venue.capacity_standing && `${venue.capacity_standing} standing`]
        .filter(Boolean)
        .join(" · "),
      note: null,
      confirmed: confirmedByOwner(venue, "capacity", "capacity_standing"),
    },
    venue.vendor_policy && {
      label: "Outside vendors",
      value: VENDOR_POLICIES[venue.vendor_policy],
      note: null,
      confirmed: confirmedByOwner(venue, "vendor_policy"),
    },
  ];
  const shown = facts.filter((f): f is Fact => Boolean(f));

  if (shown.length === 0) return null;
  return (
    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-5 sm:grid-cols-3">
      {shown.map((f) => (
        <div key={f.label}>
          <dt className="text-xs uppercase tracking-wide text-ink/50">{f.label}</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {f.value}
            {f.confirmed && <ConfirmedMark />}
          </dd>
          {f.note && <dd className="mt-0.5 text-xs text-ink/55">{f.note}</dd>}
        </div>
      ))}
    </dl>
  );
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
    <div className={card}>
      <h2 className="font-display text-xl font-semibold text-forest">Event spaces</h2>
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
    </div>
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
  const links = [
    ["Website", venue.website],
    ["Instagram", venue.instagram_url],
    ["Facebook", venue.facebook_url],
    ["Pinterest", venue.pinterest_url],
    ["TikTok", venue.tiktok_url],
    ["YouTube", venue.youtube_url],
    ["Reviews", venue.reviews_url],
  ].filter((l): l is [string, string] => Boolean(l[1]));

  if (rows.length === 0 && links.length === 0) return null;
  return (
    <div className={card}>
      <h2 className="font-display text-xl font-semibold text-forest">Good to know</h2>
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
      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(([label, href]) => (
            <TrackedContactLink
              key={label}
              listingType="venue"
              listingId={venue.id}
              kind={label === "Website" ? "website" : "social"}
              href={href}
              className="rounded-full border border-hairline px-3 py-1 text-sm text-ink transition-colors hover:border-forest"
            >
              {label} ↗
            </TrackedContactLink>
          ))}
        </div>
      )}
    </div>
  );
}
