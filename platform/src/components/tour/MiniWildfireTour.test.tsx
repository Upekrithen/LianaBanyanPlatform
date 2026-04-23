// @vitest-environment jsdom
/**
 * MiniWildfireTour — 7-case test suite (K454 / Phase 3)
 *
 * Cases:
 *  1. Renders all allMascots at step 0
 *  2. Only steps[0].speakerId has summoned={true} at step 0
 *  3. After advancing, steps[1].speakerId is summoned; prev speaker goes muted
 *  4. Previous walks back correctly
 *  5. Skip calls onComplete
 *  6. Auto-advance fires after durationMs
 *  7. Final step's advance triggers onComplete
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MiniWildfireTour, type TourStep } from "./MiniWildfireTour";

expect.extend(jestDomMatchers);

// ── Mocks ──────────────────────────────────────────────────────────────────

// XRayContext: mock both on and off states via a module-level variable
let mockXrayOn = false;

vi.mock("@/components/museum/XRayContext", () => ({
  useXRay: () => ({
    xrayOn: mockXrayOn,
    toggleXray: vi.fn(),
    setXray: vi.fn(),
    activePanel: null,
    setActivePanel: vi.fn(),
    characterLocation: "fab",
    setCharacterLocation: vi.fn(),
    tourXrayStep: null,
    setTourXrayStep: vi.fn(),
  }),
}));

// getMascot: return minimal mascot data based on id
vi.mock("@/data/mascots", () => ({
  getMascot: (id: string) => ({
    id,
    name: id.toUpperCase(),
    title: `Title ${id}`,
    visual: {
      default: `/images/mascots/${id}/default.png`,
      hover: `/images/mascots/${id}/hover.png`,
      xray: `/images/mascots/${id}/xray.png`,
    },
    hologramTier: 1,
    lrhIntro: "",
    exitLine: "",
    domain: "why",
    kind: "specialist",
    bio: "",
    artStatus: "placeholder",
    oneLiner: "",
  }),
}));

// HologramOverlay CSS — no-op in test env
vi.mock("@/components/museum/HologramOverlay.css", () => ({}));

// ── Fixtures ───────────────────────────────────────────────────────────────

const STEPS: TourStep[] = [
  { speakerId: "owl", topic: "Topic A", message: "Message A" },
  { speakerId: "pig", topic: "Topic B", message: "Message B" },
  { speakerId: "goat", topic: "Topic C", message: "Message C" },
];

const ALL_MASCOTS = ["owl", "pig", "goat"];

function renderTour(
  overrides: Partial<Parameters<typeof MiniWildfireTour>[0]> = {}
) {
  const onComplete = vi.fn();
  const result = render(
    <MiniWildfireTour
      steps={STEPS}
      allMascots={ALL_MASCOTS}
      onComplete={onComplete}
      {...overrides}
    />
  );
  return { ...result, onComplete };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("MiniWildfireTour", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockXrayOn = false;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // Case 1 — Renders all allMascots at step 0
  it("renders all allMascots at step 0", () => {
    renderTour();
    for (const id of ALL_MASCOTS) {
      // getMascot mock returns name = id.toUpperCase()
      const img = screen.getByAltText(id.toUpperCase());
      expect(img).toBeInTheDocument();
    }
  });

  // Case 2 — Only steps[0].speakerId has summoned (colored) image at step 0
  it("only the step-0 speaker uses the colored (hover) image", () => {
    renderTour();
    // owl is the speaker — should use hover image
    const owlImg = screen.getByAltText("OWL") as HTMLImageElement;
    expect(owlImg.src).toContain("hover.png");

    // pig and goat are not speaking — should use default image
    const pigImg = screen.getByAltText("PIG") as HTMLImageElement;
    expect(pigImg.src).toContain("default.png");

    const goatImg = screen.getByAltText("GOAT") as HTMLImageElement;
    expect(goatImg.src).toContain("default.png");
  });

  // Case 3 — After Next, step-1 speaker is summoned; step-0 speaker goes muted
  it("swaps summoned state after advancing to step 1", () => {
    renderTour();

    fireEvent.click(screen.getByText(/Next →/i));

    // pig now speaks
    const pigImg = screen.getByAltText("PIG") as HTMLImageElement;
    expect(pigImg.src).toContain("hover.png");

    // owl no longer speaks
    const owlImg = screen.getByAltText("OWL") as HTMLImageElement;
    expect(owlImg.src).toContain("default.png");
  });

  // Case 4 — Previous walks back correctly
  it("Previous returns to the previous step", () => {
    renderTour();

    // Advance to step 1
    fireEvent.click(screen.getByText(/Next →/i));
    // pig should be speaking
    expect((screen.getByAltText("PIG") as HTMLImageElement).src).toContain("hover.png");

    // Walk back to step 0
    fireEvent.click(screen.getByText(/← Prev/i));
    // owl should be speaking again
    expect((screen.getByAltText("OWL") as HTMLImageElement).src).toContain("hover.png");
    expect((screen.getByAltText("PIG") as HTMLImageElement).src).toContain("default.png");
  });

  // Case 5 — Skip calls onComplete immediately
  it("Skip calls onComplete", () => {
    const { onComplete } = renderTour();
    fireEvent.click(screen.getByText(/Skip tour/i));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // Case 6 — Auto-advance fires after durationMs
  it("auto-advances after durationMs when playing", () => {
    const stepsWithDuration: TourStep[] = [
      { speakerId: "owl", topic: "A", message: "A", durationMs: 2000 },
      { speakerId: "pig", topic: "B", message: "B" },
      { speakerId: "goat", topic: "C", message: "C" },
    ];

    renderTour({ steps: stepsWithDuration, autoPlay: true });

    // Initially owl speaks
    expect((screen.getByAltText("OWL") as HTMLImageElement).src).toContain("hover.png");

    // Advance the fake timer by 2000ms
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Now pig should be speaking
    expect((screen.getByAltText("PIG") as HTMLImageElement).src).toContain("hover.png");
    expect((screen.getByAltText("OWL") as HTMLImageElement).src).toContain("default.png");
  });

  // Case 7 — Final step's advance triggers onComplete
  it("triggers onComplete when advancing past the final step", () => {
    const { onComplete } = renderTour();

    // Advance through all steps
    fireEvent.click(screen.getByText(/Next →/i)); // step 1
    fireEvent.click(screen.getByText(/Next →/i)); // step 2 (final — button now "Finish ✓")
    fireEvent.click(screen.getByText(/Finish ✓/i)); // advance past final

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

// ── X-Ray mode integration (bonus sub-cases via both on+off) ───────────────

describe("MiniWildfireTour — X-Ray mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("speaker uses xray image when X-Ray mode is ON", () => {
    mockXrayOn = true;
    renderTour();
    // owl is the speaker — xray wins over colored
    const owlImg = screen.getByAltText("OWL") as HTMLImageElement;
    expect(owlImg.src).toContain("xray.png");
  });

  it("non-speakers use default image even when X-Ray mode is ON", () => {
    mockXrayOn = true;
    renderTour();
    // pig is not speaking — stays muted (default)
    const pigImg = screen.getByAltText("PIG") as HTMLImageElement;
    expect(pigImg.src).toContain("default.png");
  });
});
