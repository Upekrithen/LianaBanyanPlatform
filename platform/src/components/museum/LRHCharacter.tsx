/**
 * LRHCharacter — The Little Red Hen character image with 3 interactive states.
 * Default: glasses down. Hover: binoculars up. Click: toggles X-ray mode (thermal vision).
 * Used everywhere the character appears — FAB, tours, inline bubbles.
 */
import { useState } from "react";
import { useXRay } from "./XRayContext";

interface LRHCharacterProps {
  /** Size in pixels (width). Height auto-scales. */
  size?: number;
  /** If true, clicking toggles X-ray mode. Default true. */
  clickable?: boolean;
  /** Additional className */
  className?: string;
}

export function LRHCharacter({ size = 48, clickable = true, className = "" }: LRHCharacterProps) {
  const [hovered, setHovered] = useState(false);
  const { xrayOn, toggleXray } = useXRay();

  const imgSrc = xrayOn
    ? "/images/lrh-xray.png"
    : hovered
      ? "/images/lrh-hover.png"
      : "/images/lrh-default.png";

  return (
    <img
      src={imgSrc}
      alt="Little Red Hen"
      className={`object-contain shrink-0 ${clickable ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: "auto" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={clickable ? (e) => { e.stopPropagation(); toggleXray(); } : undefined}
    />
  );
}

export default LRHCharacter;
