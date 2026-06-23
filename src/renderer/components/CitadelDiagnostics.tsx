// CitadelDiagnostics.tsx — M23b Block 3 · Power-mode diagnostics (4 surfaces + M22 mesh compose-in)
// Raw logs · process list · config JSON (view-only) · inference override sliders · relay status

import React, { useCallback, useEffect, useState } from 'react';

const PANEL: React.CSSProperties = {
  background: 'rgba(15,23,42,0.5)',
  border: '1px solid rgba(100,116,139,0.15)',
  borderRadius: 10,
  marginBottom: 16,
  overflow: 'hidden',
};

const PANEL_HEAD: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  borderBottom: '1px solid rgba(100,116,139,0.12)',
  background: 'rgba(100,116,139,0.04)',
};

const PRE: React.CSSProperties = {
  margin: 0,
  padding: 12,
  fontSize: 10,
  fontFamily: 'Consolas, monospace',
  color: '#cbd5e1',
  background: '#070d1a',
  maxHeight: 220,
  overflow: 'auto',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
};

type TierRow = {
  tier: string;
  ramGb: number;
  recommendedModel: string;
  displayName: string;
  description: string;
};

export function CitadelDiagnostics(): React.ReactElement {
  const [logPath, setLogPath] = useState('');
  const [logContent, setLogContent] = useState('Loading main process log…');
  const [processes, setProcesses] = useState<Array<{ name: string; status: string; detail?: string; pid?: number }>>([]);
  const [configPath, setConfigPath] = useState('');
  const [configContent, setConfigContent] = useState('{}');
  const [relayUrl, setRelayUrl] = useState('');
  const [relayState, setRelayState] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [hwTier, setHwTier] = useState<{
    tier: TierRow;
    allTiers: TierRow[];
    activeModel: string;
    effectiveModelResult?: {
      tier: string;
      model: string | null;
      overrideActive: boolean;
      autoDetectedModel: string | null;
    };
  } | null>(null);
  const [hwSaving, setHwSaving] = useState(false);

  const refreshLogs = useCallback(async () => {
    const result = await window.amplify?.citadelTailMainLog?.();
    if (result?.ok) {
      setLogPath(result.path);
      setLogContent(result.content || '(empty log)');
    }
  }, []);

  const refreshProcesses = useCallback(async () => {
    const result = await window.amplify?.citadelGetProcessList?.();
    if (result?.ok) {
      setProcesses(result.processes);
    }
  }, []);

  const refreshConfig = useCallback(async () => {
    const result = await window.amplify?.citadelReadConfig?.();
    if (result?.ok) {
      setConfigPath(result.path);
      try {
        setConfigContent(JSON.stringify(JSON.parse(result.content), null, 2));
      } catch {
        setConfigContent(result.content);
      }
    }
  }, []);

  const refreshRelay = useCallback(async () => {
    const result = await window.amplify?.citadelGetRelayStatus?.();
    if (result?.ok) {
      setRelayUrl(result.relayUrl);
      setRelayState(result.connectionState);
      setLastHeartbeat(result.lastHeartbeat);
    }
  }, []);

  const refreshHardware = useCallback(async () => {
    const result = await window.amplify?.hardwareGetTier?.();
    if (result && typeof result === 'object' && 'tier' in result) {
      setHwTier(result as NonNullable<typeof hwTier>);
    }
  }, []);

  useEffect(() => {
    void refreshLogs();
    void refreshProcesses();
    void refreshConfig();
    void refreshRelay();
    void refreshHardware();

    const procInterval = setInterval(() => { void refreshProcesses(); }, 5000);
    const logInterval = setInterval(() => { void refreshLogs(); }, 8000);
    const unsubRelay = window.amplify?.onRelayStateChanged?.(() => { void refreshRelay(); });

    return () => {
      clearInterval(procInterval);
      clearInterval(logInterval);
      unsubRelay?.();
    };
  }, [refreshLogs, refreshProcesses, refreshConfig, refreshRelay, refreshHardware]);

  const relayColor = relayState === 'connected' ? '#4ade80'
    : relayState === 'reconnecting' ? '#fbbf24' : '#64748b';

  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto' as const }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Diagnostics</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
        Raw logs · process list · config JSON · inference overrides · mesh relay status
      </div>

      {/* M22 mesh compose-in: relay status */}
      <div style={PANEL}>
        <div style={PANEL_HEAD}>Mesh relay (M22 compose-in)</div>
        <div style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px 12px', fontSize: 11 }}>
            <span style={{ color: '#64748b' }}>Relay URL</span>
            <span style={{ fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-all' as const }}>{relayUrl || '—'}</span>
            <span style={{ color: '#64748b' }}>Connection</span>
            <span style={{ color: relayColor, fontWeight: 600 }}>{relayState}</span>
            <span style={{ color: '#64748b' }}>Last heartbeat</span>
            <span style={{ color: '#94a3b8' }}>
              {lastHeartbeat ? new Date(lastHeartbeat).toLocaleString() : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Surface 1: Raw logs */}
      <div style={PANEL}>
        <div style={{ ...PANEL_HEAD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Raw logs (last 500 lines)</span>
          <button
            type="button"
            onClick={() => { void refreshLogs(); }}
            style={{ fontSize: 10, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
        {logPath && (
          <div style={{ fontSize: 9, color: '#475569', padding: '4px 14px', fontFamily: 'monospace' }}>{logPath}</div>
        )}
        <pre style={PRE}>{logContent}</pre>
      </div>

      {/* Surface 2: Process list */}
      <div style={PANEL}>
        <div style={PANEL_HEAD}>Process list (refreshes every 5s)</div>
        <div style={{ padding: '8px 14px' }}>
          {processes.length === 0 ? (
            <div style={{ fontSize: 11, color: '#64748b' }}>No processes reported.</div>
          ) : (
            processes.map((p) => (
              <div
                key={`${p.name}-${p.pid ?? p.status}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0', borderBottom: '1px solid rgba(100,116,139,0.08)',
                  fontSize: 11,
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: p.status === 'running' || p.status === 'idle' ? '#4ade80' : '#fbbf24',
                }} />
                <span style={{ color: '#e2e8f0', fontWeight: 600, minWidth: 100 }}>{p.name}</span>
                <span style={{ color: '#94a3b8' }}>{p.status}</span>
                {p.pid != null && <span style={{ color: '#64748b' }}>PID {p.pid}</span>}
                {p.detail && <span style={{ color: '#64748b', marginLeft: 'auto' }}>{p.detail}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Surface 3: Config JSON (view-only) */}
      <div style={PANEL}>
        <div style={PANEL_HEAD}>Config JSON (view-only)</div>
        {configPath && (
          <div style={{ fontSize: 9, color: '#475569', padding: '4px 14px', fontFamily: 'monospace' }}>{configPath}</div>
        )}
        <pre style={{ ...PRE, maxHeight: 160 }}>{configContent}</pre>
      </div>

      {/* Surface 4: Inference override sliders */}
      <div style={PANEL}>
        <div style={PANEL_HEAD}>Inference override</div>
        <div style={{ padding: 14 }}>
          {!hwTier ? (
            <div style={{ fontSize: 11, color: '#64748b' }}>Detecting hardware tier…</div>
          ) : (
            <>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
                {hwTier.effectiveModelResult?.overrideActive
                  ? <>Override active · <strong style={{ color: '#fbbf24' }}>{hwTier.effectiveModelResult.model}</strong> · auto: {hwTier.effectiveModelResult.autoDetectedModel}</>
                  : <>Auto-detected · {hwTier.tier.displayName} · {hwTier.tier.ramGb} GB RAM</>}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' as const }}>
                RAM tier override
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {hwTier.allTiers.map((t) => {
                  const isActive = hwTier.activeModel === t.recommendedModel;
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      disabled={hwSaving}
                      onClick={async () => {
                        setHwSaving(true);
                        try {
                          await window.amplify?.hardwareSetModel?.(t.recommendedModel, t.tier);
                          await refreshHardware();
                        } finally {
                          setHwSaving(false);
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: isActive ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? 'rgba(167,139,250,0.35)' : 'rgba(100,116,139,0.15)'}`,
                        borderRadius: 7, padding: '8px 12px',
                        cursor: hwSaving ? 'not-allowed' : 'pointer', textAlign: 'left' as const, width: '100%',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: isActive ? '#a78bfa' : '#e2e8f0' }}>
                          {t.displayName}
                          {isActive && (
                            <span style={{ marginLeft: 6, fontSize: 9, color: '#a78bfa' }}>ACTIVE</span>
                          )}
                        </div>
                        <div style={{ fontSize: 9, color: '#64748b' }}>{t.recommendedModel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={hwSaving}
                onClick={async () => {
                  setHwSaving(true);
                  try {
                    await window.amplify?.hardwareResetModel?.();
                    await refreshHardware();
                  } finally {
                    setHwSaving(false);
                  }
                }}
                style={{
                  marginTop: 10, fontSize: 10, color: '#64748b',
                  background: 'none', border: '1px solid rgba(100,116,139,0.2)',
                  borderRadius: 5, padding: '4px 10px', cursor: hwSaving ? 'not-allowed' : 'pointer',
                }}
              >
                Reset to auto-detected
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
