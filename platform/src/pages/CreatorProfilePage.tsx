/**
 * Individual Creator Profile — /creators/:creatorId
 * Bio, avatar, "See their work", product grid, BandWagon, "Back this Creator", referral info.
 */

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, ExternalLink } from "lucide-react";
import { CreatorShowcase } from "@/components/creator";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const CREATOR_TYPE_LABELS: Record<string, string> = {
  physical: "Physical Products",
  art: "Art & Design",
  food: "Food",
  music: "Music & Content",
  business: "Business Ideas",
};

export default function CreatorProfilePage() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["creator-profile", creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, display_name, avatar_url, creator_type, creator_external_url, created_at")
        .or(`id.eq.${creatorId},user_id.eq.${creatorId}`)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!creatorId,
  });

  const { data: projects } = useQuery({
    queryKey: ["creator-projects", profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description")
        .eq("owner_id", profile.user_id)
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.user_id,
  });

  const { data: backerCount } = useQuery({
    queryKey: ["creator-total-backings", profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return 0;
      const { data: projs } = await supabase.from("projects").select("id").eq("owner_id", profile.user_id);
      const ids = (projs || []).map((p: { id: string }) => p.id);
      if (ids.length === 0) return 0;
      const { count } = await supabase
        .from("project_backings")
        .select("*", { count: "exact", head: true })
        .in("project_id", ids);
      return count ?? 0;
    },
    enabled: !!profile?.user_id,
  });

  const { data: referral } = useQuery({
    queryKey: ["creator-referral", profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return null;
      const { data } = await supabase
        .from("creator_referrals")
        .select("referrer_id")
        .eq("referred_user_id", profile.user_id)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.user_id,
  });

  const { data: referrerProfile } = useQuery({
    queryKey: ["referrer-profile", referral?.referrer_id],
    queryFn: async () => {
      if (!referral?.referrer_id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, full_name")
        .eq("id", referral.referrer_id)
        .maybeSingle();
      return data;
    },
    enabled: !!referral?.referrer_id,
  });

  if (!creatorId) return null;
  if (isLoading || !profile) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="creator-profile">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PortalPageLayout>
    );
  }

  const name = profile.display_name || profile.full_name || "Creator";
  const firstProjectId = (projects || [])[0]?.id;

  return (
    <PortalPageLayout maxWidth="md" xrayId="creator-profile">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/creators")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Creators
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <Badge variant="secondary" className="mt-1">
                  {CREATOR_TYPE_LABELS[profile.creator_type || ""] ?? profile.creator_type}
                </Badge>
                {profile.creator_external_url && (
                  <a
                    href={profile.creator_external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                  >
                    See their work
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {(backerCount ?? 0) > 0 && (
          <p className="text-sm text-muted-foreground">
            {(backerCount ?? 0)} total backings across their projects
          </p>
        )}

        {firstProjectId && (
          <CreatorShowcase
            creatorName={name}
            creatorAvatarUrl={profile.avatar_url}
            creatorProfileUrl={profile.creator_external_url}
            priceDisplay="Cost+20"
            projectId={firstProjectId}
            projectType="project"
            currentBackerCount={backerCount ?? 0}
          />
        )}

        {projects && projects.length > 1 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Products</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {projects.slice(1, 10).map((p: { id: string; name: string }) => (
                  <li key={p.id}>
                    <Link to={`/project/${p.id}`} className="text-primary hover:underline">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {referrerProfile && (
          <p className="text-sm text-muted-foreground">
            Brought to LB by {referrerProfile.display_name || referrerProfile.full_name || "a member"}
          </p>
        )}
      </div>
    </PortalPageLayout>
  );
}
