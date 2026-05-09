/**
 * MoneyPenny Substantive Engager (§4.3, §7, Bushel 82, BP034)
 * The agent that holds B-tier callers with substantive engagement.
 * NOT "please hold" — actual informed engagement using caller history + canon Eblets.
 */

import type { CallerClass } from "../types.js";
import { getEngagerAssignment } from "./kissaki_assignment.js";

// ─── Engager Prompt Templates ─────────────────────────────────────────────────

const ENGAGER_SYSTEM_BY_CLASS: Record<CallerClass, string> = {
  WARREN_BUFFETT:
    "You represent Liana Banyan Corporation at the highest level. This is a Warren Buffett-class connection. Engage with maximum attention. The Founder will be with them shortly.",
  MACKENZIE_SCOTT:
    "You represent Liana Banyan Corporation to an important mission-aligned contact. Engage on mission, cooperative principles, and social impact. Founder available shortly.",
  TALENTS_PRACTITIONER:
    "You are engaging a Talents Practitioner — a PF300 member or potential collaborator. Discuss their skills and how Liana Banyan's cooperative model serves them.",
  FAMILY:
    "This is a family member of the Founder. Be warm, personal, and helpful. The Founder will be available very soon.",
  COUNSEL:
    "Interfacing with legal counsel. Be professional, precise. Do not volunteer sensitive information. Confirm Founder will engage shortly.",
  PRESS:
    "Engaging a journalist. Provide accurate platform information from approved canon. Do not speculate. Offer to arrange a substantive Founder interview.",
  UNKNOWN:
    "Engaging an unverified inbound contact. Be helpful but cautious. Understand what brings them here and whether it warrants Founder attention.",
  INTERNAL_AI:
    "Handling an AI-to-AI context handoff per MCCI protocol. Acknowledge receipt and confirm thread continuity.",
};

// ─── Response Generation ───────────────────────────────────────────────────────

export interface EngageResult {
  response: string;
  open_questions: string[];
  should_escalate: boolean;
  escalation_reason?: string;
}

export async function generateSubstantiveResponse(
  callerClass: CallerClass,
  callerMessage: string,
  threadContext: string,
  priorExchanges: Array<{ role: string; text: string }> = [],
): Promise<EngageResult> {
  const assignment = getEngagerAssignment(callerClass);

  if (assignment.substrate_ai === "founder-direct") {
    return {
      response: "[ESCALATE_TO_FOUNDER] This interaction requires Founder direct engagement.",
      open_questions: [],
      should_escalate: true,
      escalation_reason: "KISSAKI-class caller requires Founder direct",
    };
  }

  const apiKey = process.env["ANTHROPIC_API_KEY"] ?? process.env["CLAUDE_API_KEY"];
  if (!apiKey) {
    return generateFallbackResponse(callerClass, callerMessage);
  }

  try {
    const model = assignment.substrate_ai.includes("opus")
      ? "claude-opus-4-7"
      : "claude-sonnet-4-6";

    const systemPrompt = buildSystemPrompt(callerClass, threadContext);
    const messages = [
      ...priorExchanges.map(e => ({
        role: e.role === "caller" ? "user" as const : "assistant" as const,
        content: e.text,
      })),
      { role: "user" as const, content: callerMessage },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model, max_tokens: 800, system: systemPrompt, messages }),
    });

    if (!response.ok) return generateFallbackResponse(callerClass, callerMessage);

    const data = await response.json() as {
      content?: Array<{ type: string; text: string }>;
    };
    const text = data.content?.find(c => c.type === "text")?.text ?? "";

    return {
      response: text,
      open_questions: extractQuestions(text),
      should_escalate: detectEscalation(text),
      escalation_reason: detectEscalation(text) ? "AI detected escalation trigger" : undefined,
    };
  } catch {
    return generateFallbackResponse(callerClass, callerMessage);
  }
}

function buildSystemPrompt(callerClass: CallerClass, threadContext: string): string {
  const base = ENGAGER_SYSTEM_BY_CLASS[callerClass];
  const ctx = threadContext.length > 50
    ? `\n\nPrior context:\n${threadContext.slice(0, 2000)}`
    : "";
  return `${base}${ctx}\n\nBe substantive, not a placeholder. Never promise specific Founder availability times.`;
}

function generateFallbackResponse(callerClass: CallerClass, _msg: string): EngageResult {
  const fallbacks: Record<CallerClass, string> = {
    WARREN_BUFFETT:
      "Thank you for reaching out. Jonathan is in a focused session and will be with you shortly. In the meantime, Liana Banyan is built on a Cost+20% cooperative model that constitutionally guarantees 83.3% creator keeps. What aspect of the platform would you like to discuss?",
    MACKENZIE_SCOTT:
      "Thank you for your interest in Liana Banyan. Jonathan will be available shortly. Our platform prevents extraction constitutionally — the 83.3% creator keep is in the bylaws.",
    TALENTS_PRACTITIONER:
      "Welcome! Jonathan will be with you shortly. What skills do you bring to our cooperative platform?",
    FAMILY:
      "Hi! Jonathan is in a focused session but will be with you very soon. Is this urgent?",
    COUNSEL:
      "Thank you. Jonathan is in a focused session and will be available shortly. Could you indicate the matter's nature?",
    PRESS:
      "Thank you for your interest. Jonathan will be available shortly. Key facts: member-owned cooperative, 16 initiatives, 2,267 innovations, 13 provisional patents. What's the angle?",
    UNKNOWN:
      "Thank you for reaching out to Liana Banyan. What brings you here today?",
    INTERNAL_AI:
      "[MCCI_HANDOFF_RECEIVED] Context packet acknowledged. Thread continuity confirmed.",
  };

  return {
    response: fallbacks[callerClass] ?? fallbacks.UNKNOWN,
    open_questions: extractQuestions(_msg),
    should_escalate: false,
  };
}

function extractQuestions(text: string): string[] {
  return text.split(/[.!?\n]/).filter(s => s.trim().endsWith("?")).map(s => s.trim()).slice(0, 5);
}

function detectEscalation(text: string): boolean {
  return /escalat|urgent.*immediate|cannot.*wait|legal.*action|time.*critical|crisis/i.test(text);
}
