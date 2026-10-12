import { artById, resolveDesign, type SiteDesign } from "@/lib/site-design";

/** 320px of the thumbnail as container units, so every card scales as one. */
const u = (px: number) => `${(px / 3.2).toFixed(3)}cqw`;

const PHOTO_HEROES = new Set(["full", "split", "framed", "card"]);

/**
 * A miniature of a guest-site page in a design's look: its menu, the couple's
 * names and date, the RSVP button, its artwork and a hint of the sections
 * below. Drawn rather than rendered, so a page of them stays light. It fills
 * its parent, which sets the shape.
 */
export function SiteThumb({
  design,
  names,
  dateLine,
  photoUrl,
}: {
  design: SiteDesign;
  names: [string, string];
  /** "June 14, 2027 · Austin, TX", or null to leave it out. */
  dateLine: string | null;
  photoUrl?: string | null;
}) {
  const { theme, accent, heading, onAccent } = resolveDesign(design);
  const art = artById(design.art.id);
  const a = names[0]?.trim() || "Alex";
  const b = names[1]?.trim() || "Sam";
  const poster = design.hero === "poster";
  const photo = photoUrl && PHOTO_HEROES.has(design.hero) ? photoUrl : null;

  const sprig = (mirror: boolean) =>
    art && (
      <span
        aria-hidden="true"
        className="absolute"
        style={{
          top: "6%",
          [mirror ? "right" : "left"]: "3%",
          width: "20%",
          height: "38%",
          transform: mirror ? "scaleX(-1)" : undefined,
          ...(art.kind === "line"
            ? {
                background: accent,
                WebkitMask: `url(${art.src}) top / contain no-repeat`,
                mask: `url(${art.src}) top / contain no-repeat`,
              }
            : { background: `url(${art.src}) top / contain no-repeat` }),
        }}
      />
    );

  const lines = (
    <span className="mx-auto grid w-[58%]" style={{ gap: u(4), marginTop: u(12) }}>
      {[90, 70, 80].map((w) => (
        <span
          key={w}
          className="mx-auto block rounded-sm"
          style={{ height: u(3), width: `${w}%`, background: theme.ink, opacity: 0.12 }}
        />
      ))}
    </span>
  );

  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 block overflow-hidden text-center [container-type:inline-size]"
      style={{
        background: poster ? `radial-gradient(120% 70% at 50% 0%, ${accent}40, ${theme.bg} 60%)` : theme.bg,
        color: theme.ink,
        outline: design.hero === "framed" ? `1px solid ${accent}55` : undefined,
        outlineOffset: design.hero === "framed" ? "-6px" : undefined,
      }}
    >
      {sprig(false)}
      {sprig(true)}
      <span
        className="relative flex justify-center uppercase"
        style={{ gap: u(10), paddingTop: u(10), fontFamily: theme.body, fontSize: u(7.5), letterSpacing: "0.12em", opacity: 0.7 }}
      >
        <span>Our story</span>
        <span>Schedule</span>
        <span>Travel</span>
        <span>RSVP</span>
      </span>
      <span className="relative block" style={{ padding: `${u(16)} ${u(10)} 0` }}>
        <span
          className="block truncate"
          style={{
            fontFamily: theme.display,
            color: heading,
            fontSize: u(28),
            lineHeight: 1.05,
            fontStyle: theme.italicNames ? "italic" : "normal",
            fontWeight: theme.nameWeight,
          }}
        >
          {a} &amp; {b}
        </span>
        {dateLine && (
          <span
            className="block truncate uppercase"
            style={{ fontFamily: theme.body, fontSize: u(9), letterSpacing: "0.2em", opacity: 0.75, marginTop: u(6) }}
          >
            {dateLine}
          </span>
        )}
        <span
          className="inline-block font-semibold"
          style={{
            marginTop: u(10),
            background: accent,
            color: onAccent,
            borderRadius: theme.radius,
            fontFamily: theme.body,
            fontSize: u(8),
            letterSpacing: "0.14em",
            padding: `${u(4)} ${u(12)}`,
          }}
        >
          RSVP
        </span>
      </span>
      {photo ? (
        <span
          className="mx-auto block bg-cover bg-center"
          style={{ height: u(70), width: "56%", marginTop: u(10), borderRadius: u(4), backgroundImage: `url(${photo})` }}
        />
      ) : null}
      {lines}
      <span className="block" style={{ marginTop: u(16), fontFamily: theme.display, color: heading, fontSize: u(14) }}>
        Schedule
      </span>
      {lines}
      <span className="flex justify-center" style={{ gap: u(6), marginTop: u(10) }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ width: u(46), height: u(30), border: `1px solid ${theme.ink}22`, borderRadius: u(4) }}
          />
        ))}
      </span>
    </span>
  );
}

/** "June 14, 2027 · Austin, TX" for the thumbnails. */
export function thumbDateLine(date: string | null, place: string | null) {
  const when = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  return [when, place].filter(Boolean).join(" · ") || null;
}
