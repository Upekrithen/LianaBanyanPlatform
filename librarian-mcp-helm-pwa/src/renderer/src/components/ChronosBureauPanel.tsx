/**
 * ChronosBureauPanel — Helm PWA Twin Observer Panel (K515 / A&A #2299, #2300, #2306)
 *
 * Two tabs:
 *   Chronos — per-Augur time-trend statistics (Chronicler tablets)
 *   Bureau  — per-agent reasoning-stream activity + risk-pattern advisory feed
 *
 * Browser-mode: mock data for demo. Daemon-mode: calls /wing/chronos and /wing/bureau.
 */

import React, { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AugurStat {
  augur_id: string
  total_evaluations: number
  total_triggered: number
  fire_rate: number
  last_fire_ts: string | null
}

interface WingTotals {
  total_evaluations: number
  total_triggered: number
  wing_fire_rate: number
}

interface ChronosData {
  query_ts: string
  augur_count: number
  augur_stats: AugurStat[]
  wing_totals: WingTotals
}

interface Advisory {
  id: string
  name: string
  class: string
  triggered: boolean
  advisory_type: string
  message: string
}

interface BureauChunk {
  ts: string
  agent: string
  session: string
  chunk: string
  context: Record<string, unknown>
  advisories: string[]
}

interface BureauData {
  query_ts: string
  total_found: number
  returned: number
  chunks: BureauChunk[]
}

// ── Mock data ─────────────────────────────────────────────────────────────────

function mockChronos(): ChronosData {
  const now = new Date().toISOString()
  return {
    query_ts: now,
    augur_count: 5,
    augur_stats: [
      { augur_id: 'augur_librarian',          total_evaluations: 847, total_triggered: 12, fire_rate: 0.014,  last_fire_ts: new Date(Date.now() - 900000).toISOString() },
      { augur_id: 'augur_toolsmith',          total_evaluations: 847, total_triggered: 4,  fire_rate: 0.0047, last_fire_ts: new Date(Date.now() - 3600000).toISOString() },
      { augur_id: 'augur_pricing',            total_evaluations: 847, total_triggered: 1,  fire_rate: 0.0012, last_fire_ts: new Date(Date.now() - 86400000).toISOString() },
      { augur_id: 'augur_securities_language',total_evaluations: 847, total_triggered: 3,  fire_rate: 0.0035, last_fire_ts: new Date(Date.now() - 7200000).toISOString() },
      { augur_id: 'augur_closeout',           total_evaluations: 847, total_triggered: 7,  fire_rate: 0.0083, last_fire_ts: new Date(Date.now() - 1800000).toISOString() },
    ],
    wing_totals: {
      total_evaluations: 4235,
      total_triggered: 27,
      wing_fire_rate: 0.0064,
    },
  }
}

function mockBureau(): BureauData {
  const now = new Date().toISOString()
  return {
    query_ts: now,
    total_found: 18,
    returned: 5,
    chunks: [
      {
        ts: new Date(Date.now() - 60000).toISOString(),
        agent: 'knight', session: 'K515',
        chunk: 'Checking the build output — all TypeScript errors resolved. Ready to commit.',
        context: { phase: 'close' },
        advisories: ['ec_toolsmith_missing_ratification'],
      },
      {
        ts: new Date(Date.now() - 300000).toISOString(),
        agent: 'bishop', session: 'B126',
        chunk: 'Drafting letter for the Tatiana Schlossburg Health Accords initiative. No code involved.',
        context: { phase: 'compose' },
        advisories: [],
      },
      {
        ts: new Date(Date.now() - 900000).toISOString(),
        agent: 'knight', session: 'K514',
        chunk: 'Architecture review of the Bishop Wing consensus layer. Using parallel Augur evaluation.',
        context: { phase: 'architecture' },
        advisories: [],
      },
    ],
  }
}

// ── Sparkline bar component ───────────────────────────────────────────────────

function FireRateBar({ rate, max }: { rate: number; max: number }) {
  const pct = max > 0 ? Math.min((rate / max) * 100, 100) : 0
  const color = rate > 0.05 ? '#ef4444' : rate > 0.02 ? '#f97316' : '#22c55e'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          height: 10, width: 120, background: '#1e293b', borderRadius: 4,
          overflow: 'hidden', flexShrink: 0,
        }}
      >
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
        {(rate * 100).toFixed(2)}%
      </span>
    </div>
  )
}

// ── Advisory badge ────────────────────────────────────────────────────────────

function AdvisoryBadge({ ids }: { ids: string[] }) {
  if (!ids.length) return <span style={{ color: '#22c55e', fontSize: 11 }}>clean</span>
  return (
    <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {ids.map((id) => (
        <span key={id} style={{
          background: '#7c3aed22', color: '#c084fc', fontSize: 10,
          border: '1px solid #7c3aed44', borderRadius: 4, padding: '1px 5px',
        }}>
          {id.replace('ec_', '')}
        </span>
      ))}
    </span>
  )
}

// ── Chronos tab ───────────────────────────────────────────────────────────────

function ChronosTab({ data }: { data: ChronosData | null }) {
  if (!data) {
    return <p style={{ color: '#64748b', fontSize: 13 }}>Loading Chronos data...</p>
  }

  const maxRate = Math.max(...data.augur_stats.map((s) => s.fire_rate), 0.001)

  const augurLabel = (id: string) =>
    id.replace('augur_', '').replace(/_/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div>
      {/* Wing-wide totals */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20,
      }}>
        {[
          { label: 'Total Evaluations', value: data.wing_totals.total_evaluations.toLocaleString() },
          { label: 'Total Firings', value: data.wing_totals.total_triggered.toLocaleString() },
          { label: 'Wing Fire Rate', value: `${(data.wing_totals.wing_fire_rate * 100).toFixed(2)}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Per-Augur table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              {['Augur', 'Evaluations', 'Firings', 'Fire Rate', 'Last Fire'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: '#64748b', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.augur_stats.map((s) => (
              <tr key={s.augur_id} style={{ borderBottom: '1px solid #0f172a' }}>
                <td style={{ padding: '8px 10px', color: '#e2e8f0', fontWeight: 600 }}>
                  {augurLabel(s.augur_id)}
                </td>
                <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{s.total_evaluations.toLocaleString()}</td>
                <td style={{ padding: '8px 10px', color: '#f97316' }}>{s.total_triggered}</td>
                <td style={{ padding: '8px 10px' }}>
                  <FireRateBar rate={s.fire_rate} max={maxRate} />
                </td>
                <td style={{ padding: '8px 10px', color: '#64748b', fontSize: 11 }}>
                  {s.last_fire_ts ? new Date(s.last_fire_ts).toLocaleTimeString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: '#475569', marginTop: 12 }}>
        Queried at {new Date(data.query_ts).toLocaleTimeString()} · {data.augur_count} Augurs ·
        A&A #2299 (Chronos) / #2300 (Chroniclers)
      </p>
    </div>
  )
}

// ── Bureau tab ────────────────────────────────────────────────────────────────

function BureauTab({ data }: { data: BureauData | null }) {
  if (!data) {
    return <p style={{ color: '#64748b', fontSize: 13 }}>Loading Bureau data...</p>
  }

  const riskChunks = data.chunks.filter((c) => c.advisories.length > 0)
  const cleanChunks = data.chunks.filter((c) => c.advisories.length === 0)

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Chunks', value: data.total_found, color: '#e2e8f0' },
          { label: 'With Advisories', value: riskChunks.length, color: '#f97316' },
          { label: 'Clean', value: cleanChunks.length, color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8,
            padding: '10px 16px', flex: 1,
          }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Advisory feed */}
      {data.chunks.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: 13 }}>No reasoning chunks recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.chunks.map((chunk, i) => (
            <div key={i} style={{
              background: '#0f172a',
              border: `1px solid ${chunk.advisories.length > 0 ? '#7c3aed44' : '#1e293b'}`,
              borderRadius: 8, padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#38bdf8',
                    background: '#0369a122', padding: '1px 7px', borderRadius: 4,
                  }}>
                    {chunk.agent} / {chunk.session}
                  </span>
                  {chunk.context?.phase && (
                    <span style={{ fontSize: 10, color: '#64748b' }}>phase: {String(chunk.context.phase)}</span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap' }}>
                  {new Date(chunk.ts).toLocaleTimeString()}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', lineHeight: 1.5 }}>
                {chunk.chunk.length > 180 ? chunk.chunk.slice(0, 180) + '…' : chunk.chunk}
              </p>
              <AdvisoryBadge ids={chunk.advisories} />
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: '#475569', marginTop: 12 }}>
        Queried at {new Date(data.query_ts).toLocaleTimeString()} · {data.total_found} total chunks ·
        A&A #2306 (Embedded Correspondent + Bureau)
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChronosBureauPanel() {
  const [activeTab, setActiveTab] = useState<'chronos' | 'bureau'>('chronos')
  const [chronosData, setChronosData] = useState<ChronosData | null>(null)
  const [bureauData, setBureauData] = useState<BureauData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'chronos') {
        try {
          const res = await fetch('/wing/chronos')
          if (res.ok) {
            setChronosData(await res.json())
          } else {
            setChronosData(mockChronos())
          }
        } catch {
          setChronosData(mockChronos())
        }
      } else {
        try {
          const res = await fetch('/wing/bureau')
          if (res.ok) {
            setBureauData(await res.json())
          } else {
            setBureauData(mockBureau())
          }
        } catch {
          setBureauData(mockBureau())
        }
      }
      setLastRefresh(new Date().toLocaleTimeString())
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const tabs: { id: 'chronos' | 'bureau'; label: string; aa: string }[] = [
    { id: 'chronos', label: 'Chronos (Component State)', aa: '#2299/#2300' },
    { id: 'bureau',  label: 'Bureau (Reasoning Stream)', aa: '#2306' },
  ]

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
            Twin Observer Pattern
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
            Chronos+Chroniclers (component-state) · Bureau+Correspondents (reasoning-state) ·
            K515 / A&A #2299 #2300 #2306
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
            padding: '6px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
          }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #1e293b', paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
              padding: '8px 16px',
              cursor: 'pointer',
              color: activeTab === tab.id ? '#38bdf8' : '#64748b',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {tab.label}
            <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.7 }}>A&A {tab.aa}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'chronos' ? (
        <ChronosTab data={chronosData} />
      ) : (
        <BureauTab data={bureauData} />
      )}

      {lastRefresh && (
        <p style={{ fontSize: 10, color: '#334155', marginTop: 16 }}>Last refresh: {lastRefresh}</p>
      )}
    </div>
  )
}

export default ChronosBureauPanel
