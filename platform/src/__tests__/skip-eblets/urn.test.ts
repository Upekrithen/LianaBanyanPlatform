import { describe, it, expect } from "vitest";
import { buildSkipUrn, parseSkipUrn } from "@/lib/skip-eblets/urn";

describe("skip-eblets urn", () => {
  it("round-trips opaque chronos tag", () => {
    const tag = "2026-05-06T00:00:00.000Z#Ω16+COα";
    const urn = buildSkipUrn(tag, 7);
    expect(urn.startsWith("skip:")).toBe(true);
    const parsed = parseSkipUrn(urn);
    expect(parsed).not.toBeNull();
    expect(parsed!.chronosTag).toBe(tag);
    expect(parsed!.idx).toBe(7);
  });

  it("rejects malformed urn", () => {
    expect(parseSkipUrn("nope")).toBeNull();
    expect(parseSkipUrn("skip:")).toBeNull();
  });
});
