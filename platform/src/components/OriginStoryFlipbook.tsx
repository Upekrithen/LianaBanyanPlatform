import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OriginStoryFlipbookProps {
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  onComplete?: () => void;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

const SCENES = [
  {
    img: 'concept_01_idea.jpg',
    caption: 'A person has an idea — a tiny seed of something.',
    alt: 'Stick figure with a thought bubble containing a seed.',
  },
  {
    img: 'concept_02_planting.jpg',
    caption: 'They plant it. Just one seed, in one spot of dirt.',
    alt: 'Stick figure pressing a seed into a mound of earth, clouds in the sky.',
  },
  {
    img: 'concept_03_growing.jpg',
    caption: 'They get to work. Hands in the dirt, wheelbarrow ready.',
    alt: 'Stick figure kneeling beside a wheelbarrow, working the soil into a mound.',
  },
  {
    img: 'concept_04_banyan.jpg',
    caption: 'They water it. Tend it. Nurture it.',
    alt: 'A watering can pours over a tiny sprout in a mound of dirt, wheelbarrow nearby.',
  },
  {
    img: 'concept_05_figs.jpg',
    caption: 'The seed becomes a tree. Tall trunk, wide branches, deep roots.',
    alt: 'A full-sized tree with a thick canopy stands next to an empty wheelbarrow.',
  },
  {
    img: 'concept_06_harvest.jpg',
    caption: 'The roots go deeper. The canopy spreads wider.',
    alt: 'A large tree with extensive branches, visible roots, and a wheelbarrow at its base.',
  },
  {
    img: 'concept_07_more_growth.jpg',
    caption: 'The first harvest arrives. Wheelbarrows fill at the base of one tree.',
    alt: 'A single large tree with multiple wheelbarrows full of fruit around its trunk.',
  },
  {
    img: 'concept_08_expansion.jpg',
    caption: 'The branches fill with fruit. More than one person could ever carry.',
    alt: 'A tree laden with round fruit hanging from every branch, wheelbarrow waiting below.',
  },
  {
    img: 'concept_09_more_harvest.jpg',
    caption: 'One wheelbarrow fills to the brim.',
    alt: 'A tree with a wheelbarrow overflowing with harvested fruit beneath it.',
  },
  {
    img: 'concept_10_abundance.jpg',
    caption: 'The banyan sends down new roots. New trunks form beside the first.',
    alt: 'A banyan tree with aerial roots descending to become secondary trunks, fruit throughout.',
  },
  {
    img: 'concept_11_ecosystem.jpg',
    caption: 'A forest grows from that one seed. Fruit enough for everyone.',
    alt: 'A vast banyan forest of interconnected trees with fruit, aerial roots forming a dense canopy.',
  },
  {
    img: 'concept_12_legacy.jpg',
    caption: 'And it all started with one person, one idea, one seed. YOU.',
    alt: 'A small seedling growing from a mound of earth beside a wheelbarrow — the cycle begins again.',
  },
];

export function OriginStoryFlipbook({
  autoPlay = true,
  interval = 3500,
  showControls = true,
  onComplete,
  onClose,
  className = '',
  compact = false,
}: OriginStoryFlipbookProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(1);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const effectiveInterval = Math.round(interval / speed);
  const navigate = useNavigate();

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= SCENES.length) {
        setIsPlaying(false);
        setShowEndScreen(true);
        onComplete?.();
        return prev;
      }
      return next;
    });
  }, [onComplete]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setShowEndScreen(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStart = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(0);
    setIsPlaying(false);
    setShowEndScreen(false);
  }, []);

  const goToEnd = useCallback(() => {
    setDirection(1);
    setCurrentIndex(SCENES.length - 1);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(goToNext, effectiveInterval);
    return () => clearInterval(timer);
  }, [isPlaying, effectiveInterval, goToNext]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      rotateY: dir > 0 ? -15 : 15,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      rotateY: dir > 0 ? 15 : -15,
    }),
  };

  const scene = SCENES[currentIndex];

  // End screen
  if (showEndScreen) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg overflow-hidden shadow-2xl border-8 border-green-800 p-8 text-center">
            <h3 className="text-2xl font-bold text-green-900 font-serif mb-2">Where To Go From Here</h3>
            <p className="text-green-700 italic mb-6 font-serif">
              One seed. One idea. One forest that feeds everyone.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => navigate('/portal')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> Plant Your Seed
              </button>
              <button
                onClick={() => navigate('/fable')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> Watch the Full Fable
              </button>
              <button
                onClick={() => { goToStart(); }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-green-600 text-green-800 rounded-lg font-bold hover:bg-green-100 transition-colors"
              >
                <SkipBack className="w-4 h-4" /> Watch Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-gray-400 text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  <Home className="w-4 h-4" /> Back to Home
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden shadow-lg border-4 border-green-800">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={currentIndex}
              src={`/origin-story/${scene.img}`}
              alt={scene.alt}
              className="absolute inset-0 w-full h-full object-contain bg-gray-400"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow disabled:opacity-30 hover:bg-white transition-colors z-10"
          >
            <ChevronLeft className="w-4 h-4 text-green-800" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === SCENES.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow disabled:opacity-30 hover:bg-white transition-colors z-10"
          >
            <ChevronRight className="w-4 h-4 text-green-800" />
          </button>

          {/* Caption overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
            <p className="text-white text-xs text-center font-serif italic">{scene.caption}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-2">
          {SCENES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
                setShowEndScreen(false);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-green-600' : 'bg-green-200 hover:bg-green-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className={`relative ${className}`}>
      <div className="relative max-w-2xl mx-auto">
        {/* Caption above */}
        <motion.div
          key={`caption-${currentIndex}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-center text-green-300 font-serif text-lg italic px-4"
        >
          {scene.caption}
        </motion.div>

        {/* Image frame */}
        <div
          className="relative aspect-[4/3] bg-gray-400 rounded-lg overflow-hidden shadow-2xl border-8 border-green-800"
          style={{ perspective: '1000px' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={currentIndex}
              src={`/origin-story/${scene.img}`}
              alt={scene.alt}
              className="absolute inset-0 w-full h-full object-contain bg-gray-400"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </AnimatePresence>

          {/* Page flip corner */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-green-300 to-transparent opacity-50 z-10" />

          {/* Clickable halves */}
          <button onClick={goToPrev} disabled={currentIndex === 0} className="absolute left-0 top-0 w-1/2 h-full cursor-pointer z-10 opacity-0 disabled:cursor-default" aria-label="Previous" />
          <button onClick={goToNext} disabled={currentIndex === SCENES.length - 1} className="absolute right-0 top-0 w-1/2 h-full cursor-pointer z-10 opacity-0 disabled:cursor-default" aria-label="Next" />
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={goToStart} className="p-2 text-green-400 hover:text-green-200 transition-colors"><SkipBack className="w-5 h-5" /></button>
            <button onClick={goToPrev} disabled={currentIndex === 0} className="p-2 text-green-400 hover:text-green-200 disabled:opacity-30 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-full transition-colors shadow-lg">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={goToNext} disabled={currentIndex === SCENES.length - 1} className="p-2 text-green-400 hover:text-green-200 disabled:opacity-30 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            <button onClick={goToEnd} className="p-2 text-green-400 hover:text-green-200 transition-colors"><SkipForward className="w-5 h-5" /></button>
            {/* Speed controls */}
            <div className="flex items-center gap-1 ml-2 border-l border-green-700 pl-3">
              {([1, 2, 3] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                    speed === s
                      ? 'bg-green-500 text-white'
                      : 'text-green-400 hover:text-green-200 bg-green-900/50'
                  }`}
                  title={`${s}x speed`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {SCENES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
                setShowEndScreen(false);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-green-500 scale-125' : 'bg-green-800 hover:bg-green-600'
              }`}
              title={`Scene ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
