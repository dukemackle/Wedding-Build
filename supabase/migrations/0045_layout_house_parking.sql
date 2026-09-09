-- Two more layout item types for couples planning a backyard/private
-- residence wedding: marking where the house sits and where guests park.
alter table venue_layout_items drop constraint if exists venue_layout_items_item_type_check;
alter table venue_layout_items add constraint venue_layout_items_item_type_check check (item_type in (
  'chairs', 'stage', 'dance_floor', 'bar', 'dj_booth',
  'buffet', 'cake_table', 'gift_table', 'entrance', 'house', 'parking', 'other'
));
