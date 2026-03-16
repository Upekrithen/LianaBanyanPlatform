/**
 * SUCCESS TICKER — Live scrolling widget of anonymized success stories
 * =====================================================================
 * Shows real-time aggregated achievements across the platform.
 * Members can anonymize: "Member 458 in Chicago built and sold 2300 XY's"
 * Can filter by area or show platform-wide totals.
 * Sits alongside Fantasy Draft picks for real-time comparison.
 */

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Factory, Users, Flame } from "lucide-react";

interface TickerEntry {
  id: string;
  text: string;
  type: "production" | "node" | "milestone" | "aggregate";
  location?: string;
  timestamp: string;
}

// Sample ticker entries (would come from real-time DB in production)
const SAMPLE_TICKER: TickerEntry[] = [
  { id: "t1", text: "Member 458 in Chicago sold 2,300 coaster sets this week", type: "production", location: "Chicago, IL", timestamp: "2m ago" },
  { id: "t2", text: "Phoenix grocery node hit 150 families served", type: "node", location: "Phoenix, AZ", timestamp: "5m ago" },
  { id: "t3", text: "Dragon Book Nook run — 487/500 pre-orders (97% funded!)", type: "production", timestamp: "8m ago" },
  { id: "t4", text: "Member 1,203 in Austin launched their first kitchen node", type: "node", location: "Austin, TX", timestamp: "12m ago" },
  { id: "t5", text: "Platform total: 12,847 units produced this month", type: "aggregate", timestamp: "15m ago" },
  { id: "t6", text: "New production run funded: Cyber Cat Headphone Stand (500 units)", type: "production", timestamp: "18m ago" },
  { id: "t7", text: "Member 892 in Denver — first 100 backer on 3 runs", type: "milestone", location: "Denver, CO", timestamp: "22m ago" },
  { id: "t8", text: "Grocery savings this week: $34,200 across 47 nodes", type: "aggregate", timestamp: "25m ago" },
  { id: "t9", text: "Slip casting pioneer @hammerlyceramics completed 500-unit mug run", type: "production", timestamp: "30m ago" },
  { id: "t10", text: "Member 2,041 in Nashville — Process Pioneer for food truck nodes", type: "milestone", location: "Nashville, TN", timestamp: "35m ago" },
  { id: "t11", text: "Total meals served this month: 8,420 across 23 kitchen nodes", type: "aggregate", timestamp: "40m ago" },
  { id: "t12", text: "Member 167 in Surprise, AZ saved 15 families 28% on groceries", type: "node", location: "Surprise, AZ", timestamp: "45m ago" },
];

const TYPE_ICONS = {
  production: Factory,
  node: Users,
  milestone: Flame,
  aggregate: TrendingUp,
};

const TYPE_COLORS = {
  production: "text-blue-400",
  node: "text-green-400",
  milestone: "text-amber-400",
  aggregate: "text-primary",
};

interface SuccessTickerProps {
  /** Filter to specific location */
  location?: string;
  /** Show as horizontal scrolling ticker vs vertical list */
  mode?: "ticker" | "list";
  /** Max entries to show */
  maxItems?: number;
  /** Compact single-line mode */
  compact?: boolean;
}

export function SuccessTicker({
  location,
  mode = "ticker",
  maxItems = 8,
  compact = false,
}: SuccessTickerProps) {
  const [entries, setEntries] = useState<TickerEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter by location if specified
    const filtered = location
      ? SAMPLE_TICKER.filter(
          (e) => !e.location || e.location.toLowerCase().includes(location.toLowerCase()) || e.type === "aggregate"
        )
      : SAMPLE_TICKER;
    setEntries(filtered.slice(0, maxItems));
  }, [location, maxItems]);

  // Auto-advance ticker
  useEffect(() => {
    if (mode !== "ticker" || entries.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [entries.length, mode]);

  if (entries.length === 0) return null;

  // ─── HORIZONTAL TICKER MODE ───
  if (mode === "ticker") {
    const entry = entries[currentIndex];
    const Icon = TYPE_ICONS[entry.type];

    return (
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border overflow-hidden ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Live
          </span>
        </div>

        <div
          className="flex-1 flex items-center gap-2 transition-opacity duration-500"
          key={entry.id}
        >
          <Icon className={`w-4 h-4 flex-shrink-0 ${TYPE_COLORS[entry.type]}`} />
          <span className="truncate">{entry.text}</span>
          {entry.location && (
            <Badge variant="outline" className="text-xs flex-shrink-0 gap-1">
              <MapPin className="w-3 h-3" />
              {entry.location}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {entry.timestamp}
          </span>
        </div>

        {/* Dots indicator */}
        <div className="flex gap-1 flex-shrink-0">
          {entries.slice(0, 5).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex % 5 ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── VERTICAL LIST MODE ───
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-semibold text-sm">Live Activity Feed</span>
      </div>
      {entries.map((entry) => {
        const Icon = TYPE_ICONS[entry.type];
        return (
          <div
            key={entry.id}
            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <Icon
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${TYPE_COLORS[entry.type]}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{entry.text}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {entry.location && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {entry.location}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
