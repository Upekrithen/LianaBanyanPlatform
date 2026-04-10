import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { CatapultGauge } from '@/components/catapult/CatapultGauge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BriefingPage {
  page_number: number;
  title: string;
  description: string;
  icon: string;
}

interface CatapultMetric {
  id: string;
  entity_type: string;
  label: string;
  cp_score: number;
  current_value: number;
  target_value: number;
}

interface MissionBriefingProps {
  roleSlug: string;
  title: string;
  pages: BriefingPage[];
  catapultEntityTypes: string[];
  onClose: () => void;
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export function MissionBriefing({
  title,
  pages,
  catapultEntityTypes,
  onClose,
}: MissionBriefingProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [metrics, setMetrics] = useState<CatapultMetric[]>([]);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    async function fetchMetrics() {
      const { data, error } = await supabase
        .from('catapult_metrics')
        .select('id, entity_type, label, cp_score, current_value, target_value')
        .in('entity_type', catapultEntityTypes)
        .is('launched_at', null)
        .order('cp_score', { ascending: false });

      if (!error && data) {
        setMetrics(data as CatapultMetric[]);
      }
    }

    if (catapultEntityTypes.length > 0) {
      fetchMetrics();
    }
  }, [catapultEntityTypes]);

  const page = pages[currentPage];

  const goNext = () => {
    if (currentPage < pages.length - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  };

  const pageMetrics = metrics.filter((_, i) => i % pages.length === currentPage);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">
              Mission Briefing
            </p>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1 rounded border border-gray-700 hover:border-gray-500"
          >
            Close
          </button>
        </div>

        {/* Page content */}
        <div className="relative min-h-[400px] overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-amber-400/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded">
                  {page.page_number} / {pages.length}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{page.title}</h3>
              <p className="text-gray-400 mb-6">{page.description}</p>

              {pageMetrics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pageMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3"
                    >
                      <CatapultGauge
                        currentCP={metric.cp_score}
                        label={metric.label}
                      />
                      <button className="mt-2 w-full text-center text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/60 rounded-lg py-1.5 transition-colors">
                        Contribute
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No active metrics for this briefing page.</p>
                  <p className="text-sm mt-1">Check back as new items build momentum.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="flex gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentPage ? 1 : -1);
                  setCurrentPage(i);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentPage ? 'bg-amber-400' : 'bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={currentPage === pages.length - 1}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MissionBriefing;
