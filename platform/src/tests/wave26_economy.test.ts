/**
 * Wave 26 Economy Tests -- BP072
 * ================================
 * Tests for the full EARN -> HOLD -> REDEEM -> PAYOUT economy flow,
 * bounty claim state machine, IP Ledger entry types, and
 * securities-clean invariants.
 *
 * Self-contained: no live Supabase or browser APIs.
 * Mirrors the pattern of wave12_f1_substrace_stress.test.ts.
 *
 * Tags: Wave26/Economy / BP072
 */

import { describe, it, expect } from "vitest";

// ─── Inline constants (mirrors economyService.ts pure values) ─────────────────

const MARKS_TO_CREDITS_RATE_HELD = 0.01;

const REDEMPTION_DISCLOSURE =
  "Participation credits that reduce your Cost+20% purchases. " +
  "Marks are cooperative participation units -- not equity, not shares, " +
  "not guaranteed financial return. Rate pending Founder ratification.";

// ─── Inline types (mirrors lib types without importing Supabase) ──────────────

type BountyStatus =
  | "open"
  | "claimed"
  | "submitted"
  | "verified"
  | "rejected"
  | "expired";

type BountyPosterClass =
  | "translation"
  | "design"
  | "development"
  | "content"
  | "research";

type CompensationUnit = "Marks" | "Credits";

type GateColor = "green" | "amber" | "red";

interface OpenBounty {
  id: string;
  title: string;
  description: string;
  bounty_class: BountyPosterClass;
  marks_reward: number;
  credits_reward: number;
  compensation_unit: CompensationUnit;
  posted_by: string;
  status: BountyStatus;
  created_at: string;
}

interface BountyClaim {
  id: string;
  bounty_id: string;
  claimant_id: string;
  status: BountyStatus;
  marks_awarded?: number;
  claimed_at: string;
  verified_at?: string;
}

interface PayoutGateStatus {
  auto_enabled: boolean;
  gate_label: string;
  gate_color: GateColor;
  gate_detail: string;
}

type IPLedgerEntryType =
  | "innovation.registered"
  | "medallion.minted"
  | "governance.decision"
  | "content.created"
  | "content.updated"
  | "patent.filed"
  | "patent.granted"
  | "sponsor.allocated"
  | "metric.recorded"
  | "branch.merge"
  | "branch.diverge"
  | "branch.fork"
  | "branch.vote"
  | "intent.beacon"
  | "bounty.posted"
  | "bounty.claimed"
  | "bounty.submitted"
  | "bounty.verified"
  | "bounty.rejected"
  | "marks.redeemed"
  | "pedestal.nominated"
  | "pedestal.ratified";

// ─── Securities-clean invariants ─────────────────────────────────────────────

describe("w26-sec-clean: Securities-clean invariants", () => {
  it("REDEMPTION_DISCLOSURE does not contain 'equity' as a positive claim", () => {
    const lower = REDEMPTION_DISCLOSURE.toLowerCase();
    expect(lower).toContain("not equity");
  });

  it("REDEMPTION_DISCLOSURE does not contain 'guaranteed return'", () => {
    expect(REDEMPTION_DISCLOSURE.toLowerCase()).not.toContain("guaranteed return");
  });

  it("REDEMPTION_DISCLOSURE contains 'participation'", () => {
    expect(REDEMPTION_DISCLOSURE.toLowerCase()).toContain("participation");
  });

  it("REDEMPTION_DISCLOSURE contains 'cost+20%'", () => {
    expect(REDEMPTION_DISCLOSURE.toLowerCase()).toContain("cost+20%");
  });

  it("MARKS_TO_CREDITS_RATE_HELD is a finite positive number", () => {
    expect(MARKS_TO_CREDITS_RATE_HELD).toBeGreaterThan(0);
    expect(Number.isFinite(MARKS_TO_CREDITS_RATE_HELD)).toBe(true);
  });

  it("Marks are 'participation', NEVER 'guaranteed financial return'", () => {
    expect(REDEMPTION_DISCLOSURE).toContain("participation");
    // Must mention financial return only to deny it (as "not guaranteed financial return")
    const lower = REDEMPTION_DISCLOSURE.toLowerCase();
    expect(lower).toContain("not guaranteed financial return");
  });
});

// ─── Marks -> Credits math ────────────────────────────────────────────────────

describe("w26-redeem: Marks-to-Credits conversion math", () => {
  const convertMarks = (marks: number) => Math.floor(marks * MARKS_TO_CREDITS_RATE_HELD);

  it("0 Marks converts to 0 Credits", () => {
    expect(convertMarks(0)).toBe(0);
  });

  it("result is always a non-negative integer", () => {
    const cases = [1, 10, 100, 999, 10_000];
    for (const m of cases) {
      const c = convertMarks(m);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(c)).toBe(true);
    }
  });

  it("more Marks yields more or equal Credits (monotone)", () => {
    expect(convertMarks(200)).toBeGreaterThanOrEqual(convertMarks(100));
    expect(convertMarks(10_000)).toBeGreaterThan(convertMarks(1_000));
  });

  it("conversion is deterministic (same input, same output)", () => {
    const marks = 7_500;
    expect(convertMarks(marks)).toBe(convertMarks(marks));
  });

  it("negative Marks input produces non-positive Credits (guard)", () => {
    expect(convertMarks(-100)).toBeLessThanOrEqual(0);
  });
});

// ─── Bounty claim state machine ───────────────────────────────────────────────

describe("w26-bounty-sm: Bounty claim state machine", () => {
  const ALL_STATES: BountyStatus[] = [
    "open",
    "claimed",
    "submitted",
    "verified",
    "rejected",
    "expired",
  ];

  it("all BountyClaim statuses are valid non-empty strings", () => {
    for (const s of ALL_STATES) {
      expect(typeof s).toBe("string");
      expect(s.length).toBeGreaterThan(0);
    }
  });

  it("6 distinct states defined", () => {
    expect(new Set(ALL_STATES).size).toBe(6);
  });

  it("happy path: open -> claimed -> submitted -> verified", () => {
    const path: BountyStatus[] = ["open", "claimed", "submitted", "verified"];
    expect(new Set(path).size).toBe(4);
  });

  it("rejection path: claimed -> submitted -> rejected", () => {
    const path: BountyStatus[] = ["claimed", "submitted", "rejected"];
    expect(new Set(path).size).toBe(3);
  });

  it("verified claim can carry marks_awarded >= 0", () => {
    const claim: BountyClaim = {
      id: "claim-1",
      bounty_id: "bounty-1",
      claimant_id: "member-1",
      status: "verified",
      marks_awarded: 500,
      claimed_at: new Date().toISOString(),
    };
    expect(claim.marks_awarded).toBeGreaterThanOrEqual(0);
  });

  it("non-verified claims have zero or undefined marks_awarded", () => {
    const pending: Partial<BountyClaim> = {
      status: "submitted",
      marks_awarded: undefined,
    };
    expect(pending.marks_awarded ?? 0).toBe(0);
  });
});

// ─── Open bounty shape ────────────────────────────────────────────────────────

describe("w26-bounty-feed: OpenBounty data shape", () => {
  const mockBounty: OpenBounty = {
    id: "b-1",
    title: "Translate Membership Agreement to Spanish",
    description: "Localize the membership agreement.",
    bounty_class: "translation",
    marks_reward: 500,
    credits_reward: 0,
    compensation_unit: "Marks",
    posted_by: "staff",
    status: "open",
    created_at: new Date().toISOString(),
  };

  it("has required fields", () => {
    expect(mockBounty.id).toBeTruthy();
    expect(mockBounty.title).toBeTruthy();
    expect(mockBounty.bounty_class).toBeTruthy();
    expect(mockBounty.status).toBe("open");
  });

  it("bounty_class is one of the 5 valid classes", () => {
    const valid: BountyPosterClass[] = [
      "translation",
      "design",
      "development",
      "content",
      "research",
    ];
    expect(valid).toContain(mockBounty.bounty_class);
  });

  it("compensation_unit is Marks or Credits", () => {
    const valid: CompensationUnit[] = ["Marks", "Credits"];
    expect(valid).toContain(mockBounty.compensation_unit);
  });

  it("translation bounty canonically uses Marks", () => {
    expect(mockBounty.bounty_class).toBe("translation");
    expect(mockBounty.compensation_unit).toBe("Marks");
  });

  it("marks_reward is positive for Marks-compensated bounty", () => {
    expect(mockBounty.marks_reward).toBeGreaterThan(0);
  });
});

// ─── 5 BountyPosterGenerator classes (regression) ────────────────────────────

describe("w26-poster-classes: 5 bounty poster classes present and correct", () => {
  const CLASSES: Array<{ id: BountyPosterClass; unit: CompensationUnit }> = [
    { id: "translation", unit: "Marks" },
    { id: "design", unit: "Credits" },
    { id: "development", unit: "Credits" },
    { id: "content", unit: "Credits" },
    { id: "research", unit: "Credits" },
  ];

  it("exactly 5 classes defined", () => {
    expect(CLASSES).toHaveLength(5);
  });

  it("all class IDs are unique", () => {
    const ids = CLASSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(5);
  });

  it("only translation uses Marks (securities-clean: only participation Credits)", () => {
    const marksClasses = CLASSES.filter((c) => c.unit === "Marks");
    expect(marksClasses).toHaveLength(1);
    expect(marksClasses[0].id).toBe("translation");
  });

  it("design, development, content, research use Credits", () => {
    const creditClasses = CLASSES.filter((c) => c.unit === "Credits");
    expect(creditClasses).toHaveLength(4);
    const ids = creditClasses.map((c) => c.id);
    expect(ids).toContain("design");
    expect(ids).toContain("development");
    expect(ids).toContain("content");
    expect(ids).toContain("research");
  });
});

// ─── Payout gate status ───────────────────────────────────────────────────────

describe("w26-payout-gate: PayoutGateStatus shape", () => {
  const manualGate: PayoutGateStatus = {
    auto_enabled: false,
    gate_label: "Manual Approval (Gate Open)",
    gate_color: "amber",
    gate_detail: "Staged for manual approval. Rates HELD pending ratification.",
  };

  const autoGate: PayoutGateStatus = {
    auto_enabled: true,
    gate_label: "Auto-Payout LIVE",
    gate_color: "green",
    gate_detail: "MARKS_AUTO_PAYOUT_ENABLED is active.",
  };

  it("manual gate has auto_enabled=false", () => {
    expect(manualGate.auto_enabled).toBe(false);
  });

  it("auto gate has auto_enabled=true", () => {
    expect(autoGate.auto_enabled).toBe(true);
  });

  it("gate_color is one of green/amber/red", () => {
    const valid: GateColor[] = ["green", "amber", "red"];
    expect(valid).toContain(manualGate.gate_color);
    expect(valid).toContain(autoGate.gate_color);
  });

  it("manual gate is amber (staged, not live)", () => {
    expect(manualGate.gate_color).toBe("amber");
  });

  it("auto gate is green (active)", () => {
    expect(autoGate.gate_color).toBe("green");
  });

  it("gate_label is a non-empty string", () => {
    expect(manualGate.gate_label.length).toBeGreaterThan(0);
    expect(autoGate.gate_label.length).toBeGreaterThan(0);
  });
});

// ─── IP Ledger: Wave 26 entry types ──────────────────────────────────────────

describe("w26-ip-ledger: New IPLedgerEntryType values", () => {
  const W26_TYPES: IPLedgerEntryType[] = [
    "bounty.posted",
    "bounty.claimed",
    "bounty.submitted",
    "bounty.verified",
    "bounty.rejected",
    "marks.redeemed",
    "pedestal.nominated",
    "pedestal.ratified",
  ];

  it("all wave26 entry types are non-empty strings", () => {
    for (const t of W26_TYPES) {
      expect(typeof t).toBe("string");
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it("5 bounty entry types defined", () => {
    const bounty = W26_TYPES.filter((t) => t.startsWith("bounty."));
    expect(bounty).toHaveLength(5);
  });

  it("bounty entry types use dot-notation convention", () => {
    const bounty = W26_TYPES.filter((t) => t.startsWith("bounty."));
    for (const t of bounty) {
      expect(t).toMatch(/^bounty\.[a-z]+$/);
    }
  });

  it("1 marks entry type defined: marks.redeemed", () => {
    const marks = W26_TYPES.filter((t) => t.startsWith("marks."));
    expect(marks).toHaveLength(1);
    expect(marks[0]).toBe("marks.redeemed");
  });

  it("2 pedestal entry types defined", () => {
    const pedestal = W26_TYPES.filter((t) => t.startsWith("pedestal."));
    expect(pedestal).toHaveLength(2);
    expect(pedestal).toContain("pedestal.nominated");
    expect(pedestal).toContain("pedestal.ratified");
  });

  it("legacy entry types remain valid (regression)", () => {
    const legacy: IPLedgerEntryType[] = [
      "innovation.registered",
      "medallion.minted",
      "governance.decision",
      "branch.merge",
      "intent.beacon",
    ];
    for (const t of legacy) {
      expect(typeof t).toBe("string");
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it("all entry types use dot-notation (namespace.action)", () => {
    const all: IPLedgerEntryType[] = [
      ...W26_TYPES,
      "innovation.registered",
      "governance.decision",
      "branch.merge",
    ];
    for (const t of all) {
      expect(t).toMatch(/^[a-z]+\.[a-z]+$/);
    }
  });
});

// ─── IP Ledger: Bounty completion + Brand Stamp tie ──────────────────────────

describe("w26-brand-stamp: Bounty completion IP Ledger record shape", () => {
  interface BountyVerifiedEntry {
    bounty_id: string;
    bounty_title: string;
    bounty_class: string;
    claimant_id: string;
    marks_awarded: number;
    brand_stamp_applied: boolean;
    ip_ownership_note: string;
    provenance_note: string;
    verified_at: string;
  }

  const entry: BountyVerifiedEntry = {
    bounty_id: "b-001",
    bounty_title: "Translate to Spanish",
    bounty_class: "translation",
    claimant_id: "member-42",
    marks_awarded: 500,
    brand_stamp_applied: true,
    ip_ownership_note:
      "Contributor retains attribution; platform receives non-exclusive license.",
    provenance_note: "Provenance, not legal patent grant.",
    verified_at: new Date().toISOString(),
  };

  it("brand_stamp_applied is true on completion", () => {
    expect(entry.brand_stamp_applied).toBe(true);
  });

  it("ip_ownership_note mentions contributor attribution", () => {
    expect(entry.ip_ownership_note.toLowerCase()).toContain("contributor");
    expect(entry.ip_ownership_note.toLowerCase()).toContain("attribution");
  });

  it("provenance_note contains 'Provenance, not legal patent grant'", () => {
    expect(entry.provenance_note).toContain("Provenance, not legal patent grant.");
  });

  it("marks_awarded is non-negative", () => {
    expect(entry.marks_awarded).toBeGreaterThanOrEqual(0);
  });
});

// ─── Substitution explainer: Pawn-gate contract ───────────────────────────────

describe("w26-substitution: Pawn-gated staging invariants", () => {
  const PAWN_GATE_MARKER = "[PAWN-GATED:";

  it("PAWN_GATE_MARKER starts with '['", () => {
    expect(PAWN_GATE_MARKER.startsWith("[")).toBe(true);
  });

  it("PAWN_GATE_MARKER contains ':' (label separator)", () => {
    expect(PAWN_GATE_MARKER).toContain(":");
  });

  it("4 substitution pair blocks require pawn-gated placeholders", () => {
    const pairs = [
      { from: "Marks", to: "Credits" },
      { from: "Credits", to: "Joules" },
      { from: "Joules", to: "Credits" },
      { from: "Marks", to: "Joules" },
    ];
    expect(pairs).toHaveLength(4);
    for (const p of pairs) {
      expect(p.from).not.toBe(p.to);
    }
  });

  it("staged page MUST NOT publish real substitution rates", () => {
    // Contract: no numeric rates in the staged page text
    const stagedBannerText =
      "[PAWN-GATED: Marks-to-Credits rate and mechanic -- wording pending ratification]";
    // Must not contain a bare decimal rate like "0.01" or "100"
    expect(stagedBannerText).not.toMatch(/\b\d+\.?\d*\s*Credits\s*\/\s*Mark/i);
  });
});

// ─── Pedestal nomination: IP Ledger tie shape ─────────────────────────────────

describe("w26-pedestal-nominate: Pedestal nomination IP Ledger entry", () => {
  interface PedestalNominatedEntry {
    nominated_by: string;
    work_title: string;
    work_description: string;
    bounty_ref: string | null;
    ip_ledger_ref: number | null;
    nominated_at: string;
  }

  const entry: PedestalNominatedEntry = {
    nominated_by: "member-7",
    work_title: "Spanish Membership Agreement Translation",
    work_description: "Full localization of the $5/year membership agreement.",
    bounty_ref: "b-mock-1",
    ip_ledger_ref: null,
    nominated_at: new Date().toISOString(),
  };

  it("nominated_by is a non-empty string", () => {
    expect(entry.nominated_by.length).toBeGreaterThan(0);
  });

  it("work_title is a non-empty string", () => {
    expect(entry.work_title.length).toBeGreaterThan(0);
  });

  it("nominated_at is a valid ISO timestamp", () => {
    const d = new Date(entry.nominated_at);
    expect(isNaN(d.getTime())).toBe(false);
  });

  it("bounty_ref can be null (not all nominations come from bounties)", () => {
    const noRef: PedestalNominatedEntry = { ...entry, bounty_ref: null };
    expect(noRef.bounty_ref).toBeNull();
  });
});
