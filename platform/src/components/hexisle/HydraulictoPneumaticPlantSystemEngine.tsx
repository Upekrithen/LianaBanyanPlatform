/**
 * HydraulictoPneumaticPlantSystemEngine
 * ========================================
 * MISS-005 — Hydraulic-to-Pneumatic Plant System
 * Wave 2 / Old One: urIm / Bushel 29 (BP025)
 *
 * Depends on MISS-001 (Inverse Hydraulic Coupling) — interface implemented below.
 *
 * Water pressure at the Hexel base converts to air pressure for above-water
 * plant mechanisms. Differential pressure seal at 5mm lift point enables
 * pneumatic actuation without external pumps.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useHydraulictoPneumaticPlantSystem } from '@/hooks/useHydraulictoPneumaticPlantSystem';
import { Waves, Wind, Leaf, ArrowUpDown, Play, Square, RotateCcw } from 'lucide-react';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface HydraulictoPneumaticPlantSystemEngineProps {
  /** Override initial water pressure (psi). Defaults to 1.30 psi (3-ft head). */
  initialPressurePsi?: number;
  className?: string;
}

// ── Pressure bar helper ───────────────────────────────────────────────────────

const PressureBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({
  label, value, max, color,
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{label}</span>
      <span className="font-mono">{value.toFixed(2)} psi</span>
    </div>
    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-100"
        style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

// ── Piston diagram ────────────────────────────────────────────────────────────

const PistonDiagram: React.FC<{ aDisp: number; bDisp: number; sealLift: number; threshold: number }> = ({
  aDisp, bDisp, sealLift, threshold,
}) => {
  const aY = 50 - (aDisp / 12) * 30;
  const bY = 50 + (aDisp / 12) * 30; // inverse
  const sealY = 68 - Math.min((sealLift / 12) * 20, 20);
  const sealed = sealLift >= threshold;

  return (
    <svg viewBox="0 0 200 120" className="w-full h-32 bg-slate-900 rounded-lg">
      {/* Water zone */}
      <rect x="0" y="70" width="200" height="50" fill="#1e40af" opacity="0.4" />
      <text x="4" y="118" fontSize="7" fill="#93c5fd">WATER (hydraulic)</text>

      {/* Air zone */}
      <rect x="0" y="0" width="200" height="70" fill="#0f172a" opacity="0.3" />
      <text x="4" y="10" fontSize="7" fill="#86efac">AIR (pneumatic)</text>

      {/* Piston A */}
      <rect x="20" y={aY - 6} width="30" height="12" rx="2" fill="#3b82f6" />
      <text x="35" y={aY + 4} textAnchor="middle" fontSize="7" fill="white">A</text>
      <line x1="35" x2="35" y1={aY + 6} y2="90" stroke="#60a5fa" strokeWidth="2" />

      {/* Piston B */}
      <rect x="70" y={bY - 6} width="30" height="12" rx="2" fill="#8b5cf6" />
      <text x="85" y={bY + 4} textAnchor="middle" fontSize="7" fill="white">B</text>
      <line x1="85" x2="85" y1={bY + 6} y2="90" stroke="#a78bfa" strokeWidth="2" />

      {/* Linkage arrow */}
      <text x="57" y="50" fontSize="8" fill="#fbbf24">⇌</text>

      {/* Differential seal */}
      <rect
        x="120" y={sealY} width="60" height="8" rx="2"
        fill={sealed ? '#22c55e' : '#94a3b8'}
        stroke={sealed ? '#16a34a' : '#64748b'}
        strokeWidth="1"
      />
      <text x="150" y={sealY + 6} textAnchor="middle" fontSize="6" fill="white">
        {sealed ? 'SEALED ✓' : `SEAL (${sealLift.toFixed(1)}mm)`}
      </text>

      {/* Plant mechanism */}
      {sealed && (
        <g transform="translate(150, 20)">
          <line x1="0" y1="0" x2="0" y2="-14" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
          <line x1="0" y1="-8" x2="8" y2="-18" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-12" x2="-6" y2="-20" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="-14" r="3" fill="#86efac" />
        </g>
      )}

      {/* Threshold line */}
      <line x1="110" x2="190" y1="68" y2="68" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="3,2" />
      <text x="112" y="66" fontSize="5" fill="#fbbf24">5mm threshold</text>
    </svg>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const HydraulictoPneumaticPlantSystemEngine: React.FC<HydraulictoPneumaticPlantSystemEngineProps> = ({
  initialPressurePsi: _initialPressurePsi,
  className,
}) => {
  const {
    state,
    drivePistonA,
    setWaterPressure,
    toggleSimulation,
    reset,
    SEAL_LIFT_THRESHOLD_MM,
  } = useHydraulictoPneumaticPlantSystem();

  const { inverse, pneumatic, running, tick, eventLog } = state;

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Waves className="w-5 h-5 text-blue-400" />
              MISS-005 — Hydraulic-to-Pneumatic Plant System
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">Wave 2</Badge>
              <Badge variant="outline" className="text-purple-400 border-purple-400">urIm</Badge>
              <Badge className={pneumatic.actuationEngaged ? 'bg-green-600' : 'bg-slate-600'}>
                {pneumatic.actuationEngaged ? 'Actuating' : 'Idle'}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Water pressure at Hexel base → air pressure for above-water plant mechanisms.
            Differential pressure seal engages at <strong>5mm</strong> lift — no external pumps.
          </p>
        </CardHeader>
      </Card>

      {/* Diagram + Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-blue-400" />
              Pressure Conversion Diagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PistonDiagram
              aDisp={inverse.pistonADisplacementMm}
              bDisp={inverse.pistonBDisplacementMm}
              sealLift={pneumatic.sealLiftMm}
              threshold={SEAL_LIFT_THRESHOLD_MM}
            />

            <div className="mt-3 space-y-2">
              <PressureBar
                label="Water Pressure (Hydraulic)"
                value={inverse.waterPressurePsi}
                max={4}
                color="#3b82f6"
              />
              <PressureBar
                label="Air Pressure (Pneumatic)"
                value={pneumatic.airPressurePsi}
                max={4}
                color="#22c55e"
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800 rounded p-2">
                <div className="font-mono text-blue-400">{inverse.pistonADisplacementMm.toFixed(1)}mm</div>
                <div className="text-muted-foreground">Piston A</div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="font-mono text-purple-400">{inverse.pistonBDisplacementMm.toFixed(1)}mm</div>
                <div className="text-muted-foreground">Piston B</div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="font-mono text-yellow-400">{pneumatic.sealLiftMm.toFixed(1)}mm</div>
                <div className="text-muted-foreground">Seal Lift</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-400" />
              Plant Mechanism State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plant angle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative w-20 h-20 flex items-end justify-center"
                style={{ perspective: '200px' }}
              >
                <div
                  className="w-3 bg-gradient-to-t from-green-800 to-green-400 rounded-t-full transition-all duration-150 origin-bottom"
                  style={{
                    height: `${20 + pneumatic.plantMechanismAngleDeg * 0.4}px`,
                    transform: `rotate(${(pneumatic.plantMechanismAngleDeg - 45) * 0.6}deg)`,
                  }}
                />
              </div>
              <div className="text-center">
                <div className="font-mono text-2xl text-green-400">
                  {pneumatic.plantMechanismAngleDeg.toFixed(0)}°
                </div>
                <div className="text-xs text-muted-foreground">Plant mechanism angle</div>
              </div>
            </div>

            {/* Water pressure slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Water Pressure</span>
                <span className="font-mono">{inverse.waterPressurePsi.toFixed(2)} psi</span>
              </div>
              <Slider
                min={0.5}
                max={4}
                step={0.05}
                value={[inverse.waterPressurePsi]}
                onValueChange={([v]) => setWaterPressure(v)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5 psi (low head)</span>
                <span>4.0 psi (max)</span>
              </div>
            </div>

            {/* Manual piston drive */}
            {!running && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Manual Piston A Drive</span>
                  <span className="font-mono">{inverse.pistonADisplacementMm.toFixed(1)}mm</span>
                </div>
                <Slider
                  min={-12}
                  max={12}
                  step={0.5}
                  value={[inverse.pistonADisplacementMm]}
                  onValueChange={([v]) => drivePistonA(v)}
                />
              </div>
            )}

            {/* Actuator status */}
            <div className={`rounded-lg p-3 border ${pneumatic.actuationEngaged ? 'border-green-500 bg-green-950' : 'border-slate-700 bg-slate-900'}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wind className={`w-4 h-4 ${pneumatic.actuationEngaged ? 'text-green-400' : 'text-slate-500'}`} />
                {pneumatic.actuationEngaged
                  ? `Pneumatic actuation active — ${pneumatic.airPressurePsi.toFixed(2)} psi`
                  : `Below threshold (${pneumatic.sealLiftMm.toFixed(1)} / ${SEAL_LIFT_THRESHOLD_MM}mm)`}
              </div>
              {inverse.linkageActive && (
                <div className="text-xs text-blue-400 mt-1">Inverse hydraulic linkage engaged</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls + Log */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Button size="sm" variant={running ? 'destructive' : 'default'} onClick={toggleSimulation}>
              {running ? <><Square className="w-3 h-3 mr-1" />Stop</> : <><Play className="w-3 h-3 mr-1" />Simulate</>}
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-3 h-3 mr-1" />Reset
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">Tick: {tick}</span>
          </div>

          <div className="bg-slate-900 rounded-lg p-2 h-28 overflow-y-auto font-mono text-xs space-y-0.5">
            {eventLog.length === 0 ? (
              <div className="text-slate-500">No events yet — drive a piston or start simulation.</div>
            ) : (
              eventLog.map((entry, i) => (
                <div key={i} className="text-slate-300">{entry}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spec reference */}
      <div className="text-xs text-muted-foreground bg-slate-900 rounded p-2">
        <strong>Patent ref:</strong> Innovation #10 (Mechanical) — Hydraulic-to-Pneumatic Plant System.
        Depends on Innovation #2 — Inverse Hydraulic Coupling (MISS-001).
        Seal threshold: 5mm differential lift. Conversion ratio: ×0.72.
      </div>
    </div>
  );
};
