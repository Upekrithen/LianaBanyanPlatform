/**
 * HERALD SUBSCRIPTION SYSTEM
 * ===========================
 * "Don't Break the Chain" — Inverted influencer model
 *
 * Tiers:
 *   Torch Bearer: $5/mo, 2 posts/mo, 1.25x base, +0.05x/mo, max 2.0x
 *   Herald:       $15/mo, 4 posts/mo, 1.5x base, +0.10x/mo, max 3.0x
 *   Town Crier:   $35/mo, 8 posts/mo, 2.0x base, +0.15x/mo, max 4.0x
 */

import { supabase } from "@/integrations/supabase/client";

export type HeraldTier = "torch_bearer" | "herald" | "town_crier";

export interface HeraldTierConfig {
  id: HeraldTier;
  name: string;
  price: number;
  postsPerMonth: number;
  baseMultiplier: number;
  chainBonusPerMonth: number;
  maxMultiplier: number;
  icon: string;
  description: string;
}

export const HERALD_TIERS: HeraldTierConfig[] = [
  {
    id: "torch_bearer",
    name: "Torch Bearer",
    price: 5,
    postsPerMonth: 2,
    baseMultiplier: 1.25,
    chainBonusPerMonth: 0.05,
    maxMultiplier: 2.0,
    icon: "🔥",
    description: "Light the way. 2 posts/month, growing Joule multiplier.",
  },
  {
    id: "herald",
    name: "Herald",
    price: 15,
    postsPerMonth: 4,
    baseMultiplier: 1.5,
    chainBonusPerMonth: 0.1,
    maxMultiplier: 3.0,
    icon: "📯",
    description: "Spread the word. 4 posts/month, stronger chain bonus.",
  },
  {
    id: "town_crier",
    name: "Town Crier",
    price: 35,
    postsPerMonth: 8,
    baseMultiplier: 2.0,
    chainBonusPerMonth: 0.15,
    maxMultiplier: 4.0,
    icon: "📢",
    description: "Command the square. 8 posts/month, maximum multiplier.",
  },
];

export function getTierConfig(tier: HeraldTier): HeraldTierConfig {
  return HERALD_TIERS.find((t) => t.id === tier)!;
}

export function calculateMultiplier(
  tier: HeraldTier,
  chainLength: number
): number {
  const config = getTierConfig(tier);
  const bonus = Math.min(
    chainLength * config.chainBonusPerMonth,
    config.maxMultiplier - config.baseMultiplier
  );
  return Math.min(config.baseMultiplier + bonus, config.maxMultiplier);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Subscribe to a Herald tier.
 */
export async function subscribeHerald(tier: HeraldTier): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const config = getTierConfig(tier);
  const month = getCurrentMonth();

  const { error } = await supabase
    .from("herald_subscriptions")
    .upsert({
      user_id: user.id,
      tier,
      monthly_price: config.price,
      base_multiplier: config.baseMultiplier,
      chain_bonus: 0,
      max_multiplier: config.maxMultiplier,
      required_posts_per_month: config.postsPerMonth,
      posts_this_month: 0,
      current_month: month,
      chain_length: 0,
      chain_started_at: new Date().toISOString(),
      status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Get current user's Herald subscription.
 */
export async function getHeraldSubscription() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("herald_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

/**
 * Record a Herald post (counts toward monthly requirement).
 */
export async function recordHeraldPost(
  platform: string,
  postText: string,
  cueCardId?: string,
  templateId?: string
): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const month = getCurrentMonth();

  // Insert post record
  const { error: postError } = await supabase
    .from("herald_posts")
    .insert({
      user_id: user.id,
      cue_card_id: cueCardId || null,
      template_id: templateId || null,
      post_text: postText,
      platform,
      posted_at: new Date().toISOString(),
      counts_for_month: month,
      status: "posted",
    });

  if (postError) return { success: false };

  // Increment posts_this_month
  await supabase.rpc("increment_herald_posts", { _user_id: user.id, _month: month });

  return { success: true };
}

/**
 * Freeze the chain for one month ($5).
 */
export async function freezeChain(): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const month = getCurrentMonth();

  const { error } = await supabase
    .from("herald_subscriptions")
    .update({
      chain_frozen: true,
      chain_freeze_month: month,
      status: "frozen",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  return { success: !error };
}
