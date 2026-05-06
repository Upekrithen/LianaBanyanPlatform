// AMPLIFY Computer — MoneyPenny Mobile PWA
// B37 Phase 5 — Self-contained mobile chat interface served from port 11480
//
// All assets generated as strings (no separate build step, no file I/O).
// Served by SubstrateAPIServer routes: /mobile /manifest.json /sw.js /icon.svg

// ─── Icon SVG ─────────────────────────────────────────────────────────────────

export function getIconSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b"/>
      <stop offset="100%" style="stop-color:#fbbf24"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect x="8" y="8" width="496" height="496" rx="90" fill="none" stroke="url(#gold)" stroke-width="8"/>
  <!-- M letterform -->
  <text x="256" y="340" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="280" font-weight="900"
    fill="url(#gold)">M</text>
  <!-- Subtitle -->
  <text x="256" y="430" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="52" font-weight="400" letter-spacing="8"
    fill="rgba(255,255,255,0.45)">AMPLIFY</text>
</svg>`;
}

// ─── PWA Manifest ─────────────────────────────────────────────────────────────

export function getManifestJSON(): string {
  return JSON.stringify(
    {
      name: 'MoneyPenny',
      short_name: 'MoneyPenny',
      description: 'AMPLIFY Computer — CAI Hearth substrate interface',
      display: 'standalone',
      orientation: 'portrait-primary',
      start_url: '/mobile',
      scope: '/',
      theme_color: '#1a1a2e',
      background_color: '#0f172a',
      icons: [
        {
          src: '/icon.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
      categories: ['productivity', 'utilities'],
    },
    null,
    2,
  );
}

// ─── Service Worker ───────────────────────────────────────────────────────────

export function getServiceWorker(): string {
  return `// MoneyPenny Service Worker — B37 Phase 5
const CACHE_NAME = 'moneypenny-v1';
const SHELL_URLS = ['/mobile', '/manifest.json', '/icon.svg'];

// Install: cache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)),
  );
  self.skipWaiting();
});

// Activate: prune old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for shell
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network-first, no caching
  if (
    url.pathname.startsWith('/substrate/') ||
    url.pathname.startsWith('/amplify/') ||
    url.pathname.startsWith('/federation/') ||
    url.pathname === '/mode' ||
    url.pathname === '/health'
  ) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', hit: false }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    return;
  }

  // Shell assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
`;
}

// ─── Mobile HTML Shell ────────────────────────────────────────────────────────

export function getMobileHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/>
  <meta name="theme-color" content="#1a1a2e"/>
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
  <meta name="apple-mobile-web-app-title" content="MoneyPenny"/>
  <link rel="manifest" href="/manifest.json"/>
  <link rel="apple-touch-icon" href="/icon.svg"/>
  <title>MoneyPenny</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:        #0f172a;
      --surface:   #1e293b;
      --surface2:  #273449;
      --gold:      #f59e0b;
      --gold-dim:  rgba(245,158,11,0.15);
      --green:     #22c55e;
      --blue:      #3b82f6;
      --text:      #e2e8f0;
      --text-muted: rgba(255,255,255,0.45);
      --border:    rgba(255,255,255,0.08);
      --radius:    14px;
      --safe-bottom: env(safe-area-inset-bottom, 0px);
      --safe-top:    env(safe-area-inset-top, 0px);
    }
    html, body {
      height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
      overscroll-behavior: none;
    }
    #app {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      max-width: 640px;
      margin: 0 auto;
    }

    /* ── Header ─────────────────────────────────────────────────── */
    #header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      padding-top: calc(12px + var(--safe-top));
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      gap: 10px;
    }
    #header-left { display: flex; align-items: center; gap: 10px; }
    #header-icon {
      width: 36px; height: 36px; border-radius: 9px;
      background: var(--gold-dim);
      border: 1px solid rgba(245,158,11,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    #header-title { font-size: 17px; font-weight: 700; color: var(--text); }
    #header-sub   { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
    #status-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #6b7280; flex-shrink: 0;
      transition: background 0.4s;
      box-shadow: 0 0 0 0 rgba(107,114,128,0);
    }
    #status-dot.online  { background: var(--green); box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
    #status-dot.offline { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
    #mode-badge {
      font-size: 10px; padding: 2px 7px; border-radius: 20px;
      background: var(--gold-dim); color: var(--gold);
      border: 1px solid rgba(245,158,11,0.25);
      white-space: nowrap;
    }

    /* ── Quick buttons ───────────────────────────────────────────── */
    #quick-bar {
      display: flex; gap: 8px; padding: 10px 16px 6px;
      overflow-x: auto; flex-shrink: 0;
      scrollbar-width: none;
    }
    #quick-bar::-webkit-scrollbar { display: none; }
    .qbtn {
      flex-shrink: 0;
      padding: 7px 14px; border-radius: 20px;
      background: var(--surface); color: var(--text);
      border: 1px solid var(--border);
      font-size: 13px; cursor: pointer;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.15s, border-color 0.15s;
      user-select: none;
    }
    .qbtn:active { background: var(--surface2); border-color: rgba(255,255,255,0.2); }
    .qbtn.gold { background: var(--gold-dim); border-color: rgba(245,158,11,0.3); color: var(--gold); }

    /* ── Message thread ──────────────────────────────────────────── */
    #thread {
      flex: 1; overflow-y: auto; padding: 12px 14px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    .msg {
      max-width: 86%; border-radius: var(--radius);
      padding: 10px 13px; font-size: 14px; line-height: 1.5;
      animation: msgIn 0.2s ease-out;
      word-break: break-word;
    }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .msg.user {
      align-self: flex-end;
      background: var(--blue);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .msg.assistant {
      align-self: flex-start;
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      border-bottom-left-radius: 4px;
    }
    .msg.system {
      align-self: center;
      background: transparent;
      color: var(--text-muted);
      font-size: 12px;
      text-align: center;
      padding: 4px 0;
    }
    .msg.error {
      align-self: flex-start;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      color: #fca5a5;
      font-size: 13px;
    }
    .msg-meta {
      font-size: 10px; color: var(--text-muted); margin-top: 4px;
      display: flex; align-items: center; gap: 6px;
    }
    .routing-badge {
      padding: 1px 6px; border-radius: 10px; font-size: 9px;
      font-weight: 600; letter-spacing: 0.3px;
    }
    .routing-badge.substrate_hit { background: rgba(34,197,94,0.15); color: #4ade80; }
    .routing-badge.local_ollama  { background: rgba(245,158,11,0.15); color: #fbbf24; }
    .routing-badge.cloud_escalation { background: rgba(99,102,241,0.15); color: #a5b4fc; }
    .routing-badge.miss { background: rgba(107,114,128,0.15); color: #9ca3af; }
    .routing-badge.peer_sync { background: rgba(59,130,246,0.15); color: #93c5fd; }

    /* Typing indicator */
    .typing { align-self: flex-start; }
    .typing-dots {
      display: flex; gap: 4px; padding: 12px 16px;
      background: var(--surface); border-radius: var(--radius);
      border-bottom-left-radius: 4px;
      border: 1px solid var(--border);
    }
    .typing-dots span {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-muted);
      animation: dot 1.2s infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot {
      0%,60%,100% { opacity: 0.3; transform: scale(0.8); }
      30%          { opacity: 1;   transform: scale(1); }
    }

    /* ── Input bar ───────────────────────────────────────────────── */
    #input-area {
      display: flex; gap: 10px; padding: 10px 14px;
      padding-bottom: calc(10px + var(--safe-bottom));
      background: var(--surface);
      border-top: 1px solid var(--border);
      flex-shrink: 0;
      align-items: flex-end;
    }
    #input {
      flex: 1; min-height: 42px; max-height: 120px;
      padding: 10px 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 22px;
      color: var(--text);
      font-size: 15px;
      font-family: inherit;
      resize: none;
      outline: none;
      line-height: 1.4;
      overflow-y: auto;
      transition: border-color 0.2s;
      -webkit-appearance: none;
    }
    #input:focus { border-color: rgba(245,158,11,0.4); }
    #input::placeholder { color: var(--text-muted); }
    #send-btn {
      width: 42px; height: 42px; border-radius: 50%;
      background: var(--gold); color: #000; border: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; cursor: pointer; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.1s, opacity 0.2s;
    }
    #send-btn:active { transform: scale(0.92); }
    #send-btn:disabled { opacity: 0.4; cursor: default; }

    /* ── Savings strip ───────────────────────────────────────────── */
    #savings-strip {
      display: none;
      padding: 7px 16px;
      background: rgba(34,197,94,0.07);
      border-bottom: 1px solid rgba(34,197,94,0.12);
      font-size: 11px; color: rgba(34,197,94,0.75);
      text-align: center; flex-shrink: 0;
    }
    #savings-strip.visible { display: block; }
  </style>
</head>
<body>
<div id="app">
  <!-- Header -->
  <div id="header">
    <div id="header-left">
      <div id="header-icon">M</div>
      <div>
        <div id="header-title">MoneyPenny</div>
        <div id="header-sub">AMPLIFY CAI Hearth</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span id="mode-badge">—</span>
      <span id="status-dot"></span>
    </div>
  </div>

  <!-- Savings strip -->
  <div id="savings-strip"></div>

  <!-- Quick buttons -->
  <div id="quick-bar">
    <button class="qbtn gold" data-action="brief">📋 Brief me</button>
    <button class="qbtn" data-action="yoke">🎯 Check Yoke</button>
    <button class="qbtn" data-action="pawn">⚖️ Pawn dispatch</button>
    <button class="qbtn" data-action="status">📡 Substrate status</button>
    <button class="qbtn" data-action="innovations">💡 Innovations</button>
  </div>

  <!-- Message thread -->
  <div id="thread"></div>

  <!-- Input bar -->
  <div id="input-area">
    <textarea id="input" rows="1" placeholder="Ask MoneyPenny…"></textarea>
    <button id="send-btn" disabled>↑</button>
  </div>
</div>

<script>
  'use strict';

  // ── State ────────────────────────────────────────────────────────
  const BASE = window.location.origin;
  let busy = false;
  let online = false;
  let currentMode = '—';

  // ── DOM ──────────────────────────────────────────────────────────
  const thread   = document.getElementById('thread');
  const input    = document.getElementById('input');
  const sendBtn  = document.getElementById('send-btn');
  const statusDot = document.getElementById('status-dot');
  const modeBadge = document.getElementById('mode-badge');
  const savingsStrip = document.getElementById('savings-strip');

  // ── Connectivity check ───────────────────────────────────────────
  async function checkHealth() {
    try {
      const r = await fetch(BASE + '/mode', { signal: AbortSignal.timeout(3000) });
      const d = await r.json();
      online = true;
      statusDot.className = 'online';
      const modeEmoji = { ai_burst: '🔥', normal: '🌿', fallback: '🌑' };
      currentMode = d.mode || 'normal';
      modeBadge.textContent = (modeEmoji[currentMode] || '') + ' ' + (currentMode.replace('_', ' '));
    } catch {
      online = false;
      statusDot.className = 'offline';
      modeBadge.textContent = 'Offline';
    }
  }

  // ── Savings strip ─────────────────────────────────────────────────
  async function loadSavings() {
    try {
      const r = await fetch(BASE + '/amplify/summary', { signal: AbortSignal.timeout(4000) });
      const d = await r.json();
      const s = d.month || d.session || {};
      const cost = s.cloud_cost_avoided_usd || 0;
      const q = s.total_queries || 0;
      if (q > 0) {
        savingsStrip.textContent =
          'This month: $' + cost.toFixed(4) + ' cloud cost avoided · ' + q + ' queries';
        savingsStrip.classList.add('visible');
      }
    } catch { /* offline */ }
  }

  // ── Message helpers ───────────────────────────────────────────────
  function addMsg(type, html, meta) {
    const div = document.createElement('div');
    div.className = 'msg ' + type;
    div.innerHTML = html;
    if (meta) {
      const m = document.createElement('div');
      m.className = 'msg-meta';
      m.innerHTML = meta;
      div.appendChild(m);
    }
    thread.appendChild(div);
    thread.scrollTop = thread.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'typing';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    thread.appendChild(div);
    thread.scrollTop = thread.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
  }

  function routingBadge(r) {
    const labels = {
      substrate_hit: 'Substrate',
      local_ollama: 'Ollama',
      cloud_escalation: 'Cloud',
      peer_sync: 'Peer',
      miss: 'Miss',
    };
    return '<span class="routing-badge ' + r + '">' + (labels[r] || r) + '</span>';
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\\n/g, '<br>');
  }

  // ── Quick action handlers ─────────────────────────────────────────
  async function handleBriefMe() {
    addMsg('user', '📋 Brief me');
    showTyping();
    try {
      const r = await fetch(BASE + '/amplify/summary', { signal: AbortSignal.timeout(6000) });
      const d = await r.json();
      removeTyping();
      const s = d.session || {};
      const m = d.month || {};
      const at = d.all_time_queries || 0;
      const lines = [
        '<strong>AMPLIFY CAI Hearth — Status Brief</strong>',
        '',
        '<strong>Session</strong>',
        '  Queries: ' + (s.total_queries || 0),
        '  Local served: ' + Math.round(((s.substrate_hit_ratio || 0) + (s.local_ratio || 0)) * 100) + '%',
        '  Cost avoided: $' + (s.cloud_cost_avoided_usd || 0).toFixed(4),
        '',
        '<strong>This Month</strong>',
        '  Queries: ' + (m.total_queries || 0),
        '  Cost avoided: $' + (m.cloud_cost_avoided_usd || 0).toFixed(4),
        '  Tokens saved: ' + ((m.tokens_saved_est || 0)).toLocaleString(),
        '',
        '<strong>All Time</strong>',
        '  ' + at.toLocaleString() + ' queries · $' + (d.all_time_cost_avoided_usd || 0).toFixed(4) + ' saved',
        '  Mode: ' + currentMode.replace('_', ' '),
      ];
      addMsg('assistant', lines.join('<br>'));
    } catch (e) {
      removeTyping();
      addMsg('error', 'Brief me failed: ' + e.message);
    }
  }

  const QUICK_QUERIES = {
    yoke: 'Yoke status — what tasks are pending in the Knight queue?',
    pawn: 'Pawn dispatch — what compliance or legal tasks are pending?',
    status: 'Substrate status — what is the current AMPLIFY index size and mode?',
    innovations: 'Innovation count — how many innovations and crown jewels does Liana Banyan have?',
  };

  async function sendQuery(text) {
    if (busy || !text.trim()) return;
    busy = true;
    sendBtn.disabled = true;

    addMsg('user', escHtml(text));
    showTyping();

    try {
      const r = await fetch(BASE + '/substrate/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
        signal: AbortSignal.timeout(12000),
      });
      const d = await r.json();
      removeTyping();

      if (d.hit && d.record) {
        const excerpt = d.record.text
          ? d.record.text.slice(0, 600) + (d.record.text.length > 600 ? '…' : '')
          : '(no text)';
        addMsg(
          'assistant',
          escHtml(excerpt),
          routingBadge(d.routing) +
          '<span>' + (d.latency_ms || 0) + 'ms</span>' +
          (d.score ? '<span>score: ' + d.score.toFixed(1) + '</span>' : ''),
        );
      } else if (d.routing === 'cloud_escalation') {
        addMsg(
          'assistant',
          '☁️ Not in substrate — routing to cloud API. No local record available.',
          routingBadge('cloud_escalation'),
        );
      } else if (d.routing === 'peer_sync') {
        addMsg(
          'assistant',
          '🌑 Fallback mode — querying peer substrate. ' + (d.peer_sync_exchanged ? d.peer_sync_exchanged + ' records exchanged.' : 'No local match found.'),
          routingBadge('peer_sync'),
        );
      } else {
        addMsg(
          'assistant',
          '❌ No substrate hit for this query. Escalate to cloud or add to substrate.',
          routingBadge(d.routing || 'miss'),
        );
      }
    } catch (e) {
      removeTyping();
      if (!online) {
        addMsg('error', '📵 Offline — is AMPLIFY Computer running on this network?');
      } else {
        addMsg('error', 'Query failed: ' + e.message);
      }
    } finally {
      busy = false;
      sendBtn.disabled = !input.value.trim();
    }
  }

  // ── Event wiring ──────────────────────────────────────────────────
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const a = btn.getAttribute('data-action');
      if (a === 'brief') { handleBriefMe(); return; }
      const q = QUICK_QUERIES[a];
      if (q) sendQuery(q);
    });
  });

  input.addEventListener('input', () => {
    // Auto-resize textarea
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    sendBtn.disabled = !input.value.trim() || busy;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });

  sendBtn.addEventListener('click', doSend);

  function doSend() {
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    sendQuery(text);
  }

  // ── Service worker registration ────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  }

  // ── Install prompt (Android Chrome) ───────────────────────────────
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show install hint
    addMsg('system', '📲 Tap ⋮ → Add to Home Screen to install MoneyPenny');
  });

  // ── Init ──────────────────────────────────────────────────────────
  async function init() {
    await checkHealth();
    await loadSavings();

    if (online) {
      addMsg('system', '● Connected to AMPLIFY CAI Hearth');
    } else {
      addMsg('system', '○ Offline — connect to the same WiFi as AMPLIFY Computer');
    }

    addMsg(
      'assistant',
      'Good evening. I\'m MoneyPenny — your AMPLIFY Computer substrate interface. ' +
      'What do you need?',
    );
  }

  // Poll health every 30s
  setInterval(checkHealth, 30000);
  // Refresh savings every 2min
  setInterval(loadSavings, 120000);

  init();
</script>
</body>
</html>`;
}

// ─── Local IP detection ───────────────────────────────────────────────────────

import { networkInterfaces } from 'os';

export function getLocalIPs(): string[] {
  const ifaces = networkInterfaces();
  const ips: string[] = [];

  for (const iface of Object.values(ifaces)) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }

  return ips;
}

export function getMoneyPennyURL(port = 11480): string {
  const ips = getLocalIPs();
  const ip = ips[0] ?? '127.0.0.1';
  return `http://${ip}:${port}/mobile`;
}
