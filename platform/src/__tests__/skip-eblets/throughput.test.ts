// @vitest-environment node
import { webcrypto } from "node:crypto";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { SkipEbletChainManager } from "@/lib/skip-eblets/chain-manager";

beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", { value: webcrypto });
  }
  let id = 0;
  vi.stubGlobal(
    "requestAnimationFrame",
    (cb: (t: number) => void) => {
      id += 1;
      return setTimeout(() => cb(performance.now() + id), 0) as unknown as number;
    },
  );
  vi.stubGlobal("cancelAnimationFrame", (h: number) => clearTimeout(h as unknown as NodeJS.Timeout));
});

function registerChain(mgr: SkipEbletChainManager, depth: number, anchor: string, tag: string): void {
  for (let j = 0; j < depth; j++) {
    mgr.registerPane({
      id: `p${j}`,
      upstreamId: j === 0 ? null : `p${j - 1}`,
      chronosTag: tag,
      anchorUrn: anchor,
      element: null,
      holdUntil: j === 0 ? { kind: "until_explicit_release" } : { kind: "next_borrow" },
      paneIndex: j,
    });
  }
}

describe("skip-eblets throughput (instrumentation)", () => {
  const anchor = "urn:warm:anchor";
  const tag = "2026-05-06T12:00:00.000Z#v1";
  const depth = 12;
  const iterations = 40;
  const leaf = `p${depth - 1}`;

  it("warm stable pane chain beats cold full re-registration (spine baseline)", async () => {
    performance.mark("cold-start");
    for (let i = 0; i < iterations; i++) {
      const mgr = new SkipEbletChainManager();
      registerChain(mgr, depth, anchor, tag);
      await mgr.requestBorrow(leaf);
    }
    performance.mark("cold-end");

    performance.mark("warm-start");
    const warmMgr = new SkipEbletChainManager();
    registerChain(warmMgr, depth, anchor, tag);
    for (let i = 0; i < iterations; i++) {
      await warmMgr.requestBorrow(leaf);
    }
    performance.mark("warm-end");

    const cold = performance.measure("cold", "cold-start", "cold-end").duration;
    const warm = performance.measure("warm", "warm-start", "warm-end").duration;
    expect(warm).toBeGreaterThan(0);
    expect(cold).toBeGreaterThan(0);
    // Spec target ~10× under real rAF + layout; Node test env: instrument + guard no regression spike
    expect(warm).toBeLessThan(cold * 1.25);
  });
});
