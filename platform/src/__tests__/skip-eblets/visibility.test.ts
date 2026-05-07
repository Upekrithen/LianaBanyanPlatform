// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { isPaneVisuallyRenderable } from "@/lib/skip-eblets/visibility";

describe("skip-eblets visibility", () => {
  it("false when element null", () => {
    expect(isPaneVisuallyRenderable(null)).toBe(false);
  });

  it("true for connected visible div", () => {
    const el = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "10px";
    document.body.appendChild(el);
    el.getBoundingClientRect = () =>
      ({
        width: 10,
        height: 10,
        top: 0,
        left: 0,
        bottom: 10,
        right: 10,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    expect(isPaneVisuallyRenderable(el)).toBe(true);
    document.body.removeChild(el);
  });

  it("false when display none", () => {
    const el = document.createElement("div");
    el.style.display = "none";
    document.body.appendChild(el);
    expect(isPaneVisuallyRenderable(el)).toBe(false);
    document.body.removeChild(el);
  });
});
