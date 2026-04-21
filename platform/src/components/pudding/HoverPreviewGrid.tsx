import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GridItem {
  id: string;
  icon?: string;
  image?: string;
  label: string;
  category?: string;
  color?: string;
  description?: string;
  onClick?: () => void;
}

interface HoverPreviewGridProps {
  items: GridItem[];
  columns?: number;
  searchable?: boolean;
  filterable?: boolean;
  categories?: string[];
  onItemClick?: (item: GridItem) => void;
}

export function HoverPreviewGrid({
  items,
  columns = 8,
  searchable = true,
  filterable = true,
  categories = [],
  onItemClick
}: HoverPreviewGridProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<GridItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !activeFilter || item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const uniqueCategories = categories.length > 0
    ? categories
    : [...new Set(items.map(i => i.category).filter(Boolean))];

  const handleItemClick = (item: GridItem) => {
    if (selectedItem?.id === item.id) {
      setIsFlipped(!isFlipped);
    } else {
      setSelectedItem(item);
      setIsFlipped(false);
    }
    onItemClick?.(item);
    item.onClick?.();
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsFlipped(false);
  };

  return (
    <div className="my-8">
      {(searchable || filterable) && (
        <div className="flex flex-wrap gap-4 mb-6">
          {searchable && (
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          )}

          {filterable && uniqueCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !activeFilter
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat === activeFilter ? null : cat!)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeFilter === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${(filteredItems.length / items.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {filteredItems.length} / {items.length}
        </span>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {filteredItems.map((item) => (
          <motion.button
            key={item.id}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick(item)}
            className="relative aspect-square rounded-lg overflow-hidden transition-all hover:z-10"
            style={{ backgroundColor: item.color || '#f97316' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover"
              />
            ) : item.icon ? (
              <span className="text-2xl">{item.icon}</span>
            ) : (
              <span className="text-white text-xs font-bold">
                {item.label.substring(0, 2)}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {hoveredItem && !selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 min-w-[300px] pointer-events-none"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: hoveredItem.color || '#f97316' }}
              >
                {hoveredItem.image ? (
                  <img
                    src={hoveredItem.image}
                    alt={hoveredItem.label}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : hoveredItem.icon ? (
                  <span className="text-3xl">{hoveredItem.icon}</span>
                ) : (
                  <span className="text-white text-xl font-bold">
                    {hoveredItem.label.substring(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {hoveredItem.label}
                </h4>
                {hoveredItem.category && (
                  <span className="text-xs text-orange-500">{hoveredItem.category}</span>
                )}
                {hoveredItem.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {hoveredItem.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, rotateY: 0 }}
              animate={{ scale: 1, rotateY: isFlipped ? 180 : 0 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-[350px] h-[500px] cursor-pointer"
              style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(!isFlipped);
              }}
            >
              <div
                className={`absolute inset-0 rounded-2xl shadow-2xl overflow-hidden ${
                  isFlipped ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div
                  className="h-full flex flex-col"
                  style={{ backgroundColor: selectedItem.color || '#f97316' }}
                >
                  <div className="flex-1 flex items-center justify-center p-8">
                    {selectedItem.image ? (
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.label}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : selectedItem.icon ? (
                      <span className="text-9xl">{selectedItem.icon}</span>
                    ) : (
                      <span className="text-white text-6xl font-bold">
                        {selectedItem.label}
                      </span>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedItem.label}
                    </h3>
                    {selectedItem.category && (
                      <span className="inline-block mt-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm rounded-full">
                        {selectedItem.category}
                      </span>
                    )}
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                      Click to flip card
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`absolute inset-0 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 ${
                  isFlipped ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="h-full flex flex-col p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedItem.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 flex-1">
                    {selectedItem.description || 'No additional details available.'}
                  </p>
                  <div className="space-y-3 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectedItem.onClick?.();
                      }}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                      }}
                      className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                    >
                      Flip Back
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <button
              onClick={closeModal}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-2xl transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
