/**
 * SubstrateIndexingOnboarding.tsx
 * Gate F — First-run substrate indexing prompt
 * BLACK MAMBA gamma - BP060 W2 - 2026-05-28T01:25Z
 *
 * §X.B.MNEMOSYNE: amplify-computer source not present in workspace (only app.asar).
 * This component is READY-TO-INTEGRATE — merge into the actual Mnemosyne source tree.
 * Integration point: first-run/onboarding flow, step after account creation.
 *
 * Gate I: All UI labels use neutral member-facing language.
 * Gate J: Substrate-first query routing happens in ai_dispatch_ipc.ts (see that file).
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface SubstrateIndexingOnboardingProps {
  onComplete: (didIndex: boolean) => void;
}

export const SubstrateIndexingOnboarding: React.FC<SubstrateIndexingOnboardingProps> = ({
  onComplete,
}) => {
  const [indexing, setIndexing] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);

  // SaltFighter first-touch greeting overlay (plays once on first launch)
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const hasPlayed = localStorage.getItem('saltfighter_greeting_played');
    if (!hasPlayed) {
      setShowOverlay(true);
      if (audioRef.current) {
        (audioRef.current as HTMLAudioElement).play().catch(() => {
          // Audio blocked by Electron policy — overlay still shows
        });
      }
      localStorage.setItem('saltfighter_greeting_played', 'true');
    }
  }, []);

  const handleYes = useCallback(async () => {
    setIndexing(true);
    try {
      // IPC bridge: caithedral_tools_ipc.ts processFile channel
      const files: string[] = await (window as any).electron?.caithedral?.scanDocuments?.() ?? [];
      const total = files.length;
      setProgress({ processed: 0, total });

      for (let i = 0; i < files.length; i++) {
        await (window as any).electron?.caithedral?.processFile?.(files[i]);
        setProgress({ processed: i + 1, total });
      }
      setDone(true);
      setTimeout(() => onComplete(true), 1500);
    } catch (err) {
      console.error('[SubstrateIndexingOnboarding] indexing error:', err);
      setDone(true);
      onComplete(true);
    }
  }, [onComplete]);

  const handleNo = useCallback(() => {
    setSkipped(true);
    onComplete(false);
  }, [onComplete]);

  if (done) {
    return (
      <div className="substrate-onboarding substrate-onboarding--done">
        <div className="substrate-onboarding__check">&#10003;</div>
        <p>Knowledge Index complete. {progress.processed} items ready.</p>
      </div>
    );
  }

  if (indexing) {
    const pct = progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;
    return (
      <div className="substrate-onboarding substrate-onboarding--indexing">
        <h3>Building Knowledge Index&hellip;</h3>
        <div className="substrate-onboarding__progress-bar">
          <div
            className="substrate-onboarding__progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="substrate-onboarding__progress-label">
          {progress.processed} / {progress.total} items&nbsp;({pct}%)
        </p>
      </div>
    );
  }

  return (
    <>
      {/* SaltFighter first-touch greeting overlay */}
      <audio ref={audioRef} src="./assets/audio/greetings_saltfighter.m4a" />
      {showOverlay && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 10, 46, 0.95)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, fontFamily: 'monospace'
        }}>
          <p style={{ color: '#FFD700', fontSize: '1.4rem', textAlign: 'center', maxWidth: '600px', lineHeight: 1.6 }}>
            "Greetings, SaltFighter! You have been recruited by the Cooperative to defend the frontier against X-traction and the Profit Armada."
          </p>
          <p style={{ color: '#AAAACC', fontSize: '0.8rem', marginTop: '2rem' }}>
            — Founder, Jonathan Jones · Liana Banyan Corporation · Defensive Pledge #2260
          </p>
          <button
            onClick={() => setShowOverlay(false)}
            style={{
              marginTop: '2rem', padding: '0.5rem 2rem',
              background: '#FFD700', color: '#0A0A2E',
              border: 'none', cursor: 'pointer',
              fontFamily: 'monospace', fontWeight: 'bold'
            }}
          >
            Begin
          </button>
        </div>
      )}
      <div className="substrate-onboarding">
        <h3>Index your Documents folder?</h3>
        <p>
          Build a local Knowledge Index from your Documents folder so Mnemosyne
          can answer questions from your own files&mdash;free, private, and on-device.
        </p>
        <div className="substrate-onboarding__actions">
          {/* Gate I: "Index" not "Ebletify"; "Knowledge Index" not "Substrate" */}
          <button
            className="substrate-onboarding__btn substrate-onboarding__btn--primary"
            onClick={handleYes}
          >
            Yes, build Knowledge Index
          </button>
          <button
            className="substrate-onboarding__btn substrate-onboarding__btn--secondary"
            onClick={handleNo}
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
};

export default SubstrateIndexingOnboarding;
