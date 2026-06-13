/**
 * Stripe checkout session helper — BP081 K-1 stub
 * Returns stub response; real Stripe integration in v0.1.61.
 */
import { MEMBERSHIP_ANNUAL_FEE_USD } from '../../shared/membership_types';

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
  isStub: boolean;
}

export async function createMembershipCheckoutSession(
  userEmail?: string
): Promise<CheckoutSessionResult> {
  // Stub — v0.1.61 wires real Stripe createSession here
  console.log(`[Membership] createCheckoutSession stub — $${MEMBERSHIP_ANNUAL_FEE_USD}/year — email: ${userEmail ?? 'unknown'}`);
  return {
    success: true,
    sessionId: `stub_session_${Date.now()}`,
    checkoutUrl: `https://checkout.stripe.com/stub?amount=${MEMBERSHIP_ANNUAL_FEE_USD * 100}`,
    isStub: true,
  };
}
