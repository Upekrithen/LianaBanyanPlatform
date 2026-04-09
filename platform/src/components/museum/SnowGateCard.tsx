/**
 * SnowGateCard — The Museum entrance gate card with Founder portrait.
 * A special Deck Card: the first thing visitors see before the HEOHO card.
 * Frosted glass aesthetic, Founder silhouette, "Welcome" text.
 *
 * Named "Snow Gate" because it's the gate you walk through in the snow
 * before entering the warm Museum. Narnia reference meets platform onboarding.
 */
import { motion } from "framer-motion";

interface SnowGateCardProps {
  onEnter?: () => void;
}

const hexBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function SnowGateCard({ onEnter }: SnowGateCardProps) {
  return (
    <motion.div
      className="w-full max-w-sm mx-auto cursor-pointer"
      style={{ perspective: "1000px" }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onEnter}
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(180deg, #0d1f2d 0%, #0a1628 40%, #0f1a2e 100%)",
          aspectRatio: "5/7",
          border: "1px solid rgba(148, 163, 184, 0.15)",
        }}
      >
        {/* Hex pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: hexBg, backgroundRepeat: "repeat", opacity: 0.02 }} />

        {/* Frost/snow overlay at top */}
        <div
          className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(226,232,240,0.08) 0%, transparent 100%)",
          }}
        />

        {/* Snowflake particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${Math.random() * 60}%`,
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "rgba(226,232,240,0.3)",
            }}
            animate={{
              y: [0, 20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-8 pb-6 h-full">
          {/* Gate arch */}
          <svg viewBox="0 0 200 120" className="w-48 mb-4" style={{ opacity: 0.6 }}>
            <path
              d="M20 120 L20 50 Q20 10, 100 10 Q180 10, 180 50 L180 120"
              fill="none"
              stroke="rgba(148,163,184,0.3)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Keystone */}
            <polygon points="95,8 105,8 103,16 97,16" fill="rgba(214,158,46,0.5)" />
            {/* Inner arch glow */}
            <path
              d="M40 120 L40 55 Q40 25, 100 25 Q160 25, 160 55 L160 120"
              fill="rgba(56,161,105,0.03)"
              stroke="rgba(56,161,105,0.15)"
              strokeWidth="1"
            />
          </svg>

          {/* Founder portrait placeholder */}
          <div
            className="w-20 h-20 rounded-full mb-4 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(56,161,105,0.15), rgba(214,158,46,0.15))",
              border: "2px solid rgba(148,163,184,0.2)",
            }}
          >
            <img
              src="/images/founder-portrait.png"
              alt="The Founder"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                // Fallback silhouette if no portrait image
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<span style="font-size:2rem;opacity:0.4">👤</span>';
              }}
            />
          </div>

          {/* Welcome text */}
          <h2
            className="mb-1"
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "clamp(1.2rem, 5vw, 1.6rem)",
              fontWeight: 700,
              color: "rgba(250,245,235,0.85)",
            }}
          >
            Welcome to the Museum
          </h2>

          <p
            className="mb-4"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(148,163,184,0.5)",
            }}
          >
            Est. 2025 &middot; Liana Banyan
          </p>

          <div className="flex-1" />

          {/* Quote */}
          <p
            className="italic mb-6 max-w-xs"
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "0.85rem",
              color: "rgba(250,245,235,0.5)",
              lineHeight: 1.6,
            }}
          >
            &ldquo;I have eight children. This is for all of them.&rdquo;
          </p>

          {/* Enter prompt */}
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs text-slate-500">Tap to enter</span>
            <span className="text-slate-600">↓</span>
          </motion.div>
        </div>

        {/* LB corners */}
        <div className="absolute top-2 left-2 text-[7px] text-emerald-500/20 font-mono font-bold">LB</div>
        <div className="absolute top-2 right-2 text-[7px] text-emerald-500/20 font-mono font-bold" style={{ transform: "rotate(90deg)" }}>LB</div>
        <div className="absolute bottom-2 left-2 text-[7px] text-emerald-500/20 font-mono font-bold" style={{ transform: "rotate(270deg)" }}>LB</div>
        <div className="absolute bottom-2 right-2 text-[7px] text-emerald-500/20 font-mono font-bold" style={{ transform: "rotate(180deg)" }}>LB</div>
      </div>
    </motion.div>
  );
}

export default SnowGateCard;
