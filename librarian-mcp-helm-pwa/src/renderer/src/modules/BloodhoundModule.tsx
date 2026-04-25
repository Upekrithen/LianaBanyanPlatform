/**
 * Bloodhound Module — Helm PWA K486
 *
 * UI surface for the Bloodhound corpus scout. Shows ranked Well candidates
 * before the Miner bootstraps. Founder can run the scout to see which Well
 * is highest-density in their corpus before committing to a Miner run.
 */

import React, { useState } from 'react'
import { useModuleTask } from './useModuleTask'

const WORKSPACE_ROOT = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform'
const MINERS_DIR = `${WORKSPACE_ROOT}\\librarian-mcp\\miners`
const BISHOP_MEMORY = 'C:\\Users\\Administrator\\.claude\\projects\\C--Users-Administrator-Documents\\memory'

const S = {
  container: { padding: '28px 32px', maxWidth: '720px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#64748b', lineHeight: 1.5 },
  row: { display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px' },
  label: { fontSize: '12px', color: '#94a3b8', marginBottom: '6px' },
  input: {
    background: '#141824', border: '1px solid #1e2333', borderRadius: '6px',
    padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', width: '100%',
    outline: 'none',
  } as React.CSSProperties,
  field: { flex: 1 },
  btn: (variant: 'primary' | 'danger' | 'ghost') => ({
    padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: 'none', flexShrink: 0,
    background: variant === 'primary' ? '#2563eb' : variant === 'danger' ? '#dc2626' : '#1e2333',
    color: variant === 'ghost' ? '#94a3b8' : '#fff',
  } as React.CSSProperties),
  statusBadge: (state: string) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: '10px', fontSize: '11px',
    fontWeight: 600, letterSpacing: '0.3px',
    background: state === 'running' ? '#1d4008' : state === 'done' ? '#052e16' : state === 'error' ? '#2d1a1a' : '#1e2333',
    color: state === 'running' ? '#86efac' : state === 'done' ? '#4ade80' : state === 'error' ? '#f87171' : '#64748b',
  } as React.CSSProperties),
  console: {
    background: '#080b10', border: '1px solid #1e2333', borderRadius: '8px',
    padding: '14px', fontFamily: "'SF Mono','Fira Code',monospace", fontSize: '11px',
    color: '#94a3b8', lineHeight: 1.6, overflowY: 'auto' as const, maxHeight: '360px',
    minHeight: '120px',
  },
  divider: { height: '1px', background: '#1e2333', margin: '24px 0' },
}

export function BloodhoundModule(): React.ReactElement {
  const { state, outputLines, run, stop, clearOutput } = useModuleTask('bloodhound-scout')
  const [corpusDir, setCorpusDir] = useState(BISHOP_MEMORY)
  const [topN, setTopN] = useState('10')

  const handleRun = () => {
    run(
      `${MINERS_DIR}\\bloodhound.py`,
      ['--corpus-dir', corpusDir, '--top', topN],
      MINERS_DIR,
    )
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>🐕 Bloodhound Scout</div>
        <div style={S.sub}>
          Light-touch corpus pre-scan. Ranks topical Wells by keyword density before the
          Root Miner anchors. Fixes K482's "first-file-wins" fragility.
        </div>
      </div>

      <div style={S.row}>
        <div style={{ ...S.field, flex: 3 }}>
          <div style={S.label}>Corpus Directory</div>
          <input
            style={S.input}
            value={corpusDir}
            onChange={(e) => setCorpusDir(e.target.value)}
            disabled={state === 'running'}
          />
        </div>
        <div style={{ width: '80px' }}>
          <div style={S.label}>Top N Wells</div>
          <input
            style={{ ...S.input, width: '80px' }}
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
            disabled={state === 'running'}
            type="number"
            min="3"
            max="30"
          />
        </div>
        {state === 'running' ? (
          <button style={S.btn('danger')} onClick={stop}>Stop</button>
        ) : (
          <button style={S.btn('primary')} onClick={handleRun}>Scout</button>
        )}
        <button style={S.btn('ghost')} onClick={clearOutput} disabled={state === 'running'}>
          Clear
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <span style={S.statusBadge(state)}>
          {state === 'idle' ? 'idle' : state === 'running' ? 'scouting…' : state === 'done' ? 'complete' : 'error'}
        </span>
      </div>

      <div style={S.console}>
        {outputLines.length === 0 ? (
          <span style={{ color: '#334155' }}>
            {state === 'idle' ? '→ Press Scout to begin corpus analysis.' : '…'}
          </span>
        ) : (
          outputLines.map((line, i) => (
            <div key={i} style={{ color: line.startsWith('⚠') ? '#f87171' : '#94a3b8' }}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
