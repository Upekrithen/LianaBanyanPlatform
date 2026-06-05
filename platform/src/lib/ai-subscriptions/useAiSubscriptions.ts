/**
 * BP073 SEG-α3 · α-W3 — useAiSubscriptions hook
 *
 * Local subscription store for AI credentials and model bindings.
 * Eblet/JSON pattern: localStorage, lb_ai_subscriptions_v1 key.
 *
 * Member-sovereign. READ-ONLY of any external source.
 * No cloud. No phone-home. Privacy doorpost: never phone-home.
 *
 * Truth-Always: most providers expose no consumer-usage API.
 * Manual-entry first; auto-pull labeled NOT YET.
 */
import { useState, useCallback, useEffect } from 'react';
import type {
  AiSubscription,
  AiSubscriptionStore,
  ExpendedAlert,
  MyModelBinding,
  SubscriptionState,
} from './types';

const STORAGE_KEY = 'lb_ai_subscriptions_v1';

function emptyStore(): AiSubscriptionStore {
  return {
    subscriptions: [],
    bindings: [],
    lastUpdated: new Date().toISOString(),
    schemaVersion: '1.0.0',
  };
}

function loadStore(): AiSubscriptionStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    return JSON.parse(raw) as AiSubscriptionStore;
  } catch {
    return emptyStore();
  }
}

function saveStore(store: AiSubscriptionStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

function computeState(sub: AiSubscription): SubscriptionState {
  const now = new Date().toISOString();
  if (sub.periodEnd < now) return 'EXPIRED';
  if (sub.creditsSpent >= sub.creditAllowance) return 'EXPENDED';
  return sub.state;
}

export interface UseAiSubscriptionsReturn {
  subscriptions: AiSubscription[];
  bindings: MyModelBinding[];
  expendedAlert: ExpendedAlert | null;
  addSubscription: (sub: Omit<AiSubscription, 'id' | 'createdAt' | 'updatedAt'>) => AiSubscription;
  updateSubscription: (id: string, patch: Partial<AiSubscription>) => void;
  bindModel: (subscriptionId: string, modelId: string, boundBy?: string) => void;
  getActiveForModel: (modelId: string) => AiSubscription | undefined;
  getExpendedSubscriptions: () => AiSubscription[];
  rolloverExpired: () => void;
  switchSubscription: (fromId: string, toId: string) => void;
}

export function useAiSubscriptions(): UseAiSubscriptionsReturn {
  const [store, setStore] = useState<AiSubscriptionStore>(() => loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const addSubscription = useCallback(
    (sub: Omit<AiSubscription, 'id' | 'createdAt' | 'updatedAt'>): AiSubscription => {
      const now = new Date().toISOString();
      const newSub: AiSubscription = {
        ...sub,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setStore((prev) => ({
        ...prev,
        subscriptions: [...prev.subscriptions, newSub],
        lastUpdated: now,
      }));
      return newSub;
    },
    [],
  );

  const updateSubscription = useCallback((id: string, patch: Partial<AiSubscription>): void => {
    const now = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id ? { ...s, ...patch, updatedAt: now } : s,
      ),
      lastUpdated: now,
    }));
  }, []);

  const bindModel = useCallback(
    (subscriptionId: string, modelId: string, boundBy: string = 'member'): void => {
      const now = new Date().toISOString();
      const binding: MyModelBinding = { subscriptionId, modelId, boundAt: now, boundBy };
      setStore((prev) => ({
        ...prev,
        bindings: [
          ...prev.bindings.filter((b) => b.modelId !== modelId),
          binding,
        ],
        lastUpdated: now,
      }));
    },
    [],
  );

  const getActiveForModel = useCallback(
    (modelId: string): AiSubscription | undefined => {
      const binding = store.bindings.find((b) => b.modelId === modelId);
      if (!binding) return undefined;
      return store.subscriptions.find(
        (s) => s.id === binding.subscriptionId && s.state === 'ACTIVE',
      );
    },
    [store],
  );

  const getExpendedSubscriptions = useCallback((): AiSubscription[] => {
    return store.subscriptions.filter((s) => s.state === 'EXPENDED');
  }, [store]);

  const rolloverExpired = useCallback((): void => {
    const now = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => {
        if (s.periodEnd < now && s.creditsSpent >= 0) {
          // Period has ended: reset creditsSpent and set AVAILABLE for reassignment
          return {
            ...s,
            creditsSpent: 0,
            state: 'AVAILABLE' as SubscriptionState,
            updatedAt: now,
          };
        }
        return s;
      }),
      lastUpdated: now,
    }));
  }, []);

  const switchSubscription = useCallback((fromId: string, toId: string): void => {
    const now = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => {
        if (s.id === fromId && (s.state === 'ACTIVE' || s.state === 'EXPENDED')) {
          // Demote based on whether credits remain
          const demotedState: SubscriptionState =
            s.creditsSpent < s.creditAllowance ? 'AVAILABLE' : 'DEMOTED_FREE';
          return { ...s, state: demotedState, updatedAt: now };
        }
        if (s.id === toId) {
          return { ...s, state: 'ACTIVE', updatedAt: now };
        }
        return s;
      }),
      lastUpdated: now,
    }));
  }, []);

  // Derive expended alert: first EXPENDED sub (state machine already ran)
  const expendedAlert: ExpendedAlert | null = (() => {
    const expended = store.subscriptions.find((s) => s.state === 'EXPENDED');
    if (!expended) return null;
    const candidates = store.subscriptions.filter(
      (s) =>
        s.id !== expended.id &&
        (s.state === 'ACTIVE' || s.state === 'AVAILABLE') &&
        s.creditsSpent < s.creditAllowance,
    );
    return {
      subscriptionId: expended.id,
      provider: expended.provider,
      accountName: expended.accountName,
      candidateAlternatives: candidates,
    };
  })();

  // Auto-apply state machine: mark any ACTIVE sub EXPENDED when credits crossed
  useEffect(() => {
    const hasExpended = store.subscriptions.some(
      (s) => s.state === 'ACTIVE' && s.creditsSpent >= s.creditAllowance,
    );
    if (!hasExpended) return;
    const now = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => {
        if (s.state === 'ACTIVE' && s.creditsSpent >= s.creditAllowance) {
          return { ...s, state: 'EXPENDED', updatedAt: now };
        }
        return s;
      }),
      lastUpdated: now,
    }));
  }, [store.subscriptions]);

  return {
    subscriptions: store.subscriptions,
    bindings: store.bindings,
    expendedAlert,
    addSubscription,
    updateSubscription,
    bindModel,
    getActiveForModel,
    getExpendedSubscriptions,
    rolloverExpired,
    switchSubscription,
  };
}
