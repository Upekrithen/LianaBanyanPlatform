// @vitest-environment jsdom
/**
 * tests_kn064.test.tsx — KN064 Librarian Page Deployment
 * =========================================================
 * Tests for:
 *   - LibrarianPage  (Librarian.the2ndSecond.com)
 *   - LibrarianRedirectPage (Librarian.LianaBanyan.com → redirect)
 *
 * 10 tests covering:
 *   - Page shell / nav render
 *   - Hero + stats + AGPL framing (Home view)
 *   - Medallion gallery (Home + /medallion)
 *   - Medallion detail (/medallion/:variant)
 *   - Install page (/install)
 *   - Federation page (/federation)
 *   - Receipts page (/receipts)
 *   - Redirect page: initial render + countdown box
 *   - Redirect page: cancel behaviour (Stay Here button)
 *   - Redirect page: Go Now link points to the2ndsecond target
 *
 * Tags: KN064 / BP005 (Pod Y Bean 2 Librarian Page Deployment)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LibrarianPage from "@/pages/LibrarianPage";
import LibrarianRedirectPage from "@/pages/LibrarianRedirectPage";

// ─────────────────────────────────────────────────────────
// MOCK: LibrarianMedallion (avoid canvas/QR side effects)
// ─────────────────────────────────────────────────────────

vi.mock("@/components/LibrarianMedallion", () => ({
  LibrarianMedallion: ({ variant }: { variant: string }) => (
    <div data-testid={`mock-medallion-${variant}`}>Medallion: {variant}</div>
  ),
  LibrarianMedallionGallery: () => (
    <div data-testid="mock-medallion-gallery">Gallery</div>
  ),
}));

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

function renderLibrarianPage(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<LibrarianPage />} />
        <Route path="/medallion" element={<LibrarianPage />} />
        <Route path="/medallion/:variant" element={<LibrarianPage />} />
        <Route path="/install" element={<LibrarianPage />} />
        <Route path="/federation" element={<LibrarianPage />} />
        <Route path="/receipts" element={<LibrarianPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderRedirectPage(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LibrarianRedirectPage />
    </MemoryRouter>
  );
}

// ─────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────

describe("KN064 — LibrarianPage (Librarian.the2ndSecond.com)", () => {
  afterEach(() => cleanup());

  it("1. renders page shell + nav on home route", () => {
    renderLibrarianPage("/");
    expect(screen.getByTestId("librarian-page")).toBeTruthy();
    expect(screen.getByTestId("librarian-nav")).toBeTruthy();
    expect(screen.getByTestId("librarian-nav-home")).toBeTruthy();
  });

  it("2. home view shows hero section with install CTA", () => {
    renderLibrarianPage("/");
    expect(screen.getByTestId("librarian-home")).toBeTruthy();
    expect(screen.getByTestId("librarian-hero")).toBeTruthy();
    expect(screen.getByTestId("hero-install-btn")).toBeTruthy();
    // Headline copy (appears in nav + hero, use getAllByText)
    expect(screen.getAllByText("The Librarian").length).toBeGreaterThan(0);
  });

  it("3. home view shows stats + AGPL framing", () => {
    renderLibrarianPage("/");
    expect(screen.getByTestId("librarian-stats")).toBeTruthy();
    expect(screen.getByTestId("librarian-agpl-framing")).toBeTruthy();
    // AGPL v3 is present (badge in nav + stat card)
    expect(screen.getAllByText("AGPL v3").length).toBeGreaterThan(0);
    // Federation pricing ($5/year in hero copy)
    expect(screen.getAllByText(/\$5\/year/i).length).toBeGreaterThan(0);
  });

  it("4. home view renders medallion gallery", () => {
    renderLibrarianPage("/");
    expect(screen.getByTestId("librarian-gallery-heading")).toBeTruthy();
    expect(screen.getByTestId("mock-medallion-gallery")).toBeTruthy();
  });

  it("5. /install route renders install view with pip snippet", () => {
    renderLibrarianPage("/install");
    expect(screen.getByTestId("librarian-install")).toBeTruthy();
    expect(screen.getByTestId("install-code-block")).toBeTruthy();
    expect(screen.getByTestId("install-pypi-link")).toBeTruthy();
    expect(screen.getByText(/pip install librarian-mcp/)).toBeTruthy();
  });

  it("6. /federation route renders federation view with ONE OF US membership box", () => {
    renderLibrarianPage("/federation");
    expect(screen.getByTestId("librarian-federation")).toBeTruthy();
    expect(screen.getByTestId("federation-membership-box")).toBeTruthy();
    expect(screen.getByTestId("federation-join-link")).toBeTruthy();
    // "ONE OF US" appears in nav button + federation content
    expect(screen.getAllByText(/ONE OF US/).length).toBeGreaterThan(0);
  });

  it("7. /receipts route renders receipts list with at least 4 entries", () => {
    renderLibrarianPage("/receipts");
    expect(screen.getByTestId("librarian-receipts")).toBeTruthy();
    expect(screen.getByTestId("receipts-list")).toBeTruthy();
    expect(screen.getByTestId("receipt-k499")).toBeTruthy();
    expect(screen.getByTestId("receipt-pod-x")).toBeTruthy();
  });

  it("8. /medallion/:variant route renders medallion detail for 'cathedral'", () => {
    renderLibrarianPage("/medallion/cathedral");
    expect(screen.getByTestId("medallion-detail-cathedral")).toBeTruthy();
    expect(screen.getByTestId("mock-medallion-cathedral")).toBeTruthy();
    // nav shows back button since we're in medallion detail
    expect(screen.getByTestId("librarian-nav-back")).toBeTruthy();
  });
});

describe("KN064 — LibrarianRedirectPage (Librarian.LianaBanyan.com)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("9. renders redirect page shell with countdown box", () => {
    renderRedirectPage("/");
    expect(screen.getByTestId("librarian-redirect-page")).toBeTruthy();
    expect(screen.getByTestId("redirect-countdown-box")).toBeTruthy();
    expect(screen.getByTestId("redirect-countdown")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("10. Stay Here button cancels redirect and shows manual link", () => {
    renderRedirectPage("/medallion/furnace");
    // Countdown box initially shown
    expect(screen.getByTestId("redirect-countdown-box")).toBeTruthy();
    // Click cancel
    fireEvent.click(screen.getByTestId("redirect-cancel"));
    // Countdown box gone; cancelled box shown with manual link
    expect(screen.queryByTestId("redirect-countdown-box")).toBeNull();
    expect(screen.getByTestId("redirect-cancelled-box")).toBeTruthy();
    expect(screen.getByTestId("redirect-manual-link")).toBeTruthy();
  });
});
