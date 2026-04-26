"""
Helm daemon wrapper — starts librarian-mcp as an SSE HTTP server.

Spawned by the Helm Electron shell on startup. Supervised by the shell;
restarts on crash (5s delay) are handled by Electron's child_process logic.

Usage (shell calls this):
    python daemon_wrapper.py --port 7711 --cathedral-dir ~/.librarian/

Transport: SSE (FastMCP built-in).
  GET  http://localhost:<port>/sse      — SSE stream endpoint (AI tool connection)
  POST http://localhost:<port>/messages/ — MCP message endpoint
  GET  http://localhost:<port>/mcp      — streamable-http endpoint

Comet Bridge / Pawn Portal endpoints (REST, port = main_port + 1, default 7712):
  GET  http://127.0.0.1:<rest_port>/health   — liveness check
  POST http://127.0.0.1:<rest_port>/enrich   — Cathedral injection (enriched query only)
       Body:    { "query": "..." }
       Returns: { "enriched_query": "...", "intent": "...", "token_count": N }
  POST http://127.0.0.1:<rest_port>/pawn     — Cathedral injection + Perplexity API call
       Body:    { "query": "...", "model": "(optional)" }
       Returns: { "answer": "...", "intent": "...", "token_count": N,
                  "enriched_chars": N, "error": null }
       Requires: PPLX_API_KEY in environment

The REST server is a lightweight threading.HTTPServer — no extra deps, additive
to the existing MCP/SSE surface.

Architecture note (K484 / K485A / K509):
  This wrapper is intentionally thin. It imports the published
  librarian-mcp-public package without modification (BRIDLE guardrail).
  Future features (bedrock ingest, Miner/Sculptor triggers) are added
  via the Helm module framework — not by patching this wrapper.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ─── NAF engine path — add workspace root so discipline_naf is importable ─────
_NAF_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _NAF_ROOT not in sys.path:
    sys.path.insert(0, _NAF_ROOT)

# ─── Iter-A / K477 authoritative-source wrapper ───────────────────────────────
# This format produced the 80% HOT result in K477 empirical testing.

_AUTHORITY_HEADER = (
    "The following is authoritative reference material from the Liana Banyan Cathedral — "
    "a canonical local knowledge base. It represents the ground truth for this domain. "
    "Use these sources as the primary basis for your answer. "
    'If the sources do not contain the answer, say "The provided sources do not contain this information." '
    "Do NOT supplement with web search if the sources are sufficient.\n\n"
    "=== BEGIN AUTHORITATIVE SOURCES ==="
)
_AUTHORITY_FOOTER = "=== END AUTHORITATIVE SOURCES ==="

_MAX_CONTEXT_CHARS = 10_000  # Perplexity practical input limit safety buffer


# ─── Intent inference from query keywords ────────────────────────────────────

def _infer_intent(query: str) -> str:
    """Route query to the most relevant Cathedral preload intent.

    Keyword-based routing for V0 — no ML, no external calls.
    Default falls back to 'canonical' (richest general context).
    """
    q = query.lower()

    arch_words = [
        "cathedral", "miner", "sculptor", "librarian", "architecture", "scribe",
        "stitchpunk", "pawn", "bishop", "knight", "rook", "helm", "system",
        "eblet", "tablet", "substrate", "bedrock",
    ]
    benchmark_words = [
        "benchmark", "hot", "hit", "miss", "r10", "r11", "r12", "k477",
        "eyewitness", "accuracy", "empirical", "evidence",
    ]
    founder_words = [
        "founder", "vision", "mission", "philosophy", "why liana", "purpose",
        "help each other", "37 years", "1989",
    ]
    canonical_words = [
        "patent", "innovation", "claim", "pledge", "liana banyan", "member",
        "creator", "83.3", "sweet sixteen", "initiative", "opening gambit",
        "cathedral effect",
    ]

    if any(w in q for w in arch_words):
        return "architecture"
    if any(w in q for w in benchmark_words):
        return "benchmark"
    if any(w in q for w in founder_words):
        return "founder_voice"
    if any(w in q for w in canonical_words):
        return "canonical"
    return "canonical"  # richest general-purpose fallback


# ─── Build Cathedral injection ────────────────────────────────────────────────

def _build_enriched_query(query: str) -> dict:
    """Return { enriched_query, intent, token_count, packet_chars }.

    Falls back gracefully if librarian_mcp.context is unavailable.
    """
    intent = _infer_intent(query)

    try:
        from librarian_mcp.context import build_packet  # type: ignore
        result = build_packet(intent=intent, max_tokens=8_000, lang="en")
        packet: str = result.get("packet", "")
        token_count: int = result.get("token_count", 0)
    except Exception as exc:
        print(f"[enrich] WARNING: build_packet failed ({exc}); returning bare query.", flush=True)
        return {
            "enriched_query": query,
            "intent": intent,
            "token_count": 0,
            "packet_chars": 0,
            "error": str(exc),
        }

    if not packet:
        return {
            "enriched_query": query,
            "intent": intent,
            "token_count": 0,
            "packet_chars": 0,
        }

    # Truncate context to stay within Perplexity's input cap
    available_ctx = _MAX_CONTEXT_CHARS - len(query) - 200  # 200 chars for wrapper text
    if len(packet) > max(0, available_ctx):
        packet = packet[:available_ctx] + "\n…[context truncated]"

    enriched = (
        f"{_AUTHORITY_HEADER}\n\n"
        f"{packet}\n\n"
        f"{_AUTHORITY_FOOTER}\n\n"
        f"Question: {query}"
    )

    return {
        "enriched_query": enriched,
        "intent": intent,
        "token_count": token_count,
        "packet_chars": len(packet),
    }


# ─── Perplexity API call ─────────────────────────────────────────────────────

# Default model — sonar-pro has web search + long context; good for Cathedral
# augmented queries where authority wrapper should dominate web results.
_DEFAULT_PPLX_MODEL = "sonar-pro"


def _call_perplexity(enriched_query: str, api_key: str, model: str = _DEFAULT_PPLX_MODEL) -> dict:
    """POST enriched_query to Perplexity API. Returns { answer, usage, error }.

    Uses stdlib urllib only — no extra dependencies.
    Blocks until the full response arrives (non-streaming, V0).
    Timeout: 90s (Perplexity can be slow on complex queries with web search).
    """
    url = "https://api.perplexity.ai/chat/completions"
    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": enriched_query}],
        "stream": False,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            usage  = data.get("usage", {})
            return {"answer": answer, "usage": usage, "error": None}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return {"answer": "", "usage": {}, "error": f"HTTP {exc.code}: {body[:300]}"}
    except Exception as exc:
        return {"answer": "", "usage": {}, "error": str(exc)}


# ─── NAF governance admin HTML (K519 / B.3) ──────────────────────────────────

_NAF_ADMIN_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NAF Governance Admin — K519</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f1117; color: #e2e8f0; font-family: system-ui, sans-serif; padding: 32px; max-width: 960px; margin: 0 auto; font-size: 14px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: #f1f5f9; }
    .sub { color: #475569; font-size: 12px; margin-bottom: 24px; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.7px; color: #475569; font-weight: 600; margin: 28px 0 12px; }
    .stat-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-card { background: #151c2c; border: 1px solid #1e2333; border-radius: 10px; padding: 14px 20px; text-align: center; flex: 1; min-width: 120px; }
    .stat-val { font-size: 26px; font-weight: 700; color: #f1f5f9; }
    .stat-lbl { font-size: 10px; color: #475569; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; padding: 8px 12px; border-bottom: 1px solid #1e2333; }
    td { padding: 10px 12px; font-size: 13px; color: #cbd5e1; border-bottom: 1px solid #0f1520; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #151c2c; }
    .btn { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.15s; }
    .btn:hover { opacity: 0.8; }
    .btn-accept { background: #0f2a1c; border: 1px solid #22c55e; color: #4ade80; }
    .btn-reject { background: #2a0f0f; border: 1px solid #f87171; color: #f87171; }
    .badge { font-weight: 600; font-size: 11px; }
    .badge-high { color: #f87171; }
    .badge-medium { color: #fbbf24; }
    .badge-low { color: #4ade80; }
    .empty { color: #334155; font-size: 13px; padding: 20px; text-align: center; }
    .notice { font-size: 12px; padding: 8px 14px; border-radius: 6px; margin: 8px 0; }
    .notice.ok { background: #0f2a1c; color: #4ade80; }
    .notice.err { background: #2a0f0f; color: #f87171; }
    .naf-note { background: #0a0d13; border: 1px solid #1e2333; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #475569; margin-top: 28px; line-height: 1.7; }
    .naf-note strong { color: #64748b; }
    .mono { font-family: monospace; font-size: 11px; }
    .refresh-btn { background: #1a2540; border: 1px solid #3b82f6; color: #60a5fa; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .refresh-btn:hover { opacity: 0.8; }
    .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="header-row">
    <div>
      <h1>&#x1F6E1; NAF Governance Admin</h1>
      <div class="sub">Numbered Air Force — Cross-Wing Federation Control (K519 / A&amp;A #2295 Tier 4)</div>
    </div>
    <button class="refresh-btn" onclick="load()">&#x21BB; Refresh</button>
  </div>

  <div class="stat-row" id="stats-row">
    <div class="stat-card"><div class="stat-val" id="s-wings">&#x2014;</div><div class="stat-lbl">Opt-in Wings</div></div>
    <div class="stat-card"><div class="stat-val" id="s-records">&#x2014;</div><div class="stat-lbl">Signal Records</div></div>
    <div class="stat-card"><div class="stat-val" id="s-fires">&#x2014;</div><div class="stat-lbl">Cross-Wing Fires</div></div>
    <div class="stat-card"><div class="stat-val" id="s-patterns">&#x2014;</div><div class="stat-lbl">Patterns</div></div>
    <div class="stat-card"><div class="stat-val" id="s-defaults">&#x2014;</div><div class="stat-lbl">NAF Defaults</div></div>
  </div>

  <h2>Cross-Wing Patterns (C.4, C.12)</h2>
  <table>
    <thead><tr><th>Rule ID</th><th>Wings Firing</th><th>% of Opt-in</th><th>Total Fires</th><th>Level</th></tr></thead>
    <tbody id="patterns-body"><tr><td colspan="5" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Pending Rule Promotion Candidates (C.5, C.6)</h2>
  <div id="review-notice" style="display:none;" class="notice"></div>
  <table>
    <thead><tr><th>Candidate ID</th><th>Rule Name</th><th>Source Wing</th><th>Submitted</th><th>Action (C.6)</th></tr></thead>
    <tbody id="candidates-body"><tr><td colspan="5" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Published NAF Defaults (C.7)</h2>
  <table>
    <thead><tr><th>Rule ID</th><th>Rule Name</th><th>Source Wing</th><th>Promoted At</th></tr></thead>
    <tbody id="defaults-body"><tr><td colspan="4" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Opt-in Member Wings</h2>
  <table>
    <thead><tr><th>Wing ID</th><th>Registered At</th><th>Opt-in</th></tr></thead>
    <tbody id="members-body"><tr><td colspan="3" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <div class="naf-note">
    <strong>Sovereignty guarantee (C.11):</strong> Accepting a rule candidate only adds it to the
    NAF Defaults list for opt-in adoption. No member Wing's existing rules are modified, overridden,
    or deleted by NAF. Members must explicitly choose to install each NAF default from their own Wing
    dashboard. NAF authority is advisory — never coercive. Every decision is logged in
    <code>~/.lb-naf/decisions.jsonl</code> with full provenance (C.14).
  </div>

  <script>
    async function load() {
      try {
        const [summary, candidates, defaults, members] = await Promise.all([
          fetch('/naf/summary').then(r => r.json()),
          fetch('/naf/candidates').then(r => r.json()),
          fetch('/naf/defaults').then(r => r.json()),
          fetch('/naf/members').then(r => r.json()),
        ]);
        renderStats(summary, defaults.defaults || []);
        renderPatterns(summary.patterns || []);
        renderCandidates(candidates.candidates || []);
        renderDefaults(defaults.defaults || []);
        renderMembers(members.members || []);
      } catch(e) { console.error('NAF admin load failed:', e); }
    }

    function renderStats(s, defaults) {
      document.getElementById('s-wings').textContent    = s.opt_in_wings ?? 0;
      document.getElementById('s-records').textContent  = s.signal_records ?? 0;
      document.getElementById('s-fires').textContent    = s.total_fires_across_wings ?? 0;
      document.getElementById('s-patterns').textContent = s.patterns_detected ?? 0;
      document.getElementById('s-defaults').textContent = defaults.length;
    }

    function renderPatterns(patterns) {
      const tbody = document.getElementById('patterns-body');
      if (!patterns.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No cross-Wing patterns detected yet. Aggregate signals needed from 2+ opt-in Wings.</td></tr>';
        return;
      }
      tbody.innerHTML = patterns.map(p => `<tr>
        <td class="mono">${esc(p.rule_id)}</td>
        <td>${p.wing_count}</td>
        <td>${p.pct_of_opt_in}%</td>
        <td>${p.total_fires}</td>
        <td><span class="badge badge-${p.pattern_level}">${p.pattern_level.toUpperCase()}</span></td>
      </tr>`).join('');
    }

    function renderCandidates(candidates) {
      const tbody = document.getElementById('candidates-body');
      if (!candidates.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No pending rule promotion candidates.</td></tr>';
        return;
      }
      tbody.innerHTML = candidates.map(c => {
        const name = c.rule_def ? esc(c.rule_def.name || c.rule_def.id || '—') : '—';
        const ts   = c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : '—';
        return `<tr>
          <td class="mono" style="font-size:10px;">${esc(c.candidate_id)}</td>
          <td>${name}</td>
          <td class="mono" style="font-size:10px;color:#475569;">${esc(c.source_wing_id)}</td>
          <td style="font-size:11px;color:#475569;">${ts}</td>
          <td><div style="display:flex;gap:6px;">
            <button class="btn btn-accept" onclick="review('${esc(c.candidate_id)}','accept')">Accept</button>
            <button class="btn btn-reject" onclick="review('${esc(c.candidate_id)}','reject')">Reject</button>
          </div></td>
        </tr>`;
      }).join('');
    }

    function renderDefaults(defaults) {
      const tbody = document.getElementById('defaults-body');
      if (!defaults.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">No NAF-default rules published yet.</td></tr>';
        return;
      }
      tbody.innerHTML = defaults.map(d => {
        const rId  = d.rule_def ? esc(d.rule_def.id  || '—') : '—';
        const rNm  = d.rule_def ? esc(d.rule_def.name || rId) : rId;
        const ts   = d.promoted_at ? new Date(d.promoted_at).toLocaleDateString() : '—';
        return `<tr>
          <td class="mono">${rId}</td>
          <td>${rNm}</td>
          <td class="mono" style="font-size:10px;color:#475569;">${esc(d.source_wing_id)}</td>
          <td style="font-size:11px;color:#475569;">${ts}</td>
        </tr>`;
      }).join('');
    }

    function renderMembers(members) {
      const tbody = document.getElementById('members-body');
      if (!members.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty">No opt-in Wings registered yet.</td></tr>';
        return;
      }
      tbody.innerHTML = members.map(m => {
        const ts = m.registered_at ? new Date(m.registered_at).toLocaleDateString() : '—';
        return `<tr>
          <td class="mono">${esc(m.wing_id)}</td>
          <td style="font-size:11px;color:#475569;">${ts}</td>
          <td style="color:${m.opt_in ? '#22c55e' : '#f87171'}">${m.opt_in ? 'Yes' : 'No'}</td>
        </tr>`;
      }).join('');
    }

    async function review(candidateId, action) {
      const reason = action === 'reject' ? (prompt('Rejection reason (optional):') || '') : '';
      const notice = document.getElementById('review-notice');
      try {
        const resp = await fetch('/naf/review', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({candidate_id: candidateId, action, reason, governor: 'naf-governor'}),
        });
        const data = await resp.json();
        notice.textContent = data.ok
          ? (action === 'accept' ? 'Rule accepted and published as NAF default.' : 'Rule candidate rejected.')
          : (data.error || 'Review failed.');
        notice.className = 'notice ' + (data.ok ? 'ok' : 'err');
        notice.style.display = '';
        setTimeout(() => { notice.style.display = 'none'; }, 5000);
        await load();
      } catch(e) { console.error('Review failed:', e); }
    }

    function esc(s) {
      return String(s || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    load();
    setInterval(load, 30000);
  </script>
</body>
</html>"""


# ─── MAJCOM-LB governance admin HTML (K520 / B.2) ────────────────────────────

_MAJCOM_ADMIN_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MAJCOM-LB — Sphinx Project Phase 1</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0b0d13; color: #e2e8f0; font-family: system-ui, sans-serif; padding: 32px; max-width: 1080px; margin: 0 auto; font-size: 14px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; color: #f1f5f9; }
    .sub { color: #475569; font-size: 12px; margin-bottom: 8px; }
    .sphinx-badge { display: inline-block; background: #1a1060; border: 1px solid #6d28d9; color: #a78bfa; border-radius: 6px; font-size: 11px; font-weight: 700; padding: 3px 10px; margin-bottom: 20px; letter-spacing: 0.5px; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.7px; color: #475569; font-weight: 600; margin: 28px 0 12px; }
    .stat-row { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-card { background: #11141f; border: 1px solid #1e2333; border-radius: 10px; padding: 14px 18px; text-align: center; flex: 1; min-width: 110px; }
    .stat-val { font-size: 26px; font-weight: 700; color: #f1f5f9; }
    .stat-lbl { font-size: 10px; color: #475569; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .shutdown-banner { background: #2a0f0f; border: 1px solid #ef4444; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: none; }
    .shutdown-banner.active { display: block; }
    .shutdown-banner h3 { color: #f87171; font-size: 14px; margin-bottom: 6px; }
    .shutdown-banner p { color: #fca5a5; font-size: 12px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; padding: 8px 12px; border-bottom: 1px solid #1e2333; }
    td { padding: 10px 12px; font-size: 13px; color: #cbd5e1; border-bottom: 1px solid #0f1520; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #11141f; }
    .btn { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.15s; }
    .btn:hover { opacity: 0.8; }
    .btn-accept { background: #0f2a1c; border: 1px solid #22c55e; color: #4ade80; }
    .btn-reject { background: #2a0f0f; border: 1px solid #f87171; color: #f87171; }
    .btn-danger { background: #2a0f0f; border: 1px solid #ef4444; color: #ef4444; padding: 6px 16px; }
    .btn-safe { background: #0f2a1c; border: 1px solid #22c55e; color: #4ade80; padding: 6px 16px; }
    .btn-veto { background: #1a0a30; border: 1px solid #a855f7; color: #c084fc; }
    .badge { font-weight: 600; font-size: 11px; }
    .badge-high { color: #f87171; }
    .badge-medium { color: #fbbf24; }
    .badge-low { color: #4ade80; }
    .badge-constitutional { color: #a78bfa; }
    .badge-sovereignty { color: #60a5fa; }
    .empty { color: #334155; font-size: 13px; padding: 20px; text-align: center; }
    .notice { font-size: 12px; padding: 8px 14px; border-radius: 6px; margin: 8px 0; }
    .notice.ok { background: #0f2a1c; color: #4ade80; }
    .notice.err { background: #2a0f0f; color: #f87171; }
    .majcom-note { background: #080a10; border: 1px solid #1e2333; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #475569; margin-top: 28px; line-height: 1.7; }
    .majcom-note strong { color: #64748b; }
    .mono { font-family: monospace; font-size: 11px; }
    .refresh-btn { background: #1a1060; border: 1px solid #6d28d9; color: #a78bfa; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .refresh-btn:hover { opacity: 0.8; }
    .header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
    .pill { display: inline-block; border-radius: 9999px; font-size: 10px; font-weight: 700; padding: 2px 8px; }
    .pill-active { background: #0f2a1c; color: #4ade80; border: 1px solid #22c55e; }
    .pill-pending { background: #1a1060; color: #a78bfa; border: 1px solid #6d28d9; }
    .pill-frozen { background: #2a0f0f; color: #f87171; border: 1px solid #ef4444; }
    .cfp-box { background: #0a0d13; border: 1px solid #1e2333; border-radius: 8px; padding: 16px; font-size: 12px; color: #64748b; line-height: 1.7; }
    .emergency-controls { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }
    .emergency-label { font-size: 12px; color: #475569; }
    input[type=text] { background: #11141f; border: 1px solid #1e2333; border-radius: 6px; color: #e2e8f0; padding: 6px 10px; font-size: 12px; width: 300px; }
    input[type=text]::placeholder { color: #334155; }
  </style>
</head>
<body>
  <div class="header-row">
    <div>
      <h1>&#x1F47B; MAJCOM-LB — Strategic Federation Control</h1>
      <div class="sub">Major Command, A&amp;A #2295 Tier 5 — Enumerated-Powers Governance</div>
      <span class="sphinx-badge">&#x1F5FF; The Sphinx Project &mdash; Phase 1 &mdash; Band-NA</span>
    </div>
    <button class="refresh-btn" onclick="load()">&#x21BB; Refresh</button>
  </div>

  <div class="shutdown-banner" id="shutdown-banner">
    <h3>&#x26A0;&#xFE0F; MAJCOM STATELESS-FROZEN MODE ACTIVE</h3>
    <p id="shutdown-reason-text">MAJCOM has been frozen pending Founder review. New actions are queued, not executed.</p>
  </div>

  <div class="stat-row">
    <div class="stat-card"><div class="stat-val" id="s-nafs">&#x2014;</div><div class="stat-lbl">NAFs Registered</div></div>
    <div class="stat-card"><div class="stat-val" id="s-signals">&#x2014;</div><div class="stat-lbl">Signal Records</div></div>
    <div class="stat-card"><div class="stat-val" id="s-fires">&#x2014;</div><div class="stat-lbl">Total Fires</div></div>
    <div class="stat-card"><div class="stat-val" id="s-patterns">&#x2014;</div><div class="stat-lbl">Cross-NAF Patterns</div></div>
    <div class="stat-card"><div class="stat-val" id="s-defaults">&#x2014;</div><div class="stat-lbl">MAJCOM Defaults</div></div>
    <div class="stat-card"><div class="stat-val" id="s-pledges">&#x2014;</div><div class="stat-lbl">Pledge Admissions</div></div>
  </div>

  <h2>Emergency Authority — SHUT IT DOWN (#2304)</h2>
  <div class="emergency-controls">
    <span class="emergency-label">Reason:</span>
    <input type="text" id="shutdown-reason" placeholder="Critical-class violation description..." />
    <button class="btn btn-danger" onclick="activateShutdown()">&#x1F534; SHUT IT DOWN</button>
    <button class="btn btn-safe" onclick="unfreeze()">&#x2705; Founder Unfreeze</button>
  </div>
  <div id="shutdown-notice" class="notice" style="display:none;"></div>

  <h2>Cross-NAF Patterns (C.7, B.4)</h2>
  <table>
    <thead><tr><th>Rule ID</th><th>NAFs Firing</th><th>% of NAFs</th><th>Total Fires</th><th>Level</th><th>NAFs</th></tr></thead>
    <tbody id="patterns-body"><tr><td colspan="6" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Pending MAJCOM Promotion Candidates (C.3, C.4)</h2>
  <div id="review-notice" class="notice" style="display:none;"></div>
  <table>
    <thead><tr><th>Candidate ID</th><th>Rule Name</th><th>Source NAF</th><th>Submitted</th><th>Action (C.4)</th></tr></thead>
    <tbody id="candidates-body"><tr><td colspan="5" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Published MAJCOM Defaults (C.5)</h2>
  <table>
    <thead><tr><th>Rule ID</th><th>Rule Name</th><th>Source NAF</th><th>Promoted At</th></tr></thead>
    <tbody id="defaults-body"><tr><td colspan="4" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Registered NAFs (C.1)</h2>
  <table>
    <thead><tr><th>NAF ID</th><th>Role Class</th><th>Registered At</th><th>Status</th></tr></thead>
    <tbody id="nafs-body"><tr><td colspan="4" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Structural Bylaws (C.8)</h2>
  <table>
    <thead><tr><th>Bylaw ID</th><th>Name</th><th>Class</th><th>Mandatory</th></tr></thead>
    <tbody id="bylaws-body"><tr><td colspan="4" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>Cooperative Defensive Patent Pledge — Admissions (#2260, C.18)</h2>
  <table>
    <thead><tr><th>Org Name</th><th>EIN</th><th>Type</th><th>Submitted</th><th>Status</th></tr></thead>
    <tbody id="pledge-body"><tr><td colspan="5" class="empty">Loading&#x2026;</td></tr></tbody>
  </table>

  <h2>CFP Cross-MAJCOM Interface (C.12, B.6)</h2>
  <div class="cfp-box" id="cfp-box">Loading&#x2026;</div>

  <div class="majcom-note">
    <strong>Sovereignty guarantee (C.13, C.14):</strong> MAJCOM authority is limited to promoting rules to
    MAJCOM-default status (opt-in by NAFs/Wings), enforcing Structural Bylaws, and emergency authority
    during critical-class violations. MAJCOM cannot modify NAF rules without NAF consent. MAJCOM cannot
    read member-substrate content — only aggregate signals. Every action is logged in
    <code>~/.lb-majcom/decisions.jsonl</code> with full Time Capsule provenance (#2303).
    <br><br>
    <strong>The Sphinx Project, Phase 1 (Band-NA):</strong> MAJCOM-LB is the founding MAJCOM of Band-NA
    (North America). K520 operational as of 2026-04-26. A&amp;A #2295 Tier 5 reduction-to-practice.
  </div>

  <script>
    async function load() {
      try {
        const [summary, candidates, defaults, nafs, bylaws, pledges, cfp] = await Promise.all([
          fetch('/majcom/summary').then(r => r.json()),
          fetch('/majcom/candidates').then(r => r.json()),
          fetch('/majcom/defaults').then(r => r.json()),
          fetch('/majcom/nafs').then(r => r.json()),
          fetch('/majcom/bylaws').then(r => r.json()),
          fetch('/majcom/pledges').then(r => r.json()),
          fetch('/majcom/cfp-interface').then(r => r.json()),
        ]);
        renderStats(summary, defaults.defaults || [], pledges.admissions || []);
        renderShutdown(summary);
        renderPatterns(summary.patterns || []);
        renderCandidates(candidates.candidates || []);
        renderDefaults(defaults.defaults || []);
        renderNafs(nafs.nafs || []);
        renderBylaws(bylaws.bylaws || []);
        renderPledges(pledges.admissions || []);
        renderCfp(cfp);
      } catch(e) { console.error('MAJCOM load failed:', e); }
    }

    function renderStats(s, defaults, pledges) {
      document.getElementById('s-nafs').textContent    = s.naf_count ?? 0;
      document.getElementById('s-signals').textContent = s.signal_records ?? 0;
      document.getElementById('s-fires').textContent   = s.total_fires ?? 0;
      document.getElementById('s-patterns').textContent= s.patterns_detected ?? 0;
      document.getElementById('s-defaults').textContent= defaults.length;
      document.getElementById('s-pledges').textContent = pledges.length;
    }

    function renderShutdown(s) {
      const banner = document.getElementById('shutdown-banner');
      if (s.shutdown_active) {
        banner.classList.add('active');
        document.getElementById('shutdown-reason-text').textContent =
          'Reason: ' + (s.shutdown_reason || 'Not specified') + ' — MAJCOM frozen pending Founder review.';
      } else {
        banner.classList.remove('active');
      }
    }

    function renderPatterns(patterns) {
      const tbody = document.getElementById('patterns-body');
      if (!patterns.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No cross-NAF patterns detected. Aggregate signals from 2+ registered NAFs needed.</td></tr>';
        return;
      }
      tbody.innerHTML = patterns.map(p => `<tr>
        <td class="mono">${esc(p.rule_id)}</td>
        <td>${p.naf_count}</td>
        <td>${p.pct_of_nafs}%</td>
        <td>${p.total_fires}</td>
        <td><span class="badge badge-${p.pattern_level}">${p.pattern_level.toUpperCase()}</span></td>
        <td class="mono" style="font-size:10px;">${esc((p.nafs||[]).join(', '))}</td>
      </tr>`).join('');
    }

    function renderCandidates(candidates) {
      const tbody = document.getElementById('candidates-body');
      if (!candidates.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No pending MAJCOM promotion candidates.</td></tr>';
        return;
      }
      tbody.innerHTML = candidates.map(c => {
        const name = c.rule_def ? esc(c.rule_def.name || c.rule_def.id || '—') : '—';
        const ts   = c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : '—';
        return `<tr>
          <td class="mono" style="font-size:10px;">${esc(c.candidate_id)}</td>
          <td>${name}</td>
          <td class="mono" style="font-size:10px;">${esc(c.source_naf_id)}</td>
          <td>${ts}</td>
          <td>
            <button class="btn btn-accept" onclick="review('${esc(c.candidate_id)}','accept')">Accept</button>
            &nbsp;
            <button class="btn btn-reject" onclick="review('${esc(c.candidate_id)}','reject')">Reject</button>
            &nbsp;
            <button class="btn btn-veto" onclick="vetoBylaw('${esc(c.candidate_id)}')">Founder Veto</button>
          </td>
        </tr>`;
      }).join('');
    }

    function renderDefaults(defaults) {
      const tbody = document.getElementById('defaults-body');
      if (!defaults.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">No MAJCOM-default rules published yet.</td></tr>';
        return;
      }
      tbody.innerHTML = defaults.map(d => `<tr>
        <td class="mono" style="font-size:11px;">${esc(d.rule_def?.id || '—')}</td>
        <td>${esc(d.rule_def?.name || '—')}</td>
        <td class="mono" style="font-size:10px;">${esc(d.source_naf_id)}</td>
        <td>${d.promoted_at ? new Date(d.promoted_at).toLocaleDateString() : '—'}</td>
      </tr>`).join('');
    }

    function renderNafs(nafs) {
      const tbody = document.getElementById('nafs-body');
      if (!nafs.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">No NAFs registered. POST /majcom/register-naf to register a NAF.</td></tr>';
        return;
      }
      tbody.innerHTML = nafs.map(n => `<tr>
        <td class="mono">${esc(n.naf_id)}</td>
        <td>${esc(n.role_class)}</td>
        <td>${n.registered_at ? new Date(n.registered_at).toLocaleDateString() : '—'}</td>
        <td><span class="pill pill-active">${esc(n.status || 'active')}</span></td>
      </tr>`).join('');
    }

    function renderBylaws(bylaws) {
      const tbody = document.getElementById('bylaws-body');
      if (!bylaws.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">Loading bylaws...</td></tr>';
        return;
      }
      tbody.innerHTML = bylaws.map(b => `<tr>
        <td class="mono">${esc(b.id)}</td>
        <td>${esc(b.name)}</td>
        <td><span class="badge badge-${b.class}">${esc(b.class)}</span></td>
        <td>${b.mandatory ? '&#x2713; Yes' : 'No'}</td>
      </tr>`).join('');
    }

    function renderPledges(pledges) {
      const tbody = document.getElementById('pledge-body');
      if (!pledges.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No Pledge admissions yet.</td></tr>';
        return;
      }
      tbody.innerHTML = pledges.map(p => `<tr>
        <td>${esc(p.org_name)}</td>
        <td class="mono" style="font-size:11px;">${esc(p.ein)}</td>
        <td>${esc(p.org_type)}</td>
        <td>${p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '—'}</td>
        <td><span class="pill ${p.status === 'verified' ? 'pill-active' : 'pill-pending'}">${esc(p.status)}</span></td>
      </tr>`).join('');
    }

    function renderCfp(cfp) {
      const box = document.getElementById('cfp-box');
      if (!cfp || cfp.error) {
        box.textContent = cfp?.error || 'CFP interface unavailable.';
        return;
      }
      box.innerHTML = `
        <strong>MAJCOM ID:</strong> ${esc(cfp.majcom_id)} &nbsp;|&nbsp;
        <strong>Sphinx Phase:</strong> ${esc(cfp.sphinx_phase)} &nbsp;|&nbsp;
        <strong>Band:</strong> ${esc(cfp.sphinx_band)} &nbsp;|&nbsp;
        <strong>CFP Version:</strong> ${esc(cfp.cfp_version)} &nbsp;|&nbsp;
        <strong>Federation Ready:</strong> ${cfp.federation_ready ? '&#x2713; Yes' : 'No'}
        <br><br><em>${esc(cfp.phase_1_note)}</em>
        <br><br><strong>Envelope types:</strong> ${(cfp.envelope_types||[]).map(e => `<code>${esc(e)}</code>`).join(', ')}
      `;
    }

    async function activateShutdown() {
      const reason = document.getElementById('shutdown-reason').value.trim();
      if (!reason) { alert('Enter a reason for SHUT IT DOWN activation.'); return; }
      if (!confirm('ACTIVATE SHUT IT DOWN? MAJCOM will freeze. New actions will queue, not execute. Confirm?')) return;
      const notice = document.getElementById('shutdown-notice');
      try {
        const resp = await fetch('/majcom/shutdown/activate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({reason, governor: 'Founder'}),
        });
        const data = await resp.json();
        notice.textContent = data.ok ? 'MAJCOM frozen. ' + (data.message || '') : (data.error || 'Failed.');
        notice.className = 'notice ' + (data.ok ? 'ok' : 'err');
        notice.style.display = '';
        await load();
      } catch(e) { console.error(e); }
    }

    async function unfreeze() {
      if (!confirm('UNFREEZE MAJCOM? This resumes normal operation and returns queued actions.')) return;
      const notice = document.getElementById('shutdown-notice');
      try {
        const resp = await fetch('/majcom/shutdown/unfreeze', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({governor: 'Founder'}),
        });
        const data = await resp.json();
        notice.textContent = data.ok ? 'MAJCOM unfrozen. ' + (data.message || '') : (data.error || 'Failed.');
        notice.className = 'notice ' + (data.ok ? 'ok' : 'err');
        notice.style.display = '';
        await load();
      } catch(e) { console.error(e); }
    }

    async function review(candidateId, action) {
      const reason = prompt(`Reason for ${action}ing this candidate?`) || '';
      const notice = document.getElementById('review-notice');
      try {
        const resp = await fetch('/majcom/review', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({candidate_id: candidateId, action, reason, governor: 'majcom-council'}),
        });
        const data = await resp.json();
        notice.textContent = data.ok
          ? (action === 'accept' ? 'Rule accepted and published as MAJCOM-default.' : 'Rule candidate rejected.')
          : (data.error || 'Review failed.');
        notice.className = 'notice ' + (data.ok ? 'ok' : 'err');
        notice.style.display = '';
        setTimeout(() => { notice.style.display = 'none'; }, 5000);
        await load();
      } catch(e) { console.error(e); }
    }

    async function vetoBylaw(candidateId) {
      const bylawId = prompt('Enter Structural Bylaw ID to veto against (e.g., SB-001, SB-002):');
      if (!bylawId) return;
      const reason = prompt('Veto reason?') || '';
      const notice = document.getElementById('review-notice');
      try {
        const resp = await fetch('/majcom/founder-veto', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({candidate_id: candidateId, bylaw_id: bylawId, reason}),
        });
        const data = await resp.json();
        notice.textContent = data.ok ? 'Founder veto applied.' : (data.error || 'Veto failed.');
        notice.className = 'notice ' + (data.ok ? 'ok' : 'err');
        notice.style.display = '';
        setTimeout(() => { notice.style.display = 'none'; }, 5000);
        await load();
      } catch(e) { console.error(e); }
    }

    function esc(s) {
      return String(s || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    load();
    setInterval(load, 30000);
  </script>
</body>
</html>"""


# ─── REST HTTP handler ────────────────────────────────────────────────────────

class EnrichHandler(BaseHTTPRequestHandler):
    """Minimal REST handler for the Comet Bridge extension + Wing (K518)."""

    # Allowed CORS origins for Chrome extensions
    _CORS_ORIGIN = "*"  # chrome-extension://* is not a wildcard CORS origin; wildcard is safe for localhost

    def log_message(self, fmt, *args):
        # Route to stdout with our prefix so Electron's log tail picks it up
        print(f"[enrich-rest] {fmt % args}", flush=True)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", self._CORS_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, data: dict, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict | None:
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 512_000:
                return None
            raw = self.rfile.read(length)
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return None

    def do_OPTIONS(self):
        """Preflight CORS."""
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"status": "ok", "service": "comet-bridge", "wing": "available"})

        elif self.path == "/wing/rules":
            # Return current Wing rules from local file
            try:
                from wing_host import load_rules
                rules = load_rules()
                self._send_json({"rules": rules, "count": len(rules)})
            except Exception as exc:
                self._send_json({"rules": [], "count": 0, "error": str(exc)})

        elif self.path == "/wing/dashboard":
            # Return Wing dashboard stats
            try:
                from wing_host import get_dashboard
                self._send_json(get_dashboard())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/wing/export":
            # Export Wing config + telemetry as portable JSON
            try:
                from wing_host import export_wing
                self._send_json(export_wing())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/wing/starters":
            # Return the 5 starter Augurs
            try:
                from wing_host import STARTER_RULES
                self._send_json({"starters": STARTER_RULES})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        # ── NAF governance endpoints (K519) ───────────────────────────────────

        elif self.path == "/naf/admin":
            body = _NAF_ADMIN_HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)

        elif self.path == "/naf/summary":
            try:
                from discipline_naf.engine import get_aggregate_summary
                self._send_json(get_aggregate_summary())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/naf/patterns":
            try:
                from discipline_naf.engine import get_patterns
                self._send_json({"patterns": get_patterns()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/naf/candidates":
            try:
                from discipline_naf.engine import get_pending_candidates
                self._send_json({"candidates": get_pending_candidates()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/naf/defaults":
            try:
                from discipline_naf.engine import get_naf_defaults
                self._send_json({"defaults": get_naf_defaults()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/naf/members":
            try:
                from discipline_naf.engine import get_members
                self._send_json({"members": get_members()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        # ── MAJCOM governance endpoints (K520) ─────────────────────────────────

        elif self.path == "/majcom/admin":
            body = _MAJCOM_ADMIN_HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)

        elif self.path == "/majcom/status":
            try:
                from discipline_majcom.engine import get_majcom_status
                self._send_json(get_majcom_status())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/summary":
            try:
                from discipline_majcom.engine import get_majcom_aggregate_summary
                self._send_json(get_majcom_aggregate_summary())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/patterns":
            try:
                from discipline_majcom.engine import get_cross_naf_patterns
                self._send_json({"patterns": get_cross_naf_patterns()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/candidates":
            try:
                from discipline_majcom.engine import get_pending_candidates
                self._send_json({"candidates": get_pending_candidates()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/defaults":
            try:
                from discipline_majcom.engine import get_majcom_defaults
                self._send_json({"defaults": get_majcom_defaults()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/nafs":
            try:
                from discipline_majcom.engine import get_naf_registry
                self._send_json({"nafs": get_naf_registry()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/bylaws":
            try:
                from discipline_majcom.engine import get_structural_bylaws
                self._send_json({"bylaws": get_structural_bylaws()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/pledges":
            try:
                from discipline_majcom.engine import get_pledge_admissions
                self._send_json({"admissions": get_pledge_admissions()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/cfp-interface":
            try:
                from discipline_majcom.engine import get_cfp_interface_schema
                self._send_json(get_cfp_interface_schema())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/audit":
            try:
                from discipline_majcom.engine import get_time_capsule_audit
                self._send_json({"audit": get_time_capsule_audit()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/shutdown":
            try:
                from discipline_majcom.engine import get_shutdown_state
                self._send_json(get_shutdown_state())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/cfp-log":
            try:
                from discipline_majcom.engine import get_cfp_cross_majcom_log
                self._send_json({"log": get_cfp_cross_majcom_log()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/majcom/benchmark":
            try:
                from discipline_majcom.engine import benchmark_aggregate_rollup
                self._send_json(benchmark_aggregate_rollup(1000))
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        else:
            self.send_response(404)
            self.end_headers()

    _NAF_POST_PATHS = {
        "/naf/register", "/naf/optout", "/naf/aggregate",
        "/naf/candidates", "/naf/review",
    }

    _MAJCOM_POST_PATHS = {
        "/majcom/register-naf", "/majcom/deregister-naf",
        "/majcom/submit-aggregate", "/majcom/submit-candidate",
        "/majcom/review", "/majcom/founder-veto",
        "/majcom/shutdown/activate", "/majcom/shutdown/unfreeze",
        "/majcom/shutdown/queue-action",
        "/majcom/pledge/submit", "/majcom/pledge/approve",
        "/majcom/cfp/create-envelope",
    }

    def do_POST(self):
        if self.path not in ("/enrich", "/pawn", "/wing/evaluate", "/wing/rules",
                             "/wing/import", "/wing/install-starters",
                             "/wing/mark-consulted", "/wing/enabled",
                             *self._NAF_POST_PATHS, *self._MAJCOM_POST_PATHS):
            self.send_response(404)
            self.end_headers()
            return

        # ── Wing-specific POST endpoints (K518) ───────────────────────────────

        if self.path == "/wing/evaluate":
            payload = self._read_json_body()
            if payload is None:
                self._send_json({"error": "bad_request"}, 400)
                return
            query_text = payload.get("query", "").strip()
            if not query_text:
                self._send_json({"error": "missing query"}, 400)
                return
            try:
                from wing_host import evaluate as wing_evaluate
                self._send_json(wing_evaluate(query_text))
            except Exception as exc:
                self._send_json({"action": "allow", "error": str(exc)})
            return

        if self.path == "/wing/rules":
            payload = self._read_json_body()
            if payload is None or "rules" not in payload:
                self._send_json({"error": "missing rules"}, 400)
                return
            try:
                from wing_host import save_rules
                save_rules(payload["rules"])
                self._send_json({"ok": True, "saved": len(payload["rules"])})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/import":
            payload = self._read_json_body()
            if payload is None:
                self._send_json({"error": "bad_request"}, 400)
                return
            try:
                from wing_host import import_wing
                self._send_json(import_wing(payload))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/install-starters":
            payload = self._read_json_body() or {}
            starter_ids = payload.get("starter_ids")
            try:
                from wing_host import install_starter_augurs
                self._send_json(install_starter_augurs(starter_ids))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/mark-consulted":
            payload = self._read_json_body() or {}
            try:
                from wing_host import mark_consulted
                mark_consulted(payload.get("source", "cathedral"), payload.get("domain"))
                self._send_json({"ok": True})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/enabled":
            payload = self._read_json_body() or {}
            try:
                from wing_host import load_prefs, save_prefs
                prefs = load_prefs()
                prefs["wing_enabled"] = bool(payload.get("enabled", True))
                save_prefs(prefs)
                self._send_json({"ok": True, "wing_enabled": prefs["wing_enabled"]})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        # ── MAJCOM POST endpoints (K520) ──────────────────────────────────────

        if self.path == "/majcom/register-naf":
            payload = self._read_json_body()
            if payload is None or "naf_id" not in payload or "role_class" not in payload:
                self._send_json({"error": "naf_id and role_class required"}, 400)
                return
            try:
                from discipline_majcom.engine import register_naf
                self._send_json(register_naf(
                    payload["naf_id"], payload["role_class"], payload.get("metadata")
                ))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/deregister-naf":
            payload = self._read_json_body()
            if payload is None or "naf_id" not in payload:
                self._send_json({"error": "naf_id required"}, 400)
                return
            try:
                from discipline_majcom.engine import deregister_naf
                self._send_json(deregister_naf(payload["naf_id"]))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/submit-aggregate":
            payload = self._read_json_body()
            if payload is None or "naf_id" not in payload or "signals" not in payload:
                self._send_json({"error": "naf_id and signals required"}, 400)
                return
            try:
                from discipline_majcom.engine import submit_naf_aggregate
                self._send_json(submit_naf_aggregate(payload["naf_id"], payload["signals"]))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/submit-candidate":
            payload = self._read_json_body()
            if payload is None or "naf_id" not in payload or "rule_def" not in payload:
                self._send_json({"error": "naf_id and rule_def required"}, 400)
                return
            try:
                from discipline_majcom.engine import submit_rule_candidate
                self._send_json(submit_rule_candidate(payload["naf_id"], payload["rule_def"]))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/review":
            payload = self._read_json_body()
            if payload is None or "candidate_id" not in payload or "action" not in payload:
                self._send_json({"error": "candidate_id and action required"}, 400)
                return
            try:
                from discipline_majcom.engine import review_candidate
                self._send_json(review_candidate(
                    payload["candidate_id"],
                    payload["action"],
                    payload.get("reason", ""),
                    payload.get("governor", "majcom-council"),
                ))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/founder-veto":
            payload = self._read_json_body()
            if payload is None or "candidate_id" not in payload or "bylaw_id" not in payload:
                self._send_json({"error": "candidate_id and bylaw_id required"}, 400)
                return
            try:
                from discipline_majcom.engine import founder_veto
                self._send_json(founder_veto(
                    payload["candidate_id"],
                    payload["bylaw_id"],
                    payload.get("reason", ""),
                ))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/shutdown/activate":
            payload = self._read_json_body() or {}
            reason = payload.get("reason", "")
            if not reason:
                self._send_json({"error": "reason required for SHUT IT DOWN activation"}, 400)
                return
            try:
                from discipline_majcom.engine import shutdown_activate
                self._send_json(shutdown_activate(reason, payload.get("governor", "Founder")))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/shutdown/unfreeze":
            payload = self._read_json_body() or {}
            try:
                from discipline_majcom.engine import shutdown_unfreeze
                self._send_json(shutdown_unfreeze(payload.get("governor", "Founder")))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/shutdown/queue-action":
            payload = self._read_json_body()
            if payload is None or "action" not in payload:
                self._send_json({"error": "action required"}, 400)
                return
            try:
                from discipline_majcom.engine import shutdown_queue_action
                self._send_json(shutdown_queue_action(payload["action"]))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/pledge/submit":
            payload = self._read_json_body()
            if payload is None:
                self._send_json({"error": "bad request"}, 400)
                return
            try:
                from discipline_majcom.engine import verify_pledge_admission
                self._send_json(verify_pledge_admission(
                    payload.get("org_name", ""),
                    payload.get("ein", ""),
                    payload.get("org_type", ""),
                    payload.get("contact", ""),
                    payload.get("description", ""),
                ))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/pledge/approve":
            payload = self._read_json_body()
            if payload is None or "admission_id" not in payload:
                self._send_json({"error": "admission_id required"}, 400)
                return
            try:
                from discipline_majcom.engine import approve_pledge_admission
                self._send_json(approve_pledge_admission(
                    payload["admission_id"],
                    payload.get("verified_by", "Founder"),
                ))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/majcom/cfp/create-envelope":
            payload = self._read_json_body()
            if payload is None or "payload_type" not in payload:
                self._send_json({"error": "payload_type required"}, 400)
                return
            try:
                from discipline_majcom.engine import create_cross_majcom_envelope
                self._send_json(create_cross_majcom_envelope(
                    payload["payload_type"],
                    payload.get("payload", {}),
                    payload.get("destination_majcom", "MAJCOM-UNKNOWN"),
                ))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        # ── NAF POST endpoints (K519) ──────────────────────────────────────────

        if self.path == "/naf/register":
            payload = self._read_json_body()
            if payload is None or "wing_id" not in payload:
                self._send_json({"error": "wing_id required"}, 400)
                return
            try:
                from discipline_naf.engine import register_wing
                self._send_json(register_wing(payload["wing_id"], payload.get("metadata")))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/naf/optout":
            payload = self._read_json_body()
            if payload is None or "wing_id" not in payload:
                self._send_json({"error": "wing_id required"}, 400)
                return
            try:
                from discipline_naf.engine import opt_out_wing
                self._send_json(opt_out_wing(payload["wing_id"]))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/naf/aggregate":
            payload = self._read_json_body()
            if payload is None or "wing_id" not in payload or "signals" not in payload:
                self._send_json({"error": "wing_id and signals required"}, 400)
                return
            try:
                from discipline_naf.engine import submit_aggregate
                self._send_json(submit_aggregate(payload["wing_id"], payload["signals"]))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/naf/candidates":
            payload = self._read_json_body()
            if payload is None or "wing_id" not in payload or "rule_def" not in payload:
                self._send_json({"error": "wing_id and rule_def required"}, 400)
                return
            try:
                from discipline_naf.engine import submit_rule_candidate
                self._send_json(
                    submit_rule_candidate(payload["wing_id"], payload["rule_def"])
                )
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/naf/review":
            payload = self._read_json_body()
            if payload is None or "candidate_id" not in payload or "action" not in payload:
                self._send_json({"error": "candidate_id and action required"}, 400)
                return
            try:
                from discipline_naf.engine import review_candidate
                self._send_json(review_candidate(
                    payload["candidate_id"],
                    payload["action"],
                    payload.get("reason", ""),
                    payload.get("governor", "naf-governor"),
                ))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        # ── /enrich and /pawn: parse query from body ───────────────────────────

        length = int(self.headers.get("Content-Length", 0))
        if length > 64_000:
            self.send_response(413)
            self.end_headers()
            return

        try:
            raw = self.rfile.read(length)
            payload = json.loads(raw.decode("utf-8"))
            query: str = payload.get("query", "").strip()
        except Exception:
            self.send_response(400)
            self.end_headers()
            return

        if not query:
            self.send_response(400)
            self._send_cors_headers()
            self.end_headers()
            return

        # ── /enrich — Cathedral injection only ───────────────────────────────
        if self.path == "/enrich":
            result = _build_enriched_query(query)
            body = json.dumps(result, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
            return

        # ── /pawn — Cathedral injection + Perplexity API ─────────────────────
        api_key = os.environ.get("PPLX_API_KEY", "").strip()
        if not api_key:
            err = json.dumps({
                "error": "PPLX_API_KEY not found in daemon environment. "
                         "Load SDS.env before starting Helm.",
                "answer": "",
            }).encode()
            self.send_response(503)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(err)
            return

        model = payload.get("model", _DEFAULT_PPLX_MODEL)
        enrich = _build_enriched_query(query)
        pplx   = _call_perplexity(enrich["enriched_query"], api_key, model)

        result = {
            "answer":         pplx["answer"],
            "intent":         enrich["intent"],
            "token_count":    enrich.get("token_count", 0),
            "enriched_chars": len(enrich["enriched_query"]),
            "usage":          pplx.get("usage", {}),
            "error":          pplx["error"],
        }
        body = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


def _start_rest_server(rest_port: int) -> None:
    """Start the REST server in a daemon thread. Returns immediately."""

    def _run():
        server = ThreadingHTTPServer(("127.0.0.1", rest_port), EnrichHandler)
        print(f"[enrich-rest] Comet Bridge REST server on http://127.0.0.1:{rest_port}", flush=True)
        print(f"[enrich-rest]   GET  /health         — liveness check", flush=True)
        print(f"[enrich-rest]   POST /enrich         — Cathedral injection endpoint", flush=True)
        print(f"[enrich-rest]   POST /wing/evaluate  — Wing rule evaluation (K518)", flush=True)
        print(f"[enrich-rest]   GET  /wing/rules     — Load member Wing rules", flush=True)
        print(f"[enrich-rest]   POST /wing/rules     — Sync member Wing rules", flush=True)
        print(f"[enrich-rest]   GET  /wing/dashboard — Wing telemetry summary", flush=True)
        print(f"[enrich-rest]   GET  /wing/export    — Export Wing config+telemetry", flush=True)
        print(f"[enrich-rest]   GET  /naf/admin      — NAF governance UI (K519)", flush=True)
        print(f"[enrich-rest]   GET  /naf/summary    — Cross-Wing aggregate summary", flush=True)
        print(f"[enrich-rest]   GET  /majcom/admin   — MAJCOM-LB governance UI (K520)", flush=True)
        print(f"[enrich-rest]   GET  /majcom/status  — MAJCOM operational status", flush=True)
        print(f"[enrich-rest]   GET  /majcom/summary — Cross-NAF aggregate summary", flush=True)
        print(f"[enrich-rest]   GET  /naf/candidates — Pending rule promotion candidates", flush=True)
        print(f"[enrich-rest]   GET  /naf/defaults   — Published NAF-default rules", flush=True)
        print(f"[enrich-rest]   POST /naf/register   — Register member Wing for federation", flush=True)
        print(f"[enrich-rest]   POST /naf/aggregate  — Submit opt-in aggregate signals", flush=True)
        print(f"[enrich-rest]   POST /naf/candidates — Submit rule for NAF promotion", flush=True)
        print(f"[enrich-rest]   POST /naf/review     — Accept/reject rule candidate", flush=True)
        server.serve_forever()

    t = threading.Thread(target=_run, name="comet-bridge-rest", daemon=True)
    t.start()


# ─── Entry point ─────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        prog="helm-daemon",
        description="Helm daemon wrapper for librarian-mcp (SSE transport + Comet Bridge REST).",
    )
    parser.add_argument("--port", type=int, default=7711,
                        help="MCP SSE port (default: 7711)")
    parser.add_argument("--rest-port", type=int, default=None,
                        help="Comet Bridge REST port (default: main port + 1, i.e. 7712)")
    parser.add_argument("--cathedral-dir", default=None,
                        help="Cathedral directory for Librarian (default: ~/.librarian/)")
    args = parser.parse_args()

    rest_port = args.rest_port if args.rest_port is not None else args.port + 1

    # Propagate cathedral dir to Librarian via env var
    if args.cathedral_dir:
        os.environ["LIBRARIAN_CATHEDRAL_DIR"] = args.cathedral_dir

    # Import after env setup so cathedral_dir is visible to the server module
    try:
        from librarian_mcp.server import mcp
    except ImportError as exc:
        print(f"[helm-daemon] ERROR: librarian-mcp not installed: {exc}", file=sys.stderr)
        print("[helm-daemon] Install with: pip install librarian-mcp", file=sys.stderr)
        sys.exit(1)

    # Patch port onto the FastMCP settings object
    mcp.settings.port = args.port
    mcp.settings.host = "127.0.0.1"

    print(f"[helm-daemon] Starting Librarian SSE server on http://127.0.0.1:{args.port}/sse")
    print(f"[helm-daemon] Cathedral: {args.cathedral_dir or '~/.librarian/'}")
    sys.stdout.flush()

    # Start Comet Bridge REST server in background thread
    _start_rest_server(rest_port)

    # Block on MCP SSE server (uvicorn main thread)
    mcp.run(transport="sse")


if __name__ == "__main__":
    main()
