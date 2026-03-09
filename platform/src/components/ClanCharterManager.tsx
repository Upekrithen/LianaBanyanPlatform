import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle2, Clock, PenTool } from 'lucide-react';

interface ClanCharterManagerProps {
  clanId: string;
}

export function ClanCharterManager({ clanId }: ClanCharterManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [charterText, setCharterText] = useState('');
  const [charterName, setCharterName] = useState('');

  const { data: clan } = useQuery({
    queryKey: ['clan', clanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .eq('id', clanId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: charter } = useQuery({
    queryKey: ['clan-charter', clanId],
    queryFn: async () => {
      const { data: charterData, error: charterError } = await supabase
        .from('clan_charters')
        .select('*')
        .eq('clan_id', clanId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (charterError) throw charterError;
      if (!charterData) return null;

      // Fetch signatures separately
      const { data: signatures, error: sigError } = await supabase
        .from('charter_signatories')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq('charter_id', charterData.id);
      
      if (sigError) throw sigError;
      
      return {
        ...charterData,
        charter_signatories: signatures || []
      };
    },
  });

  const { data: isMember } = useQuery({
    queryKey: ['clan-member', clanId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('guild_members')
        .select('id')
        .eq('clan_id', clanId)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const createCharterMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('clan_charters')
        .insert({
          clan_id: clanId,
          charter_name: charterName,
          charter_document: charterText,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-charter', clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
      toast({ title: 'Charter created!', description: 'Members can now sign the charter.' });
      setCharterText('');
      setCharterName('');
    },
  });

  const signCharterMutation = useMutation({
    mutationFn: async () => {
      if (!charter || !user) throw new Error('Charter or user not found');
      const { error } = await supabase
        .from('charter_signatories')
        .insert({
          charter_id: charter.id,
          user_id: user.id,
          charter_type: 'clan',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-charter', clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
      toast({ title: 'Charter signed!', description: 'Your signature has been recorded.' });
    },
  });

  const alreadySigned = charter?.charter_signatories?.some(
    (sig: any) => sig.user_id === user?.id
  );

  const statusBadge = () => {
    if (!clan) return null;
    const status = clan.status;
    const colors = {
      forming: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      charter_pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
    };
    const labels = {
      forming: 'Forming',
      charter_pending: 'Charter Pending',
      active: 'Active',
      inactive: 'Inactive',
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Clan Charter
            </CardTitle>
            <CardDescription>
              Define relationships and rules for your clan
            </CardDescription>
          </div>
          {statusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!charter && isMember && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="charter-name">Charter Name</Label>
              <Input
                id="charter-name"
                placeholder="e.g., Shadow Syndicate Charter of 2025"
                value={charterName}
                onChange={(e) => setCharterName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="charter-text">Charter Document</Label>
              <Textarea
                id="charter-text"
                placeholder="Define your clan's purpose, rules, benefits, and commitments..."
                value={charterText}
                onChange={(e) => setCharterText(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={() => createCharterMutation.mutate()}
              disabled={!charterText || !charterName || createCharterMutation.isPending}
            >
              Create Charter
            </Button>
          </div>
        )}

        {charter && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{charter.charter_name}</h3>
              <div className="p-4 bg-muted rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {charter.charter_document}
                </pre>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Signatures ({charter.charter_signatories?.length || 0} / {clan?.charter_required_signatures})
              </h4>
              
              {charter.charter_signatories?.map((sig: any) => (
                <div key={sig.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{sig.profiles?.full_name || sig.profiles?.email}</span>
                  <span className="text-muted-foreground">
                    {new Date(sig.signed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}

              {isMember && !alreadySigned && charter.is_active === false && (
                <Button
                  onClick={() => signCharterMutation.mutate()}
                  disabled={signCharterMutation.isPending}
                  variant="default"
                  className="w-full mt-4"
                >
                  Sign Charter
                </Button>
              )}

              {alreadySigned && (
                <div className="flex items-center gap-2 text-green-600 mt-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">You've signed this charter</span>
                </div>
              )}
            </div>

            {clan?.status === 'charter_pending' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Awaiting Admin Approval
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your charter has all required signatures. Waiting for LB admin to review and activate.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {clan?.status === 'active' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Charter Active
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your clan is now active and benefits are unlocked!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}