/**
 * CatacombsContributePage.tsx — Member Contribution Flow
 * MnemosyneC v0.8.0 · BP094
 *
 * Allows cooperative members to contribute verified knowledge to the
 * catacombs_contributions substrate. Pre-fills from CSIA refusal flow.
 */

import { useState, useEffect } from "react";
import { BookOpen, Send, Loader2 } from "lucide-react";

export default function CatacombsContributePage() {
  const [originQuestion, setOriginQuestion] = useState("");
  const [categorySlug, setCategorySlug] = useState("general");
  const [content, setContent] = useState("");
  const [memberId, setMemberId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ verdict?: string; error?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setOriginQuestion(decodeURIComponent(q));
      setContent(`[Responding to question: ${decodeURIComponent(q)}]\n\n`);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !categorySlug || !memberId || submitting) return;

    setSubmitting(true);
    setResult(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amplify = (window as any).amplify;
      if (!amplify) {
        throw new Error("Requires MnemosyneC desktop app");
      }

      const res = await amplify.invoke("catacombs:contribute", categorySlug, trimmed, memberId);
      setResult(res as { verdict?: string; error?: string });
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  const CATEGORY_SLUGS = [
    "general",
    "health",
    "finance",
    "food",
    "legal",
    "education",
    "housing",
    "community",
    "technology",
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Contribute to Catacombs</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Your contribution enters the Star Chamber · Scrambler · Keys Engines corroboration pipeline.
          Triple-GREEN contributions become substrate evidence for future CSIA-Hybrid answers.
        </p>
      </div>

      {originQuestion && (
        <div className="mb-6 p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
          <p className="text-xs text-zinc-500 font-mono mb-1">ORIGINATING QUESTION</p>
          <p className="text-sm text-zinc-300">{originQuestion}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-1.5">CATEGORY</label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-600"
          >
            {CATEGORY_SLUGS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-1.5">MEMBER ID</label>
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Your cooperative member ID"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-600"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-1.5">KNOWLEDGE CONTRIBUTION</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share verified knowledge for the cooperative substrate…"
            rows={8}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-600 resize-none"
          />
          <p className="mt-1 text-xs text-zinc-600">
            Minimum 50 characters. Your contribution will be cryptographically signed and submitted for
            triple-corroboration before entering the substrate.
          </p>
        </div>

        {result && (
          <div
            className={`p-3 rounded-lg border text-sm ${
              result.verdict === "GREEN"
                ? "bg-emerald-900/20 border-emerald-800 text-emerald-300"
                : result.error
                ? "bg-red-900/20 border-red-800 text-red-300"
                : "bg-zinc-800 border-zinc-700 text-zinc-300"
            }`}
          >
            {result.verdict === "GREEN" && "Contribution submitted and accepted (triple-GREEN)."}
            {result.verdict === "RED" && "Contribution failed corroboration (RED verdict). Please revise."}
            {result.error && `Error: ${result.error}`}
          </div>
        )}

        <button
          type="submit"
          disabled={!content.trim() || content.trim().length < 50 || !memberId || submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold text-sm rounded-lg transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting to Catacombs…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Contribution
            </>
          )}
        </button>
      </form>
    </div>
  );
}
