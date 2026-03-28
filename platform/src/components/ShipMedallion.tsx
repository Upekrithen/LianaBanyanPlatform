/**
 * ShipMedallion — Reusable 3D-flipping medallion using Founder-provided PNGs.
 * Side A: Ship + gear + quote. Side B: ACME screws + QR + "THE 2ND SECOND".
 * Used in: NetworkLanding, ChainDashboard, SecondSecondLanding,
 *          WelcomeGatePage (MedallionScan), HelmPage (Medallions Earned).
 */

import { useState, useEffect, useCallback } from "react";
import { Award } from "lucide-react";

const SIDE_A = "/images/medallion-ship-side-a.png";
const SIDE_B = "/images/medallion-2nd-second-side-b.png";

interface ShipMedallionProps {
  size?: "sm" | "md" | "lg" | "hero";
  earned?: boolean;
  flipEnabled?: boolean;
  autoFlip?: boolean;
  className?: string;
  /** Number of chain links remaining (shown on locked overlay) */
  remainingLinks?: number;
}

const SIZES: Record<string, { px: number; cls: string }> = {
  sm: { px: 120, cls: "w-[120px] h-[120px]" },
  md: { px: 192, cls: "w-48 h-48" },
  lg: { px: 256, cls: "w-64 h-64" },
  hero: { px: 300, cls: "w-[300px] h-[300px]" },
};

export function ShipMedallion({
  size = "md",
  earned = true,
  flipEnabled,
  autoFlip = false,
  className = "",
  remainingLinks,
}: ShipMedallionProps) {
  const canFlip = flipEnabled ?? earned;
  const [flipped, setFlipped] = useState(false);
  const s = SIZES[size];

  useEffect(() => {
    if (!autoFlip) return;
    const t1 = setTimeout(() => setFlipped(true), 800);
    const t2 = setTimeout(() => setFlipped(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [autoFlip]);

  const handleClick = useCallback(() => {
    if (canFlip) setFlipped((f) => !f);
  }, [canFlip]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && canFlip) setFlipped((f) => !f);
    },
    [canFlip],
  );

  const grayFilter = !earned ? "grayscale(100%) opacity(0.4)" : undefined;
  const glowShadow = earned
    ? "0 0 24px rgba(251,191,36,0.35), 0 0 48px rgba(251,191,36,0.15)"
    : undefined;

  return (
    <div
      className={`${s.cls} select-none ${canFlip ? "cursor-pointer" : "cursor-default"} ${className}`}
      style={{ perspective: 600 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={canFlip ? "Flip medallion" : "Medallion locked"}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Side A */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            filter: grayFilter,
            boxShadow: glowShadow,
          }}
        >
          <img
            src={SIDE_A}
            alt="Ship Medallion — Side A"
            className="w-full h-full object-cover rounded-full"
            draggable={false}
          />
          {earned && (
            <div className="absolute inset-0 rounded-full border-4 border-amber-400 pointer-events-none" />
          )}
        </div>

        {/* Locked overlay */}
        {!earned && (
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/40 z-10"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Award className={`${size === "hero" || size === "lg" ? "w-8 h-8" : "w-6 h-6"} text-slate-400 mb-1`} />
            {remainingLinks != null && remainingLinks > 0 && (
              <span className="text-xs text-slate-300 bg-slate-800/80 rounded-full px-2 py-0.5">
                {remainingLinks} more link{remainingLinks !== 1 ? "s" : ""} to earn
              </span>
            )}
          </div>
        )}

        {/* Side B */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: glowShadow,
          }}
        >
          <img
            src={SIDE_B}
            alt="Ship Medallion — Side B: The 2nd Second Industrial Revolution"
            className="w-full h-full object-cover rounded-full"
            draggable={false}
          />
          {earned && (
            <div className="absolute inset-0 rounded-full border-4 border-amber-400 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
