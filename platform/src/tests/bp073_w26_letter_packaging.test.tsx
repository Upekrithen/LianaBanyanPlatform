// @vitest-environment jsdom
/**
 * BP073 Wave 26 — Letter Send-Readiness Packaging Integration Tests
 * =================================================================
 * Tests for all Crown + AI-Gang letters, LetterPackagingPage,
 * ShieldedLetterGate, and per-letter checklist correctness.
 *
 * Coverage (30 scopes):
 *   - Letter registry: all 9 letters present, correct status
 *   - Per-letter canon number audit (no stale numbers)
 *   - Em-dash audit on all letter files (file-system check)
 *   - Nominee language audit (no pre-acceptance "holder" in body)
 *   - Securities-clean audit (no equity/ROI/dividends)
 *   - Sonnet gate present in all letter files
 *   - LetterPackagingPage renders without crash
 *   - LetterPackagingPage shows all 9 letters
 *   - LetterPackagingPage shows correct status badges
 *   - "Send Now" button is always disabled
 *   - ShieldedLetterGate: isShieldLetter returns true for AI-Gang slugs
 *   - ShieldedLetterGate: crown letters are NOT in shield registry
 *   - ShieldedLetterGate: renders shield_pending state correctly
 *   - ShieldedLetterGate: renders ratified state correctly
 *   - LETTERS_SEND_READINESS.md exists and is non-empty
 *   - /admin/letters route is registered
 *   - Crown letters group count = 4
 *   - AI-Gang letters group count = 5
 *   - SEND-READY letters: Scholz, Brynjolfsson, Newmark (AI-Gang), Doctorow, Ollama
 *   - DRAFT letters: Seibel, Simon, Newmark Crown
 *   - REVIEW letter: MacKenzie Scott
 *
 * Tags: BP073 / W26 / letter-packaging / phase-epsilon
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as fs from "node:fs";
import * as path from "node:path";

afterEach(() => { cleanup(); });

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

vi.mock("@/components/PortalPageLayout", () => ({
  PortalPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="portal-page-layout">{children}</div>
  ),
}));

vi.mock("@/components/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

// platform/src/tests -> platform/src -> platform -> LianaBanyanPlatform (3 levels up)
const REPO_ROOT = path.resolve(__dirname, "../../../");
const DROPZONE = path.join(REPO_ROOT, "BISHOP_DROPZONE/00_FOUNDER_REVIEW");

function readLetterFile(relPath: string): string {
  const fullPath = path.join(REPO_ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Letter file not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

const LETTER_FILES: Record<string, string> = {
  "mackenzie-scott":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_MACKENZIE_SCOTT_v017_CARDBOARD_BOOTS_PUBLISH_CANDIDATE.md",
  "michael-seibel":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_SEIBEL_CEO_v002_B103.md",
  "tom-simon":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_TOM_SIMON_CFO_v008_B103.md",
  "craig-newmark-crown":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/CROWN_LETTER_CRAIG_NEWMARK_V4_DRAFT.md",
  "trebor-scholz":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_SCHOLZ_READY_BP072.md",
  "erik-brynjolfsson":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_BRYNJOLFSSON_READY_BP072.md",
  "craig-newmark-aigang":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_NEWMARK_READY_BP072.md",
  "cory-doctorow":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_DOCTOROW_READY_BP072.md",
  "ollama":
    "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_OLLAMA_READY_BP072.md",
};

// ─── Test: LETTERS_SEND_READINESS.md ─────────────────────────────────────────

describe("LETTERS_SEND_READINESS.md", () => {
  it("exists at repo root and is non-empty", () => {
    const docPath = path.join(REPO_ROOT, "LETTERS_SEND_READINESS.md");
    expect(fs.existsSync(docPath), "LETTERS_SEND_READINESS.md must exist").toBe(true);
    const content = fs.readFileSync(docPath, "utf8");
    expect(content.length).toBeGreaterThan(500);
  });

  it("documents all 9 letters", () => {
    const doc = fs.readFileSync(path.join(REPO_ROOT, "LETTERS_SEND_READINESS.md"), "utf8");
    const recipients = [
      "MacKenzie Scott",
      "Michael Seibel",
      "Tom Simon",
      "Craig Newmark",
      "Trebor Scholz",
      "Erik Brynjolfsson",
      "Cory Doctorow",
      "Ollama",
    ];
    for (const r of recipients) {
      expect(doc, `doc must mention ${r}`).toContain(r);
    }
  });

  it("includes canon number reference", () => {
    const doc = fs.readFileSync(path.join(REPO_ROOT, "LETTERS_SEND_READINESS.md"), "utf8");
    expect(doc).toContain("2,270");
    expect(doc).toContain("228");
    expect(doc).toContain("21");
    expect(doc).toContain("83.3%");
    expect(doc).toContain("Cost+20%");
    expect(doc).toContain("$5");
  });

  it("contains NOTHING SHIPS doctrine statement", () => {
    const doc = fs.readFileSync(path.join(REPO_ROOT, "LETTERS_SEND_READINESS.md"), "utf8");
    expect(doc).toContain("NOTHING ships without Founder ratification");
  });
});

// ─── Test: Letter file existence ──────────────────────────────────────────────

describe("Letter files — existence", () => {
  for (const [id, relPath] of Object.entries(LETTER_FILES)) {
    it(`[${id}] letter file exists`, () => {
      const fullPath = path.join(REPO_ROOT, relPath);
      expect(
        fs.existsSync(fullPath),
        `Letter file missing: ${relPath}`
      ).toBe(true);
    });
  }
});

// ─── Test: Sonnet gate comment in each letter file ───────────────────────────

describe("Letter files — Sonnet re-verify gate present", () => {
  for (const [id, relPath] of Object.entries(LETTER_FILES)) {
    it(`[${id}] has sonnet_verify_gate in frontmatter`, () => {
      const content = readLetterFile(relPath);
      expect(
        content,
        `[${id}] must contain sonnet_verify_gate`
      ).toContain("sonnet_verify_gate");
    });
  }
});

// ─── Test: Em-dash audit ──────────────────────────────────────────────────────

describe("Letter files — em-dash audit (no U+2014)", () => {
  for (const [id, relPath] of Object.entries(LETTER_FILES)) {
    it(`[${id}] body has no em-dash characters (U+2014)`, () => {
      const content = readLetterFile(relPath);
      // Check entire file (including frontmatter) for em-dashes
      const emDashCount = (content.match(/\u2014/g) || []).length;
      expect(emDashCount, `[${id}] must have 0 em-dashes; found ${emDashCount}`).toBe(0);
    });
  }
});

// ─── Test: Canon numbers in letter bodies ─────────────────────────────────────

describe("Letter files — stale numbers audit", () => {
  const STALE_PATTERNS = [
    { pattern: "2,263", description: "old innovation count (should be 2,270)" },
    { pattern: "2263", description: "old innovation count bare (should be 2,270)" },
    { pattern: "222 Crown Jewels", description: "old Crown Jewel count (should be 228)" },
    { pattern: "222 confirmed Crown", description: "old Crown Jewel count (should be 228)" },
    { pattern: "13 patent provisionals", description: "old provisional count (should be 21)" },
    { pattern: "13 provisional applications", description: "old provisional count (should be 21)" },
    { pattern: "1,200 documented", description: "very old innovation count (should be 2,270)" },
  ];

  for (const [id, relPath] of Object.entries(LETTER_FILES)) {
    for (const { pattern, description } of STALE_PATTERNS) {
      it(`[${id}] does not contain stale pattern "${pattern}" (${description})`, () => {
        const content = readLetterFile(relPath);
        expect(
          content,
          `[${id}] must not contain stale pattern "${pattern}"`
        ).not.toContain(pattern);
      });
    }
  }
});

// ─── Test: Nominee language audit ────────────────────────────────────────────

describe("Letter files — nominee language audit", () => {
  it('[tom-simon] does not call recipient "holder" before acceptance', () => {
    const content = readLetterFile(LETTER_FILES["tom-simon"]);
    // The body should say "nominee, once accepted" not bare "A Crown holder can"
    expect(content).not.toContain("A Crown holder can appoint");
    // Should now use nominee language
    expect(content).toContain("nominee");
  });

  // All letter files: no pre-acceptance holder framing in body
  for (const [id, relPath] of Object.entries(LETTER_FILES)) {
    it(`[${id}] does not have bare "Crown holder can" before acceptance framing`, () => {
      const content = readLetterFile(relPath);
      expect(content).not.toContain("A Crown holder can appoint");
    });
  }
});

// ─── Test: Securities-clean audit ────────────────────────────────────────────

/** Strip YAML frontmatter (everything between first --- and second ---) */
function extractBody(content: string): string {
  if (!content.startsWith("---") && !content.startsWith("\uFEFF---")) {
    return content;
  }
  const start = content.indexOf("---");
  const end = content.indexOf("---", start + 3);
  return end >= 0 ? content.slice(end + 3) : content;
}

describe("Letter files — securities-clean audit (Marks = participation)", () => {
  // Precise patterns that indicate actual securities language (not clean disclaimers)
  const BANNED_PATTERNS = [
    "equity stake in",
    "return on investment",
    "earn dividends",
    "pay dividends",
    "shares in the company",
    "shares in liana",
    "invest and receive",
    "investment return",
  ];

  for (const [id, relPath] of Object.entries(LETTER_FILES)) {
    for (const pattern of BANNED_PATTERNS) {
      it(`[${id}] does not contain securities-flagged phrase "${pattern}"`, () => {
        const content = readLetterFile(relPath);
        const body = extractBody(content).toLowerCase();
        const pat = pattern.toLowerCase();
        expect(
          body,
          `[${id}] must not contain "${pattern}"`
        ).not.toContain(pat);
      });
    }
  }
});

// ─── Test: LetterPackagingPage registry ──────────────────────────────────────

describe("LetterPackagingPage registry", () => {
  it("exports LETTER_REGISTRY with 9 letters", async () => {
    const mod = await import("@/pages/admin/LetterPackagingPage");
    expect(mod.LETTER_REGISTRY).toHaveLength(9);
  });

  it("registry has exactly 4 crown letters", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const crowns = LETTER_REGISTRY.filter((l) => l.group === "crown");
    expect(crowns).toHaveLength(4);
  });

  it("registry has exactly 5 ai-gang letters", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const aiGang = LETTER_REGISTRY.filter((l) => l.group === "ai-gang");
    expect(aiGang).toHaveLength(5);
  });

  it("AI-Gang letters are all SEND-READY", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const aiGang = LETTER_REGISTRY.filter((l) => l.group === "ai-gang");
    for (const letter of aiGang) {
      expect(
        letter.status,
        `AI-Gang letter ${letter.recipient} should be SEND-READY`
      ).toBe("SEND-READY");
    }
  });

  it("MacKenzie Scott is REVIEW status", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const letter = LETTER_REGISTRY.find((l) => l.id === "mackenzie-scott");
    expect(letter?.status).toBe("REVIEW");
  });

  it("Seibel and Simon are DRAFT status", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const seibel = LETTER_REGISTRY.find((l) => l.id === "michael-seibel");
    const simon = LETTER_REGISTRY.find((l) => l.id === "tom-simon");
    expect(seibel?.status).toBe("DRAFT");
    expect(simon?.status).toBe("DRAFT");
  });

  it("Craig Newmark Crown is DRAFT status", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const newmarkCrown = LETTER_REGISTRY.find((l) => l.id === "craig-newmark-crown");
    expect(newmarkCrown?.status).toBe("DRAFT");
  });

  it("all 9 letters have founderRatified: false", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    for (const letter of LETTER_REGISTRY) {
      expect(
        letter.checklist.founderRatified,
        `${letter.recipient} must have founderRatified: false — NOTHING ships`
      ).toBe(false);
    }
  });

  it("all 9 letters have canon numbers OK in checklist", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    for (const letter of LETTER_REGISTRY) {
      expect(
        letter.checklist.canonNumbersOK,
        `${letter.recipient} canonNumbersOK must be true`
      ).toBe(true);
    }
  });

  it("all 9 letters have emDashesClean in checklist", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    for (const letter of LETTER_REGISTRY) {
      expect(
        letter.checklist.emDashesClean,
        `${letter.recipient} emDashesClean must be true`
      ).toBe(true);
    }
  });

  it("no letter has SENT status", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const sent = LETTER_REGISTRY.filter((l) => l.status === "SENT");
    expect(sent).toHaveLength(0);
  });

  it("Craig Newmark appears twice (Crown + AI-Gang distinct letters)", async () => {
    const { LETTER_REGISTRY } = await import("@/pages/admin/LetterPackagingPage");
    const newmarks = LETTER_REGISTRY.filter((l) =>
      l.recipient.toLowerCase().includes("craig newmark")
    );
    expect(newmarks).toHaveLength(2);
    expect(newmarks.map((l) => l.group).sort()).toEqual(["ai-gang", "crown"]);
  });
});

// ─── Test: LetterPackagingPage render ────────────────────────────────────────

describe("LetterPackagingPage — render", () => {
  async function renderPage() {
    const { default: LetterPackagingPage } = await import(
      "@/pages/admin/LetterPackagingPage"
    );
    return render(
      <MemoryRouter initialEntries={["/admin/letters"]}>
        <LetterPackagingPage />
      </MemoryRouter>
    );
  }

  it("renders without crash", async () => {
    await expect(renderPage()).resolves.toBeDefined();
  });

  it("shows the page title", async () => {
    await renderPage();
    expect(screen.getByText(/Letter Send-Readiness Packaging/i)).toBeDefined();
  });

  it("shows Crown Letters section", async () => {
    await renderPage();
    const matches = screen.getAllByText(/Crown Letters/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows AI-Gang Letters section", async () => {
    await renderPage();
    // Multiple elements may match (heading + badge); getAllByText is correct here
    const matches = screen.getAllByText(/AI-Gang Letters/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows Sonnet re-verify gate notice", async () => {
    await renderPage();
    expect(screen.getByText(/Sonnet 4\.6 re-verify gate/i)).toBeDefined();
  });

  it("shows NOTHING SHIPS doctrine notice", async () => {
    await renderPage();
    // The text is split across <strong> and surrounding div; check container text
    const el = document.querySelector('[data-testid="portal-page-layout"]');
    expect(el?.textContent).toMatch(/NOTHING SHIPS without Founder ratification/i);
  });

  it("all Send Now buttons are disabled", async () => {
    await renderPage();
    const sendButtons = screen.getAllByText(/Send Now/i);
    expect(sendButtons.length).toBeGreaterThan(0);
    for (const btn of sendButtons) {
      // Button parent should be disabled
      const buttonEl = btn.closest("button");
      if (buttonEl) {
        expect(
          buttonEl.disabled || buttonEl.getAttribute("disabled") !== null,
          "Send Now button must be disabled"
        ).toBe(true);
      }
    }
  });

  it("shows ShieldedLetterGate section", async () => {
    await renderPage();
    expect(screen.getByText(/ShieldedLetterGate Coverage/i)).toBeDefined();
  });
});

// ─── Test: ShieldedLetterGate ────────────────────────────────────────────────

describe("ShieldedLetterGate — slug registration", () => {
  it("all 5 AI-Gang slugs are registered in AI_GANG_LETTER_SLUGS", async () => {
    const { AI_GANG_LETTER_SLUGS } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    const expected = ["scholz", "brynjolfsson", "newmark", "doctorow", "ollama"];
    for (const slug of expected) {
      expect(
        AI_GANG_LETTER_SLUGS.includes(slug as never),
        `${slug} must be in AI_GANG_LETTER_SLUGS`
      ).toBe(true);
    }
  });

  it("cardboard-boots-v016 is registered in CARDBOARD_BOOTS_LETTER_SLUGS", async () => {
    const { CARDBOARD_BOOTS_LETTER_SLUGS } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    expect(CARDBOARD_BOOTS_LETTER_SLUGS.includes("cardboard-boots-v016" as never)).toBe(true);
  });

  it("isShieldLetter returns true for all AI-Gang slugs", async () => {
    const { isShieldLetter } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    for (const slug of ["scholz", "brynjolfsson", "newmark", "doctorow", "ollama"]) {
      expect(isShieldLetter(slug), `isShieldLetter(${slug}) must be true`).toBe(true);
    }
  });

  it("isShieldLetter returns true for cardboard-boots-v016", async () => {
    const { isShieldLetter } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    expect(isShieldLetter("cardboard-boots-v016")).toBe(true);
  });

  it("isShieldLetter returns false for crown letter slugs", async () => {
    const { isShieldLetter } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    for (const slug of ["seibel-ceo", "simon-cfo", "newmark-chancellor", "cardboard-boots-v017"]) {
      expect(isShieldLetter(slug), `isShieldLetter(${slug}) must be false for crown letters`).toBe(false);
    }
  });

  it("isShieldLetter returns false for unknown slug", async () => {
    const { isShieldLetter } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    expect(isShieldLetter("unknown-letter")).toBe(false);
  });
});

describe("ShieldedLetterGate — render: shield_pending state", () => {
  function makeMockLetter(overrides: Partial<import("@/hooks/useOutreachLetters").OutreachLetter>): import("@/hooks/useOutreachLetters").OutreachLetter {
    return {
      letter_id: "test-id",
      slug: "scholz",
      recipient_name: "Trebor Scholz",
      recipient_category: "academic",
      recipient_tier: 1,
      state: "shield_pending",
      full_text: "",
      substantive_summary: null,
      what_we_are_asking: "",
      what_we_are_not_asking: null,
      why_this_recipient: null,
      source_innovation_refs: [],
      wave_label: null,
      scheduled_dispatch: null,
      dispatched_at: null,
      voting_mode: "advisory",
      voting_window_start: null,
      voting_window_end: null,
      vote_threshold_approval_pct: 60,
      vote_threshold_veto_pct: 20,
      created_at: "",
      updated_at: "",
      ...overrides,
    };
  }

  it("renders shield-gated state when letter is shield_pending", async () => {
    const { ShieldedLetterGate } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    const mockLetter = makeMockLetter({ slug: "scholz", state: "shield_pending" });
    render(
      <MemoryRouter>
        <ShieldedLetterGate letter={mockLetter} verdict={null} isFounder={false} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Shield-gated/i)).toBeDefined();
    expect(screen.getByText(/awaits Founder ratification/i)).toBeDefined();
  });

  it("does NOT render the Ratify button for non-Founder users", async () => {
    const { ShieldedLetterGate } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    const mockLetter = makeMockLetter({ slug: "doctorow", state: "shield_pending" });
    render(
      <MemoryRouter>
        <ShieldedLetterGate letter={mockLetter} verdict={null} isFounder={false} />
      </MemoryRouter>
    );
    const ratifyBtn = screen.queryByText(/Ratify and Enable Dispatch/i);
    expect(ratifyBtn).toBeNull();
  });

  it("renders ratified (approved) state when letter is approved", async () => {
    const { ShieldedLetterGate } = await import(
      "@/components/outreach/ShieldedLetterGate"
    );
    const mockLetter = makeMockLetter({ slug: "ollama", state: "approved" });
    render(
      <MemoryRouter>
        <ShieldedLetterGate letter={mockLetter} verdict={null} isFounder={false} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Founder ratified/i)).toBeDefined();
    expect(screen.getByText(/dispatch path open/i)).toBeDefined();
  });
});

// ─── Test: /admin/letters route registration ──────────────────────────────────

describe("Route registration — /admin/letters", () => {
  it("admin routes file contains /admin/letters route", () => {
    const routesPath = path.join(
      __dirname,
      "../routes/admin.tsx"
    );
    expect(fs.existsSync(routesPath)).toBe(true);
    const content = fs.readFileSync(routesPath, "utf8");
    expect(content).toContain('path="/admin/letters"');
    expect(content).toContain("LetterPackagingPage");
  });

  it("LetterPackagingPage is lazy-imported in admin routes", () => {
    const routesPath = path.join(__dirname, "../routes/admin.tsx");
    const content = fs.readFileSync(routesPath, "utf8");
    expect(content).toContain("import(\"@/pages/admin/LetterPackagingPage\")");
  });
});
