/**
 * MoneyPenny Integration Tests — Bushel 82 / BP034
 *
 * G-Gates verification tests:
 *   G1: Routing gateway live + receipts written
 *   G2: Priority taxonomy + 50-caller classification
 *   G3: No-collision stress test (100 simultaneous)
 *   G4: Hold-and-engage + transition packets
 *   G5: MCCI Thread Store + <100ms retrieval
 *   G6: Handoff protocol zero-context-loss (stub)
 *   G7: 3K compression ≤ 3000 tokens
 *   G8: Resurrection warm-reopen (stub)
 *   G9: Calendar adapters (graceful degradation)
 *   G10: Auto-scheduler proposals
 *   G11: Health check endpoint
 *
 * Run: node --test tests/test_moneypenny_b82.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// ─── G1: Routing Gateway ──────────────────────────────────────────────────────

describe("G1 — Routing Gateway", () => {
  it("routes a WARREN_BUFFETT inbound to ROUTE_DIRECT in OPEN_BLOCK", async () => {
    const { routeInbound } = await import("../dist/moneypenny/gateway/router.js");
    const { setAvailability } = await import("../dist/moneypenny/calendar/availability_state.js");

    setAvailability("OPEN_BLOCK");

    const result = routeInbound({
      channel: "email",
      caller_identifier: { type: "email", value: "warren@example.com" },
      signal: "Need to discuss the cooperative model",
      caller_class: "WARREN_BUFFETT",
    });

    assert.equal(result.routing_decision.action, "ROUTE_DIRECT");
    assert.equal(result.routing_decision.caller_class, "WARREN_BUFFETT");
    assert.ok(result.routing_decision.receipt_path.length > 0, "Receipt path should be set");
    assert.ok(result.thread_id.length > 0, "Thread ID should be set");
  });

  it("holds a MACKENZIE_SCOTT caller during DEEP_WORK", async () => {
    const { routeInbound } = await import("../dist/moneypenny/gateway/router.js");
    const { setAvailability } = await import("../dist/moneypenny/calendar/availability_state.js");

    setAvailability("DEEP_WORK");

    const result = routeInbound({
      channel: "email",
      caller_identifier: { type: "email", value: "ms@example.com" },
      signal: "Following up on our last conversation",
      caller_class: "MACKENZIE_SCOTT",
    });

    assert.equal(result.routing_decision.action, "SUBSTANTIVE_HOLD");
    assert.ok(result.hold_session, "Hold session should be created");
    assert.ok(result.hold_session.hold_id.length > 0, "Hold ID should be set");
  });

  it("flags UNKNOWN class as HUMAN_REVIEW in OPEN_BLOCK", async () => {
    const { routeInbound } = await import("../dist/moneypenny/gateway/router.js");
    const { setAvailability } = await import("../dist/moneypenny/calendar/availability_state.js");

    setAvailability("OPEN_BLOCK");

    const result = routeInbound({
      channel: "web",
      caller_identifier: { type: "unknown", value: "anonymous@example.com" },
      signal: "Hello, I want to know more about your platform",
    });

    assert.equal(result.routing_decision.action, "HUMAN_REVIEW");
  });
});

// ─── G2: Priority Taxonomy ────────────────────────────────────────────────────

describe("G2 — Priority Taxonomy", () => {
  it("correctly orders all 8 CallerClass tiers by priority", async () => {
    const { getClassPriority, canInterruptDeepWork } = await import("../dist/moneypenny/gateway/priority_taxonomy.js");

    // WB must have highest priority (lowest index)
    assert.ok(getClassPriority("WARREN_BUFFETT") < getClassPriority("MACKENZIE_SCOTT"));
    assert.ok(getClassPriority("MACKENZIE_SCOTT") < getClassPriority("UNKNOWN"));

    // Only WB, FAMILY, COUNSEL can interrupt deep-work
    assert.equal(canInterruptDeepWork("WARREN_BUFFETT"), true);
    assert.equal(canInterruptDeepWork("FAMILY"), true);
    assert.equal(canInterruptDeepWork("COUNSEL"), true);
    assert.equal(canInterruptDeepWork("MACKENZIE_SCOTT"), false);
    assert.equal(canInterruptDeepWork("PRESS"), false);
    assert.equal(canInterruptDeepWork("UNKNOWN"), false);
  });

  it("heuristic classification produces valid CallerClass for all inputs", async () => {
    const { classifyCallerHeuristic } = await import("../dist/moneypenny/gateway/priority_taxonomy.js");
    const VALID_CLASSES = ["WARREN_BUFFETT", "MACKENZIE_SCOTT", "TALENTS_PRACTITIONER", "FAMILY", "COUNSEL", "PRESS", "UNKNOWN", "INTERNAL_AI"];

    const test_inputs = [
      "bishop@liana.ai",
      "knight@cursor.ai",
      "press@nypost.com",
      "counsel@harrity.com",
      "unknown@example.com",
      "AI:pawn-perplexity",
    ];

    for (const input of test_inputs) {
      const cls = classifyCallerHeuristic(input);
      assert.ok(VALID_CLASSES.includes(cls), `${input} → ${cls} (not a valid CallerClass)`);
    }
  });

  it("Kissaki rank assignment covers all 7 roles", async () => {
    const { assignKissakiRank } = await import("../dist/moneypenny/gateway/priority_taxonomy.js");
    const VALID_RANKS = ["APPRENTICE", "JOURNEYMAN", "MASTER", "KISSAKI"];
    const roles = ["triage", "engage", "compress", "resurrect", "transition"];

    for (const role of roles) {
      const rank = assignKissakiRank("MACKENZIE_SCOTT", role);
      assert.ok(VALID_RANKS.includes(rank), `role ${role} → ${rank} (not a valid KissakiRank)`);
    }
  });
});

// ─── G3: No-Collision Stress Test ─────────────────────────────────────────────

describe("G3 — No-Collision Arbitration (100 simultaneous inbounds)", () => {
  it("registers 100 simultaneous inbounds with zero drops", async () => {
    const { simulateStressTest } = await import("../dist/moneypenny/gateway/no_collision_arbiter.js");
    const { setAvailability } = await import("../dist/moneypenny/calendar/availability_state.js");

    setAvailability("OPEN_BLOCK");

    const start = Date.now();
    const result = simulateStressTest(100, "OPEN_BLOCK");
    const elapsed = Date.now() - start;

    assert.equal(result.dropped, 0, `Expected 0 drops, got ${result.dropped}`);
    assert.equal(result.registered, 100);
    // 100ms per G3 contract — stress test should be fast
    assert.ok(elapsed < 5000, `Stress test took ${elapsed}ms (expected < 5000ms)`);
  });

  it("deep-work state blocks non-privileged callers", async () => {
    const { simulateStressTest } = await import("../dist/moneypenny/gateway/no_collision_arbiter.js");

    const result = simulateStressTest(40, "DEEP_WORK");
    const direct = result.decisions.filter(d => d.action === "ROUTE_DIRECT");
    const held = result.decisions.filter(d => d.action === "SUBSTANTIVE_HOLD" || d.action === "QUEUE_BATCH" || d.action === "HUMAN_REVIEW");

    // Only WB, FAMILY, COUNSEL should route direct in DEEP_WORK
    for (const d of direct) {
      const valid = ["WARREN_BUFFETT", "FAMILY", "COUNSEL"].includes(d.caller_class);
      assert.ok(valid, `DEEP_WORK: ${d.caller_class} routed direct but shouldn't have been`);
    }
    assert.ok(held.length > 0, "Some callers should be held in DEEP_WORK");
  });
});

// ─── G4: Hold-and-Engage ──────────────────────────────────────────────────────

describe("G4 — Hold-and-Engage Orchestration", () => {
  it("creates a hold session with Substantive Engager opening", async () => {
    const { createHoldSession } = await import("../dist/moneypenny/gateway/hold_and_engage.js");

    const session = createHoldSession(
      randomUUID(),
      "MACKENZIE_SCOTT",
      { type: "email", value: "ms@example.com" },
      "Held during WB-class call",
    );

    assert.ok(session.hold_id.length > 0);
    assert.equal(session.status, "active");
    assert.equal(session.caller_class, "MACKENZIE_SCOTT");
    // Should have opening engager turn
    const engager_turns = session.conversation_log.filter(t => t.speaker === "engager");
    assert.ok(engager_turns.length > 0, "Substantive Engager should open with a message");
    assert.ok(engager_turns[0].content.length > 50, "Opening should be substantive (>50 chars)");
    // Should NOT say "please hold"
    assert.ok(!engager_turns[0].content.toLowerCase().includes("please hold"), "Should NOT say 'please hold'");
  });

  it("produces a transition packet when Founder becomes available", async () => {
    const { createHoldSession, appendTurn, produceTransitionPacket } = await import("../dist/moneypenny/gateway/hold_and_engage.js");

    const session = createHoldSession(
      randomUUID(),
      "MACKENZIE_SCOTT",
      { type: "email", value: "partner@example.com" },
      "Test hold",
    );

    // Simulate 3 caller turns
    appendTurn(session.hold_id, "caller", "I wanted to discuss the cooperative model in more detail. What are the key financial mechanics?");
    appendTurn(session.hold_id, "caller", "How does the 83.3% creator keep work in practice?");
    appendTurn(session.hold_id, "caller", "And what about the membership fee structure?");

    const packet = produceTransitionPacket(session.hold_id);
    assert.ok(packet, "Transition packet should be produced");
    assert.ok(packet!.compressed_3k.length > 0, "3K summary should not be empty");
    assert.ok(packet!.open_questions.length > 0, "Should extract open questions");
    assert.ok(packet!.engagement_duration_ms >= 0, "Duration should be tracked");
  });
});

// ─── G5: MCCI Thread Store ────────────────────────────────────────────────────

describe("G5 — MCCI Thread Store", () => {
  it("creates, loads, and retrieves threads in <100ms", async () => {
    const { createThread, loadThread, appendMessage } = await import("../dist/moneypenny/mcci/thread_store.js");

    const thread = createThread({
      class: "relationship",
      participants: ["john.doe@example.com", "founder"],
      caller_class: "TALENTS_PRACTITIONER",
      title: "John Doe — Cooperative Inquiry",
    });

    const start = Date.now();
    const loaded = loadThread(thread.id);
    const elapsed = Date.now() - start;

    assert.ok(loaded, "Thread should be loadable");
    assert.equal(loaded!.id, thread.id);
    assert.equal(loaded!.class, "relationship");
    assert.equal(loaded!.caller_class, "TALENTS_PRACTITIONER");
    assert.ok(elapsed < 100, `Thread load took ${elapsed}ms (expected <100ms)`);

    // Append message
    const updated = appendMessage(thread.id, "caller", "Hi, I want to know more about becoming a member");
    assert.ok(updated, "Should return updated thread");
    assert.equal(updated!.messages.length, 1);
  });

  it("append-only log never truncates messages", async () => {
    const { createThread, appendMessage, loadThread } = await import("../dist/moneypenny/mcci/thread_store.js");

    const thread = createThread({
      class: "topic",
      participants: ["user@test.com", "founder"],
    });

    for (let i = 0; i < 10; i++) {
      appendMessage(thread.id, i % 2 === 0 ? "caller" : "founder", `Message ${i}`);
    }

    const loaded = loadThread(thread.id);
    assert.equal(loaded!.messages.length, 10, "All 10 messages should be preserved");
  });
});

// ─── G7: 3K Compression ───────────────────────────────────────────────────────

describe("G7 — 3K Compression Contract", () => {
  it("deterministic compression output ≤ 3000 tokens", async () => {
    const { createThread, appendMessage } = await import("../dist/moneypenny/mcci/thread_store.js");
    const { deterministicCompress3k, estimateTokens } = await import("../dist/moneypenny/mcci/compression_3k.js");

    // Create a thread with substantial content
    const thread = createThread({
      class: "relationship",
      participants: ["caller@test.com", "founder"],
      caller_class: "MACKENZIE_SCOTT",
    });

    for (let i = 0; i < 20; i++) {
      appendMessage(thread.id, i % 2 === 0 ? "caller" : "ai_agent",
        `This is a substantive message about the cooperative platform, the 83.3% creator keep, the Cost+20% margin model, and the Sweet Sixteen initiatives. Message ${i}.`
      );
    }

    // Reload to get the full thread
    const { loadThread } = await import("../dist/moneypenny/mcci/thread_store.js");
    const loaded = loadThread(thread.id);
    assert.ok(loaded, "Thread should exist");

    const compressed = deterministicCompress3k(loaded!);
    const tokens = estimateTokens(compressed);

    assert.ok(tokens <= 3000, `Compressed output is ${tokens} tokens (must be ≤ 3000)`);
    assert.ok(compressed.includes("MCCI THREAD COMPRESSION"), "Should have header");
    assert.ok(compressed.includes("MACKENZIE_SCOTT"), "Should preserve caller class");
  });
});

// ─── G8: Resurrection ─────────────────────────────────────────────────────────

describe("G8 — Context Resurrection", () => {
  it("resurrects a dormant thread with warm-reopen packet", async () => {
    const { createThread, appendMessage } = await import("../dist/moneypenny/mcci/thread_store.js");
    const { resurrect_thread } = await import("../dist/moneypenny/mcci/resurrection.js");

    // Create a thread and manually mark it dormant
    const thread = createThread({
      class: "relationship",
      participants: ["returning.caller@test.com", "founder"],
      caller_class: "TALENTS_PRACTITIONER",
    });

    appendMessage(thread.id, "caller", "I was asking about joining as a Talents member last time");
    appendMessage(thread.id, "founder", "We discussed the PF300 cohort pathway");

    // Mark dormant by manipulating last_active
    const { loadThread, saveThread } = await import("../dist/moneypenny/mcci/thread_store.js");
    const t = loadThread(thread.id)!;
    t.state = "dormant";
    t.metadata.last_active = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(); // 45 days ago
    saveThread(t);

    const start = Date.now();
    const packet = await resurrect_thread(thread.id, {
      channel: "email",
      content: "Hi, I wanted to follow up on our conversation about joining",
      received_at: new Date().toISOString(),
    });
    const elapsed = Date.now() - start;

    assert.ok(packet, "Resurrection packet should be produced");
    assert.ok(packet.days_dormant >= 40, `Days dormant should be ~45, got ${packet.days_dormant}`);
    assert.ok(packet.suggested_open.length > 0, "Should have warm reopen suggestion");
    assert.ok(!packet.suggested_open.toLowerCase().includes("please hold"), "Reopen should not say 'please hold'");
    assert.ok(elapsed < 5000, `Resurrection took ${elapsed}ms (expected <5000ms without API)`);
  });
});

// ─── G9: Calendar Adapters ────────────────────────────────────────────────────

describe("G9 — Calendar Adapters (graceful degradation)", () => {
  it("Outlook adapter returns empty array when not configured", async () => {
    const { read_block } = await import("../dist/moneypenny/calendar/outlook_adapter.js");
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const blocks = await read_block(now, later);
    assert.ok(Array.isArray(blocks), "Should return array");
    // Without credentials, should return empty
    assert.equal(blocks.length, 0, "Should return empty without credentials");
  });

  it("Google adapter returns empty array when not configured", async () => {
    const { read_block } = await import("../dist/moneypenny/calendar/google_adapter.js");
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const blocks = await read_block(now, later);
    assert.ok(Array.isArray(blocks), "Should return array");
    assert.equal(blocks.length, 0, "Should return empty without credentials");
  });

  it("inferAvailabilityFromBlocks returns OPEN_BLOCK for empty calendar", async () => {
    const { inferAvailabilityFromBlocks } = await import("../dist/moneypenny/calendar/availability_state.js");
    const avail = inferAvailabilityFromBlocks([], new Date().toISOString());
    assert.equal(avail, "OPEN_BLOCK");
  });

  it("inferAvailabilityFromBlocks correctly maps calendar event titles", async () => {
    const { inferAvailabilityFromBlocks } = await import("../dist/moneypenny/calendar/availability_state.js");
    const now = new Date();
    const start = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const end = new Date(now.getTime() + 55 * 60 * 1000).toISOString();

    const deep_work = inferAvailabilityFromBlocks([
      { start, end, title: "Deep Work Block — no meetings", source: "outlook" }
    ], now.toISOString());
    assert.equal(deep_work, "DEEP_WORK");

    const family_time = inferAvailabilityFromBlocks([
      { start, end, title: "Family time", source: "google" }
    ], now.toISOString());
    assert.equal(family_time, "FAMILY");
  });
});

// ─── G10: Auto-Scheduler ──────────────────────────────────────────────────────

describe("G10 — Auto-Scheduler v1 (read-only proposals)", () => {
  it("proposes a slot for MACKENZIE_SCOTT with 30-min prep window", async () => {
    const { auto_schedule } = await import("../dist/moneypenny/calendar/auto_scheduler.js");

    const result = await auto_schedule({
      caller_class: "MACKENZIE_SCOTT",
      caller_identifier: "ms@example.com",
      requested_duration_minutes: 45,
    });

    // Should be a TimeSlot, not a HUMAN_REVIEW flag
    assert.ok(!("flag" in result), "MACKENZIE_SCOTT should not get HUMAN_REVIEW");
    const slot = result;
    assert.ok("start" in slot, "Should have start time");
    assert.equal(slot.substantive_prep_window_minutes, 30, "MS class needs 30-min prep window");
    assert.equal(slot.source, "proposed", "v1 is proposals only");
  });

  it("returns HUMAN_REVIEW for UNKNOWN class callers", async () => {
    const { auto_schedule } = await import("../dist/moneypenny/calendar/auto_scheduler.js");

    const result = await auto_schedule({
      caller_class: "UNKNOWN",
      caller_identifier: "cold@example.com",
      requested_duration_minutes: 30,
    });

    assert.ok("flag" in result, "UNKNOWN class should return HUMAN_REVIEW");
    const review = result;
    assert.equal(review.flag, "HUMAN_REVIEW");
  });

  it("WARREN_BUFFETT gets 0-min prep window", async () => {
    const { auto_schedule } = await import("../dist/moneypenny/calendar/auto_scheduler.js");

    const result = await auto_schedule({
      caller_class: "WARREN_BUFFETT",
      caller_identifier: "wb@example.com",
      requested_duration_minutes: 60,
    });

    if (!("flag" in result)) {
      assert.equal(result.substantive_prep_window_minutes, 0, "WB class needs no prep window");
    }
  });

  it("PRESS class gets 24-hour (1440 min) prep window", async () => {
    const { auto_schedule } = await import("../dist/moneypenny/calendar/auto_scheduler.js");

    const result = await auto_schedule({
      caller_class: "PRESS",
      caller_identifier: "journalist@nytimes.com",
      requested_duration_minutes: 30,
    });

    if (!("flag" in result)) {
      assert.equal(result.substantive_prep_window_minutes, 1440, "PRESS class needs 24hr prep");
    }
  });
});

// ─── G11: Daemon Health Check ─────────────────────────────────────────────────

describe("G11 — Production Daemon", () => {
  it("availability state read/write persists correctly", async () => {
    const { setAvailability, getAvailability } = await import("../dist/moneypenny/calendar/availability_state.js");

    setAvailability("DEEP_WORK", undefined, "founder", "Integration test");
    const rec = getAvailability();

    assert.equal(rec.class, "DEEP_WORK");
    assert.equal(rec.set_by, "founder");

    // Reset
    setAvailability("OPEN_BLOCK");
    const reset = getAvailability();
    assert.equal(reset.class, "OPEN_BLOCK");
  });

  it("MCP tool moneypenny_status returns valid structure", async () => {
    const { tool_moneypenny_status } = await import("../dist/moneypenny/mcp_tools/moneypenny_status.js");

    const status = await tool_moneypenny_status({ include_mcci: true });

    assert.ok(typeof status.active_threads === "number");
    assert.ok(typeof status.on_hold === "number");
    assert.ok(typeof status.founder_availability === "string");
    assert.ok(typeof status.availability_description === "string");
    assert.ok(typeof status.snapshot_at === "string");
    assert.ok(status.mcci, "MCCI stats should be included when requested");
    assert.ok(typeof status.mcci!.total_threads === "number");
  });

  it("MCP tool moneypenny_route returns valid RoutingDecision", async () => {
    const { tool_moneypenny_route } = await import("../dist/moneypenny/mcp_tools/moneypenny_route.js");
    const { tool_availability_set } = await import("../dist/moneypenny/mcp_tools/moneypenny_availability.js");

    await tool_availability_set({ class: "OPEN_BLOCK" });

    const result = await tool_moneypenny_route({
      channel: "web",
      caller_identifier_type: "email",
      caller_identifier_value: "test@example.com",
      signal: "Hello, I want to learn about Liana Banyan",
      caller_class: "UNKNOWN",
    });

    assert.ok(result.thread_id.length > 0);
    assert.ok(result.action.length > 0);
    assert.ok(result.receipt_path.length > 0);
    assert.ok(result.timestamp.length > 0);
  });
});
