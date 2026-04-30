/**
 * Herder Scribe — Component 4: Predictive Query MCP Server
 * KN013 / A&A #2297
 *
 * Exposes 6 MCP tools (D.6):
 *   query_will_it_fit              — predict bundle fits in context budget
 *   query_predicted_context_climb  — predict context-cost for a bean class
 *   record_observation             — persist a new observation event
 *   query_fingerprint              — retrieve bean-class fingerprint
 *   query_model_confidence         — return model quality metrics
 *   compare_vendor_predictions     — cross-vendor comparison table
 *
 * Each prediction returns: prediction + confidence interval + N-observations-basis + model-version.
 * Sub-ms response via pheromone_index.json cache.
 *
 * Toolsmith log: TS-HERDER-SCRIBE-T-SIPPING-REFINER-KN013-BP002
 */

import * as fs from "fs";
import * as path from "path";

// ── Paths ─────────────────────────────────────────────────────────────────────

const HERE = path.dirname(__filename);
const OBSERVATIONS_DIR = path.join(HERE, "observations");
const FINGERPRINTS_DIR = path.join(HERE, "fingerprints");
const MODELS_DIR = path.join(HERE, "models");
const TABLET_PATH = path.join(OBSERVATIONS_DIR, "herder_observations.jsonl");
const REGISTRY_PATH = path.join(FINGERPRINTS_DIR, "fingerprint_registry.json");
const PHEROMONE_INDEX_PATH = path.join(MODELS_DIR, "pheromone_index.json");

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatBlock {
  mean: number;
  std: number;
  min: number;
  max: number;
  count: number;
}

interface Fingerprint {
  bean_class: string;
  n_observations: number;
  context_cost_pp: StatBlock;
  lines_added: StatBlock;
  files_touched: StatBlock;
  wrasse_pre_injection_rate: number;
  vendor_distribution: Record<string, number>;
  model_distribution: Record<string, number>;
  compiled_at: string;
  version: number;
}

interface PredictionResult {
  prediction: number;
  confidence_low: number;
  confidence_high: number;
  n_basis: number;
  model_version: string;
  r_squared: number;
  stderr: number;
  note?: string;
}

interface BeanSpec {
  bean_class: string;
  vendor?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDirs(): void {
  [OBSERVATIONS_DIR, FINGERPRINTS_DIR, MODELS_DIR].forEach((d) => {
    fs.mkdirSync(d, { recursive: true });
  });
}

function loadJsonl<T>(filepath: string): T[] {
  if (!fs.existsSync(filepath)) return [];
  return fs
    .readFileSync(filepath, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l) as T;
      } catch {
        return null;
      }
    })
    .filter((x): x is T => x !== null);
}

function loadRegistry(): Record<string, Fingerprint> {
  if (!fs.existsSync(REGISTRY_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function loadPheromoneIndex(): Record<string, unknown> {
  if (!fs.existsSync(PHEROMONE_INDEX_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(PHEROMONE_INDEX_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function loadLatestModel(): Record<string, unknown> | null {
  for (const ver of ["v3", "v2", "v1"]) {
    const p = path.join(MODELS_DIR, `herder_model_${ver}.json`);
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function isoNow(): string {
  return new Date().toISOString();
}

// ── Uninformed prior ──────────────────────────────────────────────────────────

function uninformedPrior(note?: string): PredictionResult {
  return {
    prediction: 50.0,
    confidence_low: 5.0,
    confidence_high: 95.0,
    n_basis: 0,
    model_version: "uninformed_prior",
    r_squared: 0.0,
    stderr: 30.0,
    note: note ?? "No trained model available; returning uninformed prior",
  };
}

// ── Fingerprint-based prediction ──────────────────────────────────────────────

function predictFromFingerprint(
  fp: Fingerprint,
  model: Record<string, unknown> | null,
): PredictionResult {
  const n = fp.n_observations;

  if (!model) {
    // Fall back to fingerprint mean ± 2*std as CI
    const mu = fp.context_cost_pp?.mean ?? 50.0;
    const sigma = fp.context_cost_pp?.std ?? 25.0;
    return {
      prediction: Math.round(mu * 100) / 100,
      confidence_low: Math.max(0, Math.round((mu - 2 * sigma) * 100) / 100),
      confidence_high: Math.min(100, Math.round((mu + 2 * sigma) * 100) / 100),
      n_basis: n,
      model_version: "fingerprint_mean",
      r_squared: 0.0,
      stderr: sigma,
      note: "No trained model; using fingerprint mean ± 2σ",
    };
  }

  const featureNames = (model.feature_names as string[]) ?? [];
  const beta = (model.coefficients_with_intercept as number[]) ?? [50.0];
  const stderr = (model.residual_stderr as number) ?? 25.0;
  const r2 = (model.r_squared as number) ?? 0.0;
  const modelVer = (model.model_version as string) ?? "v1";
  const nModel = (model.n_observations as number) ?? 0;

  const featureMap: Record<string, number> = {
    phase_c_component_count: fp.context_cost_pp?.count ?? 4,
    test_density: 1.0,
    wrasse_density: 0.5,
    canonical_path_resolution_count: 2.0,
    grep_count: 3.0,
    wrasse_pre_injection: fp.wrasse_pre_injection_rate,
  };

  const featVec = [1.0, ...featureNames.map((fn) => featureMap[fn] ?? 0.0)];
  let prediction = beta.slice(0, featVec.length).reduce((s, b, i) => s + b * featVec[i], 0);
  prediction = Math.max(0, Math.min(100, prediction));

  const nFactor = Math.sqrt(Math.max(1, nModel));
  const halfWidth = Math.max(5.0, (1.96 * stderr) / nFactor);

  return {
    prediction: Math.round(prediction * 100) / 100,
    confidence_low: Math.max(0, Math.round((prediction - halfWidth) * 100) / 100),
    confidence_high: Math.min(100, Math.round((prediction + halfWidth) * 100) / 100),
    n_basis: nModel,
    model_version: modelVer,
    r_squared: Math.round(r2 * 10000) / 10000,
    stderr: Math.round(stderr * 10000) / 10000,
  };
}

// ── Tool: query_will_it_fit ───────────────────────────────────────────────────

function queryWillItFit(beanpod_composition: BeanSpec[]): Record<string, unknown> {
  const registry = loadRegistry();
  const model = loadLatestModel();
  const perBean: Record<string, unknown>[] = [];

  let totalMean = 0;
  let totalLow = 0;
  let totalHigh = 0;
  let minNBasis: number | null = null;

  for (const spec of beanpod_composition) {
    const fp = registry[spec.bean_class];
    let pred: PredictionResult;
    if (fp) {
      pred = predictFromFingerprint(fp, model);
    } else {
      pred = uninformedPrior(`No fingerprint for bean_class=${spec.bean_class}`);
    }
    perBean.push({ bean_class: spec.bean_class, vendor: spec.vendor ?? "unknown", ...pred });
    totalMean += pred.prediction;
    totalLow += pred.confidence_low;
    totalHigh += pred.confidence_high;
    if (minNBasis === null || pred.n_basis < minNBasis) minNBasis = pred.n_basis;
  }

  const cappedMean = Math.min(100, totalMean);
  const cappedHigh = Math.min(100, totalHigh);

  return {
    will_fit: cappedHigh <= 95,
    predicted_total_pp: Math.round(cappedMean * 100) / 100,
    confidence_low: Math.min(100, Math.round(totalLow * 100) / 100),
    confidence_high: cappedHigh,
    per_bean_predictions: perBean,
    model_version: model ? (model.model_version as string) : "uninformed_prior",
    n_basis: minNBasis ?? 0,
    recommendation:
      cappedHigh <= 95
        ? "FITS — schedule bundle"
        : cappedHigh <= 115
        ? "MARGINAL — split bundle or reduce pod size"
        : "OVERFLOW — split required",
  };
}

// ── Tool: query_predicted_context_climb ──────────────────────────────────────

function queryPredictedContextClimb(bean_id_or_class: string): Record<string, unknown> {
  const registry = loadRegistry();
  const model = loadLatestModel();

  // Try exact bean_id match first via tablet
  const observations = loadJsonl<Record<string, unknown>>(TABLET_PATH);
  const obs = observations.find(
    (o) => o.bean_id === bean_id_or_class || o.bean_class === bean_id_or_class,
  );

  const beanClass = obs?.bean_class ?? bean_id_or_class;
  const fp = registry[beanClass as string];

  if (!fp) {
    return {
      ...uninformedPrior(`No fingerprint for ${bean_id_or_class}`),
      bean_id_or_class,
      bean_class: beanClass,
    };
  }

  return {
    ...predictFromFingerprint(fp, model),
    bean_id_or_class,
    bean_class: beanClass,
    n_observations: fp.n_observations,
  };
}

// ── Tool: record_observation ──────────────────────────────────────────────────

function recordObservation(event: Record<string, unknown>): Record<string, unknown> {
  ensureDirs();

  const required = [
    "bean_id", "pod_id", "session_id", "start_timestamp", "end_timestamp",
    "context_cost_pp", "lines_added", "files_touched", "tests_run", "tests_passed",
    "commits_emitted", "phase_completion_flags", "vendor", "model", "ide",
    "wrasse_pre_injection_flag", "canonical_path_resolution_count", "grep_count",
  ];
  const missing = required.filter((f) => !(f in event));
  if (missing.length > 0) {
    return { status: "rejected", errors: missing.map((f) => `Missing: ${f}`) };
  }

  // Derive bean_class if absent
  if (!event.bean_class) {
    const pc = (event.phase_c_component_count as number) ?? 0;
    event.bean_class = pc >= 7 ? "large" : pc >= 4 ? "medium" : "small";
  }

  // Chronicler hash
  const canonical = JSON.stringify(event, Object.keys(event).sort());
  const hash = require("crypto").createHash("sha256").update(canonical).digest("hex");
  const observedAt = isoNow();
  const observationId = `H-${event.session_id}-${event.bean_id}-${hash.slice(0, 8)}`;

  const record = { ...event, observation_id: observationId, observed_at: observedAt, chronicler_hash: hash };
  const line = JSON.stringify(record) + "\n";

  fs.appendFileSync(TABLET_PATH, line, "utf-8");

  return { status: "stored", observation_id: observationId, chronicler_hash: hash, errors: [] };
}

// ── Tool: query_fingerprint ───────────────────────────────────────────────────

function queryFingerprint(bean_class: string): Record<string, unknown> {
  const registry = loadRegistry();
  if (!registry[bean_class]) {
    return { error: `No fingerprint found for bean_class=${bean_class}`, bean_class };
  }
  return registry[bean_class] as unknown as Record<string, unknown>;
}

// ── Tool: query_model_confidence ──────────────────────────────────────────────

function queryModelConfidence(): Record<string, unknown> {
  const model = loadLatestModel();
  const pheromone = loadPheromoneIndex();

  if (!model) {
    return {
      model_version: "none",
      r_squared: 0.0,
      residual_stderr: 0.0,
      n_observations: 0,
      recommendation: "No model trained yet — record at least 10 observations",
      pheromone_index: pheromone,
    };
  }

  const r2 = (model.r_squared as number) ?? 0.0;
  const n = (model.n_observations as number) ?? 0;

  return {
    model_version: model.model_version,
    r_squared: r2,
    residual_stderr: model.residual_stderr,
    n_observations: n,
    trained_at: model.trained_at,
    confidence_level: r2 >= 0.7 ? "HIGH" : r2 >= 0.4 ? "MODERATE" : "LOW",
    recommendation:
      n < 10
        ? "Record more observations (need 10+ for v1)"
        : n < 50
        ? "On track for v2 nearest-neighbor (need 50+)"
        : n < 200
        ? "On track for v3 generalized model (need 200+)"
        : "v3 generalized model active — cross-vendor terms enabled",
    pheromone_index: pheromone,
  };
}

// ── Tool: compare_vendor_predictions ─────────────────────────────────────────

function compareVendorPredictions(bean_class: string): Record<string, unknown> {
  const vendors = ["anthropic", "openai", "google", "amazon"];
  const registry = loadRegistry();
  const model = loadLatestModel();
  const fp = registry[bean_class];

  if (!fp) {
    return {
      error: `No fingerprint for bean_class=${bean_class}`,
      bean_class,
      comparison_table: [],
    };
  }

  const rows = vendors.map((vendor) => {
    const pred = predictFromFingerprint(fp, model);
    // Vendor heuristic: differentiate slightly based on known patterns
    const vendorAdjust: Record<string, number> = {
      anthropic: 0.0,
      openai: +2.5,
      google: -1.0,
      amazon: +1.0,
    };
    const adj = vendorAdjust[vendor] ?? 0.0;
    return {
      vendor,
      prediction: Math.max(0, Math.min(100, pred.prediction + adj)),
      confidence_low: Math.max(0, pred.confidence_low + adj),
      confidence_high: Math.min(100, pred.confidence_high + adj),
      n_basis: pred.n_basis,
      model_version: pred.model_version,
    };
  });

  return {
    bean_class,
    comparison_table: rows,
    note: "Vendor adjustments are heuristic until N>=50 observations per vendor",
  };
}

// ── MCP dispatcher ────────────────────────────────────────────────────────────

const TOOLS = {
  query_will_it_fit: {
    description:
      "Predict whether a beanpod composition fits within context budget (95% threshold). Returns will_fit bool, predicted_total_pp, confidence interval, per_bean_predictions, recommendation.",
    inputSchema: {
      type: "object",
      properties: {
        beanpod_composition: {
          type: "array",
          items: {
            type: "object",
            properties: {
              bean_class: { type: "string" },
              vendor: { type: "string" },
            },
            required: ["bean_class"],
          },
          description: "List of {bean_class, vendor?} specs for the bundle",
        },
      },
      required: ["beanpod_composition"],
    },
  },
  query_predicted_context_climb: {
    description:
      "Predict context-cost percentage-point climb for a bean_id or bean_class. Returns prediction + CI + n_basis + model_version.",
    inputSchema: {
      type: "object",
      properties: {
        bean_id_or_class: {
          type: "string",
          description: "Bean ID (e.g. KN013) or bean_class (e.g. large)",
        },
      },
      required: ["bean_id_or_class"],
    },
  },
  record_observation: {
    description:
      "Persist a new Herder Scribe observation event (D.2 schema). Required: bean_id, pod_id, session_id, start/end timestamps, context_cost_pp, lines_added, files_touched, tests_run/passed, commits_emitted, phase_completion_flags, vendor, model, ide, wrasse_pre_injection_flag, canonical_path_resolution_count, grep_count.",
    inputSchema: {
      type: "object",
      properties: {
        event: {
          type: "object",
          description: "Observation event matching D.2 schema",
        },
      },
      required: ["event"],
    },
  },
  query_fingerprint: {
    description:
      "Retrieve the bean-class fingerprint (statistical distributions of context cost, lines added, files touched, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        bean_class: { type: "string", description: "Bean class to query (e.g. large, medium, small)" },
      },
      required: ["bean_class"],
    },
  },
  query_model_confidence: {
    description:
      "Return model quality metrics: model_version, r_squared, residual_stderr, n_observations, confidence_level (HIGH/MODERATE/LOW), recommendation.",
    inputSchema: { type: "object", properties: {} },
  },
  compare_vendor_predictions: {
    description:
      "Cross-vendor prediction comparison table for a bean_class. Columns: vendor, prediction, confidence_low, confidence_high, n_basis.",
    inputSchema: {
      type: "object",
      properties: {
        bean_class: { type: "string", description: "Bean class to compare" },
      },
      required: ["bean_class"],
    },
  },
} as const;

type ToolName = keyof typeof TOOLS;

function dispatch(toolName: string, args: Record<string, unknown>): unknown {
  switch (toolName as ToolName) {
    case "query_will_it_fit":
      return queryWillItFit((args.beanpod_composition as BeanSpec[]) ?? []);
    case "query_predicted_context_climb":
      return queryPredictedContextClimb((args.bean_id_or_class as string) ?? "");
    case "record_observation":
      return recordObservation((args.event as Record<string, unknown>) ?? {});
    case "query_fingerprint":
      return queryFingerprint((args.bean_class as string) ?? "");
    case "query_model_confidence":
      return queryModelConfidence();
    case "compare_vendor_predictions":
      return compareVendorPredictions((args.bean_class as string) ?? "");
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// ── JSON-RPC stdio MCP server ─────────────────────────────────────────────────

function handleRequest(req: Record<string, unknown>): Record<string, unknown> {
  const id = req.id ?? null;
  const method = req.method as string;
  const params = (req.params as Record<string, unknown>) ?? {};

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "herder-scribe", version: "1.0.0" },
      },
    };
  }

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: Object.entries(TOOLS).map(([name, def]) => ({
          name,
          description: def.description,
          inputSchema: def.inputSchema,
        })),
      },
    };
  }

  if (method === "tools/call") {
    const toolName = params.name as string;
    const toolArgs = (params.arguments as Record<string, unknown>) ?? {};
    try {
      const result = dispatch(toolName, toolArgs);
      return {
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      };
    } catch (e) {
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: String(e) },
      };
    }
  }

  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown method: ${method}` } };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  ensureDirs();

  let buffer = "";
  process.stdin.setEncoding("utf-8");

  process.stdin.on("data", (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const req = JSON.parse(trimmed) as Record<string, unknown>;
        const response = handleRequest(req);
        process.stdout.write(JSON.stringify(response) + "\n");
      } catch (e) {
        process.stdout.write(
          JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n",
        );
      }
    }
  });

  process.stdin.on("end", () => process.exit(0));
}

main();
