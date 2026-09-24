export type Wedding = {
  id: string;
  user_id: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string | null;
  region: string | null;
  state: string | null;
  season: string | null;
  style_tier: string | null;
  venue_type: string | null;
  guest_count_override: number | null;
  public_slug: string | null;
  party_share_token: string | null;
  hero_photo_url: string | null;
  /** Tight crop for the dashboard avatar. Falls back to hero_photo_url. */
  profile_photo_url: string | null;
  rsvp_deadline: string | null;
  dress_code: string | null;
  travel_notes: string | null;
  referral_code: string | null;
  budget_target: number | null;
  venue_id: string | null;
  is_test: boolean;
  partner_user_id: string | null;
  invite_token: string | null;
  hidden_budget_categories: string[];
  itinerary_published: boolean;
  /** A Google Sheet the couple imported from, kept so they can reopen it. */
  spreadsheet_url: string | null;
  /** The colour each side of the guest list is drawn in, picked by the couple. */
  side_a_color: string | null;
  side_b_color: string | null;
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
  dress_code: string | null;
  travel_notes: string | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_state: string | null;
  itinerary_published: boolean;
};

export type WeddingFaq = {
  id: string;
  wedding_id: string;
  user_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
};

export type WeddingAccommodation = {
  id: string;
  wedding_id: string;
  user_id: string;
  name: string;
  address: string | null;
  booking_url: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
};

export type RsvpStatus = "confirmed" | "declined";

export type RsvpSubmission = {
  id: string;
  wedding_id: string;
  guest_name: string;
  household: string | null;
  /** Whose guest they say they are. See GuestSide, below. */
  side: GuestSide | null;
  plus_one: boolean;
  plus_one_name: string | null;
  status: RsvpStatus;
  meal: string | null;
  notes: string | null;
  photo_url: string | null;
  message: string | null;
  song_request: string | null;
  phone: string | null;
  sms_opt_in: boolean;
  created_at: string;
};

export type GuestStatus = "invited" | "confirmed" | "declined" | "pending";

export type GuestPriority = "must_invite" | "would_like" | "if_room";

/** Whose guest this is. Null until the couple says. See src/lib/guest-groups.ts. */
export type GuestSide = "a" | "b" | "both";

export type GuestType = "family" | "friends" | "work" | "other";

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
  side: GuestSide | null;
  guest_type: GuestType | null;
  meal: string | null;
  notes: string | null;
  photo_url: string | null;
  message: string | null;
  song_request: string | null;
  phone: string | null;
  sms_opt_in: boolean;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  guestbook_hidden: boolean;
  thanked: boolean;
  gift_description: string | null;
  thank_you_note: string | null;
  invite_sent_at: string | null;
  last_reminded_at: string | null;
  table_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactSubmissionStatus = "pending" | "applied" | "dismissed";

export type ContactSubmission = {
  id: string;
  wedding_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  note: string | null;
  status: ContactSubmissionStatus;
  created_at: string;
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
  setting: string | null;
  capacity: number | null;
  price_tier: string | null;
  description: string | null;
  about: string | null;
  included: string | null;
  amenities: string[];
  image_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  active: boolean;
  is_sample: boolean;
  /** Where this listing came from: manual, import, osm, google, claimed. */
  source: string | null;
  /** The upstream record's id, so a refresh can match it again. */
  source_id: string | null;
  /** When anyone last confirmed these details were true. */
  last_verified_at: string | null;
  verified_by: string | null;
  created_at: string;
};

export type VenueFaq = {
  id: string;
  venue_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
};

export type VenueInquiryStatus = "sent" | "responded";

export type VenueInquiry = {
  id: string;
  wedding_id: string;
  user_id: string;
  venue_id: string | null;
  venue_name: string;
  message: string | null;
  recipient_email: string | null;
  sender_phone: string | null;
  sent_at: string;
  status: VenueInquiryStatus;
  referral_code: string | null;
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
  about: string | null;
  included: string | null;
  amenities: string[];
  image_url: string | null;
  contact_email: string | null;
  active: boolean;
  is_sample: boolean;
  /** Where this listing came from: manual, import, osm, google, claimed. */
  source: string | null;
  /** The upstream record's id, so a refresh can match it again. */
  source_id: string | null;
  /** When anyone last confirmed these details were true. */
  last_verified_at: string | null;
  verified_by: string | null;
  created_at: string;
};

export type VendorFaq = {
  id: string;
  vendor_id: string;
  question: string;
  answer: string;
  sort_order: number;
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
  sender_phone: string | null;
  sent_at: string;
  status: VendorInquiryStatus;
  last_followed_up_at: string | null;
  referral_code: string | null;
  booked_amount: number | null;
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
  designer: string | null;
  image_urls: string[];
  retailer_url: string | null;
  vendor_id: string | null;
  buy_price: number | null;
  rent_price: number | null;
  silhouette: string | null;
  neckline: string | null;
  sleeves: string | null;
  length: string | null;
  colors: string[];
  fabric: string | null;
  size_range: string | null;
  badge: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type AttirePartyMember = {
  id: string;
  wedding_id: string;
  user_id: string;
  name: string;
  role: string | null;
  attire_item_id: string | null;
  color: string | null;
  size: string | null;
  status: string;
  notes: string | null;
  sort_order: number;
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

export type BudgetContract = {
  id: string;
  wedding_id: string;
  user_id: string;
  /** Set for category rows ('venue', 'catering'...); null for custom items. */
  category: string | null;
  /** Set for custom budget items; null for category rows. */
  custom_item_id: string | null;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  content_type: string | null;
  created_at: string;
};

export type BudgetCustomItem = {
  id: string;
  wedding_id: string;
  user_id: string;
  label: string;
  amount: number;
  paid_amount: number | null;
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
  rotation: number;
  room_id: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueRoom = {
  id: string;
  wedding_id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type LayoutItemType =
  | "chairs"
  | "stage"
  | "dance_floor"
  | "bar"
  | "dj_booth"
  | "buffet"
  | "cake_table"
  | "gift_table"
  | "entrance"
  | "house"
  | "parking"
  | "other";

export type VenueLayoutItem = {
  id: string;
  wedding_id: string;
  user_id: string;
  item_type: LayoutItemType;
  label: string | null;
  position_x: number;
  position_y: number;
  /** Null means "use the default footprint for this item type". */
  width: number | null;
  height: number | null;
  rotation: number;
  room_id: string | null;
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
  /** Which stage of Wren's plan this belongs to. Null for a couple's own task. */
  phase: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminCoupleNotes = {
  wedding_id: string;
  notes: string | null;
  tags: string[];
  updated_at: string;
};

export type VendorContactType = "call" | "email" | "meeting" | "note";

export type VendorContactLog = {
  id: string;
  vendor_id: string;
  contact_type: VendorContactType;
  note: string;
  created_at: string;
};

export type RegionalCostData = {
  id: string;
  state: string;
  category_key: string;
  simple_amount: number | null;
  classic_amount: number | null;
  luxury_amount: number | null;
  per_guest: boolean;
  source: string | null;
  notes: string | null;
  updated_at: string;
};

export type AssistantConversation = {
  id: string;
  wedding_id: string | null;
  user_id: string;
  question: string;
  answer: string;
  created_at: string;
};

export type FeedbackCategory = "bug" | "idea" | "other";
export type FeedbackStatus = "new" | "read" | "resolved";

export type FeedbackSubmission = {
  id: string;
  wedding_id: string | null;
  user_id: string;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  created_at: string;
};
