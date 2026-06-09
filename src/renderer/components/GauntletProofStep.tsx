// GauntletProofStep.tsx -- BP078 Scope 3
// First-run spine Step 3: Mesh test proof with graceful static fallback (Founder binding 2).
// Calls window.amplify.runMeshTest() on mount. Shows live or canonical static numbers.
// Always provides a "Skip for now" link so users are never hard-blocked.

import React, { useEffect, useState } from 'react';
import { NetworkValueReveal, CANONICAL_STATIC, type NetworkValueData } from './NetworkValueReveal';

export interface GauntletProofStepProps {
  onSkip: () => void;
}

type Phase = 'loading' | 'live' | 'static';

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
  border: '1px solid rgba(110,231,183,0.18)',
  borderRadius: 14,
  padding: '28px 24px 20px',
  maxWidth: 480,
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

const skipLink: React.CSSProperties = {
  display: 'block',
  textAlign: 'center' as const,
  fontSize: 12,
  color: '#475569',
  cursor: 'pointer',
  padding: '6px 0 0',
  background: 'none',
  border: 'none',
  textDecoration: 'underline',
  fontFamily: 'inherit',
};

const spinner: React.CSSProperties = {
  width: 20,
  height: 20,
  border: '2px solid rgba(110,231,183,0.2)',
  borderTopColor: '#6ee7b7',
  borderRadius: '50%',
  animation: 'mnemo-spin 0.8s linear infinite',
  flexShrink: 0,
};

function SpinnerIcon(): React.ReactElement {
  return (
    <>
      <style>{`@keyframes mnemo-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={spinner} aria-hidden="true" />
    </>
  );
}

export function GauntletProofStep({ onSkip }: GauntletProofStepProps): React.ReactElement {
  const [phase, setPhase] = useState<Phase>('loading');
  const [data, setData] = useState<NetworkValueData>(CANONICAL_STATIC);

  useEffect(() => {
    let cancelled = false;

    void (async (): Promise<void> => {
      try {
        const result = await window.amplify?.runMeshTest?.();
        if (cancelled) return;

        if (result?.success === true && result.grading) {
          setData({
            isStatic: false,
            accuracy: result.grading.accuracy,
            hashVerified: result.grading.hash_verified,
            totalQuestions: result.grading.total_questions,
            p50LatencyMs: result.grading.p50_latency_ms,
            p95LatencyMs: result.grading.p95_latency_ms,
          });
          setPhase('live');
        } else {
          setData(CANONICAL_STATIC);
          setPhase('static');
        }
      } catch {
        if (!cancelled) {
          setData(CANONICAL_STATIC);
          setPhase('static');
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={overlay}>
      <div style={card}>
        <div>
          <h2 style={heading}>
            {phase === 'loading' ? 'Running mesh proof...' : 'The network multiplies your AI.'}
          </h2>
          {phase === 'loading' ? (
            <p style={{ ...sub, marginTop: 8 }}>
              Testing peer resolution accuracy. This takes up to 45 seconds.
            </p>
          ) : (
            <p style={{ ...sub, marginTop: 8 }}>
              {phase === 'live'
                ? 'Live results from your mesh test run.'
                : 'Your Yoked AI reaches answers that no single machine can find alone.'}
            </p>
          )}
        </div>

        {phase === 'loading' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <SpinnerIcon />
            <span style={{ fontSize: 13, color: '#64748b' }}>Running mesh test...</span>
          </div>
        ) : (
          <NetworkValueReveal data={data} />
        )}

        <button type="button" style={skipLink} onClick={onSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
