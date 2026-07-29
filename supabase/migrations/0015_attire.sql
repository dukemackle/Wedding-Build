-- Attire module: a browsable placeholder catalog of wedding dresses,
-- bridesmaid dresses, groom/groomsmen attire, and rings, each taggable as
-- Buy / Rent / Buy or Rent. This is a browsing + shortlist experience only
-- -- no real purchasing or rental transactions (that needs Stripe, which
-- is tracked in ROADMAP.md as a deferred, paid item for closer to launch).
create table if not exists attire_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  style text,
  price_tier text,
  buy_or_rent text,
  price_from numeric(10, 2),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists attire_shortlist (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  attire_item_id uuid not null references attire_items (id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique (wedding_id, attire_item_id)
);
create index if not exists attire_shortlist_wedding_id_idx on attire_shortlist (wedding_id);

alter table attire_items enable row level security;
alter table attire_shortlist enable row level security;

create policy "attire_items_read_all" on attire_items
  for select using (true);

create policy "attire_shortlist_owner_all" on attire_shortlist
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Seed data: 8 items across each of 6 categories. Safe to re-run since it
-- checks for existing rows by name.
insert into attire_items (name, category, style, price_tier, buy_or_rent, price_from, description)
select * from (values
  ('Aria A-Line Gown', 'Wedding Dress', 'A-line', 'Classic', 'Buy or Rent', 1200, 'A timeless a-line silhouette in soft satin, with a sweetheart neckline.'),
  ('Willow Ballgown', 'Wedding Dress', 'Ballgown', 'Luxury', 'Buy', 3200, 'A dramatic ballgown with a fitted bodice and cathedral train.'),
  ('Nora Mermaid Gown', 'Wedding Dress', 'Mermaid', 'Classic', 'Buy or Rent', 1500, 'A figure-hugging mermaid gown in stretch crepe with a flared hem.'),
  ('Sage Sheath Dress', 'Wedding Dress', 'Sheath', 'Simple', 'Rent', 250, 'A clean, minimalist sheath dress in matte crepe, easy to move in.'),
  ('Ivy Empire Waist Gown', 'Wedding Dress', 'Empire Waist', 'Simple', 'Buy', 650, 'A flowing empire-waist gown, comfortable for an outdoor ceremony.'),
  ('Marlowe Tea-Length Dress', 'Wedding Dress', 'Tea-length', 'Classic', 'Buy or Rent', 900, 'A vintage-inspired tea-length dress with a lace overlay.'),
  ('Fable Off-Shoulder Gown', 'Wedding Dress', 'Off-shoulder', 'Luxury', 'Buy', 2800, 'An off-the-shoulder gown with hand-beaded lace sleeves.'),
  ('Reverie Trumpet Gown', 'Wedding Dress', 'Trumpet', 'Classic', 'Rent', 350, 'A trumpet-cut gown that flares below the knee for a dramatic silhouette.'),
  ('Juniper Chiffon Wrap Dress', 'Bridesmaid Dress', 'Chiffon Wrap', 'Simple', 'Buy', 120, 'A soft wrap dress in flowing chiffon, flattering on every body type.'),
  ('Marigold Satin Slip Dress', 'Bridesmaid Dress', 'Satin Slip', 'Classic', 'Buy or Rent', 180, 'A sleek satin slip dress with adjustable straps.'),
  ('Hazel Velvet Cap-Sleeve Dress', 'Bridesmaid Dress', 'Velvet Cap-sleeve', 'Luxury', 'Buy', 260, 'A rich velvet dress with a fitted cap sleeve, ideal for fall weddings.'),
  ('Poppy Lace Sheath Dress', 'Bridesmaid Dress', 'Lace Sheath', 'Classic', 'Rent', 90, 'A lace-overlay sheath dress with a scalloped hem.'),
  ('Clementine Convertible Wrap Dress', 'Bridesmaid Dress', 'Convertible Wrap', 'Simple', 'Buy or Rent', 140, 'One dress, a dozen ways to tie it -- a bridesmaid favorite.'),
  ('Fern Tulle Midi Dress', 'Bridesmaid Dress', 'Tulle Midi', 'Classic', 'Buy', 200, 'A playful tulle midi dress with a fitted bodice.'),
  ('Rosemary Crepe A-Line Dress', 'Bridesmaid Dress', 'Crepe A-line', 'Simple', 'Rent', 85, 'A structured crepe a-line dress in a matte finish.'),
  ('Saffron Sequin Shift Dress', 'Bridesmaid Dress', 'Sequin Shift', 'Luxury', 'Buy', 220, 'A shimmering sequin shift dress for a glamorous reception look.'),
  ('Ashford Classic Tuxedo', 'Groom Attire', 'Classic Tuxedo', 'Luxury', 'Buy or Rent', 450, 'A traditional black-tie tuxedo with satin lapels.'),
  ('Camden Slim-Fit Suit', 'Groom Attire', 'Slim-fit Suit', 'Classic', 'Buy', 380, 'A tailored slim-fit suit in a versatile navy wool blend.'),
  ('Harbor Linen Suit', 'Groom Attire', 'Linen Suit', 'Simple', 'Buy or Rent', 220, 'A breathable linen suit, perfect for a beach or garden wedding.'),
  ('Sterling Three-Piece Suit', 'Groom Attire', 'Three-piece Suit', 'Luxury', 'Buy', 520, 'A vested three-piece suit with a matching pocket square.'),
  ('Wesley Velvet Blazer Set', 'Groom Attire', 'Velvet Blazer Set', 'Luxury', 'Rent', 150, 'A statement velvet blazer paired with tailored trousers.'),
  ('Preston Morning Suit', 'Groom Attire', 'Morning Suit', 'Classic', 'Rent', 180, 'A formal morning suit with tails, for a classic daytime ceremony.'),
  ('Dalton Black Tie Tuxedo', 'Groom Attire', 'Black Tie Tux', 'Classic', 'Buy or Rent', 400, 'A modern black-tie tux with a satin-trimmed shawl collar.'),
  ('Rowan Casual Blazer & Trousers', 'Groom Attire', 'Casual Blazer & Trousers', 'Simple', 'Buy', 260, 'A relaxed blazer-and-trouser set for a laid-back celebration.'),
  ('Ledger Matching Suit Set', 'Groomsmen Attire', 'Matching Suit Set', 'Classic', 'Rent', 130, 'A coordinated suit set sized for the whole groomsmen party.'),
  ('Birch Vest & Tie Set', 'Groomsmen Attire', 'Vest & Tie Set', 'Simple', 'Buy', 90, 'A vest-and-tie set to layer over the groomsmen''s own suits.'),
  ('Cove Linen Suit Set', 'Groomsmen Attire', 'Linen Suit', 'Simple', 'Buy or Rent', 190, 'A lightweight linen suit set for warm-weather weddings.'),
  ('Granite Charcoal Two-Piece', 'Groomsmen Attire', 'Charcoal Two-piece', 'Classic', 'Buy', 300, 'A sharp charcoal two-piece suit, easy to dress up or down.'),
  ('Thicket Tweed Jacket Set', 'Groomsmen Attire', 'Tweed Jacket Set', 'Luxury', 'Rent', 160, 'A textured tweed jacket set for a rustic or fall wedding.'),
  ('Meridian Slim Suit Rental Set', 'Groomsmen Attire', 'Slim Suit Rental Set', 'Classic', 'Rent', 120, 'A modern slim-cut rental set with quick turnaround.'),
  ('Everett Classic Tux Set', 'Groomsmen Attire', 'Classic Tux Set', 'Luxury', 'Buy or Rent', 210, 'A classic black tux set matching the groom''s tuxedo.'),
  ('Sutton Seersucker Suit Set', 'Groomsmen Attire', 'Seersucker Suit', 'Simple', 'Buy', 170, 'A crisp seersucker suit set for a summer garden wedding.'),
  ('Aurelia Solitaire Ring', 'Ring - Her', 'Solitaire', 'Classic', 'Buy', 1800, 'A classic round solitaire in a delicate cathedral setting.'),
  ('Celeste Halo Ring', 'Ring - Her', 'Halo', 'Luxury', 'Buy', 3200, 'A center stone surrounded by a shimmering halo of pave diamonds.'),
  ('Something Vintage Milgrain Ring', 'Ring - Her', 'Vintage Milgrain', 'Classic', 'Buy', 1600, 'A vintage-inspired band with hand-detailed milgrain edging.'),
  ('Wren Pave Band Ring', 'Ring - Her', 'Pave Band', 'Simple', 'Buy', 650, 'A slim pave band that pairs easily with any engagement ring.'),
  ('Isolde Three-Stone Ring', 'Ring - Her', 'Three-Stone', 'Luxury', 'Buy', 4200, 'A three-stone design symbolizing the past, present, and future.'),
  ('Marlowe Emerald-Cut Ring', 'Ring - Her', 'Emerald-cut', 'Luxury', 'Buy', 3800, 'An emerald-cut center stone in a sleek, modern setting.'),
  ('Briar Cushion-Cut Halo Ring', 'Ring - Her', 'Cushion-cut Halo', 'Classic', 'Buy', 2100, 'A cushion-cut center stone framed by a soft halo.'),
  ('Linden Eternity Band', 'Ring - Her', 'Eternity Band', 'Simple', 'Buy', 900, 'A full eternity band with diamonds set all the way around.'),
  ('Foster Classic Band', 'Ring - Him', 'Classic Band', 'Simple', 'Buy', 350, 'A timeless polished gold band.'),
  ('Ridge Brushed Titanium Band', 'Ring - Him', 'Brushed Titanium Band', 'Simple', 'Buy', 220, 'A lightweight, scratch-resistant titanium band with a brushed finish.'),
  ('Kestrel Hammered Gold Band', 'Ring - Him', 'Hammered Gold Band', 'Classic', 'Buy', 780, 'A hand-hammered gold band with a textured, organic finish.'),
  ('Barrow Two-Tone Band', 'Ring - Him', 'Two-tone Band', 'Classic', 'Buy', 650, 'A two-tone band pairing brushed and polished gold finishes.'),
  ('Anvil Tungsten Band', 'Ring - Him', 'Tungsten Band', 'Simple', 'Buy', 180, 'A durable tungsten band built for everyday wear.'),
  ('Colton Beveled Edge Band', 'Ring - Him', 'Beveled Edge Band', 'Classic', 'Buy', 590, 'A modern band with a beveled edge for a sharp profile.'),
  ('Sterling Rose Gold Band', 'Ring - Him', 'Rose Gold Band', 'Luxury', 'Buy', 950, 'A warm rose gold band with a soft satin finish.'),
  ('Hollis Braided Band', 'Ring - Him', 'Braided Band', 'Luxury', 'Buy', 1100, 'A braided two-tone band with a woven, textured look.')
) as seed(name, category, style, price_tier, buy_or_rent, price_from, description)
where not exists (
  select 1 from attire_items where attire_items.name = seed.name
);
