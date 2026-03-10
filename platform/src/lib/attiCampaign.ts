/**
 * A.T.T.I. CAMPAIGN — Engagement Tracking & Card Management
 * ==========================================================
 * Innovation #1555: Distributed Physical-to-Digital Marketing Infrastructure
 * "All That That Implies"
 *
 * Core services:
 * - Engagement click tracking (5 clicks = 1 Lock, 20 clicks = Candle Burst)
 * - QR scan registration and session management
 * - Funnel stage progression (Scan → Explore → Engage → Ignite → Transact)
 * - Bifrost card design CRUD
 * - Referral chain management
 *
 * SEC-safe: Service marketing and member engagement tooling only.
 */

import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ClickType = "explore" | "interact" | "share" | "co_adjust" | "quiz" | "section_view";
export type FunnelStage = "scan" | "explore" | "engage" | "ignite" | "transact";
export type CardFormat = "business" | "postcard";
export type CardStatus = "draft" | "ordered" | "printed" | "distributed";

export interface EngagementClick {
  type: ClickType;
  sectionId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface EngagementProgress {
  sessionId: string;
  meaningfulClicks: number;
  locksEarned: number;
  candleBurstTriggered: boolean;
  funnelStage: FunnelStage;
  startedAt: Date;
  lastClickAt: Date;
}

export interface CardDesign {
  id?: string;
  creatorId?: string;
  templateId: string;
  initiative: string;
  format: CardFormat;
  headline: string;
  tagline?: string;
  logoUrl?: string;
  colorScheme: string;
  backText?: string;
  referrerCode?: string;
  quantityOrdered?: number;
  status?: CardStatus;
}

export interface ReferralChain {
  id: string;
  referrerId: string;
  referredId: string;
  cardId?: string;
  chainDepth: number;
  marksAwarded: number;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const CLICKS_PER_LOCK = 5;
export const LOCKS_FOR_CANDLE_BURST = 4; // 4 locks = 20 clicks
export const CLICKS_FOR_CANDLE_BURST = CLICKS_PER_LOCK * LOCKS_FOR_CANDLE_BURST; // 20
export const MAX_REFERRAL_DEPTH = 3;

/** Click type labels for display */
export const CLICK_TYPE_LABELS: Record<ClickType, string> = {
  explore: "Explored",
  interact: "Interacted",
  share: "Shared",
  co_adjust: "Adjusted Showcase",
  quiz: "Completed Quiz",
  section_view: "Viewed Section",
};

/** Funnel stage labels */
export const FUNNEL_STAGE_LABELS: Record<FunnelStage, { label: string; description: string; icon: string }> = {
  scan: { label: "Scan", description: "Card scanned, landing page loaded", icon: "📱" },
  explore: { label: "Explore", description: "Browsing the showcase content", icon: "🔍" },
  engage: { label: "Engage", description: "First Lock earned (5 meaningful clicks)", icon: "🔐" },
  ignite: { label: "Ignite", description: "Candle Burst! (20 meaningful clicks)", icon: "🕯️" },
  transact: { label: "Transact", description: "First platform transaction completed", icon: "✨" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT (localStorage for anonymous, Supabase for registered)
// ═══════════════════════════════════════════════════════════════════════════════

const ATTI_SESSION_KEY = "lb_atti_session";
const ATTI_PROGRESS_KEY = "lb_atti_progress";

/** Generate a unique session ID */
function generateSessionId(): string {
  return `atti-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Get or create the current ATTI session */
export function getOrCreateSession(cardId?: string, referrerCode?: string, initiative?: string): string {
  let sessionId = localStorage.getItem(ATTI_SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(ATTI_SESSION_KEY, sessionId);

    // Record the scan in Supabase (fire-and-forget)
    recordScan(sessionId, cardId, referrerCode, initiative);
  }
  return sessionId;
}

/** Record a QR scan event */
async function recordScan(
  sessionId: string,
  cardId?: string,
  referrerCode?: string,
  initiative?: string
): Promise<void> {
  try {
    await (supabase.from as any)("atti_campaign_scans").insert({
      session_id: sessionId,
      card_id: cardId || null,
      referrer_code: referrerCode || null,
      initiative: initiative || null,
      device_type: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
    });
  } catch (err) {
    console.error("ATTI: Failed to record scan", err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGAGEMENT TRACKING (Client-Side with Supabase Sync)
// ═══════════════════════════════════════════════════════════════════════════════

/** Get current engagement progress from localStorage */
export function getLocalProgress(): EngagementProgress {
  try {
    const stored = localStorage.getItem(ATTI_PROGRESS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  return {
    sessionId: getOrCreateSession(),
    meaningfulClicks: 0,
    locksEarned: 0,
    candleBurstTriggered: false,
    funnelStage: "scan",
    startedAt: new Date(),
    lastClickAt: new Date(),
  };
}

/** Save progress to localStorage */
function saveLocalProgress(progress: EngagementProgress): void {
  localStorage.setItem(ATTI_PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * Record a meaningful engagement click.
 * Returns updated progress + whether a new lock or candle burst was just triggered.
 */
export async function recordClick(
  clickType: ClickType,
  sectionId?: string,
  metadata?: Record<string, unknown>
): Promise<{
  progress: EngagementProgress;
  newLock: boolean;
  candleBurst: boolean;
}> {
  const progress = getLocalProgress();

  // Increment
  progress.meaningfulClicks += 1;
  progress.lastClickAt = new Date();

  // Check for new lock
  const previousLocks = progress.locksEarned;
  progress.locksEarned = Math.floor(progress.meaningfulClicks / CLICKS_PER_LOCK);
  const newLock = progress.locksEarned > previousLocks;

  // Check for candle burst
  let candleBurst = false;
  if (!progress.candleBurstTriggered && progress.meaningfulClicks >= CLICKS_FOR_CANDLE_BURST) {
    progress.candleBurstTriggered = true;
    candleBurst = true;
  }

  // Update funnel stage
  if (progress.meaningfulClicks >= CLICKS_FOR_CANDLE_BURST) {
    progress.funnelStage = "ignite";
  } else if (progress.locksEarned >= 1) {
    progress.funnelStage = "engage";
  } else if (progress.meaningfulClicks >= 1) {
    progress.funnelStage = "explore";
  }

  // Save locally
  saveLocalProgress(progress);

  // Sync to Supabase (fire-and-forget)
  try {
    // Record the click
    await (supabase.from as any)("atti_engagement_clicks").insert({
      session_id: progress.sessionId,
      click_type: clickType,
      section_id: sectionId || null,
      metadata: metadata || {},
    });

    // Update progress
    await (supabase.from as any)("atti_engagement_progress").upsert(
      {
        session_id: progress.sessionId,
        meaningful_clicks: progress.meaningfulClicks,
        locks_earned: progress.locksEarned,
        candle_burst_triggered: progress.candleBurstTriggered,
        candle_burst_at: candleBurst ? new Date().toISOString() : null,
        funnel_stage: progress.funnelStage,
        last_click_at: progress.lastClickAt,
      },
      { onConflict: "session_id" }
    );
  } catch (err) {
    console.error("ATTI: Failed to sync click", err);
  }

  return { progress, newLock, candleBurst };
}

/**
 * Link an ATTI session to a registered user (after registration/login).
 */
export async function linkSessionToUser(userId: string): Promise<void> {
  const sessionId = localStorage.getItem(ATTI_SESSION_KEY);
  if (!sessionId) return;

  try {
    // Update the scan record
    await (supabase.from as any)("atti_campaign_scans")
      .update({
        registered_user_id: userId,
        converted_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    // Update progress with registration timestamp
    await (supabase.from as any)("atti_engagement_progress")
      .update({
        registered_at: new Date().toISOString(),
        funnel_stage: "ignite",
      })
      .eq("session_id", sessionId);
  } catch (err) {
    console.error("ATTI: Failed to link session", err);
  }
}

/**
 * Record first transaction (final funnel stage).
 */
export async function recordFirstTransaction(): Promise<void> {
  const sessionId = localStorage.getItem(ATTI_SESSION_KEY);
  if (!sessionId) return;

  try {
    const progress = getLocalProgress();
    progress.funnelStage = "transact";
    saveLocalProgress(progress);

    await (supabase.from as any)("atti_engagement_progress")
      .update({
        funnel_stage: "transact",
        first_transaction_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);
  } catch (err) {
    console.error("ATTI: Failed to record transaction", err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIFROST CARD BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/** Card template definitions */
export const CARD_TEMPLATES = [
  { id: "classic", name: "Classic Platform", description: "Clean, professional design with platform branding", initiatives: "all" },
  { id: "maker", name: "Maker's Mark", description: "Industrial aesthetic for HexIsle and manufacturing", initiatives: "hexisle-manufacturing" },
  { id: "community", name: "Community Circle", description: "Warm, inviting design for food and family initiatives", initiatives: "community" },
  { id: "creative", name: "Creative Spark", description: "Bold, artistic design for JukeBox and Didasko", initiatives: "creative" },
  { id: "business", name: "Business Ready", description: "Corporate-friendly for Let's Make Bread", initiatives: "lets-make-bread" },
  { id: "civic", name: "Civic Voice", description: "Patriotic and civic-minded for Power to the People", initiatives: "power-to-the-people" },
] as const;

/** Color scheme options */
export const COLOR_SCHEMES = [
  { id: "platform", name: "Platform Default", primary: "#2563eb", secondary: "#1e40af" },
  { id: "warm", name: "Warm Earth", primary: "#d97706", secondary: "#92400e" },
  { id: "nature", name: "Nature Green", primary: "#059669", secondary: "#065f46" },
  { id: "royal", name: "Royal Purple", primary: "#7c3aed", secondary: "#5b21b6" },
  { id: "sunset", name: "Sunset", primary: "#dc2626", secondary: "#991b1b" },
  { id: "slate", name: "Professional Slate", primary: "#475569", secondary: "#1e293b" },
] as const;

/** Create a new card design */
export async function createCardDesign(design: CardDesign): Promise<{ id: string; referrerCode: string } | null> {
  try {
    const { data, error } = await (supabase.from as any)("atti_card_designs")
      .insert({
        creator_id: design.creatorId,
        template_id: design.templateId,
        initiative: design.initiative,
        format: design.format,
        headline: design.headline,
        tagline: design.tagline || null,
        logo_url: design.logoUrl || null,
        color_scheme: design.colorScheme,
        back_text: design.backText || null,
      })
      .select("id, referrer_code")
      .single();

    if (error) throw error;
    return { id: data.id, referrerCode: data.referrer_code };
  } catch (err) {
    console.error("ATTI: Failed to create card design", err);
    return null;
  }
}

/** Get all card designs for a user */
export async function getUserCardDesigns(userId: string): Promise<CardDesign[]> {
  try {
    const { data, error } = await (supabase.from as any)("atti_card_designs")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      creatorId: d.creator_id,
      templateId: d.template_id,
      initiative: d.initiative,
      format: d.format,
      headline: d.headline,
      tagline: d.tagline,
      logoUrl: d.logo_url,
      colorScheme: d.color_scheme,
      backText: d.back_text,
      referrerCode: d.referrer_code,
      quantityOrdered: d.quantity_ordered,
      status: d.status,
    }));
  } catch (err) {
    console.error("ATTI: Failed to load card designs", err);
    return [];
  }
}

/** Update a card design */
export async function updateCardDesign(
  designId: string,
  updates: Partial<CardDesign>
): Promise<boolean> {
  try {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.headline !== undefined) dbUpdates.headline = updates.headline;
    if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.colorScheme !== undefined) dbUpdates.color_scheme = updates.colorScheme;
    if (updates.backText !== undefined) dbUpdates.back_text = updates.backText;
    if (updates.format !== undefined) dbUpdates.format = updates.format;
    if (updates.templateId !== undefined) dbUpdates.template_id = updates.templateId;
    if (updates.initiative !== undefined) dbUpdates.initiative = updates.initiative;

    const { error } = await (supabase.from as any)("atti_card_designs")
      .update(dbUpdates)
      .eq("id", designId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("ATTI: Failed to update card design", err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERRAL CHAINS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve a referrer code to find the card creator.
 */
export async function resolveReferrerCode(code: string): Promise<{ cardId: string; creatorId: string } | null> {
  try {
    const { data, error } = await (supabase.from as any)("atti_card_designs")
      .select("id, creator_id")
      .eq("referrer_code", code)
      .single();

    if (error || !data) return null;
    return { cardId: data.id, creatorId: data.creator_id };
  } catch {
    return null;
  }
}

/**
 * Create a referral chain entry when a user registers through a card.
 */
export async function createReferralChain(
  referrerId: string,
  referredId: string,
  cardId?: string
): Promise<boolean> {
  try {
    await (supabase.from as any)("atti_referral_chains").insert({
      referrer_id: referrerId,
      referred_id: referredId,
      card_id: cardId || null,
      chain_depth: 1,
    });
    return true;
  } catch (err) {
    console.error("ATTI: Failed to create referral chain", err);
    return false;
  }
}

/**
 * Get referral statistics for a user.
 */
export async function getReferralStats(userId: string): Promise<{
  directReferrals: number;
  totalChainMembers: number;
  totalMarksEarned: number;
}> {
  try {
    const { data, error } = await (supabase.from as any)("atti_referral_chains")
      .select("chain_depth, marks_awarded")
      .eq("referrer_id", userId);

    if (error) throw error;

    const referrals = data || [];
    return {
      directReferrals: referrals.filter((r: any) => r.chain_depth === 1).length,
      totalChainMembers: referrals.length,
      totalMarksEarned: referrals.reduce((sum: number, r: any) => sum + (r.marks_awarded || 0), 0),
    };
  } catch {
    return { directReferrals: 0, totalChainMembers: 0, totalMarksEarned: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

/** Per-card scan and engagement analytics */
export interface CardAnalytics {
  cardId: string;
  referrerCode: string;
  totalScans: number;
  uniqueSessions: number;
  conversions: number;          // scans that led to registration
  avgClicks: number;            // average meaningful clicks per session
  candleBursts: number;         // sessions reaching 20 clicks
  topInitiative: string | null; // most-scanned initiative
}

/** Get analytics for all cards belonging to a user */
export async function getCardAnalytics(userId: string): Promise<CardAnalytics[]> {
  try {
    // Get user's card designs
    const { data: cards, error: cardError } = await (supabase.from as any)("atti_card_designs")
      .select("id, referrer_code, initiative")
      .eq("creator_id", userId);

    if (cardError || !cards?.length) return [];

    // Get scans for all their referrer codes
    const referrerCodes = cards.map((c: any) => c.referrer_code);
    const { data: scans } = await (supabase.from as any)("atti_campaign_scans")
      .select("id, referrer_code, session_id, initiative, registered_user_id, converted_at")
      .in("referrer_code", referrerCodes);

    // Get engagement progress for sessions from their scans
    const sessionIds = [...new Set((scans || []).map((s: any) => s.session_id))];
    let progressData: any[] = [];
    if (sessionIds.length > 0) {
      const { data: progress } = await (supabase.from as any)("atti_engagement_progress")
        .select("session_id, meaningful_clicks, candle_burst_triggered")
        .in("session_id", sessionIds);
      progressData = progress || [];
    }

    // Build analytics per card
    return cards.map((card: any) => {
      const cardScans = (scans || []).filter((s: any) => s.referrer_code === card.referrer_code);
      const cardSessionIds = [...new Set(cardScans.map((s: any) => s.session_id))];
      const cardProgress = progressData.filter((p: any) => cardSessionIds.includes(p.session_id));

      const totalClicks = cardProgress.reduce((sum: number, p: any) => sum + (p.meaningful_clicks || 0), 0);
      const candleBursts = cardProgress.filter((p: any) => p.candle_burst_triggered).length;
      const conversions = cardScans.filter((s: any) => s.registered_user_id || s.converted_at).length;

      // Find most common initiative
      const initiativeCounts: Record<string, number> = {};
      cardScans.forEach((s: any) => {
        if (s.initiative) {
          initiativeCounts[s.initiative] = (initiativeCounts[s.initiative] || 0) + 1;
        }
      });
      const topInitiative = Object.entries(initiativeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      return {
        cardId: card.id,
        referrerCode: card.referrer_code,
        totalScans: cardScans.length,
        uniqueSessions: cardSessionIds.length,
        conversions,
        avgClicks: cardSessionIds.length > 0 ? Math.round(totalClicks / cardSessionIds.length) : 0,
        candleBursts,
        topInitiative,
      };
    });
  } catch {
    return [];
  }
}

/** Update card distribution status */
export async function updateCardStatus(
  cardId: string,
  status: CardStatus,
  quantity?: number
): Promise<boolean> {
  try {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (quantity !== undefined) updateData.quantity_ordered = quantity;

    const { error } = await (supabase.from as any)("atti_card_designs")
      .update(updateData)
      .eq("id", cardId);

    return !error;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// QR CODE GENERATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Generate the QR code URL for a card */
export function getCardScanUrl(referrerCode: string, initiative?: string): string {
  const base = "https://lianabanyan.com/atti";
  const params = new URLSearchParams();
  params.set("ref", referrerCode);
  if (initiative) params.set("i", initiative);
  return `${base}?${params.toString()}`;
}

/** Parse QR scan URL parameters */
export function parseScanParams(searchParams: URLSearchParams): {
  referrerCode?: string;
  initiative?: string;
  cardId?: string;
} {
  return {
    referrerCode: searchParams.get("ref") || undefined,
    initiative: searchParams.get("i") || undefined,
    cardId: searchParams.get("card") || undefined,
  };
}
