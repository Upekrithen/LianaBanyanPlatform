import { useMemo } from "react";

type TourTargetAttributes = {
  "data-tour-target": string;
};

export function useTourTarget(targetId: string): TourTargetAttributes {
  return useMemo(() => ({ "data-tour-target": targetId }), [targetId]);
}
