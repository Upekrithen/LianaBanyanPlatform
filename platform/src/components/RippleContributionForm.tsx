/**
 * RippleContributionForm — inline form for committing a Ripple backing
 * Four types: resources / reputation / network / skills
 * K405 / Innovation #2241
 */
import { useState } from "react";
import {
  useRipplesForEngagement,
  useCommitRipple,
  type RippleContribution,
} from "@/hooks/useRipplesForEngagement";
import {
  Banknote,
  Award,
  Network,
  Wrench,
  Plus,
  Loader2,
  CheckCircle,
} from "lucide-react";

const RIPPLE_TYPES = [
  { key: "resources" as const, label: "Resources", icon: Banknote, color: "#f59e0b" },
  { key: "reputation" as const, label: "Reputation", icon: Award, color: "#8b5cf6" },
  { key: "network" as const, label: "Network", icon: Network, color: "#06b6d4" },
  { key: "skills" as const, label: "Skills", icon: Wrench, color: "#22c55e" },
] as const;

interface Props {
  engagementId: string;
  onCommitted?: () => void;
}

export default function RippleContributionForm({ engagementId, onCommitted }: Props) {
  const { ripples, loading, reload } = useRipplesForEngagement(engagementId);
  const { commitRipple, committing } = useCommitRipple();
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<RippleContribution["ripple_type"]>("resources");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Type-specific fields
  const [currency, setCurrency] = useState("credits");
  const [amount, setAmount] = useState("");
  const [endorsement, setEndorsement] = useState("");
  const [introUserId, setIntroUserId] = useState("");
  const [introContext, setIntroContext] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [estHours, setEstHours] = useState("");

  function resetForm() {
    setCurrency("credits");
    setAmount("");
    setEndorsement("");
    setIntroUserId("");
    setIntroContext("");
    setServiceDesc("");
    setEstHours("");
    setError("");
    setSuccess(false);
  }

  async function handleSubmit() {
    setError("");
    setSuccess(false);

    let data: Record<string, unknown> = {};
    switch (selectedType) {
      case "resources":
        if (!amount || Number(amount) <= 0) { setError("Amount must be positive"); return; }
        data = { currency, amount: Number(amount) };
        break;
      case "reputation":
        if (endorsement.length < 5) { setError("Endorsement must be at least 5 characters"); return; }
        data = { endorsement_text: endorsement, visible_on_member_profile: true };
        break;
      case "network":
        if (!introUserId) { setError("Target user ID required"); return; }
        if (introContext.length < 5) { setError("Context must be at least 5 characters"); return; }
        data = { introduction_to_user_id: introUserId, introduction_context: introContext };
        break;
      case "skills":
        if (serviceDesc.length < 5) { setError("Service description must be at least 5 characters"); return; }
        if (!estHours || Number(estHours) <= 0) { setError("Estimated hours must be positive"); return; }
        data = { service_description: serviceDesc, estimated_hours: Number(estHours) };
        break;
    }

    try {
      await commitRipple(engagementId, selectedType, data);
      setSuccess(true);
      resetForm();
      reload();
      onCommitted?.();
      setTimeout(() => { setSuccess(false); setShowForm(false); }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const activeType = RIPPLE_TYPES.find((t) => t.key === selectedType)!;

  return (
    <div className="mt-4">
      {/* Existing ripples */}
      {!loading && ripples.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
            Ripple Backings ({ripples.length})
          </h3>
          <div className="space-y-1.5">
            {ripples.map((r) => {
              const meta = RIPPLE_TYPES.find((t) => t.key === r.ripple_type)!;
              const Icon = meta.icon;
              return (
                <div
                  key={r.ripple_id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{ background: "rgba(10,22,40,0.6)", border: `1px solid ${meta.color}22` }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: meta.color }} />
                  <span className="text-slate-300 capitalize">{r.ripple_type}</span>
                  <span className="text-slate-600 ml-auto text-[10px]">
                    {new Date(r.committed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add ripple button or form */}
      {!showForm ? (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all hover:bg-amber-500/10"
          style={{ color: "#d4a853", border: "1px dashed rgba(212,168,83,0.3)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Back this engagement (Ripple)
        </button>
      ) : (
        <div
          className="rounded-xl p-4"
          style={{ background: "#0a1628", border: "1px solid rgba(212,168,83,0.2)" }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "#d4a853", fontFamily: "'Crimson Pro', Georgia, serif" }}
          >
            Commit a Ripple
          </h3>

          {/* Type selector */}
          <div className="flex gap-1 mb-4">
            {RIPPLE_TYPES.map((t) => {
              const Icon = t.icon;
              const sel = selectedType === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    sel ? "ring-1" : "opacity-60 hover:opacity-80"
                  }`}
                  style={{
                    background: sel ? `${t.color}15` : "transparent",
                    color: sel ? t.color : "#94a3b8",
                    ringColor: sel ? `${t.color}40` : undefined,
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Type-specific fields */}
          <div className="space-y-3 mb-4">
            {selectedType === "resources" && (
              <>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-xs text-slate-200"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(148,163,184,0.15)" }}
                  >
                    <option value="credits">Credits</option>
                    <option value="marks">Marks</option>
                    <option value="joules">Joules</option>
                    <option value="backed_marks">Backed Marks</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min={1}
                    className="w-full rounded-lg px-3 py-2 text-xs text-slate-200"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(148,163,184,0.15)" }}
                  />
                </div>
              </>
            )}

            {selectedType === "reputation" && (
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Endorsement</label>
                <textarea
                  value={endorsement}
                  onChange={(e) => setEndorsement(e.target.value)}
                  placeholder="Your endorsement of this Member's work..."
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-xs text-slate-200 resize-none"
                  style={{ background: "#0d1f3c", border: "1px solid rgba(148,163,184,0.15)" }}
                />
              </div>
            )}

            {selectedType === "network" && (
              <>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Introduce to (User ID)</label>
                  <input
                    type="text"
                    value={introUserId}
                    onChange={(e) => setIntroUserId(e.target.value)}
                    placeholder="UUID of the person you're introducing"
                    className="w-full rounded-lg px-3 py-2 text-xs text-slate-200"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(148,163,184,0.15)" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Introduction Context</label>
                  <textarea
                    value={introContext}
                    onChange={(e) => setIntroContext(e.target.value)}
                    placeholder="Why this introduction helps..."
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-xs text-slate-200 resize-none"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(148,163,184,0.15)" }}
                  />
                </div>
              </>
            )}

            {selectedType === "skills" && (
              <>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Service Description</label>
                  <textarea
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    placeholder="Describe the skills/service you're committing..."
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 text-xs text-slate-200 resize-none"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(148,163,184,0.15)" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={estHours}
                    onChange={(e) => setEstHours(e.target.value)}
                    placeholder="0"
                    min={1}
                    className="w-full rounded-lg px-3 py-2 text-xs text-slate-200"
                    style={{ background: "#0d1f3c", border: "1px solid rgba(148,163,184,0.15)" }}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-[10px] mb-3 px-2 py-1.5 rounded bg-red-500/10">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] mb-3 px-2 py-1.5 rounded bg-emerald-500/10">
              <CheckCircle className="w-3 h-3" />
              Ripple committed
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={committing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
              style={{ background: `${activeType.color}20`, color: activeType.color, border: `1px solid ${activeType.color}40` }}
            >
              {committing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              {committing ? "Committing..." : "Commit Ripple"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
