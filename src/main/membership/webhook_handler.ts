/**
 * Stripe webhook handler stubs — BP081 K-1
 * Events: subscription.created / subscription.updated / subscription.deleted
 */
import type { MembershipStatus } from '../../shared/membership_types';

export type WebhookEvent =
  | { type: 'customer.subscription.created'; data: { customerId: string; subscriptionId: string } }
  | { type: 'customer.subscription.updated'; data: { customerId: string; status: string } }
  | { type: 'customer.subscription.deleted'; data: { customerId: string } };

export interface WebhookResult {
  handled: boolean;
  newStatus?: MembershipStatus;
  error?: string;
}

export async function handleWebhookEvent(event: WebhookEvent): Promise<WebhookResult> {
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('[Webhook] subscription.created stub —', event.data.subscriptionId);
      return { handled: true, newStatus: 'active' };
    case 'customer.subscription.updated':
      console.log('[Webhook] subscription.updated stub —', event.data.status);
      return { handled: true, newStatus: event.data.status === 'active' ? 'active' : 'expired' };
    case 'customer.subscription.deleted':
      console.log('[Webhook] subscription.deleted stub —', event.data.customerId);
      return { handled: true, newStatus: 'cancelled' };
    default:
      return { handled: false };
  }
}
