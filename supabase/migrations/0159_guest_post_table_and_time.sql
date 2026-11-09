-- Photo wall: which table a post came from, and when the photo was taken.
--
-- seating_table_id: set when a guest scans the code on a printed table card
-- (/guests/table-card prints one per seating table). The app checks the
-- table belongs to the same wedding before writing it (submitGuestPost);
-- deleting the table just forgets where the post came from.
--
-- taken_local: wall-clock time on the guest's phone, from the photo's EXIF
-- capture time when it has one, else when they posted. No time zone on
-- purpose: itinerary_events stores bare times and we keep no wedding time
-- zone, while a phone at the reception shows local time -- so the two line
-- up and the couple's view can sort posts into itinerary chapters. Only used
-- for sorting in the couple's own view; never shown on the guest site.
alter table guest_posts
  add column if not exists seating_table_id uuid references seating_tables (id) on delete set null,
  add column if not exists taken_local timestamp;

create index if not exists guest_posts_seating_table_idx
  on guest_posts (seating_table_id) where seating_table_id is not null;
