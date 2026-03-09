/**
 * INN BRIDGE — HexIsle Accommodation ↔ Real-World Lodging
 * =========================================================
 * Innovation #1532: Inn Bridge System
 *
 * Connects in-game Inns to real-world accommodation providers.
 * When a player "stays at the Inn" in HexIsle, they can optionally
 * book a real-world stay through partner platforms.
 *
 * Architecture:
 *   - In-game Inns are NPCs managed by Innkeepers (npcShopkeeper.ts)
 *   - Each Inn room has a "realWorldBridge" field (hexRealEstate.ts)
 *   - The bridge connects to external providers (Airbnb, VRBO, etc.)
 *   - Booking generates Credits for the Inn and platform fee
 *   - Harper Guild monitors for listing quality and safety
 *
 * Revenue model:
 *   - Real-world bookings earn the Inn (in-game business) Credits
 *   - Platform takes C+20% on the bridge fee (NOT on the room rate)
 *   - The host earns from their Airbnb/VRBO listing normally
 *   - LB earns from the bridge/referral, priced at C+20%
 *
 * "The digital world IS the real world. We just haven't connected them yet."
 */

// ============================================================================
// TYPES
// ============================================================================

export type AccommodationProvider = 'airbnb' | 'vrbo' | 'booking' | 'direct' | 'hostelworld';

export type RoomType =
  | 'bunk'           // Shared dormitory
  | 'private'        // Private room in shared space
  | 'suite'          // Private suite
  | 'entire_place'   // Entire rental property
  | 'glamping'       // Outdoor luxury
  | 'unique';        // Treehouse, boat, castle, etc.

export type BridgeStatus =
  | 'available'      // Room is available for booking
  | 'reserved'       // Player has reserved but not confirmed
  | 'booked'         // Confirmed booking
  | 'checked_in'     // Guest has arrived
  | 'completed'      // Stay completed
  | 'cancelled'      // Booking cancelled
  | 'unavailable';   // Listed but not currently available

export interface InnBridgeListing {
  id: string;
  // In-game connection
  innId: string;                 // Link to InnDef in hexRealEstate.ts
  roomId: string;                // Specific room in the Inn
  islandId: number;
  cityId: string;
  districtId: string;
  // Real-world property
  provider: AccommodationProvider;
  externalListingUrl: string;    // Deep link to Airbnb/VRBO listing
  externalListingId: string;     // Provider's listing ID
  // Property details
  propertyName: string;
  roomType: RoomType;
  locationCity: string;
  locationCountry: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  // Pricing
  nightlyRateUSD: number;       // Real-world price in USD
  bridgeFeeCredits: number;     // LB platform fee in Credits (C+20% on bridge service)
  cleaningFee?: number;
  serviceFee?: number;
  // Ratings
  externalRating: number;       // Provider rating (1-5)
  inGameRating: number;         // HexIsle community rating (1-5)
  totalStays: number;
  // Status
  status: BridgeStatus;
  availableDates: DateRange[];
  blackoutDates: DateRange[];
  // Host
  hostId: string;               // LB platform user ID (must be a member)
  hostName: string;
  hostBadge?: string;           // Guild membership badge
  hostSuperhost: boolean;       // Provider superhost status
  // Harper oversight
  harperVerified: boolean;      // Harper has verified the listing
  lastVerifiedAt?: string;
  // Metadata
  photos: string[];
  description: string;
  houseRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DateRange {
  start: string;  // ISO date
  end: string;    // ISO date
}

export interface InnBridgeBooking {
  id: string;
  listingId: string;
  // Guest
  guestId: string;               // LB platform user ID
  guestName: string;
  numberOfGuests: number;
  // Dates
  checkIn: string;               // ISO date
  checkOut: string;              // ISO date
  numberOfNights: number;
  // Pricing
  roomTotal: number;             // Real-world cost in USD
  bridgeFee: number;             // LB bridge fee in Credits
  totalCreditsCharged: number;   // Bridge fee only (real-world payment separate)
  // Status
  status: BridgeStatus;
  bookedAt: string;
  confirmedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  // In-game effects
  inGameBenefits: InGameBenefit[];
  // Review
  guestReview?: BridgeReview;
  hostReview?: BridgeReview;
}

export interface InGameBenefit {
  type: 'rest_bonus' | 'lore_unlock' | 'fast_travel' | 'storage_upgrade' | 'guild_access' | 'coverage_minutes';
  description: string;
  value: number;
  duration?: string;             // How long the benefit lasts
}

export interface BridgeReview {
  rating: number;                // 1-5
  text: string;
  reviewedAt: string;
  verified: boolean;             // Verified stay
}

// ============================================================================
// IN-GAME BENEFITS FOR REAL-WORLD STAYS
// ============================================================================

/**
 * When a player books a real-world stay through the Inn Bridge,
 * they earn in-game benefits based on the room type and duration.
 */
export const STAY_BENEFITS: Record<RoomType, InGameBenefit[]> = {
  bunk: [
    { type: 'rest_bonus', description: 'Rested: +10% Coverage Minutes earned for 24h', value: 10, duration: '24h' },
    { type: 'coverage_minutes', description: 'Travel Coverage: 3 free Coverage Minutes', value: 3 },
  ],
  private: [
    { type: 'rest_bonus', description: 'Well Rested: +20% Coverage Minutes earned for 48h', value: 20, duration: '48h' },
    { type: 'coverage_minutes', description: 'Travel Coverage: 6 free Coverage Minutes', value: 6 },
    { type: 'storage_upgrade', description: 'Inn Storage: +10 inventory slots while staying', value: 10, duration: 'stay' },
  ],
  suite: [
    { type: 'rest_bonus', description: 'Refreshed: +30% Coverage Minutes earned for 72h', value: 30, duration: '72h' },
    { type: 'coverage_minutes', description: 'Travel Coverage: 12 free Coverage Minutes', value: 12 },
    { type: 'fast_travel', description: 'Express Travel: free inter-island passage during stay', value: 1, duration: 'stay' },
    { type: 'lore_unlock', description: 'Innkeeper\'s Tale: exclusive lore entry unlocked', value: 1 },
  ],
  entire_place: [
    { type: 'rest_bonus', description: 'Fully Restored: +40% Coverage Minutes earned for 7 days', value: 40, duration: '168h' },
    { type: 'coverage_minutes', description: 'Expedition Coverage: 24 free Coverage Minutes', value: 24 },
    { type: 'fast_travel', description: 'Express Travel: free inter-island passage for 7 days', value: 7, duration: '168h' },
    { type: 'guild_access', description: 'Guest Pass: temporary access to host\'s guild facilities', value: 1, duration: 'stay' },
    { type: 'storage_upgrade', description: 'Home Base: +50 inventory slots during stay', value: 50, duration: 'stay' },
  ],
  glamping: [
    { type: 'rest_bonus', description: 'Nature Restored: +25% Coverage Minutes earned for 48h', value: 25, duration: '48h' },
    { type: 'lore_unlock', description: 'Wilderness Lore: exclusive outdoor lore entry', value: 1 },
    { type: 'coverage_minutes', description: 'Wilderness Coverage: 9 free Coverage Minutes', value: 9 },
  ],
  unique: [
    { type: 'rest_bonus', description: 'Inspired: +35% Coverage Minutes earned for 72h', value: 35, duration: '72h' },
    { type: 'lore_unlock', description: 'Unique Story: exclusive lore entry from unique stay', value: 1 },
    { type: 'coverage_minutes', description: 'Adventure Coverage: 15 free Coverage Minutes', value: 15 },
    { type: 'fast_travel', description: 'Inspired Journey: 50% off inter-island passage for 5 days', value: 5, duration: '120h' },
  ],
};

// ============================================================================
// INN BRIDGE SEED DATA — The Wayward Rest (Verdana)
// ============================================================================

export const WAYWARD_REST_BRIDGE: InnBridgeListing[] = [
  {
    id: 'bridge-verdana-bunk-01',
    innId: 'verdana-inn',
    roomId: 'bunk-harbor',
    islandId: 1,
    cityId: 'verdana',
    districtId: 'harbor',
    provider: 'airbnb',
    externalListingUrl: '', // Populated when real listing is connected
    externalListingId: '',
    propertyName: 'Harbor Bunkhouse — Verdana Port District',
    roomType: 'bunk',
    locationCity: '', // TBD — mapped to real city
    locationCountry: '',
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['wifi', 'shared_kitchen', 'lockers', 'common_area'],
    nightlyRateUSD: 0,   // Set when real listing connected
    bridgeFeeCredits: 5, // C+20% on the bridge service
    status: 'unavailable', // No real listing connected yet
    availableDates: [],
    blackoutDates: [],
    hostId: '',
    hostName: '',
    hostSuperhost: false,
    harperVerified: false,
    inGameRating: 0,
    externalRating: 0,
    totalStays: 0,
    photos: [],
    description: 'A shared bunkroom overlooking Verdana\'s harbor. Simple, clean, and close to the docks.',
    houseRules: ['Quiet hours 10pm-7am', 'No food in bunks', 'Shared spaces kept clean'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate bridge fee for a booking (C+20% on bridge service).
 */
export function calculateBridgeFee(
  listing: InnBridgeListing,
  numberOfNights: number
): { bridgeFee: number; baseCost: number } {
  const baseCost = listing.bridgeFeeCredits * numberOfNights;
  // Bridge fee is already priced at C+20% — no additional markup needed
  return { bridgeFee: baseCost, baseCost };
}

/**
 * Get in-game benefits for a booking based on room type.
 */
export function getBookingBenefits(roomType: RoomType): InGameBenefit[] {
  return STAY_BENEFITS[roomType] || STAY_BENEFITS.bunk;
}

/**
 * Check if dates are available for a listing.
 */
export function checkAvailability(
  listing: InnBridgeListing,
  checkIn: string,
  checkOut: string
): boolean {
  if (listing.status !== 'available') return false;

  const cin = new Date(checkIn);
  const cout = new Date(checkOut);

  // Check blackout dates
  for (const blackout of listing.blackoutDates) {
    const bStart = new Date(blackout.start);
    const bEnd = new Date(blackout.end);
    if (cin < bEnd && cout > bStart) return false; // Overlap
  }

  // Check available dates (if specified, dates must fall within)
  if (listing.availableDates.length > 0) {
    return listing.availableDates.some(avail => {
      const aStart = new Date(avail.start);
      const aEnd = new Date(avail.end);
      return cin >= aStart && cout <= aEnd;
    });
  }

  return true; // No restrictions = available
}

/**
 * Create a booking.
 */
export function createBooking(
  listing: InnBridgeListing,
  guestId: string,
  guestName: string,
  checkIn: string,
  checkOut: string,
  numberOfGuests: number
): InnBridgeBooking | null {
  if (!checkAvailability(listing, checkIn, checkOut)) return null;

  const cin = new Date(checkIn);
  const cout = new Date(checkOut);
  const numberOfNights = Math.ceil((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24));

  if (numberOfNights <= 0) return null;
  if (numberOfGuests > listing.maxGuests) return null;

  const { bridgeFee } = calculateBridgeFee(listing, numberOfNights);
  const benefits = getBookingBenefits(listing.roomType);

  return {
    id: crypto.randomUUID(),
    listingId: listing.id,
    guestId,
    guestName,
    numberOfGuests,
    checkIn,
    checkOut,
    numberOfNights,
    roomTotal: listing.nightlyRateUSD * numberOfNights,
    bridgeFee,
    totalCreditsCharged: bridgeFee,
    status: 'reserved',
    bookedAt: new Date().toISOString(),
    inGameBenefits: benefits,
  };
}

export default {
  STAY_BENEFITS,
  WAYWARD_REST_BRIDGE,
  calculateBridgeFee,
  getBookingBenefits,
  checkAvailability,
  createBooking,
};
