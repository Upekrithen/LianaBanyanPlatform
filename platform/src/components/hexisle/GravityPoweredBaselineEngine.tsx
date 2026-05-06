import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, ArrowDown, BarChart3 } from 'lucide-react';
import { useGravityPoweredBaseline, GravityBaselineConfig } from '@/hooks/useGravityPoweredBaseline';

// MISS-009 — Gravity-Powered Baseline Engine
// 8-foot column provides gravity-fed pressure (~2.17 psi at 5-foot effective head).
// No pumps, no batteries. Water source: 5-gallon jug on telescoping legs (flat-pack ship).

export interface GravityPoweredBaselineEngineProps {
  config?: Partial<GravityBaselineConfig>;
  className?: string;
}

function PressureColumnViz({
  columnHeightFt,
  maxHeightFt,
  effectiveHeadFt,
  pressurePsi,
  jugVolumeGallons,
  jugCapacity,
  isFlowing,
  telescopingLegExtended,
}: {
  columnHeightFt: number;
  maxHeightFt: number;
  effectiveHeadFt: number;
  pressurePsi: number;
  jugVolumeGallons: number;
  jugCapacity: number;
  isFlowing: boolean;
  telescopingLegExtended: boolean;
}) {
  const SVGH = 220;
  const SVGW = 280;
  const columnX = 120;
  const baseY = 200;
  const columnW = 28;

  const maxColPx = 150;
  const colPx = (columnHeightFt / maxHeightFt) * maxColPx;
  const effHeadPx = (effectiveHeadFt / maxHeightFt) * maxColPx;
  const waterFraction = jugVolumeGallons / jugCapacity;

  // Jug on top
  const jugY = baseY - colPx - 30;
  const jugH = 30 * waterFraction;

  return (
    <svg width={SVGW} height={SVGH} className="rounded-lg bg-slate-950 border border-slate-700 block mx-auto">
      {/* Ground line */}
      <line x1={0} y1={baseY + 2} x2={SVGW} y2={baseY + 2} stroke="#475569" strokeWidth={1} />

      {/* Telescoping legs */}
      {telescopingLegExtended && (
        <>
          <line x1={columnX - 16} y1={baseY} x2={columnX - 22} y2={baseY + 2} stroke="#64748b" strokeWidth={2} />
          <line x1={columnX + columnW + 16} y1={baseY} x2={columnX + columnW + 22} y2={baseY + 2} stroke="#64748b" strokeWidth={2} />
          <text x={columnX - 38} y={baseY + 14} fill="#64748b" fontSize={9}>legs</text>
        </>
      )}

      {/* Column body */}
      <rect
        x={columnX} y={baseY - colPx}
        width={columnW} height={colPx}
        fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1}
        rx={3}
      />

      {/* Water fill in column */}
      {jugVolumeGallons > 0 && (
        <rect
          x={columnX + 2} y={baseY - colPx + 2}
          width={columnW - 4} height={colPx - 4}
          fill="#3b82f6" opacity={0.5 + waterFraction * 0.3}
          rx={2}
        >
          {isFlowing && (
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1s" repeatCount="indefinite" />
          )}
        </rect>
      )}

      {/* Effective head bracket */}
      <line
        x1={columnX + columnW + 4} y1={baseY}
        x2={columnX + columnW + 4} y2={baseY - effHeadPx}
        stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4,3"
      />
      <line x1={columnX + columnW + 1} y1={baseY} x2={columnX + columnW + 7} y2={baseY} stroke="#fbbf24" strokeWidth={1.5} />
      <line x1={columnX + columnW + 1} y1={baseY - effHeadPx} x2={columnX + columnW + 7} y2={baseY - effHeadPx} stroke="#fbbf24" strokeWidth={1.5} />
      <text x={columnX + columnW + 10} y={baseY - effHeadPx / 2 + 4} fill="#fbbf24" fontSize={10}>
        {effectiveHeadFt.toFixed(1)} ft
      </text>
      <text x={columnX + columnW + 10} y={baseY - effHeadPx / 2 + 16} fill="#fbbf24" fontSize={9}>
        {pressurePsi.toFixed(2)} psi
      </text>

      {/* Jug on top of column */}
      <rect
        x={columnX + 2} y={jugY - 30}
        width={columnW - 4} height={30}
        fill="#1e3a5f" stroke="#6b7280" strokeWidth={1}
        rx={2}
      />
      {/* Water in jug */}
      <rect
        x={columnX + 4} y={jugY - 30 + (30 - jugH)}
        width={columnW - 8} height={Math.max(0, jugH)}
        fill="#60a5fa" opacity={0.7}
        rx={1}
      />
      <text x={columnX - 2} y={jugY - 34} fill="#94a3b8" fontSize={9}>
        {jugVolumeGallons.toFixed(2)} gal
      </text>

      {/* Flow droplets from outlet */}
      {isFlowing && (
        <>
          <circle cx={columnX + columnW / 2} cy={baseY + 10} r={3} fill="#38bdf8" opacity={0.9}>
            <animate attributeName="cy" values={`${baseY + 5};${baseY + 20}`} dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={columnX + columnW / 2 - 4} cy={baseY + 15} r={2} fill="#38bdf8" opacity={0.7}>
            <animate attributeName="cy" values={`${baseY + 8};${baseY + 22}`} dur="0.7s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="opacity" values="0.7;0" dur="0.7s" repeatCount="indefinite" begin="0.3s" />
          </circle>
        </>
      )}

      {/* Height label */}
      <text x={columnX - 60} y={baseY - colPx / 2 + 4} fill="#94a3b8" fontSize={10}>
        {columnHeightFt.toFixed(1)} ft
      </text>
      <line
        x1={columnX - 8} y1={baseY}
        x2={columnX - 8} y2={baseY - colPx}
        stroke="#475569" strokeWidth={1} strokeDasharray="3,3"
      />
      <text x={8} y={baseY + 2} fill="#475569" fontSize={9}>ground</text>
    </svg>
  );
}

export const GravityPoweredBaselineEngine: React.FC<GravityPoweredBaselineEngineProps> = ({
  config,
  className = '',
}) => {
  const { state, setColumnHeight, toggleFlow, toggleTelescopingLegs, refillJug } =
    useGravityPoweredBaseline(config);

  const runTimeSec = state.elapsedSeconds;
  const runMin = Math.floor(runTimeSec / 60);
  const runSec = Math.floor(runTimeSec % 60);

  return (
    <Card className={`bg-slate-900 border-cyan-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-cyan-200">
          <Droplets className="w-5 h-5 text-cyan-400" />
          MISS-009 — Gravity-Powered Baseline
          <Badge className="ml-auto bg-cyan-900 text-cyan-100 text-xs">Wave 2 · urUtt</Badge>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          8-foot column · 5-gallon jug · no pumps, no batteries.
          ~2.17 psi at 5-foot effective head.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <PressureColumnViz
          columnHeightFt={state.columnHeightFt}
          maxHeightFt={8}
          effectiveHeadFt={state.effectiveHeadFt}
          pressurePsi={state.pressurePsi}
          jugVolumeGallons={state.jugVolumeGallons}
          jugCapacity={5}
          isFlowing={state.isFlowing}
          telescopingLegExtended={state.telescopingLegExtended}
        />

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Pressure</div>
            <div className="text-yellow-400 font-mono font-bold">{state.pressurePsi.toFixed(2)}</div>
            <div className="text-slate-500">psi</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Flow</div>
            <div className="text-cyan-400 font-mono font-bold">{state.flowRateGPM.toFixed(3)}</div>
            <div className="text-slate-500">GPM</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Jug</div>
            <div className="text-blue-400 font-mono font-bold">{state.jugVolumeGallons.toFixed(2)}</div>
            <div className="text-slate-500">gal</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Runtime</div>
            <div className="text-green-400 font-mono font-bold">{runMin}:{String(runSec).padStart(2,'0')}</div>
            <div className="text-slate-500">m:s</div>
          </div>
        </div>

        {/* Column height slider */}
        <div>
          <label className="text-xs text-slate-300 flex items-center gap-1 mb-1">
            <ArrowDown className="w-3 h-3 text-blue-400" />
            Column Height: <span className="text-blue-400 font-mono ml-1">{state.columnHeightFt.toFixed(1)} ft</span>
          </label>
          <input
            type="range" min={1} max={8} step={0.5}
            value={state.columnHeightFt}
            onChange={e => setColumnHeight(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1 ft</span>
            <span>5 ft (sweet spot 2.17 psi)</span>
            <span>8 ft</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex gap-2 text-xs">
          <Badge variant={state.telescopingLegExtended ? 'default' : 'outline'} className="text-xs">
            {state.telescopingLegExtended ? '✓ Legs Extended' : 'Legs Collapsed'}
          </Badge>
          <Badge variant={state.isFlowing ? 'default' : 'outline'}
            className={`text-xs ${state.isFlowing ? 'bg-cyan-700' : ''}`}>
            {state.isFlowing ? '◉ Flowing' : '○ Stopped'}
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={state.isFlowing ? 'destructive' : 'default'}
            onClick={toggleFlow}
            disabled={state.jugVolumeGallons <= 0}
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            {state.isFlowing ? 'Close Valve' : 'Open Valve'}
          </Button>
          <Button size="sm" variant="outline" onClick={toggleTelescopingLegs}>
            {state.telescopingLegExtended ? 'Collapse Legs' : 'Extend Legs'}
          </Button>
          <Button size="sm" variant="secondary" onClick={refillJug}
            disabled={state.jugVolumeGallons >= 5}>
            Refill Jug
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
