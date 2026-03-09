/**
 * BLUEPRINT SCROLL — Treasure Map Style Product Journey
 * ======================================================
 * Visual representation of a product's manufacturing journey.
 * 
 * Features:
 * - Scroll unfurl animation on open
 * - Dashed line path to destination (X marks the spot)
 * - Markers for obstacles, resources, checkpoints
 * - Progress tracking
 * - Interactive marker tooltips
 *
 * Marker Types:
 * - ☠️ Skull = obstacle to avoid
 * - 💎 Diamond = resource to find
 * - ⭐ Star = checkpoint
 * - ❌ X = destination
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Scroll, MapPin, AlertTriangle, Diamond, Star, X,
  CheckCircle, Circle, ChevronRight
} from "lucide-react";
import "./BlueprintScroll.css";

export interface BlueprintMarker {
  id: string;
  type: "obstacle" | "resource" | "checkpoint" | "destination";
  title: string;
  description: string;
  position: number; // 0-100 percentage along the path
  completed?: boolean;
  bountyId?: string;
}

export interface BlueprintScrollProps {
  title: string;
  description?: string;
  markers: BlueprintMarker[];
  progress?: number; // 0-100
  isOpen?: boolean;
  onMarkerClick?: (marker: BlueprintMarker) => void;
  onComplete?: () => void;
  className?: string;
}

const MARKER_ICONS = {
  obstacle: { icon: AlertTriangle, emoji: "☠️", color: "text-red-500" },
  resource: { icon: Diamond, emoji: "💎", color: "text-blue-500" },
  checkpoint: { icon: Star, emoji: "⭐", color: "text-amber-500" },
  destination: { icon: X, emoji: "🎯", color: "text-green-500" },
};

export function BlueprintScroll({
  title,
  description,
  markers,
  progress = 0,
  isOpen: initialOpen = false,
  onMarkerClick,
  onComplete,
  className = "",
}: BlueprintScrollProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pathProgress, setPathProgress] = useState(0);

  // Animate path drawing when scroll opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Animate the path drawing
      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const animProgress = Math.min(elapsed / duration, 1);
        setPathProgress(animProgress * progress);
        
        if (animProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isOpen, progress]);

  const toggleScroll = () => {
    setIsOpen(!isOpen);
  };

  const sortedMarkers = [...markers].sort((a, b) => a.position - b.position);
  const completedMarkers = markers.filter(m => m.completed).length;
  const totalMarkers = markers.length;

  return (
    <div className={`blueprint-scroll-container ${className}`}>
      {/* Rolled up scroll (closed state) */}
      {!isOpen && (
        <Card 
          className="blueprint-scroll-rolled cursor-pointer hover:shadow-lg transition-all"
          onClick={toggleScroll}
        >
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="blueprint-scroll-icon">
                <Scroll className="h-8 w-8 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground">
                  {completedMarkers}/{totalMarkers} checkpoints • {Math.round(progress)}% complete
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Unfurl <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unrolled scroll (open state) */}
      {isOpen && (
        <Card className={`blueprint-scroll-open ${isAnimating ? 'animating' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scroll className="h-5 w-5 text-amber-700" />
                {title}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleScroll}>
                Roll Up
              </Button>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
          
          <CardContent className="blueprint-scroll-content">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${pathProgress}%` }}
                />
              </div>
            </div>

            {/* Treasure Map Path */}
            <div className="blueprint-map">
              {/* SVG Path */}
              <svg 
                className="blueprint-path-svg"
                viewBox="0 0 800 200"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background path (full) */}
                <path
                  d="M 50 100 Q 200 50, 350 100 T 650 100 L 750 100"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="3"
                  strokeDasharray="10 5"
                  className="blueprint-path-bg"
                />
                
                {/* Progress path (animated) */}
                <path
                  d="M 50 100 Q 200 50, 350 100 T 650 100 L 750 100"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray="10 5"
                  strokeDashoffset={700 - (pathProgress / 100) * 700}
                  className="blueprint-path-progress"
                  style={{
                    transition: isAnimating ? 'none' : 'stroke-dashoffset 0.5s ease-out',
                  }}
                />

                {/* Start marker */}
                <circle cx="50" cy="100" r="8" fill="var(--primary)" />
                <text x="50" y="130" textAnchor="middle" className="blueprint-label">START</text>

                {/* End marker (X marks the spot) */}
                <g transform="translate(750, 100)">
                  <line x1="-10" y1="-10" x2="10" y2="10" stroke="var(--destructive)" strokeWidth="4" />
                  <line x1="10" y1="-10" x2="-10" y2="10" stroke="var(--destructive)" strokeWidth="4" />
                </g>
                <text x="750" y="130" textAnchor="middle" className="blueprint-label">🎯</text>
              </svg>

              {/* Markers overlay */}
              <div className="blueprint-markers">
                <TooltipProvider>
                  {sortedMarkers.map((marker) => {
                    const config = MARKER_ICONS[marker.type];
                    const Icon = config.icon;
                    const isReached = pathProgress >= marker.position;
                    
                    return (
                      <Tooltip key={marker.id}>
                        <TooltipTrigger asChild>
                          <button
                            className={`blueprint-marker ${marker.type} ${marker.completed ? 'completed' : ''} ${isReached ? 'reached' : ''}`}
                            style={{ left: `${marker.position}%` }}
                            onClick={() => onMarkerClick?.(marker)}
                          >
                            <span className="marker-emoji">{config.emoji}</span>
                            {marker.completed && (
                              <CheckCircle className="marker-check h-3 w-3 text-green-500" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">{marker.title}</p>
                            <p className="text-xs text-muted-foreground">{marker.description}</p>
                            {marker.bountyId && (
                              <Badge variant="outline" className="text-xs">
                                Bounty Available
                              </Badge>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>

            {/* Marker Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              {Object.entries(MARKER_ICONS).map(([type, config]) => (
                <div key={type} className="flex items-center gap-1">
                  <span>{config.emoji}</span>
                  <span className="text-muted-foreground capitalize">{type}</span>
                </div>
              ))}
            </div>

            {/* Marker List */}
            <div className="mt-6 space-y-2">
              <h4 className="font-medium text-sm">Journey Checkpoints</h4>
              {sortedMarkers.map((marker) => {
                const config = MARKER_ICONS[marker.type];
                const isReached = pathProgress >= marker.position;
                
                return (
                  <div 
                    key={marker.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                      marker.completed ? 'bg-green-500/5 border-green-500/20' :
                      isReached ? 'bg-primary/5 border-primary/20' :
                      'bg-muted/30'
                    }`}
                  >
                    <span className="text-lg">{config.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${marker.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {marker.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{marker.description}</p>
                    </div>
                    {marker.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isReached ? (
                      <Circle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted" />
                    )}
                    {marker.bountyId && !marker.completed && (
                      <Button size="sm" variant="outline" onClick={() => onMarkerClick?.(marker)}>
                        Claim
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complete Button */}
            {progress >= 100 && onComplete && (
              <Button className="w-full mt-4" onClick={onComplete}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Journey Complete
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Pre-built blueprint templates for common manufacturing journeys
export const BLUEPRINT_TEMPLATES = {
  prototype: [
    { id: "design", type: "checkpoint" as const, title: "Design Upload", description: "CAD file or sketch uploaded", position: 10 },
    { id: "ip", type: "resource" as const, title: "IP Timestamp", description: "Innovation logged to ledger", position: 20 },
    { id: "review", type: "checkpoint" as const, title: "Design Review", description: "Community feedback", position: 35 },
    { id: "materials", type: "resource" as const, title: "Material Selection", description: "Choose printing material", position: 50 },
    { id: "print", type: "checkpoint" as const, title: "Print Started", description: "Bounty claimed by maker", position: 65 },
    { id: "qc", type: "obstacle" as const, title: "Quality Check", description: "Verify print quality", position: 80 },
    { id: "ship", type: "checkpoint" as const, title: "Shipping", description: "Prototype shipped", position: 90 },
    { id: "complete", type: "destination" as const, title: "Delivered!", description: "Prototype in hand", position: 100 },
  ],
  
  smallBatch: [
    { id: "design", type: "checkpoint" as const, title: "Design Finalized", description: "Production-ready CAD", position: 8 },
    { id: "ip", type: "resource" as const, title: "IP Protection", description: "Patent application filed", position: 15 },
    { id: "voting", type: "checkpoint" as const, title: "Marketplace Vote", description: "Community interest gauge", position: 25 },
    { id: "preorders", type: "resource" as const, title: "Pre-orders Open", description: "Tab system activated", position: 35 },
    { id: "threshold", type: "obstacle" as const, title: "Threshold Met", description: "Minimum orders reached", position: 45 },
    { id: "production", type: "checkpoint" as const, title: "SLS Production", description: "Formlabs printing", position: 60 },
    { id: "postprocess", type: "checkpoint" as const, title: "Post-Processing", description: "Finishing and QC", position: 75 },
    { id: "fulfillment", type: "checkpoint" as const, title: "Fulfillment", description: "Packaging and shipping", position: 88 },
    { id: "complete", type: "destination" as const, title: "Delivered!", description: "All orders shipped", position: 100 },
  ],
  
  mediumRun: [
    { id: "design", type: "checkpoint" as const, title: "Design Locked", description: "No more changes", position: 5 },
    { id: "mold-design", type: "checkpoint" as const, title: "Mold Design", description: "Injection mold CAD", position: 12 },
    { id: "mold-bounty", type: "resource" as const, title: "Mold Bounty", description: "Maker claims mold job", position: 20 },
    { id: "mold-print", type: "checkpoint" as const, title: "Mold Printed", description: "3D printed mold ready", position: 30 },
    { id: "test-shot", type: "obstacle" as const, title: "Test Shots", description: "Verify mold quality", position: 40 },
    { id: "node-assign", type: "checkpoint" as const, title: "Node Assignment", description: "Production node selected", position: 50 },
    { id: "production", type: "checkpoint" as const, title: "Injection Run", description: "Desktop injection molding", position: 65 },
    { id: "qc", type: "obstacle" as const, title: "Quality Control", description: "Batch inspection", position: 75 },
    { id: "postprocess", type: "checkpoint" as const, title: "Post-Processing", description: "Finishing touches", position: 85 },
    { id: "fulfillment", type: "checkpoint" as const, title: "Fulfillment", description: "Ship to customers", position: 95 },
    { id: "complete", type: "destination" as const, title: "Complete!", description: "Production run finished", position: 100 },
  ],
};

export default BlueprintScroll;
