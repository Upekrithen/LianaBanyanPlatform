import { useRef, useEffect, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, Bookmark, Mail, ListTodo, ExternalLink } from 'lucide-react';
import type { BenefitItem } from './BenefitCard';

interface ProgressiveSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  benefit?: BenefitItem;
  onBenefitUnlock?: (benefit: BenefitItem) => void;
  onBeaconDrop?: (sectionId: string, note: string) => void;
  isLast?: boolean;
  sectionNumber?: number;
  totalSections?: number;
  branchLinks?: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
  className?: string;
}

export function ProgressiveSection({
  id,
  title,
  subtitle,
  children,
  benefit,
  onBenefitUnlock,
  onBeaconDrop,
  isLast = false,
  sectionNumber,
  totalSections,
  branchLinks,
  className = '',
}: ProgressiveSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' });
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [showBeaconDialog, setShowBeaconDialog] = useState(false);
  const [beaconNote, setBeaconNote] = useState('');

  useEffect(() => {
    if (isInView && benefit && !hasUnlocked) {
      setHasUnlocked(true);
      onBenefitUnlock?.(benefit);
    }
  }, [isInView, benefit, hasUnlocked, onBenefitUnlock]);

  const handleBeaconDrop = () => {
    if (beaconNote.trim()) {
      onBeaconDrop?.(id, beaconNote);
      setBeaconNote('');
      setShowBeaconDialog(false);
    }
  };

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative min-h-[60vh] py-16 px-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section Progress Indicator */}
      {sectionNumber && totalSections && (
        <div className="absolute top-4 left-4 text-xs text-slate-400 font-mono">
          {sectionNumber} / {totalSections}
        </div>
      )}

      {/* Beacon Button */}
      <button
        onClick={() => setShowBeaconDialog(true)}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
        title="Drop a Beacon"
      >
        <Bookmark className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
      </button>

      {/* Beacon Dialog */}
      {showBeaconDialog && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-12 right-4 z-50 w-72 p-4 rounded-xl bg-slate-800 border border-white/20 shadow-2xl"
        >
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" />
            Drop a Beacon
          </h4>
          <p className="text-xs text-slate-300 mb-3">
            Save this spot with a personal note. Come back anytime.
          </p>
          <textarea
            value={beaconNote}
            onChange={(e) => setBeaconNote(e.target.value)}
            placeholder="What caught your attention here?"
            className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm resize-none h-20 focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleBeaconDrop}
              className="flex-1 py-2 px-3 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium flex items-center justify-center gap-1"
            >
              <ListTodo className="w-3 h-3" />
              Save to Tasks
            </button>
            <button
              onClick={() => {
                handleBeaconDrop();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium flex items-center justify-center gap-1"
            >
              <Mail className="w-3 h-3" />
              Email Me
            </button>
          </div>
          <button
            onClick={() => setShowBeaconDialog(false)}
            className="w-full mt-2 py-1 text-xs text-slate-400 hover:text-slate-300"
          >
            Cancel
          </button>
        </motion.div>
      )}

      {/* Content Container */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-300">{subtitle}</p>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>

        {/* Branch Links */}
        {branchLinks && branchLinks.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Learn More
            </h4>
            <div className="flex flex-wrap gap-3">
              {branchLinks.map((link, idx) => {
                const isExternal = link.href.startsWith('http');
                if (isExternal) {
                  return (
                    <a
                      key={idx}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                    >
                      <span className="text-sm text-white/80 group-hover:text-white">{link.label}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                    </a>
                  );
                }
                return (
                  <Link
                    key={idx}
                    to={link.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                  >
                    <span className="text-sm text-white/80 group-hover:text-white">{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Benefit Unlock Animation */}
        {benefit && hasUnlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.5 }}
            className="mt-6 p-3 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30"
          >
            <div className="flex items-center gap-2 text-primary">
              <span className="text-lg">✨</span>
              <span className="font-medium">Benefit Unlocked:</span>
              <span className="text-white/80">{benefit.text}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll Indicator (if not last) */}
      {!isLast && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-white/30" />
        </motion.div>
      )}
    </motion.section>
  );
}

export function ProgressiveContainer({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Vertical Progress Line */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
}
