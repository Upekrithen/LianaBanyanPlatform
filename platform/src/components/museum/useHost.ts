/**
 * useHost — Returns the current province's host mascot id.
 * ========================================================
 * Reads the province from BuilderModeContext (safely — falls back
 * to "southern" / LRH if the provider isn't mounted, e.g. in DSSApp
 * or HexIsleApp trees).
 *
 * Hosts are currently:
 *   southern → "lrh"    (Little Red Hen)
 *   northern → "denken" (Founder persona)
 *
 * Callers: any component that wants "show whoever is the host right
 * now" instead of hardcoding LRH. Use this over static "lrh" strings
 * anywhere the FAB / intro / inline-narrator character appears.
 */
import { useBuilderModeSafe } from "@/components/builder/BuilderModeContext";
import { getHostForProvince } from "@/data/mascots";
import type { MascotDefinition } from "@/data/mascots";

export function useHost(): MascotDefinition {
  const ctx = useBuilderModeSafe() as {
    province?: "southern" | "northern";
  };
  const province = ctx?.province ?? "southern";
  return getHostForProvince(province);
}

/** Shorthand for just the host id, e.g. "lrh" or "denken". */
export function useHostId(): string {
  return useHost().id;
}
