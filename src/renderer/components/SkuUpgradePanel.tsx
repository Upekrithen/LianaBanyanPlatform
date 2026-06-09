// SkuUpgradePanel.tsx -- BP078 Scope 6.5
// In-app SKU upgrade panel. Settings surface (NOT fullscreen overlay).
// Shows NANO / CORE / LITE / FULL tiers; "Upgrade to FULL" pulls gemma4:12b via IPC.

import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { SkuPullProgress } from '../amplify.d';

// ── Types ───────────────────────────────────────────────────────────────────

type SkuTierId = 'nano' | 'core' | 'lite' | 'full';

type UpgradePhase =
  | 'checking'   // loading tier + model existence
  | 'ready'      // waiting for user action
  | 'upgrading'  // pull in progress
  | 'complete'   // pull done, FULL activated
  | 'error';     // pull failed

export interface SkuUpgradePanelProps {
  analytics?: {
    track: (event: string, payload?: Record<string, unknown>) => void;
  };
  onUpgradeComplete?: () => void;
}

// ── Tier definitions ─────────────────────────────────────────────────────────

interface SkuTierDef {
  id: SkuTierId;
  name: string;
  tagline: string;
  model: string;
  modelSize: string;
  features: string[];
  downloadSize: string | null;
  comingSoon?: boolean;
}

const SKU_TIERS: SkuTierDef[] = [
  {
    id: 'nano',
    name: 'NANO',
    tagline: 'Private AI, zero cloud.',
    model: 'qwen2.5:0.5b',
    modelSize: '~500 MB bundled',
    features: ['Private local AI', 'Floor model included', 'Basic substrate search'],
    downloadSize: null,
  },
  {
    id: 'core',
    name: 'CORE',
    tagline: 'Enhanced local intelligence.',
    model: '',
    modelSize: '',
    features: [],
    downloadSize: null,
    comingSoon: true,
  },
  {
    id: 'lite',
    name: 'LITE',
    tagline: 'Balanced power and speed.',
    model: '',
    modelSize: '',
    features: [],
    downloadSize: null,
    comingSoon: true,
  },
  {
    id: 'full',
    name: 'FULL',
    tagline: 'Flagship AI, private and local.',
    model: 'gemma4:12b',
    modelSize: '~7 GB download',
    features: ['Gemma 4 12B model', 'Mnem-DRT enabled', 'All 10 specialists', 'Full substrate depth'],
    downloadSize: '~7 GB',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const SPIN_KEYFRAMES = `@keyframes sup-spin { to { transform: rotate(360deg); } }`;

function bytesToGB(bytes: number): string {
  return (bytes / 1_073_741_824).toFixed(1);
}

function progressFraction(downloaded: number, total: number): number {
  if (total <= 0 || downloaded <= 0) return 0;
  return Math.min(downloaded / total, 1);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CheckIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="rgba(74,222,128,0.15)" stroke="#4ade80" strokeWidth="1.5" />
      <path d="M9 16.5l5 5 9-9" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const S = {
  panel: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#0d1117',
    borderRadius: 12,
    padding: '28px 24px',
    maxWidth: 560,
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6ee7b7',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    marginBottom: 20,
  } as React.CSSProperties,

  tiersGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 20,
  } as React.CSSProperties,

  tierCard: (active: boolean, dimmed: boolean): React.CSSProperties => ({
    background: active ? 'rgba(110,231,183,0.06)' : '#111827',
    border: active
      ? '1px solid rgba(110,231,183,0.4)'
      : '1px solid rgba(100,116,139,0.2)',
    borderRadius: 10,
    padding: '14px 14px 12px',
    opacity: dimmed ? 0.45 : 1,
    transition: 'opacity 0.2s',
  }),

  tierName: {
    fontSize: 13,
    fontWeight: 800,
    color: '#e2e8f0',
    letterSpacing: '0.06em',
    marginBottom: 2,
  } as React.CSSProperties,

  tierTagline: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: 8,
  } as React.CSSProperties,

  tierFeature: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.7,
    display: 'flex',
    gap: 5,
    alignItems: 'flex-start',
  } as React.CSSProperties,

  activeBadge: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 700,
    color: '#4ade80',
    background: 'rgba(74,222,128,0.12)',
    border: '1px solid rgba(74,222,128,0.3)',
    borderRadius: 4,
    padding: '2px 7px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  } as React.CSSProperties,

  comingSoonBadge: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 600,
    color: '#475569',
    background: 'rgba(71,85,105,0.15)',
    border: '1px solid rgba(71,85,105,0.25)',
    borderRadius: 4,
    padding: '2px 7px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  } as React.CSSProperties,

  modelSizeLabel: {
    fontSize: 10,
    color: '#334155',
    marginTop: 6,
  } as React.CSSProperties,

  upgradeBtn: {
    marginTop: 10,
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(110,231,183,0.13)',
    border: '1px solid rgba(110,231,183,0.4)',
    borderRadius: 7,
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  activateBtn: {
    marginTop: 10,
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(99,102,241,0.13)',
    border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: 7,
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  progressTrack: {
    height: 5,
    background: 'rgba(110,231,183,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  } as React.CSSProperties,

  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  } as React.CSSProperties,

  spinnerStyle: {
    width: 14,
    height: 14,
    border: '2px solid rgba(110,231,183,0.2)',
    borderTopColor: '#6ee7b7',
    borderRadius: '50%',
    animation: 'sup-spin 0.8s linear infinite',
    display: 'inline-block',
    flexShrink: 0,
  } as React.CSSProperties,

  cancelBtn: {
    marginTop: 8,
    width: '100%',
    padding: '7px 12px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.22)',
    borderRadius: 7,
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  ghostBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center' as const,
    background: 'none',
    border: 'none',
    color: '#334155',
    fontSize: 11,
    cursor: 'pointer',
    padding: '6px 0 0',
  } as React.CSSProperties,

  retryBtn: {
    marginTop: 8,
    width: '100%',
    padding: '7px 12px',
    background: 'rgba(110,231,183,0.1)',
    border: '1px solid rgba(110,231,183,0.3)',
    borderRadius: 7,
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  errorBox: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.22)',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
    fontSize: 12,
    color: '#fca5a5',
    lineHeight: 1.6,
  } as React.CSSProperties,

  successBox: {
    background: 'rgba(74,222,128,0.07)',
    border: '1px solid rgba(74,222,128,0.25)',
    borderRadius: 8,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  } as React.CSSProperties,
};

// ── Component ────────────────────────────────────────────────────────────────

export function SkuUpgradePanel({
  analytics,
  onUpgradeComplete,
}: SkuUpgradePanelProps): React.ReactElement {
  const [phase, setPhase] = useState<UpgradePhase>('checking');
  const [currentTier, setCurrentTier] = useState<SkuTierId>('nano');
  const [modelExists, setModelExists] = useState(false);
  const [progress, setProgress] = useState<SkuPullProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const upgradeActiveRef = useRef(false);
  // Holds cleanup callbacks for IPC listeners registered during upgrade
  const listenerCleanupRef = useRef<(() => void) | null>(null);

  // ── On mount: load tier + model state ─────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    void (async (): Promise<void> => {
      try {
        const [tierResult, modelResult] = await Promise.all([
          window.amplify.sku?.currentTier() ?? Promise.resolve({ tier: 'nano' as const }),
          window.amplify.sku?.checkModel('gemma4:12b') ?? Promise.resolve({ exists: false, modelName: 'gemma4:12b' }),
        ]);
        if (cancelled) return;
        setCurrentTier(tierResult.tier);
        setModelExists(modelResult.exists);
        setPhase('ready');
      } catch {
        if (cancelled) return;
        setPhase('ready');
      }
    })();

    return (): void => {
      cancelled = true;
    };
  }, []);

  // ── Cleanup listeners on unmount ──────────────────────────────────────────

  useEffect(() => {
    return (): void => {
      listenerCleanupRef.current?.();
    };
  }, []);

  // ── Start upgrade ─────────────────────────────────────────────────────────

  const startUpgrade = useCallback((): void => {
    if (upgradeActiveRef.current) return;
    upgradeActiveRef.current = true;

    setPhase('upgrading');
    setProgress(null);
    setErrorMsg(null);

    // Clean up any previous listeners
    listenerCleanupRef.current?.();

    const unsubProgress = window.amplify.sku?.onPullProgress((data: SkuPullProgress): void => {
      setProgress(data);
    }) ?? ((): void => {});

    const unsubComplete = window.amplify.sku?.onPullComplete((): void => {
      upgradeActiveRef.current = false;
      setCurrentTier('full');
      setPhase('complete');
      analytics?.track('feather_earned', { color: 'black', reason: 'full_sku_upgrade_completed' });
      // Durably record the black crow feather in Supabase crow_feathers table.
      void (async (): Promise<void> => {
        try {
          const session = await window.amplify.lbGetSession?.();
          const userId = session?.user_id ?? '';
          await window.amplify.earnBlackCrowFeather?.({ userId, reason: 'full_sku_upgrade_completed' });
        } catch {
          // Non-fatal: analytics track already fired; feather record failure is logged in main process.
        }
      })();
      onUpgradeComplete?.();
    }) ?? ((): void => {});

    const unsubError = window.amplify.sku?.onPullError((err: string): void => {
      upgradeActiveRef.current = false;
      setErrorMsg(err || 'Upgrade failed. Check your connection and try again.');
      setPhase('error');
    }) ?? ((): void => {});

    listenerCleanupRef.current = (): void => {
      unsubProgress();
      unsubComplete();
      unsubError();
    };

    // Extension point: replace sku.upgradeTo() with sku.upgradeFromPeer(peerId)
    // when mesh weight-share is implemented. Same progress/complete/error contract.
    void window.amplify.sku?.upgradeTo('full').catch((err: unknown): void => {
      upgradeActiveRef.current = false;
      setErrorMsg(err instanceof Error ? err.message : 'Could not start upgrade.');
      setPhase('error');
    });
  }, [analytics, onUpgradeComplete]);

  // ── Cancel upgrade ────────────────────────────────────────────────────────

  const handleCancel = useCallback((): void => {
    upgradeActiveRef.current = false;
    listenerCleanupRef.current?.();
    listenerCleanupRef.current = null;
    void window.amplify.sku?.cancelUpgrade().catch((): void => {});
    setPhase('ready');
    setProgress(null);
    setErrorMsg(null);
  }, []);

  // ── Retry ─────────────────────────────────────────────────────────────────

  const handleRetry = useCallback((): void => {
    upgradeActiveRef.current = false;
    startUpgrade();
  }, [startUpgrade]);

  // ── Progress values ───────────────────────────────────────────────────────

  const fraction = progress ? progressFraction(progress.downloaded, progress.total) : 0;
  const pct = Math.round(fraction * 100);
  const unknownTotal = !progress || progress.total <= 0;
  const downloadedLabel = progress && progress.downloaded > 0
    ? `${bytesToGB(progress.downloaded)} GB`
    : '0.0 GB';
  const totalLabel = unknownTotal ? '...' : `${bytesToGB(progress?.total ?? 0)} GB`;

  // ── Render ────────────────────────────────────────────────────────────────

  const isUpgrading = phase === 'upgrading';

  return (
    <>
      <style>{SPIN_KEYFRAMES}</style>
      <div style={S.panel}>

        {/* Header */}
        <div style={S.sectionLabel}>AI Tier</div>

        {/* Tier cards */}
        <div style={S.tiersGrid}>
          {SKU_TIERS.map((tier) => {
            const isActive = currentTier === tier.id;
            const isDimmed = isUpgrading && tier.id !== 'full';

            if (tier.comingSoon) {
              return (
                <div key={tier.id} style={S.tierCard(false, isDimmed)}>
                  <div style={S.comingSoonBadge}>Coming soon</div>
                  <div style={S.tierName}>{tier.name}</div>
                  <div style={S.tierTagline}>{tier.tagline}</div>
                </div>
              );
            }

            if (tier.id === 'nano') {
              return (
                <div key={tier.id} style={S.tierCard(isActive, isDimmed)}>
                  {isActive && <div style={S.activeBadge}>Active</div>}
                  <div style={S.tierName}>{tier.name}</div>
                  <div style={S.tierTagline}>{tier.tagline}</div>
                  <div>
                    {tier.features.map((f) => (
                      <div key={f} style={S.tierFeature}>
                        <span style={{ color: '#475569', flexShrink: 0 }}>+</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S.modelSizeLabel}>{tier.modelSize}</div>
                </div>
              );
            }

            // FULL tier card
            const fullIsActive = currentTier === 'full';
            return (
              <div key={tier.id} style={S.tierCard(fullIsActive, false)}>
                {fullIsActive && <div style={S.activeBadge}>Active</div>}
                <div style={S.tierName}>{tier.name}</div>
                <div style={S.tierTagline}>{tier.tagline}</div>
                <div>
                  {tier.features.map((f) => (
                    <div key={f} style={S.tierFeature}>
                      <span style={{ color: '#4ade80', flexShrink: 0 }}>+</span>
                      <span style={{ color: '#94a3b8' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={S.modelSizeLabel}>{tier.modelSize}</div>

                {/* Upgrade / Activate button -- only if not already FULL and not mid-upgrade */}
                {!fullIsActive && phase === 'ready' && (
                  modelExists ? (
                    <button
                      type="button"
                      style={S.activateBtn}
                      onClick={startUpgrade}
                    >
                      gemma4:12b detected -- activate FULL
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={S.upgradeBtn}
                      onClick={startUpgrade}
                    >
                      Upgrade to FULL -- ~7 GB download
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* Upgrading progress panel */}
        {phase === 'upgrading' && (
          <div style={{
            background: '#111827',
            border: '1px solid rgba(100,116,139,0.2)',
            borderRadius: 10,
            padding: '16px 14px 12px',
          }}>
            {/* Model-exists fast path: skip download bar, show activation copy */}
            {modelExists && (progress === null || progress.total === 0) ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}>
                <span style={S.spinnerStyle} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                  Using your existing gemma4:12b
                </span>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}>
                  <span style={S.spinnerStyle} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                    Downloading gemma4:12b
                  </span>
                </div>

                {/* Progress bar */}
                <div style={S.progressTrack}>
                  <div style={{
                    height: '100%',
                    width: unknownTotal ? '0%' : `${pct}%`,
                    background: '#6ee7b7',
                    borderRadius: 3,
                    transition: 'width 0.4s ease',
                  }} />
                </div>

                {/* GB + percent */}
                <div style={S.progressRow}>
                  <span>{downloadedLabel} / {unknownTotal ? '?' : totalLabel}</span>
                  <span>{unknownTotal ? '...' : `${pct}%`}</span>
                </div>

                {/* Speed */}
                {progress?.speed && (
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 3 }}>
                    {progress.speed}
                  </div>
                )}

                {/* Raw ollama status */}
                {progress?.status && (
                  <div style={{ fontSize: 10, color: '#334155', marginBottom: 8, lineHeight: 1.5 }}>
                    {progress.status}
                  </div>
                )}
              </>
            )}

            <button type="button" style={S.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" style={S.ghostBtn} onClick={handleCancel}>
              Continue using NANO meanwhile
            </button>
          </div>
        )}

        {/* Complete */}
        {phase === 'complete' && (
          <div style={S.successBox}>
            <CheckIcon />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 3 }}>
                FULL activated.
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Gemma 4 12B is now your AI.
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div>
            <div style={S.errorBox}>
              {errorMsg ?? 'Upgrade failed. Check your connection and try again.'}
            </div>
            <button type="button" style={S.retryBtn} onClick={handleRetry}>
              Retry
            </button>
            <button type="button" style={S.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}

        {/* Checking state */}
        {phase === 'checking' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#475569',
            padding: '4px 0',
          }}>
            <span style={S.spinnerStyle} />
            <span>Loading tier info...</span>
          </div>
        )}

      </div>
    </>
  );
}

export default SkuUpgradePanel;
