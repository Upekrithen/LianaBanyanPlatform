import { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { OuralisClockContext } from '@/components/hexisle/OuralisClockContext';

// STUB-003 — Clock-as-Game-State Controller
// Depends on: MISS-002 Ouralis
// Turn structure exists; Ouralis wired as game clock.
// 12-step rotation state + QuestSystem subscription to OuralisClock.tick event.

export type TidePhase =
  | 'ebb_start'     // step 0
  | 'ebb_mid'       // step 1
  | 'ebb_end'       // step 2
  | 'low_slack'     // step 3
  | 'flood_start'   // step 4
  | 'flood_mid'     // step 5
  | 'flood_end'     // step 6
  | 'high_slack'    // step 7
  | 'storm_surge'   // step 8
  | 'spring_peak'   // step 9
  | 'neap_transit'  // step 10
  | 'cycle_close';  // step 11

export const TIDE_PHASES: TidePhase[] = [
  'ebb_start', 'ebb_mid', 'ebb_end', 'low_slack',
  'flood_start', 'flood_mid', 'flood_end', 'high_slack',
  'storm_surge', 'spring_peak', 'neap_transit', 'cycle_close',
];

export interface GameTurnState {
  step: number;         // 0..11 current Ouralis rotation
  phase: TidePhase;
  turnNumber: number;   // full 12-step cycles completed
  totalTicks: number;
  isRunning: boolean;
  tickIntervalMs: number;
  questsThisTurn: string[];
  phaseEffects: Record<TidePhase, string>;
}

const PHASE_EFFECTS: Record<TidePhase, string> = {
  ebb_start:    'Ships gain +1 speed with current',
  ebb_mid:      'Resource gather bonus active',
  ebb_end:      'Keel drag reduced by 50%',
  low_slack:    'All currents paused — safe docking window',
  flood_start:  'Counter-current: ships must spend 2 actions to move upstream',
  flood_mid:    'Water table rising — elevated hexels active',
  flood_end:    'Hydraulic pressure peak — mechanisms fire',
  high_slack:   'All current-dependent actions suspended',
  storm_surge:  'All ships take 1 structural damage unless anchored',
  spring_peak:  'Double harvest available — spring tide bonus',
  neap_transit: 'Reduced current — navigation is free this step',
  cycle_close:  'Turn ends — score points, rotate first player',
};

export function useClockasGameStateController() {
  const clock = useContext(OuralisClockContext);
  const [turn, setTurn] = useState<GameTurnState>({
    step: clock.step,
    phase: TIDE_PHASES[clock.step],
    turnNumber: clock.turnNumber,
    totalTicks: 0,
    isRunning: false,
    tickIntervalMs: clock.tickIntervalMs,
    questsThisTurn: [],
    phaseEffects: PHASE_EFFECTS,
  });

  // Mirror the shared clock context into local game-turn state
  useEffect(() => {
    setTurn(prev => ({
      ...prev,
      step: clock.step,
      phase: TIDE_PHASES[clock.step],
      turnNumber: clock.turnNumber,
      totalTicks: clock.totalTicks,
      isRunning: clock.isRunning,
      tickIntervalMs: clock.tickIntervalMs,
    }));
  }, [clock.step, clock.turnNumber, clock.totalTicks, clock.isRunning, clock.tickIntervalMs]);

  const addQuestToTurn = useCallback((questId: string) => {
    setTurn(prev => ({
      ...prev,
      questsThisTurn: prev.questsThisTurn.includes(questId)
        ? prev.questsThisTurn
        : [...prev.questsThisTurn, questId],
    }));
  }, []);

  const clearTurnQuests = useCallback(() => {
    setTurn(prev => ({ ...prev, questsThisTurn: [] }));
  }, []);

  return {
    turn,
    clock,           // expose clock controls (start/stop/tick)
    addQuestToTurn,
    clearTurnQuests,
    PHASE_EFFECTS,
    TIDE_PHASES,
  };
}
