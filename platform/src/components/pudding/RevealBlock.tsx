import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Vote, ThumbsUp, ThumbsDown } from 'lucide-react';

interface RevealBlockProps {
  title: string;
  summary: React.ReactNode;
  details: React.ReactNode;
  votingEnabled?: boolean;
  onVote?: (vote: 'up' | 'down') => void;
  currentVotes?: { up: number; down: number };
  accentColor?: string;
}

export function RevealBlock({
  title,
  summary,
  details,
  votingEnabled = false,
  onVote,
  currentVotes = { up: 0, down: 0 },
  accentColor = '#f97316'
}: RevealBlockProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      setUserVote(null);
    } else {
      setUserVote(vote);
      onVote?.(vote);
    }
  };

  const totalVotes = currentVotes.up + currentVotes.down;
  const upPercentage = totalVotes > 0 ? (currentVotes.up / totalVotes) * 100 : 50;

  return (
    <div className="my-8 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="bg-white dark:bg-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>

        <div className="prose dark:prose-invert max-w-none">
          {summary}
        </div>

        <motion.button
          onClick={() => setIsRevealed(!isRevealed)}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: isRevealed ? '#e5e7eb' : accentColor,
            color: isRevealed ? '#374151' : 'white'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRevealed ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Reveal Details & How to Vote
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="p-6 border-t border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: `${accentColor}10` }}
            >
              <div className="prose dark:prose-invert max-w-none mb-6">
                {details}
              </div>

              {votingEnabled && (
                <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Vote className="w-5 h-5 text-orange-500" />
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      Cast Your Vote
                    </h4>
                  </div>

                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400"
                      initial={{ width: '50%' }}
                      animate={{ width: `${upPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <span>{currentVotes.up} support</span>
                    <span>{currentVotes.down} oppose</span>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => handleVote('up')}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors ${
                        userVote === 'up'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Support
                    </motion.button>

                    <motion.button
                      onClick={() => handleVote('down')}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors ${
                        userVote === 'down'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Oppose
                    </motion.button>
                  </div>

                  {userVote && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4"
                    >
                      You voted to {userVote === 'up' ? 'support' : 'oppose'} this proposal.
                      Click again to change your vote.
                    </motion.p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
