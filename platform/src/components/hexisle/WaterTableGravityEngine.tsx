import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Droplets, RotateCcw, Play, Pause, CloudRain, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWaterTableGravity } from '@/hooks/useWaterTableGravity';
import type { ReservoirStatus } from '@/hooks/useWaterTableGravity';

export interface WaterTableGravityEvent {
  type: 'RESERVOIR_LOW' | 'RAINFALL' | 'PRESSURE_TICK';
  payload: {
    reservoirVolumeGallons: number;
    pressureOutputPsi: number;
    elevationCm: number;
    status: ReservoirStatus;
    ts: number;
  };
}

interface WaterTableGravityEngineProps {
  onEvent?: (event: WaterTableGravityEvent) => void;
  initialTickMs?: number;
  className?: string;
}

const STATUS_COLORS: Record<ReservoirStatus, string> = {
  full:     'text-cyan-400',
  adequate: 'text-green-400',
  low:      'text-yellow-400',
  critical: 'text-orange-400',
  empty:    'text-red-500',
};

const STATUS_BG: Record<ReservoirStatus, string> = {
  full:     'bg-cyan-900',
  adequate: 'bg-green-900',
  low:      'bg-yellow-900',
  critical: 'bg-orange-900',
  empty:    'bg-red-900',
};

function ReservoirSVG({
  volumeGallons,
  maxGallons,
  elevationCm,
  pressurePsi,
  status,
}: {
  volumeGallons: number;
  maxGallons: number;
  elevationCm: number;
  pressurePsi: number;
  status: ReservoirStatus;
}) {
  const fillFrac = Math.min(1, volumeGallons / maxGallons);
  const tankH = 60;
  const fillH = fillFrac * tankH;
  const tankY = 20;

  const FILL_COLOR: Record<ReservoirStatus, string> = {
    full: '#0ea5e9', adequate: '#22d3ee', low: '#fbbf24', critical: '#f97316', empty: '#ef4444',
  };

  return (
    <svg width={180} height={140} className="mx-auto">
      {/* Elevation column */}
      <rect x={10} y={18} width={18} height={80} fill="#0f172a" stroke="#334155" strokeWidth={1} rx={2} />
      <rect x={12} y={20 + (1 - fillFrac) * 76} width={14} height={fillFrac * 76} fill={FILL_COLOR[status]} opacity={0.7} />
      <text x={19} y={112} textAnchor="middle" fill="#94a3b8" fontSize={9}>Elev.</text>
      <text x={19} y={122} textAnchor="middle" fill="#94a3b8" fontSize={9}>{elevationCm.toFixed(0)}cm</text>

      {/* Pipe down from reservoir */}
      <line x1={28} y1={58} x2={48} y2={58} stroke="#334155" strokeWidth={3} />
      <line x1={48} y1={20} x2={48} y2={115} stroke="#334155" strokeWidth={3} />

      {/* Main reservoir tank */}
      <rect x={55} y={tankY} width={80} height={tankH} fill="#0f172a" stroke="#475569" strokeWidth={1.5} rx={4} />
      <rect x={55} y={tankY + (tankH - fillH)} width={80} height={fillH} fill={FILL_COLOR[status]} opacity={0.75} rx={4} />

      {/* Tank labels */}
      <text x={95} y={tankY + 8} textAnchor="middle" fill="#64748b" fontSize={9}>Reservoir</text>
      <text x={95} y={tankY + tankH + 14} textAnchor="middle" fill={FILL_COLOR[status]} fontSize={10} fontWeight="bold">
        {volumeGallons.toFixed(2)} gal
      </text>

      {/* Pressure output arrow & label */}
      <line x1={135} y1={58} x2={165} y2={58} stroke="#a78bfa" strokeWidth={2} />
      <text x={155} y={72} textAnchor="middle" fill="#a78bfa" fontSize={9}>{pressurePsi} PSI</text>
      <text x={165} y={58} fill="#a78bfa" fontSize={12} textAnchor="middle">→</text>

      {/* Water Table label */}
      <rect x={55} y={105} width={80} height={16} fill="#0c1929" rx={3} />
      <text x={95} y={117} textAnchor="middle" fill="#64748b" fontSize={9}>Water Table</text>
    </svg>
  );
}

export const WaterTableGravityEngine: React.FC<WaterTableGravityEngineProps> = ({
  onEvent,
  initialTickMs = 800,
  className,
}) => {
  const { state, controls } = useWaterTableGravity(initialTickMs);

  const handleTick = () => {
    controls.tick();
    if (onEvent) {
      const type = state.status === 'low' || state.status === 'critical' ? 'RESERVOIR_LOW' : 'PRESSURE_TICK';
      onEvent({
        type,
        payload: {
          reservoirVolumeGallons: state.reservoirVolumeGallons,
          pressureOutputPsi: state.pressureOutputPsi,
          elevationCm: state.elevationCm,
          status: state.status,
          ts: Date.now(),
        },
      });
    }
  };

  const handleRainfall = (vol: number) => {
    controls.triggerRainfall(vol);
    if (onEvent) {
      onEvent({
        type: 'RAINFALL',
        payload: {
          reservoirVolumeGallons: state.reservoirVolumeGallons + vol,
          pressureOutputPsi: state.pressureOutputPsi,
          elevationCm: state.elevationCm,
          status: state.status,
          ts: Date.now(),
        },
      });
    }
  };

  const fillPct = (state.reservoirVolumeGallons / state.maxVolumeGallons) * 100;

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-blue-400">Water Table Gravity Engine</CardTitle>
          </div>
          <Badge variant="outline" className="border-blue-500 text-blue-400">MISS-012</Badge>
        </div>
        <CardDescription className="text-slate-400">
          5+ gallon elevated reservoir · Gravity-fed hydraulic power · No pumps
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="bg-slate-800 rounded-lg p-3">
          <ReservoirSVG
            volumeGallons={state.reservoirVolumeGallons}
            maxGallons={state.maxVolumeGallons}
            elevationCm={state.elevationCm}
            pressurePsi={state.pressureOutputPsi}
            status={state.status}
          />
        </div>

        {/* Status + fill bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className={cn('font-semibold uppercase', STATUS_COLORS[state.status])}>
              {state.status}
            </span>
            <span className="text-slate-400">{state.reservoirVolumeGallons.toFixed(2)} / {state.maxVolumeGallons} gal</span>
          </div>
          <Progress value={fillPct} className="h-2 bg-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Pressure</div>
            <div className="font-bold text-violet-300">{state.pressureOutputPsi} PSI</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Flow Rate</div>
            <div className="font-bold text-cyan-300">{state.flowRateGpm.toFixed(3)} GPM</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Power Out</div>
            <div className="font-bold text-green-300">{state.powerOutputWatts.toFixed(3)}W</div>
          </div>
        </div>

        {/* Rainfall events */}
        {state.rainfallEvents.filter(e => e.isActive).length > 0 && (
          <div className="bg-slate-800 rounded p-2 text-xs">
            <span className="text-blue-400">
              <CloudRain className="h-3 w-3 inline mr-1" />
              {state.rainfallEvents.filter(e => e.isActive).length} active rainfall event(s)
            </span>
            <span className="text-slate-400 ml-2">Total: {state.totalRainfallGallons} gal added</span>
          </div>
        )}

        <div className="text-center text-xs text-slate-500">
          Elevation: {state.elevationCm.toFixed(0)}cm · Turn {state.gameTurn} · {state.tickCount} ticks
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          {state.isRunning ? (
            <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={controls.pause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-blue-800 hover:bg-blue-700" onClick={controls.start}>
              <Play className="h-4 w-4 mr-1" /> Run Engine
            </Button>
          )}
          <Button size="sm" variant="outline" className="border-slate-600" onClick={handleTick} disabled={state.isRunning}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="border-cyan-700 text-cyan-400 hover:bg-cyan-900" onClick={() => handleRainfall(1.5)}>
            <CloudRain className="h-4 w-4 mr-1" /> Rain
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
