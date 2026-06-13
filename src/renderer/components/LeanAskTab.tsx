// MnemosyneC · v0.1.57.1 · SEG BP081 · 2026-06-13
// §2 Truth-Always · §3 Sonnet 4.6 · Founder-ratified
//
// LeanAskTab — Ask A Question tab for the 3-tab LeanShell.
// Model: gemma4:12b — LOCAL ONLY (A1.1 hard binding, no cloud exposure).
// SEG-1 v0.1.57: routes through ai-dispatch:query IPC (substrate HOT retrieve active).
// v0.1.57.1 (BP081): token streaming + cold-start heartbeat.
// Persistent history in localStorage key 'mnemo_ask_history' (max 200 msgs).
// Membership CTA banner pinned at bottom, never dismissible.

import React, { useState, useEffect, useRef, useCallback } from 'react';
// SEG-1 v0.1.57: direct Ollama fetch replaced by window.amplify.aiDispatch.query IPC.
import { ModelPullProgress } from './ModelPullProgress';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  ts: number;
}

const LS_HISTORY_KEY = 'mnemo_ask_history';
const MAX_HISTORY = 200;
const MODEL = 'gemma4:12b';

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: ChatMessage[]): void {
  const trimmed = msgs.slice(-MAX_HISTORY);
  try {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* non-fatal */ }
}

// ─── Cold-start / warm timer text helpers ────────────────────────────────────

function coldStartText(secs: number): string {
  return `🧠 Gemma is loading into memory (first run, ~30–90s)... (${secs}s)`;
}

function thinkingText(secs: number): string {
  return `Thinking... (${secs}s)`;
}

// ─── IPC-based chat via ai-dispatch:query (SEG-1 v0.1.57) ───────────────────
// Routes through main-process IPC → queryVerifiedEblets HOT retrieve → Ollama /api/chat.
// Non-streaming; substrate eblet context is injected server-side before LLM call.

// ─── Message bubbles ─────────────────────────────────────────────────────────

function MsgBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: '78%',
        background: isUser ? '#0f4c35' : '#111827',
        border: `1px solid ${isUser ? '#16533c' : '#1e2a38'}`,
        borderRadius: 10,
        padding: '9px 13px',
        fontSize: 13,
        color: '#e2e8f0',
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
        {msg.content === '' && <span style={{ opacity: 0.4 }}>▌</span>}
      </div>
    </div>
  );
}

// ─── Membership CTA Banner ───────────────────────────────────────────────────

function MembershipBanner() {
  const handleJoin = () => {
    window.amplify?.openExternal?.('https://lianabanyan.com/join');
    window.amplify?.authOpenJoin?.();
  };

  return (
    <div style={{
      background: '#0d1117',
      borderTop: '1px solid #1e2a38',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>
          Join Liana Banyan — Better, Faster, Cheaper · $5/year
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
          Workers, Builders, and Creators keep 83.3%. No ads. No VC.
        </div>
      </div>
      <button
        onClick={handleJoin}
        style={{
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          outline: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Join Now →
      </button>
    </div>
  );
}

// ─── LeanAskTab ──────────────────────────────────────────────────────────────

interface LeanAskTabProps {
  onSwitchToHome?: () => void;
}

export function LeanAskTab({ onSwitchToHome }: LeanAskTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [modelMissing, setModelMissing] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  // SEG-2 v0.1.56: show pull progress UI when gemma4:12b is missing
  const [showPullProgress, setShowPullProgress] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // v0.1.57.1 (BP081): streaming state — refs only (no extra React state for per-second ticks)
  const currentAiIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubProgressRef = useRef<(() => void) | null>(null);
  const unsubCompleteRef = useRef<(() => void) | null>(null);
  const elapsedRef = useRef(0);
  const isColdRef = useRef(false);
  const isStreamingRef = useRef(false);

  const runCheck = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await window.amplify?.checkOllamaAndModel?.(MODEL);
      if (!res) { setCheckFailed(true); setModelMissing(false); setShowPullProgress(false); }
      else if (!res.reachable) { setCheckFailed(true); setModelMissing(false); setShowPullProgress(false); }
      else {
        setCheckFailed(false);
        const missing = !res.hasModel;
        setModelMissing(missing);
        // SEG-2: auto-launch pull UI when model is absent and Ollama is reachable
        if (missing) setShowPullProgress(true);
        else setShowPullProgress(false);
      }
    } catch {
      setCheckFailed(true);
      setShowPullProgress(false);
    } finally {
      setRetrying(false);
    }
  }, []);

  useEffect(() => { runCheck(); }, [runCheck]);

  // A-3 BP081 v0.1.59.1: Prune error-class messages from history on app version change
  useEffect(() => {
    const unsub = window.amplify?.onAppVersionCheck?.(({ version }) => {
      const storedVersion = localStorage.getItem('mnemo_ask_history_version');
      if (storedVersion && storedVersion !== version) {
        try {
          const raw = localStorage.getItem(LS_HISTORY_KEY);
          if (raw) {
            const history = JSON.parse(raw) as ChatMessage[];
            const pruned = history.filter((msg) => {
              const text = (msg.content || '').toLowerCase();
              return (
                !text.includes('error') &&
                !text.includes('failed') &&
                !text.includes('exception') &&
                !text.includes('timeout')
              );
            });
            localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(pruned));
            if (history.length !== pruned.length) {
              setMessages(pruned);
              console.log(
                `[VersionCheck] Pruned ${history.length - pruned.length} error-class messages on upgrade ${storedVersion} → ${version}`,
              );
            }
          }
        } catch { /* non-fatal */ }
      }
      localStorage.setItem('mnemo_ask_history_version', version);
    });
    return () => { unsub?.(); };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendMsg = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      saveHistory(next);
      return next;
    });
  }, []);

  // Update message content in-memory only (no localStorage write — used during streaming)
  const updateMsgInMemory = useCallback((id: string, content: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, content } : m));
  }, []);

  // Update message content and persist to localStorage (used on stream complete)
  const updateMsgAndSave = useCallback((id: string, content: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => m.id === id ? { ...m, content } : m);
      saveHistory(next);
      return next;
    });
  }, []);

  // v0.1.57.1: tear down streaming subscriptions and timer
  const clearStream = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (unsubProgressRef.current) { unsubProgressRef.current(); unsubProgressRef.current = null; }
    if (unsubCompleteRef.current) { unsubCompleteRef.current(); unsubCompleteRef.current = null; }
    elapsedRef.current = 0;
    isColdRef.current = false;
    isStreamingRef.current = false;
    currentAiIdRef.current = null;
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, ts: Date.now() };
    const aiId = `a-${Date.now() + 1}`;
    // v0.1.57.1: start bubble with immediate "Thinking... (0s)" — every-click feedback canon
    const aiMsg: ChatMessage = { id: aiId, role: 'assistant', content: thinkingText(0), ts: Date.now() + 1 };

    setInput('');
    setThinking(true);
    appendMsg(userMsg);
    appendMsg(aiMsg);

    // v0.1.57.1: initialise streaming refs for this query
    currentAiIdRef.current = aiId;
    elapsedRef.current = 0;
    isColdRef.current = false;
    isStreamingRef.current = false;

    // v0.1.57.1: heartbeat counter — increments every 1s until first token arrives
    intervalRef.current = setInterval(() => {
      if (isStreamingRef.current) return;
      elapsedRef.current += 1;
      const id = currentAiIdRef.current;
      if (!id) return;
      const txt = isColdRef.current ? coldStartText(elapsedRef.current) : thinkingText(elapsedRef.current);
      updateMsgInMemory(id, txt);
    }, 1000);

    // v0.1.57.1: subscribe to token progress BEFORE calling query (avoid race)
    if (window.amplify?.aiDispatch?.onAskTokenProgress) {
      unsubProgressRef.current = window.amplify.aiDispatch.onAskTokenProgress((data) => {
        const id = currentAiIdRef.current;
        if (!id) return;

        if (data.coldStart) {
          // Switch bubble to cold-start text immediately
          isColdRef.current = true;
          updateMsgInMemory(id, coldStartText(elapsedRef.current));
          return;
        }

        if (data.delta) {
          if (!isStreamingRef.current) {
            // First token: stop heartbeat timer, enter streaming mode
            isStreamingRef.current = true;
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
          }
          // Replace bubble content with latest assembled text (streaming in place)
          updateMsgInMemory(id, data.assembled);
        }
      });
    }

    // v0.1.57.1: subscribe to stream complete
    if (window.amplify?.aiDispatch?.onAskTokenComplete) {
      unsubCompleteRef.current = window.amplify.aiDispatch.onAskTokenComplete((data) => {
        const id = currentAiIdRef.current;
        if (!id) return;

        // v0.1.57.1 differentiated error
        const finalContent = data.error
          ? `⚠ Ask threw: ${data.error}. See Diagnostic.`
          : (data.content || '');

        updateMsgAndSave(id, finalContent);
        clearStream();
        setThinking(false);
        textareaRef.current?.focus();
      });
    }

    // SEG-1 v0.1.57: route through ai-dispatch:query IPC.
    // Main process runs queryVerifiedEblets() HOT retrieve then streams Ollama /api/chat.
    const history = [...messages, userMsg];
    const ipcMessages = history
      .filter((m) => m.role !== 'system')
      .slice(-10)
      .map((m) => ({ role: m.role as string, content: m.content }));

    // v0.1.57.1 differentiated error: check for preload bridge before invoking
    if (!window.amplify?.aiDispatch?.query) {
      // v0.1.57.1 differentiated error
      updateMsgAndSave(aiId, '⚠ Preload bridge missing — reinstall MnemosyneC.');
      clearStream();
      setThinking(false);
      textareaRef.current?.focus();
      return;
    }

    try {
      const result = await window.amplify.aiDispatch.query({
        court_member: 'lean_ask',
        messages: ipcMessages,
      });

      if (!result?.ok) {
        // Pre-stream error — no events will fire; handle synchronously
        const errMsg = result?.error ?? 'Unknown error from local AI.';
        const displayMsg = errMsg.includes('No compatible model')
          ? '⚠ Your AI model is still setting up. Check the Home tab.'
          // v0.1.57.1 differentiated error
          : `⚠ Ask threw: ${errMsg}. See Diagnostic.`;
        updateMsgAndSave(aiId, displayMsg);
        clearStream();
        setThinking(false);
        textareaRef.current?.focus();
      }
      // If result.streaming === true: events drive the rest — do NOT call setThinking(false) here

    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      // v0.1.57.1 differentiated error
      updateMsgAndSave(aiId, `⚠ Ask threw: ${errMsg}. See Diagnostic.`);
      console.warn('[LeanAskTab] aiDispatch.query threw:', e);
      clearStream();
      setThinking(false);
      textareaRef.current?.focus();
    }
  }, [input, thinking, messages, appendMsg, updateMsgInMemory, updateMsgAndSave, clearStream]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 4px', flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f0fdf4' }}>
          Ask A Question
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569' }}>
          Powered by gemma4:12b running on your own computer. Private by default.
        </p>
      </div>

      {/* SEG-2: Full-screen pull progress UI when gemma4:12b is missing */}
      {modelMissing && !checkFailed && showPullProgress && (
        <ModelPullProgress
          onComplete={() => {
            setShowPullProgress(false);
            setModelMissing(false);
            void runCheck();
          }}
          onSkip={() => {
            setShowPullProgress(false);
          }}
        />
      )}

      {/* Model-missing banner (fallback when pull UI is dismissed / Ollama not reachable) */}
      {modelMissing && !checkFailed && !showPullProgress && (
        <div style={{
          margin: '8px 16px 0',
          background: '#1c1200',
          border: '1px solid #3d2e00',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 12,
          color: '#fbbf24',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ flex: 1 }}>Your AI model is still setting up. Usually 2–5 minutes.</span>
          <button
            onClick={() => setShowPullProgress(true)}
            style={{
              background: 'none',
              border: '1px solid #f59e0b',
              borderRadius: 4,
              color: '#fbbf24',
              fontSize: 11,
              padding: '2px 8px',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Download now
          </button>
          <button
            onClick={runCheck}
            disabled={retrying}
            style={{
              background: 'none',
              border: '1px solid #f59e0b',
              borderRadius: 4,
              color: '#fbbf24',
              fontSize: 11,
              padding: '2px 8px',
              cursor: retrying ? 'wait' : 'pointer',
              outline: 'none',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {retrying ? '…' : 'Retry ↺'}
          </button>
        </div>
      )}

      {/* Check-failed banner (Ollama not reachable) */}
      {checkFailed && (
        <div style={{
          margin: '8px 16px 0',
          background: '#1a0a0a',
          border: '1px solid #4a1515',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 12,
          color: '#f87171',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          <span style={{ flex: 1 }}>Could not reach your local AI. Is Ollama running?</span>
          <button
            onClick={runCheck}
            disabled={retrying}
            style={{
              background: 'none',
              border: '1px solid #ef4444',
              borderRadius: 4,
              color: '#f87171',
              fontSize: 11,
              padding: '2px 8px',
              cursor: retrying ? 'wait' : 'pointer',
              outline: 'none',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {retrying ? '…' : 'Retry ↺'}
          </button>
          {onSwitchToHome && (
            <button
              onClick={onSwitchToHome}
              style={{
                background: 'none',
                border: '1px solid #334155',
                borderRadius: 4,
                color: '#94a3b8',
                fontSize: 11,
                padding: '2px 8px',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              Open Home tab →
            </button>
          )}
        </div>
      )}

      {/* Message history */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
      }}>
        {messages.length === 0 && !modelMissing && !checkFailed && (
          <div style={{
            textAlign: 'center',
            color: '#475569',
            fontSize: 13,
            marginTop: 48,
          }}>
            Ask anything. Your AI is private and local.
          </div>
        )}
        {messages.map((m) => <MsgBubble key={m.id} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid #1e2a38',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a question and press Enter…"
          disabled={thinking}
          rows={1}
          style={{
            flex: 1,
            background: '#111827',
            border: '1px solid #1e2a38',
            borderRadius: 6,
            color: '#f0fdf4',
            fontSize: 13,
            padding: '8px 10px',
            resize: 'none',
            fontFamily: 'system-ui, sans-serif',
            outline: 'none',
            overflowY: 'auto',
            maxHeight: 100,
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={handleSend}
          disabled={thinking || !input.trim()}
          style={{
            background: thinking || !input.trim() ? '#1e2a38' : '#10b981',
            color: thinking || !input.trim() ? '#475569' : '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 700,
            cursor: thinking || !input.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'system-ui, sans-serif',
            outline: 'none',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          {thinking ? 'Thinking…' : 'Send'}
        </button>
      </div>

      {/* Membership CTA — pinned bottom, never dismissible */}
      <MembershipBanner />
    </div>
  );
}
