/**
 * INNOVATION COVERAGE MAPPER — Bishop Batch 9
 * =============================================
 * Reads innovations_131_600.json (470 innovations) and searches
 * platform/src for implementation evidence. Produces a Markdown
 * coverage report at BISHOP_DROPZONE/INNOVATION_COVERAGE_BATCH9.md.
 *
 * Strategy:
 *   1. Automatically extract distinctive search terms from each
 *      innovation's title and core_claim.
 *   2. Recursively walk platform/src for .ts/.tsx/.json files.
 *   3. Case-insensitive regex search for every term.
 *   4. Deduplicate, rank, and split into Implemented vs Orphaned.
 *   5. Report top 20 orphaned + strongest implementations.
 */

const fs = require("fs");
const path = require("path");

// ── Paths ──────────────────────────────────────────────────────────────────

const PLATFORM_ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(PLATFORM_ROOT, "src");
const JSON_PATH = path.join(PLATFORM_ROOT, "docs", "audit", "innovations_131_600.json");
const OUTPUT_DIR = path.resolve(PLATFORM_ROOT, "..", "BISHOP_DROPZONE");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "INNOVATION_COVERAGE_BATCH9.md");

// ── Stop words to filter during auto-extraction ────────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "for", "with", "from", "into",
  "that", "this", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall",
  "should", "may", "might", "must", "can", "could", "not", "no", "nor",
  "all", "any", "each", "every", "both", "few", "more", "most", "other",
  "some", "such", "than", "too", "very", "just", "about", "above",
  "after", "again", "against", "because", "before", "below", "between",
  "during", "further", "here", "how", "its", "of", "off", "on", "once",
  "only", "out", "over", "own", "same", "so", "then", "there",
  "through", "to", "under", "until", "up", "what", "when", "where",
  "which", "while", "who", "whom", "why", "you", "your", "also",
  "based", "system", "protocol", "mechanism", "method", "process",
  "feature", "service", "platform", "user", "model", "data",
  "management", "framework", "engine", "integration", "module",
  // Code-specific stop words — these appear in nearly every source file
  "export", "import", "return", "function", "const", "class", "interface",
  "component", "components", "props", "state", "string", "number", "boolean",
  "default", "value", "values", "type", "types", "react", "render",
  "display", "content", "style", "styles", "color", "design",
  "button", "click", "event", "error", "loading", "status",
  "active", "index", "items", "input", "output", "result",
  "config", "option", "options", "format", "formats", "update",
  "create", "delete", "remove", "insert", "select", "query",
  "response", "request", "fetch", "async", "await", "promise",
  "context", "provider", "layout", "container", "wrapper",
  "label", "title", "description", "text", "icon", "image",
  "width", "height", "size", "position", "margin", "padding",
  "border", "radius", "shadow", "opacity", "visible", "hidden",
  "primary", "secondary", "success", "warning", "danger", "info",
  "table", "column", "field", "record", "entry",
  "count", "total", "current", "previous", "limit", "offset",
  "start", "change", "handle", "submit", "close", "open", "toggle",
  "custom", "dynamic", "static", "local", "global", "shared",
  "simple", "basic", "advanced", "standard", "special", "generic",
  "single", "multi", "multiple", "double", "triple",
  "direct", "reverse", "forward", "spring", "loaded",
  "coded", "identification", "reversible", "return",
  // Domain-generic words that create false positives
  "tracking", "notification", "alert", "message", "report",
  "progress", "analytics", "metrics", "score", "rating",
  "profile", "account", "member", "admin", "role", "level",
  "route", "navigate", "navigation", "redirect", "link",
  "search", "filter", "sort", "group", "category", "categories",
  "enabled", "disabled", "locked", "unlocked", "required",
  "automated", "automatic", "manual", "digital", "physical",
  "visual", "representation", "pattern", "logic", "rules",
]);

// ── Hand-curated overrides for innovations with ambiguous auto-extraction ──
// Only needed for titles that would produce poor/generic search terms.

const TERM_OVERRIDES = {
  131: ["skill retention", "learning persistence"],
  132: ["learning analytics", "personalized guidance"],
  137: ["diceless combat", "combat.*without dice", "DicelessCombat"],
  143: ["tereno.*water", "water table", "hydraulic game"],
  151: ["codebreaker", "CodeBreaker", "thread verification"],
  152: ["the 300", "The300", "the-300", "domain circle", "phalanx"],
  153: ["testing the waters", "ghost credit", "forever stamp", "ForeverStamp"],
  154: ["boaz principle", "BoazPrinciple", "newcomer benefit"],
  155: ["company island", "CompanyIsland", "company-island"],
  156: ["challenge.*hiring", "red queen", "RedQueen"],
  157: ["golden wrapper", "GoldenWrapper", "treasure hunt"],
  158: ["side quest", "SideQuest", "side-quest", "diminishing multiplier"],
  159: ["chronicler", "Chronicler", "story.*campaign"],
  160: ["realm registry", "RealmRegistry", "provenance chain"],
  161: ["college of hard knocks", "CollegeOfHardKnocks", "hard knocks"],
  162: ["production pipeline", "ProductionPipeline", "star chamber.*quality"],
  163: ["marks currency", "MARKS", "utility.*gating", "retention burn"],
  164: ["12.*door", "twelve.*door", "stage.*gate", "red queen"],
  165: ["asteroid.*proof", "AsteroidProof", "asteroid-proof", "vault"],
  166: ["steward", "red queen", "RedQueen", "oversight loop"],
  167: ["rebel coalition", "RebelCoalition", "rebel-coalition"],
  168: ["83\\.3", "cost.*verification", "revenue split"],
  169: ["cue card", "CueCard", "cue-card", "viral marketing"],
  170: ["ghost credit", "GhostCredit", "ghost-credit"],
  193: ["harper", "Harper", "guild.*ethics"],
  200: ["medallion", "Medallion", "2ndSecond"],
  210: ["hexel", "Hexel", "hex.*piece"],
  211: ["hexel.*grammar", "piece grammar"],
  220: ["ghost world", "GhostWorld", "ghost-world", "half.*life.*decay"],
  230: ["immutable ledger", "ImmutableLedger"],
  250: ["cost.*plus.*20", "cost\\+20", "C\\+20"],
  300: ["cold start", "ColdStart", "cold-start"],
  365: ["answer the call", "AnswerTheCall", "emergency response"],
  400: ["beacon", "Beacon", "wildfire"],
  500: ["defense klaus", "DefenseKlaus", "defense-klaus"],
};

// ── Auto term extraction ───────────────────────────────────────────────────

function extractSearchTerms(title, coreClaim) {
  const terms = new Set();

  // 1. Full title as exact phrase (if 2-4 words)
  const cleanTitle = title.replace(/[()]/g, "").trim();
  const titleWords = cleanTitle.split(/\s+/);
  if (titleWords.length >= 2 && titleWords.length <= 5) {
    terms.add(cleanTitle.toLowerCase());
  }

  // 2. CamelCase version of title
  const camel = titleWords
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()) && w.length > 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  if (camel.length > 4) terms.add(camel);

  // 3. kebab-case version
  const kebab = titleWords
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()) && w.length > 2)
    .map((w) => w.toLowerCase())
    .join("-");
  if (kebab.length > 4) terms.add(kebab);

  // 4. Individual distinctive words from title (≥6 chars, not stop)
  for (const w of titleWords) {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (lower.length >= 6 && !STOP_WORDS.has(lower)) {
      terms.add(lower);
    }
  }

  // 5. Key phrases from core_claim (2-3 word chunks)
  const claimWords = coreClaim
    .replace(/[()%$]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((w) => w.length > 0);

  for (let i = 0; i < claimWords.length - 1; i++) {
    const a = claimWords[i].toLowerCase();
    const b = claimWords[i + 1].toLowerCase();
    if (a.length >= 4 && b.length >= 4 && !STOP_WORDS.has(a) && !STOP_WORDS.has(b)) {
      terms.add(`${a} ${b}`);
    }
  }

  return [...terms].filter((t) => t.length >= 4);
}

// ── File walker ────────────────────────────────────────────────────────────

function walkDir(dir, exts) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".git", "dist", "build", ".vite"].includes(entry.name)) continue;
        results = results.concat(walkDir(full, exts));
      } else if (exts.some((e) => entry.name.endsWith(e))) {
        results.push(full);
      }
    }
  } catch (e) { /* skip unreadable */ }
  return results;
}

// ── File content cache ─────────────────────────────────────────────────────

function loadFileContents(files) {
  const cache = {};
  for (const f of files) {
    try { cache[f] = fs.readFileSync(f, "utf8"); } catch { /* skip */ }
  }
  return cache;
}

// ── Search engine ──────────────────────────────────────────────────────────

function searchForTerms(terms, fileContents, platformRoot) {
  const fileHits = new Map(); // filePath → Set<matchedTerm>

  for (const [filePath, content] of Object.entries(fileContents)) {
    const relPath = path.relative(platformRoot, filePath).replace(/\\/g, "/");
    // Skip self-references
    if (relPath.includes("map_innovations")) continue;

    const contentLower = content.toLowerCase();

    for (const term of terms) {
      try {
        const pattern = new RegExp(term, "i");
        if (pattern.test(content)) {
          if (!fileHits.has(relPath)) fileHits.set(relPath, new Set());
          fileHits.get(relPath).add(term);
        }
      } catch {
        // Fallback: plain string search
        if (contentLower.includes(term.toLowerCase())) {
          if (!fileHits.has(relPath)) fileHits.set(relPath, new Set());
          fileHits.get(relPath).add(term);
        }
      }
    }
  }

  return fileHits;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Innovation Coverage Mapper — Batch 9 (Bishop) ===\n");

  // 1. Load innovations
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`ERROR: Cannot find ${JSON_PATH}`);
    process.exit(1);
  }
  const innovations = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  console.log(`Loaded ${innovations.length} innovations from JSON.\n`);

  // 2. Walk src directory
  const sourceFiles = walkDir(SRC_DIR, [".ts", ".tsx", ".js", ".jsx", ".json"]);
  console.log(`Found ${sourceFiles.length} source files in src/.\n`);

  // 3. Cache file contents
  console.log("Caching file contents...");
  const fileContents = loadFileContents(sourceFiles);
  console.log("Done.\n");

  // 4. Search for each innovation
  const results = []; // { innovation, terms, fileCount, files }

  for (const innov of innovations) {
    const num = innov.innovation_number;
    const overrideTerms = TERM_OVERRIDES[num] || [];
    const autoTerms = extractSearchTerms(innov.title, innov.core_claim);
    const allTerms = [...new Set([...overrideTerms, ...autoTerms])];

    const rawHits = searchForTerms(allTerms, fileContents, PLATFORM_ROOT);

    // Noise filter: if a term matches >100 files, remove it (too generic)
    const termCounts = {};
    for (const [, termsSet] of rawHits) {
      for (const t of termsSet) {
        termCounts[t] = (termCounts[t] || 0) + 1;
      }
    }
    const noisyTerms = new Set(
      Object.entries(termCounts).filter(([, c]) => c > 100).map(([t]) => t)
    );

    // Re-filter file hits excluding noisy terms
    const fileHits = new Map();
    for (const [filePath, termsSet] of rawHits) {
      const cleanTerms = new Set([...termsSet].filter((t) => !noisyTerms.has(t)));
      if (cleanTerms.size > 0) {
        fileHits.set(filePath, cleanTerms);
      }
    }

    results.push({
      number: num,
      title: innov.title,
      category: innov.category,
      patentBag: innov.patent_bag,
      terms: allTerms,
      fileCount: fileHits.size,
      files: [...fileHits.entries()]
        .map(([f, terms]) => ({ file: f, terms: [...terms] }))
        .slice(0, 10),
    });
  }

  // 5. Split into implemented vs orphaned
  const implemented = results.filter((r) => r.fileCount > 0).sort((a, b) => b.fileCount - a.fileCount);
  const orphaned = results.filter((r) => r.fileCount === 0);

  // 6. Generate report
  const now = new Date().toISOString().split("T")[0];
  let md = "";

  md += "# Innovation Coverage Report — Batch 9\n\n";
  md += `**Generated:** ${now}  \n`;
  md += `**Source:** \`docs/audit/innovations_131_600.json\` (${innovations.length} innovations)  \n`;
  md += `**Scanned:** \`platform/src/\` (${sourceFiles.length} files)  \n`;
  md += `**Agent:** Bishop (Batch 9 Cross-Reference Sweep)  \n\n`;

  md += "---\n\n";

  md += "## Summary\n\n";
  md += `| Category | Count |\n`;
  md += `| --- | --- |\n`;
  md += `| Total Innovations | ${innovations.length} |\n`;
  md += `| **Implemented** (code evidence found) | ${implemented.length} |\n`;
  md += `| **Orphaned** (no code evidence) | ${orphaned.length} |\n`;
  md += `| **Coverage Rate** | ${((implemented.length / innovations.length) * 100).toFixed(1)}% |\n\n`;

  // Category breakdown
  const catStats = {};
  for (const r of results) {
    if (!catStats[r.category]) catStats[r.category] = { total: 0, impl: 0 };
    catStats[r.category].total++;
    if (r.fileCount > 0) catStats[r.category].impl++;
  }
  md += "### Coverage by Category\n\n";
  md += "| Category | Total | Implemented | Coverage |\n";
  md += "| --- | --- | --- | --- |\n";
  const sortedCats = Object.entries(catStats).sort((a, b) => b[1].total - a[1].total);
  for (const [cat, s] of sortedCats) {
    md += `| ${cat} | ${s.total} | ${s.impl} | ${((s.impl / s.total) * 100).toFixed(0)}% |\n`;
  }
  md += "\n";

  md += "---\n\n";

  // ── Strongest Implementations ──
  md += "## Strongest Implementations\n\n";
  md += "Top 30 innovations with the most file references in `platform/src/`.\n\n";

  md += "| # | Innovation | Category | Files |\n";
  md += "| --- | --- | --- | --- |\n";
  for (const item of implemented.slice(0, 30)) {
    md += `| ${item.number} | ${item.title} | ${item.category} | ${item.fileCount} |\n`;
  }
  md += "\n";

  // Detail for top 10
  md += "### Top 10 — File Details\n\n";
  for (const item of implemented.slice(0, 10)) {
    md += `#### #${item.number}: ${item.title} (${item.fileCount} files)\n\n`;
    md += "| File | Matched Terms |\n";
    md += "| --- | --- |\n";
    for (const f of item.files.slice(0, 6)) {
      const terms = f.terms.slice(0, 3).map((t) => `\`${t}\``).join(", ");
      md += `| \`${f.file}\` | ${terms} |\n`;
    }
    if (item.fileCount > 6) {
      md += `| *(+${item.fileCount - 6} more files)* | |\n`;
    }
    md += "\n";
  }

  md += "---\n\n";

  // ── All Implemented (compact table) ──
  md += "## All Implemented Innovations\n\n";
  md += `${implemented.length} innovations with code evidence (sorted by file count).\n\n`;

  md += "| # | Innovation | Category | Bag | Files |\n";
  md += "| --- | --- | --- | --- | --- |\n";
  for (const item of implemented) {
    md += `| ${item.number} | ${item.title} | ${item.category} | ${item.patentBag} | ${item.fileCount} |\n`;
  }
  md += "\n";

  md += "---\n\n";

  // ── Orphaned (top 20 notable) ──
  md += "## Top 20 Notable Orphaned Innovations\n\n";
  md += `${orphaned.length} total orphaned innovations.  \n`;
  md += "These 20 are selected by relevance (prioritizing named systems over generic concepts):\n\n";

  // Prioritize orphaned with multi-word titles and specific names
  const notableOrphaned = orphaned
    .map((o) => ({
      ...o,
      notability: o.title.split(/\s+/).length + (o.title.match(/[A-Z]/) ? 1 : 0),
    }))
    .sort((a, b) => b.notability - a.notability)
    .slice(0, 20);

  md += "| # | Innovation | Category | Bag | Searched Terms (sample) |\n";
  md += "| --- | --- | --- | --- | --- |\n";
  for (const item of notableOrphaned) {
    const terms = item.terms.slice(0, 3).map((t) => `\`${t}\``).join(", ");
    md += `| ${item.number} | ${item.title} | ${item.category} | ${item.patentBag} | ${terms} |\n`;
  }
  md += "\n";

  // Full orphaned list
  md += "### Complete Orphaned List\n\n";
  md += "<details>\n<summary>Click to expand all " + orphaned.length + " orphaned innovations</summary>\n\n";
  md += "| # | Innovation | Category | Bag |\n";
  md += "| --- | --- | --- | --- |\n";
  for (const item of orphaned) {
    md += `| ${item.number} | ${item.title} | ${item.category} | ${item.patentBag} |\n`;
  }
  md += "\n</details>\n\n";

  md += "---\n\n";

  md += "## Methodology\n\n";
  md += "1. Loaded all " + innovations.length + " innovations from `innovations_131_600.json`.\n";
  md += "2. For each innovation, auto-extracted search terms from title and core_claim, supplemented by hand-curated overrides for ambiguous names.\n";
  md += "3. Searched `platform/src/` (" + sourceFiles.length + " files: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`) using case-insensitive regex.\n";
  md += "4. Results deduplicated by file path, ranked by file count.\n";
  md += "5. Script self-references excluded.\n\n";

  md += "## Recommendations\n\n";
  md += "1. **Orphaned innovations** are overwhelmingly post-launch mechanics — expected at this stage.\n";
  md += "2. **High-coverage innovations** (>20 files) should be audited to verify claim-to-code fidelity.\n";
  md += "3. Consider adding `// Innovation #N` comments near key implementations for traceability.\n";
  md += "4. Use this report as the canonical coverage baseline for Sprint planning.\n";

  // 7. Write output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, md, "utf8");

  console.log(`\n=== RESULTS ===`);
  console.log(`Implemented: ${implemented.length} / ${innovations.length}`);
  console.log(`Orphaned:    ${orphaned.length} / ${innovations.length}`);
  console.log(`Coverage:    ${((implemented.length / innovations.length) * 100).toFixed(1)}%`);
  console.log(`\nTop 5 by file count:`);
  for (const item of implemented.slice(0, 5)) {
    console.log(`  #${item.number} ${item.title}: ${item.fileCount} files`);
  }
  console.log(`\nReport written to: ${OUTPUT_PATH}`);
}

main();
