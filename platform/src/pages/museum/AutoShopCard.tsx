/**
 * AutoShopCard — Currency Vocabulary Trainer Deck Card
 * =====================================================
 * K421 / Bishop B102. TouchStone: B096-deck-card-auto-shop.
 *
 * Teaches the four-currency vocabulary (Credits, Marks, Joules, Backed Marks)
 * through the real-world story of Pudding #182: "The Shop That Fixed My Son's Car."
 *
 * Front: The scenario — son's car breaks down, shop fronts everything.
 * Back: Four-currency mapping table with expandable rows.
 * Mascot: Stag (9-point Northern) — steady, reliable strength.
 *
 * Route: /deck/auto-shop
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, ChevronDown, ExternalLink, RotateCcw } from "lucide-react";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { SummonMascot } from "@/components/museum/SummonMascot";

const CEPHAS_PUDDING_182 = "https://cephas.lianabanyan.com/pudding/182";

interface CurrencyRow {
  what: string;
  currency: string;
  explanation: string;
  detail: string;
  color: string;
}

const CURRENCY_ROWS: CurrencyRow[] = [
  {
    what: "Tow truck + parts",
    currency: "Credits",
    explanation: "Real cost, cash, 1:1",
    detail:
      "Credits are the simple part — dollars in, dollars out. The tow truck driver doesn't take IOUs. The parts house ships on payment. This is the layer everyone already understands.",
    color: "#94a3b8",
  },
  {
    what: "Labor discount + priority",
    currency: "Marks",
    explanation: "The differential — relationship value",
    detail:
      "The shop didn't charge full rate. That gap between retail labor and what they actually billed? That's Marks — the stored relationship value that makes the math friendlier for people who show up consistently.",
    color: "#a78bfa",
  },
  {
    what: "Nine months of IT work",
    currency: "Joules",
    explanation: "Surplus effort already banked",
    detail:
      "The Founder had done nine months of IT work for the shop owner — websites, email, inventory system. That labor was already spent. Joules represent effort-already-banked: work done before you need to call in the favor.",
    color: "#22c55e",
  },
  {
    what: 'Shop fronting on a phone call',
    currency: "Backed Marks",
    explanation: "Reservoir is real, trust is visible",
    detail:
      'One phone call: "Bring it in, we\'ll handle it." No invoice, no deposit, no hesitation. Backed Marks are Marks with a visible reservoir behind them — the trust isn\'t hypothetical, it\'s demonstrated by the willingness to front.',
    color: "#eab308",
  },
  {
    what: '"We\'ll work something out"',
    currency: "Time-patient settlement",
    explanation: "Clock is cooperative, not adversarial",
    detail:
      "No 30-day net, no collections agency, no interest. The settlement clock runs on cooperation, not threat. This is what happens when the relationship layer (Marks + Joules) is thick enough that the money layer (Credits) can be patient.",
    color: "#f472b6",
  },
];

function CurrencyRowItem({ row }: { row: CurrencyRow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left rounded-lg transition-colors"
      style={{
        background: expanded ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
        border: `1px solid ${expanded ? row.color + "33" : "rgba(255,255,255,0.06)"}`,
        padding: "0.5rem 0.625rem",
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
              style={{ background: row.color + "1a", color: row.color }}
            >
              {row.currency}
            </span>
            <span className="text-[11px] text-slate-300 truncate">{row.what}</span>
          </div>
          <p className="text-[10px] text-slate-400 italic">{row.explanation}</p>
        </div>
        <ChevronDown
          className="w-3 h-3 text-slate-500 shrink-0 mt-1 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p
              className="text-[10px] leading-relaxed mt-2 pt-2"
              style={{ color: "rgba(250,245,235,0.7)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {row.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

const AutoShopCard = () => {
  const [flipped, setFlipped] = useState(false);

  return (
    <DeckCardShell>
      <div className="flex flex-col h-full">
        {/* Goat mascot summon at top */}
        <SummonMascot
          mascotId="goat"
          topic="The four currencies in one real story"
          startClosed
          message={
            <>
              This is how it actually works. Not theory — one phone call, one
              broken car, and every currency in the system showed up on the same
              invoice. Tap each row to see why it matters.
            </>
          }
        />

        {/* Card content area */}
        <div className="flex-1 mt-3" style={{ perspective: "1000px" }}>
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* ══════ FRONT ══════ */}
            <div
              className="absolute inset-0 flex flex-col rounded-xl p-4"
              style={{
                backfaceVisibility: "hidden",
                background: "rgba(10,22,40,0.8)",
                border: "1px solid rgba(56,161,105,0.15)",
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Car className="w-10 h-10 mb-3" style={{ color: "#d4a853" }} />
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
                >
                  The Shop That Fixed My Son's Car
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[260px] mb-4">
                  Your son's car breaks down 300 miles from home. You make one
                  phone call. The shop says "bring it in, we'll handle it." No
                  invoice. No deposit. No hesitation.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px] mb-6">
                  Five things happened on that invoice that most economics
                  textbooks would need five chapters to explain. This card does
                  it in five rows.
                </p>
                <button
                  onClick={() => setFlipped(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(56,161,105,0.2)",
                    border: "1px solid rgba(56,161,105,0.4)",
                    color: "#4ade80",
                  }}
                >
                  See the Currencies →
                </button>
              </div>

              <p
                className="text-[9px] text-center italic"
                style={{ color: "rgba(250,245,235,0.25)" }}
              >
                Pudding #182 — Currency Vocabulary Trainer
              </p>
            </div>

            {/* ══════ BACK ══════ */}
            <div
              className="absolute inset-0 flex flex-col rounded-xl overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "rgba(10,22,40,0.8)",
                border: "1px solid rgba(56,161,105,0.15)",
              }}
            >
              <div className="px-3 pt-3 pb-2 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(56,161,105,0.1)" }}
              >
                <h4
                  className="text-xs font-bold tracking-wide"
                  style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
                >
                  FOUR-CURRENCY MAP
                </h4>
                <button
                  onClick={() => setFlipped(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  title="Flip back"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                {CURRENCY_ROWS.map((row) => (
                  <CurrencyRowItem key={row.currency} row={row} />
                ))}
              </div>

              {/* Footer link */}
              <a
                href={CEPHAS_PUDDING_182}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium transition-colors hover:opacity-80"
                style={{
                  color: "#d4a853",
                  borderTop: "1px solid rgba(56,161,105,0.1)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                See the full story <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </DeckCardShell>
  );
};

export default AutoShopCard;
