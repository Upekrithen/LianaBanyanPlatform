// B83c — Drekaskip Wave Status Panel
// Live readout of current Drekaskip saga + wave instance count
// B61A commit 42ecdcd — Wave Generator LANDED, 12/12 G-gates PASS

import { useState, useEffect } from 'react';
import { sagaSubscription } from './saga_subscription';
import type { SagaState, WaveInstance } from './saga_subscription';
import { DEFAULT_SAGA_STATE } from './saga_subscription';

export function DrekaskipStatusPanel() {
  const [state, setState] = useState<SagaState>(DEFAULT_SAGA_STATE);
  const [selected, setSelected] = useState<WaveInstance | null>(null);

  useEffect(() => {
    const unsub = sagaSubscription.subscribe(setState);
    return unsub;
  }, []);

  const complete = state.wave_instances.filter((w) => w.status === 'complete').length;
  const inflight = state.wave_instances.filter((w) => w.status === 'in_flight').length;
  const errored = state.wave_instances.filter((w) => w.status === 'error').length;
  const recent = state.wave_instances.slice(0, 5);

  function statusColor(status: WaveInstance['status']): string {
    return status === 'complete' ? '#22c55e' : status === 'in_flight' ? '#f6ad55' : '#ef4444';
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.logo}>🌊</span>
        <span style={styles.title}>Drekaskip</span>
        {state.loading && <span style={styles.loading}>polling…</span>}
      </div>

      <div style={styles.sagaRow}>
        <span style={styles.sagaLabel}>Saga:</span>
        <span style={styles.sagaName}>{state.active_saga ?? '—'}</span>
      </div>

      <div style={styles.counters}>
        <div style={styles.counter}>
          <span style={styles.counterNum}>{state.wave_count}</span>
          <span style={styles.counterLabel}>total waves</span>
        </div>
        <div style={styles.counter}>
          <span style={{ ...styles.counterNum, color: '#f6ad55' }}>{inflight}</span>
          <span style={styles.counterLabel}>in-flight</span>
        </div>
        <div style={styles.counter}>
          <span style={{ ...styles.counterNum, color: '#22c55e' }}>{complete}</span>
          <span style={styles.counterLabel}>complete</span>
        </div>
        {errored > 0 && (
          <div style={styles.counter}>
            <span style={{ ...styles.counterNum, color: '#ef4444' }}>{errored}</span>
            <span style={styles.counterLabel}>errors</span>
          </div>
        )}
      </div>

      {/* Mini timeline — last 5 waves */}
      {recent.length > 0 && (
        <div style={styles.timeline}>
          {recent.map((w) => (
            <button
              key={w.id}
              style={styles.waveEntry}
              onClick={() => setSelected(selected?.id === w.id ? null : w)}
              title={`Wave ${w.id.slice(0, 8)}… — ${w.status}`}
            >
              <span style={{ ...styles.waveDot, background: statusColor(w.status) }} />
              <span style={styles.waveId}>{w.id.slice(0, 8)}…</span>
              <span style={styles.waveStatus}>{w.status}</span>
            </button>
          ))}
        </div>
      )}

      {/* Drill-down drawer */}
      {selected && (
        <div style={styles.drawer}>
          <div style={styles.drawerHeader}>
            Wave {selected.id}
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
          </div>
          <div style={styles.drawerRow}><b>Saga:</b> {selected.saga}</div>
          <div style={styles.drawerRow}><b>Status:</b> {selected.status}</div>
          <div style={styles.drawerRow}><b>Started:</b> {new Date(selected.started_at).toLocaleTimeString()}</div>
          {selected.completed_at && (
            <div style={styles.drawerRow}><b>Completed:</b> {new Date(selected.completed_at).toLocaleTimeString()}</div>
          )}
        </div>
      )}

      {state.error && (
        <div style={styles.error}>⚠ {state.error.slice(0, 80)}</div>
      )}

      <div style={styles.footer}>
        B61A · 12/12 G-gates · {state.last_queried ? `polled ${new Date(state.last_queried).toLocaleTimeString()}` : 'awaiting first poll'}
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
    gap: '0.4rem',
    border: '1px solid #2d3748',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  header: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  logo: { fontSize: '1rem' },
  title: { fontWeight: 700, fontSize: '0.85rem', color: '#63b3ed' },
  loading: { marginLeft: 'auto', fontSize: '0.65rem', color: '#718096' },
  sagaRow: { display: 'flex', gap: '0.4rem', alignItems: 'baseline' },
  sagaLabel: { fontSize: '0.7rem', color: '#718096' },
  sagaName: { fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 },
  counters: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  counter: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  counterNum: { fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 },
  counterLabel: { fontSize: '0.6rem', color: '#718096' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, overflow: 'auto' },
  waveEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.25rem 0.4rem',
    background: '#1a1a2e',
    border: '1px solid #2d3748',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#e2e8f0',
    textAlign: 'left',
  },
  waveDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  waveId: { fontSize: '0.7rem', fontFamily: 'monospace', flex: 1 },
  waveStatus: { fontSize: '0.65rem', color: '#718096' },
  drawer: {
    background: '#1a1a2e',
    border: '1px solid #4a5568',
    borderRadius: '6px',
    padding: '0.5rem',
    fontSize: '0.75rem',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    marginBottom: '0.3rem',
    wordBreak: 'break-all',
  },
  drawerRow: { marginBottom: '0.2rem' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#718096',
    cursor: 'pointer',
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  error: { color: '#ef4444', fontSize: '0.7rem' },
  footer: { fontSize: '0.6rem', color: '#4a5568', marginTop: 'auto' },
};
