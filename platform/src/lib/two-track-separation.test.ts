/**
 * Two-track economy separation test (K431).
 *
 * Verifies that upekrithen.pedestal_holders has NO FK relationship to
 * public.members. A natural person can exist in both systems, but the
 * databases track them independently — no join should be implied by schema.
 *
 * This is a schema-level test: it reads the migration SQL and asserts
 * structural properties. It does NOT require a live database.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const MIGRATION_PATH = resolve(
  __dirname,
  "../../supabase/migrations/20260422230001_k431_upekrithen_schema_pedestal_stake.sql"
);

const migrationSql = readFileSync(MIGRATION_PATH, "utf-8");

describe("Two-track economy separation", () => {
  it("pedestal_holders table exists in upekrithen schema", () => {
    expect(migrationSql).toContain(
      "CREATE TABLE upekrithen.pedestal_holders"
    );
  });

  it("pedestal_holders has NO FK to public.members", () => {
    const holdersBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_holders"
    );
    expect(holdersBlock).not.toContain("public.members");
    expect(holdersBlock).not.toContain("REFERENCES members");
    expect(holdersBlock).not.toContain("REFERENCES public.members");
  });

  it("pedestal_applications has NO FK to public.members", () => {
    const appsBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_applications"
    );
    expect(appsBlock).not.toContain("public.members");
    expect(appsBlock).not.toContain("REFERENCES members");
  });

  it("no table in migration references public.members anywhere", () => {
    expect(migrationSql).not.toContain("REFERENCES public.members");
    expect(migrationSql).not.toMatch(
      /REFERENCES\s+members\s*\(/i
    );
  });

  it("pedestal_holders user_id references auth.users (not members)", () => {
    const holdersBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_holders"
    );
    expect(holdersBlock).toContain("REFERENCES auth.users(id)");
  });

  it("both upekrithen.pedestal_holders and schema exist separately from public", () => {
    expect(migrationSql).toContain("CREATE SCHEMA IF NOT EXISTS upekrithen");
    expect(migrationSql).not.toMatch(
      /CREATE TABLE\s+(?:public\.)?pedestal_holders\b/
    );
  });

  it("issuance_log has no UPDATE or DELETE policy", () => {
    const afterIssuanceRls = migrationSql.substring(
      migrationSql.indexOf("pedestal_issuance_log ENABLE ROW LEVEL SECURITY")
    );
    const nextTableRls = afterIssuanceRls.indexOf(
      "regcf_offering_raises ENABLE ROW LEVEL SECURITY"
    );
    const issuanceRlsBlock = afterIssuanceRls.substring(0, nextTableRls);

    expect(issuanceRlsBlock).not.toMatch(/FOR\s+UPDATE/i);
    expect(issuanceRlsBlock).not.toMatch(/FOR\s+DELETE/i);
  });
});

describe("Two-track separation — dual-context user", () => {
  it("a user can be both an LB member (public schema) and a pedestal holder (upekrithen schema)", () => {
    expect(migrationSql).toContain("CREATE TABLE upekrithen.pedestal_holders");
    expect(migrationSql).not.toContain("REFERENCES public.members");

    const holdersBlock = extractTableBlock(migrationSql, "upekrithen.pedestal_holders");
    expect(holdersBlock).toContain("user_id");
    expect(holdersBlock).toContain("REFERENCES auth.users(id)");
    expect(holdersBlock).not.toContain("REFERENCES public.members");
    expect(holdersBlock).not.toContain("REFERENCES members");
  });

  it("pedestal_applications and pedestal_holders share auth.users FK but NOT members FK", () => {
    const appsBlock = extractTableBlock(migrationSql, "upekrithen.pedestal_applications");
    const holdersBlock = extractTableBlock(migrationSql, "upekrithen.pedestal_holders");

    expect(appsBlock).toContain("REFERENCES auth.users(id)");
    expect(holdersBlock).toContain("REFERENCES auth.users(id)");

    expect(appsBlock).not.toContain("public.members");
    expect(holdersBlock).not.toContain("public.members");
  });

  it("no view, function, or trigger joins upekrithen to public.members", () => {
    const sqlLines = migrationSql
      .split("\n")
      .filter((l) => !l.trimStart().startsWith("--"));
    const sqlOnly = sqlLines.join("\n");

    const joinPatterns = [
      /JOIN\s+public\.members/i,
      /JOIN\s+members\s+ON/i,
      /FROM\s+public\.members.*upekrithen/i,
      /FROM\s+upekrithen.*public\.members/i,
    ];
    for (const pat of joinPatterns) {
      expect(sqlOnly).not.toMatch(pat);
    }
  });
});

describe("Two-track separation — K432 supplemental migration", () => {
  const k432Path = resolve(
    __dirname,
    "../../supabase/migrations/20260423000001_k432_pedestal_apply_flow_columns.sql"
  );

  let k432Sql: string;
  try {
    k432Sql = readFileSync(k432Path, "utf-8");
  } catch {
    k432Sql = "";
  }

  it("K432 migration exists", () => {
    expect(k432Sql.length).toBeGreaterThan(0);
  });

  it("K432 migration adds investor UPDATE policy on applications", () => {
    expect(k432Sql).toContain("app_investor_update");
    expect(k432Sql).toMatch(/FOR\s+UPDATE/i);
  });

  it("K432 migration adds INSERT policy on pedestal_holders", () => {
    expect(k432Sql).toContain("holders_system_insert");
  });

  it("K432 migration adds no FK to public.members", () => {
    expect(k432Sql).not.toContain("public.members");
    expect(k432Sql).not.toMatch(/REFERENCES\s+members/i);
  });
});

// ===========================================================================
// K433 Phase 3: Extended two-track separation tests
// ===========================================================================

describe("Two-track separation — K433 schema-level JOIN rejection", () => {
  it("no FK defined between pedestal_holders and members (schema parse)", () => {
    const holdersBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_holders"
    );
    expect(holdersBlock).not.toMatch(/REFERENCES\s+public\.members/i);
    expect(holdersBlock).not.toMatch(/REFERENCES\s+members\s*\(/i);

    const allFks = migrationSql.match(/REFERENCES\s+\S+/gi) || [];
    const memberFks = allFks.filter(
      (fk) => /members/i.test(fk) && !/auth\.users/i.test(fk)
    );
    expect(memberFks).toHaveLength(0);
  });

  it("attempting a JOIN of pedestal_holders to members would require a FK that does not exist", () => {
    const holdersBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_holders"
    );
    const fkLines = holdersBlock
      .split("\n")
      .filter((l) => /REFERENCES/i.test(l));

    for (const line of fkLines) {
      expect(line).not.toMatch(/public\.members/i);
      expect(line).not.toMatch(/\bmembers\b(?!\.).*\(/i);
    }
    expect(holdersBlock).toContain("REFERENCES auth.users(id)");
  });
});

describe("Two-track separation — independent data per dual-context user (K433)", () => {
  it("user_id FK goes to auth.users — not members — so identity is shared only at auth level", () => {
    const appsBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_applications"
    );
    const holdersBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_holders"
    );

    expect(appsBlock).toContain("REFERENCES auth.users(id)");
    expect(holdersBlock).toContain("REFERENCES auth.users(id)");

    expect(appsBlock).not.toContain("REFERENCES public.members");
    expect(holdersBlock).not.toContain("REFERENCES public.members");
  });

  it("pedestal_holders has its own full_name / email columns — does not derive from members", () => {
    const holdersBlock = extractTableBlock(
      migrationSql,
      "upekrithen.pedestal_holders"
    );
    expect(holdersBlock).toContain("full_name");
    expect(holdersBlock).toContain("email");
  });
});

describe("Two-track separation — admin labeling (K433)", () => {
  it("admin dashboard file labels 'Upekrithen' distinctly from 'Liana Banyan'", () => {
    const adminPath = resolve(__dirname, "../pages/PedestalStakeAdmin.tsx");
    let adminSrc: string;
    try {
      adminSrc = readFileSync(adminPath, "utf-8");
    } catch {
      adminSrc = "";
    }
    expect(adminSrc.length).toBeGreaterThan(0);

    expect(adminSrc).toContain("Upekrithen");
    expect(adminSrc).toMatch(/separate from Liana Banyan/i);

    expect(adminSrc).not.toMatch(
      /Liana Banyan.*pedestal.stake.*member/i
    );
  });
});

describe("Two-track separation — voting isolation (K433)", () => {
  it("no migration SQL references cooperative voting for pedestal holders", () => {
    expect(migrationSql).not.toMatch(/vote/i);
    expect(migrationSql).not.toMatch(/ballot/i);
    expect(migrationSql).not.toMatch(/governance.*pedestal/i);
  });

  it("K432 migration also has no voting references", () => {
    const k432Path = resolve(
      __dirname,
      "../../supabase/migrations/20260423000001_k432_pedestal_apply_flow_columns.sql"
    );
    let k432Sql: string;
    try {
      k432Sql = readFileSync(k432Path, "utf-8");
    } catch {
      k432Sql = "";
    }
    expect(k432Sql).not.toMatch(/vote/i);
    expect(k432Sql).not.toMatch(/ballot/i);
  });
});

describe("Two-track separation — issuance log immutability (K433 extended)", () => {
  it("issuance_log has INSERT policy but no UPDATE policy", () => {
    const afterIssuanceRls = migrationSql.substring(
      migrationSql.indexOf("pedestal_issuance_log ENABLE ROW LEVEL SECURITY")
    );
    const nextSection = afterIssuanceRls.indexOf(
      "regcf_offering_raises ENABLE ROW LEVEL SECURITY"
    );
    const issuanceRlsBlock = afterIssuanceRls.substring(0, nextSection);

    expect(issuanceRlsBlock).toMatch(/FOR\s+INSERT/i);
    expect(issuanceRlsBlock).toMatch(/FOR\s+SELECT/i);
    expect(issuanceRlsBlock).not.toMatch(/FOR\s+UPDATE/i);
    expect(issuanceRlsBlock).not.toMatch(/FOR\s+DELETE/i);
  });
});

function extractTableBlock(sql: string, tableName: string): string {
  const startMarker = `CREATE TABLE ${tableName}`;
  const start = sql.indexOf(startMarker);
  if (start === -1) return "";
  const afterStart = sql.substring(start);
  const end = afterStart.indexOf(");");
  return afterStart.substring(0, end + 2);
}
