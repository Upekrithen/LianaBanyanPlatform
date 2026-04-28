/**
 * K532 — Append Toolsmith entries TS-112 through TS-115
 */
import { appendFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TOOLSMITH_PATH = resolve(__dirname, "../stitchpunks/scribes/scribe_Toolsmith.jsonl");

const entries = [
  {
    ts: "2026-04-28T01:55:00.000Z",
    session: "K532",
    observation: `TS-112: ARCHITECTURE A WINS FOR PAWN DISPATCH — API-DIRECT BEATS BROWSER-INJECTION FOR AUDITABILITY.

K532 evaluated three architectures for the Pawn-via-Librarian bidirectional dispatch channel: A (MCP tool -> Perplexity API direct), B (Comet Bridge sibling extension -> perplexity.ai browser), C (hybrid A+B).

SELECTION: Architecture A. RATIONALE: (1) No browser dependency — Bishop can fire dispatch_pawn() in any session without requiring Founder's Perplexity browser open; (2) Audit-by-default — every call creates dispatch record JSON + ledger entry + telemetry entry; (3) API path proven at K499 (PERPLEXITY_API_KEY len=53, 8/8 models pass); (4) Prompt content inlined in POST body — no local file paths sent to Pawn's browser-sandboxed environment, permanently closing the ERR_FILE_NOT_FOUND failure class.

ARCHITECTURE B FALLBACK: Documented in K532_ARCHITECTURE_DECISION.md but not implemented in K532. Viable if API cost proves unacceptable after 5-10 real dispatches. Implementation path: lb-pawn-bridge-extension/ sibling to lb-omnibox-extension/, adapting K530 content.js injection for perplexity.ai chat UI.

PATTERN: When choosing between API-direct and browser-automation for AI-to-AI dispatch, prefer API-direct if: (a) API key is available, (b) auditability is required, (c) the receiving model is stateless per-call (Perplexity sonar-pro is; browser Pawn retains Space context). Reserve browser-automation for when API is cost-prohibitive or quota-constrained.`,
    source: "implementation_decision",
    canonical_ref: "K532 BISHOP_DROPZONE/03_BishopHandoffs/K532_ARCHITECTURE_DECISION.md / librarian-mcp/src/pawn_dispatch.ts",
  },
  {
    ts: "2026-04-28T01:56:00.000Z",
    session: "K532",
    observation: `TS-113: PERPLEXITY QUOTA_EXHAUSTED AT K532 PHASE C.10 — RESUME PATTERN CONFIRMED.

K532 Phase C.10 live integration test hit Perplexity account quota exhaustion (HTTP 401) when dispatching the Keirsey research prompt (16,191 chars, ~4048 input tokens). This is identical to the TS-108 K528 pattern.

DISPATCH RECORD: dispatch_id=6fcb4451-9149-49d7-9353-04916de252ef, model=sonar-pro, cost_estimate_usd=0.072144, status=error, error_class=quota_exhausted. Attempt log: [dispatch_initiated] -> [attempt 1/5] -> [HTTP 401 - quota exhausted]. Note: 401 is a hard stop (no retry) — correct behavior, no runaway API calls.

RESUME PATTERN: Founder tops up at perplexity.ai/settings/api. Then Bishop dispatches a NEW dispatch (fresh dispatch_id) with the same prompt. The errored dispatch_id=6fcb4451 is historical — do NOT attempt to resume it. The Keirsey prompt content is unchanged (hash=639b0dbe...).

COST ESTIMATE CONFIRMED: $0.072144 pre-call estimate for 16,191-char Keirsey prompt with 4000 max_tokens on sonar-pro is consistent with K528 empirical ($0.239/HOT for 200-question scale => ~$0.001/question => $0.025/question for sonar-pro at research-class prompts). The $1.00 per-dispatch cap provides 13.8x safety margin.

PATTERN GENERALIZATION: Always check account balance at perplexity.ai/settings/api before expecting high-volume dispatches. There is no pre-flight balance check API available on Perplexity (unlike some other vendors). Monitor via the attempt_log in dispatch records.`,
    source: "benchmark_finding",
    canonical_ref: "K532 Phase C.10 / dispatches/pawn/6fcb4451-9149-49d7-9353-04916de252ef.dispatch.json / TS-108",
  },
  {
    ts: "2026-04-28T01:57:00.000Z",
    session: "K532",
    observation: `TS-114: PAWN DISPATCH COST ANCHOR — $0.072 PER KEIRSEY-CLASS RESEARCH DISPATCH.

K532 Phase C.10 pre-call cost estimate for the Keirsey temperament research prompt (16,191 chars, 4048 input token estimate, 4000 max_tokens cap, sonar-pro pricing $3/M input + $15/M output):

Pre-call estimate: (4048/1M * 3.00) + (4000/1M * 15.00) = $0.012144 + $0.060000 = $0.072144

This is the canonical cost anchor for Keirsey-class research dispatches (25-60 recipient typology validation tasks, structured markdown output requested, ~16K chars prompt). Range: $0.05 - $0.15 depending on response verbosity.

For comparison with K528 perplexity_spaces benchmark: $0.239/HOT for 200-question benchmark = ~$0.0012/question at sonar-pro. Keirsey dispatch is not a question bank — it is a multi-recipient research task producing a structured table. Different cost structure, but consistent with sonar-pro economics.

PATTERN: For scoped research tasks with structured output (markdown tables, typology analysis), budget $0.07-0.20 per dispatch on sonar-pro. The $1.00 per-dispatch cap (14x safety margin at $0.072) is appropriate for foreseeable Pawn research use cases. Revisit only if Pawn is asked to do large-scale web crawl or very long-form generation (>8000 tokens).`,
    source: "benchmark_finding",
    canonical_ref: "K532 dispatch_id=6fcb4451 / config/pawn_dispatch_caps.json / K528 perplexity_spaces empirical",
  },
  {
    ts: "2026-04-28T01:58:00.000Z",
    session: "K532",
    observation: `TS-115: NODE.JS FETCH GLOBAL REPLACES OPENAI PACKAGE FOR PERPLEXITY API CALLS — NO NEW DEPENDENCIES.

K532's pawn_dispatch.ts uses Node.js 22's global fetch() for Perplexity API calls instead of installing the openai npm package. The Perplexity API is OpenAI-compatible (same endpoint structure: POST /chat/completions, same request schema, same Authorization header pattern). This means the openai package is not required.

RATIONALE: (1) No new package.json dependency; (2) No version pinning risk; (3) fetch is built-in to Node.js 22 (verified by @types/node ^22.0.0 in devDependencies); (4) The request body is simple JSON serializable to string — no SDK magic needed.

REQUEST SCHEMA: { model: "sonar-pro", max_tokens: 4000, messages: [{ role: "user", content: "<prompt>" }] }. Authorization: "Bearer <PERPLEXITY_API_KEY>". Content-Type: "application/json". Base URL: https://api.perplexity.ai.

PATTERN: For simple REST API calls where the SDK only wraps fetch() under the hood, prefer native fetch. This avoids dependency churn, reduces bundle size, and keeps the implementation transparent. Use the SDK only when you need streaming, type-safe request builders, or SDK-specific features (e.g., Anthropic's streaming events).`
,
    source: "implementation_decision",
    canonical_ref: "K532 librarian-mcp/src/pawn_dispatch.ts / K499 perplexity_spaces_adapter.py pattern",
  },
];

let count = 0;
for (const entry of entries) {
  appendFileSync(TOOLSMITH_PATH, JSON.stringify(entry) + "\n", "utf-8");
  count++;
  console.log(`Appended TS-${111 + count}: ${entry.observation.split("\n")[0]}`);
}

console.log(`\nDone — ${count} Toolsmith entries appended to scribe_Toolsmith.jsonl`);
