export type Wedding = {
  id: string;
  user_id: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string | null;
  region: string | null;
  season: string | null;
  style_tier: string | null;
  venue_type: string | null;
  guest_count_override: number | null;
  created_at: string;
  updated_at: string;
};

export type Venue = {
  id: string;
  name: string;
  region: string | null;
  venue_type: string | null;
  capacity: number | null;
  price_tier: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type VenueShortlistEntry = {
  id: string;
  wedding_id: string;
  user_id: string;
  venue_id: string;
  notes: string | null;
  created_at: string;
};
