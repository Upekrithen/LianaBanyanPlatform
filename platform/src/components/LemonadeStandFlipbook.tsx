import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LemonadeStandFlipbookProps {
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  onComplete?: () => void;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

interface Scene {
  id: number;
  rhyme: string;
  subtitle: string;
  alt: string;
  isMoral?: boolean;
  isEpilogue?: boolean;
  image?: string;
}

const SCENES: Scene[] = [
  {
    id: 1,
    rhyme: "The goat has a dream and a big, brave plan, but wood, nails, and tools cost more than he can.",
    subtitle: "The goat wants to build but can't afford the supplies.",
    alt: "A friendly goat looks puzzled at expensive piles of wood, nails, and tools. An empty wheelbarrow sits beside him.",
  },
  {
    id: 2,
    rhyme: "A chicken and dog both wish him the best, they drop five-cent coins in his barrow's wide nest.",
    subtitle: "One chicken and the dog put nickels in the goat's wheelbarrow.",
    alt: "A cheerful chicken and friendly dog each drop a shiny 5-cent coin into the goat's wheelbarrow.",
  },
  {
    id: 3,
    rhyme: "With jingling coins, he buys what he needs, a wheelbarrow full for his building deeds.",
    subtitle: "The goat uses the money to buy wood, nails, and tools.",
    alt: "The goat stands proudly next to supply piles now marked SOLD, loading his overflowing wheelbarrow.",
  },
  {
    id: 4,
    rhyme: "The goat and his friends all hammer and cheer, the lemonade stand is almost right here.",
    subtitle: "The goat, chicken, pig, and cat all work together to build.",
    alt: "Four animals — goat, chicken, pig, and cat — work together hammering, sawing, and building the lemonade stand.",
  },
  {
    id: 5,
    rhyme: "The stand is now ready, the sign says 'Five Cents,' cold lemonade smiles make perfect sense.",
    subtitle: "The new lemonade stand sells cups for five cents each.",
    alt: "A finished lemonade stand with a 5-cent sign. The goat serves a line of happy animal customers on a sunny day.",
  },
  {
    id: 6,
    rhyme: "With lemonade cups, three friends gladly share, goat's dollar, their nickels, fill her barrow with care.",
    subtitle: "The goat, dog, and cat put money in the chef chicken's wheelbarrow.",
    alt: "Everyone holds lemonade. A chef-hat chicken watches as the goat drops a dollar and friends drop nickels into her wheelbarrow.",
  },
  {
    id: 7,
    rhyme: "They bake tasty pizzas in ovens that glow, six friends with their nickels help his dreams to grow.",
    subtitle: "Six friends with lemonade and pizza help the dog start his dream.",
    alt: "A glowing pizza oven in the background. The dog holds a carved wooden knight. Six friends each drop coins — everyone holds lemonade AND pizza.",
  },
  {
    id: 8,
    rhyme: '"A true selfless act always sparks another." — Klaus',
    subtitle: "",
    alt: "All seven characters stand together with the lemonade stand, pizza oven, and woodworking shop behind them. Everyone smiles.",
    isMoral: true,
  },
  {
    id: 9,
    rhyme: "And so the seeds were planted.",
    subtitle: "",
    alt: "Seeds planted in rows, tiny sprouts emerging from the soil.",
    isEpilogue: true,
    image: "/images/stage1.png",
  },
  {
    id: 10,
    rhyme: "One by one, they grew.",
    subtitle: "",
    alt: "Small saplings growing steadily from the ground.",
    isEpilogue: true,
    image: "/images/stage2.png",
  },
  {
    id: 11,
    rhyme: "Each one reaching for light.",
    subtitle: "",
    alt: "Taller saplings with branches stretching upward.",
    isEpilogue: true,
    image: "/images/stage3.png",
  },
  {
    id: 12,
    rhyme: "The first trees sheltered the next.",
    subtitle: "",
    alt: "Mature trees with canopy, new saplings growing underneath.",
    isEpilogue: true,
    image: "/images/stage4.png",
  },
  {
    id: 13,
    rhyme: "Roots became trunks. Trunks became forest.",
    subtitle: "",
    alt: "Banyan spreading, aerial roots becoming new trunks.",
    isEpilogue: true,
    image: "/images/stage5.png",
  },
  {
    id: 14,
    rhyme: "One seed. One forest. Everyone fed.",
    subtitle: "",
    alt: "Full banyan forest in bloom, covering the landscape.",
    isEpilogue: true,
    image: "/images/stage6.png",
  },
];

export function LemonadeStandFlipbook({
  autoPlay = true,
  interval = 4000,
  showControls = true,
  onComplete,
  onClose,
  className = '',
  compact = false,
}: LemonadeStandFlipbookProps) {
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

  // End screen: "Where To Go From Here"
  if (showEndScreen) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg overflow-hidden shadow-2xl border-8 border-amber-800 p-8 text-center">
            <h3 className="text-2xl font-bold text-amber-900 font-serif mb-2">Where To Go From Here</h3>
            <p className="text-amber-700 italic mb-6 font-serif">
              "A true selfless act always sparks another." — Klaus
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => navigate('/portal')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> Enter the Cooperative
              </button>
              <button
                onClick={() => navigate('/fable')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> Watch the Full Fable
              </button>
              <button
                onClick={() => navigate('/health-accords')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> Health Accords
              </button>
              <button
                onClick={() => { goToStart(); }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-amber-600 text-amber-800 rounded-lg font-bold hover:bg-amber-100 transition-colors"
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
        <div className="relative aspect-[4/3] bg-amber-50 rounded-lg overflow-hidden shadow-lg border-4 border-amber-200">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              className="absolute inset-0 flex flex-col items-center justify-center p-4"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <div className={`w-full flex-1 flex items-center justify-center rounded-md mb-2 relative overflow-hidden ${
                scene.isEpilogue ? 'bg-gradient-to-b from-emerald-100 to-amber-100' : 'bg-gradient-to-b from-sky-100 to-green-100'
              }`}>
                <img
                  src={scene.image ?? `/images/Lemonade Stand/goat (${scene.id}).png`}
                  alt={scene.alt}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className={`text-xs text-center font-serif italic ${scene.isEpilogue ? 'text-emerald-800' : 'text-amber-800'}`}>
                {scene.isMoral || scene.isEpilogue ? scene.rhyme : `"${scene.rhyme}"`}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow disabled:opacity-30 hover:bg-white transition-colors z-10"
          >
            <ChevronLeft className="w-4 h-4 text-amber-800" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === SCENES.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow disabled:opacity-30 hover:bg-white transition-colors z-10"
          >
            <ChevronRight className="w-4 h-4 text-amber-800" />
          </button>
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
                i === currentIndex ? 'bg-amber-600' : 'bg-amber-200 hover:bg-amber-300'
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
        {/* Book pages - single frame */}
        <div
          className="relative aspect-[4/3] bg-amber-50 rounded-lg overflow-hidden shadow-2xl border-8 border-amber-800"
          style={{ perspective: '1000px' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              className="absolute inset-0 flex flex-col"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <div className={`flex-1 flex items-center justify-center relative overflow-hidden ${
                scene.isEpilogue ? 'bg-gradient-to-b from-emerald-100 to-amber-100' : 'bg-gradient-to-b from-sky-100 to-green-100'
              }`}>
                <img
                  src={scene.image ?? `/images/Lemonade Stand/goat (${scene.id}).png`}
                  alt={scene.alt}
                  className="w-full h-full object-contain"
                />
              </div>

              {scene.rhyme && (
                <div className={`border-t-2 px-4 py-3 text-center ${
                  scene.isEpilogue
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-amber-100 border-amber-300'
                }`}>
                  <p className={`font-medium text-sm font-serif italic ${
                    scene.isEpilogue ? 'text-emerald-900' : 'text-amber-900'
                  }`}>
                    {scene.isMoral || scene.isEpilogue ? scene.rhyme : `"${scene.rhyme}"`}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Page flip corner */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-amber-300 to-transparent opacity-50 z-10" />

          {/* Clickable left/right halves */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-0 w-1/2 h-full cursor-pointer z-10 opacity-0 disabled:cursor-default"
            aria-label="Previous scene"
          />
          <button
            onClick={goToNext}
            disabled={currentIndex === SCENES.length - 1}
            className="absolute right-0 top-0 w-1/2 h-full cursor-pointer z-10 opacity-0 disabled:cursor-default"
            aria-label="Next scene"
          />
        </div>

        {/* Controls bar */}
        {showControls && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={goToStart} className="p-2 text-amber-400 hover:text-amber-200 transition-colors" title="Go to start">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={goToPrev} disabled={currentIndex === 0} className="p-2 text-amber-400 hover:text-amber-200 disabled:opacity-30 transition-colors" title="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full transition-colors shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={goToNext} disabled={currentIndex === SCENES.length - 1} className="p-2 text-amber-400 hover:text-amber-200 disabled:opacity-30 transition-colors" title="Next">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={goToEnd} className="p-2 text-amber-400 hover:text-amber-200 transition-colors" title="Go to end">
              <SkipForward className="w-5 h-5" />
            </button>
            {/* Speed controls */}
            <div className="flex items-center gap-1 ml-2 border-l border-amber-700 pl-3">
              {([1, 2, 3] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                    speed === s
                      ? 'bg-amber-500 text-white'
                      : 'text-amber-400 hover:text-amber-200 bg-amber-900/50'
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
                i === currentIndex
                  ? 'bg-amber-500 scale-125'
                  : 'bg-amber-800 hover:bg-amber-600'
              }`}
              title={`Scene ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
