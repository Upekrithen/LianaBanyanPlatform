// B83 — Hearth Conjunction Window — Top-Level Shell
// "The Heavy Booster Test surface"
// Unifies: B69 App Builder Chat / B82 MoneyPenny / B61A Drekaskip /
//          Watchdog / B80 Sweat / B81 Tears / B-SE4-1 into ONE window
//
// BP041 Design Pass — §3: 3-tab layout (Prove It! / App Builder / Browser)
// Layout:
//   Left column:  Tab nav + tab content (Prove It! | App Builder | Browser)
//                 + persistent Drekaskip Wave Status footer band
//   Right column: In Conjunction panel (top) | Active Substrate Panel (bottom)
//
// Founder-coined names (immutable per R-FOUNDER-NAMING-PROVENANCE):
//   "Hearth Conjunction Window", "In Conjunction", "HEAVY BOOSTER TEST"

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppBuilderChat } from './AppBuilderChat';
import { ConjunctionPanel } from './conjunction/ConjunctionPanel';
import { EmbeddedChrome } from './embedded_browser/EmbeddedChrome';
import { DrekaskipStatusPanel } from './drekaskip_status/DrekaskipStatusPanel';
import { NovaculaFireButton } from './drekaskip_status/NovaculaFireButton';
import { ActiveSubstratePanel } from './active_substrate/ActiveSubstratePanel';
import { OnDeckPanel } from './on_deck/OnDeckPanel';
import {
  ConjunctionContext,
  DEFAULT_PANEL_STATE,
  DEFAULT_AVAILABILITY,
} from './conjunction/conjunction_state';
import type { ConjunctionMode, ConjunctionPanelState, ConjunctionResult, BackendAvailability } from './conjunction/types';

type HearthTab = 'prove_it' | 'app_builder' | 'browser';

export function HearthConjunctionWindow() {
  const [panelState, setPanelState] = useState<ConjunctionPanelState>(DEFAULT_PANEL_STATE);
  const [availability, setAvailability] = useState<BackendAvailability>(DEFAULT_AVAILABILITY);
  const [lastResult, setLastResult] = useState<ConjunctionResult | null>(null);
  const [substrateContext, setSubstrateContext] = useState<string | null>(null);
  const [conjunctionOutput, setConjunctionOutput] = useState<string | null>(null);
  const [injectionEvents, setInjectionEvents] = useState<Array<{ success: boolean; url: string }>>([]);
  const [showOnDeck, setShowOnDeck] = useState(false);
  const [activeTab, setActiveTab] = useState<HearthTab>('prove_it');
  // §4 — Deck Card selections per tab (Founder rule: always 3 options)
  const [proveCard, setProveCard] = useState<'A' | 'B' | 'C' | null>(null);
  const [builderCard, setBuilderCard] = useState<'A' | 'B' | 'C'>('B');
  const contextRefreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load initial panel state + availability
  useEffect(() => {
    window.amplify.conjunctionGetState?.().then((s) => {
      if (s) setPanelState(s);
    }).catch(() => { /* non-fatal */ });

    refreshAvailability();

    // Refresh availability every 30s
    const avTimer = setInterval(refreshAvailability, 30_000);

    // Build substrate context on mount + every 60s
    buildContext();
    contextRefreshTimer.current = setInterval(buildContext, 60_000);

    return () => {
      clearInterval(avTimer);
      if (contextRefreshTimer.current) clearInterval(contextRefreshTimer.current);
    };
  }, []);

  const refreshAvailability = useCallback(async () => {
    try {
      const av = await window.amplify.conjunctionGetAvailability?.();
      if (av) setAvailability(av);
    } catch {
      /* non-fatal */
    }
  }, []);

  const buildContext = useCallback(async () => {
    try {
      const ctx = await window.amplify.conjunctionGetSubstrateContext?.();
      if (ctx?.raw_preamble) setSubstrateContext(ctx.raw_preamble);
    } catch {
      /* non-fatal */
    }
  }, []);

  const selectMode = useCallback(async (mode: ConjunctionMode) => {
    try {
      const result = await window.amplify.conjunctionSelect?.(mode);
      if (result?.ok) {
        setPanelState((s) => ({ ...s, selected: mode, per_request_override: null }));
      }
    } catch {
      /* non-fatal */
    }
  }, []);

  const dispatch = useCallback(async (prompt: string, mode_override?: ConjunctionMode): Promise<ConjunctionResult | null> => {
    setPanelState((s) => ({
      ...s,
      in_flight: { mode: mode_override ?? s.selected, started_at: new Date().toISOString() },
    }));
    setConjunctionOutput(null);

    try {
      const result = await window.amplify.conjunctionDispatch?.(prompt, mode_override);
      if (result) {
        setLastResult(result);
        setConjunctionOutput(result.synthesized);
        setPanelState((s) => ({
          ...s,
          in_flight: null,
          last_dispatch: {
            mode: mode_override ?? s.selected,
            ts: new Date().toISOString(),
            latency_ms: result.total_latency_ms,
            success: result.receipts.some((r) => r.result !== null),
          },
        }));
        return result;
      }
    } catch (err) {
      setPanelState((s) => ({ ...s, in_flight: null }));
      console.warn('[Conjunction] dispatch error:', err);
    }
    return null;
  }, []);

  const handleShiftClick = useCallback((mode: ConjunctionMode) => {
    setPanelState((s) => ({ ...s, per_request_override: mode }));
    window.amplify.conjunctionSetOverride?.(mode).catch(() => { /* non-fatal */ });
  }, []);

  const TAB_META: Record<HearthTab, { icon: string; label: string }> = {
    prove_it:    { icon: '🎯', label: 'Prove It!' },
    app_builder: { icon: '🏗️', label: 'App Builder' },
    browser:     { icon: '🌐', label: 'Browser' },
  };

  return (
    <ConjunctionContext.Provider value={{ panelState, availability, lastResult, selectMode, dispatch, refreshAvailability }}>
      <div style={styles.root}>
        {/* Window header */}
        <div style={styles.topBar}>
          <span style={styles.hearthFlame}>🔥</span>
          <span style={styles.windowTitle}>Hearth Conjunction Window</span>
          <span style={styles.heavyBooster}>HEAVY BOOSTER TEST</span>
          <div style={styles.topBarSpacer} />
          <button style={styles.contextBtn} onClick={buildContext} title="Refresh substrate context">
            🧬 Refresh context
          </button>
          <button
            style={{
              ...styles.contextBtn,
              background: showOnDeck ? '#1e3a5f' : '#2d3748',
              borderColor: showOnDeck ? '#3b82f6' : '#4a5568',
              color: showOnDeck ? '#63b3ed' : '#e2e8f0',
            }}
            onClick={() => setShowOnDeck((v) => !v)}
            title="Toggle On-Deck queue panel"
          >
            📋 On Deck
          </button>
        </div>

        {/* Main layout: left (tabs) | right (panels) */}
        <div style={styles.layout}>

          {/* Left column: tab nav + tab content + drekaskip footer */}
          <div style={styles.leftCol}>

            {/* Tab navigation strip */}
            <div style={styles.tabNav}>
              {(Object.keys(TAB_META) as HearthTab[]).map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...styles.tabBtn,
                    ...(activeTab === tab ? styles.tabBtnActive : {}),
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {TAB_META[tab].icon} {TAB_META[tab].label}
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div style={styles.tabContent}>

              {/* ─── Prove It! — trust gateway ───────────────────────────── */}
              {activeTab === 'prove_it' && (
                <div style={styles.proveItTab}>
                  <div style={styles.proveItHeader}>
                    <span style={styles.proveItTitle}>🎯 Prove It!</span>
                    <span style={styles.proveItSubtitle}>
                      Trust gateway — verify the substrate runs on your hardware. Pick how you want to see the proof.
                    </span>
                  </div>

                  {/* Deck Cards — 3 options */}
                  <div style={styles.deckRow}>
                    {([
                      { key: 'A', icon: '🎯', title: 'Fire Empirical Proof', desc: 'Run canonical test data through the full 24-SEG Novacula. Instant trust — no setup.' },
                      { key: 'B', icon: '🧪', title: 'Fire Your Own Test', desc: 'Provide your own input. Wrapped in the same Novacula pipeline — you own the result.' },
                      { key: 'C', icon: '👀', title: 'Just Watch', desc: 'Read the canonical published synthesis without firing. See what the system produces.' },
                    ] as { key: 'A' | 'B' | 'C'; icon: string; title: string; desc: string }[]).map(({ key, icon, title, desc }) => (
                      <button
                        key={key}
                        style={{ ...styles.deckCard, ...(proveCard === key ? styles.deckCardActive : {}) }}
                        onClick={() => setProveCard(proveCard === key ? null : key)}
                      >
                        <span style={styles.deckCardIcon}>{icon}</span>
                        <span style={styles.deckCardTitle}>{title}</span>
                        <span style={styles.deckCardDesc}>{desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Card action areas */}
                  {proveCard === 'A' && (
                    <div style={styles.proveItBody}>
                      <NovaculaFireButton />
                      {conjunctionOutput && (
                        <div style={styles.proveItNote}>Conjunction result ready — see strip below ↓</div>
                      )}
                    </div>
                  )}
                  {proveCard === 'B' && (
                    <div style={styles.proveItBody}>
                      <p style={styles.proveItNote}>Custom test input — fire your data through the Novacula pipeline:</p>
                      <NovaculaFireButton />
                    </div>
                  )}
                  {proveCard === 'C' && (
                    <div style={styles.proveItBody}>
                      {conjunctionOutput ? (
                        <pre style={styles.synthesisView}>{conjunctionOutput.slice(0, 3000)}</pre>
                      ) : (
                        <p style={styles.proveItNote}>
                          No synthesis result yet. Fire a Novacula test first (Card A or B), then return here to read the output.
                        </p>
                      )}
                    </div>
                  )}
                  {proveCard === null && (
                    <div style={styles.proveItBody}>
                      <p style={styles.proveItNote}>Pick a card above to get started.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── App Builder — 3 modes ───────────────────────────────── */}
              {activeTab === 'app_builder' && (
                <div style={styles.appBuilderTab}>
                  {/* Deck Cards */}
                  <div style={{ ...styles.deckRow, flexShrink: 0 }}>
                    {([
                      { key: 'A', icon: '📦', title: 'Build from Template', desc: 'Choose a cooperative pattern — budget tracker, task list, co-op ledger, and more.' },
                      { key: 'B', icon: '✏️', title: 'Describe in Plain English', desc: 'Tell CAI what you want. It builds the app locally on your machine. Free, always.' },
                      { key: 'C', icon: '🌳', title: 'Browse What Members Built', desc: 'Explore apps built by cooperative members. Install any with one click.' },
                    ] as { key: 'A' | 'B' | 'C'; icon: string; title: string; desc: string }[]).map(({ key, icon, title, desc }) => (
                      <button
                        key={key}
                        style={{ ...styles.deckCard, ...(builderCard === key ? styles.deckCardActive : {}) }}
                        onClick={() => setBuilderCard(key)}
                      >
                        <span style={styles.deckCardIcon}>{icon}</span>
                        <span style={styles.deckCardTitle}>{title}</span>
                        <span style={styles.deckCardDesc}>{desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Card content */}
                  <div style={styles.builderCardBody}>
                    {builderCard === 'A' && (
                      <div style={styles.placeholderPane}>
                        <span style={styles.placeholderIcon}>📦</span>
                        <span style={styles.placeholderTitle}>Cooperative Template Library</span>
                        <span style={styles.placeholderDesc}>Coming soon — pattern library for cooperative apps. Card B (Describe in Plain English) is available now.</span>
                      </div>
                    )}
                    {builderCard === 'B' && <AppBuilderChat />}
                    {builderCard === 'C' && (
                      <div style={styles.placeholderPane}>
                        <span style={styles.placeholderIcon}>🌳</span>
                        <span style={styles.placeholderTitle}>Member App Library</span>
                        <span style={styles.placeholderDesc}>Browse and install apps built by cooperative members. Coming soon.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── Browser — 6 chalk-line slots + EmbeddedChrome ───────── */}
              {activeTab === 'browser' && (
                <div style={styles.browserTab}>
                  {/* 6 browser slots */}
                  <div style={styles.browserSlots}>
                    {([
                      { name: 'Chrome',   icon: '🟡', color: '#facc15' },
                      { name: 'Firefox',  icon: '🦊', color: '#f97316' },
                      { name: 'Edge',     icon: '🔵', color: '#3b82f6' },
                      { name: 'Brave',    icon: '🦁', color: '#fb923c' },
                      { name: 'Embedded', icon: '⚡', color: '#a78bfa' },
                      { name: 'Vivaldi',  icon: '🔴', color: '#ef4444' },
                    ]).map(({ name, icon, color }) => (
                      <div
                        key={name}
                        style={{ ...styles.browserSlot, borderColor: `${color}55` }}
                        title={name === 'Embedded' ? 'Use built-in Chromium (active below)' : `Open in ${name}`}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                        <span style={{ ...styles.browserSlotLabel, color }}>{name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Embedded Chrome below the slot picker */}
                  <div style={styles.browserEmbedArea}>
                    <EmbeddedChrome
                      substrateContext={substrateContext}
                      onInjectionResult={(r) => setInjectionEvents((e) => [r, ...e].slice(0, 10))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Drekaskip Wave Status — persistent footer band (visible across all tabs) */}
            <div style={styles.drekaskipFooter}>
              <div style={styles.drekaskipFooterHeader}>
                <span>🌊</span> Drekaskip Wave Status
              </div>
              <div style={styles.drekaskipFooterBody}>
                <DrekaskipStatusPanel />
              </div>
            </div>
          </div>

          {/* Right column — unchanged */}
          <div style={styles.rightCol}>
            {/* Conjunction Panel (B83a) */}
            <div style={{ ...styles.panel, flex: '0 0 55%' }}>
              <div style={styles.panelHeader}><span>🔀</span> In Conjunction</div>
              <div style={styles.panelBody}>
                <ConjunctionPanel
                  panelState={panelState}
                  availability={availability}
                  onSelect={selectMode}
                  onShiftClick={handleShiftClick}
                />
              </div>
            </div>

            {/* Active Substrate Panel (B83d) */}
            <div style={{ ...styles.panel, flex: '1 1 auto' }}>
              <div style={styles.panelHeader}><span>🔬</span> Active Substrate</div>
              <div style={styles.panelBody}>
                <ActiveSubstratePanel />
              </div>
            </div>
          </div>
        </div>

        {/* On-Deck panel (BP037) — full-width strip, toggled from top bar */}
        {showOnDeck && (
          <div style={styles.onDeckStrip}>
            <OnDeckPanel />
          </div>
        )}

        {/* Conjunction output strip (shown when dispatch result available) */}
        {conjunctionOutput && (
          <div style={styles.outputStrip}>
            <div style={styles.outputHeader}>
              Conjunction Result · {lastResult?.synthesizer_mode} · {lastResult?.total_latency_ms}ms
              <button style={styles.outputClose} onClick={() => setConjunctionOutput(null)}>✕</button>
            </div>
            <div style={styles.outputBody}>{conjunctionOutput.slice(0, 2000)}</div>
          </div>
        )}

        {/* Injection event toast (last injection) */}
        {injectionEvents.length > 0 && (
          <div style={{
            ...styles.injectionToast,
            background: injectionEvents[0].success ? '#14532d' : '#450a0a',
            borderColor: injectionEvents[0].success ? '#22c55e' : '#ef4444',
          }}>
            {injectionEvents[0].success ? '🧬 Context injected' : '⚠ Injection miss'}
            {' '}· {injectionEvents[0].url.slice(0, 40)}…
          </div>
        )}
      </div>
    </ConjunctionContext.Provider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: '100vw',
    height: '100vh',
    background: '#0a0a14',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#1a1a2e',
    borderBottom: '2px solid #f6ad55',
    flexShrink: 0,
  },
  hearthFlame: { fontSize: '1.2rem' },
  windowTitle: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#f6ad55',
    letterSpacing: '0.04em',
  },
  heavyBooster: {
    fontSize: '0.65rem',
    fontWeight: 700,
    background: '#f6ad55',
    color: '#1a1a2e',
    borderRadius: '4px',
    padding: '2px 6px',
    letterSpacing: '0.08em',
  },
  topBarSpacer: { flex: 1 },
  contextBtn: {
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: '4px',
    color: '#e2e8f0',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  layout: {
    display: 'flex',
    flex: 1,
    gap: '0.5rem',
    padding: '0.5rem',
    overflow: 'hidden',
    minHeight: 0,
  },

  // ─── Left column: tab nav + tab content + drekaskip footer ──────────────
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    flex: 2,
    minWidth: 0,
    overflow: 'hidden',
    background: '#0f0f1a',
    borderRadius: '8px',
    border: '1px solid #2d3748',
  },
  tabNav: {
    display: 'flex',
    flexShrink: 0,
    borderBottom: '2px solid #2d3748',
    background: '#12121f',
  },
  tabBtn: {
    flex: 1,
    padding: '0.5rem 0.25rem',
    background: 'none',
    border: 'none',
    borderRight: '1px solid #2d3748',
    color: '#718096',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'color 0.15s, background 0.15s',
  },
  tabBtnActive: {
    color: '#f6ad55',
    background: '#1a1a2e',
    borderBottom: '2px solid #f6ad55',
    marginBottom: '-2px',
  },
  tabContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },

  // ─── Prove It! tab ────────────────────────────────────────────────────────
  proveItTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '1rem',
    overflow: 'auto',
  },
  proveItHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  proveItTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f6ad55',
  },
  proveItSubtitle: {
    fontSize: '0.82rem',
    color: '#a0aec0',
    lineHeight: 1.5,
    maxWidth: 480,
  },
  proveItBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  proveItNote: {
    fontSize: '0.75rem',
    color: '#68d391',
    fontStyle: 'italic',
  },
  synthesisView: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: '#070710',
    border: '1px solid #2d3748',
    borderRadius: '6px',
    padding: '0.75rem',
    overflow: 'auto',
    maxHeight: 360,
  },

  // ─── Deck Cards (§4 — 3 options per tab) ─────────────────────────────────
  deckRow: {
    display: 'flex',
    gap: '0.5rem',
    flexShrink: 0,
  },
  deckCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '0.3rem',
    padding: '0.65rem 0.75rem',
    background: 'transparent',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    color: '#e2e8f0',
    transition: 'border-color 0.15s, background 0.15s',
  },
  deckCardActive: {
    borderColor: '#f6ad55',
    background: 'rgba(246, 173, 85, 0.07)',
  },
  deckCardIcon: {
    fontSize: '1.35rem',
    lineHeight: 1,
  },
  deckCardTitle: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#f6ad55',
  },
  deckCardDesc: {
    fontSize: '0.68rem',
    color: '#718096',
    lineHeight: 1.4,
  },

  // ─── App Builder tab ──────────────────────────────────────────────────────
  appBuilderTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    padding: '0.5rem',
    overflow: 'hidden',
    minHeight: 0,
  },
  builderCardBody: {
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  placeholderPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: '#718096',
    padding: '2rem',
  },
  placeholderIcon: { fontSize: '2.5rem' },
  placeholderTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#a0aec0' },
  placeholderDesc: { fontSize: '0.78rem', textAlign: 'center' as const, maxWidth: 320, lineHeight: 1.5 },

  // ─── Browser tab ─────────────────────────────────────────────────────────
  browserTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    minHeight: 0,
  },
  browserSlots: {
    display: 'flex',
    gap: '0.4rem',
    padding: '0.5rem',
    flexShrink: 0,
    borderBottom: '1px solid #2d3748',
    background: '#0a0a12',
  },
  browserSlot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.4rem 0.25rem',
    border: '1px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.02)',
    transition: 'background 0.15s',
  },
  browserSlotLabel: {
    fontSize: '0.6rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  browserEmbedArea: {
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },

  // ─── Drekaskip footer band (persistent across all tabs) ──────────────────
  drekaskipFooter: {
    flexShrink: 0,
    borderTop: '1px solid #2d3748',
    background: '#0a0a12',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 180,
    overflow: 'hidden',
  },
  drekaskipFooterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.3rem 0.75rem',
    background: '#111120',
    borderBottom: '1px solid #2d3748',
    fontWeight: 600,
    fontSize: '0.75rem',
    color: '#718096',
    flexShrink: 0,
  },
  drekaskipFooterBody: {
    flex: 1,
    overflow: 'auto',
    padding: '0.4rem 0.75rem',
    minHeight: 0,
  },

  // ─── Right column panels ──────────────────────────────────────────────────
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: '0 0 300px',
    minWidth: 240,
    overflow: 'hidden',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0f0f1a',
    borderRadius: '8px',
    border: '1px solid #2d3748',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.75rem',
    background: '#1a1a2e',
    borderBottom: '1px solid #2d3748',
    fontWeight: 600,
    fontSize: '0.8rem',
    color: '#a0aec0',
    flexShrink: 0,
  },
  panelBody: {
    flex: 1,
    overflow: 'auto',
    padding: '0.5rem',
    minHeight: 0,
  },

  // ─── Strips & toasts ─────────────────────────────────────────────────────
  onDeckStrip: {
    borderTop: '2px solid #3b82f6',
    background: '#070710',
    flexShrink: 0,
    height: 340,
    overflow: 'hidden',
  },
  outputStrip: {
    borderTop: '1px solid #f6ad55',
    background: '#110a00',
    flexShrink: 0,
    maxHeight: '35vh',
    display: 'flex',
    flexDirection: 'column',
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0.75rem',
    background: '#1a1100',
    fontSize: '0.75rem',
    color: '#f6ad55',
    fontWeight: 600,
  },
  outputClose: {
    background: 'none',
    border: 'none',
    color: '#718096',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  outputBody: {
    flex: 1,
    overflow: 'auto',
    padding: '0.5rem 0.75rem',
    fontSize: '0.78rem',
    lineHeight: 1.5,
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
  },
  injectionToast: {
    position: 'fixed',
    bottom: '0.75rem',
    right: '0.75rem',
    border: '1px solid',
    borderRadius: '6px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.72rem',
    color: '#e2e8f0',
    zIndex: 9999,
    maxWidth: 320,
  },
};
