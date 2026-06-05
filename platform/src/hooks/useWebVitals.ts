// Wave 17 — Web Vitals reporting hook.
// Measures LCP, FID/INP, CLS, FCP, TTFB and dispatches them as custom events
// + logs to console in development. Extend sendToAnalytics() to wire into
// any real analytics endpoint when ready (Founder-gated activation).
//
// Budgets (from budget.json):
//   LCP  < 2500 ms  (Good)
//   FID  < 100  ms  (Good)
//   INP  < 200  ms  (Good)
//   CLS  < 0.1      (Good)
//   FCP  < 1800 ms  (Good)
//   TTFB < 800  ms  (Good)

import { useEffect } from "react";
import type { Metric } from "web-vitals";

export interface WebVitalsReport {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
  delta: number;
  navigationType: string;
}

const BUDGETS: Record<string, { good: number; needsImprovement: number }> = {
  LCP:  { good: 2500,  needsImprovement: 4000 },
  FID:  { good: 100,   needsImprovement: 300  },
  INP:  { good: 200,   needsImprovement: 500  },
  CLS:  { good: 0.1,   needsImprovement: 0.25 },
  FCP:  { good: 1800,  needsImprovement: 3000 },
  TTFB: { good: 800,   needsImprovement: 1800 },
};

function classify(
  name: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  const budget = BUDGETS[name];
  if (!budget) return "good";
  if (value <= budget.good) return "good";
  if (value <= budget.needsImprovement) return "needs-improvement";
  return "poor";
}

function sendToAnalytics(report: WebVitalsReport): void {
  // Development: log to console with colour-coded rating.
  if (import.meta.env.DEV) {
    const colour =
      report.rating === "good"
        ? "color:#22c55e"
        : report.rating === "needs-improvement"
        ? "color:#f59e0b"
        : "color:#ef4444";
    // eslint-disable-next-line no-console
    console.log(
      `%c[WebVitals] ${report.name} ${report.value.toFixed(1)} (${report.rating})`,
      colour
    );
  }

  // Dispatch as a DOM custom event so any listener (analytics, RUM) can pick
  // it up without tight coupling.
  window.dispatchEvent(
    new CustomEvent("lb:web-vital", { detail: report })
  );

  // TODO (Founder-gated): send to real analytics endpoint once credentials land.
  // Example:
  // navigator.sendBeacon('/api/vitals', JSON.stringify(report));
}

function handleMetric(metric: Metric): void {
  const report: WebVitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: classify(metric.name, metric.value),
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
  };
  sendToAnalytics(report);
}

/**
 * useWebVitals — call once at the app root (AppProviders or App).
 *
 * Dynamically imports web-vitals to ensure it never blocks the critical path.
 * Measurements are available after the browser emits them (typically after
 * page is interactive and user begins interacting for FID/INP).
 */
export function useWebVitals(): void {
  useEffect(() => {
    let cancelled = false;

    import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      if (cancelled) return;
      onCLS(handleMetric);
      onFCP(handleMetric);
      onINP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
    }).catch(() => {
      // web-vitals unavailable (old browser or SSR environment) — silent no-op.
    });

    return () => {
      cancelled = true;
    };
  }, []);
}
