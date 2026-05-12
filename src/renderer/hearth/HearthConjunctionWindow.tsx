// B83 — Hearth Conjunction Window — Top-Level Shell
// "The Heavy Booster Test surface"
// Unifies: B69 App Builder Chat / B82 MoneyPenny / B61A Drekaskip /
//          Watchdog / B80 Sweat / B81 Tears / B-SE4-1 into ONE window
//
// Layout:
//   Left column:  App Builder Chat (top) | Embedded Chrome (middle) | Drekaskip Status (bottom)
//   Right column: Conjunction Panel (top) | Active Substrate Panel (bottom)
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

export function HearthConjunctionWindow() {
  const [panelState, setPanelState] = useState<ConjunctionPanelState>(DEFAULT_PANEL_STATE);
  const [availability, setAvailability] = useState<BackendAvailability>(DEFAULT_AVAILABILITY);
  const [lastResult, setLastResult] = useState<ConjunctionResult | null>(null);
  const [substrateContext, setSubstrateContext] = useState<string | null>(null);
  const [conjunctionOutput, setConjunctionOutput] = useState<string | null>(null);
  const [injectionEvents, setInjectionEvents] = useState<Array<{ success: boolean; url: string }>>([]);
  const [showOnDeck, setShowOnDeck] = useState(false);
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

        {/* Main layout: left column | right column */}
        <div style={styles.layout}>

          {/* Left column */}
          <div style={styles.leftCol}>
            {/* App Builder Chat (B69) */}
            <div style={{ ...styles.panel, flex: '0 0 38%' }}>
              <div style={styles.panelHeader}>
                <span>🏗️</span> App Builder Chat
                {conjunctionOutput && (
                  <span style={styles.panelNote}>Conjunction output available ↓</span>
                )}
              </div>
              <div style={styles.panelBody}>
                <AppBuilderChat />
              </div>
            </div>

            {/* Embedded Chrome (B83b) */}
            <div style={{ ...styles.panel, flex: '0 0 38%' }}>
              <div style={styles.panelHeader}>
                <span>🌐</span> Embedded Chrome
                <span style={styles.panelNote}>Auto-substrate injection active</span>
              </div>
              <div style={{ ...styles.panelBody, padding: 0 }}>
                <EmbeddedChrome
                  substrateContext={substrateContext}
                  onInjectionResult={(r) => setInjectionEvents((e) => [r, ...e].slice(0, 10))}
                />
              </div>
            </div>

            {/* Drekaskip Wave Status (B83c) */}
            <div style={{ ...styles.panel, flex: '1 1 auto', minHeight: 160 }}>
              <div style={styles.panelHeader}><span>🌊</span> Drekaskip Wave Status</div>
              <div style={styles.panelBody}>
                <NovaculaFireButton />
                <DrekaskipStatusPanel />
              </div>
            </div>
          </div>

          {/* Right column */}
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
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 2,
    minWidth: 0,
    overflow: 'hidden',
  },
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
  panelNote: { marginLeft: 'auto', fontSize: '0.65rem', color: '#68d391' },
  panelBody: {
    flex: 1,
    overflow: 'auto',
    padding: '0.5rem',
    minHeight: 0,
  },
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
