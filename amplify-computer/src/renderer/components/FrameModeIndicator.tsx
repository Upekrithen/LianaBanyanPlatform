// FrameModeIndicator — B37 Phase 1
// Shows current AI/substrate/fallback mode as a corner indicator + colored border
// Per FRAME_MODE_INDICATOR_DESIGN_SPEC_BP025.md

import React from 'react';

export type FrameMode = 'ai_burst' | 'normal' | 'fallback';

interface FrameModeState {
  mode: FrameMode;
  costRatePerHour?: number;
  estimatedSavings?: number;
  queuedUpgradeAt?: Date;
}

interface FrameModeIndicatorProps {
  state: FrameModeState;
  onModeChange?: (mode: FrameMode) => void;
  showCostControls?: boolean;
}

const MODE_META: Record<FrameMode, { icon: string; label: string; tooltip: string }> = {
  ai_burst: {
    icon: '🔥',
    label: 'AI Burst',
    tooltip: 'Full AI synthesis active — substrate + Ollama + cloud',
  },
  normal: {
    icon: '🌿',
    label: 'Normal',
    tooltip: 'Substrate index active — fast retrieval, no AI cost',
  },
  fallback: {
    icon: '🌑',
    label: 'Fallback',
    tooltip: 'Peer-to-peer mode — fully decentralized, zero AI dependency',
  },
};

export const FrameModeIndicator: React.FC<FrameModeIndicatorProps> = ({
  state,
  onModeChange,
}) => {
  const meta = MODE_META[state.mode];

  const handleClick = () => {
    // Click cycles through modes; could open modal in future
    if (onModeChange) {
      const next: Record<FrameMode, FrameMode> = {
        ai_burst: 'normal',
        normal: 'fallback',
        fallback: 'ai_burst',
      };
      onModeChange(next[state.mode]);
    }
  };

  return (
    <>
      {/* LB Frame border overlay — full-screen */}
      <div
        className={`lb-frame lb-frame--${state.mode}`}
        aria-hidden="true"
      />

      {/* Corner mode indicator — bottom-right */}
      <div
        className={`lb-corner-indicator lb-corner-indicator--${state.mode}`}
        title={meta.tooltip}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={`Current mode: ${meta.label}. Click to cycle.`}
      >
        <span className="lb-corner-indicator__icon">{meta.icon}</span>
        <span className="lb-corner-indicator__label">{meta.label}</span>
        {state.mode === 'ai_burst' && state.costRatePerHour !== undefined && (
          <span
            className="lb-corner-indicator__label"
            style={{ opacity: 0.7, marginLeft: 2 }}
          >
            ${state.costRatePerHour.toFixed(2)}/hr
          </span>
        )}
      </div>
    </>
  );
};

export default FrameModeIndicator;
