import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useState } from 'react';

export function ProfileVisibilitySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [moniker, setMoniker] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setMoniker(data.display_moniker || '');
      return data;
    },
    enabled: !!user,
  });

  const { data: visibility } = useQuery({
    queryKey: ['visibility-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profile_visibility_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMonikerMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ display_moniker: moniker })
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({ title: 'Moniker updated!', description: 'Your display name has been changed.' });
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async (updates: Partial<typeof visibility>) => {
      const { error } = await supabase
        .from('profile_visibility_settings')
        .upsert({
          user_id: user!.id,
          ...updates,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visibility-settings', user?.id] });
      toast({ title: 'Privacy settings updated!' });
    },
  });

  const toggleSetting = (key: keyof typeof visibility, value: boolean) => {
    updateVisibilityMutation.mutate({ [key]: value });
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Profile Privacy & Display
        </CardTitle>
        <CardDescription>
          Control what appears on your public profile. No PII or demographics are ever displayed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <Label htmlFor="moniker">Display Moniker (Public Name)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="moniker"
                placeholder="Choose your display name"
                value={moniker}
                onChange={(e) => setMoniker(e.target.value)}
              />
              <Button
                onClick={() => updateMonikerMutation.mutate()}
                disabled={!moniker || updateMonikerMutation.isPending}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This is how you'll appear publicly. Your real name is never shown unless you enable it below.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <EyeOff className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Private by Default</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your email, credit card info, age verification, and payment details are NEVER displayed publicly.
                  LB stores these securely for transactions only.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Public Profile Settings</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Real Name</Label>
              <p className="text-xs text-muted-foreground">Display your full name instead of moniker</p>
            </div>
            <Switch
              checked={visibility?.show_full_name || false}
              onCheckedChange={(checked) => toggleSetting('show_full_name', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Email</Label>
              <p className="text-xs text-muted-foreground">Make your email visible on public profile</p>
            </div>
            <Switch
              checked={visibility?.show_email || false}
              onCheckedChange={(checked) => toggleSetting('show_email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Achievements</Label>
              <p className="text-xs text-muted-foreground">Display your badges and milestones</p>
            </div>
            <Switch
              checked={visibility?.show_achievements !== false}
              onCheckedChange={(checked) => toggleSetting('show_achievements', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Guild Memberships</Label>
              <p className="text-xs text-muted-foreground">Display which guilds you belong to</p>
            </div>
            <Switch
              checked={visibility?.show_guilds !== false}
              onCheckedChange={(checked) => toggleSetting('show_guilds', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Clan Affiliations</Label>
              <p className="text-xs text-muted-foreground">Display your clan memberships</p>
            </div>
            <Switch
              checked={visibility?.show_clans !== false}
              onCheckedChange={(checked) => toggleSetting('show_clans', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Reputation Score</Label>
              <p className="text-xs text-muted-foreground">Display your reputation metrics</p>
            </div>
            <Switch
              checked={visibility?.show_reputation_score !== false}
              onCheckedChange={(checked) => toggleSetting('show_reputation_score', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Skill Levels</Label>
              <p className="text-xs text-muted-foreground">Display your skill certifications</p>
            </div>
            <Switch
              checked={visibility?.show_skill_levels !== false}
              onCheckedChange={(checked) => toggleSetting('show_skill_levels', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Project Count</Label>
              <p className="text-xs text-muted-foreground">Display how many projects you've completed</p>
            </div>
            <Switch
              checked={visibility?.show_project_count !== false}
              onCheckedChange={(checked) => toggleSetting('show_project_count', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}