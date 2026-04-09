import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

interface FableFlipbookProps {
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  onComplete?: () => void;
  className?: string;
  compact?: boolean;
}

// Each scene has an image file and its matching caption
// The order here is the DISPLAY order (what the viewer sees in sequence)
const SCENES = [
  { img: 1, caption: "The Little Red Hen finds some wheat seeds..." },
  { img: 2, caption: "'Who will help me plant this wheat?' 'Not I!' said the others." },
  { img: 3, caption: "So she planted, harvested, ground, and baked it herself." },
  { img: 4, caption: "'Let's do it TOGETHER next time!' She packs bread and seeds." },
  { img: 5, caption: "The Hen arrives at a village, carrying her basket and a stone." },
  { img: 6, caption: "'Soup from a STONE?' The villagers watch, confused." },
  { img: 7, caption: "Each villager adds something small: salt, a potato, herbs, an onion..." },
  { img: 8, caption: "Soup is ready! But the bread runs out before everyone gets some." },
  { img: 9, caption: "The Hen holds up wheat seeds. 'To have more bread, we need to GROW more wheat.'" },
  { img: 10, caption: "In the fields, ants pile up seeds while grasshoppers take the piles." },
  { img: 11, caption: "The Hen and villagers approach the ants." },
  { img: 12, caption: "The Hen shows the ants: 'Plant wheat, don't just pile seeds!'" },
  { img: 13, caption: "Together they plant, harvest, grind, and bake as ONE team." },
  // After "bake as ONE team" - reordered section:
  { img: 24, caption: "The Hen turns to the ants: 'You're gonna rattle the stars.'" },
  { img: 19, caption: "'How did you know what to do?' asks a young ant." },
  { img: 20, caption: "The Hen daydreams of a Viking ship while cooking in the city." },
  { img: 21, caption: "She sees hungry animals outside a locked building full of bread." },
  { img: 22, caption: "She reaches into her dream and grabs an oar — the same as her spoon." },
  { img: 14, caption: "The grasshoppers watch, angry. Hopper points at the ants." },
  { img: 15, caption: "Two groups face each other. Tension in the air." },
  { img: 16, caption: "The ants realize: 'Wait... WE outnumber THEM!'" },
  { img: 17, caption: "The ants link arms in army ant formation." },
  { img: 18, caption: "'WE ARE THE ANTS' — Standing firm together." },
  { img: 25, caption: "Hopper sits alone, defeated. Cold and sad." },
  { img: 26, caption: "..." },
];

const FABLE_IMAGES = SCENES.map((scene) => ({
  src: `/fabled/hen${scene.img}.png`,
  alt: `Little Red Hen - Scene ${scene.img}`,
  caption: scene.caption,
}));

export function FableFlipbook({
  autoPlay = true,
  interval = 3000,
  showControls = true,
  onComplete,
  className = '',
  compact = false,
}: FableFlipbookProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(1);
  const [speed, setSpeed] = useState(1);
  const effectiveInterval = Math.round(interval / speed);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= FABLE_IMAGES.length) {
        setIsPlaying(false);
        onComplete?.();
        return prev;
      }
      return next;
    });
  }, [onComplete]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStart = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const goToEnd = useCallback(() => {
    setDirection(1);
    setCurrentIndex(FABLE_IMAGES.length - 1);
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

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative aspect-[4/3] bg-amber-50 rounded-lg overflow-hidden shadow-lg border-4 border-amber-200">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={currentIndex}
              src={FABLE_IMAGES[currentIndex].src}
              alt={FABLE_IMAGES[currentIndex].alt}
              className="absolute inset-0 w-full h-full object-contain"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </AnimatePresence>
          
          {/* Page flip corners */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-amber-300 to-transparent opacity-50" />
          
          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow disabled:opacity-30 hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-amber-800" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === FABLE_IMAGES.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow disabled:opacity-30 hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-amber-800" />
          </button>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-2">
          {FABLE_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-amber-600' : 'bg-amber-200 hover:bg-amber-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Book container */}
      <div className="relative max-w-2xl mx-auto">
        {/* Caption - above the frame */}
        <motion.div
          key={`caption-${currentIndex}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-center text-amber-100 font-serif text-lg italic px-4 drop-shadow-md"
        >
          {FABLE_IMAGES[currentIndex].caption}
        </motion.div>
        
        {/* Book pages - single frame, clickable left/right */}
        <div className="relative aspect-[4/3] bg-amber-50 rounded-lg overflow-hidden shadow-2xl border-8 border-amber-800"
             style={{ perspective: '1000px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              className="absolute inset-0"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src={FABLE_IMAGES[currentIndex].src}
                alt={FABLE_IMAGES[currentIndex].alt}
                className="w-full h-full object-contain p-4"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Clickable left half - go back */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-0 w-1/2 h-full cursor-pointer z-20 hover:bg-black/5 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
            aria-label="Previous page"
          />
          
          {/* Clickable right half - go forward */}
          <button
            onClick={goToNext}
            disabled={currentIndex === FABLE_IMAGES.length - 1}
            className="absolute right-0 top-0 w-1/2 h-full cursor-pointer z-20 hover:bg-black/5 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
            aria-label="Next page"
          />
          
          {/* Page number */}
          <div className="absolute bottom-2 right-4 text-amber-600 font-serif text-sm z-10">
            {currentIndex + 1} / {FABLE_IMAGES.length}
          </div>
          
          {/* Page flip corner */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-amber-200 to-transparent z-10" />
        </div>
      </div>
      
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={goToStart}
            className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
            title="Go to start"
          >
            <SkipBack className="w-5 h-5 text-amber-800" />
          </button>
          
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors disabled:opacity-30"
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-amber-800" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-amber-600 hover:bg-amber-700 transition-colors text-white"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === FABLE_IMAGES.length - 1}
            className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors disabled:opacity-30"
            title="Next page"
          >
            <ChevronRight className="w-5 h-5 text-amber-800" />
          </button>

          <button
            onClick={goToEnd}
            className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
            title="Go to end"
          >
            <SkipForward className="w-5 h-5 text-amber-800" />
          </button>

          {/* Speed controls */}
          <div className="flex items-center gap-1 ml-2 border-l border-amber-300 pl-3">
            {([1, 2, 3] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                  speed === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
                title={`${s}x speed`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="mt-4 max-w-md mx-auto">
        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-600"
            initial={false}
            animate={{ width: `${((currentIndex + 1) / FABLE_IMAGES.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

export default FableFlipbook;
