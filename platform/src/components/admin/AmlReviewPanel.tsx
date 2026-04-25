/**
 * AML CURATOR REVIEW PANEL — K504 Phase C
 * =========================================
 * Admin UI at /admin/aml_review for high-Rep curators to review AML flags.
 *
 * GUARDRAILS IN UI:
 *   - dispatch_sar verdict greyed out with tooltip if regulatory classification is
 *     'unclassified' or 'not_msb' (SAR gate enforced at both UI and TypeScript layer)
 *   - No auto-suspend button (curator may only set verdict; suspension is separate workflow)
 *   - Curator notes must be member-respectful (instruction shown in UI)
 *   - SAR-dispatch triggers confirmation dialog explaining internal-draft-only semantics
 */

import React, { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type AmlFlagType =
  | 'aml_concentration_high'
  | 'aml_velocity_spike'
  | 'aml_new_account_high_velocity'
  | 'aml_coordinated_ring'
  | 'aml_trust_match_crossref';

type Verdict = 'pending' | 'legitimate' | 'escalate' | 'dispatch_sar';
type RegClassification = 'unclassified' | 'not_msb' | 'msb_state_only' | 'msb_federal';

interface AmlFlagSummary {
  id: string;
  member_id: string;
  flag_type: AmlFlagType;
  triggered_at: string;
  evidence_json: Record<string, unknown>;
  verdict: Verdict;
  notes: string | null;
}

interface MemberProfile {
  id: string;
  display_name: string;
  signup_date: string;
  total_transactions: number;
  prior_flag_count: number;
}

// ── Flag-type labels ──────────────────────────────────────────────────────────

const FLAG_LABELS: Record<AmlFlagType, { label: string; color: string; icon: string }> = {
  aml_concentration_high: { label: 'High Concentration', color: '#f59e0b', icon: '🔶' },
  aml_velocity_spike: { label: 'Velocity Spike', color: '#f97316', icon: '⚡' },
  aml_new_account_high_velocity: { label: 'New-Account High Velocity', color: '#ef4444', icon: '🆕' },
  aml_coordinated_ring: { label: 'Coordinated Ring', color: '#dc2626', icon: '🔄' },
  aml_trust_match_crossref: { label: 'Ring + Trust Match Cross-Ref', color: '#7c3aed', icon: '⚠️' },
};

// ── Evidence parser ───────────────────────────────────────────────────────────

function EvidenceTable({ evidence }: { evidence: Record<string, unknown> }) {
  const entries = Object.entries(evidence).filter(([k]) => !k.includes('_applied'));
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <tbody>
        {entries.map(([key, val]) => (
          <tr key={key} style={{ borderBottom: '1px solid #1e2333' }}>
            <td style={{ padding: '6px 10px', color: '#64748b', fontFamily: 'monospace', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{key}</td>
            <td style={{ padding: '6px 10px', color: '#e2e8f0', wordBreak: 'break-all' }}>
              {Array.isArray(val) ? val.join(', ') : String(val)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Verdict buttons ───────────────────────────────────────────────────────────

function VerdictButtons({
  currentVerdict,
  sarEnabled,
  onVerdict,
  disabled,
}: {
  currentVerdict: Verdict;
  sarEnabled: boolean;
  onVerdict: (v: Verdict, notes: string) => void;
  disabled: boolean;
}) {
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState<Verdict | null>(null);

  function handleClick(verdict: Verdict) {
    if (verdict === 'dispatch_sar') {
      setConfirming('dispatch_sar');
      return;
    }
    onVerdict(verdict, notes);
  }

  function confirmSar() {
    onVerdict('dispatch_sar', notes);
    setConfirming(null);
  }

  const S = {
    btn: (active: boolean, color: string, enabled: boolean = true): React.CSSProperties => ({
      padding: '8px 16px',
      borderRadius: '7px',
      border: `1px solid ${enabled ? color : '#1e2333'}`,
      background: active ? color + '22' : 'transparent',
      color: enabled ? color : '#334155',
      cursor: enabled ? 'pointer' : 'not-allowed',
      fontSize: '13px',
      fontWeight: 600,
      opacity: enabled ? 1 : 0.5,
    }),
    textarea: {
      width: '100%',
      background: '#0f1117',
      border: '1px solid #334155',
      borderRadius: '6px',
      padding: '10px 12px',
      color: '#e2e8f0',
      fontSize: '13px',
      fontFamily: 'inherit',
      resize: 'vertical' as const,
      minHeight: '72px',
      marginBottom: '10px',
    },
  };

  return (
    <div>
      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
        Curator notes (required for escalate or dispatch_sar; must be member-respectful):
      </div>
      <textarea
        style={S.textarea}
        placeholder="Describe your reasoning…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={disabled}
      />
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          style={S.btn(currentVerdict === 'legitimate', '#22c55e')}
          onClick={() => handleClick('legitimate')}
          disabled={disabled}
        >
          ✓ Legitimate
        </button>
        <button
          style={S.btn(currentVerdict === 'escalate', '#f59e0b')}
          onClick={() => handleClick('escalate')}
          disabled={disabled}
        >
          ↑ Escalate to senior curator
        </button>
        <div title={sarEnabled ? '' : 'SAR dispatch requires regulatory classification confirmation by counsel. Current status: unclassified or not_msb.'}>
          <button
            style={S.btn(currentVerdict === 'dispatch_sar', '#ef4444', sarEnabled)}
            onClick={() => sarEnabled && handleClick('dispatch_sar')}
            disabled={disabled || !sarEnabled}
          >
            ⚖ Dispatch SAR draft {!sarEnabled && '🔒'}
          </button>
        </div>
      </div>

      {/* SAR confirmation dialog */}
      {confirming === 'dispatch_sar' && (
        <div style={{
          marginTop: '16px',
          background: '#2a0f0f',
          border: '1px solid #ef4444',
          borderRadius: '10px',
          padding: '16px',
        }}>
          <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>Confirm SAR draft dispatch</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
            This will generate an internal SAR pre-populated draft and send it to the LB compliance email.
            The draft will <strong style={{ color: '#f1f5f9' }}>NOT be auto-filed</strong> with FinCEN.
            Counsel must review and file manually if appropriate.
            This action is logged to the immutable SAR audit log.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{ ...S.btn(false, '#ef4444'), background: '#ef444422' }}
              onClick={confirmSar}
            >
              Confirm — generate draft (internal only)
            </button>
            <button
              style={S.btn(false, '#475569')}
              onClick={() => setConfirming(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Flag detail panel ─────────────────────────────────────────────────────────

function FlagDetailPanel({
  flag,
  member,
  sarEnabled,
  onVerdictSet,
}: {
  flag: AmlFlagSummary;
  member: MemberProfile | null;
  sarEnabled: boolean;
  onVerdictSet: (flagId: string, verdict: Verdict, notes: string) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const meta = FLAG_LABELS[flag.flag_type];

  async function handleVerdict(verdict: Verdict, notes: string) {
    if (verdict !== 'legitimate' && !notes.trim()) {
      alert('Notes are required for escalate and dispatch_sar verdicts.');
      return;
    }
    setSubmitting(true);
    await onVerdictSet(flag.id, verdict, notes);
    setSubmitting(false);
    setSubmitted(true);
  }

  const S = {
    card: { background: '#151c2c', border: '1px solid #1e2333', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    header: { padding: '14px 20px', background: '#0a0d13', borderBottom: '1px solid #1e2333', display: 'flex', alignItems: 'center', gap: '10px' },
    body: { padding: '20px' },
    section: { marginBottom: '20px' },
    label: { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.6px', color: '#475569', marginBottom: '8px', fontWeight: 600 },
  };

  return (
    <div style={S.card}>
      <div style={S.header}>
        <span style={{ fontSize: '20px' }}>{meta.icon}</span>
        <div>
          <div style={{ fontWeight: 600, color: meta.color }}>{meta.label}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>
            Triggered {new Date(flag.triggered_at).toLocaleString()} · Flag ID: {flag.id.slice(0, 8)}…
          </div>
        </div>
        {flag.flag_type === 'aml_trust_match_crossref' && (
          <div style={{
            marginLeft: 'auto',
            background: '#2a1a3e',
            border: '1px solid #7c3aed',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '11px',
            color: '#a78bfa',
          }}>
            Elevated confidence — Trust Match cross-reference
          </div>
        )}
      </div>

      <div style={S.body}>
        {/* Member profile */}
        {member && (
          <div style={S.section}>
            <div style={S.label}>Member account</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                ['Account opened', new Date(member.signup_date).toLocaleDateString()],
                ['Total transactions', member.total_transactions],
                ['Prior AML flags', member.prior_flag_count],
              ].map(([label, val]) => (
                <div key={String(label)} style={{ background: '#0f1117', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence */}
        <div style={S.section}>
          <div style={S.label}>Evidence</div>
          <div style={{ background: '#0f1117', borderRadius: '8px', overflow: 'hidden' }}>
            <EvidenceTable evidence={flag.evidence_json} />
          </div>
        </div>

        {/* Verdict */}
        {!submitted ? (
          <div style={S.section}>
            <div style={S.label}>Curator decision</div>
            <div style={{
              background: '#0a0d13',
              border: '1px solid #1e2333',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#475569',
            }}>
              <strong style={{ color: '#64748b' }}>Reminder:</strong> Do not auto-suspend accounts.
              Suspension is a separate workflow after review. Notes must be member-respectful — no
              speculation about ethnicity, origin, or religion. Your review activity is logged
              to the immutable AML audit log.
            </div>
            <VerdictButtons
              currentVerdict={flag.verdict}
              sarEnabled={sarEnabled}
              onVerdict={handleVerdict}
              disabled={submitting}
            />
          </div>
        ) : (
          <div style={{ background: '#0f2a1c', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px 16px', color: '#4ade80', fontSize: '13px' }}>
            ✓ Verdict submitted. Flag resolved.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Curator opt-in form ───────────────────────────────────────────────────────

function CuratorOptInForm({ onOptIn }: { onOptIn: () => void }) {
  const [checked, setChecked] = useState({ confidentiality: false, training: false, legal: false });
  const allChecked = Object.values(checked).every(Boolean);

  return (
    <div style={{ background: '#151c2c', border: '1px solid #1e2333', borderRadius: '12px', padding: '24px', maxWidth: '540px', margin: '0 auto' }}>
      <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f1f5f9' }}>Join AML Review Team</div>
      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        High-Rep members (≥ 2000 XP) can volunteer for the AML-review curator role. You earn audit-XP on completed reviews. Cap: 10 reviews per week.
      </div>
      {[
        { key: 'confidentiality', text: 'I understand that all AML review information is strictly confidential and must not be shared outside the review process.' },
        { key: 'training', text: 'I have completed the AML-review training module (link to be provided by LB compliance team).' },
        { key: 'legal', text: 'I understand that my review constitutes an internal platform action, not legal advice. SAR filing requires counsel review and cannot be triggered unilaterally.' },
      ].map(({ key, text }) => (
        <label key={key} style={{ display: 'flex', gap: '12px', marginBottom: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={checked[key as keyof typeof checked]}
            onChange={() => setChecked((c) => ({ ...c, [key]: !c[key as keyof typeof checked] }))}
            style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}
          />
          <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{text}</span>
        </label>
      ))}
      <button
        onClick={onOptIn}
        disabled={!allChecked}
        style={{
          padding: '10px 24px',
          background: allChecked ? '#2563eb' : '#1e2333',
          color: allChecked ? 'white' : '#334155',
          border: 'none',
          borderRadius: '7px',
          fontWeight: 600,
          cursor: allChecked ? 'pointer' : 'not-allowed',
          fontSize: '14px',
        }}
      >
        Join AML Review Team
      </button>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export interface AmlReviewPanelProps {
  flags: AmlFlagSummary[];
  members: Record<string, MemberProfile>;
  sarEnabled: boolean;
  isCurator: boolean;
  onVerdictSet: (flagId: string, verdict: Verdict, notes: string) => Promise<void>;
  onCuratorOptIn: () => Promise<void>;
}

export function AmlReviewPanel({
  flags,
  members,
  sarEnabled,
  isCurator,
  onVerdictSet,
  onCuratorOptIn,
}: AmlReviewPanelProps) {
  const [optingIn, setOptingIn] = useState(false);
  const pendingFlags = flags.filter((f) => f.verdict === 'pending');

  const S = {
    root: {
      padding: '24px',
      background: '#0f1117',
      minHeight: '100vh',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    header: { marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#475569' },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '28px',
    },
    stat: { background: '#151c2c', border: '1px solid #1e2333', borderRadius: '10px', padding: '14px 18px' },
    statValue: { fontSize: '24px', fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' },
    statLabel: { fontSize: '12px', color: '#475569' },
  };

  const byType = Object.entries(FLAG_LABELS).map(([type, meta]) => ({
    type,
    meta,
    count: pendingFlags.filter((f) => f.flag_type === type).length,
  }));

  if (!isCurator && !optingIn) {
    return (
      <div style={S.root}>
        <div style={S.header}>
          <div style={S.title}>⚖ AML Review Queue</div>
          <div style={S.sub}>Curator access required</div>
        </div>
        <CuratorOptInForm onOptIn={() => { onCuratorOptIn(); setOptingIn(true); }} />
      </div>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.title}>⚖ AML Review Queue</div>
        <div style={S.sub}>
          {pendingFlags.length} pending flag{pendingFlags.length !== 1 ? 's' : ''}
          {!sarEnabled && (
            <span style={{ marginLeft: '16px', color: '#f59e0b', fontSize: '12px' }}>
              ⚠ SAR dispatch locked — awaiting counsel regulatory classification
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {byType.filter((t) => t.count > 0).map(({ type, meta, count }) => (
          <div key={type} style={S.stat}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{meta.icon}</div>
            <div style={{ ...S.statValue, color: meta.color }}>{count}</div>
            <div style={S.statLabel}>{meta.label}</div>
          </div>
        ))}
        {pendingFlags.length === 0 && (
          <div style={{ ...S.stat, gridColumn: '1 / -1', textAlign: 'center', color: '#475569', padding: '32px' }}>
            ✓ No pending flags. AML queue is clear.
          </div>
        )}
      </div>

      {/* Flag list */}
      {pendingFlags.map((flag) => (
        <FlagDetailPanel
          key={flag.id}
          flag={flag}
          member={members[flag.member_id] ?? null}
          sarEnabled={sarEnabled}
          onVerdictSet={onVerdictSet}
        />
      ))}
    </div>
  );
}
