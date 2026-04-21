import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReputationDisplay } from '@/components/ReputationDisplay';
import { UnifiedBadgeDisplay } from '@/components/UnifiedBadgeDisplay';
import { XPScoreDisplay } from '@/components/profile/XPScoreDisplay';
import { Award, TrendingUp, Users, Shield, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ReputationProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: reputation } = useQuery({
    queryKey: ['reputation-score', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reputation_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: ratings } = useQuery({
    queryKey: ['reputation-ratings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reputation_ratings')
        .select(`
          *,
          rater:profiles!reputation_ratings_rater_id_fkey(full_name, email),
          project:projects(name)
        `)
        .eq('ratee_id', userId)
        .lte('visible_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const { data: guilds } = useQuery({
    queryKey: ['user-guilds', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          guild:guilds(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  const { data: visibility } = useQuery({
    queryKey: ['visibility-settings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_visibility_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!profile || !reputation) {
    return (
      <PortalPageLayout>
        <div className="text-center">Loading reputation profile...</div>
      </PortalPageLayout>
    );
  }

  const categoryScores = [
    { name: 'Quality', score: reputation.criteria_quality_score },
    { name: 'Timeliness', score: reputation.criteria_timeliness_score },
    { name: 'Professionalism', score: reputation.criteria_professionalism_score },
    { name: 'Collaboration', score: reputation.criteria_collaboration_score },
    { name: 'Standards', score: reputation.criteria_standards_score }
  ];

  const displayName = (visibility?.show_full_name || isOwnProfile)
    ? (profile.full_name || profile.email)
    : (profile.display_moniker || 'Anonymous Member');

  const displayEmail = (visibility?.show_email || isOwnProfile)
    ? profile.email
    : null;

  return (
    <PortalPageLayout>
      {/* Privacy Notice */}
      {!isOwnProfile && (
        <div className="p-3 bg-muted rounded-lg flex items-center gap-2 text-sm">
          <EyeOff className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            This profile shows only qualifications, skills, and LB experience. No PII or demographics displayed.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          {displayEmail && <p className="text-muted-foreground">{displayEmail}</p>}
        </div>
        <Badge variant={reputation.eligible_for_committee ? "default" : "secondary"}>
          {reputation.account_type === 'business' ? 'Business Account' : 'Individual Account'}
        </Badge>
      </div>

      {/* Unified Badge Display */}
      {(visibility?.show_achievements !== false || isOwnProfile) && (
        <UnifiedBadgeDisplay userId={userId!} size="lg" />
      )}

      {/* XP Score — accomplishment metric (separate from reputation) */}
      {(visibility?.show_achievements !== false || isOwnProfile) && userId && (
        <XPScoreDisplay userId={userId} />
      )}

      {/* Reputation Display */}
      {(visibility?.show_reputation_score !== false || isOwnProfile) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Reputation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReputationDisplay
              level1Blocks={reputation.level_1_blocks}
              level2Blocks={reputation.level_2_blocks}
              level3Blocks={reputation.level_3_blocks}
              stars={reputation.stars}
              suns={reputation.suns}
              totalInteractions={reputation.total_interactions}
              positiveInteractions={reputation.positive_interactions}
              negativeInteractions={reputation.negative_interactions}
              overallScore={reputation.overall_score}
              size="lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reputation.total_interactions}</div>
            <p className="text-xs text-muted-foreground">
              {reputation.positive_interactions} positive, {reputation.negative_interactions} negative
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guild Memberships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guilds?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active guilds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Committee Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reputation.eligible_for_committee ? 'Eligible' : 'Not Eligible'}
            </div>
            <p className="text-xs text-muted-foreground">
              {reputation.eligible_for_committee
                ? `Since ${new Date(reputation.committee_eligible_since!).toLocaleDateString()}`
                : 'Need 100+ interactions and 4.0+ score'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Category Scores</TabsTrigger>
          <TabsTrigger value="ratings">Recent Ratings</TabsTrigger>
          <TabsTrigger value="guilds">Guilds</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
              <CardDescription>Average scores across all projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryScores.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.score.toFixed(2)}/5.0</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(category.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-4">
          {ratings?.map((rating) => (
            <Card key={rating.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {rating.project?.name}
                  </CardTitle>
                  <Badge variant={rating.is_positive ? "default" : "destructive"}>
                    {rating.composite_score.toFixed(1)}/5.0
                  </Badge>
                </div>
                <CardDescription>
                  {rating.interaction_type} • {new Date(rating.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              {rating.comment && (
                <CardContent>
                  <p className="text-sm">{rating.comment}</p>
                </CardContent>
              )}
            </Card>
          ))}
          {!ratings?.length && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No visible ratings yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guilds" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guilds?.map((membership) => (
              <Card key={membership.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    {membership.guild.display_name}
                    <Badge variant="outline">{membership.guild.custom_name}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {membership.guild.guild_type} • Joined {new Date(membership.joined_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                {membership.guild.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{membership.guild.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          {!guilds?.length && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Not a member of any guilds yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
