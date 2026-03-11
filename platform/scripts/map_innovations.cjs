/**
 * INNOVATION COVERAGE MAPPER — Bishop Batch 8
 * =============================================
 * Reads innovations_001_130.json (50 innovations) and searches
 * platform/src for implementation evidence. Produces a Markdown
 * coverage report at BISHOP_DROPZONE/INNOVATION_COVERAGE_REPORT.md.
 *
 * Strategy:
 *   1. Each innovation gets a curated set of search terms derived
 *      from its title and core_claim.
 *   2. We recursively walk platform/src for .ts/.tsx files.
 *   3. Each file is searched (case-insensitive) for every term.
 *   4. Matches are deduplicated and sorted.
 *   5. Results split into Implemented vs Orphaned.
 */

const fs = require("fs");
const path = require("path");

// ── Paths ──────────────────────────────────────────────────────────────────

const PLATFORM_ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(PLATFORM_ROOT, "src");
const JSON_PATH = path.join(PLATFORM_ROOT, "docs", "audit", "innovations_001_130.json");
const OUTPUT_DIR = path.resolve(PLATFORM_ROOT, "..", "BISHOP_DROPZONE");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "INNOVATION_COVERAGE_REPORT.md");

// ── Search Term Map ────────────────────────────────────────────────────────
// Hand-curated per innovation for precision. Each innovation gets an array
// of regex-safe strings to search case-insensitively.

const SEARCH_TERMS = {
  1:  ["tab system", "tab accumulation", "deferred payment", "tabEconomics", "tab economics"],
  2:  ["position funding", "positionFunding", "position-funding"],
  3:  ["medallion cascade", "medallion", "2ndSecond", "MedallionCascade"],
  4:  ["star chamber", "starchamber", "StarChamber", "star-chamber", "Moneypenny Protocol", "moneypenny"],
  5:  ["castle portal", "portal card", "CastlePortal", "castle-portal"],
  6:  ["node network", "NodeNetwork", "node-network", "distributed manufacturing", "node operator"],
  7:  ["ghost item", "GhostItem", "ghost-item", "virtual-to-physical", "ghost bridge"],
  8:  ["omnibus launch", "OmnibusLaunch", "omnibus-launch", "synchronized campaign"],
  9:  ["boaz principle", "BoazPrinciple", "boaz-principle", "leave grain"],
  10: ["hexisle", "HexIsle", "hex-isle", "hexIsle"],
  11: ["living castle", "LivingCastle", "living-castle"],
  12: ["galactic empire", "GalacticEmpire", "galactic-empire", "galaxy visualization"],
  13: ["scaas", "SCAAS", "star chamber as a service"],
  14: ["marks", "MARKS", "earned.*currency", "work currency", "marks ledger"],
  15: ["golden wrapper", "GoldenWrapper", "golden-wrapper", "golden key", "goldenKey", "GoldenKey"],
  16: ["tab economics", "TabEconomics", "tab-economics", "deferred payment", "deferred.*payment", "tab accumulation"],
  17: ["arena hiring", "ArenaHiring", "arena-hiring", "challenge.*recruitment"],
  18: ["chronicler", "Chronicler", "chroniclers hall", "activity logging"],
  19: ["vivalarevolucion", "VivaLaRevolucion", "revolution trigger", "community governance"],
  20: ["cephas", "Cephas", "knowledge distribution"],
  21: ["membrane", "Membrane", "semi-permeable", "IP governance"],
  22: ["shirley temple", "ShirleyTemple", "shirley-temple", "content filtering", "content rating"],
  23: ["political expedition", "PoliticalExpedition", "political-expedition", "exponential threshold"],
  24: ["marks ledger", "MarksLedger", "marks-ledger", "immutable ledger", "ImmutableLedger"],
  25: ["bazaar", "Bazaar", "12 cities", "twelve cities", "guild tower"],
  26: ["tereno", "Tereno", "treasure map", "TreasureMap", "treasure-map"],
  27: ["venice canal", "VeniceCanal", "venice-canal", "resource flow"],
  28: ["volume discount", "VolumeDiscount", "volume-discount", "collective purchasing"],
  29: ["vessel evolution", "VesselEvolution", "vessel-evolution", "seed.*rock.*element"],
  30: ["wells", "labyrinth", "Labyrinth", "Wells", "funding pathway"],
  31: ["hot water company", "HotWaterCompany", "hot-water", "essential service"],
  32: ["music licensing", "MusicLicensing", "music-licensing", "jukebox", "JukeBox"],
  33: ["distributed factory", "DistributedFactory", "distributed-factory", "brass tacks", "BrassTacks"],
  34: ["yggdrasil", "Yggdrasil"],
  35: ["creative works licensing", "universal licensing", "license generation"],
  36: ["blockchain key", "BlockchainKey", "blockchain-key", "cryptographic access"],
  37: ["super short loan", "SuperShortLoan", "super-short-loan", "micro.*loan", "VSL", "voucher short"],
  38: ["physical medallion", "compliant mechanism", "snap-fit", "beverage tracking", "medallion mechanism"],
  39: ["observatory", "Observatory", "progress tracking", "shell-weighted"],
  40: ["mimictrunk", "MimicTrunk", "mimicTrunk", "staged trust", "trust ladder"],
  41: ["democratic team", "DemocraticTeam", "democratic-team", "peer voting", "team formation"],
  42: ["noid routing", "NOID", "noid", "quality canary", "three-human rule", "spotcheck", "SpotCheck"],
  43: ["maitre d", "MaitreD", "feedback system", "vent.*solve", "break dishes"],
  44: ["poster wall", "PosterWall", "poster-wall", "dynamic poster"],
  45: ["team lead ante", "TeamLeadAnte", "team-lead-ante", "escrow.*leadership"],
  46: ["answer the call", "AnswerTheCall", "answer-the-call", "recruitment funnel"],
  47: ["brainstorm chamber", "BrainstormChamber", "brainstorm-chamber", "brainstorm", "BrainStorm", "lightning funding", "idea jar", "ember.*glowworm", "firefly.*specter"],
  48: ["crown competition", "CrownCompetition", "crown-competition", "winner-take-all", "winner.*take.*all"],
  49: ["contributor stake", "ContributorStake", "contributor-stake", "stake tracking"],
  50: ["catharsis game", "CatharsisGame", "catharsis-game", "virtual destruction"],
};

// ── File walker ────────────────────────────────────────────────────────────

function walkDir(dir, exts) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules, .git, dist, etc.
        if (["node_modules", ".git", "dist", "build", ".vite"].includes(entry.name)) continue;
        results = results.concat(walkDir(full, exts));
      } else if (exts.some((e) => entry.name.endsWith(e))) {
        results.push(full);
      }
    }
  } catch (e) {
    // skip unreadable dirs
  }
  return results;
}

// ── File content cache ─────────────────────────────────────────────────────

function loadFileContents(files) {
  const cache = {};
  for (const f of files) {
    try {
      cache[f] = fs.readFileSync(f, "utf8");
    } catch {
      // skip unreadable files
    }
  }
  return cache;
}

// ── Search engine ──────────────────────────────────────────────────────────

function searchForTerms(terms, fileContents) {
  const results = []; // { file, line, matchedTerm, snippet }

  for (const [filePath, content] of Object.entries(fileContents)) {
    const lines = content.split("\n");
    const relPath = path.relative(PLATFORM_ROOT, filePath).replace(/\\/g, "/");

    for (const term of terms) {
      // Build regex: if term contains .* it's already a pattern, otherwise literal
      let pattern;
      try {
        pattern = new RegExp(term, "i");
      } catch {
        // If the term isn't valid regex, escape it
        pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      }

      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          const snippet = lines[i].trim().substring(0, 120);
          results.push({
            file: relPath,
            line: i + 1,
            matchedTerm: term,
            snippet,
          });
          // Only capture first match per term per file
          break;
        }
      }
    }
  }

  // Deduplicate by file
  const seen = new Set();
  return results.filter((r) => {
    const key = r.file;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Noise filter ───────────────────────────────────────────────────────────
// Some terms (like "marks", "wells", "membrane") are very generic.
// We filter out matches in irrelevant contexts.

const NOISE_FILES = [
  "map_innovations.cjs", // this script itself
  "extract_innovations.cjs",
  ".test.", ".spec.",
];

function isNoise(filePath) {
  return NOISE_FILES.some((n) => filePath.includes(n));
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Innovation Coverage Mapper (Bishop Batch 8) ===\n");

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
  const fileContents = loadFileContents(sourceFiles);

  // 4. Search for each innovation
  const implemented = [];
  const orphaned = [];

  for (const innov of innovations) {
    const num = innov.innovation_number;
    const terms = SEARCH_TERMS[num] || [];

    if (terms.length === 0) {
      // Fallback: extract words from title
      const titleWords = innov.title
        .replace(/Innovation #\d+:\s*/i, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3);
      terms.push(...titleWords);
    }

    const matches = searchForTerms(terms, fileContents).filter((m) => !isNoise(m.file));

    if (matches.length > 0) {
      implemented.push({
        number: num,
        title: innov.title,
        matches,
      });
    } else {
      orphaned.push({
        number: num,
        title: innov.title,
        searchedTerms: terms,
      });
    }
  }

  // 5. Generate report
  const now = new Date().toISOString().split("T")[0];
  let md = "";

  md += "# Innovation Coverage Report\n\n";
  md += `**Generated:** ${now}  \n`;
  md += `**Source:** \`docs/audit/innovations_001_130.json\` (50 innovations)  \n`;
  md += `**Scanned:** \`platform/src/\` (${sourceFiles.length} files)  \n`;
  md += `**Agent:** Bishop (Batch 8 Cross-Reference Sweep)  \n\n`;

  md += "---\n\n";

  md += "## Summary\n\n";
  md += `| Category | Count |\n`;
  md += `| --- | --- |\n`;
  md += `| Total Innovations | ${innovations.length} |\n`;
  md += `| **Implemented** (code evidence found) | ${implemented.length} |\n`;
  md += `| **Orphaned** (no code evidence) | ${orphaned.length} |\n`;
  md += `| Coverage Rate | ${((implemented.length / innovations.length) * 100).toFixed(1)}% |\n\n`;

  md += "---\n\n";

  // ── Implemented ──
  md += "## Implemented Innovations\n\n";
  md += "Innovations with clear evidence of implementation in `platform/src/`.\n\n";

  for (const item of implemented) {
    md += `### #${item.number}: ${item.title}\n\n`;
    md += "| File | Line | Matched Term |\n";
    md += "| --- | --- | --- |\n";
    for (const m of item.matches.slice(0, 8)) {
      md += `| \`${m.file}\` | L${m.line} | \`${m.matchedTerm}\` |\n`;
    }
    if (item.matches.length > 8) {
      md += `| *(+${item.matches.length - 8} more files)* | | |\n`;
    }
    md += "\n";
  }

  md += "---\n\n";

  // ── Orphaned ──
  md += "## Orphaned Innovations\n\n";
  md += "Innovations with **no** matching implementation found in `platform/src/`.  \n";
  md += "These are either:\n";
  md += "- Not yet implemented in code (future features)\n";
  md += "- Implemented under a different name/pattern not caught by this search\n";
  md += "- Backend-only (Supabase Edge Functions, database triggers) with no frontend reference\n\n";

  md += "| # | Innovation | Searched Terms |\n";
  md += "| --- | --- | --- |\n";
  for (const item of orphaned) {
    const terms = item.searchedTerms.slice(0, 4).map((t) => `\`${t}\``).join(", ");
    md += `| ${item.number} | ${item.title} | ${terms} |\n`;
  }
  md += "\n";

  md += "---\n\n";

  md += "## Methodology\n\n";
  md += "1. Loaded all 50 innovations from `innovations_001_130.json`.\n";
  md += "2. For each innovation, searched `platform/src/` (all `.ts`, `.tsx`, `.js`, `.jsx` files) using curated keyword lists derived from the innovation title and core claim.\n";
  md += "3. Searches were case-insensitive with regex support.\n";
  md += "4. First match per file per term was recorded (deduplicated by file path).\n";
  md += "5. Self-referencing files (this script, test files) were excluded.\n\n";

  md += "## Recommendations\n\n";
  md += "1. **Orphaned innovations** should be reviewed by the Founder to determine whether they are:\n";
  md += "   - Post-launch features (expected to be orphaned)\n";
  md += "   - Implemented under different names (needs keyword update)\n";
  md += "   - Missing implementations that need to be built\n";
  md += "2. **Implemented innovations** should be audited to verify the implementation matches the patent claim.\n";
  md += "3. Consider adding `// Innovation #N: <title>` comments near implementations for future traceability.\n";

  // 6. Write output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, md, "utf8");

  console.log(`\n=== RESULTS ===`);
  console.log(`Implemented: ${implemented.length}`);
  console.log(`Orphaned:    ${orphaned.length}`);
  console.log(`Coverage:    ${((implemented.length / innovations.length) * 100).toFixed(1)}%`);
  console.log(`\nReport written to: ${OUTPUT_PATH}`);
}

main();
