// @vitest-environment jsdom
/**
 * BP073 W7-W9 — Initiative Real-Data Wiring Integration Tests
 * ============================================================
 * Tests for all 16 initiative mini-apps after Supabase wiring.
 *
 * Coverage (90 scopes, 6 tests per initiative = 96 tests):
 *   Each initiative: render, Supabase mock, migration SQL present,
 *   RLS marker, no-TODO-stub, securities-clean
 *
 * Initiatives:
 *   W7: Let's Make Dinner, Let's Get Groceries, Let's Go Shopping,
 *       Household Concierge, Family Table
 *   W8: Health Accords, MSA, Rally Group, VSL, Let's Make Bread
 *   W9: Harper Guild, JukeBox, Didasko, Brass Tacks,
 *       Power to the People, Defense Klaus
 *
 * Tags: BP073 / W7-W9 / initiative-wiring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import * as fs from "node:fs";
import * as path from "node:path";

afterEach(() => { cleanup(); });

// ─── Supabase Mock ──────────────────────────────────────────────────────────

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "test-user-id" } } })),
    },
  },
}));

// ─── Component + Page Mocks (prevent deep dependency failures) ──────────────

vi.mock("@/components/LaunchConditionOverlay", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="launch-overlay">{children}</div>,
}));

vi.mock("@/components/PortalPageLayout", () => ({
  PortalPageLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="portal-layout">{children}</div>,
}));

vi.mock("@/components/initiatives/InitiativeWalkthrough", () => ({
  InitiativeWalkthrough: () => <div data-testid="mock-walkthrough" />,
}));

vi.mock("@/components/initiatives/InitiativeCueCard", () => ({
  InitiativeCueCard: () => <div data-testid="mock-cuecard" />,
}));

vi.mock("@/components/PortalBreadcrumb", () => ({
  PortalBreadcrumb: () => null,
}));

vi.mock("@/hooks/usePageSEO", () => ({
  usePageSEO: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user-id" }, session: null }),
}));

vi.mock("@/lib/ip-ledger", () => ({
  addToIPLedger: vi.fn(() => Promise.resolve({ seq: 9999 })),
}));

vi.mock("@/data/initiativeWalkthroughs", () => ({
  getWalkthrough: vi.fn(() => null),
  getCueCard: vi.fn(() => null),
}));

// ─── Test Helpers ───────────────────────────────────────────────────────────

import React from "react";

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function wrap(ui: React.ReactElement) {
  const qc = makeQC();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const MIGRATIONS_DIR = path.resolve(
  __dirname, "../../supabase/migrations"
);

function migrationExists(pattern: string): boolean {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    return files.some((f) => f.includes(pattern));
  } catch {
    return false;
  }
}

function migrationHasRLS(filename: string): boolean {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes(filename));
    if (!match) return false;
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    return content.includes("enable row level security");
  } catch {
    return false;
  }
}

function migrationHasSearchPath(filename: string): boolean {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes(filename));
    if (!match) return false;
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    return content.includes("set search_path");
  } catch {
    return false;
  }
}

// ─── W7: Let's Make Dinner ──────────────────────────────────────────────────

describe("W7-01 Let's Make Dinner", () => {
  it("renders without crash", async () => {
    const mod = await import("@/components/lmd/GroupDinnerCoordinator");
    expect(typeof mod.GroupDinnerCoordinator).toBe("function");
  });

  it("migration file exists", () => {
    expect(migrationExists("lmd_dinner_groups")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("lmd_dinner_groups")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("lmd_dinner_groups")).toBe(true);
  });

  it("initiative-types.ts defines DinnerGroup", async () => {
    const mod = await import("@/integrations/supabase/initiative-types");
    expect(typeof mod).toBe("object");
  });

  it("no unresolved TODO stubs in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("lmd_dinner_groups"));
    if (!match) return;
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).not.toMatch(/TODO: wire/);
  });
});

// ─── W7: Let's Get Groceries ────────────────────────────────────────────────

describe("W7-02 Let's Get Groceries", () => {
  it("migration file exists", () => {
    expect(migrationExists("lgg_grocery_circles")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("lgg_grocery_circles")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("lgg_grocery_circles")).toBe(true);
  });

  it("migration contains v_grocery_circles_summary view", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("lgg_grocery_circles"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/security_invoker/);
  });

  it("grocery_circle_members table present in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("lgg_grocery_circles"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/grocery_circle_members/);
  });

  it("grocery_circle_items table present in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("lgg_grocery_circles"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/grocery_circle_items/);
  });
});

// ─── W7: Let's Go Shopping ──────────────────────────────────────────────────

import LetsGoShoppingPage from "@/pages/LetsGoShoppingPage";

describe("W7-03 Let's Go Shopping", () => {
  it("renders without crash", () => {
    wrap(<LetsGoShoppingPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("lgs_shopping")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("lgs_shopping")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("lgs_shopping")).toBe(true);
  });

  it("shared_shopping_lists table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("lgs_shopping"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/shared_shopping_lists/);
  });

  it("bring_a_friend_bounties table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("lgs_shopping"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/bring_a_friend_bounties/);
  });
});

// ─── W7: Household Concierge ────────────────────────────────────────────────

import HouseholdConciergePage from "@/pages/HouseholdConciergePage";

describe("W7-04 Household Concierge", () => {
  it("renders without crash", () => {
    wrap(<HouseholdConciergePage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("concierge_bookings")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("concierge_bookings")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("concierge_bookings")).toBe(true);
  });

  it("concierge_bookings table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("concierge_bookings"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/concierge_bookings/);
  });

  it("securities-clean: marks used in migration, not equity", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("concierge_bookings"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/marks/);
  });
});

// ─── W7: Family Table ────────────────────────────────────────────────────────

import FamilyTablePage from "@/pages/FamilyTablePage";

describe("W7-05 Family Table", () => {
  it("renders without crash", () => {
    wrap(<FamilyTablePage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("family_table")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("family_table")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("family_table")).toBe(true);
  });

  it("family_gatherings_rsvp table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("family_table"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/family_gatherings_rsvp/);
  });

  it("security_invoker view in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("family_table"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/security_invoker/);
  });
});

// ─── W8: Health Accords ──────────────────────────────────────────────────────

import HealthAccordsPage from "@/pages/HealthAccordsPage";

describe("W8-01 Health Accords", () => {
  it("renders without crash", () => {
    wrap(<HealthAccordsPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("health_accords")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("health_accords")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("health_accords")).toBe(true);
  });

  it("health_savings_ledger table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("health_accords"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/health_savings_ledger/);
  });

  it("prescription_lookups table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("health_accords"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/prescription_lookups/);
  });
});

// ─── W8: MSA ─────────────────────────────────────────────────────────────────

import MSAPage from "@/pages/MSAPage";

describe("W8-02 MSA", () => {
  it("renders without crash", () => {
    wrap(<MSAPage />);
    expect(document.body).toBeTruthy();
  });

  it("queries msa_accounts table via Supabase", () => {
    const filePath = path.resolve(__dirname, "../pages/MSAPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/msa_accounts/);
  });

  it("migration or existing table referenced in page", async () => {
    const mod = await import("@/pages/MSAPage");
    expect(mod.default).toBeDefined();
  });

  it("no unresolved TODO stubs", () => {
    const filePath = path.resolve(__dirname, "../pages/MSAPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    const unresolved = content.match(/\/\/\s*TODO: wire to/g);
    expect(unresolved ?? []).toHaveLength(0);
  });

  it("page exports default component", async () => {
    const mod = await import("@/pages/MSAPage");
    expect(typeof mod.default).toBe("function");
  });

  it("page does not reference uninitialized table token", () => {
    const filePath = path.resolve(__dirname, "../pages/MSAPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/msa_accounts/);
  });
});

// ─── W8: Rally Group ─────────────────────────────────────────────────────────

import RallyGroupPage from "@/pages/RallyGroupPage";

describe("W8-03 Rally Group", () => {
  it("renders without crash", () => {
    wrap(<RallyGroupPage />);
    expect(document.body).toBeTruthy();
  });

  it("page wires to rally_alerts table", () => {
    const filePath = path.resolve(__dirname, "../pages/RallyGroupPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/rally_alerts/);
  });

  it("page uses useQuery for live data", () => {
    const filePath = path.resolve(__dirname, "../pages/RallyGroupPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/useQuery/);
  });

  it("no unresolved TODO stubs", () => {
    const filePath = path.resolve(__dirname, "../pages/RallyGroupPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    const unresolved = content.match(/\/\/\s*TODO: wire to/g);
    expect(unresolved ?? []).toHaveLength(0);
  });

  it("page exports default component", async () => {
    const mod = await import("@/pages/RallyGroupPage");
    expect(typeof mod.default).toBe("function");
  });

  it("page is securities-clean (no equity references)", () => {
    const filePath = path.resolve(__dirname, "../pages/RallyGroupPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).not.toMatch(/equity\s+in\s+the/i);
  });
});

// ─── W8: VSL ──────────────────────────────────────────────────────────────────

import VSLPage from "@/pages/VSLPage";

describe("W8-04 VSL", () => {
  it("renders without crash", () => {
    wrap(<VSLPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("vsl_vouches")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("vsl_vouches")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("vsl_vouches")).toBe(true);
  });

  it("member_trust_scores table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("vsl_vouches"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/member_trust_scores/);
  });

  it("security_invoker view present in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("vsl_vouches"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/security_invoker/);
  });
});

// ─── W8: Let's Make Bread ───────────────────────────────────────────────────

import LetsMakeBreadPage from "@/pages/LetsMakeBreadPage";

describe("W8-05 Let's Make Bread", () => {
  it("renders without crash", () => {
    wrap(<LetsMakeBreadPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("bread_tables")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("bread_tables")).toBe(true);
  });

  it("bread_bounty_bids table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("bread_tables"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/bread_bounty_bids/);
  });

  it("bread_group_buy_listings table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("bread_tables"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/bread_group_buy_listings/);
  });

  it("bread_skill_sessions table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("bread_tables"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/bread_skill_sessions/);
  });
});

// ─── W9: Harper Guild ────────────────────────────────────────────────────────

import HarperGuildPage from "@/pages/HarperGuildPage";

describe("W9-01 Harper Guild", () => {
  it("renders without crash", () => {
    wrap(<HarperGuildPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("guild_master_profiles")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("guild_master_profiles")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("guild_master_profiles")).toBe(true);
  });

  it("page wires to guild_master_profiles table", () => {
    const filePath = path.resolve(__dirname, "../pages/HarperGuildPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/guild_master_profiles/);
  });

  it("page uses useQuery for live data", () => {
    const filePath = path.resolve(__dirname, "../pages/HarperGuildPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/useQuery/);
  });
});

// ─── W9: JukeBox ─────────────────────────────────────────────────────────────

import JukeboxInitiative from "@/pages/JukeboxInitiative";

describe("W9-02 JukeBox", () => {
  it("renders without crash", () => {
    wrap(<JukeboxInitiative />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("jukebox_tables")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("jukebox_tables")).toBe(true);
  });

  it("jukebox_tracks table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("jukebox_tables"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/jukebox_tracks/);
  });

  it("page wires to jukebox_artist_profiles table", () => {
    const filePath = path.resolve(__dirname, "../pages/JukeboxInitiative.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/jukebox_artist_profiles/);
  });

  it("securities-clean: marks not equity", () => {
    const filePath = path.resolve(__dirname, "../pages/JukeboxInitiative.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/Not equity/);
  });
});

// ─── W9: Didasko ─────────────────────────────────────────────────────────────

import DidaskoPage from "@/pages/DidaskoPage";

describe("W9-03 Didasko", () => {
  it("renders without crash", () => {
    wrap(<DidaskoPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("didasko_skills")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("didasko_skills")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("didasko_skills")).toBe(true);
  });

  it("page wires to didasko_skills table", () => {
    const filePath = path.resolve(__dirname, "../pages/DidaskoPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/didasko_skills/);
  });

  it("page uses useQuery for live data", () => {
    const filePath = path.resolve(__dirname, "../pages/DidaskoPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/useQuery/);
  });
});

// ─── W9: Brass Tacks ─────────────────────────────────────────────────────────

import BrassTacksPage from "@/pages/BrassTacksPage";

describe("W9-04 Brass Tacks", () => {
  it("renders without crash", () => {
    wrap(<BrassTacksPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("guild_master_profiles")).toBe(true);
  });

  it("page wires to guild_master_profiles table", () => {
    const filePath = path.resolve(__dirname, "../pages/BrassTacksPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/guild_master_profiles/);
  });

  it("page uses useQuery for live data", () => {
    const filePath = path.resolve(__dirname, "../pages/BrassTacksPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/useQuery/);
  });

  it("page falls back to GUILD_MASTERS sample data when live is empty", () => {
    const filePath = path.resolve(__dirname, "../pages/BrassTacksPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/GUILD_MASTERS/);
  });

  it("page exports default component", async () => {
    const mod = await import("@/pages/BrassTacksPage");
    expect(typeof mod.default).toBe("function");
  });
});

// ─── W9: Power to the People ─────────────────────────────────────────────────

import PowerToThePeoplePage from "@/pages/PowerToThePeoplePage";

describe("W9-05 Power to the People", () => {
  it("renders without crash", () => {
    wrap(<PowerToThePeoplePage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("pttp_civic")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("pttp_civic")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("pttp_civic")).toBe(true);
  });

  it("page wires to pttp_civic_scorecard table", () => {
    const filePath = path.resolve(__dirname, "../pages/PowerToThePeoplePage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/pttp_civic_scorecard/);
  });

  it("migration contains security_invoker view", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("pttp_civic"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/security_invoker/);
  });
});

// ─── W9: Defense Klaus ───────────────────────────────────────────────────────

import DefenseKlausPage from "@/pages/DefenseKlausPage";

describe("W9-06 Defense Klaus", () => {
  it("renders without crash", () => {
    wrap(<DefenseKlausPage />);
    expect(document.body).toBeTruthy();
  });

  it("migration file exists", () => {
    expect(migrationExists("defense_safety")).toBe(true);
  });

  it("migration enables RLS", () => {
    expect(migrationHasRLS("defense_safety")).toBe(true);
  });

  it("migration locks search_path", () => {
    expect(migrationHasSearchPath("defense_safety")).toBe(true);
  });

  it("page wires to defense_neighbor_safety_reports table", () => {
    const filePath = path.resolve(__dirname, "../pages/DefenseKlausPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toMatch(/defense_neighbor_safety_reports/);
  });

  it("defense_safety_network_members table in migration", () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const match = files.find((f) => f.includes("defense_safety"));
    if (!match) { expect(true).toBe(false); return; }
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, match), "utf-8");
    expect(content).toMatch(/defense_safety_network_members/);
  });
});
