/**
 * LetterCreditStakePanel — Credit-staking for outreach letters
 * =============================================================
 * BP077 Scope 11 — Pedestal 5K/20K mechanism applied to Glass Door letters.
 *
 * Rules (mirroring Pedestal funding):
 *   - Max 5,000 Credits per member per letter
 *   - 20,000 Credits total + at least 4 unique funders = community-elevated
 *   - All transactions recorded in the Immutable Ledger (PEDESTAL_FUNDING section)
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLetterStakes } from "@/hooks/useOutreachLetters";
import { CheckCircle2, TrendingUp, Users, Coins } from "lucide-react";

const MAX_PER_PERSON = 5_000;
const PUBLIC_THRESHOLD = 20_000;
const MIN_FUNDERS = 4;

export function LetterCreditStakePanel({
  letterId,
  slug,
}: {
  letterId: string;
  slug: string;
}) {
  const { user } = useAuth();
  const { stakeTotal, funderCount, memberTotal, wentPublicAt, loading, stakeCredits } =
    useLetterStakes(letterId);

  const [amount, setAmount] = useState<number>(100);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingPersonal = MAX_PER_PERSON - memberTotal;
  const percentToPublic = Math.min(100, Math.round((stakeTotal / PUBLIC_THRESHOLD) * 100));
  const isElevated = wentPublicAt !== null;
  const maxStake = Math.min(remainingPersonal, MAX_PER_PERSON);

  const handleStake = async () => {
    if (!user || amount <= 0 || amount > maxStake) return;
    setSubmitting(true);
    setError(null);
    try {
      await stakeCredits(amount);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Stake failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div
        className="rounded-lg p-4 text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm text-slate-400">Sign in to stake Credits on this letter.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: "rgba(212,168,83,0.12)",
        background: "linear-gradient(180deg, rgba(10,22,40,0.95) 0%, rgba(13,31,60,0.95) 100%)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" style={{ color: "#d4a853" }} />
          <h4
            className="text-sm font-semibold"
            style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
          >
            Stake Credits
          </h4>
        </div>
        <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: "#94a3b8" }}>
          Stake Credits to elevate this letter to community-public status. Once 20,000 Credits
          from at least 4 members are staked, the letter is permanently elevated by the cooperative.
        </p>
      </div>

      {/* Community-elevated banner */}
      {isElevated && (
        <div
          className="mx-4 mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)" }}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#4ade80" }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#4ade80" }}>
              PUBLIC — Elevated by the Community
            </p>
            <p className="text-[10px] text-slate-500">
              This letter reached 20,000 Credits from the cooperative.
            </p>
          </div>
        </div>
      )}

      <div className="px-4 py-3 space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(212,168,83,0.2)", borderTopColor: "#d4a853" }}
            />
            <span className="text-xs text-slate-500">Loading stake data...</span>
          </div>
        ) : (
          <>
            {/* Progress bar: total vs 20K threshold */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <TrendingUp className="w-3 h-3" />
                  Community stake
                </span>
                <span className="text-[11px]" style={{ color: "#d4a853" }}>
                  {stakeTotal.toLocaleString()} / {PUBLIC_THRESHOLD.toLocaleString()} Credits
                </span>
              </div>
              <div
                className="w-full rounded-full h-2"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentToPublic}%`,
                    background: isElevated
                      ? "linear-gradient(90deg, #4ade80, #22c55e)"
                      : "linear-gradient(90deg, #d4a853, #f59e0b)",
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5">
                {percentToPublic}% of threshold reached
              </p>
            </div>

            {/* Funder count */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Users className="w-3 h-3" />
                Unique funders
              </span>
              <span
                className="text-[11px]"
                style={{ color: funderCount >= MIN_FUNDERS ? "#4ade80" : "#94a3b8" }}
              >
                {funderCount} / {MIN_FUNDERS} min
              </span>
            </div>

            {/* Member's own stake */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Your stake</span>
              <span className="text-[11px]" style={{ color: "#faf5eb" }}>
                {memberTotal.toLocaleString()} / {MAX_PER_PERSON.toLocaleString()} Credits
              </span>
            </div>

            {/* Stake input */}
            {remainingPersonal > 0 ? (
              <div className="space-y-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <label className="text-[11px] text-slate-400">
                  Amount to stake{" "}
                  <span className="text-slate-600">
                    (1–{remainingPersonal.toLocaleString()} Credits remaining)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={maxStake}
                    value={amount}
                    onChange={(e) =>
                      setAmount(Math.min(maxStake, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-28 p-2 rounded text-sm text-right bg-transparent border"
                    style={{ borderColor: "rgba(255,255,255,0.12)", color: "#e2e8f0" }}
                  />
                  <span className="text-xs text-slate-500">Credits</span>
                  <div className="flex gap-1 ml-auto">
                    {[100, 500, 1000].map((preset) =>
                      preset <= remainingPersonal ? (
                        <button
                          key={preset}
                          onClick={() => setAmount(preset)}
                          className="px-2 py-1 rounded text-[10px] transition-colors"
                          style={{
                            background:
                              amount === preset
                                ? "rgba(212,168,83,0.15)"
                                : "rgba(255,255,255,0.04)",
                            border: `1px solid ${amount === preset ? "rgba(212,168,83,0.3)" : "rgba(255,255,255,0.07)"}`,
                            color: amount === preset ? "#d4a853" : "#64748b",
                          }}
                        >
                          {preset.toLocaleString()}
                        </button>
                      ) : null,
                    )}
                    <button
                      onClick={() => setAmount(remainingPersonal)}
                      className="px-2 py-1 rounded text-[10px] transition-colors"
                      style={{
                        background:
                          amount === remainingPersonal
                            ? "rgba(212,168,83,0.15)"
                            : "rgba(255,255,255,0.04)",
                        border: `1px solid ${amount === remainingPersonal ? "rgba(212,168,83,0.3)" : "rgba(255,255,255,0.07)"}`,
                        color: amount === remainingPersonal ? "#d4a853" : "#64748b",
                      }}
                    >
                      Max
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-[11px]" style={{ color: "#ef4444" }}>
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleStake}
                    disabled={submitting || amount <= 0 || amount > maxStake}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                    style={{
                      background: "rgba(212,168,83,0.15)",
                      color: "#d4a853",
                      border: "1px solid rgba(212,168,83,0.3)",
                    }}
                  >
                    {submitting
                      ? "Staking..."
                      : `Stake ${amount.toLocaleString()} Credits`}
                  </button>
                  {submitted && (
                    <span className="text-xs flex items-center gap-1" style={{ color: "#4ade80" }}>
                      <CheckCircle2 className="w-3 h-3" /> Staked
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="rounded-lg px-3 py-2 text-center"
                style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.12)" }}
              >
                <p className="text-[11px]" style={{ color: "#d4a853" }}>
                  You have staked the maximum 5,000 Credits for this letter.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer: ledger transparency note */}
      <div
        className="px-4 py-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <p className="text-[10px] text-slate-700">
          Stakes are recorded in the Immutable Ledger (Pedestal Funding section) ·{" "}
          <span style={{ color: "#475569" }}>BP077 · slug: {slug}</span>
        </p>
      </div>
    </div>
  );
}
