/**
 * CHEF MARKETPLACE
 * =================
 * Browse and hire member chefs for meal preparation.
 *
 * Features:
 * - Chef profiles with ratings and specialties
 * - Availability calendar
 * - Booking flow
 * - Reviews and portfolio
 * - Kindling tier badges
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChefHat, Star, MapPin, Calendar, Clock, Heart, Filter,
  Search, Grid, List, Check, X, Award, Flame, Shield,
  DollarSign, Users, MessageSquare, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Chef {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  bio: string;
  specialties: string[];
  cuisines: string[];
  rating: number;
  reviewCount: number;
  mealsServed: number;
  memberSince: string;
  location: string;
  distance: string;
  priceRange: { min: number; max: number };
  availability: string[];
  verified: boolean;
  kindlingTier: 'none' | 'ember' | 'flame' | 'blaze' | 'inferno';
  badges: string[];
  featured: boolean;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  meal: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════

const SAMPLE_CHEFS: Chef[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    avatar: '👩‍🍳',
    tagline: 'Bringing abuela\'s recipes to your table',
    bio: 'Third-generation cook specializing in authentic Mexican and Tex-Mex cuisine. Every meal tells a story.',
    specialties: ['Family Meals', 'Batch Cooking', 'Special Occasions'],
    cuisines: ['Mexican', 'Tex-Mex', 'Spanish'],
    rating: 4.9,
    reviewCount: 127,
    mealsServed: 892,
    memberSince: 'Jan 2025',
    location: 'East Side',
    distance: '0.8 mi',
    priceRange: { min: 12, max: 25 },
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
    verified: true,
    kindlingTier: 'flame',
    badges: ['Top Rated', 'Quick Response'],
    featured: true,
  },
  {
    id: '2',
    name: 'James Chen',
    avatar: '👨‍🍳',
    tagline: 'East meets West in every dish',
    bio: 'Classically trained with a passion for fusion. From dim sum to dumplings, I bring authentic Asian flavors home.',
    specialties: ['Dim Sum', 'Meal Prep', 'Cooking Classes'],
    cuisines: ['Chinese', 'Japanese', 'Korean', 'Thai'],
    rating: 4.8,
    reviewCount: 89,
    mealsServed: 654,
    memberSince: 'Mar 2025',
    location: 'Downtown',
    distance: '1.2 mi',
    priceRange: { min: 15, max: 30 },
    availability: ['Tue', 'Thu', 'Sat', 'Sun'],
    verified: true,
    kindlingTier: 'blaze',
    badges: ['Rising Star', 'Cooking Teacher'],
    featured: true,
  },
  {
    id: '3',
    name: 'Aisha Patel',
    avatar: '👩‍🍳',
    tagline: 'Spices that heal, flavors that thrill',
    bio: 'Ayurvedic-inspired cooking meets modern convenience. Healthy doesn\'t mean boring!',
    specialties: ['Healthy Meals', 'Vegetarian', 'Meal Plans'],
    cuisines: ['Indian', 'Mediterranean', 'Vegan'],
    rating: 5.0,
    reviewCount: 56,
    mealsServed: 423,
    memberSince: 'Jun 2025',
    location: 'West End',
    distance: '0.5 mi',
    priceRange: { min: 10, max: 22 },
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    verified: true,
    kindlingTier: 'ember',
    badges: ['Perfect Rating', 'Health Focus'],
    featured: false,
  },
  {
    id: '4',
    name: 'Roberto Moretti',
    avatar: '👨‍🍳',
    tagline: 'La dolce vita, one meal at a time',
    bio: 'Born in Naples, cooking in your kitchen. Fresh pasta, wood-fired flavors, and generations of tradition.',
    specialties: ['Italian Classics', 'Fresh Pasta', 'Special Events'],
    cuisines: ['Italian', 'Mediterranean'],
    rating: 4.7,
    reviewCount: 203,
    mealsServed: 1247,
    memberSince: 'Nov 2024',
    location: 'North Side',
    distance: '1.8 mi',
    priceRange: { min: 18, max: 35 },
    availability: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    verified: true,
    kindlingTier: 'inferno',
    badges: ['Most Experienced', 'Event Specialist'],
    featured: true,
  },
  {
    id: '5',
    name: 'Sarah Johnson',
    avatar: '👩‍🍳',
    tagline: 'Comfort food with a healthy twist',
    bio: 'Former restaurant chef turned home cook. I make the classics you love, but better for you.',
    specialties: ['Comfort Food', 'Kid-Friendly', 'Dietary Restrictions'],
    cuisines: ['American', 'Southern', 'Gluten-Free'],
    rating: 4.6,
    reviewCount: 78,
    mealsServed: 534,
    memberSince: 'Feb 2025',
    location: 'Suburbs',
    distance: '2.1 mi',
    priceRange: { min: 8, max: 18 },
    availability: ['Mon', 'Tue', 'Sat'],
    verified: true,
    kindlingTier: 'none',
    badges: ['Family Favorite'],
    featured: false,
  },
];

const CUISINES = ['All', 'Mexican', 'Italian', 'Asian', 'Indian', 'American', 'Mediterranean', 'Vegan'];

const KINDLING_TIERS = {
  none: { icon: '', label: '', color: '' },
  ember: { icon: '🔥', label: 'Ember Partner', color: 'orange-300' },
  flame: { icon: '🔥🔥', label: 'Flame Partner', color: 'orange-500' },
  blaze: { icon: '🔥🔥🔥', label: 'Blaze Partner', color: 'orange-600' },
  inferno: { icon: '🔥🔥🔥🔥', label: 'Inferno Partner', color: 'orange-700' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function KindlingBadge({ tier }: { tier: Chef['kindlingTier'] }) {
  if (tier === 'none') return null;
  const info = KINDLING_TIERS[tier];

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      `bg-${info.color}/20 text-${info.color}`
    )}
    style={{
      backgroundColor: tier === 'ember' ? 'rgba(253, 186, 116, 0.2)' :
                       tier === 'flame' ? 'rgba(249, 115, 22, 0.2)' :
                       tier === 'blaze' ? 'rgba(234, 88, 12, 0.2)' :
                       'rgba(194, 65, 12, 0.2)',
      color: tier === 'ember' ? '#fdba74' :
             tier === 'flame' ? '#f97316' :
             tier === 'blaze' ? '#ea580c' :
             '#c2410c',
    }}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </div>
  );
}

function ChefCard({
  chef,
  onSelect,
  isCompact = false,
}: {
  chef: Chef;
  onSelect: (chef: Chef) => void;
  isCompact?: boolean;
}) {
  if (isCompact) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => onSelect(chef)}
        className="p-3 rounded-lg bg-white/5 border border-white/15 hover:border-white/30 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">{chef.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">{chef.name}</span>
              {chef.verified && <Shield className="h-3 w-3 text-emerald-400" />}
            </div>
            <div className="text-xs text-white/60 truncate">{chef.cuisines.join(' • ')}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
              <span className="text-sm font-medium">{chef.rating}</span>
            </div>
            <div className="text-xs text-white/50">${chef.priceRange.min}-{chef.priceRange.max}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl bg-white/5 border border-white/15 overflow-hidden hover:border-white/30 transition-all"
    >
      {/* Featured Badge */}
      {chef.featured && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 text-center">
          <span className="text-xs font-medium text-purple-300">⭐ Featured Chef</span>
        </div>
      )}

      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{chef.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-lg">{chef.name}</h3>
              {chef.verified && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                  <Shield className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 mt-1">{chef.tagline}</p>

            {/* Kindling Badge */}
            {chef.kindlingTier !== 'none' && (
              <div className="mt-2">
                <KindlingBadge tier={chef.kindlingTier} />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-medium text-white">{chef.rating}</span>
            <span className="text-white/50">({chef.reviewCount})</span>
          </div>
          <div className="text-white/60">
            {chef.mealsServed} meals served
          </div>
        </div>

        {/* Cuisines */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {chef.cuisines.map((cuisine) => (
            <span
              key={cuisine}
              className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs"
            >
              {cuisine}
            </span>
          ))}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {chef.specialties.map((specialty) => (
            <span
              key={specialty}
              className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <MapPin className="h-4 w-4" />
            <span>{chef.location}</span>
            <span className="text-white/40">•</span>
            <span>{chef.distance}</span>
          </div>
          <div className="text-xs text-white/50 mt-1">
            Available: {chef.availability.join(', ')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            ${chef.priceRange.min}-{chef.priceRange.max}
          </div>
          <div className="text-xs text-white/50">per meal</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-white/10">
        <button
          onClick={() => onSelect(chef)}
          className="flex-1 py-3 text-center font-medium text-purple-300 hover:bg-purple-500/10 transition-all"
        >
          View Profile
        </button>
        <button
          onClick={() => onSelect(chef)}
          className="flex-1 py-3 text-center font-medium bg-purple-500 text-white hover:bg-purple-600 transition-all"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}

function ChefProfile({
  chef,
  onBook,
  onClose,
}: {
  chef: Chef;
  onBook: () => void;
  onClose: () => void;
}) {
  const sampleReviews: Review[] = [
    {
      id: '1',
      author: 'Jennifer M.',
      rating: 5,
      date: '2 weeks ago',
      text: 'Absolutely incredible! The flavors were authentic and the portions were generous.',
      meal: 'Family Dinner Package',
    },
    {
      id: '2',
      author: 'Michael T.',
      rating: 5,
      date: '1 month ago',
      text: 'Best meal prep service I\'ve ever used. Will definitely book again!',
      meal: 'Weekly Meal Prep',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Chef Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="text-6xl">{chef.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-2xl font-bold text-white">{chef.name}</h3>
                {chef.verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                    <Shield className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-white/70 mt-1">{chef.tagline}</p>
              {chef.kindlingTier !== 'none' && (
                <div className="mt-2">
                  <KindlingBadge tier={chef.kindlingTier} />
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="font-semibold text-white mb-2">About</h4>
            <p className="text-white/70">{chef.bio}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="font-bold">{chef.rating}</span>
              </div>
              <div className="text-xs text-white/50">Rating</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="font-bold text-white mb-1">{chef.reviewCount}</div>
              <div className="text-xs text-white/50">Reviews</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="font-bold text-white mb-1">{chef.mealsServed}</div>
              <div className="text-xs text-white/50">Meals Served</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="font-bold text-white mb-1">{chef.memberSince}</div>
              <div className="text-xs text-white/50">Member Since</div>
            </div>
          </div>

          {/* Badges */}
          {chef.badges.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {chef.badges.map((badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm"
                  >
                    <Award className="h-3 w-3" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h4 className="font-semibold text-white mb-3">Recent Reviews</h4>
            <div className="space-y-3">
              {sampleReviews.map((review) => (
                <div key={review.id} className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{review.author}</span>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-white/50">{review.date}</span>
                  </div>
                  <p className="text-sm text-white/70">{review.text}</p>
                  <div className="text-xs text-white/50 mt-1">Ordered: {review.meal}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80">Price Range</span>
              <span className="text-xl font-bold text-white">
                ${chef.priceRange.min} - ${chef.priceRange.max}
              </span>
            </div>
            <div className="text-sm text-white/60">
              Per meal • Chef keeps 83.3%
            </div>
          </div>

          {/* Book Button */}
          <button
            onClick={onBook}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition-all"
          >
            Book {chef.name}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ChefMarketplaceProps {
  onBookChef?: (chef: Chef) => void;
  className?: string;
}

export function ChefMarketplace({ onBookChef, className }: ChefMarketplaceProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [kindlingOnly, setKindlingOnly] = useState(false);

  const filteredChefs = SAMPLE_CHEFS.filter((chef) => {
    if (cuisineFilter !== 'All' && !chef.cuisines.includes(cuisineFilter)) return false;
    if (kindlingOnly && chef.kindlingTier === 'none') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        chef.name.toLowerCase().includes(query) ||
        chef.cuisines.some((c) => c.toLowerCase().includes(query)) ||
        chef.specialties.some((s) => s.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleBook = (chef: Chef) => {
    onBookChef?.(chef);
    setSelectedChef(null);
  };

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search chefs, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKindlingOnly(!kindlingOnly)}
            className={cn(
              "px-3 py-2 rounded-lg flex items-center gap-2 transition-all",
              kindlingOnly
                ? "bg-orange-500/20 border border-orange-500 text-orange-300"
                : "bg-white/5 border border-white/20 text-white/70 hover:border-white/40"
            )}
          >
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Kindling Partners</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-3 py-2 rounded-lg flex items-center gap-2 transition-all",
              showFilters
                ? "bg-purple-500/20 border border-purple-500 text-purple-300"
                : "bg-white/5 border border-white/20 text-white/70 hover:border-white/40"
            )}
          >
            <Filter className="h-4 w-4" />
          </button>

          <div className="flex rounded-lg overflow-hidden border border-white/20">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 transition-all",
                viewMode === 'grid' ? "bg-purple-500 text-white" : "bg-white/5 text-white/60"
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 transition-all",
                viewMode === 'list' ? "bg-purple-500 text-white" : "bg-white/5 text-white/60"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/15">
              <label className="text-sm text-white/60 mb-2 block">Cuisine</label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setCuisineFilter(cuisine)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all",
                      cuisineFilter === cuisine
                        ? "bg-purple-500 text-white"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="text-sm text-white/60 mb-4">
        {filteredChefs.length} chef{filteredChefs.length !== 1 ? 's' : ''} available
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChefs.map((chef) => (
            <ChefCard key={chef.id} chef={chef} onSelect={setSelectedChef} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChefs.map((chef) => (
            <ChefCard key={chef.id} chef={chef} onSelect={setSelectedChef} isCompact />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredChefs.length === 0 && (
        <div className="text-center py-16">
          <ChefHat className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Chefs Found</h3>
          <p className="text-white/60 mb-4">Try adjusting your filters</p>
          <button
            onClick={() => {
              setCuisineFilter('All');
              setKindlingOnly(false);
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Chef Profile Modal */}
      <AnimatePresence>
        {selectedChef && (
          <ChefProfile
            chef={selectedChef}
            onBook={() => handleBook(selectedChef)}
            onClose={() => setSelectedChef(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChefMarketplace;
