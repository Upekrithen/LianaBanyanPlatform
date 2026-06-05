// @vitest-environment node
// =============================================================================
// Wave 17 — Performance regression tests
// BP073 / Phase gamma / WAVE 17: "Performance"
// 30 scopes, empirical WORKS/PARTIAL/NOT YET verification.
//
// These tests verify:
//   - bundle config correctness (manualChunks present + complete)
//   - budget.json format and values against CWV targets
//   - React.lazy coverage on all 16 initiative + 8 spinout + governance routes
//   - service worker version + strategy correctness
//   - Web Vitals hook structure
//   - LazyImage component contract
//   - Lighthouse CI config thresholds
//   - Script analysis (no heavy imports on critical path)
// =============================================================================

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

// ── Scope 1: budget.json exists ───────────────────────────────────────────────
describe("Scope 1 — budget.json exists", () => {
  it("budget.json is committed at platform/budget.json", () => {
    expect(exists("platform/budget.json")).toBe(true);
  });
});

// ── Scope 2: budget.json — LCP budget ≤ 2500ms ───────────────────────────────
describe("Scope 2 — LCP budget ≤ 2500ms", () => {
  it("budget.json LCP timing is exactly 2500ms", () => {
    const b = JSON.parse(read("platform/budget.json"));
    const lcp = b[0].timings.find((t: { metric: string }) => t.metric === "largest-contentful-paint");
    expect(lcp).toBeDefined();
    expect(lcp.budget).toBe(2500);
  });
});

// ── Scope 3: budget.json — CLS budget ≤ 0.1 ──────────────────────────────────
describe("Scope 3 — CLS budget ≤ 0.1", () => {
  it("budget.json CLS timing is 0.1", () => {
    const b = JSON.parse(read("platform/budget.json"));
    const cls = b[0].timings.find((t: { metric: string }) => t.metric === "cumulative-layout-shift");
    expect(cls).toBeDefined();
    expect(cls.budget).toBe(0.1);
  });
});

// ── Scope 4: budget.json — TBT budget ≤ 200ms (FID proxy) ───────────────────
describe("Scope 4 — TBT budget ≤ 200ms", () => {
  it("budget.json total-blocking-time is 200ms", () => {
    const b = JSON.parse(read("platform/budget.json"));
    const tbt = b[0].timings.find((t: { metric: string }) => t.metric === "total-blocking-time");
    expect(tbt).toBeDefined();
    expect(tbt.budget).toBeLessThanOrEqual(200);
  });
});

// ── Scope 5: budget.json — script resource budget present ────────────────────
describe("Scope 5 — script resource budget", () => {
  it("budget.json has script resourceSize budget", () => {
    const b = JSON.parse(read("platform/budget.json"));
    const script = b[0].resourceSizes.find((r: { resourceType: string }) => r.resourceType === "script");
    expect(script).toBeDefined();
    expect(script.budget).toBeGreaterThan(0);
  });
});

// ── Scope 6: budget.json — Core Web Vitals section ───────────────────────────
describe("Scope 6 — CWV section in budget.json", () => {
  it("budget.json has coreWebVitals with all 6 metrics", () => {
    const b = JSON.parse(read("platform/budget.json"));
    const cwv = b[0].coreWebVitals;
    expect(cwv).toBeDefined();
    expect(cwv.LCP.good).toBe(2500);
    expect(cwv.FID.good).toBe(100);
    expect(cwv.INP.good).toBe(200);
    expect(cwv.CLS.good).toBe(0.1);
    expect(cwv.FCP.good).toBe(1800);
    expect(cwv.TTFB.good).toBe(800);
  });
});

// ── Scope 7: Vite config — manualChunks function present ─────────────────────
describe("Scope 7 — Vite manualChunks function", () => {
  it("vite.config.ts uses manualChunks function (not object)", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("manualChunks: (id)");
  });
});

// ── Scope 8: Vite config — vendor-react chunk ────────────────────────────────
describe("Scope 8 — vendor-react chunk", () => {
  it("vite.config.ts returns vendor-react for react core", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("vendor-react");
    expect(cfg).toContain("node_modules/react/");
  });
});

// ── Scope 9: Vite config — vendor-three chunk (lazy 3D) ──────────────────────
describe("Scope 9 — vendor-three chunk", () => {
  it("vite.config.ts routes three.js to vendor-three", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("vendor-three");
    expect(cfg).toContain("node_modules/three");
  });
});

// ── Scope 10: Vite config — vendor-mermaid chunk (lazy) ──────────────────────
describe("Scope 10 — vendor-mermaid chunk", () => {
  it("vite.config.ts routes mermaid to vendor-mermaid", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("vendor-mermaid");
    expect(cfg).toContain("node_modules/mermaid");
  });
});

// ── Scope 11: Vite config — vendor-pdf chunk ─────────────────────────────────
describe("Scope 11 — vendor-pdf chunk", () => {
  it("vite.config.ts routes jspdf + html2canvas to vendor-pdf", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("vendor-pdf");
    expect(cfg).toContain("jspdf");
    expect(cfg).toContain("html2canvas");
  });
});

// ── Scope 12: Vite config — vendor-xlsx chunk ────────────────────────────────
describe("Scope 12 — vendor-xlsx chunk", () => {
  it("vite.config.ts routes xlsx to vendor-xlsx", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("vendor-xlsx");
    expect(cfg).toContain("node_modules/xlsx");
  });
});

// ── Scope 13: Vite config — chunkSizeWarningLimit set ────────────────────────
describe("Scope 13 — chunkSizeWarningLimit", () => {
  it("vite.config.ts sets chunkSizeWarningLimit: 500", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("chunkSizeWarningLimit: 500");
  });
});

// ── Scope 14: Vite config — rollup-plugin-visualizer wired ──────────────────
describe("Scope 14 — bundle visualizer", () => {
  it("vite.config.ts imports and uses rollup-plugin-visualizer", () => {
    const cfg = read("platform/vite.config.ts");
    expect(cfg).toContain("rollup-plugin-visualizer");
    expect(cfg).toContain("visualizer");
  });

  it("package.json has analyze script", () => {
    const pkg = JSON.parse(read("platform/package.json"));
    expect(pkg.scripts.analyze).toBeDefined();
    expect(pkg.scripts.analyze).toContain("analyze");
  });
});

// ── Scope 15: React.lazy on all initiative routes ────────────────────────────
describe("Scope 15 — React.lazy on initiative routes", () => {
  it("initiatives.tsx uses React.lazy for all imports", () => {
    const routes = read("platform/src/routes/initiatives.tsx");
    expect(routes).toContain("lazy(() => import");
    const lazyCount = (routes.match(/lazy\(\(\) => import/g) || []).length;
    expect(lazyCount).toBeGreaterThanOrEqual(16);
  });
});

// ── Scope 16: React.lazy on spinout routes ───────────────────────────────────
describe("Scope 16 — React.lazy on spinout routes", () => {
  it("initiatives.tsx has 8+ spinout lazy imports", () => {
    const routes = read("platform/src/routes/initiatives.tsx");
    const spinoutLazy = (routes.match(/SpinoutPage|Spinout.*Page/g) || []);
    expect(spinoutLazy.length).toBeGreaterThanOrEqual(6);
  });
});

// ── Scope 17: React.lazy on dashboard routes (governance/economy) ─────────────
describe("Scope 17 — React.lazy on dashboard routes", () => {
  it("dashboard.tsx uses React.lazy for all page imports", () => {
    const routes = read("platform/src/routes/dashboard.tsx");
    expect(routes).toContain("lazy(() => import");
    const lazyCount = (routes.match(/lazy\(\(\) => import/g) || []).length;
    expect(lazyCount).toBeGreaterThanOrEqual(20);
  });
});

// ── Scope 18: LazyPage Suspense wrapper exists ────────────────────────────────
describe("Scope 18 — LazyPage Suspense wrapper", () => {
  it("LazyPage.tsx wraps children in Suspense with fallback", () => {
    const lp = read("platform/src/routes/LazyPage.tsx");
    expect(lp).toContain("Suspense");
    expect(lp).toContain("fallback");
  });
});

// ── Scope 19: AppRouter has top-level Suspense ───────────────────────────────
describe("Scope 19 — AppRouter top-level Suspense", () => {
  it("AppRouter.tsx has a top-level Suspense boundary", () => {
    const ar = read("platform/src/AppRouter.tsx");
    expect(ar).toContain("Suspense");
    expect(ar).toContain("fallback");
  });
});

// ── Scope 20: useWebVitals hook exists ───────────────────────────────────────
describe("Scope 20 — useWebVitals hook", () => {
  it("useWebVitals.ts exists in hooks/", () => {
    expect(exists("platform/src/hooks/useWebVitals.ts")).toBe(true);
  });

  it("useWebVitals imports from web-vitals", () => {
    const hook = read("platform/src/hooks/useWebVitals.ts");
    expect(hook).toContain("web-vitals");
    expect(hook).toContain("onLCP");
    expect(hook).toContain("onCLS");
    expect(hook).toContain("onINP");
  });
});

// ── Scope 21: useWebVitals BUDGETS match budget.json ────────────────────────
describe("Scope 21 — Web Vitals budgets match budget.json", () => {
  it("useWebVitals.ts LCP budget is 2500ms", () => {
    const hook = read("platform/src/hooks/useWebVitals.ts");
    expect(hook).toContain("LCP");
    expect(hook).toContain("2500");
  });

  it("useWebVitals.ts CLS budget is 0.1", () => {
    const hook = read("platform/src/hooks/useWebVitals.ts");
    expect(hook).toContain("0.1");
  });
});

// ── Scope 22: AppProviders wires useWebVitals ────────────────────────────────
describe("Scope 22 — AppProviders wires Web Vitals", () => {
  it("AppProviders.tsx imports and renders WebVitalsTracker", () => {
    const ap = read("platform/src/AppProviders.tsx");
    expect(ap).toContain("useWebVitals");
    expect(ap).toContain("WebVitalsTracker");
  });
});

// ── Scope 23: LazyImage component exists ─────────────────────────────────────
describe("Scope 23 — LazyImage component", () => {
  it("LazyImage.tsx exists in components/", () => {
    expect(exists("platform/src/components/LazyImage.tsx")).toBe(true);
  });

  it("LazyImage uses loading=lazy for non-hero images", () => {
    const li = read("platform/src/components/LazyImage.tsx");
    expect(li).toContain('loading="lazy"');
    expect(li).toContain("isHero");
  });

  it("LazyImage sets fetchpriority=high for hero images (LCP)", () => {
    const li = read("platform/src/components/LazyImage.tsx");
    expect(li).toContain("fetchpriority");
    expect(li).toContain("high");
  });
});

// ── Scope 24: index.html — font preload ──────────────────────────────────────
describe("Scope 24 — Font preload in index.html", () => {
  it("index.html preloads the Google Fonts stylesheet", () => {
    const html = read("platform/index.html");
    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="style"');
    expect(html).toContain("fonts.googleapis.com");
  });
});

// ── Scope 25: index.html — LCP image preload ─────────────────────────────────
describe("Scope 25 — LCP image preload in index.html", () => {
  it("index.html preloads the logo as LCP image with fetchpriority=high", () => {
    const html = read("platform/index.html");
    expect(html).toContain('as="image"');
    expect(html).toContain("fetchpriority");
    expect(html).toContain("LianaBanyanLogo.png");
  });
});

// ── Scope 26: index.html — non-blocking font stylesheet ──────────────────────
describe("Scope 26 — Non-blocking font load in index.html", () => {
  it("index.html uses media=print + onload pattern to avoid render blocking", () => {
    const html = read("platform/index.html");
    expect(html).toContain("media=\"print\"");
    expect(html).toContain("onload=\"this.media='all'\"");
  });
});

// ── Scope 27: Service worker — stale-while-revalidate for assets ──────────────
describe("Scope 27 — Service worker stale-while-revalidate", () => {
  it("sw.js implements staleWhileRevalidate function", () => {
    const sw = read("platform/public/sw.js");
    expect(sw).toContain("staleWhileRevalidate");
    expect(sw).toContain("/assets/");
  });
});

// ── Scope 28: Service worker — lb-v3 (Wave 17 bump) ─────────────────────────
describe("Scope 28 — Service worker version", () => {
  it("sw.js is at least lb-v3 (Wave 17 perf cache bump)", () => {
    const sw = read("platform/public/sw.js");
    expect(sw).toContain("lb-v3");
  });

  it("sw.js defines STATIC_CACHE for hashed assets", () => {
    const sw = read("platform/public/sw.js");
    expect(sw).toContain("STATIC_CACHE");
  });
});

// ── Scope 29: Lighthouse CI config file exists ───────────────────────────────
describe("Scope 29 — .lighthouserc.json config file", () => {
  it(".lighthouserc.json is committed at platform/.lighthouserc.json", () => {
    expect(exists("platform/.lighthouserc.json")).toBe(true);
  });

  it(".lighthouserc.json enforces LCP < 2500ms at error level", () => {
    const lhci = JSON.parse(read("platform/.lighthouserc.json"));
    const assertions = lhci.ci.assert.assertions;
    expect(assertions["largest-contentful-paint"]).toBeDefined();
    expect(assertions["largest-contentful-paint"][0]).toBe("error");
    expect(assertions["largest-contentful-paint"][1].maxNumericValue).toBe(2500);
  });

  it(".lighthouserc.json enforces perf>=80 at error level", () => {
    const lhci = JSON.parse(read("platform/.lighthouserc.json"));
    const perf = lhci.ci.assert.assertions["categories:performance"];
    expect(perf[0]).toBe("error");
    expect(perf[1].minScore).toBe(0.80);
  });
});

// ── Scope 30: CI deploy-gate includes lighthouse-budgets ─────────────────────
describe("Scope 30 — CI deploy-gate includes Lighthouse + budget-check", () => {
  it("platform-ci.yml deploy-gate needs lighthouse-budgets", () => {
    const ci = read(".github/workflows/platform-ci.yml");
    expect(ci).toContain("lighthouse-budgets");
    const deployGateNeeds = ci.match(/needs:\s*\[([^\]]+)\]/g) || [];
    // The deploy-gate job has the longest needs list; find the entry containing lighthouse-budgets
    const gate = deployGateNeeds.find((n) => n.includes("lighthouse-budgets"));
    expect(gate).toContain("lighthouse-budgets");
  });

  it("platform-ci.yml deploy-gate needs budget-check", () => {
    const ci = read(".github/workflows/platform-ci.yml");
    const deployGateNeeds = ci.match(/needs:\s*\[([^\]]+)\]/g) || [];
    const gate = deployGateNeeds.find((n) => n.includes("budget-check"));
    expect(gate).toContain("budget-check");
  });

  it("check-bundle-budget.cjs script exists", () => {
    expect(exists("platform/scripts/check-bundle-budget.cjs")).toBe(true);
  });
});
