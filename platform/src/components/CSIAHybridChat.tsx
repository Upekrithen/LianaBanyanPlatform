/**
 * CSIAHybridChat (BP094 / Stage 1)
 * =================================
 * Member-only chat interface for the Cooperative Substrate Inference Architecture.
 * Grounded in ratified catacomb contributions. Shows provenance chain per answer.
 *
 * Routes to: /mnemosynec/csia-hybrid (member-gated)
 *
 * Architecture:
 *   - Questions sent to local CSIA endpoint (http://localhost:3001/api/csia-hybrid)
 *   - ANSWER path: answer + provenance panel + verdict badges + Joule cost
 *   - REFUSAL path: "I don't know yet." + reason + contribute CTA
 *   - Member gate: wraps entire component; non-members see join CTA
 *
 * No em-dashes per BP093 hard canon.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Types (mirrored from librarian-mcp/src/csia_hybrid/inference_pipeline.ts)
// ---------------------------------------------------------------------------

interface CatacombContributor {
  member_id: string;
  display_name: string;
  contribution_timestamp: string;
}

interface EvidenceItem {
  row_id: string;
  text: string;
  full_verdict: { star_chamber: string; scrambler: string; keys_engines: string };
}

interface CSIAAnswerResult {
  status: 'ANSWER';
  answer_text: string;
  provenance: {
    catacomb_row_ids: string[];
    contributors: CatacombContributor[];
    verdict_chain: { star_chamber: 'GREEN'; scrambler: 'GREEN'; keys_engines: 'GREEN' };
    evidence_texts: EvidenceItem[];
    system_prompt_used: string;
  };
  joule_cost_estimate: number;
}

interface CSIARefusalResult {
  status: 'REFUSAL';
  reason: 'evidence_absent' | 'model_deferred' | 'verification_failed';
  failed_verifier?: 'star_chamber' | 'scrambler' | 'keys_engines';
  failed_verifier_reason?: string;
  invite_contribution: true;
}

type CSIAHybridResult = CSIAAnswerResult | CSIARefusalResult;

type ModelChoice = 'gemma4:12b' | 'gemma2:2b';

// ---------------------------------------------------------------------------
// CSIA Endpoint
// ---------------------------------------------------------------------------

const CSIA_ENDPOINT = 'http://localhost:3001/api/csia-hybrid';

async function queryCSSIAHybrid(question: string): Promise<CSIAHybridResult> {
  const res = await fetch(CSIA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`CSIA endpoint error ${res.status}: ${body}`);
  }
  return res.json() as Promise<CSIAHybridResult>;
}

// ---------------------------------------------------------------------------
// Member gate check
// ---------------------------------------------------------------------------

interface MnemosynecMemberRow {
  id: string;
  user_id: string;
}

async function fetchMemberRow(userId: string): Promise<MnemosynecMemberRow | null> {
  const { data, error } = await (supabase as any)
    .from('mnemosynec_members')
    .select('id, user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Green badge for triple verdict display */
function VerdictBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.4)',
        borderRadius: 12,
        padding: '2px 10px',
        fontSize: 11,
        fontWeight: 700,
        color: '#22c55e',
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
      }}
    >
      <span style={{ fontSize: 9 }}>&#x2713;</span> {label} GREEN
    </span>
  );
}

/** Short row_id display (first 8 chars) */
function shortId(rowId: string): string {
  const bare = rowId.replace(/^ph:.*?:/, '').replace(/^[a-z]+:/, '');
  return bare.length > 8 ? bare.slice(0, 8) : bare;
}

/** Human-readable timestamp */
function relativeTime(ts: string): string {
  try {
    const d = new Date(ts);
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return d.toISOString().slice(0, 10);
  } catch {
    return ts;
  }
}

/** Provenance panel shown below a successful ANSWER */
function ProvenancePanel({
  result,
  auditOpen,
  onToggleAudit,
}: {
  result: CSIAAnswerResult;
  auditOpen: boolean;
  onToggleAudit: () => void;
}) {
  const { provenance } = result;

  return (
    <div
      style={{
        marginTop: 20,
        padding: '16px 20px',
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 10,
        fontSize: 13,
      }}
    >
      {/* Evidence used header */}
      <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Evidence used:
      </div>

      {/* Contributor list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {provenance.contributors.map((c, i) => (
          <div key={`${c.member_id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                background: 'rgba(99,102,241,0.15)',
                borderRadius: 4,
                padding: '1px 6px',
                color: '#a5b4fc',
              }}
            >
              {shortId(provenance.catacomb_row_ids[i] ?? c.member_id)}
            </span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{c.display_name}</span>
            <span style={{ color: '#64748b', fontSize: 11 }}>{relativeTime(c.contribution_timestamp)}</span>
          </div>
        ))}
      </div>

      {/* Verdict chain badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <VerdictBadge label="Star Chamber" />
        <VerdictBadge label="Scrambler" />
        <VerdictBadge label="Keys Engines" />
      </div>

      {/* Joule cost */}
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
        This query cost <strong style={{ color: '#94a3b8' }}>{result.joule_cost_estimate} NotCents</strong>
      </div>

      {/* Verify this answer toggle */}
      <button
        onClick={onToggleAudit}
        style={{
          background: 'none',
          border: 'none',
          color: '#6366f1',
          fontSize: 12,
          cursor: 'pointer',
          padding: 0,
          textDecoration: 'underline',
          fontWeight: 600,
        }}
      >
        {auditOpen ? 'Hide audit chain' : 'Verify this answer'}
      </button>

      {/* Audit view (expandable) */}
      {auditOpen && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: 10, fontSize: 11, textTransform: 'uppercase' }}>
            Full Evidence Chain
          </div>
          {provenance.evidence_texts.map((ev, i) => (
            <div key={ev.row_id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < provenance.evidence_texts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6366f1', marginBottom: 4 }}>
                row_id: {ev.row_id}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, lineHeight: 1.5 }}>
                {ev.text}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['star_chamber', 'scrambler', 'keys_engines'] as const).map((k) => (
                  <span
                    key={k}
                    style={{
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: ev.full_verdict[k] === 'GREEN' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: ev.full_verdict[k] === 'GREEN' ? '#22c55e' : '#ef4444',
                      border: `1px solid ${ev.full_verdict[k] === 'GREEN' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    {k.replace(/_/g, ' ')}: {ev.full_verdict[k]}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: 6, fontSize: 11, textTransform: 'uppercase' }}>
              System Prompt Used
            </div>
            <pre
              style={{
                fontSize: 10,
                color: '#64748b',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'rgba(0,0,0,0.2)',
                padding: 8,
                borderRadius: 4,
                maxHeight: 180,
                overflowY: 'auto',
              }}
            >
              {provenance.system_prompt_used}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/** Refusal render with reason and contribute CTA */
function RefusalDisplay({
  result,
  originalQuestion,
  onContribute,
}: {
  result: CSIARefusalResult;
  originalQuestion: string;
  onContribute: () => void;
}) {
  const reasonMessages: Record<CSIARefusalResult['reason'], string> = {
    evidence_absent: 'The cooperative substrate does not yet have ratified evidence for this question.',
    model_deferred: 'The language model declined to answer from available evidence.',
    verification_failed: result.failed_verifier
      ? `Verification failed at ${result.failed_verifier.replace(/_/g, ' ')}. Reason: ${result.failed_verifier_reason ?? 'no reason provided'}`
      : 'Verification failed.',
  };

  return (
    <div
      style={{
        marginTop: 20,
        padding: '20px 24px',
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
        I don't know yet.
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, lineHeight: 1.6 }}>
        {reasonMessages[result.reason]}
      </div>
      <div
        style={{
          padding: '14px 18px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 13, color: '#a5b4fc', marginBottom: 10, fontWeight: 600 }}>
          We don't have evidence for this yet. Contribute to the substrate?
        </div>
        <button
          onClick={onContribute}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Contribute
        </button>
      </div>
    </div>
  );
}

/** Settings panel (collapsible) */
function SettingsPanel({
  open,
  model,
  onModelChange,
}: {
  open: boolean;
  model: ModelChoice;
  onModelChange: (m: ModelChoice) => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'rgba(15,23,42,0.4)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 13,
      }}
    >
      <div style={{ color: '#94a3b8', marginBottom: 10, fontWeight: 600 }}>Model selection</div>
      <div style={{ display: 'flex', gap: 10 }}>
        {(['gemma4:12b', 'gemma2:2b'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModelChange(m)}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              border: `1px solid ${model === m ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
              background: model === m ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: model === m ? '#a5b4fc' : '#64748b',
              fontSize: 12,
              fontWeight: model === m ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {m}
            {m === 'gemma4:12b' && (
              <span style={{ marginLeft: 6, fontSize: 10, color: '#6366f1' }}>(default)</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Spinner shown during pipeline execution */
function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '20px 0',
        color: '#94a3b8',
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          border: '2px solid rgba(99,102,241,0.3)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'csia-spin 0.8s linear infinite',
        }}
      />
      Querying cooperative substrate via pheromone routing...
      <style>{`@keyframes csia-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/** Non-member gate screen */
function MemberGate({ onJoin }: { onJoin: () => void }) {
  return (
    <div
      style={{
        maxWidth: 540,
        margin: '60px auto',
        padding: '40px 32px',
        background: 'linear-gradient(160deg, #0a0f1a 0%, #111827 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 16,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 16 }}>&#127760;</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', margin: '0 0 12px' }}>
        MnemosyneC Members Only
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
        This feature is available to MnemosyneC members. Join to access the cooperative substrate
        inference chat and contribute to ratified knowledge.
      </p>
      <button
        onClick={onJoin}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 28px',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Join MnemosyneC - $5/year
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CSIAHybridChat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CSIAHybridResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelSelection, setModelSelection] = useState<ModelChoice>('gemma4:12b');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Member gate check
  const { data: memberRow, isLoading: memberLoading } = useQuery({
    queryKey: ['mnemosynec_member_row', user?.id ?? ''],
    queryFn: () => (user ? fetchMemberRow(user.id) : Promise.resolve(null)),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isMember = !!memberRow;

  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setAuditOpen(false);
    setLastQuestion(q);

    try {
      const res = await queryCSSIAHybrid(q);
      setResult(res);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [question, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleContribute = () => {
    const encoded = encodeURIComponent(lastQuestion);
    navigate(`/contribute?question=${encoded}`);
  };

  const handleJoin = () => {
    navigate('/membership');
  };

  // Loading states
  if (authLoading || memberLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#94a3b8' }}>
        Loading...
      </div>
    );
  }

  // Auth gate: user must be signed in
  if (!user) {
    return (
      <MemberGate onJoin={() => navigate('/join')} />
    );
  }

  // Membership gate: must have mnemosynec_members row
  if (!isMember) {
    return <MemberGate onJoin={handleJoin} />;
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        color: '#e2e8f0',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 12,
              padding: '3px 12px',
              fontSize: 11,
              fontWeight: 700,
              color: '#a5b4fc',
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}
          >
            CSIA-Hybrid
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12,
              padding: '3px 12px',
              fontSize: 11,
              fontWeight: 700,
              color: '#22c55e',
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}
          >
            Stage 1 Live
          </div>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', color: '#f1f5f9' }}>
          Ask the Cooperative Substrate
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          Answers grounded in member-contributed, triple-verified evidence. If we don't know, we say so.
        </p>
      </div>

      {/* Settings toggle */}
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => setSettingsOpen((s) => !s)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: 12,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span>{settingsOpen ? '&#x25B2;' : '&#x25BC;'}</span>
          Settings: {modelSelection}
        </button>
      </div>

      {/* Settings panel */}
      <SettingsPanel open={settingsOpen} model={modelSelection} onModelChange={setModelSelection} />

      {/* Input area */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the cooperative substrate..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(15,23,42,0.7)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 15,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.7)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.3)'; }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !question.trim()}
          style={{
            padding: '12px 22px',
            background: isLoading || !question.trim() ? 'rgba(99,102,241,0.3)' : '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: isLoading || !question.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap' as const,
          }}
        >
          Send
        </button>
      </div>

      {/* Loading state */}
      {isLoading && <LoadingState />}

      {/* Error state */}
      {error && !isLoading && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            color: '#f87171',
            fontSize: 13,
            marginTop: 16,
          }}
        >
          CSIA endpoint error: {error}
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
            Ensure the librarian-mcp server is running on port 3001.
          </div>
        </div>
      )}

      {/* ANSWER result */}
      {result && result.status === 'ANSWER' && !isLoading && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: '#e2e8f0',
              padding: '18px 20px',
              background: 'rgba(15,23,42,0.5)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 10,
            }}
          >
            {result.answer_text}
          </div>
          <ProvenancePanel
            result={result}
            auditOpen={auditOpen}
            onToggleAudit={() => setAuditOpen((o) => !o)}
          />
        </div>
      )}

      {/* REFUSAL result */}
      {result && result.status === 'REFUSAL' && !isLoading && (
        <RefusalDisplay
          result={result}
          originalQuestion={lastQuestion}
          onContribute={handleContribute}
        />
      )}
    </div>
  );
}

export default CSIAHybridChat;
