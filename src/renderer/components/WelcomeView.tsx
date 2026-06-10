// WelcomeView.tsx -- SEG-S-3/4/5/6/9 BP078 v0.1.35
// SEG-S-3: Updated hero/subline/bullets copy
// SEG-S-4: Mascot graphic with graceful fallback
// SEG-S-5: BenchmarkProofChart embedded
// SEG-S-6: Two doorway cards wired to lifecycle stage B
// SEG-S-9: Mesh checkbox with localStorage persistence

import React, { useState, useCallback, useEffect } from 'react';
import { WelcomeCueCard } from './WelcomeCueCard';
import { BenchmarkProofChart } from './BenchmarkProofChart';
import { useLifecycleStage } from '../hooks/useLifecycleStage';
// SEG-S-7 component (landed). SEG-S-8 (Layer2ProveIt) pending.
import { Layer2UseIt } from './Layer2UseIt';

export const LS_ONBOARDING_COMPLETE = 'mnemosynec_onboarding_complete';
const MESH_KEY = 'mnemosynec_mesh_enabled';

export interface WelcomeViewProps {
  onComplete: () => void;
}

// Placeholder used until SEG-S-8 lands Layer2ProveIt.
function Layer2ProveItPlaceholder(): React.ReactElement {
  return (
    <div style={{
      padding: '24px',
      background: 'rgba(100, 116, 139, 0.08)',
      borderRadius: 8,
      textAlign: 'center',
      color: '#475569',
      fontSize: 13,
      border: '1px solid rgba(100, 116, 139, 0.15)',
    }}>
      Layer 2 loading...
    </div>
  );
}

export function WelcomeView({ onComplete: _onComplete }: WelcomeViewProps): React.ReactElement {
  const { advanceTo } = useLifecycleStage();

  // SEG-S-6: doorway selection state
  const [doorwayChosen, setDoorwayChosen] = useState<'use-it' | 'prove-it' | null>(null);

  // SEG-S-9: mesh checkbox
  const [meshEnabled, setMeshEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MESH_KEY) === 'true';
    } catch { return false; }
  });

  // Persist mesh preference
  useEffect(() => {
    try {
      localStorage.setItem(MESH_KEY, meshEnabled ? 'true' : 'false');
    } catch { /* storage unavailable */ }
  }, [meshEnabled]);

  // SEG-S-4: development warning for missing mascot asset
  useEffect(() => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      console.warn('mnemosynec-mark.png: place asset at src/renderer/public/icons/mnemosynec-mark.png');
    }
  }, []);

  // SEG-S-6: doorway click advances lifecycle to stage B
  const [visible, setVisible] = useState(true);

  const handleDoorwayClick = useCallback((choice: 'use-it' | 'prove-it'): void => {
    advanceTo('B');
    setVisible(false);
    setTimeout(() => {
      setDoorwayChosen(choice);
      setVisible(true);
    }, 180);
  }, [advanceTo]);

  // ── Shared styles ──────────────────────────────────────────────────────────

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1117',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    opacity: visible ? 1 : 0,
    transition: 'opacity 180ms ease',
    overflowY: 'auto',
    padding: '24px 0',
  };

  const card: React.CSSProperties = {
    width: '100%',
    maxWidth: 480,
    padding: '36px 32px',
    background: '#111827',
    border: '1px solid rgba(100, 116, 139, 0.2)',
    borderRadius: 12,
    margin: '0 16px',
  };

  const brandLine: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#6ee7b7',
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    marginBottom: 20,
  };

  const heading: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 800,
    color: '#e2e8f0',
    lineHeight: 1.3,
    margin: '0 0 10px',
  };

  const subline: React.CSSProperties = {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.6,
    margin: '0 0 18px',
  };

  const bulletList: React.CSSProperties = {
    margin: '0 0 24px',
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const bulletItem: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.5,
  };

  const bulletDot: React.CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'rgba(110, 231, 183, 0.5)',
    flexShrink: 0,
    marginTop: 5,
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    color: '#475569',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 12,
  };

  const cardRow: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const backBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 11,
    cursor: 'pointer',
    padding: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  // SEG-S-9: Mesh checkbox (visible in both Stage A and Stage B)
  const meshCheckbox = (
    <label style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      cursor: 'pointer',
      marginTop: 20,
      fontSize: 12,
      color: '#64748b',
      lineHeight: 1.5,
    }}>
      <input
        type="checkbox"
        checked={meshEnabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setMeshEnabled(e.target.checked)}
        style={{ marginTop: 2, flexShrink: 0, accentColor: '#6ee7b7' }}
      />
      <span>Uses connected cooperative memory sources when available. You stay in control.</span>
    </label>
  );

  // ── Stage B: doorway chosen -- show mesh checkbox + Layer2 placeholder ────

  if (doorwayChosen !== null) {
    return (
      <div style={overlay}>
        <div style={card}>
          <button
            type="button"
            style={backBtn}
            onClick={(): void => {
              setVisible(false);
              setTimeout(() => { setDoorwayChosen(null); setVisible(true); }, 180);
            }}
          >
            {'< back'}
          </button>

          {/* SEG-S-9: Mesh checkbox visible in Stage B above Layer2 content */}
          {meshCheckbox}

          <div style={{ marginTop: 20 }}>
            {/* SEG-S-8 will replace Layer2ProveItPlaceholder when it lands. */}
            {doorwayChosen === 'use-it' ? (
              <Layer2UseIt onBack={(): void => {
                setVisible(false);
                setTimeout(() => { setDoorwayChosen(null); setVisible(true); }, 180);
              }} />
            ) : (
              <Layer2ProveItPlaceholder />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Stage A: main welcome screen ───────────────────────────────────────────

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={brandLine}>MnemosyneC</div>

        {/* SEG-S-3: Hero copy */}
        <h1 style={heading}>Dr. MnemosyneC has the cure</h1>

        {/* SEG-S-3: Subline */}
        <p style={subline}>
          Private AI memory and retrieval on your own computer. Test it first or start using it now.
        </p>

        {/* SEG-S-3: Bullets */}
        <ul style={bulletList}>
          <li style={bulletItem}>
            <span style={bulletDot} />
            <span>Free AI that remembers, runs locally, belongs to you.</span>
          </li>
          <li style={bulletItem}>
            <span style={bulletDot} />
            <span>Private AI memory on your computer.</span>
          </li>
          <li style={bulletItem}>
            <span style={bulletDot} />
            <a
              href="https://mnemosynec.ai/how-it-works/"
              style={{ color: '#6ee7b7', textDecoration: 'none', borderBottom: '1px solid rgba(110,231,183,0.3)' }}
              target="_blank"
              rel="noreferrer"
            >
              Learn how it works
            </a>
          </li>
        </ul>

        {/* SEG-S-4: Mascot graphic with graceful fallback */}
        <div style={{ marginBottom: 20 }}>
          <img
            src="icons/mnemosynec-mark.png"
            alt="MnemosyneC mascot"
            style={{ height: 160, width: 'auto', display: 'block', margin: '0 auto' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>): void => {
              (e.target as HTMLImageElement).style.display = 'none';
              const sibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement | null;
              if (sibling) { sibling.style.display = 'flex'; }
            }}
          />
          {/* Mascot pending div: hidden by default, revealed by onError above */}
          <div
            className="mascot-pending"
            style={{
              display: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              height: 60,
              color: '#475569',
              fontSize: 13,
              fontStyle: 'italic',
            }}
          >
            Mascot pending
          </div>
        </div>

        {/* SEG-S-5: Benchmark chart */}
        <BenchmarkProofChart />

        {/* SEG-S-6: Doorway cards */}
        <div style={sectionLabel}>Where do you want to start?</div>

        <div style={cardRow}>
          <WelcomeCueCard
            label="Just use it"
            body="Start with the AI that fits your computer."
            size="doorway"
            variant="blue"
            onClick={(): void => handleDoorwayClick('use-it')}
          />
          <WelcomeCueCard
            label="Prove it with a test"
            body="See benchmark results before you decide."
            size="doorway"
            variant="green"
            onClick={(): void => handleDoorwayClick('prove-it')}
          />
        </div>

        {/* SEG-S-9: Mesh checkbox visible in Stage A */}
        {meshCheckbox}
      </div>
    </div>
  );
}

export default WelcomeView;
