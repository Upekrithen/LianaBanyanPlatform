/**
 * WILDFIRE BEACON RUNS — Predefined Platform Tours
 * =================================================
 * Each run takes users through a specific pathway with decision points.
 * Golden Keys required = 5 × number of stops
 * 
 * Categories:
 * - business: Business pathway runs (existing, idea, work)
 * - initiatives: Tour the 16 initiatives
 * - onboarding: New member orientation
 * - governance: The 300, Star Chamber, etc.
 * - creative: JukeBox, Didasko, etc.
 */

import { WildfireRun, BeaconNode } from "@/components/WildfireBeaconRun";

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL 1 PATHWAYS — Entry points from homepage
// ═══════════════════════════════════════════════════════════════════════════════

export const GET_A_JOB_RUN: WildfireRun = {
  id: "get-a-job",
  slug: "get-a-job",
  name: "Get a Job",
  description: "Find work, earn credits, build reputation",
  category: "level-1",
  difficulty: "beginner",
  estimatedMinutes: 6,
  icon: "💼",
  totalNodes: 6,
  goldenKeysRequired: 30,
  nodes: [
    {
      id: "job-1",
      order: 1,
      title: "The Story",
      description: "Little Red Hen — why we built this",
      route: "/get-a-job",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/little-red-hen/",
      goldenKeysReward: 5,
    },
    {
      id: "job-2",
      order: 2,
      title: "Bounty Categories",
      description: "Design, Development, Writing, and more",
      route: "/help-wanted",
      duration: 5,
    },
    {
      id: "job-3",
      order: 3,
      title: "Your Benefits",
      description: "What members receive",
      route: "/help-each-other",
      duration: 5,
    },
    {
      id: "job-4",
      order: 4,
      title: "How Credits Work",
      description: "Three-gear currency system",
      route: "/economics",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/three-gear-currency/",
      goldenKeysReward: 5,
    },
    {
      id: "job-5",
      order: 5,
      title: "Building Reputation",
      description: "Harper Guild verification",
      route: "/initiatives/harper-guild",
      duration: 5,
    },
    {
      id: "job-6",
      order: 6,
      title: "Join the Platform",
      description: "$5/year membership",
      route: "/RedCarpet",
      duration: 5,
    },
  ],
};

export const BUILD_A_BUSINESS_RUN: WildfireRun = {
  id: "build-a-business",
  slug: "build-a-business",
  name: "Build a Business",
  description: "Start or grow your business — keep 83.3% of every sale",
  category: "level-1",
  difficulty: "beginner",
  estimatedMinutes: 7,
  icon: "🏗️",
  totalNodes: 7,
  goldenKeysRequired: 35,
  nodes: [
    {
      id: "biz-start-1",
      order: 1,
      title: "The Vision",
      description: "Build your business on solid ground",
      route: "/build-a-business",
      duration: 5,
    },
    {
      id: "biz-start-2",
      order: 2,
      title: "Cost+20% Explained",
      description: "Why creators keep 83.3%",
      route: "/economics",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/cost-plus-twenty/",
      goldenKeysReward: 5,
    },
    {
      id: "biz-start-3",
      order: 3,
      title: "Choose Your Path",
      description: "Existing business, new idea, or find work",
      route: "/business-pathway",
      duration: 5,
    },
    {
      id: "biz-start-4",
      order: 4,
      title: "Let's Make Bread",
      description: "$5 business simulator → real incubator",
      route: "/initiatives/bread",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/initiatives/lets-make-bread/",
      goldenKeysReward: 5,
    },
    {
      id: "biz-start-5",
      order: 5,
      title: "Financial Transparency",
      description: "See every transaction",
      route: "/transparency",
      duration: 5,
    },
    {
      id: "biz-start-6",
      order: 6,
      title: "Cooperative Support",
      description: "You're not alone",
      route: "/help-each-other",
      duration: 5,
    },
    {
      id: "biz-start-7",
      order: 7,
      title: "Get Started",
      description: "$5/year membership",
      route: "/RedCarpet",
      duration: 5,
    },
  ],
};

export const PLANT_SEEDS_RUN: WildfireRun = {
  id: "plant-seeds",
  slug: "plant-seeds",
  name: "Plant Seeds",
  description: "Invest in the future, sponsor innovation",
  category: "level-1",
  difficulty: "beginner",
  estimatedMinutes: 6,
  icon: "🌱",
  totalNodes: 6,
  goldenKeysRequired: 30,
  nodes: [
    {
      id: "seed-1",
      order: 1,
      title: "The Opportunity",
      description: "Sponsor innovation, share rewards",
      route: "/plant-seeds",
      duration: 5,
    },
    {
      id: "seed-2",
      order: 2,
      title: "Patent Portfolio",
      description: "1,244 innovations across 7 applications",
      route: "/patent-portfolio",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/patent-portfolio/",
      goldenKeysReward: 5,
    },
    {
      id: "seed-3",
      order: 3,
      title: "Patent Buckets",
      description: "Vote with credits to fund prosecution",
      route: "/patent-portfolio#buckets",
      duration: 5,
    },
    {
      id: "seed-4",
      order: 4,
      title: "Sponsorship Model",
      description: "60/10/20/10 allocation",
      route: "/sponsor",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/sponsorship-model/",
      goldenKeysReward: 5,
    },
    {
      id: "seed-5",
      order: 5,
      title: "Crown Jewels",
      description: "The 8 most valuable innovations",
      route: "/patent-portfolio#crown-jewels",
      duration: 5,
    },
    {
      id: "seed-6",
      order: 6,
      title: "Become a Sponsor",
      description: "Join the platform",
      route: "/RedCarpet",
      duration: 5,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS PATHWAY RUNS (Level 2)
// ═══════════════════════════════════════════════════════════════════════════════

export const BUSINESS_EXISTING_RUN: WildfireRun = {
  id: "business-existing",
  slug: "business-existing",
  name: "Existing Business → C+20",
  description: "Learn how to gradually adopt Cost+20% pricing for your existing business",
  category: "business",
  difficulty: "beginner",
  estimatedMinutes: 8,
  icon: "🏢",
  totalNodes: 9,
  goldenKeysRequired: 45, // 5 × 9
  nodes: [
    {
      id: "biz-1",
      order: 1,
      title: "Welcome to C+20",
      description: "Understand the Cost+20% model",
      route: "/help-each-other",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/cost-plus-twenty/",
      goldenKeysReward: 5,
    },
    {
      id: "biz-2",
      order: 2,
      title: "The Economics",
      description: "See how 83.3% creator share works",
      route: "/economics",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/economic-laws/",
      goldenKeysReward: 5,
    },
    {
      id: "biz-3",
      order: 3,
      title: "Business Pathway",
      description: "Choose your starting point",
      route: "/business-pathway",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/business-pathway/",
      goldenKeysReward: 5,
    },
    {
      id: "biz-4",
      order: 4,
      title: "Pick ONE Item",
      description: "Start with a single product or service",
      route: "/business-pathway?step=1",
      duration: 5,
    },
    {
      id: "biz-5",
      order: 5,
      title: "Calculate True Cost",
      description: "Understand Cost+20% pricing",
      route: "/economics",
      duration: 5,
    },
    {
      id: "biz-6",
      order: 6,
      title: "Create a Listing",
      description: "List your C+20 item",
      route: "/initiatives/lets-go-shopping",
      duration: 5,
    },
    {
      id: "biz-7",
      order: 7,
      title: "Track Results",
      description: "Monitor your dashboard",
      route: "/dashboard",
      duration: 5,
    },
    {
      id: "biz-8",
      order: 8,
      title: "Financial Transparency",
      description: "See how tracking works",
      route: "/transparency",
      duration: 5,
    },
    {
      id: "biz-9",
      order: 9,
      title: "Join Red Carpet",
      description: "Become a member",
      route: "/RedCarpet",
      duration: 5,
    },
  ],
};

export const BUSINESS_IDEA_RUN: WildfireRun = {
  id: "business-idea",
  slug: "business-idea",
  name: "Cold Start Your Idea",
  description: "Turn your idea into reality through cooperative production",
  category: "business",
  difficulty: "intermediate",
  estimatedMinutes: 10,
  icon: "💡",
  totalNodes: 9,
  goldenKeysRequired: 45,
  nodes: [
    {
      id: "idea-1",
      order: 1,
      title: "Document Your Idea",
      description: "Write down what you want to create",
      route: "/business-pathway?tab=idea",
      duration: 5,
    },
    {
      id: "idea-2",
      order: 2,
      title: "Let's Make Bread",
      description: "The business incubator initiative",
      route: "/initiatives/lets-make-bread",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/initiatives/lets-make-bread/",
      goldenKeysReward: 5,
    },
    {
      id: "idea-3",
      order: 3,
      title: "Calculate Costs",
      description: "Understand Cost+20% pricing",
      route: "/economics",
      duration: 5,
    },
    {
      id: "idea-4",
      order: 4,
      title: "Create a Cue Card",
      description: "Make your idea shareable",
      route: "/hofund",
      duration: 5,
    },
    {
      id: "idea-5",
      order: 5,
      title: "Deck Cards",
      description: "See how ideas become cards",
      route: "/deck",
      duration: 5,
    },
    {
      id: "idea-6",
      order: 6,
      title: "Ghost Voting",
      description: "How interest is measured",
      route: "/ghost",
      duration: 5,
    },
    {
      id: "idea-7",
      order: 7,
      title: "Production Tiers",
      description: "10→50→100→500 vote thresholds",
      route: "/production-queue",
      duration: 5,
    },
    {
      id: "idea-8",
      order: 8,
      title: "Brass Tacks",
      description: "Cooperative manufacturing",
      route: "/initiatives/brass-tacks",
      duration: 5,
    },
    {
      id: "idea-9",
      order: 9,
      title: "Launch Your Idea",
      description: "Submit to the platform",
      route: "/RedCarpet",
      duration: 5,
    },
  ],
};

export const BUSINESS_WORK_RUN: WildfireRun = {
  id: "business-work",
  slug: "business-work",
  name: "Cold Start Finding Work",
  description: "Build your reputation and find opportunities",
  category: "business",
  difficulty: "beginner",
  estimatedMinutes: 8,
  icon: "💼",
  totalNodes: 9,
  goldenKeysRequired: 45,
  nodes: [
    {
      id: "work-1",
      order: 1,
      title: "List Your Skills",
      description: "Create your skill profile",
      route: "/business-pathway?tab=work",
      duration: 5,
    },
    {
      id: "work-2",
      order: 2,
      title: "Harper Guild",
      description: "HR and ethics support",
      route: "/initiatives/harper-guild",
      duration: 5,
    },
    {
      id: "work-3",
      order: 3,
      title: "Set Your Rate",
      description: "Understand Cost+20% pricing",
      route: "/economics",
      duration: 5,
    },
    {
      id: "work-4",
      order: 4,
      title: "Service Listings",
      description: "Create service offerings",
      route: "/help-wanted",
      duration: 5,
    },
    {
      id: "work-5",
      order: 5,
      title: "Build Your Cue Card",
      description: "Portable reputation",
      route: "/hofund",
      duration: 5,
    },
    {
      id: "work-6",
      order: 6,
      title: "Join a Guild",
      description: "Find your professional home",
      route: "/guilds",
      duration: 5,
    },
    {
      id: "work-7",
      order: 7,
      title: "Browse Initiatives",
      description: "16 initiatives need help",
      route: "/initiatives",
      duration: 5,
    },
    {
      id: "work-8",
      order: 8,
      title: "Peer Contracts",
      description: "Trust, verified",
      route: "/peer-contracts",
      duration: 5,
    },
    {
      id: "work-9",
      order: 9,
      title: "Get Started",
      description: "Join the platform",
      route: "/RedCarpet",
      duration: 5,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// INITIATIVE TOURS
// ═══════════════════════════════════════════════════════════════════════════════

export const INITIATIVES_FOOD_RUN: WildfireRun = {
  id: "initiatives-food",
  slug: "initiatives-food",
  name: "Food & Home Initiatives",
  description: "Tour the 5 Food & Home initiatives",
  category: "initiatives",
  difficulty: "beginner",
  estimatedMinutes: 5,
  icon: "🍽️",
  totalNodes: 5,
  goldenKeysRequired: 25,
  nodes: [
    {
      id: "food-1",
      order: 1,
      title: "Let's Make Dinner",
      description: "Neighbors feeding neighbors",
      route: "/initiatives/lets-make-dinner",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/initiatives/lets-make-dinner/",
      goldenKeysReward: 5,
    },
    {
      id: "food-2",
      order: 2,
      title: "Let's Get Groceries",
      description: "Volume purchasing power",
      route: "/initiatives/lets-get-groceries",
      duration: 5,
    },
    {
      id: "food-3",
      order: 3,
      title: "Let's Go Shopping",
      description: "Cooperative buying power",
      route: "/initiatives/lets-go-shopping",
      duration: 5,
    },
    {
      id: "food-4",
      order: 4,
      title: "Household Concierge",
      description: "World-class home management",
      route: "/initiatives/household-concierge",
      duration: 5,
    },
    {
      id: "food-5",
      order: 5,
      title: "The Family Table",
      description: "Intergenerational connection",
      route: "/initiatives/the-family-table",
      duration: 5,
    },
  ],
};

export const INITIATIVES_HEALTH_RUN: WildfireRun = {
  id: "initiatives-health",
  slug: "initiatives-health",
  name: "Health & Safety Initiatives",
  description: "Tour the 4 Health & Safety initiatives",
  category: "initiatives",
  difficulty: "beginner",
  estimatedMinutes: 4,
  icon: "💊",
  totalNodes: 4,
  goldenKeysRequired: 20,
  nodes: [
    {
      id: "health-1",
      order: 1,
      title: "Tatiana Schlossburg Health Accords",
      description: "Affordable medications at Cost+20%",
      route: "/initiatives/tatiana-schlossburg-health-accords",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/initiatives/tatiana-schlossburg-health-accords/",
      goldenKeysReward: 5,
    },
    {
      id: "health-2",
      order: 2,
      title: "MSA",
      description: "Medical Savings Accounts",
      route: "/initiatives/msa",
      duration: 5,
    },
    {
      id: "health-3",
      order: 3,
      title: "Defense Klaus",
      description: "For Someone You Love",
      route: "/initiatives/defense-klaus",
      duration: 5,
    },
    {
      id: "health-4",
      order: 4,
      title: "Rally Group",
      description: "Crisis response everywhere",
      route: "/initiatives/rally-group",
      duration: 5,
    },
  ],
};

export const INITIATIVES_FULL_RUN: WildfireRun = {
  id: "initiatives-full",
  slug: "initiatives-full",
  name: "Sweet Sixteen Tour",
  description: "Tour all 16 initiatives",
  category: "initiatives",
  difficulty: "intermediate",
  estimatedMinutes: 16,
  icon: "🎯",
  totalNodes: 16,
  goldenKeysRequired: 80,
  nodes: [
    { id: "init-1", order: 1, title: "Let's Make Dinner", description: "Neighbors feeding neighbors", route: "/initiatives/lets-make-dinner", duration: 5 },
    { id: "init-2", order: 2, title: "Let's Get Groceries", description: "Volume purchasing", route: "/initiatives/lets-get-groceries", duration: 5 },
    { id: "init-3", order: 3, title: "Let's Go Shopping", description: "Cooperative buying", route: "/initiatives/lets-go-shopping", duration: 5 },
    { id: "init-4", order: 4, title: "Household Concierge", description: "Home management", route: "/initiatives/household-concierge", duration: 5 },
    { id: "init-5", order: 5, title: "The Family Table", description: "Intergenerational", route: "/initiatives/the-family-table", duration: 5 },
    { id: "init-6", order: 6, title: "Health Accords", description: "Affordable meds", route: "/initiatives/tatiana-schlossburg-health-accords", duration: 5 },
    { id: "init-7", order: 7, title: "MSA", description: "Medical savings", route: "/initiatives/msa", duration: 5 },
    { id: "init-8", order: 8, title: "Defense Klaus", description: "Personal safety", route: "/initiatives/defense-klaus", duration: 5 },
    { id: "init-9", order: 9, title: "Rally Group", description: "Crisis response", route: "/initiatives/rally-group", duration: 5 },
    { id: "init-10", order: 10, title: "VSL", description: "Vouched Short Loans", route: "/initiatives/vsl", duration: 5 },
    { id: "init-11", order: 11, title: "Let's Make Bread", description: "Business incubator", route: "/initiatives/lets-make-bread", duration: 5 },
    { id: "init-12", order: 12, title: "Harper Guild", description: "HR & ethics", route: "/initiatives/harper-guild", duration: 5 },
    { id: "init-13", order: 13, title: "JukeBox", description: "Fair music licensing", route: "/initiatives/jukebox", duration: 5 },
    { id: "init-14", order: 14, title: "Didasko", description: "Education", route: "/initiatives/didasko", duration: 5 },
    { id: "init-15", order: 15, title: "International", description: "Cross-border", route: "/initiatives/international", duration: 5 },
    { id: "init-16", order: 16, title: "Brass Tacks", description: "Manufacturing", route: "/initiatives/brass-tacks", duration: 5 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING RUNS
// ═══════════════════════════════════════════════════════════════════════════════

export const ONBOARDING_QUICK_RUN: WildfireRun = {
  id: "onboarding-quick",
  slug: "onboarding-quick",
  name: "Quick Platform Tour",
  description: "5-minute overview of Liana Banyan",
  category: "onboarding",
  difficulty: "beginner",
  estimatedMinutes: 5,
  icon: "🚀",
  totalNodes: 6,
  goldenKeysRequired: 30,
  nodes: [
    {
      id: "onboard-1",
      order: 1,
      title: "Welcome",
      description: "The Golden Key",
      route: "/",
      duration: 5,
    },
    {
      id: "onboard-2",
      order: 2,
      title: "Help Each Other",
      description: "Our philosophy",
      route: "/help-each-other",
      duration: 5,
      learningLink: "https://cephas.lianabanyan.com/under-the-hood/golden-key/",
      goldenKeysReward: 5,
    },
    {
      id: "onboard-3",
      order: 3,
      title: "The Economics",
      description: "Cost+20% explained",
      route: "/economics",
      duration: 5,
    },
    {
      id: "onboard-4",
      order: 4,
      title: "Patent Portfolio",
      description: "1,244 innovations",
      route: "/patent-portfolio",
      duration: 5,
    },
    {
      id: "onboard-5",
      order: 5,
      title: "Transparency",
      description: "Nothing hidden",
      route: "/transparency",
      duration: 5,
    },
    {
      id: "onboard-6",
      order: 6,
      title: "Join Us",
      description: "$5/year membership",
      route: "/RedCarpet",
      duration: 5,
    },
  ],
};

export const ONBOARDING_DEEP_RUN: WildfireRun = {
  id: "onboarding-deep",
  slug: "onboarding-deep",
  name: "Deep Dive Tour",
  description: "Comprehensive platform exploration",
  category: "onboarding",
  difficulty: "intermediate",
  estimatedMinutes: 15,
  icon: "🔬",
  totalNodes: 12,
  goldenKeysRequired: 60,
  nodes: [
    { id: "deep-1", order: 1, title: "Home", description: "Landing page", route: "/", duration: 5 },
    { id: "deep-2", order: 2, title: "Philosophy", description: "Help each other", route: "/help-each-other", duration: 5 },
    { id: "deep-3", order: 3, title: "Economics", description: "Nine laws", route: "/economics", duration: 5 },
    { id: "deep-4", order: 4, title: "Patents", description: "Innovation portfolio", route: "/patent-portfolio", duration: 5 },
    { id: "deep-5", order: 5, title: "Governance", description: "The 300", route: "/the-300", duration: 5 },
    { id: "deep-6", order: 6, title: "Initiatives", description: "Sweet Sixteen", route: "/initiatives", duration: 5 },
    { id: "deep-7", order: 7, title: "Business Path", description: "Your pathway", route: "/business-pathway", duration: 5 },
    { id: "deep-8", order: 8, title: "Beacons", description: "Drop markers", route: "/beacons", duration: 5 },
    { id: "deep-9", order: 9, title: "Treasure Map", description: "52 cards", route: "/treasure-map", duration: 5 },
    { id: "deep-10", order: 10, title: "Ghost World", description: "Explore freely", route: "/ghost", duration: 5 },
    { id: "deep-11", order: 11, title: "Transparency", description: "Full visibility", route: "/transparency", duration: 5 },
    { id: "deep-12", order: 12, title: "Join", description: "Red Carpet", route: "/RedCarpet", duration: 5 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE RUNS
// ═══════════════════════════════════════════════════════════════════════════════

export const GOVERNANCE_RUN: WildfireRun = {
  id: "governance",
  slug: "governance",
  name: "Governance Deep Dive",
  description: "Understand how Liana Banyan is governed",
  category: "governance",
  difficulty: "advanced",
  estimatedMinutes: 10,
  icon: "⚖️",
  totalNodes: 8,
  goldenKeysRequired: 40,
  nodes: [
    { id: "gov-1", order: 1, title: "The 300", description: "AI-Human hybrid governance", route: "/the-300", duration: 5 },
    { id: "gov-2", order: 2, title: "Star Chamber", description: "Dual AI verification", route: "/star-chamber", duration: 5 },
    { id: "gov-3", order: 3, title: "Economic Laws", description: "Constitutional economics", route: "/economics", duration: 5 },
    { id: "gov-4", order: 4, title: "Transparency", description: "Full visibility", route: "/transparency", duration: 5 },
    { id: "gov-5", order: 5, title: "Crown System", description: "Initiative leadership", route: "/governance", duration: 5 },
    { id: "gov-6", order: 6, title: "Sponsorship", description: "60/10/20/10 allocation", route: "/sponsor", duration: 5 },
    { id: "gov-7", order: 7, title: "Contingency", description: "Thought experiments", route: "/contingency-operators", duration: 5 },
    { id: "gov-8", order: 8, title: "Fly on the Wall", description: "Nothing hidden", route: "/fly-on-the-wall", duration: 5 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// CREATIVE RUNS
// ═══════════════════════════════════════════════════════════════════════════════

export const CREATIVE_RUN: WildfireRun = {
  id: "creative",
  slug: "creative",
  name: "Creative & Learning Tour",
  description: "JukeBox, Didasko, and creative tools",
  category: "creative",
  difficulty: "beginner",
  estimatedMinutes: 6,
  icon: "🎨",
  totalNodes: 6,
  goldenKeysRequired: 30,
  nodes: [
    { id: "creative-1", order: 1, title: "JukeBox", description: "Fair music licensing", route: "/initiatives/jukebox", duration: 5 },
    { id: "creative-2", order: 2, title: "Didasko", description: "Education initiative", route: "/initiatives/didasko", duration: 5 },
    { id: "creative-3", order: 3, title: "Hofund", description: "QR code studio", route: "/hofund", duration: 5 },
    { id: "creative-4", order: 4, title: "Deck Cards", description: "Collect and share", route: "/deck", duration: 5 },
    { id: "creative-5", order: 5, title: "Asset Library", description: "Shared resources", route: "/asset-library", duration: 5 },
    { id: "creative-6", order: 6, title: "HexIsle", description: "Build your city", route: "/hexisle", duration: 5 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ALL RUNS EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const ALL_WILDFIRE_RUNS: WildfireRun[] = [
  // Level 1 - Entry Points
  GET_A_JOB_RUN,
  BUILD_A_BUSINESS_RUN,
  PLANT_SEEDS_RUN,
  // Business (Level 2)
  BUSINESS_EXISTING_RUN,
  BUSINESS_IDEA_RUN,
  BUSINESS_WORK_RUN,
  // Initiatives
  INITIATIVES_FOOD_RUN,
  INITIATIVES_HEALTH_RUN,
  INITIATIVES_FULL_RUN,
  // Onboarding
  ONBOARDING_QUICK_RUN,
  ONBOARDING_DEEP_RUN,
  // Governance
  GOVERNANCE_RUN,
  // Creative
  CREATIVE_RUN,
];

export const RUNS_BY_CATEGORY = {
  'level-1': [GET_A_JOB_RUN, BUILD_A_BUSINESS_RUN, PLANT_SEEDS_RUN],
  business: [BUSINESS_EXISTING_RUN, BUSINESS_IDEA_RUN, BUSINESS_WORK_RUN],
  initiatives: [INITIATIVES_FOOD_RUN, INITIATIVES_HEALTH_RUN, INITIATIVES_FULL_RUN],
  onboarding: [ONBOARDING_QUICK_RUN, ONBOARDING_DEEP_RUN],
  governance: [GOVERNANCE_RUN],
  creative: [CREATIVE_RUN],
};

// Level-based run access
export const LEVEL_1_RUNS = [GET_A_JOB_RUN, BUILD_A_BUSINESS_RUN, PLANT_SEEDS_RUN];
export const LEVEL_2_RUNS = [BUSINESS_EXISTING_RUN, BUSINESS_IDEA_RUN, BUSINESS_WORK_RUN, INITIATIVES_FOOD_RUN, INITIATIVES_HEALTH_RUN];
export const LEVEL_3_RUNS = [GOVERNANCE_RUN, INITIATIVES_FULL_RUN, ONBOARDING_DEEP_RUN];

export function getRunBySlug(slug: string): WildfireRun | undefined {
  return ALL_WILDFIRE_RUNS.find(run => run.slug === slug);
}

export default ALL_WILDFIRE_RUNS;
