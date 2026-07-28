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
