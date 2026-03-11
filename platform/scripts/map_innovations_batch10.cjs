/**
 * INNOVATION COVERAGE MAPPER — Bishop Batch 10
 * ==============================================
 * Reads innovations_601_1560.json (940 innovations) and searches
 * platform/src for implementation evidence. Produces a Markdown
 * coverage report at BISHOP_DROPZONE/INNOVATION_COVERAGE_BATCH10.md.
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
const JSON_PATH = path.join(PLATFORM_ROOT, "docs", "audit", "innovations_601_1560.json");
const OUTPUT_DIR = path.resolve(PLATFORM_ROOT, "..", "BISHOP_DROPZONE");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "INNOVATION_COVERAGE_BATCH10.md");

// ── Stop words to filter during auto-extraction ────────────────────────────

const STOP_WORDS = new Set([
  // English stop words
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
  // Domain-generic — appear across nearly every innovation title
  "based", "system", "protocol", "mechanism", "method", "process",
  "feature", "service", "platform", "user", "model", "data", "tool",
  "management", "framework", "engine", "integration", "module",
  "network", "control", "board", "panel", "interface", "structure",
  "view", "page", "flow", "chain", "layer", "gate", "bridge",
  "policy", "rules", "scheme", "registry", "pipeline", "matrix",
  "listing", "collection", "algorithm", "strategy", "program",
  "monitor", "handler", "manager", "checker", "detector", "scanner",
  "mapper", "resolver", "builder", "generator", "calculator",
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
  "coded", "identification", "reversible",
  // Domain-generic words that create false positives
  "tracking", "notification", "alert", "message", "report",
  "progress", "analytics", "metrics", "score", "rating",
  "profile", "account", "member", "admin", "role", "level",
  "route", "navigate", "navigation", "redirect", "link",
  "search", "filter", "sort", "group", "category", "categories",
  "enabled", "disabled", "locked", "unlocked", "required",
  "automated", "automatic", "manual", "digital", "physical",
  "visual", "representation", "pattern", "logic",
  // Batch 10 additions — very common across Governance/Economics/Security
  "voting", "review", "approval", "access", "permission", "verification",
  "community", "cooperative", "worker", "seller", "buyer", "merchant",
  "pricing", "payment", "credit", "credits", "transaction", "transfer",
  "dispute", "penalty", "reward", "rewards", "bonus", "incentive",
  "tier", "tiered", "threshold", "weighted", "factor", "scoring",
  "queue", "lifecycle", "workflow", "trigger", "action", "actions",
  "badge", "badges", "achievement", "rank", "ranking",
  "audit", "compliance", "prevention", "detection", "enforcement",
  "cap", "floor", "ceiling", "minimum", "maximum",
  "transparency", "visibility", "dashboard", "overview",
  "onboarding", "membership", "registration", "invitation",
  "initiative", "initiatives", "charitable",
  "competition", "challenge", "contest",
  "creative", "collaboration", "sharing",
  "roster", "assignment", "allocation",
  "session", "version", "history", "archive",
  "rotation", "cycle", "period", "duration",
  "expansion", "extension", "enhancement",
  "council", "committee", "assembly",
]);

// ── Hand-curated overrides for innovations with distinctive names ──────────
// Only needed for titles that would produce poor search terms or that have
// well-known platform-specific identifiers.

const TERM_OVERRIDES = {
  // Let's Make Bread initiatives
  601: ["sourdough", "Sourdough", "starter sharing"],
  602: ["recipe marketplace", "RecipeMarketplace"],
  604: ["ingredient sourcing", "IngredientSourcing", "bulk.*flour"],
  // Harper Guild
  606: ["harper guild", "HarperGuild", "harper-guild"],
  607: ["quality review", "QualityReview", "content QA"],
  609: ["attribution chain", "AttributionChain", "attribution-chain"],
  610: ["arbitration", "Arbitration", "dispute.*resolution"],
  // HexIsle
  617: ["hex.*island", "HexIsle", "hexisle", "hexislo"],
  618: ["tereno", "Tereno", "hex.*terrain"],
  619: ["hex.*crafting", "HexCraft", "hexcraft"],
  // Pudding styles
  626: ["pudding", "Pudding", "scrollytelling"],
  // Cephas
  627: ["cephas", "Cephas"],
  // Ghost World
  630: ["ghost.*world", "GhostWorld", "ghost-world"],
  631: ["ghost.*mode", "GhostMode", "ghost-mode"],
  632: ["ghost.*credit", "GhostCredit", "ghost-credit"],
  // The 300
  640: ["the.*300", "The300", "the-300", "phalanx"],
  // Medallion Cascade
  650: ["medallion", "Medallion", "medallion.*cascade"],
  // Family Table
  660: ["family.*table", "FamilyTable", "family-table"],
  // Wildfire
  670: ["wildfire", "Wildfire", "beacon.*run"],
  671: ["wildfire.*run", "WildfireRun", "wildfire-run"],
  // Bounty Board
  690: ["bounty.*board", "BountyBoard", "bounty-board"],
  // MARKS / Currency
  700: ["marks.*currency", "MARKS", "marks.*burn"],
  701: ["joules", "Joules", "forever.*stamp"],
  703: ["cost.*plus.*20", "cost\\+20", "C\\+20", "83\\.3"],
  // Golden Keys
  710: ["golden.*key", "GoldenKey", "golden-key"],
  // Babylon Candle
  720: ["babylon.*candle", "BabylonCandle", "babylon-candle"],
  // Senate
  730: ["senate", "Senate", "cooperative.*governance"],
  // Defense Klaus
  740: ["defense.*klaus", "DefenseKlaus", "defense-klaus"],
  // Cold Start
  750: ["cold.*start", "ColdStart", "cold-start"],
  // Boaz Principle
  760: ["boaz.*principle", "BoazPrinciple", "boaz-principle"],
  // Wall-E
  1051: ["wall.*e.*wall", "WallE", "letter.*gallery", "rotating.*shelf"],
  // Fly on the Wall
  1053: ["fly.*on.*the.*wall", "FlyOnTheWall", "public.*viewport"],
  // Golden Keys system
  1038: ["golden.*key", "GoldenKey", "treasure.*hunt"],
  // Hexel CAD tools
  1537: ["hexel.*piece.*grammar", "hexelPieceGrammar", "piece.*grammar"],
  1538: ["fusion.*360.*extractor", "cad.*to.*json", "CAD_TO_GRAMMAR_MAP"],
  1539: ["grammar.*validator", "grammarValidator", "cad.*vs.*piece"],
  1540: ["colab.*outreach", "zoo\\.dev", "ai.*cad.*partnership"],
  // Harper Court
  1050: ["harper.*reviewer", "auditor.*selection", "harper.*selection"],
  // Brainstorm Chamber / Senate / specific mechanics
  900: ["wildfire.*beacon", "WildfireBeacon", "beacon-run"],
  // Cue Cards
  950: ["cue.*card", "CueCard", "cue-card"],
  // Red Queen
  970: ["red.*queen", "RedQueen", "red-queen"],
  // Company Island
  980: ["company.*island", "CompanyIsland", "company-island"],
  // Chronicler
  990: ["chronicler", "Chronicler"],
};

// ── Auto term extraction ───────────────────────────────────────────────────

function extractSearchTerms(title, coreClaim) {
  const terms = new Set();

  // 1. Full title as exact phrase (if 2-5 words)
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
  if (camel.length > 5) terms.add(camel);

  // 3. kebab-case version
  const kebab = titleWords
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()) && w.length > 2)
    .map((w) => w.toLowerCase())
    .join("-");
  if (kebab.length > 5) terms.add(kebab);

  // 4. Individual distinctive words from title (≥6 chars, not stop)
  for (const w of titleWords) {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (lower.length >= 6 && !STOP_WORDS.has(lower)) {
      terms.add(lower);
    }
  }

  // 5. Key phrases from core_claim (2-word chunks)
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

    for (const term of terms) {
      try {
        const pattern = new RegExp(term, "i");
        if (pattern.test(content)) {
          if (!fileHits.has(relPath)) fileHits.set(relPath, new Set());
          fileHits.get(relPath).add(term);
        }
      } catch {
        // Fallback: plain string search
        if (content.toLowerCase().includes(term.toLowerCase())) {
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
  console.log("=== Innovation Coverage Mapper — Batch 10 (Bishop) ===\n");

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
  let progressDot = 0;

  process.stdout.write("Searching: ");
  for (const innov of innovations) {
    const num = innov.innovation_number;
    const overrideTerms = TERM_OVERRIDES[num] || [];
    const autoTerms = extractSearchTerms(innov.title, innov.core_claim);
    const allTerms = [...new Set([...overrideTerms, ...autoTerms])];

    const rawHits = searchForTerms(allTerms, fileContents, PLATFORM_ROOT);

    // Noise filter: if a term matches >80 files, remove it (too generic)
    const termCounts = {};
    for (const [, termsSet] of rawHits) {
      for (const t of termsSet) {
        termCounts[t] = (termCounts[t] || 0) + 1;
      }
    }
    const noisyTerms = new Set(
      Object.entries(termCounts).filter(([, c]) => c > 80).map(([t]) => t)
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
        .sort((a, b) => b.terms.length - a.terms.length)
        .slice(0, 10),
    });

    // Progress indicator (dot every 50 innovations)
    progressDot++;
    if (progressDot % 50 === 0) process.stdout.write(".");
  }
  console.log(" Done.\n");

  // 5. Split into implemented vs orphaned
  const implemented = results.filter((r) => r.fileCount > 0).sort((a, b) => b.fileCount - a.fileCount);
  const orphaned = results.filter((r) => r.fileCount === 0);

  // 6. Generate report
  const now = new Date().toISOString().split("T")[0];
  let md = "";

  md += "# Innovation Coverage Report — Batch 10\n\n";
  md += `**Generated:** ${now}  \n`;
  md += `**Source:** \`docs/audit/innovations_601_1560.json\` (${innovations.length} innovations)  \n`;
  md += `**Scanned:** \`platform/src/\` (${sourceFiles.length} files)  \n`;
  md += `**Agent:** Bishop (Batch 10 Cross-Reference Sweep)  \n\n`;

  md += "---\n\n";

  md += "## Summary\n\n";
  md += `| Category | Count |\n`;
  md += `| --- | --- |\n`;
  md += `| Total Innovations | ${innovations.length} |\n`;
  md += `| **Implemented** (code evidence found) | ${implemented.length} |\n`;
  md += `| **Orphaned** (no code evidence) | ${orphaned.length} |\n`;
  md += `| **Coverage Rate** | ${((implemented.length / innovations.length) * 100).toFixed(1)}% |\n\n`;

  // Category breakdown — consolidate compound categories for readability
  const catStats = {};
  for (const r of results) {
    // Use the primary category (before any /) for grouping
    const primaryCat = r.category.split("/")[0].trim();
    if (!catStats[primaryCat]) catStats[primaryCat] = { total: 0, impl: 0 };
    catStats[primaryCat].total++;
    if (r.fileCount > 0) catStats[primaryCat].impl++;
  }
  md += "### Coverage by Primary Category\n\n";
  md += "| Category | Total | Implemented | Coverage |\n";
  md += "| --- | --- | --- | --- |\n";
  const sortedCats = Object.entries(catStats).sort((a, b) => b[1].total - a[1].total);
  for (const [cat, s] of sortedCats) {
    md += `| ${cat} | ${s.total} | ${s.impl} | ${((s.impl / s.total) * 100).toFixed(0)}% |\n`;
  }
  md += "\n";

  // Patent Bag breakdown
  const bagStats = {};
  for (const r of results) {
    const bag = r.patentBag || "Unassigned";
    if (!bagStats[bag]) bagStats[bag] = { total: 0, impl: 0 };
    bagStats[bag].total++;
    if (r.fileCount > 0) bagStats[bag].impl++;
  }
  md += "### Coverage by Patent Bag\n\n";
  md += "| Patent Bag | Total | Implemented | Coverage |\n";
  md += "| --- | --- | --- | --- |\n";
  const sortedBags = Object.entries(bagStats).sort((a, b) => b[1].total - a[1].total);
  for (const [bag, s] of sortedBags) {
    md += `| ${bag} | ${s.total} | ${s.impl} | ${((s.impl / s.total) * 100).toFixed(0)}% |\n`;
  }
  md += "\n";

  md += "---\n\n";

  // ── Strongest Implementations ──
  md += "## Strongest Implementations\n\n";
  md += "Top 30 innovations with the most file references in `platform/src/`.\n\n";

  md += "| # | Innovation | Category | Bag | Files |\n";
  md += "| --- | --- | --- | --- | --- |\n";
  for (const item of implemented.slice(0, 30)) {
    md += `| ${item.number} | ${item.title} | ${item.category} | ${item.patentBag} | ${item.fileCount} |\n`;
  }
  md += "\n";

  // Detail for top 10
  md += "### Top 10 — File Details\n\n";
  for (const item of implemented.slice(0, 10)) {
    md += `#### #${item.number}: ${item.title} (${item.fileCount} files)\n\n`;
    md += "| File | Matched Terms |\n";
    md += "| --- | --- |\n";
    for (const f of item.files.slice(0, 8)) {
      const terms = f.terms.slice(0, 3).map((t) => `\`${t}\``).join(", ");
      md += `| \`${f.file}\` | ${terms} |\n`;
    }
    if (item.fileCount > 8) {
      md += `| *(+${item.fileCount - 8} more files)* | |\n`;
    }
    md += "\n";
  }

  md += "---\n\n";

  // ── All Implemented (compact table) ──
  md += "## All Implemented Innovations\n\n";
  md += `<details>\n<summary>${implemented.length} innovations with code evidence (sorted by file count) — click to expand</summary>\n\n`;
  md += "| # | Innovation | Category | Bag | Files |\n";
  md += "| --- | --- | --- | --- | --- |\n";
  for (const item of implemented) {
    md += `| ${item.number} | ${item.title} | ${item.category} | ${item.patentBag} | ${item.fileCount} |\n`;
  }
  md += "\n</details>\n\n";

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
  md += "1. Loaded all " + innovations.length + " innovations from `innovations_601_1560.json`.\n";
  md += "2. For each innovation, auto-extracted search terms from title and core_claim, supplemented by hand-curated overrides for ~40 distinctive innovations.\n";
  md += "3. Searched `platform/src/` (" + sourceFiles.length + " files: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`) using case-insensitive regex.\n";
  md += "4. Noise filter: terms matching >80 files per innovation excluded as too generic.\n";
  md += "5. Results deduplicated by file path, ranked by file count.\n";
  md += "6. Script self-references excluded.\n\n";

  md += "## Recommendations\n\n";
  md += "1. **Orphaned innovations** in Batch 10 span governance, economics, and security mechanisms — many are spec-level designs awaiting implementation.\n";
  md += "2. **High-coverage innovations** (>20 files) should be audited to verify claim-to-code fidelity.\n";
  md += "3. Consider adding `// Innovation #N` comments near key implementations for traceability.\n";
  md += "4. Use this report alongside Batch 8 and Batch 9 reports for the consolidated Master Innovation Coverage.\n";

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
  console.log(`\nOrphaned by category:`);
  const orphCats = {};
  for (const o of orphaned) {
    const pc = o.category.split("/")[0].trim();
    orphCats[pc] = (orphCats[pc] || 0) + 1;
  }
  Object.entries(orphCats).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([c, n]) => {
    console.log(`  ${c}: ${n}`);
  });
  console.log(`\nReport written to: ${OUTPUT_PATH}`);
}

main();
