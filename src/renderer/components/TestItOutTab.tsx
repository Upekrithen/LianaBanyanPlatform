// TestItOutTab.tsx — SEG-2 v0.1.57 · SEG-4 v0.1.59 · BP079/BP081 · BP082 v0.2.2 · v0.2.3 · v0.3.1
// Single Q: 5-question MMLU-Pro / R11 diagnostic workout.
// Plow the Field: multi-domain parallel Plow run with per-domain progress.
// Andon discipline: correct answers grow substrate; wrong answers never written.
// v0.2.2: Substrate seed panel added (Settings → Substrate → Seed from Sealed Bank)
// v0.2.3: Beat-Google Benchmark mode added (BP082 — apples-to-apples handicapped comparison)
// v0.3.1: 3-Condition Mesh Comparison Test (BP082 Founder correction — Cold/Seeded/Loop)

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SubstrateSeedPanel } from './SubstrateSeedPanel';
import { BenchmarkModal } from './BenchmarkModal';
import { MeshComparisonModal } from './MeshComparisonModal';

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
  ebletsWritten: number;
  status: 'pending' | 'running' | 'green' | 'yellow' | 'red';
  currentSpecialist?: string;
  currentQuestion?: number;
}

type PlowRunState =
  | { id: 'idle' }
  | {
      id: 'running';
      progress: Record<string, PlowDomainProgress>;
      currentDomain: string | null;
      currentSpecialist: string | null;
      totalEbletsGrown: number;
      totalQuarantined: number;
      andonBanner: string | null;
      domainIndex: number;
      totalDomains: number;
      questionIndex: number;
      totalQuestions: number;
    }
  | {
      id: 'complete';
      progress: Record<string, PlowDomainProgress>;
      totalPlowed: number;
      totalVerified: number;
      totalRejected: number;
      totalQuarantined: number;
      totalEbletsGrown: number;
      overallStatus: 'GREEN' | 'YELLOW';
    }
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

  // ── Benchmark / Mesh Comparison state ─────────────────────────────────────
  const [benchmarkModalOpen, setBenchmarkModalOpen] = useState(false);
  const [meshModalOpen, setMeshModalOpen] = useState(false);

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

    // Initialize progress state for all selected domains
    const progress: Record<string, PlowDomainProgress> = {};
    for (const domain of selectedDomains) {
      progress[domain] = {
        done: 0, total: qCount, verified: 0, rejected: 0,
        quarantined: 0, ebletsWritten: 0, status: 'pending',
      };
    }

    setPlowState({
      id: 'running',
      progress: { ...progress },
      currentDomain: selectedDomains[0] ?? null,
      currentSpecialist: null,
      totalEbletsGrown: 0,
      totalQuarantined: 0,
      andonBanner: null,
      domainIndex: 0,
      totalDomains: selectedDomains.length,
      questionIndex: 0,
      totalQuestions: qCount,
    });

    let totalEbletsGrown = 0;
    let totalQuarantinedCount = 0;

    // Subscribe to live progress events from the canonical pipeline
    const unsubProgress = window.amplify?.onCanonicalPlowProgress?.((event) => {
      const ev = event as Record<string, unknown>;
      const type = ev.type as string;
      const domain = ev.domain as string | undefined;

      if (domain && progress[domain]) {
        if (type === 'domain-start') {
          progress[domain].status = 'running';
        } else if (type === 'question-start') {
          progress[domain].currentQuestion = ((ev.questionIndex as number | undefined) ?? 0) + 1;
          progress[domain].status = 'running';
        } else if (type === 'specialist-fire') {
          progress[domain].currentSpecialist = ev.specialistName as string ?? null;
        } else if (type === 'scribe-done') {
          const written = (ev.ebletsWrittenThisQuestion as number | undefined) ?? 0;
          progress[domain].ebletsWritten += written;
          totalEbletsGrown += written;
          progress[domain].done++;
          if (written > 0) {
            progress[domain].verified++;
          } else {
            progress[domain].quarantined++;
            totalQuarantinedCount++;
          }
        } else if (type === 'andon-trigger') {
          // Andon banner handled in setPlowState below
        } else if (type === 'domain-done') {
          const domResult = ev.domainResult as Record<string, unknown> | undefined;
          if (domResult) {
            const s = domResult.status as string | undefined;
            progress[domain].status = s === 'GREEN' ? 'green' : s === 'YELLOW' ? 'yellow' : 'red';
          }
          progress[domain].currentSpecialist = undefined;
        }
      }

      const andonBanner = type === 'andon-trigger'
        ? `⚑ Andon cord pulled — domain ${domain ?? '?'} · retry ${(ev.andonRetry as number | undefined) ?? 1}/3`
        : type === 'andon-recovered' ? null
        : undefined; // undefined = no change

      setPlowState((prev) => {
        if (prev.id !== 'running') return prev;
        return {
          ...prev,
          progress: { ...progress },
          currentDomain: (domain ?? prev.currentDomain) as string | null,
          currentSpecialist: domain ? (progress[domain]?.currentSpecialist ?? null) : prev.currentSpecialist,
          totalEbletsGrown,
          totalQuarantined: totalQuarantinedCount,
          andonBanner: andonBanner !== undefined ? andonBanner : prev.andonBanner,
          domainIndex: (ev.domainIndex as number | undefined) ?? prev.domainIndex,
          totalDomains: (ev.totalDomains as number | undefined) ?? prev.totalDomains,
          questionIndex: (ev.questionIndex as number | undefined) ?? prev.questionIndex,
          totalQuestions: (ev.totalQuestions as number | undefined) ?? prev.totalQuestions,
        };
      });
    });

    try {
      const res = await window.amplify?.runCanonicalPlow?.({
        domains: selectedDomains,
        questionsPerDomain: qCount,
      });

      if (res?.ok === false) {
        setPlowState({ id: 'error', message: res.error ?? 'Canonical plow failed' });
        plowRunningRef.current = false;
        unsubProgress?.();
        return;
      }

      // Build final totals from progress
      const totalPlowed = Object.values(progress).reduce((s, p) => s + p.done, 0);
      const totalVerified = Object.values(progress).reduce((s, p) => s + p.verified, 0);
      const totalRejected = Object.values(progress).reduce((s, p) => s + p.rejected, 0);
      const totalQuarantined2 = Object.values(progress).reduce((s, p) => s + p.quarantined, 0);
      const overallStatus: 'GREEN' | 'YELLOW' = totalEbletsGrown >= 5 ? 'GREEN' : 'YELLOW';

      setPlowState({
        id: 'complete',
        progress,
        totalPlowed,
        totalVerified,
        totalRejected,
        totalQuarantined: totalQuarantined2,
        totalEbletsGrown,
        overallStatus,
      });
    } catch (err) {
      setPlowState({ id: 'error', message: String(err) });
    } finally {
      plowRunningRef.current = false;
      unsubProgress?.();
    }
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
              Canonical pipeline v0.3.4: Spider → 9 External Specialists (staggered) → Miner →
              Saladin → Furnace → Three Fates → Scribe. Fetches real domain knowledge from
              Wikipedia, arXiv, OpenAlex, PubMed and more — grows substrate with verified facts.
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
                    background: 'rgba(110,231,183,0.12)',
                    border: '1px solid rgba(110,231,183,0.35)',
                    borderRadius: 8,
                    color: '#6ee7b7',
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap' as const,
                  }}
                  onClick={() => setMeshModalOpen(true)}
                >
                  🔬 Run Mesh Comparison Test
                </button>
                <button
                  type="button"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 8,
                    color: '#64748b',
                    padding: '7px 10px',
                    fontSize: 10,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap' as const,
                  }}
                  title="Apples-to-apples handicapped comparison (v0.2.3 methodology)"
                  onClick={() => setBenchmarkModalOpen(true)}
                >
                  🏁
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
                      Your substrate grew by {plowState.totalEbletsGrown} eblet{plowState.totalEbletsGrown !== 1 ? 's' : ''} this run 🌱
                      {' '}<span style={{ fontSize: 12, color: plowState.overallStatus === 'GREEN' ? '#6ee7b7' : '#fbbf24', fontWeight: 600 }}>
                        {plowState.overallStatus === 'GREEN' ? '● GREEN' : '● YELLOW'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const }}>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Questions plowed: <strong style={{ color: '#e2e8f0' }}>{plowState.totalPlowed}</strong></div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Q with new facts ✓: <strong style={{ color: '#6ee7b7' }}>{plowState.totalVerified}</strong></div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Quarantined: <strong style={{ color: '#fbbf24' }}>{plowState.totalQuarantined}</strong></div>
                    </div>
                  </div>
                  {/* Per-domain breakdown */}
                  <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Per-domain results</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                    {Object.entries(plowState.progress).map(([domain, prog]) => {
                      const dot = prog.status === 'green' ? '🟢'
                        : prog.status === 'yellow' ? '🟡'
                        : prog.status === 'red' ? '🔴' : '⚪';
                      return (
                        <div key={domain} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,116,139,0.12)', borderRadius: 7 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{dot} {DOMAIN_LABELS[domain as PlowDomain] ?? domain}</span>
                            <span style={{ fontSize: 11, color: '#475569' }}>
                              {prog.ebletsWritten} eblets · {prog.verified}/{prog.total} Q
                            </span>
                          </div>
                          <div style={S.domainProgressBar(prog.total > 0 ? (prog.ebletsWritten / Math.max(1, prog.total * 2)) * 100 : 0)} />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* Running state — canonical pipeline live view */}
          {plowState.id === 'running' && (
            <>
              {/* Live status header */}
              <div style={{ fontSize: 13, color: '#6ee7b7', animation: 'mnemo-pulse 1.5s ease-in-out infinite', display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <div>
                  ◌ Domain {plowState.domainIndex + 1}/{plowState.totalDomains}
                  {plowState.currentDomain ? ` · ${DOMAIN_LABELS[plowState.currentDomain as PlowDomain] ?? plowState.currentDomain}` : ''}
                  {' · '}Q {plowState.questionIndex + 1}/{plowState.totalQuestions}
                  {plowState.currentSpecialist ? ` · ${plowState.currentSpecialist}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', gap: 16 }}>
                  <span>🌱 Substrate grew by <strong style={{ color: '#6ee7b7' }}>{plowState.totalEbletsGrown}</strong> eblets</span>
                  {plowState.totalQuarantined > 0 && (
                    <span>⚑ <strong style={{ color: '#fbbf24' }}>{plowState.totalQuarantined}</strong> quarantined</span>
                  )}
                </div>
              </div>

              {/* Andon cord banner */}
              {plowState.andonBanner && (
                <div style={{
                  padding: '8px 14px',
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: 7,
                  fontSize: 12,
                  color: '#fbbf24',
                  fontWeight: 600,
                }}>
                  {plowState.andonBanner}
                </div>
              )}

              {/* Per-domain status grid */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {Object.entries(plowState.progress).map(([domain, prog]) => {
                  const isActive = plowState.currentDomain === domain;
                  const statusColor = prog.status === 'green' ? '#6ee7b7'
                    : prog.status === 'yellow' ? '#fbbf24'
                    : prog.status === 'red' ? '#f87171'
                    : isActive ? '#6ee7b7' : '#94a3b8';
                  const statusDot = prog.status === 'green' ? '🟢'
                    : prog.status === 'yellow' ? '🟡'
                    : prog.status === 'red' ? '🔴'
                    : prog.status === 'running' ? '◌' : '⚪';
                  return (
                    <div key={domain} style={{
                      padding: '8px 12px',
                      background: isActive ? 'rgba(110,231,183,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? 'rgba(110,231,183,0.2)' : 'rgba(100,116,139,0.12)'}`,
                      borderRadius: 7,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: statusColor, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span>{statusDot}</span>
                          {DOMAIN_LABELS[domain as PlowDomain] ?? domain}
                          {isActive && prog.currentSpecialist && (
                            <span style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic' as const }}>· {prog.currentSpecialist}</span>
                          )}
                        </span>
                        <span style={{ fontSize: 11, color: '#475569' }}>
                          Q{prog.done}/{prog.total}
                          {prog.ebletsWritten > 0 && <span style={{ color: '#6ee7b7', marginLeft: 6 }}>+{prog.ebletsWritten} eblets</span>}
                        </span>
                      </div>
                      <div style={S.domainProgressBar(prog.total > 0 ? (prog.done / prog.total) * 100 : 0)} />
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
                        {prog.verified > 0 && <span style={{ color: '#6ee7b7' }}>✓{prog.verified} </span>}
                        {prog.quarantined > 0 && <span style={{ color: '#fbbf24' }}>⚑{prog.quarantined}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                style={{ ...S.primaryBtn(false), background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                onClick={() => { void window.amplify?.cancelCanonicalPlow?.(); }}
              >
                Cancel Plow
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

      {/* Apples-to-apples handicapped comparison (v0.2.3 advanced mode) */}
      {benchmarkModalOpen && (
        <BenchmarkModal onClose={() => setBenchmarkModalOpen(false)} />
      )}

      {/* 3-Condition Mesh Comparison Test (v0.3.1 primary benchmark) */}
      {meshModalOpen && (
        <MeshComparisonModal onClose={() => setMeshModalOpen(false)} />
      )}
    </div>
  );
}
