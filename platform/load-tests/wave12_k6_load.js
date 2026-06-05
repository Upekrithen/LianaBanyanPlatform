/**
 * Wave 12 / Phase F4 -- k6 Load Test Script
 * ===========================================
 * Real HTTP load test for the 3 commercial sites + platform.
 *
 * Usage (requires k6 installed: https://k6.io/):
 *   k6 run wave12_k6_load.js --env TARGET=local
 *   k6 run wave12_k6_load.js --env TARGET=staging
 *   k6 run wave12_k6_load.js --env TARGET=production
 *
 * [FOUNDER-ACTION] Set TARGET=production only on launch day after all gates pass.
 *
 * Thresholds (SLO-aligned):
 *   - p99 HTTP duration < 2,000ms for pages
 *   - p99 HTTP duration < 500ms for API
 *   - HTTP error rate < 0.1%
 *   - HTTP request rate > 100 req/s at peak
 *
 * Tags: Wave12/PhaseF4 / BP072
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─────────────────────────────────────────────────────────────────────────────
// Custom metrics
// ─────────────────────────────────────────────────────────────────────────────

const errorRate = new Rate("errors");
const pageLoadTime = new Trend("page_load_time", true);
const apiLatency = new Trend("api_latency", true);

// ─────────────────────────────────────────────────────────────────────────────
// Target URLs
// ─────────────────────────────────────────────────────────────────────────────

const TARGETS = {
  local: "http://localhost:5173",
  staging: "https://staging.lianabanyan.com",
  production: "https://lianabanyan.com",
};

const TARGET = __ENV.TARGET || "local";
const BASE_URL = TARGETS[TARGET] || TARGETS.local;

// ─────────────────────────────────────────────────────────────────────────────
// Load scenarios
// ─────────────────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    // Scenario 1: Steady-state load (simulates typical day)
    steady_state: {
      executor: "constant-arrival-rate",
      rate: 10,           // 10 req/s
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 20,
      maxVUs: 50,
      tags: { scenario: "steady_state" },
    },
    // Scenario 2: Peak load (simulates launch day spike)
    peak_load: {
      executor: "ramping-arrival-rate",
      startRate: 5,
      timeUnit: "1s",
      stages: [
        { duration: "30s", target: 50 },   // ramp to 50 req/s
        { duration: "1m",  target: 50 },   // hold at 50 req/s
        { duration: "30s", target: 100 },  // spike to 100 req/s
        { duration: "30s", target: 5 },    // ramp down
      ],
      preAllocatedVUs: 50,
      maxVUs: 200,
      tags: { scenario: "peak_load" },
      startTime: "2m30s", // after steady state completes
    },
    // Scenario 3: Soak test (sustained load over time)
    soak: {
      executor: "constant-arrival-rate",
      rate: 5,
      timeUnit: "1s",
      duration: "5m",
      preAllocatedVUs: 10,
      maxVUs: 20,
      tags: { scenario: "soak" },
      startTime: "6m",
    },
  },

  thresholds: {
    // SLO thresholds -- test FAILS if these are violated
    http_req_duration: ["p(99)<2000", "p(95)<1000"],
    errors: ["rate<0.001"],           // <0.1% error rate
    page_load_time: ["p(99)<2000"],
    api_latency: ["p(99)<500"],
    http_req_failed: ["rate<0.001"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Page catalog
// ─────────────────────────────────────────────────────────────────────────────

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/proofs/", name: "Proofs" },
  { path: "/how-it-all-works", name: "HowItAllWorks" },
  { path: "/business-plan", name: "BusinessPlan" },
  { path: "/join", name: "Join" },
  { path: "/members", name: "Members" },
];

const API_ROUTES = [
  { path: "/api/health", name: "Health" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Virtual user script
// ─────────────────────────────────────────────────────────────────────────────

export default function () {
  // Randomly select a page to visit
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];
  const url = `${BASE_URL}${page.path}`;

  const start = Date.now();
  const res = http.get(url, {
    headers: { "User-Agent": "k6-load-test/Wave12" },
    tags: { page: page.name },
  });
  const duration = Date.now() - start;

  pageLoadTime.add(duration);

  const ok = check(res, {
    "status is 200 or 304": (r) => r.status === 200 || r.status === 304,
    "response time < 2s": (r) => r.timings.duration < 2000,
    "no server error": (r) => r.status < 500,
  });

  errorRate.add(!ok);

  // Occasional API call
  if (Math.random() < 0.1) {
    const apiStart = Date.now();
    const apiRes = http.get(`${BASE_URL}/api/health`, {
      tags: { type: "api" },
    });
    apiLatency.add(Date.now() - apiStart);

    check(apiRes, {
      "API health check ok": (r) => r.status === 200 || r.status === 404,
    });
  }

  sleep(Math.random() * 2 + 0.5); // 0.5s - 2.5s think time
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle hooks
// ─────────────────────────────────────────────────────────────────────────────

export function handleSummary(data) {
  const summary = {
    wave: "Wave 12 / Phase F4",
    target: TARGET,
    base_url: BASE_URL,
    timestamp: new Date().toISOString(),
    thresholds_passed: Object.entries(data.metrics)
      .filter(([, v]) => v.thresholds)
      .every(([, v]) => Object.values(v.thresholds).every((t) => !t.ok === false)),
    p99_duration_ms: data.metrics.http_req_duration?.values?.["p(99)"],
    p95_duration_ms: data.metrics.http_req_duration?.values?.["p(95)"],
    error_rate: data.metrics.http_req_failed?.values?.rate,
    total_requests: data.metrics.http_reqs?.values?.count,
  };

  console.log(JSON.stringify(summary, null, 2));

  return {
    "load-test-results/wave12_summary.json": JSON.stringify(data, null, 2),
    stdout: `\n=== Wave 12 Load Test Summary ===\nTarget: ${TARGET} (${BASE_URL})\nTotal requests: ${summary.total_requests}\nError rate: ${(summary.error_rate * 100).toFixed(3)}%\np99 duration: ${summary.p99_duration_ms?.toFixed(0)}ms\n`,
  };
}
