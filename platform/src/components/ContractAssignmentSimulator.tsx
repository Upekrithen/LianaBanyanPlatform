import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface ContractAssignmentSimulatorProps {
  projectId: string;
  positionTitle?: string;
  baseCompensation?: number;
}

interface TimeCommitmentOption {
  days: number;
  label: string;
}

export const ContractAssignmentSimulator = ({ 
  projectId, 
  positionTitle = "Contract Position",
  baseCompensation = 5000
}: ContractAssignmentSimulatorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState<number>(90);
  
  const [config, setConfig] = useState<{
    assignment_lead_time_days: number;
    min_participation_ratio: number;
    max_participation_ratio: number;
    time_commitment_options: TimeCommitmentOption[];
    prerequisites: string[];
    requirements: string[];
  } | null>(null);

  const [participationRatio, setEquityRatio] = useState(0.5);
  const [cashRatio, setCashRatio] = useState(0.5);

  useEffect(() => {
    loadConfig();
  }, [projectId]);

  useEffect(() => {
    if (config) {
      calculateRatios();
    }
  }, [selectedTimeCommitment, config]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_assignment_configs')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;

      if (data) {
        setConfig({
          assignment_lead_time_days: data.assignment_lead_time_days,
          min_participation_ratio: data.min_participation_ratio,
          max_participation_ratio: data.max_participation_ratio,
          time_commitment_options: (data.time_commitment_options as unknown as TimeCommitmentOption[]) || [],
          prerequisites: (data.prerequisites as unknown as string[]) || [],
          requirements: (data.requirements as unknown as string[]) || []
        });
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

  const calculateRatios = () => {
    if (!config) return;

    const ratioFactor = Math.min(1.0, Math.max(0.0, 
      selectedTimeCommitment / config.assignment_lead_time_days
    ));

    const calculatedParticipationRatio = config.min_participation_ratio + 
      (ratioFactor * (config.max_participation_ratio - config.min_participation_ratio));
    
    setEquityRatio(calculatedParticipationRatio);
    setCashRatio(1 - calculatedParticipationRatio);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No configuration available for this project
          </p>
        </CardContent>
      </Card>
    );
  }

  const participationAmount = baseCompensation * participationRatio;
  const cashAmount = baseCompensation * cashRatio;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Assignment Simulator</CardTitle>
          <CardDescription>
            Preview your potential compensation split for {positionTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Time Commitment</Label>
            <Select
              value={selectedTimeCommitment.toString()}
              onValueChange={(value) => setSelectedTimeCommitment(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.time_commitment_options.map((option) => (
                  <SelectItem key={option.days} value={option.days.toString()}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {option.label} ({option.days} days)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Participation Portion
                </Label>
                <span className="text-sm font-medium">
                  {(participationRatio * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={participationRatio * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                ${participationAmount.toFixed(2)} in project participation
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cash Portion
                </Label>
                <span className="text-sm font-medium">
                  {(cashRatio * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={cashRatio * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                ${cashAmount.toFixed(2)} in cash payment
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Total Compensation</h4>
            <p className="text-2xl font-bold">${baseCompensation.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              Based on {selectedTimeCommitment} day commitment
            </p>
          </div>
        </CardContent>
      </Card>

      {config.prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {config.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm">{prereq}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {config.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {config.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};