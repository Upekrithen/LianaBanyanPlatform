/**
 * Conductor Context Windows — test suite
 * K525 · Phase A.3
 */

import { describe, it, expect } from "vitest";
import {
  getContextWindow,
  modelFits,
  filterByTokenBudget,
} from "../contextWindows";
import type { ModelVendorPair } from "../rankings";

describe("Context-window registry", () => {
  it("returns the registered window for a known model", () => {
    const cw = getContextWindow("claude-sonnet-4-6");
    expect(cw.maxTokens).toBe(200_000);
    expect(cw.outputReserve).toBe(8_000);
  });

  it("returns the fallback window for an unknown model", () => {
    const cw = getContextWindow("nonexistent-model-xyz");
    expect(cw.modelId).toBe("_unknown");
    expect(cw.maxTokens).toBe(128_000);
  });

  it("modelFits accepts a prompt that fits", () => {
    expect(modelFits("claude-sonnet-4-6", 100_000)).toBe(true);
  });

  it("modelFits rejects a prompt that exceeds context", () => {
    // 200K - 8K reserve = 192K usable input. 200K input does not fit.
    expect(modelFits("claude-sonnet-4-6", 200_000)).toBe(false);
  });

  it("modelFits boundary case: input exactly fills usable space", () => {
    const cw = getContextWindow("claude-sonnet-4-6");
    const usable = cw.maxTokens - cw.outputReserve;
    expect(modelFits("claude-sonnet-4-6", usable)).toBe(true);
    expect(modelFits("claude-sonnet-4-6", usable + 1)).toBe(false);
  });
});

describe("filterByTokenBudget", () => {
  const ranking: ModelVendorPair[] = [
    {
      vendor: "openai",
      model: "gpt-5-4-mini",
      hotPercent: 90,
      costPerHot: 0.001,
      source: "r13",
      rankingAgeDays: 0,
    },
    {
      vendor: "anthropic",
      model: "claude-sonnet-4-6",
      hotPercent: 85,
      costPerHot: 0.002,
      source: "r13",
      rankingAgeDays: 0,
    },
    {
      vendor: "google",
      model: "gemini-2-5-flash",
      hotPercent: 80,
      costPerHot: 0.0005,
      source: "r13",
      rankingAgeDays: 0,
    },
  ];

  it("returns all when prompt fits everything", () => {
    const r = filterByTokenBudget(ranking, 50_000);
    expect(r.fit).toHaveLength(3);
    expect(r.demoted).toHaveLength(0);
  });

  it("demotes models that overflow", () => {
    // 150_000 input → gpt-5-4-mini has only 128K, demoted; sonnet 200K and gemini 1M fit
    const r = filterByTokenBudget(ranking, 150_000);
    expect(r.fit.map((m) => m.model)).toEqual([
      "claude-sonnet-4-6",
      "gemini-2-5-flash",
    ]);
    expect(r.demoted).toHaveLength(1);
    expect(r.demoted[0].model).toBe("gpt-5-4-mini");
    expect(r.demoted[0].maxTokens).toBe(128_000);
  });

  it("demotes everything when nothing fits — caller must handle empty fit", () => {
    const r = filterByTokenBudget(ranking, 5_000_000);
    // 5M input — sonnet (200K) and gpt-5-4-mini (128K) overflow; gemini 1M overflows too
    expect(r.fit).toHaveLength(0);
    expect(r.demoted).toHaveLength(3);
  });

  it("preserves original ranking order in fit", () => {
    const r = filterByTokenBudget(ranking, 100_000);
    expect(r.fit[0].model).toBe("gpt-5-4-mini");
    expect(r.fit[1].model).toBe("claude-sonnet-4-6");
    expect(r.fit[2].model).toBe("gemini-2-5-flash");
  });
});
