// QuickstartCard.tsx — M23b Block 3 · Citadel onboarding card
// Shown on Home for new/disconnected peers. Inline styles — CitadelShell pattern.

import React from 'react';
import type { CitadelNavItem } from './chrome/SidebarNav';

export interface QuickstartCardProps {
  ownPeerId?: string;
  relayConnected?: boolean;
  syncedPeerCount?: number;
  onNavigate: (item: CitadelNavItem) => void;
  onConnectCommunity?: () => void;
}

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(110,231,183,0.04)',
  border: '1px solid rgba(110,231,183,0.18)',
  borderRadius: 12,
  padding: '18px 20px',
  marginBottom: 20,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const STEP_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '10px 0',
  borderBottom: '1px solid rgba(100,116,139,0.1)',
};

const STEP_NUM: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: 'rgba(110,231,183,0.15)',
  color: '#6ee7b7',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const BTN_STYLE: React.CSSProperties = {
  marginTop: 6,
  fontSize: 11,
  fontWeight: 600,
  padding: '5px 12px',
  borderRadius: 6,
  border: '1px solid rgba(110,231,183,0.35)',
  background: 'rgba(110,231,183,0.08)',
  color: '#6ee7b7',
  cursor: 'pointer',
};

export function QuickstartCard({
  ownPeerId,
  relayConnected = false,
  syncedPeerCount = 0,
  onNavigate,
  onConnectCommunity,
}: QuickstartCardProps): React.ReactElement {
  const isDisconnected = !relayConnected && syncedPeerCount === 0;

  return (
    <div style={CARD_STYLE} role="region" aria-label="Quick start guide">
      <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7', marginBottom: 4 }}>
        {isDisconnected ? 'Get started in 3 steps' : 'Quick actions'}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>
        {isDisconnected
          ? 'Your peer is offline from the mesh. Follow these steps to join the cooperative substrate.'
          : 'Jump to common tasks from here.'}
        {ownPeerId && (
          <span style={{ display: 'block', marginTop: 4, fontFamily: 'monospace', fontSize: 10, color: '#475569' }}>
            Peer ID: {ownPeerId.slice(0, 12)}…
          </span>
        )}
      </div>

      <div style={STEP_STYLE}>
        <span style={STEP_NUM} aria-hidden>1</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Set up local AI</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Pull and activate your power tier model for local inference.
          </div>
          <button type="button" style={BTN_STYLE} onClick={() => onNavigate('models')}>
            Go to Models →
          </button>
        </div>
      </div>

      <div style={STEP_STYLE}>
        <span style={STEP_NUM} aria-hidden>2</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Join the mesh</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Connect to the WAN relay and discover cooperative peers.
          </div>
          <button
            type="button"
            style={BTN_STYLE}
            onClick={() => {
              if (onConnectCommunity) {
                onConnectCommunity();
              } else {
                void window.amplify?.communityConnectHandshake?.();
              }
            }}
          >
            Connect to mesh →
          </button>
        </div>
      </div>

      <div style={{ ...STEP_STYLE, borderBottom: 'none' }}>
        <span style={STEP_NUM} aria-hidden>3</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Run your first task</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Open Tasks to run the Gauntlet or cooperative plow work.
          </div>
          <button type="button" style={BTN_STYLE} onClick={() => onNavigate('tasks')}>
            Go to Tasks →
          </button>
        </div>
      </div>
    </div>
  );
}
