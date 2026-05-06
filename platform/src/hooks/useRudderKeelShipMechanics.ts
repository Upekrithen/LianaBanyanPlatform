import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-003 — Rudder Keel Ship Mechanics
// Depends on: MISS-015 Sawtooth60 + STUB-001 (interface)
// Ships navigate currents using physics-based rudder/keel geometry.
// Sawtooth60 current exerts lateral force proportional to keel depth;
// rudder angle determines turning radius.

export interface ShipPhysicsState {
  x: number;          // world X position (meters)
  y: number;          // world Y position (meters)
  heading: number;    // degrees, 0 = north, CW positive
  speed: number;      // m/s
  rudderAngle: number; // degrees, -45..+45
  keelDepth: number;  // mm, 0..36 (max = Sawtooth60 depth)
  lateralDrift: number; // m/s lateral from current
  turnRadius: number; // meters, Infinity = straight
}

export interface Sawtooth60CurrentInterface {
  direction: number;  // degrees
  magnitude: number;  // 0..1
  pattern: 'sawtooth' | 'sine' | 'flat';
}

export interface RudderKeelMechanicsConfig {
  sawtooth60: Sawtooth60CurrentInterface;
  maxKeelDepth: number;   // mm, default 36
  maxRudderAngle: number; // degrees, default 45
  shipMass: number;       // kg
  hullLength: number;     // meters
}

const DEFAULT_CONFIG: RudderKeelMechanicsConfig = {
  sawtooth60: { direction: 90, magnitude: 0.6, pattern: 'sawtooth' },
  maxKeelDepth: 36,
  maxRudderAngle: 45,
  shipMass: 2.5,
  hullLength: 0.28,
};

function computeLateralForce(
  keelDepth: number,
  currentMagnitude: number,
  currentDirection: number,
  heading: number,
): number {
  const keelFraction = keelDepth / 36;
  // Component of current perpendicular to ship heading
  const angleDiff = ((currentDirection - heading + 360) % 360) * (Math.PI / 180);
  const perpComponent = Math.sin(angleDiff);
  return keelFraction * currentMagnitude * perpComponent * 0.8; // m/s lateral
}

function computeTurnRadius(rudderAngle: number, speed: number, hullLength: number): number {
  if (Math.abs(rudderAngle) < 0.5 || speed < 0.01) return Infinity;
  const radAngle = Math.abs(rudderAngle) * (Math.PI / 180);
  return hullLength / Math.sin(radAngle) * (speed > 0 ? 1 : -1);
}

export function useRudderKeelShipMechanics(config: Partial<RudderKeelMechanicsConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const [ship, setShip] = useState<ShipPhysicsState>({
    x: 0,
    y: 0,
    heading: 0,
    speed: 0.5,
    rudderAngle: 0,
    keelDepth: 18,
    lateralDrift: 0,
    turnRadius: Infinity,
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const setRudderAngle = useCallback((angle: number) => {
    const clamped = Math.max(-cfg.maxRudderAngle, Math.min(cfg.maxRudderAngle, angle));
    setShip(prev => ({
      ...prev,
      rudderAngle: clamped,
      turnRadius: computeTurnRadius(clamped, prev.speed, cfg.hullLength),
    }));
  }, [cfg.maxRudderAngle, cfg.hullLength]);

  const setKeelDepth = useCallback((depth: number) => {
    const clamped = Math.max(0, Math.min(cfg.maxKeelDepth, depth));
    setShip(prev => ({ ...prev, keelDepth: clamped }));
  }, [cfg.maxKeelDepth]);

  const setSpeed = useCallback((speed: number) => {
    setShip(prev => ({
      ...prev,
      speed: Math.max(0, Math.min(5, speed)),
      turnRadius: computeTurnRadius(prev.rudderAngle, speed, cfg.hullLength),
    }));
  }, [cfg.hullLength]);

  const step = useCallback((dt: number) => {
    setShip(prev => {
      const lateral = computeLateralForce(
        prev.keelDepth,
        cfg.sawtooth60.magnitude,
        cfg.sawtooth60.direction,
        prev.heading,
      );

      // Rudder turns heading
      const turnRate = Math.abs(prev.turnRadius) < 1000
        ? (prev.speed / prev.turnRadius) * (180 / Math.PI)
        : 0;
      const newHeading = (prev.heading + turnRate * dt + 360) % 360;

      // Advance position
      const headRad = newHeading * (Math.PI / 180);
      const newX = prev.x + Math.sin(headRad) * prev.speed * dt + lateral * Math.cos(headRad) * dt;
      const newY = prev.y + Math.cos(headRad) * prev.speed * dt - lateral * Math.sin(headRad) * dt;

      return {
        ...prev,
        x: newX,
        y: newY,
        heading: newHeading,
        lateralDrift: lateral,
        turnRadius: computeTurnRadius(prev.rudderAngle, prev.speed, cfg.hullLength),
      };
    });
  }, [cfg]);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    lastTimeRef.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      step(dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [step]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const resetShip = useCallback(() => {
    stopSimulation();
    setShip({
      x: 0, y: 0, heading: 0, speed: 0.5,
      rudderAngle: 0, keelDepth: 18,
      lateralDrift: 0, turnRadius: Infinity,
    });
  }, [stopSimulation]);

  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  return {
    ship,
    isSimulating,
    config: cfg,
    setRudderAngle,
    setKeelDepth,
    setSpeed,
    startSimulation,
    stopSimulation,
    resetShip,
  };
}
