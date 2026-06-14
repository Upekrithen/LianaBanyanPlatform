// TestItOutTab.tsx — SEG-2 v0.1.57 · SEG-4 v0.1.59 · BP079/BP081 · BP082 v0.2.2 · v0.2.3
// Single Q: 5-question MMLU-Pro / R11 diagnostic workout.
// Plow the Field: multi-domain parallel Plow run with per-domain progress.
// Andon discipline: correct answers grow substrate; wrong answers never written.
// v0.2.2: Substrate seed panel added (Settings → Substrate → Seed from Sealed Bank)
// v0.2.3: Beat-Google Benchmark mode added (BP082 — 5-shot CoT, 3-voter concordance, receipt)

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SubstrateSeedPanel } from './SubstrateSeedPanel';
import { BenchmarkModal } from './BenchmarkModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionResult {
  questionIndex: number;
  question: string;
  modelAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface HistoryRun {
  ts: number;
  score: number;
  total: number;
  model: string;
}

type TabState =
  | { id: 'idle' }
  | { id: 'running'; results: QuestionResult[] }
  | { id: 'complete'; score: number; total: number; results: QuestionResult[] }
  | { id: 'error'; message: string };

// ─── Plow types ───────────────────────────────────────────────────────────────

type PlowDomain =
  | 'math' | 'physics' | 'chemistry' | 'biology' | 'computer_science' | 'engineering'
  | 'history' | 'philosophy' | 'law' | 'business' | 'economics' | 'psychology' | 'health' | 'other';

const ALL_DOMAINS: PlowDomain[] = [
  'math', 'physics', 'chemistry', 'biology', 'computer_science', 'engineering',
  'history', 'philosophy', 'law', 'business', 'economics', 'psychology', 'health', 'other',
];

const DOMAIN_LABELS: Record<PlowDomain, string> = {
  math: 'Math', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology',
  computer_science: 'CS', engineering: 'Engineering', history: 'History',
  philosophy: 'Philosophy', law: 'Law', business: 'Business',
  economics: 'Economics', psychology: 'Psychology', health: 'Health', other: 'Other',
};

interface PlowDomainProgress {
  done: number;
  total: number;
  verified: number;
  rejected: number;
  quarantined: number;
}

type PlowRunState =
  | { id: 'idle' }
  | { id: 'running'; progress: Record<string, PlowDomainProgress>; currentDomain: string | null }
  | { id: 'complete'; progress: Record<string, PlowDomainProgress>; totalPlowed: number; totalVerified: number; totalRejected: number; totalQuarantined: number }
  | { id: 'error'; message: string };

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflowY: 'auto' as const,
    padding: '24px 24px 32px',
    background: '#0a0f1a',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    gap: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#6ee7b7',
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  substrateNote: {
    fontSize: 11,
    color: '#475569',
    background: 'rgba(110,231,183,0.05)',
    border: '1px solid rgba(110,231,183,0.12)',
    borderRadius: 8,
    padding: '8px 12px',
    lineHeight: 1.6,
  },
  primaryBtn: (disabled: boolean): React.CSSProperties => ({
    padding: '11px 24px',
    background: disabled ? 'rgba(110,231,183,0.04)' : 'rgba(110,231,183,0.13)',
    border: disabled ? '1px solid rgba(110,231,183,0.15)' : '1px solid rgba(110,231,183,0.4)',
    borderRadius: 8,
    color: disabled ? '#475569' : '#6ee7b7',
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    alignSelf: 'flex-start',
    transition: 'all 0.15s',
  }),
  historyRow: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(100,116,139,0.15)',
    borderRadius: 8,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressBar: (pct: number): React.CSSProperties => ({
    height: 4,
    borderRadius: 2,
    background: `linear-gradient(to right, #6ee7b7 ${pct}%, rgba(110,231,183,0.1) ${pct}%)`,
    marginBottom: 12,
    flexShrink: 0,
  }),
  questionCard: (isCorrect: boolean | null): React.CSSProperties => ({
    padding: '12px 14px',
    borderRadius: 8,
    border: isCorrect === null
      ? '1px solid rgba(100,116,139,0.2)'
      : isCorrect
        ? '1px solid rgba(110,231,183,0.35)'
        : '1px solid rgba(239,68,68,0.3)',
    background: isCorrect === null
      ? 'rgba(255,255,255,0.02)'
      : isCorrect
        ? 'rgba(110,231,183,0.05)'
        : 'rgba(239,68,68,0.04)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  }),
  qLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  },
  qText: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 1.5,
  },
  answerRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
  },
  answerLabel: (correct: boolean): React.CSSProperties => ({
    fontSize: 11,
    color: correct ? '#6ee7b7' : '#f87171',
    fontWeight: 600,
  }),
  answerText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  badge: (correct: boolean): React.CSSProperties => ({
    fontSize: 16,
    flexShrink: 0,
    color: correct ? '#6ee7b7' : '#f87171',
  }),
  finalScore: (score: number, total: number): React.CSSProperties => ({
    fontSize: 32,
    fontWeight: 800,
    color: score === total ? '#6ee7b7' : score >= total * 0.6 ? '#fbbf24' : '#f87171',
    margin: 0,
  }),
  scoreSub: {
    fontSize: 13,
    color: '#64748b',
  },
  ctaNote: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic' as const,
  },
  errorBox: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.05)',
    color: '#f87171',
    fontSize: 13,
  },
  // ── Plow the Field styles ──────────────────────────────────────────────────
  modeToggleRow: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid rgba(100,116,139,0.18)',
    marginBottom: 0,
    flexShrink: 0,
  },
  modeTab: (active: boolean): React.CSSProperties => ({
    padding: '9px 18px',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #6ee7b7' : '2px solid transparent',
    color: active ? '#6ee7b7' : '#64748b',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.12s',
    marginBottom: -1,
  }),
  domainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '6px 10px',
  },
  domainLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#94a3b8',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  plowControlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  qCountInput: {
    width: 52,
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(100,116,139,0.25)',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'inherit',
    textAlign: 'center' as const,
    outline: 'none',
  },
  domainProgressBar: (pct: number): React.CSSProperties => ({
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(to right, #6ee7b7 ${pct}%, rgba(110,231,183,0.08) ${pct}%)`,
    marginTop: 3,
  }),
  aggregatePanel: {
    background: 'rgba(110,231,183,0.05)',
    border: '1px solid rgba(110,231,183,0.2)',
    borderRadius: 10,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  selectAllRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 6,
  },
  smallLink: {
    fontSize: 11,
    color: '#6ee7b7',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TestItOutTab(): React.ReactElement {
  const [state, setState] = useState<TabState>({ id: 'idle' });
  const [history, setHistory] = useState<HistoryRun[]>([]);
  const runningRef = useRef(false);

  // ── Plow the Field state ──────────────────────────────────────────────────
  const [activeMode, setActiveMode] = useState<'single' | 'plow'>('single');
  const [selectedDomains, setSelectedDomains] = useState<PlowDomain[]>([...ALL_DOMAINS]);
  const [qCount, setQCount] = useState<number>(5);
  const [plowState, setPlowState] = useState<PlowRunState>({ id: 'idle' });
  const plowRunningRef = useRef(false);

  // ── Beat-Google Benchmark state ────────────────────────────────────────────
  const [benchmarkModalOpen, setBenchmarkModalOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    window.amplify?.getTestItOutHistory?.()
      .then((res) => { if (res?.runs) setHistory(res.runs.slice().reverse()); })
      .catch(() => {});
  }, []);

  const handleRun = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setState({ id: 'running', results: [] });

    // Subscribe to per-question progress
    const unsubProgress = window.amplify?.onTestItOutProgress?.((data) => {
      setState((prev) => {
        if (prev.id !== 'running') return prev;
        const next = [...prev.results];
        next[data.questionIndex] = {
          questionIndex: data.questionIndex,
          question: data.question,
          modelAnswer: data.modelAnswer,
          correctAnswer: data.correctAnswer,
          isCorrect: data.isCorrect,
        };
        return { id: 'running', results: next };
      });
    });

    // Subscribe to completion
    const unsubComplete = window.amplify?.onTestItOutComplete?.((data) => {
      setState({
        id: 'complete',
        score: data.score,
        total: data.total,
        results: data.results,
      });
      // Refresh history
      window.amplify?.getTestItOutHistory?.()
        .then((res) => { if (res?.runs) setHistory(res.runs.slice().reverse()); })
        .catch(() => {});
      runningRef.current = false;
    });

    try {
      const result = await window.amplify?.runTestItOut?.();
      if (result?.success === false) {
        const msg = result.error === 'NO_QUESTION_BANK'
          ? 'Question bank not found. Please reinstall or check your installation.'
          : `Run failed: ${result.error ?? 'unknown error'}`;
        setState({ id: 'error', message: msg });
        runningRef.current = false;
      }
    } catch (err) {
      setState({ id: 'error', message: String(err) });
      runningRef.current = false;
    } finally {
      unsubProgress?.();
      unsubComplete?.();
    }
  }, []);

  const handleRunAgain = useCallback(() => {
    setState({ id: 'idle' });
    void handleRun();
  }, [handleRun]);

  // ── Plow the Field handlers ───────────────────────────────────────────────

  const handlePlowDomainToggle = useCallback((domain: PlowDomain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain],
    );
  }, []);

  const handlePlow = useCallback(async () => {
    if (plowRunningRef.current || selectedDomains.length === 0) return;
    plowRunningRef.current = true;

    const progress: Record<string, PlowDomainProgress> = {};
    setPlowState({ id: 'running', progress: {}, currentDomain: selectedDomains[0] ?? null });

    for (const domain of selectedDomains) {
      setPlowState((prev) => ({
        ...prev,
        id: 'running',
        progress: { ...progress },
        currentDomain: domain,
      } as PlowRunState));

      // Load Q bank for domain
      let questions: Array<{ question: string; options: string[]; correct_answer: string; source_id: string; source_category: string }> = [];
      try {
        const res = await window.amplify?.loadDomainBank?.(domain);
        questions = Array.isArray(res) ? res : [];
      } catch { /* bank missing for this domain — skip silently */ }

      const total = Math.min(qCount, questions.length > 0 ? questions.length : qCount);
      progress[domain] = { done: 0, total, verified: 0, rejected: 0, quarantined: 0 };

      if (questions.length === 0) {
        // No bank available; quarantine the whole slot
        progress[domain].quarantined = total;
        progress[domain].done = total;
        setPlowState((prev) => ({ ...prev, id: 'running', progress: { ...progress } } as PlowRunState));
        continue;
      }

      // Shuffle + pick qCount questions (Fisher-Yates partial)
      const pool = [...questions];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const selected = pool.slice(0, total);
      progress[domain].total = selected.length;
      setPlowState((prev) => ({ ...prev, id: 'running', progress: { ...progress } } as PlowRunState));

      for (const q of selected) {
        try {
          const res = await window.amplify?.runAndonReplowLoop?.(q.question, domain);
          if (res?.verdict === 'verified') {
            progress[domain].verified++;
          } else if (res?.verdict === 'rejected') {
            progress[domain].rejected++;
          } else {
            progress[domain].quarantined++;
          }
        } catch {
          progress[domain].quarantined++;
        }
        progress[domain].done++;
        setPlowState((prev) => ({ ...prev, id: 'running', progress: { ...progress } } as PlowRunState));
      }
    }

    const totalPlowed = Object.values(progress).reduce((s, p) => s + p.done, 0);
    const totalVerified = Object.values(progress).reduce((s, p) => s + p.verified, 0);
    const totalRejected = Object.values(progress).reduce((s, p) => s + p.rejected, 0);
    const totalQuarantined = Object.values(progress).reduce((s, p) => s + p.quarantined, 0);

    setPlowState({ id: 'complete', progress, totalPlowed, totalVerified, totalRejected, totalQuarantined });
    plowRunningRef.current = false;
  }, [selectedDomains, qCount]);

  // ── Computed ────────────────────────────────────────────────────────────────

  const lastRun = history[0] ?? null;
  const bestRun = history.length > 0
    ? history.reduce((best, r) => (r.score > best.score ? r : best), history[0])
    : null;

  const TOTAL = 5;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={S.container}>
      {/* ── Mode toggle tabs ─────────────────────────────────────────────────── */}
      <div style={S.modeToggleRow}>
        <button
          type="button"
          style={S.modeTab(activeMode === 'single')}
          onClick={() => setActiveMode('single')}
        >
          Single Q
        </button>
        <button
          type="button"
          style={S.modeTab(activeMode === 'plow')}
          onClick={() => setActiveMode('plow')}
        >
          Plow the Field
        </button>
      </div>

      {/* ── Plow the Field mode ──────────────────────────────────────────────── */}
      {activeMode === 'plow' && (
        <>
          {/* Header */}
          <div style={S.header}>
            <h2 style={S.title}>Plow the Field 🌾</h2>
            <p style={S.subtitle}>
              Run a multi-domain parallel Plow across your selected knowledge domains.
              Verified answers grow your substrate; wrong answers are never written.
            </p>
          </div>

          {/* Idle / config state */}
          {(plowState.id === 'idle' || plowState.id === 'complete') && (
            <>
              {/* Domain selector */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,116,139,0.15)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 8 }}>
                  Domains
                </div>
                <div style={S.selectAllRow}>
                  <button type="button" style={S.smallLink} onClick={() => setSelectedDomains([...ALL_DOMAINS])}>Select All</button>
                  <button type="button" style={S.smallLink} onClick={() => setSelectedDomains([])}>Deselect All</button>
                  <span style={{ fontSize: 11, color: '#475569', marginLeft: 4 }}>{selectedDomains.length}/{ALL_DOMAINS.length} selected</span>
                </div>
                <div style={S.domainGrid}>
                  {ALL_DOMAINS.map((domain) => (
                    <label key={domain} style={S.domainLabel}>
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(domain)}
                        onChange={() => handlePlowDomainToggle(domain)}
                        style={{ accentColor: '#6ee7b7', cursor: 'pointer' }}
                      />
                      {DOMAIN_LABELS[domain]}
                    </label>
                  ))}
                </div>
              </div>

              {/* Q count + Plow button + Beat-Google Benchmark button */}
              <div style={S.plowControlRow}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Questions per domain:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={qCount}
                  onChange={(e) => setQCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                  style={S.qCountInput}
                />
                <button
                  type="button"
                  style={S.primaryBtn(selectedDomains.length === 0)}
                  disabled={selectedDomains.length === 0}
                  onClick={() => { void handlePlow(); }}
                >
                  Plow 🌾
                </button>
                <button
                  type="button"
                  style={{
                    background: 'rgba(99,102,241,0.18)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: 8,
                    color: '#a5b4fc',
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap' as const,
                  }}
                  onClick={() => setBenchmarkModalOpen(true)}
                >
                  🏁 Beat-Google
                </button>
              </div>

              {/* Idle empty state */}
              {plowState.id === 'idle' && (
                <div style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' as const }}>
                  Select domains and hit Plow to grow your substrate across multiple knowledge domains.
                </div>
              )}

              {/* Complete — aggregate stats */}
              {plowState.id === 'complete' && (
                <>
                  <div style={S.aggregatePanel}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7' }}>
                      Your substrate grew by {plowState.totalVerified} eblet{plowState.totalVerified !== 1 ? 's' : ''} this run 🌱
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const }}>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Total plowed: <strong style={{ color: '#e2e8f0' }}>{plowState.totalPlowed}</strong></div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Verified ✓: <strong style={{ color: '#6ee7b7' }}>{plowState.totalVerified}</strong></div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Rejected ✗: <strong style={{ color: '#f87171' }}>{plowState.totalRejected}</strong></div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Quarantined: <strong style={{ color: '#fbbf24' }}>{plowState.totalQuarantined}</strong></div>
                    </div>
                  </div>
                  {/* Per-domain breakdown */}
                  <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Per-domain results</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                    {Object.entries(plowState.progress).map(([domain, prog]) => (
                      <div key={domain} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,116,139,0.12)', borderRadius: 7 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{DOMAIN_LABELS[domain as PlowDomain] ?? domain}</span>
                          <span style={{ fontSize: 11, color: '#475569' }}>{prog.verified}/{prog.total} verified</span>
                        </div>
                        <div style={S.domainProgressBar(prog.total > 0 ? (prog.verified / prog.total) * 100 : 0)} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Running state */}
          {plowState.id === 'running' && (
            <>
              <div style={{ fontSize: 13, color: '#6ee7b7', animation: 'mnemo-pulse 1.5s ease-in-out infinite' }}>
                ◌ Plowing{plowState.currentDomain ? ` · ${DOMAIN_LABELS[plowState.currentDomain as PlowDomain] ?? plowState.currentDomain}` : ''}…
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {Object.entries(plowState.progress).map(([domain, prog]) => (
                  <div key={domain} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,116,139,0.12)', borderRadius: 7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: plowState.currentDomain === domain ? '#6ee7b7' : '#94a3b8' }}>
                        {DOMAIN_LABELS[domain as PlowDomain] ?? domain}
                        {plowState.currentDomain === domain && ' ◌'}
                      </span>
                      <span style={{ fontSize: 11, color: '#475569' }}>{prog.done}/{prog.total}</span>
                    </div>
                    <div style={S.domainProgressBar(prog.total > 0 ? (prog.done / prog.total) * 100 : 0)} />
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
                      {prog.verified > 0 && <span style={{ color: '#6ee7b7' }}>✓{prog.verified} </span>}
                      {prog.rejected > 0 && <span style={{ color: '#f87171' }}>✗{prog.rejected} </span>}
                      {prog.quarantined > 0 && <span style={{ color: '#fbbf24' }}>⚑{prog.quarantined}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" style={S.primaryBtn(true)} disabled>
                Plowing…
              </button>
            </>
          )}

          {/* Error state */}
          {plowState.id === 'error' && (
            <>
              <div style={S.errorBox}>{plowState.message}</div>
              <button type="button" style={S.primaryBtn(false)} onClick={() => setPlowState({ id: 'idle' })}>
                Retry
              </button>
            </>
          )}
        </>
      )}

      {/* ── Single Q mode ────────────────────────────────────────────────────── */}
      {activeMode === 'single' && (
        <>
      {/* Header */}
      <div style={S.header}>
        <h2 style={S.title}>Test It Out</h2>
        <p style={S.subtitle}>
          Run a 5-question diagnostic against your local AI. Correct answers grow your
          substrate — run weekly to improve accuracy over time.
        </p>
      </div>

      {/* Substrate-warming note (always visible) */}
      <div style={S.substrateNote}>
        🌱 Each correct answer grows your local substrate. Run weekly for increasing accuracy.
      </div>

      {/* ── Idle state ───────────────────────────────────────────────────────── */}
      {state.id === 'idle' && (
        <>
          {/* Last-run summary */}
          {lastRun && (
            <div style={S.historyRow}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Last run: <strong style={{ color: '#e2e8f0' }}>{lastRun.score}/{lastRun.total}</strong>
                  {' · '}{formatRelativeTime(lastRun.ts)}
                </div>
                {bestRun && bestRun.ts !== lastRun.ts && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Best: {bestRun.score}/{bestRun.total}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#475569' }}>
                {history.length} run{history.length !== 1 ? 's' : ''} total
              </div>
            </div>
          )}

          <button
            type="button"
            style={S.primaryBtn(false)}
            onClick={() => { void handleRun(); }}
          >
            Run Test It Out
          </button>
        </>
      )}

      {/* ── Running state ────────────────────────────────────────────────────── */}
      {state.id === 'running' && (
        <>
          {/* Progress bar */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {state.results.length}/{TOTAL} questions
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {state.results.filter((r) => r.isCorrect).length} correct so far
              </span>
            </div>
            <div style={S.progressBar((state.results.length / TOTAL) * 100)} />
          </div>

          {/* Per-question results as they arrive */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: TOTAL }).map((_, idx) => {
              const result = state.results[idx];
              if (!result) {
                return (
                  <div key={idx} style={S.questionCard(null)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#475569' }}>Q{idx + 1}</span>
                      {state.results.length === idx && (
                        <span style={{ fontSize: 11, color: '#6ee7b7', animation: 'mnemo-pulse 1.5s ease-in-out infinite' }}>
                          ◌ running…
                        </span>
                      )}
                      {state.results.length < idx && (
                        <span style={{ fontSize: 11, color: '#334155' }}>waiting</span>
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <div key={idx} style={S.questionCard(result.isCorrect)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={S.qLabel}>Q{idx + 1}</span>
                    <span style={S.badge(result.isCorrect)}>{result.isCorrect ? '✓' : '✗'}</span>
                  </div>
                  <div style={S.qText}>{result.question}</div>
                  {!result.isCorrect && (
                    <div style={S.answerRow}>
                      <div style={S.answerLabel(false)}>Model answered:</div>
                      <div style={S.answerText}>{result.modelAnswer.slice(0, 200)}{result.modelAnswer.length > 200 ? '…' : ''}</div>
                      <div style={{ ...S.answerLabel(true), marginTop: 4 }}>Correct answer:</div>
                      <div style={S.answerText}>{result.correctAnswer}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button type="button" style={S.primaryBtn(true)} disabled>
            Running…
          </button>
        </>
      )}

      {/* ── Complete state ────────────────────────────────────────────────────── */}
      {state.id === 'complete' && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={S.finalScore(state.score, state.total)}>
              {state.score}/{state.total}
            </div>
            <div style={S.scoreSub}>
              {state.score === state.total ? 'Perfect!' : state.score >= 3 ? 'Good run.' : 'Keep running to grow your substrate.'}
            </div>
          </div>

          <div style={S.ctaNote}>
            {state.score > 0
              ? `${state.score} correct answer${state.score > 1 ? 's' : ''} written to your local substrate.`
              : 'No substrate writes this run. Keep going — accuracy grows with each run.'}
            {' '}Run again to grow your substrate.
          </div>

          {/* All 5 results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {state.results.map((result) => (
              <div key={result.questionIndex} style={S.questionCard(result.isCorrect)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span style={S.qLabel}>Q{result.questionIndex + 1}</span>
                  <span style={S.badge(result.isCorrect)}>{result.isCorrect ? '✓' : '✗'}</span>
                </div>
                <div style={S.qText}>{result.question}</div>
                {!result.isCorrect && (
                  <div style={S.answerRow}>
                    <div style={S.answerLabel(false)}>Model answered:</div>
                    <div style={S.answerText}>{result.modelAnswer.slice(0, 200)}{result.modelAnswer.length > 200 ? '…' : ''}</div>
                    <div style={{ ...S.answerLabel(true), marginTop: 4 }}>Correct answer:</div>
                    <div style={S.answerText}>{result.correctAnswer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              style={S.primaryBtn(false)}
              onClick={handleRunAgain}
            >
              Run again to grow your substrate
            </button>
          </div>
        </>
      )}

      {/* ── Error state ──────────────────────────────────────────────────────── */}
      {state.id === 'error' && (
        <>
          <div style={S.errorBox}>
            {state.message}
          </div>
          <button
            type="button"
            style={S.primaryBtn(false)}
            onClick={() => setState({ id: 'idle' })}
          >
            Retry
          </button>
        </>
      )}

      {/* History — shown in idle + complete */}
      {(state.id === 'idle' || state.id === 'complete') && history.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            Run history
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.slice(0, 10).map((run, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 12px',
                  borderRadius: 6,
                  background: i === 0 && state.id === 'complete' ? 'rgba(110,231,183,0.06)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(100,116,139,0.12)',
                }}
              >
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  <strong style={{ color: run.score >= 4 ? '#6ee7b7' : run.score >= 3 ? '#fbbf24' : '#f87171' }}>
                    {run.score}/{run.total}
                  </strong>
                  {' · '}{formatRelativeTime(run.ts)}
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>
                  {run.model ? run.model.split(':')[0] : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {/* ── Substrate Settings ────────────────────────────────────────────────── */}
      <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(100,116,139,0.1)' }}>
        <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 10 }}>
          Substrate Settings
        </div>
        <SubstrateSeedPanel />
      </div>

      {/* Beat-Google Benchmark modal — rendered outside the scroll container */}
      {benchmarkModalOpen && (
        <BenchmarkModal onClose={() => setBenchmarkModalOpen(false)} />
      )}
    </div>
  );
}
