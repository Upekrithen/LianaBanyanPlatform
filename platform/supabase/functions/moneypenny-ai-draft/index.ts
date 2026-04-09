/**
 * MONEYPENNY AI DRAFT — Central AI Brain
 * ========================================
 * Any MoneyPenny system that needs AI-generated text calls this function.
 * Uses Claude ↔ Perplexity mutual fallback (proven in Star Chamber K80).
 *
 * task_type: 'draft_qa_response' | 'draft_social_response' | 'classify_message'
 *          | 'generate_briefing' | 'summarize_inbox'
 *          | 'call-prep-brief' | 'commission-followup'
 *
 * Returns: { result: string, engine: 'claude' | 'perplexity' | 'error', confidence: number }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-system-key",
};

type LLMProvider = "claude" | "perplexity";

const MONEYPENNY_SYSTEM_PROMPT = `You are MoneyPenny, the virtual assistant for Liana Banyan cooperative platform.

Key facts:
- LB is a cooperative serving working families (food, housing, transportation)
- 16 initiatives ("Sweet Sixteen"), 1,935 innovations, 8 patent applications
- Core principle: HEOHO (Help Each Other, Help Ourselves) — interdependence, not collectivism
- Three currencies: Credits ($1=1), Marks (effort-based), Joules (surplus storage)
- Cost+20% pricing floor. 83.3% to creators, 13.3% operations, 3.3% Gleaner's Corner
- Mission ONE: "EVERYONE Eats Tonight" | Mission TWO: Housing | Mission THREE: Transport
- Confirmation phrase: "As You Wish"

Tone: Warm, professional, knowledgeable. Like a sharp executive assistant who genuinely cares about the cooperative's mission. Never use corporate buzzwords. Be direct and helpful.

SEC compliance: NEVER use "invest," "equity," "ROI," "returns," "shares," "profit," or "dividend." Use "sponsor," "participation," "service value," "membership," "platform benefit" instead.`;

const TASK_PROMPTS: Record<string, string> = {
  draft_qa_response: `Draft a helpful, warm answer to this member question. Include relevant context about the Liana Banyan platform where appropriate. If the question touches SEC-sensitive topics (investment, equity, returns), flag it clearly with [SEC-SENSITIVE] at the start and reframe using compliant language. Keep the answer concise (2-4 paragraphs). End with "As You Wish" if appropriate.`,

  draft_social_response: `Draft an appropriate social media reply. Match warm/professional tone. Keep under 280 characters for Twitter. Be genuine, not corporate. If the mention is positive, thank them warmly. If it's a question, provide a brief answer or link. If negative, be empathetic and constructive.`,

  classify_message: `Classify this email/message. Return ONLY valid JSON with these fields:
{
  "priority": 1-4 (1=urgent, 4=low),
  "category": "crown_response" | "press" | "patent" | "member" | "support" | "unknown",
  "sentiment": "positive" | "neutral" | "negative",
  "suggested_action": "brief description of what to do"
}
Return ONLY the JSON, no other text.`,

  generate_briefing: `Generate a 3-paragraph morning briefing for the Founder. Start with "Good morning." Include:
Paragraph 1: Priority items that need immediate attention today.
Paragraph 2: Summary of pending work (inbox, social, actions).
Paragraph 3: A recommendation or opportunity to highlight.
Be concise, warm, and action-oriented. End with the current date.`,

  summarize_inbox: `For each inbox item provided, generate a single-line summary (max 100 chars). Return as a JSON array of objects: [{"id": "...", "summary": "..."}]. Return ONLY the JSON array.`,

  "call-prep-brief": `Create a concise pre-call brief for the Founder in bullet points. Include:
- Who this contact is and relationship stage
- Last known context and conversation continuity
- Recommended Treasure Map route and Red Carpet angle
- 2-3 specific What-If commission options with rationale
- A recommended opener and one clear close for the call
Keep it practical and under 300 words.`,

  "commission-followup": `Draft a follow-up email after a What-If commission conversation.
If commission is accepted, confirm scope, next step, and first checkpoint.
If still offered, keep tone warm and low-pressure with clear decision options.
Include one paragraph, one bullet list of commitments, and one explicit next action.
Keep language cooperative and mission-aligned.`,
};

async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  primary: LLMProvider = "claude",
): Promise<{ text: string; engine: LLMProvider | "error" }> {
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");

  const claudeCall = async (): Promise<string | null> => {
    if (!anthropicKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.content?.[0]?.text;
      return text && text.length > 10 ? text : null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  const perplexityCall = async (): Promise<string | null> => {
    if (!perplexityKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${perplexityKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      return text && text.length > 10 ? text : null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  const providers: Array<{ name: LLMProvider; call: () => Promise<string | null> }> =
    primary === "claude"
      ? [{ name: "claude", call: claudeCall }, { name: "perplexity", call: perplexityCall }]
      : [{ name: "perplexity", call: perplexityCall }, { name: "claude", call: claudeCall }];

  for (const provider of providers) {
    const result = await provider.call();
    if (result) {
      console.log(`[moneypenny-ai-draft] Engine: ${provider.name}${provider.name !== primary ? " (fallback)" : ""}`);
      return { text: result, engine: provider.name };
    }
    console.warn(`[moneypenny-ai-draft] ${provider.name} failed, trying next...`);
  }

  console.error("[moneypenny-ai-draft] ALL LLM providers failed");
  return {
    text: "I'm temporarily unable to generate a draft. Both AI providers are currently unreachable. Please try again shortly.",
    engine: "error",
  };
}

interface AIDraftRequest {
  task_type: string;
  context: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: AIDraftRequest = await req.json();
    const { task_type, context, metadata } = payload;

    if (!task_type || !context) {
      return new Response(
        JSON.stringify({ error: "Missing task_type or context" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const taskPrompt = TASK_PROMPTS[task_type];
    if (!taskPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown task_type: ${task_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userPrompt = `${taskPrompt}\n\n---\n\n${context}${metadata ? `\n\nAdditional context: ${JSON.stringify(metadata)}` : ""}`;

    const { text, engine } = await callLLM(MONEYPENNY_SYSTEM_PROMPT, userPrompt);

    const confidence = engine === "error" ? 0 : engine === "claude" ? 0.85 : 0.75;

    return new Response(
      JSON.stringify({ result: text, engine, confidence }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[moneypenny-ai-draft] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
