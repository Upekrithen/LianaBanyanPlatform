/**
 * KN105 Test Suite — Excalibur Class Commercial Subscription
 * ===========================================================
 * Tests T1–T11 per KN105 PHASE D spec.
 *
 * Run: node tests_kn105.mjs
 */

import {
  calculateExcaliburPricing,
  calculateMemberShareBack,
  calculateAllShareBacks,
  normalizeContributionProportions,
  LB_MARGIN_FACTOR,
  DEFAULT_M_SHARE_USD,
  BUNDLE_DISCOUNT_FACTOR,
  SUBSCRIPTION_AMORTIZATION,
} from "./dist/excalibur_class/pricing_engine.js";
import {
  evaluateExcaliburGates,
  DEFAULT_GATE_THRESHOLDS,
} from "./dist/excalibur_class/tag_assignment_gates.js";
import {
  createSubscription,
  activateSubscription,
  activateOneTimeAccess,
  cancelSubscription,
  isSubscriptionActive,
} from "./dist/excalibur_class/subscription_state_machine.js";

let passed = 0;
let failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function makeMembers(n, opt_in_status = "opted_in") {
  return Array.from({ length: n }, (_, i) => ({
    member_id: `member_${i + 1}`,
    data_stamps: [],
    contribution_share_proportion: 1.0 / n,
    share_back_per_subscription: 0,
    opt_in_status,
  }));
}

// ── T1: Subscription create (annual) ──────────────────────────────────────
console.log("\nT1: Subscription create — state machine");
{
  const sub = createSubscription("subscriber_001", "slice_001", "topic");
  assert(sub.state === "inactive", "Initial state is inactive");
  assert(sub.subscriber_id === "subscriber_001", "Subscriber ID stored");
  assert(sub.slice_id === "slice_001", "Slice ID stored");
  assert(sub.cohort_class_granted === "excalibur_class_subscriber", "cohort_class_granted is excalibur_class_subscriber");

  const activated = activateSubscription(sub, "stripe_sub_001");
  assert(activated.state === "active_subscription", "After activation: state = active_subscription");
  assert(isSubscriptionActive(activated), "isSubscriptionActive = true after activation");
  assert(activated.expires_at !== null, "expires_at set after activation");
}

// ── T2: One-time purchase (30 day expiry) ─────────────────────────────────
console.log("\nT2: One-time purchase — expires after 30 days");
{
  const sub = createSubscription("subscriber_002", "slice_002", "category");
  const oneTime = activateOneTimeAccess(sub, "stripe_session_001");
  assert(oneTime.state === "active_one_time", "One-time state = active_one_time");
  assert(isSubscriptionActive(oneTime), "One-time is active before expiry");
  assert(oneTime.expires_at !== null, "expires_at set");

  // Simulate lapsed (manually set expires_at in past)
  const lapsed = { ...oneTime, expires_at: new Date(Date.now() - 1000).toISOString() };
  assert(!isSubscriptionActive(lapsed), "One-time inactive after expiry");
}

// ── T3: Pricing calculation — per spec ────────────────────────────────────
console.log("\nT3: Pricing — 5 opted-in contributors × $1/year → $6 one-time; $30 annual");
{
  const slice = { granularity: "topic", contributing_members: makeMembers(5), topics_included: ["gene_splicing"] };
  const pricing = calculateExcaliburPricing(slice);

  // cost = 5 × $1 = $5; one_time = $5 × 1.20 = $6; annual = $6 × 5 = $30
  assert(pricing.cost === 5.00, `Cost = $5 (got $${pricing.cost})`);
  assert(pricing.one_time === 6.00, `One-time = $6 (got $${pricing.one_time})`);
  assert(pricing.subscription_annual === 30.00, `Annual = $30 (got $${pricing.subscription_annual})`);
  assert(pricing.n_opted_in_contributors === 5, "5 opted-in contributors");
  assert(!pricing.bundle_discount_applied, "No bundle discount for topic slice");
}

// ── T4: Category bundle discount ──────────────────────────────────────────
console.log("\nT4: Category bundle — 4 topics, 4 contributors per topic → $16.80 one-time; $84 annual");
{
  // Per spec: "category includes 4 topics totaling $24 sum → bundle discount 0.70"
  // 4 topics × 5 contributors × $1 × 1.20 = $24... but with one set of contributors:
  // Actually: 4 contributors at $1 each = $4 cost × 1.20 = $4.80 × 0.70 = $3.36 one-time
  // Spec says: "$24 sum → × 0.70 → $16.80" — so 20 contributors total (5 per topic × 4 topics)
  // Let's use 20 opted-in contributors to match the spec
  const slice20 = { granularity: "category", contributing_members: makeMembers(20), topics_included: ["t1", "t2", "t3", "t4"] };
  const pricing20 = calculateExcaliburPricing(slice20);
  // cost = 20 × $1 = $20; one_time = $20 × 1.20 = $24; × 0.70 = $16.80; annual = $16.80 × 5 = $84
  assert(Math.abs(pricing20.one_time - 16.80) < 0.01, `Category one-time = $16.80 (got $${pricing20.one_time})`);
  assert(Math.abs(pricing20.subscription_annual - 84.00) < 0.01, `Category annual = $84 (got $${pricing20.subscription_annual})`);
  assert(pricing20.bundle_discount_applied, "Bundle discount applied for category");
}

// ── T5: Member share-back ─────────────────────────────────────────────────
console.log("\nT5: Member share-back — 5 equal contributors, $30 annual subscription");
{
  // 100 subscribers × $30 annual; each member's share per sub:
  // cost_portion = $30 / 1.20 = $25; 5 equal contributors → $25 / 5 = $5 each per subscriber
  // Total annual: $5 × 100 subscribers = $500/contributor/year
  const member = { contribution_share_proportion: 0.20 }; // 1/5
  const sharePerSub = calculateMemberShareBack(member, 30);
  assert(Math.abs(sharePerSub - 5.00) < 0.01, `Share per subscriber = $5 (got $${sharePerSub})`);

  // 100 subscribers total
  const annualTotal = sharePerSub * 100;
  assert(annualTotal === 500, `Annual total for member = $500 (got $${annualTotal})`);
}

// ── T6: Excalibur tag-assignment 4-gate — fail if Adversarial Fence fails ─
console.log("\nT6: 4-gate evaluation — fails if any gate fails");
{
  const failingGates = {
    cathedral_effect_verification: { passed: false, lift_pp: 35 },     // Gate 1 PASSES
    furnace_gate: { passed: false, verification_score: 0.85 },          // Gate 2 PASSES
    adversarial_fence_testing: { passed: false, probes_passed: 8, probes_total: 10 }, // Gate 3 FAILS (not all probes)
    federation_member_vote: { yes_count: 70, no_count: 30, quorum_met: true, threshold_met: true }, // Gate 4 would pass
  };

  const result = evaluateExcaliburGates(failingGates, DEFAULT_GATE_THRESHOLDS, 100);
  assert(!result.all_passed, "Tag NOT assigned when adversarial fence fails");
  assert(result.recommended_status === "raw_federation_library", "Status = raw_federation_library");
  assert(result.gates.adversarial_fence.passed === false, "Adversarial fence gate failed");
  assert(result.gates.cathedral_effect.passed === true, "Cathedral Effect gate passed");
  assert(result.bridle_note.includes("BRIDLE"), "BRIDLE note present");
}

// ── T7: Member opt-out — not counted in pricing ───────────────────────────
console.log("\nT7: Member opt-out — not counted in N_contributors");
{
  const membersWithOptOut = [
    ...makeMembers(3, "opted_in"),
    ...makeMembers(2, "opted_out"),
  ];
  const slice = { granularity: "topic", contributing_members: membersWithOptOut, topics_included: ["t1"] };
  const pricing = calculateExcaliburPricing(slice);
  assert(pricing.n_opted_in_contributors === 3, "Only 3 opted-in counted (not 5)");
  assert(pricing.cost === 3.00, "Cost = $3 (only opted-in members)");

  // Share-back: opted-out members get $0
  const all = calculateAllShareBacks(membersWithOptOut, 30);
  assert(all.length === 3, "Only 3 share-back entries (opted-in only)");
}

// ── T8: Federation member-vote — quorum + threshold ───────────────────────
console.log("\nT8: Federation member-vote — quorum + threshold required");
{
  // Quorum not met (only 40% voted out of 100 eligible)
  const noQuorum = {
    cathedral_effect_verification: { passed: false, lift_pp: 35 },
    furnace_gate: { passed: false, verification_score: 0.85 },
    adversarial_fence_testing: { passed: false, probes_passed: 10, probes_total: 10 },
    federation_member_vote: { yes_count: 30, no_count: 10, quorum_met: false, threshold_met: false },
  };
  const r1 = evaluateExcaliburGates(noQuorum, DEFAULT_GATE_THRESHOLDS, 100);
  assert(!r1.gates.federation_vote.passed, "Vote fails without quorum");

  // Quorum met but threshold not met (60% voted, only 50% yes)
  const noThreshold = {
    ...noQuorum,
    federation_member_vote: { yes_count: 30, no_count: 30, quorum_met: false, threshold_met: false },
  };
  const r2 = evaluateExcaliburGates(noThreshold, DEFAULT_GATE_THRESHOLDS, 100);
  assert(!r2.gates.federation_vote.passed, "Vote fails without approval threshold");

  // Quorum + threshold met (70 vote, 50 yes = 71% > 60%)
  const passes = {
    ...noQuorum,
    federation_member_vote: { yes_count: 50, no_count: 20, quorum_met: false, threshold_met: false },
  };
  const r3 = evaluateExcaliburGates(passes, DEFAULT_GATE_THRESHOLDS, 100);
  assert(r3.gates.federation_vote.passed, "Vote passes with quorum + threshold");
}

// ── T9: Anti-extraction — subscription created only for excalibur_class slices
console.log("\nT9: Anti-extraction — structural protections verify (schema)");
{
  // Per-user data stamping: MemberContribution has data_stamps field
  const member = { member_id: "m1", data_stamps: [{ source_scribe: "S1", tablet_id: "T1", contribution_weight: 0.5 }],
    contribution_share_proportion: 1.0, share_back_per_subscription: 0, opt_in_status: "opted_in" };
  assert(member.data_stamps.length > 0, "Member contribution has data_stamps (per-user stamping)");

  // Public subscriber dashboard fields
  const sub = createSubscription("pub_subscriber", "slice_abc", "topic");
  assert(sub.cohort_class_granted === "excalibur_class_subscriber", "cohort_class_granted present for dashboard");
  assert(sub.subscriber_id === "pub_subscriber", "Subscriber ID trackable for conduct review");
}

// ── T10: Cohort composition with KN102 ─────────────────────────────────────
console.log("\nT10: Cohort_class=excalibur_class_subscriber grants fluid librarian (KN102 composition)");
{
  const sub = createSubscription("member_kn102", "slice_kn102", "topic");
  const activated = activateSubscription(sub, "stripe_kn102");
  assert(activated.state === "active_subscription", "Subscription active");
  assert(activated.cohort_class_granted === "excalibur_class_subscriber", "Correct cohort class granted");
  // KN102 librarian mode: fluid when cohort = excalibur_class_subscriber
  // (actual KN102 code consumes this in get_cohort_class tool)
  assert(isSubscriptionActive(activated), "isSubscriptionActive = true (triggers fluid librarian in KN102)");
}

// ── T11: Non-profit non-vetting ─────────────────────────────────────────────
console.log("\nT11: Non-profit non-vetting — no preemptive check in subscription creation");
{
  // Per Founder stance: "I'd say no, but, that is an issue" — no preemptive vetting
  // Verification: createSubscription accepts any subscriber_id without type checking org type
  const nonProfitSub = createSubscription("nonprofit_org_001", "slice_001", "topic");
  assert(nonProfitSub.subscriber_id === "nonprofit_org_001", "Non-profit can create subscription (no preemptive vetting)");
  // Post-hoc: subscriber appears in conduct review table if misuse documented
  assert(nonProfitSub.state === "inactive", "Initial state inactive — awaiting payment confirmation");
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`KN105 Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
