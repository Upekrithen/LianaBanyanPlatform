import { useMemo } from "react";
import type { CanisterSize, PressureMethod } from "@/hooks/useCanisterSystem";
import { SIZE_SPECS } from "@/hooks/useCanisterSystem";

interface CanisterStackDiagramProps {
  size: CanisterSize;
  stackCount: number;
  method: PressureMethod;
  handleInches?: number;
  pressurePsi?: number;
  className?: string;
}

const SIZE_COLORS: Record<CanisterSize, string> = { S: '#3b82f6', M: '#22c55e', L: '#f59e0b', XL: '#a855f7' };
const UNIT_HEIGHT = 56;
const CANISTER_WIDTH_MAP: Record<CanisterSize, number> = { S: 60, M: 80, L: 110, XL: 140 };

export function CanisterStackDiagram({ size, stackCount, method, handleInches = 8, pressurePsi = 0, className = '' }: CanisterStackDiagramProps) {
  const color = SIZE_COLORS[size];
  const w = CANISTER_WIDTH_MAP[size];
  const totalStackH = stackCount * UNIT_HEIGHT;
  const capH = 18;
  const baseH = 22;
  const pistonH = method === 'screw_press' ? 40 : 28;
  const handleW = method === 'screw_press' ? (handleInches / 10) * 100 : 0;
  const svgH = capH + totalStackH + pistonH + baseH + 30;
  const svgW = Math.max(w + 80, handleW + w / 2 + 40);
  const cx = svgW / 2;

  const stacks = useMemo(() => {
    const items = [];
    for (let i = 0; i < stackCount; i++) {
      items.push(i);
    }
    return items;
  }, [stackCount]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{ maxWidth: svgW, maxHeight: 420 }}
        className="transition-all duration-500"
      >
        {/* Cap */}
        <rect
          x={cx - w / 2}
          y={4}
          width={w}
          height={capH}
          rx={4}
          fill={color}
          opacity={0.7}
          className="transition-all duration-500"
        />
        <text x={cx} y={4 + capH / 2 + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight={600}>CAP</text>

        {/* Canister Stack */}
        {stacks.map((i) => {
          const y = 4 + capH + i * UNIT_HEIGHT;
          return (
            <g key={i} className="transition-all duration-500" style={{ animation: `canisterSlideIn 0.4s ease-out ${i * 0.1}s both` }}>
              {/* Sleeve */}
              <rect
                x={cx - w / 2 - 4}
                y={y}
                width={w + 8}
                height={UNIT_HEIGHT}
                rx={3}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.4}
              />
              {/* A Canister (top half) */}
              <rect
                x={cx - w / 2 + 4}
                y={y + 3}
                width={w - 8}
                height={UNIT_HEIGHT / 2 - 4}
                rx={2}
                fill={color}
                opacity={0.5}
              />
              <text x={cx} y={y + UNIT_HEIGHT / 4 + 3} textAnchor="middle" fontSize={8} fill="white" fontWeight={500}>A</text>
              {/* B Canister (bottom half) */}
              <rect
                x={cx - w / 2 + 4}
                y={y + UNIT_HEIGHT / 2 + 1}
                width={w - 8}
                height={UNIT_HEIGHT / 2 - 4}
                rx={2}
                fill={color}
                opacity={0.35}
              />
              <text x={cx} y={y + (3 * UNIT_HEIGHT) / 4 + 1} textAnchor="middle" fontSize={8} fill="white" fontWeight={500}>B</text>
              {/* Sprue channel indicator */}
              {i < stackCount - 1 && (
                <line
                  x1={cx}
                  y1={y + UNIT_HEIGHT - 2}
                  x2={cx}
                  y2={y + UNIT_HEIGHT + 2}
                  stroke={color}
                  strokeWidth={3}
                  opacity={0.8}
                />
              )}
              {/* Stack label */}
              <text x={cx - w / 2 - 10} y={y + UNIT_HEIGHT / 2 + 3} textAnchor="end" fontSize={7} fill="#999">#{i + 1}</text>
            </g>
          );
        })}

        {/* Base / Piston area */}
        {(() => {
          const pistonY = 4 + capH + totalStackH;

          if (method === 'screw_press') {
            return (
              <g>
                {/* Screw thread */}
                <rect
                  x={cx - 4}
                  y={pistonY}
                  width={8}
                  height={pistonH - 8}
                  fill="#888"
                  rx={2}
                />
                {/* Thread marks */}
                {[0, 1, 2, 3].map(j => (
                  <line
                    key={j}
                    x1={cx - 5}
                    y1={pistonY + 6 + j * 7}
                    x2={cx + 5}
                    y2={pistonY + 3 + j * 7}
                    stroke="#aaa"
                    strokeWidth={1}
                  />
                ))}
                {/* Handle */}
                <rect
                  x={cx - handleW / 2}
                  y={pistonY + pistonH - 10}
                  width={handleW}
                  height={8}
                  rx={4}
                  fill="#666"
                />
                <text x={cx} y={pistonY + pistonH + 6} textAnchor="middle" fontSize={7} fill="#999">
                  SCREW PRESS ({handleInches}")
                </text>
              </g>
            );
          }

          return (
            <g>
              {/* Weight piston */}
              <rect
                x={cx - w / 2 + 2}
                y={pistonY + 2}
                width={w - 4}
                height={pistonH - 4}
                rx={3}
                fill="#666"
                opacity={0.7}
              />
              <text x={cx} y={pistonY + pistonH / 2 + 3} textAnchor="middle" fontSize={8} fill="white">WEIGHT</text>
            </g>
          );
        })()}

        {/* Base plate */}
        <rect
          x={cx - w / 2 - 6}
          y={4 + capH + totalStackH + pistonH + 4}
          width={w + 12}
          height={baseH}
          rx={4}
          fill="#444"
        />
        <text x={cx} y={4 + capH + totalStackH + pistonH + 4 + baseH / 2 + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight={600}>BASE</text>

        {/* Material flow arrows (gravity = top-down, screw = bottom-up) */}
        <defs>
          <marker id="arrow" viewBox="0 0 6 6" refX={3} refY={3} markerWidth={4} markerHeight={4} orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={color} opacity={0.8} />
          </marker>
        </defs>
        <line
          x1={cx + w / 2 + 14}
          y1={method === 'gravity' ? (4 + capH + 4) : (4 + capH + totalStackH - 4)}
          x2={cx + w / 2 + 14}
          y2={method === 'gravity' ? (4 + capH + totalStackH - 4) : (4 + capH + 4)}
          stroke={color}
          strokeWidth={2}
          markerEnd="url(#arrow)"
          opacity={0.6}
        />
        <text
          x={cx + w / 2 + 22}
          y={4 + capH + totalStackH / 2}
          fontSize={7}
          fill={color}
          opacity={0.7}
          writingMode="vertical-rl"
          textAnchor="middle"
        >
          MATERIAL FLOW
        </text>
      </svg>

      {/* PSI Badge */}
      {pressurePsi > 0 && (
        <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}>
          {Math.round(pressurePsi).toLocaleString()} PSI
        </div>
      )}

      {/* Size label */}
      <div className="mt-1 text-xs text-zinc-500">
        {SIZE_SPECS[size].diameter} &middot; {SIZE_SPECS[size].maxVolume} max
      </div>

      <style>{`
        @keyframes canisterSlideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
