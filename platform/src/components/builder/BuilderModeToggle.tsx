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
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center border-2 ${
              isBuilderModeActive 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400 scale-110 shadow-[0_0_30px_rgba(34,211,238,0.3)] backdrop-blur-md' 
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400'
            }`}
          >
            <Glasses 
              className={`w-6 h-6 transition-all duration-500 ${
                isBuilderModeActive ? 'opacity-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'opacity-40'
              }`} 
              strokeWidth={isBuilderModeActive ? 2.5 : 1.5}
            />
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
