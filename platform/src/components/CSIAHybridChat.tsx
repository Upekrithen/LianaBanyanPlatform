/**
 * CSIAHybridChat.tsx — CSIA-Hybrid Inference UI
 * MnemosyneC v0.8.0 · BP094
 *
 * Cooperative-Substrate Inference Architecture chat surface.
 * Calls window.amplify.csia.query (Electron IPC → src/main/csia_hybrid/inference_pipeline.ts).
 * Displays ANSWER/REFUSAL verdict with provenance chain and triple-verification badges.
 */

import { useState } from "react";
import { Loader2, Send, ShieldCheck, ShieldX, Minus, ChevronDown, ChevronUp } from "lucide-react";

// ---- Types (mirrored from inference_pipeline.ts) ----------------------------

interface ProvenanceLink {
  evidence_id: string;
  category_slug: string;
  content_preview: string;
  contributor_member_id: string;
  soccerball_hash?: string;
}

interface CSIAResult {
  verdict: "ANSWER" | "REFUSAL";
  answer?: string;
  refusal_reason?: string;
  provenance: ProvenanceLink[];
  system_prompt_used: string;
  model_used: string;
  star_chamber: "GREEN" | "RED" | "SKIP";
  scrambler: "GREEN" | "RED" | "SKIP";
  keys_engines: "GREEN" | "RED" | "SKIP";
  green_count: number;
  run_id: string;
  elapsed_ms: number;
  evidence_count: number;
}

// ---- Subcomponents ----------------------------------------------------------

function VerdictBadge({
  label,
  verdict,
}: {
  label: string;
  verdict: "GREEN" | "RED" | "SKIP";
}) {
  const colors = {
    GREEN: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    RED: "bg-red-900/40 text-red-300 border-red-700",
    SKIP: "bg-zinc-800/40 text-zinc-400 border-zinc-700",
  };
  const icons = {
    GREEN: <ShieldCheck className="w-3.5 h-3.5" />,
    RED: <ShieldX className="w-3.5 h-3.5" />,
    SKIP: <Minus className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono ${colors[verdict]}`}
    >
      {icons[verdict]}
      {label}: {verdict}
    </span>
  );
}

function ProvenancePanel({ provenance, systemPrompt }: { provenance: ProvenanceLink[]; systemPrompt: string }) {
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  if (provenance.length === 0) return null;

  return (
    <div className="mt-4 border border-zinc-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-800/60 text-xs text-zinc-400 hover:bg-zinc-800 transition-colors"
      >
        <span className="font-mono">PROVENANCE CHAIN ({provenance.length} evidence rows)</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="divide-y divide-zinc-800">
          {provenance.map((link, i) => (
            <div key={link.evidence_id} className="px-4 py-3 bg-zinc-900/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-amber-400">#{i + 1}</span>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                  {link.category_slug}
                </span>
                {link.soccerball_hash && (
                  <span className="text-xs font-mono text-emerald-600" title={link.soccerball_hash}>
                    ⚽ {link.soccerball_hash.slice(0, 8)}…
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{link.content_preview}</p>
              <p className="text-xs text-zinc-600 mt-1">
                Contributor: <span className="font-mono">{link.contributor_member_id.slice(0, 12)}…</span>
              </p>
            </div>
          ))}

          <div className="px-4 py-2 bg-zinc-800/30">
            <button
              onClick={() => setShowPrompt((v) => !v)}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1"
            >
              {showPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              System prompt used
            </button>
            {showPrompt && (
              <pre className="mt-2 text-xs text-zinc-400 whitespace-pre-wrap font-mono bg-zinc-900 p-2 rounded max-h-40 overflow-y-auto">
                {systemPrompt}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main component ---------------------------------------------------------

export function CSIAHybridChat() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CSIAResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isElectron = typeof window !== "undefined" && !!(window as Window & { amplify?: unknown }).amplify;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      if (!isElectron) {
        throw new Error("CSIA-Hybrid requires the MnemosyneC desktop app (Electron). Running in browser mode — IPC unavailable.");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amplify = (window as any).amplify as { csia?: { query?: (q: string) => Promise<CSIAResult> } };
      if (!amplify?.csia?.query) {
        throw new Error("csia.query IPC not available — app may need a restart after update.");
      }

      const res = await amplify.csia.query(q);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <span className="text-amber-400 text-sm font-bold">M</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">MnemosyneC CSIA-Hybrid</h1>
          <span className="text-xs font-mono bg-amber-900/30 text-amber-400 border border-amber-700/50 px-2 py-0.5 rounded">
            v0.8.0
          </span>
        </div>
        <p className="text-sm text-zinc-500">
          Cooperative-substrate grounded inference. Answers verified by Star Chamber · Scrambler · Keys Engines.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything — answers are grounded in triple-GREEN verified cooperative knowledge…"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-600 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-600 font-mono">Enter to submit · Shift+Enter for newline</p>
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 disabled:text-zinc-500 font-semibold text-sm rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Query Substrate
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Verdict header */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg border ${
              result.verdict === "ANSWER"
                ? "bg-emerald-900/20 border-emerald-800"
                : "bg-red-900/20 border-red-800"
            }`}
          >
            <span
              className={`text-sm font-bold font-mono ${
                result.verdict === "ANSWER" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {result.verdict}
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <VerdictBadge label="StarChamber" verdict={result.star_chamber} />
              <VerdictBadge label="Scrambler" verdict={result.scrambler} />
              <VerdictBadge label="KeysEngines" verdict={result.keys_engines} />
            </div>
          </div>

          {/* Answer or refusal */}
          {result.verdict === "ANSWER" && result.answer && (
            <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
            </div>
          )}
          {result.verdict === "REFUSAL" && (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <p className="text-xs text-zinc-500 font-mono mb-1">REFUSAL REASON</p>
              <p className="text-sm text-zinc-400">{result.refusal_reason}</p>
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-600">
                  Help improve answers by contributing verified knowledge to the cooperative substrate.
                </p>
                <button
                  onClick={() => {
                    window.location.href = `/contribute?q=${encodeURIComponent(question)}`;
                  }}
                  className="mt-2 text-xs text-amber-500 hover:text-amber-400 font-mono underline"
                >
                  Contribute to Catacombs →
                </button>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 font-mono">
            <span>model: {result.model_used}</span>
            <span>evidence: {result.evidence_count} rows</span>
            <span>GREEN: {result.green_count}/3</span>
            <span>elapsed: {result.elapsed_ms}ms</span>
            <span>run: {result.run_id.slice(0, 8)}…</span>
          </div>

          {/* Provenance panel */}
          <ProvenancePanel provenance={result.provenance} systemPrompt={result.system_prompt_used} />
        </div>
      )}
    </div>
  );
}

export default CSIAHybridChat;
