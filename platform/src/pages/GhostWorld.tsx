/**
 * GHOST WORLD — HexIsle Storefront Discovery Map (K88)
 * =====================================================
 * SVG hex grid where real storefronts appear as buildings on islands.
 * Non-members can browse freely. Members can place storefronts.
 * "If it fits, it sits" — any storefront can occupy any empty slot.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Globe } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import HexGrid, { type GWIsland, type GWBuilding } from '@/components/ghost-world/HexGrid';
import MapControls from '@/components/ghost-world/MapControls';
import BuildingCard from '@/components/ghost-world/BuildingCard';
import IslandPanel from '@/components/ghost-world/IslandPanel';

export default function GhostWorld() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const placeParam = searchParams.get('place') === 'true';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState<GWBuilding | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<GWIsland | null>(null);
  const [placementMode, setPlacementMode] = useState<{ islandId: string } | null>(null);
  const [confirmSlot, setConfirmSlot] = useState<{ island: GWIsland; slotIndex: number } | null>(null);

  // --- Data queries ---

  const { data: islands = [], isLoading: islandsLoading } = useQuery({
    queryKey: ['gw-islands'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ghost_world_islands')
        .select('*')
        .eq('is_active', true);
      return (data || []) as GWIsland[];
    },
  });

  const { data: buildings = [], isLoading: buildingsLoading } = useQuery({
    queryKey: ['gw-buildings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ghost_world_buildings')
        .select(`
          id, island_id, storefront_id, building_slot, building_size,
          is_popup, popup_expires_at, placed_by,
          storefront:storefront_id (id, name, slug, category, is_open, logo_url, user_id)
        `)
        .order('building_slot');
      return (data || []).map((b: any) => ({
        ...b,
        storefront: Array.isArray(b.storefront) ? b.storefront[0] : b.storefront,
      })) as GWBuilding[];
    },
  });

  // User's unplaced storefront
  const { data: userStorefront } = useQuery({
    queryKey: ['gw-user-storefront', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: sfs } = await supabase
        .from('storefronts')
        .select('id, name, slug')
        .eq('user_id', user!.id)
        .limit(5);
      if (!sfs?.length) return null;
      const placedIds = new Set(buildings.filter(b => b.placed_by === user!.id).map(b => b.storefront_id));
      const unplaced = sfs.find(s => !placedIds.has(s.id));
      return unplaced ?? null;
    },
  });

  // --- Derived state ---

  const buildingsByIsland = useMemo(() => {
    const m = new Map<string, GWBuilding[]>();
    buildings.forEach(b => {
      const arr = m.get(b.island_id) || [];
      arr.push(b);
      m.set(b.island_id, arr);
    });
    return m;
  }, [buildings]);

  const dimmedIslands = useMemo(() => {
    if (category === 'all' && !search) return undefined;
    const dimmed = new Set<string>();
    islands.forEach(isl => {
      let match = true;
      if (category !== 'all' && isl.category !== category) {
        const blds = buildingsByIsland.get(isl.id) || [];
        const catMatch = blds.some(b => b.storefront?.category === category);
        if (!catMatch) match = false;
      }
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = isl.name.toLowerCase().includes(q);
        const blds = buildingsByIsland.get(isl.id) || [];
        const bldMatch = blds.some(b => b.storefront?.name?.toLowerCase().includes(q));
        if (!nameMatch && !bldMatch) match = false;
      }
      if (!match) dimmed.add(isl.id);
    });
    return dimmed;
  }, [islands, buildings, category, search, buildingsByIsland]);

  const highlightedBuildings = useMemo(() => {
    if (!search) return undefined;
    const q = search.toLowerCase();
    const set = new Set<string>();
    buildings.forEach(b => {
      if (b.storefront?.name?.toLowerCase().includes(q)) set.add(b.id);
    });
    return set;
  }, [buildings, search]);

  // --- Place flow auto-enter ---
  useEffect(() => {
    if (placeParam && user && userStorefront && islands.length > 0 && !placementMode) {
      const first = islands[0];
      setPlacementMode({ islandId: first.id });
      setSelectedIsland(first);
      setSearchParams({}, { replace: true });
    }
  }, [placeParam, user, userStorefront, islands, placementMode, setSearchParams]);

  // --- Handlers ---

  const handleBuildingClick = useCallback((b: GWBuilding) => {
    setSelectedIsland(null);
    setSelectedBuilding(b);
  }, []);

  const handleIslandClick = useCallback((i: GWIsland) => {
    setSelectedBuilding(null);
    setSelectedIsland(i);
  }, []);

  const handleEmptySlotClick = useCallback((island: GWIsland, slotIndex: number) => {
    if (!userStorefront) {
      toast.error('Create a Storefront First', {
        action: { label: 'Go', onClick: () => navigate('/tools/storefront-builder') },
      });
      return;
    }
    setConfirmSlot({ island, slotIndex });
  }, [userStorefront, navigate]);

  const handleEnterPlacementMode = useCallback(() => {
    if (!selectedIsland) return;
    if (!user) { navigate('/auth'); return; }
    if (!userStorefront) {
      toast.info('Create a Storefront First', {
        action: { label: 'Go', onClick: () => navigate('/tools/storefront-builder') },
      });
      return;
    }
    // Check if user's storefront is already placed
    const alreadyPlaced = buildings.find(b => b.storefront_id === userStorefront.id);
    if (alreadyPlaced) {
      const homeIsland = islands.find(i => i.id === alreadyPlaced.island_id);
      toast.info(`Your storefront is already on ${homeIsland?.name || 'an island'}. Pop-Up Kiosks coming soon!`);
      return;
    }
    setPlacementMode({ islandId: selectedIsland.id });
    setSelectedIsland(null);
  }, [selectedIsland, user, userStorefront, buildings, islands, navigate]);

  const handleConfirmPlace = async () => {
    if (!confirmSlot || !userStorefront || !user) return;
    try {
      const { error } = await supabase.from('ghost_world_buildings').insert({
        island_id: confirmSlot.island.id,
        storefront_id: userStorefront.id,
        building_slot: confirmSlot.slotIndex,
        building_size: 'small',
        placed_by: user.id,
      });
      if (error) throw error;
      toast.success(`Your storefront is now on ${confirmSlot.island.name}!`);
      queryClient.invalidateQueries({ queryKey: ['gw-buildings'] });
      queryClient.invalidateQueries({ queryKey: ['gw-user-storefront'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to place storefront');
    }
    setConfirmSlot(null);
    setPlacementMode(null);
  };

  const isLoading = islandsLoading || buildingsLoading;

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-slate-950 relative overflow-hidden select-none" data-xray-id="ghost-world-hexisle">
      {/* Title overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <Globe className="w-5 h-5 text-amber-500" />
        <div>
          <h1 className="text-sm font-bold text-amber-400 leading-none">Ghost World</h1>
          <p className="text-[10px] text-slate-500">Explore the Islands</p>
        </div>
      </div>

      {/* Placement mode banner */}
      {placementMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-emerald-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Click a green slot to place "{userStorefront?.name}"
          <button className="ml-2 text-emerald-500 hover:text-white text-xs underline" onClick={() => setPlacementMode(null)}>
            Cancel
          </button>
        </div>
      )}

      {/* Map controls */}
      <MapControls
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="grid grid-cols-3 gap-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-12 h-14 rounded bg-slate-800 animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
              ))}
            </div>
            <p className="text-xs text-slate-500">Loading islands...</p>
          </div>
        </div>
      )}

      {/* Hex grid */}
      {!isLoading && (
        <HexGrid
          islands={islands}
          buildings={buildings}
          dimmedIslands={dimmedIslands}
          highlightedBuildings={highlightedBuildings}
          placementMode={placementMode}
          userStorefrontId={userStorefront?.id ?? null}
          onBuildingClick={handleBuildingClick}
          onIslandClick={handleIslandClick}
          onEmptySlotClick={handleEmptySlotClick}
        />
      )}

      {/* Empty state */}
      {!isLoading && islands.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-xl font-bold text-slate-500">Ghost World is waking up...</p>
            <p className="text-sm text-slate-600 mt-2">Islands appear when the migration is pushed.</p>
          </div>
        </div>
      )}

      {/* Building card popup */}
      {selectedBuilding && (
        <BuildingCard
          building={selectedBuilding}
          island={islands.find(i => i.id === selectedBuilding.island_id)}
          onClose={() => setSelectedBuilding(null)}
        />
      )}

      {/* Island side panel */}
      {selectedIsland && (
        <IslandPanel
          island={selectedIsland}
          buildings={buildingsByIsland.get(selectedIsland.id) || []}
          userHasUnplacedStorefront={!!userStorefront && !buildings.some(b => b.storefront_id === userStorefront.id)}
          onClose={() => setSelectedIsland(null)}
          onBuildingClick={(b) => { setSelectedIsland(null); setSelectedBuilding(b); }}
          onEnterPlacementMode={handleEnterPlacementMode}
        />
      )}

      {/* Placement confirm dialog */}
      <AlertDialog open={!!confirmSlot} onOpenChange={(open) => { if (!open) setConfirmSlot(null); }}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Place Your Storefront</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Place <span className="text-amber-400 font-medium">{userStorefront?.name}</span> at{' '}
              <span className="font-medium" style={{ color: confirmSlot?.island.theme_color }}>
                {confirmSlot?.island.name}
              </span>
              , Slot {confirmSlot?.slotIndex}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-500" onClick={handleConfirmPlace}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
