/**
 * RecipeSlot — UI showing a card combination recipe with NotCents shapes.
 *
 * NotCents shapes identify currency type:
 *   ○ Circle  = Credit (cyan)
 *   □ Square  = Mark (purple)
 *   △ Triangle = Joule (gold)
 *
 * A recipe shows N required card slots, each with a shape indicating
 * which currency's keys are needed. Filled slots glow, empty ones pulse.
 * When all slots are filled, the recipe "unlocks" with a result description.
 */
import { motion, AnimatePresence } from "framer-motion";

interface RecipeCardSlot {
  cardType: string;
  minLevel?: number;
  /** Which currency: credit/mark/joule */
  currency: "credit" | "mark" | "joule";
  /** Is this slot filled? */
  filled?: boolean;
  /** Name of the card filling this slot */
  cardName?: string;
}

interface RecipeSlotProps {
  recipeName: string;
  description?: string;
  slots: RecipeCardSlot[];
  resultType: string;
  resultDescription: string;
  /** All slots filled? */
  complete?: boolean;
}

const CURRENCY_CONFIG = {
  credit: { shape: "circle", color: "#06b6d4", label: "Credit" },
  mark: { shape: "square", color: "#8b5cf6", label: "Mark" },
  joule: { shape: "triangle", color: "#eab308", label: "Joule" },
} as const;

function NotCentsShape({ currency, size = 24, filled = false }: { currency: "credit" | "mark" | "joule"; size?: number; filled?: boolean }) {
  const config = CURRENCY_CONFIG[currency];

  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      {config.shape === "circle" && (
        <circle
          cx="20" cy="20" r="14"
          fill={filled ? `${config.color}30` : "none"}
          stroke={config.color}
          strokeWidth="2"
          opacity={filled ? 1 : 0.4}
          style={{ transition: "all 0.3s ease" }}
        />
      )}
      {config.shape === "square" && (
        <rect
          x="6" y="6" width="28" height="28" rx="3"
          fill={filled ? `${config.color}30` : "none"}
          stroke={config.color}
          strokeWidth="2"
          opacity={filled ? 1 : 0.4}
          style={{ transition: "all 0.3s ease" }}
        />
      )}
      {config.shape === "triangle" && (
        <polygon
          points="20,4 36,36 4,36"
          fill={filled ? `${config.color}30` : "none"}
          stroke={config.color}
          strokeWidth="2"
          opacity={filled ? 1 : 0.4}
          style={{ transition: "all 0.3s ease" }}
        />
      )}
    </svg>
  );
}

export function RecipeSlot({ recipeName, description, slots, resultType, resultDescription, complete = false }: RecipeSlotProps) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: complete ? "rgba(56,161,105,0.06)" : "#0a1628",
        border: `1px solid ${complete ? "rgba(56,161,105,0.3)" : "rgba(100,116,139,0.2)"}`,
        transition: "all 0.3s ease",
      }}
    >
      {/* Recipe name */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm" style={{ color: complete ? "#38a169" : "rgba(250,245,235,0.5)" }}>
          {complete ? "✨" : "🔮"}
        </span>
        <h4
          className="text-sm font-bold"
          style={{ fontFamily: "'Crimson Pro', Georgia, serif", color: complete ? "#38a169" : "#faf5eb" }}
        >
          {recipeName}
        </h4>
      </div>

      {description && (
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{description}</p>
      )}

      {/* Card slots with NotCents shapes */}
      <div className="flex items-center gap-3 mb-3">
        {slots.map((slot, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              animate={slot.filled ? {} : { scale: [1, 1.1, 1] }}
              transition={slot.filled ? {} : { duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <NotCentsShape currency={slot.currency} filled={slot.filled} size={32} />
            </motion.div>
            <span
              className="text-[8px] text-center max-w-[60px] truncate"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: slot.filled ? CURRENCY_CONFIG[slot.currency].color : "rgba(148,163,184,0.4)",
              }}
            >
              {slot.filled ? slot.cardName || slot.cardType : slot.cardType}
            </span>
            {slot.minLevel && slot.minLevel > 1 && (
              <span className="text-[7px] text-slate-600">Lv.{slot.minLevel}+</span>
            )}
            {/* Connector line between slots */}
            {i < slots.length - 1 && (
              <span className="absolute text-slate-700 text-xs" style={{ left: `${((i + 1) / slots.length) * 80 + 10}%`, top: "45px" }}>+</span>
            )}
          </div>
        ))}

        {/* Equals / result */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700/50">
          <span className="text-slate-600">=</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg">{complete ? "🎉" : "❓"}</span>
            <span
              className="text-[8px]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: complete ? "#38a169" : "rgba(148,163,184,0.4)",
              }}
            >
              {resultType}
            </span>
          </div>
        </div>
      </div>

      {/* Result description — shown when complete */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-2.5 rounded-lg mt-1"
              style={{ background: "rgba(56,161,105,0.08)", border: "1px solid rgba(56,161,105,0.2)" }}
            >
              <p className="text-xs text-emerald-300/80 leading-relaxed">{resultDescription}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Standalone NotCents shape legend */
export function NotCentsLegend() {
  return (
    <div className="flex items-center gap-4 justify-center">
      {(Object.entries(CURRENCY_CONFIG) as Array<[keyof typeof CURRENCY_CONFIG, typeof CURRENCY_CONFIG[keyof typeof CURRENCY_CONFIG]]>).map(([key, config]) => (
        <div key={key} className="flex items-center gap-1.5">
          <NotCentsShape currency={key} filled size={16} />
          <span className="text-[10px] text-slate-500">{config.label}</span>
        </div>
      ))}
    </div>
  );
}

export default RecipeSlot;
