import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { HandshakeIcon, Plus, Percent, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ClanAgreementManagerProps {
  clanId: string;
}

export function ClanAgreementManager({ clanId }: ClanAgreementManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [agreementType, setAgreementType] = useState<'discount' | 'priority' | 'contract'>('discount');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [appliesTo, setAppliesTo] = useState<'all' | 'specific'>('all');

  const { data: agreements } = useQuery({
    queryKey: ['clan-agreements', clanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clan_member_agreements')
        .select(`
          *,
          profiles:created_by (full_name, email)
        `)
        .eq('clan_id', clanId)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: clanMembers } = useQuery({
    queryKey: ['clan-members', clanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          profiles:user_id (id, full_name, email)
        `)
        .eq('clan_id', clanId)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const createAgreementMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('clan_member_agreements')
        .insert({
          clan_id: clanId,
          created_by: user!.id,
          agreement_type: agreementType,
          applies_to: appliesTo,
          discount_percentage: agreementType === 'discount' ? discountPercent : null,
          terms: {
            description: getAgreementDescription(),
          },
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-agreements', clanId] });
      toast({ title: 'Agreement created!', description: 'Your clan benefit is now active.' });
      setOpen(false);
      setDiscountPercent(10);
      setAppliesTo('all');
    },
  });

  const getAgreementDescription = () => {
    switch (agreementType) {
      case 'discount':
        return `${discountPercent}% discount on all my services/products`;
      case 'priority':
        return 'Priority access to my projects and services';
      case 'contract':
        return 'Automatic contract templates for clan collaborations';
      default:
        return '';
    }
  };

  const agreementTypeLabels = {
    discount: 'Discount',
    priority: 'Priority Access',
    contract: 'Auto Contract',
  };

  const agreementIcons = {
    discount: Percent,
    priority: Users,
    contract: HandshakeIcon,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HandshakeIcon className="w-5 h-5" />
              Clan Benefits & Agreements
            </CardTitle>
            <CardDescription>
              Nepotism, but it's chosen family
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Benefit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Clan Benefit</DialogTitle>
                <DialogDescription>
                  Offer special benefits to your clan members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Benefit Type</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['discount', 'priority', 'contract'] as const).map((type) => {
                      const Icon = agreementIcons[type];
                      return (
                        <Button
                          key={type}
                          variant={agreementType === type ? 'default' : 'outline'}
                          onClick={() => setAgreementType(type)}
                          className="flex flex-col h-auto py-4"
                        >
                          <Icon className="w-5 h-5 mb-2" />
                          <span className="text-xs">{agreementTypeLabels[type]}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {agreementType === 'discount' && (
                  <div>
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div>
                  <Label>Applies To</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={appliesTo === 'all' ? 'default' : 'outline'}
                      onClick={() => setAppliesTo('all')}
                    >
                      All Members
                    </Button>
                    <Button
                      variant={appliesTo === 'specific' ? 'default' : 'outline'}
                      onClick={() => setAppliesTo('specific')}
                    >
                      Specific Members
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <p className="text-sm text-muted-foreground">
                    {getAgreementDescription()}
                  </p>
                </div>

                <Button
                  onClick={() => createAgreementMutation.mutate()}
                  disabled={createAgreementMutation.isPending}
                  className="w-full"
                >
                  Create Benefit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!agreements || agreements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HandshakeIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No clan benefits yet. Create one to get started!</p>
            </div>
          ) : (
            agreements.map((agreement: any) => {
              const Icon = agreementIcons[agreement.agreement_type as keyof typeof agreementIcons];
              return (
                <Card key={agreement.id} className="border-2">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {agreementTypeLabels[agreement.agreement_type as keyof typeof agreementTypeLabels]}
                            </h4>
                            {agreement.discount_percentage && (
                              <Badge variant="secondary">
                                {agreement.discount_percentage}% off
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {agreement.terms?.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>By {agreement.profiles?.full_name || agreement.profiles?.email}</span>
                            <span>•</span>
                            <span>
                              {agreement.applies_to === 'all' ? 'All members' : 'Specific members'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
