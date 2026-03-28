/**
 * HexGrid — SVG hex renderer for Ghost World.
 * Flat-top hexagons, axial coordinates (q,r), pan/zoom with mouse + touch.
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';

export interface GWIsland {
  id: string;
  name: string;
  description: string | null;
  hex_q: number;
  hex_r: number;
  category: string;
  theme_color: string;
  max_slots: number;
  is_active: boolean;
}

export interface GWBuilding {
  id: string;
  island_id: string;
  storefront_id: string;
  building_slot: number;
  building_size: string;
  is_popup: boolean;
  popup_expires_at: string | null;
  placed_by: string | null;
  storefront?: {
    id: string;
    name: string;
    slug: string;
    category: string;
    is_open: boolean;
    logo_url?: string | null;
    user_id: string;
  };
  order_count?: number;
}

interface HexGridProps {
  islands: GWIsland[];
  buildings: GWBuilding[];
  dimmedIslands?: Set<string>;
  highlightedBuildings?: Set<string>;
  placementMode?: { islandId: string } | null;
  userStorefrontId?: string | null;
  onBuildingClick: (building: GWBuilding) => void;
  onIslandClick: (island: GWIsland) => void;
  onEmptySlotClick?: (island: GWIsland, slotIndex: number) => void;
}

const HEX_SIZE = 40;
const SQRT3 = Math.sqrt(3);
const ISLAND_SPACING = 3;

function hexToPixel(q: number, r: number): { x: number; y: number } {
  return {
    x: HEX_SIZE * (3 / 2) * q,
    y: HEX_SIZE * (SQRT3 / 2 * q + SQRT3 * r),
  };
}

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

// 12-slot flower layout: center (0) + 6 inner ring (1-6) + 5 outer partial (7-11)
const SLOT_OFFSETS: { dq: number; dr: number }[] = [
  { dq: 0, dr: 0 },     // 0: center
  { dq: 1, dr: 0 },     // 1
  { dq: 0, dr: 1 },     // 2
  { dq: -1, dr: 1 },    // 3
  { dq: -1, dr: 0 },    // 4
  { dq: 0, dr: -1 },    // 5
  { dq: 1, dr: -1 },    // 6
  { dq: 2, dr: -1 },    // 7
  { dq: 1, dr: 1 },     // 8
  { dq: -1, dr: 2 },    // 9
  { dq: -2, dr: 1 },    // 10
  { dq: -1, dr: -1 },   // 11
];

function slotPixel(islandCx: number, islandCy: number, slotIdx: number): { x: number; y: number } {
  const off = SLOT_OFFSETS[slotIdx % SLOT_OFFSETS.length];
  const subSize = HEX_SIZE * 0.6;
  return {
    x: islandCx + subSize * (3 / 2) * off.dq,
    y: islandCy + subSize * (SQRT3 / 2 * off.dq + SQRT3 * off.dr),
  };
}

const SIZE_RADIUS: Record<string, number> = { small: 12, medium: 20, large: HEX_SIZE * 0.6 * 0.9 };
const CAT_EMOJI: Record<string, string> = {
  food_drink: '🍩', food: '🍩', services: '🔧', service: '🔧',
  retail: '🛒', crafts_making: '🎨', creative: '🎨', maker: '🎨',
  digital: '💻', education: '📚', home_garden: '🏡', health: '💚', general: '🏪',
};

function buildingRadius(b: GWBuilding): number {
  const count = b.order_count ?? 0;
  if (count >= 51) return SIZE_RADIUS.large;
  if (count >= 11) return SIZE_RADIUS.medium;
  return SIZE_RADIUS.small;
}

const BuildingHex = React.memo(function BuildingHex({
  building, cx, cy, onClick,
}: { building: GWBuilding; cx: number; cy: number; onClick: () => void }) {
  const r = buildingRadius(building);
  const cat = building.storefront?.category || 'general';
  const emoji = CAT_EMOJI[cat] || '🏪';
  const isPopup = building.is_popup;

  return (
    <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {r >= SIZE_RADIUS.large ? (
        <polygon
          points={hexPoints(cx, cy, r)}
          fill="#1e293b"
          stroke="#f59e0b"
          strokeWidth="1.5"
          filter="url(#building-glow)"
          className="transition-all hover:brightness-125"
        />
      ) : (
        <circle
          cx={cx} cy={cy} r={r}
          fill="#1e293b"
          stroke="#f59e0b"
          strokeWidth="1"
          className="transition-all hover:brightness-125"
        />
      )}
      {isPopup && (
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#a855f7" strokeWidth="1.5" className="animate-pulse" />
      )}
      <text x={cx} y={cy + (r <= 12 ? 4 : 3)} textAnchor="middle" fontSize={r <= 12 ? '10' : '14'} dominantBaseline="central">
        {emoji}
      </text>
      {r >= SIZE_RADIUS.medium && (
        <text x={cx} y={cy + r + 10} textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="500">
          {(building.storefront?.name || '').slice(0, 14)}
        </text>
      )}
    </g>
  );
});

const IslandCluster = React.memo(function IslandCluster({
  island, buildings, dimmed, highlighted, placementMode, userStorefrontId,
  onBuildingClick, onIslandClick, onEmptySlotClick,
}: {
  island: GWIsland;
  buildings: GWBuilding[];
  dimmed: boolean;
  highlighted: Set<string>;
  placementMode: boolean;
  userStorefrontId: string | null;
  onBuildingClick: (b: GWBuilding) => void;
  onIslandClick: (i: GWIsland) => void;
  onEmptySlotClick?: (i: GWIsland, slot: number) => void;
}) {
  const scaled = { q: island.hex_q * ISLAND_SPACING, r: island.hex_r * ISLAND_SPACING };
  const { x: cx, y: cy } = hexToPixel(scaled.q, scaled.r);
  const filledSlots = new Set(buildings.map(b => b.building_slot));

  return (
    <g opacity={dimmed ? 0.25 : 1} className="transition-opacity duration-300">
      {/* Island border hex (large) */}
      <polygon
        points={hexPoints(cx, cy, HEX_SIZE * 1.6)}
        fill={`${island.theme_color}08`}
        stroke={island.theme_color}
        strokeWidth="1"
        strokeDasharray="6,3"
        className="cursor-pointer"
        onClick={() => onIslandClick(island)}
      />
      {/* Island name label */}
      <text x={cx} y={cy - HEX_SIZE * 1.7 - 4} textAnchor="middle" fill={island.theme_color} fontSize="11" fontWeight="bold">
        {island.name}
      </text>
      <text x={cx} y={cy + HEX_SIZE * 1.7 + 12} textAnchor="middle" fill="#64748b" fontSize="8">
        {buildings.length}/{island.max_slots} slots
      </text>

      {/* Building hexes */}
      {buildings.map((b) => {
        const { x: bx, y: by } = slotPixel(cx, cy, b.building_slot);
        const isHighlighted = highlighted.has(b.id);
        return (
          <g key={b.id} opacity={isHighlighted ? 1 : undefined}>
            {isHighlighted && (
              <circle cx={bx} cy={by} r={buildingRadius(b) + 5} fill="none" stroke="#facc15" strokeWidth="2" className="animate-pulse" />
            )}
            <BuildingHex building={b} cx={bx} cy={by} onClick={() => onBuildingClick(b)} />
          </g>
        );
      })}

      {/* Empty slots */}
      {Array.from({ length: island.max_slots }, (_, i) => i).filter(i => !filledSlots.has(i)).map(slotIdx => {
        const { x: ex, y: ey } = slotPixel(cx, cy, slotIdx);
        const canPlace = placementMode && !!userStorefrontId;
        return (
          <polygon
            key={`empty-${island.id}-${slotIdx}`}
            points={hexPoints(ex, ey, HEX_SIZE * 0.25)}
            fill="none"
            stroke={canPlace ? '#22c55e' : '#334155'}
            strokeWidth={canPlace ? '1.5' : '0.5'}
            strokeDasharray={canPlace ? '4,2' : '3,3'}
            opacity={canPlace ? 0.8 : 0.3}
            className={canPlace ? 'cursor-pointer hover:stroke-green-400 hover:opacity-100 transition-all' : ''}
            onClick={canPlace ? (e) => { e.stopPropagation(); onEmptySlotClick?.(island, slotIdx); } : undefined}
          />
        );
      })}
    </g>
  );
});

export default function HexGrid({
  islands, buildings, dimmedIslands, highlightedBuildings,
  placementMode, userStorefrontId,
  onBuildingClick, onIslandClick, onEmptySlotClick,
}: HexGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: -400, y: -300, w: 800, h: 600 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const rafRef = useRef<number>(0);

  const buildingsByIsland = useMemo(() => {
    const m = new Map<string, GWBuilding[]>();
    buildings.forEach(b => {
      const arr = m.get(b.island_id) || [];
      arr.push(b);
      m.set(b.island_id, arr);
    });
    return m;
  }, [buildings]);

  const clampZoom = useCallback((vb: typeof viewBox, factor: number, cx: number, cy: number) => {
    const minW = 200, maxW = 3000;
    const newW = Math.min(maxW, Math.max(minW, vb.w * factor));
    const newH = Math.min(maxW * 0.75, Math.max(minW * 0.75, vb.h * factor));
    const rx = (cx - vb.x) / vb.w;
    const ry = (cy - vb.y) / vb.h;
    return {
      x: cx - rx * newW,
      y: cy - ry * newH,
      w: newW,
      h: newH,
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const my = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
    setViewBox(vb => clampZoom(vb, factor, mx, my));
  }, [viewBox, clampZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragOrigin.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  }, [viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx = (e.clientX - dragOrigin.current.x) / rect.width * viewBox.w;
      const dy = (e.clientY - dragOrigin.current.y) / rect.height * viewBox.h;
      setViewBox(vb => ({ ...vb, x: dragOrigin.current.vx - dx, y: dragOrigin.current.vy - dy }));
    });
  }, [dragging, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      setDragging(true);
      dragOrigin.current = { x: t.clientX, y: t.clientY, vx: viewBox.x, vy: viewBox.y };
    } else if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { dist, cx: (a.clientX + b.clientX) / 2, cy: (a.clientY + b.clientY) / 2 };
    }
  }, [viewBox]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && dragging) {
      const t = e.touches[0];
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx = (t.clientX - dragOrigin.current.x) / rect.width * viewBox.w;
      const dy = (t.clientY - dragOrigin.current.y) / rect.height * viewBox.h;
      setViewBox(vb => ({ ...vb, x: dragOrigin.current.vx - dx, y: dragOrigin.current.vy - dy }));
    } else if (e.touches.length === 2 && pinchRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const factor = pinchRef.current.dist / dist;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mx = viewBox.x + ((pinchRef.current.cx - rect.left) / rect.width) * viewBox.w;
      const my = viewBox.y + ((pinchRef.current.cy - rect.top) / rect.height) * viewBox.h;
      setViewBox(vb => clampZoom(vb, factor, mx, my));
      pinchRef.current.dist = dist;
    }
  }, [dragging, viewBox, clampZoom]);

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
    pinchRef.current = null;
  }, []);

  // Fit all on mount
  useEffect(() => {
    if (islands.length === 0) return;
    const coords = islands.map(i => hexToPixel(i.hex_q * ISLAND_SPACING, i.hex_r * ISLAND_SPACING));
    const pad = HEX_SIZE * 3;
    const minX = Math.min(...coords.map(c => c.x)) - pad;
    const maxX = Math.max(...coords.map(c => c.x)) + pad;
    const minY = Math.min(...coords.map(c => c.y)) - pad;
    const maxY = Math.max(...coords.map(c => c.y)) + pad;
    setViewBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
  }, [islands]);

  // Public fit-all method via ref (exposed via window for MapControls)
  useEffect(() => {
    (window as any).__ghostWorldFitAll = () => {
      if (islands.length === 0) return;
      const coords = islands.map(i => hexToPixel(i.hex_q * ISLAND_SPACING, i.hex_r * ISLAND_SPACING));
      const pad = HEX_SIZE * 3;
      const minX = Math.min(...coords.map(c => c.x)) - pad;
      const maxX = Math.max(...coords.map(c => c.x)) + pad;
      const minY = Math.min(...coords.map(c => c.y)) - pad;
      const maxY = Math.max(...coords.map(c => c.y)) + pad;
      setViewBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
    };
    (window as any).__ghostWorldZoom = (factor: number) => {
      setViewBox(vb => clampZoom(vb, factor, vb.x + vb.w / 2, vb.y + vb.h / 2));
    };
    return () => {
      delete (window as any).__ghostWorldFitAll;
      delete (window as any).__ghostWorldZoom;
    };
  }, [islands, clampZoom]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <defs>
        <filter id="building-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <style>{`
          @keyframes pulse-border { 0%,100%{stroke-opacity:.4} 50%{stroke-opacity:1} }
          .animate-pulse { animation: pulse-border 2s ease-in-out infinite; }
        `}</style>
      </defs>

      {islands.map(island => (
        <IslandCluster
          key={island.id}
          island={island}
          buildings={buildingsByIsland.get(island.id) || []}
          dimmed={dimmedIslands?.has(island.id) ?? false}
          highlighted={highlightedBuildings ?? new Set()}
          placementMode={placementMode?.islandId === island.id}
          userStorefrontId={userStorefrontId ?? null}
          onBuildingClick={onBuildingClick}
          onIslandClick={onIslandClick}
          onEmptySlotClick={onEmptySlotClick}
        />
      ))}
    </svg>
  );
}
