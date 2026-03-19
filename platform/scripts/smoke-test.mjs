#!/usr/bin/env node
/**
 * Platform Smoke Test — 21 Critical Routes
 *
 * Verifies: build output integrity, preview server reachability,
 * SPA shell loads for every route, key assets exist.
 *
 * Usage:  node scripts/smoke-test.mjs          (after npm run build)
 *         npm run smoke                        (if wired in package.json)
 */

import { execSync, spawn } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";

const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const TIMEOUT_MS = 5000;
const STARTUP_WAIT_MS = 3000;

const CRITICAL_ROUTES = [
  // Public routes — no auth needed
  { path: "/", label: "Homepage" },
  { path: "/auth", label: "Auth / Login" },
  { path: "/ghost", label: "Ghost World (explore)" },
  { path: "/portal", label: "Portal Gateway" },
  { path: "/launch", label: "Launch Hub" },
  { path: "/faq", label: "FAQ" },
  { path: "/terms", label: "Terms of Service" },
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/patent-portfolio", label: "Patent Portfolio" },
  { path: "/developers", label: "Developer Portal" },
  { path: "/redcarpet", label: "Red Carpet" },
  { path: "/forward", label: "Not Left Not Right" },
  { path: "/browse/marketplace", label: "Browse Marketplace" },
  { path: "/economics", label: "Economic Laws" },
  { path: "/hard-knocks", label: "College of Hard Knocks" },
  { path: "/pedestals", label: "Pedestal Browser" },
  { path: "/why-no-ads", label: "Why No Ads" },
  { path: "/fly-on-the-wall", label: "Fly on the Wall" },
  // Protected routes — SPA shell still loads (auth check is client-side)
  { path: "/golden-key", label: "Golden Key Quest" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/keep", label: "The Keep" },
];

let passed = 0;
let failed = 0;
const failures = [];

function log(status, msg) {
  const icon = status === "pass" ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(`  ${icon} ${msg}`);
  if (status === "pass") passed++;
  else { failed++; failures.push(msg); }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ─── Phase 1: Build output checks ───

console.log("\n\x1b[1m Phase 1: Build Output Integrity\x1b[0m\n");

const distDir = resolve("dist");
if (!existsSync(distDir)) {
  console.error("  ERROR: dist/ directory not found. Run `npm run build` first.");
  process.exit(1);
}

const indexHtml = join(distDir, "index.html");
if (existsSync(indexHtml)) {
  log("pass", "dist/index.html exists");
  const html = readFileSync(indexHtml, "utf-8");
  if (html.includes('id="root"')) log("pass", "index.html contains root div");
  else log("fail", "index.html missing root div");
  if (html.includes("<script")) log("pass", "index.html includes script tags");
  else log("fail", "index.html missing script tags");
} else {
  log("fail", "dist/index.html does not exist");
}

const assetsDir = join(distDir, "assets");
if (existsSync(assetsDir)) {
  const assets = readdirSync(assetsDir);
  const jsFiles = assets.filter((f) => f.endsWith(".js"));
  const cssFiles = assets.filter((f) => f.endsWith(".css"));
  log(jsFiles.length > 0 ? "pass" : "fail", `JS bundles: ${jsFiles.length} files`);
  log(cssFiles.length > 0 ? "pass" : "fail", `CSS bundles: ${cssFiles.length} files`);
} else {
  log("fail", "dist/assets/ directory not found");
}

// ─── Phase 2: Preview server + route checks ───

console.log("\n\x1b[1m Phase 2: Preview Server + 21 Route Checks\x1b[0m\n");

let previewProc;
try {
  previewProc = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    stdio: "pipe",
    shell: true,
    cwd: resolve("."),
  });

  previewProc.stderr.on("data", () => {});
  previewProc.stdout.on("data", () => {});

  await sleep(STARTUP_WAIT_MS);

  // Verify server is up
  try {
    const res = await fetchWithTimeout(BASE);
    if (res.ok) log("pass", `Preview server responding on port ${PORT}`);
    else log("fail", `Preview server returned ${res.status}`);
  } catch {
    log("fail", `Preview server not reachable on port ${PORT}`);
    throw new Error("Server not reachable — skipping route checks");
  }

  // Check each route
  for (const route of CRITICAL_ROUTES) {
    try {
      const res = await fetchWithTimeout(`${BASE}${route.path}`);
      const body = await res.text();
      if (res.ok && body.includes('id="root"')) {
        log("pass", `${route.path} → ${route.label} (${res.status})`);
      } else {
        log("fail", `${route.path} → ${route.label} (status ${res.status}, root: ${body.includes('id="root"')})`);
      }
    } catch (e) {
      log("fail", `${route.path} → ${route.label} (${e.message})`);
    }
  }

  // Phase 3: Verify key assets are fetchable from index.html references
  console.log("\n\x1b[1m Phase 3: Asset Reachability\x1b[0m\n");

  const mainHtml = readFileSync(indexHtml, "utf-8");
  const assetRefs = [...mainHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);

  let assetChecked = 0;
  for (const ref of assetRefs.slice(0, 10)) {
    try {
      const res = await fetchWithTimeout(`${BASE}${ref}`);
      if (res.ok) {
        log("pass", `Asset ${ref.split("/").pop()} reachable`);
      } else {
        log("fail", `Asset ${ref} returned ${res.status}`);
      }
      assetChecked++;
    } catch (e) {
      log("fail", `Asset ${ref} (${e.message})`);
    }
  }
  if (assetChecked === 0) log("pass", "No inline asset refs to check (likely using dynamic imports)");

} catch (e) {
  if (e.message !== "Server not reachable — skipping route checks") {
    console.error(`  Unexpected error: ${e.message}`);
  }
} finally {
  if (previewProc) {
    previewProc.kill("SIGTERM");
    await sleep(500);
  }
}

// ─── Summary ───

console.log("\n" + "═".repeat(50));
console.log(`\x1b[1m  SMOKE TEST RESULTS: ${passed} passed, ${failed} failed\x1b[0m`);
if (failures.length > 0) {
  console.log("\x1b[31m  Failures:\x1b[0m");
  failures.forEach((f) => console.log(`    - ${f}`));
}
console.log("═".repeat(50) + "\n");

process.exit(failed > 0 ? 1 : 0);
