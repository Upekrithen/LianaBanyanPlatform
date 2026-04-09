import { supabase } from "@/integrations/supabase/client";

export type BatteryDispatchSource =
  | "influencer"
  | "project"
  | "harper"
  | "jukebox_artist"
  | "crown"
  | "captain"
  | "staff_override";

export type BatteryDispatchAccessStatus = {
  hasAccess: boolean;
  activeSources: BatteryDispatchSource[];
  activeGrantCount: number;
  mostRecentActivity: string | null;
};

export const SOURCE_LABELS: Record<BatteryDispatchSource, string> = {
  influencer: "Influencer",
  project: "Project holder",
  harper: "Harper Guild",
  jukebox_artist: "Jukebox artist",
  crown: "Crown holder",
  captain: "Captain",
  staff_override: "Staff override",
};

export async function getBatteryDispatchAccessStatus(
  userId: string,
): Promise<BatteryDispatchAccessStatus> {
  const { data, error } = await supabase
    .from("battery_dispatch_access_status" as never)
    .select("has_access, active_sources, active_grant_count, most_recent_activity")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      hasAccess: false,
      activeSources: [],
      activeGrantCount: 0,
      mostRecentActivity: null,
    };
  }

  const row = data as {
    has_access: boolean;
    active_sources: BatteryDispatchSource[] | null;
    active_grant_count: number | null;
    most_recent_activity: string | null;
  };

  return {
    hasAccess: !!row.has_access,
    activeSources: row.active_sources ?? [],
    activeGrantCount: row.active_grant_count ?? 0,
    mostRecentActivity: row.most_recent_activity,
  };
}

export async function grantInfluencerBatteryDispatchAccess(userId: string, note?: string) {
  const { error } = await supabase.rpc("upsert_battery_dispatch_grant" as never, {
    p_user_id: userId,
    p_access_source: "influencer",
    p_source_ref_id: "self_declared",
    p_status: "active",
    p_notes: note ?? null,
  } as never);

  if (error) {
    throw error;
  }
}
