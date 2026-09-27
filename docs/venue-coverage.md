# Venue coverage playbook

How the Venues catalog grows, one city at a time. Read this before starting a
venue batch.

## Why depth before breadth

Venues is a map-and-results browse screen. A city with a handful of pins looks
empty as soon as a couple filters by capacity or type, and that sits badly next
to The Knot. So each market gets filled to a real depth (roughly 50-100
venues) before the next one starts. A few venues in each of many cities would
look thin everywhere.

## City order

Destination markets come first. They have a manageable number of venues, and
couples from anywhere in the country search them, so depth is reachable and
reaches people who live elsewhere.

1. Austin / Hill Country — 68 after batch 2; done unless gaps show up
2. Nashville
3. Charleston
4. Savannah
5. Scottsdale / Phoenix
6. Napa / Sonoma
7. Asheville

Then the big metros (Dallas–Fort Worth, Houston, Atlanta, Chicago, Los Angeles,
New York), which need hundreds of venues each to look complete. Move a city up
the list if real couples or vendors start coming from there. This order is the
owner's call, and it should be revisited once there are users.

## Rules for every row

- **Facts only, from the venue's own website:** name, town, type, setting,
  capacity, email, phone, website. The description is our own one-line wording,
  never copied text. No photos: the venue adds those through its claim link.
- **Coordinates** come from the US Census geocoder (public domain), falling back
  to OpenStreetMap. If a venue lists no street address, leave the coordinates
  blank rather than guessing. It then has no map pin.
- **Skip** venues whose site is dead, that no longer host weddings, or that
  can't be checked. A wrong listing is worse than a missing one.
- **Duplicates** are caught on import by the normalised website (`source_id`),
  so a re-run won't double-insert.

## Batch mechanics

1. One city per batch, one fresh session per city, so a batch doesn't carry
   the previous city's history.
2. Write `data/venue-imports/<city>-<yyyy-mm>.tsv` with the same columns as
   `austin-hill-country-2026-09.tsv`.
3. Commit it to a branch. The file never needs a deploy: the owner pastes it
   into /admin/venues → Import on production. Batch several cities into one PR
   so the record lands on `main` without a merge per city.
4. Log the batch below.

## Keeping it true

A listing ages: venues close, change capacity, stop taking weddings. Once a
city is more than about a year old and unclaimed, re-check it. Claimed venues
maintain their own listings.

## Log

| Batch | Venues | Date |
|---|---|---|
| Austin / Hill Country | 24 | 2026-09-26 |
| Austin / Hill Country, batch 2 (Fredericksburg, Bastrop, Liberty Hill, Lake Travis) | 44 | 2026-09-27 |
