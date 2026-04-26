/**
 * WingDashboard — Helm PWA Wing Telemetry View (K514 / A&A #2295 Tier 3)
 *
 * Read-only dashboard: which Augurs are active, recent firings, drift trends.
 * Reads wing_telemetry.jsonl via the Helm daemon /wing/telemetry endpoint.
 * Falls back to localStorage for browser-mode (no daemon available).
 *
 * Five Augurs, one Squadron, one Wing, one Consensus Layer.
 */

import React, { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AugurConfig {
  id: string
  name: string
  class: 'critical' | 'advisory'
  enabled: boolean
  failure_action: string
  description: string
}

interface AugurTrace {
  augur_id: string
  augur_name: string
  augur_class: string
  triggered: boolean
  signal: string | null
  reason: string
  elapsed_ms: number
}

interface TelemetryRecord {
  ts: string
  tool_call: { tool: string; file_path: string }
  augur_results: AugurTrace[]
  triggered_augurs: string[]
  consensus_decision: string
  consensus_reason: string
  elapsed_ms: number
}

// ── Static Augur registry (loaded from wing config; fallback static) ──────────

const KNOWN_AUGURS: AugurConfig[] = [
  {
    id: 'augur_librarian',
    name: 'Augur-Librarian',
    class: 'critical',
    enabled: true,
    failure_action: 'block',
    description: 'Blocks gated artifact writes without prior Librarian consult',
  },
  {
    id: 'augur_toolsmith',
    name: 'Augur-Toolsmith',
    class: 'advisory',
    enabled: true,
    failure_action: 'warn',
    description: 'Warns on ratification/milestone without Toolsmith ts_id',
  },
  {
    id: 'augur_pricing',
    name: 'Augur-Pricing',
    class: 'critical',
    enabled: true,
    failure_action: 'block',
    description: 'Blocks membership pricing != $5/year',
  },
  {
    id: 'augur_securities_language',
    name: 'Augur-Securities-Language',
    class: 'critical',
    enabled: true,
    failure_action: 'block',
    description: 'Blocks forbidden securities-implying terms',
  },
  {
    id: 'augur_closeout',
    name: 'Augur-Closeout',
    class: 'advisory',
    enabled: true,
    failure_action: 'warn',
    description: 'Warns on session close without milestone + Librarian rebuild',
  },
]

// ── Mock telemetry for browser-mode demo ──────────────────────────────────────

function mockRecent(): TelemetryRecord[] {
  const base = Date.now()
  return [
    {
      ts: new Date(base - 30000).toISOString(),
      tool_call: { tool: 'Write', file_path: '/BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K514.md' },
      augur_results: KNOWN_AUGURS.map((a) => ({
        augur_id: a.id, augur_name: a.name, augur_class: a.class,
        triggered: false, signal: null, reason: 'No trigger match.', elapsed_ms: 1,
      })),
      triggered_augurs: [],
      consensus_decision: 'allow',
      consensus_reason: 'No Augur signaled.',
      elapsed_ms: 12,
    },
    {
      ts: new Date(base - 120000).toISOString(),
      tool_call: { tool: 'Write', file_path: '/letters/member_invite.md' },
      augur_results: KNOWN_AUGURS.map((a) => ({
        augur_id: a.id, augur_name: a.name, augur_class: a.class,
        triggered: a.id === 'augur_pricing',
        signal: a.id === 'augur_pricing' ? 'block' : null,
        reason: a.id === 'augur_pricing' ? 'Pricing != $5/year detected.' : 'No trigger match.',
        elapsed_ms: 1,
      })),
      triggered_augurs: ['augur_pricing'],
      consensus_decision: 'block',
      consensus_reason: 'Critical-override: augur_pricing dominates.',
      elapsed_ms: 18,
    },
  ]
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  panel: {
    background: '#0f1117', color: '#e2e8f0', padding: '24px',
    fontFamily: 'system-ui, sans-serif', fontSize: 14,
    maxHeight: '80vh', overflowY: 'auto',
  },
  heading: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 },
  sub: { color: '#475569', fontSize: 12, marginBottom: 20 },
  sectionTitle: {
    fontSize: 11, textTransform: 'uppercase' as const,
    letterSpacing: '0.7px', color: '#475569', fontWeight: 600, marginBottom: 8,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 20 },
  augurCard: {
    background: '#151c2c', border: '1px solid #1e2333', borderRadius: 8,
    padding: '10px 12px',
  },
  augurCardCritical: { borderLeft: '3px solid #ef4444' },
  augurCardAdvisory: { borderLeft: '3px solid #f59e0b' },
  augurName: { fontWeight: 600, fontSize: 13, color: '#f1f5f9', marginBottom: 4 },
  augurDesc: { fontSize: 11, color: '#475569', lineHeight: 1.5 },
  badge: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, marginLeft: 6 },
  classBadgeCritical: { background: '#7f1d1d', color: '#fca5a5' },
  classBadgeAdvisory: { background: '#78350f', color: '#fde68a' },
  separator: { height: 1, background: '#1e2333', margin: '16px 0' },
  record: {
    background: '#151c2c', border: '1px solid #1e2333', borderRadius: 6,
    padding: '10px 12px', marginBottom: 6, fontSize: 12,
  },
  recordHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  decisionBadge: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 },
  decisionAllow: { background: '#14532d', color: '#86efac' },
  decisionWarn: { background: '#78350f', color: '#fde68a' },
  decisionBlock: { background: '#7f1d1d', color: '#fca5a5' },
  filePath: { color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  ts: { color: '#334155', fontSize: 11 },
  traceRow: { fontSize: 11, color: '#475569', marginTop: 3 },
  statsRow: {
    display: 'flex', gap: 16, marginBottom: 16,
    background: '#0a0d13', borderRadius: 8, padding: '12px 16px',
  },
  stat: { textAlign: 'center' as const },
  statNum: { fontSize: 22, fontWeight: 700, color: '#60a5fa' },
  statLabel: { fontSize: 11, color: '#475569', marginTop: 2 },
  refreshBtn: {
    padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    cursor: 'pointer', background: '#1e2333', color: '#94a3b8',
    border: '1px solid #334155',
  },
  emptyState: {
    color: '#334155', fontSize: 13, padding: 24, textAlign: 'center' as const,
    border: '1px dashed #1e2333', borderRadius: 8,
  },
  notice: { fontSize: 11, color: '#4ade80', marginLeft: 8 },
}

function decisionStyle(d: string): React.CSSProperties {
  if (d === 'block') return { ...S.decisionBadge, ...S.decisionBlock }
  if (d === 'warn') return { ...S.decisionBadge, ...S.decisionWarn }
  return { ...S.decisionBadge, ...S.decisionAllow }
}

// ── Telemetry loader ──────────────────────────────────────────────────────────

const DAEMON_PORT = 7712
const LS_TELEMETRY_KEY = 'wing_telemetry_cache'

async function fetchTelemetry(): Promise<TelemetryRecord[]> {
  try {
    const res = await fetch(`http://localhost:${DAEMON_PORT}/wing/telemetry?limit=50`, {
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) {
      const data = await res.json()
      const records: TelemetryRecord[] = Array.isArray(data) ? data : (data.records ?? [])
      if (records.length > 0) {
        localStorage.setItem(LS_TELEMETRY_KEY, JSON.stringify(records.slice(-50)))
      }
      return records.reverse()  // Newest first
    }
  } catch { /* daemon unavailable — fall through */ }

  // Fallback: localStorage cache
  try {
    const cached = JSON.parse(localStorage.getItem(LS_TELEMETRY_KEY) ?? '[]')
    if (Array.isArray(cached) && cached.length > 0) {
      return cached.reverse()
    }
  } catch { /* ignore */ }

  return mockRecent()
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WingDashboard() {
  const [records, setRecords] = useState<TelemetryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchTelemetry()
    setRecords(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function flash(msg: string) {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  // Stats
  const total = records.length
  const blocked = records.filter((r) => r.consensus_decision === 'block').length
  const warned = records.filter((r) => r.consensus_decision === 'warn').length
  const allowed = records.filter((r) => r.consensus_decision === 'allow').length

  // Per-Augur fire counts
  const augurCounts: Record<string, number> = {}
  for (const rec of records) {
    for (const id of rec.triggered_augurs ?? []) {
      augurCounts[id] = (augurCounts[id] ?? 0) + 1
    }
  }

  return (
    <div style={S.panel}>
      <div style={S.heading}>Bishop Discipline Wing</div>
      <div style={S.sub}>
        A&A #2295 Tier 3 — 5 Augurs / 1 Squadron / 1 Consensus Layer
        &nbsp;·&nbsp;
        <span style={{ color: '#2563eb' }}>K514</span>
      </div>

      {/* Augur roster */}
      <div style={S.sectionTitle}>Active Augurs</div>
      <div style={S.grid}>
        {KNOWN_AUGURS.map((a) => (
          <div key={a.id} style={{
            ...S.augurCard,
            ...(a.class === 'critical' ? S.augurCardCritical : S.augurCardAdvisory),
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={S.augurName}>{a.name}</span>
              <span style={{
                ...S.badge,
                ...(a.class === 'critical' ? S.classBadgeCritical : S.classBadgeAdvisory),
              }}>
                {a.class.toUpperCase()}
              </span>
            </div>
            <div style={S.augurDesc}>{a.description}</div>
            {augurCounts[a.id] != null && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                Fired: <strong>{augurCounts[a.id]}</strong> time{augurCounts[a.id] !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.stat}><div style={S.statNum}>{total}</div><div style={S.statLabel}>Total evaluations</div></div>
        <div style={S.stat}><div style={{ ...S.statNum, color: '#ef4444' }}>{blocked}</div><div style={S.statLabel}>Blocked</div></div>
        <div style={S.stat}><div style={{ ...S.statNum, color: '#f59e0b' }}>{warned}</div><div style={S.statLabel}>Warned</div></div>
        <div style={S.stat}><div style={{ ...S.statNum, color: '#4ade80' }}>{allowed}</div><div style={S.statLabel}>Allowed</div></div>
      </div>

      {/* Recent telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={S.sectionTitle}>Recent Evaluations</div>
        <button style={S.refreshBtn} onClick={async () => { await load(); flash('Refreshed.') }}>
          Refresh
        </button>
        {notice && <span style={S.notice}>{notice}</span>}
      </div>

      {loading && (
        <div style={{ color: '#475569', fontSize: 12, padding: 12 }}>Loading telemetry...</div>
      )}

      {!loading && records.length === 0 && (
        <div style={S.emptyState}>
          No telemetry yet. The Wing logs every tool evaluation to wing_telemetry.jsonl.
        </div>
      )}

      {!loading && records.map((rec, idx) => (
        <div key={idx} style={S.record}>
          <div style={S.recordHeader}>
            <span style={decisionStyle(rec.consensus_decision)}>
              {rec.consensus_decision.toUpperCase()}
            </span>
            <span style={S.filePath} title={rec.tool_call?.file_path}>
              {rec.tool_call?.tool ?? 'Write'} · {rec.tool_call?.file_path?.split('/').pop() ?? '—'}
            </span>
            <span style={S.ts}>{new Date(rec.ts).toLocaleTimeString()}</span>
            <span style={{ ...S.ts, marginLeft: 4 }}>{rec.elapsed_ms}ms</span>
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              style={{ ...S.refreshBtn, padding: '2px 8px', marginLeft: 6 }}>
              {expandedIdx === idx ? 'Hide' : 'Details'}
            </button>
          </div>

          {rec.triggered_augurs?.length > 0 && (
            <div style={S.traceRow}>
              Triggered: {rec.triggered_augurs.join(', ')} &nbsp;·&nbsp; {rec.consensus_reason}
            </div>
          )}

          {expandedIdx === idx && (
            <div style={{ marginTop: 8, borderTop: '1px solid #1e2333', paddingTop: 8 }}>
              {(rec.augur_results ?? []).map((ar) => (
                <div key={ar.augur_id} style={{
                  fontSize: 11, color: ar.triggered ? '#f59e0b' : '#334155',
                  marginBottom: 3, display: 'flex', gap: 8,
                }}>
                  <span style={{ minWidth: 28, textAlign: 'right' as const }}>
                    {ar.triggered ? '!' : '.'}
                  </span>
                  <span style={{ minWidth: 180 }}>{ar.augur_name}</span>
                  <span>{ar.reason?.slice(0, 80)}{(ar.reason?.length ?? 0) > 80 ? '...' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
