/**
 * Sculptor Module — Helm PWA K486
 *
 * UI surface for the Sculptor (K483 + K485 Eblet substrate).
 * Runs run_sculptor.py on the bedrock produced by the Miner module.
 */

import React, { useState } from 'react'
import { useModuleTask } from './useModuleTask'

const WORKSPACE_ROOT = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform'
const SCULPTORS_DIR = `${WORKSPACE_ROOT}\\librarian-mcp\\sculptors`

const PROFILES = ['cathedral-public', 'cathedral-guild', 'cathedral-private', 'all']

const S = {
  container: { padding: '28px 32px', maxWidth: '720px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#64748b', lineHeight: 1.5 },
  row: { display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' as const },
  label: { fontSize: '12px', color: '#94a3b8', marginBottom: '6px' },
  select: {
    background: '#141824', border: '1px solid #1e2333', borderRadius: '6px',
    padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
  btn: (variant: 'primary' | 'danger' | 'ghost') => ({
    padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: 'none', flexShrink: 0,
    background: variant === 'primary' ? '#7c3aed' : variant === 'danger' ? '#dc2626' : '#1e2333',
    color: variant === 'ghost' ? '#94a3b8' : '#fff',
  } as React.CSSProperties),
  statusBadge: (state: string) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: '10px', fontSize: '11px',
    fontWeight: 600, letterSpacing: '0.3px',
    background: state === 'running' ? '#2e1065' : state === 'done' ? '#052e16' : state === 'error' ? '#2d1a1a' : '#1e2333',
    color: state === 'running' ? '#c4b5fd' : state === 'done' ? '#4ade80' : state === 'error' ? '#f87171' : '#64748b',
  } as React.CSSProperties),
  infoCard: {
    background: '#141824', border: '1px solid #1e2333', borderRadius: '8px',
    padding: '14px 16px', marginBottom: '20px', fontSize: '12px', color: '#64748b', lineHeight: 1.6,
  },
  console: {
    background: '#080b10', border: '1px solid #1e2333', borderRadius: '8px',
    padding: '14px', fontFamily: "'SF Mono','Fira Code',monospace", fontSize: '11px',
    color: '#94a3b8', lineHeight: 1.6, overflowY: 'auto' as const, maxHeight: '400px',
    minHeight: '140px',
  },
}

export function SculptorModule(): React.ReactElement {
  const { state, outputLines, run, stop, clearOutput } = useModuleTask('sculptor-k486')
  const [profile, setProfile] = useState('cathedral-public')
  const [maxTablets, setMaxTablets] = useState('')

  const handleRun = () => {
    const args: string[] = []
    if (profile !== 'all') args.push('--profile', profile)
    if (maxTablets) args.push('--max-tablets', maxTablets)
    run(`${SCULPTORS_DIR}\\run_sculptor.py`, args, SCULPTORS_DIR)
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>🗿 Sculptor</div>
        <div style={S.sub}>
          IP-as-Filter curation pipeline. Reads Miner bedrock, applies Three-Fates
          filtering, produces cathedral-delivery artifacts and Eblets.
        </div>
      </div>

      <div style={S.infoCard}>
        <strong style={{ color: '#94a3b8' }}>Input:</strong> librarian-mcp/miners/bedrock/*.jsonl
        &nbsp;·&nbsp;
        <strong style={{ color: '#94a3b8' }}>Output:</strong> librarian-mcp/sculptors/outputs/
        &nbsp;·&nbsp;
        Run Miner first to populate bedrock.
      </div>

      <div style={S.row}>
        <div>
          <div style={S.label}>Cathedral Profile</div>
          <select
            style={S.select}
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            disabled={state === 'running'}
          >
            {PROFILES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={S.label}>Max Tablets</div>
          <input
            style={{
              background: '#141824', border: '1px solid #1e2333', borderRadius: '6px',
              padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', width: '100px',
              outline: 'none',
            }}
            value={maxTablets}
            onChange={(e) => setMaxTablets(e.target.value)}
            disabled={state === 'running'}
            placeholder="all"
            type="number"
          />
        </div>
        {state === 'running' ? (
          <button style={S.btn('danger')} onClick={stop}>Stop</button>
        ) : (
          <button style={S.btn('primary')} onClick={handleRun}>Run Sculptor</button>
        )}
        <button style={S.btn('ghost')} onClick={clearOutput} disabled={state === 'running'}>
          Clear
        </button>
        <span style={S.statusBadge(state)}>
          {state === 'idle' ? 'idle' : state === 'running' ? 'sculpting…' : state === 'done' ? 'complete' : 'error'}
        </span>
      </div>

      <div style={S.console}>
        {outputLines.length === 0 ? (
          <span style={{ color: '#334155' }}>
            {state === 'idle' ? '→ Ensure Miner has run first, then press Run Sculptor.' : '…'}
          </span>
        ) : (
          outputLines.map((line, i) => {
            const isFilter = line.includes('[PASS]') || line.includes('[REJECT]')
            const isArtifact = line.includes('[artifact]') || line.includes('[Sculptor]')
            const isError = line.startsWith('⚠')
            const color = isError ? '#f87171' : isFilter ? '#c4b5fd' : isArtifact ? '#34d399' : '#94a3b8'
            return (
              <div key={i} style={{ color }}>
                {line}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
