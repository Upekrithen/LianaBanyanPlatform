// ModeToggle.tsx — M23 §2a · Citadel Gate Architecture
// Peer/Power mode pill toggle (R1: "Peer / Power" vocabulary locked)
// Sits in top-right chrome. Low-key styling — not a primary CTA.
// localStorage key: 'mnemosyne_ui_mode' (value: 'peer' | 'power')
// Default on first launch: 'peer'

import React, { useCallback } from 'react';

export type UiCitadelMode = 'peer' | 'power';

export const LS_CITADEL_MODE = 'mnemosyne_ui_mode';
export const CITADEL_MODE_DEFAULT: UiCitadelMode = 'peer';

export function readCitadelMode(): UiCitadelMode {
  const stored = localStorage.getItem(LS_CITADEL_MODE);
  if (stored === 'peer' || stored === 'power') return stored;
  return CITADEL_MODE_DEFAULT;
}

export function writeCitadelMode(mode: UiCitadelMode): void {
  localStorage.setItem(LS_CITADEL_MODE, mode);
}

interface ModeToggleProps {
  mode: UiCitadelMode;
  onChange: (mode: UiCitadelMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps): React.ReactElement {
  const toggle = useCallback(() => {
    onChange(mode === 'peer' ? 'power' : 'peer');
  }, [mode, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }, [toggle]);

  return (
    <div
      role="switch"
      aria-checked={mode === 'power'}
      aria-label={`UI mode: ${mode}. Press Space to switch.`}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      title={
        mode === 'peer'
          ? 'Peer mode — simplified navigation. Click to switch to Power mode.'
          : 'Power mode — full sidebar navigation. Click to switch to Peer mode.'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        borderRadius: 12,
        border: '1px solid rgba(100,116,139,0.3)',
        background: 'rgba(15,23,42,0.8)',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.05em',
        overflow: 'hidden',
        flexShrink: 0,
        outline: 'none',
      }}
    >
      <span
        style={{
          padding: '3px 10px',
          borderRadius: '10px 0 0 10px',
          background: mode === 'peer' ? 'rgba(110,231,183,0.15)' : 'transparent',
          color: mode === 'peer' ? '#6ee7b7' : '#475569',
          transition: 'all 0.15s ease',
        }}
      >
        peer
      </span>
      <span
        style={{
          padding: '3px 10px',
          borderRadius: '0 10px 10px 0',
          background: mode === 'power' ? 'rgba(110,231,183,0.15)' : 'transparent',
          color: mode === 'power' ? '#6ee7b7' : '#475569',
          transition: 'all 0.15s ease',
        }}
      >
        power
      </span>
    </div>
  );
}
