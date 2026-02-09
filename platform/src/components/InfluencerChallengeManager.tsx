import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Award, Users, Calendar, DollarSign, Trophy, Target } from 'lucide-react';
import { EditableContent } from './EditableContent';

interface ChallengeConfig {
  id: string;
  project_id: string;
  contest_name: string;
  contest_description: string | null;
  start_date: string | null;
  end_date: string | null;
  prize_structure: any;
  submission_categories: any;
  judging_criteria: any;
  eligibility_rules: string | null;
  submission_guidelines: string | null;
  is_active: boolean;
  entrance_fee_credits: number;
  allow_concurrent: boolean;
  challenge_arena: string | null;
  hexisle_skill_category: string | null;
  ideation_level: number;
}

interface InfluencerChallengeManagerProps {
  projectId: string;
}

const POSITION_CATEGORIES = [
  'harvest', 'navigate', 'engineer', 'battle', 'seek', 'magic', 'train',
  'design', 'marketing', 'documentation', 'testing', 'community'
];

export function InfluencerChallengeManager({ projectId }: InfluencerChallengeManagerProps) {
  const [config, setConfig] = useState<ChallengeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    loadChallengeConfig();
    loadSubmissions();
  }, [projectId]);

  const loadChallengeConfig = async () => {
    const { data, error } = await supabase
      .from('influencer_challenge_config')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to load challenge config');
      console.error(error);
    } else if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  const loadSubmissions = async () => {
    if (!config) return;

    const { data, error } = await supabase
      .from('challenge_submissions')
      .select('*')
      .eq('challenge_id', config.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setSubmissions(data || []);
    }
  };

  const handleCreateChallenge = async () => {
    const { data, error } = await supabase
      .from('influencer_challenge_config')
      .insert([{
        project_id: projectId,
        contest_name: 'Beta Launch Challenge',
        contest_description: 'Document your experience with our beta and win credits!',
        entrance_fee_credits: 10,
        allow_concurrent: true,
        submission_categories: POSITION_CATEGORIES,
        ideation_level: 1,
      }])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create challenge');
      console.error(error);
    } else {
      setConfig(data);
      toast.success('Challenge created');
    }
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!config) return;

    const { error } = await supabase
      .from('influencer_challenge_config')
      .update({ [field]: value })
      .eq('id', config.id);

    if (error) {
      toast.error('Failed to update challenge');
      console.error(error);
    } else {
      toast.success('Challenge updated');
      loadChallengeConfig();
    }
  };

  const handleToggleActive = async () => {
    if (!config) return;

    const { error } = await supabase
      .from('influencer_challenge_config')
      .update({ is_active: !config.is_active })
      .eq('id', config.id);

    if (error) {
      toast.error('Failed to toggle challenge');
      console.error(error);
    } else {
      toast.success(config.is_active ? 'Challenge deactivated' : 'Challenge activated');
      loadChallengeConfig();
    }
  };

  if (loading) {
    return <div>Loading challenge configuration...</div>;
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Challenges</CardTitle>
          <CardDescription>
            Create challenges across all skill categories to engage members and build momentum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateChallenge}>
            <Target className="mr-2 h-4 w-4" />
            Create Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  const prizeStructure = config.prize_structure || {};
  const totalPrizePool = Object.values(prizeStructure).reduce((sum: number, prize: any) => {
    return sum + (Number(prize?.credits) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {config.contest_name}
              </CardTitle>
              <CardDescription>
                Multi-skill challenge system with concurrent participation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.is_active ? 'default' : 'outline'}>
                {config.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {config.allow_concurrent && (
                <Badge variant="secondary">Concurrent OK</Badge>
              )}
              <Button onClick={handleToggleActive}>
                {config.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  Entrance Fee
                </div>
                <div className="text-3xl font-bold">{config.entrance_fee_credits} Credits</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  Entrance Fee
                </div>
                <div className="text-3xl font-bold">{config.entrance_fee_credits || 0} Credits</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  Submissions
                </div>
                <div className="text-3xl font-bold">{submissions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Duration
                </div>
                <div className="text-sm">
                  {config.start_date && config.end_date ? (
                    <>
                      {new Date(config.start_date).toLocaleDateString()} - {new Date(config.end_date).toLocaleDateString()}
                    </>
                  ) : (
                    'Not scheduled'
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entrance-fee">Entrance Fee (Credits)</Label>
                <Input
                  id="entrance-fee"
                  type="number"
                  value={config.entrance_fee_credits}
                  onChange={(e) => handleUpdateField('entrance_fee_credits', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="ideation-level">Ideation Level</Label>
                <Input
                  id="ideation-level"
                  type="number"
                  value={config.ideation_level}
                  onChange={(e) => handleUpdateField('ideation_level', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label>Challenge Description</Label>
              <EditableContent
                content={config.contest_description || ''}
                onSave={(value) => handleUpdateField('contest_description', value)}
                label="Challenge Description"
                contentType="textarea"
              >
                <p className="text-sm mt-1">{config.contest_description || 'Add a description...'}</p>
              </EditableContent>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={config.start_date ? new Date(config.start_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdateField('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={config.end_date ? new Date(config.end_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdateField('end_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Prize Structure</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(prizeStructure).map(([key, prize]: [string, any]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                    <Badge>{prize.credits} Credits</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{prize.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Challenge Categories (All Skill Sets)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.isArray(config.submission_categories) && config.submission_categories.map((category: string) => (
                <Badge key={category} variant="secondary" className="justify-center">
                  {category}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Members can participate in multiple concurrent challenges. Each submission is logged as Level {config.ideation_level} ideation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Judging Criteria</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {config.judging_criteria && typeof config.judging_criteria === 'object' && Object.entries(config.judging_criteria).map(([criterion, weight]: [string, any]) => (
                <div key={criterion} className="flex items-center justify-between p-2 border rounded">
                  <span className="capitalize">{criterion}</span>
                  <Badge variant="outline">{weight}%</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eligibility Rules</Label>
            <EditableContent
              content={config.eligibility_rules || ''}
              onSave={(value) => handleUpdateField('eligibility_rules', value)}
              label="Eligibility Rules"
              contentType="textarea"
            >
              <Textarea
                value={config.eligibility_rules || ''}
                onChange={(e) => handleUpdateField('eligibility_rules', e.target.value)}
                rows={3}
                placeholder="Define who can participate..."
              />
            </EditableContent>
          </div>

          <div className="space-y-2">
            <Label>Submission Guidelines</Label>
            <EditableContent
              content={config.submission_guidelines || ''}
              onSave={(value) => handleUpdateField('submission_guidelines', value)}
              label="Submission Guidelines"
              contentType="textarea"
            >
              <Textarea
                value={config.submission_guidelines || ''}
                onChange={(e) => handleUpdateField('submission_guidelines', e.target.value)}
                rows={3}
                placeholder="How should influencers submit their content..."
              />
            </EditableContent>
          </div>
        </CardContent>
      </Card>

      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Challenge Submissions ({submissions.length})</CardTitle>
            <CardDescription>All submissions are tracked as ideation and can be revisited</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{submission.submission_title}</h5>
                      <p className="text-sm text-muted-foreground">
                        Category: {submission.submission_category}
                      </p>
                      <a 
                        href={submission.content_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Content →
                      </a>
                    </div>
                    {submission.placement && (
                      <Badge variant="default">{submission.placement}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
