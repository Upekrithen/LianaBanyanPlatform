/**
 * CELL TYPE LEGEND
 * ================
 * Displays the 5 canonical cell types with color codes.
 *
 * Canon: BP037 Refinement 4 — Cell Types Visualization
 *   - Member-cell (green) — individual cooperative member
 *   - Governance-cell (amber) — Crown-letter recipient / The 300 / Patent-Pledge member
 *   - Substrate-cell (blue) — Bishop / Knight / Rook / Pawn agent positions
 *   - Bedrock-cell (dark stone) — canonical anchor: provisional patents / Codex / Stack Ledger
 *   - Tribute-cell (rose with dashed outline) — Tatiana Schlossburg-class memorial
 */

import type { OperationalMode } from "./DualModeToggle";

// ─── Cell Type Definitions ────────────────────────────────────────────────────

export interface CellTypeDef {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  dashed?: boolean;
  modes: OperationalMode[];  // Which modes this type appears in
}

export const CELL_TYPES: CellTypeDef[] = [
  {
    id: "member",
    label: "Member-cell",
    sublabel: "Cooperative member",
    color: "#22c55e",
    modes: ["substrate", "governance"],
  },
  {
    id: "governance",
    label: "Governance-cell",
    sublabel: "Crown / The 300 / Patent-Pledge",
    color: "#f59e0b",
    modes: ["governance"],
  },
  {
    id: "substrate",
    label: "Substrate-cell",
    sublabel: "Bishop / Knight / Rook / Pawn",
    color: "#3b82f6",
    modes: ["substrate"],
  },
  {
    id: "bedrock",
    label: "Bedrock-cell",
    sublabel: "Patents / Codex / Stack Ledger",
    color: "#374151",
    modes: ["substrate", "governance"],
  },
  {
    id: "tribute",
    label: "Tribute-cell",
    sublabel: "Tatiana Schlossburg-class",
    color: "#fb7185",
    dashed: true,
    modes: ["governance"],
  },
];

// ─── Hex swatch SVG ───────────────────────────────────────────────────────────

function HexSwatch({ color, dashed }: { color: string; dashed?: boolean }) {
  const R = 10;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i);
    return `${12 + R * Math.cos(a)},${12 + R * Math.sin(a)}`;
  }).join(" ");

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="flex-shrink-0">
      <polygon
        points={pts}
        fill={color}
        fillOpacity="0.75"
        stroke={color}
        strokeWidth={dashed ? "1.5" : "1"}
        strokeDasharray={dashed ? "3,2" : "none"}
      />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CellTypeLegendProps {
  mode: OperationalMode;
  compact?: boolean;
}

export function CellTypeLegend({ mode, compact = false }: CellTypeLegendProps) {
  const visibleTypes = CELL_TYPES.filter(t => t.modes.includes(mode));

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {visibleTypes.map(ct => (
          <div key={ct.id} className="flex items-center gap-1" title={`${ct.label}: ${ct.sublabel}`}>
            <HexSwatch color={ct.color} dashed={ct.dashed} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-xl border border-white/10 p-3 w-52">
      <p className="text-white/50 text-[9px] uppercase tracking-widest mb-2.5 font-semibold">
        Cell Types — Mode {mode === "substrate" ? "A" : "B"}
      </p>
      <div className="space-y-2">
        {visibleTypes.map(ct => (
          <div key={ct.id} className="flex items-center gap-2">
            <HexSwatch color={ct.color} dashed={ct.dashed} />
            <div className="min-w-0">
              <p className="text-white text-[11px] font-medium leading-tight">{ct.label}</p>
              <p className="text-white/40 text-[9px] leading-tight truncate">{ct.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
