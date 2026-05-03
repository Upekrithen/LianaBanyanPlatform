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
import type { ExcaliburSubscription } from "./types.js";
/** Creates a new subscription (initial state: inactive). */
export declare function createSubscription(subscriberId: string, sliceId: string, granularity: ExcaliburSubscription["granularity"]): ExcaliburSubscription;
/** Activates a subscription (annual). Auto-grants cohort_class. */
export declare function activateSubscription(sub: ExcaliburSubscription, stripeSubscriptionId?: string): ExcaliburSubscription;
/** Activates a one-time access (expires in ONE_TIME_EXPIRY_DAYS). */
export declare function activateOneTimeAccess(sub: ExcaliburSubscription, stripeSessionId?: string): ExcaliburSubscription;
/** Cancels an active subscription. */
export declare function cancelSubscription(sub: ExcaliburSubscription): ExcaliburSubscription;
/** Marks a subscription as lapsed (renewal failure). */
export declare function lapseSubscription(sub: ExcaliburSubscription): ExcaliburSubscription;
/** Checks whether a subscription is currently active (including expiry check for one-time). */
export declare function isSubscriptionActive(sub: ExcaliburSubscription): boolean;
/** Returns all active subscriptions for a subscriber. */
export declare function getActiveSubscriptions(subscriberId: string): ExcaliburSubscription[];
/** Checks if a subscriber has active access to a given slice. */
export declare function hasSliceAccess(subscriberId: string, sliceId: string): boolean;
/** Returns all subscriptions for a slice (for public dashboard). */
export declare function getSubscriptionsForSlice(sliceId: string): ExcaliburSubscription[];
/** Returns all subscriptions for a subscriber. */
export declare function getSubscriptionsForSubscriber(subscriberId: string): ExcaliburSubscription[];
