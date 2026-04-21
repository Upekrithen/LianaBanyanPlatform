/**
 * GROCERY BOX CONFIGURATOR
 * =========================
 * Visual tool for selecting box size and previewing meal chains.
 *
 * Features:
 * - Size selector with visual representation
 * - Meal chain preview showing ingredient flow
 * - Dietary preference filters
 * - Cost calculator
 * - Delivery/pickup options
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Package, Users, Calendar, Clock, MapPin, Leaf, AlertTriangle,
  ChevronRight, ChevronDown, Check, X, ShoppingCart, Truck,
  Home, RefreshCw, Flame, Sparkles, DollarSign, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface BoxSize {
  id: string;
  name: string;
  serves: number;
  meals: number;
  icon: string;
  dimensions: string;
  priceRange: string;
  description: string;
}

interface MealChain {
  id: string;
  name: string;
  cuisine: string;
  meals: MealInChain[];
  totalIngredients: number;
  wastePercent: number;
  prepTimeTotal: string;
}

interface MealInChain {
  day: string;
  name: string;
  icon: string;
  prepTime: string;
  usesLeftovers: string[];
  producesLeftovers: string[];
}

interface DietaryPreference {
  id: string;
  label: string;
  icon: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const BOX_SIZES: BoxSize[] = [
  {
    id: 'single',
    name: 'Single',
    serves: 1,
    meals: 4,
    icon: '👤',
    dimensions: 'Standard shelf',
    priceRange: '$28-35',
    description: 'Perfect for one person, 4 connected meals',
  },
  {
    id: 'couple',
    name: 'Couple',
    serves: 2,
    meals: 4,
    icon: '👫',
    dimensions: 'Standard shelf',
    priceRange: '$45-55',
    description: 'Ideal for two, shared portions',
  },
  {
    id: 'family',
    name: 'Family',
    serves: 4,
    meals: 4,
    icon: '👨‍👩‍👧‍👦',
    dimensions: 'Standard shelf',
    priceRange: '$65-80',
    description: 'Family of four, kid-friendly options',
  },
  {
    id: 'extended',
    name: 'Extended',
    serves: 8,
    meals: 4,
    icon: '🏠',
    dimensions: 'Two shelves',
    priceRange: '$110-140',
    description: 'Large gatherings or meal prep',
  },
];

const SAMPLE_CHAINS: MealChain[] = [
  {
    id: 'comfort-classic',
    name: 'Comfort Classic',
    cuisine: 'American',
    totalIngredients: 18,
    wastePercent: 2,
    prepTimeTotal: '2.5 hours total',
    meals: [
      {
        day: 'Sunday',
        name: 'Roast Chicken',
        icon: '🍗',
        prepTime: '45 min',
        usesLeftovers: [],
        producesLeftovers: ['chicken meat', 'bones', 'drippings'],
      },
      {
        day: 'Monday',
        name: 'Chicken Sandwiches',
        icon: '🥪',
        prepTime: '15 min',
        usesLeftovers: ['chicken meat'],
        producesLeftovers: ['chicken scraps'],
      },
      {
        day: 'Tuesday',
        name: 'Chicken Soup',
        icon: '🍲',
        prepTime: '30 min',
        usesLeftovers: ['bones', 'chicken scraps', 'drippings'],
        producesLeftovers: [],
      },
      {
        day: 'Wednesday',
        name: 'Soup & Fresh Bread',
        icon: '🥖',
        prepTime: '20 min',
        usesLeftovers: ['soup base'],
        producesLeftovers: [],
      },
    ],
  },
  {
    id: 'mediterranean-week',
    name: 'Mediterranean Week',
    cuisine: 'Mediterranean',
    totalIngredients: 22,
    wastePercent: 3,
    prepTimeTotal: '3 hours total',
    meals: [
      {
        day: 'Sunday',
        name: 'Lamb Kofta',
        icon: '🍖',
        prepTime: '40 min',
        usesLeftovers: [],
        producesLeftovers: ['spiced lamb', 'herb mixture'],
      },
      {
        day: 'Monday',
        name: 'Pita Wraps',
        icon: '🌯',
        prepTime: '15 min',
        usesLeftovers: ['spiced lamb'],
        producesLeftovers: ['tzatziki', 'pickled veg'],
      },
      {
        day: 'Tuesday',
        name: 'Greek Salad Bowl',
        icon: '🥗',
        prepTime: '20 min',
        usesLeftovers: ['tzatziki', 'pickled veg', 'herb mixture'],
        producesLeftovers: ['feta crumbles'],
      },
      {
        day: 'Wednesday',
        name: 'Shakshuka',
        icon: '🍳',
        prepTime: '25 min',
        usesLeftovers: ['feta crumbles'],
        producesLeftovers: [],
      },
    ],
  },
  {
    id: 'asian-fusion',
    name: 'Asian Fusion',
    cuisine: 'Asian',
    totalIngredients: 20,
    wastePercent: 1,
    prepTimeTotal: '2 hours total',
    meals: [
      {
        day: 'Sunday',
        name: 'Teriyaki Salmon',
        icon: '🍣',
        prepTime: '30 min',
        usesLeftovers: [],
        producesLeftovers: ['teriyaki glaze', 'ginger-garlic base'],
      },
      {
        day: 'Monday',
        name: 'Salmon Rice Bowls',
        icon: '🍚',
        prepTime: '15 min',
        usesLeftovers: ['salmon flakes', 'teriyaki glaze'],
        producesLeftovers: ['seasoned rice'],
      },
      {
        day: 'Tuesday',
        name: 'Fried Rice',
        icon: '🥡',
        prepTime: '20 min',
        usesLeftovers: ['seasoned rice', 'ginger-garlic base'],
        producesLeftovers: ['crispy bits'],
      },
      {
        day: 'Wednesday',
        name: 'Miso Soup & Gyoza',
        icon: '🥟',
        prepTime: '25 min',
        usesLeftovers: ['ginger-garlic base', 'crispy bits'],
        producesLeftovers: [],
      },
    ],
  },
];

const DIETARY_PREFERENCES: DietaryPreference[] = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🥜' },
  { id: 'halal', label: 'Halal', icon: '☪️' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
  { id: 'low-carb', label: 'Low-Carb', icon: '🍞' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function BoxSizeSelector({
  selected,
  onSelect,
}: {
  selected: BoxSize | null;
  onSelect: (size: BoxSize) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {BOX_SIZES.map((size) => {
        const isSelected = selected?.id === size.id;
        return (
          <motion.div
            key={size.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(size)}
            className={cn(
              "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
              isSelected
                ? "bg-purple-500/20 border-purple-500"
                : "bg-white/5 border-white/20 hover:border-white/40"
            )}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
            <div className="text-center">
              <div className="text-4xl mb-2">{size.icon}</div>
              <div className="font-bold text-white">{size.name}</div>
              <div className="text-sm text-white/60">Serves {size.serves}</div>
              <div className="text-xs text-purple-400 mt-1">{size.meals} meals</div>
              <div className="text-sm font-semibold text-emerald-400 mt-2">
                {size.priceRange}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MealChainPreview({
  chain,
  isExpanded,
  onToggle,
}: {
  chain: MealChain;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-white/20 overflow-hidden"
    >
      <div
        onClick={onToggle}
        className="p-4 bg-white/5 cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {chain.meals.slice(0, 3).map((meal, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-lg border-2 border-slate-800"
              >
                {meal.icon}
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold text-white">{chain.name}</div>
            <div className="text-sm text-white/60">{chain.cuisine}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-emerald-400">{chain.wastePercent}% waste</div>
            <div className="text-xs text-white/50">{chain.prepTimeTotal}</div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-white/60" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-white/10">
              {/* Meal Chain Flow */}
              <div className="flex flex-col gap-4">
                {chain.meals.map((meal, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-start gap-4">
                      {/* Day indicator */}
                      <div className="w-24 flex-shrink-0">
                        <div className="text-xs text-white/50 uppercase">{meal.day}</div>
                        <div className="text-sm text-white/70">{meal.prepTime}</div>
                      </div>

                      {/* Meal card */}
                      <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{meal.icon}</span>
                          <span className="font-medium text-white">{meal.name}</span>
                        </div>

                        {/* Leftovers flow */}
                        {meal.usesLeftovers.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1">
                            <RefreshCw className="h-3 w-3" />
                            <span>Uses: {meal.usesLeftovers.join(', ')}</span>
                          </div>
                        )}
                        {meal.producesLeftovers.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-purple-400">
                            <ChevronRight className="h-3 w-3" />
                            <span>Produces: {meal.producesLeftovers.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connection line */}
                    {idx < chain.meals.length - 1 && (
                      <div className="absolute left-12 top-full h-4 w-px bg-gradient-to-b from-purple-500/50 to-transparent" />
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{chain.totalIngredients}</div>
                  <div className="text-xs text-white/50">Ingredients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{chain.wastePercent}%</div>
                  <div className="text-xs text-white/50">Food Waste</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{chain.meals.length}</div>
                  <div className="text-xs text-white/50">Meals</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DietaryFilter({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DIETARY_PREFERENCES.map((pref) => {
        const isSelected = selected.has(pref.id);
        return (
          <button
            key={pref.id}
            onClick={() => onToggle(pref.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all",
              isSelected
                ? "bg-purple-500/30 border border-purple-500 text-purple-300"
                : "bg-white/5 border border-white/20 text-white/70 hover:border-white/40"
            )}
          >
            <span>{pref.icon}</span>
            <span>{pref.label}</span>
            {isSelected && <X className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}

function DeliveryOptions({
  selected,
  onSelect,
}: {
  selected: 'delivery' | 'pickup' | 'group';
  onSelect: (option: 'delivery' | 'pickup' | 'group') => void;
}) {
  const options = [
    {
      id: 'delivery' as const,
      label: 'Home Delivery',
      icon: Truck,
      description: 'Delivered to your door',
      extra: '+$5-8',
    },
    {
      id: 'pickup' as const,
      label: 'Pickup',
      icon: MapPin,
      description: 'Collect from hub',
      extra: 'Free',
    },
    {
      id: 'group' as const,
      label: 'Group Cook',
      icon: Users,
      description: 'Bring to session',
      extra: 'Shared prep',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "p-3 rounded-xl border-2 transition-all text-left",
              isSelected
                ? "bg-purple-500/20 border-purple-500"
                : "bg-white/5 border-white/20 hover:border-white/40"
            )}
          >
            <Icon className={cn("h-5 w-5 mb-2", isSelected ? "text-purple-400" : "text-white/60")} />
            <div className="font-medium text-white text-sm">{option.label}</div>
            <div className="text-xs text-white/50">{option.description}</div>
            <div className={cn("text-xs mt-1", isSelected ? "text-purple-400" : "text-emerald-400")}>
              {option.extra}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GroceryBoxConfiguratorProps {
  onComplete?: (config: {
    size: BoxSize;
    chain: MealChain;
    dietary: string[];
    delivery: string;
  }) => void;
  className?: string;
}

export function GroceryBoxConfigurator({ onComplete, className }: GroceryBoxConfiguratorProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState<BoxSize | null>(null);
  const [expandedChain, setExpandedChain] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<MealChain | null>(null);
  const [dietaryPrefs, setDietaryPrefs] = useState<Set<string>>(new Set());
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup' | 'group'>('pickup');

  const toggleDietary = (id: string) => {
    setDietaryPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleComplete = () => {
    if (selectedSize && selectedChain) {
      onComplete?.({
        size: selectedSize,
        chain: selectedChain,
        dietary: Array.from(dietaryPrefs),
        delivery: deliveryOption,
      });
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedSize !== null;
    if (step === 2) return selectedChain !== null;
    return true;
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step >= s
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-white/40"
              )}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  "w-12 h-1 mx-1",
                  step > s ? "bg-purple-500" : "bg-white/10"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Choose Your Box Size
            </h2>
            <p className="text-white/60 text-center mb-6">
              All boxes fit standard refrigerator shelves
            </p>
            <BoxSizeSelector selected={selectedSize} onSelect={setSelectedSize} />

            {selectedSize && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center"
              >
                <p className="text-white/80">{selectedSize.description}</p>
                <p className="text-sm text-white/50 mt-1">
                  {selectedSize.dimensions} • {selectedSize.meals} connected meals
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Select a Meal Chain
            </h2>
            <p className="text-white/60 text-center mb-6">
              Each chain uses ingredients across multiple meals for zero waste
            </p>
            <div className="space-y-3">
              {SAMPLE_CHAINS.map((chain) => (
                <div key={chain.id}>
                  <MealChainPreview
                    chain={chain}
                    isExpanded={expandedChain === chain.id}
                    onToggle={() => {
                      setExpandedChain(expandedChain === chain.id ? null : chain.id);
                    }}
                  />
                  {expandedChain === chain.id && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedChain(chain)}
                      className={cn(
                        "w-full mt-2 py-2 rounded-lg font-medium transition-all",
                        selectedChain?.id === chain.id
                          ? "bg-purple-500 text-white"
                          : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                      )}
                    >
                      {selectedChain?.id === chain.id ? (
                        <>
                          <Check className="h-4 w-4 inline mr-2" />
                          Selected
                        </>
                      ) : (
                        'Select This Chain'
                      )}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Dietary Preferences
            </h2>
            <p className="text-white/60 text-center mb-6">
              Select any that apply (optional)
            </p>
            <DietaryFilter selected={dietaryPrefs} onToggle={toggleDietary} />

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                How would you like to receive your box?
              </h3>
              <DeliveryOptions selected={deliveryOption} onSelect={setDeliveryOption} />
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Your Box Summary
            </h2>
            <p className="text-white/60 text-center mb-6">
              Review your selection
            </p>

            <div className="space-y-4">
              {/* Size */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedSize?.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{selectedSize?.name} Box</div>
                      <div className="text-sm text-white/60">
                        Serves {selectedSize?.serves} • {selectedSize?.meals} meals
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {selectedSize?.priceRange}
                  </div>
                </div>
              </div>

              {/* Chain */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/15">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {selectedChain?.meals.slice(0, 4).map((meal, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-lg border-2 border-slate-800"
                      >
                        {meal.icon}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{selectedChain?.name}</div>
                    <div className="text-sm text-white/60">{selectedChain?.cuisine}</div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-emerald-400">
                    <Leaf className="h-4 w-4 inline mr-1" />
                    {selectedChain?.wastePercent}% waste
                  </div>
                  <div className="text-white/60">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {selectedChain?.prepTimeTotal}
                  </div>
                </div>
              </div>

              {/* Dietary & Delivery */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/15">
                <div className="flex flex-wrap gap-2 mb-3">
                  {dietaryPrefs.size > 0 ? (
                    Array.from(dietaryPrefs).map((pref) => {
                      const p = DIETARY_PREFERENCES.find((d) => d.id === pref);
                      return (
                        <span
                          key={pref}
                          className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs"
                        >
                          {p?.icon} {p?.label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-white/50 text-sm">No dietary restrictions</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  {deliveryOption === 'delivery' && <Truck className="h-4 w-4" />}
                  {deliveryOption === 'pickup' && <MapPin className="h-4 w-4" />}
                  {deliveryOption === 'group' && <Users className="h-4 w-4" />}
                  <span>
                    {deliveryOption === 'delivery' && 'Home Delivery (+$5-8)'}
                    {deliveryOption === 'pickup' && 'Pickup (Free)'}
                    {deliveryOption === 'group' && 'Group Cook Session'}
                  </span>
                </div>
              </div>

              {/* Cost+20% Notice */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2">
                <Info className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-emerald-300">
                  <strong>Cost+20% Pricing:</strong> You pay only ingredient cost plus 20% — no hidden markups, ever.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className={cn(
            "px-6 py-2 rounded-lg font-medium transition-all",
            step === 1
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all",
              canProceed()
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            )}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default GroceryBoxConfigurator;
