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
};

export function Layer2ProveIt({ onBack }: Layer2ProveItProps): React.ReactElement {
  const { advanceTo } = useLifecycleStage();
  const [screenMode, setScreenMode] = useState<ScreenMode>('picking');
  const [folderPanelOpen, setFolderPanelOpen] = useState(false);
  const [pickedFolder, setPickedFolder] = useState<string | null>(null);
  const [folderPickPending, setFolderPickPending] = useState(false);

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

  // ── Picking: 4 benchmark choices ────────────────────────────────────────────
  return (
    <div style={S.overlay}>
      <div style={S.card}>
        <button type="button" style={S.backBtn} onClick={onBack}>
          {'< back'}
        </button>

        <div style={S.brandLine}>Proof That It Works</div>
        <h2 style={S.heading}>Choose a benchmark.</h2>
        <p style={S.introLine}>
          Compare how well each mode retrieves, reasons, and answers before deciding how you want to use it.
        </p>

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
