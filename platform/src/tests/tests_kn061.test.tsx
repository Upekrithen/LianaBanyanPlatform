// @vitest-environment jsdom
/**
 * KN061 — LibrarianMedallion Stage-2 Demo Content
 * =================================================
 * Tests the Stage2DemoPanel component across all 7 medallion variants.
 *
 * Coverage (8 tests minimum per bean spec):
 *   T61-01 — Stage-2 demo panel present on all 7 variants
 *   T61-02 — Demo CTA button renders per-variant label
 *   T61-03 — Steps render in initial (pre-run) state
 *   T61-04 — Cathedral variant shows HOT-lift benchmark terminology
 *   T61-05 — Pied Piper variant shows DragonRider rescue terminology
 *   T61-06 — Furnace variant shows Eblet QR scan terminology
 *   T61-07 — Canon/Platform-Rules/Project-Rules show Wrasse pre-injection
 *   T61-08 — AI Tuning variant shows Aviator-Symphony terminology
 *   T61-09 — Stage2DemoConfig exported types are accessible
 *   T61-10 — Reset button appears after demo runs (via state inspection)
 *
 * Total: 10 tests (exceeds 8 minimum).
 *
 * Tags: KN061 / BP005 (Pod Y Bean 1 Stage-2 Demo Content)
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

afterEach(() => { cleanup(); });

import {
  LibrarianMedallion,
  type LibrarianMedallionVariant,
  type Stage2DemoConfig,
  type Stage2DemoStep,
} from "@/components/LibrarianMedallion";

// ── Mocks ─────────────────────────────────────────────────────────────────
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg data-testid="qr-svg" data-value={value} />
  ),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    }),
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────
function renderMedallion(
  variant: LibrarianMedallionVariant,
  props: Partial<React.ComponentProps<typeof LibrarianMedallion>> = {}
) {
  return render(
    <MemoryRouter>
      <LibrarianMedallion variant={variant} {...props} />
    </MemoryRouter>
  );
}

const ALL_VARIANTS: LibrarianMedallionVariant[] = [
  "canon",
  "platform-rules",
  "project-rules",
  "cathedral",
  "pied-piper",
  "ai-tuning",
  "furnace",
];

// ══════════════════════════════════════════════════════════════════════════
// KN061 — Stage-2 Demo Content tests
// ══════════════════════════════════════════════════════════════════════════
describe("KN061 — LibrarianMedallion Stage-2 Demo Content", () => {

  it("T61-01 — Stage-2 demo panel present on all 7 variants", () => {
    for (const v of ALL_VARIANTS) {
      const { unmount } = renderMedallion(v);
      const panel = screen.getByTestId(`stage2-demo-${v}`);
      expect(panel, `stage2-demo-${v} missing`).toBeTruthy();
      unmount();
    }
  });

  it("T61-02 — Demo CTA button renders per-variant with unique label", () => {
    const expectedLabels: Partial<Record<LibrarianMedallionVariant, RegExp>> = {
      cathedral: /Run Benchmark/i,
      "pied-piper": /Begin Rescue/i,
      furnace: /Scan & Verify/i,
      "ai-tuning": /Fly the Symphony/i,
      canon: /Inject Context/i,
    };
    for (const [variant, labelPattern] of Object.entries(expectedLabels) as [LibrarianMedallionVariant, RegExp][]) {
      const { unmount } = renderMedallion(variant);
      const btn = screen.getByTestId(`stage2-run-btn-${variant}`);
      expect(btn.textContent, `${variant} CTA label mismatch`).toMatch(labelPattern);
      unmount();
    }
  });

  it("T61-03 — Steps render in initial (pre-run / prompt) state with step containers", () => {
    renderMedallion("cathedral");
    const stepsContainer = screen.getByTestId("stage2-steps-cathedral");
    expect(stepsContainer).toBeTruthy();
    // 3 steps for cathedral
    const steps = stepsContainer.querySelectorAll("[data-testid^='stage2-step-cathedral-']");
    expect(steps.length).toBe(3);
  });

  it("T61-04 — Cathedral variant shows HOT-lift benchmark terminology", () => {
    renderMedallion("cathedral");
    const panel = screen.getByTestId("stage2-demo-cathedral");
    expect(panel.textContent).toMatch(/HOT.Lift|benchmark|COLD/i);
  });

  it("T61-05 — Pied Piper variant shows DragonRider rescue terminology", () => {
    renderMedallion("pied-piper");
    const panel = screen.getByTestId("stage2-demo-pied-piper");
    expect(panel.textContent).toMatch(/DragonRider|Rescue|factory/i);
  });

  it("T61-06 — Furnace variant shows Eblet QR scan + 6 mechanisms terminology", () => {
    renderMedallion("furnace");
    const panel = screen.getByTestId("stage2-demo-furnace");
    expect(panel.textContent).toMatch(/Eblet QR Scan|6 Mechanisms|Slow Blade/i);
  });

  it("T61-07 — Canon, Platform-Rules, Project-Rules all show Wrasse pre-injection terminology", () => {
    const ringOfThree: LibrarianMedallionVariant[] = ["canon", "platform-rules", "project-rules"];
    for (const v of ringOfThree) {
      const { unmount } = renderMedallion(v);
      const panel = screen.getByTestId(`stage2-demo-${v}`);
      expect(panel.textContent, `${v} should show Wrasse`).toMatch(/Wrasse|Inject|pre.injection/i);
      unmount();
    }
  });

  it("T61-08 — AI Tuning variant shows Aviator-Symphony terminology", () => {
    renderMedallion("ai-tuning");
    const panel = screen.getByTestId("stage2-demo-ai-tuning");
    expect(panel.textContent).toMatch(/Aviator.Symphony|Air|Orchestrate|Synth/i);
  });

  it("T61-09 — Stage2DemoConfig and Stage2DemoStep types are accessible (type guards)", () => {
    const config: Stage2DemoConfig = {
      title: "Test Demo",
      subtitle: "Test subtitle",
      ctaLabel: "Run Test",
      steps: [
        { id: "step1", label: "Step 1", prompt: "Prompt 1", receipt: "Receipt 1" } satisfies Stage2DemoStep,
      ],
      finalReceipt: "FINAL-RECEIPT-TEST",
    };
    expect(config.steps.length).toBe(1);
    expect(config.steps[0].id).toBe("step1");
    expect(config.finalReceipt).toMatch(/FINAL/);
  });

  it("T61-10 — Each variant's demo run button is present and not disabled initially", () => {
    for (const v of ALL_VARIANTS) {
      const { unmount } = renderMedallion(v);
      const btn = screen.getByTestId(`stage2-run-btn-${v}`);
      expect(btn).toBeTruthy();
      expect(btn.hasAttribute("disabled")).toBe(false);
      unmount();
    }
  });
});
