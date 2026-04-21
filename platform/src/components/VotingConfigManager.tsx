import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';

interface VotingConfigManagerProps {
  projectId: string;
}

interface TimeCommitmentOption {
  days: number;
  label: string;
}

export function VotingConfigManager({ projectId }: VotingConfigManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productLeadTimeDays, setProductLeadTimeDays] = useState(180);
  const [minParticipationRatio, setMinParticipationRatio] = useState(0.1);
  const [maxParticipationRatio, setMaxParticipationRatio] = useState(0.9);
  const [timeOptions, setTimeOptions] = useState<TimeCommitmentOption[]>([
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 30, label: '1 Month' },
    { days: 60, label: '2 Months' },
    { days: 90, label: '3 Months' },
    { days: 180, label: '6 Months' },
  ]);

  useEffect(() => {
    loadConfig();
  }, [projectId]);

  const loadConfig = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('project_voting_configs')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      console.error('Error loading voting config:', error);
      toast.error('Failed to load voting configuration');
    } else if (data) {
      setProductLeadTimeDays(data.product_lead_time_days);
      setMinParticipationRatio(Number(data.min_participation_ratio));
      setMaxParticipationRatio(Number(data.max_participation_ratio));

      // Parse time_commitment_options from JSONB
      const parsedOptions = Array.isArray(data.time_commitment_options)
        ? data.time_commitment_options
        : JSON.parse(data.time_commitment_options as string);
      setTimeOptions(parsedOptions as TimeCommitmentOption[]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (minParticipationRatio >= maxParticipationRatio) {
      toast.error('Minimum participation ratio must be less than maximum');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('project_voting_configs')
      .upsert({
        project_id: projectId,
        product_lead_time_days: productLeadTimeDays,
        time_commitment_options: JSON.stringify(timeOptions),
        min_participation_ratio: minParticipationRatio,
        max_participation_ratio: maxParticipationRatio,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'project_id'
      });

    if (error) {
      console.error('Error saving voting config:', error);
      toast.error('Failed to save configuration');
    } else {
      toast.success('Voting configuration saved successfully');
    }
    setSaving(false);
  };

  const addTimeOption = () => {
    setTimeOptions([...timeOptions, { days: 7, label: 'New Option' }]);
  };

  const removeTimeOption = (index: number) => {
    setTimeOptions(timeOptions.filter((_, i) => i !== index));
  };

  const updateTimeOption = (index: number, field: 'days' | 'label', value: string | number) => {
    const updated = [...timeOptions];
    updated[index] = { ...updated[index], [field]: value };
    setTimeOptions(updated);
  };

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Participation/Cash Ratio Configuration</CardTitle>
          <CardDescription>
            Configure how time commitments translate to participation vs cash ratios for member voting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Lead Time */}
          <div className="space-y-2">
            <Label htmlFor="leadTime">Product Lead Time (days)</Label>
            <Input
              id="leadTime"
              type="number"
              min="1"
              value={productLeadTimeDays}
              onChange={(e) => setProductLeadTimeDays(parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Maximum time frame for production. Longer commitments approach this value.
            </p>
          </div>

          {/* Participation Ratio Bounds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minParticipation">Minimum Participation Ratio</Label>
              <Input
                id="minParticipation"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={minParticipationRatio}
                onChange={(e) => setMinParticipationRatio(parseFloat(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Shortest commitment: {(minParticipationRatio * 100).toFixed(0)}% participation, {((1 - minParticipationRatio) * 100).toFixed(0)}% cash
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipation">Maximum Participation Ratio</Label>
              <Input
                id="maxParticipation"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={maxParticipationRatio}
                onChange={(e) => setMaxParticipationRatio(parseFloat(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Longest commitment: {(maxParticipationRatio * 100).toFixed(0)}% participation, {((1 - maxParticipationRatio) * 100).toFixed(0)}% cash
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Commitment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Time Commitment Options</CardTitle>
          <CardDescription>
            Define the commitment periods members can choose when voting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeOptions.map((option, index) => {
            const ratioFactor = Math.min(1.0, Math.max(0.0, option.days / productLeadTimeDays));
            const participation = minParticipationRatio + (ratioFactor * (maxParticipationRatio - minParticipationRatio));
            const cash = 1 - participation;

            return (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Days</Label>
                    <Input
                      type="number"
                      min="1"
                      value={option.days}
                      onChange={(e) => updateTimeOption(index, 'days', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={option.label}
                      onChange={(e) => updateTimeOption(index, 'label', e.target.value)}
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground min-w-[120px]">
                  {(participation * 100).toFixed(0)}% participation<br />
                  {(cash * 100).toFixed(0)}% cash
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTimeOption(index)}
                  disabled={timeOptions.length <= 1}
                  aria-label="Remove time option"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          <Button onClick={addTimeOption} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Option
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
