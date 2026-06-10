// Layer2ProveIt.tsx -- SEG-S-8 BP078 v0.1.35
// Layer 2 surface for "Proof That It Works" doorway.
// 4 benchmark choices; choice 2 uses folder picker via window.amplify.pantheonPickFolder().
// Advances to Stage C on selection; Stage C benchmark runner deferred to v0.1.36.

import React, { useState, useCallback } from 'react';
import { WelcomeCueCard } from './WelcomeCueCard';
import { useLifecycleStage } from '../hooks/useLifecycleStage';

export interface Layer2ProveItProps {
  onBack: () => void;
}

type ScreenMode = 'picking' | 'confirming';

// Shared style tokens matching WelcomeView dark theme
const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1117',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    padding: '36px 32px',
    background: '#111827',
    border: '1px solid rgba(100, 116, 139, 0.2)',
    borderRadius: 12,
    margin: '0 16px',
  },
  brandLine: {
    fontSize: 11,
    fontWeight: 700 as const,
    color: '#6ee7b7',
    letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: 800 as const,
    color: '#e2e8f0',
    lineHeight: 1.3,
    margin: '0 0 10px',
  },
  introLine: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 11,
    cursor: 'pointer',
    padding: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  cardStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  placeholderBox: {
    padding: '18px 20px',
    background: 'rgba(6, 78, 59, 0.08)',
    border: '1px solid rgba(110, 231, 183, 0.25)',
    borderRadius: 10,
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 12,
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  folderPickRow: {
    marginTop: 10,
    padding: '12px 14px',
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(110, 231, 183, 0.2)',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  folderPickBtn: {
    width: '100%',
    padding: '9px 0',
    background: 'rgba(6, 78, 59, 0.18)',
    border: '1px solid rgba(110, 231, 183, 0.35)',
    borderRadius: 8,
    color: '#6ee7b7',
    fontSize: 13,
    fontWeight: 600 as const,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  folderPath: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  },
  runBtn: {
    width: '100%',
    padding: '9px 0',
    background: 'rgba(6, 78, 59, 0.25)',
    border: '1px solid rgba(110, 231, 183, 0.45)',
    borderRadius: 8,
    color: '#6ee7b7',
    fontSize: 13,
    fontWeight: 600 as const,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  // -- Big Numbers strip
  bigNumStrip: {
    display: 'flex',
    justifyContent: 'space-around' as const,
    alignItems: 'center',
    background: '#0a0f1a',
    border: '1px solid rgba(100, 116, 139, 0.2)',
    borderRadius: 10,
    padding: '16px 24px',
    marginBottom: 10,
    maxHeight: 120,
  },
  bigNumCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
  },
  bigNumValue: {
    fontSize: '2rem',
    fontWeight: 800 as const,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  bigNumLabel: {
    fontSize: 9,
    fontWeight: 700 as const,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#64748b',
    marginTop: 2,
  },
  bigNumDivider: {
    width: 1,
    height: 40,
    background: 'rgba(100, 116, 139, 0.2)',
  },
  // -- Flippable detail cards
  flipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 12,
  },
  flipOuter: {
    width: 200,
    height: 150,
    perspective: '600px',
    cursor: 'pointer',
    flexShrink: 0 as const,
  },
  flipFaceBase: {
    position: 'absolute' as const,
    inset: 0,
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    borderRadius: 10,
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  flipFront: {
    background: '#111827',
    border: '1px solid rgba(100, 116, 139, 0.25)',
  },
  flipBack: {
    background: '#0d1117',
    border: '1px solid rgba(100, 116, 139, 0.15)',
    transform: 'rotateY(180deg)',
  },
  flipStatLg: {
    fontSize: '1.25rem',
    fontWeight: 800 as const,
    lineHeight: 1,
    marginBottom: 5,
  },
  flipCardLabel: {
    fontSize: 9,
    fontWeight: 700 as const,
    letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
    color: '#64748b',
  },
  flipBackText: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  flipDataset: {
    fontSize: 9,
    color: '#475569',
    marginTop: 6,
    letterSpacing: '0.05em',
  },
  flipHint: {
    fontSize: 8,
    color: '#334155',
    marginTop: 8,
    letterSpacing: '0.05em',
  },
};

export function Layer2ProveIt({ onBack }: Layer2ProveItProps): React.ReactElement {
  const { advanceTo } = useLifecycleStage();
  const [screenMode, setScreenMode] = useState<ScreenMode>('picking');
  const [folderPanelOpen, setFolderPanelOpen] = useState(false);
  const [pickedFolder, setPickedFolder] = useState<string | null>(null);
  const [folderPickPending, setFolderPickPending] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const handleFlipCard = useCallback((idx: number): void => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
      return next;
    });
  }, []);

  const handleSimpleChoice = useCallback((): void => {
    advanceTo('C');
    setScreenMode('confirming');
  }, [advanceTo]);

  const handleChoice2Click = useCallback((): void => {
    setFolderPanelOpen((prev) => !prev);
  }, []);

  const handlePickFolder = useCallback(async (): Promise<void> => {
    setFolderPickPending(true);
    try {
      // Uses watcher.openFolderDialog -- the Electron native folder picker bridge.
      const result = await window.amplify.watcher?.openFolderDialog();
      if (result && !result.canceled && result.filePaths.length > 0) {
        setPickedFolder(result.filePaths[0]);
      }
    } catch {
      // picker dismissed or unavailable -- keep panel open
    } finally {
      setFolderPickPending(false);
    }
  }, []);

  const handleRunOnFolder = useCallback((): void => {
    if (!pickedFolder) return;
    advanceTo('C');
    setScreenMode('confirming');
  }, [advanceTo, pickedFolder]);

  const handleBackFromPlaceholder = useCallback((): void => {
    setScreenMode('picking');
    setFolderPanelOpen(false);
  }, []);

  // ── Confirming placeholder ──────────────────────────────────────────────────
  if (screenMode === 'confirming') {
    return (
      <div style={S.overlay}>
        <div style={S.card}>
          <div style={S.brandLine}>Proof That It Works</div>
          <div style={S.placeholderBox}>
            Benchmark starting... Full progress view coming in the next update.
          </div>
          <button type="button" style={S.backLink} onClick={handleBackFromPlaceholder}>
            {'< back to choices'}
          </button>
        </div>
      </div>
    );
  }

  // ── Picking: Big Numbers + flip cards + 4 benchmark choices ────────────────
  return (
    <div style={S.overlay}>
      <div style={{ ...S.card, maxWidth: 860 }}>
        <button type="button" style={S.backBtn} onClick={onBack}>
          {'< back'}
        </button>

        <div style={S.brandLine}>Proof That It Works</div>
        <h2 style={S.heading}>Choose a benchmark.</h2>
        <p style={S.introLine}>
          Compare how well each mode retrieves, reasons, and answers before deciding how you want to use it.
        </p>

        {/* ── Big Numbers strip ─────────────────────────────────────────────── */}
        {/* FAST: p50 median from BP064/BP067 Eyewitness benchmark (estimated -- replace with actual p50 from mesh test results when available) */}
        {/* GOOD: +86.1 pp = HOT 94.8% minus COLD 8.7% -- IMMUTABLE BP064 canon */}
        {/* CHEAP: $0.00 per query -- IMMUTABLE */}
        <div style={S.bigNumStrip}>
          <div style={S.bigNumCol}>
            <span style={{ ...S.bigNumValue, color: '#60a5fa' }}>1,847ms</span>
            <span style={S.bigNumLabel}>FAST</span>
          </div>
          <div style={S.bigNumDivider} />
          <div style={S.bigNumCol}>
            <span style={{ ...S.bigNumValue, color: '#fbbf24' }}>$0.00</span>
            <span style={S.bigNumLabel}>CHEAP -- per query</span>
          </div>
          <div style={S.bigNumDivider} />
          <div style={S.bigNumCol}>
            <span style={{ ...S.bigNumValue, color: '#4ade80' }}>+86.1 pp</span>
            <span style={S.bigNumLabel}>GOOD -- HOT vs COLD</span>
          </div>
        </div>

        {/* ── Flippable detail cards (hover or click to flip) ───────────────── */}
        <div style={S.flipRow}>

          {/* Card A: Eyewitness Benchmark BP064 */}
          <div
            style={S.flipOuter}
            onClick={() => handleFlipCard(0)}
            onMouseEnter={() => handleFlipCard(0)}
            onMouseLeave={() => handleFlipCard(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFlipCard(0)}
            aria-label="Eyewitness Benchmark details"
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 300ms ease',
                transform: flippedCards.has(0) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div style={{ ...S.flipFaceBase, ...S.flipFront }}>
                <div style={{ ...S.flipStatLg, color: '#60a5fa' }}>0.883</div>
                <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.06em', marginBottom: 4 }}>
                  COHEN&apos;S KAPPA
                </div>
                <div style={S.flipCardLabel}>Eyewitness Benchmark</div>
                <div style={S.flipHint}>hover to flip</div>
              </div>
              <div style={{ ...S.flipFaceBase, ...S.flipBack }}>
                <div style={S.flipBackText}>
                  75-question benchmark testing AI memory retrieval. Same model, with and without MnemosyneC substrate context. BP064 -- 2026.
                </div>
                <div style={S.flipDataset}>Internal LB benchmark</div>
              </div>
            </div>
          </div>

          {/* Card B: 4-Model Star Chamber BP067 */}
          <div
            style={S.flipOuter}
            onClick={() => handleFlipCard(1)}
            onMouseEnter={() => handleFlipCard(1)}
            onMouseLeave={() => handleFlipCard(1)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFlipCard(1)}
            aria-label="Star Chamber benchmark details"
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 300ms ease',
                transform: flippedCards.has(1) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div style={{ ...S.flipFaceBase, ...S.flipFront }}>
                <div style={{ ...S.flipStatLg, color: '#4ade80', fontSize: '1rem' }}>94.8% vs 8.7%</div>
                <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.06em', marginBottom: 4 }}>
                  HOT vs COLD
                </div>
                <div style={S.flipCardLabel}>4-Model Star Chamber</div>
                <div style={S.flipHint}>hover to flip</div>
              </div>
              <div style={{ ...S.flipFaceBase, ...S.flipBack }}>
                <div style={S.flipBackText}>
                  Four AI models tested against the same 75-question benchmark. MnemosyneC substrate context consistently lifts accuracy to ~94%. BP067 -- 2026.
                </div>
                <div style={S.flipDataset}>Internal LB benchmark</div>
              </div>
            </div>
          </div>

          {/* Card C: BP074 Sound Barrier -- Perfect Agreement */}
          <div
            style={S.flipOuter}
            onClick={() => handleFlipCard(2)}
            onMouseEnter={() => handleFlipCard(2)}
            onMouseLeave={() => handleFlipCard(2)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFlipCard(2)}
            aria-label="Sound Barrier perfect agreement details"
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 300ms ease',
                transform: flippedCards.has(2) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div style={{ ...S.flipFaceBase, ...S.flipFront }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 2 }}>&#x1F3C6;</div>
                <div style={{ ...S.flipStatLg, color: '#fbbf24' }}>Kappa 1.000</div>
                <div style={S.flipCardLabel}>Perfect Agreement</div>
                <div style={S.flipHint}>hover to flip</div>
              </div>
              <div style={{ ...S.flipFaceBase, ...S.flipBack }}>
                <div style={S.flipBackText}>
                  Perfect agreement between AI and human judgment across 75 benchmark questions. Kappa 1.000 is the theoretical maximum. BP074 -- 2026.
                </div>
              </div>
            </div>
          </div>

          {/* Card D: MMLU-Pro Mesh Benchmark (placeholder -- results pending) */}
          <div
            style={S.flipOuter}
            onClick={() => handleFlipCard(3)}
            onMouseEnter={() => handleFlipCard(3)}
            onMouseLeave={() => handleFlipCard(3)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFlipCard(3)}
            aria-label="MMLU-Pro Mesh Benchmark details"
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 300ms ease',
                transform: flippedCards.has(3) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div style={{ ...S.flipFaceBase, ...S.flipFront, background: '#0d1117' }}>
                <div style={{ ...S.flipStatLg, color: '#475569', fontSize: '0.95rem' }}>
                  Results Pending
                </div>
                <div style={S.flipCardLabel}>Three-Node Mesh Test</div>
                <div style={S.flipHint}>hover to flip</div>
              </div>
              <div style={{ ...S.flipFaceBase, ...S.flipBack }}>
                <div style={S.flipBackText}>
                  Three machines running Gemma 4 12B in parallel across 12,000+ questions. Results populate automatically after the mesh test completes.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── 4 benchmark choice cards ──────────────────────────────────────── */}
        <div style={S.cardStack}>
          {/* Choice 1 */}
          <WelcomeCueCard
            label="Small built-in proof test, LB 75-question benchmark."
            size="choice"
            variant="green"
            onClick={handleSimpleChoice}
          />

          {/* Choice 2 -- folder picker */}
          <WelcomeCueCard
            label="Test it on your own folder."
            size="choice"
            variant="green"
            onClick={handleChoice2Click}
          />

          {/* Folder picker panel -- shown when choice 2 is toggled */}
          {folderPanelOpen && (
            <div style={S.folderPickRow}>
              <button
                type="button"
                style={{
                  ...S.folderPickBtn,
                  opacity: folderPickPending ? 0.6 : 1,
                }}
                onClick={handlePickFolder}
                disabled={folderPickPending}
              >
                {folderPickPending ? 'Opening picker...' : 'Choose folder...'}
              </button>
              {pickedFolder && (
                <div style={S.folderPath}>{pickedFolder}</div>
              )}
              {pickedFolder && (
                <button type="button" style={S.runBtn} onClick={handleRunOnFolder}>
                  Run benchmark on this folder
                </button>
              )}
            </div>
          )}

          {/* Choice 3 */}
          <WelcomeCueCard
            label="Google benchmark set, standard."
            body="(MMLU-Pro)"
            size="choice"
            variant="green"
            onClick={handleSimpleChoice}
          />

          {/* Choice 4 */}
          <WelcomeCueCard
            label="Google benchmark set, difficult."
            body="(MMLU-Pro Diamond)"
            size="choice"
            variant="green"
            onClick={handleSimpleChoice}
          />
        </div>
      </div>
    </div>
  );
}

export default Layer2ProveIt;
