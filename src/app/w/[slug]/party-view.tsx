import type { PublicPartyMember } from "@/lib/supabase/types";
import { FramedPhoto } from "@/components/framed-photo";
import { SiteText } from "@/components/site-text";

/**
 * The wedding party: a portrait, name, role and a line about each of them.
 * Two to a row on a phone (one when someone has a long line about them would
 * crowd), three or four across on a computer.
 */
export function PartyView({ members, card }: { members: PublicPartyMember[]; card: string }) {
  if (members.length === 0) return null;
  return (
    <div className={card}>
      <SiteText slot="party.title" className="font-display text-2xl font-semibold text-forest">
        Our wedding party
      </SiteText>
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
        {members.map((m) => (
          <li key={m.id} className="flex flex-col items-center text-center">
            <FramedPhoto
              src={m.photo_url}
              alt={m.name}
              initial={m.name.trim().charAt(0).toUpperCase()}
              sizes="(min-width: 1024px) 200px, 40vw"
              aspect="4 / 5"
              fallback="circle"
              className="w-full max-w-[11rem]"
            />
            <p className="mt-3 font-display text-lg font-semibold leading-tight text-ink">{m.name}</p>
            {m.role && (
              <p className="mt-1 font-mono-numbers text-[11px] uppercase tracking-[0.2em] text-brass">{m.role}</p>
            )}
            {m.site_blurb && <p className="mt-2 text-sm leading-relaxed text-ink/70">{m.site_blurb}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
