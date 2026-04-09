export type StrengthNeed = "everyday" | "durable" | "high_stress";
export type MaterialNeed = "resin" | "silicone" | "thermoplastic" | "mixed";
export type BatchNeed = "small" | "medium" | "large";
export type ConstraintNeed = "compact" | "low_noise" | "venting_ready" | "limited_power";
export type NodeAmbition = "learning" | "building" | "qualifying";

export type KitTier = "gravity" | "thermoplastic" | "complete";

export type WorkProfileAnswers = {
  primaryWork: string;
  currentTools: string;
  strengthNeed: StrengthNeed;
  materialNeed: MaterialNeed;
  batchNeed: BatchNeed;
  constraints: ConstraintNeed[];
  nodeAmbition: NodeAmbition;
};

export const KIT_PRICING: Record<KitTier, number> = {
  gravity: 249,
  thermoplastic: 329,
  complete: 499,
};
