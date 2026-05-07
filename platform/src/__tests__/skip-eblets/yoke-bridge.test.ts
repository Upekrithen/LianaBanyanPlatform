// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  CrossSurfaceCoherenceHub,
  deserializeAnchorFromYoke,
  serializeAnchorForYoke,
} from "@/lib/skip-eblets";

describe("skip-eblets yoke-bridge", () => {
  it("serializes and deserializes anchor URN", () => {
    const u = "urn:lb:anchor:test-123";
    const w = serializeAnchorForYoke(u);
    expect(deserializeAnchorFromYoke(w).anchorUrn).toBe(u);
  });

  it("multi-surface listeners receive concurrent bumps", () => {
    const hub = new CrossSurfaceCoherenceHub();
    const heard: string[] = [];
    const offH = hub.subscribe("urn:x", () => heard.push("hearth"));
    const offM = hub.subscribe("urn:x", () => heard.push("helm"));
    hub.publishAnchorBump("urn:x");
    expect(heard).toEqual(["hearth", "helm"]);
    offH();
    offM();
  });
});
