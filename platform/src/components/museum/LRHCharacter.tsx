/**
 * LRHCharacter — The Little Red Hen character image with 3 interactive states.
 * Default: glasses down. Hover: binoculars up. Click: toggles X-ray mode (thermal vision).
 * Used everywhere the character appears — FAB, tours, inline bubbles.
 *
 * HOLOGRAM EFFECT (B093): Characters render as holograms that periodically "refresh"
 * with a CRT-style scan-line disruption. LRH is Tier 4 (Economics/Interdisciplinary) —
 * she encompasses the entire platform, so her hologram works hardest to maintain coherence.
 * Mana suppression text and percentages are EXCLUSIVE to Denken — not shown here.
 *
 * Knowledge tiers (Founder directive):
 *   Tier 1 — Arts/Creative (stable, ~8s)
 *   Tier 2 — Math/Logic (~6s)
 *   Tier 3 — Physics/Engineering (~4s)
 *   Tier 4 — Economics/Interdisciplinary (~3s) ← LRH
 */
import { useState } from "react";
import { useXRay } from "./XRayContext";
import "./HologramOverlay.css";

/** Knowledge tier determines hologram refresh frequency.
 *  Higher tier = more complex knowledge = more visible refresh artifacts. */
export type HologramTier = 1 | 2 | 3 | 4;

interface LRHCharacterProps {
  /** Size in pixels (width). Height auto-scales. */
  size?: number;
  /** If true, clicking toggles X-ray mode. Default true. */
  clickable?: boolean;
  /** Additional className */
  className?: string;
  /** Hologram knowledge tier (1-4). Default 4 for LRH (interdisciplinary). */
  hologramTier?: HologramTier;
  /** Stagger delay (0-5) so multiple characters don't glitch at the same instant. */
  hologramDelay?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Set false to disable hologram effect entirely. Default true. */
  hologram?: boolean;
}

export function LRHCharacter({
  size = 48,
  clickable = true,
  className = "",
  hologramTier = 4,
  hologramDelay = 0,
  hologram = true,
}: LRHCharacterProps) {
  const [hovered, setHovered] = useState(false);
  const { xrayOn, toggleXray } = useXRay();

  const imgSrc = xrayOn
    ? "/images/lrh-xray.png"
    : hovered
      ? "/images/lrh-hover.png"
      : "/images/lrh-default.png";

  const hologramClasses = hologram
    ? `hologram-character hologram-tier-${hologramTier} hologram-delay-${hologramDelay}`
    : "";

  return (
    <div
      className={`inline-block ${hologramClasses} ${clickable ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size, borderRadius: "50%" }}
    >
      <img
        src={imgSrc}
        alt="Little Red Hen"
        className="object-contain shrink-0 w-full h-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={clickable ? (e) => { e.stopPropagation(); toggleXray(); } : undefined}
      />
    </div>
  );
}

export default LRHCharacter;
