import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Heart, Zap, Shield, RotateCcw, ChevronRight, Info } from 'lucide-react';

interface CoinSlot {
  denomination: number;
  shape: 'circle' | 'triangle' | 'square';
  active: boolean;
}

const MAX_SLOTS = 6;
const SHAPES = ['circle', 'triangle', 'square'] as const;
const SHAPE_COLORS = { circle: '#3b82f6', triangle: '#ef4444', square: '#22c55e' };
const SHAPE_LABELS = { circle: 'Water', triangle: 'Fire', square: 'Earth' };

const TAB_MODES = [
  { id: 'hp', label: 'HP Only', icon: Heart, color: '#ef4444', desc: 'Damage counter tracks hit points' },
  { id: 'both', label: 'HP + Mana', icon: Zap, color: '#a855f7', desc: 'Both counters advance simultaneously' },
  { id: 'mana', label: 'Mana Only', icon: Zap, color: '#3b82f6', desc: 'Magic attacks drain mana' },
] as const;

export default function HitbaseCounterShowcase() {
  const [coins, setCoins] = useState<CoinSlot[]>([
    { denomination: 3, shape: 'circle', active: true },
    { denomination: 2, shape: 'triangle', active: true },
    { denomination: 1, shape: 'square', active: true },
  ]);
  const [hpCounter, setHpCounter] = useState(0);
  const [manaCounter, setManaCounter] = useState(0);
  const [tabMode, setTabMode] = useState<'hp' | 'both' | 'mana'>('hp');
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isSupine, setIsSupine] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const totalHP = coins.filter(c => c.active).reduce((s, c) => s + c.denomination, 0);
  const maxRotations = coins.filter(c => c.active).length;

  const takeHit = useCallback(() => {
    if (isSupine) return;

    const activeCoinIdx = coins.findIndex(c => c.active);
    if (activeCoinIdx === -1) return;

    const newCoins = [...coins];
    let log = '';

    if (tabMode === 'hp' || tabMode === 'both') {
      setHpCounter(prev => prev + 1);
      log += `HP counter advances (${hpCounter + 1})`;
    }
    if (tabMode === 'mana' || tabMode === 'both') {
      setManaCounter(prev => prev + 1);
      log += `${log ? ' + ' : ''}Mana counter advances (${manaCounter + 1})`;
    }

    const coin = newCoins[activeCoinIdx];
    if (hpCounter + 1 >= coin.denomination) {
      newCoins[activeCoinIdx] = { ...coin, active: false };
      log += ` → Coin ejected! (${coin.denomination}-${SHAPE_LABELS[coin.shape]})`;
      setHpCounter(0);

      const remaining = newCoins.filter(c => c.active);
      if (remaining.length === 0) {
        log += ' → FIGURE DOWN (supine-lock)';
        setIsSupine(true);
      }
    }

    setCoins(newCoins);
    setCombatLog(prev => [log, ...prev.slice(0, 9)]);
  }, [coins, hpCounter, manaCounter, tabMode, isSupine]);

  const loadCoin = useCallback((denomination: number, shape: typeof SHAPES[number]) => {
    if (coins.filter(c => c.active).length >= MAX_SLOTS) return;
    setCoins(prev => [...prev, { denomination, shape, active: true }]);
    setCombatLog(prev => [`Loaded ${denomination}-${SHAPE_LABELS[shape]} coin`, ...prev.slice(0, 9)]);
    setIsSupine(false);
  }, [coins]);

  const reset = useCallback(() => {
    setCoins([
      { denomination: 3, shape: 'circle', active: true },
      { denomination: 2, shape: 'triangle', active: true },
      { denomination: 1, shape: 'square', active: true },
    ]);
    setHpCounter(0);
    setManaCounter(0);
    setIsSupine(false);
    setCombatLog([]);
  }, []);

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          Hitbase Counter System
          <Badge variant="outline" className="ml-auto text-[10px]">Patent Innovation #1579</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Push a figure token — physics tracks the damage. No dice. No apps. Just coins and gravity.
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Figure Visual */}
        <div className="flex items-center gap-6">
          {/* Boot Base + Coin Stack */}
          <div className="flex flex-col items-center">
            <div className={`relative transition-transform duration-300 ${isSupine ? 'rotate-90 opacity-50' : ''}`}>
              {/* Figure silhouette */}
              <div className="w-16 h-24 bg-gradient-to-b from-slate-600 to-slate-800 rounded-t-full mx-auto relative">
                <div className="absolute inset-x-2 top-2 bottom-0 bg-gradient-to-b from-slate-500 to-slate-700 rounded-t-full" />
                {isSupine && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-xs">DOWN</span>
                  </div>
                )}
              </div>
              {/* Boot base */}
              <div className="w-20 h-8 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-lg mx-auto flex items-center justify-center gap-0.5">
                {coins.map((coin, i) => (
                  <div
                    key={i}
                    className={`w-3 h-5 rounded-sm border transition-all ${
                      coin.active
                        ? 'border-yellow-400 bg-yellow-300'
                        : 'border-slate-500 bg-slate-700 opacity-30'
                    }`}
                    style={{ borderColor: coin.active ? SHAPE_COLORS[coin.shape] : undefined }}
                    title={`${coin.denomination}-${SHAPE_LABELS[coin.shape]} ${coin.active ? '(loaded)' : '(ejected)'}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">
              {isSupine ? 'Supine Lock' : `${coins.filter(c => c.active).length} coins loaded`}
            </span>
          </div>

          {/* Counters */}
          <div className="flex-1 space-y-3">
            {/* Tab Mode Selector */}
            <div className="flex gap-1">
              {TAB_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setTabMode(mode.id as any)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    tabMode === mode.id
                      ? 'text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={tabMode === mode.id ? { backgroundColor: mode.color } : undefined}
                >
                  <mode.icon className="h-3 w-3" />
                  {mode.label}
                </button>
              ))}
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">HP</span>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300 rounded-full"
                    style={{ width: `${totalHP > 0 ? ((totalHP - hpCounter) / totalHP) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-12 text-right">
                  {Math.max(0, totalHP - hpCounter)}/{totalHP}
                </span>
              </div>
            </div>

            {/* Mana Bar */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Mana</span>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 rounded-full"
                    style={{ width: `${totalHP > 0 ? Math.max(0, 100 - (manaCounter / totalHP) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-12 text-right">
                  {Math.max(0, totalHP - manaCounter)}/{totalHP}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                onClick={takeHit}
                disabled={isSupine}
              >
                <Swords className="h-3.5 w-3.5" />
                Take Hit
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Coin Loader */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs font-medium mb-2">Load Coins (Pez-style)</p>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map(denom => (
              <div key={denom} className="flex gap-1">
                {SHAPES.map(shape => (
                  <button
                    key={`${denom}-${shape}`}
                    onClick={() => loadCoin(denom, shape)}
                    disabled={coins.filter(c => c.active).length >= MAX_SLOTS}
                    className="w-7 h-7 rounded border text-[10px] font-bold flex items-center justify-center transition-colors hover:opacity-80 disabled:opacity-30"
                    style={{
                      borderColor: SHAPE_COLORS[shape],
                      color: SHAPE_COLORS[shape],
                      backgroundColor: `${SHAPE_COLORS[shape]}10`,
                    }}
                    title={`${denom}-${SHAPE_LABELS[shape]}`}
                  >
                    {denom}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            {SHAPES.map(s => (
              <span key={s} className="text-[10px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SHAPE_COLORS[s] }} />
                {SHAPE_LABELS[s]}
              </span>
            ))}
          </div>
        </div>

        {/* Combat Log */}
        {combatLog.length > 0 && (
          <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50 max-h-32 overflow-y-auto">
            <p className="text-xs font-medium mb-1">Combat Log</p>
            {combatLog.map((log, i) => (
              <p key={i} className={`text-xs font-mono ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {log}
              </p>
            ))}
          </div>
        )}

        {/* Expandable Explainer */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary hover:underline w-full"
        >
          <Info className="h-3 w-3" />
          How it works
          <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {expanded && (
          <div className="text-xs text-muted-foreground space-y-2 border-l-2 border-amber-300 pl-3">
            <p><strong>Coin Loading:</strong> Coins stack in the boot base like a Pez dispenser. Each coin powers one full rotation of the damage counter.</p>
            <p><strong>Denomination:</strong> A 6-coin seats deepest (allows 6 total stacked above). A 1-coin seats at top (allows only 3 total). Higher denomination = more HP capacity.</p>
            <p><strong>Terrain Types:</strong> Middle hole shape (●○△□) determines terrain compatibility. Circle fits triangle terrain but not square. Physical shape-fitting replaces rules.</p>
            <p><strong>Sliding Tab:</strong> 3 positions — HP only, HP+Mana simultaneous, Mana only. Controls which counter(s) advance when pushed.</p>
            <p><strong>Supine Lock:</strong> When all coins eject, the figure falls and stays down. No coins = no counter rotation = permanent stop until resupplied.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
