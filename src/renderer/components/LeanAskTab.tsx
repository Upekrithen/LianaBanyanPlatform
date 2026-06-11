// MnemosyneC · v0.1.51 · BP080 · 2026-06-11
// §2 Truth-Always · §3 Sonnet 4.6 · Founder-ratified DRAFT
//
// LeanAskTab — Ask A Question tab for the 3-tab LeanShell.
// Model: gemma4:12b — LOCAL ONLY (A1.1 hard binding, no cloud exposure).
// Persistent history in localStorage key 'mnemo_ask_history' (max 200 msgs).
// Membership CTA banner pinned at bottom, never dismissible.

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

// ─── Streaming chat via local Ollama ─────────────────────────────────────────

interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

async function streamOllama(
  prompt: string,
  { onToken, onDone, onError }: StreamCallbacks,
  signal: AbortSignal,
): Promise<void> {
  let resp: Response;
  try {
    resp = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt, stream: true }),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;
    onError('Could not reach local AI. Make sure MnemosyneC is set up (see Home tab).');
    return;
  }

  if (!resp.ok) {
    onError(`AI engine error (${resp.status}). Try again or check your setup.`);
    return;
  }

  const reader = resp.body?.getReader();
  if (!reader) { onError('Stream unavailable.'); return; }
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done || signal.aborted) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n').filter(Boolean)) {
        try {
          const parsed = JSON.parse(line) as { response?: string; done?: boolean };
          if (parsed.response) onToken(parsed.response);
          if (parsed.done) { onDone(); return; }
        } catch { /* malformed line — skip */ }
      }
    }
  } finally {
    reader.releaseLock();
    if (!signal.aborted) onDone();
  }
}

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

export function LeanAskTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [modelMissing, setModelMissing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if model is available
  useEffect(() => {
    window.amplify?.checkOllamaAndModel?.(MODEL).then((res) => {
      setModelMissing(!res.reachable || !res.hasModel);
    }).catch(() => setModelMissing(true));
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

  const updateLastMsg = useCallback((id: string, content: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => m.id === id ? { ...m, content } : m);
      saveHistory(next);
      return next;
    });
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, ts: Date.now() };
    const aiId = `a-${Date.now() + 1}`;
    const aiMsg: ChatMessage = { id: aiId, role: 'assistant', content: '', ts: Date.now() + 1 };

    setInput('');
    setThinking(true);
    appendMsg(userMsg);
    appendMsg(aiMsg);

    // Build conversation prompt (simple concatenation for gemma4:12b)
    const history = [...messages, userMsg];
    const prompt = history
      .filter((m) => m.role !== 'system')
      .slice(-10) // last 10 messages for context
      .map((m) => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`))
      .join('\n') + '\nAssistant:';

    abortRef.current = new AbortController();
    let accumulated = '';

    await streamOllama(
      prompt,
      {
        onToken: (t) => {
          accumulated += t;
          updateLastMsg(aiId, accumulated);
        },
        onDone: () => {
          setThinking(false);
          abortRef.current = null;
          textareaRef.current?.focus();
        },
        onError: (msg) => {
          updateLastMsg(aiId, `⚠ ${msg}`);
          setThinking(false);
          abortRef.current = null;
        },
      },
      abortRef.current.signal,
    );
  }, [input, thinking, messages, appendMsg, updateLastMsg]);

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

      {/* Model-missing banner */}
      {modelMissing && (
        <div style={{
          margin: '8px 16px 0',
          background: '#1c1200',
          border: '1px solid #3d2e00',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 12,
          color: '#fbbf24',
          flexShrink: 0,
        }}>
          Your AI model is still downloading. You can ask questions once it's ready — usually 2–5 minutes.
          <div style={{ marginTop: 4, height: 4, background: '#3d2e00', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: '40%',
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              borderRadius: 2,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      )}

      {/* Message history */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
      }}>
        {messages.length === 0 && !modelMissing && (
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
