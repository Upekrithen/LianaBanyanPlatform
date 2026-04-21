import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { ClanGuildContextualPrompt } from '@/components/TribeGuildContextualPrompt';

interface Position {
  id: string;
  position_title: string;
  position_description: string;
  compensation_type: string;
  participation_percentage: number;
  cash_amount: number;
  credits_reserved: number;
  category: string;
}

interface PositionApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: Position | null;
}

export function PositionApplicationDialog({
  open,
  onOpenChange,
  position
}: PositionApplicationDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openOnboard } = useSeamlessOnboard();
  const [loading, setLoading] = useState(false);
  const [isClanMember, setIsClanMember] = useState(false);
  const [hasGuildMemberships, setHasGuildMemberships] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    coverLetter: '',
  });

  // Check user's clan and guild status
  useEffect(() => {
    const checkMemberships = async () => {
      if (!user) return;

      // Check clan membership
      const { data: clanData } = await supabase
        .from('guild_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      setIsClanMember(!!clanData);

      // Check guild membership
      const { data: guildData } = await supabase
        .from('guild_members')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      setHasGuildMemberships(!!guildData);
    };

    checkMemberships();
  }, [user]);

  const handleSubmit = async () => {
    if (!position) return;

    // Check if user needs to register
    if (!user && !formData.email) {
      toast.error('Please provide your email address');
      return;
    }

    if (!formData.name || !formData.coverLetter) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('position_applications')
        .insert({
          position_id: position.id,
          applicant_id: user?.id,
          applicant_email: user?.email || formData.email,
          applicant_name: formData.name,
          cover_letter: formData.coverLetter,
          reserved_credits: position.credits_reserved,
        });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      onOpenChange(false);
      setFormData({ name: '', email: '', coverLetter: '' });

      // If not logged in, prompt to register
      if (!user) {
        toast.info('Please register to track your application', {
          action: {
            label: 'Register',
            onClick: () => openOnboard({ reason: "apply for this position", actionLabel: "Join", membershipIncluded: true }),
          },
        });
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Position: {position.position_title}</DialogTitle>
          <DialogDescription>
            Submit your application for this contract position
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Position Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Position Details</h3>
            <p className="text-sm text-muted-foreground">{position.position_description}</p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground">Compensation Type</p>
                <p className="font-medium capitalize">{position.compensation_type}</p>
              </div>
              {position.participation_percentage > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Participation</p>
                  <p className="font-medium">{position.participation_percentage}%</p>
                </div>
              )}
              {position.cash_amount > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Cash Compensation</p>
                  <p className="font-medium">${position.cash_amount}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Credits Reserved</p>
                <p className="font-medium">{position.credits_reserved}</p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            {!user && (
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You'll need to register to track your application
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea
                id="coverLetter"
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                placeholder="Tell us why you're the right fit for this position..."
                rows={8}
              />
            </div>
          </div>

          {/* Clan & Guild Contextual Prompt */}
          <ClanGuildContextualPrompt
            context="service_signup"
            isClanMember={isClanMember}
            hasGuildMemberships={hasGuildMemberships}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
