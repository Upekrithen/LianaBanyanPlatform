// LeanWelcomeView.tsx — SEG-V0149-P0-LEAN-WELCOME
// Lean, two-screen welcome: Screen 1 = download CTA; Screen 2 = benchmark proof.
// Benchmark data sourced from:
//   librarian-mcp/r10_cross_vendor/results/CADRE_BENCHMARK_RESULTS_BP067.md
//   Big-4 Baseline section, lines 26-33 (BP063 · 2026-05-30 · kappa=0.936)

import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

// ── Benchmark data (EXACT from CADRE_BENCHMARK_RESULTS_BP067.md lines 29-33) ─
const BENCHMARK_ROWS = [
  { model: 'Opus 4.8',                cold: '6.0%',  hot: '89.3%', lift: '+83.3pp' },
  { model: 'GPT-5.5',                 cold: '19.3%', hot: '93.3%', lift: '+74.0pp' },
  { model: 'Gemini-3.5-flash',        cold: '8.0%',  hot: '90.7%', lift: '+82.7pp' },
  { model: 'Llama-single (8b, free)', cold: '6.0%',  hot: '78.0%', lift: '+72.0pp' },
] as const;

export function LeanWelcomeView({ onComplete }: Props): React.ReactElement {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [installStep, setInstallStep] = useState<string | null>(null);
  const [installMessage, setInstallMessage] = useState<string>('');
  const [installProgress, setInstallProgress] = useState<{
    bytesDownloaded: number; totalBytes: number; percentComplete: number;
    speedLabel: string; eta_s: number;
  } | null>(null);
  const [installError, setInstallError] = useState<{ message: string; retryable: boolean } | null>(null);

  useEffect(() => {
    const unsub1 = window.amplify?.onLeanInstallStatus?.((data: { step: string; message: string }) => {
      setInstallStep(data.step);
      setInstallMessage(data.message);
      if (data.step === 'done') onComplete();
    });
    const unsub2 = window.amplify?.onLeanInstallProgress?.((data: typeof installProgress) => {
      setInstallProgress(data);
    });
    const unsub3 = window.amplify?.onLeanInstallError?.((data: { message: string; retryable: boolean }) => {
      setInstallError(data);
    });
    return () => { unsub1?.(); unsub2?.(); unsub3?.(); };
  }, []);

  // ── Shared styles ──────────────────────────────────────────────────────────

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d1117',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflowY: 'auto',
    padding: '24px 16px',
  };

  const card: React.CSSProperties = {
    width: '100%',
    maxWidth: 520,
    padding: '36px 32px',
    background: '#111827',
    border: '1px solid rgba(100, 116, 139, 0.2)',
    borderRadius: 12,
  };

  const mutedText: React.CSSProperties = {
    fontSize: 12,
    color: '#475569',
    lineHeight: 1.5,
  };

  const bodyText: React.CSSProperties = {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '0 0 16px',
  };

  const featureLine: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.5,
    marginBottom: 8,
  };

  const dot: React.CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'rgba(110, 231, 183, 0.5)',
    flexShrink: 0,
    marginTop: 5,
  };

  const ctaButton: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '14px 20px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'background 150ms ease',
  };

  const tagline: React.CSSProperties = {
    textAlign: 'center',
    fontSize: 11,
    color: '#475569',
    marginBottom: 28,
  };

  const ghostLink: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: 0,
    textDecoration: 'underline',
    textDecorationColor: 'rgba(71,85,105,0.4)',
  };

  // ── Step cards ─────────────────────────────────────────────────────────────

  const stepCards = (
    <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
      {[
        { step: '1', label: 'Tell it something', body: 'Share context with your AI once.' },
        { step: '2', label: 'Come back later',   body: 'Start a fresh session any time.' },
        { step: '3', label: 'It remembers',      body: 'Your context loads automatically.' },
      ].map(({ step, label, body }) => (
        <div
          key={step}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(100,116,139,0.15)',
            borderRadius: 8,
            padding: '12px 10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#6ee7b7', marginBottom: 4 }}>{step}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.4 }}>{body}</div>
        </div>
      ))}
    </div>
  );

  // ── Screen 1: Download CTA ─────────────────────────────────────────────────

  if (screen === 1) {
    return (
      <div style={overlay}>
        <div style={card}>

          {/* Mascot */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img
              src="icons/mnemosynec-mark.png"
              alt="MnemosyneC mascot"
              style={{ height: 72, width: 'auto', objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Hero */}
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#e2e8f0',
            lineHeight: 1.2,
            margin: '0 0 4px',
            textAlign: 'center',
          }}>
            Your AI has Amnesia.
          </h1>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 600,
            color: '#6ee7b7',
            lineHeight: 1.2,
            margin: '0 0 8px',
            textAlign: 'center',
          }}>
            Dr. MnemosyneC has the Cure.
          </h2>
          <p style={{ ...mutedText, textAlign: 'center', marginBottom: 24 }}>
            <em>(neh-MOZ-uh-nee)</em> — the Greek goddess of memory
          </p>

          {/* Body */}
          <p style={bodyText}>
            Every time you start a new session, your AI forgets everything. Your projects, your
            preferences, your past conversations — gone. Dr. MnemosyneC gives your AI a permanent,
            private memory that actually stays.
          </p>

          {/* Feature lines */}
          <div style={{ marginBottom: 24 }}>
            <div style={featureLine}>
              <span style={dot} />
              <span>Works alongside ChatGPT, Claude, Gemini, or any AI you already use.</span>
            </div>
            <div style={featureLine}>
              <span style={dot} />
              <span>All your data stays on your own computer. No cloud. No account required.</span>
            </div>
            <div style={featureLine}>
              <span style={dot} />
              <span>Free to use. A $5/year membership unlocks the full cooperative.</span>
            </div>
          </div>

          {/* 3-step explainer */}
          {stepCards}

          {/* Download CTA */}
          <button
            type="button"
            style={ctaButton}
            onClick={() => {
              setInstallError(null);
              window.amplify?.leanInstallStart?.();
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#16a34a'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#22c55e'; }}
          >
            Download MnemosyneC v0.1.49 for Windows
          </button>
          {installStep && installStep !== 'done' && (
            <div style={{ marginTop: 12, fontSize: '0.82rem', color: '#aaa', textAlign: 'center' }}>
              {installMessage}
              {installStep === 'pulling_model' && installProgress && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ background: '#1e2a1e', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      background: '#22c55e', height: '100%', borderRadius: 4,
                      width: `${installProgress.percentComplete.toFixed(1)}%`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ marginTop: 4, color: '#888', fontSize: '0.75rem' }}>
                    {(installProgress.bytesDownloaded / 1e9).toFixed(2)} GB / {(installProgress.totalBytes / 1e9).toFixed(2)} GB
                    · {installProgress.speedLabel}
                    {installProgress.eta_s > 0 && ` · ~${Math.round(installProgress.eta_s / 60)}m left`}
                  </div>
                </div>
              )}
              {installStep === 'waiting_ollama' && (
                <button
                  style={{ marginTop: 8, padding: '6px 16px', background: '#2a3a2a', border: '1px solid #3d7a3d',
                    borderRadius: 6, color: '#7dff7d', cursor: 'pointer', fontSize: '0.82rem' }}
                  onClick={() => window.amplify?.leanInstallStart?.()}
                >
                  Resume after installing Ollama
                </button>
              )}
            </div>
          )}
          {installError && (
            <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#f87171', textAlign: 'center' }}>
              {installError.message}
              {installError.retryable && (
                <button style={{ marginLeft: 8, color: '#f87171', background: 'none', border: 'none',
                  cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setInstallError(null); window.amplify?.leanInstallStart?.(); }}>
                  Retry
                </button>
              )}
            </div>
          )}
          <p style={tagline}>Free forever · No ads · No strings · Data stays on your computer</p>

          {/* Proof ghost link */}
          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(100,116,139,0.12)', paddingTop: 14 }}>
            <button
              type="button"
              style={ghostLink}
              onClick={() => setScreen(2)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#475569'; }}
            >
              Does it actually work? See the proof →
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── Screen 2: Benchmark proof ──────────────────────────────────────────────

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    color: '#6ee7b7',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '6px 10px',
    borderBottom: '1px solid rgba(100,116,139,0.2)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: 13,
    color: '#94a3b8',
    borderBottom: '1px solid rgba(100,116,139,0.08)',
  };

  const hotStyle: React.CSSProperties = {
    ...tdStyle,
    color: '#6ee7b7',
    fontWeight: 700,
  };

  const liftStyle: React.CSSProperties = {
    ...tdStyle,
    color: '#22c55e',
    fontWeight: 700,
  };

  return (
    <div style={overlay}>
      <div style={card}>

        {/* Back link */}
        <button
          type="button"
          style={{ ...ghostLink, marginBottom: 20, display: 'inline-block' }}
          onClick={() => setScreen(1)}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#475569'; }}
        >
          ← Back to Download
        </button>

        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: '#e2e8f0',
          margin: '0 0 10px',
        }}>
          Does it actually work?
        </h2>
        <p style={{ ...bodyText, marginBottom: 20 }}>
          75 questions · 4 AI vendors · real test run 2026-05-30. No tricks.
        </p>

        {/* Benchmark table
            Source: CADRE_BENCHMARK_RESULTS_BP067.md, Big-4 Baseline, lines 26-33
            BP063 · 2026-05-30 · Haiku-graded · kappa=0.936 */}
        <div style={{
          overflowX: 'auto',
          borderRadius: 8,
          border: '1px solid rgba(100,116,139,0.2)',
          marginBottom: 20,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={thStyle}>Model</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>WITHOUT MnemosyneC</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>WITH MnemosyneC</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Lift</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARK_ROWS.map((row) => (
                <tr key={row.model} style={{ background: 'transparent' }}>
                  <td style={tdStyle}>{row.model}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{row.cold}</td>
                  <td style={{ ...hotStyle, textAlign: 'center' }}>{row.hot}</td>
                  <td style={{ ...liftStyle, textAlign: 'center' }}>{row.lift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Banyan Metric explainer */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(100,116,139,0.12)',
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6ee7b7', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Banyan Metric™ — How We Measure
          </div>
          <p style={{ ...mutedText, margin: 0 }}>
            <strong style={{ color: '#94a3b8' }}>Accuracy</strong> = percentage of 75 factual questions
            answered correctly. <strong style={{ color: '#94a3b8' }}>COLD</strong> = standard AI session
            with no substrate loaded (what you get today).{' '}
            <strong style={{ color: '#94a3b8' }}>HOT</strong> = same AI with MnemosyneC substrate
            preloaded. Inter-rater kappa: 0.936 (near-perfect agreement). Test date: 2026-05-30.
            Results hash-verified at BP067. All four vendors tested independently.
          </p>
        </div>

        {/* CTA repeat */}
        <button
          type="button"
          style={ctaButton}
          onClick={() => {
            setInstallError(null);
            window.amplify?.leanInstallStart?.();
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#16a34a'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#22c55e'; }}
        >
          Download MnemosyneC v0.1.49 for Windows
        </button>
        {installStep && installStep !== 'done' && (
          <div style={{ marginTop: 12, fontSize: '0.82rem', color: '#aaa', textAlign: 'center' }}>
            {installMessage}
            {installStep === 'pulling_model' && installProgress && (
              <div style={{ marginTop: 8 }}>
                <div style={{ background: '#1e2a1e', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    background: '#22c55e', height: '100%', borderRadius: 4,
                    width: `${installProgress.percentComplete.toFixed(1)}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ marginTop: 4, color: '#888', fontSize: '0.75rem' }}>
                  {(installProgress.bytesDownloaded / 1e9).toFixed(2)} GB / {(installProgress.totalBytes / 1e9).toFixed(2)} GB
                  · {installProgress.speedLabel}
                  {installProgress.eta_s > 0 && ` · ~${Math.round(installProgress.eta_s / 60)}m left`}
                </div>
              </div>
            )}
            {installStep === 'waiting_ollama' && (
              <button
                style={{ marginTop: 8, padding: '6px 16px', background: '#2a3a2a', border: '1px solid #3d7a3d',
                  borderRadius: 6, color: '#7dff7d', cursor: 'pointer', fontSize: '0.82rem' }}
                onClick={() => window.amplify?.leanInstallStart?.()}
              >
                Resume after installing Ollama
              </button>
            )}
          </div>
        )}
        {installError && (
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#f87171', textAlign: 'center' }}>
            {installError.message}
            {installError.retryable && (
              <button style={{ marginLeft: 8, color: '#f87171', background: 'none', border: 'none',
                cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => { setInstallError(null); window.amplify?.leanInstallStart?.(); }}>
                Retry
              </button>
            )}
          </div>
        )}
        <p style={tagline}>Free forever · No ads · No strings · Data stays on your computer</p>

      </div>
    </div>
  );
}

export default LeanWelcomeView;
