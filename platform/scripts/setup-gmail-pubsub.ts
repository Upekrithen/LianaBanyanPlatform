/**
 * Gmail Pub/Sub Subscription Setup — BP073 Wave 4 · W4.3
 * =======================================================
 * Step-by-step guide and helper functions for Founder to activate
 * Gmail Push notifications -> Supabase Edge Function pipeline.
 *
 * FOUNDER_GATE: Run this script only after completing the OAuth flow.
 * This file is a reference guide + runnable setup helper.
 *
 * Prerequisites:
 *   1. Google Cloud Project (same project as your service account)
 *   2. Gmail API enabled in GCP Console
 *   3. Google Cloud Pub/Sub API enabled
 *   4. OAuth 2.0 credentials for Desktop app (for initial token generation)
 *
 * Steps (run once):
 *   A. Create Pub/Sub topic
 *   B. Grant Gmail service account publish permissions on the topic
 *   C. Create push subscription (points to gmail-bridge Edge Function URL)
 *   D. Run OAuth2 flow to get refresh token
 *   E. Run gmail.users.watch to register the inbox push notification
 *   F. Add all secrets to Supabase Vault
 *   G. Set up weekly watch renewal (Supabase scheduled function)
 *
 * After setup, Gmail watches expire after 7 days.
 * Schedule weekly renewal: POST /gmail-bridge?action=renew-watch
 *
 * NOTE: This script documents the setup. The actual OAuth flow must be
 * run interactively by the Founder (it requires browser consent).
 * The gmail-bridge Edge Function handles all ongoing operation.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

export interface GmailPubSubSetupConfig {
  gcpProjectId: string;
  pubsubTopicName: string;
  pubsubSubscriptionName: string;
  gmailWatchEmail: string;
  supabaseEdgeFunctionUrl: string;
  labelIds: string[];
}

export const DEFAULT_CONFIG: GmailPubSubSetupConfig = {
  gcpProjectId: "lianabanyan-403dc",
  pubsubTopicName: "gmail-push",
  pubsubSubscriptionName: "gmail-push-sub",
  gmailWatchEmail: "hello@lianabanyan.com",
  supabaseEdgeFunctionUrl: "https://<SUPABASE_PROJECT>.supabase.co/functions/v1/gmail-bridge",
  labelIds: ["INBOX"],
};

// ─── Step-by-Step Guide ───────────────────────────────────────────────────────

export function printSetupGuide(config: GmailPubSubSetupConfig = DEFAULT_CONFIG): string {
  const topicFull = `projects/${config.gcpProjectId}/topics/${config.pubsubTopicName}`;
  const subFull = `projects/${config.gcpProjectId}/subscriptions/${config.pubsubSubscriptionName}`;

  return `
=== Gmail Pub/Sub Setup Guide — Wave 4 ===
FOUNDER_GATE: Complete these steps to activate Gmail -> MoneyPenny pipeline.

STEP A — Create Pub/Sub topic:
  gcloud pubsub topics create ${config.pubsubTopicName} --project=${config.gcpProjectId}

STEP B — Grant Gmail service account publish permission:
  gcloud pubsub topics add-iam-policy-binding ${topicFull} \\
    --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \\
    --role="roles/pubsub.publisher"

STEP C — Create push subscription (points to gmail-bridge):
  gcloud pubsub subscriptions create ${config.pubsubSubscriptionName} \\
    --topic=${topicFull} \\
    --push-endpoint=${config.supabaseEdgeFunctionUrl} \\
    --ack-deadline=60 \\
    --message-retention-duration=7d \\
    --project=${config.gcpProjectId}

STEP D — OAuth2 flow (run interactively in browser):
  1. Go to GCP Console > APIs & Services > OAuth consent screen
  2. Create OAuth 2.0 Client ID (Desktop app type)
  3. Download client_secret.json
  4. Run: npx ts-node scripts/setup-gmail-pubsub.ts --oauth
     (opens browser for consent, writes refresh token to stdout)
  5. Copy refresh token to Supabase Vault as GMAIL_REFRESH_TOKEN

STEP E — Register Gmail watch (after OAuth):
  curl -X POST https://<SUPABASE_PROJECT>.supabase.co/functions/v1/gmail-bridge?action=renew-watch \\
    -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"

  OR call directly via Gmail API:
  POST https://gmail.googleapis.com/gmail/v1/users/${config.gmailWatchEmail}/watch
  Body: { "topicName": "${topicFull}", "labelIds": ${JSON.stringify(config.labelIds)} }

STEP F — Add secrets to Supabase Vault:
  GMAIL_CLIENT_ID          (from GCP OAuth2 client)
  GMAIL_CLIENT_SECRET      (from GCP OAuth2 client)
  GMAIL_REFRESH_TOKEN      (from Step D OAuth flow)
  GMAIL_WATCH_EMAIL        = ${config.gmailWatchEmail}
  GMAIL_PUBSUB_TOPIC       = ${topicFull}

STEP G — Schedule weekly watch renewal:
  In Supabase Dashboard > Database > Cron jobs:
    Name: gmail-watch-renewal
    Schedule: 0 0 * * 0  (every Sunday at midnight UTC)
    HTTP POST: .../gmail-bridge?action=renew-watch

SUBSCRIPTION DETAILS:
  Topic:        ${topicFull}
  Subscription: ${subFull}
  Push URL:     ${config.supabaseEdgeFunctionUrl}
  Watch email:  ${config.gmailWatchEmail}
  Label filter: ${config.labelIds.join(", ")}
  Watch expiry: 7 days (auto-renewed by cron)

STATUS: PARTIAL (code wired, credentials needed)
`.trim();
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

export interface SetupValidationResult {
  complete: boolean;
  missing: string[];
  instructions: string;
}

/**
 * Validate that all required Gmail Pub/Sub env vars are present.
 * Used by the credential validator and channel health dashboard.
 *
 * FOUNDER: these are the 5 vars to add to Supabase Vault.
 */
export function validateGmailSetup(
  env: Record<string, string | undefined>,
  config: GmailPubSubSetupConfig = DEFAULT_CONFIG,
): SetupValidationResult {
  const required: Record<string, string> = {
    GMAIL_CLIENT_ID: "From GCP Console > APIs & Services > OAuth 2.0 Client IDs",
    GMAIL_CLIENT_SECRET: "From same GCP OAuth2 client page",
    GMAIL_REFRESH_TOKEN: "From OAuth2 consent flow (run scripts/setup-gmail-pubsub.ts --oauth)",
    GMAIL_WATCH_EMAIL: `The inbox being watched (e.g. ${config.gmailWatchEmail})`,
    GMAIL_PUBSUB_TOPIC: `The Pub/Sub topic ARN (projects/${config.gcpProjectId}/topics/${config.pubsubTopicName})`,
  };

  const missing: string[] = [];
  for (const key of Object.keys(required)) {
    if (!env[key]) missing.push(`${key}: ${required[key]}`);
  }

  return {
    complete: missing.length === 0,
    missing,
    instructions: missing.length === 0
      ? "Gmail Pub/Sub fully configured."
      : `Missing ${missing.length} credential(s). See MONEYPENNY_INTEGRATION.md Step 3 for details.`,
  };
}

// ─── Pub/Sub Message Parser ───────────────────────────────────────────────────

export interface PubSubNotification {
  emailAddress: string;
  historyId: string;
}

/**
 * Parse a Gmail Pub/Sub push notification payload.
 * The data field is base64-encoded JSON.
 */
export function parsePubSubNotification(
  rawBody: Record<string, unknown>,
): { success: true; notification: PubSubNotification } | { success: false; error: string } {
  try {
    const message = rawBody?.message as { data?: string } | undefined;
    if (message?.data) {
      const decoded = atob(message.data);
      const parsed = JSON.parse(decoded) as PubSubNotification;
      if (!parsed.emailAddress || !parsed.historyId) {
        return { success: false, error: "Decoded Pub/Sub message missing emailAddress or historyId" };
      }
      return { success: true, notification: parsed };
    }
    const direct = rawBody as PubSubNotification;
    if (direct.emailAddress && direct.historyId) {
      return { success: true, notification: direct };
    }
    return { success: false, error: "Unrecognized Pub/Sub payload format" };
  } catch (err) {
    return {
      success: false,
      error: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
