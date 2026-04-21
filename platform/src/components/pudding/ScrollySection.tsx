import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollySectionProps {
  children: React.ReactNode;
  stickyContent?: React.ReactNode;
  stickyPosition?: 'left' | 'right';
  backgroundColor?: string;
  onProgress?: (progress: number) => void;
}

export function ScrollySection({
  children,
  stickyContent,
  stickyPosition = 'right',
  backgroundColor,
  onProgress
}: ScrollySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  useEffect(() => {
    if (onProgress) {
      return scrollYProgress.on('change', onProgress);
    }
  }, [scrollYProgress, onProgress]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[200vh]"
      style={{ backgroundColor }}
    >
      {stickyContent && (
        <div
          className={`sticky top-0 h-screen flex items-center ${
            stickyPosition === 'left' ? 'float-left w-1/2 pr-8' : 'float-right w-1/2 pl-8'
          }`}
        >
          {stickyContent}
        </div>
      )}

      <div className={stickyContent ? 'w-1/2 py-24 px-8' : 'py-24 px-8'}>
        {children}
      </div>

      <div className="clear-both" />
    </div>
  );
}

interface ScrollyStepProps {
  children: React.ReactNode;
  onEnter?: () => void;
  onExit?: () => void;
  threshold?: number;
}

export function ScrollyStep({
  children,
  onEnter,
  onExit,
  threshold = 0.5
}: ScrollyStepProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onEnter?.();
        } else if (!entry.isIntersecting && isVisible) {
          setIsVisible(false);
          onExit?.();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible, onEnter, onExit, threshold]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isVisible ? 1 : 0.3, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="min-h-[50vh] flex items-center"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg">
        {children}
      </div>
    </motion.div>
  );
}

interface ProgressIndicatorProps {
  progress: number;
  steps?: string[];
  currentStep?: number;
}

export function ProgressIndicator({
  progress,
  steps = [],
  currentStep = 0
}: ProgressIndicatorProps) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40">
      <div className="relative">
        <div className="w-1 h-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="w-full bg-orange-500 rounded-full"
            style={{ height: `${progress * 100}%` }}
          />
        </div>

        {steps.length > 0 && (
          <div className="absolute top-0 left-4 h-48 flex flex-col justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 transition-opacity ${
                  index <= currentStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
