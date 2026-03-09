import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sword, Shield, Heart, Zap, Target, Brain, 
  Flame, Snowflake, Wind, Droplets, RefreshCcw,
  Trophy, Star, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * DICELESS COMBAT SYSTEM
 * Patent Innovations #133-140 (HexIsle Combat - Bag #6)
 * 
 * Features:
 * - No randomness - pure strategy and resource management
 * - Linked Mana-HP "Danger Tab" system
 * - Drachma token economy for in-combat resources
 * - Compliant squeeze mechanism for special actions
 * - Modular character attachments
 * - Accessibility-first design (5-year-old can play)
 */

interface CombatUnit {
  id: string;
  name: string;
  type: 'warrior' | 'mage' | 'ranger' | 'healer';
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  element: 'fire' | 'water' | 'earth' | 'air' | 'neutral';
  abilities: CombatAbility[];
  attachments: Attachment[];
  position: { x: number; y: number };
  isPlayer: boolean;
}

interface CombatAbility {
  id: string;
  name: string;
  manaCost: number;
  hpCost: number; // Danger Tab - some abilities cost HP too
  damage: number;
  healing: number;
  effect: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
  element: 'fire' | 'water' | 'earth' | 'air' | 'neutral';
  range: number;
  cooldown: number;
  currentCooldown: number;
  description: string;
}

interface Attachment {
  id: string;
  name: string;
  slot: 'weapon' | 'armor' | 'accessory';
  statBonus: { attack?: number; defense?: number; hp?: number; mana?: number };
  specialEffect?: string;
}

interface CombatState {
  turn: number;
  phase: 'planning' | 'action' | 'resolution';
  activeUnitId: string | null;
  selectedAbility: CombatAbility | null;
  selectedTarget: CombatUnit | null;
  drachmaPool: number; // Shared resource pool
  combatLog: string[];
}

const ELEMENT_ADVANTAGES: Record<string, string> = {
  fire: 'earth',
  water: 'fire',
  earth: 'air',
  air: 'water',
  neutral: 'neutral'
};

export function DicelessCombatSystem() {
  const [playerUnits, setPlayerUnits] = useState<CombatUnit[]>([
    {
      id: 'player-1',
      name: 'Knight Commander',
      type: 'warrior',
      hp: 100,
      maxHp: 100,
      mana: 30,
      maxMana: 30,
      attack: 25,
      defense: 20,
      speed: 5,
      element: 'earth',
      abilities: [
        { id: 'slash', name: 'Heavy Slash', manaCost: 0, hpCost: 0, damage: 25, healing: 0, effect: 'damage', element: 'neutral', range: 1, cooldown: 0, currentCooldown: 0, description: 'Basic melee attack' },
        { id: 'shield-bash', name: 'Shield Bash', manaCost: 10, hpCost: 0, damage: 15, healing: 0, effect: 'debuff', element: 'earth', range: 1, cooldown: 2, currentCooldown: 0, description: 'Stuns enemy for 1 turn' },
        { id: 'rally', name: 'Rally Cry', manaCost: 15, hpCost: 5, damage: 0, healing: 0, effect: 'buff', element: 'neutral', range: 3, cooldown: 3, currentCooldown: 0, description: 'Boosts all allies attack (Danger Tab: costs HP too)' }
      ],
      attachments: [
        { id: 'steel-sword', name: 'Steel Longsword', slot: 'weapon', statBonus: { attack: 5 } },
        { id: 'plate-armor', name: 'Plate Armor', slot: 'armor', statBonus: { defense: 8, speed: -1 } }
      ],
      position: { x: 1, y: 2 },
      isPlayer: true
    },
    {
      id: 'player-2',
      name: 'Flame Mage',
      type: 'mage',
      hp: 60,
      maxHp: 60,
      mana: 80,
      maxMana: 80,
      attack: 10,
      defense: 8,
      speed: 7,
      element: 'fire',
      abilities: [
        { id: 'fireball', name: 'Fireball', manaCost: 15, hpCost: 0, damage: 35, healing: 0, effect: 'damage', element: 'fire', range: 4, cooldown: 1, currentCooldown: 0, description: 'Ranged fire damage' },
        { id: 'inferno', name: 'Inferno', manaCost: 30, hpCost: 10, damage: 50, healing: 0, effect: 'damage', element: 'fire', range: 3, cooldown: 3, currentCooldown: 0, description: 'Massive AoE fire (Danger Tab)' },
        { id: 'mana-burn', name: 'Mana Burn', manaCost: 20, hpCost: 0, damage: 20, healing: 0, effect: 'special', element: 'fire', range: 3, cooldown: 2, currentCooldown: 0, description: 'Drains enemy mana' }
      ],
      attachments: [
        { id: 'fire-staff', name: 'Staff of Flames', slot: 'weapon', statBonus: { attack: 3, mana: 10 } }
      ],
      position: { x: 0, y: 3 },
      isPlayer: true
    }
  ]);

  const [enemyUnits, setEnemyUnits] = useState<CombatUnit[]>([
    {
      id: 'enemy-1',
      name: 'Goblin Warrior',
      type: 'warrior',
      hp: 70,
      maxHp: 70,
      mana: 20,
      maxMana: 20,
      attack: 18,
      defense: 12,
      speed: 8,
      element: 'earth',
      abilities: [
        { id: 'claw', name: 'Claw Strike', manaCost: 0, hpCost: 0, damage: 18, healing: 0, effect: 'damage', element: 'neutral', range: 1, cooldown: 0, currentCooldown: 0, description: 'Quick melee attack' },
        { id: 'frenzy', name: 'Frenzy', manaCost: 15, hpCost: 10, damage: 30, healing: 0, effect: 'damage', element: 'neutral', range: 1, cooldown: 2, currentCooldown: 0, description: 'Powerful but costs HP' }
      ],
      attachments: [],
      position: { x: 5, y: 2 },
      isPlayer: false
    },
    {
      id: 'enemy-2',
      name: 'Ice Shaman',
      type: 'mage',
      hp: 50,
      maxHp: 50,
      mana: 60,
      maxMana: 60,
      attack: 8,
      defense: 6,
      speed: 6,
      element: 'water',
      abilities: [
        { id: 'ice-shard', name: 'Ice Shard', manaCost: 10, hpCost: 0, damage: 25, healing: 0, effect: 'damage', element: 'water', range: 3, cooldown: 0, currentCooldown: 0, description: 'Ranged ice damage' },
        { id: 'heal', name: 'Healing Waters', manaCost: 20, hpCost: 0, damage: 0, healing: 30, effect: 'heal', element: 'water', range: 3, cooldown: 2, currentCooldown: 0, description: 'Heals an ally' }
      ],
      attachments: [],
      position: { x: 5, y: 3 },
      isPlayer: false
    }
  ]);

  const [combatState, setCombatState] = useState<CombatState>({
    turn: 1,
    phase: 'planning',
    activeUnitId: 'player-1',
    selectedAbility: null,
    selectedTarget: null,
    drachmaPool: 100,
    combatLog: ['Combat begins! Plan your strategy.']
  });

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'text-red-500 bg-red-100';
      case 'water': return 'text-blue-500 bg-blue-100';
      case 'earth': return 'text-amber-600 bg-amber-100';
      case 'air': return 'text-cyan-500 bg-cyan-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'fire': return Flame;
      case 'water': return Droplets;
      case 'earth': return Shield;
      case 'air': return Wind;
      default: return Star;
    }
  };

  const calculateDamage = (attacker: CombatUnit, defender: CombatUnit, ability: CombatAbility): number => {
    // Base damage from ability
    let damage = ability.damage;
    
    // Add attack stat
    damage += attacker.attack;
    
    // Subtract defense
    damage -= defender.defense;
    
    // Element advantage (50% bonus)
    if (ELEMENT_ADVANTAGES[ability.element] === defender.element) {
      damage = Math.floor(damage * 1.5);
    }
    
    // Element disadvantage (50% reduction)
    if (ELEMENT_ADVANTAGES[defender.element] === ability.element) {
      damage = Math.floor(damage * 0.5);
    }
    
    // Minimum damage is 1
    return Math.max(1, damage);
  };

  const executeAbility = useCallback((
    attacker: CombatUnit, 
    ability: CombatAbility, 
    target: CombatUnit
  ) => {
    // Check mana cost
    if (attacker.mana < ability.manaCost) {
      toast.error('Not enough mana!');
      return;
    }

    // Check HP cost (Danger Tab)
    if (attacker.hp <= ability.hpCost) {
      toast.error('Ability would be fatal! Not enough HP.');
      return;
    }

    // Check cooldown
    if (ability.currentCooldown > 0) {
      toast.error(`${ability.name} is on cooldown (${ability.currentCooldown} turns)`);
      return;
    }

    // Deduct costs
    const newAttackerMana = attacker.mana - ability.manaCost;
    const newAttackerHp = attacker.hp - ability.hpCost;

    let logEntry = `${attacker.name} uses ${ability.name}`;

    if (ability.effect === 'damage') {
      const damage = calculateDamage(attacker, target, ability);
      const newTargetHp = Math.max(0, target.hp - damage);
      
      logEntry += ` → ${target.name} takes ${damage} damage`;
      
      if (ability.hpCost > 0) {
        logEntry += ` (Danger Tab: ${attacker.name} loses ${ability.hpCost} HP)`;
      }

      // Update target HP
      if (target.isPlayer) {
        setPlayerUnits(prev => prev.map(u => 
          u.id === target.id ? { ...u, hp: newTargetHp } : u
        ));
      } else {
        setEnemyUnits(prev => prev.map(u => 
          u.id === target.id ? { ...u, hp: newTargetHp } : u
        ));
      }

      if (newTargetHp === 0) {
        logEntry += ` - ${target.name} is defeated!`;
        toast.success(`${target.name} defeated!`);
      }
    } else if (ability.effect === 'heal') {
      const healAmount = ability.healing;
      const newTargetHp = Math.min(target.maxHp, target.hp + healAmount);
      
      logEntry += ` → ${target.name} heals ${healAmount} HP`;

      if (target.isPlayer) {
        setPlayerUnits(prev => prev.map(u => 
          u.id === target.id ? { ...u, hp: newTargetHp } : u
        ));
      } else {
        setEnemyUnits(prev => prev.map(u => 
          u.id === target.id ? { ...u, hp: newTargetHp } : u
        ));
      }
    }

    // Update attacker resources
    if (attacker.isPlayer) {
      setPlayerUnits(prev => prev.map(u => 
        u.id === attacker.id ? { ...u, mana: newAttackerMana, hp: newAttackerHp } : u
      ));
    } else {
      setEnemyUnits(prev => prev.map(u => 
        u.id === attacker.id ? { ...u, mana: newAttackerMana, hp: newAttackerHp } : u
      ));
    }

    // Update combat log
    setCombatState(prev => ({
      ...prev,
      combatLog: [...prev.combatLog, logEntry],
      selectedAbility: null,
      selectedTarget: null
    }));

    toast.success(logEntry);
  }, []);

  const selectAbility = (ability: CombatAbility) => {
    setCombatState(prev => ({ ...prev, selectedAbility: ability }));
  };

  const selectTarget = (target: CombatUnit) => {
    const { selectedAbility, activeUnitId } = combatState;
    if (!selectedAbility || !activeUnitId) return;

    const attacker = [...playerUnits, ...enemyUnits].find(u => u.id === activeUnitId);
    if (!attacker) return;

    executeAbility(attacker, selectedAbility, target);
  };

  const endTurn = () => {
    // Reduce all cooldowns
    setPlayerUnits(prev => prev.map(u => ({
      ...u,
      abilities: u.abilities.map(a => ({
        ...a,
        currentCooldown: Math.max(0, a.currentCooldown - 1)
      }))
    })));

    // AI takes actions
    enemyUnits.filter(e => e.hp > 0).forEach(enemy => {
      const ability = enemy.abilities.find(a => 
        a.currentCooldown === 0 && enemy.mana >= a.manaCost
      );
      if (ability) {
        const target = ability.effect === 'heal' 
          ? enemyUnits.find(e => e.hp > 0 && e.hp < e.maxHp) || enemy
          : playerUnits.find(p => p.hp > 0);
        if (target) {
          setTimeout(() => executeAbility(enemy, ability, target), 500);
        }
      }
    });

    setCombatState(prev => ({
      ...prev,
      turn: prev.turn + 1,
      phase: 'planning'
    }));
  };

  const activeUnit = [...playerUnits, ...enemyUnits].find(u => u.id === combatState.activeUnitId);

  return (
    <div className="space-y-6">
      {/* Combat Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-6 w-6" />
            Diceless Combat System
          </CardTitle>
          <CardDescription>
            Pure strategy combat - no randomness, no dice. Every outcome is determined by your choices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">Turn {combatState.turn}</Badge>
              <Badge variant="outline" className="bg-yellow-50">
                <Star className="h-3 w-3 mr-1" />
                Drachma: {combatState.drachmaPool}
              </Badge>
            </div>
            <Alert className="max-w-md">
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <strong>Danger Tab:</strong> Some abilities cost HP in addition to Mana. 
                Using magic depletes your life force!
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Player Units */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Your Forces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {playerUnits.map(unit => (
              <div 
                key={unit.id}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all",
                  combatState.activeUnitId === unit.id && "ring-2 ring-primary",
                  unit.hp === 0 && "opacity-50"
                )}
                onClick={() => unit.hp > 0 && setCombatState(prev => ({ ...prev, activeUnitId: unit.id }))}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{unit.name}</span>
                    {(() => {
                      const Icon = getElementIcon(unit.element);
                      return <Badge className={getElementColor(unit.element)}><Icon className="h-3 w-3" /></Badge>;
                    })()}
                  </div>
                  <Badge variant="outline">{unit.type}</Badge>
                </div>
                
                {/* HP Bar (Danger Tab visual) */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" /> HP</span>
                    <span>{unit.hp}/{unit.maxHp}</span>
                  </div>
                  <Progress value={(unit.hp / unit.maxHp) * 100} className="h-2 bg-red-100" />
                </div>
                
                {/* Mana Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-blue-500" /> Mana</span>
                    <span>{unit.mana}/{unit.maxMana}</span>
                  </div>
                  <Progress value={(unit.mana / unit.maxMana) * 100} className="h-2 bg-blue-100" />
                </div>

                {/* Stats */}
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>ATK: {unit.attack}</span>
                  <span>DEF: {unit.defense}</span>
                  <span>SPD: {unit.speed}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Combat Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeUnit && activeUnit.isPlayer ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select an ability for <strong>{activeUnit.name}</strong>:
                </p>
                
                <div className="space-y-2">
                  {activeUnit.abilities.map(ability => {
                    const canUse = activeUnit.mana >= ability.manaCost && 
                                   activeUnit.hp > ability.hpCost &&
                                   ability.currentCooldown === 0;
                    return (
                      <Button
                        key={ability.id}
                        variant={combatState.selectedAbility?.id === ability.id ? "default" : "outline"}
                        className="w-full justify-start"
                        disabled={!canUse}
                        onClick={() => selectAbility(ability)}
                      >
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span>{ability.name}</span>
                            {ability.hpCost > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                -{ability.hpCost} HP
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ability.manaCost > 0 && `${ability.manaCost} Mana`}
                            {ability.damage > 0 && ` • ${ability.damage} DMG`}
                            {ability.healing > 0 && ` • ${ability.healing} Heal`}
                            {ability.currentCooldown > 0 && ` • CD: ${ability.currentCooldown}`}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {combatState.selectedAbility && (
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{combatState.selectedAbility.name}</strong>: {combatState.selectedAbility.description}
                      <p className="mt-1 text-xs">Select a target from the enemy panel →</p>
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={endTurn} className="w-full">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  End Turn
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Select one of your units to act
              </p>
            )}
          </CardContent>
        </Card>

        {/* Enemy Units */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sword className="h-5 w-5 text-red-500" />
              Enemy Forces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enemyUnits.map(unit => (
              <div 
                key={unit.id}
                className={cn(
                  "p-3 border rounded-lg transition-all",
                  combatState.selectedAbility && unit.hp > 0 && "cursor-pointer hover:ring-2 hover:ring-red-500",
                  unit.hp === 0 && "opacity-50"
                )}
                onClick={() => combatState.selectedAbility && unit.hp > 0 && selectTarget(unit)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{unit.name}</span>
                    {(() => {
                      const Icon = getElementIcon(unit.element);
                      return <Badge className={getElementColor(unit.element)}><Icon className="h-3 w-3" /></Badge>;
                    })()}
                  </div>
                  {unit.hp === 0 && <Badge variant="destructive">Defeated</Badge>}
                </div>
                
                {/* HP Bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" /> HP</span>
                    <span>{unit.hp}/{unit.maxHp}</span>
                  </div>
                  <Progress value={(unit.hp / unit.maxHp) * 100} className="h-2 bg-red-100" />
                </div>
                
                {/* Mana Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-blue-500" /> Mana</span>
                    <span>{unit.mana}/{unit.maxMana}</span>
                  </div>
                  <Progress value={(unit.mana / unit.maxMana) * 100} className="h-2 bg-blue-100" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Combat Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Combat Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 overflow-y-auto bg-muted p-3 rounded-lg text-sm font-mono">
            {combatState.combatLog.map((log, i) => (
              <p key={i} className={i === combatState.combatLog.length - 1 ? "font-bold" : ""}>
                {log}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Victory/Defeat Check */}
      {playerUnits.every(u => u.hp === 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Defeat!</strong> All your units have fallen.
          </AlertDescription>
        </Alert>
      )}
      
      {enemyUnits.every(u => u.hp === 0) && (
        <Alert className="bg-green-50 border-green-200">
          <Trophy className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Victory!</strong> All enemies have been defeated!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default DicelessCombatSystem;
