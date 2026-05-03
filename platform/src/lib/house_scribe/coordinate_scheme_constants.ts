/**
 * House Scribe coordinate scheme constants — frontend mirror.
 * Mirrors librarian-mcp/src/house_scribe/coordinate_scheme.ts for platform UI use.
 */

export const CATHEDRAL_IDS: Record<string, string> = {
  bishop:                "01",
  knight:                "02",
  pawn:                  "03",
  apiarist_tribe_hive:   "04",
  apiarist_family_hive:  "05",
  apiarist_project_hive: "06",
  apiarist_guild_hive:   "07",
  cross:                 "99",
};

export const TIER_IDS: Record<string, string> = {
  sand:       "01",
  gravel:     "02",
  dirt_road:  "03",
  paved_road: "04",
  highway:    "05",
  freeway:    "06",
  bedrock:    "07",
  cross_tier: "99",
};

export const FLAVOR_IDS: Record<string, string> = {
  cinnamon:     "01",
  vanilla:      "02",
  spice:        "03",
  fruit:        "04",
  vegetable:    "05",
  nut:          "06",
  cross_flavor: "99",
};

export const MAX_JARS_PER_CELL = 100;
export const WILDCARD_RESULT_CAP = 1000;
