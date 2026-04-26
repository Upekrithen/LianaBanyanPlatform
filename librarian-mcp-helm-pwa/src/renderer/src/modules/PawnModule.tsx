/**
 * Pawn Portal — Cathedral-injected Perplexity chat.
 *
 * Sends the user's query to localhost:7712/pawn which:
 *   1. Enriches the query with Cathedral context (via /enrich logic)
 *   2. Calls api.perplexity.ai/chat/completions with the enriched text
 *   3. Returns the full answer + enrichment metadata
 *
 * The API key (PPLX_API_KEY) lives server-side in the daemon environment —
 * never exposed to the renderer. If missing the daemon returns a 503 with
 * instructions.
 *
 * K509 / B125
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'

const PAWN_ENDPOINT = 'http://127.0.0.1:7712/pawn'

interface PawnResponse {
  answer: string
  intent: string
  token_count: number
  enriched_chars: number
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  error: string | null
}

interface Message {
  id: number
  role: 'user' | 'pawn'
  text: string
  meta?: { intent: string; enriched_chars: number; tokens?: number }
  error?: boolean
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: '#0f1117',
    color: '#e2e8f0',
  },
  header: {
    padding: '16px 20px 12px',
    borderBottom: '1px solid #1e2333',
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  headerSub: {
    fontSize: '11px',
    color: '#475569',
    letterSpacing: '0.4px',
    textTransform: 'uppercase' as const,
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '10px',
    color: '#334155',
    userSelect: 'none' as const,
  },
  emptyIcon: {
    fontSize: '36px',
    opacity: 0.4,
  },
  emptyText: {
    fontSize: '13px',
    color: '#475569',
    textAlign: 'center' as const,
    maxWidth: '320px',
    lineHeight: 1.6,
  },
  bubble: (role: 'user' | 'pawn', error?: boolean) => ({
    maxWidth: '88%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start' as const,
    background: role === 'user'
      ? '#1d4ed8'
      : error ? '#3b0a0a' : '#1a2035',
    borderRadius: role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
    padding: '10px 14px',
    fontSize: '13px',
    lineHeight: 1.65,
    color: error ? '#fca5a5' : '#e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  }),
  meta: {
    fontSize: '10px',
    color: '#334155',
    marginTop: '4px',
    paddingLeft: '4px',
    display: 'flex',
    gap: '12px',
  },
  metaChip: {
    background: '#0f1117',
    border: '1px solid #1e2333',
    borderRadius: '4px',
    padding: '1px 5px',
    fontSize: '10px',
    color: '#475569',
  },
  thinking: {
    alignSelf: 'flex-start' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
    fontSize: '12px',
    padding: '6px 0',
  },
  dot: (i: number) => ({
    width: '6px',
    height: '6px',
    background: '#3b82f6',
    borderRadius: '50%',
    animation: `pawnPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
  }),
  inputRow: {
    borderTop: '1px solid #1e2333',
    padding: '12px 20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    background: '#0a0d13',
  },
  textarea: {
    flex: 1,
    background: '#1a2035',
    border: '1px solid #1e2333',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '13px',
    lineHeight: 1.5,
    padding: '9px 13px',
    resize: 'none' as const,
    outline: 'none',
    fontFamily: 'inherit',
    minHeight: '40px',
    maxHeight: '120px',
  },
  sendBtn: (disabled: boolean) => ({
    background: disabled ? '#1e2333' : '#2563eb',
    border: 'none',
    borderRadius: '10px',
    color: disabled ? '#334155' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    padding: '9px 16px',
    transition: 'background 0.15s',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  }),
}

// Inject keyframe animation once
if (typeof document !== 'undefined' && !document.getElementById('pawn-pulse-style')) {
  const style = document.createElement('style')
  style.id = 'pawn-pulse-style'
  style.textContent = `
    @keyframes pawnPulse {
      0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
      40%            { opacity: 1;   transform: scale(1.2); }
    }
  `
  document.head.appendChild(style)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PawnModule(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const _msgId    = useRef(0)

  const nextId = () => ++_msgId.current

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Elapsed timer while waiting for Perplexity
  useEffect(() => {
    if (loading) {
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading])

  const submit = useCallback(async () => {
    const query = input.trim()
    if (!query || loading) return

    setInput('')
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: query }])
    setLoading(true)

    try {
      const resp = await fetch(PAWN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data: PawnResponse = await resp.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(), role: 'pawn', text: `Error: ${data.error}`,
            error: true,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'pawn',
            text: data.answer,
            meta: {
              intent: data.intent,
              enriched_chars: data.enriched_chars,
              tokens: data.usage?.total_tokens,
            },
          },
        ])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(), role: 'pawn',
          text: `Could not reach daemon at ${PAWN_ENDPOINT}.\n\n${msg}\n\nMake sure Helm daemon is running.`,
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }, [submit])

  const canSend = input.trim().length > 0 && !loading

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.headerTitle}>Pawn</span>
        <span style={S.headerSub}>Cathedral · Perplexity</span>
      </div>

      {/* Messages */}
      <div style={S.messages}>
        {messages.length === 0 && !loading && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>♟</div>
            <div style={S.emptyText}>
              Ask anything. Your query will be enriched with Cathedral context
              before Perplexity answers.
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={S.bubble(m.role, m.error)}>{m.text}</div>
            {m.meta && (
              <div style={S.meta}>
                <span style={S.metaChip}>{m.meta.intent}</span>
                <span style={S.metaChip}>{m.meta.enriched_chars.toLocaleString()} ctx chars</span>
                {m.meta.tokens != null && (
                  <span style={S.metaChip}>{m.meta.tokens.toLocaleString()} tokens</span>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={S.thinking}>
            <div style={S.dot(0)} />
            <div style={S.dot(1)} />
            <div style={S.dot(2)} />
            <span>{elapsed}s — asking Perplexity…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={S.inputRow}>
        <textarea
          style={S.textarea}
          placeholder="Ask Pawn… (Enter to send, Shift+Enter for newline)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={loading}
        />
        <button style={S.sendBtn(!canSend)} onClick={submit} disabled={!canSend}>
          Send
        </button>
      </div>
    </div>
  )
}
