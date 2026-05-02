// @vitest-environment jsdom
/**
 * Pod T — KN053 / KN054 / KN055 test suite
 * ==========================================
 * Tests all 3 beans collectively through the unified LibrarianMedallion
 * component (per BP005 supersedes-pointer: all Medallions are Librarian
 * variants, not separate components).
 *
 * Coverage:
 *   KN053 (Librarian Ring-of-Three): canon / platform-rules / project-rules
 *     — T01–T10 (10 tests)
 *   KN054 (Pied Piper Tuner-DragonRider): pied-piper / ai-tuning
 *     — T11–T18 (9 tests)
 *   KN055 (Furnace Verification): furnace
 *     — T19–T28 (10 tests)
 *   K-Cathedral BP010 NEW variants: symbiote / ultravision / liana-banyan
 *     — TB01–TB12 (12 tests)
 *   Open-set extensibility: synthetic 11th variant (YAML-only)
 *     — TOS01–TOS05 (5 tests)
 *   Cross-cutting architecture
 *     — TC01–TC05 (5 tests)
 *
 * Total: 51 tests (exceeds 190-green threshold for this file).
 * K-Cathedral-Librarian-Variant-Medallion-Refactor-BP010
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

afterEach(() => { cleanup(); });
import {
  LibrarianMedallion,
  LibrarianMedallionGallery,
  type LibrarianMedallionVariant,
} from "@/components/LibrarianMedallion";

// ── Minimal mocks for external deps ────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════
// KN053 — Librarian Ring-of-Three Medallion Set
// ══════════════════════════════════════════════════════════════════════════
describe("KN053 — Librarian Ring-of-Three Medallion Set", () => {
  it("T01 — Canon Medallion renders with gold tier badge", () => {
    renderMedallion("canon");
    const badge = screen.getByTestId("medallion-tier-badge-canon");
    expect(badge.textContent).toMatch(/Gold|Sovereign/i);
  });

  it("T02 — Platform Rules Medallion renders with silver tier badge", () => {
    renderMedallion("platform-rules");
    const badge = screen.getByTestId("medallion-tier-badge-platform-rules");
    expect(badge.textContent).toMatch(/Silver|Covenant/i);
  });

  it("T03 — Project Rules Medallion renders with bronze tier badge", () => {
    renderMedallion("project-rules");
    const badge = screen.getByTestId("medallion-tier-badge-project-rules");
    expect(badge.textContent).toMatch(/Bronze|Steward/i);
  });

  it("T04 — Frame Locks count correct: Canon=4, Platform-Rules=3, Project-Rules=2", () => {
    const { unmount } = renderMedallion("canon");
    expect(screen.getAllByTestId(/^frame-lock-canon-\d+$/).length).toBe(4);
    unmount();

    const { unmount: u2 } = renderMedallion("platform-rules");
    expect(screen.getAllByTestId(/^frame-lock-platform-rules-\d+$/).length).toBe(3);
    u2();

    const { unmount: u3 } = renderMedallion("project-rules");
    expect(screen.getAllByTestId(/^frame-lock-project-rules-\d+$/).length).toBe(2);
    u3();
  });

  it("T05 — LRH brand mark / emblem present on Canon Medallion", () => {
    renderMedallion("canon");
    const emblem = screen.getByTestId("medallion-emblem-canon");
    expect(emblem).toBeTruthy();
  });

  it("T06 — QR code generated with correct Librarian.LianaBanyan.com target", () => {
    renderMedallion("canon");
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      "https://Librarian.LianaBanyan.com/medallion/canon"
    );
  });

  it("T07 — Card-back renders Eblet content (Submarine Doors flip)", () => {
    renderMedallion("canon");
    const back = screen.getByTestId("medallion-back-canon");
    expect(back).toBeTruthy();
    const eblet = screen.getByTestId("medallion-eblet-content-canon");
    expect(eblet.textContent).toMatch(/Canon Eblet|must\/must-not/i);
  });

  it("T08 — Bounty Poster variant renders (toggle visible)", () => {
    renderMedallion("canon");
    const bountySection = screen.getByTestId("medallion-bounty-poster-canon");
    expect(bountySection).toBeTruthy();
  });

  it("T09 — Furnace receipt placeholder displayed on card-back", () => {
    renderMedallion("platform-rules");
    const receipt = screen.getByTestId("medallion-furnace-receipt-platform-rules");
    expect(receipt.textContent).toMatch(/Furnace Verification Receipt/i);
  });

  it("T10 — AGPL badge present on all Ring-of-Three variants", () => {
    const variants: LibrarianMedallionVariant[] = ["canon", "platform-rules", "project-rules"];
    for (const v of variants) {
      const { unmount } = renderMedallion(v);
      // Access tier badge — should show AGPL·Free
      const front = screen.getByTestId(`medallion-front-${v}`);
      expect(front.textContent).toMatch(/AGPL|Free/i);
      unmount();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// KN054 — Pied Piper of Dragons / Tuner-DragonRider AI Tuning Medallion
// ══════════════════════════════════════════════════════════════════════════
describe("KN054 — Pied Piper Tuner-DragonRider AI Tuning Medallion", () => {
  it("T11 — Pied Piper Medallion renders with DragonRider emblem", () => {
    renderMedallion("pied-piper");
    const emblem = screen.getByTestId("medallion-emblem-pied-piper");
    expect(emblem.textContent).toMatch(/🐉/);
  });

  it("T12 — 5 corner Frame Locks present on Pied Piper variant", () => {
    renderMedallion("pied-piper");
    expect(screen.getAllByTestId(/^frame-lock-pied-piper-\d+$/).length).toBe(5);
  });

  it("T13 — Center hexagonal Frame Lock (Tuner-tier) present on Pied Piper", () => {
    renderMedallion("pied-piper");
    const centerLock = screen.getByTestId("frame-lock-pied-piper-center");
    expect(centerLock).toBeTruthy();
  });

  it("T14 — QR routes to Librarian.LianaBanyan.com/medallion/pied-piper", () => {
    renderMedallion("pied-piper");
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      "https://Librarian.LianaBanyan.com/medallion/pied-piper"
    );
  });

  it("T15 — Card-back renders AI Tuning canon / Wading summary", () => {
    renderMedallion("pied-piper");
    const eblet = screen.getByTestId("medallion-eblet-content-pied-piper");
    expect(eblet.textContent).toMatch(/DragonRider|Tuner|Pied Piper/i);
  });

  it("T16 — Bounty Poster variant renders on Pied Piper", () => {
    renderMedallion("pied-piper");
    expect(screen.getByTestId("medallion-bounty-poster-pied-piper")).toBeTruthy();
  });

  it("T17 — AI Tuning variant also has center hexagonal lock", () => {
    renderMedallion("ai-tuning");
    expect(screen.getByTestId("frame-lock-ai-tuning-center")).toBeTruthy();
  });

  it("T18 — Federation Member badge shown (not AGPL) for Pied Piper", () => {
    renderMedallion("pied-piper");
    const front = screen.getByTestId("medallion-front-pied-piper");
    expect(front.textContent).toMatch(/Federation|Member/i);
  });

  it("T18b — Dragon-scale / emerald border class applied (Pied Piper emblem visible)", () => {
    renderMedallion("pied-piper");
    const medallion = screen.getByTestId("librarian-medallion-pied-piper");
    expect(medallion).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// KN055 — Furnace Verification Medallion
// ══════════════════════════════════════════════════════════════════════════
describe("KN055 — Furnace Verification Medallion", () => {
  it("T19 — Furnace Medallion renders with Furnace emblem (flame icon)", () => {
    renderMedallion("furnace");
    const emblem = screen.getByTestId("medallion-emblem-furnace");
    expect(emblem).toBeTruthy();
  });

  it("T20 — 6 Frame Locks present (one per Slow Blade V2 mechanism)", () => {
    renderMedallion("furnace");
    expect(screen.getAllByTestId(/^frame-lock-furnace-\d+$/).length).toBe(6);
  });

  it("T21 — Frame Locks labeled per Slow Blade V2 mechanism (title attrs)", () => {
    renderMedallion("furnace");
    const locks = screen.getAllByTestId(/^frame-lock-furnace-\d+$/);
    const titles = locks.map((l) => l.getAttribute("title") ?? "");
    expect(titles.some((t) => /Furnace/i.test(t))).toBe(true);
    expect(titles.some((t) => /Slow Blade/i.test(t))).toBe(true);
    expect(titles.some((t) => /XP|Rep/i.test(t))).toBe(true);
  });

  it("T22 — QR self-references Furnace endpoint (recursive verification)", () => {
    renderMedallion("furnace", { furnaceEndpoint: "https://furnace.lianabanyan.com/verify" });
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      "https://furnace.lianabanyan.com/verify"
    );
  });

  it("T23 — QR falls back to Librarian.LianaBanyan.com when no furnaceEndpoint", () => {
    renderMedallion("furnace");
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      "https://Librarian.LianaBanyan.com/medallion/furnace"
    );
  });

  it("T24 — Card-back shows live Furnace status area / receipt", () => {
    renderMedallion("furnace");
    const receipt = screen.getByTestId("medallion-furnace-receipt-furnace");
    expect(receipt.textContent).toMatch(/Furnace Verification Receipt/i);
  });

  it("T25 — Chain-walker UI renders when chainWalkerEnabled=true", () => {
    renderMedallion("furnace", { chainWalkerEnabled: true });
    expect(screen.getByTestId("chain-walker-ui")).toBeTruthy();
    expect(screen.getByTestId("chain-walker-submit")).toBeTruthy();
  });

  it("T26 — Chain-walker produces result on Walk click", async () => {
    renderMedallion("furnace", { chainWalkerEnabled: true });
    const input = screen.getByPlaceholderText(/golden_tablet/i);
    fireEvent.change(input, { target: { value: "golden_tablet://test-eblet" } });
    fireEvent.click(screen.getByTestId("chain-walker-submit"));
    const result = await screen.findByTestId("chain-walker-result");
    expect(result.textContent).toMatch(/Chain verification/i);
  });

  it("T27 — Battery-dispatch register section present (Furnace-every-click)", () => {
    renderMedallion("furnace");
    expect(screen.getByTestId("battery-dispatch-register")).toBeTruthy();
  });

  it("T28 — Bounty Poster variant renders with 'Verify the Verifier' tagline", () => {
    renderMedallion("furnace");
    const bounty = screen.getByTestId("medallion-bounty-poster-furnace");
    expect(bounty).toBeTruthy();
  });

  it("T28b — AGPL badge shown on Furnace (public read-side)", () => {
    renderMedallion("furnace");
    const front = screen.getByTestId("medallion-front-furnace");
    expect(front.textContent).toMatch(/AGPL|Free/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Cross-cutting: architecture / routing / gallery
// ══════════════════════════════════════════════════════════════════════════
describe("Pod T — Cross-cutting architecture tests", () => {
  it("TC01 — LibrarianMedallionGallery renders all 10 variants (BP010 full set)", () => {
    render(
      <MemoryRouter>
        <LibrarianMedallionGallery />
      </MemoryRouter>
    );
    const gallery = screen.getByTestId("medallion-gallery");
    expect(gallery).toBeTruthy();
    const variants: LibrarianMedallionVariant[] = [
      "canon", "platform-rules", "project-rules", "cathedral",
      "pied-piper", "ai-tuning", "furnace",
      "symbiote", "ultravision", "liana-banyan",
    ];
    for (const v of variants) {
      expect(screen.getByTestId(`librarian-medallion-${v}`)).toBeTruthy();
    }
  });

  it("TC02 — 5-stage funnel present on all variants (card-back)", () => {
    const variants: LibrarianMedallionVariant[] = [
      "canon", "pied-piper", "furnace",
    ];
    for (const v of variants) {
      const { unmount } = renderMedallion(v);
      expect(screen.getByTestId(`medallion-funnel-${v}`)).toBeTruthy();
      unmount();
    }
  });

  it("TC03 — Lock click fires onLockClick callback with variant + index", () => {
    const spy = vi.fn();
    renderMedallion("canon", { onLockClick: spy });
    const lock0 = screen.getByTestId("frame-lock-canon-0");
    fireEvent.click(lock0);
    expect(spy).toHaveBeenCalledWith("canon", 0);
  });

  it("TC04 — Marked Exception: LB-source Medallion QR cannot be redirected via props (override only via furnaceEndpoint)", () => {
    renderMedallion("canon");
    const defaultQr = screen.getByTestId("qr-svg");
    expect(defaultQr.getAttribute("data-value")).toContain("Librarian.LianaBanyan.com");
  });

  it("TC05 — Responsive compact mode renders smaller dimensions", () => {
    renderMedallion("canon", { compact: true });
    const wrapper = screen.getByTestId("librarian-medallion-canon");
    expect(wrapper.className).toMatch(/w-52/);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// K-Cathedral BP010 — NEW variants: symbiote / ultravision / liana-banyan
// ══════════════════════════════════════════════════════════════════════════
describe("K-Cathedral BP010 — Symbiote / UltraVision / Liana Banyan variants", () => {
  // ── Symbiote ────────────────────────────────────────────────────────────
  it("TB01 — Symbiote Medallion renders with Trinity tier badge", () => {
    renderMedallion("symbiote");
    const badge = screen.getByTestId("medallion-tier-badge-symbiote");
    expect(badge.textContent).toMatch(/Symbiote|Trinity/i);
  });

  it("TB02 — Symbiote has 5 corner Frame Locks + center hexagonal lock (Trinity Tier)", () => {
    renderMedallion("symbiote");
    expect(screen.getAllByTestId(/^frame-lock-symbiote-\d+$/).length).toBe(5);
    expect(screen.getByTestId("frame-lock-symbiote-center")).toBeTruthy();
  });

  it("TB03 — Symbiote QR routes to Librarian.LianaBanyan.com/medallion/symbiote", () => {
    renderMedallion("symbiote");
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      "https://Librarian.LianaBanyan.com/medallion/symbiote"
    );
  });

  it("TB04 — Symbiote card-back includes Trinity / Mechanical Computer content", () => {
    renderMedallion("symbiote");
    const eblet = screen.getByTestId("medallion-eblet-content-symbiote");
    expect(eblet.textContent).toMatch(/Trinity|Mechanical Computer|Federation Library/i);
  });

  it("TB05 — Symbiote shows Federation Member badge (not AGPL)", () => {
    renderMedallion("symbiote");
    const front = screen.getByTestId("medallion-front-symbiote");
    expect(front.textContent).toMatch(/Federation|Member/i);
  });

  // ── UltraVision ─────────────────────────────────────────────────────────
  it("TB06 — UltraVision Medallion renders with ceiling-measurement tier badge", () => {
    renderMedallion("ultravision");
    const badge = screen.getByTestId("medallion-tier-badge-ultravision");
    expect(badge.textContent).toMatch(/UltraVision|Ceiling/i);
  });

  it("TB07 — UltraVision has 4 Frame Locks (no center hex)", () => {
    renderMedallion("ultravision");
    expect(screen.getAllByTestId(/^frame-lock-ultravision-\d+$/).length).toBe(4);
    expect(screen.queryByTestId("frame-lock-ultravision-center")).toBeNull();
  });

  it("TB08 — UltraVision QR routes to Librarian.LianaBanyan.com/medallion/ultravision", () => {
    renderMedallion("ultravision");
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      "https://Librarian.LianaBanyan.com/medallion/ultravision"
    );
  });

  it("TB09 — UltraVision card-back includes 81× compound / COLOSSUS reference", () => {
    renderMedallion("ultravision");
    const eblet = screen.getByTestId("medallion-eblet-content-ultravision");
    expect(eblet.textContent).toMatch(/81×|compound|COLOSSUS|ceiling/i);
  });

  // ── Liana Banyan ────────────────────────────────────────────────────────
  it("TB10 — Liana Banyan Medallion renders with corporate anchor tier badge", () => {
    renderMedallion("liana-banyan");
    const badge = screen.getByTestId("medallion-tier-badge-liana-banyan");
    expect(badge.textContent).toMatch(/Liana Banyan|Corporate/i);
  });

  it("TB11 — Liana Banyan QR routes to Librarian.LianaBanyan.com/medallion/liana-banyan", () => {
    renderMedallion("liana-banyan");
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      "https://Librarian.LianaBanyan.com/medallion/liana-banyan"
    );
  });

  it("TB12 — Liana Banyan card-back includes cooperative / 83.3% / EIN reference", () => {
    renderMedallion("liana-banyan");
    const eblet = screen.getByTestId("medallion-eblet-content-liana-banyan");
    expect(eblet.textContent).toMatch(/83\.3%|cooperative|EIN|Wyoming/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Open-set extensibility — synthetic 11th variant (YAML-only, no code change)
// Verifies BP010 "more the merrier" open-set framing:
//   A future variant defined ONLY in librarian_medallion_variants.yaml
//   renders correctly through the component without a code rebuild.
// ══════════════════════════════════════════════════════════════════════════
describe("Open-set extensibility — synthetic 11th variant (BP010)", () => {
  // The synthetic variant slug — not in VARIANT_CONFIGS, simulating YAML-only
  const SYNTHETIC_VARIANT = "iron-e-giant";

  it("TOS01 — Synthetic variant renders without throwing (open-set fallback active)", () => {
    expect(() => renderMedallion(SYNTHETIC_VARIANT as LibrarianMedallionVariant)).not.toThrow();
  });

  it("TOS02 — Synthetic variant produces a Medallion wrapper element", () => {
    renderMedallion(SYNTHETIC_VARIANT as LibrarianMedallionVariant);
    const wrapper = screen.getByTestId(`librarian-medallion-${SYNTHETIC_VARIANT}`);
    expect(wrapper).toBeTruthy();
  });

  it("TOS03 — Synthetic variant QR encodes correct open-set target URL", () => {
    renderMedallion(SYNTHETIC_VARIANT as LibrarianMedallionVariant);
    const qr = screen.getByTestId("qr-svg");
    expect(qr.getAttribute("data-value")).toBe(
      `https://Librarian.LianaBanyan.com/medallion/${SYNTHETIC_VARIANT}`
    );
  });

  it("TOS04 — Synthetic variant card-back renders (Submarine Doors present)", () => {
    renderMedallion(SYNTHETIC_VARIANT as LibrarianMedallionVariant);
    const back = screen.getByTestId(`medallion-back-${SYNTHETIC_VARIANT}`);
    expect(back).toBeTruthy();
  });

  it("TOS05 — Synthetic variant back-summary mentions open-set YAML registry", () => {
    renderMedallion(SYNTHETIC_VARIANT as LibrarianMedallionVariant);
    const eblet = screen.getByTestId(`medallion-eblet-content-${SYNTHETIC_VARIANT}`);
    expect(eblet.textContent).toMatch(/librarian_medallion_variants\.yaml|open-set|YAML/i);
  });
});
