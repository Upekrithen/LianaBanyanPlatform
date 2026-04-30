/**
 * Pudding Render — KN010 / A&A #2291
 *
 * Converts Chandelier diagnostic-query JSON outputs to human-readable
 * markdown / table / plot-description pudding.
 *
 * "I'm hungry" — Founder BP002 turn 13.
 *
 * This is the eating interface — the pudding (empirical receipt rendered
 * for Founder consumption). Every Chandelier diagnostic output should be
 * rendered through this tool before presenting to Founder.
 *
 * Supported input types:
 *   "three_mode_compare"   → comparison table + winner callout
 *   "right_recipe"         → winner card + subset + delta
 *   "temporal"             → histogram table + peak callout
 *   "crown_jewel_temporal" → CJ histogram + substrate correlation table
 *   "falsification"        → verdict card + empirical vs claimed
 *   "continuous_stretch"   → stretch timeline
 *   "substrate_correlator" → correlation table
 *   "generic"              → key-value table
 *
 * Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
 */

export type PuddingType =
  | "three_mode_compare"
  | "right_recipe"
  | "temporal"
  | "crown_jewel_temporal"
  | "falsification"
  | "continuous_stretch"
  | "substrate_correlator"
  | "generic";

export interface PuddingInput {
  type: PuddingType;
  data: Record<string, unknown>;
  title?: string;
  session_label?: string;
}

export interface PuddingOutput {
  markdown: string;
  plot_description: string | null;
  reproducibility_hash: string;
  source_type: PuddingType;
}

function hashString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, "0");
}

function mdHeader(title: string, level: number = 2): string {
  return `${"#".repeat(level)} ${title}\n\n`;
}

function mdTable(headers: string[], rows: (string | number | null)[][]): string {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows
    .map((r) => `| ${r.map((c) => (c === null ? "—" : String(c))).join(" | ")} |`)
    .join("\n");
  return [head, sep, body].join("\n") + "\n\n";
}

function renderThreeMode(data: Record<string, unknown>, title: string): string {
  const query = (data.query as Record<string, unknown>) ?? {};
  const summary = (data.comparison_summary as Record<string, unknown>) ?? {};
  const lines = (summary.lines as string[]) ?? [];
  const winner = (summary.winner as string) ?? "unknown";

  const modes = ["basic_stock", "modified_stock", "full_stack", "right_recipe"];
  const rows = modes
    .map((mode) => {
      const m = data[mode] as Record<string, unknown>;
      if (!m) return null;
      return [
        mode.replace(/_/g, " "),
        (m.receipts_found as number) ?? 0,
        m.latest_delta !== null && m.latest_delta !== undefined
          ? Number(m.latest_delta).toFixed(4)
          : "—",
        m.latest_receipt_id as string ?? "—",
      ];
    })
    .filter(Boolean) as (string | number | null)[][];

  const table = mdTable(["Mode", "Receipts", "Δ (delta)", "Receipt ID"], rows);

  const highlight = lines.map((l) => `> ${l}`).join("\n") + "\n\n";
  return (
    mdHeader(title || "Three-Mode Comparator", 2) +
    `**Metric:** \`${query.metric ?? "?"}\`  |  **Winner:** \`${winner}\`\n\n` +
    table +
    mdHeader("Summary", 3) +
    highlight
  );
}

function renderRightRecipe(data: Record<string, unknown>, title: string): string {
  const winner = (data.winner as Record<string, unknown>) ?? {};
  const method = (data.method as string) ?? "?";
  const confidence = (data.confidence as string) ?? "?";
  const caveats = (data.caveats as string[]) ?? [];

  const primitives = (winner.primitive_ids as string[]) ?? [];
  const delta = winner.delta as number | null;

  let md = mdHeader(title || "Right Recipe — Argmax Result", 2);
  md += `**Metric:** \`${data.metric ?? "?"}\`\n\n`;
  md += `**Method:** ${method}  |  **Confidence:** ${confidence}\n\n`;
  md += mdHeader("Winner Subset", 3);
  if (primitives.length === 0) {
    md += "_No receipts found. Run measurements first._\n\n";
  } else {
    md += primitives.map((p) => `- \`${p}\``).join("\n") + "\n\n";
    md += `**Empirical Δ:** \`${delta !== null ? Number(delta).toFixed(4) : "—"}\`\n\n`;
    md += `**Subsets Evaluated:** ${data.subsets_evaluated ?? "?"}\n\n`;
    if (winner.receipt_id) {
      md += `**Provenance Receipt:** \`${winner.receipt_id}\`\n\n`;
    }
  }
  if (caveats.length > 0) {
    md += mdHeader("Caveats", 3);
    md += caveats.map((c) => `> ⚠ ${c}`).join("\n") + "\n\n";
  }
  return md;
}

function renderTemporal(data: Record<string, unknown>, title: string): string {
  const grain = (data.grain as string) ?? "?";
  const buckets = (data.buckets as Record<string, Record<string, unknown>>) ?? {};
  const sorted = (data.sorted_keys as string[]) ?? Object.keys(buckets).sort();

  const rows = sorted.slice(-24).map((k) => {
    const b = buckets[k] ?? {};
    return [k, (b.count as number) ?? 0, Number((b.avg_delta as number) ?? 0).toFixed(4)];
  });

  let md = mdHeader(title || `Temporal Diagnostic — by ${grain}`, 2);
  md += `**Time Grain:** ${grain}  |  **Total Receipts:** ${data.total_receipts ?? "?"}\n\n`;
  if (rows.length === 0) {
    md += "_No receipts found._\n\n";
  } else {
    md += mdTable([grain.charAt(0).toUpperCase() + grain.slice(1), "Receipt Count", "Avg Δ"], rows);
  }
  return md;
}

function renderCrownJewelTemporal(data: Record<string, unknown>, title: string): string {
  const histograms = (data.histograms as Record<string, unknown>) ?? {};
  const hourHist = (histograms.hour_of_day as Record<string, number>) ?? {};
  const dowHist = (histograms.day_of_week as Record<string, number>) ?? {};
  const peakHour = histograms.peak_hour;
  const peakDay = histograms.peak_day;
  const totalCJ = histograms.total_cj ?? "?";
  const caveats = (data.caveats as string[]) ?? [];

  let md = mdHeader(title || "Crown Jewel Production Rate — Temporal Diagnostic", 2);
  md += `**Total CJ Analysed:** ${totalCJ}\n\n`;

  if (peakHour !== undefined) {
    md += `> 🕐 **Peak hour:** ${peakHour}:00 UTC  |  **Peak day:** ${peakDay}\n\n`;
  }

  // Hour histogram table
  const hourRows = Object.entries(hourHist)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([h, c]) => [`${h}:00`, c]);

  if (hourRows.length > 0) {
    md += mdHeader("CJ Production by Hour of Day (UTC)", 3);
    md += mdTable(["Hour", "CJ Count"], hourRows as (string | number)[][]);
  }

  // Day-of-week histogram
  const dowRows = Object.entries(dowHist).map(([d, c]) => [d, c]);
  if (dowRows.length > 0) {
    md += mdHeader("CJ Production by Day of Week", 3);
    md += mdTable(["Day", "CJ Count"], dowRows as (string | number)[][]);
  }

  // Substrate state correlation
  const substrateResult = data.substrate_state_at_filing as Record<string, unknown> | undefined;
  if (substrateResult?.ranked_substrate_states) {
    const ranked = substrateResult.ranked_substrate_states as Array<Record<string, unknown>>;
    md += mdHeader("Substrate State at CJ Filing", 3);
    md += mdTable(
      ["Substrate State", "CJ Count"],
      ranked.slice(0, 5).map((r) => [
        (r.substrate_state as string[])?.join(", ") ?? r.state_key ?? "?",
        r.cj_count as number,
      ])
    );
  }

  if (caveats.length > 0) {
    md += caveats.map((c) => `> ⚠ ${c}`).join("\n") + "\n\n";
  }

  return md;
}

function renderFalsification(data: Record<string, unknown>, title: string): string {
  const verdict = (data.verdict as string) ?? "?";
  const claimed = data.claimed_delta as number;
  const empirical = data.empirical_delta as number | null;
  const ci = data.confidence_interval_95 as [number, number] | null;
  const n = data.n_receipts as number;
  const rationale = (data.verdict_rationale as string) ?? "";

  const emoji: Record<string, string> = {
    CONFIRMED: "✅",
    WEAK: "⚠️",
    FALSIFIED: "❌",
    INSUFFICIENT_DATA: "❓",
  };

  let md = mdHeader(title || "Falsification Test Result", 2);
  md += `## ${emoji[verdict] ?? "?"} Verdict: **${verdict}**\n\n`;
  md += mdTable(
    ["Parameter", "Value"],
    [
      ["Claimed Δ", Number(claimed).toFixed(4)],
      ["Empirical Δ", empirical !== null ? Number(empirical).toFixed(4) : "—"],
      [
        "95% CI",
        ci ? `[${Number(ci[0]).toFixed(4)}, ${Number(ci[1]).toFixed(4)}]` : "—",
      ],
      ["Receipts", n],
    ]
  );
  md += `> ${rationale}\n\n`;
  return md;
}

function renderContinuousStretch(data: Record<string, unknown>, title: string): string {
  const longest = data.longest_stretch as Record<string, unknown> | null;
  const top = (data.top_stretches as Record<string, unknown>[]) ?? [];

  let md = mdHeader(title || "Continuous Productive Stretch Analysis", 2);

  if (!longest) {
    md += "_No stretches found._\n\n";
    return md;
  }

  md += `**Longest Stretch:** ${longest.start} → ${longest.end} ` +
    `(${longest.duration_hours}h, ${longest.count} receipts)\n\n`;

  if (top.length > 0) {
    md += mdHeader("Top Stretches", 3);
    md += mdTable(
      ["Start", "End", "Duration (h)", "Receipts"],
      top.map((s) => [s.start as string, s.end as string, s.duration_hours as number, s.count as number])
    );
  }

  return md;
}

function renderSubstrateCorrelator(data: Record<string, unknown>, title: string): string {
  const table = (data.correlation_table as Record<string, unknown>[]) ?? [];
  const grain = (data.grain as string) ?? "?";
  const metric = (data.metric as string) ?? "all";

  let md = mdHeader(title || "Substrate-State Correlator", 2);
  md += `**Grain:** ${grain}  |  **Metric:** ${metric}\n\n`;

  if (table.length === 0) {
    md += "_No correlation data. Run measurements first._\n\n";
    return md;
  }

  md += mdTable(
    ["Primitive", "Correlation Score", "Peak Appearances", "Interpretation"],
    table.slice(0, 10).map((r) => [
      `\`${r.primitive_id as string}\``,
      r.correlation_score as number,
      r.top_period_appearances as number,
      r.interpretation as string,
    ])
  );

  const caveat = data.caveat as string;
  if (caveat) {
    md += `> ℹ ${caveat}\n\n`;
  }

  return md;
}

function renderGeneric(data: Record<string, unknown>, title: string): string {
  let md = mdHeader(title || "Chandelier Diagnostic Output", 2);
  md += mdTable(
    ["Key", "Value"],
    Object.entries(data)
      .filter(([, v]) => typeof v !== "object")
      .map(([k, v]) => [k, String(v)])
  );
  return md;
}

export function renderPudding(input: PuddingInput): PuddingOutput {
  const { type, data, title = "", session_label = "" } = input;

  const sessionBanner = session_label
    ? `_Session: ${session_label}_\n\n`
    : "";

  let markdown = "";
  let plotDescription: string | null = null;

  switch (type) {
    case "three_mode_compare":
      markdown = sessionBanner + renderThreeMode(data, title);
      plotDescription = "Bar chart: mode vs delta, with Right-Recipe highlighted";
      break;
    case "right_recipe":
      markdown = sessionBanner + renderRightRecipe(data, title);
      plotDescription = "Subset diagram: optimal primitives highlighted";
      break;
    case "temporal":
      markdown = sessionBanner + renderTemporal(data, title);
      plotDescription = "Line/bar chart: bucket (time grain) vs count/avg_delta";
      break;
    case "crown_jewel_temporal":
      markdown = sessionBanner + renderCrownJewelTemporal(data, title);
      plotDescription =
        "Dual histogram: hour-of-day bar chart + day-of-week bar chart for CJ production";
      break;
    case "falsification":
      markdown = sessionBanner + renderFalsification(data, title);
      plotDescription = "Gauge chart: empirical Δ vs claimed Δ, with CONFIRMED/WEAK/FALSIFIED zones";
      break;
    case "continuous_stretch":
      markdown = sessionBanner + renderContinuousStretch(data, title);
      plotDescription = "Gantt-style timeline: productive stretches with gap markers";
      break;
    case "substrate_correlator":
      markdown = sessionBanner + renderSubstrateCorrelator(data, title);
      plotDescription = "Heatmap: primitive vs peak-period appearance frequency";
      break;
    case "generic":
    default:
      markdown = sessionBanner + renderGeneric(data, title);
      plotDescription = null;
      break;
  }

  const reproducibilityHash = hashString(JSON.stringify({ type, data, title }));

  return {
    markdown,
    plot_description: plotDescription,
    reproducibility_hash: reproducibilityHash,
    source_type: type,
  };
}

// ── MCP tool handler ───────────────────────────────────────────────────────────

export const puddingRenderTool = {
  name: "chandelier_render_pudding",
  description:
    "Convert a Chandelier diagnostic JSON output to human-readable markdown pudding (table + chart-description). Input: {type, data, title, session_label}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      type: {
        type: "string",
        enum: [
          "three_mode_compare",
          "right_recipe",
          "temporal",
          "crown_jewel_temporal",
          "falsification",
          "continuous_stretch",
          "substrate_correlator",
          "generic",
        ],
        description: "Type of diagnostic output to render",
      },
      data: {
        type: "object",
        description: "The diagnostic JSON output object",
      },
      title: {
        type: "string",
        description: "Optional custom title for the pudding",
      },
      session_label: {
        type: "string",
        description: "Optional session label (e.g. 'KN011-BP002')",
      },
    },
    required: ["type", "data"],
  },
  handler: (args: Record<string, unknown>): PuddingOutput => {
    return renderPudding({
      type: (args.type as PuddingType) ?? "generic",
      data: (args.data as Record<string, unknown>) ?? {},
      title: (args.title as string) ?? "",
      session_label: (args.session_label as string) ?? "",
    });
  },
};
