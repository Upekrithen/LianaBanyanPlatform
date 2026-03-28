/**
 * PropertyCard — displays a cooperative housing property.
 * Type gradients, status badges, dual-use display, WaterWheel multiplier.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building2, Home, Palmtree, Warehouse, MapPin, Users, ArrowRight, Zap } from 'lucide-react';

export interface HousingProperty {
  id: string;
  title: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  property_type: string;
  status: string;
  acquisition_cost: number | null;
  current_value: number | null;
  monthly_revenue: number | null;
  monthly_expenses: number | null;
  airbnb_units: number;
  housing_units: number;
  max_occupants: number | null;
  contributed_by: string | null;
  image_url: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { gradient: string; icon: typeof Home; label: string }> = {
  residential: { gradient: 'from-green-600 to-green-800', icon: Home, label: 'Residential' },
  commercial: { gradient: 'from-blue-600 to-blue-800', icon: Building2, label: 'Commercial' },
  vacation: { gradient: 'from-amber-500 to-orange-600', icon: Palmtree, label: 'Vacation' },
  garage: { gradient: 'from-slate-500 to-slate-700', icon: Warehouse, label: 'Garage' },
};

const STATUS_STYLE: Record<string, string> = {
  proposed: 'border-yellow-500/50 text-yellow-400',
  acquiring: 'border-blue-500/50 text-blue-400 animate-pulse',
  owned: 'bg-green-900/50 text-green-400 border-green-500/30',
  leased: 'bg-purple-900/50 text-purple-400 border-purple-500/30',
  listed: 'border-orange-500/50 text-orange-400',
};

interface PropertyCardProps {
  property: HousingProperty;
  onContribute?: (property: HousingProperty) => void;
}

export default function PropertyCard({ property, onContribute }: PropertyCardProps) {
  const cfg = TYPE_CONFIG[property.property_type] || TYPE_CONFIG.residential;
  const Icon = cfg.icon;

  const { data: occupancy = 0 } = useQuery({
    queryKey: ['housing-occupancy-count', property.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('housing_occupancy')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', property.id)
        .eq('is_active', true);
      return count || 0;
    },
  });

  const { data: multiplier } = useQuery({
    queryKey: ['housing-waterwheel-multiplier', property.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('housing_waterwheel')
        .select('multiplier_effect')
        .eq('property_id', property.id)
        .order('period_start', { ascending: false })
        .limit(1)
        .single();
      return data?.multiplier_effect ?? null;
    },
  });

  const netSurplus = (property.monthly_revenue ?? 0) - (property.monthly_expenses ?? 0);
  const isDualUse = property.airbnb_units > 0 && property.housing_units > 0;
  const occPercent = property.max_occupants ? (occupancy / property.max_occupants) * 100 : 0;

  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary/30 transition-colors">
      {/* Image / Gradient header */}
      <div className={`h-32 relative ${property.image_url ? '' : `bg-gradient-to-br ${cfg.gradient}`}`}>
        {property.image_url ? (
          <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-12 h-12 text-white/30" />
          </div>
        )}
        {/* Type badge */}
        <Badge className={`absolute top-2 left-2 text-[10px] bg-black/50 text-white border-0`}>
          {cfg.label}
        </Badge>
        {/* Status badge */}
        <Badge variant="outline" className={`absolute top-2 right-2 text-[10px] ${STATUS_STYLE[property.status] || ''}`}>
          {property.status}
        </Badge>
        {/* WaterWheel multiplier */}
        {multiplier && (
          <Badge className="absolute bottom-2 right-2 text-[10px] bg-emerald-900/80 text-emerald-300 border-emerald-500/30 gap-1">
            <Zap className="w-3 h-3" /> ×{multiplier}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{property.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />
            {property.city}{property.state ? `, ${property.state}` : ''}
          </div>
        </div>

        {property.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{property.description}</p>
        )}

        {/* Dual-use display */}
        {isDualUse && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
            <Palmtree className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-400 font-medium">{property.airbnb_units} AirBnB</span>
            <span className="text-muted-foreground">+</span>
            <Home className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-400 font-medium">{property.housing_units} Housing</span>
          </div>
        )}

        {/* Financials (owned properties) */}
        {property.status === 'owned' && (property.monthly_revenue ?? 0) > 0 && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span className="text-green-400">${(property.monthly_revenue ?? 0).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses</span>
              <span className="text-red-400">-${(property.monthly_expenses ?? 0).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-border">
              <span>Net Surplus</span>
              <span className={netSurplus >= 0 ? 'text-green-400' : 'text-red-400'}>
                ${netSurplus.toLocaleString()}/mo
              </span>
            </div>
            {netSurplus > 0 && (
              <p className="text-[10px] text-emerald-500">Surplus → Housing Fund</p>
            )}
          </div>
        )}

        {/* Occupancy */}
        {property.max_occupants && property.max_occupants > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Occupancy</span>
              <span>{occupancy} of {property.max_occupants}</span>
            </div>
            <Progress value={occPercent} className="h-1.5" />
          </div>
        )}

        {/* Acquisition cost */}
        {property.acquisition_cost && (
          <p className="text-xs text-muted-foreground">
            Est. cost: <span className="text-foreground font-medium">${property.acquisition_cost.toLocaleString()}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {onContribute && (
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onContribute(property)}>
              Contribute <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
