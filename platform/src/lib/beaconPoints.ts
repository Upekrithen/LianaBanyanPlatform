/**
 * SNOW DOOR BEACON POINTS — The Northern Path
 * =============================================
 * Seven beacons from Founder's Keep to the Beacon Summit.
 * Complete each to advance. Complete all seven to earn
 * the Teleportation Deck Card — permanent fast-travel.
 *
 * Like Wind Waker's Ballad of Gales:
 *   Visit → it unlocks. Complete the chain → teleport everywhere.
 *
 * Each beacon has a Snowflake Key that awards Joules.
 * Beacons unlock sequentially (must complete #1 before #2).
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ───

export interface BeaconPoint {
  id: string;
  beaconNumber: number;
  name: string;
  description: string;
  icon: string;
  challengeType: string;
  challengeDescription: string;
  challengeRequirement: Record<string, any>;
  joulesReward: number;
  marksReward: number;
  snowflakeKeyName: string | null;
  latitudeHint: string | null;
  loreText: string | null;
  isActive: boolean;
}

export interface BeaconProgress {
  id: string;
  userId: string;
  beaconId: string;
  isCompleted: boolean;
  completedAt: string | null;
  challengeProof: Record<string, any>;
  joulesAwarded: number;
  marksAwarded: number;
  snowflakeKeyEarned: boolean;
}

export interface TeleportationDeckCard {
  id: string;
  userId: string;
  cardName: string;
  cardTier: string;
  unlockedDestinations: string[];
  totalUses: number;
  lastUsedAt: string | null;
  earnedAt: string;
  beaconsCompleted: number;
}

// ─── Static beacon data (for offline/fallback rendering) ───

export const BEACON_CHAIN: {
  number: number;
  name: string;
  icon: string;
  latitudeHint: string;
  challengeDescription: string;
}[] = [
  { number: 1, name: "Founder's Keep", icon: "🏰", latitudeHint: "90°N", challengeDescription: "Unlock the Snow Door" },
  { number: 2, name: "The Standing Stones", icon: "🪨", latitudeHint: "80°N", challengeDescription: "Complete a Paper Quiz (3/5+)" },
  { number: 3, name: "The Frozen Bridge", icon: "🌉", latitudeHint: "70°N", challengeDescription: "Visit the Friend Page" },
  { number: 4, name: "The Watchtower", icon: "🗼", latitudeHint: "60°N", challengeDescription: "Explore the Crow's Nest" },
  { number: 5, name: "The Ice Library", icon: "📚", latitudeHint: "50°N", challengeDescription: "Read a paper on Cephas" },
  { number: 6, name: "The Northern Forge", icon: "🔥", latitudeHint: "40°N", challengeDescription: "Create or contribute something" },
  { number: 7, name: "The Beacon Summit", icon: "✨", latitudeHint: "0°N", challengeDescription: "Complete all 6 previous beacons" },
];

// ─── API Functions ───

/**
 * Get all beacon points in order.
 */
export async function getBeaconPoints(): Promise<BeaconPoint[]> {
  const { data, error } = await supabase
    .from("beacon_points" as any)
    .select("*")
    .eq("is_active", true)
    .order("beacon_number");

  if (error) throw error;
  return ((data as any[]) || []).map(mapBeacon);
}

/**
 * Get user's progress for all beacons.
 */
export async function getUserBeaconProgress(): Promise<BeaconProgress[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("beacon_progress" as any)
    .select("*")
    .eq("user_id", userData.user.id);

  if (error) throw error;
  return ((data as any[]) || []).map(mapProgress);
}

/**
 * Get the user's current beacon level (highest completed + 1, or 1 if none).
 */
export async function getCurrentBeaconLevel(): Promise<number> {
  const progress = await getUserBeaconProgress();
  const beacons = await getBeaconPoints();

  if (progress.length === 0) return 1;

  // Find highest completed beacon number
  const completedIds = new Set(
    progress.filter((p) => p.isCompleted).map((p) => p.beaconId),
  );

  let highest = 0;
  for (const b of beacons) {
    if (completedIds.has(b.id) && b.beaconNumber > highest) {
      highest = b.beaconNumber;
    }
  }

  return Math.min(highest + 1, beacons.length);
}

/**
 * Complete a beacon challenge.
 * Validates the beacon is the next in sequence.
 */
export async function completeBeacon(
  beaconId: string,
  proof: Record<string, any> = {},
): Promise<{
  progress: BeaconProgress;
  joulesEarned: number;
  marksEarned: number;
  snowflakeKey: string | null;
  isChainComplete: boolean;
  teleportationCard: TeleportationDeckCard | null;
}> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Must be logged in");
  const userId = userData.user.id;

  // Get beacon info
  const beacons = await getBeaconPoints();
  const beacon = beacons.find((b) => b.id === beaconId);
  if (!beacon) throw new Error("Beacon not found");

  // Verify sequential completion
  const existingProgress = await getUserBeaconProgress();
  const completedIds = new Set(
    existingProgress.filter((p) => p.isCompleted).map((p) => p.beaconId),
  );

  // Already completed?
  if (completedIds.has(beaconId)) {
    const existing = existingProgress.find(
      (p) => p.beaconId === beaconId && p.isCompleted,
    )!;
    return {
      progress: existing,
      joulesEarned: 0,
      marksEarned: 0,
      snowflakeKey: null,
      isChainComplete: false,
      teleportationCard: null,
    };
  }

  // Check all prior beacons are complete
  for (const b of beacons) {
    if (b.beaconNumber < beacon.beaconNumber && !completedIds.has(b.id)) {
      throw new Error(
        `Must complete "${b.name}" (Beacon ${b.beaconNumber}) before "${beacon.name}"`,
      );
    }
  }

  // Insert/update progress
  const { data, error } = await supabase
    .from("beacon_progress" as any)
    .upsert(
      {
        user_id: userId,
        beacon_id: beaconId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        challenge_proof: proof,
        joules_awarded: beacon.joulesReward,
        marks_awarded: beacon.marksReward,
        snowflake_key_earned: !!beacon.snowflakeKeyName,
      },
      { onConflict: "user_id,beacon_id" },
    )
    .select()
    .single();

  if (error) throw error;

  const progress = mapProgress(data as any);

  // Check if chain is now complete
  const newCompletedCount = completedIds.size + 1;
  const isChainComplete = newCompletedCount >= beacons.length;

  let teleportationCard: TeleportationDeckCard | null = null;

  // Award Teleportation Deck Card if chain complete
  if (isChainComplete) {
    const destinations = beacons.map((b) => b.name);
    const { data: cardData, error: cardError } = await supabase
      .from("teleportation_deck_cards" as any)
      .upsert(
        {
          user_id: userId,
          card_name: "Northern Wind",
          card_tier: "legendary",
          unlocked_destinations: destinations,
          beacons_completed: beacons.length,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (!cardError && cardData) {
      teleportationCard = mapCard(cardData as any);
    }
  }

  return {
    progress,
    joulesEarned: beacon.joulesReward,
    marksEarned: beacon.marksReward,
    snowflakeKey: beacon.snowflakeKeyName || null,
    isChainComplete,
    teleportationCard,
  };
}

/**
 * Get the user's Teleportation Deck Card (if earned).
 */
export async function getTeleportationCard(): Promise<TeleportationDeckCard | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("teleportation_deck_cards" as any)
    .select("*")
    .eq("user_id", userData.user.id)
    .single();

  if (error && error.code !== "PGRST116") return null;
  return data ? mapCard(data as any) : null;
}

/**
 * Use the Teleportation Deck Card (increment usage counter).
 */
export async function useTeleportationCard(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  // Get current card
  const card = await getTeleportationCard();
  if (!card) throw new Error("No Teleportation Deck Card");

  await supabase
    .from("teleportation_deck_cards" as any)
    .update({
      total_uses: card.totalUses + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("user_id", userData.user.id);
}

// ─── Progress Percentage ───

export function getChainProgress(
  beacons: BeaconPoint[],
  progress: BeaconProgress[],
): { completed: number; total: number; percentage: number } {
  const completedIds = new Set(
    progress.filter((p) => p.isCompleted).map((p) => p.beaconId),
  );
  const completed = beacons.filter((b) => completedIds.has(b.id)).length;
  return {
    completed,
    total: beacons.length,
    percentage: beacons.length > 0 ? Math.round((completed / beacons.length) * 100) : 0,
  };
}

// ─── Mappers ───

function mapBeacon(row: any): BeaconPoint {
  return {
    id: row.id,
    beaconNumber: row.beacon_number,
    name: row.name,
    description: row.description,
    icon: row.icon,
    challengeType: row.challenge_type,
    challengeDescription: row.challenge_description,
    challengeRequirement: row.challenge_requirement || {},
    joulesReward: row.joules_reward,
    marksReward: row.marks_reward,
    snowflakeKeyName: row.snowflake_key_name,
    latitudeHint: row.latitude_hint,
    loreText: row.lore_text,
    isActive: row.is_active,
  };
}

function mapProgress(row: any): BeaconProgress {
  return {
    id: row.id,
    userId: row.user_id,
    beaconId: row.beacon_id,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    challengeProof: row.challenge_proof || {},
    joulesAwarded: row.joules_awarded,
    marksAwarded: row.marks_awarded,
    snowflakeKeyEarned: row.snowflake_key_earned,
  };
}

function mapCard(row: any): TeleportationDeckCard {
  return {
    id: row.id,
    userId: row.user_id,
    cardName: row.card_name,
    cardTier: row.card_tier,
    unlockedDestinations: row.unlocked_destinations || [],
    totalUses: row.total_uses,
    lastUsedAt: row.last_used_at,
    earnedAt: row.earned_at,
    beaconsCompleted: row.beacons_completed,
  };
}
