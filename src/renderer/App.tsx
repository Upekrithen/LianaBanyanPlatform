// AMPLIFY Computer — Renderer Root
// B37 Phase 1 — Transparent overlay with FrameModeIndicator
// B37 Phase 7 — Auth gate, trial banner, member badge

import React, { useState, useEffect } from 'react';
import { FrameModeIndicator } from './components/FrameModeIndicator';
import { AMPLIFYDashboard } from './components/AMPLIFYDashboard';
import { ModelPullDialog } from './components/ModelPullDialog';
import { AuthGate } from './components/AuthGate';
import { TrialBanner } from './components/TrialBanner';
import type { FrameMode } from './components/FrameModeIndicator';
import type { AuthState } from './amplify.d';

type View = 'overlay' | 'dashboard';

function getInitialView(): View {
  return window.location.hash === '#/dashboard' ? 'dashboard' : 'overlay';
}

export default function App() {
  const [mode, setMode] = useState<FrameMode>('normal');
  const [view] = useState<View>(getInitialView);
  const [showDashboard, setShowDashboard] = useState(view === 'dashboard');
  const [showModelPull, setShowModelPull] = useState(false);
  const [authState, setAuthState] = useState<AuthState | null>(null);

  // Sync mode from main process + check first-launch model
  useEffect(() => {
    let cleanupMode: (() => void) | undefined;
    let cleanupAuth: (() => void) | undefined;

    window.amplify.getFrameMode().then(({ mode: m }) => setMode(m));
    cleanupMode = window.amplify.onFrameModeChanged(({ mode: m }) => setMode(m));

    // Phase 7: load auth state
    window.amplify.getAuthState().then(setAuthState);
    cleanupAuth = window.amplify.onAuthStateChanged((state) => {
      setAuthState(state);
      // When trial starts, auth gate closes — re-enable click-through for overlay
      if (state.status === 'trial_active' && view === 'overlay') {
        window.amplify.setClickthrough(true);
      }
    });

    // First-launch: check if default model needs pulling
    window.amplify.getOllamaStatus().then((status) => {
      if (status.running && !status.model) {
        window.amplify.listOllamaModels().then((models) => {
          const defaultInstalled = models.some((m) =>
            m.startsWith('llama3.1:8b'),
          );
          if (!defaultInstalled && view === 'overlay') {
            setShowModelPull(true);
            window.amplify.setClickthrough(false);
          }
        });
      }
    });

    return () => {
      cleanupMode?.();
      cleanupAuth?.();
    };
  }, []);

  // AuthGate needs click-through disabled
  useEffect(() => {
    if (authState?.status === 'unauthenticated' && view === 'overlay') {
      window.amplify.setClickthrough(false);
    }
  }, [authState?.status, view]);

  const handleModeChange = (newMode: FrameMode) => {
    setMode(newMode);
    window.amplify.setFrameMode(newMode);
  };

  const handleCornerClick = () => {
    setShowDashboard(true);
    window.amplify.setClickthrough(false);
  };

  const handleDashboardClose = () => {
    setShowDashboard(false);
    window.amplify.setClickthrough(true);
  };

  const showAuthGate =
    !authState || authState.status === 'unauthenticated' || authState.status === 'validating';

  const showTrialBanner =
    !showAuthGate &&
    (authState?.status === 'trial_active' || authState?.status === 'trial_expired');

  if (view === 'dashboard') {
    return (
      <AMPLIFYDashboard
        currentMode={mode}
        onModeChange={handleModeChange}
        onClose={() => window.close()}
        authState={authState}
      />
    );
  }

  return (
    <>
      {/* Always-present LB Frame border + corner indicator */}
      <FrameModeIndicator
        state={{ mode }}
        onModeChange={showModelPull || showDashboard || showAuthGate ? undefined : handleCornerClick}
        memberBadge={authState?.member?.badge_tier}
        degraded={authState?.degraded ?? false}
      />

      {/* Phase 7: First-launch / auth gate */}
      {showAuthGate && (
        <AuthGate isValidating={authState?.status === 'validating'} />
      )}

      {/* Phase 7: Trial banner (active or expired) */}
      {showTrialBanner && !showAuthGate && (
        <TrialBanner
          status={authState!.status as 'trial_active' | 'trial_expired'}
          daysRemaining={authState?.trial_days_remaining ?? 0}
        />
      )}

      {/* First-launch model download consent */}
      {showModelPull && !showAuthGate && (
        <ModelPullDialog
          onComplete={() => {
            setShowModelPull(false);
            window.amplify.setClickthrough(true);
          }}
          onSkip={() => {
            setShowModelPull(false);
            window.amplify.setClickthrough(true);
          }}
        />
      )}

      {/* In-overlay dashboard (mode switcher + telemetry) */}
      {showDashboard && !showModelPull && !showAuthGate && (
        <AMPLIFYDashboard
          currentMode={mode}
          onModeChange={handleModeChange}
          onClose={handleDashboardClose}
          authState={authState}
        />
      )}
    </>
  );
}
