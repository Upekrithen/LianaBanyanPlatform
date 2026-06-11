// MnemosyneC · v0.1.51 · BP080 · 2026-06-11
// §2 Truth-Always · §3 Sonnet 4.6 · Founder-ratified DRAFT
//
// LeanShell — 3-tab wrapper for first-time users.
// Feature-flag driven: localStorage 'mnemoUiMode' = 'lean' | 'advanced'
// New users default to 'lean'; existing users (mnemosynec_onboarding_complete) default to 'advanced'.
// Advanced mode passes through to MnemosyneTabView unchanged.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MnemosyneTabView } from './MnemosyneTabView';
import { LeanHomeTab } from './LeanHomeTab';
import { LeanGauntletTab } from './LeanGauntletTab';
import { LeanAskTab } from './LeanAskTab';
import type { FrameMode } from './FrameModeIndicator';
import type { AuthState } from '../amplify.d';

// ─── Types ────────────────────────────────────────────────────────────────────

type LeanTab = 'home' | 'gauntlet' | 'ask';
type UiMode = 'lean' | 'advanced';

const LS_UI_MODE = 'mnemoUiMode';
const LS_ONBOARDING_COMPLETE = 'mnemosynec_onboarding_complete';
const LS_LEAN_SETUP_DONE = 'lean_bg_setup_complete';

export interface LeanShellProps {
  currentMode: FrameMode;
  onModeChange: (mode: FrameMode) => void;
  onClose: () => void;
  authState: AuthState | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveInitialUiMode(): UiMode {
  const stored = localStorage.getItem(LS_UI_MODE) as UiMode | null;
  if (stored === 'lean' || stored === 'advanced') return stored;
  const isExistingUser = !!localStorage.getItem(LS_ONBOARDING_COMPLETE);
  const mode: UiMode = isExistingUser ? 'advanced' : 'lean';
  localStorage.setItem(LS_UI_MODE, mode);
  return mode;
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TABS: Array<{ id: LeanTab; label: string }> = [
  { id: 'home',     label: 'Home' },
  { id: 'gauntlet', label: 'Gauntlet' },
  { id: 'ask',      label: 'Ask' },
];

function TabBar({
  active,
  onSelect,
  onSwitchAdvanced,
}: {
  active: LeanTab;
  onSelect: (t: LeanTab) => void;
  onSwitchAdvanced: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: '#0d1117',
      borderBottom: '1px solid #1e2a38',
      height: 40,
      paddingLeft: 8,
      paddingRight: 8,
      flexShrink: 0,
    }}>
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: isActive ? '#f0fdf4' : '#64748b',
              fontFamily: 'system-ui, sans-serif',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              padding: '0 16px',
              height: '100%',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.15s',
              borderBottom: isActive ? '2px solid #6ee7b7' : '2px solid transparent',
              outline: 'none',
            }}
          >
            {t.label}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button
        onClick={onSwitchAdvanced}
        title="Switch to advanced mode (all tabs)"
        style={{
          background: 'none',
          border: '1px solid #1e2a38',
          borderRadius: 4,
          color: '#475569',
          fontSize: 11,
          padding: '3px 8px',
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          outline: 'none',
        }}
      >
        ⚙ Advanced
      </button>
    </div>
  );
}

// ─── Thin status bar ─────────────────────────────────────────────────────────

function BgStatusBar({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div style={{
      height: 24,
      background: '#0a0f1a',
      borderBottom: '1px solid #1e2a38',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 12,
      opacity: 0.8,
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: 11,
        fontFamily: 'system-ui, sans-serif',
        color: '#6ee7b7',
        letterSpacing: '0.02em',
      }}>
        ◌ {msg}
      </span>
    </div>
  );
}

// ─── LeanShell ────────────────────────────────────────────────────────────────

export function LeanShell({ currentMode, onModeChange, onClose, authState }: LeanShellProps) {
  const [uiMode, setUiMode] = useState<UiMode>(resolveInitialUiMode);
  const [activeTab, setActiveTab] = useState<LeanTab>('home');
  const [bgStatus, setBgStatus] = useState<string | null>(null);
  const setupFiredRef = useRef(false);

  // Sync uiMode with localStorage changes from SettingsTab (advanced mode)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_UI_MODE && (e.newValue === 'lean' || e.newValue === 'advanced')) {
        setUiMode(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Auto-start background setup on first lean launch
  useEffect(() => {
    if (uiMode !== 'lean') return;
    if (setupFiredRef.current) return;
    if (localStorage.getItem(LS_LEAN_SETUP_DONE) === '1') return;
    setupFiredRef.current = true;

    const unsubStatus = window.amplify?.onLeanInstallStatus?.((data) => {
      if (data.step === 'model_ready' || data.step === 'model_complete') {
        setBgStatus(null);
        localStorage.setItem(LS_LEAN_SETUP_DONE, '1');
      } else if (data.step === 'ollama_ready') {
        setBgStatus('AI engine ready. Checking model…');
      } else if (data.step === 'starting_engine') {
        setBgStatus('Starting your AI engine…');
      } else if (data.step === 'pulling_model') {
        setBgStatus('Downloading your AI model… (this takes a few minutes)');
      } else if (data.step === 'waiting_ollama') {
        setBgStatus('Visit ollama.com to install Ollama, then relaunch MnemosyneC.');
      } else {
        setBgStatus(data.message);
      }
    });

    const unsubProgress = window.amplify?.onLeanInstallProgress?.((data) => {
      setBgStatus(`Downloading your AI model… ${data.percentComplete}%`);
    });

    const unsubError = window.amplify?.onLeanInstallError?.((data) => {
      if (!data.retryable) setBgStatus(null);
    });

    // Also listen for lean-bg-status events (future main-process emissions)
    const unsubBg = window.amplify?.onLeanBgStatus?.((payload) => {
      if (payload.type === 'setup-status' && payload.msg === 'ready') {
        setBgStatus(null);
        localStorage.setItem(LS_LEAN_SETUP_DONE, '1');
      } else if (payload.type === 'setup-progress') {
        setBgStatus(payload.msg + (payload.pct != null ? ` ${payload.pct}%` : ''));
      } else if (payload.type === 'mesh-status') {
        // Gauntlet federation panel will handle this
      } else {
        setBgStatus(payload.msg);
      }
    });

    // Fire background install silently
    window.amplify?.leanInstallStart?.().catch(() => {});

    return () => {
      unsubStatus?.();
      unsubProgress?.();
      unsubError?.();
      unsubBg?.();
    };
  }, [uiMode]);

  const switchToAdvanced = useCallback(() => {
    localStorage.setItem(LS_UI_MODE, 'advanced');
    setUiMode('advanced');
  }, []);

  // Pass-through to full MnemosyneTabView for advanced users
  if (uiMode === 'advanced') {
    return (
      <MnemosyneTabView
        currentMode={currentMode}
        onModeChange={onModeChange}
        onClose={onClose}
        authState={authState}
      />
    );
  }

  // ── Lean 3-tab UI ─────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0a0f1a',
      color: '#f0fdf4',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      <BgStatusBar msg={bgStatus} />
      <TabBar
        active={activeTab}
        onSelect={setActiveTab}
        onSwitchAdvanced={switchToAdvanced}
      />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'home' && (
          <LeanHomeTab onSwitchTab={setActiveTab} />
        )}
        {activeTab === 'gauntlet' && (
          <LeanGauntletTab authState={authState} />
        )}
        {activeTab === 'ask' && (
          <LeanAskTab />
        )}
      </div>
    </div>
  );
}
