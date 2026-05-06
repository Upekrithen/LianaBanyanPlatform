import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Waves, RotateCcw, Play, Pause, ChevronRight, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCascadingHexagonalContainers } from '@/hooks/useCascadingHexagonalContainers';
import type { HexContainer } from '@/hooks/useCascadingHexagonalContainers';

export interface CascadingHexagonalContainersEvent {
  type: 'CASCADE_START' | 'CASCADE_STOP' | 'CONTAINER_OVERFLOW';
  payload: {
    level: number;
    fillFraction: number;
    totalVolumeProcessed: number;
    ts: number;
  };
}

interface CascadingHexagonalContainersEngineProps {
  onEvent?: (event: CascadingHexagonalContainersEvent) => void;
  initialTickMs?: number;
  className?: string;
}

const LEVEL_COLORS = ['#0ea5e9', '#22d3ee', '#34d399', '#a78bfa', '#f59e0b'];

function HexShape({
  cx, cy, size, fillFraction, color, isOverflowing, level,
}: {
  cx: number; cy: number; size: number; fillFraction: number;
  color: string; isOverflowing: boolean; level: number;
}) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = ((i * 60 - 30) * Math.PI) / 180;
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(' ');

  const fillHeight = fillFraction * (size * 1.5);
  const fillY = cy + size * 0.75 - fillHeight;

  return (
    <g>
      {/* Fill water */}
      <clipPath id={`hex-clip-${level}`}>
        <polygon points={points} />
      </clipPath>
      <rect
        x={cx - size}
        y={fillY}
        width={size * 2}
        height={fillHeight}
        fill={color}
        opacity={0.7}
        clipPath={`url(#hex-clip-${level})`}
      />
      {/* Hex outline */}
      <polygon
        points={points}
        fill="none"
        stroke={isOverflowing ? '#fbbf24' : '#475569'}
        strokeWidth={isOverflowing ? 2.5 : 1.5}
      />
      {/* Overflow arrows */}
      {isOverflowing && (
        <text x={cx} y={cy + size + 16} textAnchor="middle" fill="#fbbf24" fontSize={12}>↓</text>
      )}
    </g>
  );
}

export const CascadingHexagonalContainersEngine: React.FC<CascadingHexagonalContainersEngineProps> = ({
  onEvent,
  initialTickMs = 600,
  className,
}) => {
  const { state, controls } = useCascadingHexagonalContainers(initialTickMs);

  const handleTick = () => {
    const prev = state.containers.find(c => c.isOverflowing);
    controls.tick();
    if (onEvent && prev) {
      onEvent({
        type: 'CASCADE_START',
        payload: { level: prev.level, fillFraction: prev.currentL / prev.capacityL, totalVolumeProcessed: state.totalVolumeProcessed, ts: Date.now() },
      });
    }
  };

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-cyan-400">Cascading Hexagonal Containers</CardTitle>
          </div>
          <Badge variant="outline" className="border-cyan-500 text-cyan-400">MISS-010</Badge>
        </div>
        <CardDescription className="text-slate-400">
          Gravity-driven cascade · Each container overflows to next level
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* SVG cascade visualization */}
        <div className="bg-slate-800 rounded-lg p-3">
          <svg width={200} height={220} className="mx-auto">
            {/* Elevation labels */}
            <text x={5} y={25} fill="#94a3b8" fontSize={9}>100cm</text>
            <text x={5} y={65} fill="#94a3b8" fontSize={9}>75cm</text>
            <text x={5} y={110} fill="#94a3b8" fontSize={9}>50cm</text>
            <text x={5} y={155} fill="#94a3b8" fontSize={9}>25cm</text>
            <text x={5} y={200} fill="#94a3b8" fontSize={9}>0cm</text>

            {/* Hex containers at staggered y positions */}
            {state.containers.map((c: HexContainer, i: number) => {
              const cy = 25 + i * 45;
              const size = 14 + i * 3; // grow larger as lower
              return (
                <HexShape
                  key={c.level}
                  cx={100}
                  cy={cy}
                  size={size}
                  fillFraction={c.currentL / c.capacityL}
                  color={LEVEL_COLORS[i]}
                  isOverflowing={c.isOverflowing}
                  level={c.level}
                />
              );
            })}

            {/* Water source arrow */}
            <text x={100} y={10} textAnchor="middle" fill="#60a5fa" fontSize={10}>⬇ Inflow</text>
          </svg>
        </div>

        {/* Fill bars per container */}
        <div className="space-y-2">
          {state.containers.map((c: HexContainer, i: number) => (
            <div key={c.level} className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span style={{ color: LEVEL_COLORS[i] }}>Level {c.level} — {c.currentL.toFixed(2)}L / {c.capacityL}L</span>
                {c.isOverflowing && <span className="text-amber-400 animate-pulse">▼ overflow</span>}
              </div>
              <Progress
                value={(c.currentL / c.capacityL) * 100}
                className="h-1.5 bg-slate-700"
              />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Active Cascades</div>
            <div className="font-bold text-cyan-300">{state.activeCascades}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Volume Moved</div>
            <div className="font-bold text-blue-300">{state.totalVolumeProcessed}L</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Game Turn</div>
            <div className="font-bold text-amber-300">{state.gameTurn}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {state.isRunning ? (
            <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={controls.pause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-cyan-800 hover:bg-cyan-700" onClick={controls.start}>
              <Play className="h-4 w-4 mr-1" /> <Waves className="h-4 w-4 mr-1" /> Run Cascade
            </Button>
          )}
          <Button size="sm" variant="outline" className="border-slate-600" onClick={handleTick} disabled={state.isRunning}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
