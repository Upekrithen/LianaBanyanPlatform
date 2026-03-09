/**
 * FARMER SUPPLY CHAIN — Vertical Integration for LMD (#1) + LGG (#2)
 * ====================================================================
 * Innovation #1470: Cooperative Farmer-to-Node Supply Chain
 * Innovation #1471: Freeze-Dried Meal-Prep Party System
 * Innovation #1472: Advance Order Network for Non-Local Farmers
 *
 * The Problem: Farmers can't truck produce into the city. They don't have
 * a supply chain. They go to LOCAL farmers markets and sell what they brought.
 *
 * The Solution: Liana Banyan vertically integrates:
 *   Farmer → LB Pickup Driver → Distribution Node → Member
 *
 * But BETTER than local farmers markets because:
 * - Members order IN ADVANCE from the network
 * - Farmers have GUARANTEED demand before they harvest
 * - Drivers are LB members earning 83.3% of the delivery margin
 * - Nodes are physical locations (keeps, guild halls, member homes)
 * - Fresh produce AND freeze-dried meal kits
 *
 * This creates JOBS immediately:
 * - Pickup drivers (farm → node)
 * - Node operators (storage, distribution)
 * - Meal-prep party hosts (LMD initiative)
 * - Freeze-dry operators (preservation, shelf stability)
 *
 * Connects to:
 * - Let's Make Dinner (#1) — Neighbors feeding neighbors
 * - Let's Get Groceries (#2) — Community provisioning at scale
 * - Brass Tacks (#16) — Manufacturing/logistics
 * - Rally Group (#9) — Community Chalkboard for local coordination
 * - Household Concierge (#4) — Shared household provisioning
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ProduceCategory =
  | 'vegetables'
  | 'fruits'
  | 'herbs'
  | 'dairy'
  | 'eggs'
  | 'meat'
  | 'grains'
  | 'honey'
  | 'preserves'
  | 'flowers';

export type NodeType =
  | 'keep'           // Guild Tower / Keep — permanent location
  | 'guild-hall'     // Chapter meeting space
  | 'member-home'    // Home pickup point (porch/garage)
  | 'church'         // Community building
  | 'school'         // School pickup
  | 'business'       // Participating local business
  | 'mobile'         // Food truck / mobile node
  | 'farm-gate';     // The farm itself

export type OrderStatus =
  | 'advance-placed'   // Member ordered, farmer hasn't confirmed
  | 'farmer-confirmed' // Farmer confirmed availability
  | 'harvested'        // Produce picked
  | 'in-transit'       // Driver en route to node
  | 'at-node'          // Arrived at distribution point
  | 'picked-up'        // Member collected
  | 'delivered';       // Home delivery completed

export type MealPrepType =
  | 'fresh-cook'       // Fresh ingredients, cook together
  | 'freeze-dried-kit' // Freeze-dried kit assembly
  | 'mixed'            // Some fresh, some freeze-dried
  | 'preservation';    // Canning, drying, freezing party

// ═══════════════════════════════════════════════════════════════════════════════
// FARMER PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

export interface FarmerProfile {
  id: string;
  farmName: string;
  farmerName: string;
  location: {
    county: string;
    state: string;
    distanceToNearestNode: number; // miles
    coordinates?: { lat: number; lng: number };
  };

  /** What they grow/raise */
  produce: Array<{
    category: ProduceCategory;
    items: string[];              // "Roma tomatoes", "Sweet corn", etc.
    seasonalAvailability: string; // "June-September", "Year-round", etc.
    organicCertified: boolean;
    estimatedWeeklyVolume: string; // "50 lbs", "200 ears", etc.
  }>;

  /** Their current pain points (why they need LB) */
  challenges: string[];
  // Typical: "Can't afford booth at farmers market", "No way to truck into city",
  // "Waste 30% of harvest", "No advance orders = guessing demand"

  /** LB integration */
  advanceOrderEnabled: boolean;
  minimumAdvanceOrderDays: number; // How far ahead they need notice
  pickupSchedule: string[];       // "Tuesday AM", "Friday AM"
  memberSince?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISTRIBUTION NODE
// ═══════════════════════════════════════════════════════════════════════════════

export interface DistributionNode {
  id: string;
  name: string;
  type: NodeType;
  address: string;
  operatorId: string;        // LB member running this node
  operatorShare: number;     // 83.3% of node margin

  /** What this node can handle */
  capabilities: {
    refrigeration: boolean;
    freezerSpace: boolean;
    freezeDryEquipment: boolean;
    mealPrepKitchen: boolean;
    parkingSpaces: number;
    maxWeeklyVolume: string;  // "500 lbs", "2000 lbs"
  };

  /** Schedule */
  distributionDays: string[];  // "Wednesday 3-7pm", "Saturday 8am-12pm"
  advanceOrderCutoff: string;  // "Monday 6pm for Wednesday pickup"

  /** Coverage */
  servicedFarms: string[];     // Farm IDs that deliver here
  memberCount: number;         // Members who use this node
  zipCodes: string[];          // Zip codes served
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCE ORDER SYSTEM — Better Than Farmers Markets
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdvanceOrder {
  id: string;
  memberId: string;
  nodeId: string;
  status: OrderStatus;

  /** What was ordered */
  items: Array<{
    farmerId: string;
    farmerName: string;
    produceCategory: ProduceCategory;
    itemName: string;
    quantity: string;          // "5 lbs", "2 dozen", "1 bushel"
    priceCredits: number;      // In Credits (1:1 USD)
    organic: boolean;
  }>;

  /** Timing */
  orderPlacedAt: string;       // When member ordered
  deliveryWindowStart: string; // When produce will be at node
  deliveryWindowEnd: string;
  actualDeliveryAt?: string;

  /** Economics */
  subtotal: number;            // Total Credits
  farmerShare: number;         // 83.3% to farmer
  driverShare: number;         // Driver fee (from remaining margin)
  nodeOperatorShare: number;   // Node operator fee
  platformMargin: number;      // Cost + 20% (constitutionally locked)

  /** Logistics */
  driverId?: string;           // Assigned pickup driver
  pickupRoute?: string;        // Route optimization
}

/**
 * Why this is BETTER than local farmers markets:
 *
 * 1. ADVANCE ORDERS — Farmers know demand BEFORE harvesting.
 *    No more guessing, no more waste, no more hauling unsold produce home.
 *
 * 2. NOT LOCAL — Farmers don't need to be near a market. LB provides
 *    the supply chain (pickup drivers) that they can't afford alone.
 *
 * 3. GUARANTEED JOBS — Pickup drivers, node operators, meal-prep hosts
 *    all earn 83.3% of their margin. Real jobs, immediate.
 *
 * 4. VERTICAL INTEGRATION — Farm → Driver → Node → Member.
 *    Each step is a cooperative member earning their share.
 *
 * 5. NETWORK EFFECTS — More members = more advance orders = more farmers
 *    join = more variety = more members. Virtuous cycle.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// FREEZE-DRIED MEAL-PREP PARTY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export interface FreezeDriedKit {
  id: string;
  name: string;
  description: string;
  servings: number;
  shelfLife: string;           // "25 years" for freeze-dried, "6 months" for dehydrated

  /** Ingredients */
  ingredients: Array<{
    name: string;
    source: 'local-farm' | 'bulk-cooperative' | 'specialty';
    farmerId?: string;         // Which farmer grew this
    preservationMethod: 'freeze-dried' | 'dehydrated' | 'fresh' | 'canned';
    weight: string;
  }>;

  /** Economics — $5/serving model */
  costBasis: number;           // Cost to produce (ingredients + freeze-drying)
  c20Price: number;            // Cost + 20% floor

  /** Three-tier pricing: advance, walk-up, bulk */
  pricing: {
    advancePerServing: number;   // $5.00 — order 48+ hours ahead
    walkUpPerServing: number;    // $7.00 — on-demand at node
    bulkPerServing: number;      // $4.00 — standing order 10+ kits/week
    advancePerKit: number;       // $5 × servings
    walkUpPerKit: number;        // $7 × servings
    bulkPerKit: number;          // $4 × servings
  };

  /** Revenue distribution */
  farmerRevenue: number;       // Total going to farmers
  prepHostRevenue: number;     // Meal-prep party host share
  distributorMargin: number;   // What the local distributor keeps (83.3% of margin)

  /** Meal-prep party connection */
  mealPrepPartyCompatible: boolean;
  cookTime: string;            // "15 minutes" (just add water)
  difficulty: 'easy' | 'medium' | 'advanced';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCE ORDER SCHEDULING — "Literally use it tomorrow"
// ═══════════════════════════════════════════════════════════════════════════════

export type OrderFrequency = 'one-time' | 'weekly' | 'biweekly' | 'monthly';

export interface StandingOrder {
  id: string;
  memberId: string;
  nodeId: string;

  /** What's being ordered */
  items: Array<{
    kitId: string;
    kitName: string;
    quantity: number;           // How many kits per delivery
    servings: number;           // Total servings per delivery
  }>;

  /** Schedule */
  frequency: OrderFrequency;
  preferredDay: string;         // "Wednesday", "Saturday"
  preferredTimeWindow: string;  // "3-5pm", "8-10am"
  advanceNoticeDays: number;    // Minimum 2 days (48 hours)
  nextDeliveryDate: string;

  /** Pricing tier */
  pricingTier: 'advance' | 'bulk';  // Never 'walk-up' for standing orders
  pricePerServing: number;     // $5.00 or $4.00
  weeklyTotal: number;         // Total Credits per week

  /** Status */
  isActive: boolean;
  isPaused: boolean;
  pauseUntil?: string;
  createdAt: string;

  /** The business model */
  distributorId?: string;      // Member who assembled & delivers the kits
  distributorEarnings: number; // 83.3% of margin per delivery
}

export interface LocalDistributorBusiness {
  id: string;
  memberId: string;
  businessName: string;

  /** Coverage */
  serviceArea: string[];       // Zip codes / neighborhoods
  nodeIds: string[];           // Nodes they distribute from

  /** Inventory */
  kitTypesOffered: string[];   // Kit IDs they produce
  weeklyCapacity: number;      // Max kits per week

  /** Economics — THE BUSINESS MODEL */
  economics: {
    costPerServingC20: number;        // ~$1.25-1.50 (C20 floor)
    advanceRetailPerServing: number;  // $5.00
    walkUpRetailPerServing: number;   // $7.00
    bulkRetailPerServing: number;     // $4.00

    /** Per 4-serving kit margins */
    advanceMarginPerKit: number;      // $20 - $6 = $14
    walkUpMarginPerKit: number;       // $28 - $6 = $22
    bulkMarginPerKit: number;         // $16 - $6 = $10

    /** Distributor keeps 83.3% */
    advanceEarningsPerKit: number;    // $14 × 0.833 = $11.66
    walkUpEarningsPerKit: number;     // $22 × 0.833 = $18.33
    bulkEarningsPerKit: number;       // $10 × 0.833 = $8.33

    /** Monthly projections (25 working days) */
    kitsPerDay: number;               // Target: 10
    monthlyRevenue: number;           // 10 × $11.66 × 25 = $2,915
    monthlyKits: number;              // 250
    monthlyServings: number;          // 1,000
  };

  /** Standing orders served */
  activeStandingOrders: number;

  /** Status */
  isActive: boolean;
  memberSince: string;
}

export interface MealPrepParty {
  id: string;
  hostId: string;              // LMD cook hosting the party
  hostName: string;
  type: MealPrepType;

  /** Location */
  nodeId?: string;             // At a distribution node
  homeAddress?: string;        // At host's home

  /** What's being prepped */
  kits: Array<{
    kitId: string;
    kitName: string;
    quantity: number;           // How many kits being assembled
  }>;

  /** Participants */
  maxParticipants: number;
  currentParticipants: number;
  participantFee: number;      // Credits per person (covers kit cost + host fee)

  /** Schedule */
  date: string;
  startTime: string;
  duration: string;            // "2 hours"

  /** Economics (LMD model: 83.3% to the cook) */
  totalRevenue: number;
  hostShare: number;           // 83.3% of hosting margin
  ingredientCost: number;      // Goes to farmers
  platformMargin: number;      // Cost + 20%
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRIVER & ROUTE SYSTEM — The Jobs Engine
// ═══════════════════════════════════════════════════════════════════════════════

export interface PickupDriver {
  id: string;
  name: string;
  vehicle: {
    type: 'car' | 'van' | 'truck' | 'refrigerated-van';
    capacity: string;          // "500 lbs", "2000 lbs"
    hasRefrigeration: boolean;
  };

  /** Coverage */
  serviceArea: string[];       // Counties/zip codes
  assignedFarms: string[];     // Farm IDs on their route
  assignedNodes: string[];     // Node IDs they deliver to

  /** Schedule */
  availableDays: string[];     // "Tuesday", "Friday"
  routeOptimized: boolean;     // Has route been optimized

  /** Economics */
  earningsPerRoute: number;    // Average Credits per run
  weeklyRoutes: number;
  monthlyEarnings: number;
  creatorShare: 0.833;         // 83.3% of delivery margin
}

export interface PickupRoute {
  id: string;
  driverId: string;
  date: string;

  /** Stops */
  stops: Array<{
    order: number;
    type: 'farm-pickup' | 'node-delivery';
    locationId: string;
    locationName: string;
    estimatedArrival: string;
    items: string[];           // What's being picked up or dropped off
    weight: string;            // Total weight this stop
  }>;

  /** Route stats */
  totalMiles: number;
  totalStops: number;
  estimatedDuration: string;   // "3 hours"
  fuelCost: number;
  driverEarnings: number;      // 83.3% of delivery margin
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERTICAL INTEGRATION MAP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * THE VERTICAL INTEGRATION:
 *
 * ┌─────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐
 * │  FARMER  │ ──→ │  DRIVER  │ ──→ │   NODE   │ ──→ │ MEMBER │
 * │  (83.3%) │     │  (83.3%) │     │  (83.3%) │     │        │
 * └─────────┘     └──────────┘     └──────────┘     └────────┘
 *     ↑                                                   │
 *     └──── ADVANCE ORDER (guaranteed demand) ────────────┘
 *
 * Each step is a cooperative member earning 83.3%.
 * Platform takes Cost + 20% at each margin.
 * Farmer gets guaranteed demand.
 * Driver gets a job.
 * Node operator gets a job.
 * Member gets fresh produce, no farmers market trip needed.
 *
 * FREEZE-DRIED EXTENSION:
 *
 * ┌─────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐
 * │  FARMER  │ ──→ │  DRIVER  │ ──→ │ FREEZE-DRY│ ──→ │ MEAL KIT │
 * │  (83.3%) │     │  (83.3%) │     │ OPERATOR  │     │ ASSEMBLY │
 * └─────────┘     └──────────┘     │  (83.3%)  │     │  (83.3%) │
 *                                   └───────────┘     └──────────┘
 *                                                          │
 *                                                     ┌────┴─────┐
 *                                                     │ MEAL-PREP│
 *                                                     │  PARTY   │
 *                                                     │  (LMD)   │
 *                                                     └──────────┘
 *
 * Shelf life: 25 YEARS (freeze-dried)
 * Emergency preparedness + daily convenience
 * Made from LOCAL farm produce, not industrial
 */

export const VERTICAL_INTEGRATION_JOBS = [
  {
    role: 'Pickup Driver',
    initiative: "Let's Get Groceries (#2)",
    description: 'Drives route from farms to distribution nodes',
    requirements: 'Vehicle, cooler/refrigeration for perishables',
    earnings: '83.3% of delivery margin per route',
    frequency: '2-5 routes per week',
    immediateStart: true,
  },
  {
    role: 'Node Operator',
    initiative: "Let's Get Groceries (#2)",
    description: 'Runs a distribution point (porch, garage, church, business)',
    requirements: 'Space for storage, refrigeration preferred',
    earnings: '83.3% of node operating margin',
    frequency: '2-3 distribution days per week',
    immediateStart: true,
  },
  {
    role: 'Meal-Prep Party Host',
    initiative: "Let's Make Dinner (#1)",
    description: 'Hosts community cooking events, assembles freeze-dried kits',
    requirements: 'Kitchen space, food handler cert preferred',
    earnings: '83.3% of hosting fee',
    frequency: '1-4 parties per month',
    immediateStart: true,
  },
  {
    role: 'Freeze-Dry Operator',
    initiative: 'Brass Tacks (#16)',
    description: 'Operates freeze-dry equipment to preserve farm produce',
    requirements: 'Freeze-dryer (Harvest Right ~$2,500), food safety cert',
    earnings: '83.3% of processing margin',
    frequency: 'Continuous (24-48 hour cycles)',
    immediateStart: true,
  },
  {
    role: 'Farm Liaison',
    initiative: 'Rally Group (#9)',
    description: 'Recruits and coordinates with local farmers',
    requirements: 'Agricultural knowledge, relationship building',
    earnings: '83.3% of coordination margin',
    frequency: 'Ongoing',
    immediateStart: true,
  },
  {
    role: 'Route Optimizer',
    initiative: "Let's Get Groceries (#2)",
    description: 'Plans efficient pickup routes across multiple farms',
    requirements: 'Logistics planning, mapping tools',
    earnings: '83.3% of planning margin',
    frequency: 'Weekly route planning',
    immediateStart: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FREEZE-DRY EQUIPMENT REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════

export const FREEZE_DRY_EQUIPMENT = {
  recommended: {
    brand: 'Harvest Right',
    models: [
      { name: 'Small', capacity: '4-7 lbs per batch', price: 2195, footprint: '16.5" W × 18.5" D × 25" H' },
      { name: 'Medium', capacity: '7-10 lbs per batch', price: 2795, footprint: '18" W × 21.25" D × 28.5" H' },
      { name: 'Large', capacity: '12-16 lbs per batch', price: 3495, footprint: '20.25" W × 23.75" D × 30.75" H' },
      { name: 'X-Large', capacity: '18-27 lbs per batch', price: 5295, footprint: '23.75" W × 29.75" D × 32" H' },
    ],
    cycleDuration: '24-48 hours per batch',
    shelfLife: '25 years when properly sealed',
  },

  economics: {
    costPerPound: 1.25,        // Average electricity + wear cost
    retailPerPound: 8.00,      // Average retail for freeze-dried
    c20PerPound: 1.50,         // Cost + 20%
    marginPerPound: 6.50,      // Revenue above C20
    farmerSharePerPound: 5.42, // 83.3% of margin
  },

  // Pool model: Chapter buys equipment together
  poolModel: {
    description: 'Guild chapter pools Credits to buy a freeze-dryer, shares usage',
    membersPerPool: 10,
    costPerMember: 280,        // $2,795 / 10 members
    usageSchedule: 'Rotating 48-hour batches',
    monthlyCapacity: '150-200 lbs per month',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE MEAL-PREP KITS
// ═══════════════════════════════════════════════════════════════════════════════

export const SAMPLE_KITS: FreezeDriedKit[] = [
  {
    id: 'kit-hearty-harvest-stew',
    name: 'Hearty Harvest Stew',
    description: 'Farm-fresh vegetables in a savory broth. Just add water, simmer 15 minutes.',
    servings: 4,
    shelfLife: '25 years',
    ingredients: [
      { name: 'Potatoes', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '4 oz' },
      { name: 'Carrots', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '3 oz' },
      { name: 'Onions', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '2 oz' },
      { name: 'Green Beans', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '3 oz' },
      { name: 'Beef Broth Base', source: 'bulk-cooperative', preservationMethod: 'dehydrated', weight: '2 oz' },
      { name: 'Herb Blend', source: 'local-farm', preservationMethod: 'dehydrated', weight: '0.5 oz' },
    ],
    costBasis: 4.50,
    c20Price: 5.40,
    pricing: {
      advancePerServing: 5.00,   // $5/serving advance order
      walkUpPerServing: 7.00,    // $7/serving walk-up
      bulkPerServing: 4.00,      // $4/serving bulk (10+ kits/week)
      advancePerKit: 20.00,      // $5 × 4 servings
      walkUpPerKit: 28.00,       // $7 × 4 servings
      bulkPerKit: 16.00,         // $4 × 4 servings
    },
    farmerRevenue: 3.75,
    prepHostRevenue: 1.66,
    distributorMargin: 11.66,    // ($20 - $5.40) × 83.3%
    mealPrepPartyCompatible: true,
    cookTime: '15 minutes',
    difficulty: 'easy',
  },
  {
    id: 'kit-garden-pasta-primavera',
    name: 'Garden Pasta Primavera',
    description: 'Seasonal vegetables over pasta with garlic herb sauce. Just add water, cook 20 minutes.',
    servings: 4,
    shelfLife: '25 years',
    ingredients: [
      { name: 'Zucchini', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '3 oz' },
      { name: 'Bell Peppers', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '3 oz' },
      { name: 'Cherry Tomatoes', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '2 oz' },
      { name: 'Pasta', source: 'bulk-cooperative', preservationMethod: 'dehydrated', weight: '8 oz' },
      { name: 'Garlic Herb Sauce Mix', source: 'specialty', preservationMethod: 'dehydrated', weight: '2 oz' },
      { name: 'Parmesan', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '1 oz' },
    ],
    costBasis: 5.00,
    c20Price: 6.00,
    pricing: {
      advancePerServing: 5.00,
      walkUpPerServing: 7.00,
      bulkPerServing: 4.00,
      advancePerKit: 20.00,
      walkUpPerKit: 28.00,
      bulkPerKit: 16.00,
    },
    farmerRevenue: 4.17,
    prepHostRevenue: 1.83,
    distributorMargin: 11.66,
    mealPrepPartyCompatible: true,
    cookTime: '20 minutes',
    difficulty: 'easy',
  },
  {
    id: 'kit-breakfast-scramble',
    name: 'Farm Breakfast Scramble',
    description: 'Eggs, peppers, onions, potatoes, cheese. Just add water, cook 10 minutes in skillet.',
    servings: 2,
    shelfLife: '25 years',
    ingredients: [
      { name: 'Scrambled Egg Mix', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '4 oz' },
      { name: 'Bell Peppers', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '2 oz' },
      { name: 'Onions', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '1 oz' },
      { name: 'Hash Brown Potatoes', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '3 oz' },
      { name: 'Cheddar Cheese', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '1.5 oz' },
    ],
    costBasis: 3.50,
    c20Price: 4.20,
    pricing: {
      advancePerServing: 5.00,
      walkUpPerServing: 7.00,
      bulkPerServing: 4.00,
      advancePerKit: 10.00,       // $5 × 2 servings
      walkUpPerKit: 14.00,        // $7 × 2 servings
      bulkPerKit: 8.00,           // $4 × 2 servings
    },
    farmerRevenue: 2.92,
    prepHostRevenue: 1.25,
    distributorMargin: 4.66,     // ($10 - $4.20) × 83.3%
    mealPrepPartyCompatible: true,
    cookTime: '10 minutes',
    difficulty: 'easy',
  },
  {
    id: 'kit-chicken-veggie-soup',
    name: 'Farmhouse Chicken Veggie Soup',
    description: 'Hearty chicken with farm vegetables in savory broth. Just add water, simmer 15 minutes.',
    servings: 4,
    shelfLife: '25 years',
    ingredients: [
      { name: 'Chicken Breast', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '4 oz' },
      { name: 'Carrots', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '2 oz' },
      { name: 'Celery', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '2 oz' },
      { name: 'Onions', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '1.5 oz' },
      { name: 'Egg Noodles', source: 'bulk-cooperative', preservationMethod: 'dehydrated', weight: '4 oz' },
      { name: 'Chicken Broth Base', source: 'bulk-cooperative', preservationMethod: 'dehydrated', weight: '2 oz' },
      { name: 'Herb Blend', source: 'local-farm', preservationMethod: 'dehydrated', weight: '0.5 oz' },
    ],
    costBasis: 5.50,
    c20Price: 6.60,
    pricing: {
      advancePerServing: 5.00,
      walkUpPerServing: 7.00,
      bulkPerServing: 4.00,
      advancePerKit: 20.00,
      walkUpPerKit: 28.00,
      bulkPerKit: 16.00,
    },
    farmerRevenue: 4.58,
    prepHostRevenue: 1.92,
    distributorMargin: 11.16,
    mealPrepPartyCompatible: true,
    cookTime: '15 minutes',
    difficulty: 'easy',
  },
  {
    id: 'kit-chili-con-carne',
    name: 'Frontier Chili Con Carne',
    description: 'Spiced ground beef with beans, tomatoes, peppers. Just add water, simmer 20 minutes.',
    servings: 4,
    shelfLife: '25 years',
    ingredients: [
      { name: 'Ground Beef', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '5 oz' },
      { name: 'Kidney Beans', source: 'bulk-cooperative', preservationMethod: 'dehydrated', weight: '4 oz' },
      { name: 'Diced Tomatoes', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '3 oz' },
      { name: 'Bell Peppers', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '2 oz' },
      { name: 'Onions', source: 'local-farm', preservationMethod: 'freeze-dried', weight: '1.5 oz' },
      { name: 'Chili Spice Blend', source: 'specialty', preservationMethod: 'dehydrated', weight: '1 oz' },
    ],
    costBasis: 6.00,
    c20Price: 7.20,
    pricing: {
      advancePerServing: 5.00,
      walkUpPerServing: 7.00,
      bulkPerServing: 4.00,
      advancePerKit: 20.00,
      walkUpPerKit: 28.00,
      bulkPerKit: 16.00,
    },
    farmerRevenue: 5.00,
    prepHostRevenue: 2.08,
    distributorMargin: 10.66,
    mealPrepPartyCompatible: true,
    cookTime: '20 minutes',
    difficulty: 'easy',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HOW IT ALL CONNECTS
// ═══════════════════════════════════════════════════════════════════════════════

export const INITIATIVE_CONNECTIONS = {
  lmd: {
    number: 1,
    name: "Let's Make Dinner",
    role: 'Meal-prep parties, community cooking events, recipe sharing',
    connection: 'Hosts use farm-fresh and freeze-dried ingredients from LGG supply chain',
  },
  lgg: {
    number: 2,
    name: "Let's Get Groceries",
    role: 'Advance ordering, farmer coordination, node distribution',
    connection: 'Manages the vertical supply chain from farm to member',
  },
  brassTacks: {
    number: 16,
    name: 'Brass Tacks',
    role: 'Manufacturing, equipment pooling, freeze-dry operations',
    connection: 'Pioneer Nodes for freeze-dry equipment, packaging, logistics',
  },
  rallyGroup: {
    number: 9,
    name: 'Rally Group',
    role: 'Community coordination, farmer recruitment',
    connection: 'Community Chalkboard connects farmers with driver/node volunteers',
  },
  householdConcierge: {
    number: 4,
    name: 'Household Concierge',
    role: 'Home delivery, shared Butler provisioning',
    connection: 'Shared Butler handles weekly produce ordering for households',
  },
  vsl: {
    number: 10,
    name: 'VSL (Voucher Short Loans)',
    role: 'Equipment financing',
    connection: 'Voucher loans for freeze-dry equipment ($2,195-$5,295)',
  },
  letsMakeBread: {
    number: 11,
    name: "Let's Make Bread",
    role: 'Business incubation',
    connection: 'Incubates farmer cooperatives and freeze-dry businesses',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// $5/SERVING BUSINESS MODEL — "A business making and job creating machine"
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * THE $5/SERVING MODEL:
 *
 * Once freeze-dried kits are made, ANY member can build a business
 * supplying their local area with "just add water and cook" meals
 * made from REAL farm produce (not industrial).
 *
 * PRICING TIERS:
 * ┌──────────────────┬──────────────┬──────────────────────────────┐
 * │ Tier             │ Per Serving  │ Condition                    │
 * ├──────────────────┼──────────────┼──────────────────────────────┤
 * │ Advance Order    │ $5.00        │ Order 48+ hours ahead        │
 * │ Walk-Up/Retail   │ $7.00        │ On-demand at node            │
 * │ Bulk Advance     │ $4.00        │ Standing order 10+ kits/week │
 * └──────────────────┴──────────────┴──────────────────────────────┘
 *
 * DISTRIBUTOR BUSINESS MODEL (4-serving kit):
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ Buy ingredients at C20:        ~$1.35/serving = $5.40/kit       │
 * │ Sell at advance order price:    $5.00/serving = $20.00/kit      │
 * │ Gross margin:                                  $14.60/kit       │
 * │ Distributor keeps 83.3%:                       $12.16/kit       │
 * │                                                                  │
 * │ 10 kits/day × $12.16 = $121.60/day                              │
 * │ 25 working days × $121.60 = $3,040/month                        │
 * │                                                                  │
 * │ THAT'S A REAL BUSINESS.                                         │
 * │ Fresh farm ingredients. 25-year shelf life. Just add water.     │
 * └──────────────────────────────────────────────────────────────────┘
 */

export const FIVE_DOLLAR_SERVING_MODEL = {
  pricingTiers: {
    advance: {
      perServing: 5.00,
      condition: 'Order 48+ hours in advance via platform scheduling',
      discount: '29% off walk-up',
    },
    walkUp: {
      perServing: 7.00,
      condition: 'On-demand purchase at any distribution node',
      discount: 'Standard retail',
    },
    bulk: {
      perServing: 4.00,
      condition: 'Standing order of 10+ kits per week',
      discount: '43% off walk-up',
    },
  },

  distributorBusinessModel: {
    description: 'Any member can start a freeze-dried meal-kit distribution business',
    startupCost: 'None (use shared guild chapter freeze-dryer) or $2,195-$5,295 (own equipment)',
    ingredientCostPerServing: 1.35,   // Average C20 cost
    ingredientCostPerKit4Serving: 5.40,
    advanceRetailPerKit: 20.00,       // $5 × 4
    grossMarginPerKit: 14.60,         // $20 - $5.40
    distributorSharePercent: 83.3,
    distributorEarningsPerKit: 12.16, // $14.60 × 0.833

    /** Daily projections */
    targetKitsPerDay: 10,
    dailyEarnings: 121.60,           // 10 × $12.16

    /** Monthly projections (25 working days) */
    monthlyKits: 250,
    monthlyServings: 1000,
    monthlyEarnings: 3040.00,        // 25 × $121.60
    monthlyIngredientCost: 1350.00,  // 250 × $5.40
    monthlyRevenue: 5000.00,         // 250 × $20

    /** What the member needs */
    requirements: [
      'Food handler certification (varies by state, typically $15-25 online)',
      'Access to freeze-dry equipment (own or guild chapter pool)',
      'Kitchen space for kit assembly',
      'Storage for completed kits (room temperature, sealed)',
      'Distribution node access or home-based distribution',
    ],

    /** Why this works immediately */
    immediateStart: true,
    noInventoryRisk: 'Advance orders guarantee demand before production',
    shelfLife: '25 years — no spoilage risk',
    noStorefrontNeeded: 'Distribute through LB nodes, farmers markets, or direct delivery',
  },

  /** How advance ordering creates the business */
  advanceOrderBenefits: {
    forFarmers: 'Guaranteed demand before harvest — zero waste',
    forDrivers: 'Reliable routes with confirmed stops',
    forDistributors: 'Pre-sold inventory — make only what is ordered',
    forMembers: '$5/serving for farm-fresh meals, 25-year shelf life',
    forCommunity: '6+ job types created immediately at every node',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE LOCAL DISTRIBUTOR BUSINESS
// ═══════════════════════════════════════════════════════════════════════════════

export const SAMPLE_DISTRIBUTOR: LocalDistributorBusiness = {
  id: 'dist-sample-001',
  memberId: 'member-sample-001',
  businessName: 'Farm Fresh Meals by Sarah',

  serviceArea: ['37201', '37203', '37204', '37206', '37210'],  // Nashville zip codes
  nodeIds: ['node-east-nashville', 'node-germantown'],

  kitTypesOffered: [
    'kit-hearty-harvest-stew',
    'kit-garden-pasta-primavera',
    'kit-breakfast-scramble',
    'kit-chicken-veggie-soup',
    'kit-chili-con-carne',
  ],
  weeklyCapacity: 70,  // 10/day × 7 days (flexible)

  economics: {
    costPerServingC20: 1.35,
    advanceRetailPerServing: 5.00,
    walkUpRetailPerServing: 7.00,
    bulkRetailPerServing: 4.00,

    advanceMarginPerKit: 14.60,    // $20 - $5.40
    walkUpMarginPerKit: 22.60,     // $28 - $5.40
    bulkMarginPerKit: 10.60,       // $16 - $5.40

    advanceEarningsPerKit: 12.16,  // $14.60 × 0.833
    walkUpEarningsPerKit: 18.83,   // $22.60 × 0.833
    bulkEarningsPerKit: 8.83,      // $10.60 × 0.833

    kitsPerDay: 10,
    monthlyRevenue: 5000.00,
    monthlyKits: 250,
    monthlyServings: 1000,
  },

  activeStandingOrders: 15,
  isActive: true,
  memberSince: '2026-03-06',
};
