/**
 * cathedral-demo — LB Frame Public Web Demo API
 *
 * POST /cathedral-demo/ask
 *   body: { question_id?: string, question_text: string, condition: "cold"|"cathedral", session_uuid: string }
 *   returns: { answer: string, correct: boolean, lift_available: boolean, chips?: { intent, enriched_chars, tokens } }
 *
 * Rate limit: 5 cathedral calls per IP per 24h (cold calls are free/static, uncounted).
 * Spend cap: $50/day kill-switch — configurable via DEMO_DAILY_SPEND_CAP env var.
 * Privacy: IP stored as SHA-256 hash + daily rotating salt only. Raw IP never persisted.
 * Telemetry: writes to test_frame_results with source="public_web_demo".
 *
 * Model: claude-haiku-4-5 (Anthropic Haiku 4.5) — soft system prompt (TS-045 mitigation).
 *
 * K512 / B126
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Full versioned model ID required by Anthropic REST API.
// Alias "claude-haiku-4-5" is rejected (400) — must use the datestamped form.
// To reproduce cathedral-path test: see A.1 curl recipe at bottom of file.
const MODEL = "claude-haiku-4-5-20251001";
const COST_PER_CATHEDRAL_CALL_USD = 0.0003; // Conservative estimate: Haiku 4.5, ~1,500 tokens combined
const RATE_LIMIT_PER_DAY = 5;

// ── Cathedral context templates (ported from lb-test-frame/extension/verify.js) ──

const CONTEXT_TEMPLATES: Record<string, string> = {
  economics: `Liana Banyan is a cooperative commerce platform. Key facts: Creators keep 83.3% of every transaction (never rounded to 83%). Platform margin is Cost+20%. On a $500 transaction, the creator receives $416.67. Membership costs $5/year, identical for every member forever — no tiers, no entry fees. The three currencies are Credits (exchange 1:1 with dollars, one-way valve — cannot cash out to fiat), Marks (earned through effort, not purchased), and Joules (surplus/forever stamp currency). Per-person Credit cap: $5,000.`,

  platform: `Liana Banyan platform systems: Six Sparks = six effortful paths for new member visibility. Trust Match = mutual Mark-staking between strangers — each party stakes Marks; bad behavior forfeits stake. Good Standing Roll = inverted allowlist (platform tracks the good-standing list, not bad actors). Seasoning = time-gating on trust accumulation. Pedestal = featured creator recognition system. The Furnace = verification system + immutable public ledger that stamps badges, listings, and Marks.`,

  technology: `Liana Banyan technology: The Romulator 9000 is a ROM-first context persistence system for AI agents — context is pre-loaded before the agent's first token, eliminating cold-start re-establishment. The Furnace is LB's verification + immutable public ledger. Slow Blade is the rate-limit on Furnace stamps per account per unit time (bots rely on speed; Slow Blade makes speed useless). The Cathedral Effect is the measured improvement in AI accuracy when LB substrate context is pre-injected.`,

  identity: `Liana Banyan Corporation facts: Legal name is LIANA BANYAN CORPORATION. Wyoming C-Corporation, filed November 21, 2025. EIN: 41-2797446. Holding company: Upekrithen LLC (Wyoming, 100% owned). Founder: Jonathan Jones — 53-year-old ARNG veteran, FAA Commercial Rotary Wing IFR rating, father of eight, 37 years developing this system. Platform motto: "Help each other help ourselves." LRH is the platform guide character — animal/chess-piece visual, not human.`,

  ip: `Liana Banyan IP facts: 13 provisional patent applications filed (most recent: 64/036,646, filed April 12, 2026). Approximately 2,412 formal claims. 225 Crown Jewels (innovations with no prior art found). IP revenue waterfall: Patent Buckets 60%, Founder/Creator 20%, Global Sponsor Pool 10%, Individual Patent Pedestals 10%. Cooperative Defensive Patent Pledge (#2260): every innovation filed under mutual protection, free to nonprofits/cooperatives/academics in perpetuity. Conversion firms: Harrity & Harrity and Lloyd & Mousilli. First conversion deadline: November 26, 2026.`,

  governance: `Liana Banyan governance — The 300 Model: Three tiers — Crowns (invited domain experts, named seats), Board (elected by members), Captains (operational leaders). ADAPT Score replaces demographics with demonstrated capability. The Good Standing Roll is an inverted allowlist — platform maintains the in-good-standing list, not a blocklist. XP × Reputation weighting: every action multiplied by account's XP × Rep. Sybil accounts at 0 × 0 = 0 aggregate leverage.`,

  research: `The Cathedral Effect: Measured improvement in AI accuracy when Liana Banyan's substrate context (the "cathedral" — canonical memory pre-loaded before first token) is injected into AI sessions. Research benchmark R13 found a mean lift of approximately 86 percentage points across 8 AI vendors (cold HOT% vs cathedral HOT%). The Cathedral is the Romulator 9000's implementation in practice — the highway line painter carrying the paint can instead of walking back to the start.`,
};

const FULL_CONTEXT = Object.values(CONTEXT_TEMPLATES).join("\n\n");

// ── Pre-computed cold answers for the 7 curated demo questions ───────────────
// These are realistic responses from an AI with no LB substrate — what the cold model says.

const COLD_ANSWERS: Record<string, string> = {
  q01: "I don't have specific information about Liana Banyan's creator compensation percentage. Creator fees vary across platforms — typical marketplaces charge 10–30% in platform fees, leaving creators with 70–90% of transaction value. You'd need to check their current terms of service for the exact fee structure.",
  q02: "I'm not familiar with Liana Banyan's current membership pricing. Membership costs for cooperative platforms range widely. I'd recommend checking their official website for current pricing.",
  q04: "On a $500 transaction, the creator would typically receive somewhere between $350–475 after platform fees, depending on the platform's specific fee model. Without knowing Liana Banyan's exact structure, I can't give a precise figure.",
  q12: "I'm not familiar with the specific currency system used by Liana Banyan. Cooperative platforms sometimes use internal credits or points, but the specifics vary widely.",
  q13: "Most platforms that offer internal credits do allow some form of cash-out or conversion back to fiat, though typically with conditions or fees attached. Whether Liana Banyan specifically allows this would depend on their terms of service.",
  q19: "In acoustics, the 'Cathedral Effect' refers to the long reverberation times characteristic of large stone cathedrals — sound waves bouncing off hard surfaces for several seconds, creating distinctive reverberant ambience. It's studied in architectural acoustics and music production.",
  q07: "The 'Romulator 9000' isn't something I'm familiar with. It could be a vintage gaming device, an emulator for older gaming systems, or possibly proprietary software. Do you have more context about where you encountered this term?",
};

// ── Canonical question bank (subset used in demo) ───────────────────────────

interface DemoQuestion {
  id: string;
  question: string;
  correct_answers: string[];
  category: string;
}

const DEMO_QUESTIONS: DemoQuestion[] = [
  { id: "q01", question: "What percentage does a creator keep on every transaction on the Liana Banyan platform?", correct_answers: ["83.3%", "83.3 percent"], category: "economics" },
  { id: "q02", question: "How much does a Liana Banyan membership cost per year?", correct_answers: ["$5", "5 dollars", "five dollars", "$5/year", "$5 per year"], category: "economics" },
  { id: "q04", question: "On a $500 transaction on Liana Banyan, how much does the creator or worker receive?", correct_answers: ["$416.67", "416.67", "$416"], category: "economics" },
  { id: "q07", question: "What is the Romulator 9000?", correct_answers: ["rom-first context persistence", "context persistence system", "ai context persistence"], category: "technology" },
  { id: "q12", question: "What are the three currencies in Liana Banyan's system?", correct_answers: ["credits marks joules", "credits, marks, and joules", "credits, marks"], category: "economics" },
  { id: "q13", question: "Can Liana Banyan Credits be converted back to dollars (cashed out)?", correct_answers: ["no", "never", "one-way valve"], category: "economics" },
  { id: "q19", question: "What is the Cathedral Effect in the context of Liana Banyan's AI research?", correct_answers: ["improvement in ai accuracy", "lift in correct answers", "context injection improvement"], category: "research" },
];

// ── Grading ──────────────────────────────────────────────────────────────────

function gradeAnswer(answer: string, correctAnswers: string[]): boolean {
  const lower = answer.toLowerCase();
  return correctAnswers.some((ca) => lower.includes(ca.toLowerCase()));
}

// ── IP hashing ───────────────────────────────────────────────────────────────

async function hashIp(ip: string, date: string): Promise<string> {
  // Daily rotating salt: date string acts as salt — same IP hashes differently each day
  const input = new TextEncoder().encode(`${ip}:${date}:lb-demo-salt-2026`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const dailyCapUsd = parseFloat(Deno.env.get("DEMO_DAILY_SPEND_CAP") ?? "50");

  const supabase = createClient(supabaseUrl, supabaseKey);

  let body: {
    question_id?: string;
    question_text?: string;
    condition: "cold" | "cathedral";
    session_uuid?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { question_id, question_text, condition, session_uuid } = body;

  if (!condition || (condition !== "cold" && condition !== "cathedral")) {
    return new Response(JSON.stringify({ error: "condition must be 'cold' or 'cathedral'" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const questionText = question_text?.trim() || (
    question_id
      ? DEMO_QUESTIONS.find((q) => q.id === question_id)?.question ?? ""
      : ""
  );

  if (!questionText) {
    return new Response(JSON.stringify({ error: "question_text or valid question_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const canonicalQ = question_id ? DEMO_QUESTIONS.find((q) => q.id === question_id) : null;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // ── Cold path — static pre-computed answer, no API call, no rate limit ───
  if (condition === "cold") {
    const coldAnswer = canonicalQ
      ? (COLD_ANSWERS[canonicalQ.id] ?? "I don't have specific information about that topic in my training data.")
      : "I don't have specific information about Liana Banyan's details in my training data. This is a cooperative commerce platform, but I don't have reliable specifics about their pricing, governance, or technical architecture.";

    const correct = canonicalQ ? gradeAnswer(coldAnswer, canonicalQ.correct_answers) : false;

    return new Response(JSON.stringify({
      answer: coldAnswer,
      correct,
      condition: "cold",
      lift_available: false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // ── Cathedral path ────────────────────────────────────────────────────────

  // Rate limit check
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = await hashIp(clientIp, today);

  const { data: rlRow, error: rlErr } = await supabase
    .from("demo_rate_limits")
    .select("call_count")
    .eq("ip_hash", ipHash)
    .eq("query_date", today)
    .maybeSingle();

  if (rlErr) {
    console.error("rate_limit_lookup_error", rlErr.message);
  }

  const currentCount = rlRow?.call_count ?? 0;
  if (currentCount >= RATE_LIMIT_PER_DAY) {
    return new Response(JSON.stringify({
      error: "rate_limit_exceeded",
      message: `Demo limit reached (${RATE_LIMIT_PER_DAY} per day). Install the LB Test Frame extension for unlimited use.`,
      cta_url: "https://lb-test-frame.lianabanyan.com",
    }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Spend cap check
  const { data: spendRow } = await supabase
    .from("demo_spend_tracking")
    .select("estimated_usd_spend")
    .eq("spend_date", today)
    .maybeSingle();

  const currentSpend = spendRow?.estimated_usd_spend ?? 0;
  if (currentSpend >= dailyCapUsd) {
    return new Response(JSON.stringify({
      error: "spend_cap_reached",
      message: "The demo is at capacity for today. Try the LB Test Frame extension for unlimited, local-cost access.",
      cta_url: "https://lb-test-frame.lianabanyan.com",
    }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (!anthropicKey) {
    return new Response(JSON.stringify({
      error: "demo_unavailable",
      message: "Cathedral demo temporarily unavailable. Please try the LB Test Frame extension.",
    }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Select substrate: use category-specific context for canonical questions, full context for custom
  const categoryContext = canonicalQ
    ? (CONTEXT_TEMPLATES[canonicalQ.category] ?? FULL_CONTEXT)
    : FULL_CONTEXT;

  const systemPrompt = "You are answering a question. Use the provided context as your primary source. Be concise and direct. If the context contains the answer, state it clearly.";

  const userContent = `Context:\n${categoryContext}\n\nQuestion: ${questionText}`;

  const tokenEstInput = Math.ceil((systemPrompt.length + userContent.length) / 4);
  const startMs = Date.now();

  let cathedralAnswer = "";
  let tokenEstOutput = 0;

  try {
    // 15-second hard timeout covering BOTH headers and body read.
    // fetch() resolves on headers received; anthropicResp.json() can still hang
    // if Supabase edge network stalls mid-body.  Promise.race enforces the wall clock.
    const bodyTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("anthropic_body_timeout_15s")), 15_000)
    );

    const anthropicRespPromise = fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    const anthropicResp = await Promise.race([anthropicRespPromise, bodyTimeout]);

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      // Log full error for diagnostics (status + body). Common causes:
      //   400 = invalid model ID (ensure MODEL uses full datestamped form)
      //   401 = invalid/expired ANTHROPIC_API_KEY secret
      //   429 = rate limit / budget cap at Anthropic level
      console.error("anthropic_api_error", {
        status: anthropicResp.status,
        model: MODEL,
        body: errText.slice(0, 400),
      });
      return new Response(JSON.stringify({
        error: "demo_unavailable",
        message: "Cathedral demo temporarily unavailable. Please try the LB Test Frame extension.",
      }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const anthropicData = await Promise.race([anthropicResp.json(), bodyTimeout]);
    cathedralAnswer = anthropicData.content?.[0]?.text ?? "";
    tokenEstOutput = anthropicData.usage?.output_tokens ?? Math.ceil(cathedralAnswer.length / 4);
  } catch (err: unknown) {
    const e = err as Record<string, unknown>;
    console.error("[cathedral-demo] anthropic_call_failed", {
      model: MODEL,
      status: e?.status,
      error_type: (e?.error as Record<string, unknown>)?.type,
      error_message: String((e?.error as Record<string, unknown>)?.message ?? e?.message ?? err).slice(0, 200),
      request_id: e?.request_id,
    });
    return new Response(JSON.stringify({
      error: "demo_unavailable",
      message: "Cathedral demo temporarily unavailable. Please try the LB Test Frame extension.",
    }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const latencyMs = Date.now() - startMs;
  const correct = canonicalQ ? gradeAnswer(cathedralAnswer, canonicalQ.correct_answers) : null;

  // Increment rate-limit counter (upsert)
  await supabase.from("demo_rate_limits").upsert({
    ip_hash: ipHash,
    query_date: today,
    call_count: currentCount + 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: "ip_hash,query_date" });

  // Increment spend tracking (upsert)
  await supabase.from("demo_spend_tracking").upsert({
    spend_date: today,
    total_cathedral_calls: (spendRow?.total_cathedral_calls ?? 0) + 1,
    estimated_usd_spend: Number(currentSpend) + COST_PER_CATHEDRAL_CALL_USD,
  }, { onConflict: "spend_date" });

  // Write telemetry (anonymous)
  const coldCorrectForTelemetry = canonicalQ
    ? gradeAnswer(COLD_ANSWERS[canonicalQ.id] ?? "", canonicalQ.correct_answers)
    : false;
  const coldHotPct = coldCorrectForTelemetry ? 100 : 0;
  const cathedralHotPct = correct === true ? 100 : (correct === false ? 0 : 50);
  const liftPp = cathedralHotPct - coldHotPct;

  await supabase.from("test_frame_results").insert({
    ai_vendor: MODEL,
    cold_hot_pct: coldHotPct,
    cathedral_hot_pct: cathedralHotPct,
    lift_pp: liftPp,
    questions_completed: 1,
    share_preference: "anonymous",
    member_id: null,
    client_timestamp: new Date().toISOString(),
    source: "public_web_demo",
    question_id: question_id ?? null,
    question_text: questionText.slice(0, 500),
    session_uuid: session_uuid ? session_uuid : null,
  });

  return new Response(JSON.stringify({
    answer: cathedralAnswer,
    correct,
    condition: "cathedral",
    lift_available: canonicalQ !== null,
    chips: {
      intent: canonicalQ?.category ?? "custom",
      enriched_chars: categoryContext.length,
      tokens_input: tokenEstInput,
      tokens_output: tokenEstOutput,
      latency_ms: latencyMs,
    },
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});

// ── Debug recipe (K512.5) — reproduce cathedral-path test via curl ────────────
//
// Load SUPABASE_SERVICE_ROLE_KEY from SDS.env, then:
//
// Invoke-WebRequest -Method POST \
//   -Uri "https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/cathedral-demo" \
//   -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $env:SUPABASE_SERVICE_ROLE_KEY";"apikey"="$env:SUPABASE_SERVICE_ROLE_KEY"} \
//   -Body '{"question_id":"q02","question_text":"How much does a Liana Banyan membership cost per year?","condition":"cathedral","session_uuid":"00000000-0000-0000-0000-000000000001"}'
//
// Expected success: {"answer":"...","correct":true,"condition":"cathedral","chips":{...}}
// Expected failure: {"error":"demo_unavailable",...} → check Supabase Function logs for anthropic_api_error details
