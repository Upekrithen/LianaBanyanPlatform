/**
 * Stripe E2E Test Harness -- BP073 Wave 5 / Phase alpha
 * =======================================================
 * Instruments the membership checkout -> webhook -> DB activation trace.
 *
 * MODES:
 *   --test-mode  (DEFAULT) Run with Stripe test keys (cs_test_... sessions).
 *                Test card: 4242 4242 4242 4242, any future expiry, any CVC.
 *                Full trace green in test mode. SAFE TO RUN.
 *
 *   --live       HELD FOR FOUNDER. Runs with live Stripe key (cs_live_...).
 *                NEVER execute without Founder present and explicit unlock.
 *
 * TRACE POINTS (T1-T8, in order):
 *   T1. create-membership-checkout edge function called
 *   T2. Stripe checkout session created (cs_test_... in test mode)
 *   T3. Test card payment completed (Stripe test card 4242...)
 *   T4. Stripe sends webhook: checkout.session.completed
 *   T5. handle-membership-webhook edge function receives event
 *   T6. membership_payments row status = 'completed'
 *   T7. user_credits.membership_stake_paid = true
 *   T8. /membership-success page loads with session_id param
 *
 * HOLD: Live charge = HELD FOR FOUNDER. The --live flag is staged but
 * never executed by automated CI. Founder runs manually with own session.
 *
 * Usage:
 *   npx tsx platform/scripts/stripe-e2e-harness.ts
 *   npx tsx platform/scripts/stripe-e2e-harness.ts --test-mode
 *   npx tsx platform/scripts/stripe-e2e-harness.ts --check-db <userId> <sessionId>
 *   npx tsx platform/scripts/stripe-e2e-harness.ts --check-db <userId> <sessionId> --test-mode
 *
 * HELD (never run in CI):
 *   npx tsx platform/scripts/stripe-e2e-harness.ts --live
 *
 * Environment:
 *   SUPABASE_URL              -- required for --check-db
 *   SUPABASE_SERVICE_ROLE_KEY -- required for --check-db
 *   STRIPE_SECRET_KEY         -- sk_test_... for test mode; sk_live_... for live (HELD)
 */

// ─── Trace point definitions ─────────────────────────────────────────────────

interface TracePoint {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly validation: string;
  readonly liveOnly?: boolean;
}

const TRACE_POINTS_TEST: TracePoint[] = [
  {
    id: "T1",
    label: "create-membership-checkout called",
    description:
      "Authenticated POST to /functions/v1/create-membership-checkout with user JWT. " +
      "Expected: HTTP 200 + { url: 'https://checkout.stripe.com/...' }",
    validation:
      "Check that session URL is non-empty and begins with https://checkout.stripe.com. " +
      "Session ID must start with cs_test_ (test mode).",
  },
  {
    id: "T2",
    label: "Stripe checkout session created (test mode)",
    description:
      "Stripe creates a checkout session in TEST mode. " +
      "Session ID format: cs_test_... " +
      "DB: membership_payments row inserted with status='pending'",
    validation:
      "SELECT * FROM membership_payments WHERE stripe_session_id = '<cs_test_session_id>'",
  },
  {
    id: "T3",
    label: "Test card payment completed",
    description:
      "Complete the $5 payment on the Stripe hosted checkout page " +
      "using Stripe test card: 4242 4242 4242 4242, any future expiry (e.g. 12/34), CVC: 123. " +
      "The page redirects to /membership-success?session_id=<id>.",
    validation:
      "Manual -- confirm redirect and success page renders. " +
      "No real card required. No real charge occurs.",
  },
  {
    id: "T4",
    label: "Stripe sends webhook: checkout.session.completed",
    description:
      "Stripe POSTs checkout.session.completed to " +
      "/functions/v1/handle-membership-webhook. " +
      "Webhook must be registered in Stripe Dashboard for TEST mode " +
      "OR use: stripe listen --forward-to <webhook_url> (CLI)",
    validation:
      "Stripe Dashboard > Webhooks > Test Events. " +
      "Confirm checkout.session.completed delivered with 200 response. " +
      "OR: check output of 'stripe listen' CLI.",
  },
  {
    id: "T5",
    label: "handle-membership-webhook processes event",
    description:
      "Edge function verifies Stripe webhook signature (HMAC-SHA256), extracts " +
      "metadata.user_id and metadata.type='membership', then updates the DB.",
    validation:
      "Check Supabase Edge Function logs for '[MembershipWebhook] Payment record updated'. " +
      "STRIPE_WEBHOOK_SECRET must be the test-mode webhook signing secret.",
  },
  {
    id: "T6",
    label: "membership_payments row status = completed",
    description: "membership_payments.status changes from 'pending' to 'completed'.",
    validation:
      "SELECT status FROM membership_payments WHERE stripe_session_id = '<cs_test_id>' " +
      "-- expect: 'completed'. Run: npx tsx stripe-e2e-harness.ts --check-db <userId> <sessionId>",
  },
  {
    id: "T7",
    label: "user_credits.membership_stake_paid = true",
    description:
      "After webhook processing, the user's credits row is updated. " +
      "Subsequent calls to create-membership-checkout return 400 'already paid'.",
    validation:
      "SELECT membership_stake_paid FROM user_credits WHERE user_id = '<user_id>' " +
      "-- expect: true. Run: npx tsx stripe-e2e-harness.ts --check-db <userId> <sessionId>",
  },
  {
    id: "T8",
    label: "/membership-success page loads",
    description:
      "Browser redirects to /membership-success?session_id=<cs_test_id>. " +
      "Page verifies payment via verify-membership-payment edge function " +
      "and renders the success state.",
    validation:
      "Manual -- confirm success page loads and displays membership confirmation. " +
      "Marks balance should show 'pending approval' (manual gate, rate HELD FOR FOUNDER).",
  },
];

const TRACE_POINTS_LIVE: TracePoint[] = TRACE_POINTS_TEST.map((tp) => ({
  ...tp,
  description: tp.description
    .replace("TEST mode", "LIVE mode")
    .replace("cs_test_", "cs_live_")
    .replace("test card: 4242 4242 4242 4242, any future expiry (e.g. 12/34), CVC: 123", "REAL CARD")
    .replace("No real card required. No real charge occurs.", "REAL CHARGE WILL OCCUR. FOUNDER CONFIRMS."),
  validation: tp.validation
    .replace("cs_test_", "cs_live_")
    .replace("Test Events", "Events"),
  liveOnly: true,
}));

// ─── DB state checker (--check-db flag) ──────────────────────────────────────

async function checkDbState(
  userId: string,
  sessionId: string,
  testMode: boolean,
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running --check-db",
    );
    process.exit(1);
  }

  const modeLabel = testMode ? "TEST MODE" : "LIVE MODE";
  const expectedPrefix = testMode ? "cs_test_" : "cs_live_";

  if (!sessionId.startsWith(expectedPrefix)) {
    console.warn(
      `[WARN] Session ID '${sessionId}' does not start with '${expectedPrefix}' ` +
      `for ${modeLabel}. Proceeding anyway.`,
    );
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  console.log(`\n[${modeLabel}] Checking DB state...`);

  console.log("\n[T6] Checking membership_payments status...");
  const pmRes = await fetch(
    `${supabaseUrl}/rest/v1/membership_payments?stripe_session_id=eq.${sessionId}` +
    `&select=status,member_id,amount,is_renewal,completed_at,failed_reason`,
    { headers },
  );
  const pmData = await pmRes.json();
  console.log("  membership_payments:", JSON.stringify(pmData, null, 2));

  console.log("\n[T7] Checking user_credits.membership_stake_paid...");
  const ucRes = await fetch(
    `${supabaseUrl}/rest/v1/user_credits?user_id=eq.${userId}` +
    `&select=membership_stake_paid,membership_stake_paid_at,marks_balance`,
    { headers },
  );
  const ucData = await ucRes.json();
  console.log("  user_credits:", JSON.stringify(ucData, null, 2));

  console.log("\n[T7b] Checking member_profiles status...");
  const mpRes = await fetch(
    `${supabaseUrl}/rest/v1/member_profiles?user_id=eq.${userId}` +
    `&select=membership_status,membership_expires_at,stripe_customer_id`,
    { headers },
  );
  const mpData = await mpRes.json();
  console.log("  member_profiles:", JSON.stringify(mpData, null, 2));

  console.log("\n[T9] Checking marks_allocation_queue...");
  const maqRes = await fetch(
    `${supabaseUrl}/rest/v1/marks_allocation_queue?member_id=eq.${userId}` +
    `&select=status,phase,reason,marks_units,note&order=created_at.desc&limit=3`,
    { headers },
  );
  const maqData = await maqRes.json();
  console.log("  marks_allocation_queue:", JSON.stringify(maqData, null, 2));

  const paid = ucData?.[0]?.membership_stake_paid === true;
  const profileActive = mpData?.[0]?.membership_status === "active";
  const paymentCompleted = pmData?.[0]?.status === "completed";

  console.log("\n" + "=".repeat(60));
  console.log(`RESULT SUMMARY (${modeLabel})`);
  console.log("=".repeat(60));
  console.log(`  T6 membership_payments.status = completed: ${paymentCompleted ? "[PASS]" : "[FAIL]"}`);
  console.log(`  T7 user_credits.membership_stake_paid = true: ${paid ? "[PASS]" : "[FAIL]"}`);
  console.log(`  T7b member_profiles.membership_status = active: ${profileActive ? "[PASS]" : "[FAIL]"}`);

  const allPass = paid && profileActive && paymentCompleted;
  if (allPass) {
    console.log("\n  [ALL PASS] T6 + T7 + T7b confirmed. Trace complete.");
  } else {
    console.log("\n  [FAIL] One or more checks failed -- see above. Check webhook logs.");
    process.exit(1);
  }
}

// ─── Print trace template ─────────────────────────────────────────────────────

function printTraceTemplate(testMode: boolean): void {
  const tracePoints = testMode ? TRACE_POINTS_TEST : TRACE_POINTS_LIVE;
  const modeLabel = testMode ? "TEST MODE" : "LIVE MODE -- HELD FOR FOUNDER";
  const separator = "=".repeat(70);

  console.log("\n" + separator);
  console.log(`STRIPE E2E TEST HARNESS -- BP073 Wave 5 / Phase alpha`);
  console.log(`MODE: ${modeLabel}`);
  console.log(separator);

  if (!testMode) {
    console.log("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("FOUNDER: RUN THIS");
    console.log("This is the LIVE charge path. A real $5 charge WILL occur.");
    console.log("Confirm you have a real Stripe LIVE key (sk_live_...) configured.");
    console.log("NEVER run this in automated CI. Founder only. Explicit confirmation required.");
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
  } else {
    console.log("\nTest card: 4242 4242 4242 4242 | Expiry: any future | CVC: any 3 digits");
    console.log("No real charge. No real card required.");
    console.log("Stripe test key (sk_test_...) must be set as STRIPE_SECRET_KEY.\n");
  }

  for (const tp of tracePoints) {
    console.log(`\n[${tp.id}] ${tp.label}`);
    console.log(`  Description: ${tp.description}`);
    console.log(`  Validation:  ${tp.validation}`);
    console.log(`  Status:      [ ] PENDING`);
  }

  console.log("\n" + separator);
  if (testMode) {
    console.log("VERIFY: After completing T3 (test payment), run:");
    console.log("  npx tsx platform/scripts/stripe-e2e-harness.ts --check-db <userId> <sessionId> --test-mode");
  } else {
    console.log("HELD FOR FOUNDER -- live charge path. Confirm T6+T7 with --check-db.");
  }
  console.log(separator + "\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isLive = args.includes("--live");
  const isTestMode = !isLive; // default is test mode
  const isCheckDb = args.includes("--check-db");

  if (isLive && isCheckDb) {
    // LIVE + check-db -- Founder confirming a live payment
    const idx = args.indexOf("--check-db");
    const userId = args[idx + 1];
    const sessionId = args[idx + 2];
    if (!userId || !sessionId) {
      console.error("Usage: --live --check-db <userId> <stripeSessionId>");
      process.exit(1);
    }
    await checkDbState(userId, sessionId, false);
  } else if (isCheckDb) {
    // TEST mode check-db (default)
    const idx = args.indexOf("--check-db");
    const userId = args[idx + 1];
    const sessionId = args[idx + 2];
    if (!userId || !sessionId) {
      console.error("Usage: --check-db <userId> <stripeSessionId> [--test-mode]");
      process.exit(1);
    }
    await checkDbState(userId, sessionId, true);
  } else if (isLive) {
    // Print LIVE trace template (HELD FOR FOUNDER -- never automated)
    printTraceTemplate(false);
  } else {
    // Default: print TEST MODE trace template
    printTraceTemplate(true);
  }
}

main().catch((err) => {
  console.error("Harness error:", err);
  process.exit(1);
});
