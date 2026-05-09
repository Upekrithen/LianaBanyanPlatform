// B83a — Conjunction Panel
// Founder-facing UI for selecting which backend(s) handle the next request
// Founder-coined: "In Conjunction" — the mode name for parallel dispatch
// Default: cpu_only (no spend until Founder explicitly picks a model)

import { useState, useEffect, useCallback } from 'react';
import type { ConjunctionMode, BackendAvailability, ConjunctionPanelState } from './types';

interface ConjunctionPanelProps {
  panelState: ConjunctionPanelState;
  availability: BackendAvailability;
  onSelect: (mode: ConjunctionMode) => Promise<void>;
  onShiftClick?: (mode: ConjunctionMode) => void; // per-request override
}

const MODE_CONFIG: Array<{
  mode: ConjunctionMode;
  label: string;
  icon: string;
  description: string;
  tooltip: string;
}> = [
  {
    mode: 'cpu_only',
    label: 'CPU Only',
    icon: '⚙️',
    description: 'Rule-based / substrate lookup — no model spend',
    tooltip: 'Local rules + substrate index. Deterministic, zero cost.',
  },
  {
    mode: 'ollama',
    label: 'Ollama (Local)',
    icon: '🦙',
    description: 'Local LLM — llama3.1:8b on your machine',
    tooltip: 'Local Ollama inference. Private, no cloud cost.',
  },
  {
    mode: 'knight_cursor',
    label: 'Knight (Cursor)',
    icon: '♞',
    description: 'Routes to Knight via Yoke bridge (async)',
    tooltip: 'Knight is human-operated (paste cycle in Cursor IDE). Responses may arrive after context-switch; receipts persist regardless.',
  },
  {
    mode: 'opus_claude',
    label: 'Opus (Claude)',
    icon: '🔮',
    description: 'Claude Opus — cloud flagship model',
    tooltip: 'Anthropic API — incurs cost. ~$15/1M input tokens.',
  },
  {
    mode: 'all_in_conjunction',
    label: 'All In Conjunction',
    icon: '🌐',
    description: 'Parallel fan-out to all 4 + composite synthesis',
    tooltip: 'Dispatches to all backends simultaneously. Fan-in synthesizer composes results side-by-side. Knight response is async/best-effort.',
  },
];

function getStatusColor(available: boolean, mode: ConjunctionMode): string {
  if (mode === 'cpu_only' || mode === 'all_in_conjunction') return '#22c55e'; // always green
  return available ? '#22c55e' : '#ef4444';
}

function getStatusLabel(available: boolean, mode: ConjunctionMode): string {
  if (mode === 'cpu_only' || mode === 'all_in_conjunction') return 'ready';
  return available ? 'ready' : 'unavailable';
}

export function ConjunctionPanel({ panelState, availability, onSelect, onShiftClick }: ConjunctionPanelProps) {
  const [selecting, setSelecting] = useState<ConjunctionMode | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleClick = useCallback(async (e: React.MouseEvent, mode: ConjunctionMode) => {
    if (e.shiftKey && onShiftClick) {
      onShiftClick(mode);
      return;
    }
    setSelecting(mode);
    await onSelect(mode);
    setSelecting(null);
  }, [onSelect, onShiftClick]);

  const isAvailable = (mode: ConjunctionMode): boolean => {
    switch (mode) {
      case 'cpu_only': return true;
      case 'ollama': return availability.ollama;
      case 'knight_cursor': return availability.knight_cursor;
      case 'opus_claude': return availability.opus_claude;
      case 'all_in_conjunction': return true;
      default: return false;
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>🔀</span>
        <span style={styles.headerTitle}>In Conjunction</span>
        {panelState.in_flight && (
          <span style={styles.inflight}>
            ● {panelState.in_flight.mode}…
          </span>
        )}
      </div>

      <div style={styles.modeList}>
        {MODE_CONFIG.map(({ mode, label, icon, description, tooltip: tip }) => {
          const selected = panelState.selected === mode;
          const override = panelState.per_request_override === mode;
          const avail = isAvailable(mode);
          const busy = selecting === mode;
          const statusColor = getStatusColor(avail, mode);

          return (
            <button
              key={mode}
              style={{
                ...styles.modeBtn,
                ...(selected ? styles.modeBtnSelected : {}),
                ...(override ? styles.modeBtnOverride : {}),
                ...(busy ? styles.modeBtnBusy : {}),
                opacity: avail ? 1 : 0.5,
                cursor: avail ? 'pointer' : 'default',
              }}
              onClick={(e) => avail && handleClick(e, mode)}
              onMouseEnter={() => setTooltip(tip)}
              onMouseLeave={() => setTooltip(null)}
              title={tip}
              aria-pressed={selected}
              disabled={busy}
            >
              <div style={styles.modeBtnTop}>
                <span style={styles.modeIcon}>{icon}</span>
                <span style={styles.modeLabel}>{label}</span>
                <span style={{ ...styles.statusDot, background: statusColor }} title={getStatusLabel(avail, mode)} />
              </div>
              <div style={styles.modeDesc}>{description}</div>
              {override && <div style={styles.overrideTag}>ONCE</div>}
            </button>
          );
        })}
      </div>

      {tooltip && <div style={styles.tooltip}>{tooltip}</div>}

      {panelState.last_dispatch && (
        <div style={styles.lastDispatch}>
          <span style={{ color: panelState.last_dispatch.success ? '#22c55e' : '#ef4444' }}>
            {panelState.last_dispatch.success ? '✓' : '✗'}
          </span>
          {' '}Last: {panelState.last_dispatch.mode} · {panelState.last_dispatch.latency_ms}ms
        </div>
      )}

      <div style={styles.hint}>Shift+click = one-shot override</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: '#1a1a2e',
    color: '#e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    height: '100%',
    boxSizing: 'border-box',
    border: '1px solid #2d3748',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  headerIcon: { fontSize: '1.1rem' },
  headerTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#f6ad55',
    letterSpacing: '0.03em',
  },
  inflight: {
    marginLeft: 'auto',
    fontSize: '0.7rem',
    color: '#68d391',
    animation: 'pulse 1.5s infinite',
  },
  modeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    flex: 1,
  },
  modeBtn: {
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    color: '#e2e8f0',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s',
    position: 'relative',
  },
  modeBtnSelected: {
    background: '#2c5282',
    borderColor: '#63b3ed',
  },
  modeBtnOverride: {
    background: '#3d2c00',
    borderColor: '#f6ad55',
  },
  modeBtnBusy: {
    background: '#1a2744',
    borderColor: '#90cdf4',
  },
  modeBtnTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  modeIcon: { fontSize: '0.95rem' },
  modeLabel: { fontWeight: 600, fontSize: '0.85rem', flex: 1 },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  modeDesc: {
    fontSize: '0.7rem',
    color: '#a0aec0',
    marginTop: '0.2rem',
    lineHeight: 1.3,
  },
  overrideTag: {
    position: 'absolute',
    top: '4px',
    right: '6px',
    fontSize: '0.6rem',
    background: '#f6ad55',
    color: '#1a202c',
    borderRadius: '3px',
    padding: '1px 4px',
    fontWeight: 700,
  },
  tooltip: {
    background: '#4a5568',
    color: '#e2e8f0',
    borderRadius: '6px',
    padding: '0.4rem 0.6rem',
    fontSize: '0.72rem',
    lineHeight: 1.4,
  },
  lastDispatch: {
    fontSize: '0.7rem',
    color: '#718096',
    borderTop: '1px solid #2d3748',
    paddingTop: '0.4rem',
  },
  hint: {
    fontSize: '0.65rem',
    color: '#4a5568',
    textAlign: 'right',
  },
};
