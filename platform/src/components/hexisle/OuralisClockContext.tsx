import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { TIDE_PHASES, TidePhase } from '@/hooks/useClockasGameStateController';

// STUB-003 — OuralisClock React Context
// The Ouralis mechanism is a 12-rotation tidal clock. One full 12-step cycle = one game turn.
// This context broadcasts tick events so QuestSystem and other consumers can subscribe.

export type OuralisTickListener = (step: number, phase: TidePhase, turnNumber: number) => void;

export interface OuralisClockValue {
  step: number;
  phase: TidePhase;
  turnNumber: number;
  totalTicks: number;
  isRunning: boolean;
  tickIntervalMs: number;
  start: () => void;
  stop: () => void;
  manualTick: () => void;
  setTickInterval: (ms: number) => void;
  subscribe: (listener: OuralisTickListener) => () => void;
}

const DEFAULT_TICK_MS = 3000;

export const OuralisClockContext = createContext<OuralisClockValue>({
  step: 0,
  phase: TIDE_PHASES[0],
  turnNumber: 0,
  totalTicks: 0,
  isRunning: false,
  tickIntervalMs: DEFAULT_TICK_MS,
  start: () => {},
  stop: () => {},
  manualTick: () => {},
  setTickInterval: () => {},
  subscribe: () => () => {},
});

export const OuralisClockProvider: React.FC<{ children: React.ReactNode; initialStep?: number }> = ({
  children,
  initialStep = 0,
}) => {
  const [step, setStep] = useState(initialStep);
  const [turnNumber, setTurnNumber] = useState(0);
  const [totalTicks, setTotalTicks] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tickIntervalMs, setTickIntervalMs] = useState(DEFAULT_TICK_MS);

  const listenersRef = useRef<Set<OuralisTickListener>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(initialStep);
  const turnRef = useRef(0);
  const totalRef = useRef(0);

  const fireTick = useCallback(() => {
    stepRef.current = (stepRef.current + 1) % 12;
    totalRef.current += 1;
    if (stepRef.current === 0) turnRef.current += 1;

    const newStep = stepRef.current;
    const newTurn = turnRef.current;
    const newTotal = totalRef.current;
    const newPhase = TIDE_PHASES[newStep];

    setStep(newStep);
    setTurnNumber(newTurn);
    setTotalTicks(newTotal);

    listenersRef.current.forEach(l => l(newStep, newPhase, newTurn));
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(fireTick, tickIntervalMs);
  }, [fireTick, tickIntervalMs]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const manualTick = useCallback(() => { fireTick(); }, [fireTick]);

  const updateTickInterval = useCallback((ms: number) => {
    setTickIntervalMs(ms);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fireTick, ms);
    }
  }, [fireTick]);

  const subscribe = useCallback((listener: OuralisTickListener) => {
    listenersRef.current.add(listener);
    return () => { listenersRef.current.delete(listener); };
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const value: OuralisClockValue = {
    step,
    phase: TIDE_PHASES[step],
    turnNumber,
    totalTicks,
    isRunning,
    tickIntervalMs,
    start,
    stop,
    manualTick,
    setTickInterval: updateTickInterval,
    subscribe,
  };

  return (
    <OuralisClockContext.Provider value={value}>
      {children}
    </OuralisClockContext.Provider>
  );
};
