// CitadelShell.tsx — M23 §2c · Citadel Gate Architecture
// Top-level layout wrapper for the Peer/Power mode navigation system.
// Replaces the raw MnemosyneTabView when the Citadel nav is active.
// §2c: mode state wired from localStorage → top chrome → SidebarNav → content area
// §2d: sidebar collapse state handled in SidebarNav.tsx (localStorage key: mnemosyne_sidebar_collapsed)

import React, { useState, useCallback, useEffect } from 'react';
import { ModeToggle, readCitadelMode, writeCitadelMode } from './ModeToggle';
import { SidebarNav } from './SidebarNav';
import type { UiCitadelMode } from './ModeToggle';
import type { CitadelNavItem } from './SidebarNav';
import type { FrameMode } from '../FrameModeIndicator';
import type { AuthState } from '../../amplify.d';
import { SkuUpgradePanel } from '../SkuUpgradePanel';
import { FrameTab } from '../FrameTab';
import { GauntletTab } from '../GauntletTab';
import { QuickstartCard } from '../QuickstartCard';
import { CitadelAdvancedPanel } from '../CitadelAdvancedPanel';
import { CitadelDiagnostics } from '../CitadelDiagnostics';

interface CitadelShellProps {
  currentMode: FrameMode;
  onModeChange: (mode: FrameMode) => void;
  onClose: () => void;
  authState: AuthState | null;
  appVersion?: string | null;
}

// Home content: mesh status + basic welcome + QuickstartCard for disconnected peers
function HomeContent({
  currentMode,
  onModeChange,
  authState,
  onNavigate,
}: {
  currentMode: FrameMode;
  onModeChange: (mode: FrameMode) => void;
  authState: AuthState | null;
  onNavigate: (item: CitadelNavItem) => void;
}): React.ReactElement {
  const [ownPeerId, setOwnPeerId] = useState('');
  const [relayConnected, setRelayConnected] = useState(false);
  const [syncedPeerCount, setSyncedPeerCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const state = await window.amplify?.getMeshState?.();
        if (cancelled || !state) return;
        setOwnPeerId(state.ownPeerId ?? '');
        setRelayConnected(state.relayConnected ?? false);
        const synced = (state.peers ?? []).filter(
          (p) => (p as { phase?: string }).phase === 'synced',
        ).length;
        setSyncedPeerCount(synced);
      } catch { /* non-fatal */ }
    };
    void refresh();
    const unsub = window.amplify?.onRelayStateChanged?.(() => { void refresh(); });
    return () => { cancelled = true; unsub?.(); };
  }, []);

  const showQuickstart = !relayConnected && syncedPeerCount === 0;

  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto' as const }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
        Home
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>
        The Substrate Cure to AI Amnesia
      </div>
      {showQuickstart && (
        <QuickstartCard
          ownPeerId={ownPeerId}
          relayConnected={relayConnected}
          syncedPeerCount={syncedPeerCount}
          onNavigate={onNavigate}
        />
      )}
      <FrameTab
        currentMode={currentMode}
        onModeChange={onModeChange}
        authState={authState}
        windUnlocked={false}
      />
    </div>
  );
}

// Models content: SkuUpgradePanel (§1a + §2c)
function ModelsContent(): React.ReactElement {
  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto' as const }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#94a3b8',
        letterSpacing: '0.06em', textTransform: 'uppercase' as const,
        marginBottom: 12,
      }}>
        AI Power Tier
      </div>
      <SkuUpgradePanel analytics={undefined} />
    </div>
  );
}

// Tasks content: uses existing GauntletTab
function TasksContent({ authState }: { authState: AuthState | null }): React.ReactElement {
  return (
    <div style={{ height: '100%' }}>
      <GauntletTab authState={authState} />
    </div>
  );
}

// Appearance content: placeholder directing to Settings
function AppearanceContent(): React.ReactElement {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Appearance</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
        Theme, zoom, and display preferences.
      </div>
      <div style={{
        padding: 16, borderRadius: 10,
        background: 'rgba(100,116,139,0.06)',
        border: '1px solid rgba(100,116,139,0.15)',
        fontSize: 12, color: '#475569',
      }}>
        Full appearance settings available in the Settings gear tab.
        Theme and zoom controls will surface here in M23b.
      </div>
    </div>
  );
}

// Advanced content: M23b collapsible panel (Power mode only)
function AdvancedContent(): React.ReactElement {
  return <CitadelAdvancedPanel />;
}

// Diagnostics content: M23b four surfaces + M22 mesh compose-in (Power mode only)
function DiagnosticsContent(): React.ReactElement {
  return <CitadelDiagnostics />;
}

export function CitadelShell({
  currentMode,
  onModeChange,
  onClose,
  authState,
  appVersion,
}: CitadelShellProps): React.ReactElement {
  // §2c: mode state from localStorage, default 'peer'
  const [citadelMode, setCitadelMode] = useState<UiCitadelMode>(readCitadelMode);
  const [activeItem, setActiveItem] = useState<CitadelNavItem>('home');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline'>('offline');

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const state = await window.amplify?.getMeshState?.();
        if (cancelled || !state) return;
        if (state.relayConnected) {
          setConnectionStatus('connected');
        } else {
          const relay = await window.amplify?.citadelGetRelayStatus?.();
          setConnectionStatus(relay?.connectionState === 'reconnecting' ? 'connecting' : 'offline');
        }
      } catch {
        if (!cancelled) setConnectionStatus('offline');
      }
    };
    void refresh();
    const unsubRelay = window.amplify?.onRelayStateChanged?.(() => { void refresh(); });
    return () => { cancelled = true; unsubRelay?.(); };
  }, []);

  const handleModeChange = useCallback((mode: UiCitadelMode) => {
    writeCitadelMode(mode);
    setCitadelMode(mode);
    // Diagnostics only accessible in Power mode (T18)
    if (mode === 'peer' && activeItem === 'diagnostics') {
      setActiveItem('home');
    }
  }, [activeItem]);

  const handleQuit = useCallback(() => {
    window.amplify?.requestAppQuit?.();
  }, []);

  function renderContent(): React.ReactElement {
    switch (activeItem) {
      case 'home':
        return (
          <HomeContent
            currentMode={currentMode}
            onModeChange={onModeChange}
            authState={authState}
            onNavigate={setActiveItem}
          />
        );
      case 'models':
        return <ModelsContent />;
      case 'tasks':
        return <TasksContent authState={authState} />;
      case 'appearance':
        return <AppearanceContent />;
      case 'advanced':
        return <AdvancedContent />;
      case 'diagnostics':
        return <DiagnosticsContent />;
      default:
        return (
          <HomeContent
            currentMode={currentMode}
            onModeChange={onModeChange}
            authState={authState}
            onNavigate={setActiveItem}
          />
        );
    }
  }

  const isPowerMode = citadelMode === 'power';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      background: '#0a0f1a',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Top chrome: brand + ModeToggle + CLOSE/QUIT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        borderBottom: isPowerMode ? 'none' : '1px solid rgba(100,116,139,0.15)',
        flexShrink: 0,
        gap: 8,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="icons/mnemosynec-mark.png"
            alt=""
            aria-hidden
            style={{ height: 28, width: 'auto', objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            {/* R9: MnemosyneC name ONLY in title bar */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6ee7b7', letterSpacing: '-0.2px' }}>
              MnemosyneC
            </div>
            {appVersion && (
              <div style={{ fontSize: 9, color: '#334155' }}>v{appVersion}</div>
            )}
          </div>
        </div>

        {/* Right chrome: ModeToggle + CLOSE + QUIT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* §2a: ModeToggle sits top-right */}
          <ModeToggle mode={citadelMode} onChange={handleModeChange} />

          {/* R3 RESOLVED: CLOSE = close to background (mesh stays alive) */}
          <button
            onClick={onClose}
            title="Close window — app continues running. Mesh participation stays active."
            aria-label="Close window"
            style={{
              background: 'none', border: 'none', color: '#475569',
              cursor: 'pointer', fontSize: 14, padding: '2px 6px', borderRadius: 4,
            }}
          >
            ×
          </button>
          {/* R3 RESOLVED: QUIT = full exit (mesh ends) */}
          <button
            onClick={handleQuit}
            title="Quit — exits the application. Mesh participation ends."
            aria-label="Quit application"
            style={{
              background: 'none',
              border: '1px solid rgba(100,116,139,0.2)',
              color: '#475569', cursor: 'pointer', fontSize: 10,
              padding: '3px 8px', borderRadius: 5, fontWeight: 500,
            }}
          >
            Quit
          </button>
        </div>
      </div>

      {/* Body: sidebar (Power mode) or top bar (Peer mode) + content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* §2b: SidebarNav — sidebar in Power mode, top bar in Peer mode */}
        {isPowerMode ? (
          // Power mode: sidebar on left
          <SidebarNav
            mode={citadelMode}
            activeItem={activeItem}
            onNavigate={setActiveItem}
            appVersion={appVersion ?? null}
            connectionStatus={connectionStatus}
            onClose={onClose}
            onQuit={handleQuit}
          />
        ) : (
          // Peer mode: top bar rendered ABOVE content
          <div style={{ display: 'none' }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column' as const, flex: 1, overflow: 'hidden' }}>
          {/* Peer mode: simplified top bar inside body column */}
          {!isPowerMode && (
            <SidebarNav
              mode={citadelMode}
              activeItem={activeItem}
              onNavigate={setActiveItem}
              appVersion={appVersion ?? null}
              connectionStatus={connectionStatus}
              onClose={onClose}
              onQuit={handleQuit}
            />
          )}

          {/* Content area */}
          <main
            role="main"
            style={{ flex: 1, overflow: 'auto', position: 'relative' as const }}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
