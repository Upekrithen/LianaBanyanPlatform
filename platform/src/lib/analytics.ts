/**
 * ANALYTICS — Lightweight event tracking for Liana Banyan
 * ========================================================
 * Tracks user actions for understanding platform usage.
 * Privacy-first: no PII in events, no third-party tracking pixels.
 * Events stored in Supabase for internal analytics only.
 *
 * Respects user privacy: no cookies, no fingerprinting, no cross-site tracking.
 * All data stays within the Liana Banyan cooperative.
 *
 * Innovation #1545 — Platform Analytics System (Session 8A)
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Event Types ────────────────────────────────────────────────

export type AnalyticsEventType =
  // Navigation
  | "page_view"
  | "portal_entry"
  | "beacon_reached"
  // Engagement
  | "project_viewed"
  | "project_backed"
  | "pledge_cancelled"
  | "credit_purchased"
  | "medallion_minted"
  // Account
  | "user_signup"
  | "user_login"
  | "profile_updated"
  // Initiative
  | "initiative_viewed"
  | "initiative_joined"
  | "meal_ordered"
  | "eoi_submitted"
  // HexIsle
  | "island_visited"
  | "overworld_moved"
  | "pipe_transit"
  | "canal_entered"
  | "keep_accessed"
  // Content
  | "cue_card_viewed"
  | "scroll_unfurled"
  | "deck_card_drawn"
  // Commerce
  | "product_viewed"
  | "vote_cast"
  | "wave_selected"
  // Proof + join flow (BP078)
  | "proof_handoff_clicked"
  | "proof_handoff_skipped"
  | "gauntlet_mode_selected"
  | "gauntlet_live_results_viewed"
  | "membership_intent_selected"
  | "membership_path_routed"
  // SKU upgrade (BP078 Scope 6.5)
  | "feather_earned";

export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  properties?: Record<string, unknown>;
  page_path?: string;
  referrer?: string;
  session_id?: string;
}

// ─── Session Management ─────────────────────────────────────────

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    // Generate a random session ID (not persisted across reloads)
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

// ─── Event Queue (batching for performance) ─────────────────────

const eventQueue: Array<{
  event_type: string;
  properties: Record<string, unknown>;
  page_path: string;
  session_id: string;
  created_at: string;
  user_id: string | null;
}> = [];

let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BATCH_SIZE = 20;

async function flushEvents() {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);

  try {
    // Store in Supabase analytics_events table
    // If table doesn't exist, events are silently dropped (graceful degradation)
    await supabase.from("analytics_events" as any).insert(batch);
  } catch {
    // Analytics should never break the app — silent failure
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, FLUSH_INTERVAL);
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Track an analytics event.
 * Non-blocking, batched, and privacy-respecting.
 */
export function trackEvent(
  eventType: AnalyticsEventType,
  properties?: Record<string, unknown>
): void {
  // Get current user ID (if signed in)
  // We do NOT await this — fire and forget
  supabase.auth.getUser().then(({ data }) => {
    eventQueue.push({
      event_type: eventType,
      properties: properties || {},
      page_path: window.location.pathname,
      session_id: getSessionId(),
      created_at: new Date().toISOString(),
      user_id: data?.user?.id || null,
    });

    // Auto-flush when batch is full
    if (eventQueue.length >= MAX_BATCH_SIZE) {
      flushEvents();
    } else {
      scheduleFlush();
    }
  });
}

/**
 * Track a page view. Call from route change handlers.
 */
export function trackPageView(pagePath?: string): void {
  trackEvent("page_view", {
    path: pagePath || window.location.pathname,
    referrer: document.referrer || undefined,
  });
}

/**
 * Track a project being viewed.
 */
export function trackProjectView(projectId: string, projectName?: string): void {
  trackEvent("project_viewed", { project_id: projectId, project_name: projectName });
}

/**
 * Track a project being backed (pledge created).
 */
export function trackProjectBacked(
  projectId: string,
  amount: number,
  projectName?: string
): void {
  trackEvent("project_backed", {
    project_id: projectId,
    amount,
    project_name: projectName,
  });
}

/**
 * Track a portal entry (user lands on a specific portal domain).
 */
export function trackPortalEntry(portalType: string): void {
  trackEvent("portal_entry", { portal: portalType });
}

/**
 * Track initiative page view.
 */
export function trackInitiativeView(initiativeId: string, initiativeName?: string): void {
  trackEvent("initiative_viewed", {
    initiative_id: initiativeId,
    initiative_name: initiativeName,
  });
}

/**
 * Track credit purchase completion.
 */
export function trackCreditPurchase(amount: number, packageName?: string): void {
  trackEvent("credit_purchased", { amount, package: packageName });
}

/**
 * Flush all pending events immediately (call on page unload).
 */
export function flushAnalytics(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  flushEvents();
}

// ─── Auto-flush on page unload ──────────────────────────────────

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushAnalytics();
    }
  });

  window.addEventListener("beforeunload", () => {
    flushAnalytics();
  });
}
