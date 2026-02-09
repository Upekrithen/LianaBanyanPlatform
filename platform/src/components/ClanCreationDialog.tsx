import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

const CLAN_NAME_OPTIONS = [
  'Syndicate', 'Circle', 'Alliance', 'Coalition', 'League',
  'Fellowship', 'Brotherhood', 'Sisterhood', 'Order', 'Society',
  'Conclave', 'Assembly', 'Union', 'Confederation', 'Consortium'
];

export const ClanCreationDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameType: CLAN_NAME_OPTIONS[0],
    customName: '',
    description: '',
    stakeAmount: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const displayName = formData.customName 
        ? `${formData.customName} ${formData.nameType}`
        : formData.nameType;

      // Calculate LB fee (10% of stake)
      const lbFee = formData.stakeAmount * 0.1;

      // Create clan
      const { data: clan, error: clanError } = await supabase
        .from('clans')
        .insert({
          name: formData.nameType,
          custom_name: formData.customName || null,
          display_name: displayName,
          description: formData.description,
          created_by: user.id,
          stake_amount: formData.stakeAmount,
          lb_fee_paid: lbFee,
        })
        .select()
        .single();

      if (clanError) throw clanError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clan.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast({
        title: 'Clan Created!',
        description: `${displayName} has been created. Add members to activate your charter.`,
      });

      setOpen(false);
      setFormData({
        nameType: CLAN_NAME_OPTIONS[0],
        customName: '',
        description: '',
        stakeAmount: 100,
      });
    } catch (error) {
      console.error('Error creating clan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create clan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Users className="w-4 h-4" />
          Create Clan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Clan</DialogTitle>
          <DialogDescription>
            Form a chosen family with at least 2 members. Guild members and lone wolves welcome.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nameType">Clan Type</Label>
            <select
              id="nameType"
              value={formData.nameType}
              onChange={(e) => setFormData({ ...formData, nameType: e.target.value })}
              className="w-full mt-1 p-2 border rounded-md"
            >
              {CLAN_NAME_OPTIONS.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="customName">Custom Name (Optional)</Label>
            <Input
              id="customName"
              placeholder="e.g., Shadow"
              value={formData.customName}
              onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Will display as: {formData.customName || '[Your Name]'} {formData.nameType}
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What brings your clan together?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="stakeAmount">Initial Stake (USD)</Label>
            <Input
              id="stakeAmount"
              type="number"
              min="100"
              step="10"
              value={formData.stakeAmount}
              onChange={(e) => setFormData({ ...formData, stakeAmount: parseFloat(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Includes ${(formData.stakeAmount * 0.1).toFixed(2)} LB fee (10%)
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Clan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
