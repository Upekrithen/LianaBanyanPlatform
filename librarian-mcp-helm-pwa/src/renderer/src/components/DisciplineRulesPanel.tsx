/**
 * DisciplineRulesPanel — Helm PWA Discipline Rule Editor (K513 / B126)
 *
 * Mirror of the browser extension discipline-rules.html, embedded in Helm PWA.
 * Rules are stored in chrome.storage.local via the extension, OR in local JSON state
 * when running outside extension context (standalone Helm).
 *
 * The Helm daemon enforces rules via /discipline/check endpoint (B.3 from K513 prompt).
 *
 * A&A #2294 — Personal Discipline Enforcement Layer.
 */

import React, { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DisciplineRule {
  id: string
  name: string
  trigger: { type: string; patterns: string[] }
  required_consult: { source: string; domain: string | null; freshness_seconds: number }
  failure_action: 'block' | 'warn' | 'enrich' | 'substitute'
  block_message: string
  enabled: boolean
  scope: string
  created_at: string
}

interface AuditEntry {
  ts: string
  query_snippet: string
  triggered: boolean
  consult_fresh: boolean
  decision: string
}

const EMPTY_RULE: Omit<DisciplineRule, 'id' | 'created_at'> = {
  name: '',
  trigger: { type: 'ai_query_keywords', patterns: [] },
  required_consult: { source: 'cathedral', domain: null, freshness_seconds: 600 },
  failure_action: 'warn',
  block_message: '',
  enabled: true,
  scope: 'personal',
}

const STARTER_RULES: DisciplineRule[] = [
  {
    id: 'starter-cite-source',
    name: 'Warn before unverified factual claims',
    trigger: { type: 'ai_query_keywords', patterns: ['research shows', 'studies show', 'statistics', 'proven', 'scientifically'] },
    required_consult: { source: 'cathedral', domain: null, freshness_seconds: 3600 },
    failure_action: 'warn',
    block_message: 'Heads up: no substrate consulted recently for factual claims.',
    enabled: true, scope: 'personal', created_at: new Date().toISOString(),
  },
  {
    id: 'starter-no-medical',
    name: 'Block medical advice without substrate',
    trigger: { type: 'ai_query_keywords', patterns: ['diagnosis', 'treatment', 'medication', 'symptoms', 'medical advice'] },
    required_consult: { source: 'member_substrate', domain: 'health', freshness_seconds: 86400 },
    failure_action: 'block',
    block_message: 'Medical advice requires your health substrate to be consulted first.',
    enabled: true, scope: 'personal', created_at: new Date().toISOString(),
  },
  {
    id: 'starter-financial-gate',
    name: 'Warn on financial/investment queries',
    trigger: { type: 'ai_query_keywords', patterns: ['invest', 'stocks', 'crypto', 'financial advice', 'portfolio'] },
    required_consult: { source: 'member_substrate', domain: 'finance', freshness_seconds: 86400 },
    failure_action: 'warn',
    block_message: 'Financial queries benefit from consulting your finance substrate first.',
    enabled: true, scope: 'personal', created_at: new Date().toISOString(),
  },
  {
    id: 'starter-projects-enrich',
    name: 'Auto-enrich queries about my projects',
    trigger: { type: 'ai_query_keywords', patterns: ['my project', 'my platform', 'our system', 'our product', 'my app'] },
    required_consult: { source: 'cathedral', domain: null, freshness_seconds: 600 },
    failure_action: 'enrich',
    block_message: '',
    enabled: true, scope: 'personal', created_at: new Date().toISOString(),
  },
  {
    id: 'starter-lb-facts',
    name: 'Enrich Liana Banyan queries with cathedral',
    trigger: { type: 'ai_query_keywords', patterns: ['liana banyan', '83.3%', 'creator percentage', 'romulator', 'cathedral effect'] },
    required_consult: { source: 'cathedral', domain: null, freshness_seconds: 7200 },
    failure_action: 'enrich',
    block_message: '',
    enabled: true, scope: 'personal', created_at: new Date().toISOString(),
  },
]

// ── Local storage helpers (Helm standalone) ───────────────────────────────────

const LS_KEY = 'helm_discipline_rules'

function loadRulesLocal(): DisciplineRule[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch { return [] }
}

function saveRulesLocal(rules: DisciplineRule[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rules))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function freshnessLabel(s: number): string {
  if (s < 120)   return `${s}s`
  if (s < 3600)  return `${Math.round(s / 60)}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}

function genId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ── Styles (inline, matching extension dark theme) ────────────────────────────

const S: Record<string, React.CSSProperties> = {
  panel: { background: '#0f1117', color: '#e2e8f0', padding: '24px', fontFamily: 'system-ui, sans-serif', fontSize: 14, maxHeight: '80vh', overflowY: 'auto' },
  heading: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 },
  sub: { color: '#475569', fontSize: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.7px', color: '#475569', fontWeight: 600, marginBottom: 8 },
  card: { background: '#151c2c', border: '1px solid #1e2333', borderRadius: 8, padding: '12px 14px', marginBottom: 8 },
  cardDisabled: { opacity: 0.55 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  ruleName: { fontWeight: 600, color: '#f1f5f9', flex: 1, fontSize: 13 },
  meta: { fontSize: 11, color: '#475569', lineHeight: 1.6 },
  badge: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 },
  actionsRow: { display: 'flex', gap: 6, marginTop: 8 },
  btn: { padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none' },
  btnPrimary: { background: '#2563eb', color: 'white' },
  btnSecondary: { background: '#1e2333', color: '#94a3b8', border: '1px solid #334155' },
  btnDanger: { background: 'transparent', color: '#f87171', border: '1px solid #7f1d1d' },
  btnSuccess: { background: '#15803d', color: '#dcfce7' },
  separator: { height: 1, background: '#1e2333', margin: '20px 0' },
  form: { background: '#151c2c', border: '1px solid #2563eb', borderRadius: 8, padding: 18, marginTop: 16 },
  formRow: { marginBottom: 12 },
  label: { fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 },
  input: { width: '100%', background: '#0f1117', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontFamily: 'inherit' },
  notice: { fontSize: 12, color: '#4ade80', marginLeft: 8 },
  startersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 },
  starterCard: { background: '#0d1525', border: '1px solid #1e2b3d', borderRadius: 8, padding: '10px 12px', cursor: 'pointer' },
  starterInstalled: { border: '1px solid #15803d', opacity: 0.65, cursor: 'default' },
  emptyState: { color: '#334155', fontSize: 13, padding: 20, textAlign: 'center' as const, border: '1px dashed #1e2333', borderRadius: 8 },
}

const BADGE_COLORS: Record<string, React.CSSProperties> = {
  block:  { background: '#7f1d1d', color: '#fca5a5' },
  warn:   { background: '#78350f', color: '#fde68a' },
  enrich: { background: '#1e3a5f', color: '#93c5fd' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DisciplineRulesPanel() {
  const [rules, setRules] = useState<DisciplineRule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editRule, setEditRule] = useState<Partial<DisciplineRule> | null>(null)
  const [notice, setNotice] = useState('')
  const [auditMap, setAuditMap] = useState<Record<string, AuditEntry[]>>({})

  // Form state
  const [fName, setFName] = useState('')
  const [fPatterns, setFPatterns] = useState('')
  const [fSource, setFSource] = useState('cathedral')
  const [fDomain, setFDomain] = useState('')
  const [fFreshness, setFFreshness] = useState(600)
  const [fAction, setFAction] = useState<DisciplineRule['failure_action']>('warn')
  const [fMessage, setFMessage] = useState('')
  const [fEnabled, setFEnabled] = useState(true)

  const load = useCallback(() => {
    setRules(loadRulesLocal())
  }, [])

  useEffect(() => { load() }, [load])

  function flash(msg: string) {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  function openForm(rule?: DisciplineRule) {
    setEditRule(rule ?? null)
    setFName(rule?.name ?? '')
    setFPatterns((rule?.trigger?.patterns ?? []).join(', '))
    setFSource(rule?.required_consult?.source ?? 'cathedral')
    setFDomain(rule?.required_consult?.domain ?? '')
    setFFreshness(rule?.required_consult?.freshness_seconds ?? 600)
    setFAction(rule?.failure_action ?? 'warn')
    setFMessage(rule?.block_message ?? '')
    setFEnabled(rule?.enabled ?? true)
    setShowForm(true)
  }

  function saveRule() {
    if (!fName.trim()) return
    const patterns = fPatterns.split(',').map((p) => p.trim()).filter(Boolean)
    if (!patterns.length) return
    const id = (editRule as DisciplineRule)?.id ?? genId()
    const rule: DisciplineRule = {
      id, name: fName.trim(),
      trigger: { type: 'ai_query_keywords', patterns },
      required_consult: { source: fSource, domain: fDomain.trim() || null, freshness_seconds: fFreshness },
      failure_action: fAction,
      block_message: fMessage.trim(),
      enabled: fEnabled, scope: 'personal',
      created_at: (editRule as DisciplineRule)?.created_at ?? new Date().toISOString(),
    }
    const existing = loadRulesLocal()
    const idx = existing.findIndex((r) => r.id === id)
    if (idx >= 0) existing[idx] = rule
    else existing.push(rule)
    saveRulesLocal(existing)
    setShowForm(false)
    load()
    flash('Rule saved.')
  }

  function deleteRule(id: string) {
    if (!confirm('Delete this rule?')) return
    const existing = loadRulesLocal().filter((r) => r.id !== id)
    saveRulesLocal(existing)
    load()
    flash('Rule deleted.')
  }

  function toggleRule(id: string, enabled: boolean) {
    const existing = loadRulesLocal()
    const idx = existing.findIndex((r) => r.id === id)
    if (idx >= 0) existing[idx] = { ...existing[idx], enabled }
    saveRulesLocal(existing)
    load()
  }

  function installStarter(starter: DisciplineRule) {
    const existing = loadRulesLocal()
    if (existing.some((r) => r.id === starter.id)) return
    existing.push({ ...starter, created_at: new Date().toISOString() })
    saveRulesLocal(existing)
    load()
    flash('Starter rule installed.')
  }

  const installedIds = rules.map((r) => r.id)

  return (
    <div style={S.panel}>
      <div style={S.heading}>Discipline Rules</div>
      <div style={S.sub}>Personal Augur rules · stored locally · never leaves your device</div>

      {/* Rule list */}
      <div style={S.sectionTitle}>Your Rules ({rules.length})</div>

      {rules.length === 0 && (
        <div style={S.emptyState}>No rules yet. Install a starter below or create your own.</div>
      )}

      {rules.map((rule) => (
        <div key={rule.id} style={{ ...S.card, ...(rule.enabled ? {} : S.cardDisabled) }}>
          <div style={S.cardHeader}>
            <input type="checkbox" checked={rule.enabled}
              onChange={(e) => toggleRule(rule.id, e.target.checked)}
              title="Enable/disable rule" />
            <span style={S.ruleName}>{rule.name}</span>
            <span style={{ ...S.badge, ...(BADGE_COLORS[rule.failure_action] ?? {}) }}>
              {rule.failure_action.toUpperCase()}
            </span>
          </div>
          <div style={S.meta}>
            Keywords: {(rule.trigger?.patterns ?? []).join(', ')} &nbsp;·&nbsp;
            Consult: {rule.required_consult?.source}{rule.required_consult?.domain ? ` › ${rule.required_consult.domain}` : ''} / {freshnessLabel(rule.required_consult?.freshness_seconds ?? 3600)} freshness
          </div>
          <div style={S.actionsRow}>
            <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => openForm(rule)}>Edit</button>
            <button style={{ ...S.btn, ...S.btnSecondary }} onClick={async () => {
              // Simple audit display — toggle
              if (auditMap[rule.id]) {
                setAuditMap((m) => { const n = { ...m }; delete n[rule.id]; return n })
              } else {
                // Stub: show last 5 entries from localStorage audit key
                const key = `lb_audit_${rule.id}`
                const entries: AuditEntry[] = JSON.parse(localStorage.getItem(key) ?? '[]').slice(-5).reverse()
                setAuditMap((m) => ({ ...m, [rule.id]: entries }))
              }
            }}>
              {auditMap[rule.id] ? 'Hide audit' : 'Show audit'}
            </button>
            <button style={{ ...S.btn, ...S.btnDanger }} onClick={() => deleteRule(rule.id)}>Delete</button>
          </div>
          {auditMap[rule.id] && (
            <div style={{ marginTop: 8, borderTop: '1px solid #1e2333', paddingTop: 8 }}>
              {auditMap[rule.id].length === 0
                ? <div style={{ fontSize: 11, color: '#475569' }}>No events recorded yet.</div>
                : auditMap[rule.id].map((e, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                    <span style={{ color: '#334155' }}>{new Date(e.ts).toLocaleString()}</span>
                    {' — '}{e.decision.toUpperCase()} | fresh: {String(e.consult_fresh)} | "{(e.query_snippet ?? '').slice(0, 50)}…"
                  </div>
                ))
              }
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => openForm()}>+ New Rule</button>
        {notice && <span style={S.notice}>{notice}</span>}
      </div>

      <div style={S.separator} />

      {/* Starters */}
      <div style={S.sectionTitle}>Starter Rules</div>
      <div style={S.startersGrid}>
        {STARTER_RULES.map((s) => {
          const installed = installedIds.includes(s.id)
          return (
            <div key={s.id}
              style={{ ...S.starterCard, ...(installed ? S.starterInstalled : {}) }}
              onClick={() => !installed && installStarter(s)}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#475569' }}>
                {(s.trigger.patterns ?? []).slice(0, 3).join(', ')}…
              </div>
              <div style={{ marginTop: 6, fontSize: 10 }}>
                <span style={{ ...S.badge, ...(BADGE_COLORS[s.failure_action] ?? {}), fontSize: 10 }}>
                  {s.failure_action.toUpperCase()}
                </span>
                {installed && <span style={{ color: '#4ade80', marginLeft: 6 }}>✓ Installed</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div style={S.form}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>
            {editRule ? 'Edit Rule' : 'Create Rule'}
          </div>

          <div style={S.formRow}>
            <label style={S.label}>Rule name *</label>
            <input style={S.input} value={fName} onChange={(e) => setFName(e.target.value)}
              placeholder="e.g. Always consult contracts before legal questions" />
          </div>

          <div style={S.formRow}>
            <label style={S.label}>Trigger keywords (comma-separated) *</label>
            <input style={S.input} value={fPatterns} onChange={(e) => setFPatterns(e.target.value)}
              placeholder="contract, NDA, agreement, liability" />
          </div>

          <div style={{ display: 'flex', gap: 12, ...S.formRow }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Consult source</label>
              <select style={S.input} value={fSource} onChange={(e) => setFSource(e.target.value)}>
                <option value="cathedral">Cathedral (LB substrate)</option>
                <option value="member_substrate">My Substrate</option>
                <option value="daemon">Daemon state</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Domain (optional)</label>
              <input style={S.input} value={fDomain} onChange={(e) => setFDomain(e.target.value)}
                placeholder="contracts" />
            </div>
          </div>

          <div style={S.formRow}>
            <label style={S.label}>Freshness: {freshnessLabel(fFreshness)}</label>
            <input type="range" min={60} max={86400} step={60} value={fFreshness}
              onChange={(e) => setFFreshness(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }} />
          </div>

          <div style={S.formRow}>
            <label style={S.label}>Failure action</label>
            <select style={S.input} value={fAction}
              onChange={(e) => setFAction(e.target.value as DisciplineRule['failure_action'])}>
              <option value="warn">Warn — toast, allow submission</option>
              <option value="block">Block — cancel with message</option>
              <option value="enrich">Enrich — prepend context, allow</option>
              <option value="substitute">Substitute — replace query</option>
            </select>
          </div>

          <div style={S.formRow}>
            <label style={S.label}>Block / warn message</label>
            <textarea style={{ ...S.input, minHeight: 56, resize: 'vertical' }}
              value={fMessage} onChange={(e) => setFMessage(e.target.value)}
              placeholder="Consult your substrate first before submitting this query." />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...S.formRow }}>
            <input type="checkbox" checked={fEnabled} onChange={(e) => setFEnabled(e.target.checked)} />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Rule enabled</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={saveRule}>Save Rule</button>
            <button style={{ ...S.btn, ...S.btnSecondary }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
