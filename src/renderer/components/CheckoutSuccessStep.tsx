// CheckoutSuccessStep.tsx -- BP078 Scope 5
// First-run spine Step 5: $5 cooperative membership checkout.
// Pre-checkout: Join button opens Stripe via IPC. Post-checkout: verify button confirms membership.
// Founder binding 1 honored: uses openExternal + auth relay URL pattern (no custom JWT).
// Founder binding: explicit "I have completed checkout" button (cooperative transparency principle).

import React, { useState, useCallback } from 'react';

export interface CheckoutSuccessStepProps {
  onMembershipVerified: () => void;
  onSkip: () => void;
}

const RELAY_KEY = '_lb_auth';

function buildAuthRelayUrl(targetUrl: string): string {
  // Auth tokens are held in main process; not exposed to renderer (R16).
  // The web side's consumeAuthRelay() runs at boot and handles tokens embedded by
  // the buildAuthRelayUrl on the platform side. For now, open the plain URL.
  return targetUrl;
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(2,6,23,0.9)',
  zIndex: 9999,
  padding: 16,
};

const card: React.CSSProperties = {
  background: 'rgba(15,23,42,0.97)',
  border: '1px solid rgba(110,231,183,0.22)',
  borderRadius: 14,
  padding: '28px 24px 22px',
  maxWidth: 440,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  fontFamily: "'Inter', system-ui, sans-serif",
};

const heading: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: '#f1f5f9',
  lineHeight: 1.3,
};

const sub: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#94a3b8',
  lineHeight: 1.6,
};

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  padding: '12px 20px',
  background: disabled ? 'rgba(110,231,183,0.04)' : 'rgba(110,231,183,0.12)',
  border: '1px solid rgba(110,231,183,0.4)',
  borderRadius: 8,
  color: disabled ? '#475569' : '#6ee7b7',
  fontSize: 14,
  fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  textAlign: 'center' as const,
  fontFamily: 'inherit',
  width: '100%',
});

const ghostBtn: React.CSSProperties = {
  display: 'block',
  textAlign: 'center' as const,
  fontSize: 12,
  color: '#475569',
  cursor: 'pointer',
  padding: '4px 0',
  background: 'none',
  border: 'none',
  textDecoration: 'underline',
  fontFamily: 'inherit',
};

const errorBox: React.CSSProperties = {
  fontSize: 12,
  color: '#f87171',
  background: 'rgba(248,113,113,0.08)',
  border: '1px solid rgba(248,113,113,0.2)',
  borderRadius: 6,
  padding: '8px 12px',
};

export function CheckoutSuccessStep({ onMembershipVerified, onSkip }: CheckoutSuccessStepProps): React.ReactElement {
  const [autoRenew, setAutoRenew] = useState(false);
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [openingCheckout, setOpeningCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = useCallback(async () => {
    setOpeningCheckout(true);
    setError(null);
    try {
      const result = await window.amplify?.membership?.createCheckout(autoRenew);
      if (result?.ok) {
        const url = (result as { ok: boolean; url?: string }).url;
        if (url) {
          window.amplify?.openExternal?.(url);
          setCheckoutOpened(true);
        } else {
          // Fallback: no URL returned
          window.amplify?.openExternal?.('https://lianabanyan.com/join');
          setCheckoutOpened(true);
        }
      } else if (result?.fallbackUrl) {
        window.amplify?.openExternal?.(result.fallbackUrl);
        setCheckoutOpened(true);
      } else {
        setError(result?.error ?? 'Could not open checkout. Please try again.');
      }
    } catch {
      window.amplify?.openExternal?.('https://lianabanyan.com/join');
      setCheckoutOpened(true);
    } finally {
      setOpeningCheckout(false);
    }
  }, [autoRenew]);

  const handleVerify = useCallback(async () => {
    setCheckingMembership(true);
    setError(null);
    try {
      const result = await window.amplify?.membership?.verifyStatus?.();
      if (result?.membership_active === true) {
        // Auth relay: open welcome page for seamless web handoff (Founder binding 1)
        const welcomeUrl = buildAuthRelayUrl('https://lianabanyan.com/welcome');
        window.amplify?.openExternal?.(welcomeUrl);
        onMembershipVerified();
      } else {
        setError("We don't see your membership yet. Please wait a moment and try again.");
      }
    } catch {
      setError('Verification failed. Please check your connection and try again.');
    } finally {
      setCheckingMembership(false);
    }
  }, [onMembershipVerified]);

  const handleRetryCheckout = useCallback(() => {
    setCheckoutOpened(false);
    setError(null);
  }, []);

  return (
    <div style={overlay}>
      <div style={card}>
        <div>
          <h2 style={heading}>
            {checkoutOpened ? 'Complete your membership' : 'Join the Cooperative'}
          </h2>
          <p style={{ ...sub, marginTop: 8 }}>
            {checkoutOpened
              ? 'Finish the checkout in your browser, then click the button below to verify your membership.'
              : 'Free to use. Better to join. $5/year as a founding member-owner.'}
          </p>
        </div>

        {!checkoutOpened ? (
          <>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                style={{ accentColor: '#6ee7b7', marginTop: 2, flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                <strong style={{ color: '#e2e8f0' }}>Auto-renew each year</strong>
                {' '}-- keep your founding-member stake without having to rejoin.
              </span>
            </label>

            {error && <div style={errorBox}>{error}</div>}

            <button
              type="button"
              style={primaryBtn(openingCheckout)}
              disabled={openingCheckout}
              onClick={handleJoin}
            >
              {openingCheckout
                ? 'Opening checkout...'
                : `Join Cooperative ($5${autoRenew ? '/year, auto-renews' : ', one-time'}) >`}
            </button>

            <div style={{ fontSize: 10, color: '#334155', textAlign: 'center', lineHeight: 1.5 }}>
              Secure checkout via Stripe · Cancel or change anytime
            </div>
          </>
        ) : (
          <>
            <div style={{
              background: 'rgba(6,78,59,0.15)',
              border: '1px solid rgba(110,231,183,0.2)',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 12,
              color: '#6ee7b7',
              lineHeight: 1.6,
            }}>
              Checkout opened in your browser. Complete the payment, then click below.
            </div>

            {error && <div style={errorBox}>{error}</div>}

            <button
              type="button"
              style={primaryBtn(checkingMembership)}
              disabled={checkingMembership}
              onClick={handleVerify}
            >
              {checkingMembership ? 'Verifying...' : 'I have completed checkout'}
            </button>

            <button type="button" style={ghostBtn} onClick={handleRetryCheckout}>
              Need to open checkout again?
            </button>
          </>
        )}

        <button type="button" style={ghostBtn} onClick={onSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
