/**
 * LRHCharacter — Host character image with 3 interactive states.
 * ======================================================================
 * REFACTORED B095: This is now a thin wrapper around the generalized
 * `Mascot` component. Previously had its own 3-state image logic
 * duplicated from the Mascot component — now delegates.
 *
 * PROVINCE AWARENESS: The component name is historical ("LRH" = Little
 * Red Hen), but it now renders whichever HOST is active for the
 * current province — LRH in the Southern Province, Denken in the
 * Northern Province. Prefer `<HostCharacter>` (exported below) in new
 * code for semantic clarity. Existing `<LRHCharacter>` call sites
 * keep working with no changes.
 *
 * States (inherited from the Mascot component):
 *   1. Default: glasses/goggles down (resting)
 *   2. Hover: binoculars up (engaged)
 *   3. Clicked / X-ray ON: thermal vision (via XRayContext)
 *
 * HOLOGRAM: Hosts are Tier 4 (Economics/Interdisciplinary) by
 * registry — their hologram refresh is stronger than specialists.
 *
 * Knowledge tiers (Founder directive):
 *   Tier 1 — Arts/Creative (stable, ~8s)
 *   Tier 2 — Math/Logic (~6s)
 *   Tier 3 — Physics/Engineering (~4s)
 *   Tier 4 — Economics/Interdisciplinary (~3s) ← hosts
 */
import { Mascot } from "./Mascot";
import { useHost } from "./useHost";
import { useXRay } from "./XRayContext";

/** Knowledge tier determines hologram refresh frequency.
 *  Higher tier = more complex knowledge = more visible refresh artifacts.
 *  Exported here for backwards compatibility — mascots.ts imports it. */
export type HologramTier = 1 | 2 | 3 | 4;

interface LRHCharacterProps {
  /** Size in pixels (width). Height auto-scales. */
  size?: number;
  /** If true, clicking toggles X-ray mode. Default true. */
  clickable?: boolean;
  /** Additional className */
  className?: string;
  /**
   * @deprecated Hologram tier is now read from the mascot registry.
   * This prop is accepted for backwards compatibility but ignored.
   */
  hologramTier?: HologramTier;
  /** Stagger delay (0-5) so multiple characters don't glitch at the same instant. */
  hologramDelay?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Set false to disable hologram effect entirely. Default true. */
  hologram?: boolean;
}

/**
 * The active host character (LRH in Southern, Denken in Northern).
 * Backwards-compatible name — existing imports of `LRHCharacter` keep
 * working. New code should prefer the `HostCharacter` alias exported
 * below.
 */
export function LRHCharacter({
  size = 48,
  clickable = true,
  className = "",
  hologramDelay = 0,
  hologram = true,
}: LRHCharacterProps) {
  const host = useHost();
  const { toggleXray } = useXRay();

  return (
    <Mascot
      id={host.id}
      size={size}
      className={className}
      hologram={hologram}
      hologramDelay={hologramDelay}
      onClick={clickable ? () => toggleXray() : undefined}
    />
  );
}

/**
 * HostCharacter — Alias for `LRHCharacter` with a clearer name.
 * Use this in new code. Renders whoever the current province's host
 * mascot is (LRH or Denken), honoring the same prop interface.
 */
export const HostCharacter = LRHCharacter;

export default LRHCharacter;
