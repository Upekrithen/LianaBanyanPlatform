/**
 * TripleDoublePanel — The Triple Double Motivation Panel
 * ========================================================
 * Innovation #2235 (CJ candidate). K403 / Bishop B096.
 *
 * Five sub-panels in one component:
 *   1. Triple Double Ladder (4 rungs, progress bars, member-pickable base)
 *   2. The Choosing — daily commitment ritual (Stag summon)
 *   3. Can of False Enthusiasm — hard-day ritual (Sheepdog summon)
 *   4. Swing for the Fences — attempts counter (only goes up)
 *   5. Rung Stamps — milestone badges near ladder
 *
 * Plus the Stag mascot summon at the top explaining the ladder.
 *
 * Route: rendered on /helm inside HelmPage above the card dashboard.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Flame,
  Coffee,
  Target,
  Award,
  Settings,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { SummonMascot } from "./SummonMascot";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const DAYS_PER_WEEK = 5;
const WEEKS_PER_YEAR = 48;
const RUNG_MULTIPLIERS = [1, 2, 4, 8] as const;

const RUNG_LABELS: Record<number, string> = {
  0: "Base — concretely imaginable",
  1: "First Double — a real living",
  2: "Second Double — choices & savings",
  3: "The Triple Double — capability to act",
};

const STAG_MESSAGES = [
  "Good. The rungs are waiting. I\u2019m here with you.",
  "That\u2019s the only move that matters today. The rest is just work.",
  "You chose. Nobody made you. That is the whole game.",
  "The capability is coming. The climbing is yours.",
  "I\u2019ll be here tomorrow too. So will you.",
] as const;

const SHEEPDOG_MESSAGES = [
  "You don\u2019t have to feel it to do it. I\u2019m with you. Let\u2019s go.",
  "Nothing worth having was built on days somebody felt like building it.",
  "Who motivates the motivator? You do. Right now.",
  "I\u2019m here every day whether you feel like it or not. Glad you showed up.",
  "The can is empty? Doesn\u2019t matter. The choice is still yours.",
] as const;

function computeAnnual(daily: number): number {
  return daily * DAYS_PER_WEEK * WEEKS_PER_YEAR;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */

function useTripleDoubleConfig(userId: string | undefined) {
  const [baseDaily, setBaseDaily] = useState(100);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("triple_double_config")
      .select("base_daily")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.base_daily) setBaseDaily(Number(data.base_daily));
        setLoaded(true);
      });
  }, [userId]);

  const updateBase = useCallback(
    async (newBase: number) => {
      if (!userId) return;
      setBaseDaily(newBase);
      await supabase.from("triple_double_config").upsert(
        { user_id: userId, base_daily: newBase, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    },
    [userId],
  );

  return { baseDaily, loaded, updateBase };
}

function useChoosingLog(userId: string | undefined) {
  const [choiceStreak, setChoiceStreak] = useState(0);
  const [canCount, setCanCount] = useState(0);
  const [todayChosen, setTodayChosen] = useState(false);
  const [todayCanned, setTodayCanned] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadStats();
  }, [userId]);

  async function loadStats() {
    if (!userId) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from("choosing_log")
      .select("intent_type, logged_at")
      .eq("user_id", userId)
      .gte("logged_at", thirtyDaysAgo.toISOString())
      .order("logged_at", { ascending: false });

    if (!data) return;

    const today = new Date().toISOString().slice(0, 10);
    setTodayChosen(data.some((r) => r.intent_type === "choice" && r.logged_at.slice(0, 10) === today));
    setTodayCanned(data.some((r) => r.intent_type === "can_of_false_enthusiasm" && r.logged_at.slice(0, 10) === today));

    // Streak: consecutive days with a 'choice' entry
    const choiceDates = [...new Set(
      data.filter((r) => r.intent_type === "choice").map((r) => r.logged_at.slice(0, 10)),
    )].sort().reverse();

    let streak = 0;
    const checkDate = new Date();
    for (const dateStr of choiceDates) {
      const expected = checkDate.toISOString().slice(0, 10);
      if (dateStr === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setChoiceStreak(streak);

    // Can count this month
    const monthStr = today.slice(0, 7);
    setCanCount(
      data.filter((r) => r.intent_type === "can_of_false_enthusiasm" && r.logged_at.slice(0, 7) === monthStr).length,
    );
  }

  const logChoice = useCallback(async () => {
    if (!userId || todayChosen) return null;
    await supabase.from("choosing_log").insert({ user_id: userId, intent_type: "choice" });
    setTodayChosen(true);
    setChoiceStreak((s) => s + 1);
    return pickRandom(STAG_MESSAGES);
  }, [userId, todayChosen]);

  const logCan = useCallback(async () => {
    if (!userId) return null;
    await supabase.from("choosing_log").insert({ user_id: userId, intent_type: "can_of_false_enthusiasm" });
    setTodayCanned(true);
    setCanCount((c) => c + 1);
    return pickRandom(SHEEPDOG_MESSAGES);
  }, [userId]);

  return { choiceStreak, canCount, todayChosen, todayCanned, logChoice, logCan };
}

function useRungStamps(userId: string | undefined) {
  const [stamps, setStamps] = useState<{ rung_level: number; achieved_at: string }[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("rung_stamps")
      .select("rung_level, achieved_at")
      .eq("user_id", userId)
      .order("rung_level", { ascending: true })
      .then(({ data }) => {
        if (data) setStamps(data);
      });
  }, [userId]);

  return stamps;
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function BasePickerModal({
  currentBase,
  onSave,
  onClose,
}: {
  currentBase: number;
  onSave: (v: number) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState(currentBase);
  const presets = [50, 100, 150, 200, 300, 500];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl p-6 max-w-sm w-full mx-4"
        style={{ background: "#0d1b2a", border: "1px solid rgba(56,161,105,0.3)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: "#faf5eb" }}>
            Pick Your Daily Base
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Pick what you can actually imagine doing. The math works either way.
          If the top rung feels impossible, you're on the right ladder.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setVal(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                val === p
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
              }`}
            >
              ${p}/day
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">$</span>
          <input
            type="number"
            min={1}
            max={10000}
            value={val}
            onChange={(e) => setVal(Math.max(1, Number(e.target.value)))}
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
          <span className="text-xs text-slate-500">/day</span>
        </div>

        <div className="text-xs text-slate-500 mb-4">
          Rung 3 annual: <span className="text-emerald-400 font-medium">
            ${(val * 8 * DAYS_PER_WEEK * WEEKS_PER_YEAR).toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => { onSave(val); onClose(); }}
          className="w-full py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          Set Base
        </button>
      </motion.div>
    </motion.div>
  );
}

function MascotFlash({
  message,
  mascotName,
  onDismiss,
}: {
  message: string;
  mascotName: string;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl p-4 mt-3"
      style={{ background: "#0d1b2a", border: "1px solid rgba(56,161,105,0.3)" }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{mascotName === "Stag" ? "\uD83E\uDD8C" : "\uD83D\uDC15"}</div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-emerald-400 mb-1">{mascotName}</p>
          <p className="text-sm text-slate-300 italic leading-relaxed">"{message}"</p>
        </div>
        <button onClick={onDismiss} className="p-1 text-slate-500 hover:text-slate-300">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function TripleDoublePanel() {
  const { user } = useAuth();
  const userId = user?.id;

  const { baseDaily, loaded, updateBase } = useTripleDoubleConfig(userId);
  const { choiceStreak, canCount, todayChosen, todayCanned, logChoice, logCan } = useChoosingLog(userId);
  const stamps = useRungStamps(userId);

  const [showBasePicker, setShowBasePicker] = useState(false);
  const [flashMessage, setFlashMessage] = useState<{ text: string; mascot: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const rungs = useMemo(
    () =>
      RUNG_MULTIPLIERS.map((mult, i) => ({
        rung: i,
        daily: baseDaily * mult,
        annual: computeAnnual(baseDaily * mult),
        label: RUNG_LABELS[i],
        hasStamp: stamps.some((s) => s.rung_level === i),
      })),
    [baseDaily, stamps],
  );

  const trailingAvg = 0; // Client-side placeholder — real data from transaction_ledger deferred to edge fn

  const handleChoose = useCallback(async () => {
    const msg = await logChoice();
    if (msg) setFlashMessage({ text: msg, mascot: "Stag" });
  }, [logChoice]);

  const handleCan = useCallback(async () => {
    const msg = await logCan();
    if (msg) setFlashMessage({ text: msg, mascot: "Sheepdog" });
  }, [logCan]);

  if (!loaded && userId) {
    return (
      <div className="rounded-xl p-6 mb-6" style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-700" />
          <div className="h-3 w-48 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {/* ── Header with collapse toggle ── */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-left group"
        >
          <Mountain className="w-4 h-4 text-emerald-500" />
          <h2
            className="text-sm font-bold tracking-wide group-hover:text-emerald-400 transition-colors"
            style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
          >
            THE TRIPLE DOUBLE
          </h2>
          {collapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
        <button
          onClick={() => setShowBasePicker(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
          title="Change daily base"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-3"
          >
            {/* ── Stag Mascot Summon ── */}
            <SummonMascot
              mascotId="stag"
              topic="What the Triple Double actually is"
              startClosed
              message={
                <>
                  This is a ladder, not a gap. Pick your base &mdash; whatever is honest for today.
                  I&rsquo;ll double it three times. Rung 0, 1, 2, 3. The top is{" "}
                  <strong>${computeAnnual(baseDaily * 8).toLocaleString()}</strong> per year, and
                  that isn&rsquo;t about being rich. It&rsquo;s about being{" "}
                  <em>capable</em>. The rung where ambition stops being cosplay and starts having
                  consequences.
                </>
              }
              helperMessage={
                <>
                  The Founder picked $100/day as his base. Yours can be different. $50 is honest for
                  some, $200 for others. The math works either way. Pick what you can actually imagine
                  doing, and then double it in your head. If the top rung feels impossible, you&rsquo;re
                  on the right ladder.
                </>
              }
            />

            {/* ══════ PANEL 2 + 3: The Choosing & Can of False Enthusiasm ══════ */}
            <div className="flex gap-2">
              {/* The Choosing */}
              <button
                onClick={handleChoose}
                disabled={todayChosen}
                className={`flex-1 rounded-xl py-3 px-4 text-center transition-all ${
                  todayChosen
                    ? "bg-emerald-900/20 border border-emerald-500/30 cursor-default"
                    : "bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 hover:border-emerald-400/60 active:scale-[0.98]"
                }`}
              >
                <div className="text-sm font-bold tracking-wide" style={{ color: todayChosen ? "#6ee7b7" : "#faf5eb" }}>
                  {todayChosen ? "CHOSEN" : "I CHOOSE TODAY."}
                </div>
                {choiceStreak > 0 && (
                  <div className="text-[10px] text-emerald-400/70 mt-1">
                    <Flame className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />
                    {choiceStreak} day{choiceStreak !== 1 ? "s" : ""} in a row
                  </div>
                )}
              </button>

              {/* Can of False Enthusiasm */}
              <button
                onClick={handleCan}
                disabled={todayCanned}
                className={`rounded-xl py-3 px-4 text-center transition-all ${
                  todayCanned
                    ? "bg-amber-900/20 border border-amber-500/30 cursor-default"
                    : "bg-amber-600/10 border border-amber-500/30 hover:bg-amber-600/20 hover:border-amber-400/50 active:scale-[0.98]"
                }`}
                style={{ minWidth: "120px" }}
              >
                <Coffee className="w-4 h-4 mx-auto mb-1" style={{ color: todayCanned ? "#fbbf24" : "#d97706" }} />
                <div className="text-[11px] font-semibold" style={{ color: todayCanned ? "#fbbf24" : "#faf5eb" }}>
                  {todayCanned ? "OPENED" : "OPEN THE CAN."}
                </div>
                {canCount > 0 && (
                  <div className="text-[9px] text-amber-400/60 mt-0.5">
                    {canCount} hard day{canCount !== 1 ? "s" : ""} this month
                  </div>
                )}
              </button>
            </div>

            {/* Mascot flash message */}
            <AnimatePresence>
              {flashMessage && (
                <MascotFlash
                  message={flashMessage.text}
                  mascotName={flashMessage.mascot}
                  onDismiss={() => setFlashMessage(null)}
                />
              )}
            </AnimatePresence>

            {/* ══════ PANEL 1: The Triple Double Ladder ══════ */}
            <div
              className="rounded-xl p-4"
              style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}
            >
              <div className="space-y-2.5">
                {[...rungs].reverse().map((r) => {
                  const progress = trailingAvg > 0 ? Math.min(100, (trailingAvg / r.daily) * 100) : 0;
                  return (
                    <div key={r.rung} className="flex items-center gap-3">
                      {/* Rung number + stamp */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: "28px" }}>
                        {r.hasStamp ? (
                          <Award className="w-4 h-4 text-amber-400" />
                        ) : (
                          <span className="text-xs font-bold text-slate-500">{r.rung}</span>
                        )}
                      </div>

                      {/* Bar + labels */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <span className="text-[11px] font-medium text-slate-300">
                            ${r.daily.toLocaleString()}/day
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ${r.annual.toLocaleString()}/yr
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background:
                                r.rung === 3
                                  ? "linear-gradient(90deg, #22c55e, #eab308)"
                                  : r.rung === 2
                                  ? "#22c55e"
                                  : r.rung === 1
                                  ? "#3b82f6"
                                  : "#6b7280",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <div className="text-[9px] text-slate-600 mt-0.5">{r.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer quote */}
              <p className="text-[10px] text-slate-600 italic mt-3 text-center leading-relaxed">
                "The top rung is ${computeAnnual(baseDaily * 8).toLocaleString()}. That isn&rsquo;t
                rich. That&rsquo;s the number where ambition stops being cosplay and starts having
                consequences."
              </p>
            </div>

            {/* ══════ PANEL 4: Swing for the Fences Counter ══════ */}
            <div
              className="rounded-xl p-4"
              style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}
            >
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <button
                    className="text-xs font-bold tracking-wide hover:text-emerald-400 transition-colors text-left"
                    style={{ color: "#faf5eb" }}
                    title="Opens Pudding #24"
                  >
                    NO EFFORT IS WASTED
                  </button>

                  {/* Large attempt count */}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-3xl font-bold tabular-nums" style={{ color: "#faf5eb" }}>
                      {choiceStreak > 0 ? choiceStreak : "0"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      attempts this month
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 italic mt-1.5">
                    "When you don&rsquo;t get what you want, you get experience." &mdash; Calvin&rsquo;s dad
                  </p>
                  <p className="text-[9px] text-slate-600 mt-1">
                    Swing for the Fences. Babe Ruth: 714 home runs, 1,330 strikeouts.
                  </p>
                </div>
              </div>
            </div>

            {/* ══════ PANEL 5: Rung Stamps ══════ */}
            {stamps.length > 0 && (
              <div className="flex gap-2 px-1">
                {stamps.map((s) => (
                  <div
                    key={s.rung_level}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                    style={{
                      background: "rgba(234,179,8,0.1)",
                      border: "1px solid rgba(234,179,8,0.3)",
                    }}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-medium text-amber-300">
                      Rung {s.rung_level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Base picker modal */}
      <AnimatePresence>
        {showBasePicker && (
          <BasePickerModal
            currentBase={baseDaily}
            onSave={updateBase}
            onClose={() => setShowBasePicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TripleDoublePanel;
