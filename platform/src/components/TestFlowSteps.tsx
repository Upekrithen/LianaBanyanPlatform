import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, ArrowLeft, Edit, Trash2, MoveUp, MoveDown, Video } from "lucide-react";
import { useRecording } from "@/contexts/RecordingContext";

interface TestFlowStep {
  id: string;
  step_number: number;
  step_title: string;
  step_description: string;
  route_path: string;
  expected_outcome: string;
  notes: string;
}

interface TestFlowStepsProps {
  flowId: string;
  onBack: () => void;
}

export const TestFlowSteps = ({ flowId, onBack }: TestFlowStepsProps) => {
  const recording = useRecording();
  const [steps, setSteps] = useState<TestFlowStep[]>([]);
  const [flowName, setFlowName] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<TestFlowStep | null>(null);

  const [formData, setFormData] = useState({
    step_title: '',
    step_description: '',
    route_path: '',
    expected_outcome: '',
    notes: ''
  });

  useEffect(() => {
    loadFlowDetails();
    loadSteps();
  }, [flowId]);

  // Recording handled globally by GlobalRecorderOverlay and RecordingContext


  const loadFlowDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('test_flows')
        .select('flow_name')
        .eq('id', flowId)
        .single();

      if (error) throw error;
      setFlowName(data.flow_name);
    } catch (error: any) {
      toast.error('Failed to load flow details: ' + error.message);
    }
  };

  const loadSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('test_flow_steps')
        .select('*')
        .eq('flow_id', flowId)
        .order('step_number', { ascending: true });

      if (error) throw error;
      setSteps(data || []);
    } catch (error: any) {
      toast.error('Failed to load steps: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStep) {
        const { error } = await supabase
          .from('test_flow_steps')
          .update(formData)
          .eq('id', editingStep.id);

        if (error) throw error;
        toast.success('Step updated successfully');
      } else {
        const nextStepNumber = steps.length > 0
          ? Math.max(...steps.map(s => s.step_number)) + 1
          : 1;

        const { error } = await supabase
          .from('test_flow_steps')
          .insert([{
            ...formData,
            flow_id: flowId,
            step_number: nextStepNumber
          }]);

        if (error) throw error;
        toast.success('Step created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadSteps();
    } catch (error: any) {
      toast.error('Failed to save step: ' + error.message);
    }
  };

  const handleEdit = (step: TestFlowStep) => {
    setEditingStep(step);
    setFormData({
      step_title: step.step_title,
      step_description: step.step_description || '',
      route_path: step.route_path || '',
      expected_outcome: step.expected_outcome || '',
      notes: step.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      const { error } = await supabase
        .from('test_flow_steps')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Step deleted successfully');
      loadSteps();
    } catch (error: any) {
      toast.error('Failed to delete step: ' + error.message);
    }
  };

  const handleReorder = async (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(s => s.id === stepId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const currentStep = steps[currentIndex];
    const targetStep = steps[targetIndex];

    try {
      const { error: error1 } = await supabase
        .from('test_flow_steps')
        .update({ step_number: targetStep.step_number })
        .eq('id', currentStep.id);

      const { error: error2 } = await supabase
        .from('test_flow_steps')
        .update({ step_number: currentStep.step_number })
        .eq('id', targetStep.id);

      if (error1 || error2) throw error1 || error2;
      toast.success('Steps reordered successfully');
      loadSteps();
    } catch (error: any) {
      toast.error('Failed to reorder steps: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      step_title: '',
      step_description: '',
      route_path: '',
      expected_outcome: '',
      notes: ''
    });
    setEditingStep(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <CardTitle>Test Flow Steps: {flowName}</CardTitle>
              <CardDescription>
                Define the step-by-step journey for this test flow
              </CardDescription>
            </div>
            <div className="flex gap-2" data-recording-controls>
              {!recording.isRecording && (
                <Button variant="outline" onClick={() => recording.start(flowId)}>
                  <Video className="w-4 h-4 mr-2" />
                  Record Mode
                </Button>
              )}
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingStep ? 'Edit' : 'Add'} Test Step</DialogTitle>
                <DialogDescription>
                  Define what the user should do and what should happen
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="step_title">Step Title</Label>
                  <Input
                    id="step_title"
                    value={formData.step_title}
                    onChange={(e) => setFormData({ ...formData, step_title: e.target.value })}
                    placeholder="e.g., Navigate to login page"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route_path">Route Path</Label>
                  <Input
                    id="route_path"
                    value={formData.route_path}
                    onChange={(e) => setFormData({ ...formData, route_path: e.target.value })}
                    placeholder="e.g., /auth"
                  />
                </div>
                <div>
                  <Label htmlFor="step_description">Step Description</Label>
                  <Textarea
                    id="step_description"
                    value={formData.step_description}
                    onChange={(e) => setFormData({ ...formData, step_description: e.target.value })}
                    placeholder="Detailed instructions for this step"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="expected_outcome">Expected Outcome</Label>
                  <Textarea
                    id="expected_outcome"
                    value={formData.expected_outcome}
                    onChange={(e) => setFormData({ ...formData, expected_outcome: e.target.value })}
                    placeholder="What should happen when this step is completed"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or edge cases"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingStep ? 'Update' : 'Add'} Step
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading steps...</div>
        ) : steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No steps defined yet. Add your first step to build the test flow.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Step #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Expected Outcome</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((step, index) => (
                <TableRow key={step.id}>
                  <TableCell className="font-medium">{step.step_number}</TableCell>
                  <TableCell>{step.step_title}</TableCell>
                  <TableCell className="font-mono text-sm">{step.route_path || '-'}</TableCell>
                  <TableCell className="max-w-md truncate">{step.expected_outcome || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(step.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(step.id, 'down')}
                        disabled={index === steps.length - 1}
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(step)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(step.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </>
  );
};
