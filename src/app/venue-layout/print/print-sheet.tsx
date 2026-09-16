import type { Guest, SeatingTable, VenueRoom } from "@/lib/supabase/types";

/** How many seats a guest occupies -- a plus one is a second body at the table. */
function seats(guest: Guest) {
  return guest.plus_one ? 2 : 1;
}

function guestLabel(guest: Guest) {
  if (!guest.plus_one) return guest.name;
  return guest.plus_one_name ? `${guest.name} (+1 ${guest.plus_one_name})` : `${guest.name} (+1)`;
}

function TableCard({ table, guests }: { table: SeatingTable; guests: Guest[] }) {
  const taken = guests.reduce((sum, guest) => sum + seats(guest), 0);

  return (
    <div className="break-inside-avoid rounded-lg border border-hairline p-4">
      <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
        <p className="font-display text-lg font-semibold text-forest">{table.name}</p>
        <p className="font-mono-numbers text-[11px] text-ink/55">
          {taken}
          {table.capacity ? ` / ${table.capacity}` : ""} seated
        </p>
      </div>
      {guests.length > 0 ? (
        <ol className="mt-2">
          {guests.map((guest) => (
            <li key={guest.id} className="py-0.5 text-sm text-ink">
              {guestLabel(guest)}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm italic text-ink/45">No one seated here yet.</p>
      )}
    </div>
  );
}

export function SeatingPrintSheet({
  coupleNames,
  weddingDate,
  tables,
  rooms,
  guests,
}: {
  coupleNames: string;
  weddingDate: string | null;
  tables: SeatingTable[];
  rooms: VenueRoom[];
  guests: Guest[];
}) {
  const byTable = new Map<string, Guest[]>();
  const unseated: Guest[] = [];
  for (const guest of guests) {
    if (!guest.table_id) {
      unseated.push(guest);
      continue;
    }
    const list = byTable.get(guest.table_id);
    if (list) list.push(guest);
    else byTable.set(guest.table_id, [guest]);
  }

  // Tables with no room fall into a trailing catch-all rather than being
  // dropped: an unassigned table still has people sitting at it.
  const groups = [
    ...rooms.map((room) => ({
      key: room.id,
      name: room.name,
      tables: tables.filter((table) => table.room_id === room.id),
    })),
    {
      key: "__unassigned",
      name: rooms.length > 0 ? "Other tables" : "Tables",
      tables: tables.filter((table) => !table.room_id),
    },
  ].filter((group) => group.tables.length > 0);

  const tableName = new Map(tables.map((table) => [table.id, table.name]));
  const seated = guests.filter((guest) => guest.table_id);
  const index = [...seated].sort((a, b) => {
    const aKey = a.name.split(" ").slice(-1)[0] || a.name;
    const bKey = b.name.split(" ").slice(-1)[0] || b.name;
    return aKey.localeCompare(bKey) || a.name.localeCompare(b.name);
  });

  const formattedDate = weddingDate
    ? new Date(`${weddingDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="text-ink">
      <header className="border-b border-hairline pb-4">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Seating chart
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
          {coupleNames || "Our wedding"}
        </h1>
        {formattedDate && <p className="mt-1 text-sm text-ink/60">{formattedDate}</p>}
        <p className="mt-2 font-mono-numbers text-[11px] text-ink/55">
          {tables.length} {tables.length === 1 ? "table" : "tables"} · {seated.length} seated
          {unseated.length > 0 ? ` · ${unseated.length} not yet seated` : ""}
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.key} className="mt-6">
          {groups.length > 1 && (
            <h2 className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
              {group.name}
            </h2>
          )}
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2">
            {group.tables.map((table) => (
              <TableCard key={table.id} table={table} guests={byTable.get(table.id) ?? []} />
            ))}
          </div>
        </section>
      ))}

      {unseated.length > 0 && (
        <section className="mt-6 break-inside-avoid rounded-lg border border-hairline p-4">
          <h2 className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            Not yet seated
          </h2>
          <ul className="mt-2 gap-x-6 sm:columns-2 print:columns-3">
            {unseated.map((guest) => (
              <li key={guest.id} className="break-inside-avoid py-0.5 text-sm text-ink/80">
                {guestLabel(guest)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The second sheet is the one that goes on an easel at the door:
          guests look themselves up by surname, not by wandering the tables. */}
      {index.length > 0 && (
        <section className="mt-10 break-before-page">
          <h2 className="font-display text-2xl font-semibold text-forest">Find your table</h2>
          <p className="mt-1 text-sm text-ink/60">By last name.</p>
          {/* Multi-column, not a grid: a grid fills row-wise, which would run
              the alphabet across the page when a guest reads down a column. */}
          <ul className="mt-4 gap-x-8 sm:columns-2">
            {index.map((guest) => (
              <li
                key={guest.id}
                className="flex break-inside-avoid items-baseline justify-between gap-3 border-b border-hairline py-1.5"
              >
                <span className="text-sm text-ink">{guestLabel(guest)}</span>
                <span className="shrink-0 font-mono-numbers text-xs text-ink/60">
                  {guest.table_id ? tableName.get(guest.table_id) ?? "—" : "—"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
