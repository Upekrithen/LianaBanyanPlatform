/**
 * PUDDING-STYLE CUE CARDS
 * =======================
 * Enhanced cue card display using Pudding-style interactions:
 * - Small grid icons with hover preview
 * - Click to expand as full card
 * - Click again to flip (3D)
 * - Back has details + voting + action buttons
 *
 * Inspired by: https://pudding.cool/2025/07/kids-books/
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Check, Plus, X, Vote, ThumbsUp, ThumbsDown,
  ChevronLeft, ChevronRight, Share2, Download, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface CueCardTemplate {
  id: string;
  title: string;
  subtitle: string | null;
  body_text: string;
  hashtags: string[];
  card_style: string;
  template_type: string;
  initiative_slug: string | null;
  background_type: string;
  background_value: string;
}

interface PuddingCueCardsProps {
  templates: CueCardTemplate[];
  memberQrUrl: string;
  stampedCards: Record<string, { templateId: string; customText: string; qrDataUrl: string }>;
  customTexts: Record<string, string>;
  onCustomTextChange: (id: string, text: string) => void;
  onStamp: (id: string) => void;
  onAddToDeployFrame?: (template: CueCardTemplate) => void;
  isGhost?: boolean;
  onGhostVote?: (templateId: string, amount: number) => void;
  votingEnabled?: boolean;
  currentVotes?: Record<string, { up: number; down: number }>;
  dialOverlayRef?: React.RefObject<HTMLDivElement>;
  userCredits?: number;
  userMarks?: number;
  onVoteWithStake?: (templateId: string, vote: 'support' | 'oppose', stakeType: 'credits' | 'marks', amount: number) => void;
}

export function PuddingCueCards({
  templates,
  memberQrUrl,
  stampedCards,
  customTexts,
  onCustomTextChange,
  onStamp,
  onAddToDeployFrame,
  isGhost = false,
  onGhostVote,
  votingEnabled = false,
  currentVotes = {},
  dialOverlayRef,
  userCredits = 0,
  userMarks = 0,
  onVoteWithStake
}: PuddingCueCardsProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<CueCardTemplate | null>(null);
  const [selectedCard, setSelectedCard] = useState<CueCardTemplate | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, { vote: 'support' | 'oppose'; stake: number; type: 'credits' | 'marks' } | null>>({});
  const [voteStakeAmount, setVoteStakeAmount] = useState<number>(1);
  const [voteStakeType, setVoteStakeType] = useState<'credits' | 'marks'>('marks');

  const categories = [...new Set(templates.map(t => t.template_type).filter(Boolean))];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(search.toLowerCase()) ||
                          template.body_text.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !activeFilter || template.template_type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCardClick = (template: CueCardTemplate) => {
    if (selectedCard?.id === template.id) {
      setIsFlipped(!isFlipped);
    } else {
      setSelectedCard(template);
      setIsFlipped(false);
    }
  };

  const closeModal = () => {
    setSelectedCard(null);
    setIsFlipped(false);
  };

  const handleVote = (templateId: string, vote: 'support' | 'oppose') => {
    const currentVote = userVotes[templateId];
    const availableBalance = voteStakeType === 'credits' ? userCredits : userMarks;

    if (currentVote?.vote === vote) {
      setUserVotes(prev => ({ ...prev, [templateId]: null }));
      return;
    }

    if (voteStakeAmount > availableBalance && !isGhost) {
      return;
    }

    setUserVotes(prev => ({
      ...prev,
      [templateId]: { vote, stake: voteStakeAmount, type: voteStakeType }
    }));

    if (onVoteWithStake) {
      onVoteWithStake(templateId, vote, voteStakeType, voteStakeAmount);
    } else {
      onGhostVote?.(templateId, vote === 'support' ? voteStakeAmount : -voteStakeAmount);
    }
  };

  const getCardBackground = (template: CueCardTemplate) => {
    if (template.background_type === 'gradient') return template.background_value;
    if (template.background_type === 'color') return template.background_value;
    return `url(${template.background_value}) center/cover`;
  };

  const getInitiativeIcon = (slug: string | null): string => {
    const icons: Record<string, string> = {
      'lets-make-dinner': '🍽️',
      'lets-get-groceries': '🛒',
      'lets-go-shopping': '🛍️',
      'household-concierge': '🏠',
      'family-table': '👨‍👩‍👧‍👦',
      'tatiana-schlossburg-health-accords': '💊',
      'msa': '🏥',
      'defense-klaus': '🛡️',
      'rally-group': '🚨',
      'vsl': '💰',
      'lets-make-bread': '🍞',
      'harper-guild': '⚖️',
      'jukebox': '🎵',
      'academic': '📚',
      'brass-tacks': '🔧',
      'power-to-the-people': '✊',
    };
    return icons[slug || ''] || '📋';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4">
        <Input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
        />

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!activeFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(cat === activeFilter ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(filteredTemplates.length / templates.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredTemplates.length} / {templates.length} cards
        </span>
      </div>

      {/* Grid of Card Icons */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {filteredTemplates.map((template) => {
          const isStamped = !!stampedCards[template.id];

          return (
            <motion.button
              key={template.id}
              onMouseEnter={() => setHoveredItem(template)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => handleCardClick(template)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all border-2 ${
                isStamped
                  ? 'border-green-500 shadow-green-500/30 shadow-md'
                  : 'border-transparent hover:border-primary/50'
              }`}
              style={{ background: getCardBackground(template) }}
              whileHover={{ scale: 1.15, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-2xl">
                  {getInitiativeIcon(template.initiative_slug)}
                </span>
              </div>
              {isStamped && (
                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hover Preview — Full-size deck card floating above the grid */}
      <AnimatePresence>
        {hoveredItem && !selectedCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-8 top-1/2 -translate-y-1/2 z-50 pointer-events-none w-[280px] h-[400px]"
          >
            <div
              className="w-full h-full rounded-2xl shadow-2xl border-2 border-primary/50 overflow-hidden flex flex-col"
              style={{ background: getCardBackground(hoveredItem) }}
            >
              <div className="flex-1 flex flex-col p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                {/* Icon */}
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-7xl drop-shadow-2xl">
                    {getInitiativeIcon(hoveredItem.initiative_slug)}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg leading-tight">
                    {hoveredItem.title}
                  </h3>
                  {hoveredItem.subtitle && (
                    <p className="text-sm text-white/90">{hoveredItem.subtitle}</p>
                  )}
                  <p className="text-xs text-white/70 line-clamp-4">
                    {hoveredItem.body_text}
                  </p>
                </div>

                {/* Status badge */}
                <div className="mt-4 flex items-center justify-between">
                  {stampedCards[hoveredItem.id] ? (
                    <Badge className="bg-green-500/90 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      QR Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/30 text-white/80">
                      Click to select
                    </Badge>
                  )}
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">{hoveredItem.template_type}</span>
                </div>
              </div>
            </div>

            {/* Card shadow/glow effect */}
            <div
              className="absolute inset-0 -z-10 rounded-2xl blur-xl opacity-50"
              style={{ background: getCardBackground(hoveredItem) }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Card Modal with Flip */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, rotateY: 0 }}
              animate={{ scale: 1, rotateY: isFlipped ? 180 : 0 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-[400px] h-[550px] cursor-pointer"
              style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(!isFlipped);
              }}
            >
              {/* FRONT — Card Display */}
              <div
                className={`absolute inset-0 rounded-2xl shadow-2xl overflow-hidden border-2 ${
                  stampedCards[selectedCard.id] ? 'border-green-500' : 'border-white/20'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  background: getCardBackground(selectedCard)
                }}
              >
                <div className="h-full flex flex-col p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  {/* Stamped badge */}
                  {stampedCards[selectedCard.id] && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white">
                        <Check className="w-4 h-4 mr-1" />
                        QR Ready
                      </Badge>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-8xl drop-shadow-2xl">
                      {getInitiativeIcon(selectedCard.initiative_slug)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                      {selectedCard.title}
                    </h2>
                    {selectedCard.subtitle && (
                      <p className="text-lg text-white/90">{selectedCard.subtitle}</p>
                    )}
                    <p className="text-sm text-white/70 line-clamp-3">
                      {customTexts[selectedCard.id] || selectedCard.body_text}
                    </p>
                    {selectedCard.hashtags && selectedCard.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCard.hashtags.slice(0, 5).map((tag) => (
                          <span key={tag} className="text-xs text-primary/90">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-white/40 text-xs mt-4 text-center">
                    Click to flip for details & actions
                  </p>
                </div>
              </div>

              {/* BACK — Details + Actions */}
              <div
                className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden bg-card border-2 border-primary/30"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="h-full flex flex-col p-6">
                  <h2 className="text-xl font-bold text-foreground">{selectedCard.title}</h2>
                  {selectedCard.subtitle && (
                    <p className="text-sm text-primary mt-1">{selectedCard.subtitle}</p>
                  )}

                  <div className="flex-1 mt-4 overflow-y-auto">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {customTexts[selectedCard.id] || selectedCard.body_text}
                    </p>
                  </div>

                  {/* Voting Section (if enabled) — requires stake */}
                  {votingEnabled && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Vote className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Cast Your Vote</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isGhost ? '👻 Ghost votes are practice' : `Balance: ${voteStakeType === 'credits' ? userCredits : userMarks} ${voteStakeType}`}
                        </span>
                      </div>

                      {/* Vote progress bar */}
                      {currentVotes[selectedCard.id] && (
                        <div className="h-3 bg-muted rounded-full overflow-hidden mb-3 relative">
                          <motion.div
                            className="h-full bg-green-500"
                            animate={{
                              width: `${(currentVotes[selectedCard.id].up /
                                (currentVotes[selectedCard.id].up + currentVotes[selectedCard.id].down || 1)) * 100}%`
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/80">
                            {currentVotes[selectedCard.id].up} vs {currentVotes[selectedCard.id].down}
                          </div>
                        </div>
                      )}

                      {/* Stake amount selector */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-muted-foreground">Stake:</span>
                        <div className="flex-1 flex gap-1">
                          {[1, 5, 10, 25].map((amount) => (
                            <button
                              key={amount}
                              onClick={(e) => {
                                e.stopPropagation();
                                setVoteStakeAmount(amount);
                              }}
                              className={`flex-1 py-1 text-xs rounded transition-colors ${
                                voteStakeAmount === amount
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {amount}
                            </button>
                          ))}
                        </div>
                        <select
                          value={voteStakeType}
                          onChange={(e) => {
                            e.stopPropagation();
                            setVoteStakeType(e.target.value as 'credits' | 'marks');
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-muted border-0 rounded px-2 py-1"
                        >
                          <option value="marks">Marks</option>
                          <option value="credits">Credits</option>
                        </select>
                      </div>

                      {/* Current user vote display */}
                      {userVotes[selectedCard.id] && (
                        <div className="mb-3 p-2 bg-primary/10 rounded-lg text-xs text-center">
                          You voted <strong>{userVotes[selectedCard.id]?.vote}</strong> with{' '}
                          <strong>{userVotes[selectedCard.id]?.stake} {userVotes[selectedCard.id]?.type}</strong>
                        </div>
                      )}

                      {/* Vote buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant={userVotes[selectedCard.id]?.vote === 'support' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 gap-2"
                          disabled={!isGhost && voteStakeAmount > (voteStakeType === 'credits' ? userCredits : userMarks)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(selectedCard.id, 'support');
                          }}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Support ({voteStakeAmount})
                        </Button>
                        <Button
                          variant={userVotes[selectedCard.id]?.vote === 'oppose' ? 'destructive' : 'outline'}
                          size="sm"
                          className="flex-1 gap-2"
                          disabled={!isGhost && voteStakeAmount > (voteStakeType === 'credits' ? userCredits : userMarks)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(selectedCard.id, 'oppose');
                          }}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Oppose ({voteStakeAmount})
                        </Button>
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-2 text-center">
                        {isGhost
                          ? 'Ghost votes help us learn your preferences'
                          : 'Your stake is held until voting closes'}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {!stampedCards[selectedCard.id] ? (
                      <Button
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStamp(selectedCard.id);
                        }}
                      >
                        <QrCode className="w-4 h-4" />
                        Stamp with Your QR
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full gap-2 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToDeployFrame?.(selectedCard);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                          Add to Deploy Frame
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <Share2 className="w-3 h-3" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <Download className="w-3 h-3" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <Calendar className="w-3 h-3" />
                            Schedule
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-muted-foreground text-xs mt-3 text-center">
                    Click to flip back
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation hints */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              Click card to flip • Click outside to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      <p className="text-center text-sm text-muted-foreground">
        Hover to preview • Click to expand • Click again to flip • {filteredTemplates.length} cards available
      </p>
    </div>
  );
}
