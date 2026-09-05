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
  hero_photo_url: string | null;
  rsvp_deadline: string | null;
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
  hero_photo_url: string | null;
  rsvp_deadline: string | null;
};

export type RsvpStatus = "confirmed" | "declined";

export type RsvpSubmission = {
  id: string;
  wedding_id: string;
  guest_name: string;
  household: string | null;
  plus_one: boolean;
  plus_one_name: string | null;
  status: RsvpStatus;
  meal: string | null;
  notes: string | null;
  photo_url: string | null;
  message: string | null;
  song_request: string | null;
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
  email: string | null;
  plus_one: boolean;
  plus_one_name: string | null;
  status: GuestStatus;
  priority: GuestPriority;
  meal: string | null;
  notes: string | null;
  photo_url: string | null;
  message: string | null;
  song_request: string | null;
  guestbook_hidden: boolean;
  thanked: boolean;
  invite_sent_at: string | null;
  last_reminded_at: string | null;
  table_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicGuestbookEntry = {
  id: string;
  wedding_id: string;
  name: string;
  photo_url: string | null;
  message: string | null;
  created_at: string;
};

export type PublicConfirmedGuest = {
  id: string;
  wedding_id: string;
  name: string;
  photo_url: string | null;
  created_at: string;
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
  contact_email: string | null;
  contact_phone: string | null;
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
  recipient_email: string | null;
  sent_at: string;
  status: VendorInquiryStatus;
  last_followed_up_at: string | null;
};

export type VendorFavoriteEntry = {
  id: string;
  wedding_id: string;
  user_id: string;
  vendor_id: string;
  notes: string | null;
  contact_phone: string | null;
  created_at: string;
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

export type ItineraryEvent = {
  id: string;
  wedding_id: string;
  user_id: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  title: string;
  location: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetCustomItem = {
  id: string;
  wedding_id: string;
  user_id: string;
  label: string;
  amount: number;
  purchased_from: string | null;
  paid_by: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TableShape = "round" | "square" | "rectangle";

export type SeatingTable = {
  id: string;
  wedding_id: string;
  user_id: string;
  name: string;
  capacity: number | null;
  shape: TableShape;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  wedding_id: string;
  user_id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
