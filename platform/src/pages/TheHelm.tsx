/**
 * THE HELM
 * ========
 * Universal Remote Control Interface for the Liana Banyan Platform.
 * 
 * Components:
 *  - TV Screen: Live iframe preview of destination
 *  - Remote Control: Contains all navigation controls
 *  - Rotary Dial: 12 card slots for channel selection
 *  - D-Pad: Directional navigation with Home center
 *  - INPUT Button: Cycles through 8 category modes
 *  - Channel Up/Down: Context-sensitive navigation
 * 
 * The Helm = Your command center. Control where your QR routes,
 * what you share, and navigate your entire digital presence.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Lock,
  Unlock,
  Tv,
  Radio,
  Layers,
  Play,
  Users,
  Building2,
  Briefcase,
  Palette,
  ShoppingBag,
  Gamepad2,
  Vote,
  Sparkles,
  Power,
} from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

interface HelmCardSlot {
  position: number;
  name: string;
  icon: string;
  destinationUrl: string | null;
  destinationType: 'platform' | 'external' | 'custom' | 'empty';
  isLocked: boolean;
  lockType: 'onboarding' | 'achievement' | 'beacon' | null;
  requiredBeaconColor: string | null;
  deckCardId: string | null;
}

interface InputMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  routes: string[];
  description: string;
}

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────

// 8 INPUT categories
const INPUT_MODES: InputMode[] = [
  { 
    id: 'my_stuff', 
    name: 'My Stuff', 
    icon: <Briefcase className="w-4 h-4" />, 
    color: 'bg-blue-500',
    routes: ['/portfolio', '/briefcase', '/medallions', '/deck'],
    description: 'Portfolio, Briefcase, Achievements'
  },
  { 
    id: 'create', 
    name: 'Create', 
    icon: <Palette className="w-4 h-4" />, 
    color: 'bg-purple-500',
    routes: ['/workshop', '/hofund', '/treasure-map/create', '/beacon-run/create'],
    description: 'Workshop, Cue Cards, Maps'
  },
  { 
    id: 'browse', 
    name: 'Browse', 
    icon: <ShoppingBag className="w-4 h-4" />, 
    color: 'bg-green-500',
    routes: ['/marketplace', '/projects', '/help-wanted', '/asset-library'],
    description: 'Marketplace, Projects, Services'
  },
  { 
    id: 'play', 
    name: 'Play', 
    icon: <Gamepad2 className="w-4 h-4" />, 
    color: 'bg-orange-500',
    routes: ['/hexisle', '/treasure-map-game', '/golden-key', '/ghost'],
    description: 'HexIsle, Treasure Maps, Games'
  },
  { 
    id: 'community', 
    name: 'Community', 
    icon: <Users className="w-4 h-4" />, 
    color: 'bg-pink-500',
    routes: ['/guilds', '/tribes', '/peer-contracts', '/sponsor'],
    description: 'Guilds, Tribes, Peer Contracts'
  },
  { 
    id: 'govern', 
    name: 'Govern', 
    icon: <Vote className="w-4 h-4" />, 
    color: 'bg-red-500',
    routes: ['/senate', '/governance', '/arenas', '/petitions'],
    description: 'Senate, Arenas, Petitions'
  },
  { 
    id: 'initiatives', 
    name: 'Initiatives', 
    icon: <Building2 className="w-4 h-4" />, 
    color: 'bg-teal-500',
    routes: ['/initiatives', '/initiatives/lets-make-dinner', '/factory'],
    description: 'Sweet 16 Initiatives'
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: <Settings className="w-4 h-4" />, 
    color: 'bg-gray-500',
    routes: ['/profile-settings', '/themes', '/credential-management'],
    description: 'Preferences, Theme, Credentials'
  },
];

// 12 default card slots (clock positions)
const DEFAULT_CARD_SLOTS: HelmCardSlot[] = [
  // 6 pre-filled slots (onboarding milestones)
  { position: 12, name: 'Home', icon: '🏠', destinationUrl: '/', destinationType: 'platform', isLocked: true, lockType: 'onboarding', requiredBeaconColor: null, deckCardId: null },
  { position: 1, name: 'Portfolio', icon: '📂', destinationUrl: '/portfolio', destinationType: 'platform', isLocked: true, lockType: 'onboarding', requiredBeaconColor: null, deckCardId: null },
  { position: 2, name: 'Projects', icon: '🚀', destinationUrl: '/projects', destinationType: 'platform', isLocked: true, lockType: 'onboarding', requiredBeaconColor: null, deckCardId: null },
  { position: 3, name: 'Play', icon: '🎮', destinationUrl: '/hexisle', destinationType: 'platform', isLocked: true, lockType: 'onboarding', requiredBeaconColor: null, deckCardId: null },
  { position: 4, name: 'Create', icon: '🎨', destinationUrl: '/workshop', destinationType: 'platform', isLocked: true, lockType: 'onboarding', requiredBeaconColor: null, deckCardId: null },
  { position: 5, name: 'Factory', icon: '🏭', destinationUrl: '/factory', destinationType: 'platform', isLocked: true, lockType: 'onboarding', requiredBeaconColor: null, deckCardId: null },
  // 6 empty customizable slots
  { position: 6, name: 'Empty', icon: '➕', destinationUrl: null, destinationType: 'empty', isLocked: false, lockType: null, requiredBeaconColor: null, deckCardId: null },
  { position: 7, name: 'Empty', icon: '➕', destinationUrl: null, destinationType: 'empty', isLocked: false, lockType: null, requiredBeaconColor: null, deckCardId: null },
  { position: 8, name: 'Empty', icon: '➕', destinationUrl: null, destinationType: 'empty', isLocked: false, lockType: null, requiredBeaconColor: null, deckCardId: null },
  { position: 9, name: 'Empty', icon: '➕', destinationUrl: null, destinationType: 'empty', isLocked: false, lockType: null, requiredBeaconColor: null, deckCardId: null },
  { position: 10, name: 'Empty', icon: '➕', destinationUrl: null, destinationType: 'empty', isLocked: false, lockType: null, requiredBeaconColor: null, deckCardId: null },
  { position: 11, name: 'Empty', icon: '➕', destinationUrl: null, destinationType: 'empty', isLocked: false, lockType: null, requiredBeaconColor: null, deckCardId: null },
];

// ─────────────────────────────────────────────────────────
// TV SCREEN COMPONENT — Live iframe preview
// ─────────────────────────────────────────────────────────

function HelmTVScreen({
  url,
  isOn,
  onNavigate,
  iframeRef,
}: {
  url: string;
  isOn: boolean;
  onNavigate?: (url: string) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}) {
  const baseUrl = window.location.origin;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Listen for navigation events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === baseUrl && event.data?.type === 'helm-navigate') {
        onNavigate?.(event.data.url);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [baseUrl, onNavigate]);

  return (
    <div className="relative">
      {/* TV Bezel */}
      <div className="bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-2xl p-3 shadow-2xl">
        {/* Screen border */}
        <div className="bg-black rounded-xl p-1">
          {/* Screen */}
          <div 
            className={`relative rounded-lg overflow-hidden transition-all duration-500 ${
              isOn ? 'bg-zinc-900' : 'bg-black'
            }`}
            style={{ height: '380px' }}
          >
            {isOn ? (
              <>
                {/* Scanline effect */}
                <div 
                  className="absolute inset-0 pointer-events-none z-10 opacity-10"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                  }}
                />
                {/* CRT curve effect */}
                <div 
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
                  }}
                />
                {/* Live iframe */}
                <iframe
                  ref={iframeRef}
                  src={fullUrl}
                  className="w-full h-full border-0"
                  title="Helm Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              </>
            ) : (
              /* TV Off state */
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Tv className="w-16 h-16 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-600 text-sm">Press POWER to turn on</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* TV brand label */}
        <div className="flex items-center justify-center mt-2">
          <span className="text-zinc-500 text-xs font-mono tracking-widest">LIANA BANYAN</span>
        </div>
      </div>
      
      {/* Power LED */}
      <div className={`absolute bottom-6 right-6 w-2 h-2 rounded-full transition-colors ${
        isOn ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-red-900'
      }`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CARD SLOT WITH 4-CORNER LOCK ANIMATION
// ─────────────────────────────────────────────────────────

function CardSlotWithLock({
  slot,
  isActive,
  dialRotation,
  angle,
  onClick,
  onLongPress,
  onUnlock,
}: {
  slot: HelmCardSlot;
  isActive: boolean;
  dialRotation: number;
  angle: number;
  onClick: () => void;
  onLongPress: () => void;
  onUnlock: () => void;
}) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockedCorners, setUnlockedCorners] = useState<Set<number>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const isEmpty = slot.destinationType === 'empty';
  const corners = [0, 1, 2, 3]; // TL, TR, BR, BL
  
  const handleCornerClick = (corner: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slot.isLocked || !isUnlocking) return;
    
    const newUnlocked = new Set(unlockedCorners);
    if (newUnlocked.has(corner)) {
      newUnlocked.delete(corner);
    } else {
      newUnlocked.add(corner);
    }
    setUnlockedCorners(newUnlocked);
    
    // Check if all 4 corners are unlocked
    if (newUnlocked.size === 4) {
      setTimeout(() => {
        onUnlock();
        setIsUnlocking(false);
        setUnlockedCorners(new Set());
        toast.success(`${slot.name} unlocked!`);
      }, 300);
    }
  };

  const handleMouseDown = () => {
    if (slot.isLocked) {
      const timer = setTimeout(() => {
        setIsUnlocking(true);
        toast.info('Click all 4 corners to unlock');
      }, 800);
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div
      className={`absolute w-8 h-8 transition-all duration-300 ${
        isUnlocking ? 'scale-150 z-50' : ''
      }`}
      style={{
        left: '50%',
        top: '50%',
        transform: `
          rotate(${angle + 90}deg) 
          translateY(-44px) 
          rotate(${-angle - 90 - dialRotation}deg)
          translate(-50%, -50%)
        `,
      }}
    >
      {/* Main slot button */}
      <button
        className={`w-full h-full rounded-lg flex items-center justify-center text-xs transition-all relative overflow-hidden
          ${isActive 
            ? 'bg-primary text-primary-foreground scale-110 shadow-lg z-10' 
            : isEmpty
            ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border-2 border-dashed border-zinc-600'
            : 'bg-zinc-700 text-white hover:bg-zinc-600'
          }
        `}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        title={`${slot.position === 12 ? '12' : slot.position}: ${slot.name}`}
      >
        <span style={{ transform: `rotate(${-dialRotation}deg)` }}>
          {slot.icon}
        </span>
      </button>
      
      {/* 4-corner lock indicators */}
      {slot.isLocked && (
        <>
          {corners.map((corner) => {
            const positions = [
              '-top-1 -left-1', // TL
              '-top-1 -right-1', // TR
              '-bottom-1 -right-1', // BR
              '-bottom-1 -left-1', // BL
            ];
            const isCornerUnlocked = unlockedCorners.has(corner);
            
            return (
              <button
                key={corner}
                className={`absolute w-3 h-3 rounded-sm transition-all ${positions[corner]} ${
                  isUnlocking 
                    ? isCornerUnlocked
                      ? 'bg-green-500 scale-110'
                      : 'bg-amber-500 hover:bg-amber-400 cursor-pointer animate-pulse'
                    : 'bg-amber-500/50'
                }`}
                onClick={(e) => handleCornerClick(corner, e)}
                style={{ transform: `rotate(${-dialRotation}deg)` }}
              >
                {isUnlocking && !isCornerUnlocked && (
                  <Lock className="w-2 h-2 text-white m-0.5" />
                )}
                {isCornerUnlocked && (
                  <Unlock className="w-2 h-2 text-white m-0.5" />
                )}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ROTARY DIAL COMPONENT — 12 card slots (clock face)
// ─────────────────────────────────────────────────────────

function HelmRotaryDial({
  slots,
  currentSlot,
  onSlotChange,
  onSlotLongPress,
  onSlotUnlock,
}: {
  slots: HelmCardSlot[];
  currentSlot: number;
  onSlotChange: (position: number) => void;
  onSlotLongPress: (position: number) => void;
  onSlotUnlock: (position: number) => void;
}) {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate dial rotation based on current slot
  // Position 12 is at top (0°), positions go clockwise
  const getSlotAngle = (position: number) => {
    return ((position % 12) * 30) - 90; // 30° per slot, offset so 12 is at top
  };
  
  const dialRotation = -getSlotAngle(currentSlot);

  const handleSlotClick = (position: number) => {
    const slot = slots.find(s => s.position === position);
    if (slot && slot.destinationType !== 'empty') {
      onSlotChange(position);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Dial container */}
      <div
        ref={dialRef}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-xl border-4 border-zinc-600"
        style={{ 
          transform: `rotate(${dialRotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Clock positions with lock animation */}
        {slots.map((slot) => {
          const angle = getSlotAngle(slot.position);
          const isActive = slot.position === currentSlot;
          
          return (
            <CardSlotWithLock
              key={slot.position}
              slot={slot}
              isActive={isActive}
              dialRotation={dialRotation}
              angle={angle}
              onClick={() => handleSlotClick(slot.position)}
              onLongPress={() => onSlotLongPress(slot.position)}
              onUnlock={() => onSlotUnlock(slot.position)}
            />
          );
        })}
        
        {/* Center knob */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 border-2 border-zinc-500 shadow-inner flex items-center justify-center">
            <Radio className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
      
      {/* Current channel indicator */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <Badge variant="secondary" className="text-xs">
          CH {currentSlot === 12 ? '12' : currentSlot}
        </Badge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// D-PAD COMPONENT — Directional navigation with Home center
// ─────────────────────────────────────────────────────────

function HelmDPad({
  onDirection,
  onHome,
  currentMode,
}: {
  onDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onHome: () => void;
  currentMode: InputMode;
}) {
  const buttonClass = "w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 flex items-center justify-center text-white transition-colors shadow-md";
  
  return (
    <div className="relative w-28 h-28">
      {/* Up */}
      <button 
        className={`${buttonClass} absolute top-0 left-1/2 -translate-x-1/2`}
        onClick={() => onDirection('up')}
        title="Up"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      
      {/* Down */}
      <button 
        className={`${buttonClass} absolute bottom-0 left-1/2 -translate-x-1/2`}
        onClick={() => onDirection('down')}
        title="Down"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
      
      {/* Left */}
      <button 
        className={`${buttonClass} absolute left-0 top-1/2 -translate-y-1/2`}
        onClick={() => onDirection('left')}
        title="Left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {/* Right */}
      <button 
        className={`${buttonClass} absolute right-0 top-1/2 -translate-y-1/2`}
        onClick={() => onDirection('right')}
        title="Right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {/* Home (center) */}
      <button 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${currentMode.color} hover:opacity-90 active:opacity-80 flex items-center justify-center text-white transition-all shadow-lg`}
        onClick={onHome}
        title="Home"
      >
        <Home className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// INPUT SELECTOR — Cycles through 8 category modes
// ─────────────────────────────────────────────────────────

function HelmInputSelector({
  currentMode,
  onModeChange,
}: {
  currentMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}) {
  const currentIndex = INPUT_MODES.findIndex(m => m.id === currentMode.id);
  
  const cycleMode = () => {
    const nextIndex = (currentIndex + 1) % INPUT_MODES.length;
    onModeChange(INPUT_MODES[nextIndex]);
  };

  return (
    <button
      className={`w-full px-3 py-2 rounded-lg ${currentMode.color} text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-all shadow-md`}
      onClick={cycleMode}
      title={`INPUT: ${currentMode.name} — Click to cycle`}
    >
      {currentMode.icon}
      <span>{currentMode.name}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// CHANNEL BUTTONS — Up/Down navigation
// ─────────────────────────────────────────────────────────

function HelmChannelButtons({
  onChannelUp,
  onChannelDown,
}: {
  onChannelUp: () => void;
  onChannelDown: () => void;
}) {
  const buttonClass = "w-10 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 flex items-center justify-center text-white transition-colors shadow-md text-xs font-bold";
  
  return (
    <div className="flex flex-col gap-1">
      <button className={buttonClass} onClick={onChannelUp} title="Channel Up">
        CH▲
      </button>
      <button className={buttonClass} onClick={onChannelDown} title="Channel Down">
        CH▼
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// REMOTE CONTROL CONTAINER
// ─────────────────────────────────────────────────────────

function HelmRemoteControl({
  slots,
  currentSlot,
  onSlotChange,
  onSlotLongPress,
  onSlotUnlock,
  currentMode,
  onModeChange,
  onDirection,
  onHome,
  onChannelUp,
  onChannelDown,
  onPower,
  isOn,
}: {
  slots: HelmCardSlot[];
  currentSlot: number;
  onSlotChange: (position: number) => void;
  onSlotLongPress: (position: number) => void;
  onSlotUnlock: (position: number) => void;
  currentMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onHome: () => void;
  onChannelUp: () => void;
  onChannelDown: () => void;
  onPower: () => void;
  isOn: boolean;
}) {
  return (
    <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-3xl p-4 shadow-2xl border border-zinc-700 w-64">
      {/* Brand */}
      <div className="text-center mb-3">
        <span className="text-zinc-500 text-[10px] font-mono tracking-widest">HELM CONTROL</span>
      </div>
      
      {/* Rotary Dial */}
      <div className="flex justify-center mb-6">
        <HelmRotaryDial
          slots={slots}
          currentSlot={currentSlot}
          onSlotChange={onSlotChange}
          onSlotLongPress={onSlotLongPress}
          onSlotUnlock={onSlotUnlock}
        />
      </div>
      
      {/* Control row: Channel buttons, D-Pad, Power/Input */}
      <div className="flex items-center justify-between gap-2">
        {/* Channel Up/Down */}
        <HelmChannelButtons
          onChannelUp={onChannelUp}
          onChannelDown={onChannelDown}
        />
        
        {/* D-Pad */}
        <HelmDPad
          onDirection={onDirection}
          onHome={onHome}
          currentMode={currentMode}
        />
        
        {/* Power and Input */}
        <div className="flex flex-col gap-2">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
              isOn 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400'
            }`}
            onClick={onPower}
            title="Power"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* INPUT selector */}
      <div className="mt-4">
        <HelmInputSelector
          currentMode={currentMode}
          onModeChange={onModeChange}
        />
      </div>
      
      {/* Current destination info */}
      <div className="mt-4 p-2 rounded-lg bg-zinc-900/50 border border-zinc-700">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Destination</p>
        <p className="text-sm text-white font-medium truncate">
          {slots.find(s => s.position === currentSlot)?.name || 'None'}
        </p>
        <p className="text-xs text-zinc-400 truncate">
          {slots.find(s => s.position === currentSlot)?.destinationUrl || 'No URL set'}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN HELM PAGE
// ─────────────────────────────────────────────────────────

export default function TheHelm() {
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isOn, setIsOn] = useState(true);
  const [cardSlots, setCardSlots] = useState<HelmCardSlot[]>(DEFAULT_CARD_SLOTS);
  const [currentSlot, setCurrentSlot] = useState(12); // Start at Home (12 o'clock)
  const [currentMode, setCurrentMode] = useState<InputMode>(INPUT_MODES[0]);
  const [subChannel, setSubChannel] = useState(0); // Index within current mode's routes
  const [isLoading, setIsLoading] = useState(true);

  // Ghost World: Everyone can browse
  const isGhost = !user;

  // Get current destination URL
  const currentDestination = cardSlots.find(s => s.position === currentSlot)?.destinationUrl || '/';

  // Load user's card slots from database
  useEffect(() => {
    const loadCardSlots = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('helm_card_slots')
          .select('*')
          .eq('user_id', user.id)
          .order('slot_position');

        if (error) {
          console.error('Error loading card slots:', error);
          // Use defaults if table doesn't exist yet
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Map database rows to HelmCardSlot format
          const loadedSlots: HelmCardSlot[] = data.map(row => ({
            position: row.slot_position,
            name: row.slot_name,
            icon: row.slot_icon,
            destinationUrl: row.destination_url,
            destinationType: row.destination_type as HelmCardSlot['destinationType'],
            isLocked: row.is_locked,
            lockType: row.lock_type as HelmCardSlot['lockType'],
            requiredBeaconColor: row.required_beacon_color,
            deckCardId: row.deck_card_id,
          }));
          setCardSlots(loadedSlots);
        } else {
          // Initialize default slots for new user
          await initializeDefaultSlots(user.id);
        }
      } catch (err) {
        console.error('Error in loadCardSlots:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCardSlots();
  }, [user]);

  // Initialize default slots for new user
  const initializeDefaultSlots = async (userId: string) => {
    try {
      const slotsToInsert = DEFAULT_CARD_SLOTS.map(slot => ({
        user_id: userId,
        slot_position: slot.position,
        slot_name: slot.name,
        slot_icon: slot.icon,
        destination_url: slot.destinationUrl,
        destination_type: slot.destinationType,
        is_locked: slot.isLocked,
        lock_type: slot.lockType,
        required_beacon_color: slot.requiredBeaconColor,
        deck_card_id: slot.deckCardId,
      }));

      const { error } = await supabase
        .from('helm_card_slots')
        .insert(slotsToInsert);

      if (error) {
        console.error('Error initializing slots:', error);
      }
    } catch (err) {
      console.error('Error in initializeDefaultSlots:', err);
    }
  };

  // Save slot changes to database
  const saveSlotToDatabase = async (slot: HelmCardSlot) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('helm_card_slots')
        .upsert({
          user_id: user.id,
          slot_position: slot.position,
          slot_name: slot.name,
          slot_icon: slot.icon,
          destination_url: slot.destinationUrl,
          destination_type: slot.destinationType,
          is_locked: slot.isLocked,
          lock_type: slot.lockType,
          required_beacon_color: slot.requiredBeaconColor,
          deck_card_id: slot.deckCardId,
        }, {
          onConflict: 'user_id,slot_position'
        });

      if (error) {
        console.error('Error saving slot:', error);
      }
    } catch (err) {
      console.error('Error in saveSlotToDatabase:', err);
    }
  };

  // Load input preferences
  useEffect(() => {
    const loadInputPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('helm_input_preferences')
          .select('*')
          .eq('user_id', user.id)
          .eq('input_mode', currentMode.id)
          .single();

        if (data && !error) {
          setSubChannel(data.sub_channel || 0);
        }
      } catch (err) {
        // Preference doesn't exist yet, use defaults
      }
    };

    loadInputPreferences();
  }, [user, currentMode.id]);

  // Save input preference changes
  const saveInputPreference = async () => {
    if (!user) return;

    try {
      await supabase
        .from('helm_input_preferences')
        .upsert({
          user_id: user.id,
          input_mode: currentMode.id,
          sub_channel: subChannel,
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,input_mode'
        });
    } catch (err) {
      console.error('Error saving input preference:', err);
    }
  };

  // Save preferences when they change
  useEffect(() => {
    if (user) {
      saveInputPreference();
    }
  }, [subChannel, currentMode.id]);

  // Send command to iframe
  const sendToIframe = useCallback((command: string, data?: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'helm-command', command, data },
        window.location.origin
      );
    }
  }, []);

  // Handle slot change
  const handleSlotChange = (position: number) => {
    const slot = cardSlots.find(s => s.position === position);
    if (slot && slot.destinationType !== 'empty') {
      setCurrentSlot(position);
      toast.success(`Channel ${position === 12 ? '12' : position}: ${slot.name}`);
    }
  };

  // Handle slot long press (for unlock)
  const handleSlotLongPress = (position: number) => {
    const slot = cardSlots.find(s => s.position === position);
    if (slot?.isLocked) {
      toast.info(`${slot.name} is locked. Long-press and click all 4 corners to unlock.`);
    } else if (slot?.destinationType === 'empty') {
      toast.info('Drag a deck card here to set this channel.');
    }
  };

  // Handle slot unlock (4 corners clicked)
  const handleSlotUnlock = (position: number) => {
    const updatedSlot = cardSlots.find(s => s.position === position);
    if (updatedSlot) {
      const newSlot = { ...updatedSlot, isLocked: false };
      setCardSlots(prev => prev.map(slot => 
        slot.position === position ? newSlot : slot
      ));
      // Persist to database
      saveSlotToDatabase(newSlot);
    }
  };

  // Context-sensitive D-pad actions based on INPUT mode
  const DPAD_ACTIONS: Record<string, Record<string, { label: string; action: () => void }>> = {
    my_stuff: {
      up: { label: 'Toggle Public', action: () => { sendToIframe('toggle-visibility', 'public'); toast.info('Toggle: Public'); }},
      down: { label: 'Toggle Private', action: () => { sendToIframe('toggle-visibility', 'private'); toast.info('Toggle: Private'); }},
      left: { label: 'Previous Item', action: () => { sendToIframe('navigate', 'prev'); setSubChannel(prev => Math.max(0, prev - 1)); }},
      right: { label: 'Next Item', action: () => { sendToIframe('navigate', 'next'); setSubChannel(prev => Math.min(currentMode.routes.length - 1, prev + 1)); }},
    },
    create: {
      up: { label: 'New Item', action: () => { sendToIframe('action', 'new'); toast.info('Create: New'); }},
      down: { label: 'Delete', action: () => { sendToIframe('action', 'delete'); toast.info('Create: Delete'); }},
      left: { label: 'Undo', action: () => { sendToIframe('action', 'undo'); toast.info('Create: Undo'); }},
      right: { label: 'Redo', action: () => { sendToIframe('action', 'redo'); toast.info('Create: Redo'); }},
    },
    browse: {
      up: { label: 'Filter', action: () => { sendToIframe('action', 'filter'); toast.info('Browse: Filter'); }},
      down: { label: 'Clear', action: () => { sendToIframe('action', 'clear'); toast.info('Browse: Clear'); }},
      left: { label: 'Previous Page', action: () => { sendToIframe('navigate', 'prev-page'); setSubChannel(prev => Math.max(0, prev - 1)); }},
      right: { label: 'Next Page', action: () => { sendToIframe('navigate', 'next-page'); setSubChannel(prev => Math.min(currentMode.routes.length - 1, prev + 1)); }},
    },
    play: {
      up: { label: 'Jump', action: () => { sendToIframe('game', 'jump'); toast.info('Play: Jump'); }},
      down: { label: 'Crouch', action: () => { sendToIframe('game', 'crouch'); toast.info('Play: Crouch'); }},
      left: { label: 'Move Left', action: () => { sendToIframe('game', 'left'); toast.info('Play: Left'); }},
      right: { label: 'Move Right', action: () => { sendToIframe('game', 'right'); toast.info('Play: Right'); }},
    },
    community: {
      up: { label: 'Join', action: () => { sendToIframe('action', 'join'); toast.info('Community: Join'); }},
      down: { label: 'Leave', action: () => { sendToIframe('action', 'leave'); toast.info('Community: Leave'); }},
      left: { label: 'Previous Group', action: () => { sendToIframe('navigate', 'prev'); setSubChannel(prev => Math.max(0, prev - 1)); }},
      right: { label: 'Next Group', action: () => { sendToIframe('navigate', 'next'); setSubChannel(prev => Math.min(currentMode.routes.length - 1, prev + 1)); }},
    },
    govern: {
      up: { label: 'Vote Up', action: () => { sendToIframe('vote', 'up'); toast.info('Govern: Vote Up'); }},
      down: { label: 'Vote Down', action: () => { sendToIframe('vote', 'down'); toast.info('Govern: Vote Down'); }},
      left: { label: 'Previous Proposal', action: () => { sendToIframe('navigate', 'prev'); setSubChannel(prev => Math.max(0, prev - 1)); }},
      right: { label: 'Next Proposal', action: () => { sendToIframe('navigate', 'next'); setSubChannel(prev => Math.min(currentMode.routes.length - 1, prev + 1)); }},
    },
    initiatives: {
      up: { label: 'Expand', action: () => { sendToIframe('action', 'expand'); toast.info('Initiatives: Expand'); }},
      down: { label: 'Collapse', action: () => { sendToIframe('action', 'collapse'); toast.info('Initiatives: Collapse'); }},
      left: { label: 'Previous Initiative', action: () => { setSubChannel(prev => Math.max(0, prev - 1)); }},
      right: { label: 'Next Initiative', action: () => { setSubChannel(prev => Math.min(currentMode.routes.length - 1, prev + 1)); }},
    },
    settings: {
      up: { label: 'Save', action: () => { sendToIframe('action', 'save'); toast.success('Settings: Saved'); }},
      down: { label: 'Reset', action: () => { sendToIframe('action', 'reset'); toast.info('Settings: Reset'); }},
      left: { label: 'Previous Tab', action: () => { setSubChannel(prev => Math.max(0, prev - 1)); }},
      right: { label: 'Next Tab', action: () => { setSubChannel(prev => Math.min(currentMode.routes.length - 1, prev + 1)); }},
    },
  };

  // Handle D-pad directions
  const handleDirection = (direction: 'up' | 'down' | 'left' | 'right') => {
    const actions = DPAD_ACTIONS[currentMode.id];
    if (actions && actions[direction]) {
      actions[direction].action();
    }
  };

  // Handle Home button
  const handleHome = () => {
    const homeRoute = currentMode.routes[0];
    toast.success(`Home: ${currentMode.name}`);
    // Could navigate to homeRoute
  };

  // Handle channel up/down
  const handleChannelUp = () => {
    const positions = cardSlots
      .filter(s => s.destinationType !== 'empty')
      .map(s => s.position)
      .sort((a, b) => a - b);
    
    const currentIndex = positions.indexOf(currentSlot);
    const nextIndex = (currentIndex + 1) % positions.length;
    setCurrentSlot(positions[nextIndex]);
  };

  const handleChannelDown = () => {
    const positions = cardSlots
      .filter(s => s.destinationType !== 'empty')
      .map(s => s.position)
      .sort((a, b) => a - b);
    
    const currentIndex = positions.indexOf(currentSlot);
    const prevIndex = (currentIndex - 1 + positions.length) % positions.length;
    setCurrentSlot(positions[prevIndex]);
  };

  // Handle power toggle
  const handlePower = () => {
    setIsOn(!isOn);
    toast.info(isOn ? 'TV Off' : 'TV On');
  };

  // Handle mode change
  const handleModeChange = (mode: InputMode) => {
    setCurrentMode(mode);
    setSubChannel(0);
    toast.info(`INPUT: ${mode.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">The Helm</h1>
          <p className="text-zinc-400 text-sm">Your Universal Remote Control</p>
          {isGhost && (
            <Badge variant="outline" className="mt-2 border-amber-500/50 text-amber-500">
              👻 Ghost Mode — Sign in to save settings
            </Badge>
          )}
        </div>

        {/* Main layout: TV + Remote side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Left: TV Screen */}
          <div>
            <HelmTVScreen
              url={currentDestination}
              isOn={isOn}
              iframeRef={iframeRef}
              onNavigate={(url) => {
                // Handle navigation from within iframe
                const slot = cardSlots.find(s => s.destinationUrl === url);
                if (slot) {
                  setCurrentSlot(slot.position);
                }
              }}
            />
            
            {/* Current mode indicator */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${currentMode.color}`} />
              <span className="text-zinc-400 text-sm">
                {currentMode.name}: {currentMode.routes[subChannel]}
              </span>
            </div>
          </div>

          {/* Right: Remote Control */}
          <div className="flex justify-center lg:justify-start">
            <HelmRemoteControl
              slots={cardSlots}
              currentSlot={currentSlot}
              onSlotChange={handleSlotChange}
              onSlotLongPress={handleSlotLongPress}
              onSlotUnlock={handleSlotUnlock}
              currentMode={currentMode}
              onModeChange={handleModeChange}
              onDirection={handleDirection}
              onHome={handleHome}
              onChannelUp={handleChannelUp}
              onChannelDown={handleChannelDown}
              onPower={handlePower}
              isOn={isOn}
            />
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
              <div>
                <p className="text-zinc-500 mb-1">DIAL</p>
                <p className="text-zinc-300">Click slots to change channel</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">D-PAD</p>
                <p className="text-zinc-300">Navigate within the preview</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">INPUT</p>
                <p className="text-zinc-300">Cycle through 8 categories</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">CH ▲▼</p>
                <p className="text-zinc-300">Quick channel switching</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
