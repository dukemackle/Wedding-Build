-- Admin directory management: an active flag so vendors/venues can be
-- hidden from the public directory without hard-deleting them (a hard
-- delete on venues would cascade-delete any couple's shortlist entry
-- referencing it -- see venue_shortlist's `on delete cascade`).
alter table vendors add column if not exists active boolean not null default true;
alter table venues add column if not exists active boolean not null default true;

-- Admin writes go through the service-role key (bypasses RLS entirely),
-- gated at the app layer by ADMIN_EMAIL -- so no new RLS policies are
-- needed here for inserts/updates from the admin UI.
