/**
 * AFFILIATION BADGES — /badges
 * Innovation #2234: Unified group affiliation display system
 * K387, B093
 *
 * Tab 1: "My Badges" — manage your own affiliation badges
 * Tab 2: "Visibility Settings" — two-sided filter (what you show / what you see)
 * Tab 3: "Discover Groups" — browse available groups (scaffold)
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Shield, Eye, Compass, Users } from "lucide-react";
import { useWildfireRun } from "@/contexts/WildfireRunContext";

/* ─── Types ─── */

interface AffiliationBadge {
  id: string;
  user_id: string;
  group_id: string;
  group_name: string;
  group_type: GroupType;
  display_enabled: boolean;
  equipped_at: string | null;
  created_at: string;
  updated_at: string;
}

interface VisibilityPref {
  id: string;
  user_id: string;
  category: GroupType;
  show_on_profile: boolean;
  show_others: boolean;
  updated_at: string;
}

type GroupType = "professional" | "business" | "sports" | "gaming" | "casual" | "political" | "religious";

/* ─── Constants ─── */

const GROUP_TYPES: GroupType[] = [
  "professional", "business", "sports", "gaming", "casual", "political", "religious",
];

const TYPE_COLORS: Record<GroupType, string> = {
  professional: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  sports: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  gaming: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  casual: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  political: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  religious: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const TYPE_DOTS: Record<GroupType, string> = {
  professional: "bg-blue-500",
  business: "bg-green-500",
  sports: "bg-orange-500",
  gaming: "bg-purple-500",
  casual: "bg-teal-500",
  political: "bg-red-500",
  religious: "bg-amber-500",
};

const HIDDEN_BY_DEFAULT: GroupType[] = ["political", "religious"];

/* ─── WildFire Tour mock data ─── */

const WILDFIRE_BADGES: AffiliationBadge[] = [
  {
    id: "wf-badge-1", user_id: "wf-user", group_id: "wf-g1", group_name: "Nashville Woodworkers Guild",
    group_type: "professional", display_enabled: true, equipped_at: new Date().toISOString(),
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "wf-badge-2", user_id: "wf-user", group_id: "wf-g2", group_name: "Monday Night Flag Football",
    group_type: "sports", display_enabled: true, equipped_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "wf-badge-3", user_id: "wf-user", group_id: "wf-g3", group_name: "Tabletop Gaming Collective",
    group_type: "gaming", display_enabled: true, equipped_at: null,
    created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date().toISOString(),
  },
];

const WILDFIRE_PREFS: VisibilityPref[] = GROUP_TYPES.map((cat) => ({
  id: `wf-pref-${cat}`,
  user_id: "wf-user",
  category: cat,
  show_on_profile: !HIDDEN_BY_DEFAULT.includes(cat),
  show_others: !HIDDEN_BY_DEFAULT.includes(cat),
  updated_at: new Date().toISOString(),
}));

const DISCOVER_GROUPS = [
  { name: "Local Farmers Co-op", type: "professional" as GroupType, members: 342 },
  { name: "Downtown Business Alliance", type: "business" as GroupType, members: 128 },
  { name: "Weekend Soccer League", type: "sports" as GroupType, members: 64 },
  { name: "Board Game Nights", type: "gaming" as GroupType, members: 89 },
  { name: "Neighborhood Book Club", type: "casual" as GroupType, members: 23 },
  { name: "Community Garden Network", type: "casual" as GroupType, members: 156 },
  { name: "Tech Startup Founders", type: "professional" as GroupType, members: 412 },
  { name: "Youth Basketball League", type: "sports" as GroupType, members: 78 },
  { name: "D&D Campaign Crew", type: "gaming" as GroupType, members: 31 },
];

/* ─── Component ─── */

export default function AffiliationBadgesPage() {
  const { user } = useAuth();
  const { isRunning: isWildfireTour } = useWildfireRun();
  const queryClient = useQueryClient();

  /* ─── Queries ─── */

  const badgesQuery = useQuery({
    queryKey: ["affiliation-badges", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("affiliation_badges")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as AffiliationBadge[];
    },
    enabled: !!user?.id && !isWildfireTour,
  });

  const prefsQuery = useQuery({
    queryKey: ["affiliation-prefs", user?.id],
    queryFn: async () => {
      let { data, error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("affiliation_visibility_prefs")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      if (!data || data.length === 0) {
        await (supabase as ReturnType<typeof supabase.rpc>).rpc("seed_affiliation_prefs", { p_user_id: user!.id });
        const res = await (supabase as ReturnType<typeof supabase.from>)
          .from("affiliation_visibility_prefs")
          .select("*")
          .eq("user_id", user!.id);
        if (res.error) throw res.error;
        data = res.data;
      }
      return data as unknown as VisibilityPref[];
    },
    enabled: !!user?.id && !isWildfireTour,
  });

  const toggleDisplayMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("affiliation_badges")
        .update({ display_enabled: enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["affiliation-badges"] }),
  });

  const equipMutation = useMutation({
    mutationFn: async ({ id, equip }: { id: string; equip: boolean }) => {
      const { error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("affiliation_badges")
        .update({ equipped_at: equip ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["affiliation-badges"] }),
  });

  const updatePrefMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "show_on_profile" | "show_others"; value: boolean }) => {
      const { error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("affiliation_visibility_prefs")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["affiliation-prefs"] }),
  });

  /* ─── Derived data ─── */

  const badges = isWildfireTour ? WILDFIRE_BADGES : (badgesQuery.data ?? []);
  const prefs = isWildfireTour ? WILDFIRE_PREFS : (prefsQuery.data ?? []);

  /* ─── Local optimistic toggle state for WildFire ─── */
  const [localPrefs, setLocalPrefs] = useState<Record<string, Partial<VisibilityPref>>>({});
  const [localBadges, setLocalBadges] = useState<Record<string, Partial<AffiliationBadge>>>({});

  const getEffectivePref = (pref: VisibilityPref) => ({
    ...pref,
    ...localPrefs[pref.id],
  });

  const getEffectiveBadge = (badge: AffiliationBadge) => ({
    ...badge,
    ...localBadges[badge.id],
  });

  const handlePrefToggle = (pref: VisibilityPref, field: "show_on_profile" | "show_others", value: boolean) => {
    if (isWildfireTour) {
      setLocalPrefs((p) => ({ ...p, [pref.id]: { ...p[pref.id], [field]: value } }));
    } else {
      updatePrefMutation.mutate({ id: pref.id, field, value });
    }
  };

  const handleDisplayToggle = (badge: AffiliationBadge, enabled: boolean) => {
    if (isWildfireTour) {
      setLocalBadges((b) => ({ ...b, [badge.id]: { ...b[badge.id], display_enabled: enabled } }));
    } else {
      toggleDisplayMutation.mutate({ id: badge.id, enabled });
    }
  };

  const handleEquipToggle = (badge: AffiliationBadge) => {
    const eff = getEffectiveBadge(badge);
    const equip = !eff.equipped_at;
    if (isWildfireTour) {
      setLocalBadges((b) => ({ ...b, [badge.id]: { ...b[badge.id], equipped_at: equip ? new Date().toISOString() : null } }));
    } else {
      equipMutation.mutate({ id: badge.id, equip });
    }
  };

  /* ─── Render ─── */

  return (
    <PortalPageLayout
      maxWidth="sm"
      xrayId="affiliation-badges"
      title="Affiliation Badges"
      subtitle="Control what you show and what you see"
    >
      <Tabs defaultValue="my-badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-badges">My Badges</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: MY BADGES ═══ */}
        <TabsContent value="my-badges" className="mt-4">
          {badges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>You haven't joined any groups yet.</p>
                <p className="text-sm mt-1">Discover groups below!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {badges.map((badge, index) => {
                const eff = getEffectiveBadge(badge);
                return (
                  <motion.div key={badge.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">{eff.group_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Badge className={TYPE_COLORS[eff.group_type]}>
                          {eff.group_type.charAt(0).toUpperCase() + eff.group_type.slice(1)}
                        </Badge>

                        <div className="flex items-center justify-between">
                          <Label htmlFor={`display-${badge.id}`} className="text-xs">Show on Profile</Label>
                          <Switch
                            id={`display-${badge.id}`}
                            checked={eff.display_enabled}
                            onCheckedChange={(v) => handleDisplayToggle(badge, v)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          {eff.equipped_at ? (
                            <span className="text-[10px] text-muted-foreground">
                              Equipped {new Date(eff.equipped_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Not equipped</span>
                          )}
                          <Button
                            size="sm"
                            variant={eff.equipped_at ? "outline" : "default"}
                            className="text-xs"
                            onClick={() => handleEquipToggle(badge)}
                          >
                            {eff.equipped_at ? "Unequip" : "Equip"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══ TAB 2: VISIBILITY SETTINGS ═══ */}
        <TabsContent value="visibility" className="mt-4">
          <div className="space-y-3">
            {GROUP_TYPES.map((cat) => {
              const pref = prefs.find((p) => p.category === cat);
              if (!pref) return null;
              const eff = getEffectivePref(pref);
              const isHiddenDefault = HIDDEN_BY_DEFAULT.includes(cat);
              return (
                <Card key={cat}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${TYPE_DOTS[cat]}`} />
                      <span className="text-sm font-semibold capitalize">{cat}</span>
                      {isHiddenDefault && (
                        <span className="text-[10px] text-muted-foreground">(Hidden by default)</span>
                      )}
                    </div>
                    <div className="space-y-2 pl-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`show-mine-${cat}`} className="text-xs">
                          Show MY badges in this category on my profile
                        </Label>
                        <Switch
                          id={`show-mine-${cat}`}
                          checked={eff.show_on_profile}
                          onCheckedChange={(v) => handlePrefToggle(pref, "show_on_profile", v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`show-others-${cat}`} className="text-xs">
                          Show OTHER members' badges in this category
                        </Label>
                        <Switch
                          id={`show-others-${cat}`}
                          checked={eff.show_others}
                          onCheckedChange={(v) => handlePrefToggle(pref, "show_others", v)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══ TAB 3: DISCOVER GROUPS ═══ */}
        <TabsContent value="discover" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DISCOVER_GROUPS.map((group, index) => (
              <motion.div key={group.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge className={TYPE_COLORS[group.type]}>
                      {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{group.members} members</span>
                    </div>
                    <Button size="sm" variant="outline" disabled className="w-full text-xs" title="Coming soon">
                      <Compass className="w-3 h-3 mr-1" /> Join
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
