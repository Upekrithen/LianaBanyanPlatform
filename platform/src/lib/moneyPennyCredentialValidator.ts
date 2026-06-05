/**
 * MoneyPenny Credential Validator — BP073 Wave 4 · W4.5
 * ======================================================
 * Checks that env vars exist AND are correctly formatted.
 * Returns a per-channel, per-variable report — not just "missing."
 *
 * Used by:
 *   - The dry-run harness (offline, zero API calls)
 *   - The channel health dashboard
 *   - The Wave 4 test suite
 *
 * Validation rules (format-only, not live calls):
 *   TWILIO_ACCOUNT_SID     — starts with "AC", 34 chars total
 *   TWILIO_AUTH_TOKEN      — 32 hex chars
 *   TWILIO_PHONE_NUMBER    — E.164 (+1...)
 *   FOUNDER_PHONE_NUMBER   — E.164
 *   GMAIL_CLIENT_ID        — ends with ".apps.googleusercontent.com"
 *   GMAIL_CLIENT_SECRET    — "GOCSPX-" prefix (OAuth desktop secret)
 *   GMAIL_REFRESH_TOKEN    — starts with "1//" or "1/"
 *   RESEND_API_KEY         — starts with "re_"
 *   ANTHROPIC_API_KEY      — starts with "sk-ant-"
 *
 * FOUNDER: set these in Supabase Dashboard > Vault before activating channels.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type CredentialStatus = "present_valid" | "present_invalid" | "missing";

export interface CredentialCheck {
  key: string;
  status: CredentialStatus;
  hint: string;
}

export type ChannelCredentialReport = {
  channel: string;
  ready: boolean;
  checks: CredentialCheck[];
  missing_keys: string[];
  invalid_keys: string[];
};

export type AllCredentialReport = {
  overall_ready: boolean;
  channels: ChannelCredentialReport[];
  total_keys: number;
  present_valid: number;
  present_invalid: number;
  missing: number;
};

// ─── Format Validators ───────────────────────────────────────────────────────

const FORMAT_RULES: Record<string, { test: (v: string) => boolean; hint: string }> = {
  TWILIO_ACCOUNT_SID: {
    test: (v) => /^AC[0-9a-f]{32}$/.test(v),
    hint: "Must start with 'AC' followed by 32 hex chars (total 34 chars). Found in Twilio Console dashboard.",
  },
  TWILIO_AUTH_TOKEN: {
    test: (v) => /^[0-9a-f]{32}$/.test(v),
    hint: "Must be 32 hex characters. Found in Twilio Console dashboard next to Account SID.",
  },
  TWILIO_PHONE_NUMBER: {
    test: (v) => /^\+[1-9]\d{6,14}$/.test(v),
    hint: "Must be E.164 format (e.g. +18005551234). Buy from Twilio Console > Phone Numbers.",
  },
  TWILIO_MESSAGING_SERVICE_SID: {
    test: (v) => /^MG[0-9a-f]{32}$/.test(v),
    hint: "Optional. Starts with 'MG'. Create in Twilio Console > Messaging > Services.",
  },
  FOUNDER_PHONE_NUMBER: {
    test: (v) => /^\+[1-9]\d{6,14}$/.test(v),
    hint: "Must be E.164 (e.g. +15555551234). Your personal cell for P0/P1 call forwarding.",
  },
  FOUNDER_VOICE_FORWARD_NUMBER: {
    test: (v) => /^\+[1-9]\d{6,14}$/.test(v),
    hint: "Optional. E.164 number to forward P0 crown calls to. Defaults to FOUNDER_PHONE_NUMBER.",
  },
  GMAIL_CLIENT_ID: {
    test: (v) => v.endsWith(".apps.googleusercontent.com") && v.length > 30,
    hint: "Ends with '.apps.googleusercontent.com'. From GCP Console > APIs & Services > OAuth 2.0 Client IDs.",
  },
  GMAIL_CLIENT_SECRET: {
    test: (v) => v.startsWith("GOCSPX-") && v.length > 10,
    hint: "Starts with 'GOCSPX-'. From same GCP OAuth 2.0 Client ID page as GMAIL_CLIENT_ID.",
  },
  GMAIL_REFRESH_TOKEN: {
    test: (v) => (v.startsWith("1//") || v.startsWith("1/")) && v.length > 20,
    hint: "Starts with '1//' or '1/'. Obtained via OAuth2 flow (see scripts/setup-gmail-pubsub.ts).",
  },
  GMAIL_WATCH_EMAIL: {
    test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    hint: "The Gmail address being watched (e.g. hello@lianabanyan.com).",
  },
  GMAIL_PUBSUB_TOPIC: {
    test: (v) => v.startsWith("projects/") && v.includes("/topics/"),
    hint: "Format: projects/<project-id>/topics/<topic-name>. Create in GCP Pub/Sub console.",
  },
  RESEND_API_KEY: {
    test: (v) => v.startsWith("re_") && v.length > 10,
    hint: "Starts with 're_'. From resend.com Dashboard > API Keys. Free tier: 100 emails/day.",
  },
  ANTHROPIC_API_KEY: {
    test: (v) => v.startsWith("sk-ant-") && v.length > 20,
    hint: "Starts with 'sk-ant-'. From console.anthropic.com > API Keys.",
  },
};

// ─── Core Validator ──────────────────────────────────────────────────────────

/**
 * Validate a single credential against its format rule.
 * env is a flat key-value record (from process.env or Deno.env).
 */
export function validateCredential(
  key: string,
  env: Record<string, string | undefined>,
): CredentialCheck {
  const value = env[key];
  const rule = FORMAT_RULES[key];

  if (!value) {
    return {
      key,
      status: "missing",
      hint: rule?.hint ?? "Set this value in Supabase Vault (Dashboard > Vault).",
    };
  }

  if (rule && !rule.test(value)) {
    return {
      key,
      status: "present_invalid",
      hint: `Value present but format incorrect. ${rule.hint}`,
    };
  }

  return {
    key,
    status: "present_valid",
    hint: "OK",
  };
}

// ─── Per-Channel Validators ──────────────────────────────────────────────────

const CHANNEL_KEYS: Record<string, string[]> = {
  voice: [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "FOUNDER_PHONE_NUMBER",
  ],
  sms: [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "FOUNDER_PHONE_NUMBER",
  ],
  gmail: [
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REFRESH_TOKEN",
    "GMAIL_WATCH_EMAIL",
    "GMAIL_PUBSUB_TOPIC",
  ],
  resend: ["RESEND_API_KEY"],
  ai_triage: ["ANTHROPIC_API_KEY"],
};

/**
 * W4.5 — Validate credentials for a single channel.
 *
 * FOUNDER: these are the exact keys to add to Supabase Vault per channel.
 */
export function validateChannelCredentials(
  channel: string,
  env: Record<string, string | undefined>,
): ChannelCredentialReport {
  const keys = CHANNEL_KEYS[channel] ?? [];
  const checks = keys.map(k => validateCredential(k, env));

  const missing_keys = checks.filter(c => c.status === "missing").map(c => c.key);
  const invalid_keys = checks.filter(c => c.status === "present_invalid").map(c => c.key);
  const ready = missing_keys.length === 0 && invalid_keys.length === 0;

  return { channel, ready, checks, missing_keys, invalid_keys };
}

/**
 * W4.5 — Validate ALL channel credentials in one pass.
 * Returns an overall report used by the channel health dashboard.
 */
export function validateAllCredentials(
  env: Record<string, string | undefined>,
): AllCredentialReport {
  const channelReports = Object.keys(CHANNEL_KEYS).map(ch =>
    validateChannelCredentials(ch, env),
  );

  const allChecks = channelReports.flatMap(r => r.checks);
  const present_valid = allChecks.filter(c => c.status === "present_valid").length;
  const present_invalid = allChecks.filter(c => c.status === "present_invalid").length;
  const missing = allChecks.filter(c => c.status === "missing").length;
  const overall_ready = channelReports.every(r => r.ready);

  return {
    overall_ready,
    channels: channelReports,
    total_keys: allChecks.length,
    present_valid,
    present_invalid,
    missing,
  };
}

/**
 * Quick summary for display in dashboard / logs.
 * Returns human-readable string like "voice: READY | sms: 2 missing | gmail: 3 missing | resend: 1 missing"
 */
export function credentialSummary(report: AllCredentialReport): string {
  return report.channels
    .map(ch => {
      if (ch.ready) return `${ch.channel}: READY`;
      const issues = ch.missing_keys.length + ch.invalid_keys.length;
      return `${ch.channel}: ${issues} key(s) needed`;
    })
    .join(" | ");
}
