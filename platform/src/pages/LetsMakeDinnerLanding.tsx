/**
 * LET'S MAKE DINNER — Progressive Disclosure Landing Page
 * ========================================================
 * 4-Layer reveal system for the meal ecosystem.
 * 
 * Layer 1: Hero — What is this?
 * Layer 2: How It Works — Three ways to eat
 * Layer 3: Grocery Boxes — The core innovation
 * Layer 4: Join the Network — Producer pathways
 * 
 * Benefits accumulate as user scrolls, building the value proposition.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { BenefitCard, useBenefitAccumulator, type BenefitItem } from "@/components/progressive/BenefitCard";
import { ProgressiveSection, ProgressiveContainer } from "@/components/progressive/ProgressiveSection";
import {
  ChefHat, Clock, MapPin, Users, Heart, ArrowLeft, ArrowRight, ArrowDown,
  Calendar, HelpCircle, Target, Search, ShoppingCart, Coins, Package,
  Utensils, Home, Building2, Flame, Sparkles, Check, Gift, Star,
  DollarSign, Timer, Leaf, RefreshCw, Play, ChevronDown, EyeOff
} from "lucide-react";
import { AnonymousVolumeExplainer } from "@/components/AnonymousVolumeExplainer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import '@/styles/landing.css';

// ═══════════════════════════════════════════════════════════════════════════════
// BENEFIT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const LAYER_BENEFITS: Record<number, BenefitItem[]> = {
  1: [
    { id: 'lmd-1', text: 'Access to home-cooked meals from verified neighbors', category: 'all' },
    { id: 'lmd-2', text: 'Dynamic pricing: $5 preorder → $10 day-before → $15 rush', category: 'all' },
  ],
  2: [
    { id: 'lmd-3', text: 'DIY Grocery Boxes with pre-cut ingredients', category: 'all' },
    { id: 'lmd-4', text: 'Group Cook sessions at community kitchens', category: 'all' },
    { id: 'lmd-5', text: 'Chef-prepared meals delivered hot', category: 'all' },
  ],
  3: [
    { id: 'lmd-6', text: 'Meal chains that eliminate food waste', category: 'all' },
    { id: 'lmd-7', text: 'Refrigerator shelf-compatible box design', category: 'all' },
    { id: 'lmd-8', text: 'Cost+20% ingredient pricing (no hidden markups)', category: 'all' },
  ],
  4: [
    { id: 'lmd-9', text: 'Become a certified chef — keep 83.3%', category: 'business' },
    { id: 'lmd-10', text: 'Restaurants & food trucks: new customers + Kindling badges', category: 'business' },
    { id: 'lmd-11', text: 'Start a Potluck Pod with neighbors', category: 'all' },
    { id: 'lmd-12', text: 'Register your kitchen as a community facility', category: 'business' },
    { id: 'lmd-13', text: 'Emergency meal support network access', category: 'all' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function PriceTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tiers = [
    { price: '$5', label: 'Preorder', time: '48+ hours ahead', color: 'emerald', icon: Calendar },
    { price: '$10', label: 'Day Before', time: '6-48 hours', color: 'amber', icon: Clock },
    { price: '$15', label: 'Rush', time: 'Under 6 hours', color: 'rose', icon: Timer },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
      {tiers.map((tier, idx) => {
        const Icon = tier.icon;
        const isActive = idx === activeIndex;
        return (
          <motion.div
            key={tier.label}
            animate={{
              scale: isActive ? 1.1 : 1,
              opacity: isActive ? 1 : 0.6,
            }}
            className={cn(
              "px-4 py-3 rounded-xl border-2 transition-all cursor-pointer",
              isActive 
                ? `bg-${tier.color}-500/20 border-${tier.color}-500/60` 
                : "bg-white/5 border-white/20"
            )}
            onClick={() => setActiveIndex(idx)}
            style={{
              backgroundColor: isActive ? `rgba(${tier.color === 'emerald' ? '52, 211, 153' : tier.color === 'amber' ? '251, 191, 36' : '244, 63, 94'}, 0.2)` : 'rgba(255,255,255,0.05)',
              borderColor: isActive ? `rgba(${tier.color === 'emerald' ? '52, 211, 153' : tier.color === 'amber' ? '251, 191, 36' : '244, 63, 94'}, 0.6)` : 'rgba(255,255,255,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn("h-4 w-4", isActive && "animate-pulse")} 
                style={{ color: tier.color === 'emerald' ? '#34d399' : tier.color === 'amber' ? '#fbbf24' : '#f43f5e' }} />
              <span className="text-2xl font-bold" 
                style={{ color: tier.color === 'emerald' ? '#34d399' : tier.color === 'amber' ? '#fbbf24' : '#f43f5e' }}>
                {tier.price}
              </span>
            </div>
            <div className="text-sm text-white/70">{tier.label}</div>
            <div className="text-xs text-white/50">{tier.time}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MealChainAnimation() {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const chain = [
    { day: 'Sunday', meal: 'Roast Chicken', icon: '🍗', leftover: 'chicken' },
    { day: 'Monday', meal: 'Chicken Sandwiches', icon: '🥪', leftover: 'bones' },
    { day: 'Tuesday', meal: 'Chicken Soup', icon: '🍲', leftover: 'none' },
  ];

  return (
    <div className="relative py-8">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {chain.map((item, idx) => (
          <motion.div
            key={item.day}
            initial={{ opacity: 0.4, scale: 0.9 }}
            animate={{
              opacity: step >= idx ? 1 : 0.4,
              scale: step >= idx ? 1 : 0.9,
              y: step === idx ? -8 : 0,
            }}
            className="relative"
          >
            <div className={cn(
              "w-32 p-4 rounded-xl border-2 text-center transition-all",
              step === idx ? "bg-purple-500/20 border-purple-500/60" : "bg-white/5 border-white/20"
            )}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-white">{item.day}</div>
              <div className="text-sm text-white/70">{item.meal}</div>
            </div>
            {idx < chain.length - 1 && (
              <motion.div
                className="absolute -right-4 top-1/2 -translate-y-1/2"
                animate={{ opacity: step > idx ? 1 : 0.3 }}
              >
                <ArrowRight className="h-6 w-6 text-purple-400" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="text-center mt-4 text-sm"
        animate={{ opacity: step === 3 ? 1 : 0.5 }}
      >
        <span className="text-emerald-400 font-semibold">Zero waste</span>
        <span className="text-white/60 ml-2">— Every ingredient has a purpose</span>
      </motion.div>
    </div>
  );
}

function ThreePathsSelector({ onSelect }: { onSelect: (path: string) => void }) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const paths = [
    {
      id: 'diy',
      title: 'DIY Cold Box',
      subtitle: 'You cook, your schedule',
      icon: Package,
      color: 'emerald',
      features: ['Pre-cut ingredients', '20-30 min prep', 'Recipe cards included'],
      bestFor: 'Home cooks who hate planning',
    },
    {
      id: 'group',
      title: 'Group Cook',
      subtitle: 'Share the work, share the food',
      icon: Users,
      color: 'purple',
      features: ['Community kitchen sessions', 'Cook alongside neighbors', 'Take home multiple meals'],
      bestFor: 'Social cooks, busy families',
    },
    {
      id: 'chef',
      title: 'Chef Prepared',
      subtitle: 'Hot meal, ready to eat',
      icon: ChefHat,
      color: 'amber',
      features: ['Member chef prepares', 'Delivered hot', 'Zero prep time'],
      bestFor: 'Time-crunched families',
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {paths.map((path) => {
        const Icon = path.icon;
        const isHovered = hoveredPath === path.id;
        const colorMap = {
          emerald: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.5)', text: '#34d399' },
          purple: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.5)', text: '#a855f7' },
          amber: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.5)', text: '#fbbf24' },
        };
        const colors = colorMap[path.color as keyof typeof colorMap];

        return (
          <motion.div
            key={path.id}
            onMouseEnter={() => setHoveredPath(path.id)}
            onMouseLeave={() => setHoveredPath(null)}
            onClick={() => onSelect(path.id)}
            whileHover={{ scale: 1.02, y: -4 }}
            className="cursor-pointer"
          >
            <div
              className="h-full p-6 rounded-2xl border-2 transition-all"
              style={{
                backgroundColor: isHovered ? colors.bg : 'rgba(255,255,255,0.05)',
                borderColor: isHovered ? colors.border : 'rgba(255,255,255,0.15)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: colors.bg }}
                >
                  <Icon className="h-6 w-6" style={{ color: colors.text }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{path.title}</h3>
                  <p className="text-sm text-white/60">{path.subtitle}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {path.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4" style={{ color: colors.text }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/10">
                <div className="text-xs text-white/50 mb-1">Best for:</div>
                <div className="text-sm text-white/80">{path.bestFor}</div>
              </div>

              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
              >
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function GroceryBoxVisual() {
  const sizes = [
    { name: 'Single', serves: 1, meals: '3-4', icon: '👤' },
    { name: 'Couple', serves: 2, meals: '3-4', icon: '👫' },
    { name: 'Family', serves: 4, meals: '3-4', icon: '👨‍👩‍👧‍👦' },
    { name: 'Extended', serves: 8, meals: '3-4', icon: '🏠' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {sizes.map((size, idx) => (
        <motion.div
          key={size.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="p-4 rounded-xl bg-white/5 border border-white/15 text-center hover:bg-white/10 transition-all"
        >
          <div className="text-3xl mb-2">{size.icon}</div>
          <div className="font-bold text-white">{size.name}</div>
          <div className="text-sm text-white/60">Serves {size.serves}</div>
          <div className="text-xs text-purple-400 mt-1">{size.meals} meals</div>
        </motion.div>
      ))}
    </div>
  );
}

function ProducerPathways({ onNavigate }: { onNavigate: (path: string) => void }) {
  const pathways = [
    {
      id: 'chef',
      title: 'Become a Chef',
      description: 'Get certified, set your prices, keep 83.3%',
      icon: ChefHat,
      color: 'rose',
      stats: '$500-2,000/week potential',
      cta: 'Get Certified',
    },
    {
      id: 'restaurant',
      title: 'Restaurant / Food Truck',
      description: 'Already have a business? Join the network',
      icon: Utensils,
      color: 'amber',
      stats: 'New customers + Kindling badges',
      cta: 'Register Business',
    },
    {
      id: 'pod',
      title: 'Start a Potluck Pod',
      description: 'Form a neighborhood cooking network',
      icon: Users,
      color: 'purple',
      stats: 'Cook 1 day, eat 7 cuisines',
      cta: 'Find Neighbors',
    },
    {
      id: 'kitchen',
      title: 'Register a Kitchen',
      description: 'Church, community center, or home',
      icon: Building2,
      color: 'emerald',
      stats: 'Earn hosting fees',
      cta: 'Register Facility',
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
      {pathways.map((path) => {
        const Icon = path.icon;
        const colorMap = {
          rose: { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.5)', text: '#f43f5e' },
          amber: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.5)', text: '#fbbf24' },
          purple: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.5)', text: '#a855f7' },
          emerald: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.5)', text: '#34d399' },
        };
        const colors = colorMap[path.color as keyof typeof colorMap];

        return (
          <motion.div
            key={path.id}
            whileHover={{ scale: 1.02 }}
            className="p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-solid"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
            }}
            onClick={() => onNavigate(path.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/10">
                <Icon className="h-6 w-6" style={{ color: colors.text }} />
              </div>
              <div>
                <h3 className="font-bold text-white">{path.title}</h3>
                <p className="text-sm text-white/60">{path.description}</p>
              </div>
            </div>
            <div className="text-sm font-medium mb-4" style={{ color: colors.text }}>
              {path.stats}
            </div>
            <button
              className="w-full py-2 px-4 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            >
              {path.cta} <ArrowRight className="h-4 w-4 inline ml-1" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function LetsMakeDinnerLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { benefits, addBenefits } = useBenefitAccumulator();
  const [currentLayer, setCurrentLayer] = useState(1);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);

  const layer1InView = useInView(layer1Ref, { margin: "-40% 0px" });
  const layer2InView = useInView(layer2Ref, { margin: "-40% 0px" });
  const layer3InView = useInView(layer3Ref, { margin: "-40% 0px" });
  const layer4InView = useInView(layer4Ref, { margin: "-40% 0px" });

  useEffect(() => {
    if (layer4InView) {
      setCurrentLayer(4);
      addBenefits(LAYER_BENEFITS[4]);
    } else if (layer3InView) {
      setCurrentLayer(3);
      addBenefits(LAYER_BENEFITS[3]);
    } else if (layer2InView) {
      setCurrentLayer(2);
      addBenefits(LAYER_BENEFITS[2]);
    } else if (layer1InView) {
      setCurrentLayer(1);
      addBenefits(LAYER_BENEFITS[1]);
    }
  }, [layer1InView, layer2InView, layer3InView, layer4InView]);

  const scrollToLayer = (layer: number) => {
    const refs = [layer1Ref, layer2Ref, layer3Ref, layer4Ref];
    refs[layer - 1]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/?view=initiatives')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Initiatives</span>
          </button>

          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-purple-400" />
            <span className="font-bold text-white">Let's Make Dinner</span>
          </div>

          <button
            onClick={() => navigate('/initiatives/lets-make-dinner')}
            className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all"
          >
            Browse Meals
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-2">
          {[1, 2, 3, 4].map((layer) => (
            <button
              key={layer}
              onClick={() => scrollToLayer(layer)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentLayer >= layer ? "bg-purple-400 w-4" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LAYER 1: HERO — What is this? */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={layer1Ref}
        className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 mb-8">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm">Part of the Sweet Sixteen Initiatives</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            What if dinner was
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              already figured out?
            </span>
          </h1>

          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Home-cooked meals from your neighbors. Pre-cut ingredients in refrigerator-ready boxes.
            Group cooking sessions. Chefs keep <span className="text-emerald-400 font-semibold">83.3%</span>.
          </p>

          {/* Dynamic Pricing Display */}
          <div className="mb-12">
            <p className="text-sm text-white/50 mb-4">Order early, save more:</p>
            <PriceTimeline />
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="cursor-pointer"
            onClick={() => scrollToLayer(2)}
          >
            <ChevronDown className="h-8 w-8 text-white/40 mx-auto" />
            <span className="text-sm text-white/40">Scroll to discover</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LAYER 2: HOW IT WORKS — Three ways to eat */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={layer2Ref}
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          className="w-full max-w-6xl"
        >
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">
              Layer 2 of 4
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
              Three Ways to Eat
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Choose your level of involvement. All paths lead to great food.
            </p>
          </div>

          <ThreePathsSelector onSelect={(path) => {
            if (path === 'diy') navigate('/initiatives/lets-get-groceries');
            else if (path === 'group') navigate('/initiatives/family-table');
            else navigate('/initiatives/lets-make-dinner');
          }} />

          {/* Cost Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/15 max-w-3xl mx-auto"
          >
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              Cost Comparison (Family of 4, per meal)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { method: 'Traditional', cost: '$8-12', time: '60-90 min', waste: '20-30%' },
                { method: 'DIY Box', cost: '$7-10', time: '20-30 min', waste: '<5%' },
                { method: 'Group Cook', cost: '$5-8', time: '45-60 min', waste: '<2%' },
                { method: 'Chef Prep', cost: '$12-18', time: '0 min', waste: '0%' },
              ].map((item) => (
                <div key={item.method} className="p-3 rounded-lg bg-white/5">
                  <div className="font-medium text-white mb-1">{item.method}</div>
                  <div className="text-emerald-400 font-bold">{item.cost}</div>
                  <div className="text-xs text-white/50">{item.time}</div>
                  <div className="text-xs text-white/50">{item.waste} waste</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LAYER 3: GROCERY BOXES — The core innovation */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={layer3Ref}
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          className="w-full max-w-6xl"
        >
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">
              Layer 3 of 4
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
              The Grocery Box Innovation
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Refrigerator shelf-compatible. Pre-cut ingredients. Zero waste meal chains.
            </p>
          </div>

          {/* Box Sizes */}
          <GroceryBoxVisual />

          {/* Meal Chain Animation */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              The Meal Chain Concept
            </h3>
            <MealChainAnimation />
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            {[
              { icon: Package, title: 'Shelf-Ready', desc: 'Fits standard refrigerator shelves' },
              { icon: Leaf, title: 'Zero Waste', desc: 'Meal chains use every ingredient' },
              { icon: DollarSign, title: 'Cost+20%', desc: 'No hidden markups, ever' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-4 rounded-xl bg-white/5 border border-white/15 text-center"
                >
                  <Icon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Anonymous Volume Aggregation — Why This Changes Everything */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <EyeOff className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Anonymous Volume Aggregation</h3>
            </div>
            <p className="text-white/70 mb-4">
              When multiple orders go to the same restaurant, the platform batches them into one
              volume order. The restaurant sees volume, not individuals. Charity recipients are
              indistinguishable from paying customers. Dignity intact.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">3x</div>
                <div className="text-sm text-white/60">More food per $10 donation at volume pricing</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">83.3%</div>
                <div className="text-sm text-white/60">Goes to the restaurant. No 30% platform cut.</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">Zero</div>
                <div className="text-sm text-white/60">Means testing. No shame. No gatekeeping.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LAYER 4: JOIN THE NETWORK — Producer pathways */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={layer4Ref}
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          className="w-full max-w-6xl"
        >
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">
              Layer 4 of 4
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
              Join the Network
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Don't just eat — participate. Build a micro-business, start a pod, or host sessions.
            </p>
          </div>

          <ProducerPathways onNavigate={(path) => {
            if (path === 'chef') navigate('/initiatives/lets-make-dinner/become-chef');
            else if (path === 'restaurant') navigate('/initiatives/lets-make-dinner/register-business');
            else if (path === 'pod') navigate('/initiatives/family-table/start-pod');
            else navigate('/initiatives/lets-make-dinner/register-kitchen');
          }} />

          {/* The Cold Start Progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50 mb-3">
                The Cold Start Guide
              </Badge>
              <h3 className="text-2xl font-bold text-white mb-2">
                Share Knowledge, Save Money, and Knock Out 3 Meals a Week
              </h3>
              <p className="text-white/70">
                You don't have to think about dinner anymore. Here is how you start a local Chef Circle using communal kitchens and the Family Table.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">1</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Potluck & Prep (The First Meeting)</h4>
                  <p className="text-sm text-white/70">
                    Meet at a communal kitchen. Share a potluck meal. Afterward, everyone preps one meal together to take home. 
                    <strong> Costs are prepaid and shared.</strong> You just eat, chop veggies, and leave with tomorrow's dinner.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold">2</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Ramp Up (3-6 Meals a Week)</h4>
                  <p className="text-sm text-white/70">
                    Once the weekly day is set, get ambitious. Spend 2 hours together and prep 3 to 6 meals for every family to take home. 
                    Take turns leading the Chef Circle. No one is selling anything yet—just sharing costs and results.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">3</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">The Business (Selling to the Neighborhood)</h4>
                  <p className="text-sm text-white/70">
                    Turn your group's efficiency into a business. Sell advance subscriptions to neighbors: 
                    <em> "Next week we make Mack's HotHouse Burgers with 3 sides. $5/serving if you subscribe for 4 weeks, or $10/serving one-off."</em>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-white/60 mb-4">Ready to transform how you eat?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/initiatives/lets-make-dinner')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition-all"
              >
                Browse Available Meals
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all"
              >
                Join for $5/year
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-white/40 text-sm border-t border-white/10">
        <p>© 2026 Liana Banyan Corporation</p>
        <p className="mt-1">Crown: Maneet Chauhan</p>
      </footer>

      {/* Benefits Card (Fixed) */}
      {benefits.length > 0 && (
        <BenefitCard
          benefits={benefits}
          currentSection={currentLayer}
          totalSections={4}
          isExpanded={benefitsExpanded}
          onToggleExpand={() => setBenefitsExpanded(!benefitsExpanded)}
          onJoinClick={() => navigate('/auth')}
        />
      )}
    </div>
  );
}
