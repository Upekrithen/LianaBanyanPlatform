export type AdaptPillarKey = "adaptability" | "durability" | "alignment" | "participation" | "transmission";

export type AdaptPillar = {
  key: AdaptPillarKey;
  label: string;
  icon: string;
  score: number;
  trend: number[];
  driver: string;
  roomToGrow: string;
};
