/**
 * Mascot — Generalized 3-state character component.
 * ======================================================================
 * The non-LRH counterpart to `LRHCharacter`. Takes a mascotId, looks it
 * up in the registry, and renders the 3-state image (default / hover /
 * xray) with the same hologram shimmer tier system as LRH.
 *
 * LRH stays on her legacy direct-path component (`LRHCharacter`) — this
 * component is for the 15 guest characters. They coexist.
 *
 * Usage:
 *   <Mascot id="owl" size={64} />
 *   <Mascot id="pig" size={48} hologram={false} />
 */
import { useState } from "react";
import { getMascot } from "@/data/mascots";
import { useXRay } from "./XRayContext";
import "./HologramOverlay.css";

interface MascotProps {
  /** Mascot id from the registry (e.g. "owl", "pig", "rabbit"). */
  id: string;
  /** Size in pixels (width). Height auto-scales. */
  size?: number;
  /** Additional className on the outer wrapper. */
  className?: string;
  /** Disable hover-to-hover-state transition. Default false. */
  disableHover?: boolean;
  /** Disable the hologram shimmer entirely. Default false. */
  hologram?: boolean;
  /** Stagger delay (0-5) so multiple mascots don't glitch together. */
  hologramDelay?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Optional click handler (e.g. open dialogue panel). */
  onClick?: () => void;
  /** If true, react to global x-ray mode and swap to xray image. Default true. */
  respondToXRay?: boolean;
  /**
   * If true, the mascot is in its "summoned to explain" state — force the
   * colored (hover) variant rather than the muted default. Per Founder
   * rule (B119): when a mascot comes out to explain, always use the
   * colored version. X-Ray mode still wins when toggled on.
   */
  summoned?: boolean;
}

export function Mascot({
  id,
  size = 64,
  className = "",
  disableHover = false,
  hologram = true,
  hologramDelay = 0,
  onClick,
  respondToXRay = true,
  summoned = false,
}: MascotProps) {
  const mascot = getMascot(id);
  const [hovered, setHovered] = useState(false);
  const xrayCtx = useXRay();
  const xrayOn = respondToXRay && xrayCtx?.xrayOn;

  // Pick image based on state — xray wins when active, then summoned or
  // mouse-hover force the colored variant, else the muted default.
  const useColored = summoned || (hovered && !disableHover);
  const imgSrc = xrayOn
    ? mascot.visual.xray
    : useColored
      ? mascot.visual.hover
      : mascot.visual.default;

  const hologramClasses = hologram
    ? `hologram-character hologram-tier-${mascot.hologramTier} hologram-delay-${hologramDelay}`
    : "";

  return (
    <div
      className={`inline-block ${hologramClasses} ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size, borderRadius: "50%" }}
      onMouseEnter={() => !disableHover && setHovered(true)}
      onMouseLeave={() => !disableHover && setHovered(false)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={mascot.name}
      title={`${mascot.name} — ${mascot.title}`}
    >
      <img
        src={imgSrc}
        alt={mascot.name}
        className="object-contain shrink-0 w-full h-full hologram-target"
        draggable={false}
      />
    </div>
  );
}

export default Mascot;
