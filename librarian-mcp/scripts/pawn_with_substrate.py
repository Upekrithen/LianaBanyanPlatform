"""
PAWN WITH SUBSTRATE — K507
==========================
Local Pawn-API wrapper that calls Perplexity Sonar Pro directly with substrate
injection. Path B: real cross-vendor calls, verifiable API metadata, no impersonation.

Architectural constraint: NEVER fall back to fabricated responses.
See: feedback_no_ai_impersonation_ever.md (Bishop memory, filed B124).

Usage:
  python pawn_with_substrate.py "Your query here"
  python pawn_with_substrate.py "Your query here" --intent canonical
  python pawn_with_substrate.py --test          # API connectivity test
  python pawn_with_substrate.py --summary       # savings summary
  python pawn_with_substrate.py --cost-day N    # project daily cost at N queries/day

Options:
  --intent   Force intent classification (canonical|outreach|architecture|
             founder_voice|benchmark|operational|default)
  --no-log   Skip logging to substrate_savings_log.jsonl
  --raw      Print raw JSON response only
  --model    Perplexity model (default: sonar-pro)
  --env-file PATH  Path to .env file containing PERPLEXITY_API_KEY

Environment:
  PERPLEXITY_API_KEY   Required. Set in env or use --env-file.

Output format (stdout):
  Pawn (Sonar Pro, model=<model>, request_id=<id>):

  <answer>

  Citations:
    [1] <url>
    ...

  Tokens: input=<n>, output=<m>, cost_usd=<x>
  Substrate: intent=<intent>, injection_tokens=<n>

Error modes:
  - API unavailable / 5xx: stderr + non-zero exit. NO fabricated response.
  - Auth failure: clear message about API key. NO fabricated response.
  - Rate limit: backoff + single retry. Structured error if still failing.
  - Substrate injection failure: degrades to NO substrate, explicitly noted.

BRIDLE v10.5 compliance: real calls, verified metadata, honest math.
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' library not found. Run: pip install requests", file=sys.stderr)
    sys.exit(1)

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
LIBRARIAN_ROOT = SCRIPT_DIR.parent
SAVINGS_LOG = LIBRARIAN_ROOT / "stitchpunks" / "data" / "substrate_savings_log.jsonl"
OVERVIEW_JSON = LIBRARIAN_ROOT / "index" / "overview.json"
CANONICAL_YAML = LIBRARIAN_ROOT / "canonical_values.yaml"
ENV_FILE_DEFAULT = LIBRARIAN_ROOT.parent / "Asteroid-ProofVault" / "LockBox" / "SDS.env"

PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
DEFAULT_MODEL = "sonar-pro"

# Perplexity Sonar Pro pricing (per 1M tokens, USD).
# Also used when API cost field is absent.
SONAR_PRO_PRICING_INPUT  = 3.00   # $/1M input tokens
SONAR_PRO_PRICING_OUTPUT = 15.00  # $/1M output tokens
SONAR_PRO_REQUEST_COST   = 0.005  # $/request

COLD_MULTIPLIER = 3.5   # Pawn cold multiplier (friction-inclusive, K505)
AGENT = "PAWN"


# ── Env loading ────────────────────────────────────────────────────────────────

def load_env_file(path: Path) -> dict[str, str]:
    """Parse a KEY=value .env file; return dict of key→value pairs."""
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text("utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip()
    return env


def get_api_key(env_file: Path | None = None) -> str:
    """Return Perplexity API key from env var or env file. Raises on missing."""
    key = os.environ.get("PERPLEXITY_API_KEY", "")
    if key:
        return key
    target = env_file or ENV_FILE_DEFAULT
    env = load_env_file(target)
    key = env.get("PERPLEXITY_API_KEY", "")
    if key:
        return key
    raise RuntimeError(
        "PERPLEXITY_API_KEY not found in environment or env file.\n"
        f"Checked: env var PERPLEXITY_API_KEY, and {target}\n"
        "Developer tier: set your key at Settings → Developer → Pawn API Configuration."
    )


# ── Intent classification ──────────────────────────────────────────────────────

INTENT_KEYWORDS: dict[str, list[str]] = {
    "canonical": [
        "membership cost", "membership fee", "creator keeps", "innovations",
        "crown jewels", "patent", "formal claims", "production systems",
        "83.3", "how much", "what does it cost", "platform margin",
        "cost plus", "cost+20", "innovation count", "patent applications",
        "legal entity", "EIN", "Wyoming",
    ],
    "outreach": [
        "letter", "AAAI", "op-ed", "dispatch", "campaign", "opening gambit",
        "salvo", "crown recipient", "Maneet", "Mary Beth", "Kimberly",
        "Cathie", "outreach", "media", "publication", "pitch", "wave",
    ],
    "architecture": [
        "Trust Match", "neighborhood", "escrow", "MSA", "DSS",
        "Conductor", "substrate", "beacon", "V2", "MCP", "Librarian",
        "preload", "Cathedral", "Comet Bridge", "LB Test Frame",
        "Test Frame", "Helm", "Slow Blade", "let's make dinner",
        "let's get groceries", "let's go shopping", "household concierge",
        "family table", "rally group", "jukeBox", "Didasko",
        "Power to the People", "Brass Tacks", "HexIsle",
        "how does", "how is", "how does it work", "architecture",
    ],
    "founder_voice": [
        "Founder", "founder", "what does he think", "philosophy", "why",
        "37 years", "Chess", "veteran", "FAA", "principle", "vision",
        "golden key", "Help each other", "for the keep", "B124",
        "Raising Arizona", "good name", "Proverbs",
    ],
    "benchmark": [
        "R10", "R11", "R12", "R13", "R14", "R15", "R-run", "r-run",
        "cross-vendor", "lift", "Cathedral Effect", "benchmark",
        "empirical", "Sonar baseline", "Pawn baseline", "secondary",
        "substrate savings", "cold multiplier", "calibration",
    ],
    "operational": [
        "deploy", "build", "migrate", "session", "K-session", "B-session",
        "git", "firebase", "npm", "supabase", "migration", "admin",
        "how to run", "how to deploy", "command", "script", "rebuild",
    ],
}


def classify_intent(query: str, forced: str | None = None) -> str:
    """Classify query intent. Returns one of 7 intent labels."""
    if forced:
        valid = set(INTENT_KEYWORDS.keys()) | {"default"}
        if forced in valid:
            return forced
    q = query.lower()
    scores: dict[str, int] = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        scores[intent] = sum(1 for kw in keywords if kw.lower() in q)
    best_intent = max(scores, key=lambda k: scores[k])
    return best_intent if scores[best_intent] > 0 else "default"


# ── Substrate context builder ──────────────────────────────────────────────────

SUBSTRATE_INTRO = """You are Pawn — the Perplexity search-and-reasoning member of the Liana Banyan cooperative
AI team (Bishop=Anthropic, Knight=Cursor/Sonnet, Rook=Gemini, Pawn=Perplexity).
This query arrives with Liana Banyan platform substrate context injected. Answer as yourself — Pawn.
Do not impersonate other agents. Use the context below to ground your response.

--- LIANA BANYAN SUBSTRATE CONTEXT ---
"""

SUBSTRATE_CANONICAL = """
CANONICAL PLATFORM NUMBERS (source: canonical_values.yaml — single source of truth):
  Creator keeps: 83.3% (never round to 83%)
  Platform margin: Cost + 20%
  Membership: $5/year
  Innovation count: {innovation_count}
  Crown Jewels: {crown_jewels}
  Patent applications filed: {patent_applications}
  Formal claims (approx): {formal_claims}
  Production systems: {production_systems}

ECONOMICS:
  On a $500 transaction: creator or worker receives $416.67
  Platform earns: $500 × 20% cost markup on actual cost
  Membership is flat $5/yr — no per-transaction take
"""

SUBSTRATE_OUTREACH = """
OUTREACH CONTEXT:
  Mission: "Help each other help ourselves" (The Golden Key)
  16 Sweet Sixteen Initiatives (Let's Make Dinner, Let's Get Groceries, Let's Go Shopping,
  Household Concierge, The Family Table, MSA, Defense Klaus, Rally Group, VSL,
  Let's Make Bread, Harper Guild, JukeBox, Didasko, Power to the People, Brass Tacks)
  Crown recipients include: Maneet Chauhan (Let's Make Dinner), Mary Beth Laughton (Let's Go Shopping),
  Kimberly A. Williams (Rally Group), Cathie Mahon (VSL)
  Letter dispatch system: Opening Gambit outreach salvo across media/political/business/academic
  AAAI op-ed: platform AI research publication target for Cathedral Effect empirical results
"""

SUBSTRATE_ARCHITECTURE = """
ARCHITECTURE CONTEXT:
  Cathedral Effect: substrate-injected AI sessions show 86+ percentage point accuracy lift vs cold
  Trust Match: cooperative matching engine pairing members on task capabilities + trust signals
  Neighborhood System: geo-local cooperative clusters with content moderation
  Cathedral = AI + Librarian MCP substrate = accurate, grounded cooperative AI
  Librarian MCP: intent-aware context delivery system (brief_me, get_canonical_numbers, etc.)
  LB Test Frame: Chrome extension + Electron desktop app for Cathedral Effect verification
    - Three personas: Casual / Developer / Member ($5/yr)
    - Pawn-with-Substrate (K507): Developer-tier API-direct substrate-injected queries
  Substrate injection: system prompt = canonical context + Librarian data → AI query
  DSS / the2ndsecond.com: Liana Banyan's second-screen maker portal
  Platform: lianabanyan.com — cooperative marketplace, 83.3% to creators
  Supabase: backend DB, edge functions, RLS policies
  Firebase: hosting for all portal domains (one build → 8 targets)
"""

SUBSTRATE_FOUNDER_VOICE = """
FOUNDER VOICE / PHILOSOPHY:
  Founder: 53-year-old ARNG veteran (Infantry 11B, Aviation 15A), FAA Commercial Rotary Wing IFR
  Father of eight; 21 years IT; Chess top 0.4% globally (2080s rating)
  37 years developing this cooperative system (1989-2026)
  Legal entity: LIANA BANYAN CORPORATION, EIN 41-2797446, Wyoming C-Corp
  Golden Key: "Help each other help ourselves"
  Principle #41 (Good Name): "A good name is rather to be chosen than great riches" — Proverbs 22:1
  Principle #35-37 (Credibility cluster): Credibility of yes flows from credibility of no
  Principle #39 (Fruits-Test): Empirical output is the test of the producing system
  Raising Arizona principle: don't emulate — never tell them what they want to hear by impersonating
  Session cadence: Bishop (B-sessions), Knight (K-sessions), Rook (R-runs), Pawn (P-sessions)
"""

SUBSTRATE_BENCHMARK = """
BENCHMARK CONTEXT:
  R10: Initial Cathedral Effect cross-vendor discovery (4 vendors)
  R11: Expanded cross-vendor replication (8 models, 4 vendors: Anthropic, OpenAI, Google, Perplexity)
  R12: Quantified substrate savings baseline
  R13: Cross-vendor memory product benchmark — Sonar Pro empirical baseline
    Lift: ~86 percentage points (cold vs cathedral accuracy)
    Cross-vendor: Bishop 21.6× within Anthropic; 78× cross-vendor with substrate
  R14 / R15: Planned calibration + control pair runs (quarterly)
  Cold multiplier: BISHOP 3.0×, KNIGHT 2.5×, PAWN 3.5× (friction-inclusive), ROOK 2.5×
  Cathedral Effect secondary (Pawn): Pawn cold sessions have 3+ "yes/that/do-it" friction confirmations
  All multipliers provisional until calibration run with control pairs
  K507: pawn_with_substrate.py — verified real cross-vendor calls, request_id evidence
"""

SUBSTRATE_OPERATIONAL = """
OPERATIONAL CONTEXT:
  Deploy all portals: cd platform; npm run build; firebase deploy --only hosting:main,...
  Librarian MCP: cd librarian-mcp && npm run rebuild (regenerates index, runs verify:canonical)
  canonical_values.yaml is single source of truth for 5 stats (innovation, crown jewels, etc.)
  KNIGHT_QUEUE.md: auto-rendered from KnightQueue.jsonl + KnightHandoffs.jsonl (K461/Phase 2)
  K-numbers: Knight sessions. B-numbers: Bishop sessions. R-runs: empirical tests.
  Session IDs: K<NNN>, B<NNN>, R<NNN>, P<NNN> — max K# capped at 9,999
  BISHOP_DROPZONE: handoff directory Bishop → Knight. 01_KnightPrompts, 02_PawnPrompts, 03_BishopHandoffs.
  PowerShell: use ; to chain commands (not &&). Paths: forward slashes where possible.
"""

SUBSTRATE_DEFAULT = """
LIANA BANYAN OVERVIEW:
  Cooperative marketplace: 83.3% to creators, Cost+20% platform margin, $5/yr membership
  16 Sweet Sixteen Initiatives connecting consumers with creators across life domains
  Cathedral Effect: substrate-injected AI sessions dramatically outperform cold sessions (~86pp lift)
  Legal: LIANA BANYAN CORPORATION, EIN 41-2797446, Wyoming C-Corp
  Production systems: 36. Innovations: see canonical stats. Crown Jewels: see canonical stats.
  lianabanyan.com | the2ndsecond.com | hexisle.lianabanyan.com | cephas.lianabanyan.com
"""

INTENT_SUBSTRATE_MAP: dict[str, str] = {
    "canonical":     SUBSTRATE_CANONICAL,
    "outreach":      SUBSTRATE_OUTREACH,
    "architecture":  SUBSTRATE_ARCHITECTURE,
    "founder_voice": SUBSTRATE_FOUNDER_VOICE,
    "benchmark":     SUBSTRATE_BENCHMARK,
    "operational":   SUBSTRATE_OPERATIONAL,
    "default":       SUBSTRATE_DEFAULT,
}


def load_canonical_numbers() -> dict[str, str]:
    """Load canonical numbers from overview.json or fallback to hardcoded values."""
    defaults = {
        "innovation_count": "2,270",
        "crown_jewels": "228",
        "patent_applications": "13 provisional applications FILED",
        "formal_claims": "~2,506 across 13 provisional applications",
        "production_systems": "36",
    }
    if OVERVIEW_JSON.exists():
        try:
            ov = json.loads(OVERVIEW_JSON.read_text("utf-8"))
            return {
                "innovation_count": f"{ov.get('innovationCount', 2270):,}",
                "crown_jewels": f"{ov.get('crownJewelCount', 228):,}",
                "patent_applications": "13 provisional applications FILED",
                "formal_claims": f"~{ov.get('formalClaimsCount', 2506):,} across 13 provisional applications",
                "production_systems": "36",
            }
        except Exception:
            pass
    return defaults


def build_substrate(intent: str) -> tuple[str, int]:
    """
    Build substrate system prompt for given intent.
    Returns (system_prompt, estimated_injection_tokens).
    On failure: returns degraded prompt noting the failure.
    """
    try:
        canonical = load_canonical_numbers()
        intent_block = INTENT_SUBSTRATE_MAP.get(intent, SUBSTRATE_DEFAULT)
        canonical_block = SUBSTRATE_CANONICAL.format(**canonical)

        if intent == "canonical":
            body = canonical_block
        else:
            body = canonical_block + intent_block

        system_prompt = SUBSTRATE_INTRO + body + "\n--- END SUBSTRATE CONTEXT ---\n"
        estimated_tokens = len(system_prompt.split()) * 4 // 3
        return system_prompt, estimated_tokens

    except Exception as exc:
        degraded = (
            "You are Pawn, the Perplexity member of the Liana Banyan AI team.\n"
            f"[Substrate: NONE (substrate injection failed: {exc})]"
        )
        return degraded, 0


# ── Perplexity API call ────────────────────────────────────────────────────────

def call_perplexity(
    query: str,
    system_prompt: str,
    api_key: str,
    model: str = DEFAULT_MODEL,
    retry: bool = True,
) -> dict:
    """
    Make real Perplexity API call. Returns full response dict.
    Raises on auth failure or persistent errors. NEVER returns fabricated data.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ],
    }

    try:
        resp = requests.post(
            PERPLEXITY_API_URL, headers=headers, json=payload, timeout=60
        )
    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            "Perplexity API unreachable (connection error). "
            "Check internet connection or https://status.perplexity.ai"
        )
    except requests.exceptions.Timeout:
        raise RuntimeError(
            "Perplexity API timed out after 60 seconds. Try again or use browser path."
        )

    if resp.status_code == 401:
        raise RuntimeError(
            "Perplexity API auth failure (HTTP 401). "
            "Check PERPLEXITY_API_KEY in SDS.env or Settings → Developer → Pawn API Configuration."
        )
    if resp.status_code == 429:
        if retry:
            reset_seconds = int(resp.headers.get("x-ratelimit-reset-after", "60"))
            print(
                f"[Pawn] Rate limited. Retry after {reset_seconds}s ...",
                file=sys.stderr,
            )
            time.sleep(min(reset_seconds, 60))
            return call_perplexity(query, system_prompt, api_key, model, retry=False)
        else:
            reset_info = resp.headers.get("x-ratelimit-reset-after", "unknown")
            raise RuntimeError(
                f"Perplexity API rate limit persists. Reset after: {reset_info}s. "
                "Try again later or reduce query frequency."
            )
    if resp.status_code >= 500:
        raise RuntimeError(
            f"Perplexity API server error (HTTP {resp.status_code}). "
            "See https://status.perplexity.ai — try again later."
        )
    if not resp.ok:
        raise RuntimeError(
            f"Perplexity API error (HTTP {resp.status_code}): {resp.text[:500]}"
        )

    try:
        return resp.json()
    except Exception:
        raise RuntimeError(
            f"Perplexity API returned non-JSON response (HTTP {resp.status_code}): "
            f"{resp.text[:500]}"
        )


# ── Cost calculation ───────────────────────────────────────────────────────────

def extract_cost(response: dict, input_tokens: int, output_tokens: int) -> float:
    """
    Extract actual cost from API response if available; otherwise calculate
    from pricing table. Returns cost in USD.
    """
    usage = response.get("usage", {})
    cost_block = usage.get("cost", {})
    if cost_block:
        total = cost_block.get("total_cost")
        if total is not None:
            return round(float(total), 6)
    m = 1_000_000
    cost = (
        (input_tokens / m) * SONAR_PRO_PRICING_INPUT
        + (output_tokens / m) * SONAR_PRO_PRICING_OUTPUT
        + SONAR_PRO_REQUEST_COST
    )
    return round(cost, 6)


# ── Substrate savings logging ──────────────────────────────────────────────────

def log_savings(
    input_tokens: int,
    output_tokens: int,
    substrate_overhead_tokens: int,
    actual_cost_usd: float,
    model: str,
    intent: str,
    request_id: str,
    task_label: str = "K507",
) -> None:
    """Append a PAWN savings record with verified_real_call=True, via_api=True."""
    m = 1_000_000
    overhead_cost = (substrate_overhead_tokens / m) * SONAR_PRO_PRICING_INPUT
    counterfactual = actual_cost_usd * COLD_MULTIPLIER
    net_savings = counterfactual - actual_cost_usd - overhead_cost

    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": AGENT,
        "session_id": task_label,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "substrate_overhead_tokens": substrate_overhead_tokens,
        "substrate_injection_count": 1,
        "vendor": "perplexity",
        "model": model,
        "actual_cost_usd": round(actual_cost_usd, 6),
        "counterfactual_cost_usd": round(counterfactual, 6),
        "session_savings_usd": round(net_savings, 6),
        "cold_multiplier": COLD_MULTIPLIER,
        "friction_confirmations": 0,
        "multiplier_provisional": True,
        "verified_real_call": True,
        "via_api": True,
        "pawn_request_id": request_id,
        "substrate_intent": intent,
        "cold_baseline_estimated_tokens": None,
        "notes": f"K507 substrate-injected API call; intent={intent}; request_id={request_id}",
    }

    SAVINGS_LOG.parent.mkdir(parents=True, exist_ok=True)
    existing = SAVINGS_LOG.read_text("utf-8").strip() if SAVINGS_LOG.exists() else ""
    lines = [l for l in existing.split("\n") if l.strip()]
    lines.append(json.dumps(record))
    SAVINGS_LOG.write_text("\n".join(lines) + "\n", "utf-8")


# ── Output formatting ──────────────────────────────────────────────────────────

def format_output(
    response: dict,
    intent: str,
    injection_tokens: int,
    actual_cost: float,
    substrate_degraded: bool = False,
) -> str:
    """Format the structured Pawn response with verifiable API metadata."""
    model_id = response.get("model", "unknown")
    request_id = response.get("id", "unknown")
    usage = response.get("usage", {})
    input_tokens = usage.get("prompt_tokens", 0)
    output_tokens = usage.get("completion_tokens", 0)
    citations = response.get("citations", [])
    answer = response.get("choices", [{}])[0].get("message", {}).get("content", "")

    lines = [
        f"Pawn (Sonar Pro, model={model_id}, request_id={request_id}):",
        "",
        answer.strip(),
        "",
    ]

    if citations:
        lines.append("Citations:")
        for i, url in enumerate(citations, 1):
            lines.append(f"  [{i}] {url}")
        lines.append("")

    lines.append(
        f"Tokens: input={input_tokens:,}, output={output_tokens:,}, "
        f"cost_usd=${actual_cost:.6f}"
    )
    substrate_note = f"intent={intent}, injection_tokens={injection_tokens}"
    if substrate_degraded:
        substrate_note += " [DEGRADED — substrate injection failed, raw query sent]"
    lines.append(f"Substrate: {substrate_note}")

    return "\n".join(lines)


# ── API test mode ──────────────────────────────────────────────────────────────

def cmd_test(api_key: str, model: str) -> int:
    """Run a single canonical verification call and report API shape."""
    print(f"[Pawn] Testing Perplexity API ({model}) ...")
    try:
        resp = call_perplexity(
            "Reply with exactly: PAWN_API_VERIFIED",
            "You are a Perplexity API verification test. Reply with exactly the string given.",
            api_key,
            model,
        )
    except RuntimeError as e:
        print(f"[Pawn] API test FAILED: {e}", file=sys.stderr)
        return 1

    usage = resp.get("usage", {})
    cost_block = usage.get("cost", {})
    answer = resp.get("choices", [{}])[0].get("message", {}).get("content", "")
    ok = "PAWN_API_VERIFIED" in answer

    print(f"  HTTP:        200 OK")
    print(f"  Model:       {resp.get('model', 'N/A')}")
    print(f"  Request ID:  {resp.get('id', 'N/A')}")
    print(f"  Tokens:      {usage.get('prompt_tokens', 0)} in / {usage.get('completion_tokens', 0)} out")
    print(f"  API cost:    ${cost_block.get('total_cost', 'N/A')}")
    print(f"  Citations:   {len(resp.get('citations', []))} URLs")
    print(f"  Answer OK:   {'YES ✓' if ok else 'NO — unexpected: ' + answer[:80]}")
    print()
    if ok:
        print("[Pawn] API test PASSED. K507 ready.")
        return 0
    else:
        print("[Pawn] API test WARNING: unexpected answer content.")
        return 0


# ── Savings summary mode ───────────────────────────────────────────────────────

def cmd_summary() -> None:
    """Print a summary of K507 API savings from the log."""
    if not SAVINGS_LOG.exists():
        print("No substrate savings log found.")
        return
    raw = SAVINGS_LOG.read_text("utf-8").strip()
    if not raw:
        print("Savings log is empty.")
        return
    records = [json.loads(l) for l in raw.split("\n") if l.strip()]
    api_records = [r for r in records if r.get("via_api") and r.get("agent") == "PAWN"]
    if not api_records:
        print("No K507 API Pawn records yet.")
        return

    total_actual = sum(r.get("actual_cost_usd", 0) for r in api_records)
    total_savings = sum(r.get("session_savings_usd", 0) for r in api_records)
    total_in = sum(r.get("input_tokens", 0) for r in api_records)
    total_out = sum(r.get("output_tokens", 0) for r in api_records)
    intent_counts: dict[str, int] = {}
    for r in api_records:
        intent = r.get("substrate_intent", "unknown")
        intent_counts[intent] = intent_counts.get(intent, 0) + 1

    print(f"\n── Pawn-API Substrate Savings Summary (K507) ──")
    print(f"  Calls:          {len(api_records)}")
    print(f"  Tokens:         {total_in:,} in / {total_out:,} out")
    print(f"  Actual spend:   ${total_actual:.6f}")
    print(f"  Net savings:    ${total_savings:.6f} [provisional, {COLD_MULTIPLIER}× cold mult.]")
    print(f"  Intents:        {dict(sorted(intent_counts.items()))}")
    print(f"  All verified_real_call=True, via_api=True [Perplexity request_ids in log]")


# ── Daily cost projection ──────────────────────────────────────────────────────

def cmd_cost_day(queries_per_day: float) -> None:
    """Project daily/monthly/annual cost at given query rate."""
    avg_cost_per_query = SONAR_PRO_REQUEST_COST + (
        (2_000 / 1_000_000) * SONAR_PRO_PRICING_INPUT
        + (500 / 1_000_000) * SONAR_PRO_PRICING_OUTPUT
    )
    daily = queries_per_day * avg_cost_per_query
    monthly = daily * 30
    annual = daily * 365

    print(f"\n── Pawn-API Cost Projection (at {queries_per_day} queries/day) ──")
    print(f"  Avg cost/query: ${avg_cost_per_query:.5f}")
    print(f"  (assumes 2,000 input tokens + 500 output tokens per query + request fee)")
    print(f"  Daily:          ${daily:.4f}")
    print(f"  Monthly:        ${monthly:.4f}")
    print(f"  Annual:         ${annual:.4f}")
    print(f"  [Use actual call costs from --summary for empirical figures]")


# ── Main entry point ───────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Pawn-with-Substrate: substrate-injected Perplexity Sonar Pro CLI (K507)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("query", nargs="?", help="Query to send to Pawn")
    parser.add_argument("--intent", help="Force intent classification",
                        choices=["canonical", "outreach", "architecture",
                                 "founder_voice", "benchmark", "operational", "default"])
    parser.add_argument("--test", action="store_true", help="Run API connectivity test")
    parser.add_argument("--summary", action="store_true", help="Show savings summary")
    parser.add_argument("--cost-day", type=float, metavar="N",
                        help="Project cost at N queries/day")
    parser.add_argument("--no-log", action="store_true", help="Skip savings log entry")
    parser.add_argument("--raw", action="store_true", help="Print raw JSON response")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Perplexity model to use")
    parser.add_argument("--env-file", type=Path, help="Path to .env file with API key")
    parser.add_argument("--task-label", default="K507",
                        help="Label for savings log entry (default: K507)")

    args = parser.parse_args()

    if args.summary:
        cmd_summary()
        return 0

    if args.cost_day is not None:
        cmd_cost_day(args.cost_day)
        return 0

    try:
        api_key = get_api_key(args.env_file)
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    if args.test:
        return cmd_test(api_key, args.model)

    if not args.query:
        parser.print_help()
        return 1

    intent = classify_intent(args.query, args.intent)
    system_prompt, injection_tokens = build_substrate(intent)
    substrate_degraded = injection_tokens == 0

    if substrate_degraded:
        print(
            f"[Pawn] WARNING: Substrate injection failed. Sending raw query to Perplexity.",
            file=sys.stderr,
        )

    try:
        response = call_perplexity(args.query, system_prompt, api_key, args.model)
    except RuntimeError as e:
        print(f"\nPawn (ERROR): {e}", file=sys.stderr)
        print(
            "\n[No fabricated response. Real Pawn call failed. "
            "Retry or use Perplexity browser path.]",
            file=sys.stderr,
        )
        return 1

    if args.raw:
        print(json.dumps(response, indent=2))
        return 0

    usage = response.get("usage", {})
    input_tokens = usage.get("prompt_tokens", 0)
    output_tokens = usage.get("completion_tokens", 0)
    actual_cost = extract_cost(response, input_tokens, output_tokens)
    request_id = response.get("id", "unknown")

    print(format_output(response, intent, injection_tokens, actual_cost, substrate_degraded))

    if not args.no_log:
        try:
            log_savings(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                substrate_overhead_tokens=injection_tokens,
                actual_cost_usd=actual_cost,
                model=response.get("model", args.model),
                intent=intent,
                request_id=request_id,
                task_label=args.task_label,
            )
        except Exception as e:
            print(f"[Pawn] WARNING: Failed to log savings: {e}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
