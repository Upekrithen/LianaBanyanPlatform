/**
 * CASTLE — The 12-Door Hub
 * ================================================================
 * Bishop 025: Central navigation hub connecting all 12 platform systems.
 * Every door leads to a live system. This is the map of the kingdom.
 *
 * 12-Door Architecture (Session 12 Deep Read):
 * Labyrinth, Star Chamber, Library, Agora, Research, Emporium,
 * Marketplace, Guild Hall, Academy, Arena, Treasury, Observatory
 */

import { useNavigate } from 'react-router-dom';
import {
  Compass, Scale, BookOpen, Users, FlaskConical, Store,
  ShoppingBag, Shield, GraduationCap, Swords, Landmark, Eye,
  ArrowRight
} from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface Door {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  route: string;
  status: 'live' | 'coming_soon';
}

const TWELVE_DOORS: Door[] = [
  {
    id: 'labyrinth',
    name: 'The Labyrinth',
    subtitle: 'Entry & Discovery',
    description: 'Guided discovery tours, Beacon runs, and your first steps into the cooperative.',
    icon: Compass,
    color: 'emerald',
    route: '/treasure-map',
    status: 'live',
  },
  {
    id: 'star-chamber',
    name: 'Star Chamber',
    subtitle: 'Justice & Governance',
    description: 'AI-powered dispute resolution. Four judges, one verdict, human oversight.',
    icon: Scale,
    color: 'red',
    route: '/star-chamber',
    status: 'live',
  },
  {
    id: 'library',
    name: 'The Library',
    subtitle: 'Knowledge & Archives',
    description: 'Academic papers, platform documentation, and the Alexandrian collection.',
    icon: BookOpen,
    color: 'amber',
    route: '/asset-library',
    status: 'live',
  },
  {
    id: 'agora',
    name: 'The Agora',
    subtitle: 'Community & Discourse',
    description: 'Round Tables, Crew formation, and structured community discussion.',
    icon: Users,
    color: 'sky',
    route: '/crew-call',
    status: 'live',
  },
  {
    id: 'research',
    name: 'Research Labs',
    subtitle: 'Innovation & R&D',
    description: 'HexIsle engineering bounties, prototyping, and innovation tracking.',
    icon: FlaskConical,
    color: 'violet',
    route: '/the-forge',
    status: 'live',
  },
  {
    id: 'emporium',
    name: 'The Emporium',
    subtitle: 'Templates & Designs',
    description: 'Designer templates, royalty marketplace, and creative tools.',
    icon: Store,
    color: 'orange',
    route: '/emporium',
    status: 'live',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    subtitle: 'Commerce & Trade',
    description: 'Browse storefronts, order food, find local businesses. Cost+20%.',
    icon: ShoppingBag,
    color: 'teal',
    route: '/marketplace',
    status: 'live',
  },
  {
    id: 'guild-hall',
    name: 'Guild Hall',
    subtitle: 'Teams & Roles',
    description: 'Find your guild, claim roles, and join manufacturing crews.',
    icon: Shield,
    color: 'indigo',
    route: '/crew-call',
    status: 'live',
  },
  {
    id: 'academy',
    name: 'The Academy',
    subtitle: 'Learning & Growth',
    description: 'Flashcards, quizzes, Treasure Map progression, and Didasko courses.',
    icon: GraduationCap,
    color: 'purple',
    route: '/academy',
    status: 'live',
  },
  {
    id: 'arena',
    name: 'The Arena',
    subtitle: 'Competition & Craft',
    description: 'Design Battles, Maker Spotlight, Crow Feathers, and creative contests.',
    icon: Swords,
    color: 'rose',
    route: '/arena',
    status: 'live',
  },
  {
    id: 'treasury',
    name: 'The Treasury',
    subtitle: 'Currency & Wealth',
    description: 'Credits, Marks, Joules. LB Card earnings. War Chest and allocation.',
    icon: Landmark,
    color: 'yellow',
    route: '/treasure-island',
    status: 'live',
  },
  {
    id: 'observatory',
    name: 'The Observatory',
    subtitle: 'Analytics & Insight',
    description: 'Platform metrics, innovation velocity, Six Degrees connections.',
    icon: Eye,
    color: 'cyan',
    route: '/pnyx',
    status: 'live',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  emerald:  { bg: 'hover:border-emerald-500', border: 'border-emerald-500/20', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20' },
  red:      { bg: 'hover:border-red-500', border: 'border-red-500/20', text: 'text-red-500', iconBg: 'bg-red-500/10 group-hover:bg-red-500/20' },
  amber:    { bg: 'hover:border-amber-500', border: 'border-amber-500/20', text: 'text-amber-500', iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20' },
  sky:      { bg: 'hover:border-sky-500', border: 'border-sky-500/20', text: 'text-sky-500', iconBg: 'bg-sky-500/10 group-hover:bg-sky-500/20' },
  violet:   { bg: 'hover:border-violet-500', border: 'border-violet-500/20', text: 'text-violet-500', iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20' },
  orange:   { bg: 'hover:border-orange-500', border: 'border-orange-500/20', text: 'text-orange-500', iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20' },
  teal:     { bg: 'hover:border-teal-500', border: 'border-teal-500/20', text: 'text-teal-500', iconBg: 'bg-teal-500/10 group-hover:bg-teal-500/20' },
  indigo:   { bg: 'hover:border-indigo-500', border: 'border-indigo-500/20', text: 'text-indigo-500', iconBg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20' },
  purple:   { bg: 'hover:border-purple-500', border: 'border-purple-500/20', text: 'text-purple-500', iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20' },
  rose:     { bg: 'hover:border-rose-500', border: 'border-rose-500/20', text: 'text-rose-500', iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/20' },
  yellow:   { bg: 'hover:border-yellow-500', border: 'border-yellow-500/20', text: 'text-yellow-500', iconBg: 'bg-yellow-500/10 group-hover:bg-yellow-500/20' },
  cyan:     { bg: 'hover:border-cyan-500', border: 'border-cyan-500/20', text: 'text-cyan-500', iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20' },
};

export default function Castle() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="castle-12-doors">
      <div className="space-y-12">

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            The Castle
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Twelve doors. Every one leads somewhere real. Pick a door and walk through it.
          </p>
        </div>

        {/* 12-Door Grid — 3×4 on desktop, 2×6 on tablet, 1×12 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TWELVE_DOORS.map((door) => {
            const colors = colorMap[door.color];
            const Icon = door.icon;

            return (
              <div
                key={door.id}
                className={`group relative bg-card/50 border-2 ${colors.border} ${colors.bg} rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1`}
                onClick={() => navigate(door.route)}
                data-xray-id={`castle-door-${door.id}`}
              >
                <div className={`${colors.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors`}>
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-bold mb-1">{door.name}</h3>
                <p className={`text-xs font-semibold ${colors.text} uppercase tracking-wider mb-2`}>
                  {door.subtitle}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {door.description}
                </p>
                <div className={`flex items-center ${colors.text} font-semibold text-sm`}>
                  Enter <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>12 doors. All live. All connected.</p>
          <p className="text-xs">1,935 innovations | 8 patent applications | 16 initiatives</p>
        </div>

      </div>
    </PortalPageLayout>
  );
}
