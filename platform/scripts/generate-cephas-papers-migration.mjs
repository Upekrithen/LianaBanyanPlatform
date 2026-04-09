/**
 * generate-cephas-papers-migration.mjs
 * Reads academic paper files from BISHOP_DROPZONE and KNIGHT_DROPZONE,
 * generates a SQL migration to seed/update cephas_content_registry.
 * Handles three-reading-level system via metadata JSONB.
 *
 * Run: node scripts/generate-cephas-papers-migration.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..", "..");
const BISHOP = join(ROOT, "BISHOP_DROPZONE");
const KNIGHT = join(ROOT, "KNIGHT_DROPZONE");
const MARKUP = join(ROOT, "01 MarkupFiles");
const MIGRATION_NUM = "20260329000003";
const OUT = join(ROOT, "platform", "supabase", "migrations", `${MIGRATION_NUM}_seed_cephas_academic_papers.sql`);

function readFile(path) {
  if (!existsSync(path)) { console.error(`NOT FOUND: ${path}`); return null; }
  let text = readFileSync(path, "utf-8");
  const m = text.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (m) text = m[1];
  return text.trim();
}

function makeTag(slug, suffix) {
  return `md_${slug.replace(/[^a-z0-9]/g, "_")}${suffix ? "_" + suffix : ""}`;
}

function escapeForDollarQuote(text, tag) {
  if (text && text.includes(`$${tag}$`)) {
    return text.replace(new RegExp(`\\$${tag}\\$`, "g"), `\\$${tag}\\$`);
  }
  return text;
}

// Paper definitions: slug, title, source files, operation type
const PAPERS = [
  // ── UPDATE existing 8 entries ──
  {
    slug: "accounts-payable-marks-paper",
    title: "Accounts Payable & Eligible Marks (Academic)",
    op: "update",
    full: join(BISHOP, "PAPER_ACCOUNTS_PAYABLE_ELIGIBLE_MARKS_V3.md"),
    more_details: join(BISHOP, "PAPER_ACCOUNTS_PAYABLE_ELIGIBLE_MARKS_V2.md"),
  },
  {
    slug: "civ-paper",
    title: "Compounding Innovation Velocity",
    op: "update",
    full: join(BISHOP, "PAPER_COMPOUNDING_INNOVATION_VELOCITY.md"),
  },
  {
    slug: "compounding-innovation-velocity",
    title: "Compounding Innovation Velocity",
    op: "update",
    full: join(BISHOP, "PAPER_COMPOUNDING_INNOVATION_VELOCITY.md"),
  },
  {
    slug: "design-democracy-paper",
    title: "Design Democracy (Academic)",
    op: "update",
    full: join(BISHOP, "PAPER_DESIGN_DEMOCRACY_DRAFT_V1.md"),
  },
  {
    slug: "executive-pay-cooperative",
    title: "Executive Pay in Cooperative Governance",
    op: "update",
    full: join(BISHOP, "PAPER_EXECUTIVE_PAY_IN_DEPTH.md"),
    more_details: join(BISHOP, "PAPER_EXECUTIVE_PAY_MORE_DETAILS.md"),
    at_a_glance: join(BISHOP, "PAPER_EXECUTIVE_PAY_AT_A_GLANCE.md"),
  },
  {
    slug: "how-to-bake-ai-cake-paper",
    title: "How to Bake an AI Cake (Academic)",
    op: "update",
    full: join(BISHOP, "PAPER_HOW_TO_BAKE_AI_CAKE_FULL.md"),
    at_a_glance: join(BISHOP, "PAPER_OUTLINE_HOW_TO_BAKE_AI_CAKE.md"),
  },
  {
    slug: "sipping-tea",
    title: "Sipping Tea with the LibrarAIn",
    op: "update",
    full: join(BISHOP, "PAPER_SIPPING_TEA_DRAFT_V1.md"),
  },
  {
    slug: "waterwheels-economics",
    title: "WaterWheels: Three-Currency Economic Architecture",
    op: "update",
    full: join(BISHOP, "PAPER_WATERWHEELS_FULL.md"),
    at_a_glance: join(BISHOP, "PAPER_OUTLINE_WATERWHEELS.md"),
  },

  // ── INSERT new papers from BISHOP_DROPZONE ──
  {
    slug: "canister-system-paper",
    title: "The Canister System",
    op: "insert",
    full: join(BISHOP, "PAPER_CANISTER_SYSTEM_DRAFT_V2.md"),
    more_details: join(BISHOP, "PAPER_CANISTER_SYSTEM_DRAFT_V1.md"),
  },
  {
    slug: "roi-predictability-paper",
    title: "ROI Predictability in Cooperative Platforms",
    op: "insert",
    full: join(BISHOP, "ACADEMIC_PAPER_ROI_PREDICTABILITY_V3.md"),
    more_details: join(BISHOP, "ACADEMIC_PAPER_ROI_PREDICTABILITY_V2.md"),
  },
  {
    slug: "boaz-principle-paper",
    title: "The Boaz Principle: Structural Gleaning",
    op: "insert",
    full: join(BISHOP, "ACADEMIC_PAPER_BOAZ_PRINCIPLE_BISHOP.md"),
  },
  {
    slug: "anti-extractive-paper",
    title: "The Anti-Extractive Derivative",
    op: "insert",
    full: join(BISHOP, "ACADEMIC_PAPER_ANTI_EXTRACTIVE_DERIVATIVE_BISHOP.md"),
  },
  {
    slug: "youre-in-charge-paper",
    title: "You're in Charge of YOU",
    op: "insert",
    full: join(BISHOP, "ACADEMIC_PAPER_YOURE_IN_CHARGE_OF_YOU.md"),
  },
  {
    slug: "2nd-second-revolution-paper",
    title: "The 2nd Second Industrial Revolution",
    op: "insert",
    full: join(BISHOP, "PAPER_2ND_SECOND_INDUSTRIAL_REVOLUTION_3_AUDIENCES.md"),
  },
  {
    slug: "industry-backbone-paper",
    title: "Industry Backbone Architecture",
    op: "insert",
    full: join(BISHOP, "PAPER_INDUSTRY_BACKBONE_3_AUDIENCES.md"),
  },
  {
    slug: "lighthouse-ladder-paper",
    title: "The Lighthouse Ladder",
    op: "insert",
    full: join(BISHOP, "PAPER_1_LIGHTHOUSE_LADDER_FULL_DRAFT.md"),
  },
  {
    slug: "invisible-temperament-paper",
    title: "The Invisible Temperament",
    op: "insert",
    full: join(BISHOP, "PAPER_2_INVISIBLE_TEMPERAMENT_FULL_DRAFT.md"),
  },
  {
    slug: "self-funding-economics-paper",
    title: "Self-Funding Platform Economics",
    op: "insert",
    full: join(BISHOP, "PAPER_3_SELF_FUNDING_ECONOMICS_FULL_DRAFT.md"),
  },
  {
    slug: "portable-reputation-paper",
    title: "Portable Reputation Systems",
    op: "insert",
    full: join(BISHOP, "PAPER_4_PORTABLE_REPUTATION_FULL_DRAFT.md"),
  },
  {
    slug: "contingency-operators-paper",
    title: "Contingency Operators in Platform Governance",
    op: "insert",
    full: join(BISHOP, "PAPER_5_CONTINGENCY_OPERATORS_FULL_DRAFT.md"),
  },
  {
    slug: "reciprocal-maintenance-paper",
    title: "Reciprocal Maintenance Economics",
    op: "insert",
    full: join(BISHOP, "PAPER_RECIPROCAL_MAINTENANCE.md"),
  },
  {
    slug: "right-to-direct-ip-paper",
    title: "Right to Direct IP Governance",
    op: "insert",
    full: join(BISHOP, "PAPER_RIGHT_TO_DIRECT_IP_GOVERNANCE.md"),
  },
  {
    slug: "sequence-security-paper",
    title: "Sequence Security Architecture",
    op: "insert",
    full: join(BISHOP, "PAPER_SEQUENCE_SECURITY.md"),
  },
  {
    slug: "xp-score-paper",
    title: "XP Score System (Academic)",
    op: "insert",
    full: join(BISHOP, "PAPER_XP_SCORE_SYSTEM_ACADEMIC.md"),
  },

  // ── INSERT from KNIGHT_DROPZONE (unique papers not in BISHOP) ──
  {
    slug: "300-framework-paper",
    title: "The 300 Framework: Fixed-Capacity Organization",
    op: "insert",
    full: join(KNIGHT, "ACADEMIC_PAPER_300_FRAMEWORK.md"),
  },
  {
    slug: "ghost-credits-paper",
    title: "Ghost Credits & Demand Validation",
    op: "insert",
    full: join(KNIGHT, "ACADEMIC_PAPER_GHOST_CREDITS.md"),
  },
  {
    slug: "three-gear-currency-paper",
    title: "Three-Gear Currency System",
    op: "insert",
    full: join(KNIGHT, "ACADEMIC_PAPER_THREE_GEAR_CURRENCY.md"),
  },
];

// Generate SQL
const sql = [];
sql.push(`-- K155 Task 2: Seed academic papers into cephas_content_registry`);
sql.push(`-- Auto-generated by scripts/generate-cephas-papers-migration.mjs`);
sql.push(`-- Updates: ${PAPERS.filter(p => p.op === "update").length}`);
sql.push(`-- Inserts: ${PAPERS.filter(p => p.op === "insert").length}`);
sql.push(``);

let updateCount = 0;
let insertCount = 0;

for (const paper of PAPERS) {
  const fullContent = readFile(paper.full);
  if (!fullContent) { console.error(`SKIP ${paper.slug}: full detail file not found`); continue; }

  const moreContent = paper.more_details ? readFile(paper.more_details) : null;
  const glanceContent = paper.at_a_glance ? readFile(paper.at_a_glance) : null;
  const hasLevels = moreContent || glanceContent;

  const fullTag = makeTag(paper.slug, "full");
  const fullEscaped = escapeForDollarQuote(fullContent, fullTag);
  const escapedTitle = paper.title.replace(/'/g, "''");
  const sourcePath = paper.full.replace(ROOT + "\\", "").replace(/\\/g, "/");

  sql.push(`-- ${paper.slug}`);

  if (paper.op === "update") {
    sql.push(`UPDATE cephas_content_registry SET`);
    sql.push(`  content_markdown = $${fullTag}$`);
    sql.push(fullEscaped);
    sql.push(`$${fullTag}$,`);
    sql.push(`  implementation_status = 'live',`);
    sql.push(`  source_path = '${sourcePath}',`);
    sql.push(`  updated_at = now()`);
    sql.push(`WHERE slug = '${paper.slug}';`);
    updateCount++;
  } else {
    sql.push(`INSERT INTO cephas_content_registry (slug, title, category, style, source_path, implementation_status, bishop_session, content_markdown)`);
    sql.push(`VALUES (`);
    sql.push(`  '${paper.slug}',`);
    sql.push(`  '${escapedTitle}',`);
    sql.push(`  'academic_paper',`);
    sql.push(`  'clean_academic',`);
    sql.push(`  '${sourcePath}',`);
    sql.push(`  'live',`);
    sql.push(`  'K155',`);
    sql.push(`  $${fullTag}$`);
    sql.push(fullEscaped);
    sql.push(`$${fullTag}$`);
    sql.push(`) ON CONFLICT (slug) DO UPDATE SET`);
    sql.push(`  content_markdown = EXCLUDED.content_markdown,`);
    sql.push(`  source_path = EXCLUDED.source_path,`);
    sql.push(`  implementation_status = EXCLUDED.implementation_status,`);
    sql.push(`  updated_at = now();`);
    insertCount++;
  }
  sql.push(``);

  // Set reading levels metadata if paper has multiple versions
  if (hasLevels) {
    sql.push(`-- ${paper.slug} reading levels`);
    const parts = [];
    if (glanceContent) {
      const gTag = makeTag(paper.slug, "glance");
      const gEscaped = escapeForDollarQuote(glanceContent, gTag);
      parts.push(`      'at_a_glance', $${gTag}$${gEscaped}$${gTag}$::text`);
    }
    if (moreContent) {
      const mTag = makeTag(paper.slug, "more");
      const mEscaped = escapeForDollarQuote(moreContent, mTag);
      parts.push(`      'more_details', $${mTag}$${mEscaped}$${mTag}$::text`);
    }
    parts.push(`      'full_detail', 'true'`);

    sql.push(`UPDATE cephas_content_registry SET metadata = jsonb_build_object(`);
    sql.push(`  'reading_levels', jsonb_build_object(`);
    sql.push(parts.join(",\n"));
    sql.push(`  )`);
    sql.push(`) WHERE slug = '${paper.slug}';`);
    sql.push(``);
  }
}

const output = sql.join("\n");
writeFileSync(OUT, output, "utf-8");

console.log(`Generated migration: ${OUT}`);
console.log(`  Updates: ${updateCount}`);
console.log(`  Inserts: ${insertCount}`);
console.log(`  Total: ${updateCount + insertCount}`);
console.log(`  Size: ${(output.length / 1024).toFixed(1)} KB`);
