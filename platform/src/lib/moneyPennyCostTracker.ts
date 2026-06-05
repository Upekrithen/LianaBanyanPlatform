/**
 * MoneyPenny Cost Tracker — BP073 Wave 4 · W4.11-W4.12
 * =====================================================
 * Per-channel cost constants, per-event cost estimation, and
 * NYT-scale inbound volume projections.
 *
 * Cost basis (all USD, verified 2026-06-03):
 *   Twilio Voice inbound:  $0.0085/min + $1.00/mo/number
 *   Twilio SMS inbound:    $0.0079/message
 *   Twilio SMS outbound:   $0.0079/message
 *   Gmail Pub/Sub:         $0.00 (free tier: 10 GB/mo Pub/Sub data)
 *   Resend:                $0.00 free tier (100 emails/day), $0.00040/email after
 *   Anthropic Claude:      ~$0.0030/triage call (est. 1000 tokens @ $3/Mtok Sonnet)
 *   Supabase DB write:     ~$0.00001/write (compute credit cost est.)
 *
 * NYT-scale scenario: After a NYT front-page feature, estimated inbound in 48h:
 *   Voice calls:        200-500
 *   SMS inbound:        100-300
 *   Email inbound:      2,000-10,000
 *   Contact form subs:  500-2,000
 *
 * These are conservative estimates. All costs are Cost+20% per doctrine.
 *
 * FOUNDER: no action needed. Cost tracking is automatic once channels are live.
 */

// ─── Cost Constants ───────────────────────────────────────────────────────────

export const CHANNEL_COSTS = {
  voice: {
    inbound_per_minute_usd: 0.0085,
    phone_number_per_month_usd: 1.00,
    avg_call_duration_minutes: 3.0,
    sms_alert_per_call_usd: 0.0079,
    notes: "Twilio inbound voice. Avg call = 3 min hold + optional voicemail.",
  },
  sms: {
    inbound_per_message_usd: 0.0079,
    outbound_per_message_usd: 0.0079,
    avg_messages_per_conversation: 4,
    notes: "Twilio SMS. Claude AI adds ~$0.003/conversation for AI-assisted replies.",
  },
  gmail: {
    per_message_usd: 0.00,
    pubsub_per_gb_usd: 0.10,
    avg_message_size_kb: 5,
    notes: "Gmail Pub/Sub is free under 10 GB/mo. Email classification via Claude adds ~$0.003/email.",
  },
  resend: {
    free_tier_per_day: 100,
    per_email_usd_above_free: 0.00040,
    notes: "Free for first 100 emails/day. $0.40/1000 above that.",
  },
  ai_triage: {
    per_call_usd: 0.0030,
    model: "claude-sonnet-4-6",
    avg_tokens: 1000,
    notes: "Used by gatekeeper-triage and moneypenny-intake for Claude classification.",
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type TrackedChannel = "voice" | "sms" | "gmail" | "resend";

export interface ChannelEventCost {
  channel: TrackedChannel;
  event_type: string;
  base_cost_usd: number;
  ai_cost_usd: number;
  total_cost_usd: number;
  notes: string;
}

export interface VolumeScenario {
  label: string;
  voice_calls: number;
  sms_messages: number;
  emails: number;
  contact_forms: number;
}

export interface VolumeCostEstimate {
  scenario: VolumeScenario;
  voice_cost_usd: number;
  sms_cost_usd: number;
  gmail_cost_usd: number;
  resend_cost_usd: number;
  ai_triage_cost_usd: number;
  total_cost_usd: number;
  total_with_buffer_usd: number;
  buffer_percent: number;
  notes: string;
}

// ─── W4.11 Per-Event Cost Estimation ─────────────────────────────────────────

/**
 * Estimate the cost for a single channel event.
 */
export function estimateEventCost(
  channel: TrackedChannel,
  event_type: string,
  extras?: { duration_minutes?: number; message_count?: number; above_free_tier?: boolean },
): ChannelEventCost {
  switch (channel) {
    case "voice": {
      const mins = extras?.duration_minutes ?? CHANNEL_COSTS.voice.avg_call_duration_minutes;
      const base = mins * CHANNEL_COSTS.voice.inbound_per_minute_usd;
      const sms = CHANNEL_COSTS.voice.sms_alert_per_call_usd;
      return {
        channel,
        event_type,
        base_cost_usd: base + sms,
        ai_cost_usd: 0,
        total_cost_usd: base + sms,
        notes: `${mins} min @ $${CHANNEL_COSTS.voice.inbound_per_minute_usd}/min + SMS alert`,
      };
    }
    case "sms": {
      const msgs = extras?.message_count ?? CHANNEL_COSTS.sms.avg_messages_per_conversation;
      const inbound = msgs * CHANNEL_COSTS.sms.inbound_per_message_usd;
      const ai = CHANNEL_COSTS.ai_triage.per_call_usd;
      return {
        channel,
        event_type,
        base_cost_usd: inbound,
        ai_cost_usd: ai,
        total_cost_usd: inbound + ai,
        notes: `${msgs} SMS @ $${CHANNEL_COSTS.sms.inbound_per_message_usd} + Claude`,
      };
    }
    case "gmail": {
      const ai = CHANNEL_COSTS.ai_triage.per_call_usd;
      return {
        channel,
        event_type,
        base_cost_usd: 0,
        ai_cost_usd: ai,
        total_cost_usd: ai,
        notes: `Gmail free + Claude classification $${ai.toFixed(4)}`,
      };
    }
    case "resend": {
      const aboveFree = extras?.above_free_tier ?? false;
      const base = aboveFree ? CHANNEL_COSTS.resend.per_email_usd_above_free : 0;
      return {
        channel,
        event_type,
        base_cost_usd: base,
        ai_cost_usd: 0,
        total_cost_usd: base,
        notes: aboveFree
          ? `Above free tier: $${base.toFixed(5)}/email`
          : "Within free tier (100/day): $0.00",
      };
    }
    default:
      return {
        channel,
        event_type,
        base_cost_usd: 0,
        ai_cost_usd: 0,
        total_cost_usd: 0,
        notes: "Unknown channel",
      };
  }
}

// ─── W4.12 NYT-Scale Volume Estimates ────────────────────────────────────────

/**
 * Pre-defined volume scenarios for capacity planning.
 */
export const VOLUME_SCENARIOS: Record<string, VolumeScenario> = {
  typical_day: {
    label: "Typical day (pre-launch)",
    voice_calls: 5,
    sms_messages: 10,
    emails: 50,
    contact_forms: 20,
  },
  launch_week: {
    label: "Launch week (organic spread)",
    voice_calls: 50,
    sms_messages: 100,
    emails: 500,
    contact_forms: 200,
  },
  nyt_48h: {
    label: "NYT front-page feature (48h spike)",
    voice_calls: 350,
    sms_messages: 200,
    emails: 6000,
    contact_forms: 1200,
  },
  nyt_worst: {
    label: "NYT worst-case (viral + TV pickup)",
    voice_calls: 1000,
    sms_messages: 500,
    emails: 25000,
    contact_forms: 5000,
  },
  social_thursday: {
    label: "Social Thursday blast (X/IG/FB coordinated)",
    voice_calls: 200,
    sms_messages: 400,
    emails: 3000,
    contact_forms: 800,
  },
};

/**
 * W4.12 — Estimate total cost for a volume scenario.
 * Buffer percent = 20% per doctrine (Cost+20%).
 */
export function estimateVolumeCost(scenario: VolumeScenario, bufferPercent = 20): VolumeCostEstimate {
  const voiceCost = scenario.voice_calls *
    (CHANNEL_COSTS.voice.avg_call_duration_minutes * CHANNEL_COSTS.voice.inbound_per_minute_usd +
     CHANNEL_COSTS.voice.sms_alert_per_call_usd);

  const smsCost = scenario.sms_messages *
    CHANNEL_COSTS.sms.inbound_per_message_usd * CHANNEL_COSTS.sms.avg_messages_per_conversation;

  const gmailCost = 0; // Free tier

  // Resend: first 100/day free, rest @ $0.0004
  const freeEmailsPerDay = CHANNEL_COSTS.resend.free_tier_per_day;
  const paidEmails = Math.max(0, scenario.emails - freeEmailsPerDay);
  const resendCost = paidEmails * CHANNEL_COSTS.resend.per_email_usd_above_free;

  const aiTriageCost =
    (scenario.sms_messages + scenario.emails + scenario.contact_forms) *
    CHANNEL_COSTS.ai_triage.per_call_usd;

  const total = voiceCost + smsCost + gmailCost + resendCost + aiTriageCost;
  const totalWithBuffer = total * (1 + bufferPercent / 100);

  return {
    scenario,
    voice_cost_usd: round4(voiceCost),
    sms_cost_usd: round4(smsCost),
    gmail_cost_usd: 0,
    resend_cost_usd: round4(resendCost),
    ai_triage_cost_usd: round4(aiTriageCost),
    total_cost_usd: round4(total),
    total_with_buffer_usd: round4(totalWithBuffer),
    buffer_percent: bufferPercent,
    notes: `${scenario.label}. Buffer: +${bufferPercent}%. Largest cost: ${getLargestCostDriver(voiceCost, smsCost, resendCost, aiTriageCost)}.`,
  };
}

function getLargestCostDriver(voice: number, sms: number, resend: number, ai: number): string {
  const costs = [["Voice", voice], ["SMS", sms], ["Resend", resend], ["AI triage", ai]] as [string, number][];
  const sorted = costs.sort((a, b) => b[1] - a[1]);
  return `${sorted[0][0]} ($${sorted[0][1].toFixed(4)})`;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Format a cost estimate as a human-readable report string.
 */
export function formatCostReport(est: VolumeCostEstimate): string {
  const lines = [
    `=== Cost Estimate: ${est.scenario.label} ===`,
    `Voice (${est.scenario.voice_calls} calls):       $${est.voice_cost_usd.toFixed(4)}`,
    `SMS (${est.scenario.sms_messages} msgs):         $${est.sms_cost_usd.toFixed(4)}`,
    `Gmail (${est.scenario.emails} emails):           $${est.gmail_cost_usd.toFixed(4)} (free)`,
    `Resend auto-responses:                    $${est.resend_cost_usd.toFixed(4)}`,
    `AI triage (Claude):                       $${est.ai_triage_cost_usd.toFixed(4)}`,
    `─────────────────────────────────────────`,
    `Total:                                    $${est.total_cost_usd.toFixed(4)}`,
    `Total +${est.buffer_percent}% buffer:            $${est.total_with_buffer_usd.toFixed(4)}`,
    est.notes,
  ];
  return lines.join("\n");
}
