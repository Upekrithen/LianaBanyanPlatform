/**
 * GROUP COOK SESSION FINDER
 * ==========================
 * Find and join group cooking sessions at community kitchens.
 * 
 * Features:
 * - Map view of nearby sessions
 * - Schedule/calendar view
 * - Filter by cuisine, date, capacity
 * - Session details with host info
 * - Join/RSVP functionality
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Calendar, Clock, Users, ChefHat, Building2, Filter,
  ChevronRight, ChevronDown, Check, X, Star, Heart, Search,
  Grid, List, Map as MapIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, startOfWeek, addWeeks } from "date-fns";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CookSession {
  id: string;
  title: string;
  cuisine: string;
  date: Date;
  startTime: string;
  endTime: string;
  facility: Facility;
  host: Host;
  capacity: number;
  enrolled: number;
  mealsProduced: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  description: string;
  bringYourBox: boolean;
  costPerPerson: number;
}

interface Facility {
  id: string;
  name: string;
  type: 'church' | 'community' | 'school' | 'home';
  address: string;
  distance: string;
  rating: number;
  verified: boolean;
}

interface Host {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  sessionsHosted: number;
  specialties: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════

const SAMPLE_SESSIONS: CookSession[] = [
  {
    id: '1',
    title: 'Sunday Roast Masterclass',
    cuisine: 'American',
    date: addDays(new Date(), 2),
    startTime: '2:00 PM',
    endTime: '5:00 PM',
    facility: {
      id: 'f1',
      name: 'St. Mary\'s Church Kitchen',
      type: 'church',
      address: '123 Main St',
      distance: '0.8 mi',
      rating: 4.8,
      verified: true,
    },
    host: {
      id: 'h1',
      name: 'Maria G.',
      avatar: '👩‍🍳',
      rating: 4.9,
      sessionsHosted: 47,
      specialties: ['American', 'Italian'],
    },
    capacity: 8,
    enrolled: 5,
    mealsProduced: 4,
    skillLevel: 'beginner',
    tags: ['Family-Friendly', 'Bring Your Box'],
    description: 'Learn to make a perfect Sunday roast with all the trimmings. Great for beginners!',
    bringYourBox: true,
    costPerPerson: 8,
  },
  {
    id: '2',
    title: 'Mediterranean Feast',
    cuisine: 'Mediterranean',
    date: addDays(new Date(), 3),
    startTime: '6:00 PM',
    endTime: '9:00 PM',
    facility: {
      id: 'f2',
      name: 'Riverside Community Center',
      type: 'community',
      address: '456 Oak Ave',
      distance: '1.2 mi',
      rating: 4.6,
      verified: true,
    },
    host: {
      id: 'h2',
      name: 'Yusuf K.',
      avatar: '👨‍🍳',
      rating: 4.8,
      sessionsHosted: 23,
      specialties: ['Mediterranean', 'Middle Eastern'],
    },
    capacity: 12,
    enrolled: 9,
    mealsProduced: 6,
    skillLevel: 'intermediate',
    tags: ['Vegetarian Options', 'Cultural Exchange'],
    description: 'Explore the flavors of the Mediterranean with mezze, grilled meats, and fresh salads.',
    bringYourBox: true,
    costPerPerson: 12,
  },
  {
    id: '3',
    title: 'Asian Dumpling Workshop',
    cuisine: 'Asian',
    date: addDays(new Date(), 5),
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    facility: {
      id: 'f3',
      name: 'Lincoln Elementary Cafeteria',
      type: 'school',
      address: '789 School Rd',
      distance: '0.5 mi',
      rating: 4.5,
      verified: true,
    },
    host: {
      id: 'h3',
      name: 'Lin W.',
      avatar: '👩‍🍳',
      rating: 5.0,
      sessionsHosted: 89,
      specialties: ['Chinese', 'Japanese', 'Korean'],
    },
    capacity: 10,
    enrolled: 10,
    mealsProduced: 5,
    skillLevel: 'intermediate',
    tags: ['Hands-On', 'Take Home Extras'],
    description: 'Master the art of dumpling making - from wrapper to filling to perfect pleating.',
    bringYourBox: false,
    costPerPerson: 15,
  },
  {
    id: '4',
    title: 'Beginner\'s Bread Baking',
    cuisine: 'Baking',
    date: addDays(new Date(), 1),
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    facility: {
      id: 'f4',
      name: 'The Johnson Home Kitchen',
      type: 'home',
      address: '321 Elm St',
      distance: '0.3 mi',
      rating: 4.9,
      verified: true,
    },
    host: {
      id: 'h4',
      name: 'Sarah J.',
      avatar: '👩‍🍳',
      rating: 4.7,
      sessionsHosted: 15,
      specialties: ['Baking', 'French'],
    },
    capacity: 4,
    enrolled: 2,
    mealsProduced: 3,
    skillLevel: 'beginner',
    tags: ['Small Group', 'Artisan'],
    description: 'Learn to bake crusty artisan bread from scratch. Take home fresh loaves!',
    bringYourBox: false,
    costPerPerson: 10,
  },
];

const CUISINES = ['All', 'American', 'Mediterranean', 'Asian', 'Italian', 'Mexican', 'Baking', 'Indian'];
const SKILL_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SessionCard({
  session,
  onJoin,
  isCompact = false,
}: {
  session: CookSession;
  onJoin: (session: CookSession) => void;
  isCompact?: boolean;
}) {
  const spotsLeft = session.capacity - session.enrolled;
  const isFull = spotsLeft === 0;
  const facilityIcons = {
    church: '⛪',
    community: '🏛️',
    school: '🏫',
    home: '🏠',
  };

  if (isCompact) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="p-3 rounded-lg bg-white/5 border border-white/15 hover:border-white/30 transition-all cursor-pointer"
        onClick={() => !isFull && onJoin(session)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{session.host.avatar}</div>
            <div>
              <div className="font-medium text-white text-sm">{session.title}</div>
              <div className="text-xs text-white/60">
                {session.startTime} • {session.facility.name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-xs font-medium",
              isFull ? "text-rose-400" : spotsLeft <= 2 ? "text-amber-400" : "text-emerald-400"
            )}>
              {isFull ? 'Full' : `${spotsLeft} spots`}
            </div>
            <div className="text-xs text-white/50">${session.costPerPerson}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl bg-white/5 border border-white/15 overflow-hidden hover:border-white/30 transition-all"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-white text-lg">{session.title}</h3>
            <div className="text-sm text-white/60">{session.cuisine}</div>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            session.skillLevel === 'beginner' && "bg-emerald-500/20 text-emerald-400",
            session.skillLevel === 'intermediate' && "bg-amber-500/20 text-amber-400",
            session.skillLevel === 'advanced' && "bg-rose-500/20 text-rose-400",
          )}>
            {session.skillLevel}
          </div>
        </div>
        <p className="text-sm text-white/70 line-clamp-2">{session.description}</p>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-white/70">
            <Calendar className="h-4 w-4" />
            <span>{format(session.date, 'EEE, MMM d')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70">
            <Clock className="h-4 w-4" />
            <span>{session.startTime} - {session.endTime}</span>
          </div>
        </div>

        {/* Facility */}
        <div className="flex items-center gap-2 text-sm">
          <span>{facilityIcons[session.facility.type]}</span>
          <span className="text-white/80">{session.facility.name}</span>
          {session.facility.verified && (
            <span className="text-emerald-400 text-xs">✓ Verified</span>
          )}
          <span className="text-white/50 ml-auto">{session.facility.distance}</span>
        </div>

        {/* Host */}
        <div className="flex items-center gap-2">
          <div className="text-xl">{session.host.avatar}</div>
          <div>
            <div className="text-sm text-white/80">{session.host.name}</div>
            <div className="flex items-center gap-1 text-xs text-white/50">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span>{session.host.rating}</span>
              <span>•</span>
              <span>{session.host.sessionsHosted} sessions</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {session.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-white/60" />
            <span className={cn(
              "text-sm font-medium",
              isFull ? "text-rose-400" : spotsLeft <= 2 ? "text-amber-400" : "text-emerald-400"
            )}>
              {isFull ? 'Session Full' : `${spotsLeft} of ${session.capacity} spots left`}
            </span>
          </div>
          <div className="text-xs text-white/50 mt-0.5">
            {session.mealsProduced} meals per person
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">${session.costPerPerson}</div>
          <div className="text-xs text-white/50">per person</div>
        </div>
      </div>

      {/* Join Button */}
      <button
        onClick={() => onJoin(session)}
        disabled={isFull}
        className={cn(
          "w-full py-3 font-medium transition-all",
          isFull
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-purple-500 hover:bg-purple-600 text-white"
        )}
      >
        {isFull ? 'Join Waitlist' : 'Join Session'}
      </button>
    </motion.div>
  );
}

function CalendarView({
  sessions,
  selectedDate,
  onSelectDate,
  onJoin,
}: {
  sessions: CookSession[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onJoin: (session: CookSession) => void;
}) {
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSessionsForDay = (date: Date) =>
    sessions.filter((s) => isSameDay(s.date, date));

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSelectDate(addWeeks(selectedDate, -1))}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        >
          <ChevronRight className="h-5 w-5 rotate-180 text-white/60" />
        </button>
        <div className="text-white font-medium">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </div>
        <button
          onClick={() => onSelectDate(addWeeks(selectedDate, 1))}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        >
          <ChevronRight className="h-5 w-5 text-white/60" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySessions = getSessionsForDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "p-2 rounded-lg cursor-pointer transition-all min-h-[100px]",
                isSelected
                  ? "bg-purple-500/20 border-2 border-purple-500"
                  : "bg-white/5 border border-white/10 hover:border-white/30"
              )}
            >
              <div className="text-center mb-2">
                <div className="text-xs text-white/50">{format(day, 'EEE')}</div>
                <div className={cn(
                  "text-lg font-bold",
                  isToday ? "text-purple-400" : "text-white"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1">
                {daySessions.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="text-xs p-1 rounded bg-purple-500/30 text-purple-200 truncate"
                  >
                    {session.startTime.split(' ')[0]} {session.title.split(' ')[0]}
                  </div>
                ))}
                {daySessions.length > 2 && (
                  <div className="text-xs text-white/50 text-center">
                    +{daySessions.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Sessions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        {getSessionsForDay(selectedDate).length > 0 ? (
          getSessionsForDay(selectedDate).map((session) => (
            <SessionCard key={session.id} session={session} onJoin={onJoin} isCompact />
          ))
        ) : (
          <div className="text-center py-8 text-white/50">
            No sessions scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GroupCookSessionFinderProps {
  onJoinSession?: (session: CookSession) => void;
  className?: string;
}

export function GroupCookSessionFinder({ onJoinSession, className }: GroupCookSessionFinderProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredSessions = SAMPLE_SESSIONS.filter((session) => {
    if (cuisineFilter !== 'All' && session.cuisine !== cuisineFilter) return false;
    if (skillFilter !== 'All' && session.skillLevel !== skillFilter.toLowerCase()) return false;
    if (searchQuery && !session.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleJoin = (session: CookSession) => {
    onJoinSession?.(session);
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
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* View Toggle & Filters */}
        <div className="flex items-center gap-2">
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
            <span className="hidden sm:inline">Filters</span>
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
              onClick={() => setViewMode('calendar')}
              className={cn(
                "p-2 transition-all",
                viewMode === 'calendar' ? "bg-purple-500 text-white" : "bg-white/5 text-white/60"
              )}
            >
              <Calendar className="h-4 w-4" />
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
            <div className="p-4 rounded-xl bg-white/5 border border-white/15 space-y-4">
              {/* Cuisine Filter */}
              <div>
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

              {/* Skill Level Filter */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Skill Level</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSkillFilter(level)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-all",
                        skillFilter === level
                          ? "bg-purple-500 text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="text-sm text-white/60 mb-4">
        {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} onJoin={handleJoin} />
          ))}
        </div>
      ) : (
        <CalendarView
          sessions={filteredSessions}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onJoin={handleJoin}
        />
      )}

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Sessions Found</h3>
          <p className="text-white/60 mb-4">Try adjusting your filters or search query</p>
          <button
            onClick={() => {
              setCuisineFilter('All');
              setSkillFilter('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default GroupCookSessionFinder;
