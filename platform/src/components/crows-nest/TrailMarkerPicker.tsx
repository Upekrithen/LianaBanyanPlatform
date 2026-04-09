/**
 * TrailMarkerPicker — Icon grid for choosing a personal trail marker
 * ==================================================================
 * Ghost is default. Members can pick from preset icons or use their brand.
 */

import { TRAIL_MARKER_ICONS, getTrailMarkerEmoji } from '@/data/trailStops';
import type { TrailMarkerSlug } from '@/data/trailStops';

interface TrailMarkerPickerProps {
  selected: string;
  onSelect: (slug: TrailMarkerSlug) => void;
  hasBrand?: boolean;
  brandIcon?: string;
}

export function TrailMarkerPicker({ selected, onSelect, hasBrand, brandIcon }: TrailMarkerPickerProps) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{getTrailMarkerEmoji(selected)}</span>
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Your Trail Marker</h4>
          <p className="text-[10px] text-slate-400">Choose the icon that marks your position on the trail.</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {TRAIL_MARKER_ICONS.map((icon) => (
          <button
            key={icon.slug}
            onClick={() => onSelect(icon.slug as TrailMarkerSlug)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all text-center ${
              selected === icon.slug
                ? 'bg-amber-500/20 border border-amber-500/50 ring-1 ring-amber-500/30'
                : 'bg-slate-800/50 border border-transparent hover:border-slate-600 hover:bg-slate-700/50'
            }`}
            title={icon.label}
          >
            <span className="text-lg">{icon.emoji}</span>
            <span className="text-[9px] text-slate-400 leading-tight">{icon.label}</span>
          </button>
        ))}

        {hasBrand && brandIcon && (
          <button
            onClick={() => onSelect('brand' as TrailMarkerSlug)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all text-center ${
              selected === 'brand'
                ? 'bg-violet-500/20 border border-violet-500/50 ring-1 ring-violet-500/30'
                : 'bg-slate-800/50 border border-transparent hover:border-slate-600 hover:bg-slate-700/50'
            }`}
            title="Use My Brand"
          >
            <span className="text-lg">{brandIcon}</span>
            <span className="text-[9px] text-violet-400 leading-tight">My Brand</span>
          </button>
        )}
      </div>
    </div>
  );
}
