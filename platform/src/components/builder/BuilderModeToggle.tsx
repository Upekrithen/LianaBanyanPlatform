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
                : 'border-slate-600/50 hover:border-cyan-500/50 hover:scale-105'
            }`}
            style={{
              width: '56px',
              height: '56px',
              padding: 0,
              position: 'relative',
              background: isBuilderModeActive ? '#0a1628' : 'rgba(240, 237, 230, 0.5)',
              opacity: isBuilderModeActive ? 1 : 0.85,
              transition: 'all 0.5s ease',
            }}
          >
            {/* Mascot portrait — X-Ray OFF is default/first-visit state,
                X-Ray ON is activated x-ray vision state. B080. */}
            <img
              src={isBuilderModeActive ? '/images/mascot-xray-on.png' : '/images/mascot-xray-off.png'}
              alt={isBuilderModeActive ? 'X-Ray Goggles ON' : 'X-Ray Goggles'}
              className="w-full h-full object-cover transition-all duration-500"
              style={{
                filter: isBuilderModeActive
                  ? 'drop-shadow(0 0 3px rgba(34,211,238,0.9)) drop-shadow(0 0 6px rgba(34,211,238,0.6)) drop-shadow(0 0 12px rgba(34,211,238,0.3))'
                  : 'none',
                opacity: isBuilderModeActive ? 1 : 0.5,
              }}
            />
            {/* Cyan glow overlay on glasses when active */}
            {isBuilderModeActive && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse 70% 25% at 50% 45%, rgba(34,211,238,0.35) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                  }}
                />
                {/* Active-state shimmer — 4× frequency, cyan-tinted rising band */}
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
                      left: 0,
                      right: 0,
                      height: '42%',
                      bottom: '-42%',
                      background:
                        'linear-gradient(to top, transparent 0%, rgba(34,211,238,0.18) 25%, rgba(34,211,238,0.5) 50%, rgba(34,211,238,0.18) 75%, transparent 100%)',
                      animation: 'gogglesShimmerUpActive 4.5s ease-in-out infinite',
                      mixBlendMode: 'screen',
                    }}
                  />
                  {/* X-Ray ON Mana reveal (cyan) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '60%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '5.6px',
                      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      color: 'rgba(180,240,255,0.95)',
                      textShadow:
                        '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(34,211,238,0.7), 0 1px 2px rgba(0,0,0,0.7)',
                      opacity: 0,
                      animation: 'gogglesManaReveal 4.5s ease-in-out infinite',
                      mixBlendMode: 'screen',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Mana
                  </div>
                  {/* X-Ray ON Suppressed reveal (cyan) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '72%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '5.6px',
                      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      color: 'rgba(180,240,255,0.92)',
                      textShadow:
                        '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(34,211,238,0.65), 0 1px 2px rgba(0,0,0,0.7)',
                      opacity: 0,
                      animation: 'gogglesSuppressedReveal 4.5s ease-in-out infinite',
                      mixBlendMode: 'screen',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Suppressed
                  </div>
                  {/* X-Ray ON percentage reveal */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '89%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '6.44px',
                      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      color: 'rgba(180,240,255,0.95)',
                      textShadow:
                        '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(34,211,238,0.7), 0 1px 2px rgba(0,0,0,0.7)',
                      opacity: 0,
                      animation: 'gogglesPercentRevealActive 4.5s ease-in-out infinite',
                      mixBlendMode: 'screen',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    62%
                  </div>
                </div>
              </>
            )}
            {/* Full-image bottom→top shimmer with "Mana" text over beard zone. B080. */}
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
                    left: 0,
                    right: 0,
                    height: '42%',
                    bottom: '-42%',
                    background:
                      'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.12) 75%, transparent 100%)',
                    animation: 'gogglesShimmerUp 18s ease-in-out infinite',
                    mixBlendMode: 'screen',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '60%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '5.6px',
                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.92)',
                    textShadow:
                      '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(180,220,255,0.55), 0 1px 2px rgba(0,0,0,0.7)',
                    opacity: 0,
                    animation: 'gogglesManaReveal 18s ease-in-out infinite',
                    mixBlendMode: 'screen',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Mana
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '72%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '5.6px',
                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.88)',
                    textShadow:
                      '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(180,220,255,0.5), 0 1px 2px rgba(0,0,0,0.7)',
                    opacity: 0,
                    animation: 'gogglesSuppressedReveal 18s ease-in-out infinite',
                    mixBlendMode: 'screen',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Suppressed
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '89%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '6.44px',
                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.88)',
                    textShadow:
                      '0 0 3px rgba(0,0,0,0.85), 0 0 6px rgba(180,220,255,0.5), 0 1px 2px rgba(0,0,0,0.7)',
                    opacity: 0,
                    animation: 'gogglesPercentReveal 18s ease-in-out infinite',
                    mixBlendMode: 'screen',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  85%
                </div>
              </div>
            )}
            <style>{`
              @keyframes gogglesShimmerUp {
                0% { bottom: -42%; opacity: 0; }
                2% { opacity: 1; }
                23% { opacity: 1; }
                25%, 100% { bottom: 100%; opacity: 0; }
              }
              @keyframes gogglesShimmerUpActive {
                0% { bottom: -42%; opacity: 0; }
                2.5% { opacity: 1; }
                22.5% { opacity: 1; }
                25%, 100% { bottom: 100%; opacity: 0; }
              }
              @keyframes gogglesPercentRevealActive {
                0%, 7.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
                10.5% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
                14%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
              }
              @keyframes gogglesManaReveal {
                0%, 5.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
                8% { opacity: 0.72; transform: translate(-50%, -50%) scale(1); }
                11.5%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
              }
              @keyframes gogglesSuppressedReveal {
                0%, 6.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
                9% { opacity: 0.65; transform: translate(-50%, -50%) scale(1); }
                12.5%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
              }
              @keyframes gogglesPercentReveal {
                0%, 7.5% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
                10% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
                13.5%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
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
