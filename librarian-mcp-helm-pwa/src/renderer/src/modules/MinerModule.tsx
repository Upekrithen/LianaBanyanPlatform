/**
 * Miner Module — Helm PWA K486
 *
 * UI surface for the K486 Miner run harness (run_miner_k486.py).
 * Includes Bloodhound pre-anchor, multi_well_scores, and daughter cross-reference.
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
  row: { display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' as const },
  label: { fontSize: '12px', color: '#94a3b8', marginBottom: '6px' },
  input: {
    background: '#141824', border: '1px solid #1e2333', borderRadius: '6px',
    padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', width: '100%',
    outline: 'none',
  } as React.CSSProperties,
  field: { flex: 1 },
  fieldSm: { width: '100px' },
  btn: (variant: 'primary' | 'danger' | 'ghost') => ({
    padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: 'none', flexShrink: 0,
    background: variant === 'primary' ? '#2563eb' : variant === 'danger' ? '#dc2626' : '#1e2333',
    color: variant === 'ghost' ? '#94a3b8' : '#fff',
  } as React.CSSProperties),
  checkRow: { display: 'flex', gap: '20px', marginBottom: '16px' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer' },
  statusBadge: (state: string) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: '10px', fontSize: '11px',
    fontWeight: 600, letterSpacing: '0.3px',
    background: state === 'running' ? '#1d3461' : state === 'done' ? '#052e16' : state === 'error' ? '#2d1a1a' : '#1e2333',
    color: state === 'running' ? '#93c5fd' : state === 'done' ? '#4ade80' : state === 'error' ? '#f87171' : '#64748b',
  } as React.CSSProperties),
  console: {
    background: '#080b10', border: '1px solid #1e2333', borderRadius: '8px',
    padding: '14px', fontFamily: "'SF Mono','Fira Code',monospace", fontSize: '11px',
    color: '#94a3b8', lineHeight: 1.6, overflowY: 'auto' as const, maxHeight: '420px',
    minHeight: '160px',
  },
}

export function MinerModule(): React.ReactElement {
  const { state, outputLines, run, stop, clearOutput } = useModuleTask('miner-k486')
  const [corpusDir, setCorpusDir] = useState(BISHOP_MEMORY)
  const [maxFiles, setMaxFiles] = useState('')
  const [timeCap, setTimeCap] = useState('900')
  const [useBloodhound, setUseBloodhound] = useState(true)
  const [useCrossref, setUseCrossref] = useState(true)
  const [crossrefThreshold, setCrossrefThreshold] = useState('0.40')

  const handleRun = () => {
    const args = ['--corpus-dir', corpusDir, '--time-cap-sec', timeCap]
    if (maxFiles) args.push('--max-files', maxFiles)
    if (!useBloodhound) args.push('--no-bloodhound')
    if (!useCrossref) args.push('--no-crossref')
    if (useCrossref) args.push('--crossref-threshold', crossrefThreshold)
    run(`${MINERS_DIR}\\run_miner_k486.py`, args, MINERS_DIR)
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>⛏ Miner — K486</div>
        <div style={S.sub}>
          Self-replicating corpus-prospecting Scribe with Bloodhound bootstrap,
          mitotic specialization, multi_well_scores, and daughter cross-reference.
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
        <div style={S.fieldSm}>
          <div style={S.label}>Max Files</div>
          <input
            style={{ ...S.input, width: '100px' }}
            value={maxFiles}
            onChange={(e) => setMaxFiles(e.target.value)}
            disabled={state === 'running'}
            placeholder="all"
            type="number"
          />
        </div>
        <div style={S.fieldSm}>
          <div style={S.label}>Time Cap (s)</div>
          <input
            style={{ ...S.input, width: '100px' }}
            value={timeCap}
            onChange={(e) => setTimeCap(e.target.value)}
            disabled={state === 'running'}
            type="number"
          />
        </div>
      </div>

      <div style={S.checkRow}>
        <label style={S.checkLabel}>
          <input type="checkbox" checked={useBloodhound} onChange={(e) => setUseBloodhound(e.target.checked)} disabled={state === 'running'} />
          Bloodhound pre-anchor
        </label>
        <label style={S.checkLabel}>
          <input type="checkbox" checked={useCrossref} onChange={(e) => setUseCrossref(e.target.checked)} disabled={state === 'running'} />
          Daughter cross-reference
        </label>
        {useCrossref && (
          <label style={S.checkLabel}>
            Threshold:
            <input
              style={{ ...S.input, width: '70px', padding: '4px 8px' }}
              value={crossrefThreshold}
              onChange={(e) => setCrossrefThreshold(e.target.value)}
              disabled={state === 'running'}
              type="number"
              step="0.05"
              min="0"
              max="1"
            />
          </label>
        )}
      </div>

      <div style={S.row}>
        {state === 'running' ? (
          <button style={S.btn('danger')} onClick={stop}>Stop Mining</button>
        ) : (
          <button style={S.btn('primary')} onClick={handleRun}>Run Miner</button>
        )}
        <button style={S.btn('ghost')} onClick={clearOutput} disabled={state === 'running'}>
          Clear
        </button>
        <span style={S.statusBadge(state)}>
          {state === 'idle' ? 'idle' : state === 'running' ? 'mining…' : state === 'done' ? 'complete' : 'error'}
        </span>
      </div>

      <div style={S.console}>
        {outputLines.length === 0 ? (
          <span style={{ color: '#334155' }}>
            {state === 'idle' ? '→ Configure corpus directory and press Run Miner.' : '…'}
          </span>
        ) : (
          outputLines.map((line, i) => {
            const isMitosis = line.includes('[Mitosis')
            const isBloodhound = line.includes('[Bloodhound]')
            const isCrossref = line.includes('[CrossRef]')
            const isError = line.startsWith('⚠')
            const color = isError ? '#f87171' : isMitosis ? '#f59e0b' : isBloodhound ? '#a78bfa' : isCrossref ? '#34d399' : '#94a3b8'
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
