import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight, Shield, DollarSign, Handshake, Hammer, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface FeatureFlag {
  feature_key: string;
  is_enabled: boolean;
  enabled_at: string | null;
  notes: string | null;
}

const FLAG_META: Record<string, { label: string; icon: typeof DollarSign; color: string; description: string }> = {
  war_chest_substitution: {
    label: "Substitution (Get Paid)",
    icon: DollarSign,
    color: "text-green-400",
    description: "Members convert eligible Marks into cash on their LB Card. Clean 1099-NEC tax treatment.",
  },
  war_chest_sponsorship: {
    label: "Sponsorship (IP Governance)",
    icon: Handshake,
    color: "text-blue-400",
    description: "Members sponsor other projects' bounties. Workers get paid, sponsors earn SAA governance weight. SAA is non-transferable — outside §83.",
  },
  war_chest_commission: {
    label: "Commission (Fund Bounties)",
    icon: Hammer,
    color: "text-amber-400",
    description: "Members fund bounties on their own projects. Constructive receipt issue — needs §125-style irrevocable prospective election design from counsel.",
  },
};

export default function FounderFeatureFlags() {
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<string | null>(null);

  const { data: flags, isLoading } = useQuery({
    queryKey: ["feature-flags-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("founder_feature_flags" as any)
        .select("*");
      if (error) throw error;
      return (data || []) as FeatureFlag[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ key, enable }: { key: string; enable: boolean }) => {
      setToggling(key);
      const { error } = await supabase
        .from("founder_feature_flags" as any)
        .update({
          is_enabled: enable,
          enabled_at: enable ? new Date().toISOString() : null,
        } as any)
        .eq("feature_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags-admin"] });
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
    onSettled: () => setToggling(null),
  });

  return (
    <PortalPageLayout title="Feature Flags" subtitle="Founder-only controls for War Chest and platform features" maxWidth="lg" xrayId="feature-flags-page">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
            <p className="text-slate-400 text-sm">Admin-only. Toggle = immediate effect across all members.</p>
          </div>
        </div>

        {isLoading && <p className="text-slate-400">Loading flags...</p>}

        <div className="space-y-4">
          {flags?.map((flag) => {
            const meta = FLAG_META[flag.feature_key];
            if (!meta) return null;
            const Icon = meta.icon;
            const isToggling = toggling === flag.feature_key;

            return (
              <Card key={flag.feature_key} className={`border ${flag.is_enabled ? "border-green-800/50 bg-green-950/20" : "border-slate-700/50 bg-slate-900/40"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                      <div>
                        <CardTitle className="text-lg text-white">{meta.label}</CardTitle>
                        <CardDescription className="text-slate-400 mt-1">{meta.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={flag.is_enabled ? "default" : "secondary"} className={flag.is_enabled ? "bg-green-600" : "bg-slate-600"}>
                        {flag.is_enabled ? "LIVE" : "OFF"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isToggling}
                        onClick={() => toggleMutation.mutate({ key: flag.feature_key, enable: !flag.is_enabled })}
                        className="p-1"
                      >
                        {flag.is_enabled
                          ? <ToggleRight className="w-8 h-8 text-green-400" />
                          : <ToggleLeft className="w-8 h-8 text-slate-500" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {flag.notes && (
                    <p className="text-xs text-slate-500 italic">{flag.notes}</p>
                  )}
                  {flag.enabled_at && flag.is_enabled && (
                    <p className="text-xs text-slate-500 mt-1">
                      Enabled: {new Date(flag.enabled_at).toLocaleDateString()}
                    </p>
                  )}
                  {flag.feature_key === "war_chest_commission" && !flag.is_enabled && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-amber-950/30 rounded border border-amber-800/30">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-amber-300">
                        Enabling Commission requires tax counsel sign-off. Constructive receipt applies — member has taxable income even if cash goes directly to contractor.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {flags && flags.length === 0 && (
          <p className="text-slate-400 text-center py-8">No feature flags configured.</p>
        )}
      </div>
    </PortalPageLayout>
  );
}
