export const SPICE_TYPES = [
  "salt",
  "garlic",
  "sugar",
  "cinnamon",
  "pepper",
  "ginger",
  "cumin",
  "paprika",
  "basil",
  "oregano",
] as const;

export type SpiceType = (typeof SPICE_TYPES)[number];

export type SpiceMeta = {
  spice: SpiceType;
  displayName: string;
  skillDomain: string;
  emoji: string;
  metaphorDescription: string;
  sortOrder: number;
};

export const SPICE_RACK: SpiceMeta[] = [
  {
    spice: "salt",
    displayName: "Salt",
    skillDomain: "Operations / Everyday Work",
    emoji: "🧂",
    metaphorDescription: "Essential. Preserves everything. Salt of the earth.",
    sortOrder: 1,
  },
  {
    spice: "garlic",
    displayName: "Garlic",
    skillDomain: "Accounting / Finance",
    emoji: "🧄",
    metaphorDescription: "Vital, strong. Keeps vampires (extractors) away.",
    sortOrder: 2,
  },
  {
    spice: "sugar",
    displayName: "Sugar",
    skillDomain: "Marketing / Outreach",
    emoji: "🍬",
    metaphorDescription: "Sweetens the deal. Makes things attractive.",
    sortOrder: 3,
  },
  {
    spice: "cinnamon",
    displayName: "Cinnamon",
    skillDomain: "Design / UX",
    emoji: "✨",
    metaphorDescription: "Warm, inviting. Makes things feel like home.",
    sortOrder: 4,
  },
  {
    spice: "pepper",
    displayName: "Pepper",
    skillDomain: "Legal / Compliance",
    emoji: "🌶️",
    metaphorDescription: "A little heat. Keeps things honest.",
    sortOrder: 5,
  },
  {
    spice: "ginger",
    displayName: "Ginger",
    skillDomain: "Innovation / R&D",
    emoji: "🫚",
    metaphorDescription: "Sharp, surprising, medicinal. Heals what is broken.",
    sortOrder: 6,
  },
  {
    spice: "cumin",
    displayName: "Cumin",
    skillDomain: "Engineering / Technical",
    emoji: "🟤",
    metaphorDescription: "Earthy, foundational. The building block.",
    sortOrder: 7,
  },
  {
    spice: "paprika",
    displayName: "Paprika",
    skillDomain: "Leadership / Vision",
    emoji: "🔴",
    metaphorDescription: "Color, warmth. Defines the whole dish.",
    sortOrder: 8,
  },
  {
    spice: "basil",
    displayName: "Basil",
    skillDomain: "Creative / Content",
    emoji: "🌿",
    metaphorDescription: "Fresh, fragrant. The signature ingredient.",
    sortOrder: 9,
  },
  {
    spice: "oregano",
    displayName: "Oregano",
    skillDomain: "Project Management / Coordination",
    emoji: "🫒",
    metaphorDescription: "Ties everything together. Works with anything.",
    sortOrder: 10,
  },
];

const SPICE_LOOKUP = new Map<SpiceType, SpiceMeta>(SPICE_RACK.map((entry) => [entry.spice, entry]));

export function getSpiceMeta(spice: string | null | undefined): SpiceMeta | null {
  if (!spice) return null;
  if (!isSpiceType(spice)) return null;
  return SPICE_LOOKUP.get(spice) ?? null;
}

export function isSpiceType(value: string): value is SpiceType {
  return (SPICE_TYPES as readonly string[]).includes(value);
}
