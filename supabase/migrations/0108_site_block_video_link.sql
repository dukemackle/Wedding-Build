-- Two more kinds of custom block on the guest site: a video (a YouTube or
-- Vimeo link, shown as a player) and a link (a button to a livestream,
-- playlist, hotel booking page...). Both keep their address in `url`.
alter table site_blocks add column if not exists url text;

alter table site_blocks drop constraint if exists site_blocks_kind_check;
alter table site_blocks
  add constraint site_blocks_kind_check check (kind in ('photo', 'story', 'quote', 'video', 'link'));
