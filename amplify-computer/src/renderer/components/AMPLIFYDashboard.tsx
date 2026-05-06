// AMPLIFY Dashboard — B37 Phase 4 scaffold (visible from tray)
// Shows cost telemetry, routing distribution, mode switcher
// B37 Phase 1: structure + wiring; Phase 4: full real-time data

import React, { useEffect, useState } from 'react';
import type { FrameMode } from './FrameModeIndicator';

interface AMPLIFYSnapshot {
  total_queries: number;
  substrate_hits: number;
  local_ollama_served: number;
  cloud_escalations: number;
  substrate_hit_ratio: number;
  local_ratio: number;
  cloud_ratio: number;
  total_cloud_cost_avoided_usd: number;
  total_tokens_saved_est: number;
  as_of: string;
}

interface AMPLIFYDashboardProps {
  currentMode: FrameMode;
  onModeChange: (mode: FrameMode) => void;
  onClose: () => void;
}

const emptySnapshot: AMPLIFYSnapshot = {
  total_queries: 0,
  substrate_hits: 0,
  local_ollama_served: 0,
  cloud_escalations: 0,
  substrate_hit_ratio: 0,
  local_ratio: 0,
  cloud_ratio: 0,
  total_cloud_cost_avoided_usd: 0,
  total_tokens_saved_est: 0,
  as_of: new Date().toISOString(),
};

export const AMPLIFYDashboard: React.FC<AMPLIFYDashboardProps> = ({
  currentMode,
  onModeChange,
  onClose,
}) => {
  const [snapshot, setSnapshot] = useState<AMPLIFYSnapshot>(emptySnapshot);

  useEffect(() => {
    const load = async () => {
      const data = await window.amplify.getAMPLIFYSnapshot();
      setSnapshot(data as AMPLIFYSnapshot);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const modes: { id: FrameMode; icon: string; label: string }[] = [
    { id: 'ai_burst', icon: '🔥', label: 'AI Burst' },
    { id: 'normal', icon: '🌿', label: 'Normal' },
    { id: 'fallback', icon: '🌑', label: 'Fallback' },
  ];

  return (
    <div className="dashboard" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dashboard__panel">
        <div className="dashboard__title">AMPLIFY Computer</div>
        <div className="dashboard__subtitle">CAI Hearth — Local Inference Dashboard</div>

        {/* Mode switcher */}
        <div className="mode-switcher">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`mode-btn ${currentMode === m.id ? `mode-btn--active-${m.id}` : ''}`}
              onClick={() => onModeChange(m.id)}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Cost telemetry stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card__label">Cloud Cost Avoided</div>
            <div className="stat-card__value stat-card__value--green">
              ${snapshot.total_cloud_cost_avoided_usd.toFixed(4)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Total Queries</div>
            <div className="stat-card__value">{snapshot.total_queries}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Substrate Hits</div>
            <div className="stat-card__value stat-card__value--green">
              {snapshot.substrate_hits}
              <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>
                {' '}({(snapshot.substrate_hit_ratio * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Local Ollama</div>
            <div className="stat-card__value stat-card__value--gold">
              {snapshot.local_ollama_served}
              <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>
                {' '}({(snapshot.local_ratio * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Cloud Calls</div>
            <div className="stat-card__value">
              {snapshot.cloud_escalations}
              <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>
                {' '}({(snapshot.cloud_ratio * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Tokens Saved</div>
            <div className="stat-card__value">{snapshot.total_tokens_saved_est.toLocaleString()}</div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.25)',
            textAlign: 'center',
            marginBottom: 14,
            letterSpacing: 0.5,
          }}
        >
          NOT AnyWair — It's CAI™ · AMPLIFY your Computer
        </div>

        <button className="close-btn" onClick={onClose}>
          Close Dashboard
        </button>
      </div>
    </div>
  );
};

export default AMPLIFYDashboard;
