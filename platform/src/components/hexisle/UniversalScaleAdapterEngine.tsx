import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layers, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUniversalScaleAdapter } from '@/hooks/useUniversalScaleAdapter';
import type { ScaleMode, AdapterRing } from '@/hooks/useUniversalScaleAdapter';

export interface UniversalScaleAdapterEvent {
  type: 'SCALE_CHANGE' | 'RINGS_SNAPPED' | 'RINGS_RESET';
  payload: {
    targetScale: ScaleMode;
    totalHeightMm: number;
    compatibilityScore: number;
    ts: number;
  };
}

interface UniversalScaleAdapterEngineProps {
  onEvent?: (event: UniversalScaleAdapterEvent) => void;
  className?: string;
}

const SCALE_OPTIONS: ScaleMode[] = ['25mm', '28mm', '32mm'];

const RING_COLORS = ['#f59e0b', '#22d3ee', '#a78bfa'];

function HexelWithRings({
  ringsSnapped,
  totalHeightMm,
}: {
  ringsSnapped: number;
  totalHeightMm: number;
}) {
  const baseH = 35;
  const ringH = 8;
  const totalH = baseH + ringsSnapped * ringH;
  const cx = 70;

  return (
    <svg width={140} height={120} className="mx-auto">
      {/* Base Hexel */}
      {(() => {
        const r = 28;
        const by = 90;
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 - 30) * (Math.PI / 180);
          return `${cx + r * Math.cos(a)},${by + r * 0.4 * Math.sin(a)}`;
        }).join(' ');
        return (
          <g>
            <polygon points={pts} fill="#1e3a5f" stroke="#0ea5e9" strokeWidth={1.5} />
            <rect x={cx - r} y={90 - baseH} width={r * 2} height={baseH} fill="#0c2340" stroke="#0ea5e9" strokeWidth={1} rx={2} />
          </g>
        );
      })()}

      {/* Adapter rings stacked on base */}
      {Array.from({ length: ringsSnapped }, (_, i) => (
        <rect
          key={i}
          x={cx - 26}
          y={90 - baseH - (i + 1) * ringH}
          width={52}
          height={ringH}
          fill={RING_COLORS[i]}
          opacity={0.85}
          rx={2}
          stroke="white"
          strokeWidth={0.5}
          strokeOpacity={0.3}
        />
      ))}

      {/* Height label */}
      <text x={cx} y={110} textAnchor="middle" fill="#94a3b8" fontSize={10}>
        {totalHeightMm}mm total height
      </text>

      {/* Side height indicator */}
      <line x1={cx + 35} y1={90} x2={cx + 35} y2={90 - totalH * 0.8} stroke="#64748b" strokeWidth={1} strokeDasharray="2 2" />
      <text x={cx + 40} y={90 - totalH * 0.4} fill="#64748b" fontSize={9}>{totalHeightMm}mm</text>
    </svg>
  );
}

export const UniversalScaleAdapterEngine: React.FC<UniversalScaleAdapterEngineProps> = ({
  onEvent,
  className,
}) => {
  const { state, controls } = useUniversalScaleAdapter();

  const handleSetScale = (scale: ScaleMode) => {
    controls.setScale(scale);
    if (onEvent) {
      onEvent({
        type: 'SCALE_CHANGE',
        payload: { targetScale: scale, totalHeightMm: state.totalHeightMm, compatibilityScore: state.compatibilityScore, ts: Date.now() },
      });
    }
  };

  const handleSnap = () => {
    controls.snapRings();
    if (onEvent) {
      onEvent({
        type: 'RINGS_SNAPPED',
        payload: { targetScale: state.targetScale, totalHeightMm: state.totalHeightMm, compatibilityScore: state.compatibilityScore, ts: Date.now() },
      });
    }
  };

  const snappedCount = state.rings.filter((r: AdapterRing) => r.snapState === 'snapped' || r.snapState === 'locked').length;

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-amber-400">Universal Scale Adapter</CardTitle>
          </div>
          <Badge variant="outline" className="border-amber-500 text-amber-400">MISS-004</Badge>
        </div>
        <CardDescription className="text-slate-400">
          25mm / 28mm / 32mm · Concentric adapter rings · +1.5mm per ring
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Hexel visualization with rings */}
        <div className="bg-slate-800 rounded-lg p-4">
          <HexelWithRings ringsSnapped={snappedCount} totalHeightMm={state.totalHeightMm} />
        </div>

        {/* Scale selector */}
        <div className="flex gap-2">
          {SCALE_OPTIONS.map(scale => (
            <Button
              key={scale}
              size="sm"
              className={cn(
                'flex-1 border',
                state.targetScale === scale
                  ? 'bg-amber-700 border-amber-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
              )}
              onClick={() => handleSetScale(scale)}
            >
              {scale}
            </Button>
          ))}
        </div>

        {/* Ring status */}
        <div className="space-y-2">
          {state.rings.map((ring: AdapterRing, i: number) => (
            <div key={ring.id} className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded" style={{ background: RING_COLORS[i] }} />
              <span className="text-slate-400 w-16">Ring {ring.id} (+{ring.heightAddMm}mm)</span>
              <Progress
                value={(ring.snapState === 'snapped' || ring.snapState === 'locked') ? 100 : 0}
                className="flex-1 h-1.5 bg-slate-700"
              />
              <span className={cn('w-16 text-right', ring.isRequired ? 'text-amber-400' : 'text-slate-500')}>
                {ring.snapState === 'snapped' ? '✓ snapped' : ring.isRequired ? 'needed' : 'unused'}
              </span>
            </div>
          ))}
        </div>

        {/* Compatibility score */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Compatibility Score</span>
            <span>{state.compatibilityScore}%</span>
          </div>
          <Progress value={state.compatibilityScore} className="h-2 bg-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Active Scale</div>
            <div className="font-bold text-amber-300">{state.activeScale}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Total Height</div>
            <div className="font-bold text-cyan-300">{state.totalHeightMm}mm</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Minis Fit</div>
            <div className="font-bold text-violet-300">{state.miniatureCount}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-amber-800 hover:bg-amber-700"
            onClick={handleSnap}
            disabled={state.snapComplete}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Snap Rings
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.resetRings}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {state.snapComplete && (
          <div className="text-center text-xs text-green-400">
            ✓ Scale set to {state.activeScale} · {state.ringChangeCount} ring change{state.ringChangeCount !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
