// AMPLIFY Dashboard — B37 Phase 3
// Cost telemetry + mode switcher + Settings (force-mode override) + Federation status
// Phase 3 additions: substrate index size, federation panel, force-mode override UI

import React, { useEffect, useState } from 'react';
import type { FrameMode } from './FrameModeIndicator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AMPLIFYSnapshot {
  total_queries: number;
  substrate_hits: number;
  local_ollama_served: number;
  cloud_escalations: number;
  peer_synced: number;
  substrate_hit_ratio: number;
  local_ratio: number;
  cloud_ratio: number;
  total_cloud_cost_avoided_usd: number;
  total_tokens_saved_est: number;
  avg_latency_ms: number;
  index_size: number;
  as_of: string;
}

interface FederationStatus {
  online: boolean;
  peerCount: number;
  lastSyncTs: string | null;
  lastSyncRecordsExchanged: number;
  pendingWriteCount: number;
}

interface FrameModePayload {
  mode: FrameMode;
  forced_mode: FrameMode | null;
}

interface AMPLIFYDashboardProps {
  currentMode: FrameMode;
  onModeChange: (mode: FrameMode) => void;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES: { id: FrameMode; icon: string; label: string; desc: string }[] = [
  { id: 'ai_burst', icon: '🔥', label: 'AI Burst', desc: 'Substrate + Ollama + cloud' },
  { id: 'normal', icon: '🌿', label: 'Normal', desc: 'Substrate-only, no AI cost' },
  { id: 'fallback', icon: '🌑', label: 'Fallback', desc: 'Peer-to-peer, zero cloud' },
];

const FORCE_OPTIONS: { id: FrameMode | 'auto'; label: string }[] = [
  { id: 'auto', label: 'Auto-Detect' },
  { id: 'ai_burst', label: '🔥 AI Burst' },
  { id: 'normal', label: '🌿 Normal' },
  { id: 'fallback', label: '🌑 Fallback' },
];

const emptySnapshot: AMPLIFYSnapshot = {
  total_queries: 0,
  substrate_hits: 0,
  local_ollama_served: 0,
  cloud_escalations: 0,
  peer_synced: 0,
  substrate_hit_ratio: 0,
  local_ratio: 0,
  cloud_ratio: 0,
  total_cloud_cost_avoided_usd: 0,
  total_tokens_saved_est: 0,
  avg_latency_ms: 0,
  index_size: 0,
  as_of: new Date().toISOString(),
};

const emptyFederation: FederationStatus = {
  online: false,
  peerCount: 0,
  lastSyncTs: null,
  lastSyncRecordsExchanged: 0,
  pendingWriteCount: 0,
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'stats' | 'settings' | 'federation';

// ─── Component ────────────────────────────────────────────────────────────────

export const AMPLIFYDashboard: React.FC<AMPLIFYDashboardProps> = ({
  currentMode,
  onModeChange,
  onClose,
}) => {
  const [snapshot, setSnapshot] = useState<AMPLIFYSnapshot>(emptySnapshot);
  const [federation, setFederation] = useState<FederationStatus>(emptyFederation);
  const [forcedMode, setForcedMode] = useState<FrameMode | null>(null);
  const [tab, setTab] = useState<Tab>('stats');
  const [forceApplied, setForceApplied] = useState(false);

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      const [snap, fed, modeInfo] = await Promise.all([
        window.amplify.getAMPLIFYSnapshot(),
        window.amplify.getFederationStatus(),
        window.amplify.getFrameMode(),
      ]);
      setSnapshot(snap as AMPLIFYSnapshot);
      setFederation(fed as FederationStatus);
      setForcedMode((modeInfo as FrameModePayload).forced_mode);
    };

    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Force mode ────────────────────────────────────────────────────────────
  const handleForceMode = async (value: FrameMode | 'auto') => {
    const mode = value === 'auto' ? null : value;
    const result = await window.amplify.forceFrameMode(mode);
    setForcedMode(result.forced_mode);
    if (mode !== null) onModeChange(mode);
    setForceApplied(true);
    setTimeout(() => setForceApplied(false), 1500);
  };

  const formatSyncTime = (ts: string | null) => {
    if (!ts) return 'Never';
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    return d.toLocaleTimeString();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dashboard__panel">

        {/* Header */}
        <div className="dashboard__title">AMPLIFY Computer</div>
        <div className="dashboard__subtitle">
          CAI Hearth — {MODES.find((m) => m.id === currentMode)?.label ?? 'Normal'} Mode
          {forcedMode && (
            <span style={{ color: '#f59e0b', marginLeft: 6, fontSize: 10 }}>(forced)</span>
          )}
        </div>

        {/* Mode switcher (always visible) */}
        <div className="mode-switcher">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`mode-btn ${currentMode === m.id ? `mode-btn--active-${m.id}` : ''}`}
              onClick={() => onModeChange(m.id)}
              title={m.desc}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {(['stats', 'settings', 'federation'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '5px 0',
                background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: tab === t ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                borderRadius: 6,
                color: 'rgba(255,255,255,0.8)',
                fontSize: 11,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t === 'stats' ? '📊 Stats' : t === 'settings' ? '⚙️ Settings' : '🌐 Federation'}
            </button>
          ))}
        </div>

        {/* ── Stats tab ─────────────────────────────────────────────────── */}
        {tab === 'stats' && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-card__label">Cloud Cost Avoided</div>
                <div className="stat-card__value stat-card__value--green">
                  ${snapshot.total_cloud_cost_avoided_usd.toFixed(4)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Total Queries</div>
                <div className="stat-card__value">{snapshot.total_queries}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Substrate Hits</div>
                <div className="stat-card__value stat-card__value--green">
                  {snapshot.substrate_hits}
                  <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>
                    {' '}({(snapshot.substrate_hit_ratio * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Local Ollama</div>
                <div className="stat-card__value stat-card__value--gold">
                  {snapshot.local_ollama_served}
                  <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>
                    {' '}({(snapshot.local_ratio * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Cloud Calls</div>
                <div className="stat-card__value">
                  {snapshot.cloud_escalations}
                  <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>
                    {' '}({(snapshot.cloud_ratio * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Tokens Saved</div>
                <div className="stat-card__value">
                  {snapshot.total_tokens_saved_est.toLocaleString()}
                </div>
              </div>
              {snapshot.peer_synced > 0 && (
                <div className="stat-card">
                  <div className="stat-card__label">Peer Synced</div>
                  <div className="stat-card__value">{snapshot.peer_synced}</div>
                </div>
              )}
              <div className="stat-card">
                <div className="stat-card__label">Substrate Index</div>
                <div className="stat-card__value">
                  {snapshot.index_size.toLocaleString()}{' '}
                  <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>records</span>
                </div>
              </div>
            </div>
            {snapshot.avg_latency_ms > 0 && (
              <div style={{ fontSize: 10, opacity: 0.4, textAlign: 'center', marginBottom: 8 }}>
                avg latency {snapshot.avg_latency_ms}ms
              </div>
            )}
          </>
        )}

        {/* ── Settings tab ──────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
              MODE OVERRIDE
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
              Lock AMPLIFY into a specific mode, bypassing auto-detection.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FORCE_OPTIONS.map((opt) => {
                const isActive =
                  opt.id === 'auto' ? forcedMode === null : forcedMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleForceMode(opt.id)}
                    style={{
                      padding: '8px 12px',
                      background: isActive
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      border: isActive
                        ? '1px solid rgba(255,255,255,0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 13,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <span style={{ fontSize: 10, color: '#16a34a' }}>
                        {forceApplied ? '✓ Applied' : '● Active'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.5,
              }}
            >
              Auto-Detect switches mode based on Ollama availability, network connectivity,
              and peer count. Privacy-conscious users should lock to Fallback.
            </div>
          </div>
        )}

        {/* ── Federation tab ─────────────────────────────────────────────── */}
        {tab === 'federation' && (
          <div style={{ padding: '4px 0' }}>
            {/* Cooperative status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: federation.online ? '#16a34a' : '#6b7280',
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                Cooperative Substrate:{' '}
                <strong>{federation.online ? 'Online' : 'Offline'}</strong>
              </span>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Local Peers', value: federation.peerCount },
                {
                  label: 'Last Sync',
                  value: formatSyncTime(federation.lastSyncTs),
                },
                {
                  label: 'Records Synced',
                  value: federation.lastSyncRecordsExchanged,
                },
                {
                  label: 'Pending Writes',
                  value: federation.pendingWriteCount,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Fallback mode notice */}
            {currentMode === 'fallback' && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(107,114,128,0.15)',
                  borderRadius: 8,
                  border: '1px solid rgba(107,114,128,0.3)',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.5,
                }}
              >
                🌑 Fallback active — peer-to-peer substrate exchange only.
                {federation.peerCount === 0
                  ? ' Scanning local network for peers...'
                  : ` Syncing with ${federation.peerCount} local peer${federation.peerCount !== 1 ? 's' : ''}.`}
              </div>
            )}

            {/* Cooperative substrate info */}
            <div
              style={{
                marginTop: 12,
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.5,
              }}
            >
              The cooperative substrate syncs high-signal records with{' '}
              <strong style={{ color: 'rgba(255,255,255,0.5)' }}>lianabanyan.com</strong>.
              Join the cooperative for $5/year to contribute and benefit from the full network.
            </div>
          </div>
        )}

        {/* Footer tagline */}
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 14,
            letterSpacing: 0.5,
          }}
        >
          NOT AnyWair — It's CAI™ · AMPLIFY your Computer
        </div>

        <button className="close-btn" onClick={onClose}>
          Close Dashboard
        </button>
      </div>
    </div>
  );
};

export default AMPLIFYDashboard;
