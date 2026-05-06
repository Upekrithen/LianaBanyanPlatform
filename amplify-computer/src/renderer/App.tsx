// AMPLIFY Computer — Renderer Root
// B37 Phase 1 — Transparent overlay with FrameModeIndicator
// Routes between overlay view and dashboard view

import React, { useState, useEffect } from 'react';
import { FrameModeIndicator } from './components/FrameModeIndicator';
import { AMPLIFYDashboard } from './components/AMPLIFYDashboard';
import type { FrameMode } from './components/FrameModeIndicator';

type View = 'overlay' | 'dashboard';

function getInitialView(): View {
  return window.location.hash === '#/dashboard' ? 'dashboard' : 'overlay';
}

export default function App() {
  const [mode, setMode] = useState<FrameMode>('normal');
  const [view] = useState<View>(getInitialView);
  const [showDashboard, setShowDashboard] = useState(view === 'dashboard');

  // Sync mode from main process
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    window.amplify.getFrameMode().then(({ mode: m }) => setMode(m as FrameMode));
    cleanup = window.amplify.onFrameModeChanged(({ mode: m }) => setMode(m as FrameMode));
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
        onModeChange={handleCornerClick}
      />

      {/* In-overlay dashboard (mode switcher + telemetry) */}
      {showDashboard && (
        <AMPLIFYDashboard
          currentMode={mode}
          onModeChange={handleModeChange}
          onClose={handleDashboardClose}
        />
      )}
    </>
  );
}
