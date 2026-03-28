import { useState } from "react";
import { Award, QrCode } from "lucide-react";

interface MedallionDisplayProps {
  size?: "sm" | "md" | "lg";
  earned: boolean;
  chainLength: number;
}

const SIZES = {
  sm: { container: "w-32 h-32", text: "text-[7px]", quote: "text-[6px]", icon: "w-8 h-8", badge: "text-[8px] px-1.5 py-0.5" },
  md: { container: "w-48 h-48", text: "text-[9px]", quote: "text-[7px]", icon: "w-12 h-12", badge: "text-xs px-2 py-1" },
  lg: { container: "w-64 h-64", text: "text-xs", quote: "text-[9px]", icon: "w-16 h-16", badge: "text-sm px-3 py-1.5" },
};

export function MedallionDisplay({ size = "md", earned, chainLength }: MedallionDisplayProps) {
  const [flipped, setFlipped] = useState(false);
  const s = SIZES[size];
  const remaining = Math.max(0, 13 - chainLength);

  return (
    <div
      className={`${s.container} perspective-[600px] cursor-pointer select-none`}
      onClick={() => earned && setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-label={earned ? "Flip medallion" : "Medallion locked"}
      onKeyDown={(e) => e.key === "Enter" && earned && setFlipped((f) => !f)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Side A — Ship's Wheel */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-full overflow-hidden">
          <div
            className={`w-full h-full rounded-full border-4 flex flex-col items-center justify-center p-3 text-center ${
              earned
                ? "border-amber-400 bg-gradient-to-br from-amber-900/80 via-amber-800/60 to-blue-900/70 shadow-[0_0_24px_rgba(251,191,36,0.35)]"
                : "border-slate-600 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 grayscale opacity-70"
            }`}
          >
            {/* Gear-shaped border via box-shadow */}
            <div className={`mb-1 ${earned ? "text-amber-300" : "text-slate-500"}`}>
              <svg viewBox="0 0 64 64" className={s.icon} fill="currentColor">
                {/* Ship's wheel simplified */}
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="32" cy="32" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <line
                    key={angle}
                    x1={32 + 8 * Math.cos((angle * Math.PI) / 180)}
                    y1={32 + 8 * Math.sin((angle * Math.PI) / 180)}
                    x2={32 + 28 * Math.cos((angle * Math.PI) / 180)}
                    y2={32 + 28 * Math.sin((angle * Math.PI) / 180)}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                ))}
                {/* Ship silhouette center */}
                <path d="M26 28 L32 20 L38 28 L36 36 L28 36 Z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            <p className={`${s.quote} italic leading-tight ${earned ? "text-amber-200/80" : "text-slate-500"}`}>
              "A ship in harbor is safe, but that is not what ships are built for."
            </p>
          </div>

          {/* Locked overlay */}
          {!earned && (
            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/40">
              <Award className={`${size === "lg" ? "w-8 h-8" : "w-6 h-6"} text-slate-400 mb-1`} />
              <span className={`${s.badge} text-slate-300 bg-slate-800/80 rounded-full`}>
                {remaining} more link{remaining !== 1 ? "s" : ""} to earn
              </span>
            </div>
          )}

          {earned && (
            <div className="absolute top-1 right-1">
              <span className="bg-amber-500 text-amber-950 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Earned
              </span>
            </div>
          )}
        </div>

        {/* Side B — ACME Screws + QR Code */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-full overflow-hidden">
          <div className="w-full h-full rounded-full border-4 border-amber-400 bg-gradient-to-br from-blue-950 via-slate-900 to-amber-950/50 flex flex-col items-center justify-center p-3 text-center shadow-[0_0_24px_rgba(251,191,36,0.35)]">
            {/* Crossed ACME screws */}
            <div className="relative mb-1">
              <svg viewBox="0 0 48 48" className={s.icon} fill="none" stroke="currentColor" strokeWidth="1.5">
                {/* Crossed screws */}
                <line x1="8" y1="8" x2="40" y2="40" strokeWidth="3" className="text-amber-400" stroke="currentColor" />
                <line x1="40" y1="8" x2="8" y2="40" strokeWidth="3" className="text-amber-400" stroke="currentColor" />
                {/* Screw heads */}
                <circle cx="8" cy="8" r="4" fill="currentColor" className="text-amber-500" />
                <circle cx="40" cy="8" r="4" fill="currentColor" className="text-amber-500" />
                <circle cx="8" cy="40" r="4" fill="currentColor" className="text-amber-500" />
                <circle cx="40" cy="40" r="4" fill="currentColor" className="text-amber-500" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <QrCode className={`${size === "lg" ? "w-6 h-6" : "w-4 h-4"} text-white/80`} />
              </div>
            </div>
            <p className={`${s.text} font-bold tracking-[0.15em] uppercase ${earned ? "text-amber-300" : "text-slate-400"}`}>
              The 2nd Second
            </p>
            <p className={`${s.quote} tracking-wider uppercase ${earned ? "text-amber-200/60" : "text-slate-500"}`}>
              Industrial Revolution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
