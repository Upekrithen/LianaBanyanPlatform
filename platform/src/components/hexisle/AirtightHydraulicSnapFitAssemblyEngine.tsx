import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, RotateCcw, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAirtightHydraulicSnapFitAssembly,
} from '@/hooks/useAirtightHydraulicSnapFitAssembly';
import type {
  RootLockSnapState,
  SnapFitStatus,
  SealIntegrity,
  ConnectionPoint,
} from '@/hooks/useAirtightHydraulicSnapFitAssembly';

// Pheromone-style event shape
export interface SnapFitAssemblyEvent {
  type: 'POINT_SNAPPED' | 'ALL_SEALED' | 'PRESSURIZED' | 'POINT_RELEASED';
  payload: {
    pointId?: string;
    snapCount: number;
    sealedCount: number;
    isAirtight: boolean;
    systemPressureBar: number;
    ts: number;
  };
}

interface AirtightHydraulicSnapFitAssemblyEngineProps {
  onEvent?: (event: SnapFitAssemblyEvent) => void;
  className?: string;
}

const SEAL_COLORS: Record<SealIntegrity, string> = {
  none:        'bg-slate-700',
  partial:     'bg-amber-500',
  airtight:    'bg-emerald-500',
  pressurized: 'bg-cyan-400',
};

const SNAP_STATUS_LABELS: Record<SnapFitStatus, string> = {
  unconnected: 'Open',
  engaging:    'Engaging',
  snapped:     'Snapped',
  sealed:      'Sealed',
  leak:        'Leak!',
};

// Hex ring layout: 6 points at 60° intervals
function HexSnapDiagram({
  state,
  onPointClick,
}: {
  state: RootLockSnapState;
  onPointClick: (id: string) => void;
}) {
  const cx = 100;
  const cy = 100;
  const r = 65;

  return (
    <svg width={200} height={200} className="mx-auto">
      {/* Hex outline */}
      <polygon
        points={Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 - 30) * (Math.PI / 180);
          return `${cx + r * 0.75 * Math.cos(a)},${cy + r * 0.75 * Math.sin(a)}`;
        }).join(' ')}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth={1.5}
      />

      {/* Connection points */}
      {state.connectionPoints.map((cp, i) => {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        const isSealed = cp.snapStatus === 'sealed';
        const isSnapped = cp.snapStatus === 'snapped';
        const color = isSealed ? '#10b981' : isSnapped ? '#f59e0b' : '#475569';

        return (
          <g key={cp.id} onClick={() => onPointClick(cp.id)} style={{ cursor: 'pointer' }}>
            {/* Force feedback ring — size proportional to snap force */}
            {cp.snapForceN > 0 && (
              <circle
                cx={px} cy={py}
                r={8 + cp.snapForceN * 0.18}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.3}
              />
            )}
            <circle cx={px} cy={py} r={10} fill={color} opacity={0.9} />
            <text x={px} y={py + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight="bold">
              {cp.label}
            </text>
            {/* Snap force label */}
            {cp.snapForceN > 0 && (
              <text x={px} y={py + 18} textAnchor="middle" fontSize={7} fill="#94a3b8">
                {cp.snapForceN}N
              </text>
            )}
          </g>
        );
      })}

      {/* Center — system state */}
      <circle cx={cx} cy={cy} r={22} fill="#0f172a" stroke={state.isAirtight ? '#10b981' : '#475569'} strokeWidth={2} />
      {state.isAirtight
        ? <Lock x={cx - 8} y={cy - 10} width={16} height={16} color="#10b981" />
        : <Unlock x={cx - 8} y={cy - 10} width={16} height={16} color="#64748b" />
      }
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={8} fill={state.isAirtight ? '#10b981' : '#64748b'}>
        {state.systemPressureBar > 0 ? `${state.systemPressureBar.toFixed(1)} bar` : state.isAirtight ? 'Sealed' : 'Open'}
      </text>
    </svg>
  );
}

function ConnectionRow({ cp, onSnap, onRelease }: {
  cp: ConnectionPoint;
  onSnap: (id: string) => void;
  onRelease: (id: string) => void;
}) {
  const isSealed = cp.snapStatus === 'sealed';
  return (
    <div className="flex items-center justify-between bg-slate-800 rounded px-3 py-1.5">
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', SEAL_COLORS[cp.sealIntegrity])} />
        <span className="text-xs font-mono text-slate-300 w-6">{cp.label}</span>
        <span className="text-[10px] text-slate-500">{SNAP_STATUS_LABELS[cp.snapStatus]}</span>
        {cp.snapForceN > 0 && (
          <span className="text-[10px] text-cyan-600">{cp.snapForceN}N</span>
        )}
      </div>
      <div className="flex gap-1">
        {!isSealed ? (
          <button onClick={() => onSnap(cp.id)} className="text-[10px] bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-0.5 rounded">
            Snap
          </button>
        ) : (
          <button onClick={() => onRelease(cp.id)} className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded">
            Release
          </button>
        )}
      </div>
    </div>
  );
}

export const AirtightHydraulicSnapFitAssemblyEngine: React.FC<AirtightHydraulicSnapFitAssemblyEngineProps> = ({
  onEvent,
  className,
}) => {
  const { state, controls } = useAirtightHydraulicSnapFitAssembly();
  const [targetPressure, setTargetPressure] = useState(2.5);

  const handleSnap = (id: string) => {
    controls.snapPoint(id);
    onEvent?.({ type: 'POINT_SNAPPED', payload: { pointId: id, snapCount: state.snapCount + 1, sealedCount: state.sealedCount, isAirtight: state.isAirtight, systemPressureBar: state.systemPressureBar, ts: Date.now() } });
  };

  const handleSnapAll = () => {
    controls.snapAll();
    onEvent?.({ type: 'ALL_SEALED', payload: { snapCount: 6, sealedCount: 6, isAirtight: true, systemPressureBar: state.systemPressureBar, ts: Date.now() } });
  };

  const handlePressurize = () => {
    controls.pressurize(targetPressure);
    onEvent?.({ type: 'PRESSURIZED', payload: { snapCount: state.snapCount, sealedCount: state.sealedCount, isAirtight: state.isAirtight, systemPressureBar: targetPressure, ts: Date.now() } });
  };

  const sealPct = (state.sealedCount / 6) * 100;

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-emerald-400">Airtight Hydraulic Snap-Fit Assembly</CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="border-amber-500 text-amber-400">STUB-007</Badge>
            <Badge variant="outline" className="border-slate-500 text-slate-400 text-xs">MISS-001 STUB</Badge>
          </div>
        </div>
        <CardDescription className="text-slate-400">
          RootLock snap-fit · pressure-seal integrity · snap-force feedback · sim pending MISS-001
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hex snap diagram */}
        <div className="bg-slate-800 rounded-lg p-3">
          <HexSnapDiagram state={state} onPointClick={handleSnap} />
        </div>

        {/* Seal integrity bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Seal Integrity</span>
            <span className={cn('font-bold', state.isAirtight ? 'text-emerald-400' : 'text-amber-400')}>
              {state.sealedCount}/6 sealed · {state.overallSealIntegrity.toUpperCase()}
            </span>
          </div>
          <Progress value={sealPct} className="h-2 bg-slate-700" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Snapped</div>
            <div className="font-bold text-amber-300">{state.snapCount}/6</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">System P</div>
            <div className="font-bold text-cyan-300">{state.systemPressureBar.toFixed(1)} bar</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Airtight</div>
            <div className="font-bold">
              {state.isAirtight
                ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                : <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />
              }
            </div>
          </div>
        </div>

        {/* MISS-001 stub notice */}
        <div className="border border-dashed border-slate-600 rounded p-2 text-xs text-slate-500 flex items-center gap-2">
          <Zap className="h-3 w-3 text-amber-500 shrink-0" />
          <span>{state.simulationStubNote}</span>
        </div>

        {/* Connection points */}
        <div className="space-y-1">
          {state.connectionPoints.map(cp => (
            <ConnectionRow key={cp.id} cp={cp} onSnap={handleSnap} onRelease={controls.releasePoint} />
          ))}
        </div>

        {/* Pressurize control */}
        <div className="flex items-center gap-2 bg-slate-800 rounded p-2">
          <span className="text-xs text-slate-400">Target:</span>
          <input
            type="range"
            min={0.5}
            max={6}
            step={0.5}
            value={targetPressure}
            onChange={e => setTargetPressure(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-cyan-300 w-14 text-right">{targetPressure} bar</span>
          <Button
            size="sm"
            className="bg-cyan-700 hover:bg-cyan-600"
            onClick={handlePressurize}
            disabled={!state.isAirtight}
          >
            Pressurize
          </Button>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-emerald-700 hover:bg-emerald-600" onClick={handleSnapAll}>
            <Lock className="h-4 w-4 mr-1" /> Snap All
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.releaseAll}>
            <Unlock className="h-4 w-4 mr-1" /> Release
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
