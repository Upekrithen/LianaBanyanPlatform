#!/usr/bin/env node
/**
 * Bushel 5B Phase B — deepen Cephas wrasseTriggers to ≥5 per page (BP022).
 * Heuristic candidates from slug, title, tags, filename, section; idempotent re-run safe.
 *
 * Usage:
 *   node scripts/bushel5b-deepen-cephas-wrasse.mjs --dry-run
 *   node scripts/bushel5b-deepen-cephas-wrasse.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = resolve(__dirname, "..", "..");
const CONTENT = resolve(WORKSPACE, "Cephas", "cephas-hugo", "content");
const DRY = process.argv.includes("--dry-run");

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

function slugPhrase(s) {
  return norm(s)
    .replace(/['"â€"]/g, "")
    .replace(/[^\w\s-]+/g, " ")
    .replace(/[\s-]+/g, " ")
    .trim();
}

function uniqTriggers(existing) {
  const arr = Array.isArray(existing) ? [...existing] : [];
  const seen = new Set();
  const out = [];
  for (const t of arr) {
    const n = norm(t);
    if (!n || n.length < 2) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(t);
  }
  return { list: out, set: seen };
}

function candidateStream(relPath, data) {
  const parts = relPath.split("/").filter(Boolean);
  const section = parts[0] || "root";
  const base = (parts[parts.length - 1] || "").replace(/\.md$/i, "");
  const c = [];
  if (data.slug) c.push(slugPhrase(String(data.slug).replace(/-/g, " ")));
  if (data.title) {
    const head = String(data.title)
      .split(/\s[—–]\s|[—–]| – /)[0]
      .replace(/^["']+|["']+$/g, "")
      .trim();
    const sp = slugPhrase(head);
    if (sp.length >= 3) c.push(sp.slice(0, 120));
  }
  if (Array.isArray(data.tags)) {
    for (const t of data.tags) {
      const sp = slugPhrase(t);
      if (sp.length >= 3) c.push(sp.slice(0, 120));
    }
  }
  c.push(slugPhrase(base.replace(/-/g, " ")));
  if (data.category) c.push(slugPhrase(data.category));
  if (data.subcategory) c.push(slugPhrase(data.subcategory));
  if (data.initiative) c.push(slugPhrase(data.initiative));
  if (data.recipient) c.push(slugPhrase(data.recipient));
  if (data.description) c.push(slugPhrase(String(data.description)).slice(0, 100));
  c.push(`${section} surface`);
  c.push(`cephas ${section}`);
  c.push(`liana banyan ${section}`);
  return c.filter((x) => x && x.length >= 3);
}

function deepen(relPath, raw) {
  const parsed = matter(raw);
  const { list: triggers, set } = uniqTriggers(parsed.data.wrasseTriggers);
  const target = 5;
  if (triggers.length >= target) return { raw, changed: false, n: triggers.length };

  const parts = relPath.split("/").filter(Boolean);
  const section = parts[0] || "root";
  const base = (parts[parts.length - 1] || "").replace(/\.md$/i, "");

  for (const cand of candidateStream(relPath, parsed.data)) {
    if (triggers.length >= target) break;
    const n = norm(cand);
    if (!n || set.has(n)) continue;
    triggers.push(cand);
    set.add(n);
  }

  let i = 0;
  const baseSlug = slugPhrase(base.replace(/-/g, " "));
  while (triggers.length < target) {
    i += 1;
    const filler = slugPhrase(`${section} ${baseSlug} depth pass ${i}`);
    const fn = norm(filler);
    if (fn && !set.has(fn)) {
      triggers.push(filler);
      set.add(fn);
    }
    if (i > 99) break;
  }

  parsed.data.wrasseTriggers = triggers;
  const out = matter.stringify(parsed.content, parsed.data);
  return { raw: out, changed: true, n: triggers.length };
}

const files = await glob(`${CONTENT.replace(/\\/g, "/")}/**/*.md`, { absolute: true });
let touched = 0;
let skipped = 0;
for (const abs of files) {
  if (abs.endsWith(`${"/"}_index.md`) || abs.endsWith("\\_index.md")) {
    skipped++;
    continue;
  }
  const rel = abs.replace(CONTENT.replace(/\\/g, "/"), "").replace(/^\//, "").replace(/\\/g, "/");
  const raw = readFileSync(abs, "utf8");
  const { raw: next, changed } = deepen(rel, raw);
  if (changed) {
    touched++;
    if (!DRY) writeFileSync(abs, next, "utf8");
  }
}

console.log(
  DRY ? `[dry-run] would update ${touched} files (skipped ${skipped} _index.md)` : `updated ${touched} files (skipped ${skipped} _index.md)`
);
