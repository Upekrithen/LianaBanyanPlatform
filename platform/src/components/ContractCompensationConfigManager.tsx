import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface ContractCompensationConfigManagerProps {
  projectId: string;
}

interface TimeCommitmentOption {
  days: number;
  label: string;
}

export const ContractCompensationConfigManager = ({ projectId }: ContractCompensationConfigManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [assignmentLeadTimeDays, setAssignmentLeadTimeDays] = useState(90);
  const [minParticipationRatio, setMinEquityRatio] = useState(0.1);
  const [maxParticipationRatio, setMaxEquityRatio] = useState(0.9);
  const [timeOptions, setTimeOptions] = useState<TimeCommitmentOption[]>([
    { days: 30, label: "1 Month" },
    { days: 60, label: "2 Months" },
    { days: 90, label: "3 Months" },
    { days: 180, label: "6 Months" },
    { days: 365, label: "1 Year" }
  ]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newRequirement, setNewRequirement] = useState("");

  useEffect(() => {
    loadConfig();
  }, [projectId]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_assignment_configs')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;

      if (data) {
        setAssignmentLeadTimeDays(data.assignment_lead_time_days);
        setMinEquityRatio(data.min_participation_ratio);
        setMaxEquityRatio(data.max_participation_ratio);
        setTimeOptions((data.time_commitment_options as unknown as TimeCommitmentOption[]) || []);
        setPrerequisites((data.prerequisites as unknown as string[]) || []);
        setRequirements((data.requirements as unknown as string[]) || []);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Error",
        description: "Failed to load contract assignment configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (minParticipationRatio < 0 || minParticipationRatio > 1 || maxParticipationRatio < 0 || maxParticipationRatio > 1) {
      toast({
        title: "Validation Error",
        description: "Participation ratios must be between 0 and 1",
        variant: "destructive"
      });
      return;
    }

    if (minParticipationRatio > maxParticipationRatio) {
      toast({
        title: "Validation Error",
        description: "Minimum participation ratio cannot exceed maximum participation ratio",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('contract_assignment_configs')
        .upsert({
          project_id: projectId,
          assignment_lead_time_days: assignmentLeadTimeDays,
          min_participation_ratio: minParticipationRatio,
          max_participation_ratio: maxParticipationRatio,
          time_commitment_options: timeOptions as any,
          prerequisites: prerequisites as any,
          requirements: requirements as any
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contract assignment configuration saved successfully"
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addTimeOption = () => {
    setTimeOptions([...timeOptions, { days: 30, label: "New Option" }]);
  };

  const removeTimeOption = (index: number) => {
    setTimeOptions(timeOptions.filter((_, i) => i !== index));
  };

  const updateTimeOption = (index: number, field: 'days' | 'label', value: number | string) => {
    const updated = [...timeOptions];
    updated[index] = { ...updated[index], [field]: value };
    setTimeOptions(updated);
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setPrerequisites([...prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite("");
    }
  };

  const removePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Participation/Credit Ratio Configuration</CardTitle>
          <CardDescription>
            Set minimum and maximum participation/credit ratios for contract assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="assignmentLeadTime">Assignment Lead Time (days)</Label>
              <Input
                id="assignmentLeadTime"
                type="number"
                value={assignmentLeadTimeDays}
                onChange={(e) => setAssignmentLeadTimeDays(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="minParticipation">Minimum Participation Ratio</Label>
              <Input
                id="minParticipation"
                type="number"
                step="0.01"
                value={minParticipationRatio}
                onChange={(e) => setMinEquityRatio(parseFloat(e.target.value) || 0)}
                min={0}
                max={1}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(minParticipationRatio * 100).toFixed(0)}% participation / {((1 - minParticipationRatio) * 100).toFixed(0)}% credits
              </p>
            </div>
            <div>
              <Label htmlFor="maxParticipation">Maximum Participation Ratio</Label>
              <Input
                id="maxParticipation"
                type="number"
                step="0.01"
                value={maxParticipationRatio}
                onChange={(e) => setMaxEquityRatio(parseFloat(e.target.value) || 0)}
                min={0}
                max={1}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(maxParticipationRatio * 100).toFixed(0)}% participation / {((1 - maxParticipationRatio) * 100).toFixed(0)}% credits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>
            Define prerequisites that applicants must meet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter a prerequisite..."
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              rows={2}
            />
            <Button onClick={addPrerequisite} size="icon" aria-label="Add prerequisite">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <span className="flex-1 text-sm">{prereq}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePrerequisite(index)}
                  aria-label="Remove prerequisite"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            Define requirements for contract assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter a requirement..."
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              rows={2}
            />
            <Button onClick={addRequirement} size="icon" aria-label="Add requirement">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <span className="flex-1 text-sm">{req}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRequirement(index)}
                  aria-label="Remove requirement"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Commitment Options</CardTitle>
          <CardDescription>
            Configure time commitment options for equipment scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeOptions.map((option, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Days</Label>
                <Input
                  type="number"
                  value={option.days}
                  onChange={(e) => updateTimeOption(index, 'days', parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
              <div className="flex-1">
                <Label>Label</Label>
                <Input
                  value={option.label}
                  onChange={(e) => updateTimeOption(index, 'label', e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeTimeOption(index)}
                aria-label="Remove time option"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addTimeOption} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Option
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Configuration
      </Button>
    </div>
  );
};