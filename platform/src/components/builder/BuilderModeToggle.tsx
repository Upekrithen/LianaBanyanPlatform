import React from 'react';
import { useBuilderMode } from './BuilderModeContext';
import { Glasses } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const BuilderModeToggle: React.FC = () => {
  const { isBuilderModeActive, toggleBuilderMode } = useBuilderMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleBuilderMode}
            className={`fixed bottom-6 right-6 z-50 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center border-2 overflow-hidden ${
              isBuilderModeActive
                ? 'border-cyan-400 scale-110 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                : 'border-slate-600 hover:border-cyan-500/50 hover:scale-105'
            }`}
            style={{
              width: '56px',
              height: '56px',
              padding: 0,
              position: 'relative',
              background: isBuilderModeActive ? '#0a1628' : '#f0ede6',
              opacity: isBuilderModeActive ? 1 : 0.85,
              transition: 'all 0.5s ease',
            }}
          >
            <img
              src="/images/founderDenken.png"
              alt="X-Ray Goggles"
              className="w-full h-full object-cover transition-all duration-500"
              style={{
                filter: isBuilderModeActive
                  ? 'drop-shadow(0 0 3px rgba(34,211,238,0.9)) drop-shadow(0 0 6px rgba(34,211,238,0.6)) drop-shadow(0 0 12px rgba(34,211,238,0.3))'
                  : 'none',
              }}
            />
            {/* Cyan glow overlay on glasses when active */}
            {isBuilderModeActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse 70% 25% at 50% 45%, rgba(34,211,238,0.35) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  mixBlendMode: 'screen',
                }}
              />
            )}
            {/* Lens shimmer when NOT in x-ray mode — subtle attention draw */}
            {!isBuilderModeActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  borderRadius: '50%',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '35%',
                    left: '-100%',
                    width: '50%',
                    height: '20%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) 40%, rgba(34,211,238,0.5) 50%, rgba(34,211,238,0.3) 60%, transparent 100%)',
                    transform: 'skewX(-20deg)',
                    animation: 'gogglesShimmer 6s ease-in-out infinite',
                  }}
                />
              </div>
            )}
            <style>{`
              @keyframes gogglesShimmer {
                0%, 85% { left: -100%; opacity: 0; }
                90% { opacity: 1; }
                100% { left: 200%; opacity: 0; }
              }
            `}</style>
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-slate-900 border-slate-800 text-slate-200">
          <p className="font-bold mb-1">
            {isBuilderModeActive ? 'Disable X-Ray Goggles' : 'Enable X-Ray Goggles'}
          </p>
          <p className="text-xs text-slate-400 max-w-[200px]">
            Reveal hidden bounties and submit Larks to improve the platform and earn participation.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
