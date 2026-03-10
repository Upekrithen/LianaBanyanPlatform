/**
 * BABYLON CANDLE — Destination Navigator V2.2
 * ============================================
 * Categories:
 * 1. Platform (5 cards: 4 portals + Member Portfolio)
 * 2. Initiatives (Sweet Sixteen - 1 of 16, 2 of 16...)
 * 3. The Hexagon (6 Halls + 2nd Floor access)
 * 4. Omega 16 (Gate Doors with warnings)
 * 
 * Features:
 * - ALL cards flippable and draggable
 * - "Earn Credits to Re-Design" on every card
 * - Ghost-compatible task system
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, RotateCcw, Palette, X, Ghost } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  addGhostTask, 
  trackCardDesignInterest, 
  trackCardViewed,
  getConversionSummary,
  hasGhostProgress,
  type ConversionSummary 
} from '@/lib/ghostTasks';

interface Destination {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  background: string;
  category: string;
  subcategory?: string;
  warning?: string;
}

interface BabylonCandleProps {
  onSelectDestination: (dest: Destination) => void;
  onDeckSlots: (Destination | null)[];
  onSetOnDeck: (slotIndex: number, dest: Destination | null) => void;
  isGhost?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// DESTINATIONS BY CATEGORY
// ═══════════════════════════════════════════════════════════════════

const PLATFORM_DESTINATIONS: Destination[] = [
  { id: 'member-portfolio', name: 'Member Portfolio', description: 'Your personal dashboard — projects, achievements, reputation, and earnings', url: '/portfolio', icon: '👤', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', category: 'Platform' },
  { id: 'dotcom', name: 'Marketplace (.com)', description: 'Public discovery, projects, and sponsorship opportunities', url: '/', icon: '🏪', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'Platform' },
  { id: 'dotbiz', name: 'Business (.biz)', description: 'HR, positions, project management, business formation', url: '/biz', icon: '💼', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'Platform' },
  { id: 'dotorg', name: 'Nonprofit (.org)', description: 'Fund administration, loans, member benefits', url: '/org', icon: '🤲', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', category: 'Platform' },
  { id: 'dotnet', name: 'Network (.net)', description: 'B2B production, contracts, XML lockbox', url: '/net', icon: '🌐', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', category: 'Platform' },
  { id: 'get-a-job', name: 'Get a Job', description: 'Browse bounties, find work, keep 83.3%. Real work, real pay.', url: '/get-a-job', icon: '💼', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', category: 'Platform' },
  { id: 'build-a-business', name: 'Build a Business', description: 'Launch your Keep for $5. Same terms as the Founder.', url: '/build-a-business', icon: '🏰', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', category: 'Platform' },
  { id: 'plant-seeds', name: 'Plant Seeds', description: 'Back projects early. 5x multiplier. Fractional IP participation.', url: '/plant-seeds', icon: '🌱', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', category: 'Platform' },
];

const INITIATIVE_DESTINATIONS: Destination[] = [
  { id: 'lets-make-dinner', name: "Let's Make Dinner", description: 'Neighbors feeding neighbors — home-cooked meals shared locally', url: '/initiatives/lets-make-dinner', icon: '🍽️', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', category: 'Initiatives' },
  { id: 'lets-get-groceries', name: "Let's Get Groceries", description: 'Cooperative bulk purchasing for better prices', url: '/initiatives/lets-get-groceries', icon: '🛒', background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', category: 'Initiatives' },
  { id: 'lets-go-shopping', name: "Let's Go Shopping", description: 'Group buying power for everyday items', url: '/initiatives/lets-go-shopping', icon: '🛍️', background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', category: 'Initiatives' },
  { id: 'household-concierge', name: 'Household Concierge', description: 'Home services coordination and scheduling', url: '/initiatives/household-concierge', icon: '🏠', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'Initiatives' },
  { id: 'family-table', name: 'The Family Table', description: 'Emergency support for families in crisis (Do The Swoop)', url: '/initiatives/family-table', icon: '👨‍👩‍👧‍👦', background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', category: 'Initiatives' },
  { id: 'tatiana-schlossburg-health-accords', name: 'Tatiana Schlossburg Health Accords', description: 'Affordable access to essential medications', url: '/initiatives/tatiana-schlossburg-health-accords', icon: '💊', background: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)', category: 'Initiatives' },
  { id: 'msa', name: 'MSA', description: 'Medical Services Alliance — healthcare coordination', url: '/initiatives/msa', icon: '🏥', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'Initiatives' },
  { id: 'defense-klaus', name: 'Defense Klaus', description: 'Legal defense fund — "For Someone You Love"', url: '/initiatives/defense-klaus', icon: '🛡️', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'Initiatives' },
  { id: 'rally-group', name: 'Rally Group', description: 'Emergency response coordination', url: '/initiatives/rally-group', icon: '🚨', background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', category: 'Initiatives' },
  { id: 'vsl', name: 'Vouched Short Loans', description: 'Community-backed microloans', url: '/initiatives/vsl', icon: '💰', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', category: 'Initiatives' },
  { id: 'lets-make-bread', name: "Let's Make Bread", description: 'Online business simulator — learn entrepreneurship', url: '/initiatives/lets-make-bread', icon: '🍞', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', category: 'Initiatives' },
  { id: 'harper-guild', name: 'Harper Guild', description: 'HR and ethics oversight — legal services cooperative', url: '/initiatives/harper-guild', icon: '⚖️', background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', category: 'Initiatives' },
  { id: 'jukebox', name: 'JukeBox', description: 'Fair compensation for artists and creators', url: '/initiatives/jukebox', icon: '🎵', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', category: 'Initiatives' },
  { id: 'didasko', name: 'Didasko (Academic)', description: 'Education and research — College of Hard Knocks', url: '/initiatives/academic', icon: '📚', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', category: 'Initiatives' },
  { id: 'brass-tacks', name: 'Brass Tacks', description: 'Core infrastructure and operations', url: '/initiatives/brass-tacks', icon: '🔧', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'Initiatives' },
  { id: 'power-to-the-people', name: 'Power to the People', description: 'OUTSIDE the gates — Switzerland Protocol applies', url: '/initiatives/power-to-the-people', icon: '✊', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'Initiatives', warning: 'This initiative operates OUTSIDE Liana Banyan proper per the Switzerland Protocol.' },
];

const HEXAGON_DESTINATIONS: Destination[] = [
  { id: 'hall-pnyx', name: 'Hall of Records (The Pnyx)', description: 'Academic papers, letters, articles, founder documents. Voting on documents.', url: '/senate/pnyx', icon: '📜', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', category: 'The Hexagon', subcategory: 'First Floor' },
  { id: 'hall-innovations', name: 'Hall of Innovations', description: 'Patents awaiting protection. Voting = micro-sponsorship of IP.', url: '/senate/innovations', icon: '💡', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', category: 'The Hexagon', subcategory: 'First Floor' },
  { id: 'hall-projects', name: 'Hall of Projects', description: 'Member-submitted projects. Voting to prioritize and fund.', url: '/senate/projects', icon: '🚀', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', category: 'The Hexagon', subcategory: 'First Floor' },
  { id: 'hall-initiatives', name: 'Hall of Initiatives', description: 'Charitable programs (Sweet Sixteen). Voting to direct contributions.', url: '/senate/initiatives', icon: '💙', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', category: 'The Hexagon', subcategory: 'First Floor' },
  { id: 'salt-mines', name: 'Salt Mines', description: 'Get a Job — bounties, work offerings, Help Wanted. Keep 83.3%.', url: '/get-a-job', icon: '⛏️', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', category: 'The Hexagon', subcategory: 'First Floor' },
  { id: 'tower-of-peace', name: 'Tower of Peace', description: 'Staircase UP to Balcony, BrainStorm, Observatory. Gates at base.', url: '/senate/tower', icon: '🗼', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', category: 'The Hexagon', subcategory: 'First Floor' },
  { id: 'balcony', name: 'The Balcony', description: 'Circular walkway with open center. Look down into Senate below.', url: '/senate/balcony', icon: '🏛️', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', category: 'The Hexagon', subcategory: 'Second Floor' },
  { id: 'brainstorm', name: 'BrainStorm Room', description: 'Ideas evolve: EMBER → GLOWWORM → FIREFLY → WILL-O-WISP → SPECTER → ⚡ LIGHTNING', url: '/senate/brainstorm', icon: '⚡', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', category: 'The Hexagon', subcategory: 'Second Floor' },
  { id: 'academics', name: 'College of Hard Knocks', description: 'Skills training and verification. Research wing.', url: '/senate/academics', icon: '🎓', background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', category: 'The Hexagon', subcategory: 'Second Floor' },
  { id: 'guild-access', name: 'Guild Access', description: 'Enter the guild halls. Join or create guilds.', url: '/guilds', icon: '🏰', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', category: 'The Hexagon', subcategory: 'Second Floor' },
  { id: 'observatory', name: 'Observatory', description: 'Glass dome ceiling with stars. Long-term vision space.', url: '/senate/observatory', icon: '🔭', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', category: 'The Hexagon', subcategory: 'Second Floor' },
  { id: 'cephas-lighthouse', name: 'Cephas Lighthouse', description: 'The Book of Peace — ALL of Cephas available to peruse.', url: 'https://cephas.lianabanyan.com', icon: '🗼', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', category: 'The Hexagon', subcategory: 'Second Floor' },
];

const OMEGA16_DESTINATIONS: Destination[] = [
  { id: 'omega-map', name: 'Omega 16 — World Map', description: 'Platform expansion map. Glows when ⚡ Lightning Strikes occur.', url: '/senate/omega', icon: '🌍', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', category: 'Omega 16' },
  { id: 'omega-reset', name: 'Omega Reset Protocol', description: 'Second-chance mechanism. Undo bad business decisions.', url: '/senate/omega/reset', icon: '🔄', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', category: 'Omega 16' },
  { id: 'political-expedition', name: 'Political Expedition', description: 'Assembly Hall — separate charter. Switzerland Protocol applies.', url: '/arenas/political-expedition', icon: '🏛️', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', category: 'Omega 16', warning: 'YOU ARE NOW LEAVING LIANA BANYAN PROPER.\n\nPolitical discourse is separated from the main platform.\n\n✅ Your REPUTATION still counts here\n✅ Your VOTES still count here\n✅ Your CREDITS still work here\n\nThe platform takes NO political position per the Switzerland Protocol.' },
  { id: 'tower-of-babble', name: 'Tower of Babble-On', description: 'Religious discourse arena — separate charter. Switzerland Protocol applies.', url: '/arenas/religious', icon: '⛪', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', category: 'Omega 16', warning: 'YOU ARE NOW LEAVING LIANA BANYAN PROPER.\n\nReligious discourse is separated from the main platform.\n\n✅ Your REPUTATION still counts here\n✅ Your VOTES still count here\n✅ Your CREDITS still work here\n\nThe platform takes NO religious position per the Switzerland Protocol.' },
];

const CATEGORIES = ['Platform', 'Initiatives', 'The Hexagon', 'Omega 16'];

const getDestinationsForCategory = (category: string): Destination[] => {
  switch (category) {
    case 'Platform': return PLATFORM_DESTINATIONS;
    case 'Initiatives': return INITIATIVE_DESTINATIONS;
    case 'The Hexagon': return HEXAGON_DESTINATIONS;
    case 'Omega 16': return OMEGA16_DESTINATIONS;
    default: return [];
  }
};

// ═══════════════════════════════════════════════════════════════════
// DESIGN DIALOG COMPONENT
// ═══════════════════════════════════════════════════════════════════

function CardDesignDialog({
  dest,
  isOpen,
  onClose,
  isGhost,
  onAddTask,
}: {
  dest: Destination;
  isOpen: boolean;
  onClose: () => void;
  isGhost: boolean;
  onAddTask: () => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-card rounded-xl border p-6 max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Earn Credits to Re-Design</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          <div 
            className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl"
            style={{ background: dest.background }}
          >
            {dest.icon}
          </div>
          <div>
            <p className="font-medium">{dest.name}</p>
            <p className="text-xs text-muted-foreground">{dest.category}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground mb-4">
          <p>
            <strong className="text-foreground">Want to redesign this card?</strong> Join the Design Guild 
            and earn <span className="text-primary font-semibold">500-2,000 Credits</span> for creating new artwork.
          </p>
          <p>
            Your design could become the official card seen by all members. Compensation is backed by 
            our patent portfolio (1,244 innovations).
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-xs">
              <strong className="text-primary">Requirements:</strong> 4:3 aspect ratio, gradient background, 
              clear icon, readable text. See Design Guild guidelines for details.
            </p>
          </div>
        </div>

        {isGhost && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <Ghost className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-purple-300">
              Ghost Mode: Task will be saved locally. Become a member ($5/year) to keep it permanently.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Go Back
          </Button>
          <Button className="flex-1" onClick={onAddTask}>
            {isGhost ? '👻 Add to Ghost Tasks' : 'Add to My Tasks'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function BabylonCandle({
  onSelectDestination,
  onDeckSlots,
  onSetOnDeck,
  isGhost: isGhostProp,
}: BabylonCandleProps) {
  const { user } = useAuth();
  const isGhost = isGhostProp ?? !user;
  
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [destIndex, setDestIndex] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingDest, setPendingDest] = useState<Destination | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [draggingDest, setDraggingDest] = useState<Destination | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [designDialogDest, setDesignDialogDest] = useState<Destination | null>(null);
  const [taskAddedToast, setTaskAddedToast] = useState<string | null>(null);
  
  const currentCategory = CATEGORIES[categoryIndex];
  const categoryDestinations = getDestinationsForCategory(currentCategory);
  const currentDest = categoryDestinations[destIndex] || categoryDestinations[0];
  const prevDest = categoryDestinations[(destIndex - 1 + categoryDestinations.length) % categoryDestinations.length];
  const nextDest = categoryDestinations[(destIndex + 1) % categoryDestinations.length];
  
  const navigateCategory = (direction: 'up' | 'down') => {
    setCategoryIndex(prev => {
      const newIndex = direction === 'up' 
        ? (prev - 1 + CATEGORIES.length) % CATEGORIES.length
        : (prev + 1) % CATEGORIES.length;
      return newIndex;
    });
    setDestIndex(0);
    setFlippedCards(new Set());
  };
  
  const navigateDestination = (direction: 'left' | 'right') => {
    setDestIndex(prev => {
      const newIndex = direction === 'left'
        ? (prev - 1 + categoryDestinations.length) % categoryDestinations.length
        : (prev + 1) % categoryDestinations.length;
      return newIndex;
    });
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showWarning || designDialogDest) return;
      if (e.key === 'ArrowUp') navigateCategory('up');
      if (e.key === 'ArrowDown') navigateCategory('down');
      if (e.key === 'ArrowLeft') navigateDestination('left');
      if (e.key === 'ArrowRight') navigateDestination('right');
      if (e.key === 'Enter' && currentDest) handleSelectDestination(currentDest);
      if (e.key === ' ' && currentDest) {
        e.preventDefault();
        toggleFlip(currentDest.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categoryIndex, destIndex, currentDest, showWarning, designDialogDest]);

  // Track card views
  useEffect(() => {
    if (currentDest && isGhost) {
      trackCardViewed(currentDest.id);
    }
  }, [currentDest, isGhost]);

  const handleSelectDestination = (dest: Destination) => {
    if (dest.warning) {
      setPendingDest(dest);
      setShowWarning(true);
    } else {
      onSelectDestination(dest);
    }
  };

  const confirmWarning = () => {
    if (pendingDest) {
      onSelectDestination(pendingDest);
    }
    setShowWarning(false);
    setPendingDest(null);
  };

  const handleDragStart = (dest: Destination) => {
    setDraggingDest(dest);
  };

  const handleDragEnd = () => {
    if (draggingDest && dragOverSlot !== null) {
      onSetOnDeck(dragOverSlot, draggingDest);
    }
    setDraggingDest(null);
    setDragOverSlot(null);
  };

  const toggleFlip = (cardId: string, e?: React.MouseEvent) => {
    // Stop propagation to prevent parent handlers from firing
    if (e) {
      e.stopPropagation();
    }
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleAddDesignTask = (dest: Destination) => {
    trackCardDesignInterest(dest.id);
    addGhostTask({
      title: `Redesign: ${dest.name}`,
      description: `Create new artwork for the ${dest.name} deck card. Earn 500-2000 Credits based on complexity.`,
      category: 'card_design',
      reward: {
        credits: 500,
        reputation: 25,
      },
      metadata: { cardId: dest.id, cardName: dest.name },
    });
    setDesignDialogDest(null);
    setTaskAddedToast(dest.name);
    setTimeout(() => setTaskAddedToast(null), 3000);
  };

  // Flippable Card component - each card manages its own flip state independently
  const FlippableCard = ({ 
    dest, 
    size = 'main',
    onNavigate,
  }: { 
    dest: Destination; 
    size?: 'main' | 'side';
    onNavigate?: () => void;
  }) => {
    const isMain = size === 'main';
    const isFlipped = flippedCards.has(dest.id);
    
    // Main card 25% bigger: w-60 (240px) → w-72 (288px)
    const cardWidth = isMain ? 'w-72' : 'w-44';
    const iconSize = isMain ? 'text-7xl' : 'text-4xl';
    const titleSize = isMain ? 'text-lg' : 'text-xs';
    const descSize = isMain ? 'text-sm' : 'text-[10px]';

    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // All cards flip on single click - navigation happens via double-click or "Go Here" button
      toggleFlip(dest.id, e);
    };
    
    const handleSideCardDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onNavigate) {
        onNavigate();
      }
    };

    const handleBackClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFlip(dest.id, e);
    };
    
    return (
      <div 
        className={`relative ${cardWidth} cursor-pointer`}
        style={{ 
          aspectRatio: '3/4',
          perspective: '1000px',
        }}
        draggable
        onDragStart={() => handleDragStart(dest)}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* FRONT of card */}
          <div
            className={`absolute inset-0 rounded-xl overflow-hidden shadow-xl border-2 transition-all ${
              isMain 
                ? 'border-white/30 hover:border-primary/50' 
                : 'border-white/20 opacity-70 hover:opacity-90'
            }`}
            style={{ 
              background: dest.background,
              backfaceVisibility: 'hidden',
            }}
            onClick={handleCardClick}
            onDoubleClick={(e) => {
              e.stopPropagation();
              // Side cards: double-click navigates carousel; Main card: double-click goes to destination
              if (!isMain && onNavigate) {
                onNavigate();
              } else {
                handleSelectDestination(dest);
              }
            }}
          >
            <div className="absolute inset-0 flex flex-col p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              {/* Warning indicator */}
              {dest.warning && (
                <div className="absolute top-2 right-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
              )}
              
              {/* Flip hint */}
              <div className="absolute top-2 left-2">
                <RotateCcw className={`${isMain ? 'w-4 h-4' : 'w-3 h-3'} text-white/50`} />
              </div>
              
              {/* Icon */}
              <div className="flex-1 flex items-center justify-center">
                <span className={`drop-shadow-xl ${iconSize}`}>
                  {dest.icon}
                </span>
              </div>
              
              {/* Earn Credits Link */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDesignDialogDest(dest);
                }}
                className={`mx-auto mb-1 px-2 py-0.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors flex items-center gap-1 ${
                  isMain ? 'text-[10px]' : 'text-[8px]'
                }`}
              >
                <Palette className={`${isMain ? 'w-3 h-3' : 'w-2 h-2'} text-primary`} />
                <span className="text-white/80">Earn Credits to Re-Design</span>
              </button>
              
              {/* Name */}
              <div className="text-center">
                <h3 className={`font-bold text-white drop-shadow-lg leading-tight ${titleSize}`}>
                  {dest.name}
                </h3>
                {isMain && dest.subcategory && (
                  <p className="text-[10px] text-white/60 mt-0.5">{dest.subcategory}</p>
                )}
              </div>
            </div>
          </div>

          {/* BACK of card */}
          <div
            className={`absolute inset-0 rounded-xl overflow-hidden shadow-xl border-2 ${
              isMain ? 'border-primary/50' : 'border-primary/30'
            }`}
            style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            onClick={handleBackClick}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleSelectDestination(dest);
            }}
          >
            <div className="absolute inset-0 flex flex-col p-3">
              {/* Back header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`${isMain ? 'text-2xl' : 'text-lg'}`}>{dest.icon}</span>
                <RotateCcw className={`${isMain ? 'w-4 h-4' : 'w-3 h-3'} text-white/50`} />
              </div>
              
              {/* Title */}
              <h3 className={`font-bold text-white mb-1 ${isMain ? 'text-sm' : 'text-[10px]'}`}>
                {dest.name}
              </h3>
              
              {/* Description */}
              <p className={`text-white/70 flex-1 ${descSize} leading-relaxed`}>
                {dest.description}
              </p>
              
              {/* Badges */}
              <div className="flex gap-1 flex-wrap mt-2">
                <Badge variant="outline" className={`${isMain ? 'text-[9px]' : 'text-[7px]'} py-0 border-white/30 text-white/70`}>
                  {dest.category}
                </Badge>
                {dest.subcategory && (
                  <Badge variant="outline" className={`${isMain ? 'text-[9px]' : 'text-[7px]'} py-0 border-white/30 text-white/70`}>
                    {dest.subcategory}
                  </Badge>
                )}
              </div>
              
              {/* Go button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDestination(dest);
                }}
                className={`mt-2 w-full bg-primary hover:bg-primary/80 text-primary-foreground rounded ${
                  isMain ? 'py-1.5 text-xs' : 'py-1 text-[9px]'
                } font-medium transition-colors`}
              >
                Go Here →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full bg-card rounded-xl border overflow-hidden">
      {/* Category UP Arrow */}
      <button
        onClick={() => navigateCategory('up')}
        className="w-full flex items-center justify-center py-2 hover:bg-muted/50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <ChevronUp className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Category</span>
          <ChevronUp className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
        </div>
      </button>

      {/* Main Content */}
      <div className="px-4 pb-3">
        {/* Category Badge + Counter */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs px-3 py-1 font-semibold">
            {currentCategory}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {destIndex + 1} of {categoryDestinations.length}
          </span>
        </div>

        {/* 3-Card Carousel */}
        <div className="flex items-center justify-center gap-4">
          {/* Left Arrow */}
          <button
            onClick={() => navigateDestination('left')}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Previous Card */}
          {categoryDestinations.length > 1 && (
            <FlippableCard 
              dest={prevDest} 
              size="side" 
              onNavigate={() => navigateDestination('left')}
            />
          )}

          {/* Current Card */}
          <AnimatePresence mode="wait">
            {currentDest && (
              <motion.div
                key={currentDest.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <FlippableCard 
                  dest={currentDest} 
                  size="main" 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Card */}
          {categoryDestinations.length > 1 && (
            <FlippableCard 
              dest={nextDest} 
              size="side" 
              onNavigate={() => navigateDestination('right')}
            />
          )}

          {/* Right Arrow */}
          <button
            onClick={() => navigateDestination('right')}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Interaction hints */}
        <div className="text-center mt-3 text-[9px] text-muted-foreground">
          Click to flip • Double-click to go • Drag to dock
        </div>
      </div>

      {/* Category DOWN Arrow */}
      <button
        onClick={() => navigateCategory('down')}
        className="w-full flex items-center justify-center py-2 hover:bg-muted/50 transition-colors group border-t"
      >
        <div className="flex items-center gap-2">
          <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Category</span>
          <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
        </div>
      </button>

      {/* On Deck Favorites — 2x bigger slots */}
      <div className="border-t bg-muted/20 p-4">
        <div className="text-center text-xs font-medium text-muted-foreground mb-3">
          On Deck — Drag any card here
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          {[0, 1, 2, 3, 4, 5].map((slotIndex) => {
            const slotDest = onDeckSlots[slotIndex];
            const isOver = dragOverSlot === slotIndex;
            
            return (
              <div
                key={slotIndex}
                className={`relative w-28 h-40 rounded-xl border-2 overflow-hidden transition-all ${
                  isOver 
                    ? 'border-primary ring-2 ring-primary/50 scale-105' 
                    : slotDest 
                      ? 'border-primary/40' 
                      : 'border-dashed border-muted-foreground/30'
                }`}
                style={{ background: slotDest?.background || 'transparent' }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSlot(slotIndex);
                }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={() => handleDragEnd()}
                onClick={() => slotDest && handleSelectDestination(slotDest)}
              >
                {slotDest ? (
                  <div className="h-full flex flex-col items-center justify-center p-2 bg-black/40 cursor-pointer">
                    <span className="text-3xl mb-2">{slotDest.icon}</span>
                    <span className="text-[10px] text-white/90 text-center leading-tight line-clamp-2 px-1 font-medium">
                      {slotDest.name}
                    </span>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/40 text-2xl font-bold">
                    {slotIndex + 1}
                  </div>
                )}
                
                {slotDest && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetOnDeck(slotIndex, null);
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold hover:scale-110 transition-transform"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Modal for Gate Doors */}
      <AnimatePresence>
        {showWarning && pendingDest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-xl border-2 border-yellow-500/50 p-6 max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-xl rotate-45 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 -rotate-45" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-center text-yellow-500 mb-3">
                ⚠️ GATEWAY WARNING ⚠️
              </h3>
              
              <div className="text-sm text-muted-foreground text-center mb-4 whitespace-pre-line">
                {pendingDest.warning}
              </div>
              
              <div className="text-[10px] text-center text-muted-foreground mb-4 italic border-t border-b border-muted py-2">
                "Let your yea be yea and your nay be nay"
                <br />
                — This crossing will be stamped to the IP Ledger
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowWarning(false)}
                >
                  Go Back
                </Button>
                <Button
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  onClick={confirmWarning}
                >
                  Continue On
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Design Dialog */}
      <AnimatePresence>
        {designDialogDest && (
          <CardDesignDialog
            dest={designDialogDest}
            isOpen={true}
            onClose={() => setDesignDialogDest(null)}
            isGhost={isGhost}
            onAddTask={() => handleAddDesignTask(designDialogDest)}
          />
        )}
      </AnimatePresence>

      {/* Task Added Toast */}
      <AnimatePresence>
        {taskAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm">Added "{taskAddedToast}" to {isGhost ? 'Ghost' : 'your'} tasks!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard hints */}
      <div className="text-center py-1.5 text-[9px] text-muted-foreground border-t bg-muted/10">
        ← → Browse • ↑ ↓ Categories • Space to flip • Enter to go
      </div>
    </div>
  );
}

export { PLATFORM_DESTINATIONS, INITIATIVE_DESTINATIONS, HEXAGON_DESTINATIONS, OMEGA16_DESTINATIONS };
export type { Destination };
