/**
 * Canonical Value Linter Predicate
 * ================================
 * Verifies a document's canonical values against canonical_values.yaml.
 * K406 / Innovation #2241. Fixes Pitfall 2 (staleness drift).
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CANONICAL_YAML_PATH = resolve(__dirname, "..", "..", "canonical_values.yaml");
const WORKSPACE_ROOT = resolve(__dirname, "..", "..", "..");

export interface StaleFindings {
  key: string;
  expected: string;
  found: string;
  line_number: number;
  context: string;
}

export interface UnverifiedClaim {
  key: string;
  context: string;
}

export interface PredicateResult {
  passed: boolean;
  document_path: string;
  stale_findings: StaleFindings[];
  unverified_claims: UnverifiedClaim[];
  values_checked: number;
  values_confirmed: number;
}

export interface CanonicalValues {
  [section: string]: Record<string, string | number | boolean>;
}

// Known stale variants for critical values.
// Key is the canonical key path (section.field), value is array of known stale numbers.
const KNOWN_STALE_VARIANTS: Record<string, (string | number)[]> = {
  "stats.innovation_count": [2078, 2222, 2225, 2233, 2238, 2239],
  "stats.crown_jewels": [123, 146, 175, 195, 202, 206],
  "stats.formal_claims_approximate": [1401, 1511, 2187, 2393],
  "stats.patent_provisionals_filed": [8, 10, 11],
  "stats.papers": [35, 37, 38],
  "stats.puddings": [170, 175, 178, 180],
  "stats.letters_in_dispatch_queue": [85, 88, 90, 108],
  "stats.production_systems": [30, 32, 33, 34],
  "economics.creator_keeps_percentage": [83, 84],
  "entity.ein": ["41-2797446"],
};

function flattenYaml(obj: Record<string, unknown>, prefix = ""): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenYaml(value as Record<string, unknown>, fullKey));
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[fullKey] = typeof value === "boolean" ? String(value) : value;
    }
  }
  return result;
}

function formatNumberVariants(value: string | number): string[] {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return [String(value)];

  const variants: string[] = [String(value)];

  if (Number.isInteger(num) && num >= 1000) {
    // e.g. 2240 -> "2,240" and "2240"
    variants.push(num.toLocaleString("en-US"));
  }

  if (!Number.isInteger(num)) {
    // e.g. 83.3 -> "83.3%" and "83.3"
    variants.push(`${num}%`);
  }

  return [...new Set(variants)];
}

export function loadCanonicalValues(): CanonicalValues {
  if (!existsSync(CANONICAL_YAML_PATH)) {
    throw new Error(`canonical_values.yaml not found at ${CANONICAL_YAML_PATH}`);
  }
  const raw = readFileSync(CANONICAL_YAML_PATH, "utf-8");
  return yaml.load(raw) as CanonicalValues;
}

export function loadCanonicalFlat(): Record<string, string | number> {
  return flattenYaml(loadCanonicalValues() as unknown as Record<string, unknown>);
}

export async function canonicalValueMatches(
  documentPath: string,
  expectedValues?: Partial<Record<string, string | number>>,
): Promise<PredicateResult> {
  const canonical = loadCanonicalFlat();
  const valuesToCheck = expectedValues ?? canonical;

  const fullPath = resolve(WORKSPACE_ROOT, documentPath);
  if (!existsSync(fullPath)) {
    return {
      passed: false,
      document_path: documentPath,
      stale_findings: [{
        key: "_file",
        expected: "file exists",
        found: "file not found",
        line_number: 0,
        context: fullPath,
      }],
      unverified_claims: [],
      values_checked: 0,
      values_confirmed: 0,
    };
  }

  const content = readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");

  const staleFindings: StaleFindings[] = [];
  const unverifiedClaims: UnverifiedClaim[] = [];
  let valuesChecked = 0;
  let valuesConfirmed = 0;

  for (const [key, expectedValue] of Object.entries(valuesToCheck)) {
    valuesChecked++;
    const canonicalValue = canonical[key];
    if (canonicalValue === undefined) continue;

    const expectedStr = String(expectedValue ?? canonicalValue);
    const canonicalStr = String(canonicalValue);

    // Check for stale variants of this key
    const staleVariants = KNOWN_STALE_VARIANTS[key] ?? [];
    let foundStale = false;

    for (const staleVal of staleVariants) {
      const staleSearchTerms = formatNumberVariants(staleVal);
      for (const term of staleSearchTerms) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes(term)) {
            // Make sure we're not matching the canonical value itself
            const canonicalTerms = formatNumberVariants(canonicalValue);
            const isCanonical = canonicalTerms.some(ct => line.includes(ct));
            if (!isCanonical || String(staleVal) !== canonicalStr) {
              // Additional check: the stale value must not be a substring of the canonical
              const staleStr = String(staleVal);
              if (staleStr !== canonicalStr) {
                staleFindings.push({
                  key,
                  expected: canonicalStr,
                  found: String(staleVal),
                  line_number: i + 1,
                  context: line.trim().slice(0, 120),
                });
                foundStale = true;
              }
            }
          }
        }
      }
    }

    // Check if canonical value appears at all
    const canonicalTerms = formatNumberVariants(canonicalValue);
    const found = canonicalTerms.some(term =>
      lines.some(line => line.includes(term))
    );
    if (found && !foundStale) {
      valuesConfirmed++;
    }
  }

  // Scan for numbers that look like canonical values but aren't recognized
  const allCanonicalNumbers = Object.values(canonical)
    .filter(v => typeof v === "number" && v >= 100)
    .map(Number);

  const numberPattern = /\b(\d{1,3}(?:,\d{3})*)\b/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    while ((match = numberPattern.exec(line)) !== null) {
      const numStr = match[1].replace(/,/g, "");
      const num = parseInt(numStr);
      if (num >= 1000 && num <= 50000) {
        const isKnownCanonical = allCanonicalNumbers.includes(num);
        const isKnownStale = Object.values(KNOWN_STALE_VARIANTS)
          .flat()
          .includes(num);
        if (!isKnownCanonical && !isKnownStale) {
          const contextSlice = line.trim().slice(0, 120);
          if (/innovat|crown|patent|claim|jewel|pudding|paper|letter|member/i.test(contextSlice)) {
            unverifiedClaims.push({
              key: `unverified_number_${num}`,
              context: `Line ${i + 1}: ${contextSlice}`,
            });
          }
        }
      }
    }
  }

  return {
    passed: staleFindings.length === 0,
    document_path: documentPath,
    stale_findings: staleFindings,
    unverified_claims: unverifiedClaims.slice(0, 20),
    values_checked: valuesChecked,
    values_confirmed: valuesConfirmed,
  };
}
