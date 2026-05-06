import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Droplets, GitBranch, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useBanyanTreeDistributionManifold,
} from '@/hooks/useBanyanTreeDistributionManifold';
import type {
  BanyanManifoldState,
  TeslaValveOrientation,
  ChannelLockBranch,
} from '@/hooks/useBanyanTreeDistributionManifold';

// Pheromone-style event shape
export interface BanyanManifoldEvent {
  type: 'MANIFOLD_INIT' | 'VALVE_CHANGE' | 'FLOW_TICK';
  payload: {
    manifoldPressure: number;
    totalFlowRate: number;
    branchId?: string;
    orientation?: TeslaValveOrientation;
    ts: number;
  };
}

interface BanyanTreeDistributionManifoldEngineProps {
  onEvent?: (event: BanyanManifoldEvent) => void;
  className?: string;
}

const VALVE_COLORS: Record<TeslaValveOrientation, string> = {
  open:    'bg-emerald-500',
  partial: 'bg-amber-500',
  closed:  'bg-red-600',
};

const VALVE_NEXT: Record<TeslaValveOrientation, TeslaValveOrientation> = {
  open: 'partial',
  partial: 'closed',
  closed: 'open',
};

function HexManifoldDiagram({ state }: { state: BanyanManifoldState }) {
  const cx = 110;
  const cy = 110;
  const coreR = 28;
  const branchLen = 65;
  const { branches, pressureKPa } = state.hollowLog;

  return (
    <svg width={220} height={220} className="mx-auto">
      {/* Branch flow lines */}
      {branches.map(b => {
        const rad = (b.angle - 90) * (Math.PI / 180);
        const ex = cx + branchLen * Math.cos(rad);
        const ey = cy + branchLen * Math.sin(rad);
        const flowOpacity = 0.2 + b.flowRate * 0.8;
        const strokeW = 2 + b.flowRate * 5;
        return (
          <g key={b.id}>
            <line
              x1={cx} y1={cy} x2={ex} y2={ey}
              stroke="#0ea5e9"
              strokeWidth={strokeW}
              opacity={flowOpacity}
              strokeLinecap="round"
            />
            {/* Valve terminal circle */}
            <circle
              cx={ex} cy={ey} r={10}
              fill={b.teslaOrientation === 'open' ? '#10b981' : b.teslaOrientation === 'partial' ? '#f59e0b' : '#ef4444'}
              opacity={0.9}
            />
            <text x={ex} y={ey + 4} textAnchor="middle" fontSize={8} fill="white" fontWeight="bold">
              {(b.flowRate * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}

      {/* HollowLog center */}
      <circle cx={cx} cy={cy} r={coreR} fill="#1e293b" stroke="#d97706" strokeWidth={3} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={9} fill="#fbbf24" fontWeight="bold">Hollow</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={9} fill="#fbbf24" fontWeight="bold">Log</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={8} fill="#94a3b8">{pressureKPa.toFixed(0)} kPa</text>
    </svg>
  );
}

function BranchControl({
  branch,
  onToggle,
}: {
  branch: ChannelLockBranch;
  onToggle: (id: string, next: TeslaValveOrientation) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-slate-800 rounded px-3 py-2">
      <div className="flex items-center gap-2">
        <GitBranch className="h-3 w-3 text-slate-400" />
        <span className="text-xs text-slate-300">Branch {branch.id.split('-')[1]}</span>
        <span className="text-xs text-slate-500">{branch.angle}°</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={branch.flowRate * 100} className="w-16 h-1.5 bg-slate-700" />
        <button
          onClick={() => onToggle(branch.id, VALVE_NEXT[branch.teslaOrientation])}
          className={cn('px-2 py-0.5 rounded text-xs font-bold text-white transition-colors', VALVE_COLORS[branch.teslaOrientation])}
        >
          {branch.teslaOrientation.toUpperCase()}
        </button>
      </div>
    </div>
  );
}

export const BanyanTreeDistributionManifoldEngine: React.FC<BanyanTreeDistributionManifoldEngineProps> = ({
  onEvent,
  className,
}) => {
  const { state, controls } = useBanyanTreeDistributionManifold();

  const handleInit = () => {
    controls.init(80);
    onEvent?.({ type: 'MANIFOLD_INIT', payload: { manifoldPressure: 72, totalFlowRate: 1, ts: Date.now() } });
  };

  const handleValveToggle = (branchId: string, next: TeslaValveOrientation) => {
    controls.setValve(branchId, next);
    onEvent?.({ type: 'VALVE_CHANGE', payload: { manifoldPressure: state.manifoldPressure, totalFlowRate: state.totalFlowRate, branchId, orientation: next, ts: Date.now() } });
  };

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-emerald-400">Banyan Tree Distribution Manifold</CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="border-amber-500 text-amber-400">MISS-007</Badge>
            <Badge variant="outline" className="border-slate-500 text-slate-400 text-xs">MISS-001 STUB</Badge>
          </div>
        </div>
        <CardDescription className="text-slate-400">
          HollowLog → 6 ChannelLock branches · Tesla valve flow control · MISS-001 interface stubbed
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hex manifold diagram */}
        <div className="bg-slate-800 rounded-lg p-3">
          <HexManifoldDiagram state={state} />
        </div>

        {/* Manifold stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Inlet Pressure</div>
            <div className="font-bold text-cyan-300">{state.hollowLog.pressureKPa.toFixed(1)} kPa</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Manifold P</div>
            <div className="font-bold text-emerald-300">{state.manifoldPressure.toFixed(1)} kPa</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Avg Flow</div>
            <div className="font-bold text-blue-300">{(state.totalFlowRate * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* MISS-001 stub notice */}
        <div className="border border-dashed border-slate-600 rounded p-2 text-xs text-slate-500 flex items-center gap-2">
          <Zap className="h-3 w-3 text-amber-500" />
          <span>MISS-001 interface stub — will wire to Wave 3 HollowLog root system when available</span>
        </div>

        {/* Branch controls */}
        <div className="space-y-1.5">
          {state.hollowLog.branches.map(b => (
            <BranchControl key={b.id} branch={b} onToggle={handleValveToggle} />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-emerald-700 hover:bg-emerald-600"
            onClick={handleInit}
          >
            <Droplets className="h-4 w-4 mr-1" />
            {state.isInitialized ? 'Re-Pressurize' : 'Pressurize'}
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.tick} disabled={!state.isInitialized}>
            Tick
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
