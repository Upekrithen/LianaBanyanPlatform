import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, ChevronLeft, ChevronRight, Eye, EyeOff, Crown, Sword, Shield, Heart } from 'lucide-react';

interface CharacterLayer {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isBase: boolean;
  path: 'sword' | 'crown' | 'shared';
  campaign?: string;
}

const SWORD_PATH: CharacterLayer[] = [
  { id: 'base-body', name: 'Base Body', description: 'Universal humanoid base — same for ALL figure shells', color: '#78716c', icon: '🧍', isBase: true, path: 'shared' },
  { id: 'boot-base', name: 'Boot Base', description: 'Hitbase counter + coin loading recess + root lock protrusions', color: '#92400e', icon: '🥾', isBase: true, path: 'shared' },
  { id: 'rucksack', name: 'Rucksack Overlay', description: 'Twist-lock bayonet mount — displays Roman numeral level on all 6 faces', color: '#b45309', icon: '🎒', isBase: false, path: 'shared' },
  { id: 'peasant', name: 'Peasant', description: 'Starting form. No added layers. The base body IS the Peasant.', color: '#a8a29e', icon: '👤', isBase: false, path: 'sword', campaign: 'Campaign 1' },
  { id: 'farmer', name: 'Farmer', description: 'Tool belt (snap-on waist ring) + cart (detachable). Agricultural equipment.', color: '#65a30d', icon: '🌾', isBase: false, path: 'sword', campaign: 'Campaign 2' },
  { id: 'warrior', name: 'Warrior', description: 'ScaleMail armor (chest overlay) + Terrain Armor (leg guards). Weapon scabbard slots.', color: '#dc2626', icon: '⚔️', isBase: false, path: 'sword', campaign: 'Campaign 3' },
  { id: 'king', name: 'King', description: 'All prior layers + Crown piece + royal cloak. Maximum equipment slots.', color: '#eab308', icon: '👑', isBase: false, path: 'sword', campaign: 'Campaign 4' },
];

const CROWN_PATH: CharacterLayer[] = [
  { id: 'base-body', name: 'Base Body', description: 'Universal humanoid base — same for ALL figure shells', color: '#78716c', icon: '🧍', isBase: true, path: 'shared' },
  { id: 'boot-base', name: 'Boot Base', description: 'Hitbase counter + coin loading recess + root lock protrusions', color: '#92400e', icon: '🥾', isBase: true, path: 'shared' },
  { id: 'rucksack', name: 'Rucksack Overlay', description: 'Twist-lock bayonet mount — displays Roman numeral level on all 6 faces', color: '#b45309', icon: '🎒', isBase: false, path: 'shared' },
  { id: 'merchant', name: 'Merchant', description: 'Cloak overlay draped over base body. Trade goods pouches.', color: '#7c3aed', icon: '🧥', isBase: false, path: 'crown', campaign: 'Campaign 5' },
  { id: 'healer', name: 'Healer', description: 'Herb pouches + staff overlay ON TOP of cloak. Additive layers.', color: '#059669', icon: '🌿', isBase: false, path: 'crown', campaign: 'Campaign 6' },
  { id: 'assassin', name: 'Assassin', description: 'REMOVE the cloak — subtraction reveals the form beneath. Hidden blade mounts.', color: '#1e1b4b', icon: '🗡️', isBase: false, path: 'crown', campaign: 'Campaign 7' },
  { id: 'queen', name: 'Queen', description: 'Fiery Wings (back mount) + Crown Helmet. The only transformation that adds AND subtracts.', color: '#be185d', icon: '👸', isBase: false, path: 'crown', campaign: 'Campaign 8' },
];

const HORSE_PATH: CharacterLayer[] = [
  { id: 'wild-horse', name: 'WildHorse', description: 'Base horse body. Untamed. Fast but no carrying capacity.', color: '#78716c', icon: '🐴', isBase: true, path: 'shared' },
  { id: 'farm-horse', name: 'FarmHorse', description: 'Harness overlay + cart hitch. Can pull equipment.', color: '#65a30d', icon: '🐎', isBase: false, path: 'shared', campaign: 'Campaign 9' },
  { id: 'war-horse', name: 'WarHorse', description: 'Barding armor (full body overlay) + lance mount + shield bracket.', color: '#dc2626', icon: '🏇', isBase: false, path: 'shared', campaign: 'Campaign 10' },
];

type PathChoice = 'sword' | 'crown' | 'horse';

export default function CharacterLayerExplorer() {
  const [activePath, setActivePath] = useState<PathChoice>('sword');
  const [activeLayerIdx, setActiveLayerIdx] = useState(0);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set());

  const layers = activePath === 'sword' ? SWORD_PATH : activePath === 'crown' ? CROWN_PATH : HORSE_PATH;
  const activeLayer = layers[activeLayerIdx];

  const toggleLayer = (id: string) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectStage = (idx: number) => {
    setActiveLayerIdx(idx);
    const layersUpTo = new Set<string>();
    for (let i = 0; i <= idx; i++) {
      if (layers[i].id !== 'assassin') {
        layersUpTo.add(layers[i].id);
      }
    }
    if (activePath === 'crown' && idx >= 5) {
      layersUpTo.delete('merchant');
    }
    setVisibleLayers(layersUpTo);
  };

  const pathIcons: Record<PathChoice, React.ReactNode> = {
    sword: <Sword className="h-4 w-4" />,
    crown: <Crown className="h-4 w-4" />,
    horse: <Shield className="h-4 w-4" />,
  };

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          Figure Layer Explorer
          <Badge variant="outline" className="ml-auto text-[10px]">Snap-On Progression</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Every figure shell uses the SAME base body. What changes is what's on it.
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Path Selector */}
        <div className="flex gap-2">
          {(['sword', 'crown', 'horse'] as PathChoice[]).map(path => (
            <Button
              key={path}
              variant={activePath === path ? 'default' : 'outline'}
              size="sm"
              className="gap-1 capitalize"
              onClick={() => { setActivePath(path); setActiveLayerIdx(0); setVisibleLayers(new Set()); }}
            >
              {pathIcons[path]}
              {path === 'sword' ? 'Sword Path' : path === 'crown' ? 'Crown Path' : 'Horse Path'}
            </Button>
          ))}
        </div>

        {/* Visual Stack */}
        <div className="flex gap-6">
          {/* Layer Stack Visualization */}
          <div className="flex flex-col-reverse items-center gap-1 min-w-[100px]">
            {layers.map((layer, i) => {
              const isVisible = visibleLayers.has(layer.id);
              const isActive = i === activeLayerIdx;
              const isSubtraction = layer.id === 'assassin';
              return (
                <button
                  key={`${layer.id}-${i}`}
                  onClick={() => selectStage(i)}
                  className={`w-24 transition-all duration-300 rounded-lg border-2 flex items-center justify-center relative ${
                    isActive ? 'ring-2 ring-offset-1 ring-primary' : ''
                  } ${isVisible ? 'opacity-100' : 'opacity-20'} ${
                    isSubtraction ? 'border-dashed' : 'border-solid'
                  }`}
                  style={{
                    borderColor: layer.color,
                    backgroundColor: `${layer.color}20`,
                    height: layer.isBase ? '28px' : '24px',
                  }}
                  title={layer.name}
                >
                  <span className="text-sm">{layer.icon}</span>
                  {isSubtraction && (
                    <span className="absolute -right-1 -top-1 text-[8px] bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center">−</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{activeLayer.icon}</span>
                <h3 className="font-bold text-lg">{activeLayer.name}</h3>
                {activeLayer.campaign && (
                  <Badge variant="outline" className="text-[10px]">{activeLayer.campaign}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{activeLayer.description}</p>
            </div>

            {/* Progression Timeline */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => selectStage(Math.max(0, activeLayerIdx - 1))}
                disabled={activeLayerIdx === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {layers.map((layer, i) => (
                <button
                  key={`timeline-${layer.id}-${i}`}
                  onClick={() => selectStage(i)}
                  className={`h-6 min-w-6 rounded-full text-xs flex items-center justify-center transition-all ${
                    i === activeLayerIdx
                      ? 'text-white font-bold scale-110'
                      : i < activeLayerIdx
                        ? 'opacity-80'
                        : 'opacity-30'
                  }`}
                  style={{
                    backgroundColor: i <= activeLayerIdx ? layer.color : '#d4d4d4',
                  }}
                >
                  {layer.icon}
                </button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => selectStage(Math.min(layers.length - 1, activeLayerIdx + 1))}
                disabled={activeLayerIdx === layers.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Layer Toggles */}
            <div className="border rounded-lg p-3 bg-muted/20">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Toggle Layers
              </p>
              <div className="flex flex-wrap gap-1.5">
                {layers.map((layer, i) => (
                  <button
                    key={`toggle-${layer.id}-${i}`}
                    onClick={() => toggleLayer(layer.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-all ${
                      visibleLayers.has(layer.id)
                        ? 'border-current opacity-100'
                        : 'border-transparent opacity-40'
                    }`}
                    style={{ color: layer.color }}
                  >
                    {visibleLayers.has(layer.id) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {layer.icon} {layer.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Design Principle */}
            {activePath === 'crown' && activeLayerIdx >= 5 && (
              <div className="text-xs p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                <strong>Subtraction as Progression:</strong> The Assassin removes the Merchant's cloak — revealing what was hidden underneath.
                Not every evolution adds. Sometimes growth means shedding.
              </div>
            )}
            {activePath === 'sword' && activeLayerIdx >= 6 && (
              <div className="text-xs p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                <strong>Same Body, Different Destiny:</strong> The King's body IS the Peasant's body.
                Every layer snaps on — remove the crown and armor, and the Peasant remains.
              </div>
            )}
          </div>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/30 rounded">
            <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
            <p className="text-[10px] font-medium">Same Base</p>
            <p className="text-[9px] text-muted-foreground">Peasant = King body</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <Layers className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
            <p className="text-[10px] font-medium">Snap-On Layers</p>
            <p className="text-[9px] text-muted-foreground">Physical, not digital</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <Crown className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <p className="text-[10px] font-medium">2 Paths</p>
            <p className="text-[9px] text-muted-foreground">Sword + Crown</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
