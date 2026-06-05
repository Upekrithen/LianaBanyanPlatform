/**
 * ProofsNavPills -- BP074-W3 Wave-2B SEG-PROOFS-NAV
 *
 * Sticky horizontal pill bar placed at the top of ProofsPage content.
 * Links to anchor IDs on the major sections below.
 * Smooth scrolls on click via scrollIntoView.
 */

import { cn } from "@/lib/utils";

const PILLS = [
  { label: "Sound Barrier", anchor: "sound-barrier" },
  { label: "Marathon", anchor: "bp074-marathon" },
  { label: "Caithedral Verifications", anchor: "verification-runs" },
  { label: "Substrace Theorem", anchor: "substrace-theorem" },
  { label: "30x30 Program", anchor: "program-30x30" },
  { label: "Build History", anchor: "build-history" },
  { label: "How It Works", anchor: "how-it-works" },
] as const;

export function ProofsNavPills() {
  function handleClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    anchor: string
  ) {
    e.preventDefault();
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-30",
        "border-b border-violet-200 bg-white/90 backdrop-blur-sm shadow-sm"
      )}
      aria-label="Page navigation"
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex gap-2 flex-wrap items-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 mr-1 hidden sm:inline">
          Jump to:
        </span>
        {PILLS.map(({ label, anchor }) => (
          <a
            key={anchor}
            href={`#${anchor}`}
            onClick={(e) => handleClick(e, anchor)}
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
              "border border-violet-300 text-violet-700 bg-violet-50/80",
              "hover:bg-violet-100 hover:border-violet-500 hover:text-violet-800",
              "transition-colors duration-150 whitespace-nowrap"
            )}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
