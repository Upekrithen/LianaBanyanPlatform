/**
 * Quest Deck Cards
 * 
 * Special deck cards for platform quests and challenges:
 * - Ghost World Speedruns: Timed qualification challenges
 * - Media Blitz: Coordinated social media campaigns
 * - Golden Key Hunt: Earn Golden Keys through mastery
 */

import { DeckCardData } from '@/components/DeckCard';

export const GHOST_WORLD_SPEEDRUN_CARD: DeckCardData = {
  id: 'ghost-world-speedrun',
  cardCode: 'GWSR-001',
  name: 'Ghost World Speedrun',
  rarity: 'epic',
  frontTitle: 'Ghost World Speedrun',
  frontSubtitle: 'Prove your mastery',
  frontIcon: '⚡',
  frontImageUrl: undefined,
  backTitle: 'Qualification Challenge',
  backInstructions: `Complete preset challenges in Ghost World within time limits to earn rewards.

• Practice Mode: No time limit, learn the ropes
• Bronze: Complete in under 10 minutes
• Silver: Complete in under 5 minutes  
• Gold: Complete in under 2 minutes

Rewards scale with your qualifying time. All progress saves to your Member Portfolio.`,
  backDestination: '/ghost',
  backAction: 'Start Speedrun',
  borderColor: 'purple',
  isConsumable: false,
};

export const MEDIA_BLITZ_CARD: DeckCardData = {
  id: 'media-blitz',
  cardCode: 'MBLZ-001',
  name: 'Media Blitz',
  rarity: 'rare',
  frontTitle: 'Media Blitz',
  frontSubtitle: 'Amplify the message',
  frontIcon: '📣',
  frontImageUrl: undefined,
  backTitle: 'Coordinated Campaign',
  backInstructions: `Join coordinated social media campaigns to spread the word about Liana Banyan.

• Pre-written posts ready to share
• Scheduled campaigns for maximum impact
• Earn Golden Keys for participation
• Track your reach and engagement

Every share helps build the cooperative. Your voice matters.`,
  backDestination: '/social-admin',
  backAction: 'Join Campaign',
  borderColor: 'blue',
  isConsumable: false,
};

export const GOLDEN_KEY_HUNT_CARD: DeckCardData = {
  id: 'golden-key-hunt',
  cardCode: 'GKEY-001',
  name: 'Golden Key Hunt',
  rarity: 'legendary',
  frontTitle: 'Golden Key Hunt',
  frontSubtitle: 'Unlock the platform',
  frontIcon: '🔑',
  frontImageUrl: undefined,
  backTitle: 'Earn Golden Keys',
  backInstructions: `Golden Keys unlock premium features and Magic Carpet rides through Wildfire Beacon Runs.

Ways to earn:
• Complete Cephas learning modules
• Finish Ghost World Speedruns
• Participate in Media Blitz campaigns
• Help other members (verified)
• Complete pathway three-packs

50+ Keys = Power User status
5 Keys per Wildfire stop unlock`,
  backDestination: '/beacon-explainer',
  backAction: 'Learn More',
  borderColor: 'amber',
  isConsumable: false,
};

// Wildfire Beacon Run Cards - for the three Level 1 pathways
export const GET_A_JOB_BEACON_CARD: DeckCardData = {
  id: 'get-a-job-beacon',
  cardCode: 'WFBR-001',
  name: 'Get a Job Pathway',
  rarity: 'uncommon',
  frontTitle: 'Get a Job',
  frontSubtitle: 'Find work, earn credits',
  frontIcon: '💼',
  frontImageUrl: undefined,
  backTitle: 'Wildfire Beacon Run',
  backInstructions: `A guided tour through finding work on the platform.

Stops on this run:
1. The Story (Little Red Hen)
2. Bounty Categories
3. Your Benefits
4. How Credits Work
5. Building Reputation

View-only tour with optional try-it moments. Perfect for newcomers.`,
  backDestination: '/get-a-job',
  backAction: 'Start Run',
  borderColor: 'green',
  isConsumable: false,
};

export const BUILD_BUSINESS_BEACON_CARD: DeckCardData = {
  id: 'build-business-beacon',
  cardCode: 'WFBR-002',
  name: 'Build a Business Pathway',
  rarity: 'uncommon',
  frontTitle: 'Build a Business',
  frontSubtitle: 'Keep 83.3% of every sale',
  frontIcon: '🏗️',
  frontImageUrl: undefined,
  backTitle: 'Wildfire Beacon Run',
  backInstructions: `A guided tour through starting or growing your business.

Stops on this run:
1. Cost+20% Model Explained
2. Setting Up Your Storefront
3. Pricing Your Services
4. Finding Customers
5. Scaling with the Cooperative

Learn how creators keep 83.3% while the platform operates transparently.`,
  backDestination: '/build-a-business',
  backAction: 'Start Run',
  borderColor: 'green',
  isConsumable: false,
};

export const PLANT_SEEDS_BEACON_CARD: DeckCardData = {
  id: 'plant-seeds-beacon',
  cardCode: 'WFBR-003',
  name: 'Plant Seeds Pathway',
  rarity: 'uncommon',
  frontTitle: 'Plant Seeds',
  frontSubtitle: 'Sponsor the future',
  frontIcon: '🌱',
  frontImageUrl: undefined,
  backTitle: 'Wildfire Beacon Run',
  backInstructions: `A guided tour through cooperative sponsorship.

Stops on this run:
1. How Sponsorship Works
2. Patent Bucket Pedestals
3. IP Load Balancing
4. Sponsor Recognition
5. Long-term Membership Benefits

Help fund innovation and join the cooperative.`,
  backDestination: '/plant-seeds',
  backAction: 'Start Run',
  borderColor: 'green',
  isConsumable: false,
};

// All quest cards for easy import
export const QUEST_DECK_CARDS: DeckCardData[] = [
  GHOST_WORLD_SPEEDRUN_CARD,
  MEDIA_BLITZ_CARD,
  GOLDEN_KEY_HUNT_CARD,
  GET_A_JOB_BEACON_CARD,
  BUILD_BUSINESS_BEACON_CARD,
  PLANT_SEEDS_BEACON_CARD,
];

// Level-based card access
export const LEVEL_1_QUEST_CARDS = [
  GET_A_JOB_BEACON_CARD,
  BUILD_BUSINESS_BEACON_CARD,
  PLANT_SEEDS_BEACON_CARD,
];

export const LEVEL_3_QUEST_CARDS = [
  GHOST_WORLD_SPEEDRUN_CARD,
  MEDIA_BLITZ_CARD,
  GOLDEN_KEY_HUNT_CARD,
];
