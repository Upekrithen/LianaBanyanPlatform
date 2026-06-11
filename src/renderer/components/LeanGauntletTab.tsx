// MnemosyneC · v0.1.51 · BP080 · 2026-06-11
// §2 Truth-Always · §3 Sonnet 4.6 · Founder-ratified DRAFT
//
// LeanGauntletTab — Gauntlet tab for the 3-tab LeanShell.
// Renders a user-initiated federation panel ABOVE the existing GauntletTab.
// Per A1.3: discovery fires ONLY on user click — not automatically on tab open.

import React, { useState, useCallback } from 'react';
import { GauntletTab } from './GauntletTab';
import type { AuthState } from '../amplify.d';

interface LeanGauntletTabProps {
  authState: AuthState | null;
}

// ─── Federation Panel types ───────────────────────────────────────────────────

type ScanState = 'idle' | 'scanning' | 'done';

interface PeerSummary {
  id: string;
  transport: 'lan' | 'wan';
  address?: string;
  phase: string;
}

// ─── Lean Federation Panel ───────────────────────────────────────────────────

function LeanFederationPanel() {
  const [expanded, setExpanded] = useState(true);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [lanPeers, setLanPeers] = useState<PeerSummary[]>([]);
  const [wanPeers, setWanPeers] = useState<PeerSummary[]>([]);
  const [ownId, setOwnId] = useState<string>('');
  const [connectEmail, setConnectEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [connectStatus, setConnectStatus] = useState<string | null>(null);
  const [lanIp, setLanIp] = useState<string>('');

  const handleConnect = useCallback(async () => {
    if (scanState === 'scanning') return;
    setScanState('scanning');
    setLanPeers([]);
    setWanPeers([]);
    setConnectStatus(null);

    try {
      const state = await window.amplify?.getMeshState?.() as {
        peers: Array<{ peerId: string; transport: string; address?: string; phase?: string }>;
        relayConnected: boolean;
        ownPeerId: string;
      } | undefined;

      if (state) {
        setOwnId(state.ownPeerId ?? '');
        const lan: PeerSummary[] = [];
        const wan: PeerSummary[] = [];
        for (const p of (state.peers ?? [])) {
          const entry: PeerSummary = {
            id: p.peerId,
            transport: p.transport === 'wan' ? 'wan' : 'lan',
            address: p.address,
            phase: p.phase ?? 'discovered',
          };
          if (entry.transport === 'lan') lan.push(entry);
          else wan.push(entry);
        }
        setLanPeers(lan);
        setWanPeers(wan);
      }
    } catch {
      // Non-fatal: show no peers
    }

    // Also try to get LAN IP via MoneyPenny URL endpoint
    try {
      const mp = await window.amplify?.getMoneyPennyUrl?.();
      if (mp?.ips?.length) setLanIp(mp.ips[0]);
    } catch { /* non-fatal */ }

    setScanState('done');
  }, [scanState]);

  const handleEmailConnect = useCallback(async () => {
    if (!connectEmail.trim()) return;
    setConnectStatus('Connecting…');
    try {
      const result = await window.amplify?.federationAcceptInvite?.(connectEmail.trim());
      if (result?.success) {
        setConnectStatus(`Connected to ${result.peerName ?? 'peer'} ✓`);
        setShowEmailForm(false);
        setConnectEmail('');
      } else {
        setConnectStatus(result?.error ?? 'Connection failed. Check the Email ID and try again.');
      }
    } catch (e) {
      setConnectStatus('Connection error. Please try again.');
    }
  }, [connectEmail]);

  const shortId = ownId ? ownId.slice(0, 8) : '—';
  const totalPeers = lanPeers.length + wanPeers.length;

  const statusBadge = () => {
    if (scanState === 'idle') return { text: 'NOT SCANNED', color: '#475569', bg: '#47556911' };
    if (scanState === 'scanning') return { text: 'SCANNING', color: '#f59e0b', bg: '#f59e0b11' };
    if (totalPeers > 0) return { text: 'PEERS FOUND', color: '#22c55e', bg: '#22c55e11' };
    return { text: 'NONE FOUND', color: '#64748b', bg: '#64748b11' };
  };

  const badge = statusBadge();

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #1e2a38',
      borderRadius: 8,
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', flex: 1 }}>
          ⬡ Connect to Other Machines
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: 10,
          background: badge.bg,
          color: badge.color,
          marginRight: 8,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
        }}>
          {badge.text}
        </span>
        <span style={{ fontSize: 11, color: '#475569' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #1a2332' }}>
          {/* Machine info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            marginBottom: 10,
            fontSize: 12,
          }}>
            <div style={{ color: '#64748b' }}>
              This machine: <span style={{ color: '#94a3b8' }}>{lanIp || '—'}</span>
            </div>
            <div style={{ color: '#64748b' }}>
              WAN ID: <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{shortId}</span>
            </div>
            <div style={{ color: '#64748b' }}>
              LAN peers:{' '}
              {scanState === 'scanning'
                ? <span style={{ color: '#f59e0b' }}>Scanning…</span>
                : scanState === 'idle'
                  ? <span style={{ color: '#475569' }}>(not yet scanned)</span>
                  : <span style={{ color: '#94a3b8' }}>{lanPeers.length || 'None found nearby'}</span>
              }
            </div>
            <div style={{ color: '#64748b' }}>
              WAN peers:{' '}
              {scanState === 'scanning'
                ? <span style={{ color: '#f59e0b' }}>Looking up…</span>
                : scanState === 'idle'
                  ? <span style={{ color: '#475569' }}>(not yet connected)</span>
                  : <span style={{ color: '#94a3b8' }}>{wanPeers.length || 'None'}</span>
              }
            </div>
          </div>

          {/* Peer list (if found) */}
          {scanState === 'done' && totalPeers > 0 && (
            <div style={{ marginBottom: 10 }}>
              {[...lanPeers, ...wanPeers].map((p) => (
                <div key={p.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                  borderTop: '1px solid #1a2332',
                  fontSize: 11,
                  color: '#94a3b8',
                }}>
                  <span>{p.transport === 'lan' ? '🔵 LAN' : '🌐 WAN'}</span>
                  <span style={{ fontFamily: 'monospace' }}>{p.id.slice(0, 12)}</span>
                  {p.address && <span style={{ color: '#475569' }}>{p.address}</span>}
                  <span style={{
                    fontSize: 10,
                    padding: '1px 5px',
                    borderRadius: 8,
                    background: '#22c55e22',
                    color: '#22c55e',
                  }}>{p.phase}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
            <button
              onClick={handleConnect}
              disabled={scanState === 'scanning'}
              style={{
                background: scanState === 'scanning' ? '#1e2a38' : '#10b981',
                color: scanState === 'scanning' ? '#475569' : '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: scanState === 'scanning' ? 'not-allowed' : 'pointer',
                fontFamily: 'system-ui, sans-serif',
                outline: 'none',
              }}
            >
              {scanState === 'scanning' ? 'Scanning…' : scanState === 'idle' ? 'Connect to other machines ▼' : 'Refresh Scan'}
            </button>

            <button
              onClick={() => setShowEmailForm((v) => !v)}
              style={{
                background: 'none',
                color: '#6ee7b7',
                border: '1px solid #1e4038',
                borderRadius: 5,
                padding: '5px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                outline: 'none',
              }}
            >
              Connect via Email ID
            </button>
          </div>

          {/* Email connect form */}
          {showEmailForm && (
            <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: 11, color: '#64748b', minWidth: 200 }}>
                Enter the MnemosyneC Email ID of the other machine:
              </span>
              <input
                value={connectEmail}
                onChange={(e) => setConnectEmail(e.target.value)}
                placeholder="peer@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleEmailConnect()}
                style={{
                  background: '#111827',
                  border: '1px solid #1e2a38',
                  borderRadius: 4,
                  color: '#f0fdf4',
                  fontSize: 12,
                  padding: '4px 8px',
                  outline: 'none',
                  width: 180,
                }}
              />
              <button
                onClick={handleEmailConnect}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif',
                  outline: 'none',
                }}
              >
                Connect
              </button>
            </div>
          )}

          {connectStatus && (
            <div style={{ marginTop: 6, fontSize: 11, color: connectStatus.includes('✓') ? '#22c55e' : '#94a3b8' }}>
              {connectStatus}
            </div>
          )}

          {/* Distributed mode indicator */}
          {scanState === 'done' && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
              {totalPeers > 0
                ? `Gauntlet running distributed across ${totalPeers + 1} machine${totalPeers > 1 ? 's' : ''}`
                : 'Gauntlet running on this machine'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── LeanGauntletTab ─────────────────────────────────────────────────────────

export function LeanGauntletTab({ authState }: LeanGauntletTabProps) {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '12px 16px',
    }}>
      <LeanFederationPanel />
      <GauntletTab authState={authState} />
    </div>
  );
}
