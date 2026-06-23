// CitadelAdvancedPanel.tsx — M23b Block 3 · Power-mode Advanced settings
// Collapsible sections: peer config, relay override, model selection.
// Gated by Power mode via SidebarNav (Advanced nav item).

import React, { useCallback, useEffect, useState } from 'react';
import { SkuUpgradePanel } from './SkuUpgradePanel';

const SECTION_HEADER: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(100,116,139,0.06)',
  border: '1px solid rgba(100,116,139,0.15)',
  borderRadius: 8,
  cursor: 'pointer',
  color: '#e2e8f0',
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'left' as const,
};

const SECTION_BODY: React.CSSProperties = {
  padding: '14px 16px',
  borderLeft: '1px solid rgba(100,116,139,0.12)',
  borderRight: '1px solid rgba(100,116,139,0.12)',
  borderBottom: '1px solid rgba(100,116,139,0.12)',
  borderRadius: '0 0 8px 8px',
  marginTop: -4,
  marginBottom: 10,
  background: 'rgba(15,23,42,0.4)',
};

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps): React.ReactElement {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        type="button"
        style={SECTION_HEADER}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div style={SECTION_BODY}>{children}</div>}
    </div>
  );
}

export function CitadelAdvancedPanel(): React.ReactElement {
  const [ownPeerId, setOwnPeerId] = useState('');
  const [peerCount, setPeerCount] = useState(0);
  const [relayUrl, setRelayUrl] = useState('wss://relay.mnemosynec.ai');
  const [relayState, setRelayState] = useState<string>('disconnected');
  const [connectPeerId, setConnectPeerId] = useState('');
  const [connectStatus, setConnectStatus] = useState<string | null>(null);

  const refreshMesh = useCallback(async () => {
    try {
      const [mesh, relay] = await Promise.all([
        window.amplify?.getMeshState?.(),
        window.amplify?.citadelGetRelayStatus?.(),
      ]);
      if (mesh) {
        setOwnPeerId(mesh.ownPeerId ?? '');
        setPeerCount(mesh.peers?.length ?? 0);
      }
      if (relay?.ok) {
        setRelayUrl(relay.relayUrl);
        setRelayState(relay.connectionState);
      }
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    void refreshMesh();
    const unsubRelay = window.amplify?.onRelayStateChanged?.(() => { void refreshMesh(); });
    return () => { unsubRelay?.(); };
  }, [refreshMesh]);

  const handleConnectPeer = useCallback(async () => {
    const id = connectPeerId.trim();
    if (!id) return;
    setConnectStatus('connecting…');
    try {
      const result = await window.amplify?.federationConnectPeer?.(id);
      setConnectStatus(result?.success ? `connected to ${id.slice(0, 8)}…` : (result?.error ?? 'failed'));
    } catch (err) {
      setConnectStatus(err instanceof Error ? err.message : 'connect failed');
    }
  }, [connectPeerId]);

  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto' as const }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Advanced</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
        Power-user settings — peer configuration, relay endpoint, model selection.
      </div>

      <CollapsibleSection title="Peer configuration" defaultOpen>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10, lineHeight: 1.6 }}>
          Your stable peer ID and mesh roster. Connect to a known peer by ID.
        </div>
        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Own peer ID</div>
        <div style={{
          fontFamily: 'monospace', fontSize: 11, color: '#6ee7b7',
          background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: 6, marginBottom: 12,
          wordBreak: 'break-all' as const,
        }}>
          {ownPeerId || 'loading…'}
        </div>
        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>
          Known peers in roster: <strong style={{ color: '#e2e8f0' }}>{peerCount}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            type="text"
            value={connectPeerId}
            onChange={(e) => setConnectPeerId(e.target.value)}
            placeholder="Peer ID to connect…"
            style={{
              flex: 1, fontSize: 11, padding: '6px 10px', borderRadius: 6,
              border: '1px solid rgba(100,116,139,0.25)', background: '#0a0f1a', color: '#e2e8f0',
            }}
          />
          <button
            type="button"
            onClick={() => { void handleConnectPeer(); }}
            style={{
              fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 6,
              border: '1px solid rgba(110,231,183,0.35)', background: 'rgba(110,231,183,0.1)',
              color: '#6ee7b7', cursor: 'pointer',
            }}
          >
            Connect
          </button>
        </div>
        {connectStatus && (
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>{connectStatus}</div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Relay override">
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10, lineHeight: 1.6 }}>
          WAN relay endpoint for cross-network mesh. Production relay is fixed in this build.
        </div>
        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Relay URL</div>
        <input
          type="text"
          value={relayUrl}
          readOnly
          style={{
            width: '100%', fontSize: 11, fontFamily: 'monospace', padding: '8px 10px',
            borderRadius: 6, border: '1px solid rgba(100,116,139,0.2)',
            background: 'rgba(0,0,0,0.2)', color: '#94a3b8', boxSizing: 'border-box' as const,
          }}
        />
        <div style={{ fontSize: 10, color: '#475569', marginTop: 8 }}>
          State: <span style={{ color: relayState === 'connected' ? '#4ade80' : '#fbbf24' }}>{relayState}</span>
          {' · '}Custom relay override persistence ships in a future release.
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Model selection">
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
          AI power tier and SKU upgrade path. Changes write through existing hardware IPC.
        </div>
        <SkuUpgradePanel analytics={undefined} />
      </CollapsibleSection>
    </div>
  );
}
