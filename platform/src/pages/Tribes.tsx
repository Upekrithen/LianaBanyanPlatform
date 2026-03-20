import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClanCreationDialog } from '@/components/ClanCreationDialog';
import { ClanCharterManager } from '@/components/ClanCharterManager';
import { ClanAgreementManager } from '@/components/ClanAgreementManager';
import { Users, Search, Shield, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function Clans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);

  // Tribes = small guilds (guild_type='tribe' or similar)
  // Real table: guilds (no separate clans table)
  const { data: allClans, isLoading: allClansLoading } = useQuery({
    queryKey: ['tribes', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('guilds')
        .select('*')
        .eq('status', 'active');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's guild memberships (tribes are small guilds)
  const { data: myClans, isLoading: myClansLoading } = useQuery({
    queryKey: ['my-tribes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Real: guild_members (no clan_members table)
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          guild:guilds(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleJoinClan = async (clanId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('guild_members')
      .insert({
        guild_id: clanId,
        user_id: user.id,
        status: 'active',
        role: 'member',
        rank: 1,
        experience_points: 0,
        projects_completed: 0,
        mentees_count: 0,
      });

    if (error) {
      console.error('Error joining clan:', error);
    }
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="tribes">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Clans
          </h1>
          <p className="text-muted-foreground">
            Chosen family networks across guilds and lone wolves
          </p>
        </div>
        <ClanCreationDialog />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {myClans && myClans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Clans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClans.map((membership) => (
              <Card key={membership.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader onClick={() => setSelectedClanId(membership.clans.id)}>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {membership.clans.display_name || membership.clans.name}
                  </CardTitle>
                  <CardDescription>
                    {membership.clans.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {membership.clans.clan_members?.[0]?.count || 0} members
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedClanId(membership.clans.id)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedClanId && (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedClanId(null)}>
            ← Back to All Clans
          </Button>
          <div className="grid gap-6">
            <ClanCharterManager clanId={selectedClanId} />
            <ClanAgreementManager clanId={selectedClanId} />
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Clans</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ClanGrid clans={allClans} isLoading={allClansLoading} onJoin={handleJoinClan} />
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
}

function ClanGrid({ 
  clans, 
  isLoading,
  onJoin 
}: { 
  clans: any[] | undefined;
  isLoading: boolean;
  onJoin: (clanId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!clans || clans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No clans found. Be the first to create one!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clans.map((clan) => (
        <Card key={clan.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {clan.display_name || clan.name}
            </CardTitle>
            <CardDescription>
              {clan.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {clan.clan_members?.[0]?.count || 0} members
              </span>
              <span className="text-muted-foreground">
                Stake: ${clan.stake_amount}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Created by {clan.profiles?.full_name || clan.profiles?.email}
            </div>
            <Button 
              onClick={() => onJoin(clan.id)}
              className="w-full"
              size="sm"
            >
              Join Clan
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
