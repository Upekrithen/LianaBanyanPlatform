/**
 * EnergyInnovationCluster2427Engine
 * =====================================
 * MISS-013 — Energy Innovation Cluster (#24-27)
 * Wave 2 / Old One: urIm / Bushel 29 (BP025)
 *
 * Depends on MISS-006 (AC Pressure) + MISS-012 (Water Table) — interface stubs injected.
 *
 * Four energy sub-innovations modeled as tabs:
 *   Tab #24 — Solar-Assisted Pump Integration
 *   Tab #25 — Piezoelectric Harvest from Hexel Vibration
 *   Tab #26 — Kinetic-to-Hydraulic from Player Movement
 *   Tab #27 — Battery-Free LED via Flow-Driven Dynamo
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  useEnergyInnovationCluster2427,
  type ACPressureInterface,
  type WaterTableInterface,
} from '@/hooks/useEnergyInnovationCluster2427';
import {
  Sun, Zap, Footprints, Lightbulb, Play, Square, RotateCcw,
} from 'lucide-react';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface EnergyInnovationCluster2427EngineProps {
  acPressureOverride?: Partial<ACPressureInterface>;
  waterTableOverride?: Partial<WaterTableInterface>;
  className?: string;
}

// ── Mini stat tile ────────────────────────────────────────────────────────────

const StatTile: React.FC<{ label: string; value: string; unit: string; color?: string }> = ({
  label, value, unit, color = 'text-slate-200',
}) => (
  <div className="bg-slate-800 rounded-lg p-3 text-center">
    <div className={`font-mono text-xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-muted-foreground">{unit}</div>
    <div className="text-xs text-slate-400 mt-0.5">{label}</div>
  </div>
);

// ── Tab #24: Solar ────────────────────────────────────────────────────────────

const SolarTab: React.FC<{
  solar: ReturnType<typeof useEnergyInnovationCluster2427>['state']['solar'];
  setIrradiance: (v: number) => void;
  setPanelTilt: (v: number) => void;
  running: boolean;
}> = ({ solar, setIrradiance, setPanelTilt, running }) => (
  <div className="space-y-4 mt-2">
    <div className="grid grid-cols-3 gap-2">
      <StatTile label="Irradiance" value={solar.irradianceWm2.toFixed(0)} unit="W/m²" color="text-yellow-400" />
      <StatTile label="Pump Boost" value={`×${solar.pumpBoostFactor.toFixed(2)}`} unit="multiplier" color="text-orange-400" />
      <StatTile label="Effective Flow" value={solar.effectiveFlowMlPerSec.toFixed(1)} unit="mL/s" color="text-blue-400" />
    </div>

    {/* Solar panel visual */}
    <div className="bg-slate-900 rounded-lg p-4 flex items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <Sun className="w-8 h-8 text-yellow-400" style={{ opacity: solar.irradianceWm2 / 1000 }} />
        <span className="text-xs text-yellow-400">{solar.irradianceWm2} W/m²</span>
      </div>
      <div className="text-slate-500 text-2xl">→</div>
      <div
        className="w-14 h-10 bg-gradient-to-br from-blue-800 to-blue-600 rounded border border-blue-500 flex items-center justify-center text-xs text-blue-200 font-bold"
        style={{ transform: `rotate(${-(solar.panelTiltDeg - 35)}deg)` }}
      >
        PV Panel
      </div>
      <div className="text-slate-500 text-2xl">→</div>
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="w-8 h-8 bg-blue-900 rounded-full border border-blue-400 flex items-center justify-center text-xs">💧</div>
        <span className="text-xs text-blue-400">{solar.effectiveFlowMlPerSec.toFixed(1)} mL/s</span>
      </div>
    </div>

    {!running && (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Solar Irradiance</span>
            <span className="font-mono">{solar.irradianceWm2} W/m²</span>
          </div>
          <Slider min={0} max={1000} step={10} value={[solar.irradianceWm2]} onValueChange={([v]) => setIrradiance(v)} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Panel Tilt</span>
            <span className="font-mono">{solar.panelTiltDeg}°</span>
          </div>
          <Slider min={0} max={90} step={1} value={[solar.panelTiltDeg]} onValueChange={([v]) => setPanelTilt(v)} />
        </div>
      </div>
    )}

    <p className="text-xs text-muted-foreground">
      Solar panel supplements the gravity-fed water pump, increasing flow rate up to ×1.4 at peak irradiance (1000 W/m²). Panel tilt optimizes seasonal angle.
    </p>
  </div>
);

// ── Tab #25: Piezoelectric ────────────────────────────────────────────────────

const PiezoTab: React.FC<{
  piezo: ReturnType<typeof useEnergyInnovationCluster2427>['state']['piezo'];
  acPressure: ReturnType<typeof useEnergyInnovationCluster2427>['state']['acPressure'];
  setVibration: (v: number) => void;
  running: boolean;
}> = ({ piezo, acPressure, setVibration, running }) => (
  <div className="space-y-4 mt-2">
    <div className="grid grid-cols-3 gap-2">
      <StatTile label="Vibration" value={(piezo.vibrationAmplitude * 100).toFixed(0)} unit="% amplitude" color="text-violet-400" />
      <StatTile label="Harvested" value={piezo.harvestedMicrowatts.toFixed(0)} unit="µW" color="text-purple-400" />
      <StatTile label="Accumulated" value={piezo.accumulatedEnergyMj.toFixed(2)} unit="mJ" color="text-pink-400" />
    </div>

    {/* Piezo array visual */}
    <div className="bg-slate-900 rounded-lg p-3">
      <div className="text-xs text-muted-foreground mb-2">Piezo Array ({piezo.arrayCount} elements)</div>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: piezo.arrayCount }).map((_, i) => (
          <div
            key={i}
            className="w-6 h-8 rounded-sm border border-violet-700 transition-all duration-100"
            style={{
              backgroundColor: `hsl(270, 70%, ${20 + piezo.vibrationAmplitude * 40}%)`,
              transform: `scaleY(${0.6 + piezo.vibrationAmplitude * 0.8 * (0.7 + Math.sin(i * 1.3) * 0.3)})`,
            }}
          />
        ))}
      </div>
    </div>

    <div className="bg-slate-900 rounded p-2 text-xs text-slate-400 space-y-1">
      <div>AC Pressure input: <span className="text-blue-400">{acPressure.peakPressurePsi.toFixed(2)} psi @ {acPressure.acFrequencyHz} Hz</span></div>
      <div>Waveform: <span className={acPressure.waveformActive ? 'text-green-400' : 'text-red-400'}>{acPressure.waveformActive ? 'Active' : 'Inactive'}</span></div>
    </div>

    {!running && (
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Vibration Amplitude</span>
          <span className="font-mono">{(piezo.vibrationAmplitude * 100).toFixed(0)}%</span>
        </div>
        <Slider min={0} max={1} step={0.01} value={[piezo.vibrationAmplitude]} onValueChange={([v]) => setVibration(v)} />
      </div>
    )}

    <p className="text-xs text-muted-foreground">
      Each Hexel contains piezoelectric crystals in the base. AC pressure waves (MISS-006) and player-induced vibration generate harvestable microwatts. 12-element array per Hexel.
    </p>
  </div>
);

// ── Tab #26: Kinetic ──────────────────────────────────────────────────────────

const KineticTab: React.FC<{
  kinetic: ReturnType<typeof useEnergyInnovationCluster2427>['state']['kinetic'];
  triggerStep: () => void;
  running: boolean;
}> = ({ kinetic, triggerStep, running }) => (
  <div className="space-y-4 mt-2">
    <div className="grid grid-cols-3 gap-2">
      <StatTile label="Player Steps" value={kinetic.playerSteps.toFixed(0)} unit="steps" color="text-green-400" />
      <StatTile label="Flywheel" value={kinetic.flywheelChargePct.toFixed(0)} unit="% charged" color="text-teal-400" />
      <StatTile label="Hydraulic Boost" value={`+${kinetic.hydraulicBoostPsi.toFixed(2)}`} unit="psi" color="text-blue-400" />
    </div>

    {/* Flywheel indicator */}
    <div className="bg-slate-900 rounded-lg p-4 flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke="#14b8a6" strokeWidth="10"
            strokeDasharray={`${kinetic.flywheelChargePct * 2.51} 251`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold text-teal-400">{kinetic.flywheelChargePct.toFixed(0)}%</span>
          <span className="text-xs text-muted-foreground">flywheel</span>
        </div>
      </div>
      <div className="text-xs text-slate-400">
        Energy per step: <span className="text-teal-300">{kinetic.energyPerStepMj} mJ</span>
      </div>
    </div>

    {!running && (
      <Button
        onClick={triggerStep}
        className="w-full"
        variant="outline"
      >
        <Footprints className="w-4 h-4 mr-2" />
        Simulate Player Step (+{kinetic.energyPerStepMj} mJ)
      </Button>
    )}

    <p className="text-xs text-muted-foreground">
      Player movement around the water table drives kinetic energy capture via floor plates. A flywheel accumulates energy and delivers hydraulic pressure boosts without batteries.
    </p>
  </div>
);

// ── Tab #27: Dynamo ───────────────────────────────────────────────────────────

const DynamoTab: React.FC<{
  dynamo: ReturnType<typeof useEnergyInnovationCluster2427>['state']['dynamo'];
  setDynamosOnline: (v: number) => void;
  running: boolean;
}> = ({ dynamo, setDynamosOnline, running }) => {
  const ledColor = `hsl(${180 + dynamo.ledIlluminationLevel * 60}, 90%, ${20 + dynamo.ledIlluminationLevel * 50}%)`;
  return (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Flow Velocity" value={dynamo.flowVelocityMlPerSec.toFixed(1)} unit="mL/s" color="text-blue-400" />
        <StatTile label="Generated" value={dynamo.generatedVoltageV.toFixed(2)} unit="V" color="text-yellow-400" />
        <StatTile label="LED Level" value={`${(dynamo.ledIlluminationLevel * 100).toFixed(0)}%`} unit="illumination" color="text-amber-400" />
      </div>

      {/* LED bank visual */}
      <div className="bg-slate-900 rounded-lg p-4 grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const lit = i < Math.floor(dynamo.ledIlluminationLevel * 12);
          return (
            <div
              key={i}
              className="w-full aspect-square rounded-full border transition-all duration-200"
              style={{
                backgroundColor: lit ? ledColor : '#1e293b',
                borderColor: lit ? ledColor : '#334155',
                boxShadow: lit ? `0 0 8px ${ledColor}` : 'none',
              }}
            />
          );
        })}
      </div>

      {!running && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Dynamos Online</span>
            <span className="font-mono">{dynamo.dynamosOnline} units</span>
          </div>
          <Slider min={1} max={12} step={1} value={[dynamo.dynamosOnline]} onValueChange={([v]) => setDynamosOnline(v)} />
        </div>
      )}

      <div className="bg-slate-900 rounded p-2 text-xs">
        <div className="text-slate-400">Required for LED: <span className="text-yellow-400">3.3V</span></div>
        <Progress value={(dynamo.generatedVoltageV / 3.3) * 100} className="h-2 mt-1" />
        <div className="text-slate-500 mt-1">{dynamo.generatedVoltageV.toFixed(2)}V / 3.3V threshold</div>
      </div>

      <p className="text-xs text-muted-foreground">
        Water flow through each Hexel drives a miniature dynamo. At nominal flow (42 mL/s) with 6+ dynamos online, enough voltage is generated to illuminate LEDs — no batteries required.
      </p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const EnergyInnovationCluster2427Engine: React.FC<EnergyInnovationCluster2427EngineProps> = ({
  acPressureOverride,
  waterTableOverride,
  className,
}) => {
  const {
    state,
    setActiveTab,
    setIrradiance,
    setPanelTilt,
    triggerPlayerStep,
    setVibrationAmplitude,
    setDynamosOnline,
    toggleSimulation,
    reset,
  } = useEnergyInnovationCluster2427(acPressureOverride, waterTableOverride);

  const { solar, piezo, kinetic, dynamo, acPressure, running, tick, activeTab } = state;

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5 text-yellow-400" />
              MISS-013 — Energy Innovation Cluster (#24-27)
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">Wave 2</Badge>
              <Badge variant="outline" className="text-purple-400 border-purple-400">urIm</Badge>
              <Badge variant={running ? 'default' : 'secondary'}>{running ? 'Live' : 'Paused'}</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Four energy sub-innovations (#24–27). Depends on MISS-006 (AC Pressure) + MISS-012 (Water Table).
          </p>
          <div className="flex gap-2 text-xs mt-1">
            <span className="text-blue-400">AC: {acPressure.peakPressurePsi.toFixed(2)} psi @ {acPressure.acFrequencyHz} Hz</span>
            <span className="text-slate-500">|</span>
            <span className="text-teal-400">Flow: {state.waterTable.flowRateMlPerSec} mL/s</span>
          </div>
        </CardHeader>
      </Card>

      {/* 4-tab dashboard */}
      <Card>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as '24' | '25' | '26' | '27')}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="24" className="flex items-center gap-1 text-xs">
                <Sun className="w-3 h-3" />#24 Solar
              </TabsTrigger>
              <TabsTrigger value="25" className="flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3" />#25 Piezo
              </TabsTrigger>
              <TabsTrigger value="26" className="flex items-center gap-1 text-xs">
                <Footprints className="w-3 h-3" />#26 Kinetic
              </TabsTrigger>
              <TabsTrigger value="27" className="flex items-center gap-1 text-xs">
                <Lightbulb className="w-3 h-3" />#27 Dynamo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="24">
              <SolarTab solar={solar} setIrradiance={setIrradiance} setPanelTilt={setPanelTilt} running={running} />
            </TabsContent>
            <TabsContent value="25">
              <PiezoTab piezo={piezo} acPressure={acPressure} setVibration={setVibrationAmplitude} running={running} />
            </TabsContent>
            <TabsContent value="26">
              <KineticTab kinetic={kinetic} triggerStep={triggerPlayerStep} running={running} />
            </TabsContent>
            <TabsContent value="27">
              <DynamoTab dynamo={dynamo} setDynamosOnline={setDynamosOnline} running={running} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Global controls */}
      <Card>
        <CardContent className="pt-4 flex items-center gap-2">
          <Button size="sm" variant={running ? 'destructive' : 'default'} onClick={toggleSimulation}>
            {running ? <><Square className="w-3 h-3 mr-1" />Stop</> : <><Play className="w-3 h-3 mr-1" />Simulate All</>}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3 mr-1" />Reset
          </Button>
          <span className="text-xs text-muted-foreground ml-auto">Tick: {tick}</span>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground bg-slate-900 rounded p-2">
        <strong>Patent ref:</strong> Innovations #24–27 (Energy category). MISS-013 cluster.
        Depends on MISS-006 (AC Pressure Generation) and MISS-012 (Water Table Gravity Engine).
      </div>
    </div>
  );
};
