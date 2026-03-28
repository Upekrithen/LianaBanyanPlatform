import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useToast } from '@/hooks/use-toast';
import { Handshake, Loader2, Lock } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'retail', label: 'Retail & Shopping' },
  { value: 'services', label: 'Services' },
  { value: 'makers', label: 'Makers & Manufacturing' },
  { value: 'tech', label: 'Technology' },
  { value: 'creative', label: 'Creative & Arts' },
  { value: 'other', label: 'Other' },
];

export default function CoalitionCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [minMembers, setMinMembers] = useState(5);

  const slug = slugify(name);

  const { data: userSub } = useQuery({
    queryKey: ['my-subscription-tier', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('platform_tier_subscriptions' as never)
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle() as { data: { tier: string } | null };
      return data;
    },
    enabled: !!user,
  });

  const isBuilder = userSub?.tier === 'builder';

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Sign in required');
      if (!isBuilder) throw new Error('Builder plan required');
      if (!name.trim()) throw new Error('Name is required');

      const finalSlug = slug + '-' + Date.now().toString(36).slice(-4);

      const { data: coalition, error } = await supabase
        .from('buying_coalitions' as never)
        .insert({
          name: name.trim(),
          slug: finalSlug,
          description: description.trim() || null,
          category,
          creator_id: user.id,
          min_members: Math.max(5, Math.min(100, minMembers)),
        } as never)
        .select('id, slug')
        .single() as { data: { id: string; slug: string } | null; error: unknown };

      if (error || !coalition) throw new Error('Failed to create coalition');

      await supabase
        .from('buying_coalition_members' as never)
        .insert({
          coalition_id: coalition.id,
          user_id: user.id,
          role: 'founder',
        } as never);

      return coalition.slug;
    },
    onSuccess: (coalitionSlug) => {
      toast({ title: 'Coalition Created!', description: 'Invite members to grow your buying power.' });
      navigate(`/coalitions/${coalitionSlug}`);
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  if (!user) {
    return (
      <PortalPageLayout title="Create Coalition" backButton>
        <Card>
          <CardContent className="text-center py-16">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Sign in to create a coalition.</p>
            <Button className="mt-4" onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  if (!isBuilder) {
    return (
      <PortalPageLayout title="Create Coalition" backButton>
        <Card>
          <CardContent className="text-center py-16">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium">Builder Plan Required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Coalition creation is available on the Builder tier ($25/mo).
            </p>
            <Button className="mt-4" onClick={() => navigate('/subscribe')}>View Plans</Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout title="Create Coalition" backButton data-xray-id="coalition-create">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Handshake className="w-5 h-5 text-emerald-400" />
            </div>
            <CardTitle>Start a Coalition</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Coalition Name *</Label>
            <Input
              placeholder="Downtown Makers Alliance"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={80}
            />
            {slug && (
              <p className="text-xs text-muted-foreground">URL: /coalitions/{slug}-...</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="A cooperative buying group for local makers sharing bulk material purchases..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Minimum Members to Activate</Label>
            <Input
              type="number"
              value={minMembers}
              onChange={e => setMinMembers(parseInt(e.target.value) || 5)}
              min={5}
              max={100}
            />
            <p className="text-xs text-muted-foreground">
              Coalition activates when this many members join. Minimum 5. Discount tiers unlock at 5, 10, 25, and 50 members.
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground space-y-1">
            <p><strong className="text-foreground">You'll be the Founder.</strong></p>
            <p>As founder, you manage the coalition, invite members, and steward the treasury. Other members can be promoted to Officer.</p>
          </div>

          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Creating...</>
            ) : (
              'Create Coalition'
            )}
          </Button>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
