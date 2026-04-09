/**
 * WILDFIRE TOUR MOCK DATA
 * All demo data for the WildFire Tour experience — client-side only.
 * Prospective members see a live, populated platform before committing $5.
 */

export const TOUR_PROFILE = {
  displayName: "Tour Explorer",
  membership: "$5/year Active",
  memberSince: "Just now",
  subscriptionCount: 3,
  crewMemberships: 1,
  storefrontCount: 1,
};

export const TOUR_STATS = {
  credits: 47.5,
  marks: 12,
  joules: 3,
  msaBalance: 4250,
};

export interface TourSubscription {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "credits" | "marks" | "joules";
  billingCycle: string;
  subscribers: number;
  nextDelivery: string;
  category: string;
  preview: string;
}

export const TOUR_SUBSCRIPTIONS: TourSubscription[] = [
  {
    id: "tour-sub-1",
    title: "Montana Makers Weekly",
    description: "Manufacturing updates, new bounties, and maker spotlights from the Northern Province.",
    price: 2,
    currency: "credits",
    billingCycle: "monthly",
    subscribers: 247,
    nextDelivery: "Friday",
    category: "manufacturing",
    preview: "This week: A Billings woodworker scaled from garage to 3-printer operation using Crew Call bounties...",
  },
  {
    id: "tour-sub-2",
    title: "San Antonio Eats",
    description: "Food node newsletter — new restaurants, home cook spotlights, meal deals at Cost+20%.",
    price: 5,
    currency: "marks",
    billingCycle: "monthly",
    subscribers: 1_832,
    nextDelivery: "Monday",
    category: "cooking",
    preview: "Featured: Rosa's tamales hit 200 orders this month. Plus 3 new food trucks joined the network...",
  },
  {
    id: "tour-sub-3",
    title: "HexIsle Strategy Guide",
    description: "Quarterly deep-dive into HexIsle builds, Golden Lotus configurations, and terrain tactics.",
    price: 1,
    currency: "joules",
    billingCycle: "quarterly",
    subscribers: 89,
    nextDelivery: "Q3 2026",
    category: "gaming",
    preview: "Advanced Swan Neck coupling patterns for 469-hexel tournament boards — with printable templates...",
  },
];

export interface TourCrewMember {
  name: string;
  role: "captain" | "first_mate" | "crew" | "apprentice";
  avatar: string;
  specialty: string;
}

export interface TourCrewPosition {
  title: string;
  description: string;
  reward: string;
}

export interface TourCrewMessage {
  author: string;
  text: string;
  time: string;
}

export const TOUR_CREW = {
  name: "San Antonio Launch Crew",
  memberCount: 4,
  activeProject: "Farmers Market Pop-Up",
  projectTimeline: "April 15 - May 15, 2026",
  members: [
    { name: "Marcus T.", role: "captain" as const, avatar: "🧑‍✈️", specialty: "Event planning" },
    { name: "Priya K.", role: "first_mate" as const, avatar: "👩‍💻", specialty: "Social media" },
    { name: "Diego R.", role: "crew" as const, avatar: "👨‍🍳", specialty: "Food prep" },
    { name: "Sam L.", role: "apprentice" as const, avatar: "🧑‍🎓", specialty: "Photography" },
  ],
  openPositions: [
    { title: "Photographer needed", description: "Document the pop-up for marketing materials", reward: "15 Credits + 5 Marks" },
    { title: "Social media manager", description: "Run the Instagram campaign during launch week", reward: "20 Credits + 8 Marks" },
  ],
  chatPreview: [
    { author: "Marcus T.", text: "Venue confirmed for April 15! Sending the layout map tonight.", time: "2h ago" },
    { author: "Priya K.", text: "Got 3 food trucks committed. Working on the fourth.", time: "4h ago" },
    { author: "Diego R.", text: "Menu cards are printed. Cost+20% breakdown on the back of each. 🔥", time: "Yesterday" },
  ],
};

export interface TourProduct {
  id: string;
  name: string;
  baseCost: number;
  price: number;
  description: string;
  category: string;
}

export const TOUR_STOREFRONT = {
  name: "Your First Shop",
  tagline: "See what a cooperative storefront looks like",
  products: [
    {
      id: "tour-prod-1",
      name: "Hand-Poured Soy Candle",
      baseCost: 8.33,
      price: 10.0,
      description: "All-natural soy wax, cotton wick. Made in small batches.",
      category: "crafts",
    },
    {
      id: "tour-prod-2",
      name: "Custom Phone Stand (3D Printed)",
      baseCost: 4.17,
      price: 5.0,
      description: "PLA filament, 6 color options. Ships in 3 days.",
      category: "manufacturing",
    },
    {
      id: "tour-prod-3",
      name: "Local Honey — 12oz Jar",
      baseCost: 6.67,
      price: 8.0,
      description: "Raw, unfiltered. From San Antonio urban apiaries.",
      category: "food",
    },
  ],
};

export const TOUR_PAGES_FOR_COMPLETION = 5;
