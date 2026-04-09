/**
 * TrailMap — Vertical dotted-path trail showing member journey
 * =============================================================
 * Completed stops: filled circles + solid line
 * Current position: pulsing Trail Marker icon
 * Upcoming stops: outlined circles + dotted line
 */

import { useNavigate } from 'react-router-dom';
import { TRAIL_STOPS, getTrailMarkerEmoji } from '@/data/trailStops';
import type { TrailStop } from '@/data/trailStops';
import { ArrowRight } from 'lucide-react';

interface TrailMapProps {
  completedKeys: Set<string>;
  trailMarker: string;
}

export function TrailMap({ completedKeys, trailMarker }: TrailMapProps) {
  const navigate = useNavigate();
  const markerEmoji = getTrailMarkerEmoji(trailMarker);

  const currentIndex = TRAIL_STOPS.findIndex(
    (stop) => !completedKeys.has(stop.checkKey)
  );
  const activeIndex = currentIndex === -1 ? TRAIL_STOPS.length : currentIndex;

  return (
    <div className="relative max-w-md mx-auto py-4">
      {/* START badge */}
      <div className="flex items-center justify-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Start
        </span>
      </div>

      <div className="relative ml-6">
        {TRAIL_STOPS.map((stop, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isUpcoming = idx > activeIndex;
          const isLast = idx === TRAIL_STOPS.length - 1;

          return (
            <div key={stop.id} className="relative flex items-start gap-4">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className="absolute left-[11px] top-[28px] w-[2px]"
                  style={{
                    height: 'calc(100% - 16px)',
                    background: isCompleted
                      ? 'linear-gradient(to bottom, #10b981, #10b981)'
                      : undefined,
                    borderLeft: !isCompleted ? '2px dashed rgba(100,116,139,0.3)' : undefined,
                  }}
                />
              )}

              {/* Circle / Marker */}
              <div className="relative z-10 flex-shrink-0 mt-1">
                {isCurrent ? (
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/20 border-2 border-amber-400 animate-pulse">
                    <span className="text-sm leading-none">{markerEmoji}</span>
                  </div>
                ) : isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-600 bg-slate-800/50" />
                )}
              </div>

              {/* Content card */}
              <div className={`flex-1 pb-8 ${isUpcoming ? 'opacity-50' : ''}`}>
                <h4 className={`text-sm font-semibold ${isCurrent ? 'text-amber-300' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {stop.title}
                </h4>
                <p className="text-xs text-slate-400/80 mt-0.5 leading-relaxed">
                  {stop.description}
                </p>
                {isCurrent && stop.ctaText && stop.ctaHref && (
                  <button
                    onClick={() => navigate(stop.ctaHref!)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {stop.ctaText}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* HORIZON badge */}
      <div className="flex items-center justify-center mt-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
          Horizon
        </span>
      </div>
    </div>
  );
}
