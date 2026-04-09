/**
 * Ship Templates — Cooperative Crew Formation Data
 * K199: Oar Slots visualization
 * Bishop B052 pre-write
 *
 * Each template defines the crew needed to launch a cooperative venture.
 * Members fill "oar slots" — solo = canoe, full crew = ship.
 */

export interface OarSlot {
  role: string;
  icon: string;
  description: string;
  soloEarning: string;
  crewEarning: string;
  whyMore: string;
  matchingCategories: string[]; // mark_work_records categories that qualify
}

export interface ShipTemplate {
  id: string;
  name: string;
  initiative: string;
  icon: string;
  totalOars: number;
  oars: OarSlot[];
  soloLabel: string;
  crewLabel: string;
  soloTotal: string;
  crewTotal: string;
  tagline: string;
}

export const SHIP_TEMPLATES: ShipTemplate[] = [
  {
    id: 'lmd',
    name: "Let's Make Dinner",
    initiative: 'lets_make_dinner',
    icon: '🍽️',
    totalOars: 6,
    soloLabel: '🚣 Your Canoe',
    crewLabel: '🚢 The Ship',
    soloTotal: '~$100-200/mo',
    crewTotal: '~$400-800/mo each',
    tagline: 'Everyone eats. Everyone earns.',
    oars: [
      {
        role: 'Restaurant Partner',
        icon: '🍽️',
        description: 'Makes the food — your kitchen, your recipes, your rules',
        soloEarning: '~$200/mo',
        crewEarning: '~$800/mo',
        whyMore: 'Guaranteed demand from the cooperative network. 100+ meals/month at Cost+20%. You keep 83.3%.',
        matchingCategories: ['cooking', 'restaurant', 'food'],
      },
      {
        role: 'Delivery Driver',
        icon: '🚗',
        description: 'Delivers meals — steady routes, not gig roulette',
        soloEarning: '~$150/mo',
        crewEarning: '~$600/mo',
        whyMore: 'Steady route with 100+ deliveries/month. No gig-app fees — just Cost+20%. The route is YOURS.',
        matchingCategories: ['delivery', 'driving', 'local_wheels'],
      },
      {
        role: 'Photographer',
        icon: '📸',
        description: 'Documents restaurants for the marketplace',
        soloEarning: '~$100/mo',
        crewEarning: '~$500/mo',
        whyMore: 'Every partner restaurant needs photos. New restaurants join monthly. Your pipeline never dries up.',
        matchingCategories: ['photography', 'bounty_photo'],
      },
      {
        role: 'Pearl Diver',
        icon: '🐚',
        description: 'Scouts deals, specials, and restaurant intel',
        soloEarning: '~$75/mo',
        crewEarning: '~$400/mo',
        whyMore: 'Your deal intel drives subscriber orders. When you log "Tuesday special: 50% off pasta", members order. You become the engine.',
        matchingCategories: ['pearl_diver', 'deals', 'scouting'],
      },
      {
        role: 'Subscriber / Funder',
        icon: '💛',
        description: 'Funds meals through Mission ONE earmarks',
        soloEarning: '$0 (spending)',
        crewEarning: '28 meals/month + Joules',
        whyMore: 'Early backer multiplier on charitable subscriptions. Your funding feeds real people AND earns you Joules (forever stamps).',
        matchingCategories: ['backing', 'subscribing', 'funding'],
      },
      {
        role: 'Captain / Coordinator',
        icon: '⚓',
        description: 'Manages the crew and keeps everything moving',
        soloEarning: '$0 (nothing to manage)',
        crewEarning: '~$500/mo',
        whyMore: 'Coordination Marks on every transaction in the node. You are the hub — every meal that moves earns you Marks.',
        matchingCategories: ['captain', 'coordination', 'management'],
      },
    ],
  },
  {
    id: 'bounty-photo',
    name: 'Bounty Photography Network',
    initiative: 'bounty_photography',
    icon: '📸',
    totalOars: 3,
    soloLabel: '🚣 Your Canoe',
    crewLabel: '🚢 The Ship',
    soloTotal: '~$100/mo',
    crewTotal: '~$200-300/mo each',
    tagline: 'See the world. Show the world. Get paid.',
    oars: [
      {
        role: 'Photographer',
        icon: '📸',
        description: 'Photographs local businesses for bounty Marks',
        soloEarning: '~$100/mo',
        crewEarning: '~$300/mo',
        whyMore: 'Captain assigns high-value bounties. Pearl Diver finds businesses that NEED photos. Your hit rate triples.',
        matchingCategories: ['photography', 'bounty_photo'],
      },
      {
        role: 'Captain',
        icon: '⚓',
        description: 'Assigns bounties and manages quality',
        soloEarning: '$0',
        crewEarning: '~$200/mo',
        whyMore: 'Coordination Marks on every verified photo. You curate the bounty board — photographers come to YOU.',
        matchingCategories: ['captain', 'coordination'],
      },
      {
        role: 'Pearl Diver',
        icon: '🐚',
        description: 'Finds businesses that need photos taken',
        soloEarning: '~$75/mo',
        crewEarning: '~$200/mo',
        whyMore: 'Every business you scout becomes a bounty. When the photographer shoots it, you earn finder Marks.',
        matchingCategories: ['pearl_diver', 'scouting'],
      },
    ],
  },
  {
    id: 'classroom',
    name: 'Cooperative Classroom',
    initiative: 'cooperative_classroom',
    icon: '👩‍🏫',
    totalOars: 4,
    soloLabel: '🚣 Your Canoe',
    crewLabel: '🚢 The Ship',
    soloTotal: '~$150/mo',
    crewTotal: '~$300-500/mo each',
    tagline: 'Teach what you know. Learn what you need.',
    oars: [
      {
        role: 'Teacher',
        icon: '👩‍🏫',
        description: 'Teaches classes via Zoom — your subject, your schedule',
        soloEarning: '~$150/mo',
        crewEarning: '~$500/mo',
        whyMore: 'Marketing brings students. Scheduler fills time slots. You just teach. Student pipeline stays full.',
        matchingCategories: ['teaching', 'classroom'],
      },
      {
        role: 'Second Teacher',
        icon: '📚',
        description: 'Teaches a different subject — students cross-enroll',
        soloEarning: '~$150/mo',
        crewEarning: '~$500/mo',
        whyMore: 'Your students become their students and vice versa. Two subjects = double the draw.',
        matchingCategories: ['teaching', 'classroom'],
      },
      {
        role: 'Scheduler / Coordinator',
        icon: '📅',
        description: 'Manages bookings and student communication',
        soloEarning: '$0',
        crewEarning: '~$200/mo',
        whyMore: 'Coordination Marks on every class booked. You keep the machine running.',
        matchingCategories: ['coordination', 'scheduling'],
      },
      {
        role: 'Marketing / Pearl Diver',
        icon: '📢',
        description: 'Finds students through social media and community outreach',
        soloEarning: '~$75/mo',
        crewEarning: '~$300/mo',
        whyMore: 'Every student you recruit earns you attribution Marks (ONE LEVEL). Teachers get students, you get Marks.',
        matchingCategories: ['marketing', 'pearl_diver', 'social'],
      },
    ],
  },
  {
    id: 'freezer-node',
    name: 'Freezer Node',
    initiative: 'freezer_node',
    icon: '🧊',
    totalOars: 5,
    soloLabel: '🚣 Your Canoe',
    crewLabel: '🚢 The Ship',
    soloTotal: '~$200/mo',
    crewTotal: '~$400-700/mo each',
    tagline: 'Batch it. Store it. Ship it. Feed the neighborhood.',
    oars: [
      {
        role: 'Cook / Prep',
        icon: '🍳',
        description: 'Batch cooks meals for storage and distribution',
        soloEarning: '~$200/mo',
        crewEarning: '~$700/mo',
        whyMore: 'Second cook doubles output. Delivery handles logistics. Captain brings orders. You just cook.',
        matchingCategories: ['cooking', 'food', 'prep'],
      },
      {
        role: 'Second Cook',
        icon: '👨‍🍳',
        description: 'Different specialties — doubles the menu',
        soloEarning: '~$200/mo',
        crewEarning: '~$700/mo',
        whyMore: 'Two cooks = twice the menu variety = twice the orders. Customers come for the selection.',
        matchingCategories: ['cooking', 'food', 'prep'],
      },
      {
        role: 'Storage / Packaging',
        icon: '📦',
        description: 'Manages freezer space and packaging',
        soloEarning: '$0',
        crewEarning: '~$300/mo',
        whyMore: 'Your freezer space is an asset. Packaging Marks on every meal that ships.',
        matchingCategories: ['storage', 'packaging', 'logistics'],
      },
      {
        role: 'Delivery Driver',
        icon: '🚗',
        description: 'Delivers frozen meals to families',
        soloEarning: '~$150/mo',
        crewEarning: '~$400/mo',
        whyMore: 'Steady delivery route from the node. No waiting for gig pings — meals are ready, route is planned.',
        matchingCategories: ['delivery', 'driving'],
      },
      {
        role: 'Captain / Orders',
        icon: '⚓',
        description: 'Manages orders and coordinates the node',
        soloEarning: '$0',
        crewEarning: '~$400/mo',
        whyMore: 'Coordination Marks on every order. You manage Family Table subscriptions and catering requests.',
        matchingCategories: ['captain', 'coordination', 'orders'],
      },
    ],
  },
];

/**
 * Find the best ship template for a member based on their earning category.
 */
export function getBestTemplateForCategory(primaryCategory: string): ShipTemplate {
  for (const template of SHIP_TEMPLATES) {
    for (const oar of template.oars) {
      if (oar.matchingCategories.includes(primaryCategory)) {
        return template;
      }
    }
  }
  // Default to Let's Make Dinner (most universal)
  return SHIP_TEMPLATES[0];
}

/**
 * Find which oar a member would fill based on their earning category.
 */
export function getMemberOarIndex(template: ShipTemplate, primaryCategory: string): number {
  return template.oars.findIndex(oar =>
    oar.matchingCategories.includes(primaryCategory)
  );
}
