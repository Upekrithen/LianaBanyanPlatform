import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCheck, DollarSign, TrendingUp, Clock } from "lucide-react";

interface PositionAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  projectId: string;
  onAssignmentComplete: () => void;
}

export const PositionAssignmentDialog = ({
  open,
  onOpenChange,
  application,
  projectId,
  onAssignmentComplete
}: PositionAssignmentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assignmentType, setAssignmentType] = useState<"primary" | "secondary" | "backup">("primary");
  const [dutyPercentage, setDutyPercentage] = useState(100);
  const [dutyDescription, setDutyDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  
  // Compensation adjustments
  const [originalEquity, setOriginalEquity] = useState(0);
  const [adjustedEquity, setAdjustedEquity] = useState(0);
  const [originalCash, setOriginalCash] = useState(0);
  const [adjustedCash, setAdjustedCash] = useState(0);
  const [originalCredits, setOriginalCredits] = useState(0);
  const [adjustedCredits, setAdjustedCredits] = useState(0);

  useEffect(() => {
    if (open && application) {
      loadPositionDetails();
    }
  }, [open, application]);

  useEffect(() => {
    // Auto-adjust compensation based on assignment type
    if (assignmentType === 'primary') {
      setDutyPercentage(100);
      setAdjustedEquity(originalEquity);
      setAdjustedCash(originalCash);
      setAdjustedCredits(originalCredits);
    } else if (assignmentType === 'secondary') {
      setDutyPercentage(70);
      setAdjustedEquity(originalEquity * 0.7);
      setAdjustedCash(originalCash * 0.7);
      setAdjustedCredits(originalCredits * 0.7);
    } else if (assignmentType === 'backup') {
      setDutyPercentage(50);
      setAdjustedEquity(originalEquity * 0.5);
      setAdjustedCash(originalCash * 0.5);
      setAdjustedCredits(originalCredits * 0.5);
    }
  }, [assignmentType, originalEquity, originalCash, originalCredits]);

  const loadPositionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_position_templates')
        .select('*')
        .eq('id', application.position_id)
        .single();

      if (error) throw error;

      setOriginalEquity(data.participation_percentage || 0);
      setOriginalCash(data.cash_amount || 0);
      setOriginalCredits(data.credits_reserved || 0);
      setAdjustedEquity(data.participation_percentage || 0);
      setAdjustedCash(data.cash_amount || 0);
      setAdjustedCredits(data.credits_reserved || 0);
    } catch (error) {
      console.error('Error loading position details:', error);
    }
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Create position assignment
      const { error: assignmentError } = await supabase
        .from('position_assignments')
        .insert({
          application_id: application.id,
          position_id: application.position_id,
          applicant_id: application.applicant_id,
          project_id: projectId,
          assignment_type: assignmentType,
          assignment_status: 'pending',
          original_participation_percentage: originalEquity,
          adjusted_participation_percentage: adjustedEquity,
          original_cash_amount: originalCash,
          adjusted_cash_amount: adjustedCash,
          original_credits: originalCredits,
          adjusted_credits: adjustedCredits,
          duty_percentage: dutyPercentage,
          duty_description: dutyDescription,
          assigned_by: user.user.id,
          start_date: startDate ? new Date(startDate).toISOString() : null,
          notes
        });

      if (assignmentError) throw assignmentError;

      // Update application status
      const { error: statusError } = await supabase
        .from('position_applications')
        .update({ status: 'accepted' })
        .eq('id', application.id);

      if (statusError) throw statusError;

      toast({
        title: "Success",
        description: `Applicant assigned as ${assignmentType} position`
      });

      onAssignmentComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning position:', error);
      toast({
        title: "Error",
        description: "Failed to assign position",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Position: {application?.applicant_name}
          </DialogTitle>
          <DialogDescription>
            Configure assignment type and compensation adjustments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Position Type</Label>
                <Select value={assignmentType} onValueChange={(value: any) => setAssignmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">
                      <div className="flex items-center gap-2">
                        <Badge>Primary</Badge>
                        <span>Full duties & compensation (100%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="secondary">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Secondary</Badge>
                        <span>Reduced duties & compensation (70%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="backup">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Backup</Badge>
                        <span>Backup duties & compensation (50%)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duty Percentage: {dutyPercentage}%</Label>
                <Slider
                  value={[dutyPercentage]}
                  onValueChange={([value]) => setDutyPercentage(value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of full-time duties for this position
                </p>
              </div>

              <div>
                <Label>Duty Description (Optional)</Label>
                <Textarea
                  value={dutyDescription}
                  onChange={(e) => setDutyDescription(e.target.value)}
                  placeholder="Describe specific duties for this assignment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compensation Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Original Participation
                  </Label>
                  <p className="text-2xl font-bold">{originalEquity}%</p>
                </div>
                <div>
                  <Label>Adjusted Participation</Label>
                  <Input
                    type="number"
                    value={adjustedEquity}
                    onChange={(e) => setAdjustedEquity(parseFloat(e.target.value) || 0)}
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Original Cash
                  </Label>
                  <p className="text-2xl font-bold">${originalCash.toFixed(2)}</p>
                </div>
                <div>
                  <Label>Adjusted Cash</Label>
                  <Input
                    type="number"
                    value={adjustedCash}
                    onChange={(e) => setAdjustedCash(parseFloat(e.target.value) || 0)}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Original Credits</Label>
                  <p className="text-2xl font-bold">{originalCredits}</p>
                </div>
                <div>
                  <Label>Adjusted Credits</Label>
                  <Input
                    type="number"
                    value={adjustedCredits}
                    onChange={(e) => setAdjustedCredits(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Date (Optional)
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this assignment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleAssign} disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign as {assignmentType.charAt(0).toUpperCase() + assignmentType.slice(1)}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};