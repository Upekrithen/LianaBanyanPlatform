/**
 * Treasure Map Guide Data — Step-by-step content for each map.
 */

export interface GuidePhase {
  name: string;
  steps: { title: string; detail: string }[];
}

export interface TreasureMapGuide {
  id: string;
  title: string;
  subtitle: string;
  whoThisIsFor: string;
  whatYouNeed: string[];
  economics: { label: string; value: string }[];
  phases: GuidePhase[];
  levelProgression: { name: string; description: string }[];
  toolLinks: { name: string; route: string; description: string }[];
}

export const TREASURE_MAP_GUIDES: Record<string, TreasureMapGuide> = {
  'breakfast-runner': {
    id: 'breakfast-runner',
    title: 'Breakfast Runner',
    subtitle: 'Pick up from local bakeries and cafes, deliver to neighbors before 9 AM.',
    whoThisIsFor: 'Early risers with a car who want predictable, short shifts. Great for parents after school drop-off or anyone with free mornings.',
    whatYouNeed: ['A car or bike with insulated bag', 'Smartphone with data', '2-3 free hours before 9 AM', 'Reliable alarm clock'],
    economics: [
      { label: 'Startup cost', value: '$0 (insulated bag provided)' },
      { label: 'Delivery fee', value: '$3-$5 per stop' },
      { label: 'Typical route', value: '8-12 stops in 2 hours' },
      { label: 'Monthly potential', value: '$500-$1,500 (delivery fees)' },
    ],
    phases: [
      { name: 'Scout', steps: [
        { title: 'Walk the zone', detail: 'Identify 3-5 bakeries/cafes within a 2-mile radius that open before 7 AM.' },
        { title: 'Taste-test', detail: 'Buy a coffee and pastry from each. Note quality, price, and opening time.' },
        { title: 'Map your route', detail: 'Plan a loop that hits all stops in under 30 minutes.' },
      ]},
      { name: 'Pitch', steps: [
        { title: 'Use the Cue Card', detail: 'Generate a Cue Card for each bakery showing their potential pre-order volume.' },
        { title: 'Have the conversation', detail: '"I live nearby and want to deliver your pastries to people who can\'t make it in."' },
        { title: 'Create the storefront', detail: 'Use Storefront Builder to list their menu items with pickup times.' },
      ]},
      { name: 'Launch', steps: [
        { title: 'First 10 orders', detail: 'Share the menu link with neighbors. Offer first delivery free via coupon code.' },
        { title: 'Qualify your credit', detail: '10 paid orders in 30 days = your onboarding allocation authority begins.' },
        { title: 'Optimize the route', detail: 'Batch pickups by time, minimize driving, maximize stops.' },
      ]},
      { name: 'Expand', steps: [
        { title: 'Add shops', detail: 'Pitch 2 more businesses per month. Each one adds capacity to your route.' },
        { title: 'Recruit a Multiplier', detail: 'Train a helper to cover you on off-days. They earn delivery fees too.' },
        { title: 'Build the Coalition', detail: 'Connect your shops to each other. Cross-promote breakfast bundles.' },
      ]},
    ],
    levelProgression: [
      { name: 'Level 1: First Route', description: '1 shop, 5 deliveries/week' },
      { name: 'Level 2: Morning Circuit', description: '3 shops, daily route, subscription pitch' },
      { name: 'Level 3: Breakfast Captain', description: '5+ shops, Multiplier helpers, Coalition forming' },
      { name: 'Level 4: Node Builder', description: '10+ shops, full network, allocation authority from all' },
    ],
    toolLinks: [
      { name: 'Storefront Builder', route: '/tools/storefront-builder', description: 'Create a menu page for each bakery' },
      { name: 'Cue Card Generator', route: '/tools/cue-card-generator', description: 'Generate pitch cards with business data' },
      { name: 'Runner Dashboard', route: '/dashboard/runner', description: 'Track deliveries, earnings, and routes' },
    ],
  },
  'lunch-runner': {
    id: 'lunch-runner',
    title: 'Lunch Runner',
    subtitle: 'Deliver pre-ordered lunches from local restaurants to offices and homes.',
    whoThisIsFor: 'Anyone available 10 AM - 2 PM. Works well as a midday side-hustle or full-time if you build multiple routes.',
    whatYouNeed: ['A car with insulated bags', 'Smartphone', '3-4 hours midday', 'Knowledge of your area'],
    economics: [
      { label: 'Startup cost', value: '$0' },
      { label: 'Delivery fee', value: '$3-$6 per stop' },
      { label: 'Typical route', value: '10-15 stops in 3 hours' },
      { label: 'Monthly potential', value: '$800-$2,000 (delivery fees)' },
    ],
    phases: [
      { name: 'Scout', steps: [
        { title: 'Identify lunch spots', detail: 'Find 3-5 restaurants that do good lunch business but lack delivery.' },
        { title: 'Check demand', detail: 'Talk to nearby offices/buildings about lunch delivery interest.' },
        { title: 'Map the zone', detail: 'Plan a delivery radius that keeps drives under 10 minutes.' },
      ]},
      { name: 'Pitch', steps: [
        { title: 'Approach the owner', detail: '"I\'ll bring you 20 new orders a week with zero marketing cost."' },
        { title: 'Set up the storefront', detail: 'List their lunch menu with order cutoff times (typically 10 AM).' },
        { title: 'Share with offices', detail: 'Drop Cue Cards at reception desks and break rooms.' },
      ]},
      { name: 'Launch', steps: [
        { title: 'Run first week', detail: 'Do every delivery yourself. Learn the timing and logistics.' },
        { title: 'Qualify', detail: '10 paid orders in 30 days activates your allocation authority.' },
        { title: 'Create subscriptions', detail: 'Offer weekly meal plans to regulars at a small discount.' },
      ]},
      { name: 'Expand', steps: [
        { title: 'Add variety', detail: 'Bring on restaurants with different cuisines so customers have daily choice.' },
        { title: 'Build crew', detail: 'Recruit another runner to split the load or cover different areas.' },
        { title: 'Go Coalition', detail: 'Bundle multiple restaurants into a "lunch district" offering.' },
      ]},
    ],
    levelProgression: [
      { name: 'Level 1: First Route', description: '1 restaurant, 5 deliveries/week' },
      { name: 'Level 2: Lunch Circuit', description: '3 restaurants, daily route' },
      { name: 'Level 3: Lunch Captain', description: '5+ restaurants, crew running, subscriptions active' },
      { name: 'Level 4: District Builder', description: '10+ restaurants, full Coalition' },
    ],
    toolLinks: [
      { name: 'Storefront Builder', route: '/tools/storefront-builder', description: 'Set up restaurant menus' },
      { name: 'Runner Dashboard', route: '/dashboard/runner', description: 'Track routes and earnings' },
    ],
  },
  'taco-truck': {
    id: 'taco-truck',
    title: 'Taco Truck / Food Truck',
    subtitle: 'Help food trucks take pre-orders and expand their reach.',
    whoThisIsFor: 'Food truck owners, or someone who partners with a food truck to handle their digital presence and delivery.',
    whatYouNeed: ['Connection to a food truck operator', 'Smartphone', 'Social media account', 'Knowledge of local events/locations'],
    economics: [
      { label: 'Startup cost', value: '$0 (existing truck)' },
      { label: 'Average order', value: '$12-$18' },
      { label: 'Pre-order boost', value: '20-40% more daily sales' },
      { label: 'Monthly potential', value: '$1,000-$3,000 (operator share)' },
    ],
    phases: [
      { name: 'Scout', steps: [{ title: 'Find trucks', detail: 'Identify food trucks in your area that don\'t have online ordering.' }, { title: 'Evaluate', detail: 'Check food quality, consistency, and owner interest in growth.' }] },
      { name: 'Pitch', steps: [{ title: 'Show the math', detail: '"Pre-orders mean you cook only what\'s sold. Zero waste, guaranteed revenue."' }, { title: 'Build storefront', detail: 'Create their menu with location schedule and order cutoff times.' }] },
      { name: 'Launch', steps: [{ title: 'First event', detail: 'Run pre-orders for one location. Show the truck owner the difference.' }, { title: 'Qualify', detail: '10 paid orders to activate allocation authority.' }] },
      { name: 'Expand', steps: [{ title: 'Multi-location', detail: 'Set up different menus for different stops.' }, { title: 'Catering mode', detail: 'Add bulk order options for offices and events.' }] },
    ],
    levelProgression: [
      { name: 'Level 1: Digital Partner', description: '1 truck, online ordering live' },
      { name: 'Level 2: Pre-Order Pro', description: '20+ pre-orders/week' },
      { name: 'Level 3: Multi-Truck', description: '3+ trucks managed' },
      { name: 'Level 4: Fleet Coordinator', description: 'Food truck Coalition' },
    ],
    toolLinks: [
      { name: 'Storefront Builder', route: '/tools/storefront-builder', description: 'Create truck menus with schedules' },
    ],
  },
  'catering': {
    id: 'catering',
    title: 'Catering Coordinator',
    subtitle: 'Connect businesses with local caterers for events, meetings, and regular orders.',
    whoThisIsFor: 'Someone who knows local food businesses and has connections to offices, churches, or event venues.',
    whatYouNeed: ['Phone and email', 'Local business knowledge', 'Event coordination skills', 'Spreadsheet skills helpful'],
    economics: [
      { label: 'Startup cost', value: '$0' },
      { label: 'Average catering order', value: '$200-$2,000' },
      { label: 'Coordination fee', value: '10-15% of order' },
      { label: 'Monthly potential', value: '$1,000-$5,000' },
    ],
    phases: [
      { name: 'Scout', steps: [{ title: 'List venues', detail: 'Churches, offices, community centers that regularly order food.' }, { title: 'List caterers', detail: 'Home cooks, restaurants, bakeries that can do bulk orders.' }] },
      { name: 'Pitch', steps: [{ title: 'Both sides', detail: 'Tell venues "I\'ll find great local food at competitive prices."' }, { title: 'Build menu', detail: 'Create a catering menu storefront with package options.' }] },
      { name: 'Launch', steps: [{ title: 'First booking', detail: 'Coordinate one event. Deliver excellent service.' }, { title: 'Get testimonials', detail: 'Photos and quotes from satisfied organizers.' }] },
      { name: 'Expand', steps: [{ title: 'Regular contracts', detail: 'Weekly office lunch orders, monthly church dinners.' }, { title: 'Build Coalition', detail: 'Multiple caterers under one booking system.' }] },
    ],
    levelProgression: [
      { name: 'Level 1: First Booking', description: '1 event coordinated' },
      { name: 'Level 2: Regular Orders', description: '5+ recurring bookings' },
      { name: 'Level 3: Event Captain', description: '20+ events/month' },
      { name: 'Level 4: Catering Coalition', description: 'Multi-vendor operation' },
    ],
    toolLinks: [
      { name: 'Storefront Builder', route: '/tools/storefront-builder', description: 'Create catering menus' },
    ],
  },
  'grocery': {
    id: 'grocery',
    title: 'Grocery Runner',
    subtitle: 'Deliver pre-ordered groceries from local stores to neighbors.',
    whoThisIsFor: 'Anyone with a car and 2-3 hours free. Ideal for people who already do their own grocery shopping.',
    whatYouNeed: ['A car', 'Insulated bags for cold items', 'Smartphone', '2-3 hours per run'],
    economics: [
      { label: 'Startup cost', value: '$0' },
      { label: 'Delivery fee', value: '$5-$8 per order' },
      { label: 'Typical batch', value: '6-10 orders per run' },
      { label: 'Monthly potential', value: '$600-$1,800' },
    ],
    phases: [
      { name: 'Scout', steps: [{ title: 'Map stores', detail: 'Find grocery stores, farmers markets, and specialty shops.' }, { title: 'Check interest', detail: 'Ask neighbors if they\'d use a local grocery delivery service.' }] },
      { name: 'Pitch', steps: [{ title: 'Store partnership', detail: '"I\'ll bring you online orders from people who can\'t shop in person."' }, { title: 'Build storefront', detail: 'List popular items with delivery windows.' }] },
      { name: 'Launch', steps: [{ title: 'First batch', detail: 'Take 5 orders, shop them together, deliver in one loop.' }, { title: 'Qualify', detail: '10 paid orders for allocation authority.' }] },
      { name: 'Expand', steps: [{ title: 'Add stores', detail: 'Multi-store runs for more variety.' }, { title: 'Subscriptions', detail: 'Weekly recurring orders for staples.' }] },
    ],
    levelProgression: [
      { name: 'Level 1: First Run', description: '1 store, 5 deliveries' },
      { name: 'Level 2: Regular Routes', description: '3 stores, weekly subscribers' },
      { name: 'Level 3: Grocery Captain', description: '5+ stores, crew helpers' },
      { name: 'Level 4: Food Access Node', description: 'Full grocery network' },
    ],
    toolLinks: [
      { name: 'Storefront Builder', route: '/tools/storefront-builder', description: 'Create grocery store pages' },
      { name: 'Let\'s Get Groceries', route: '/lets-get-groceries', description: 'Initiative hub' },
    ],
  },
  'service': {
    id: 'service',
    title: 'Service Business',
    subtitle: 'Onboard local service businesses — plumbers, tutors, cleaners, and more.',
    whoThisIsFor: 'Someone who knows local service providers and can help them get online. No service skills needed — you\'re the connector.',
    whatYouNeed: ['Local contacts', 'Phone/email', 'Ability to explain the platform', 'Patience for onboarding'],
    economics: [
      { label: 'Startup cost', value: '$0' },
      { label: 'Onboarding reward', value: 'Allocation authority (Backed Marks)' },
      { label: 'Steward fee', value: '2% management (if managing)' },
      { label: 'Monthly potential', value: 'Delivery fees + governance influence' },
    ],
    phases: [
      { name: 'Scout', steps: [{ title: 'List services', detail: 'Tutors, cleaners, handyfolk, pet sitters in your area.' }, { title: 'Evaluate interest', detail: 'Look for businesses that rely on word-of-mouth but want more.' }] },
      { name: 'Pitch', steps: [{ title: 'Show the value', detail: '"Get listed, get bookings, keep 83.3% of every dollar."' }, { title: 'Build their page', detail: 'Use Storefront Builder to create their service listing.' }] },
      { name: 'Launch', steps: [{ title: 'First booking', detail: 'Help them get their first 3 customers through the platform.' }, { title: 'Qualify', detail: '10 paid orders for allocation authority.' }] },
      { name: 'Expand', steps: [{ title: 'Service hub', detail: 'Bundle related services (home maintenance package).' }, { title: 'Become Steward', detail: 'Manage their digital presence for 2% management fee.' }] },
    ],
    levelProgression: [
      { name: 'Level 1: First Onboard', description: '1 service business live' },
      { name: 'Level 2: Multi-Service', description: '3+ businesses, cross-referral active' },
      { name: 'Level 3: Service Hub', description: 'Home services bundle, scheduling coordination' },
      { name: 'Level 4: Community Steward', description: 'Full service network with allocation authority' },
    ],
    toolLinks: [
      { name: 'Storefront Builder', route: '/tools/storefront-builder', description: 'Create service listings' },
      { name: 'Onboarder Dashboard', route: '/dashboard/onboarder', description: 'Track your onboarded businesses' },
    ],
  },
  'seeder-presenter': {
    id: 'seeder-presenter',
    title: 'Seeder / Presenter',
    subtitle: 'Discover businesses online, deliver personalized pitch packages in person — or do both.',
    whoThisIsFor: 'Online scouts who find great businesses (Seeders), boots-on-the-ground ambassadors who deliver pitch packages (Presenters), or hustlers who do both and earn double.',
    whatYouNeed: ['Smartphone with internet', 'Eye for spotting good local businesses', 'Social media presence (Seeder path)', 'LB Card with QR code (Presenter path)', 'Confidence to walk in and talk to owners'],
    economics: [
      { label: 'Startup cost', value: '$0' },
      { label: 'Per seed signup', value: '25 Marks + 50 XP + Seeder credential' },
      { label: 'Per presentation', value: '25 Marks + 50 XP + Reputation badge' },
      { label: 'Both roles (same person)', value: '50 Marks + 100 XP — double reward' },
      { label: 'Steward recurring', value: '2% of your direct\'s platform revenue, ongoing' },
      { label: 'Monthly potential', value: '10 seeds/mo = 500+ Marks + Steward income on conversions' },
    ],
    phases: [
      { name: 'Seed a Business', steps: [
        { title: 'Find a business', detail: 'Spot any business — Etsy shop, restaurant, freelancer, local service. Browse online or walk your neighborhood.' },
        { title: 'Fill the Seeding Form', detail: 'Enter business name, what they sell, location, social links, and why they\'d be a great fit for LB.' },
        { title: 'Auto-generated package', detail: 'LB creates a personalized Red Carpet URL and mini-business plan from boilerplate — ready to share.' },
      ]},
      { name: 'The Influencer Connection', steps: [
        { title: 'Seed from anywhere', detail: 'You don\'t have to go in person. Discover businesses online and share the Red Carpet link through your social channels.' },
        { title: 'Connect to Influencer path', detail: 'This plugs directly into the Influencer & Creator category on HexIsle. Your existing audience becomes your seeding ground.' },
        { title: 'Track attribution', detail: 'If the business signs up through your Red Carpet link, you get credited as the Seeder automatically.' },
      ]},
      { name: 'Present to Business', steps: [
        { title: 'Claim a prepped package', detail: 'Another member (or you) seeded the business. Now claim the package as a Presenter to deliver it in person.' },
        { title: 'Boots on the ground', detail: 'Take an LB Card with the QR code to the business. Walk in, introduce LB, hand over the pitch.' },
        { title: 'Both rewards stack', detail: 'One person CAN fill Seeder + Presenter. You earn both reward slots. The system splits naturally if two people collaborate.' },
      ]},
      { name: 'When Business Signs Up', steps: [
        { title: 'Seeder gets credited', detail: 'XP + Marks + permanent Seeder credential on your profile. Reputation boost sticks forever.' },
        { title: 'Presenter gets delivery reward', detail: 'Separate delivery bonus + Reputation boost for the in-person handoff.' },
        { title: 'Steward conversion', detail: 'Either Seeder or Presenter can become partial Steward for that business — one of your ten Concentric Circle directs. Turns a one-off bounty into recurring value.' },
      ]},
    ],
    levelProgression: [
      { name: 'Level 1: First Seed', description: '1 business seeded, Red Carpet link shared' },
      { name: 'Level 2: Active Seeder', description: '5 businesses seeded, 2+ signed up, Presenter missions claimed' },
      { name: 'Level 3: Seeder Captain', description: '10+ seeds, 5+ signups, Steward for 3+ businesses, Guild/Tribe cascade active' },
      { name: 'Level 4: Network Builder', description: '25+ seeds, full Concentric Circle, recruiting other Seeders/Presenters' },
    ],
    toolLinks: [
      { name: 'Ambassador Chain', route: '/dashboard/ambassador', description: 'Track your seeder referrals and rewards' },
      { name: 'Red Carpet URLs', route: '/RedCarpet', description: 'Personalized landing pages for each business' },
      { name: 'Steward Dashboard', route: '/dashboard/steward', description: 'Manage your Concentric Circle directs' },
      { name: 'Cold Start Hub', route: '/cold-start', description: 'All six pathways to launching on LB' },
      { name: 'Influencer Challenge', route: '/influencer-challenge', description: 'Connect seeding to your influencer audience' },
      { name: 'Cue Card Generator', route: '/tools/cue-card-generator', description: 'Generate shareable pitch cards for businesses' },
      { name: 'HexIsle Marketplace', route: '/hexisle', description: 'Influencer & Creator category' },
    ],
  },
  'designer': {
    id: 'designer',
    title: 'Become an LB Designer',
    subtitle: 'Design Lotería cards, cue cards, logos, and templates. Earn royalties every time a business uses your work.',
    whoThisIsFor: 'Graphic designers, illustrators, or anyone with creative skills. No clients needed — your work sells through the Emporium marketplace.',
    whatYouNeed: ['Design software (Canva, Figma, Illustrator)', 'Portfolio of 3+ samples', 'Understanding of business card/menu layouts', 'Creative eye'],
    economics: [
      { label: 'Startup cost', value: '$0' },
      { label: 'Battle bounty', value: '$50-$500 per win' },
      { label: 'Template royalty', value: '$2-$10 per use' },
      { label: 'Monthly potential', value: '$500-$5,000' },
    ],
    phases: [
      { name: 'Scout', steps: [{ title: 'Browse the Emporium', detail: 'See what categories need more designs (logos, cue cards, business cards).' }, { title: 'Study the style', detail: 'LB designs are warm, community-focused, and bold.' }] },
      { name: 'Create', steps: [{ title: 'Design your first piece', detail: 'Start with a cue card template or Lotería-style card.' }, { title: 'Submit to Arena', detail: 'Upload via the Design Battle Arena. STAMP review within 48 hours.' }] },
      { name: 'Compete', steps: [{ title: 'Enter a battle', detail: 'When 2+ designs in your category are approved, a Design Battle begins.' }, { title: 'Win votes', detail: 'Community votes on the Maker Spotlight. Winner gets the bounty.' }] },
      { name: 'Grow', steps: [{ title: 'Build your portfolio', detail: 'More approved designs = more royalty income.' }, { title: 'Take commissions', detail: 'Businesses can commission you directly through the Emporium.' }] },
    ],
    levelProgression: [
      { name: 'Level 1: First Submission', description: '1 design submitted and reviewed' },
      { name: 'Level 2: Template Seller', description: '3+ designs in Emporium, first royalty earned' },
      { name: 'Level 3: Battle Winner', description: 'Won a Design Battle' },
      { name: 'Level 4: Design Steward', description: '10+ active templates, steady royalty income' },
    ],
    toolLinks: [
      { name: 'Design Arena', route: '/arena', description: 'Submit designs and compete' },
      { name: 'Emporium', route: '/emporium/templates', description: 'Browse and sell templates' },
      { name: 'Cue Card Generator', route: '/tools/cue-card-generator', description: 'Generate cards for clients' },
    ],
  },
};
