/**
 * BEACON LANTERN CARD
 * ====================
 * A draggable Deck Card for quick beacon color selection.
 *
 * Front: Compact color selector with 6 beacon colors
 * Back: Full explanation of the beacon system + share as Cue Card
 *
 * Features:
 * - Draggable positioning (saved to localStorage)
 * - Click to flip for explanation
 * - Minimize to corner icon
 * - Generate QR code linking to /beacon-explainer
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  X,
  Minimize2,
  Maximize2,
  Share2,
  Navigation,
  Sparkles,
  QrCode,
  ArrowRight,
  GripHorizontal,
} from 'lucide-react';
import { BEACON_COLORS } from './BeaconDropButton';
import { toast } from 'sonner';

const POSITION_KEY = 'lb_lantern_position';
const VISIBLE_KEY = 'lb_lantern_visible';
const MINIMIZED_KEY = 'lb_lantern_minimized';

type BeaconColor = keyof typeof BEACON_COLORS;

interface Position {
  x: number;
  y: number;
}

interface BeaconLanternCardProps {
  onSelectColor?: (color: BeaconColor) => void;
  onClose?: () => void;
  initialVisible?: boolean;
}

const getBeaconEmoji = (color: BeaconColor): string => {
  const emojis: Record<BeaconColor, string> = {
    green: '🟢',
    blue: '🔵',
    yellow: '🟡',
    red: '🔴',
    purple: '🟣',
    orange: '🟠',
  };
  return emojis[color];
};

export function BeaconLanternCard({
  onSelectColor,
  onClose,
  initialVisible = true
}: BeaconLanternCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [selectedColor, setSelectedColor] = useState<BeaconColor>('green');
  const [position, setPosition] = useState<Position>({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedPosition = localStorage.getItem(POSITION_KEY);
    const savedMinimized = localStorage.getItem(MINIMIZED_KEY);
    const savedVisible = localStorage.getItem(VISIBLE_KEY);

    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch {}
    }

    if (savedMinimized) {
      setIsMinimized(savedMinimized === 'true');
    }

    if (savedVisible !== null) {
      setIsVisible(savedVisible === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(POSITION_KEY, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem(MINIMIZED_KEY, String(isMinimized));
  }, [isMinimized]);

  useEffect(() => {
    localStorage.setItem(VISIBLE_KEY, String(isVisible));
  }, [isVisible]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleColorClick = (color: BeaconColor) => {
    setSelectedColor(color);
    onSelectColor?.(color);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleShareCueCard = () => {
    const url = `${window.location.origin}/beacon-explainer`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied! Share this to explain beacons.', {
      description: url,
    });
  };

  const handleViewExplainer = () => {
    navigate('/beacon-explainer');
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div
        ref={cardRef}
        className="fixed z-50 cursor-move"
        style={{ left: position.x, top: position.y }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          onMouseDown={handleMouseDown}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-amber-400/50"
          title="Open Lantern Mode"
        >
          <MapPin className="w-5 h-5 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        perspective: '1000px',
      }}
    >
      <div
        className="relative w-72 transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ─── FRONT FACE ─── */}
        <div
          className="absolute inset-0 w-72 rounded-xl border-2 border-amber-500/50 shadow-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Drag handle header */}
          <div
            className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20 cursor-move"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-amber-600/50" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                🔦 Lantern Mode
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-amber-500/20 rounded"
                title="Minimize"
              >
                <Minimize2 className="w-3 h-3 text-amber-600" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-amber-500/20 rounded"
                title="Close"
              >
                <X className="w-3 h-3 text-amber-600" />
              </button>
            </div>
          </div>

          {/* Color selector grid */}
          <div className="p-3 space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Click a color to select, then drop on any page
            </p>

            <div className="grid grid-cols-6 gap-2">
              {(Object.keys(BEACON_COLORS) as BeaconColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-lg
                    transition-all hover:scale-110
                    ${selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-amber-500 scale-110'
                      : 'opacity-70 hover:opacity-100'
                    }
                  `}
                  title={`${BEACON_COLORS[color].name}: ${BEACON_COLORS[color].meaning}`}
                >
                  {getBeaconEmoji(color)}
                </button>
              ))}
            </div>

            {/* Selected color info */}
            <div
              className="p-2 rounded-lg text-center"
              style={{ backgroundColor: `${BEACON_COLORS[selectedColor].color}15` }}
            >
              <p className="text-sm font-medium" style={{ color: BEACON_COLORS[selectedColor].color }}>
                {BEACON_COLORS[selectedColor].name}
              </p>
              <p className="text-xs text-muted-foreground">
                {BEACON_COLORS[selectedColor].meaning}
              </p>
            </div>

            {/* Flip hint */}
            <button
              onClick={() => setIsFlipped(true)}
              className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              tap to learn more
            </button>
          </div>
        </div>

        {/* ─── BACK FACE ─── */}
        <div
          className="absolute inset-0 w-72 rounded-xl border-2 border-amber-500/50 shadow-xl overflow-hidden bg-card"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20 cursor-move"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium">About Beacons</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-amber-500/20 rounded"
              >
                <Minimize2 className="w-3 h-3 text-amber-600" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-amber-500/20 rounded"
              >
                <X className="w-3 h-3 text-amber-600" />
              </button>
            </div>
          </div>

          {/* Explanation content */}
          <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
            <p className="text-xs text-muted-foreground">
              Beacons are personal navigation markers. Drop them on pages you want to remember,
              and return anytime via the Helm.
            </p>

            <div className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Color Meanings
              </p>
              <div className="space-y-1">
                {(Object.entries(BEACON_COLORS) as [BeaconColor, typeof BEACON_COLORS[BeaconColor]][]).map(
                  ([color, config]) => (
                    <div key={color} className="flex items-center gap-2 text-xs">
                      <span>{getBeaconEmoji(color as BeaconColor)}</span>
                      <span className="font-medium" style={{ color: config.color }}>
                        {config.name}
                      </span>
                      <span className="text-muted-foreground">— {config.meaning}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs gap-2"
                onClick={handleViewExplainer}
              >
                <ArrowRight className="w-3 h-3" />
                Full Beacon Guide
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs gap-2"
                onClick={handleShareCueCard}
              >
                <QrCode className="w-3 h-3" />
                Share as Cue Card
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs"
                onClick={() => navigate('/the-helm')}
              >
                View My Beacons in Helm
              </Button>
            </div>

            {/* Flip back hint */}
            <button
              onClick={() => setIsFlipped(false)}
              className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              tap to flip back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeaconLanternCard;
