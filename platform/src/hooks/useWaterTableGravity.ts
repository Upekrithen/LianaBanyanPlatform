import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-012 — Water Table Gravity Engine (#22)
// 5+ gallon reservoir at elevation provides sustained hydraulic power.
// Pressure output = reservoir_volume_gallons × gravity_factor × elevation_cm.
// Depletes over time; refill mechanic via rainfall events.

export type ReservoirStatus = 'full' | 'adequate' | 'low' | 'critical' | 'empty';

export interface RainfallEvent {
  id: number;
  volumeGallons: number;
  isActive: boolean;
  ticksRemaining: number;
}

export interface WaterTableGravityState {
  reservoirVolumeGallons: number;
  maxVolumeGallons: number;
  elevationCm: number;
  gravityFactor: number;       // constant: 9.81 m/s²
  pressureOutputPsi: number;   // calculated
  pressureOutputBar: number;
  flowRateGpm: number;         // gallons per minute
  status: ReservoirStatus;
  depletionRateGpm: number;    // consumption per tick
  rainfallEvents: RainfallEvent[];
  totalRainfallGallons: number;
  gameTurn: number;
  tickCount: number;
  isRunning: boolean;
  tickMs: number;
  powerOutputWatts: number;
}

export interface WaterTableGravityControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  triggerRainfall: (volumeGallons: number) => void;
  setElevation: (cm: number) => void;
  setTickMs: (ms: number) => void;
}

const GRAVITY = 9.81;
const PSI_PER_METER = 1.422; // 1 meter head = 1.422 psi

function computePressure(reservoirGal: number, elevCm: number): { psi: number; bar: number } {
  const headM = elevCm / 100;
  const volumeFactor = Math.min(1, reservoirGal / 5); // normalizes to 5-gal reference
  const psi = parseFloat((headM * PSI_PER_METER * volumeFactor).toFixed(3));
  const bar = parseFloat((psi * 0.0689476).toFixed(4));
  return { psi, bar };
}

function deriveStatus(gallons: number, max: number): ReservoirStatus {
  const frac = gallons / max;
  if (frac >= 0.9) return 'full';
  if (frac >= 0.5) return 'adequate';
  if (frac >= 0.25) return 'low';
  if (frac > 0) return 'critical';
  return 'empty';
}

let rainfallIdCounter = 0;

export function useWaterTableGravity(initialTickMs = 800): {
  state: WaterTableGravityState;
  controls: WaterTableGravityControls;
} {
  const [state, setState] = useState<WaterTableGravityState>(() => {
    const elevation = 91.44; // 3-foot head
    const volume = 5.5;
    const { psi, bar } = computePressure(volume, elevation);
    return {
      reservoirVolumeGallons: volume,
      maxVolumeGallons: 10,
      elevationCm: elevation,
      gravityFactor: GRAVITY,
      pressureOutputPsi: psi,
      pressureOutputBar: bar,
      flowRateGpm: parseFloat((psi * 0.12).toFixed(3)),
      status: 'adequate',
      depletionRateGpm: 0.08,
      rainfallEvents: [],
      totalRainfallGallons: 0,
      gameTurn: 0,
      tickCount: 0,
      isRunning: false,
      tickMs: initialTickMs,
      powerOutputWatts: 0,
    };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const tickCount = prev.tickCount + 1;
      const gameTurn = Math.floor(tickCount / 12);

      // Process rainfall events
      let rainfallAdd = 0;
      const rainfallEvents = prev.rainfallEvents
        .map(e => {
          if (!e.isActive) return e;
          rainfallAdd += e.volumeGallons / Math.max(e.ticksRemaining, 1);
          return { ...e, ticksRemaining: e.ticksRemaining - 1, isActive: e.ticksRemaining > 1 };
        })
        .filter(e => e.isActive || e.ticksRemaining > 0);

      // Deplete reservoir by consumption, add rainfall
      const depleteAmount = prev.status === 'empty' ? 0 : prev.depletionRateGpm;
      const newVolume = Math.max(0, Math.min(prev.maxVolumeGallons, prev.reservoirVolumeGallons - depleteAmount + rainfallAdd));

      const { psi, bar } = computePressure(newVolume, prev.elevationCm);
      const flowRateGpm = parseFloat((psi * 0.12).toFixed(3));
      const powerOutputWatts = parseFloat((bar * 1e5 * flowRateGpm * 6.309e-5).toFixed(3)); // P = pressure × volumetric flow
      const status = deriveStatus(newVolume, prev.maxVolumeGallons);

      return {
        ...prev,
        reservoirVolumeGallons: parseFloat(newVolume.toFixed(3)),
        pressureOutputPsi: psi,
        pressureOutputBar: bar,
        flowRateGpm,
        powerOutputWatts,
        status,
        rainfallEvents,
        gameTurn,
        tickCount,
      };
    });
  }, []);

  const triggerRainfall = useCallback((volumeGallons: number) => {
    setState(prev => {
      const event: RainfallEvent = {
        id: ++rainfallIdCounter,
        volumeGallons,
        isActive: true,
        ticksRemaining: 6,
      };
      return {
        ...prev,
        rainfallEvents: [...prev.rainfallEvents, event],
        totalRainfallGallons: parseFloat((prev.totalRainfallGallons + volumeGallons).toFixed(2)),
      };
    });
  }, []);

  const setElevation = useCallback((cm: number) => {
    setState(prev => {
      const { psi, bar } = computePressure(prev.reservoirVolumeGallons, cm);
      return { ...prev, elevationCm: cm, pressureOutputPsi: psi, pressureOutputBar: bar };
    });
  }, []);

  const start = useCallback(() => setState(prev => ({ ...prev, isRunning: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, isRunning: false })), []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => {
      const elevation = 91.44;
      const volume = 5.5;
      const { psi, bar } = computePressure(volume, elevation);
      return {
        ...prev,
        reservoirVolumeGallons: volume,
        elevationCm: elevation,
        pressureOutputPsi: psi,
        pressureOutputBar: bar,
        flowRateGpm: parseFloat((psi * 0.12).toFixed(3)),
        status: 'adequate',
        rainfallEvents: [],
        totalRainfallGallons: 0,
        gameTurn: 0,
        tickCount: 0,
        isRunning: false,
        powerOutputWatts: 0,
      };
    });
  }, []);

  const setTickMs = useCallback((ms: number) => setState(prev => ({ ...prev, tickMs: ms })), []);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(tick, state.tickMs);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.isRunning, state.tickMs, tick]);

  return { state, controls: { start, pause, reset, tick, triggerRainfall, setElevation, setTickMs } };
}
