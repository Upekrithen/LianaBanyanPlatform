#!/usr/bin/env node
/**
 * mirror-howitallworks-to-hugo.js
 * BP094 Session 4 - Mamba 6.4
 * Extracts card data from explainerCorpus.ts and writes howitallworks.json for Hugo.
 * Merges with howitallworks_card_to_paper_proof_map.json.
 * Run: node tools/mirror-howitallworks-to-hugo.js
 */

const fs = require("fs");
const path = require("path");

const CORPUS_PATH = path.resolve(
  __dirname,
  "../platform/src/data/explainerCorpus.ts"
);
const CARD_MAP_PATH = path.resolve(
  __dirname,
  "../Cephas/cephas-hugo/data/howitallworks_card_to_paper_proof_map.json"
);
const OUTPUT_JSON = path.resolve(
  __dirname,
  "../Cephas/cephas-hugo/data/howitallworks.json"
);

const src = fs.readFileSync(CORPUS_PATH, "utf8");

// ---------------------------------------------------------------------------
// Build card-to-proof map from JSON file
// ---------------------------------------------------------------------------
let cardMap = {};
try {
  const mapData = JSON.parse(fs.readFileSync(CARD_MAP_PATH, "utf8"));
  mapData.forEach((entry) => {
    cardMap[entry.card_id] = entry;
  });
} catch (e) {
  console.error("WARN: Could not read card map:", e.message);
}

// ---------------------------------------------------------------------------
// Extract EXPLAINER_CORPUS entries
// ---------------------------------------------------------------------------
function extractCorpus(src) {
  const startIdx = src.indexOf("export const EXPLAINER_CORPUS");
  if (startIdx === -1) {
    console.error("WARN: EXPLAINER_CORPUS not found in source");
    return [];
  }
  const eqIdx = src.indexOf("= [", startIdx);
  if (eqIdx === -1) return [];
  const bracketOpen = src.indexOf("[", eqIdx);
  if (bracketOpen === -1) return [];

  // Walk to find matching ']'
  let depth = 0;
  let i = bracketOpen;
  while (i < src.length) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  const arrayText = src.slice(bracketOpen, i + 1);

  // Extract top-level objects { ... }
  const records = [];
  let d = 0;
  let recordStart = -1;
  for (let j = 0; j < arrayText.length; j++) {
    if (arrayText[j] === "{") {
      d++;
      if (d === 1) recordStart = j;
    } else if (arrayText[j] === "}") {
      d--;
      if (d === 0 && recordStart !== -1) {
        const block = arrayText.slice(recordStart, j + 1);
        const rec = parseCard(block);
        if (rec && rec.id && rec.subsystem) records.push(rec);
        recordStart = -1;
      }
    }
  }
  return records;
}

function parseBlock(block) {
  const rec = {};
  // String fields: fieldName: "value" or fieldName: 'value'
  const strField = /(\w+)\s*:\s*"([^"]*?)"/g;
  let m;
  while ((m = strField.exec(block)) !== null) {
    if (!rec[m[1]]) rec[m[1]] = m[2];
  }
  // Boolean fields
  const boolField = /(\w+)\s*:\s*(true|false)/g;
  while ((m = boolField.exec(block)) !== null) {
    if (!rec[m[1]]) rec[m[1]] = m[2] === "true";
  }
  // Numeric fields
  const numField = /(\w+)\s*:\s*(\d+),/g;
  while ((m = numField.exec(block)) !== null) {
    if (!rec[m[1]]) rec[m[1]] = parseInt(m[2], 10);
  }
  return rec;
}

function extractDepths(block) {
  // Find the depths array in the card block
  const dIdx = block.indexOf("depths:");
  if (dIdx === -1) return [];
  const bracketIdx = block.indexOf("[", dIdx);
  if (bracketIdx === -1) return [];

  let depth = 0;
  let i = bracketIdx;
  while (i < block.length) {
    if (block[i] === "[") depth++;
    else if (block[i] === "]") {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  const depthsText = block.slice(bracketIdx, i + 1);

  // Extract individual depth objects
  const layers = [];
  let d = 0;
  let start = -1;
  for (let j = 0; j < depthsText.length; j++) {
    if (depthsText[j] === "{") {
      d++;
      if (d === 1) start = j;
    } else if (depthsText[j] === "}") {
      d--;
      if (d === 0 && start !== -1) {
        const depthBlock = depthsText.slice(start, j + 1);
        const parsed = parseBlock(depthBlock);
        // Extract body and headline from the depth block using multiline-aware approach
        const headlineMatch = depthBlock.match(/headline\s*:\s*"([^"]*)"/);
        const bodyMatch = depthBlock.match(/body\s*:\s*"([\s\S]*?)(?:",|",\n)/);
        const layerMatch = depthBlock.match(/layer\s*:\s*"([^"]*)"/);
        const textMatch = depthBlock.match(/text\s*:\s*"([^"]*)"/);
        layers.push({
          layer: layerMatch ? layerMatch[1] : parsed.layer || "",
          headline: headlineMatch ? headlineMatch[1] : parsed.headline || "",
          body: bodyMatch ? bodyMatch[1].replace(/\\n/g, " ").trim() : parsed.body || "",
          narrator_text: textMatch ? textMatch[1] : "",
          narrator_mascot: parsed.mascotId || "",
        });
        start = -1;
      }
    }
  }
  return layers;
}

function extractTags(block) {
  const tagsIdx = block.indexOf("tags:");
  if (tagsIdx === -1) return [];
  const bracketIdx = block.indexOf("[", tagsIdx);
  if (bracketIdx === -1) return [];
  const closeBracket = block.indexOf("]", bracketIdx);
  if (closeBracket === -1) return [];
  const tagsText = block.slice(bracketIdx + 1, closeBracket);
  const tags = [];
  const tagMatch = /"([^"]*)"/g;
  let m;
  while ((m = tagMatch.exec(tagsText)) !== null) {
    tags.push(m[1]);
  }
  return tags;
}

function parseCard(block) {
  const parsed = parseBlock(block);
  const depths = extractDepths(block);
  const tags = extractTags(block);
  return {
    id: parsed.id || "",
    subsystemNumber: parsed.subsystemNumber || 0,
    subsystem: parsed.subsystem || "",
    host: parsed.host || "",
    province: parsed.province || "",
    specialist: parsed.specialist || "",
    depths,
    tags,
  };
}

// ---------------------------------------------------------------------------
// Run extraction + merge
// ---------------------------------------------------------------------------
const cards = extractCorpus(src);

// Merge with card map
const mergedCards = cards.map((card) => {
  const mapEntry = cardMap[card.id] || {
    cephas_paper_title: "paper pending",
    cephas_paper_url: null,
    proof_id: null,
    proof_verify_url: null,
    proof_status: "proof pending",
  };
  return {
    ...card,
    cephas_paper_title: mapEntry.cephas_paper_title,
    cephas_paper_url: mapEntry.cephas_paper_url,
    proof_id: mapEntry.proof_id,
    proof_verify_url: mapEntry.proof_verify_url,
    proof_status: mapEntry.proof_status,
  };
});

const cardsWithPaper = mergedCards.filter((c) => c.cephas_paper_url !== null).length;
const cardsWithProof = mergedCards.filter((c) => c.proof_verify_url !== null).length;
const cardsPending = mergedCards.filter((c) => c.proof_status === "proof pending").length;

const output = {
  _generated: new Date().toISOString(),
  _source: "platform/src/data/explainerCorpus.ts",
  _session: "BP094-S4-M6",
  cards: mergedCards,
};

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), "utf8");

console.log("=== mirror-howitallworks extraction summary ===");
console.log("  cards extracted:      " + cards.length);
console.log("  cards with paper:     " + cardsWithPaper + " / " + cards.length);
console.log("  cards with proof:     " + cardsWithProof + " / " + cards.length);
console.log("  cards proof pending:  " + cardsPending);
console.log("  Output written to:    " + OUTPUT_JSON);
console.log("================================================");
