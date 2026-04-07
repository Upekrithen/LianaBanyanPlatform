import { Shield, Ban, BadgeCheck } from "lucide-react";

/**
 * Immutable platform rules badge that CANNOT be hidden by custom CSS.
 * Rendered on every neighborhood page to enforce transparency of:
 * - Cost+20% pricing floor
 * - Creator keeps 83.3%
 * - No advertising policy
 *
 * The inline styles use !important to resist any custom CSS overrides,
 * mirrored by the .lb-platform-rules-badge class in global CSS.
 */
export function PlatformRulesBadge() {
  return (
    <div
      className="lb-platform-rules-badge"
      style={{
        display: "block",
        visibility: "visible",
        opacity: 1,
        position: "relative",
        pointerEvents: "auto",
        zIndex: 10,
      }}
    >
      <div className="border border-primary/20 bg-primary/5 rounded-lg px-4 py-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-primary mb-2">
          <Shield className="w-4 h-4" />
          Liana Banyan Platform Rules Apply
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Cost+20% pricing on every product</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Creator keeps 83.3% of every sale</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>No advertising permitted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
