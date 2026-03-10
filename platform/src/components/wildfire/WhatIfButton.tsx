/**
 * WHAT IF? — Floating Action Button
 * ===================================
 * Persistent "What If?" button visible at all times during a Wildfire Beacon Run.
 * Opens the Contingency Operator dialog for interactive data manipulation.
 *
 * Innovation #1554: Interactive Showcase Simulation
 *
 * Placement:
 * - Desktop: Bottom-right corner (above the run controller)
 * - Mobile: Bottom-center
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Sparkles } from "lucide-react";

interface WhatIfButtonProps {
  onClick: () => void;
  isCustomized?: boolean;
  className?: string;
}

export function WhatIfButton({
  onClick,
  isCustomized = false,
  className = "",
}: WhatIfButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`fixed bottom-28 right-4 md:right-6 z-[49] ${className}`}
    >
      <div className="relative">
        {/* Customized indicator */}
        {isCustomized && (
          <div className="absolute -top-1 -right-1 z-10">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
            </span>
          </div>
        )}

        {/* Main button */}
        <Button
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            shadow-lg hover:shadow-xl transition-all duration-300
            bg-gradient-to-r from-purple-600 to-indigo-600
            hover:from-purple-500 hover:to-indigo-500
            text-white font-semibold
            rounded-full
            ${isHovered ? "px-5 gap-2" : "px-4 gap-1.5"}
            h-12
          `}
          title="Open Contingency Operators — adjust showcase numbers"
        >
          <GitBranch className="w-5 h-5" />
          <span className={`transition-all duration-300 ${isHovered ? "max-w-32" : "max-w-16"} overflow-hidden whitespace-nowrap`}>
            {isHovered ? "What If?" : "What If?"}
          </span>
          {isCustomized && (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
        </Button>

        {/* Tooltip on hover */}
        {isHovered && !isCustomized && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap">
            <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
              Adjust the showcase numbers
              <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
            </div>
          </div>
        )}

        {isHovered && isCustomized && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap">
            <div className="bg-purple-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
              Showcase using your custom numbers
              <div className="absolute top-full right-4 w-2 h-2 bg-purple-900 rotate-45 -mt-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatIfButton;
