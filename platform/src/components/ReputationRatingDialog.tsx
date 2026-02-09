import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsDown } from 'lucide-react';

interface ReputationRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  rateeId: string;
  rateeName: string;
  interactionType: string;
}

export function ReputationRatingDialog({
  open,
  onOpenChange,
  projectId,
  rateeId,
  rateeName,
  interactionType
}: ReputationRatingDialogProps) {
  const { toast } = useToast();
  const [isPositive, setIsPositive] = useState(true);
  const [quality, setQuality] = useState([5]);
  const [timeliness, setTimeliness] = useState([5]);
  const [professionalism, setProfessionalism] = useState([5]);
  const [collaboration, setCollaboration] = useState([5]);
  const [standards, setStandards] = useState([5]);
  const [comment, setComment] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangeToNegative = () => {
    setIsPositive(false);
    // Set all ratings to 0 when changing to negative
    setQuality([0]);
    setTimeliness([0]);
    setProfessionalism([0]);
    setCollaboration([0]);
    setStandards([0]);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to rate members",
          variant: "destructive"
        });
        return;
      }

      // Get project type for weights (fallback to 'default' if not set)
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      const projectType = (project as any)?.project_type || 'default';

      // Get weights
      const { data: weights } = await supabase
        .from('project_type_weights')
        .select('*')
        .eq('project_type', projectType)
        .single();

      const w = weights || {
        quality_weight: 40,
        timeliness_weight: 20,
        professionalism_weight: 20,
        collaboration_weight: 10,
        standards_compliance_weight: 10
      };

      // Calculate composite score
      const compositeScore = (
        (quality[0] * w.quality_weight +
        timeliness[0] * w.timeliness_weight +
        professionalism[0] * w.professionalism_weight +
        collaboration[0] * w.collaboration_weight +
        standards[0] * w.standards_compliance_weight) / 100
      );

      // Get rater's reputation weight
      const { data: raterRep } = await supabase
        .from('reputation_scores')
        .select('overall_score')
        .eq('user_id', user.id)
        .single();

      const raterWeight = raterRep ? Math.max(0.5, Math.min(2.0, raterRep.overall_score / 2.5)) : 1.0;
      const weightedScore = compositeScore * raterWeight;

      // Insert rating
      const { error } = await supabase
        .from('reputation_ratings')
        .insert({
          project_id: projectId,
          rater_id: user.id,
          ratee_id: rateeId,
          interaction_type: interactionType,
          quality_rating: quality[0],
          timeliness_rating: timeliness[0],
          professionalism_rating: professionalism[0],
          collaboration_rating: collaboration[0],
          standards_compliance_rating: standards[0],
          composite_score: compositeScore,
          rater_reputation_weight: raterWeight,
          weighted_score: weightedScore,
          is_positive: isPositive,
          comment: comment || null,
          dispute_reason: isPositive ? null : disputeReason
        });

      if (error) throw error;

      toast({
        title: "Rating submitted",
        description: `Your rating for ${rateeName} has been recorded. It will be visible in 48 hours.`
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error submitting rating",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsPositive(true);
    setQuality([5]);
    setTimeliness([5]);
    setProfessionalism([5]);
    setCollaboration([5]);
    setStandards([5]);
    setComment('');
    setDisputeReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate: {rateeName}</DialogTitle>
          <DialogDescription>
            {isPositive ? (
              "By default, all interactions are rated positively (green). You can adjust individual categories or change to negative if there were issues."
            ) : (
              "You have changed this to a negative rating. Please provide detailed reasons."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Positive/Negative Toggle */}
          {isPositive && (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">Positive Rating (Green)</div>
                <div className="text-sm text-green-600 dark:text-green-400">Default for all interactions</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleChangeToNegative}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Change to Negative
              </Button>
            </div>
          )}

          {!isPositive && (
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="font-medium text-red-800 dark:text-red-200 mb-2">Negative Rating (Red)</div>
              <div className="text-sm text-red-600 dark:text-red-400 mb-3">
                This rating can be corrected once if the issue is resolved. Otherwise, it becomes permanent after 7 days unless overturned by committee.
              </div>
              <Label htmlFor="dispute-reason">Reason for Negative Rating *</Label>
              <Textarea
                id="dispute-reason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Please explain the issues encountered..."
                className="mt-2"
                required
              />
            </div>
          )}

          {/* Rating Categories */}
          <div className="space-y-4">
            <div>
              <Label>Quality of Work: {quality[0]}/5</Label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={5}
                step={0.5}
                disabled={!isPositive}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Timeliness: {timeliness[0]}/5</Label>
              <Slider
                value={timeliness}
                onValueChange={setTimeliness}
                max={5}
                step={0.5}
                disabled={!isPositive}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Professionalism: {professionalism[0]}/5</Label>
              <Slider
                value={professionalism}
                onValueChange={setProfessionalism}
                max={5}
                step={0.5}
                disabled={!isPositive}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Collaboration: {collaboration[0]}/5</Label>
              <Slider
                value={collaboration}
                onValueChange={setCollaboration}
                max={5}
                step={0.5}
                disabled={!isPositive}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Standards Compliance: {standards[0]}/5</Label>
              <Slider
                value={standards}
                onValueChange={setStandards}
                max={5}
                step={0.5}
                disabled={!isPositive}
                className="mt-2"
              />
            </div>
          </div>

          {/* Optional Comment */}
          <div>
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional feedback..."
              className="mt-2"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || (!isPositive && !disputeReason)}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
