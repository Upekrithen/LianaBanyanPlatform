// AMPLIFY Computer — Auth Gate
// B37 Phase 7 — First-launch sign-in / start-trial modal
// Shown when status === 'unauthenticated' or 'validating'

import React, { useState } from 'react';

interface AuthGateProps {
  isValidating?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({ isValidating = false }) => {
  const [starting, setStarting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleStartTrial = () => {
    setStarting(true);
    window.amplify.authStartTrial();
    // State change arrives via IPC; no need to manually update
  };

  const handleSignIn = () => {
    setSigningIn(true);
    window.amplify.authSignIn();
    // Auth state update arrives via IPC when OAuth completes
  };

  const handleJoin = () => {
    window.amplify.authOpenJoin();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 15, 28, 0.97)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#1e293b',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(245,158,11,0.08)',
        }}
      >
        {/* Gold top stripe */}
        <div
          style={{
            height: 3,
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
          }}
        />

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                margin: '0 auto 14px',
                fontWeight: 900,
                color: '#f59e0b',
              }}
            >
              A
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: 6,
              }}
            >
              AMPLIFY Computer
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
              CAI Hearth · Local AI · Cooperative Substrate
            </div>
          </div>

          {isValidating || signingIn ? (
            // Validating state
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: '3px solid rgba(245,158,11,0.2)',
                  borderTopColor: '#f59e0b',
                  borderRadius: '50%',
                  margin: '0 auto 14px',
                  animation: 'spin 0.9s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                {signingIn ? 'Waiting for browser sign-in…' : 'Validating…'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                Complete sign-in in your browser, then return here
              </div>
            </div>
          ) : (
            <>
              {/* Value props */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}
              >
                {[
                  { icon: '🌿', text: 'Local AI inference — zero cloud cost for substrate hits' },
                  { icon: '🔒', text: 'Your data stays on your machine' },
                  { icon: '🤝', text: 'Cooperative substrate network — help each other help ourselves' },
                ].map((item) => (
                  <div
                    key={item.icon}
                    style={{
                      display: 'flex',
                      gap: 10,
                      marginBottom: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleStartTrial}
                  disabled={starting}
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#000',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: starting ? 'default' : 'pointer',
                    opacity: starting ? 0.7 : 1,
                  }}
                >
                  {starting ? 'Starting…' : 'Start Free Trial (30 days)'}
                </button>

                <button
                  onClick={handleSignIn}
                  disabled={signingIn}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10,
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 13,
                    cursor: signingIn ? 'default' : 'pointer',
                  }}
                >
                  Sign In with LB Account
                </button>
              </div>

              {/* Membership CTA */}
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  Not a member?{' '}
                </span>
                <button
                  onClick={handleJoin}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    fontSize: 11,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Join for $5/year →
                </button>
              </div>

              {/* Fine print */}
              <div
                style={{
                  marginTop: 16,
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                Trial includes full features. After 30 days, substrate read-only until you join.
                <br />
                Membership: $5/year — lianabanyan.com
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
