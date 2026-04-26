/**
 * TestFrameDemo — LB Frame Public Web Demo
 *
 * URL: frame.lianabanyan.com (also lianabanyan.com/demo as fallback)
 * Purpose: 30-second browser-native Cathedral Effect demo — no install, no signup, no friction.
 *   1. User picks a canonical question (or types their own).
 *   2. We return the pre-computed cold answer instantly ($0 cost).
 *   3. We call Haiku 4.5 with LB substrate and show the cathedral answer.
 *   4. Side-by-side comparison + lift pp vs R13 mean (+86pp).
 *   5. Phase F discipline-rule preview panel (A&A #2294 preview).
 *   6. $5 Fable Register 1 verbatim from LB_5_DOLLAR_FABLE_B126_SCAFFOLD.md.
 *   7. CTAs: Become a Member | Install extension | Try another.
 *
 * Deployment: frame.lianabanyan.com — Firebase hosting:main custom domain.
 * Backend: Supabase Edge Function cathedral-demo (K512).
 * Rate limit: 5 cathedral calls / IP / 24h (enforced server-side).
 * Telemetry: writes anonymous rows to test_frame_results with source="public_web_demo".
 * Pricing canon: $5/yr, 83.3% creator-keeps — sourced from canonical_values.yaml.
 * Fable register: verbatim from LB_5_DOLLAR_FABLE_B126_SCAFFOLD.md; Founder rewrites prose.
 *
 * K512 / B126
 */

import React, { useState, useRef, useCallback, useId } from "react";

// ── Canonical demo questions (7 curated from fallback_bank.json) ─────────────

const DEMO_QUESTIONS = [
  { id: "q02", question: "How much does a Liana Banyan membership cost per year?", category: "economics", hint: "pricing" },
  { id: "q01", question: "What percentage does a creator keep on every transaction on the Liana Banyan platform?", category: "economics", hint: "economics" },
  { id: "q04", question: "On a $500 transaction on Liana Banyan, how much does the creator or worker receive?", category: "economics", hint: "math" },
  { id: "q13", question: "Can Liana Banyan Credits be converted back to dollars (cashed out)?", category: "economics", hint: "currency" },
  { id: "q12", question: "What are the three currencies in Liana Banyan's system?", category: "economics", hint: "currency" },
  { id: "q07", question: "What is the Romulator 9000?", category: "technology", hint: "tech" },
  { id: "q19", question: "What is the Cathedral Effect in the context of Liana Banyan's AI research?", category: "research", hint: "research" },
] as const;

type QuestionId = typeof DEMO_QUESTIONS[number]["id"];

// ── Supabase Edge Function endpoint ─────────────────────────────────────────

const DEMO_API =
  import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cathedral-demo/ask`
    : "https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/cathedral-demo/ask";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// ── Session UUID (per-page-load, anonymous) ──────────────────────────────────

function makeSessionUuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ── API calls ────────────────────────────────────────────────────────────────

interface AskResult {
  answer: string;
  correct: boolean | null;
  condition: "cold" | "cathedral";
  lift_available: boolean;
  chips?: { intent: string; enriched_chars: number; tokens_input: number; tokens_output: number; latency_ms: number };
  error?: string;
  message?: string;
  cta_url?: string;
}

async function askDemo(params: {
  question_id?: string;
  question_text: string;
  condition: "cold" | "cathedral";
  session_uuid: string;
}): Promise<AskResult> {
  const resp = await fetch(DEMO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SUPABASE_ANON_KEY ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
    },
    body: JSON.stringify(params),
  });
  const data = await resp.json();
  return data;
}

// ── Types ────────────────────────────────────────────────────────────────────

type DemoPhase = "pick" | "running_cold" | "running_cathedral" | "results" | "error";

interface DemoState {
  selectedId: QuestionId | "custom" | null;
  customText: string;
  coldAnswer: string | null;
  cathedralAnswer: string | null;
  coldCorrect: boolean | null;
  cathedralCorrect: boolean | null;
  liftPp: number | null;
  chips: AskResult["chips"] | null;
  errorMsg: string | null;
  errorCta: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TestFrameDemo() {
  const sessionUuid = useRef(makeSessionUuid()).current;
  const customInputId = useId();
  const [phase, setPhase] = useState<DemoPhase>("pick");
  const [state, setState] = useState<DemoState>({
    selectedId: null,
    customText: "",
    coldAnswer: null,
    cathedralAnswer: null,
    coldCorrect: null,
    cathedralCorrect: null,
    liftPp: null,
    chips: null,
    errorMsg: null,
    errorCta: null,
  });

  const resolveQuestion = useCallback((): { id?: string; text: string } => {
    if (state.selectedId === "custom") return { text: state.customText.trim() };
    const q = DEMO_QUESTIONS.find((q) => q.id === state.selectedId);
    return q ? { id: q.id, text: q.question } : { text: "" };
  }, [state.selectedId, state.customText]);

  const runDemo = useCallback(async () => {
    const { id, text } = resolveQuestion();
    if (!text) return;

    setPhase("running_cold");
    setState((s) => ({ ...s, coldAnswer: null, cathedralAnswer: null, coldCorrect: null, cathedralCorrect: null, liftPp: null, chips: null, errorMsg: null }));

    // Step 1: cold (fast, static)
    const coldResult = await askDemo({ question_id: id, question_text: text, condition: "cold", session_uuid: sessionUuid });
    if (coldResult.error) {
      setState((s) => ({ ...s, errorMsg: coldResult.message ?? "Demo unavailable.", errorCta: coldResult.cta_url ?? null }));
      setPhase("error");
      return;
    }

    setState((s) => ({ ...s, coldAnswer: coldResult.answer, coldCorrect: coldResult.correct ?? null }));

    // Step 2: cathedral (calls Haiku 4.5)
    setPhase("running_cathedral");
    const cathedralResult = await askDemo({ question_id: id, question_text: text, condition: "cathedral", session_uuid: sessionUuid });
    if (cathedralResult.error) {
      const msg = cathedralResult.error === "rate_limit_exceeded" || cathedralResult.error === "spend_cap_reached"
        ? (cathedralResult.message ?? "Demo limit reached.")
        : "Cathedral demo temporarily unavailable. Please try the LB Test Frame extension.";
      setState((s) => ({ ...s, errorMsg: msg, errorCta: cathedralResult.cta_url ?? "https://lb-test-frame.lianabanyan.com" }));
      setPhase("error");
      return;
    }

    const liftPp = cathedralResult.correct === true && coldResult.correct === false
      ? 100
      : cathedralResult.correct === false && coldResult.correct === true
      ? -100
      : cathedralResult.correct === coldResult.correct
      ? 0
      : null;

    setState((s) => ({
      ...s,
      cathedralAnswer: cathedralResult.answer,
      cathedralCorrect: cathedralResult.correct ?? null,
      liftPp,
      chips: cathedralResult.chips ?? null,
    }));
    setPhase("results");
  }, [resolveQuestion, sessionUuid]);

  const reset = () => {
    setPhase("pick");
    setState({ selectedId: null, customText: "", coldAnswer: null, cathedralAnswer: null, coldCorrect: null, cathedralCorrect: null, liftPp: null, chips: null, errorMsg: null, errorCta: null });
  };

  const isRunning = phase === "running_cold" || phase === "running_cathedral";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/30 rounded-full px-4 py-1.5 mb-6 text-blue-400 text-sm">
            ⛩ LB Frame — Cathedral Effect Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
            See the difference.<br />
            <span className="text-blue-400">Your AI, with vs. without the Cathedral.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Pick a question. Wait 5 seconds. See your AI's answer with the Cathedral,
            beside its answer without. No install. No signup. No friction.
          </p>
        </div>

        {/* ── Question Picker ── */}
        {(phase === "pick" || isRunning) && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Pick a question
            </h2>

            <div className="grid gap-2 mb-4">
              {DEMO_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  disabled={isRunning}
                  onClick={() => setState((s) => ({ ...s, selectedId: q.id, customText: "" }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    state.selectedId === q.id
                      ? "border-blue-500 bg-blue-900/30 text-blue-100"
                      : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {q.question}
                </button>
              ))}

              {/* Custom question input */}
              <div
                className={`border rounded-xl transition-all ${
                  state.selectedId === "custom"
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-slate-700 bg-slate-800/50"
                }`}
              >
                <button
                  disabled={isRunning}
                  onClick={() => setState((s) => ({ ...s, selectedId: "custom" }))}
                  className="w-full text-left px-4 pt-3 pb-1 text-sm text-slate-400"
                >
                  ✏️ Type your own question about Liana Banyan…
                </button>
                {state.selectedId === "custom" && (
                  <div className="px-4 pb-3">
                    <label htmlFor={customInputId} className="sr-only">Your question</label>
                    <input
                      id={customInputId}
                      autoFocus
                      disabled={isRunning}
                      value={state.customText}
                      onChange={(e) => setState((s) => ({ ...s, customText: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter" && state.customText.trim().length > 5) runDemo(); }}
                      placeholder="e.g. What is the Cooperative Defensive Patent Pledge?"
                      className="w-full bg-transparent border-0 border-t border-slate-700 pt-2 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={runDemo}
              disabled={
                isRunning ||
                !state.selectedId ||
                (state.selectedId === "custom" && state.customText.trim().length < 6)
              }
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
            >
              {isRunning
                ? (phase === "running_cold" ? "Fetching cold answer…" : "Calling the Cathedral (Haiku 4.5)…")
                : "See the Cathedral Effect →"}
            </button>

            {isRunning && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className={phase === "running_cold" ? "text-white" : "text-green-400"}>
                    {phase === "running_cold" ? "⏳" : "✓"} Cold answer (no LB context)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className={phase === "running_cathedral" ? "text-white animate-pulse" : "text-slate-500"}>
                    {phase === "running_cathedral" ? "⏳" : "○"} Cathedral answer (with LB context)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Error state ── */}
        {phase === "error" && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-2xl p-6 mb-6 text-center">
            <div className="text-2xl mb-3">⚠️</div>
            <p className="text-red-200 mb-4">{state.errorMsg}</p>
            {state.errorCta && (
              <a href={state.errorCta} target="_blank" rel="noopener noreferrer"
                className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white mr-3">
                Get the extension →
              </a>
            )}
            <button onClick={reset} className="px-5 py-2 border border-slate-600 hover:border-slate-400 rounded-lg text-sm text-slate-300">
              Try again
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {phase === "results" && (
          <>
            {/* Side-by-side comparison */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Cold column */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 bg-slate-800/80 border-b border-slate-700/50">
                  <span className="text-red-400 text-sm font-bold">❄ Cold</span>
                  <span className="text-xs text-slate-500">— no LB context</span>
                  {state.coldCorrect === false && (
                    <span className="ml-auto text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">MISS</span>
                  )}
                  {state.coldCorrect === true && (
                    <span className="ml-auto text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full">HOT</span>
                  )}
                </div>
                <div className="p-5 text-sm text-slate-300 leading-relaxed">
                  {state.coldAnswer}
                </div>
              </div>

              {/* Cathedral column */}
              <div className="bg-slate-800/40 border border-green-800/40 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 bg-green-900/20 border-b border-green-800/40">
                  <span className="text-green-400 text-sm font-bold">✦ Cathedral</span>
                  <span className="text-xs text-slate-500">— with LB context</span>
                  {state.cathedralCorrect === true && (
                    <span className="ml-auto text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full">HOT</span>
                  )}
                  {state.cathedralCorrect === false && (
                    <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">MISS</span>
                  )}
                </div>
                <div className="p-5 text-sm text-slate-200 leading-relaxed">
                  {state.cathedralAnswer}
                </div>
              </div>
            </div>

            {/* Lift stat */}
            {state.liftPp !== null && (
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-2xl p-5 mb-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-1">
                  {state.liftPp >= 0 ? "+" : ""}{state.liftPp} pp
                </div>
                <div className="text-sm text-slate-400">
                  Lift for this question.{" "}
                  <span className="text-slate-500">
                    R13 published mean across 8 AI vendors: <strong className="text-slate-400">+86 pp</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Chips (technical detail) */}
            {state.chips && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                <span className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-full text-slate-400">
                  intent: {state.chips.intent}
                </span>
                <span className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-full text-slate-400">
                  context: {state.chips.enriched_chars.toLocaleString()} chars
                </span>
                <span className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-full text-slate-400">
                  tokens in: {state.chips.tokens_input}
                </span>
                <span className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-full text-slate-400">
                  tokens out: {state.chips.tokens_output}
                </span>
                <span className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-full text-slate-400">
                  latency: {state.chips.latency_ms}ms
                </span>
              </div>
            )}

            {/* Honest handling: no meaningful lift */}
            {state.liftPp === 0 && (
              <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4 mb-6 text-sm text-slate-400 text-center">
                Both answers scored similarly on this question — this can happen with well-known topics or small samples.
                The Cathedral Effect is consistent over larger question banks. Try another question or{" "}
                <a href="https://lb-test-frame.lianabanyan.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  run the full 25-question bank
                </a>.
              </div>
            )}

            {/* ── Phase F: Discipline-Rule Preview Panel (A&A #2294 preview) ── */}
            <div className="bg-slate-800/30 border border-purple-700/30 rounded-2xl p-6 mb-6">
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                What members get next: discipline rules for your AI.
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                You just saw what your AI does without grounding. Imagine: a rule that says{" "}
                <em>"Before answering any contract question, my AI must consult my contracts substrate, or refuse."</em>{" "}
                Or:{" "}
                <em>"Block any response that doesn't cite at least one source from my project notes."</em>{" "}
                Members write their own rules. Their AI follows them — structurally, not as advice.
                The same primitive that keeps Liana Banyan's Bishop reliable, available to any member, in any AI,
                in any browser. Coming with your $5/yr membership.
              </p>
              <a
                href="/red-carpet#discipline-layer"
                className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
              >
                Learn more →
              </a>
            </div>

            {/* ── $5 Fable Register 1 (verbatim from LB_5_DOLLAR_FABLE_B126_SCAFFOLD.md) ── */}
            <div className="bg-gradient-to-br from-slate-800/60 to-blue-900/20 border border-blue-700/30 rounded-2xl p-6 mb-6">
              <p className="text-base font-semibold text-white mb-4">
                Two AIs answered your question. The one that knew the Cathedral got it right.
              </p>
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed mb-6">
                <p>That's the architecture. It's free. Always. For everyone.</p>
                <p>
                  <strong className="text-white">What $5/yr membership adds:</strong> YOUR stuff in the Cathedral.
                  Your projects, your contracts, your clients, your decisions — all the context you carry around
                  in your head — accessible to whichever AI you use. Permanently. With provenance. Without
                  uploading it to a vendor that may pivot, raise prices, or fold tomorrow.
                </p>
                <p>
                  <strong className="text-white">You keep what you make.</strong> The $5 you pay today is the $5
                  your grandkid pays in 2070. Same deal for the first member as the five-millionth.
                  No tiers. No tricks. No catch.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://lianabanyan.com/red-carpet"
                  className="flex-1 text-center py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Become a Member ($5/yr) →
                </a>
                <a
                  href="https://lb-test-frame.lianabanyan.com"
                  className="flex-1 text-center py-3 px-5 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-xl text-sm transition-all"
                >
                  Install the LB Test Frame extension →
                </a>
              </div>
            </div>

            {/* Try another */}
            <div className="text-center">
              <button
                onClick={reset}
                className="px-6 py-2.5 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-xl text-sm transition-all"
              >
                Try another question
              </button>
            </div>
          </>
        )}

        {/* ── Footer ── */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-600 space-y-1">
          <p>
            Free to use. No signup. No data stored beyond your demo session (anonymized lift measurement only).
          </p>
          <p>
            Architecture: LB Test Frame + Supabase Edge Function + Anthropic Haiku 4.5.
            R13 empirical: +86pp mean lift across 8 AI vendors.{" "}
            <a href="https://librarian.the2ndsecond.com/community-empirical" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Community results →
            </a>
          </p>
          <p>
            <a href="https://lianabanyan.com" className="text-slate-500 hover:text-slate-400">Liana Banyan Corporation</a>
            {" · "}
            <a href="https://lb-test-frame.lianabanyan.com" className="text-slate-500 hover:text-slate-400">LB Test Frame</a>
            {" · "}
            <a href="https://lianabanyan.com/red-carpet" className="text-slate-500 hover:text-slate-400">$5/yr Membership</a>
          </p>
        </div>
      </div>
    </div>
  );
}
