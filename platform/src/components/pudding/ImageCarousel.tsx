import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: string;
  image?: string;
  title: string;
  description?: string;
  caption?: string;
  tag?: string;
}

interface ImageCarouselProps {
  items: CarouselItem[];
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ImageCarousel({
  items,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      return next;
    });
  };

  const currentItem = items[currentIndex];

  return (
    <div className="my-8">
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <div className="relative h-[400px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
            >
              {currentItem.image ? (
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="max-h-[250px] object-contain rounded-lg shadow-lg mb-4"
                />
              ) : (
                <div className="w-48 h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-6xl font-bold">
                    {currentItem.title.charAt(0)}
                  </span>
                </div>
              )}
              
              {currentItem.tag && (
                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mb-2">
                  {currentItem.tag}
                </span>
              )}
              
              <h4 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                {currentItem.title}
              </h4>
              
              {currentItem.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-2 max-w-md">
                  {currentItem.description}
                </p>
              )}
              
              {currentItem.caption && (
                <p className="text-gray-500 dark:text-gray-400 text-xs italic text-center mt-2">
                  {currentItem.caption}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-white" />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-white" />
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
          <span className="text-white text-sm">
            {currentIndex + 1} / {items.length}
          </span>
        </div>
      </div>

      {showDots && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-orange-500 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
