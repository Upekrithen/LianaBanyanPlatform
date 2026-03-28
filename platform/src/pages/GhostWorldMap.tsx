/**
 * Ghost World Map — K115 D1
 * Storefronts rendered as hex tiles on a flat grid.
 * Category-coloured hexes, click→storefront, unclaimed slots with CTA.
 * Queries the storefronts table directly — no island/building hierarchy.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search, ZoomIn, ZoomOut, Maximize2, X, Globe, Plus, Store,
} from 'lucide-react';

interface Storefront {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_open: boolean;
  logo_url: string | null;
  user_id: string;
  business_name?: string;
}

const CATEGORY_PALETTE: Record<string, { color: string; emoji: string; label: string }> = {
  food: { color: '#f59e0b', emoji: '🍩', label: 'Food' },
  food_drink: { color: '#f59e0b', emoji: '🍩', label: 'Food' },
  service: { color: '#3b82f6', emoji: '🔧', label: 'Service' },
  services: { color: '#3b82f6', emoji: '🔧', label: 'Services' },
  retail: { color: '#10b981', emoji: '🛒', label: 'Retail' },
  creative: { color: '#ec4899', emoji: '🎨', label: 'Creative' },
  crafts_making: { color: '#ec4899', emoji: '🎨', label: 'Crafts' },
  maker: { color: '#a855f7', emoji: '⚙️', label: 'Maker' },
  digital: { color: '#06b6d4', emoji: '💻', label: 'Digital' },
  education: { color: '#8b5cf6', emoji: '📚', label: 'Education' },
  home_garden: { color: '#22c55e', emoji: '🏡', label: 'Home' },
  health: { color: '#14b8a6', emoji: '💚', label: 'Health' },
  general: { color: '#64748b', emoji: '🏪', label: 'General' },
};

const DEFAULT_PAL = { color: '#64748b', emoji: '🏪', label: 'General' };
const FILTER_CATS = ['all', 'food', 'service', 'retail', 'creative', 'maker', 'digital', 'education'];

const HEX_SIZE = 44;
const SQRT3 = Math.sqrt(3);

function hexToPixel(q: number, r: number): { x: number; y: number } {
  return {
    x: HEX_SIZE * (3 / 2) * q,
    y: HEX_SIZE * (SQRT3 / 2 * q + SQRT3 * r),
  };
}

function hexCorners(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function spiralCoords(count: number): { q: number; r: number }[] {
  const out: { q: number; r: number }[] = [{ q: 0, r: 0 }];
  if (count <= 1) return out.slice(0, count);

  const dirs = [
    { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
    { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 },
  ];

  let q = 0, r = 0;
  for (let ring = 1; out.length < count; ring++) {
    q += 1; r -= 1;
    for (let d = 0; d < 6 && out.length < count; d++) {
      const steps = d === 0 ? ring - 1 : ring;
      for (let s = 0; s < steps && out.length < count; s++) {
        q += dirs[d].q;
        r += dirs[d].r;
        out.push({ q, r });
      }
    }
  }
  return out;
}

export default function GhostWorldMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const svgRef = useRef<SVGSVGElement>(null);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [selected, setSelected] = useState<Storefront | null>(null);

  const [viewBox, setViewBox] = useState({ x: -500, y: -400, w: 1000, h: 800 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ cx: 0, cy: 0, vx: 0, vy: 0 });

  const { data: storefronts = [], isLoading } = useQuery({
    queryKey: ['gw-storefronts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('storefronts')
        .select('id, name, slug, category, is_open, logo_url, user_id, business_name')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      return (data || []) as Storefront[];
    },
  });

  const filtered = useMemo(() => {
    let list = storefronts;
    if (catFilter !== 'all') {
      list = list.filter(s => {
        const cat = (s.category || 'general').toLowerCase();
        return cat === catFilter || cat.startsWith(catFilter);
      });
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.name || s.business_name || '').toLowerCase().includes(q) ||
        (s.slug || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [storefronts, catFilter, search]);

  const UNCLAIMED_COUNT = 12;
  const totalHexes = filtered.length + UNCLAIMED_COUNT;
  const coords = useMemo(() => spiralCoords(totalHexes), [totalHexes]);

  const clampZoom = useCallback((vb: typeof viewBox, factor: number, cx: number, cy: number) => {
    const minW = 250, maxW = 3000;
    const newW = Math.min(maxW, Math.max(minW, vb.w * factor));
    const newH = Math.min(maxW * 0.75, Math.max(minW * 0.75, vb.h * factor));
    const rx = (cx - vb.x) / vb.w;
    const ry = (cy - vb.y) / vb.h;
    return { x: cx - rx * newW, y: cy - ry * newH, w: newW, h: newH };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const my = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
    setViewBox(vb => clampZoom(vb, factor, mx, my));
  }, [viewBox, clampZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragOrigin.current = { cx: e.clientX, cy: e.clientY, vx: viewBox.x, vy: viewBox.y };
  }, [viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = (e.clientX - dragOrigin.current.cx) / rect.width * viewBox.w;
    const dy = (e.clientY - dragOrigin.current.cy) / rect.height * viewBox.h;
    setViewBox(vb => ({ ...vb, x: dragOrigin.current.vx - dx, y: dragOrigin.current.vy - dy }));
  }, [dragging, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const fitAll = useCallback(() => {
    if (coords.length === 0) return;
    const pixels = coords.map(c => hexToPixel(c.q, c.r));
    const pad = HEX_SIZE * 2.5;
    const minX = Math.min(...pixels.map(p => p.x)) - pad;
    const maxX = Math.max(...pixels.map(p => p.x)) + pad;
    const minY = Math.min(...pixels.map(p => p.y)) - pad;
    const maxY = Math.max(...pixels.map(p => p.y)) + pad;
    setViewBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
  }, [coords]);

  const pal = (cat: string) => CATEGORY_PALETTE[(cat || 'general').toLowerCase()] || DEFAULT_PAL;

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-slate-950 relative overflow-hidden select-none" data-xray-id="ghost-world-map-k115">
      {/* Title overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <Globe className="w-5 h-5 text-amber-500" />
        <div>
          <h1 className="text-sm font-bold text-amber-400 leading-none">Ghost World</h1>
          <p className="text-[10px] text-slate-500">Storefront Discovery Map</p>
        </div>
      </div>

      {/* Search + category */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
        <div className="relative w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search storefronts..."
            className="pl-8 h-8 text-xs bg-slate-900/80 border-slate-700 text-slate-200 placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {FILTER_CATS.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                catFilter === cat ? 'bg-amber-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All' : (CATEGORY_PALETTE[cat]?.label || cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-1.5">
        <Button size="icon" variant="outline" className="h-8 w-8 bg-slate-900/80 border-slate-700 text-slate-300"
          onClick={() => setViewBox(vb => clampZoom(vb, 0.8, vb.x + vb.w / 2, vb.y + vb.h / 2))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 bg-slate-900/80 border-slate-700 text-slate-300"
          onClick={() => setViewBox(vb => clampZoom(vb, 1.25, vb.x + vb.w / 2, vb.y + vb.h / 2))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 bg-slate-900/80 border-slate-700 text-slate-300" onClick={fitAll}>
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-10 h-12 rounded bg-slate-800 animate-pulse" style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }} />
              ))}
            </div>
            <p className="text-xs text-slate-500">Loading storefronts...</p>
          </div>
        </div>
      )}

      {/* SVG hex grid */}
      {!isLoading && (
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <filter id="hex-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Storefront hexes */}
          {filtered.map((sf, idx) => {
            const coord = coords[idx];
            if (!coord) return null;
            const { x, y } = hexToPixel(coord.q, coord.r);
            const p = pal(sf.category);
            return (
              <g
                key={sf.id}
                className="cursor-pointer"
                onClick={() => setSelected(sf)}
              >
                <polygon
                  points={hexCorners(x, y, HEX_SIZE * 0.92)}
                  fill={`${p.color}18`}
                  stroke={p.color}
                  strokeWidth="1.8"
                  filter="url(#hex-glow)"
                  className="transition-all hover:brightness-150"
                />
                <text x={x} y={y - 4} textAnchor="middle" fontSize="16" dominantBaseline="central">
                  {p.emoji}
                </text>
                <text x={x} y={y + 14} textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="600">
                  {(sf.name || sf.business_name || '').slice(0, 14)}
                </text>
                {!sf.is_open && (
                  <text x={x} y={y + 22} textAnchor="middle" fill="#ef4444" fontSize="5.5" fontWeight="500">CLOSED</text>
                )}
              </g>
            );
          })}

          {/* Unclaimed hexes */}
          {Array.from({ length: UNCLAIMED_COUNT }, (_, i) => {
            const idx = filtered.length + i;
            const coord = coords[idx];
            if (!coord) return null;
            const { x, y } = hexToPixel(coord.q, coord.r);
            return (
              <g
                key={`unclaimed-${i}`}
                className="cursor-pointer"
                onClick={() => navigate(user ? '/tools/storefront-builder' : '/auth')}
              >
                <polygon
                  points={hexCorners(x, y, HEX_SIZE * 0.92)}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="6,4"
                  opacity="0.5"
                  className="transition-all hover:stroke-emerald-500 hover:opacity-100"
                />
                <text x={x} y={y - 2} textAnchor="middle" fill="#475569" fontSize="12" dominantBaseline="central">
                  +
                </text>
                <text x={x} y={y + 12} textAnchor="middle" fill="#475569" fontSize="5.5">
                  Start Yours
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Empty state */}
      {!isLoading && storefronts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <Globe className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-xl font-bold text-slate-500">Ghost World is waking up...</p>
            <p className="text-sm text-slate-600 mt-2 mb-4">Be the first to claim your hex.</p>
            <Button className="bg-amber-600 hover:bg-amber-500" onClick={() => navigate(user ? '/tools/storefront-builder' : '/auth')}>
              <Store className="w-4 h-4 mr-2" /> Start Your Storefront
            </Button>
          </div>
        </div>
      )}

      {/* Selected storefront popup */}
      {selected && (
        <div className="absolute bottom-6 right-6 z-30 w-72 animate-in slide-in-from-bottom-4 duration-200">
          <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-4">
              <button className="absolute top-2 right-2 text-slate-500 hover:text-white" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 mb-3">
                {selected.logo_url ? (
                  <img src={selected.logo_url} alt="" className="w-11 h-11 rounded-lg object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-amber-600/20 flex items-center justify-center text-xl">
                    {pal(selected.category).emoji}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{selected.name || selected.business_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant={selected.is_open ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {selected.is_open ? 'Open' : 'Closed'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]" style={{ color: pal(selected.category).color, borderColor: `${pal(selected.category).color}40` }}>
                      {pal(selected.category).label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-xs"
                  onClick={() => { setSelected(null); navigate(`/menu/${selected.slug}`); }}
                >
                  <Store className="w-3.5 h-3.5 mr-1" /> Visit Storefront
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
