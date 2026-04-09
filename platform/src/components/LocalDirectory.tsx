/**
 * LocalDirectory — Cooperative resource listing component.
 * Neutral directory format: no paid placement, no boosting.
 * Equal format for commercial and charitable entries.
 * Usage analytics are business intelligence, not ad metrics.
 */

import { MapPin, Store, Heart, Utensils, Wrench } from 'lucide-react';

export interface DirectoryEntry {
  name: string;
  type: 'restaurant' | 'food_pantry' | 'charitable' | 'node' | 'service';
  distance: string;
  description: string;
  views_this_week?: number;
}

const TYPE_CONFIG: Record<DirectoryEntry['type'], { icon: typeof Store; label: string; color: string }> = {
  restaurant: { icon: Utensils, label: 'Restaurant', color: 'text-amber-400' },
  food_pantry: { icon: Heart, label: 'Food Pantry', color: 'text-rose-400' },
  charitable: { icon: Heart, label: 'Community Resource', color: 'text-pink-400' },
  node: { icon: Store, label: 'LB Node', color: 'text-emerald-400' },
  service: { icon: Wrench, label: 'Service', color: 'text-blue-400' },
};

const SAMPLE_ENTRIES: DirectoryEntry[] = [
  { name: "Rosa's Bakery", type: 'restaurant', distance: '0.3 mi', description: 'Fresh pastries & coffee, opens 6 AM' },
  { name: 'Westside Food Bank', type: 'food_pantry', distance: '0.8 mi', description: 'Open Mon/Wed/Fri, no ID required' },
  { name: "Miguel's Taco Truck", type: 'restaurant', distance: '1.2 mi', description: 'Lunch specials daily, pre-orders welcome' },
  { name: 'Neighbor Care Network', type: 'charitable', distance: '1.5 mi', description: 'Meal delivery for homebound seniors' },
];

interface LocalDirectoryProps {
  entries?: DirectoryEntry[];
  maxEntries?: number;
  compact?: boolean;
}

export function LocalDirectory({ entries = SAMPLE_ENTRIES, maxEntries = 3, compact = false }: LocalDirectoryProps) {
  const shown = entries.slice(0, maxEntries);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 mb-1">
        <MapPin className="w-3.5 h-3.5 text-amber-400" />
        <span className={`font-semibold ${compact ? 'text-[11px]' : 'text-xs'} text-amber-300`}>
          See what's near you
        </span>
      </div>
      {shown.map((entry, idx) => {
        const cfg = TYPE_CONFIG[entry.type];
        const Icon = cfg.icon;
        return (
          <div key={idx} className="flex items-start gap-2 p-1.5 rounded bg-slate-800/50 border border-slate-700/30">
            <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0 mt-0.5`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className={`font-medium ${compact ? 'text-[10px]' : 'text-[11px]'} text-slate-200 truncate`}>
                  {entry.name}
                </span>
                <span className="text-[9px] text-slate-500 shrink-0">{entry.distance}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">{entry.description}</p>
            </div>
          </div>
        );
      })}
      {entries.length > maxEntries && (
        <p className="text-[9px] text-slate-500 text-center">
          +{entries.length - maxEntries} more nearby
        </p>
      )}
    </div>
  );
}
