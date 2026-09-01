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
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicWedding = {
  id: string;
  public_slug: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string | null;
  region: string | null;
};

export type RsvpStatus = "confirmed" | "declined";

export type RsvpSubmission = {
  id: string;
  wedding_id: string;
  guest_name: string;
  household: string | null;
  plus_one: boolean;
  status: RsvpStatus;
  meal: string | null;
  notes: string | null;
  created_at: string;
};

export type GuestStatus = "invited" | "confirmed" | "declined" | "pending";

export type GuestPriority = "must_invite" | "would_like" | "if_room";

export type Guest = {
  id: string;
  wedding_id: string;
  user_id: string;
  household: string | null;
  name: string;
  plus_one: boolean;
  status: GuestStatus;
  priority: GuestPriority;
  meal: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Venue = {
  id: string;
  name: string;
  region: string | null;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
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

export type Vendor = {
  id: string;
  name: string;
  category: string | null;
  region: string | null;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  price_tier: string | null;
  description: string | null;
  contact_email: string | null;
  created_at: string;
};

export type VendorInquiryStatus = "sent" | "responded" | "booked" | "declined";

export type VendorInquiry = {
  id: string;
  wedding_id: string;
  user_id: string;
  vendor_id: string | null;
  vendor_name: string;
  category: string | null;
  message: string | null;
  sent_at: string;
  status: VendorInquiryStatus;
};

export type RegistryItem = {
  id: string;
  wedding_id: string;
  user_id: string;
  label: string;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AttireCategory =
  | "Wedding Dress"
  | "Bridesmaid Dress"
  | "Groom Attire"
  | "Groomsmen Attire"
  | "Ring - Her"
  | "Ring - Him";

export type BuyOrRent = "Buy" | "Rent" | "Buy or Rent";

export type AttireItem = {
  id: string;
  name: string;
  category: AttireCategory;
  style: string | null;
  price_tier: string | null;
  buy_or_rent: BuyOrRent | null;
  price_from: number | null;
  description: string | null;
  created_at: string;
};

export type AttireShortlistEntry = {
  id: string;
  wedding_id: string;
  user_id: string;
  attire_item_id: string;
  notes: string | null;
  created_at: string;
};
