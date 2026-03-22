/**
 * Ghost World Map — Visual storefront discovery layer.
 * SVG hex grid with clickable islands and building popups.
 * Public page — non-members can browse, members get full features.
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BeaconDropButton } from '@/components/BeaconDropButton';
import {
  Search, ZoomIn, ZoomOut, Maximize2, X, MapPin, Store, Star, Package,
  Paintbrush, BookOpen, Wrench, ShoppingCart, Globe,
} from 'lucide-react';

interface Island {
  id: string;
  name: string;
  description: string | null;
  hex_q: number;
  hex_r: number;
  member_count: number;
  theme_color: string;
}

interface Building {
  id: string;
  island_id: string;
  storefront_id: string;
  building_slot: number;
  building_size: string;
  is_popup: boolean;
  popup_expires_at: string | null;
  storefront?: {
    id: string;
    business_name: string;
    slug: string;
    business_category: string;
    is_open: boolean;
  };
}

const HEX_SIZE = 50;
const HEX_W = HEX_SIZE * 2;
const HEX_H = Math.sqrt(3) * HEX_SIZE;

const CATEGORY_CONFIG: Record<string, { icon: typeof Store; color: string; label: string }> = {
  food: { icon: Store, color: '#f59e0b', label: 'Food' },
  service: { icon: Wrench, color: '#3b82f6', label: 'Service' },
  retail: { icon: ShoppingCart, color: '#10b981', label: 'Retail' },
  creative: { icon: Paintbrush, color: '#ec4899', label: 'Creative' },
  education: { icon: BookOpen, color: '#8b5cf6', label: 'Education' },
};

function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * (3 / 2) * q;
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

const SLOT_OFFSETS = [
  { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 1, r: 0 },
  { q: 0, r: 1 }, { q: -1, r: 1 }, { q: -1, r: 0 },
];

const SIZE_SCALE: Record<string, number> = { small: 0.55, medium: 0.7, large: 0.85 };
const CATEGORIES = ['all', 'food', 'service', 'retail', 'creative', 'education'];

export default function GhostWorldMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const svgRef = useRef<SVGSVGElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const { data: islands = [] } = useQuery({
    queryKey: ['ghost-world-islands'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ghost_world_islands')
        .select('*')
        .eq('is_active', true);
      return (data || []) as Island[];
    },
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['ghost-world-buildings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ghost_world_buildings')
        .select('*, storefront:storefront_id(id, business_name, slug, business_category, is_open)')
        .order('building_slot');
      return (data || []) as Building[];
    },
  });

  const buildingsByIsland = useMemo(() => {
    const map = new Map<string, Building[]>();
    for (const b of buildings) {
      const list = map.get(b.island_id) || [];
      list.push(b);
      map.set(b.island_id, list);
    }
    return map;
  }, [buildings]);

  const filteredIslands = useMemo(() => {
    if (!search && categoryFilter === 'all') return islands;
    return islands.filter(island => {
      const blds = buildingsByIsland.get(island.id) || [];
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = island.name.toLowerCase().includes(q);
        const bldMatch = blds.some(b => b.storefront?.business_name?.toLowerCase().includes(q));
        if (!nameMatch && !bldMatch) return false;
      }
      if (categoryFilter !== 'all') {
        const catMatch = blds.some(b => b.storefront?.business_category === categoryFilter);
        if (!catMatch) return false;
      }
      return true;
    });
  }, [islands, buildings, search, categoryFilter, buildingsByIsland]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const fitAll = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-950 relative overflow-hidden select-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 p-3 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          ← Back
        </Button>
        <div className="flex-1 flex items-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search businesses..."
              className="pl-9 bg-slate-900/80 border-slate-700 text-sm h-9"
            />
          </div>
        </div>
        <Globe className="w-5 h-5 text-amber-500" />
        <span className="text-sm font-semibold text-amber-400">Ghost World</span>
      </div>

      {/* Category filter */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat]?.label || cat}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1.5">
        <Button size="icon" variant="outline" className="h-8 w-8 bg-slate-900/80 border-slate-700" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 bg-slate-900/80 border-slate-700" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 bg-slate-900/80 border-slate-700" onClick={fitAll}>
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* SVG Map */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <filter id="island-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500)}, ${pan.y + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400)}) scale(${zoom})`}>
          {/* Grid watermark */}
          {Array.from({ length: 7 }, (_, qi) => qi - 3).map(q =>
            Array.from({ length: 7 }, (_, ri) => ri - 3).map(r => {
              const { x, y } = hexToPixel(q, r);
              return (
                <polygon
                  key={`grid-${q}-${r}`}
                  points={hexPoints(x, y, HEX_SIZE * 0.98)}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              );
            })
          )}

          {/* Islands */}
          {filteredIslands.map(island => {
            const { x, y } = hexToPixel(island.hex_q, island.hex_r);
            const blds = buildingsByIsland.get(island.id) || [];

            return (
              <g key={island.id} filter="url(#island-glow)">
                {/* Center hex — island info */}
                <polygon
                  points={hexPoints(x, y, HEX_SIZE * 0.95)}
                  fill={`${island.theme_color}20`}
                  stroke={island.theme_color}
                  strokeWidth="2"
                  className="transition-all hover:brightness-125"
                />
                <text x={x} y={y - 8} textAnchor="middle" fill={island.theme_color} fontSize="10" fontWeight="bold">
                  {island.name}
                </text>
                <text x={x} y={y + 6} textAnchor="middle" fill="#94a3b8" fontSize="8">
                  {blds.length} business{blds.length !== 1 ? 'es' : ''}
                </text>
                <text x={x} y={y + 18} textAnchor="middle" fill="#64748b" fontSize="7">
                  {island.member_count} members
                </text>

                {/* Building hexes */}
                {blds.map((bld, i) => {
                  const slot = SLOT_OFFSETS[bld.building_slot - 1] || SLOT_OFFSETS[i % 6];
                  const bldPixel = hexToPixel(island.hex_q + slot.q * 0.6, island.hex_r + slot.r * 0.6);
                  const bx = bldPixel.x;
                  const by = bldPixel.y;
                  const scale = SIZE_SCALE[bld.building_size] || 0.55;
                  const cat = bld.storefront?.business_category || 'food';
                  const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.food;

                  return (
                    <g
                      key={bld.id}
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={(e) => { e.stopPropagation(); setSelectedBuilding(bld); }}
                    >
                      <polygon
                        points={hexPoints(bx, by, HEX_SIZE * scale)}
                        fill={`${cfg.color}30`}
                        stroke={cfg.color}
                        strokeWidth="1.5"
                        strokeDasharray={bld.is_popup ? '4,2' : 'none'}
                      />
                      <text x={bx} y={by - 2} textAnchor="middle" fontSize="12">
                        {cat === 'food' ? '🍩' : cat === 'service' ? '🔧' : cat === 'retail' ? '🛒' : cat === 'creative' ? '🎨' : '📚'}
                      </text>
                      <text x={bx} y={by + 10} textAnchor="middle" fill="#e2e8f0" fontSize="6" fontWeight="500">
                        {(bld.storefront?.business_name || '').slice(0, 12)}
                      </text>
                      {bld.is_popup && (
                        <text x={bx} y={by + 18} textAnchor="middle" fill="#a855f7" fontSize="5">Pop-Up</text>
                      )}
                    </g>
                  );
                })}

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 6 - blds.length) }, (_, i) => {
                  const slotIdx = blds.length + i;
                  const slot = SLOT_OFFSETS[slotIdx % 6];
                  const ep = hexToPixel(island.hex_q + slot.q * 0.6, island.hex_r + slot.r * 0.6);
                  return (
                    <polygon
                      key={`empty-${island.id}-${slotIdx}`}
                      points={hexPoints(ep.x, ep.y, HEX_SIZE * 0.4)}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="0.5"
                      strokeDasharray="3,3"
                      opacity="0.3"
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Building popup */}
      {selectedBuilding && (
        <div className="absolute bottom-6 right-24 z-30 w-72 animate-in slide-in-from-bottom-4 duration-200">
          <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <button
                className="absolute top-2 right-2 text-slate-500 hover:text-white"
                onClick={() => setSelectedBuilding(null)}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center text-lg">
                  {(() => {
                    const cat = selectedBuilding.storefront?.business_category || 'food';
                    return cat === 'food' ? '🍩' : cat === 'service' ? '🔧' : cat === 'retail' ? '🛒' : cat === 'creative' ? '🎨' : '📚';
                  })()}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {selectedBuilding.storefront?.business_name || 'Unknown Business'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {islands.find(i => i.id === selectedBuilding.island_id)?.name || 'Island'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <Badge variant={selectedBuilding.storefront?.is_open ? 'default' : 'secondary'} className="text-[10px]">
                  {selectedBuilding.storefront?.is_open ? 'Open' : 'Closed'}
                </Badge>
                <span className="capitalize">{selectedBuilding.storefront?.business_category}</span>
                {selectedBuilding.is_popup && (
                  <Badge variant="outline" className="text-purple-400 border-purple-500/30 text-[10px]">Pop-Up</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-xs"
                  onClick={() => {
                    setSelectedBuilding(null);
                    navigate(`/menu/${selectedBuilding.storefront?.slug}`);
                  }}
                >
                  View Menu
                </Button>
                {user && <BeaconDropButton compact className="shrink-0" />}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {islands.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-xl font-bold text-slate-500">Ghost World is waking up...</p>
            <p className="text-sm text-slate-600 mt-2">Islands appear when storefronts are placed by Node Captains.</p>
          </div>
        </div>
      )}
    </div>
  );
}
