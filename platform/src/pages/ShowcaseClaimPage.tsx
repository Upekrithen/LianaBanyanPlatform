import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTurnKeyProject } from '@/hooks/useTurnKeyProject';
import { useShowcaseDemand } from '@/hooks/useShowcaseDemand';
import { useToast } from '@/hooks/use-toast';
import { Star, Coins, PartyPopper, Sparkles } from 'lucide-react';

export default function ShowcaseClaimPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { project, isLoading } = useTurnKeyProject(slug);
  const demand = useShowcaseDemand(project?.id);
  const [claimed, setClaimed] = useState(false);

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in first');
      if (!project) throw new Error('Project not found');

      const { error: claimErr } = await supabase
        .from('turnkey_projects' as never)
        .update({
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
          status: 'active',
          creator_id: user.id,
          community_matched: demand.pledgeTotal,
        } as never)
        .eq('id', project.id);
      if (claimErr) throw claimErr;

      const { error: escErr } = await supabase
        .from('showcase_pledge_escrow' as never)
        .update({ status: 'converted', resolved_at: new Date().toISOString() } as never)
        .eq('project_id', project.id)
        .eq('status', 'held');
      if (escErr) throw escErr;
    },
    onSuccess: () => {
      setClaimed(true);
      qc.invalidateQueries({ queryKey: ['turnkey-project', slug] });
      toast({ title: 'Project claimed!', description: 'Welcome aboard — your pledges are now pre-orders.' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>;
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Project not found.</div>;
  }

  if (claimed || project.status === 'active') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="relative">
          <PartyPopper className="w-16 h-16 mx-auto text-amber-500 animate-bounce" />
          <Sparkles className="w-8 h-8 absolute top-0 right-1/3 text-yellow-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold">Welcome to Liana Banyan!</h1>
        <p className="text-muted-foreground text-lg">
          You've claimed <span className="font-semibold text-foreground">{project.title}</span>.
          {demand.pledgeTotal > 0 && (
            <> {demand.pledgeTotal.toLocaleString()} Credits from {demand.pledgerCount} pledgers are now pre-orders.</>
          )}
        </p>
        <Button size="lg" onClick={() => navigate(`/projects/${slug}`)} className="bg-amber-600 hover:bg-amber-700">
          Edit Your Project
        </Button>
      </div>
    );
  }

  if (project.status !== 'showcased') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-muted-foreground">This project is not available for claiming.</p>
        <Button variant="outline" onClick={() => navigate(`/projects/${slug}`)}>View Project</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {project.images && project.images.length > 0 && (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <Badge className="bg-amber-500 text-white mb-2">Red Carpet Showcase</Badge>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
      </div>

      <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-center">This is your product! Claim it.</h2>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/60 dark:bg-white/5 rounded-lg p-4">
              <Coins className="w-6 h-6 mx-auto text-amber-600 mb-1" />
              <div className="text-2xl font-bold">{demand.pledgeTotal.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Credits in pre-orders</div>
            </div>
            <div className="bg-white/60 dark:bg-white/5 rounded-lg p-4">
              <Star className="w-6 h-6 mx-auto text-amber-500 fill-amber-500 mb-1" />
              <div className="text-2xl font-bold">{demand.wantCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">people want this</div>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Claim this project to receive the pledged Credits as pre-orders.
            Membership is $5/year — that's it.
          </p>

          <Button
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-4 text-lg font-bold shadow-lg shadow-amber-500/20"
          >
            {claimMutation.isPending ? 'Claiming...' : 'Claim This Project'}
          </Button>
        </CardContent>
      </Card>

      {demand.comments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-3">What people are saying:</h3>
            <div className="space-y-2">
              {demand.comments.slice(0, 5).map(c => (
                <div key={c.id} className="text-sm border-l-2 border-amber-300 pl-3 py-1">
                  <p>{c.comment_text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
