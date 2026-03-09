import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableBlockProps {
  title: string;
  subtitle?: string;
  preview?: string;
  children: React.ReactNode;
  accentColor?: string;
  defaultExpanded?: boolean;
}

export function ExpandableBlock({
  title,
  subtitle,
  preview,
  children,
  accentColor = '#f97316',
  defaultExpanded = false
}: ExpandableBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="my-8">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        style={{ backgroundColor: accentColor }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{title}</h3>
              {subtitle && (
                <p className="text-white/80 text-sm">{subtitle}</p>
              )}
              {preview && !isExpanded && (
                <p className="text-white/70 text-sm mt-2 italic">
                  {preview}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <ChevronDown className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </div>
          <p className="text-white/60 text-xs mt-3">
            Click to {isExpanded ? 'collapse' : 'read more'} ({isExpanded ? '−' : '+'})
          </p>
        </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg p-6 shadow-inner">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
