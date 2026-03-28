import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  User, MapPin, Calendar, Edit, Save, X, Map, Trophy,
  Users, Ghost, Palette, Shield,
} from 'lucide-react';

interface MemberProfileData {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_public: boolean;
  tags: string[];
  joined_at: string;
}

interface MapProgressRow { map_id: string; current_phase: number; }
interface ArenaSubmission { id: string; title: string; category: string; rating: number | null; }
interface CrewSeat { crew_table_id: string; table_name: string; role: string; }

const TAG_COLORS: Record<string, string> = {
  food: 'bg-orange-100 text-orange-800',
  housing: 'bg-blue-100 text-blue-800',
  transport: 'bg-green-100 text-green-800',
  maker: 'bg-purple-100 text-purple-800',
  business: 'bg-yellow-100 text-yellow-800',
  volunteer: 'bg-pink-100 text-pink-800',
  explore: 'bg-gray-100 text-gray-800',
};

export default function MemberProfile() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<MemberProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true');
  const [editForm, setEditForm] = useState({ display_name: '', bio: '', location: '', avatar_url: '', is_public: true });
  const [saving, setSaving] = useState(false);

  // Activity data
  const [maps, setMaps] = useState<MapProgressRow[]>([]);
  const [arenaSubmissions, setArenaSubmissions] = useState<ArenaSubmission[]>([]);
  const [crewSeats, setCrewSeats] = useState<CrewSeat[]>([]);

  const isOwnProfile = user && profile && user.id === profile.user_id;

  useEffect(() => {
    if (!username) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('member_profiles' as never)
        .select('*')
        .eq('username', username)
        .maybeSingle() as { data: MemberProfileData | null };

      if (data) {
        setProfile(data);
        setEditForm({
          display_name: data.display_name || '',
          bio: data.bio || '',
          location: data.location || '',
          avatar_url: data.avatar_url || '',
          is_public: data.is_public,
        });

        // Load activity data
        const [mapRes, arenaRes, crewRes] = await Promise.all([
          supabase.from('treasure_map_progress' as never).select('map_id, current_phase').eq('user_id', data.user_id) as Promise<{ data: MapProgressRow[] | null }>,
          supabase.from('arena_submissions' as never).select('id, title, category, rating').eq('creator_id', data.user_id).limit(10) as Promise<{ data: ArenaSubmission[] | null }>,
          supabase.from('crew_table_seats' as never).select('crew_table_id, role').eq('member_id', data.user_id) as Promise<{ data: { crew_table_id: string; role: string }[] | null }>,
        ]);

        setMaps(mapRes.data || []);
        setArenaSubmissions(arenaRes.data || []);

        if (crewRes.data && crewRes.data.length > 0) {
          const tableIds = crewRes.data.map(s => s.crew_table_id);
          const { data: tables } = await supabase
            .from('crew_tables' as never)
            .select('id, name')
            .in('id', tableIds) as { data: { id: string; name: string }[] | null };

          const tableMap = new Map((tables || []).map(t => [t.id, t.name]));
          setCrewSeats(crewRes.data.map(s => ({
            crew_table_id: s.crew_table_id,
            table_name: tableMap.get(s.crew_table_id) || 'Unknown Table',
            role: s.role,
          })));
        }
      }
      setLoading(false);
    })();
  }, [username]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('member_profiles' as never)
      .update({
        display_name: editForm.display_name || null,
        bio: editForm.bio || null,
        location: editForm.location || null,
        avatar_url: editForm.avatar_url || null,
        is_public: editForm.is_public,
      } as never)
      .eq('user_id', profile.user_id);

    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
    } else {
      setProfile(prev => prev ? { ...prev, ...editForm } : prev);
      setEditing(false);
      toast({ title: 'Profile updated!' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Member not found</h2>
          <p className="text-muted-foreground">@{username} doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-3xl mx-auto px-4 py-12 space-y-6" data-xray-id="member-profile">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            {editing && isOwnProfile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Edit Profile</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <Input value={editForm.display_name} onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself" rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="City, State" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Avatar URL</label>
                    <Input value={editForm.avatar_url} onChange={e => setEditForm(f => ({ ...f, avatar_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editForm.is_public} onCheckedChange={v => setEditForm(f => ({ ...f, is_public: v }))} />
                    <span className="text-sm">Public profile</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary shrink-0 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name || profile.username} className="w-full h-full object-cover" />
                  ) : (
                    (profile.display_name || profile.username)[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold truncate">{profile.display_name || profile.username}</h1>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  {profile.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {profile.location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> Member since {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
                  {profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {profile.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className={TAG_COLORS[tag] || ''}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Sections */}
        <Tabs defaultValue="maps" className="space-y-4">
          <TabsList>
            {maps.length > 0 && <TabsTrigger value="maps"><Map className="h-4 w-4 mr-1" /> Maps</TabsTrigger>}
            {arenaSubmissions.length > 0 && <TabsTrigger value="arena"><Palette className="h-4 w-4 mr-1" /> Arena</TabsTrigger>}
            {crewSeats.length > 0 && <TabsTrigger value="crews"><Users className="h-4 w-4 mr-1" /> Crews</TabsTrigger>}
            {maps.length === 0 && arenaSubmissions.length === 0 && crewSeats.length === 0 && (
              <TabsTrigger value="empty" disabled>No activity yet</TabsTrigger>
            )}
          </TabsList>

          {maps.length > 0 && (
            <TabsContent value="maps">
              <div className="space-y-2">
                {maps.map(m => (
                  <Card key={m.map_id}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Map className="h-4 w-4 text-primary" />
                      <span className="font-medium flex-1">
                        {m.map_id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <Badge variant="outline">Phase {m.current_phase}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {arenaSubmissions.length > 0 && (
            <TabsContent value="arena">
              <div className="space-y-2">
                {arenaSubmissions.map(s => (
                  <Card key={s.id}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Palette className="h-4 w-4 text-purple-500" />
                      <div className="flex-1">
                        <span className="font-medium">{s.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.category}</span>
                      </div>
                      {s.rating != null && (
                        <Badge variant="secondary"><Trophy className="h-3 w-3 mr-1" /> {s.rating}</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {crewSeats.length > 0 && (
            <TabsContent value="crews">
              <div className="space-y-2">
                {crewSeats.map(s => (
                  <Card key={s.crew_table_id}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-medium flex-1">{s.table_name}</span>
                      <Badge variant="outline">{s.role}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
