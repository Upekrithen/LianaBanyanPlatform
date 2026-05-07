// @vitest-environment node
import { webcrypto } from "node:crypto";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { SkipEbletChainManager, propagateBorrowChain } from "@/lib/skip-eblets/chain-manager";

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

describe("skip-eblets chain-manager", () => {
  const anchor = "urn:test:anchor";
  const tag = "2026-05-06T00:00:00.000Z#v1";

  function basePane(id: string, upstream: string | null, hold = { kind: "next_borrow" as const }) {
    const paneIndex = id === "a" ? 0 : id === "b" ? 1 : 2;
    return {
      id,
      upstreamId: upstream,
      chronosTag: tag,
      anchorUrn: anchor,
      element: null,
      holdUntil: hold,
      paneIndex,
    };
  }

  it("borrow stamps within one rAF", async () => {
    const mgr = new SkipEbletChainManager();
    const events: string[] = [];
    mgr.subscribe((e) => events.push(e.type));
    mgr.registerPane(basePane("a", null, { kind: "until_explicit_release" }));
    mgr.registerPane(basePane("b", "a"));
    await mgr.requestBorrow("b");
    expect(events).toContain("borrow_stamped");
    expect(mgr.getPane("b")?.etchingHash).toBeDefined();
  });

  it("self-heal on chronos mismatch across 3-pane chain", async () => {
    const mgr = new SkipEbletChainManager();
    const heals: string[] = [];
    mgr.subscribe((e) => {
      if (e.type === "self_heal") heals.push(e.paneId);
    });
    mgr.registerPane(basePane("a", null, { kind: "until_explicit_release" }));
    mgr.registerPane(basePane("b", "a"));
    mgr.registerPane(basePane("c", "b"));
    await propagateBorrowChain(mgr, ["a", "b", "c"]);
    mgr.setChronosTag("b", "OTHER_TAG");
    const ok = await mgr.requestBorrow("c");
    expect(ok).toBe(false);
    expect(heals.length).toBeGreaterThan(0);
  });

  it("anchor version hold terminates on bump", async () => {
    const mgr = new SkipEbletChainManager();
    const released: string[] = [];
    mgr.subscribe((e) => {
      if (e.type === "hold_released") released.push(e.hold);
    });
    mgr.registerPane({
      ...basePane("a", null),
      holdUntil: { kind: "until_anchor_version_change", anchorId: anchor },
    });
    mgr.bumpAnchorVersion(anchor);
    expect(released).toContain("until_anchor_version_change");
  });

  it("frame_count hold terminates", async () => {
    const mgr = new SkipEbletChainManager();
    const released: string[] = [];
    mgr.subscribe((e) => {
      if (e.type === "hold_released") released.push(e.hold);
    });
    mgr.registerPane({
      ...basePane("a", null),
      holdUntil: { kind: "frame_count", remaining: 2 },
    });
    await new Promise((r) => setTimeout(r, 200));
    expect(released).toContain("frame_count");
  });
});
