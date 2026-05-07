// @vitest-environment node
import { webcrypto } from "node:crypto";
import { describe, it, expect, beforeAll } from "vitest";
import { detectEtchingDrift, hashEtching } from "@/lib/skip-eblets/provenance";

beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", { value: webcrypto });
  }
});

describe("skip-eblets provenance", () => {
  it("detects drift when etching corrupted", async () => {
    const h1 = await hashEtching("urn:a", "payload", "tag1", 0);
    const h2 = await hashEtching("urn:a", "payload!", "tag1", 0);
    expect(detectEtchingDrift(h1, h2)).toBe(true);
  });

  it("stable hash for identical inputs", async () => {
    const h = await hashEtching("urn:a", "x", "t", 3);
    const h2 = await hashEtching("urn:a", "x", "t", 3);
    expect(h).toBe(h2);
  });
});
