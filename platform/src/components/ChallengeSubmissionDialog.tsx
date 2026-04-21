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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { Loader2 } from 'lucide-react';
import { ClanGuildContextualPrompt } from '@/components/TribeGuildContextualPrompt';

interface Challenge {
  id: string;
  contest_name: string;
  contest_description: string;
  entrance_fee_credits: number;
  submission_categories: string[];
  hexisle_skill_category: string;
}

interface ChallengeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  onSubmitSuccess?: () => void;
}

export function ChallengeSubmissionDialog({
  open,
  onOpenChange,
  challenge,
  onSubmitSuccess
}: ChallengeSubmissionDialogProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [loading, setLoading] = useState(false);
  const [isClanMember, setIsClanMember] = useState(false);
  const [hasGuildMemberships, setHasGuildMemberships] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentUrl: '',
    category: '',
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
    if (!challenge || !user) {
      openOnboard({ reason: "submit your challenge", actionLabel: "Join", membershipIncluded: true });
      return;
    }

    if (!formData.title || !formData.description || !formData.contentUrl || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          submission_title: formData.title,
          description: formData.description,
          content_url: formData.contentUrl,
          submission_category: formData.category,
          entrance_fee_paid: challenge.entrance_fee_credits,
        });

      if (error) throw error;

      toast.success('Challenge submission created successfully!');
      onOpenChange(false);
      setFormData({ title: '', description: '', contentUrl: '', category: '' });
      onSubmitSuccess?.();
    } catch (error: any) {
      console.error('Error submitting challenge:', error);
      toast.error('Failed to submit challenge');
    } finally {
      setLoading(false);
    }
  };

  if (!challenge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit to: {challenge.contest_name}</DialogTitle>
          <DialogDescription>
            Enter this challenge and showcase your work
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Challenge Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Challenge Details</h3>
            <p className="text-sm text-muted-foreground">{challenge.contest_description}</p>

            <div className="flex items-center gap-4 text-sm pt-2">
              <div>
                <span className="text-muted-foreground">Entrance Fee:</span>{' '}
                <span className="font-medium">{challenge.entrance_fee_credits} credits</span>
              </div>
              <div>
                <span className="text-muted-foreground">Island:</span>{' '}
                <span className="font-medium capitalize">{challenge.hexisle_skill_category}</span>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Submission Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your submission a catchy title"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {challenge.submission_categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentUrl">Content URL *</Label>
              <Input
                id="contentUrl"
                type="url"
                value={formData.contentUrl}
                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=... or link to your content"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share a video, blog post, social media thread, or other public content
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your submission and what makes it special..."
                rows={6}
              />
            </div>
          </div>

          {/* Clan & Guild Contextual Prompt */}
          <ClanGuildContextualPrompt
            context="challenge"
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
            Submit Entry ({challenge.entrance_fee_credits} credits)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
