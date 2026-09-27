import Image from "next/image";
import type { Venue, VenueSpace } from "@/lib/supabase/types";
import { SERVICE_LEVEL_HINTS, SERVICE_LEVELS, VENDOR_POLICIES } from "@/lib/wedding-options";

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
  type Fact = { label: string; value: string; note: string | null };
  const facts: (Fact | false | null | 0 | undefined)[] = [
    venue.service_level && {
      label: "What's provided",
      value: SERVICE_LEVELS[venue.service_level],
      note: SERVICE_LEVEL_HINTS[venue.service_level],
    },
    (venue.capacity || venue.capacity_standing) && {
      label: "Guests",
      value: [venue.capacity && `${venue.capacity} seated`, venue.capacity_standing && `${venue.capacity_standing} standing`]
        .filter(Boolean)
        .join(" · "),
      note: null,
    },
    venue.vendor_policy && { label: "Outside vendors", value: VENDOR_POLICIES[venue.vendor_policy], note: null },
  ];
  const shown = facts.filter((f): f is Fact => Boolean(f));

  if (shown.length === 0) return null;
  return (
    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-5 sm:grid-cols-3">
      {shown.map((f) => (
        <div key={f.label}>
          <dt className="text-xs uppercase tracking-wide text-ink/50">{f.label}</dt>
          <dd className="mt-0.5 font-medium text-ink">{f.value}</dd>
          {f.note && <dd className="mt-0.5 text-xs text-ink/55">{f.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function VenueSpaces({ spaces }: { spaces: VenueSpace[] }) {
  if (spaces.length === 0) return null;
  return (
    <div className={card}>
      <h2 className="font-display text-xl font-semibold text-forest">Event spaces</h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {spaces.map((sp) => (
          <div key={sp.id} className="overflow-hidden rounded-md border border-hairline">
            {sp.photo_url && (
              <Image
                src={sp.photo_url}
                alt={sp.name}
                width={480}
                height={300}
                className="aspect-[16/10] w-full border-b border-hairline object-cover"
              />
            )}
            <div className="p-4">
              <p className="font-display text-lg font-semibold text-forest">{sp.name}</p>
              {(sp.setting || sp.capacity) && (
                <p className="mt-0.5 text-xs uppercase tracking-wide text-ink/50">
                  {[sp.setting, sp.capacity && `Up to ${sp.capacity} guests`].filter(Boolean).join(" · ")}
                </p>
              )}
              {sp.description && <p className="mt-2 whitespace-pre-line text-sm text-ink/75">{sp.description}</p>}
            </div>
          </div>
        ))}
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
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="rounded-full border border-hairline px-3 py-1 text-sm text-ink transition-colors hover:border-forest"
            >
              {label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
