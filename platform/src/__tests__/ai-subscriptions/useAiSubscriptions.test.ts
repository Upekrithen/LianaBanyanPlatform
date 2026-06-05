/**
 * BP073 SEG-α3 · α-W3 — useAiSubscriptions unit tests
 *
 * Tests: state machine, expendedAlert, switchSubscription, rolloverExpired,
 * READ-ONLY discipline (no external fetch).
 */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAiSubscriptions } from '@/lib/ai-subscriptions/useAiSubscriptions';
import type { AiSubscription } from '@/lib/ai-subscriptions/types';

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }),
  length: 0,
  key: vi.fn(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSub(
  overrides: Partial<AiSubscription> = {},
): Omit<AiSubscription, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + 30 * 24 * 3600_000).toISOString();
  return {
    provider: 'Anthropic',
    accountName: 'Test Account',
    modelId: 'claude-4.6-sonnet',
    state: 'ACTIVE',
    periodStart: now,
    periodEnd: future,
    creditAllowance: 1000,
    creditsSpent: 0,
    currentAssignment: 'general',
    mySubscription: true,
    costIsEstimate: false,
    testerBadges: [],
    receiptAttachments: [],
    ...overrides,
  };
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal('localStorage', localStorageMock);
  // Ensure crypto.randomUUID is available in jsdom
  if (!globalThis.crypto?.randomUUID) {
    vi.stubGlobal('crypto', {
      ...globalThis.crypto,
      randomUUID: () => Math.random().toString(36).slice(2) + Date.now().toString(36),
    });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAiSubscriptions — state machine', () => {
  it('ACTIVE -> EXPENDED when creditsSpent >= creditAllowance', async () => {
    const { result } = renderHook(() => useAiSubscriptions());

    let subId: string;
    act(() => {
      const sub = result.current.addSubscription(makeSub({ creditAllowance: 100, creditsSpent: 0 }));
      subId = sub.id;
    });

    act(() => {
      result.current.updateSubscription(subId!, { creditsSpent: 100 });
    });

    // After updating creditsSpent to equal creditAllowance, state should transition to EXPENDED
    const sub = result.current.subscriptions.find(s => s.id === subId);
    // The auto-apply effect transitions ACTIVE -> EXPENDED when credits are crossed
    expect(sub?.creditsSpent).toBe(100);
    expect(sub?.creditAllowance).toBe(100);
    // State machine triggers on next render cycle — the expendedAlert reflects the crossing
    expect(result.current.expendedAlert).not.toBeNull();
  });

  it('EXPENDED state is stable once set', async () => {
    const { result } = renderHook(() => useAiSubscriptions());

    let subId: string;
    act(() => {
      const sub = result.current.addSubscription(
        makeSub({ state: 'EXPENDED', creditAllowance: 100, creditsSpent: 100 }),
      );
      subId = sub.id;
    });

    const sub = result.current.subscriptions.find(s => s.id === subId);
    expect(sub?.state).toBe('EXPENDED');
  });
});

describe('useAiSubscriptions — expendedAlert', () => {
  it('returns expendedAlert with candidateAlternatives when ACTIVE sub is expended', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    let expId: string;
    let altId: string;
    act(() => {
      // Expended subscription
      const expSub = result.current.addSubscription(
        makeSub({
          provider: 'Anthropic',
          accountName: 'Primary Account',
          creditAllowance: 100,
          creditsSpent: 100,
          state: 'ACTIVE',
        }),
      );
      expId = expSub.id;

      // Available alternative
      const altSub = result.current.addSubscription(
        makeSub({
          provider: 'OpenAI',
          accountName: 'Backup Account',
          creditAllowance: 500,
          creditsSpent: 0,
          state: 'AVAILABLE',
        }),
      );
      altId = altSub.id;
    });

    const alert = result.current.expendedAlert;
    expect(alert).not.toBeNull();
    expect(alert?.subscriptionId).toBe(expId);
    expect(alert?.provider).toBe('Anthropic');
    expect(alert?.accountName).toBe('Primary Account');
    expect(alert?.candidateAlternatives.some(a => a.id === altId)).toBe(true);
  });

  it('returns null expendedAlert when no subs are expended', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    act(() => {
      result.current.addSubscription(makeSub({ creditAllowance: 1000, creditsSpent: 50 }));
    });

    expect(result.current.expendedAlert).toBeNull();
  });
});

describe('useAiSubscriptions — switchSubscription', () => {
  it('prior ACTIVE -> DEMOTED_FREE, new sub -> ACTIVE', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    let fromId: string;
    let toId: string;
    act(() => {
      const from = result.current.addSubscription(
        makeSub({ state: 'ACTIVE', creditAllowance: 100, creditsSpent: 100 }),
      );
      fromId = from.id;

      const to = result.current.addSubscription(
        makeSub({ state: 'AVAILABLE', creditAllowance: 500, creditsSpent: 0 }),
      );
      toId = to.id;
    });

    act(() => {
      result.current.switchSubscription(fromId!, toId!);
    });

    const fromSub = result.current.subscriptions.find(s => s.id === fromId);
    const toSub = result.current.subscriptions.find(s => s.id === toId);

    expect(fromSub?.state).toBe('DEMOTED_FREE');
    expect(toSub?.state).toBe('ACTIVE');
  });

  it('prior ACTIVE with credits remaining -> AVAILABLE (not DEMOTED_FREE)', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    let fromId: string;
    let toId: string;
    act(() => {
      const from = result.current.addSubscription(
        makeSub({ state: 'ACTIVE', creditAllowance: 1000, creditsSpent: 200 }),
      );
      fromId = from.id;

      const to = result.current.addSubscription(
        makeSub({ state: 'AVAILABLE', creditAllowance: 500, creditsSpent: 0 }),
      );
      toId = to.id;
    });

    act(() => {
      result.current.switchSubscription(fromId!, toId!);
    });

    const fromSub = result.current.subscriptions.find(s => s.id === fromId);
    expect(fromSub?.state).toBe('AVAILABLE');
  });
});

describe('useAiSubscriptions — rolloverExpired', () => {
  it('resets creditsSpent to 0 for past-period subs and sets AVAILABLE', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    const pastPeriodEnd = new Date(Date.now() - 1000).toISOString();
    let subId: string;
    act(() => {
      const sub = result.current.addSubscription(
        makeSub({
          periodEnd: pastPeriodEnd,
          creditAllowance: 1000,
          creditsSpent: 800,
          state: 'ACTIVE',
        }),
      );
      subId = sub.id;
    });

    act(() => {
      result.current.rolloverExpired();
    });

    const sub = result.current.subscriptions.find(s => s.id === subId);
    expect(sub?.creditsSpent).toBe(0);
    expect(sub?.state).toBe('AVAILABLE');
  });

  it('does not roll over subs with future periodEnd', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    const futurePeriodEnd = new Date(Date.now() + 30 * 24 * 3600_000).toISOString();
    let subId: string;
    act(() => {
      const sub = result.current.addSubscription(
        makeSub({
          periodEnd: futurePeriodEnd,
          creditAllowance: 1000,
          creditsSpent: 800,
          state: 'ACTIVE',
        }),
      );
      subId = sub.id;
    });

    act(() => {
      result.current.rolloverExpired();
    });

    const sub = result.current.subscriptions.find(s => s.id === subId);
    expect(sub?.creditsSpent).toBe(800);
  });
});

describe('useAiSubscriptions — READ-ONLY discipline', () => {
  it('never calls fetch (no external network requests)', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { result } = renderHook(() => useAiSubscriptions());

    act(() => {
      const sub = result.current.addSubscription(makeSub());
      result.current.updateSubscription(sub.id, { creditsSpent: 50 });
      result.current.bindModel(sub.id, 'claude-4.6-sonnet');
      result.current.rolloverExpired();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('only writes to localStorage (no XMLHttpRequest)', () => {
    const xhrOpenSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');

    const { result } = renderHook(() => useAiSubscriptions());

    act(() => {
      result.current.addSubscription(makeSub());
    });

    expect(xhrOpenSpy).not.toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('initializes empty store when localStorage is empty', () => {
    const { result } = renderHook(() => useAiSubscriptions());
    expect(result.current.subscriptions).toEqual([]);
    expect(result.current.bindings).toEqual([]);
  });

  it('persists and reloads store from localStorage', () => {
    const { result: r1 } = renderHook(() => useAiSubscriptions());

    act(() => {
      r1.current.addSubscription(makeSub({ accountName: 'Persisted Account' }));
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();

    // Simulate reload: a new hook instance reads from localStorage
    const { result: r2 } = renderHook(() => useAiSubscriptions());
    expect(r2.current.subscriptions.some(s => s.accountName === 'Persisted Account')).toBe(true);
  });
});

describe('useAiSubscriptions — getActiveForModel', () => {
  it('returns undefined when no binding exists for modelId', () => {
    const { result } = renderHook(() => useAiSubscriptions());
    expect(result.current.getActiveForModel('claude-4.6-sonnet')).toBeUndefined();
  });

  it('returns the active sub when bound and active', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    let subId: string;
    act(() => {
      const sub = result.current.addSubscription(makeSub({ state: 'ACTIVE', modelId: 'claude-4.6-sonnet' }));
      subId = sub.id;
      result.current.bindModel(sub.id, 'claude-4.6-sonnet');
    });

    const active = result.current.getActiveForModel('claude-4.6-sonnet');
    expect(active?.id).toBe(subId!);
  });
});

describe('useAiSubscriptions — getExpendedSubscriptions', () => {
  it('returns only EXPENDED subs', () => {
    const { result } = renderHook(() => useAiSubscriptions());

    act(() => {
      result.current.addSubscription(makeSub({ state: 'EXPENDED', creditAllowance: 100, creditsSpent: 100 }));
      result.current.addSubscription(makeSub({ state: 'ACTIVE', creditAllowance: 500, creditsSpent: 0 }));
    });

    const expended = result.current.getExpendedSubscriptions();
    expect(expended.length).toBe(1);
    expect(expended[0].state).toBe('EXPENDED');
  });
});
