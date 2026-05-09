// B83d — Active Substrate Panel (Watchdog Health Grid)
// 9-subject health grid — visualization surface for Watchdog Knight daemon
// Coffee §9 "9 of 9 operational" — empirical receipt for the claim
// Polling: 5s for grid; 1s on hover; click → drilldown drawer

import { useState, useEffect, useCallback } from 'react';
import { HealthGrid } from './health_grid';
import { SubjectDrilldown } from './subject_drilldown';

export type SubjectStatus = 'green' | 'yellow' | 'red' | 'gray';

export interface SubjectHealth {
  name: string;
  short_name: string;
  status: SubjectStatus;
  last_heartbeat: string | null;
  last_error: string | null;
  stack_ref: string;
  description: string;
}

export interface WatchdogStatusPayload {
  subjects: SubjectHealth[];
  watchdog_status: SubjectStatus;
  polled_at: string;
}

export function ActiveSubstratePanel() {
  const [status, setStatus] = useState<WatchdogStatusPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SubjectHealth | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ ts: string; level: string; message: string }>>([]);

  const poll = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.amplify.watchdogStatus?.() ?? null;
      if (result) setStatus(result);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 5s poll
  useEffect(() => {
    poll();
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [poll]);

  // 1s poll when hovering
  useEffect(() => {
    if (!hovered) return;
    const timer = setInterval(poll, 1000);
    return () => clearInterval(timer);
  }, [hovered, poll]);

  // Load history when subject selected
  useEffect(() => {
    if (!selected) { setHistory([]); return; }
    window.amplify.watchdogHistory?.(selected.short_name, 1).then(setHistory).catch(() => setHistory([]));
  }, [selected]);

  const watchdogColor = status?.watchdog_status === 'green' ? '#22c55e'
    : status?.watchdog_status === 'yellow' ? '#f6ad55'
    : status?.watchdog_status === 'red' ? '#ef4444' : '#4a5568';

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.icon}>🔬</span>
        <span style={styles.title}>Active Substrate</span>
        <span style={{ ...styles.watchdogBadge, color: watchdogColor }} title={`Watchdog: ${status?.watchdog_status ?? 'unknown'}`}>
          Watchdog {status?.watchdog_status ?? '…'}
        </span>
        {loading && <span style={styles.polling}>polling</span>}
      </div>

      {status ? (
        <>
          <HealthGrid
            subjects={status.subjects}
            onSubjectClick={(s) => setSelected(selected?.short_name === s.short_name ? null : s)}
            hoveredSubject={hovered}
            onHoverChange={setHovered}
          />

          {selected && (
            <SubjectDrilldown
              subject={selected}
              history={history}
              onClose={() => setSelected(null)}
            />
          )}
        </>
      ) : (
        <div style={styles.placeholder}>
          {loading ? 'Polling Watchdog…' : error ? `⚠ ${error.slice(0, 80)}` : 'No data yet'}
        </div>
      )}

      {status?.polled_at && (
        <div style={styles.footer}>
          {status.subjects.filter((s) => s.status === 'green').length}/9 green
          {' · '}polled {new Date(status.polled_at).toLocaleTimeString()}
        </div>
      )}

      {/* Color semantics reference */}
      <div style={styles.legend}>
        <span style={styles.legendGreen}>● green</span>=healthy
        <span style={styles.legendYellow}> ◐ yellow</span>=degraded
        <span style={styles.legendRed}> ✕ red</span>=error
        <span style={styles.legendGray}> ○ gray</span>=not registered
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: '#0d1117',
    color: '#e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    border: '1px solid #2d3748',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',
  },
  header: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  icon: { fontSize: '1rem' },
  title: { fontWeight: 700, fontSize: '0.85rem', color: '#68d391' },
  watchdogBadge: { marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 600 },
  polling: { fontSize: '0.65rem', color: '#4a5568' },
  placeholder: { color: '#4a5568', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' },
  footer: { fontSize: '0.6rem', color: '#4a5568' },
  legend: { fontSize: '0.6rem', color: '#4a5568', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' },
  legendGreen: { color: '#22c55e' },
  legendYellow: { color: '#f6ad55' },
  legendRed: { color: '#ef4444' },
  legendGray: { color: '#4a5568' },
};
