/**
 * DURIN'S DOOR — Enhanced Password Gate System
 * =============================================
 * Each "door" is a location with its OWN set of passwords.
 * "Friend" vs "Mellon" vs "Amigo" give DIFFERENT results on the SAME door.
 * Time-of-day affects which passwords work (dwarven gates change with light).
 * Konami codes (DULLARD = down,up,left,left,A,right,down) are separate.
 * Ghost World users can use passwords to bypass credit barriers.
 *
 * Passwords are tradeable social currency — like Mortal Kombat codes.
 * You can't just know ONE. Each door has its own set. Find them. Share them.
 */

export type DoorTier = "bronze" | "silver" | "gold" | "mithril";
export type TimeWindow = "morning" | "afternoon" | "evening" | "night" | "any";

export interface DoorPassword {
  word: string;
  language: string;
  tier: DoorTier;
  timeWindow: TimeWindow;
  reward: { credits: number; marks: number; joules: number };
  unlocks: string;
  isKonami?: boolean;
  konamiSequence?: string[];  // ["down","up","left","left","A","right","down"]
}

export interface DurinDoor {
  doorId: string;
  name: string;
  description: string;
  creditCost: number;
  icon: string;
  passwords: DoorPassword[];
}

// ─── TIME OF DAY ───

function getCurrentTimeWindow(): TimeWindow {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// ─── ALL DOORS ───

const DOORS: DurinDoor[] = [
  {
    doorId: "bridge",
    name: "The Bridge",
    description: "Cross to the next island",
    creditCost: 5,
    icon: "🌉",
    passwords: [
      { word: "BIFROST", language: "norse", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 0, joules: 0 }, unlocks: "Bridge crossing" },
      { word: "BRIDGE", language: "english", tier: "bronze", timeWindow: "any", reward: { credits: 3, marks: 0, joules: 0 }, unlocks: "Bridge crossing (basic)" },
      { word: "PUENTE", language: "spanish", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 2, joules: 0 }, unlocks: "Bridge crossing + bonus MARKS" },
      { word: "PONT", language: "french", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 2, joules: 0 }, unlocks: "Bridge crossing + bonus MARKS" },
      { word: "BRÜCKE", language: "german", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 2, joules: 0 }, unlocks: "Bridge crossing + bonus MARKS" },
      { word: "QIAO", language: "mandarin", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 5, joules: 0 }, unlocks: "Bridge crossing + extra MARKS" },
      { word: "HASHI", language: "japanese", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 5, joules: 0 }, unlocks: "Bridge crossing + extra MARKS" },
    ],
  },
  {
    doorId: "marsh",
    name: "The Marsh Crossing",
    description: "A shortcut through the reeds",
    creditCost: 5,
    icon: "🌿",
    passwords: [
      { word: "REEDS", language: "english", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 0, joules: 0 }, unlocks: "Marsh shortcut" },
      { word: "JUNCOS", language: "spanish", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 2, joules: 0 }, unlocks: "Marsh shortcut + MARKS" },
      { word: "ROSEAUX", language: "french", tier: "bronze", timeWindow: "any", reward: { credits: 5, marks: 2, joules: 0 }, unlocks: "Marsh shortcut + MARKS" },
      { word: "DEAD MARSHES", language: "tolkien", tier: "silver", timeWindow: "night", reward: { credits: 10, marks: 5, joules: 0 }, unlocks: "Night marsh — hidden path revealed" },
    ],
  },
  {
    doorId: "art-gallery",
    name: "The Art Gallery",
    description: "Curated member art collection",
    creditCost: 10,
    icon: "🎨",
    passwords: [
      { word: "BEAUTY", language: "english", tier: "silver", timeWindow: "any", reward: { credits: 10, marks: 5, joules: 0 }, unlocks: "Gallery access" },
      { word: "BELLEZA", language: "spanish", tier: "silver", timeWindow: "any", reward: { credits: 10, marks: 10, joules: 0 }, unlocks: "Gallery + artist bios" },
      { word: "SCHÖNHEIT", language: "german", tier: "silver", timeWindow: "any", reward: { credits: 10, marks: 10, joules: 0 }, unlocks: "Gallery + artist bios" },
      { word: "DULLARD", language: "konami", tier: "gold", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Gallery VIP + hidden collection", isKonami: true, konamiSequence: ["down","up","left","left","A","right","down"] },
    ],
  },
  {
    doorId: "library",
    name: "The Deep Library",
    description: "Academic papers and research",
    creditCost: 10,
    icon: "📚",
    passwords: [
      { word: "SCHOLAR", language: "english", tier: "silver", timeWindow: "any", reward: { credits: 10, marks: 5, joules: 0 }, unlocks: "Library access" },
      { word: "ERUDITO", language: "latin", tier: "silver", timeWindow: "any", reward: { credits: 10, marks: 10, joules: 0 }, unlocks: "Library + rare manuscripts" },
      { word: "GAKUSHA", language: "japanese", tier: "silver", timeWindow: "morning", reward: { credits: 15, marks: 15, joules: 5 }, unlocks: "Library + morning study bonus" },
    ],
  },
  {
    doorId: "forge",
    name: "The Forge",
    description: "3D printing and manufacturing tools",
    creditCost: 25,
    icon: "🔨",
    passwords: [
      { word: "TERENO", language: "liana", tier: "gold", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 10 }, unlocks: "Forge access" },
      { word: "HEPHAESTUS", language: "greek", tier: "gold", timeWindow: "any", reward: { credits: 25, marks: 20, joules: 10 }, unlocks: "Forge + god-tier tools" },
      { word: "VULCAN", language: "roman", tier: "gold", timeWindow: "afternoon", reward: { credits: 30, marks: 20, joules: 15 }, unlocks: "Forge + afternoon heat bonus" },
      { word: "MAKEMAKE", language: "rapa_nui", tier: "gold", timeWindow: "any", reward: { credits: 25, marks: 25, joules: 10 }, unlocks: "Forge + Polynesian creator bonus" },
    ],
  },
  {
    doorId: "observatory",
    name: "The Observatory",
    description: "Platform analytics and transparency",
    creditCost: 15,
    icon: "🔭",
    passwords: [
      { word: "FLY ON THE WALL", language: "english", tier: "silver", timeWindow: "any", reward: { credits: 15, marks: 10, joules: 0 }, unlocks: "Observatory access" },
      { word: "HEIMDALL", language: "norse", tier: "gold", timeWindow: "night", reward: { credits: 20, marks: 15, joules: 10 }, unlocks: "Observatory + night vision (see everything)" },
    ],
  },
  {
    doorId: "vault",
    name: "The Vault",
    description: "Patent portfolio deep dive",
    creditCost: 50,
    icon: "🏦",
    passwords: [
      { word: "HARBOR DEFENSE", language: "english", tier: "gold", timeWindow: "any", reward: { credits: 50, marks: 25, joules: 15 }, unlocks: "Vault access" },
      { word: "CROWN JEWELS", language: "english", tier: "gold", timeWindow: "any", reward: { credits: 50, marks: 30, joules: 20 }, unlocks: "Vault + Crown Jewel details" },
      { word: "EIGHT SURVIVED", language: "liana", tier: "mithril", timeWindow: "any", reward: { credits: 75, marks: 50, joules: 25 }, unlocks: "Vault + full prior art research" },
    ],
  },
  {
    doorId: "founders-journal",
    name: "Founder's Journal",
    description: "Private development history",
    creditCost: 100,
    icon: "📖",
    passwords: [
      { word: "POTATOES AT THE END OF A HOE HANDLE", language: "english", tier: "mithril", timeWindow: "any", reward: { credits: 100, marks: 50, joules: 25 }, unlocks: "Full journal access" },
      { word: "FOR THE KEEP", language: "liana", tier: "mithril", timeWindow: "any", reward: { credits: 100, marks: 50, joules: 25 }, unlocks: "Full journal access" },
      { word: "FRIEND", language: "english", tier: "bronze", timeWindow: "any", reward: { credits: 10, marks: 5, joules: 0 }, unlocks: "Journal excerpt only" },
      { word: "MELLON", language: "elvish", tier: "gold", timeWindow: "evening", reward: { credits: 50, marks: 25, joules: 15 }, unlocks: "Journal evening edition (extended)" },
      { word: "AMIGO", language: "spanish", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
      { word: "FREUND", language: "german", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
      { word: "AMI", language: "french", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
      { word: "TOMODACHI", language: "japanese", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
      { word: "PENGYOU", language: "mandarin", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
      { word: "CHINGU", language: "korean", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
      { word: "SADIQ", language: "arabic", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
      { word: "RAFIKI", language: "swahili", tier: "gold", timeWindow: "any", reward: { credits: 50, marks: 25, joules: 10 }, unlocks: "Journal + Africa stories" },
      { word: "DOST", language: "hindi", tier: "silver", timeWindow: "any", reward: { credits: 25, marks: 15, joules: 5 }, unlocks: "Journal highlights" },
    ],
  },
  {
    doorId: "golden-key-chamber",
    name: "Golden Key Chamber",
    description: "Where the hardest puzzles live",
    creditCost: 20,
    icon: "🗝️",
    passwords: [
      { word: "GOLDEN KEY", language: "english", tier: "silver", timeWindow: "any", reward: { credits: 20, marks: 10, joules: 0 }, unlocks: "Chamber access" },
      { word: "HELP EACH OTHER", language: "english", tier: "gold", timeWindow: "any", reward: { credits: 30, marks: 20, joules: 10 }, unlocks: "Chamber + bonus puzzle hints" },
      { word: "CARDBOARD BOOTS", language: "liana", tier: "gold", timeWindow: "any", reward: { credits: 30, marks: 20, joules: 10 }, unlocks: "Chamber + MacKenzie Scott puzzle" },
    ],
  },
  {
    doorId: "snow-door",
    name: "The Snow Door",
    description: "A door rimmed with frost. Snowflake seals at every corner. This path leads North.",
    creditCost: 0, // Joules-only entry — 12 Joules
    icon: "❄️",
    passwords: [
      { word: "NORTH", language: "english", tier: "gold", timeWindow: "any", reward: { credits: 0, marks: 0, joules: 12 }, unlocks: "Founder's Keep — the northern starting point" },
      { word: "NORTE", language: "spanish", tier: "gold", timeWindow: "any", reward: { credits: 0, marks: 0, joules: 12 }, unlocks: "Founder's Keep + language bonus" },
      { word: "NORD", language: "french", tier: "gold", timeWindow: "any", reward: { credits: 0, marks: 0, joules: 12 }, unlocks: "Founder's Keep + language bonus" },
      { word: "NORDEN", language: "german", tier: "gold", timeWindow: "any", reward: { credits: 0, marks: 0, joules: 12 }, unlocks: "Founder's Keep + language bonus" },
      { word: "KITA", language: "japanese", tier: "gold", timeWindow: "any", reward: { credits: 0, marks: 0, joules: 15 }, unlocks: "Founder's Keep + rare language bonus" },
      { word: "FOROCHEL", language: "tolkien", tier: "mithril", timeWindow: "night", reward: { credits: 0, marks: 10, joules: 25 }, unlocks: "Founder's Keep + Ice Bay of Forochel passage" },
    ],
  },
];

// ─── WRONG-TRY DESTINATIONS ───
// 3 wrong tries → random destination from A-E, no repeats until all exhausted.
// Each shows a brief platform highlight before returning.

export interface WrongTryDestination {
  id: string;
  title: string;
  description: string;
  icon: string;
  teaserFact: string;
}

export const WRONG_TRY_DESTINATIONS: WrongTryDestination[] = [
  {
    id: "A",
    title: "The Echoing Hall",
    description: "Your voice bounces off stone walls. In the distance, you hear the hum of printers.",
    icon: "🏛️",
    teaserFact: "The HexIsle Slotted Top locks interchangeably between water and land terrain — both trapping mechanisms work from the same cradle flip.",
  },
  {
    id: "B",
    title: "The Empty Workshop",
    description: "Blueprints line the walls. Someone was here recently.",
    icon: "🔧",
    teaserFact: "928+ patent claims protect every innovation on this platform. Micro-entity filing means $65 per provisional — accessible to everyone.",
  },
  {
    id: "C",
    title: "The Flickering Lantern Room",
    description: "A single candle illuminates a notice board covered in paper.",
    icon: "🕯️",
    teaserFact: "Three currencies work together: Credits (purchased), Marks (earned through effort), and Joules (surplus storage with a forever-stamp exchange lock).",
  },
  {
    id: "D",
    title: "The Winding Stair",
    description: "Steps spiral downward. A faint melody drifts up from below.",
    icon: "🌀",
    teaserFact: "Every price on the platform is Cost + 20%. No hidden fees, no gouging. The math is always visible and the creator keeps 83.3% of every sale.",
  },
  {
    id: "E",
    title: "The Sleeping Garden",
    description: "Stone benches surround a dry fountain. Names are carved in every language.",
    icon: "🌿",
    teaserFact: "Durin's Door accepts passwords in 58 languages. Each language earns bonus Marks — because every person who helps translate makes the platform stronger.",
  },
];

// ─── LOOKUP FUNCTIONS ───

export function getDoor(doorId: string): DurinDoor | null {
  return DOORS.find((d) => d.doorId === doorId) || null;
}

export function getAllDoors(): DurinDoor[] {
  return DOORS;
}

/**
 * Try a password on a specific door.
 * Returns the matching password entry if valid, or null.
 * Checks time-of-day restrictions.
 */
export function tryPassword(doorId: string, input: string): { door: DurinDoor; password: DoorPassword } | null {
  const door = getDoor(doorId);
  if (!door) return null;

  const normalized = input.trim().toUpperCase();
  const currentTime = getCurrentTimeWindow();

  const match = door.passwords.find((p) => {
    if (p.word !== normalized) return false;
    if (p.timeWindow !== "any" && p.timeWindow !== currentTime) return false;
    return true;
  });

  if (!match) return null;
  return { door, password: match };
}

/**
 * Try a password on ANY door (universal attempt — for the /durins-door page).
 * Checks all doors for a match.
 */
export function tryPasswordAnywhere(input: string): { door: DurinDoor; password: DoorPassword } | null {
  const normalized = input.trim().toUpperCase();
  const currentTime = getCurrentTimeWindow();

  // Check if password switches the Welcome Gate content variant
  try {
    import("@/lib/welcomeGateContent").then(({ tryWelcomeVariantPassword, setActiveVariant }) => {
      const variant = tryWelcomeVariantPassword(normalized);
      if (variant) {
        setActiveVariant(variant.id);
        // Gate variant activated silently
      }
    });
  } catch {
    // Welcome gate module not loaded — ignore
  }

  for (const door of DOORS) {
    const match = door.passwords.find((p) => {
      if (p.word !== normalized) return false;
      if (p.timeWindow !== "any" && p.timeWindow !== currentTime) return false;
      return true;
    });
    if (match) return { door, password: match };
  }
  return null;
}

/**
 * Check if a user can access a gated door via credits or known passwords.
 */
export function canAccessDoor(
  doorId: string,
  userCredits: number,
  unlockedDoors: string[]
): boolean {
  if (unlockedDoors.includes(doorId)) return true;
  const door = getDoor(doorId);
  if (!door) return true;
  return userCredits >= door.creditCost;
}

// ─── TIER HELPERS ───

export function getTierLabel(tier: DoorTier): string {
  return { bronze: "Bronze", silver: "Silver", gold: "Gold", mithril: "Mithril" }[tier];
}

export function getTierColor(tier: DoorTier): string {
  return {
    bronze: "text-orange-700 bg-orange-500/10 border-orange-500/20",
    silver: "text-gray-500 bg-gray-400/10 border-gray-400/20",
    gold: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    mithril: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  }[tier];
}

// ─── LOCAL STORAGE (Ghost World compatible) ───

export function getFoundPasswords(): string[] {
  const stored = localStorage.getItem("lb_durins_door");
  return stored ? JSON.parse(stored) : [];
}

export function getUnlockedDoors(): Record<string, string[]> {
  const stored = localStorage.getItem("lb_durins_unlocked");
  return stored ? JSON.parse(stored) : {};
}

export function markPasswordFound(doorId: string, password: string): void {
  // Track found passwords
  const found = getFoundPasswords();
  const key = `${doorId}:${password.toUpperCase()}`;
  if (!found.includes(key)) {
    found.push(key);
    localStorage.setItem("lb_durins_door", JSON.stringify(found));
  }

  // Track unlocked doors
  const unlocked = getUnlockedDoors();
  if (!unlocked[doorId]) unlocked[doorId] = [];
  if (!unlocked[doorId].includes(password.toUpperCase())) {
    unlocked[doorId].push(password.toUpperCase());
    localStorage.setItem("lb_durins_unlocked", JSON.stringify(unlocked));
  }
}

/**
 * When a password is used, set the user's language preference.
 * "Amigo" → Spanish experience. "Mellon" → Elvish. "Freund" → German.
 * Stored locally for ghosts, in Supabase for members.
 */
export function setLanguageFromDoor(language: string): void {
  localStorage.setItem("lb_language_preference", language);
  localStorage.setItem("lb_language_set_by_door", language);
}

export function getLanguagePreference(): string {
  return localStorage.getItem("lb_language_preference") || "english";
}

/**
 * Card use types for deck cards.
 */
export type CardUseType = "single" | "multi" | "daily" | "weekly" | "monthly" | "yearly" | "unlimited" | "keep_only";

export function canUseCard(useType: CardUseType, lastUsedAt: string | null, nextAvailableAt: string | null): boolean {
  if (useType === "unlimited" || useType === "keep_only") return useType === "unlimited";
  if (useType === "single") return !lastUsedAt;
  if (!nextAvailableAt) return true;
  return new Date(nextAvailableAt) <= new Date();
}

export function getNextAvailableTime(useType: CardUseType): Date | null {
  const now = new Date();
  switch (useType) {
    case "daily": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly": return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case "yearly": return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default: return null;
  }
}

// ─── WRONG-TRY TRACKING ───

/**
 * Get a random wrong-try destination. No repeats until all 5 exhausted.
 * Stored in localStorage for persistence across page reloads.
 */
export function getNextWrongTryDestination(): WrongTryDestination {
  const key = "lb_durins_wrong_tries";
  const stored = localStorage.getItem(key);
  let remaining: string[] = stored ? JSON.parse(stored) : [];

  // If empty or exhausted, refill and shuffle
  if (remaining.length === 0) {
    remaining = WRONG_TRY_DESTINATIONS.map((d) => d.id);
    // Fisher-Yates shuffle
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
  }

  // Pop the next one
  const nextId = remaining.shift()!;
  localStorage.setItem(key, JSON.stringify(remaining));

  return WRONG_TRY_DESTINATIONS.find((d) => d.id === nextId)!;
}

/**
 * Get wrong-try count for this session.
 */
export function getWrongTryCount(): number {
  return parseInt(localStorage.getItem("lb_durins_wrong_count") || "0", 10);
}

export function incrementWrongTryCount(): number {
  const count = getWrongTryCount() + 1;
  localStorage.setItem("lb_durins_wrong_count", String(count));
  return count;
}

export function resetWrongTryCount(): void {
  localStorage.setItem("lb_durins_wrong_count", "0");
}

export { getCurrentTimeWindow };
