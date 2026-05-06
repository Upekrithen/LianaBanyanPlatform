// AMPLIFY Computer — Trial Banner
// B37 Phase 7 — Days-remaining countdown + $5/year CTA + expiry degraded notice
// Shown persistently during trial_active and trial_expired states

import React, { useState } from 'react';

interface TrialBannerProps {
  status: 'trial_active' | 'trial_expired';
  daysRemaining: number;
  dismissedThisSession?: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  status,
  daysRemaining,
  dismissedThisSession = false,
}) => {
  const [dismissed, setDismissed] = useState(dismissedThisSession);

  // Expired banner is never dismissable
  if (dismissed && status === 'trial_active') return null;

  const handleJoin = () => {
    window.amplify.authOpenJoin();
  };

  if (status === 'trial_expired') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 8000,
          background: 'rgba(15, 23, 42, 0.97)',
          borderTop: '2px solid rgba(239,68,68,0.4)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#fca5a5',
              marginBottom: 3,
            }}
          >
            ⏰ Trial expired — degraded mode active
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
            Substrate read-only. No Ollama inference. No cloud escalation.
            Join the cooperative to restore full access.
          </div>
        </div>
        <button
          onClick={handleJoin}
          style={{
            flexShrink: 0,
            padding: '10px 18px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none',
            borderRadius: 8,
            color: '#000',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Join — $5/year
        </button>
      </div>
    );
  }

  // trial_active
  const urgency = daysRemaining <= 7;
  const critical = daysRemaining <= 3;

  return (
    <div
      style={{
        background: critical
          ? 'rgba(239,68,68,0.08)'
          : urgency
          ? 'rgba(245,158,11,0.08)'
          : 'rgba(255,255,255,0.04)',
        borderBottom: `1px solid ${
          critical
            ? 'rgba(239,68,68,0.2)'
            : urgency
            ? 'rgba(245,158,11,0.2)'
            : 'rgba(255,255,255,0.07)'
        }`,
        padding: '7px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        fontSize: 11,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: critical ? '#fca5a5' : urgency ? '#fbbf24' : 'rgba(255,255,255,0.45)',
        }}
      >
        {critical ? '⚠️ ' : urgency ? '⏳ ' : ''}
        {daysRemaining === 1
          ? 'Last day of free trial'
          : `${daysRemaining} days remaining in free trial`}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleJoin}
          style={{
            padding: '4px 12px',
            background: urgency ? 'rgba(245,158,11,0.15)' : 'transparent',
            border: `1px solid ${urgency ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 20,
            color: urgency ? '#f59e0b' : 'rgba(255,255,255,0.5)',
            fontSize: 11,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Join $5/year →
        </button>

        {!critical && (
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.25)',
              fontSize: 14,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 2px',
            }}
            title="Dismiss for this session"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default TrialBanner;
