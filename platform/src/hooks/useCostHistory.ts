/**
 * useCostHistory -- BP072 Wave 25
 * ==================================
 * Manages a member's inference cost history in localStorage.
 * DOCTRINE: transport always $0; grading is real and always displayed.
 */
import { useState, useCallback, useEffect } from "react";
import type { InferenceCost } from "@/components/CostTelemetryBadge";

const STORAGE_KEY = "lb_cost_history_v1";
const MAX_HISTORY = 200;

function loadHistory(): InferenceCost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InferenceCost[];
  } catch {
    return [];
  }
}

function saveHistory(history: InferenceCost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
  } catch {
    // Ignore storage errors
  }
}

export interface UseCostHistoryReturn {
  history: InferenceCost[];
  totalGradingUsd: number;
  addEntry: (cost: Omit<InferenceCost, "recordedAt">) => void;
  clearHistory: () => void;
}

export function useCostHistory(): UseCostHistoryReturn {
  const [history, setHistory] = useState<InferenceCost[]>(() => loadHistory());

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addEntry = useCallback((cost: Omit<InferenceCost, "recordedAt">) => {
    const entry: InferenceCost = {
      ...cost,
      recordedAt: new Date().toISOString(),
    };
    setHistory((prev) => {
      const next = [...prev, entry].slice(-MAX_HISTORY);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const totalGradingUsd = history.reduce((sum, c) => sum + c.gradingUsd, 0);

  return { history, totalGradingUsd, addEntry, clearHistory };
}
