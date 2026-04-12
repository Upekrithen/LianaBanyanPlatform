/**
 * PublishBriefPage — /openwater/publish
 * =======================================
 * Member-facing brief publication form with progressive disclosure.
 * K404 (Open Water) / B097. Innovation #2240.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { SummonMascot } from "@/components/museum/SummonMascot";
import { useAuth } from "@/contexts/AuthContext";
import { Anchor, ChevronRight } from "lucide-react";
import { OpenWaterCueCardBanner } from "@/components/OpenWaterCueCardBanner";

const VESSEL_TIERS = [
  { level: 0, name: "Dinghy", desc: "Haven\u2019t started yet \u2014 need a push to take the first tangible action" },
  { level: 1, name: "Rowboat", desc: "Started. Solo. Smallest scale." },
  { level: 2, name: "Canoe", desc: "Scaled from 1 to 2. Solo or family-scale." },
  { level: 3, name: "Skiff", desc: "First helper. First systems. Owner-operator." },
  { level: 4, name: "Sailboat", desc: "Real small business. Multi-employee." },
  { level: 5, name: "Ship", desc: "Operational scale. Multi-location." },
  { level: 6, name: "Yacht", desc: "National/international or platform scale." },
];

const PATHWAYS = [
  { value: "food", label: "Food" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "service", label: "Service" },
  { value: "local_business", label: "Local Business" },
  { value: "guild", label: "Guild" },
  { value: "tribe", label: "Tribe" },
];

export default function PublishBriefPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [targetLevel, setTargetLevel] = useState<number | null>(null);
  const [pathway, setPathway] = useState("");
  const [subtag, setSubtag] = useState("");
  const [question, setQuestion] = useState("");
  const [credits, setCredits] = useState(0);
  const [marks, setMarks] = useState(0);
  const [joules, setJoules] = useState(0);
  const [engDays, setEngDays] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!user || currentLevel === null || targetLevel === null || !pathway || !question) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://ruuxzilgmuwddcofqecc.supabase.co"}/functions/v1/publish-open-water-brief`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await (await import("@/integrations/supabase/client")).supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            current_level: currentLevel,
            target_level: targetLevel,
            industry_pathway: pathway,
            industry_subtag: subtag || null,
            growth_question: question,
            voucher_budget_credits: credits,
            voucher_budget_marks: marks,
            voucher_budget_joules: joules,
            preferred_engagement_length_days: engDays || null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      navigate("/openwater/briefs");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const targetOptions = VESSEL_TIERS.filter(
    (t) => currentLevel !== null && (currentLevel === 0 ? t.level >= 1 : t.level > currentLevel),
  );

  return (
    <MuseumShell>
      <div className="min-h-screen px-4 py-8 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Anchor className="w-5 h-5 text-emerald-500" />
            <h1
              className="text-xl font-bold"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              Publish a Brief
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            You have a Play. We have a Stage. Tell us where you are and where you want to go.
          </p>

          <OpenWaterCueCardBanner cardId="you-have-a-play-i-have-a-stage" className="mb-4" />

          <SummonMascot
            mascotId="stag"
            topic="What a brief is"
            startClosed
            message={
              <>
                A brief is your growth question, stated honestly. Where you are now, where you
                want to go, and what specific help you need to get there. Patrons will volunteer
                based on your brief. You pick the one you trust.
              </>
            }
            className="mb-6"
          />

          {/* Step indicators */}
          <div className="flex gap-1 mb-6">
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all"
                style={{ background: s <= step ? "#22c55e" : "rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>

          {/* Level 0 anchor card — appears once Dinghy is selected */}
          {currentLevel === 0 && (
            <OpenWaterCueCardBanner
              cardId="doing-something-is-what-it-takes-to-start"
              showLevel0
              className="mb-4"
            />
          )}

          {/* Step 0: Current level */}
          {step === 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Where are you now?</h2>
              {VESSEL_TIERS.map((t) => (
                <button
                  key={t.level}
                  onClick={() => { setCurrentLevel(t.level); setStep(1); }}
                  className={`w-full text-left rounded-xl p-3 transition-all ${
                    currentLevel === t.level
                      ? "bg-emerald-500/15 border border-emerald-500/40"
                      : "bg-slate-800/40 border border-slate-700/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium" style={{ color: "#faf5eb" }}>
                        Level {t.level} &mdash; {t.name}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Target level + pathway */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-3">Where do you want to go?</h2>
                <div className="space-y-2">
                  {targetOptions.map((t) => (
                    <button
                      key={t.level}
                      onClick={() => setTargetLevel(t.level)}
                      className={`w-full text-left rounded-xl p-3 transition-all ${
                        targetLevel === t.level
                          ? "bg-emerald-500/15 border border-emerald-500/40"
                          : "bg-slate-800/40 border border-slate-700/50 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-sm font-medium" style={{ color: "#faf5eb" }}>
                        Level {t.level} &mdash; {t.name}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-2">Industry pathway</h2>
                <div className="flex flex-wrap gap-2">
                  {PATHWAYS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPathway(p.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        pathway === p.value
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Sub-category (optional)"
                value={subtag}
                onChange={(e) => setSubtag(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
              />

              <button
                onClick={() => setStep(2)}
                disabled={targetLevel === null || !pathway}
                className="w-full py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Growth question */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">
                {currentLevel === 0
                  ? "What\u2019s the first tangible thing you need help doing?"
                  : "What specific growth question do you need answered?"}
              </h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder={
                  currentLevel === 0
                    ? "I have an idea for... but I haven\u2019t taken the first step yet. I need help figuring out what to do first."
                    : "I\u2019m at... and I want to get to... The specific thing I need help with is..."
                }
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
              <button
                onClick={() => setStep(3)}
                disabled={question.trim().length < 10}
                className="w-full py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 3: Voucher budget + submit */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">
                Voucher budget (optional)
              </h2>
              <p className="text-[11px] text-slate-500 mb-3">
                What can you offer backers? Level 0 members can leave this empty.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">Credits</label>
                  <input
                    type="number" min={0} value={credits}
                    onChange={(e) => setCredits(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Marks</label>
                  <input
                    type="number" min={0} value={marks}
                    onChange={(e) => setMarks(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Joules</label>
                  <input
                    type="number" min={0} value={joules}
                    onChange={(e) => setJoules(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500">Preferred engagement length (days)</label>
                <input
                  type="number" min={1} value={engDays}
                  onChange={(e) => setEngDays(e.target.value ? Number(e.target.value) : "")}
                  placeholder={currentLevel === 0 ? "7 (typical for Level 0)" : "90"}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 placeholder-slate-600"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
              >
                {submitting ? "Publishing..." : "Publish Brief"}
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </MuseumShell>
  );
}
