import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GuildCreationDialog } from '@/components/GuildCreationDialog';
import { Plus, Users, Search, Network } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Guilds() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: guilds, isLoading } = useQuery({
    queryKey: ['guilds', searchQuery],
    queryFn: async () => {
      // Real: guilds (id, name, slug, description, tagline, guild_type, specialty, member_count, max_members, membership_type, guild_master_id, ...)
      let query = supabase
        .from('guilds')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: myGuilds } = useQuery({
    queryKey: ['my-guilds'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Real: guild_members (id, guild_id, user_id, role, rank, experience_points, status, joined_at, ...)
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          guild:guilds(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  const divisions = guilds?.filter(g => g.guild_type === 'division') || [];
  const industries = guilds?.filter(g => g.guild_type === 'industry') || [];
  const skills = guilds?.filter(g => g.guild_type === 'skill') || [];

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8" />
            Guilds & Collectives
          </h1>
          <p className="text-muted-foreground mt-1">
            Join or create guilds, clans, tribes, families, and other collectives in the Liana Banyan network
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Guild
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search guilds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* My Guilds */}
      {myGuilds && myGuilds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Guilds</CardTitle>
            <CardDescription>Guilds you are a member of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGuilds.map((membership) => (
                <Card key={membership.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      {membership.guild.display_name}
                      <Badge variant="outline">{membership.guild.custom_name}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{membership.guild.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guild Browser */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Guilds</TabsTrigger>
          <TabsTrigger value="divisions">Divisions</TabsTrigger>
          <TabsTrigger value="industries">Industries</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <GuildGrid guilds={guilds} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="divisions" className="space-y-4">
          <GuildGrid guilds={divisions} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="industries" className="space-y-4">
          <GuildGrid guilds={industries} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <GuildGrid guilds={skills} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <GuildCreationDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}

function GuildGrid({ guilds, isLoading }: { guilds: any[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading guilds...</div>;
  }

  if (!guilds || guilds.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No guilds found. Be the first to create one!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guilds.map((guild) => (
        <Card key={guild.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{guild.display_name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{guild.custom_name}</Badge>
                  <Badge variant="secondary" className="text-xs">{guild.guild_type}</Badge>
                </CardDescription>
              </div>
              {guild.is_official && (
                <Badge variant="default" className="ml-2">Official</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {guild.description || 'No description provided'}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{guild.member_count?.[0]?.count || 0} members</span>
              </div>
              <Button variant="outline" size="sm">Join Guild</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
