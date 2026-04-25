/**
 * AML Coordinated-Transactions Detector — Unit Tests (K504 Phase B)
 */

import { describe, it, expect } from 'vitest';
import {
  detectTransactionCycles,
  crossReferenceTrustMatch,
  type CreditEdge,
  type TransactionCycle,
} from '../coordinated_detector';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEdges(pairs: [string, string, number][]): CreditEdge[] {
  return pairs.map(([from, to, vol]) => ({
    from_member_id: from,
    to_member_id: to,
    total_credits: vol,
    transaction_count: 1,
  }));
}

// ── detectTransactionCycles ───────────────────────────────────────────────────

describe('detectTransactionCycles', () => {
  it('detects a 3-member ring', () => {
    const edges = makeEdges([
      ['A', 'B', 200],
      ['B', 'C', 200],
      ['C', 'A', 200],
    ]);
    const cycles = detectTransactionCycles(edges, new Map());
    expect(cycles).toHaveLength(1);
    expect(cycles[0].cycleLength).toBe(3);
    expect(cycles[0].cumulativeVolume).toBe(600);
  });

  it('detects a 4-member ring', () => {
    const edges = makeEdges([
      ['A', 'B', 100],
      ['B', 'C', 100],
      ['C', 'D', 100],
      ['D', 'A', 100],
    ]);
    const cycles = detectTransactionCycles(edges, new Map());
    expect(cycles).toHaveLength(1);
    expect(cycles[0].cycleLength).toBe(4);
  });

  it('excludes cycles longer than 5 members', () => {
    const edges = makeEdges([
      ['A', 'B', 100],
      ['B', 'C', 100],
      ['C', 'D', 100],
      ['D', 'E', 100],
      ['E', 'F', 100],
      ['F', 'A', 100],
    ]);
    const cycles = detectTransactionCycles(edges, new Map());
    expect(cycles).toHaveLength(0); // 6-member ring excluded
  });

  it('returns empty for linear chain (no cycle)', () => {
    const edges = makeEdges([
      ['A', 'B', 100],
      ['B', 'C', 100],
      ['C', 'D', 100],
    ]);
    const cycles = detectTransactionCycles(edges, new Map());
    expect(cycles).toHaveLength(0);
  });

  it('deduplicates rotation variants of same ring', () => {
    // A→B→C→A and B→C→A→B are the same ring
    const edges = makeEdges([
      ['A', 'B', 150],
      ['B', 'C', 150],
      ['C', 'A', 150],
      // Also add B→A to create a 2-node cycle test (should be excluded by length < 3)
    ]);
    const cycles = detectTransactionCycles(edges, new Map());
    // Should detect exactly one 3-member ring, not duplicates
    expect(cycles).toHaveLength(1);
    expect(cycles[0].members).toHaveLength(3);
  });

  it('computes correct cumulative volume', () => {
    const edges = makeEdges([
      ['A', 'B', 100],
      ['B', 'C', 200],
      ['C', 'A', 300],
    ]);
    const cycles = detectTransactionCycles(edges, new Map());
    expect(cycles[0].cumulativeVolume).toBe(600);
  });

  it('handles multiple independent rings', () => {
    const edges = makeEdges([
      // Ring 1: A-B-C
      ['A', 'B', 100],
      ['B', 'C', 100],
      ['C', 'A', 100],
      // Ring 2: D-E-F
      ['D', 'E', 200],
      ['E', 'F', 200],
      ['F', 'D', 200],
    ]);
    const cycles = detectTransactionCycles(edges, new Map());
    expect(cycles).toHaveLength(2);
  });
});

// ── crossReferenceTrustMatch ──────────────────────────────────────────────────

describe('crossReferenceTrustMatch', () => {
  const baseCycle: TransactionCycle = {
    members: ['A', 'B', 'C'],
    cycleLength: 3,
    cumulativeVolume: 600,
    canonicalKey: 'A→B→C',
    trustMatchCrossref: false,
  };

  it('marks crossref=true when cycle member appears in Trust Match set', () => {
    const trustMatchMembers = new Set(['B', 'X', 'Y']);
    const result = crossReferenceTrustMatch([baseCycle], trustMatchMembers);
    expect(result[0].trustMatchCrossref).toBe(true);
  });

  it('leaves crossref=false when no overlap with Trust Match set', () => {
    const trustMatchMembers = new Set(['X', 'Y', 'Z']);
    const result = crossReferenceTrustMatch([baseCycle], trustMatchMembers);
    expect(result[0].trustMatchCrossref).toBe(false);
  });

  it('marks crossref=false for empty Trust Match set', () => {
    const result = crossReferenceTrustMatch([baseCycle], new Set());
    expect(result[0].trustMatchCrossref).toBe(false);
  });
});

// ── SAR gate ──────────────────────────────────────────────────────────────────

describe('SAR gate (from sar_template)', () => {
  it('throws SarGateError when classification is unclassified', async () => {
    const { assertSarGateOpen, SarGateError } = await import('../sar_template');
    expect(() => assertSarGateOpen('unclassified')).toThrow(SarGateError);
  });

  it('throws SarGateError when classification is not_msb', async () => {
    const { assertSarGateOpen, SarGateError } = await import('../sar_template');
    expect(() => assertSarGateOpen('not_msb')).toThrow(SarGateError);
  });

  it('does NOT throw when classification is msb_state_only', async () => {
    const { assertSarGateOpen } = await import('../sar_template');
    expect(() => assertSarGateOpen('msb_state_only')).not.toThrow();
  });

  it('does NOT throw when classification is msb_federal', async () => {
    const { assertSarGateOpen } = await import('../sar_template');
    expect(() => assertSarGateOpen('msb_federal')).not.toThrow();
  });
});
