import React from 'react'
import { DaemonStatus } from '../App'

interface Props {
  daemonStatus: DaemonStatus
  onRestart: () => void
  isElectron: boolean
}

const S = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 20px',
    background: '#0a0d13',
    borderBottom: '1px solid #1e2333',
    flexShrink: 0,
  },
  dot: (alive: boolean) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: alive ? '#22c55e' : '#ef4444',
    boxShadow: alive ? '0 0 6px #22c55e88' : 'none',
    flexShrink: 0,
  }),
  label: {
    fontSize: '12px',
    color: '#64748b',
  },
  value: (alive: boolean) => ({
    fontSize: '12px',
    color: alive ? '#86efac' : '#fca5a5',
    fontWeight: 500,
  }),
  separator: {
    width: '1px',
    height: '14px',
    background: '#1e2333',
  },
  restartBtn: {
    marginLeft: 'auto',
    padding: '3px 10px',
    fontSize: '11px',
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#64748b',
    cursor: 'pointer',
  },
}

export function StatusBar({ daemonStatus, onRestart, isElectron }: Props): React.ReactElement {
  const { alive, pid, port, lastError, restartCount } = daemonStatus

  return (
    <div style={S.bar}>
      <div style={S.dot(alive)} />
      <span style={S.value(alive)}>
        Librarian {alive ? 'running' : 'stopped'}
      </span>

      {alive && pid && (
        <>
          <div style={S.separator} />
          <span style={S.label}>PID {pid}</span>
        </>
      )}

      {alive && (
        <>
          <div style={S.separator} />
          <span style={S.label}>:{port}</span>
        </>
      )}

      {!alive && lastError && (
        <>
          <div style={S.separator} />
          <span style={{ ...S.label, color: '#fca5a5', fontSize: '11px' }}>{lastError}</span>
        </>
      )}

      {restartCount > 0 && (
        <>
          <div style={S.separator} />
          <span style={S.label}>Restarts: {restartCount}</span>
        </>
      )}

      {!alive && isElectron && (
        <button style={S.restartBtn} onClick={onRestart}>
          Restart
        </button>
      )}
    </div>
  )
}
