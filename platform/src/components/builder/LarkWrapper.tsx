import React from 'react';
import { useBuilderModeSafe } from './BuilderModeContext';
import { Hammer, Coins, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LarkWrapperProps {
  componentId: string;
  bountyCredits: number;
  children: React.ReactNode;
  className?: string;
}

export const LarkWrapper: React.FC<LarkWrapperProps> = ({
  componentId,
  bountyCredits,
  children,
  className = ""
}) => {
  const { isBuilderModeActive, openLarkPanel } = useBuilderModeSafe();

  if (!isBuilderModeActive) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* The Matrix Reveal styling */}
      <div className="absolute inset-0 border-2 border-dashed border-cyan-500/50 bg-cyan-500/5 pointer-events-none group-hover:border-cyan-400 group-hover:bg-cyan-500/10 transition-all z-10" />

      {/* The Contextual Hover Badge */}
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-2">
        <button
          onClick={() => openLarkPanel(componentId)}
          className="bg-slate-900 border border-cyan-500 text-cyan-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-cyan-950 transition-colors"
        >
          <Hammer className="w-3 h-3" />
          Submit Lark
          <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300 flex items-center gap-1 ml-1">
            <Coins className="w-3 h-3" /> {bountyCredits}
          </span>
        </button>

        {/* Educational Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-slate-800 rounded-full p-1 cursor-help border border-slate-700">
                <Info className="w-4 h-4 text-slate-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-slate-900 border-slate-700 text-slate-200">
              <p className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                <Coins className="w-4 h-4" /> Real Value, Not Monopoly Money
              </p>
              <p className="text-xs">
                50 Credits is real economic value. Not a made-up valuation, not a guess — we have the receipts. We spent $525,000 over 9 years developing the IP that backs this platform. You are earning fractional participation in that proven value.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* The actual component */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
