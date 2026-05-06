import React, { useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, SkipForward } from 'lucide-react';
import { OuralisClockContext } from '@/components/hexisle/OuralisClockContext';
import { useClockasGameStateController, TIDE_PHASES } from '@/hooks/useClockasGameStateController';

// STUB-003 — Clock-as-Game-State Controller Engine
// Ouralis wired as game clock: OuralisClock React context + 12-step rotation state.
// QuestSystem subscription to OuralisClock.tick event is handled in QuestSystem.tsx.

export interface ClockasGameStateControllerEngineProps {
  className?: string;
  onTick?: (step: number, phase: string, turn: number) => void;
}

const STEP_COLORS = [
  '#3b82f6','#60a5fa','#93c5fd','#bfdbfe',
  '#22c55e','#4ade80','#86efac','#bbf7d0',
  '#f59e0b','#fbbf24','#fcd34d','#fde68a',
];

function ClockFace({ step, totalSteps = 12 }: { step: number; totalSteps?: number }) {
  const CX = 90, CY = 90, R = 70, INNER = 42;
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" className="block mx-auto">
      {/* Track ring */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#334155" strokeWidth={18} />

      {/* Step segments */}
      {steps.map(i => {
        const startAngle = (i / totalSteps) * 2 * Math.PI - Math.PI / 2;
        const endAngle = ((i + 1) / totalSteps) * 2 * Math.PI - Math.PI / 2;
        const gap = 0.04;
        const sa = startAngle + gap;
        const ea = endAngle - gap;
        const x1 = CX + (R - 9) * Math.cos(sa);
        const y1 = CY + (R - 9) * Math.sin(sa);
        const x2 = CX + (R - 9) * Math.cos(ea);
        const y2 = CY + (R - 9) * Math.sin(ea);
        const x3 = CX + (R + 9) * Math.cos(ea);
        const y3 = CY + (R + 9) * Math.sin(ea);
        const x4 = CX + (R + 9) * Math.cos(sa);
        const y4 = CY + (R + 9) * Math.sin(sa);
        const isActive = i === step;
        const isPast = i < step;

        return (
          <path
            key={i}
            d={`M${x1},${y1} A${R-9},${R-9} 0 0,1 ${x2},${y2} L${x3},${y3} A${R+9},${R+9} 0 0,0 ${x4},${y4} Z`}
            fill={isActive ? STEP_COLORS[i] : isPast ? STEP_COLORS[i] + '80' : '#1e293b'}
            stroke={isActive ? STEP_COLORS[i] : 'none'}
            strokeWidth={isActive ? 1.5 : 0}
            opacity={isActive ? 1 : isPast ? 0.6 : 0.35}
          >
            {isActive && (
              <animate attributeName="opacity" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite" />
            )}
          </path>
        );
      })}

      {/* Step numbers */}
      {steps.map(i => {
        const angle = (i / totalSteps) * 2 * Math.PI - Math.PI / 2;
        const tx = CX + R * Math.cos(angle);
        const ty = CY + R * Math.sin(angle);
        return (
          <text
            key={i}
            x={tx} y={ty + 4}
            fill={i === step ? '#fff' : '#64748b'}
            fontSize={9}
            textAnchor="middle"
            fontWeight={i === step ? 'bold' : 'normal'}
          >
            {i + 1}
          </text>
        );
      })}

      {/* Center info */}
      <circle cx={CX} cy={CY} r={INNER} fill="#0f172a" stroke="#1e293b" strokeWidth={1} />
      <text x={CX} y={CY - 10} fill="#94a3b8" fontSize={9} textAnchor="middle">STEP</text>
      <text x={CX} y={CY + 6} fill={STEP_COLORS[step]} fontSize={22} fontWeight="bold" textAnchor="middle">
        {step + 1}
      </text>
      <text x={CX} y={CY + 20} fill="#64748b" fontSize={8} textAnchor="middle">/ 12</text>
    </svg>
  );
}

export const ClockasGameStateControllerEngine: React.FC<ClockasGameStateControllerEngineProps> = ({
  className = '',
  onTick,
}) => {
  const clock = useContext(OuralisClockContext);
  const { turn, addQuestToTurn } = useClockasGameStateController();

  // External tick callback
  useEffect(() => {
    if (!onTick) return;
    const unsub = clock.subscribe(onTick);
    return unsub;
  }, [clock, onTick]);

  const phaseLabel = turn.phase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const effect = turn.phaseEffects[turn.phase];

  return (
    <Card className={`bg-slate-900 border-indigo-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-indigo-200">
          <Clock className="w-5 h-5 text-indigo-400" />
          STUB-003 — Clock-as-Game-State Controller
          <Badge className="ml-auto bg-indigo-900 text-indigo-100 text-xs">Wave 2 · urUtt</Badge>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Ouralis 12-step tidal clock wired as game turn engine.
          One full rotation = one game turn.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ClockFace step={clock.step} />

        {/* Phase info */}
        <div className="bg-slate-800 rounded p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Current Phase</div>
          <div className="text-lg font-bold" style={{ color: STEP_COLORS[clock.step] }}>
            {phaseLabel}
          </div>
          <div className="text-xs text-slate-300 mt-1 italic">"{effect}"</div>
        </div>

        {/* Turn stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Turn</div>
            <div className="text-indigo-400 font-mono font-bold text-lg">{clock.turnNumber + 1}</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Total Ticks</div>
            <div className="text-purple-400 font-mono font-bold text-lg">{clock.totalTicks}</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Interval</div>
            <div className="text-slate-300 font-mono">{(clock.tickIntervalMs / 1000).toFixed(1)}s</div>
          </div>
        </div>

        {/* All 12 phases legend */}
        <div className="space-y-1">
          <div className="text-xs text-slate-400 mb-2">12-Step Tide Rotation</div>
          <div className="grid grid-cols-2 gap-1">
            {TIDE_PHASES.map((phase, i) => (
              <div
                key={phase}
                className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 transition-all ${
                  i === clock.step ? 'bg-slate-700 ring-1' : 'bg-slate-800/50'
                }`}
                style={i === clock.step ? { ringColor: STEP_COLORS[i] } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: STEP_COLORS[i], opacity: i <= clock.step ? 1 : 0.35 }}
                />
                <span className={i === clock.step ? 'text-white font-medium' : 'text-slate-400'}>
                  {i + 1}. {phase.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Speed control */}
        <div>
          <label className="text-xs text-slate-300 mb-1 block">
            Tick Speed: <span className="font-mono text-indigo-400">{(clock.tickIntervalMs / 1000).toFixed(1)}s / step</span>
          </label>
          <input
            type="range" min={500} max={10000} step={500}
            value={clock.tickIntervalMs}
            onChange={e => clock.setTickInterval(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Fast (0.5s)</span><span>Slow (10s)</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={clock.isRunning ? 'destructive' : 'default'}
            onClick={clock.isRunning ? clock.stop : clock.start}
            className="flex-1"
          >
            {clock.isRunning
              ? <><Square className="w-4 h-4 mr-1" />Stop Clock</>
              : <><Play className="w-4 h-4 mr-1" />Start Clock</>
            }
          </Button>
          <Button size="sm" variant="outline" onClick={clock.manualTick}>
            <SkipForward className="w-4 h-4 mr-1" />
            Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
