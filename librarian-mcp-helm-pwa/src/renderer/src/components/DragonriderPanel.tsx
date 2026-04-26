/**
 * DragonriderPanel — Helm PWA Phase-Shift Visualization (K516 / A&A #2301)
 *
 * Displays recent Dragonrider Phase-Shift evaluations:
 * when they triggered, what harm was predicted in the sandbox,
 * whether they escalated warn→block, and confidence scores.
 *
 * Pern reference: Dragonriders go BETWEEN to different times and locations.
 * Here: the Dragonrider goes into an alternate sandbox timeline to test an action
 * before it lands in production reality.
 */

import React, { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PhaseShift {
  ts: string
  phase_shift_id: string
  triggered: boolean
  skipped: boolean
  skip_reason: string
  predicted_harm: boolean
  confidence: number
  sandbox_decision: 'escalate_to_block' | 'allow_as_warned' | 'insufficient_evidence'
  downstream_risk_count: number
  critical_risk_count: number
  escalation_reason: string
  elapsed_ms: number
  session: string
  file_path: string
}

interface DragonriderData {
  query_ts: string
  total: number
  returned: number
  escalation_count: number
  skip_count: number
  phase_shifts: PhaseShift[]
}

// ── Mock data ─────────────────────────────────────────────────────────────────

function mockDragonriderData(): DragonriderData {
  const now = new Date().toISOString()
  return {
    query_ts: now,
    total: 8,
    returned: 4,
    escalation_count: 2,
    skip_count: 3,
    phase_shifts: [
      {
        ts: new Date(Date.now() - 300000).toISOString(),
        phase_shift_id: '8b46c563',
        triggered: true,
        skipped: false,
        skip_reason: '',
        predicted_harm: true,
        confidence: 0.85,
        sandbox_decision: 'escalate_to_block',
        downstream_risk_count: 2,
        critical_risk_count: 1,
        escalation_reason: 'Phase-Shift found 1 critical risk(s) in sandbox (confidence=0.85). Risks: Augur-Vendor-Secret-Rotation. Escalating warn → block.',
        elapsed_ms: 1,
        session: 'K516',
        file_path: '/BISHOP_DROPZONE/01_KnightPrompts/PROMPT_K516.md',
      },
      {
        ts: new Date(Date.now() - 1200000).toISOString(),
        phase_shift_id: '3f1a9d22',
        triggered: true,
        skipped: false,
        skip_reason: '',
        predicted_harm: false,
        confidence: 0.2,
        sandbox_decision: 'allow_as_warned',
        downstream_risk_count: 1,
        critical_risk_count: 0,
        escalation_reason: 'Phase-Shift found 1 advisory risk(s) in sandbox (confidence=0.20 < threshold 0.7). Insufficient evidence to escalate — allowing as warned.',
        elapsed_ms: 1,
        session: 'K516',
        file_path: '/discipline_wing/engine.py',
      },
      {
        ts: new Date(Date.now() - 3600000).toISOString(),
        phase_shift_id: 'b7c2e145',
        triggered: false,
        skipped: true,
        skip_reason: "Decision is 'block' — Phase-Shift only on borderline 'warn'.",
        predicted_harm: false,
        confidence: 0.0,
        sandbox_decision: 'allow_as_warned',
        downstream_risk_count: 0,
        critical_risk_count: 0,
        escalation_reason: "Decision is 'block' — Phase-Shift only on borderline 'warn'.",
        elapsed_ms: 0,
        session: 'K515',
        file_path: '/BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL.md',
      },
    ],
  }
}

// ── Confidence bar ────────────────────────────────────────────────────────────

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.min(confidence * 100, 100)
  const color = confidence >= 0.7 ? '#ef4444' : confidence >= 0.4 ? '#f97316' : '#22c55e'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ height: 8, width: 80, background: '#1e293b', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
        {(confidence * 100).toFixed(0)}%
      </span>
    </div>
  )
}

// ── Decision badge ────────────────────────────────────────────────────────────

function DecisionBadge({ decision, skipped }: { decision: string; skipped: boolean }) {
  if (skipped) {
    return <span style={{ fontSize: 10, color: '#64748b', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: '1px 6px' }}>skipped</span>
  }
  const styles: Record<string, React.CSSProperties> = {
    escalate_to_block: { background: '#7f1d1d22', color: '#fca5a5', border: '1px solid #7f1d1d44' },
    allow_as_warned: { background: '#17375e22', color: '#93c5fd', border: '1px solid #17375e44' },
    insufficient_evidence: { background: '#1c1917', color: '#78716c', border: '1px solid #292524' },
  }
  const labels: Record<string, string> = {
    escalate_to_block: 'ESCALATED → BLOCK',
    allow_as_warned: 'allow (warn)',
    insufficient_evidence: 'insufficient evidence',
  }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 7px', ...(styles[decision] || {}) }}>
      {labels[decision] || decision}
    </span>
  )
}

// ── Phase-Shift row ───────────────────────────────────────────────────────────

function PhaseShiftRow({ ps }: { ps: PhaseShift }) {
  const [expanded, setExpanded] = useState(false)
  const isEscalated = ps.sandbox_decision === 'escalate_to_block'

  return (
    <div
      style={{
        background: '#0f172a',
        border: `1px solid ${isEscalated ? '#7f1d1d44' : '#1e293b'}`,
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 8,
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>#{ps.phase_shift_id}</span>
          <DecisionBadge decision={ps.sandbox_decision} skipped={ps.skipped} />
          {!ps.skipped && <ConfidenceBar confidence={ps.confidence} />}
        </div>
        <span style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap' }}>
          {new Date(ps.ts).toLocaleTimeString()}
        </span>
      </div>

      {!ps.skipped && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#64748b' }}>
          {ps.session && <span style={{ marginRight: 10 }}>session: <span style={{ color: '#38bdf8' }}>{ps.session}</span></span>}
          {ps.file_path && <span>{ps.file_path.split('/').slice(-2).join('/')}</span>}
          {ps.critical_risk_count > 0 && (
            <span style={{ marginLeft: 10, color: '#fca5a5' }}>
              {ps.critical_risk_count} critical risk{ps.critical_risk_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1e293b' }}>
          {ps.skipped ? (
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Skipped: {ps.skip_reason}</p>
          ) : (
            <>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 6px' }}>
                {ps.escalation_reason}
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#475569' }}>
                <span>risks: {ps.downstream_risk_count}</span>
                <span>critical: {ps.critical_risk_count}</span>
                <span>elapsed: {ps.elapsed_ms}ms</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DragonriderPanel() {
  const [data, setData] = useState<DragonriderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      try {
        const res = await fetch('/wing/dragonrider')
        if (res.ok) {
          setData(await res.json())
        } else {
          setData(mockDragonriderData())
        }
      } catch {
        setData(mockDragonriderData())
      }
      setLastRefresh(new Date().toLocaleTimeString())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (!data) return <p style={{ color: '#64748b', fontSize: 13 }}>Loading Phase-Shift data...</p>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
            Dragonrider Phase-Shifts
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
            Sandbox evaluations for borderline Wing decisions · K516 · A&A #2301
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '6px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Phase-Shifts', value: data.total, color: '#e2e8f0' },
          { label: 'Escalations (warn→block)', value: data.escalation_count, color: '#fca5a5' },
          { label: 'Allowed as Warned', value: data.total - data.escalation_count - data.skip_count, color: '#93c5fd' },
          { label: 'Skipped (non-borderline)', value: data.skip_count, color: '#64748b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Phase-Shift feed */}
      {data.phase_shifts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155' }}>
          <p style={{ fontSize: 14, margin: 0 }}>No Phase-Shift evaluations recorded yet.</p>
          <p style={{ fontSize: 12, marginTop: 8, color: '#1e293b' }}>
            Enable Dragonrider in Wing config (dragonrider_enabled: true) to activate.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 12 }}>
            Click a Phase-Shift to expand · {data.returned} of {data.total} shown
          </p>
          {data.phase_shifts.map((ps) => (
            <PhaseShiftRow key={ps.phase_shift_id} ps={ps} />
          ))}
        </div>
      )}

      {lastRefresh && (
        <p style={{ fontSize: 10, color: '#334155', marginTop: 16 }}>Last refresh: {lastRefresh}</p>
      )}
    </div>
  )
}

export default DragonriderPanel
