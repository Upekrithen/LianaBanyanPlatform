// MnemosyneC · v0.2.0 · BP082 · 2026-06-13
// §2 Truth-Always · §3 Sonnet 4.6 · Founder-ratified
//
// LeanHelpTab — 4th tab in LeanShell.
// MnemosyneC as Substrate Filter: bring your own AI/social surface,
// we add an eblet + Marks layer ON TOP.
//
// SEG-1: 4th "Help" tab added to LeanShell tab strip (in LeanShell.tsx).
// SEG-2: This component — LeanHelpTab scaffold with FAQ + Connect cards + Coming Soon + Guild footer.
// SEG-3: Discord OAuth connect card (requires DISCORD_OAUTH_CLIENT_ID env var — see yoke-return).
// SEG-4: Reddit OAuth connect card (requires REDDIT_OAUTH_CLIENT_ID env var — see yoke-return).
// SEG-5: Eblet capture wired via substrateWrite IPC (per-message 📚 Save button).
// SEG-6: Coming Soon tiles — Chrome extension, Pawn/Perplexity, Cue Deck Cards.
// SEG-7: Marks economy — connect (5 ea) + capture (1 ea). Counter in header.
// SEG-8: Guild Incentives footer with Marks tiers table.
// SEG-9: Privacy — tokens via safeStorage (main process), never localStorage or renderer.

import React, { useState, useCallback } from 'react';
import { FAQCard } from './help/FAQCard';
import { ConnectDiscordCard } from './help/ConnectDiscordCard';
import { ConnectRedditCard } from './help/ConnectRedditCard';
import { ComingSoonCard } from './help/ComingSoonCard';
import { GuildIncentivesFooter } from './help/GuildIncentivesFooter';

const LS_MARKS_KEY = 'mnemo_help_marks_earned';

function loadLocalMarks(): number {
  return parseInt(localStorage.getItem(LS_MARKS_KEY) ?? '0', 10) || 0;
}

function saveLocalMarks(n: number) {
  localStorage.setItem(LS_MARKS_KEY, String(n));
}

export function LeanHelpTab() {
  const [marks, setMarks] = useState<number>(loadLocalMarks);

  const handleMarksAccrued = useCallback((delta: number) => {
    setMarks((prev) => {
      const next = prev + delta;
      saveLocalMarks(next);
      return next;
    });
  }, []);

  return (
    <div style={s.outer}>
      {/* Header */}
      <div style={s.headerBar}>
        <div style={{ flex: 1 }}>
          <h1 style={s.h1}>Help &amp; Community</h1>
          <p style={s.subtitle}>Get help. Join the Guild. Earn Marks for helping others.</p>
        </div>
        {marks > 0 && (
          <div style={s.marksCounter} title="Marks earned via Help tab actions">
            ✦ {marks} Marks earned
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div style={s.scroll}>
        {/* FAQ + Install Guide */}
        <FAQCard />

        <div style={s.sectionLabel}>Community Connections</div>

        {/* Discord */}
        <ConnectDiscordCard onMarksAccrued={handleMarksAccrued} />

        {/* Reddit */}
        <ConnectRedditCard onMarksAccrued={handleMarksAccrued} />

        <div style={s.sectionLabel}>Coming Soon</div>

        {/* Coming Soon tiles — SEG-6 */}
        <ComingSoonCard
          icon="🌐"
          name="Chrome Browser Extension"
          why="Use ChatGPT, Claude.ai, Gemini, or any AI you already use in your browser — MnemosyneC adds a Save-to-Substrate button to every response. Your Marks accrue as you capture."
          eta="v0.2.x"
        />
        <ComingSoonCard
          icon="🦅"
          name="Perplexity (Pawn) Filter"
          why="Pawn has no MCP. We built the filter as a content-script overlay — same pattern as Discord and Reddit. Capture the answers worth keeping."
          eta="v0.2.x"
        />
        <ComingSoonCard
          icon="🃏"
          name="Cue Deck Cards (Advanced)"
          why="Turn captured eblets into shareable Cue Cards. Move to the Advanced tab when you're ready to publish your knowledge."
          eta="v0.3.x"
        />

        {/* Guild Incentives footer — SEG-8 */}
        <GuildIncentivesFooter />

        {/* Bottom breathing room */}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

const s = {
  outer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  headerBar: {
    padding: '14px 16px 8px',
    flexShrink: 0,
    borderBottom: '1px solid #1e2a38',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  h1: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#f0fdf4',
  } as React.CSSProperties,
  subtitle: {
    margin: '4px 0 0',
    fontSize: 11,
    color: '#475569',
  } as React.CSSProperties,
  marksCounter: {
    fontSize: 12,
    fontWeight: 700,
    color: '#6ee7b7',
    background: '#064e3b',
    border: '1px solid #059669',
    borderRadius: 5,
    padding: '3px 10px',
    flexShrink: 0,
    alignSelf: 'center',
    cursor: 'default',
  } as React.CSSProperties,
  scroll: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px 14px',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
    marginTop: 4,
  } as React.CSSProperties,
};
