/**
 * COMMUNITY EMPIRICAL DASHBOARD — Phase E.3 (K502)
 * ==================================================
 * Public page at librarian.the2ndsecond.com/community-empirical
 *
 * Shows aggregate Caithedral Effect verification results from all members
 * who opted in. This is the reproducibility-at-scale evidence for AAAI §6
 * and the public letters.
 *
 * Claim: "X verified members' independent runs aggregate to a +Y pp mean
 * Caithedral Effect, consistent with our published R13 finding."
 */

import React, { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AggregateStats {
  total_runs: number;
  vendor_count: number;
  mean_lift_pp: number;
  min_lift_pp: number;
  max_lift_pp: number;
  median_lift_pp: number;
  mean_cold_hot_pct: number;
  mean_cathedral_hot_pct: number;
  mean_questions_completed: number;
  last_submission_at: string | null;
  by_vendor: {
    vendor: string;
    runs: number;
    mean_lift_pp: number;
    mean_cold_pct: number;
    mean_cathedral_pct: number;
  }[];
}

const VENDOR_DISPLAY: Record<string, string> = {
  claude: "Claude (Anthropic)",
  chatgpt: "ChatGPT (OpenAI)",
  gemini: "Gemini (Google)",
  perplexity: "Perplexity",
  copilot: "Copilot (Microsoft)",
};

const PUBLISHED_MEAN_LIFT = 86;   // R13 published finding

// ── Components ────────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, highlight = false }: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
      <div className={`text-3xl font-bold mb-1 ${highlight ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-slate-100"}`}>
        {value}
      </div>
      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function VendorRow({ vendor }: { vendor: AggregateStats["by_vendor"][0] }) {
  const displayName = VENDOR_DISPLAY[vendor.vendor] ?? vendor.vendor;
  const liftBarWidth = Math.min(100, Math.max(0, ((vendor.mean_lift_pp + 10) / 110) * 100));

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="w-40 text-sm font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">
        {displayName}
      </div>
      <div className="flex-1">
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${liftBarWidth}%` }}
          />
        </div>
      </div>
      <div className="w-20 text-right text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
        +{vendor.mean_lift_pp} pp
      </div>
      <div className="w-16 text-right text-xs text-slate-400 flex-shrink-0">
        {vendor.runs} run{vendor.runs !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function CommunityEmpiricalDashboard() {
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAggregate();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAggregate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAggregate() {
    try {
      const resp = await fetch("https://api.lianabanyan.com/test_frame_results/aggregate");
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 mb-6">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Live community data</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Caithedral Effect — Community Empirical
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Independent verification runs submitted by LB Test Frame members.
            Each result was measured by a real member, on their own AI session,
            using their own account — not by LB's research team.
          </p>
        </div>

        {/* Loading / error states */}
        {loading && (
          <div className="text-center py-20 text-slate-400">Loading community results…</div>
        )}
        {error && !stats && (
          <div className="text-center py-20 text-red-500">
            Could not load community data: {error}
          </div>
        )}

        {stats && (
          <>
            {/* Headline claim */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center mb-8 text-white">
              <div className="text-5xl font-bold mb-2">
                {stats.total_runs > 0
                  ? `+${stats.mean_lift_pp} pp`
                  : "No data yet"}
              </div>
              <div className="text-blue-100 text-lg">
                mean Caithedral Effect lift across {stats.total_runs} member verification run{stats.total_runs !== 1 ? "s" : ""}
              </div>
              {stats.total_runs > 0 && (
                <div className="text-blue-200 text-sm mt-2">
                  Consistent with our published R13 finding of +{PUBLISHED_MEAN_LIFT} pp
                  (range: +{stats.min_lift_pp} to +{stats.max_lift_pp} pp)
                </div>
              )}
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Verified members"
                value={stats.total_runs.toString()}
                sub="who opted in"
              />
              <MetricCard
                label="Mean lift"
                value={stats.total_runs > 0 ? `+${stats.mean_lift_pp} pp` : "—"}
                highlight
                sub={`R13 published: +${PUBLISHED_MEAN_LIFT} pp`}
              />
              <MetricCard
                label="Cold accuracy"
                value={stats.total_runs > 0 ? `${stats.mean_cold_hot_pct}%` : "—"}
                sub="without LB context"
              />
              <MetricCard
                label="Cathedral accuracy"
                value={stats.total_runs > 0 ? `${stats.mean_cathedral_hot_pct}%` : "—"}
                sub="with LB context"
              />
            </div>

            {/* By vendor */}
            {stats.by_vendor && stats.by_vendor.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Results by AI vendor
                </h2>
                {stats.by_vendor.map((v) => (
                  <VendorRow key={v.vendor} vendor={v} />
                ))}
              </div>
            )}

            {/* Zero-state */}
            {stats.total_runs === 0 && (
              <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center mb-8">
                <div className="text-4xl mb-4">⛩</div>
                <div className="text-slate-900 dark:text-slate-100 font-semibold mb-2">
                  No community results yet.
                </div>
                <div className="text-slate-500 text-sm mb-4">
                  Be the first to verify. Install LB Test Frame and run the 25-question demo.
                </div>
                <a
                  href="https://lb-test-frame.lianabanyan.com"
                  className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Download LB Test Frame →
                </a>
              </div>
            )}

            {/* Methodology note */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 text-sm text-slate-500 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Methodology note</p>
              <p className="mb-2">
                Each result represents one member's independent verification run using the 25-question
                LB Test Frame battery. Members paste their AI's answers directly; the extension grades
                using deterministic substring matching (no LLM-judge in the default path).
              </p>
              <p>
                Results submitted as "anonymous" have no member identifier. "Public" submissions
                include member attribution. No AI session content is shared with LB — only the
                question correctness scores and vendor name.
              </p>
              {stats.last_submission_at && (
                <p className="mt-2">
                  Last submission: {new Date(stats.last_submission_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="https://lb-test-frame.lianabanyan.com"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Install LB Test Frame and add your result
          </a>
          <p className="text-xs text-slate-400 mt-3">
            Free. No API key required. Works with Claude, ChatGPT, Gemini, Perplexity, and Copilot.
          </p>
        </div>
      </div>
    </div>
  );
}
