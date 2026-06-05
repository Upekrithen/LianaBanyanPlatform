/**
 * Initiative table type definitions for BP073 W7-W9 real-data wiring.
 * These supplement the generated types.ts until `supabase db pull` refreshes it.
 * All tables have RLS enabled in their corresponding migration files.
 */

// ── WAVE 7 ──────────────────────────────────────────────────────────────────

export interface DinnerGroup {
  id: string;
  host_id: string;
  title: string;
  dinner_date: string;
  max_guests: number;
  location: string | null;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  description: string | null;
  marks_for_host: number;
  created_at: string;
}

export interface DinnerContribution {
  id: string;
  group_id: string;
  contributor_id: string;
  slot_label: string;
  ingredient: string;
  quantity: string | null;
  notes: string | null;
  status: 'pledged' | 'confirmed' | 'cancelled';
  marks_reward: number;
  created_at: string;
}

export interface DinnerGroupGuest {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface GroceryCircle {
  id: string;
  organizer_id: string;
  name: string;
  neighborhood: string | null;
  description: string | null;
  max_members: number;
  status: 'forming' | 'active' | 'paused' | 'closed';
  marks_for_org: number;
  created_at: string;
}

export interface GroceryCircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  joined_at: string;
  marks_earned: number;
}

export interface GroceryCircleItem {
  id: string;
  circle_id: string;
  added_by: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  status: 'pending' | 'ordered' | 'delivered' | 'removed';
  created_at: string;
}

export interface SharedShoppingList {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_shared: boolean;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: string;
  checked: boolean;
  added_by?: string;
}

export interface BringAFriendBounty {
  id: string;
  user_id: string;
  referral_code: string;
  friend_user_id: string | null;
  rewarded: boolean;
  marks_reward: number;
  created_at: string;
}

export interface ConciergeBooking {
  id: string;
  requester_id: string;
  provider_id: string | null;
  provider_name: string;
  task_description: string;
  category: string;
  provider_cost: number;
  platform_fee: number;
  total_cost: number;
  marks_on_completion: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  scheduled_for: string | null;
  created_at: string;
}

export interface FamilyGathering {
  id: string;
  family_id: string | null;
  organizer_id: string;
  title: string;
  event_date: string;
  location: string | null;
  description: string | null;
  max_attendees: number | null;
  marks_reward: number;
  created_at: string;
}

export interface FamilyGatheringRsvp {
  id: string;
  gathering_id: string;
  user_id: string;
  status: 'yes' | 'no' | 'maybe';
  created_at: string;
}

export interface FamilySharedResource {
  id: string;
  family_id: string | null;
  owner_id: string;
  title: string;
  description: string | null;
  resource_type: 'item' | 'space' | 'skill' | 'vehicle' | 'tool' | 'other';
  is_available: boolean;
  created_at: string;
}

// ── WAVE 8 ──────────────────────────────────────────────────────────────────

export interface HealthOrder {
  id: string;
  member_id: string;
  category: 'medication' | 'supplement' | 'device' | 'service' | 'other';
  item_name: string;
  quantity: number;
  estimated_cost: number | null;
  actual_cost: number | null;
  group_buy_id: string | null;
  status: 'pending' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  marks_reward: number;
  created_at: string;
}

export interface HealthSavingsLedgerEntry {
  id: string;
  member_id: string;
  contribution_type: 'annual' | 'monthly' | 'bonus' | 'refund';
  amount: number;
  currency: string;
  period_month: string | null;
  notes: string | null;
  created_at: string;
}

export interface PrescriptionLookup {
  id: string;
  member_id: string | null;
  drug_name: string;
  ndc_code: string | null;
  retail_price: number | null;
  cooperative_price: number | null;
  savings_amount: number | null;
  created_at: string;
}

export interface VslVouchRequest {
  id: string;
  member_id: string;
  need_description: string;
  context: string | null;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: string;
}

export interface VslVouch {
  id: string;
  voucher_id: string;
  vouchee_id: string;
  request_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface MemberTrustScore {
  id: string;
  user_id: string;
  score: number;
  components: Record<string, number>;
  updated_at: string;
}

export interface BreadBounty {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  deadline: string | null;
  category: 'baking' | 'art' | 'writing' | 'music' | 'research' | 'other';
  status: 'open' | 'awarded' | 'closed';
  bid_count: number;
  created_at: string;
}

export interface BreadBountyBid {
  id: string;
  bounty_id: string;
  member_id: string;
  bid_price: number;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface BreadSkillSession {
  id: string;
  instructor_id: string;
  title: string;
  skill_category: string;
  description: string | null;
  max_participants: number;
  scheduled_at: string | null;
  duration_minutes: number;
  marks_for_instructor: number;
  marks_for_attendee: number;
  registration_count: number;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  created_at: string;
}

export interface BreadSkillRegistration {
  id: string;
  session_id: string;
  member_id: string;
  created_at: string;
}

export interface BreadRecipe {
  id: string;
  author_id: string;
  title: string;
  category: 'bread' | 'pastry' | 'sourdough' | 'cake' | 'savory' | 'other';
  body: string;
  tags: string[];
  harper_verified: boolean;
  marks_reward: number;
  created_at: string;
}

export interface BreadGroupBuyListing {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string;
  min_quantity: number;
  target_quantity: number;
  unit_price: number;
  currency: string;
  deadline: string | null;
  order_count: number;
  status: 'open' | 'funded' | 'closed' | 'cancelled';
  created_at: string;
}

export interface BreadGroupBuyOrder {
  id: string;
  listing_id: string;
  member_id: string;
  quantity: number;
  total_cost: number;
  created_at: string;
}

// ── WAVE 9 ──────────────────────────────────────────────────────────────────

export interface GuildMasterProfile {
  id: string;
  user_id: string;
  display_name: string;
  specialty: string;
  experience_years: number;
  linkedin_url: string | null;
  linkedin_verified: boolean;
  rating: number | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface JukeboxArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  genre: string | null;
  bio: string | null;
  total_streams: number;
  total_fees_collected: number;
  ip_ledger_seq: number | null;
  status: 'active' | 'lobbying' | 'locked';
  created_at: string;
}

export interface JukeboxTrack {
  id: string;
  artist_id: string;
  title: string;
  genre: string | null;
  ipfs_hash: string | null;
  stream_count: number;
  royalty_rate: number;
  ip_ledger_seq: number | null;
  status: 'active' | 'archived';
  created_at: string;
}

export interface DidaskoSkill {
  id: string;
  instructor_id: string;
  title: string;
  category: string;
  description: string | null;
  ip_ledger_ref: string | null;
  mnemosynec_tag: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prereqs: string[];
  marks_reward: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export interface DefenseNeighborSafetyReport {
  id: string;
  reporter_id: string;
  category: 'hazard' | 'outage' | 'safety' | 'missing_person' | 'weather' | 'general';
  description: string;
  location: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  marks_reward: number;
  anonymous: boolean;
  created_at: string;
}

export interface DefenseSafetyNetworkMember {
  id: string;
  user_id: string;
  role: 'neighbor' | 'coordinator' | 'first_responder_liaison';
  neighborhood: string | null;
  marks_earned: number;
  joined_at: string;
}
