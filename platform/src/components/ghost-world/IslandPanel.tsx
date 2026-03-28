/**
 * IslandPanel — side panel (right) showing island details.
 * Building list, slot count, place button, coalition presence.
 * Mobile: bottom sheet.
 */

import { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, MapPin, Store, ArrowRight } from 'lucide-react';
import type { GWIsland, GWBuilding } from './HexGrid';

interface IslandPanelProps {
  island: GWIsland;
  buildings: GWBuilding[];
  userHasUnplacedStorefront: boolean;
  onClose: () => void;
  onBuildingClick: (b: GWBuilding) => void;
  onEnterPlacementMode: () => void;
}

const SIZE_COLORS: Record<string, string> = {
  small: 'bg-slate-700 text-slate-300',
  medium: 'bg-blue-900/50 text-blue-300',
  large: 'bg-amber-900/50 text-amber-300',
};

export default function IslandPanel({
  island, buildings, userHasUnplacedStorefront,
  onClose, onBuildingClick, onEnterPlacementMode,
}: IslandPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  const fillPercent = island.max_slots > 0 ? (buildings.length / island.max_slots) * 100 : 0;

  const catCounts = buildings.reduce<Record<string, number>>((acc, b) => {
    const cat = b.storefront?.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      ref={panelRef}
      className={`
        fixed z-40 bg-slate-900/95 backdrop-blur-sm border-slate-700 shadow-2xl transition-transform duration-300 animate-in overflow-y-auto
        max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:max-h-[70vh] max-md:rounded-t-2xl max-md:border-t max-md:slide-in-from-bottom
        md:top-0 md:right-0 md:h-full md:w-80 md:border-l md:slide-in-from-right
      `}
    >
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm p-4 border-b border-slate-800 z-10">
        <button className="absolute top-4 right-4 text-slate-500 hover:text-white" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: island.theme_color }} />
          <h2 className="text-lg font-bold text-white">{island.name}</h2>
        </div>
        {island.description && <p className="text-xs text-slate-400">{island.description}</p>}
      </div>

      <div className="p-4 space-y-5">
        {/* Slot progress */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{buildings.length} of {island.max_slots} slots filled</span>
            <span>{Math.round(fillPercent)}%</span>
          </div>
          <Progress value={fillPercent} className="h-2" />
        </div>

        {/* Category breakdown */}
        {Object.keys(catCounts).length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(catCounts).map(([cat, count]) => (
                <Badge key={cat} variant="outline" className="text-[10px] text-slate-300 border-slate-600">
                  {cat} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Place storefront */}
        {user && userHasUnplacedStorefront && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-500 gap-2"
            onClick={onEnterPlacementMode}
          >
            <Store className="w-4 h-4" /> Place Your Storefront
          </Button>
        )}

        {user && !userHasUnplacedStorefront && (
          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-300 gap-2"
            onClick={() => navigate('/tools/storefront-builder')}
          >
            <Store className="w-4 h-4" /> Create a Storefront First
          </Button>
        )}

        {/* Building list */}
        <div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">
            Businesses ({buildings.length})
          </p>
          {buildings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No businesses yet — be the first!</p>
          ) : (
            <div className="space-y-1.5">
              {buildings.map(b => (
                <button
                  key={b.id}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left transition-colors"
                  onClick={() => onBuildingClick(b)}
                >
                  {b.storefront?.logo_url ? (
                    <img src={b.storefront.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-sm">🏪</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{b.storefront?.name || 'Business'}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`text-[9px] px-1.5 py-0 ${SIZE_COLORS[b.building_size] || SIZE_COLORS.small}`}>
                        {b.building_size}
                      </Badge>
                      {b.is_popup && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-purple-400 border-purple-500/30">popup</Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
