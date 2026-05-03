/**
 * HexGridVisualization — House Scribe 8-Digit Grid (KN-J2 / BP017)
 * =================================================================
 * Hexagonal-cell visual composition. Each 8-digit-coordinate cell maps to
 * a hexagonal cell. Cathedral × tier × flavor-class = honeycomb pattern.
 * Sealed Jars = Honey in Comb cells (per HexIsle hexagon brand canon).
 *
 * KN-J2: scaffold / placeholder. Full dashboard wired in KN-J5 (cross-Cathedral
 * coordinate routing + living-gridwork event-driven updates from KN-J3).
 *
 * Topology:
 *   Outer ring:  Cathedral (rows)
 *   Middle ring: Tier (01-07)
 *   Inner cell:  Flavor-class (01-06)
 *   Fill level:  jar_slot fill fraction (0-99)
 */

import React, { useMemo } from "react";
import { CATHEDRAL_IDS, TIER_IDS, FLAVOR_IDS, MAX_JARS_PER_CELL } from "../../lib/house_scribe/coordinate_scheme_constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HexCellData {
  coordinate_prefix: string;  // "01-06-02" (cathedral-tier-flavor)
  cathedral_name: string;
  tier_name: string;
  flavor_name: string;
  jar_count: number;
  is_full: boolean;
  has_sealed: boolean;
}

export interface HexGridVisualizationProps {
  cells: HexCellData[];
  /** Highlight a specific cathedral */
  active_cathedral?: string;
  /** Highlight a specific tier */
  active_tier?: string;
  /** Highlight a specific flavor */
  active_flavor?: string;
  /** Click handler for cell */
  onCellClick?: (cell: HexCellData) => void;
  /** Size of each hex cell in px */
  cellSize?: number;
}

// ─── Flavor → color mapping (HexIsle brand palette) ─────────────────────────

const FLAVOR_COLORS: Record<string, string> = {
  "01": "#b45309",  // cinnamon — amber-brown
  "02": "#f5f0e8",  // vanilla — cream
  "03": "#d97706",  // spice — orange-amber
  "04": "#16a34a",  // fruit — green
  "05": "#15803d",  // vegetable — deep green
  "06": "#a16207",  // nut — gold-brown
  "99": "#6b7280",  // cross-flavor — slate
};

// ─── Hex math helpers ─────────────────────────────────────────────────────────

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

// ─── Single Hex Cell ──────────────────────────────────────────────────────────

interface HexCellProps {
  data: HexCellData;
  cx: number;
  cy: number;
  radius: number;
  isActive: boolean;
  onClick?: () => void;
}

function HexCell({ data, cx, cy, radius, isActive, onClick }: HexCellProps) {
  const fillPct = data.jar_count / MAX_JARS_PER_CELL;
  const baseColor = FLAVOR_COLORS[data.coordinate_prefix.split("-")[2]] ?? "#6b7280";
  const opacity = 0.2 + fillPct * 0.7;
  const stroke = isActive ? "#f59e0b" : data.is_full ? "#dc2626" : "#374151";
  const strokeWidth = isActive ? 3 : 1.5;

  return (
    <g
      className="hex-cell cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
      aria-label={`${data.cathedral_name} / ${data.tier_name} / ${data.flavor_name}: ${data.jar_count} Jars`}
    >
      <polygon
        points={hexPoints(cx, cy, radius)}
        fill={baseColor}
        fillOpacity={opacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {data.jar_count > 0 && (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={radius * 0.35}
          fill="#111827"
          fontWeight={data.is_full ? "bold" : "normal"}
        >
          {data.jar_count}
        </text>
      )}
      {data.has_sealed && (
        <circle cx={cx + radius * 0.5} cy={cy - radius * 0.5} r={radius * 0.12} fill="#f59e0b" />
      )}
    </g>
  );
}

// ─── Main visualization ───────────────────────────────────────────────────────

/**
 * HexGridVisualization — placeholder scaffold for KN-J5 full dashboard.
 * Renders a honeycomb of coordinate cells grouped by cathedral and tier.
 */
export function HexGridVisualization({
  cells,
  active_cathedral,
  active_tier,
  active_flavor,
  onCellClick,
  cellSize = 40,
}: HexGridVisualizationProps) {
  const { hexes, viewBoxW, viewBoxH } = useMemo(() => {
    const r = cellSize;
    const w = r * 2;
    const h = Math.sqrt(3) * r;
    const cols = 7;  // flavors 01-07
    const rows = 7;  // tiers 01-07
    const hexes: Array<{ cell: HexCellData | null; cx: number; cy: number; prefix: string }> = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tier_id = String(row + 1).padStart(2, "0");
        const flavor_id = String(col + 1).padStart(2, "0");
        const cat_id = active_cathedral
          ? (CATHEDRAL_IDS[active_cathedral] ?? "01")
          : "01";
        const prefix = `${cat_id}-${tier_id}-${flavor_id}`;

        const cx = col * w * 0.9 + (row % 2 === 0 ? 0 : w * 0.45) + r + 10;
        const cy = row * h * 0.85 + r + 10;

        const cell = cells.find((c) => c.coordinate_prefix === prefix) ?? null;
        hexes.push({ cell, cx, cy, prefix });
      }
    }

    const viewBoxW = cols * w * 0.9 + w + 20;
    const viewBoxH = rows * h * 0.85 + h + 20;

    return { hexes, viewBoxW, viewBoxH };
  }, [cells, cellSize, active_cathedral]);

  return (
    <div className="hex-grid-visualization bg-stone-950 rounded-xl p-4 border border-amber-900/30">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-amber-400 font-semibold text-sm tracking-wide">
          House Scribe — Jar Coordinate Grid
        </h3>
        <div className="flex gap-2 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Sealed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Full cell
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
        className="w-full"
        style={{ maxHeight: 400 }}
        role="img"
        aria-label="House Scribe hexagonal grid of Jar coordinate cells"
      >
        {hexes.map(({ cell, cx, cy, prefix }) => {
          const [, tier_id, flavor_id] = prefix.split("-");
          const isActive =
            (!active_tier || active_tier === tier_id) &&
            (!active_flavor || active_flavor === flavor_id);

          const mockCell: HexCellData = cell ?? {
            coordinate_prefix: prefix,
            cathedral_name: active_cathedral ?? "bishop",
            tier_name: `tier_${tier_id}`,
            flavor_name: `flavor_${flavor_id}`,
            jar_count: 0,
            is_full: false,
            has_sealed: false,
          };

          return (
            <HexCell
              key={prefix}
              data={mockCell}
              cx={cx}
              cy={cy}
              radius={cellSize * 0.85}
              isActive={isActive}
              onClick={() => onCellClick?.(mockCell)}
            />
          );
        })}
      </svg>

      {cells.length === 0 && (
        <p className="text-stone-500 text-xs text-center mt-2">
          No Jars indexed yet — grid will populate as Hive threads close.
        </p>
      )}
    </div>
  );
}

export default HexGridVisualization;
