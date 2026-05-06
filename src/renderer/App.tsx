// AMPLIFY Computer — Renderer Root
// B37 Phase 1 — Transparent overlay with FrameModeIndicator
// Routes between overlay view and dashboard view

import React, { useState, useEffect } from 'react';
import { FrameModeIndicator } from './components/FrameModeIndicator';
import { AMPLIFYDashboard } from './components/AMPLIFYDashboard';
import { ModelPullDialog } from './components/ModelPullDialog';
import type { FrameMode } from './components/FrameModeIndicator';

type View = 'overlay' | 'dashboard';

function getInitialView(): View {
  return window.location.hash === '#/dashboard' ? 'dashboard' : 'overlay';
}

export default function App() {
  const [mode, setMode] = useState<FrameMode>('normal');
  const [view] = useState<View>(getInitialView);
  const [showDashboard, setShowDashboard] = useState(view === 'dashboard');
  const [showModelPull, setShowModelPull] = useState(false);

  // Sync mode from main process + check first-launch model
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    window.amplify.getFrameMode().then(({ mode: m }) => setMode(m as FrameMode));
    cleanup = window.amplify.onFrameModeChanged(({ mode: m }) => setMode(m as FrameMode));

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

    return () => cleanup?.();
  }, []);

  const handleModeChange = (newMode: FrameMode) => {
    setMode(newMode);
    window.amplify.setFrameMode(newMode);
  };

  const handleCornerClick = () => {
    setShowDashboard(true);
    // Disable click-through so dashboard is interactive
    window.amplify.setClickthrough(false);
  };

  const handleDashboardClose = () => {
    setShowDashboard(false);
    // Re-enable click-through for overlay
    window.amplify.setClickthrough(true);
  };

  if (view === 'dashboard') {
    return (
      <AMPLIFYDashboard
        currentMode={mode}
        onModeChange={handleModeChange}
        onClose={() => window.close()}
      />
    );
  }

  return (
    <>
      {/* Always-present LB Frame border + corner indicator */}
      <FrameModeIndicator
        state={{ mode }}
        onModeChange={showModelPull || showDashboard ? undefined : handleCornerClick}
      />

      {/* First-launch model download consent */}
      {showModelPull && (
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
      {showDashboard && !showModelPull && (
        <AMPLIFYDashboard
          currentMode={mode}
          onModeChange={handleModeChange}
          onClose={handleDashboardClose}
        />
      )}
    </>
  );
}
