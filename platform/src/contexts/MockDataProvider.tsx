/**
 * MOCK DATA PROVIDER — Contingency Operators × Wildfire Beacon Runs
 * ==================================================================
 * Context provider that manages mock/showcase data for interactive
 * "What If?" simulations during Wildfire Beacon Runs.
 *
 * Innovation #1554: Interactive Showcase Simulation
 *
 * All data explicitly labeled as demonstration/showcase.
 * No forward-looking statements. No financial projections.
 * SEC-safe: service demonstration tooling only.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  MockField,
  Derivation,
  getMockFieldsForInterest,
  getDerivationsForInterest,
  INTEREST_MOCK_MAP,
} from "@/config/interestMockDataMap";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MockDataSet {
  interestKey: string;
  interestLabel: string;
  fields: MockField[];
  derivations: Derivation[];
  isCustomized: boolean;
  customizedAt?: Date;
}

interface MockDataContextValue {
  /** Current mock data set (null if no run active) */
  currentData: MockDataSet | null;
  /** Load mock data for a specific interest */
  loadMockData: (interestKey: string, interestLabel?: string) => void;
  /** Update a single field value (in the pending/editing buffer) */
  updateField: (key: string, value: number) => void;
  /** Apply changes from CO dialog to live view */
  applyChanges: () => void;
  /** Reset all fields to original showcase defaults */
  resetToDefaults: () => void;
  /** Reset to current custom values and signal restart */
  resetAndRestart: () => void;
  /** Whether a restart was requested (consumed by beacon run) */
  restartRequested: boolean;
  /** Clear the restart flag after handling it */
  clearRestartRequest: () => void;
  /** Get the current numeric value for a field key */
  getFieldValue: (key: string) => number;
  /** Get a derived/calculated value by key */
  getDerivedValue: (key: string) => number;
  /** Get all field values as a flat Record */
  getFieldValues: () => Record<string, number>;
  /** Get all derived values as a flat Record */
  getDerivedValues: () => Record<string, number>;
  /** Whether any fields have been modified from defaults */
  hasChanges: boolean;
  /** Unload mock data (end of run) */
  unloadMockData: () => void;
}

const MockDataContext = createContext<MockDataContextValue | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════════
// INTEREST LABEL MAP
// ═══════════════════════════════════════════════════════════════════════════════

const INTEREST_LABELS: Record<string, string> = {
  "lets-make-bread": "Let's Make Bread — Business Incubator",
  "hexisle-manufacturing": "HexIsle — Distributed Manufacturing",
  "household-concierge": "Household Concierge — Shared Butler",
  "jukebox": "JukeBox — Fair Music Licensing",
  "didasko": "Didasko — Education",
  "msa-medical": "MSA — Medical Savings Accounts",
  "salt-mines": "Salt Mines — Bounty System",
  "vsl-loans": "VSL — Voucher Short Loans",
  "family-table": "The Family Table — Private Family Ops",
  "seed-the-quan": "Seed the Quan — Community Sponsorship",
  "power-to-the-people": "Power to the People — Political Expedition",
  "cold-start": "Cold Start — City Launch Mechanics",
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [currentData, setCurrentData] = useState<MockDataSet | null>(null);
  const [restartRequested, setRestartRequested] = useState(false);

  // Load mock data for a specific interest
  const loadMockData = useCallback((interestKey: string, interestLabel?: string) => {
    const fields = getMockFieldsForInterest(interestKey).map(f => ({ ...f })); // deep copy
    const derivations = getDerivationsForInterest(interestKey);
    const label = interestLabel || INTEREST_LABELS[interestKey] || interestKey;

    setCurrentData({
      interestKey,
      interestLabel: label,
      fields,
      derivations,
      isCustomized: false,
    });
    setRestartRequested(false);
  }, []);

  // Update a single field value
  const updateField = useCallback((key: string, value: number) => {
    setCurrentData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map(f =>
          f.key === key
            ? { ...f, value: Math.min(Math.max(value, f.min), f.max) }
            : f
        ),
      };
    });
  }, []);

  // Apply changes — marks data as customized
  const applyChanges = useCallback(() => {
    setCurrentData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isCustomized: true,
        customizedAt: new Date(),
      };
    });
  }, []);

  // Reset all fields to their original default values
  const resetToDefaults = useCallback(() => {
    setCurrentData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map(f => ({ ...f, value: f.defaultValue })),
        isCustomized: false,
        customizedAt: undefined,
      };
    });
  }, []);

  // Reset and restart: current values become the new defaults, signal restart
  const resetAndRestart = useCallback(() => {
    setCurrentData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map(f => ({ ...f, defaultValue: f.value })),
        isCustomized: true,
        customizedAt: new Date(),
      };
    });
    setRestartRequested(true);
  }, []);

  const clearRestartRequest = useCallback(() => {
    setRestartRequested(false);
  }, []);

  // Get a single field value
  const getFieldValue = useCallback((key: string): number => {
    if (!currentData) return 0;
    const field = currentData.fields.find(f => f.key === key);
    return field?.value ?? 0;
  }, [currentData]);

  // Get field values as flat record
  const getFieldValues = useCallback((): Record<string, number> => {
    if (!currentData) return {};
    const values: Record<string, number> = {};
    for (const f of currentData.fields) {
      values[f.key] = f.value;
    }
    return values;
  }, [currentData]);

  // Get a derived value
  const getDerivedValue = useCallback((key: string): number => {
    if (!currentData) return 0;
    const fieldValues = getFieldValues();
    const derivation = currentData.derivations.find(d => d.key === key);
    if (!derivation) return 0;
    return derivation.calculate(fieldValues);
  }, [currentData, getFieldValues]);

  // Get all derived values
  const getDerivedValues = useCallback((): Record<string, number> => {
    if (!currentData) return {};
    const fieldValues = getFieldValues();
    const derived: Record<string, number> = {};
    for (const d of currentData.derivations) {
      derived[d.key] = d.calculate(fieldValues);
    }
    return derived;
  }, [currentData, getFieldValues]);

  // Check if any fields differ from defaults
  const hasChanges = currentData
    ? currentData.fields.some(f => f.value !== f.defaultValue)
    : false;

  // Unload all mock data
  const unloadMockData = useCallback(() => {
    setCurrentData(null);
    setRestartRequested(false);
  }, []);

  return (
    <MockDataContext.Provider
      value={{
        currentData,
        loadMockData,
        updateField,
        applyChanges,
        resetToDefaults,
        resetAndRestart,
        restartRequested,
        clearRestartRequest,
        getFieldValue,
        getDerivedValue,
        getFieldValues,
        getDerivedValues,
        hasChanges,
        unloadMockData,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

/**
 * Hook to consume MockData context.
 * Safe to call outside a provider — returns null currentData if no provider found.
 */
export function useMockData(): MockDataContextValue {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    // Return a no-op implementation when outside provider
    return {
      currentData: null,
      loadMockData: () => {},
      updateField: () => {},
      applyChanges: () => {},
      resetToDefaults: () => {},
      resetAndRestart: () => {},
      restartRequested: false,
      clearRestartRequest: () => {},
      getFieldValue: () => 0,
      getDerivedValue: () => 0,
      getFieldValues: () => ({}),
      getDerivedValues: () => ({}),
      hasChanges: false,
      unloadMockData: () => {},
    };
  }
  return context;
}

export default MockDataProvider;
