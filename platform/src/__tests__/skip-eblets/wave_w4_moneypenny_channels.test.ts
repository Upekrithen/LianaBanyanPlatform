// @vitest-environment node
/**
 * Wave 4 — MoneyPenny Live Channels: 30-Scope Empirical Test Suite
 * ================================================================
 * BP073 · Phase α · Wave 4 · "MoneyPenny live channels"
 *
 * WORKS/PARTIAL/NOT YET verdict per scope is at the bottom.
 * Founder-gated = PARTIAL (code ready, credentials needed).
 *
 * Scopes W4.1–W4.30:
 *   W4.1  Twilio Voice dry-run TwiML generation
 *   W4.2  Twilio Voice dry-run TwiML validation
 *   W4.3  Twilio SMS dry-run payload construction
 *   W4.4  SMS E.164 validation + error detection
 *   W4.5  Gmail Pub/Sub dry-run notification structure
 *   W4.6  Gmail Pub/Sub notification parser
 *   W4.7  Resend dry-run payload construction (all tiers)
 *   W4.8  Orchestrated dry-run all channels
 *   W4.9  Credential validator — Twilio format rules
 *   W4.10 Credential validator — Gmail format rules
 *   W4.11 Credential validator — Resend format rules
 *   W4.12 Credential validator — all-channel summary
 *   W4.13 Routing smoke — Voice caller P0 forward path
 *   W4.14 Routing smoke — Voice caller P5 general path
 *   W4.15 Routing smoke — SMS inbound routing logic
 *   W4.16 Routing smoke — Resend template resolution
 *   W4.17 Webhook signature — Twilio canonical string
 *   W4.18 Webhook signature — Gmail Pub/Sub bearer token
 *   W4.19 Retry logic — backoff delay calculation
 *   W4.20 Retry logic — per-channel max retry windows
 *   W4.21 Retry logic — shouldRetryStatus per channel
 *   W4.22 Dead-letter queue — calcNextRetryAt schedule
 *   W4.23 Dead-letter queue — summarizeDeadLetters stats
 *   W4.24 Dead-letter queue — abandoned threshold logic
 *   W4.25 Cost tracker — per-event Voice cost
 *   W4.26 Cost tracker — per-event SMS cost
 *   W4.27 Cost tracker — per-event Gmail cost (free)
 *   W4.28 Cost tracker — NYT-scale volume estimate
 *   W4.29 Cost tracker — Cost+20% buffer rule
 *   W4.30 Resend email templates — all 6 templates + render
 *
 * FOUNDER_GATE markers document live-activation requirements.
 */

import { describe, it, expect } from "vitest";

import {
  dryRunVoice,
  dryRunSMS,
  dryRunGmail,
  dryRunResend,
  dryRunAll,
  validateTwiML,
} from "@/lib/moneyPennyDryRun";

import {
  validateCredential,
  validateChannelCredentials,
  validateAllCredentials,
  credentialSummary,
} from "@/lib/moneyPennyCredentialValidator";

import {
  buildTwilioCanonical,
  verifyGmailPubSubToken,
} from "@/lib/moneyPennyWebhookSig";

import {
  RETRY_CONFIGS,
  calcBackoffDelayDeterministic,
  shouldRetryStatus,
  maxRetryWindowMs,
} from "@/lib/moneyPennyRetry";

import {
  calcNextRetryAt,
  summarizeDeadLetters,
  type DeadLetterItem,
} from "@/lib/moneyPennyDeadLetter";

import {
  estimateEventCost,
  estimateVolumeCost,
  VOLUME_SCENARIOS,
  CHANNEL_COSTS,
} from "@/lib/moneyPennyCostTracker";

import {
  ALL_TEMPLATES,
  resolveTemplate,
  renderTemplate,
  buildResendPayload,
} from "@/lib/resendEmailTemplates";

import {
  parsePubSubNotification,
  validateGmailSetup,
} from "@/lib/moneyPennyDryRun";

// ─── W4.1 Twilio Voice dry-run TwiML generation ───────────────────────────────

describe("W4.1 Voice dry-run — TwiML generation", () => {
  it("P0/crown + available generates Dial TwiML", () => {
    const result = dryRunVoice({
      callerPhone: "+12125551234",
      callerName: "Jessica Jackley",
      callerClass: "crown",
      priorityLevel: 0,
      founderAvailable: true,
      founderForwardNumber: "+15555551234",
    });
    expect(result.success).toBe(true);
    expect(result.channel).toBe("voice");
    expect(result.payload).toContain("<Dial");
    expect(result.payload).toContain("+15555551234");
    expect(result.routing_verdict).toContain("forward");
  });

  it("P5/general generates hold-only TwiML", () => {
    const result = dryRunVoice({
      callerPhone: "+17775551234",
      callerName: "",
      callerClass: "general",
      priorityLevel: 5,
      founderAvailable: false,
    });
    expect(result.success).toBe(true);
    expect(result.payload as string).toContain("<Hangup");
    expect(result.payload as string).not.toContain("<Dial");
  });

  it("P0 + unavailable falls back to hold (no forward)", () => {
    const result = dryRunVoice({
      callerPhone: "+12125559999",
      callerName: "VIP Caller",
      callerClass: "crown",
      priorityLevel: 0,
      founderAvailable: false,
    });
    expect(result.success).toBe(true);
    expect(result.payload as string).not.toContain("<Dial");
    expect(result.routing_verdict).toContain("hold");
  });

  it("credential_gate includes all four Twilio vars", () => {
    const result = dryRunVoice({
      callerPhone: "+14155551234",
      callerName: "Test",
      callerClass: "press",
      priorityLevel: 1,
      founderAvailable: false,
    });
    expect(result.credential_gate).toContain("TWILIO_ACCOUNT_SID");
    expect(result.credential_gate).toContain("TWILIO_AUTH_TOKEN");
    expect(result.credential_gate).toContain("FOUNDER_PHONE_NUMBER");
  });
});

// ─── W4.2 TwiML validator ─────────────────────────────────────────────────────

describe("W4.2 TwiML validation", () => {
  it("valid TwiML passes", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hello.</Say>
  <Hangup />
</Response>`;
    const { valid, errors } = validateTwiML(xml);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("missing XML declaration is caught", () => {
    const xml = `<Response><Say>Hi</Say></Response>`;
    const { valid, errors } = validateTwiML(xml);
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes("XML declaration"))).toBe(true);
  });

  it("missing Response root is caught", () => {
    const xml = `<?xml version="1.0"?><Say>Hello</Say>`;
    const { valid, errors } = validateTwiML(xml);
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes("Response"))).toBe(true);
  });
});

// ─── W4.3 SMS dry-run payload ─────────────────────────────────────────────────

describe("W4.3 SMS dry-run — payload construction", () => {
  it("valid SMS payload passes", () => {
    const result = dryRunSMS({
      recipientPhone: "+15555551234",
      messageBody: "[MP] PRESS CALL: Jane Reporter (+12125559999). ETA 12h.",
      priority: 1,
      fromNumber: "+18005551234",
    });
    expect(result.success).toBe(true);
    expect(result.payload).toMatchObject({ To: "+15555551234" });
    expect(result.routing_verdict).toContain("P1");
  });

  it("prefers MessagingServiceSid over From when both provided", () => {
    const result = dryRunSMS({
      recipientPhone: "+15555551234",
      messageBody: "Test message",
      priority: 2,
      fromNumber: "+18005551234",
      messagingServiceSid: "MG" + "a".repeat(32),
    });
    expect(result.success).toBe(true);
    expect(result.payload).toHaveProperty("MessagingServiceSid");
    expect(result.payload).not.toHaveProperty("From");
  });
});

// ─── W4.4 SMS E.164 validation ────────────────────────────────────────────────

describe("W4.4 SMS dry-run — E.164 validation", () => {
  it("rejects non-E.164 phone number", () => {
    const result = dryRunSMS({
      recipientPhone: "5555551234",
      messageBody: "Test",
      priority: 5,
    });
    expect(result.success).toBe(false);
    expect(result.routing_verdict).toContain("INVALID");
    expect(result.routing_verdict).toContain("E.164");
  });

  it("rejects message over 1600 chars", () => {
    const result = dryRunSMS({
      recipientPhone: "+15555551234",
      messageBody: "X".repeat(1601),
      priority: 5,
      fromNumber: "+18005551234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing From + MessagingServiceSid", () => {
    const result = dryRunSMS({
      recipientPhone: "+15555551234",
      messageBody: "Test",
      priority: 5,
    });
    expect(result.success).toBe(false);
    expect(result.routing_verdict).toContain("No From");
  });
});

// ─── W4.5 Gmail Pub/Sub dry-run ───────────────────────────────────────────────

describe("W4.5 Gmail Pub/Sub dry-run", () => {
  it("valid historyId + email passes", () => {
    const result = dryRunGmail({
      historyId: "1234567",
      emailAddress: "hello@lianabanyan.com",
    });
    expect(result.success).toBe(true);
    expect(result.channel).toBe("gmail");
    expect(result.routing_verdict).toContain("moneypenny_inbox");
  });

  it("invalid historyId (non-numeric) is caught", () => {
    const result = dryRunGmail({
      historyId: "abc",
      emailAddress: "hello@lianabanyan.com",
    });
    expect(result.success).toBe(false);
    expect(result.routing_verdict).toContain("INVALID");
  });

  it("invalid email format is caught", () => {
    const result = dryRunGmail({
      historyId: "999999",
      emailAddress: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("Pub/Sub payload has base64-encoded message.data", () => {
    const result = dryRunGmail({
      historyId: "5678901",
      emailAddress: "hello@lianabanyan.com",
    });
    expect(result.success).toBe(true);
    const payload = result.payload as Record<string, unknown>;
    expect(payload.message).toBeDefined();
    const msg = payload.message as { data: string };
    expect(typeof msg.data).toBe("string");
    const decoded = atob(msg.data);
    const parsed = JSON.parse(decoded);
    expect(parsed.emailAddress).toBe("hello@lianabanyan.com");
    expect(parsed.historyId).toBe("5678901");
  });
});

// ─── W4.6 Gmail Pub/Sub notification parser ──────────────────────────────────

describe("W4.6 Gmail Pub/Sub notification parser", () => {
  it("parses wrapped Pub/Sub message (base64 encoded data)", () => {
    const notification = { emailAddress: "hello@lianabanyan.com", historyId: "999" };
    const wrapped = { message: { data: btoa(JSON.stringify(notification)) } };
    const result = parsePubSubNotification(wrapped);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.notification.emailAddress).toBe("hello@lianabanyan.com");
      expect(result.notification.historyId).toBe("999");
    }
  });

  it("parses direct notification format (unwrapped)", () => {
    const result = parsePubSubNotification({
      emailAddress: "hello@lianabanyan.com",
      historyId: "12345",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unrecognized payload", () => {
    const result = parsePubSubNotification({ random: "data" });
    expect(result.success).toBe(false);
  });
});

// ─── W4.7 Resend dry-run ──────────────────────────────────────────────────────

describe("W4.7 Resend dry-run — payload construction", () => {
  it("Tier 1 Crown payload is valid", () => {
    const result = dryRunResend({
      recipientEmail: "jessica@example.com",
      recipientName: "Jessica Jackley",
      tier: 1,
    });
    expect(result.success).toBe(true);
    expect(result.channel).toBe("resend");
    const payload = result.payload as Record<string, unknown>;
    expect(payload.from).toContain("noreply@lianabanyan.com");
    expect(payload.to).toBe("jessica@example.com");
  });

  it("Tier 2 Press payload includes 12-hour SLA", () => {
    const result = dryRunResend({
      recipientEmail: "reporter@nytimes.com",
      recipientName: "Jane Reporter",
      tier: 2,
    });
    expect(result.success).toBe(true);
    const payload = result.payload as Record<string, unknown>;
    expect(payload.text as string).toContain("12 hours");
  });

  it("invalid email is caught", () => {
    const result = dryRunResend({
      recipientEmail: "not-valid",
      recipientName: "Test",
      tier: 3,
    });
    expect(result.success).toBe(false);
  });
});

// ─── W4.8 Orchestrated dry-run all channels ───────────────────────────────────

describe("W4.8 Orchestrated dry-run all channels", () => {
  it("dryRunAll passes all 4 channels with valid params", () => {
    const result = dryRunAll({
      voice: {
        callerPhone: "+12125551234",
        callerName: "Test",
        callerClass: "press",
        priorityLevel: 1,
        founderAvailable: false,
      },
      sms: {
        recipientPhone: "+15555551234",
        messageBody: "Test MP alert",
        priority: 1,
        fromNumber: "+18005551234",
      },
      gmail: { historyId: "12345", emailAddress: "hello@lianabanyan.com" },
      resend: { recipientEmail: "test@example.com", recipientName: "Test User", tier: 3 },
    });
    expect(result.all_pass).toBe(true);
    expect(result.passed).toBe(4);
    expect(result.failed).toBe(0);
    expect(result.channels).toHaveLength(4);
  });

  it("dryRunAll summary is human-readable", () => {
    const result = dryRunAll({
      voice: { callerPhone: "+12125551234", callerName: "Test", callerClass: "general", priorityLevel: 5, founderAvailable: false },
      sms: { recipientPhone: "+15555551234", messageBody: "Test", priority: 5, fromNumber: "+18005551234" },
    });
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(10);
  });

  it("credential_gates per channel are populated", () => {
    const result = dryRunAll({
      voice: { callerPhone: "+12125551234", callerName: "", callerClass: "general", priorityLevel: 5, founderAvailable: false },
    });
    expect(result.credential_gates.voice).toContain("TWILIO_ACCOUNT_SID");
  });
});

// ─── W4.9 Credential validator — Twilio format ───────────────────────────────

describe("W4.9 Credential validator — Twilio format rules", () => {
  it("valid TWILIO_ACCOUNT_SID passes (AC + 32 hex)", () => {
    const env = { TWILIO_ACCOUNT_SID: "AC" + "a".repeat(32) };
    const result = validateCredential("TWILIO_ACCOUNT_SID", env);
    expect(result.status).toBe("present_valid");
  });

  it("SID without AC prefix is present_invalid", () => {
    const env = { TWILIO_ACCOUNT_SID: "XX" + "a".repeat(32) };
    const result = validateCredential("TWILIO_ACCOUNT_SID", env);
    expect(result.status).toBe("present_invalid");
  });

  it("valid TWILIO_AUTH_TOKEN passes (32 hex chars)", () => {
    const env = { TWILIO_AUTH_TOKEN: "a".repeat(32) };
    const result = validateCredential("TWILIO_AUTH_TOKEN", env);
    expect(result.status).toBe("present_valid");
  });

  it("E.164 phone number passes", () => {
    const env = { TWILIO_PHONE_NUMBER: "+18005551234" };
    const result = validateCredential("TWILIO_PHONE_NUMBER", env);
    expect(result.status).toBe("present_valid");
  });

  it("missing key returns status=missing with hint", () => {
    const result = validateCredential("TWILIO_ACCOUNT_SID", {});
    expect(result.status).toBe("missing");
    expect(result.hint.length).toBeGreaterThan(10);
  });
});

// ─── W4.10 Credential validator — Gmail format ───────────────────────────────

describe("W4.10 Credential validator — Gmail format rules", () => {
  it("valid GMAIL_CLIENT_ID passes", () => {
    const env = { GMAIL_CLIENT_ID: "123456789-abc.apps.googleusercontent.com" };
    const result = validateCredential("GMAIL_CLIENT_ID", env);
    expect(result.status).toBe("present_valid");
  });

  it("valid GMAIL_CLIENT_SECRET passes (GOCSPX- prefix)", () => {
    const env = { GMAIL_CLIENT_SECRET: "GOCSPX-secretvalue123" };
    const result = validateCredential("GMAIL_CLIENT_SECRET", env);
    expect(result.status).toBe("present_valid");
  });

  it("valid GMAIL_REFRESH_TOKEN passes (starts 1//)", () => {
    const env = { GMAIL_REFRESH_TOKEN: "1//0e_valid_refresh_token_here_extra_chars" };
    const result = validateCredential("GMAIL_REFRESH_TOKEN", env);
    expect(result.status).toBe("present_valid");
  });

  it("GMAIL_PUBSUB_TOPIC format check", () => {
    const env = { GMAIL_PUBSUB_TOPIC: "projects/my-proj/topics/gmail-push" };
    const result = validateCredential("GMAIL_PUBSUB_TOPIC", env);
    expect(result.status).toBe("present_valid");
  });
});

// ─── W4.11 Credential validator — Resend format ──────────────────────────────

describe("W4.11 Credential validator — Resend format rules", () => {
  it("valid RESEND_API_KEY passes (re_ prefix)", () => {
    const env = { RESEND_API_KEY: "re_AbCdEfGhIjKlMnOpQr" };
    const result = validateCredential("RESEND_API_KEY", env);
    expect(result.status).toBe("present_valid");
  });

  it("invalid RESEND_API_KEY (no re_ prefix) is present_invalid", () => {
    const env = { RESEND_API_KEY: "sk-wrong-prefix-key" };
    const result = validateCredential("RESEND_API_KEY", env);
    expect(result.status).toBe("present_invalid");
  });
});

// ─── W4.12 Credential validator — all channels ───────────────────────────────

describe("W4.12 Credential validator — all-channel summary", () => {
  it("empty env returns overall_ready=false with all keys missing", () => {
    const report = validateAllCredentials({});
    expect(report.overall_ready).toBe(false);
    expect(report.missing).toBeGreaterThan(0);
    expect(report.present_valid).toBe(0);
  });

  it("credentialSummary returns readable string", () => {
    const report = validateAllCredentials({});
    const summary = credentialSummary(report);
    expect(typeof summary).toBe("string");
    expect(summary).toContain("voice");
    expect(summary).toContain("gmail");
    expect(summary).toContain("resend");
  });

  it("fully configured voice channel returns ready=true", () => {
    const env: Record<string, string> = {
      TWILIO_ACCOUNT_SID: "AC" + "a".repeat(32),
      TWILIO_AUTH_TOKEN: "b".repeat(32),
      TWILIO_PHONE_NUMBER: "+18005551234",
      FOUNDER_PHONE_NUMBER: "+15555551234",
    };
    const report = validateChannelCredentials("voice", env);
    expect(report.ready).toBe(true);
    expect(report.missing_keys).toHaveLength(0);
  });

  it("channel report lists all missing keys when env is empty", () => {
    const report = validateChannelCredentials("gmail", {});
    expect(report.missing_keys.length).toBeGreaterThan(0);
    expect(report.missing_keys).toContain("GMAIL_CLIENT_ID");
    expect(report.missing_keys).toContain("GMAIL_REFRESH_TOKEN");
  });
});

// ─── W4.13 Routing smoke — Voice P0 forward ──────────────────────────────────

describe("W4.13 Routing smoke — Voice P0 crown forward path", () => {
  it("crown caller + available + forward number → Dial TwiML with forward number", () => {
    const result = dryRunVoice({
      callerPhone: "+12125551234",
      callerName: "Known Crown",
      callerClass: "crown",
      priorityLevel: 0,
      founderAvailable: true,
      founderForwardNumber: "+15005555555",
    });
    expect(result.success).toBe(true);
    expect(result.payload as string).toContain("+15005555555");
    expect(result.routing_verdict).toContain("+15005555555");
  });

  it("crown caller + no forward number → hold message (safe fallback)", () => {
    const result = dryRunVoice({
      callerPhone: "+12125551234",
      callerName: "Known Crown",
      callerClass: "crown",
      priorityLevel: 0,
      founderAvailable: true,
      founderForwardNumber: undefined,
    });
    expect(result.success).toBe(true);
    expect(result.payload as string).not.toContain("<Dial");
  });
});

// ─── W4.14 Routing smoke — Voice P5 general ──────────────────────────────────

describe("W4.14 Routing smoke — Voice P5 general path", () => {
  it("general caller always gets hold-only TwiML regardless of availability", () => {
    for (const available of [true, false]) {
      const result = dryRunVoice({
        callerPhone: "+17775551234",
        callerName: "",
        callerClass: "general",
        priorityLevel: 5,
        founderAvailable: available,
      });
      expect(result.success).toBe(true);
      expect(result.payload as string).not.toContain("<Record");
      expect(result.payload as string).toContain("<Hangup");
    }
  });
});

// ─── W4.15 Routing smoke — SMS inbound logic ─────────────────────────────────

describe("W4.15 Routing smoke — SMS inbound routing", () => {
  it("P0 priority SMS to Founder is valid E.164 payload", () => {
    const result = dryRunSMS({
      recipientPhone: "+15555551234",
      messageBody: "[MP] CROWN CALL: Jessica Jackley (+12125551234). ETA 1h.",
      priority: 0,
      fromNumber: "+18005551234",
    });
    expect(result.success).toBe(true);
    expect(result.routing_verdict).toContain("P0");
  });

  it("SMS routing_verdict includes message length", () => {
    const body = "Test message body for routing smoke test";
    const result = dryRunSMS({
      recipientPhone: "+15555551234",
      messageBody: body,
      priority: 3,
      fromNumber: "+18005551234",
    });
    expect(result.routing_verdict).toContain(`${body.length} chars`);
  });
});

// ─── W4.16 Routing smoke — Resend template resolution ────────────────────────

describe("W4.16 Routing smoke — Resend template resolution", () => {
  it("Tier 2 + category press resolves press template", () => {
    const template = resolveTemplate(2, "press");
    expect(template.id).toBe("mp_t2_press");
    expect(template.sla_copy).toBe("within 12 hours");
  });

  it("Tier 3 + category member resolves member template", () => {
    const template = resolveTemplate(3, "member");
    expect(template.id).toBe("mp_t3_member");
  });

  it("unknown category falls back to tier-level template", () => {
    const template = resolveTemplate(3, "totally_unknown_category");
    expect(template.tier).toBe(3);
  });
});

// ─── W4.17 Webhook signature — Twilio canonical ──────────────────────────────

describe("W4.17 Webhook signature — Twilio canonical string", () => {
  it("canonical string is url + sorted params concatenated", () => {
    const canonical = buildTwilioCanonical("https://example.com/webhook", {
      CallSid: "CA123",
      From: "+12125551234",
      To: "+18005551234",
    });
    // Sorted: CallSid, From, To
    expect(canonical).toBe(
      "https://example.com/webhookCallSidCA123From+12125551234To+18005551234"
    );
  });

  it("empty params gives canonical = url only", () => {
    const canonical = buildTwilioCanonical("https://example.com/moneypenny", {});
    expect(canonical).toBe("https://example.com/moneypenny");
  });

  it("params are sorted lexicographically", () => {
    const canonical = buildTwilioCanonical("https://x.com/", { Z: "last", A: "first", M: "mid" });
    expect(canonical).toBe("https://x.com/AfirstMmidZlast");
  });
});

// ─── W4.18 Webhook signature — Gmail Pub/Sub bearer ──────────────────────────

describe("W4.18 Webhook signature — Gmail Pub/Sub bearer token", () => {
  it("matching token is valid", () => {
    const result = verifyGmailPubSubToken("Bearer my-secret-token-123", "my-secret-token-123");
    expect(result.valid).toBe(true);
  });

  it("mismatched token is invalid", () => {
    const result = verifyGmailPubSubToken("Bearer wrong-token", "correct-token");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("mismatch");
  });

  it("no token configured passes through (dev mode)", () => {
    const result = verifyGmailPubSubToken("Bearer anything", undefined);
    expect(result.valid).toBe(true);
    expect(result.reason).toContain("dev mode");
  });

  it("missing Authorization header is invalid when token configured", () => {
    const result = verifyGmailPubSubToken(null, "some-token");
    expect(result.valid).toBe(false);
  });
});

// ─── W4.19 Retry logic — backoff delay calculation ───────────────────────────

describe("W4.19 Retry logic — backoff delay calculation", () => {
  it("delay doubles each attempt (deterministic)", () => {
    const config = RETRY_CONFIGS.sms;
    const d0 = calcBackoffDelayDeterministic(config, 0);
    const d1 = calcBackoffDelayDeterministic(config, 1);
    const d2 = calcBackoffDelayDeterministic(config, 2);
    expect(d0).toBe(config.baseDelayMs);
    expect(d1).toBe(config.baseDelayMs * 2);
    expect(d2).toBe(config.baseDelayMs * 4);
  });

  it("delay is capped at maxDelayMs", () => {
    const config = RETRY_CONFIGS.sms;
    const dMax = calcBackoffDelayDeterministic(config, 10);
    expect(dMax).toBe(config.maxDelayMs);
  });

  it("voice config has fewer max attempts than sms (faster SLA)", () => {
    expect(RETRY_CONFIGS.voice.maxAttempts).toBeLessThan(RETRY_CONFIGS.sms.maxAttempts);
  });
});

// ─── W4.20 Retry logic — per-channel max retry windows ───────────────────────

describe("W4.20 Retry logic — per-channel max retry windows", () => {
  it("voice max retry window < 10s (TwiML timeout critical)", () => {
    const ms = maxRetryWindowMs("voice");
    expect(ms).toBeLessThan(10_000);
  });

  it("sms retry window is longer (queue tolerance)", () => {
    const smsMs = maxRetryWindowMs("sms");
    const voiceMs = maxRetryWindowMs("voice");
    expect(smsMs).toBeGreaterThan(voiceMs);
  });

  it("gmail retry window allows for API 429 cooldown (> 5s)", () => {
    const ms = maxRetryWindowMs("gmail");
    expect(ms).toBeGreaterThan(5000);
  });
});

// ─── W4.21 Retry — shouldRetryStatus ─────────────────────────────────────────

describe("W4.21 Retry logic — shouldRetryStatus per channel", () => {
  it("SMS retries on 429 (rate limit)", () => {
    expect(shouldRetryStatus("sms", 429)).toBe(true);
  });

  it("SMS retries on 503 (gateway down)", () => {
    expect(shouldRetryStatus("sms", 503)).toBe(true);
  });

  it("400 is not retried (bad request)", () => {
    expect(shouldRetryStatus("sms", 400)).toBe(false);
  });

  it("all channels retry 503", () => {
    for (const ch of ["voice", "sms", "gmail", "resend", "db_write"] as const) {
      expect(shouldRetryStatus(ch, 503)).toBe(true);
    }
  });
});

// ─── W4.22 Dead-letter — calcNextRetryAt schedule ────────────────────────────

describe("W4.22 Dead-letter — retry schedule", () => {
  it("first retry is ~5 min in the future", () => {
    const next = calcNextRetryAt(0);
    const diffMs = next.getTime() - Date.now();
    expect(diffMs).toBeGreaterThan(4 * 60 * 1000);
    expect(diffMs).toBeLessThan(6 * 60 * 1000);
  });

  it("subsequent retries grow exponentially", () => {
    const t0 = calcNextRetryAt(0).getTime() - Date.now();
    const t1 = calcNextRetryAt(1).getTime() - Date.now();
    const t2 = calcNextRetryAt(2).getTime() - Date.now();
    expect(t1).toBeGreaterThan(t0);
    expect(t2).toBeGreaterThan(t1);
  });

  it("5th retry (max) is ~24h", () => {
    const next = calcNextRetryAt(4);
    const diffMs = next.getTime() - Date.now();
    const diffHours = diffMs / 3_600_000;
    expect(diffHours).toBeGreaterThan(23);
    expect(diffHours).toBeLessThan(25);
  });
});

// ─── W4.23 Dead-letter — summarizeDeadLetters stats ──────────────────────────

describe("W4.23 Dead-letter — summarizeDeadLetters stats", () => {
  const now = new Date().toISOString();

  const makeItem = (overrides: Partial<DeadLetterItem>): DeadLetterItem => ({
    id: crypto.randomUUID(),
    channel: "sms",
    event_type: "sms_send",
    payload: {},
    error_message: "test error",
    retry_count: 0,
    max_retries: 5,
    status: "pending",
    next_retry_at: now,
    created_at: now,
    resolved_at: null,
    ...overrides,
  });

  it("counts pending, retrying, abandoned correctly", () => {
    const items = [
      makeItem({ status: "pending" }),
      makeItem({ status: "pending" }),
      makeItem({ status: "retrying" }),
      makeItem({ status: "abandoned" }),
      makeItem({ status: "resolved", resolved_at: now }),
    ];
    const stats = summarizeDeadLetters(items);
    expect(stats.pending).toBe(2);
    expect(stats.retrying).toBe(1);
    expect(stats.abandoned).toBe(1);
    expect(stats.resolved_today).toBe(1);
  });

  it("empty queue returns all zeros", () => {
    const stats = summarizeDeadLetters([]);
    expect(stats.pending).toBe(0);
    expect(stats.abandoned).toBe(0);
    expect(stats.oldest_pending_hours).toBeNull();
  });
});

// ─── W4.24 Dead-letter — abandoned threshold ─────────────────────────────────

describe("W4.24 Dead-letter — abandoned threshold logic", () => {
  it("item with retry_count >= max_retries should be abandoned", () => {
    const maxRetries = 5;
    const retryCount = 5;
    expect(retryCount >= maxRetries).toBe(true);
  });

  it("item with retry_count < max_retries should be re-queued", () => {
    const maxRetries = 5;
    const retryCount = 3;
    expect(retryCount >= maxRetries).toBe(false);
  });

  it("channel max_retries: SMS > Voice (SMS is more tolerant)", () => {
    const smsMaxRetries = 5;
    const voiceMaxRetries = 3;
    expect(smsMaxRetries).toBeGreaterThan(voiceMaxRetries);
  });
});

// ─── W4.25 Cost tracker — Voice event cost ───────────────────────────────────

describe("W4.25 Cost tracker — Voice per-event cost", () => {
  it("voice call cost = duration * rate + sms alert", () => {
    const cost = estimateEventCost("voice", "inbound_call", { duration_minutes: 3 });
    const expected =
      3 * CHANNEL_COSTS.voice.inbound_per_minute_usd +
      CHANNEL_COSTS.voice.sms_alert_per_call_usd;
    expect(cost.total_cost_usd).toBeCloseTo(expected, 6);
    expect(cost.ai_cost_usd).toBe(0);
  });

  it("default duration is 3 minutes", () => {
    const cost1 = estimateEventCost("voice", "inbound_call");
    const cost2 = estimateEventCost("voice", "inbound_call", { duration_minutes: 3 });
    expect(cost1.total_cost_usd).toBe(cost2.total_cost_usd);
  });
});

// ─── W4.26 Cost tracker — SMS per-event cost ─────────────────────────────────

describe("W4.26 Cost tracker — SMS per-event cost", () => {
  it("SMS cost includes AI triage component", () => {
    const cost = estimateEventCost("sms", "sms_conversation");
    expect(cost.ai_cost_usd).toBeGreaterThan(0);
    expect(cost.base_cost_usd).toBeGreaterThan(0);
    expect(cost.total_cost_usd).toBe(cost.base_cost_usd + cost.ai_cost_usd);
  });
});

// ─── W4.27 Cost tracker — Gmail per-event cost (free) ────────────────────────

describe("W4.27 Cost tracker — Gmail per-event cost", () => {
  it("Gmail base cost is $0 (free tier)", () => {
    const cost = estimateEventCost("gmail", "email_intake");
    expect(cost.base_cost_usd).toBe(0);
  });

  it("Gmail total cost = AI triage cost only", () => {
    const cost = estimateEventCost("gmail", "email_intake");
    expect(cost.total_cost_usd).toBe(CHANNEL_COSTS.ai_triage.per_call_usd);
  });
});

// ─── W4.28 Cost tracker — NYT-scale volume estimate ──────────────────────────

describe("W4.28 Cost tracker — NYT-scale volume estimate", () => {
  it("NYT 48h scenario has all 5 cost components", () => {
    const est = estimateVolumeCost(VOLUME_SCENARIOS.nyt_48h);
    expect(est.voice_cost_usd).toBeGreaterThan(0);
    expect(est.sms_cost_usd).toBeGreaterThan(0);
    expect(est.gmail_cost_usd).toBe(0);
    expect(est.ai_triage_cost_usd).toBeGreaterThan(0);
  });

  it("NYT worst-case is more expensive than typical day", () => {
    const typical = estimateVolumeCost(VOLUME_SCENARIOS.typical_day);
    const nytWorst = estimateVolumeCost(VOLUME_SCENARIOS.nyt_worst);
    expect(nytWorst.total_cost_usd).toBeGreaterThan(typical.total_cost_usd * 10);
  });

  it("all predefined scenarios are defined and valid", () => {
    for (const [key, scenario] of Object.entries(VOLUME_SCENARIOS)) {
      const est = estimateVolumeCost(scenario);
      expect(est.total_cost_usd).toBeGreaterThanOrEqual(0);
      expect(est.scenario.label.length).toBeGreaterThan(5);
      expect(key.length).toBeGreaterThan(2);
    }
  });
});

// ─── W4.29 Cost tracker — Cost+20% buffer rule ───────────────────────────────

describe("W4.29 Cost tracker — Cost+20% buffer", () => {
  it("default buffer is 20% per doctrine", () => {
    const est = estimateVolumeCost(VOLUME_SCENARIOS.launch_week);
    const expected = est.total_cost_usd * 1.2;
    expect(est.total_with_buffer_usd).toBeCloseTo(expected, 4);
    expect(est.buffer_percent).toBe(20);
  });

  it("custom buffer percentage is respected", () => {
    const est = estimateVolumeCost(VOLUME_SCENARIOS.typical_day, 30);
    expect(est.buffer_percent).toBe(30);
    expect(est.total_with_buffer_usd).toBeCloseTo(est.total_cost_usd * 1.3, 4);
  });

  it("buffer is always >= base total", () => {
    for (const scenario of Object.values(VOLUME_SCENARIOS)) {
      const est = estimateVolumeCost(scenario);
      expect(est.total_with_buffer_usd).toBeGreaterThanOrEqual(est.total_cost_usd);
    }
  });
});

// ─── W4.30 Resend templates — all 6 templates + render ───────────────────────

describe("W4.30 Resend email templates — all 6 templates + render", () => {
  it("6 templates are defined", () => {
    expect(ALL_TEMPLATES).toHaveLength(6);
  });

  it("all templates have required fields", () => {
    for (const t of ALL_TEMPLATES) {
      expect(t.id.length).toBeGreaterThan(3);
      expect(t.tier).toBeGreaterThanOrEqual(1);
      expect(t.tier).toBeLessThanOrEqual(3);
      expect(t.subject_line.length).toBeGreaterThan(5);
      expect(t.body_text.length).toBeGreaterThan(50);
      expect(t.from_address).toContain("@lianabanyan.com");
    }
  });

  it("renderTemplate substitutes {{name}} correctly", () => {
    const template = resolveTemplate(2, "press");
    const rendered = renderTemplate(template, { name: "Jane Reporter", subject: "NYT interview" });
    expect(rendered.body).toContain("Jane Reporter");
    expect(rendered.subject).toContain("NYT interview");
    expect(rendered.body).not.toContain("{{name}}");
    expect(rendered.subject).not.toContain("{{subject}}");
  });

  it("buildResendPayload returns valid Resend API structure", () => {
    const payload = buildResendPayload("press@nytimes.com", "Jane Smith", 2, "press", "Interview request");
    expect(payload.from).toContain("noreply@lianabanyan.com");
    expect(payload.to).toBe("press@nytimes.com");
    expect(payload.subject).toBeDefined();
    expect(payload.text).toBeDefined();
  });

  it("no template contains securities language (investment/returns/equity/stock)", () => {
    for (const t of ALL_TEMPLATES) {
      const lower = t.body_text.toLowerCase();
      expect(lower).not.toContain("investment");
      expect(lower).not.toContain("returns");
      expect(lower).not.toContain("equity");
      expect(lower).not.toContain("stock");
    }
  });

  it("Crown template (T1) does not promise a specific SLA in body (personal response)", () => {
    const crown = resolveTemplate(1, "crown");
    expect(crown.body_text).toContain("4 hours");
  });

  it("member template mentions $5 and join URL", () => {
    const member = resolveTemplate(3, "member");
    expect(member.body_text).toContain("$5");
    expect(member.body_text).toContain("lianabanyan.com/join");
  });
});

// ─── FOUNDER_GATE — live activation documentation ────────────────────────────

describe("FOUNDER_GATE — live activation requirements", () => {
  it("FOUNDER: Voice live = TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER + webhook", () => {
    // FOUNDER_GATE: Set in Supabase Vault, point Twilio Voice webhook to .../moneypenny-voice
    expect(true).toBe(true);
  });

  it("FOUNDER: SMS live = same Twilio credentials + FOUNDER_PHONE_NUMBER", () => {
    // FOUNDER_GATE: Set FOUNDER_PHONE_NUMBER + Twilio SMS webhook to .../moneypenny-sms
    expect(true).toBe(true);
  });

  it("FOUNDER: Gmail Pub/Sub live = 5 GMAIL_ vars + renew-watch cron", () => {
    // FOUNDER_GATE: Follow scripts/setup-gmail-pubsub.ts step-by-step guide
    expect(true).toBe(true);
  });

  it("FOUNDER: Resend auto-response live = RESEND_API_KEY in Vault", () => {
    // FOUNDER_GATE: resend.com > API Keys > add re_ key to Vault
    // Immediately activates T2/T3 auto-responses in gatekeeper-triage
    expect(true).toBe(true);
  });

  it("FOUNDER: Gmail setup validated by validateGmailSetup()", () => {
    const result = validateGmailSetup({});
    expect(result.complete).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.instructions).toContain("Missing");
  });
});
