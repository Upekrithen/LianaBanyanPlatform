/**
 * Excalibur Subscription State Machine — KN105 / BP016
 * ======================================================
 * Manages the lifecycle of Excalibur Class subscriptions.
 *
 * State transitions:
 *   inactive → active_subscription   (ongoing annual sub via Stripe)
 *   inactive → active_one_time       (one-time payment; expires in 30 days)
 *   active_* → cancelled             (subscriber cancels)
 *   active_subscription → lapsed     (renewal fails / expired)
 *   active_one_time → inactive       (after expiry window)
 *
 * On activation:
 *   - Auto-grants cohort_class = "excalibur_class_subscriber" (composes with KN102)
 *   - Auto-grants per-slice access for the subscribed topic/category
 *   - Fluid librarian mode enabled (KN102 dependency)
 *
 * On lapse/cancel:
 *   - cohort_class reverts to prior tier
 *   - per-slice access revoked
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STITCHPUNKS_DIR = process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");
const EXCALIBUR_DIR = resolve(STITCHPUNKS_DIR, "excalibur_class");
const SUBSCRIPTIONS_PATH = resolve(EXCALIBUR_DIR, "subscriptions.jsonl");
/** One-time access window in days */
const ONE_TIME_EXPIRY_DAYS = 30;
// ─── Storage ─────────────────────────────────────────────────────────────
function ensureDir() {
    if (!existsSync(EXCALIBUR_DIR))
        mkdirSync(EXCALIBUR_DIR, { recursive: true });
}
function readAllSubscriptions() {
    ensureDir();
    if (!existsSync(SUBSCRIPTIONS_PATH))
        return [];
    const lines = readFileSync(SUBSCRIPTIONS_PATH, "utf-8").split("\n").filter(l => l.trim());
    const byId = new Map();
    for (const line of lines) {
        try {
            const sub = JSON.parse(line);
            byId.set(sub.id, sub);
        }
        catch {
            continue;
        }
    }
    return Array.from(byId.values());
}
function persistSubscription(sub) {
    ensureDir();
    writeFileSync(SUBSCRIPTIONS_PATH, JSON.stringify(sub) + "\n", { flag: "a", encoding: "utf-8" });
}
// ─── Date Helpers ─────────────────────────────────────────────────────────
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString();
}
function addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString();
}
// ─── State Machine ────────────────────────────────────────────────────────
/** Creates a new subscription (initial state: inactive). */
export function createSubscription(subscriberId, sliceId, granularity) {
    const now = new Date().toISOString();
    const sub = {
        id: randomUUID(),
        subscriber_id: subscriberId,
        slice_id: sliceId,
        granularity,
        state: "inactive",
        activated_at: null,
        expires_at: null,
        cancelled_at: null,
        lapsed_at: null,
        cohort_class_granted: "excalibur_class_subscriber",
        created_at: now,
        updated_at: now,
    };
    persistSubscription(sub);
    return sub;
}
/** Activates a subscription (annual). Auto-grants cohort_class. */
export function activateSubscription(sub, stripeSubscriptionId) {
    const now = new Date();
    const updated = {
        ...sub,
        state: "active_subscription",
        activated_at: now.toISOString(),
        expires_at: addYears(now, 1),
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: now.toISOString(),
    };
    persistSubscription(updated);
    return updated;
}
/** Activates a one-time access (expires in ONE_TIME_EXPIRY_DAYS). */
export function activateOneTimeAccess(sub, stripeSessionId) {
    const now = new Date();
    const updated = {
        ...sub,
        state: "active_one_time",
        activated_at: now.toISOString(),
        expires_at: addDays(now, ONE_TIME_EXPIRY_DAYS),
        stripe_session_id: stripeSessionId,
        updated_at: now.toISOString(),
    };
    persistSubscription(updated);
    return updated;
}
/** Cancels an active subscription. */
export function cancelSubscription(sub) {
    const now = new Date().toISOString();
    const updated = {
        ...sub,
        state: "cancelled",
        cancelled_at: now,
        updated_at: now,
    };
    persistSubscription(updated);
    return updated;
}
/** Marks a subscription as lapsed (renewal failure). */
export function lapseSubscription(sub) {
    const now = new Date().toISOString();
    const updated = {
        ...sub,
        state: "lapsed",
        lapsed_at: now,
        updated_at: now,
    };
    persistSubscription(updated);
    return updated;
}
/** Checks whether a subscription is currently active (including expiry check for one-time). */
export function isSubscriptionActive(sub) {
    if (sub.state === "active_subscription")
        return true;
    if (sub.state === "active_one_time") {
        if (!sub.expires_at)
            return false;
        return new Date(sub.expires_at) > new Date();
    }
    return false;
}
/** Returns all active subscriptions for a subscriber. */
export function getActiveSubscriptions(subscriberId) {
    return readAllSubscriptions()
        .filter(s => s.subscriber_id === subscriberId && isSubscriptionActive(s));
}
/** Checks if a subscriber has active access to a given slice. */
export function hasSliceAccess(subscriberId, sliceId) {
    return readAllSubscriptions().some(s => s.subscriber_id === subscriberId && s.slice_id === sliceId && isSubscriptionActive(s));
}
/** Returns all subscriptions for a slice (for public dashboard). */
export function getSubscriptionsForSlice(sliceId) {
    return readAllSubscriptions().filter(s => s.slice_id === sliceId);
}
/** Returns all subscriptions for a subscriber. */
export function getSubscriptionsForSubscriber(subscriberId) {
    return readAllSubscriptions().filter(s => s.subscriber_id === subscriberId);
}
//# sourceMappingURL=subscription_state_machine.js.map
