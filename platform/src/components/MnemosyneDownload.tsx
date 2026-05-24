// MnemosyneDownload — KniPr012 TURNKEY rework
// Public landing page for the Mnemosyne CAI Amplifier desktop app.
//
// Features:
//   - Hero collapse on scroll (IntersectionObserver)
//   - "For technical readers" collapsible below the fold
//   - Download CTA + version badge (wired to package version)

import React, { useState, useEffect, useRef } from 'react';

const MNEMOSYNE_VERSION = '0.1.10';
const GITHUB_RELEASES = 'https://github.com/lianabanyan/mnemosyne/releases/latest';
const INSTALLER_WINDOWS = `https://github.com/lianabanyan/mnemosyne/releases/download/v${MNEMOSYNE_VERSION}/Mnemosyne-Setup-${MNEMOSYNE_VERSION}.exe`;
const INSTALLER_MAC = `https://github.com/lianabanyan/mnemosyne/releases/download/v${MNEMOSYNE_VERSION}/Mnemosyne-${MNEMOSYNE_VERSION}.dmg`;

// ─── Hero Section ─────────────────────────────────────────────────────────────

function MnemosyneHero({ scrolled }: { scrolled: boolean }) {
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #0a0f1a 0%, #111827 100%)',
        borderBottom: '1px solid #1e2d45',
        transition: 'padding 0.35s ease, box-shadow 0.35s ease',
        padding: scrolled ? '20px 24px' : '64px 24px 56px',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.35)',
          borderRadius: 20,
          padding: '4px 14px',
          marginBottom: scrolled ? 8 : 20,
          transition: 'margin 0.35s ease',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Alpha · v{MNEMOSYNE_VERSION}
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          margin: 0,
          fontSize: scrolled ? 22 : 42,
          fontWeight: 800,
          color: '#e2e8f0',
          letterSpacing: scrolled ? '0.01em' : '-0.01em',
          lineHeight: 1.15,
          transition: 'font-size 0.35s ease',
        }}>
          Mnemosyne™ · CAI Amplifier
        </h1>

        {!scrolled && (
          <p style={{
            margin: '16px auto 0',
            fontSize: 16,
            color: '#94a3b8',
            lineHeight: 1.7,
            maxWidth: 520,
          }}>
            A read-only AI companion that builds your personal substrate — locally, privately, with zero telemetry.
            Works with Ollama (free) or your Anthropic key. No account required.
          </p>
        )}

        {/* CTA buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: scrolled ? 14 : 32,
          transition: 'margin 0.35s ease',
        }}>
          <a
            href={INSTALLER_WINDOWS}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#1e3a5f',
              border: '1px solid #3b82f6',
              borderRadius: 8,
              color: '#60a5fa',
              fontSize: 13,
              fontWeight: 700,
              padding: '10px 22px',
              textDecoration: 'none',
            }}
          >
            ⬇ Download for Windows
          </a>
          <a
            href={INSTALLER_MAC}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(100,116,139,0.1)',
              border: '1px solid rgba(100,116,139,0.3)',
              borderRadius: 8,
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 22px',
              textDecoration: 'none',
            }}
          >
            ⬇ Download for macOS
          </a>
          <a
            href={GITHUB_RELEASES}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: 12,
              padding: '10px 8px',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            All releases →
          </a>
        </div>

        {!scrolled && (
          <p style={{ fontSize: 10, color: '#475569', marginTop: 16 }}>
            Free to use. Open source (AGPL). No subscription for the desktop app.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── What Mnemosyne Does section ──────────────────────────────────────────────

function WhatItDoes() {
  const features = [
    { icon: '🛡️', title: 'Read-Only Companion', desc: 'Never moves, modifies, or uploads your files. SHA-256 verified Eblet™ records stored in its own data folder only.' },
    { icon: '🪵', title: 'Works Offline by Default', desc: 'Normal mode uses local Ollama — zero cloud cost. Fallback mode needs no AI at all.' },
    { icon: '🔥', title: 'AI Burst (Optional)', desc: 'Add your free Anthropic key for Claude-powered analysis. Pay-per-token with full cost visibility.' },
    { icon: '🌐', title: 'Federation Ready', desc: 'Share substrate snapshots with peers on your local network. Opt-in per folder. Cooperative-first architecture.' },
  ];

  return (
    <section style={{ maxWidth: 720, margin: '48px auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 24, textAlign: 'center' }}>
        What Mnemosyne™ does
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              background: '#111827',
              border: '1px solid #1e2d45',
              borderRadius: 10,
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── For Technical Readers ────────────────────────────────────────────────────

function TechnicalDetails() {
  const [open, setOpen] = useState(false);

  return (
    <section style={{ maxWidth: 720, margin: '0 auto 48px', padding: '0 24px' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          background: 'rgba(100,116,139,0.06)',
          border: '1px solid rgba(100,116,139,0.2)',
          borderRadius: 8,
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          padding: '12px 16px',
          textAlign: 'left',
        }}
      >
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>
          ▶
        </span>
        For technical readers
      </button>

      {open && (
        <div style={{
          background: '#0d1117',
          border: '1px solid #1e2d45',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '20px 20px 16px',
          fontSize: 12,
          color: '#94a3b8',
          lineHeight: 1.8,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginTop: 0, marginBottom: 12 }}>Architecture overview</h3>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: '#e2e8f0' }}>Substrate layer</strong> — SHA-256 hash-addressed Eblet™ records stored in <code style={{ background: '#1a1f2e', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>~/.lb_substrate/</code>. Iron Tablets (machine-generated) + Stone Tablets (human-authored).</li>
            <li><strong style={{ color: '#e2e8f0' }}>Three-mode routing</strong> — AI Burst (Anthropic Claude) → Normal (local Ollama) → Fallback (substrate cache). Automatic cost-aware degradation.</li>
            <li><strong style={{ color: '#e2e8f0' }}>Pantheon personas</strong> — Six mining agents (Miners · Fates · Foragers · Pixies · Shadow Spiders · Sprites) process opted-in folders and write Tablets.</li>
            <li><strong style={{ color: '#e2e8f0' }}>Federation protocol</strong> — mDNS peer discovery + SHA-256 handshake on your local network. No relay server. Cooperative-class sovereignty.</li>
            <li><strong style={{ color: '#e2e8f0' }}>LB Frame overlay</strong> — Electron transparent always-on-top window. Zero pointer-capture in Fallback mode. Mode visible via color + icon + dash-pattern (8-dim accessibility spec).</li>
            <li><strong style={{ color: '#e2e8f0' }}>Open source</strong> — AGPL-3.0. Cooperative Defensive Patent Pledge #2260 applies.</li>
          </ul>

          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginTop: 20, marginBottom: 12 }}>System requirements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { os: 'Windows', req: 'Windows 10+ (x64) · 8GB RAM · 6GB free disk for Ollama model (optional)' },
              { os: 'macOS',   req: 'macOS 12+ (Apple Silicon or Intel) · 8GB RAM · 6GB free for model' },
            ].map((r) => (
              <div key={r.os} style={{ background: '#111827', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{r.os}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{r.req}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, fontSize: 11, color: '#475569' }}>
            Ollama is optional but recommended for Normal mode (private AI).{' '}
            <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>
              Download Ollama free →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function MnemosyneDownload() {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to collapse hero on scroll past fold
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1a',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Sticky hero */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <MnemosyneHero scrolled={scrolled} />
      </div>

      {/* Sentinel — sits just below the initial fold */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Below-fold content */}
      <WhatItDoes />
      <TechnicalDetails />

      {/* Footer CTA */}
      <div style={{
        borderTop: '1px solid #1e2d45',
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <a
          href="https://cephas.lianabanyan.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none' }}
        >
          Cephas Documentation →
        </a>
        <span style={{ margin: '0 12px', color: '#1e2d45' }}>·</span>
        <a
          href={GITHUB_RELEASES}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none' }}
        >
          GitHub Releases →
        </a>
        <span style={{ margin: '0 12px', color: '#1e2d45' }}>·</span>
        <a
          href="/faq"
          style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none' }}
        >
          FAQ →
        </a>
      </div>
    </div>
  );
}

export default MnemosyneDownload;
