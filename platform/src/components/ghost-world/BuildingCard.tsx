/**
 * BuildingCard — slide-up popup showing storefront details when a building hex is clicked.
 * Includes storefront info, rating, menu link, beacon button, recent orders.
 */

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, ShoppingBag, MapPin, Clock, LogIn } from 'lucide-react';
import type { GWBuilding, GWIsland } from './HexGrid';

interface BuildingCardProps {
  building: GWBuilding;
  island: GWIsland | undefined;
  onClose: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
        />
      ))}
      <span className="text-xs text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

const SIZE_LABELS: Record<string, { label: string; color: string }> = {
  small: { label: 'Small', color: 'text-slate-400 border-slate-500/30' },
  medium: { label: 'Medium', color: 'text-blue-400 border-blue-500/30' },
  large: { label: 'Large', color: 'text-amber-400 border-amber-500/30' },
};

export default function BuildingCard({ building, island, onClose }: BuildingCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const sf = building.storefront;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const { data: avgRating = 0 } = useQuery({
    queryKey: ['building-rating', building.storefront_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_orders')
        .select('rating')
        .eq('storefront_id', building.storefront_id)
        .not('rating', 'is', null);
      if (!data?.length) return 0;
      return data.reduce((sum, o) => sum + (o.rating ?? 0), 0) / data.length;
    },
    staleTime: 60000,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ['building-recent-orders', building.storefront_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_orders')
        .select('id, created_at, storefront_items(name)')
        .eq('storefront_id', building.storefront_id)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
    staleTime: 60000,
  });

  const handleDropBeacon = async () => {
    if (!user) return;
    await supabase.from('beacons').insert({
      user_id: user.id,
      beacon_type: 'storefront_visit',
      metadata: { storefront_id: building.storefront_id, source: 'ghost_world' },
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const sizeInfo = SIZE_LABELS[building.building_size] || SIZE_LABELS.small;

  return (
    <div
      ref={cardRef}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-40 w-80 max-w-[calc(100vw-2rem)] transition-transform duration-300 animate-in slide-in-from-bottom-6"
    >
      <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-4">
          <button className="absolute top-3 right-3 text-slate-500 hover:text-white" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {sf?.logo_url ? (
              <img src={sf.logo_url} alt="" className="w-11 h-11 rounded-lg object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-amber-600/20 flex items-center justify-center text-xl">
                🏪
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{sf?.name || 'Unknown Business'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-400">{island?.name || 'Island'}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {island && (
              <Badge variant="outline" className="text-[10px]" style={{ color: island.theme_color, borderColor: `${island.theme_color}40` }}>
                {island.category}
              </Badge>
            )}
            <Badge variant="outline" className={`text-[10px] ${sizeInfo.color}`}>
              {sizeInfo.label}
            </Badge>
            {building.is_popup && (
              <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30">
                Pop-Up
              </Badge>
            )}
          </div>

          {/* Rating */}
          {avgRating > 0 && <div className="mb-3"><StarRating rating={avgRating} /></div>}

          {/* Recent activity */}
          {recentOrders.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Recent Activity</p>
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    Someone ordered {order.storefront_items?.name || 'an item'}
                  </span>
                  <span className="shrink-0 text-slate-500">{timeAgo(order.created_at)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-xs"
              onClick={() => navigate(`/menu/${sf?.slug || building.storefront_id}`)}
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Browse Menu
            </Button>
            {user ? (
              <Button size="sm" variant="outline" className="text-xs border-slate-600 text-slate-300" onClick={handleDropBeacon}>
                📍 Drop Beacon
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="text-xs border-slate-600 text-slate-400" onClick={() => navigate('/auth')}>
                <LogIn className="w-3.5 h-3.5 mr-1" /> Sign in to Beacon
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
