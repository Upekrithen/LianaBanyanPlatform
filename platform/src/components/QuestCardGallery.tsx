/**
 * Quest Card Gallery
 *
 * Displays quest deck cards with level indicators and lock states.
 * Cards above user's current level are shown but locked.
 */

import { useState } from 'react';
import { DeckCard, DeckCardData } from '@/components/DeckCard';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PathwayLevel, UserPathwayProgress, DEFAULT_USER_PROGRESS } from '@/lib/pathwayLevels';
import {
  LEVEL_1_QUEST_CARDS,
  LEVEL_3_QUEST_CARDS,
  QUEST_DECK_CARDS,
} from '@/data/questDeckCards';

interface QuestCardGalleryProps {
  userProgress?: UserPathwayProgress;
  showLevelFilter?: boolean;
  maxCards?: number;
  title?: string;
  subtitle?: string;
}

const LEVEL_COLORS: Record<PathwayLevel, string> = {
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-purple-500',
};

const LEVEL_LABELS: Record<PathwayLevel, string> = {
  1: 'Starter',
  2: 'Intermediate',
  3: 'Advanced',
};

function getCardLevel(cardId: string): PathwayLevel {
  if (LEVEL_1_QUEST_CARDS.some(c => c.id === cardId)) return 1;
  if (LEVEL_3_QUEST_CARDS.some(c => c.id === cardId)) return 3;
  return 2;
}

export function QuestCardGallery({
  userProgress = DEFAULT_USER_PROGRESS,
  showLevelFilter = true,
  maxCards,
  title = 'Quest Cards',
  subtitle = 'Guided pathways and challenges',
}: QuestCardGalleryProps) {
  const [selectedLevel, setSelectedLevel] = useState<PathwayLevel | 'all'>('all');

  const filteredCards = QUEST_DECK_CARDS.filter(card => {
    if (selectedLevel === 'all') return true;
    return getCardLevel(card.id) === selectedLevel;
  }).slice(0, maxCards);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/60">{subtitle}</p>
        </div>

        {/* Level Filter */}
        {showLevelFilter && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {([1, 2, 3] as PathwayLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedLevel === level
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${LEVEL_COLORS[level]}`} />
                Level {level}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Level Indicator */}
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">Your Level:</span>
          <Badge className={`${LEVEL_COLORS[userProgress.currentLevel]} text-white`}>
            {userProgress.currentLevel} - {LEVEL_LABELS[userProgress.currentLevel]}
          </Badge>
        </div>
        <span className="text-white/50 text-sm">
          Complete three-packs to unlock higher levels
        </span>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {filteredCards.map((card, index) => {
          const cardLevel = getCardLevel(card.id);
          const isLocked = cardLevel > userProgress.currentLevel;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Level Badge */}
              <div className="absolute -top-2 -left-2 z-10">
                <Badge className={`${LEVEL_COLORS[cardLevel]} text-white text-xs`}>
                  Lvl {cardLevel}
                </Badge>
              </div>

              {/* Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-20 bg-black/60 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm">
                  <Lock className="w-12 h-12 text-white/50 mb-2" />
                  <span className="text-white/70 text-sm font-medium">
                    Requires Level {cardLevel}
                  </span>
                  <span className="text-white/50 text-xs mt-1">
                    Complete a Level {cardLevel - 1} three-pack
                  </span>
                </div>
              )}

              <DeckCard card={card} />
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50">No quest cards match your filter.</p>
        </div>
      )}
    </div>
  );
}

export default QuestCardGallery;
