export const NARRATIVE_VERBS = [
  "discover",
  "debate",
  "decide",
  "meet",
  "make",
  "move",
  "reflect",
  "reroute",
] as const;

export type NarrativeVerb = (typeof NARRATIVE_VERBS)[number];

export type ChallengeType = "trivia" | "artifact_find" | "dialogue_choice" | "creation_task" | "travel";

export type DifficultyTier = "gentle" | "steady" | "bold";

export type BeaconOption = {
  id: string;
  name: string;
  location_path: string;
};

export type NarrativeCheckpoint = {
  id: string;
  verb: NarrativeVerb;
  title: string;
  challengeType: ChallengeType;
  notes: string;
  beaconId: string | null;
};

export type RunRewards = {
  marks: number;
  joules: number;
  badge: string;
};
