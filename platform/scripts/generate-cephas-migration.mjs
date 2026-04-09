/**
 * generate-cephas-migration.mjs
 * Reads Hugo content files (letters, pitches, articles, cue cards),
 * strips front matter + shortcodes, and generates a SQL migration
 * to seed cephas_content_registry.
 *
 * Run: node scripts/generate-cephas-migration.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";

const ROOT = join(import.meta.dirname, "..", "..");
const HUGO = join(ROOT, "Cephas", "cephas-hugo", "content");
const MIGRATION_NUM = "20260329000002";
const OUT = join(
  ROOT,
  "platform",
  "supabase",
  "migrations",
  `${MIGRATION_NUM}_seed_cephas_letters_pitches.sql`
);

function parseFrontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: text.trim() };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w[\w_]*)\s*:\s*"?(.+?)"?\s*$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^"/, "").replace(/"$/, "");
  }
  return { meta, body: m[2].trim() };
}

function stripShortcodes(md) {
  const lines = md.split("\n");
  const out = [];
  for (const line of lines) {
    if (/^\s*\{\{<\/?\*?\s*pudding-(progress|reveal|compare)\s/.test(line)) continue;
    if (/^\s*\{\{<\/?\*?\s*\/pudding-(progress|reveal|compare)\s/.test(line)) continue;
    if (/^\s*\{\{<\/*\s*pudding-progress\s*\*?\/>}}\s*$/.test(line)) continue;

    let l = line;

    if (/\{\{<\/?\*?\s*pudding-/.test(l) || /\{\{<\/?\*?\s*\/pudding-/.test(l)) {
      const attrMatch = l.match(/attribution="([^"]+)"/);
      const titleMatch = l.match(/title="([^"]+)"/);
      const stepsMatch = l.match(/steps="([^"]+)"/);
      const numMatch = l.match(/number="([^"]+)"/);
      const labelMatch = l.match(/label="([^"]+)"/);
      const subMatch = l.match(/sublabel="([^"]+)"/);

      if (stepsMatch) {
        const steps = stepsMatch[1].split("|");
        steps.forEach((s, i) => out.push(`${i + 1}. ${s.trim()}`));
        continue;
      }
      if (numMatch && labelMatch) {
        out.push(`**${numMatch[1]} ${labelMatch[1]}**${subMatch ? " — " + subMatch[1] : ""}`);
        out.push("");
        continue;
      }
      if (titleMatch) {
        out.push(`> **${titleMatch[1]}**`);
        out.push(">");
        continue;
      }
      if (attrMatch) {
        out.push(`*— ${attrMatch[1]}*`);
        continue;
      }
      continue;
    }

    // Strip any remaining Hugo shortcode syntax ({{< ... >}} or {{< /... >}})
    l = l.replace(/\{\{<\s*[^>]+\s*>\}\}/g, "").replace(/\{\{<\s*\/[^>]+\s*>\}\}/g, "");

    out.push(l);
  }
  return out.join("\n").trim();
}

function escapeForDollarQuote(text, tag) {
  if (text.includes(`$${tag}$`)) {
    return text.replace(new RegExp(`\\$${tag}\\$`, "g"), `\\$${tag}\\$`);
  }
  return text;
}

function processFile(filepath, tag) {
  const raw = readFileSync(filepath, "utf-8");
  const { meta, body } = parseFrontMatter(raw);
  const clean = stripShortcodes(body);
  return { meta, content: escapeForDollarQuote(clean, tag) };
}

function slugFromFilename(filename) {
  return basename(filename, ".md").toLowerCase();
}

function listMdFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "_index.md")
    .sort();
}

// Category mapping per subdirectory
const LETTER_DIRS = [
  { dir: "letters/circle-1-investors",  category: "outreach_letter", subcategory: "circle-1-investors" },
  { dir: "letters/circle-2-media",      category: "outreach_letter", subcategory: "circle-2-media" },
  { dir: "letters/circle-3-academics",  category: "outreach_letter", subcategory: "circle-3-academics" },
  { dir: "letters/crown-initiative",    category: "crown_letter",    subcategory: "crown-initiative" },
  { dir: "letters/partnerships",        category: "outreach_letter", subcategory: "partnerships" },
  { dir: "letters/blessing",            category: "outreach_letter", subcategory: "blessing" },
  { dir: "letters/health",              category: "open_letter",     subcategory: "health" },
  { dir: "letters/professional",        category: "open_letter",     subcategory: "professional" },
];

const PITCH_DIR = { dir: "letters/pitches", category: "pitch", subcategory: "pitches" };

// Root-level crown letters (not in a subdirectory)
const ROOT_CROWN = [
  "crown-letter-aoc.md",
  "crown-letter-keanu-reeves.md",
  "crown-letter-sandra-bullock.md",
  "crown-letter-schwarzenegger.md",
];

const entries = [];

// Process all letter subdirectories
for (const spec of LETTER_DIRS) {
  const fullDir = join(HUGO, spec.dir);
  const files = listMdFiles(fullDir);
  for (const f of files) {
    const slug = slugFromFilename(f);
    const tag = `md_${slug.replace(/[^a-z0-9]/g, "_")}`;
    try {
      const { meta, content } = processFile(join(fullDir, f), tag);
      if (!content || content.length < 20) {
        console.error(`SKIP (too short) ${spec.dir}/${f}`);
        continue;
      }
      entries.push({
        slug,
        title: meta.title || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        category: spec.category,
        subcategory: spec.subcategory,
        style: "pudding",
        source_path: `Cephas/cephas-hugo/content/${spec.dir}/${f}`,
        content,
        tag,
        bishop_session: meta.bishop_session || "B041",
      });
    } catch (e) {
      console.error(`SKIP ${spec.dir}/${f}: ${e.message}`);
    }
  }
}

// Root crown letters
for (const f of ROOT_CROWN) {
  const fullPath = join(HUGO, "letters", f);
  if (!existsSync(fullPath)) { console.error(`SKIP root ${f}: not found`); continue; }
  const slug = slugFromFilename(f);
  const tag = `md_${slug.replace(/[^a-z0-9]/g, "_")}`;
  try {
    const { meta, content } = processFile(fullPath, tag);
    if (!content || content.length < 20) { console.error(`SKIP (too short) root ${f}`); continue; }
    entries.push({
      slug,
      title: meta.title || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      category: "crown_letter",
      subcategory: "crown-letter",
      style: "pudding",
      source_path: `Cephas/cephas-hugo/content/letters/${f}`,
      content,
      tag,
      bishop_session: meta.bishop_session || "B041",
    });
  } catch (e) {
    console.error(`SKIP root ${f}: ${e.message}`);
  }
}

// Process pitches
{
  const fullDir = join(HUGO, PITCH_DIR.dir);
  const files = listMdFiles(fullDir);
  for (const f of files) {
    const rawSlug = slugFromFilename(f);
    const slug = rawSlug.startsWith("pitch-") ? rawSlug : `pitch-${rawSlug}`;
    const tag = `md_${slug.replace(/[^a-z0-9]/g, "_")}`;
    try {
      const { meta, content } = processFile(join(fullDir, f), tag);
      if (!content || content.length < 20) { console.error(`SKIP pitch ${f}: too short`); continue; }
      entries.push({
        slug,
        title: meta.title || `Pitch: ${rawSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
        category: "pitch",
        subcategory: "pitches",
        style: "pudding",
        source_path: `Cephas/cephas-hugo/content/${PITCH_DIR.dir}/${f}`,
        content,
        tag,
        bishop_session: meta.bishop_session || "B041",
      });
    } catch (e) {
      console.error(`SKIP pitch ${f}: ${e.message}`);
    }
  }
}

// Deduplicate by slug (keep longest content)
const slugMap = new Map();
for (const e of entries) {
  const existing = slugMap.get(e.slug);
  if (!existing || e.content.length > existing.content.length) {
    slugMap.set(e.slug, e);
  } else {
    console.warn(`DUP slug "${e.slug}" — keeping longer version (${existing.content.length} > ${e.content.length})`);
  }
}
const deduped = [...slugMap.values()];

// Generate SQL
const sqlParts = [
  `-- K155: Seed letters + pitches into cephas_content_registry`,
  `-- Auto-generated by scripts/generate-cephas-migration.mjs`,
  `-- Letters: ${deduped.filter((e) => e.category !== "pitch").length}`,
  `-- Pitches: ${deduped.filter((e) => e.category === "pitch").length}`,
  ``,
  `-- Add 'pitch' to category CHECK constraint`,
  `ALTER TABLE cephas_content_registry DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;`,
  `ALTER TABLE cephas_content_registry ADD CONSTRAINT cephas_content_registry_category_check`,
  `  CHECK (category = ANY(ARRAY['academic_paper','academic','crown_letter','outreach_letter','open_letter','system_design','initiative','innovation','hexisle','article','vault_archive','reference','under_the_hood','founder','pitch']));`,
  ``,
  `-- Add metadata JSONB column for reading levels (papers) and other structured data`,
  `ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';`,
  ``,
];

for (const e of deduped) {
  const escapedTitle = e.title.replace(/'/g, "''");
  sqlParts.push(`-- ${e.category}: ${e.slug}`);
  sqlParts.push(`INSERT INTO cephas_content_registry (slug, title, category, subcategory, style, source_path, implementation_status, bishop_session, content_markdown)`);
  sqlParts.push(`VALUES (`);
  sqlParts.push(`  '${e.slug}',`);
  sqlParts.push(`  '${escapedTitle}',`);
  sqlParts.push(`  '${e.category}',`);
  sqlParts.push(`  '${e.subcategory}',`);
  sqlParts.push(`  '${e.style}',`);
  sqlParts.push(`  '${e.source_path}',`);
  sqlParts.push(`  'live',`);
  sqlParts.push(`  '${e.bishop_session}',`);
  sqlParts.push(`  $${e.tag}$`);
  sqlParts.push(e.content);
  sqlParts.push(`$${e.tag}$`);
  sqlParts.push(`) ON CONFLICT (slug) DO UPDATE SET`);
  sqlParts.push(`  content_markdown = EXCLUDED.content_markdown,`);
  sqlParts.push(`  category = EXCLUDED.category,`);
  sqlParts.push(`  subcategory = EXCLUDED.subcategory,`);
  sqlParts.push(`  source_path = EXCLUDED.source_path,`);
  sqlParts.push(`  implementation_status = EXCLUDED.implementation_status,`);
  sqlParts.push(`  updated_at = now();`);
  sqlParts.push(``);
}

const sql = sqlParts.join("\n");
writeFileSync(OUT, sql, "utf-8");

const letterCount = deduped.filter((e) => e.category !== "pitch").length;
const pitchCount = deduped.filter((e) => e.category === "pitch").length;
console.log(`Generated migration: ${OUT}`);
console.log(`  Letters: ${letterCount}`);
console.log(`  Pitches: ${pitchCount}`);
console.log(`  Total entries: ${deduped.length}`);
console.log(`  Total size: ${(sql.length / 1024).toFixed(1)} KB`);
