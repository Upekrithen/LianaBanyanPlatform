/**
 * NPC SHOPKEEPER SYSTEM — Automated In-Game Commerce
 * =====================================================
 * Innovation #1529: NPC Shopkeeper System
 *
 * NPCs operate storefronts, inns, and service points within HexIsle.
 * They are NOT AI chatbots. They are automated transaction endpoints
 * with personality, inventory, and pricing logic.
 *
 * Architecture:
 *   - Each NPC has a fixed location (hex position in a city/district)
 *   - NPCs sell items from their inventory at C+20% minimum
 *   - NPCs buy items from players (at cost or below — they need margin too)
 *   - Transactions use the three-currency system (Credits, Marks, Joules)
 *   - All transactions confirmed with "As You Wish" phrase
 *   - Harper NPCs monitor for price manipulation and fraud
 *
 * NPC Types:
 *   - Shopkeeper: buys/sells physical and digital goods
 *   - Innkeeper: manages room rentals and accommodations
 *   - Realtor: manages plot rentals (already exists in hexRealEstate.ts)
 *   - Guildmaster: manages guild operations and bounties
 *   - Ferryman: manages inter-island transport
 *   - Postmaster: manages outbound dispatch / mail
 *
 * "Say what you Do. Do what you Say."
 * NPCs follow the same rules as everyone else. C+20% floor. No exceptions.
 */

// ============================================================================
// TYPES
// ============================================================================

export type NPCType =
  | 'shopkeeper'     // General goods merchant
  | 'innkeeper'      // Room and board
  | 'realtor'        // Plot rental agent (bridge to hexRealEstate.ts)
  | 'guildmaster'    // Guild operations
  | 'ferryman'       // Inter-island transport
  | 'postmaster'     // Dispatch and mail
  | 'artisan'        // Crafting services
  | 'alchemist'      // Transformations (currency exchange, item conversion)
  | 'librarian'      // Content Pipeline access, Areopagus lookup
  | 'harper';        // Undercover agent (already defined in hexRealEstate.ts)

export type CurrencyType = 'credits' | 'marks' | 'joules';

export type ItemCategory =
  | 'material'       // Raw materials for crafting
  | 'tool'           // Tools and equipment
  | 'consumable'     // Single-use items (candles, keys, potions)
  | 'blueprint'      // Product blueprints / designs
  | 'deck_card'      // Collectible deck cards
  | 'cosmetic'       // Visual customizations
  | 'service'        // Non-tangible services (repair, transport, lodging)
  | 'treasure_key'   // Golden keys and treasure items
  | 'capstone'       // Capstone hex pieces (physical or digital)
  | 'guild_supply';  // Guild-specific supplies

export type TransactionType = 'buy' | 'sell' | 'trade' | 'rent' | 'service';

export interface NPCDef {
  id: string;
  name: string;
  title: string;
  npcType: NPCType;
  // Location
  islandId: number;
  cityId: string;
  districtId: string;
  hexPosition: { q: number; r: number };
  // Personality
  greeting: string;
  farewell: string;
  haggleResponse: string;       // Response when player tries to haggle
  outOfStockResponse: string;
  // Inventory
  inventory: ShopInventoryItem[];
  restockIntervalHours: number; // How often inventory refreshes
  lastRestockedAt: string;
  // Pricing
  buyMarkup: number;            // Multiplier on base cost (minimum 1.2 = C+20%)
  sellDiscount: number;         // Multiplier on base cost for buy-back (e.g., 0.7 = 70% of base)
  acceptedCurrencies: CurrencyType[];
  // Operating hours (optional — some NPCs close at night)
  operatingHours?: { open: number; close: number }; // 0-23 UTC
  // Relationships
  guildAffiliation?: string;    // Which guild this NPC belongs to
  harperWatched: boolean;       // Is a Harper monitoring this NPC's district?
  // Metadata
  level: number;                // NPC level affects inventory quality
  reputation: number;           // Community trust score
  description: string;
}

export interface ShopInventoryItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  // Pricing
  baseCost: number;             // Raw cost in Credits
  sellPrice: number;            // What NPC sells it for (baseCost * buyMarkup, min C+20%)
  buyBackPrice: number;         // What NPC pays player for it (baseCost * sellDiscount)
  // Stock
  currentStock: number;
  maxStock: number;
  restockAmount: number;        // How many added per restock cycle
  // Requirements
  requiredLevel?: number;       // Player level required to purchase
  requiredGuild?: string;       // Guild membership required
  requiredBadge?: string;       // Badge required (e.g., Areopagus badges)
  // Properties
  weight: number;               // Inventory weight (affects carrying capacity)
  stackable: boolean;
  maxStack: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  // Physical product link (if this is a real product on the marketplace)
  marketplaceProductId?: string;
  blueprintScrollId?: string;
  innovationNumber?: number;
}

export interface NPCTransaction {
  id: string;
  npcId: string;
  playerId: string;
  transactionType: TransactionType;
  items: TransactionItem[];
  totalCost: number;
  currency: CurrencyType;
  timestamp: string;
  confirmed: boolean;           // "As You Wish" confirmation received
  // Harper tracking
  flaggedByHarper: boolean;
  flagReason?: string;
}

export interface TransactionItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// ============================================================================
// NPC DEFINITIONS — Verdana (Port City, Island 1)
// ============================================================================

export const VERDANA_NPCS: NPCDef[] = [
  // === MARKET DISTRICT ===
  {
    id: 'npc-verdana-general',
    name: 'Mercer Flint',
    title: 'General Merchant',
    npcType: 'shopkeeper',
    islandId: 1,
    cityId: 'verdana',
    districtId: 'market',
    hexPosition: { q: 2, r: -1 },
    greeting: "Welcome to Flint's Goods! Everything here is honestly priced. Cost plus twenty — that's the Verdana way.",
    farewell: "May your pockets be heavier going out than coming in.",
    haggleResponse: "Friend, the price is fair. Cost plus twenty. I follow the same rules you do.",
    outOfStockResponse: "Fresh stock comes with the morning tide. Check back soon.",
    inventory: [
      createInventoryItem('basic-candle', 'Candle', 'Lights the way in Ghost World. Burns for one area.', 'consumable', 2, 5, 10),
      createInventoryItem('explorer-map', 'Explorer Map Fragment', 'Reveals one undiscovered area on the current island.', 'consumable', 10, 3, 2),
      createInventoryItem('guild-badge-blank', 'Blank Guild Badge', 'Unaffiliated badge. Take to a Guildmaster to activate.', 'guild_supply', 5, 10, 5),
      createInventoryItem('basic-tool-kit', 'Basic Tool Kit', 'Essential tools for crafting and repair. Required for workshops.', 'tool', 25, 2, 1),
      createInventoryItem('capstone-template', 'Capstone Template (Small)', 'Template for designing a small Capstone hex piece.', 'capstone', 15, 3, 1),
    ],
    restockIntervalHours: 24,
    lastRestockedAt: new Date().toISOString(),
    buyMarkup: 1.2,
    sellDiscount: 0.7,
    acceptedCurrencies: ['credits', 'marks'],
    guildAffiliation: 'anvil',
    harperWatched: true,
    level: 5,
    reputation: 100,
    description: 'The most reliable general merchant in Verdana. Fair prices, honest weights.',
  },

  // === FORGE DISTRICT ===
  {
    id: 'npc-verdana-smith',
    name: 'Kira Ashdown',
    title: 'Master Smith',
    npcType: 'artisan',
    islandId: 1,
    cityId: 'verdana',
    districtId: 'forge',
    hexPosition: { q: -2, r: 2 },
    greeting: "Need something forged? I work in metal, wood, and composite. Bring me materials and a design.",
    farewell: "Solid work takes time. I'll have it ready.",
    haggleResponse: "My hands are my price. You're paying for skill, not just material.",
    outOfStockResponse: "I'm a maker, not a stockist. Bring me the materials and I'll make what you need.",
    inventory: [
      createInventoryItem('iron-ingot', 'Iron Ingot', 'Standard forging material. Required for most metal crafts.', 'material', 8, 20, 10),
      createInventoryItem('bronze-fitting', 'Bronze Fitting', 'Precision-cast bronze component. Used in mechanism assembly.', 'material', 15, 10, 5),
      createInventoryItem('capstone-interlock', 'Capstone Interlock Set', 'Connection hardware for joining Capstone hex pieces together.', 'capstone', 30, 5, 2),
      createInventoryItem('channel-seal', 'Channel Seal Ring', 'Waterproof seal for Capstone water table channel connections.', 'capstone', 12, 8, 4),
    ],
    restockIntervalHours: 48,
    lastRestockedAt: new Date().toISOString(),
    buyMarkup: 1.25,
    sellDiscount: 0.6,
    acceptedCurrencies: ['credits', 'marks', 'joules'],
    guildAffiliation: 'hammer',
    harperWatched: false,
    level: 10,
    reputation: 85,
    description: 'Verdana\'s finest smith. Specializes in mechanism components and Capstone hardware.',
  },

  // === CANAL QUARTER ===
  {
    id: 'npc-verdana-gondolier',
    name: 'Marco Tide',
    title: 'Head Gondolier',
    npcType: 'ferryman',
    islandId: 1,
    cityId: 'verdana',
    districtId: 'canal_quarter',
    hexPosition: { q: 0, r: 2 },
    greeting: "Need a ride? The canals know every corner of Verdana. Where to?",
    farewell: "Watch your step on the dock. The water remembers those who fall in.",
    haggleResponse: "The canal tax is what it is. Take it up with the Harbor Master.",
    outOfStockResponse: "All gondolas are out right now. Wait for the next bell.",
    inventory: [
      createInventoryItem('gondola-pass-single', 'Gondola Pass (Single)', 'One ride anywhere on the Verdana canal network.', 'service', 3, 50, 20),
      createInventoryItem('gondola-pass-day', 'All-Access Canal Pass (Day)', 'Unlimited gondola rides for 24 hours.', 'service', 15, 10, 5),
      createInventoryItem('canal-map', 'Canal Network Map', 'Detailed map of all Verdana canals, docks, and venues.', 'consumable', 5, 5, 3),
    ],
    restockIntervalHours: 12,
    lastRestockedAt: new Date().toISOString(),
    buyMarkup: 1.2,
    sellDiscount: 0,
    acceptedCurrencies: ['credits'],
    harperWatched: false,
    level: 3,
    reputation: 90,
    description: 'Master of Verdana\'s gondola fleet. Knows every canal, dock, and shortcut.',
  },

  // === HARBOR DISTRICT ===
  {
    id: 'npc-verdana-ferryman',
    name: 'Captain Salt',
    title: 'Harbor Ferryman',
    npcType: 'ferryman',
    islandId: 1,
    cityId: 'verdana',
    districtId: 'harbor',
    hexPosition: { q: 3, r: -2 },
    greeting: "Looking to cross the waters? I run passage between islands. Fair weather or foul.",
    farewell: "Safe seas, traveler. The next island awaits.",
    haggleResponse: "The sea doesn't haggle, and neither do I. These waters are dangerous.",
    outOfStockResponse: "No ships sailing today. Storm warnings from the east.",
    inventory: [
      createInventoryItem('passage-rowboat', 'Rowboat Passage (Adjacent Island)', 'One-way passage to the next island by rowboat.', 'service', 10, 10, 5),
      createInventoryItem('passage-ship', 'Ship Passage (Any Island)', 'One-way passage to any discovered island by ship.', 'service', 50, 5, 2),
      createInventoryItem('sea-chart', 'Sea Chart', 'Reveals ocean routes and hazards between islands.', 'consumable', 20, 3, 1),
      createInventoryItem('storm-ward', 'Storm Ward', 'Protects against weather events during ocean crossing.', 'consumable', 15, 5, 3),
    ],
    restockIntervalHours: 24,
    lastRestockedAt: new Date().toISOString(),
    buyMarkup: 1.3,
    sellDiscount: 0,
    acceptedCurrencies: ['credits', 'joules'],
    harperWatched: true,
    level: 8,
    reputation: 95,
    description: 'The only captain in Verdana who runs regular passage between islands. Reliable, if expensive.',
  },

  // === ACADEMY DISTRICT ===
  {
    id: 'npc-verdana-librarian',
    name: 'Sage Inkwell',
    title: 'Academy Librarian',
    npcType: 'librarian',
    islandId: 1,
    cityId: 'verdana',
    districtId: 'academy',
    hexPosition: { q: -1, r: -1 },
    greeting: "Knowledge is the only currency that multiplies when shared. What are you seeking?",
    farewell: "Return anytime. The books don't mind being read again.",
    haggleResponse: "Knowledge has a price, but it's always fair. The Schoolhouse sets the rates.",
    outOfStockResponse: "That text is currently checked out. Try the Areopagus for doctrinal queries.",
    inventory: [
      createInventoryItem('coverage-minute-pack-3', 'Coverage Minutes Pack (3)', 'Grants 3 Coverage Minutes of platform education content.', 'service', 5, 20, 10),
      createInventoryItem('areopagus-access-key', 'Areopagus Access Key', 'Unlocks one deep-level Areopagus doctrine branch for exploration.', 'service', 10, 5, 3),
      createInventoryItem('blueprint-manual', 'Blueprint Scroll Manual', 'Guide to creating and following Blueprint Scroll product journeys.', 'blueprint', 8, 3, 2),
      createInventoryItem('dictionary-lens', 'Dictionary Lens', 'Highlights linked Areopagus Dictionary terms in any viewed content.', 'tool', 20, 2, 1),
    ],
    restockIntervalHours: 72,
    lastRestockedAt: new Date().toISOString(),
    buyMarkup: 1.2,
    sellDiscount: 0.5,
    acceptedCurrencies: ['credits', 'marks'],
    guildAffiliation: 'bellows',
    harperWatched: false,
    level: 12,
    reputation: 100,
    description: 'Guardian of Verdana\'s accumulated knowledge. Connects seekers to the Content Pipeline and Areopagus.',
  },

  // === THE HEXAGON (Government Center) ===
  {
    id: 'npc-verdana-postmaster',
    name: 'Courier Brass',
    title: 'Postmaster General',
    npcType: 'postmaster',
    islandId: 1,
    cityId: 'verdana',
    districtId: 'hexagon',
    hexPosition: { q: 0, r: 0 },
    greeting: "Messages, parcels, dispatches — if it needs to get somewhere, I'm your person.",
    farewell: "Your message is in good hands. As You Wish.",
    haggleResponse: "Postal rates are fixed by the Hexagon. I don't set the prices.",
    outOfStockResponse: "No outbound ships today. Your message will go with the next tide.",
    inventory: [
      createInventoryItem('dispatch-stamp', 'Dispatch Stamp', 'Required to send any outbound message or package through the postal system.', 'service', 2, 50, 25),
      createInventoryItem('priority-seal', 'Priority Seal', 'Marks a dispatch as urgent. Processed ahead of standard queue.', 'service', 10, 10, 5),
      createInventoryItem('cue-card-blank', 'Blank Cue Card', 'Unminted cue card. Write your content, then stamp to share.', 'consumable', 5, 20, 10),
    ],
    restockIntervalHours: 12,
    lastRestockedAt: new Date().toISOString(),
    buyMarkup: 1.2,
    sellDiscount: 0,
    acceptedCurrencies: ['credits'],
    harperWatched: true,
    level: 7,
    reputation: 100,
    description: 'Runs the Verdana postal system. All outbound dispatches pass through Courier Brass.',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createInventoryItem(
  id: string,
  name: string,
  description: string,
  category: ItemCategory,
  baseCost: number,
  maxStock: number,
  restockAmount: number,
  rarity: ShopInventoryItem['rarity'] = 'common'
): ShopInventoryItem {
  return {
    id,
    name,
    description,
    category,
    baseCost,
    sellPrice: Math.ceil(baseCost * 1.2), // C+20% minimum
    buyBackPrice: Math.floor(baseCost * 0.7),
    currentStock: maxStock,
    maxStock,
    restockAmount,
    weight: 1,
    stackable: category === 'consumable' || category === 'material',
    maxStack: category === 'consumable' ? 99 : category === 'material' ? 50 : 1,
    rarity,
  };
}

/**
 * Process a purchase transaction.
 * Returns the transaction record or null if invalid.
 */
export function processPurchase(
  npc: NPCDef,
  playerId: string,
  itemId: string,
  quantity: number,
  currency: CurrencyType,
  playerBalance: number
): NPCTransaction | null {
  // Find item in inventory
  const item = npc.inventory.find(i => i.id === itemId);
  if (!item) return null;

  // Check stock
  if (item.currentStock < quantity) return null;

  // Check currency acceptance
  if (!npc.acceptedCurrencies.includes(currency)) return null;

  // Calculate total
  const totalCost = item.sellPrice * quantity;
  if (playerBalance < totalCost) return null;

  // Create transaction
  const transaction: NPCTransaction = {
    id: crypto.randomUUID(),
    npcId: npc.id,
    playerId,
    transactionType: 'buy',
    items: [{
      itemId: item.id,
      itemName: item.name,
      quantity,
      unitPrice: item.sellPrice,
      subtotal: totalCost,
    }],
    totalCost,
    currency,
    timestamp: new Date().toISOString(),
    confirmed: false,  // Needs "As You Wish" confirmation
    flaggedByHarper: false,
  };

  return transaction;
}

/**
 * Confirm a transaction with "As You Wish" phrase.
 */
export function confirmTransaction(
  transaction: NPCTransaction,
  phrase: string
): NPCTransaction {
  const isValid = phrase.toLowerCase().trim() === 'as you wish';
  return {
    ...transaction,
    confirmed: isValid,
  };
}

/**
 * Process a sell-back transaction (player sells item to NPC).
 */
export function processSellBack(
  npc: NPCDef,
  playerId: string,
  itemId: string,
  quantity: number,
  currency: CurrencyType
): NPCTransaction | null {
  const item = npc.inventory.find(i => i.id === itemId);
  if (!item) return null;
  if (!npc.acceptedCurrencies.includes(currency)) return null;

  // NPC has stock limit
  if (item.currentStock + quantity > item.maxStock) return null;

  const totalPayout = item.buyBackPrice * quantity;

  return {
    id: crypto.randomUUID(),
    npcId: npc.id,
    playerId,
    transactionType: 'sell',
    items: [{
      itemId: item.id,
      itemName: item.name,
      quantity,
      unitPrice: item.buyBackPrice,
      subtotal: totalPayout,
    }],
    totalCost: totalPayout,
    currency,
    timestamp: new Date().toISOString(),
    confirmed: false,
    flaggedByHarper: false,
  };
}

/**
 * Restock NPC inventory based on interval.
 */
export function restockNPC(npc: NPCDef): NPCDef {
  const now = new Date();
  const lastRestock = new Date(npc.lastRestockedAt);
  const hoursSinceRestock = (now.getTime() - lastRestock.getTime()) / (1000 * 60 * 60);

  if (hoursSinceRestock < npc.restockIntervalHours) return npc;

  const restockedInventory = npc.inventory.map(item => ({
    ...item,
    currentStock: Math.min(item.maxStock, item.currentStock + item.restockAmount),
  }));

  return {
    ...npc,
    inventory: restockedInventory,
    lastRestockedAt: now.toISOString(),
  };
}

/**
 * Get all NPCs in a specific district.
 */
export function getNPCsInDistrict(
  npcs: NPCDef[],
  cityId: string,
  districtId: string
): NPCDef[] {
  return npcs.filter(n => n.cityId === cityId && n.districtId === districtId);
}

/**
 * Get NPC by hex position.
 */
export function getNPCAtPosition(
  npcs: NPCDef[],
  q: number,
  r: number,
  cityId: string
): NPCDef | null {
  return npcs.find(n =>
    n.cityId === cityId &&
    n.hexPosition.q === q &&
    n.hexPosition.r === r
  ) || null;
}

export default {
  VERDANA_NPCS,
  processPurchase,
  processSellBack,
  confirmTransaction,
  restockNPC,
  getNPCsInDistrict,
  getNPCAtPosition,
};
