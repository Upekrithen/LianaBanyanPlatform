import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Play, CheckCircle, XCircle, Clock, ExternalLink, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TestFlowStep {
  id: string;
  step_number: number;
  step_title: string;
  step_description: string;
  route_path: string;
  expected_outcome: string;
  notes: string;
}

interface TestFlowExecutorProps {
  flowId: string;
  onBack: () => void;
}

interface StepStatus {
  stepId: string;
  status: 'not_started' | 'in_progress' | 'passed' | 'failed';
  notes: string;
}

export const TestFlowExecutor = ({ flowId, onBack }: TestFlowExecutorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<TestFlowStep[]>([]);
  const [flowName, setFlowName] = useState('');
  const [loading, setLoading] = useState(true);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<'not_started' | 'in_progress' | 'passed' | 'failed'>('not_started');
  const [executionNotes, setExecutionNotes] = useState('');

  useEffect(() => {
    loadFlowDetails();
    loadSteps();
  }, [flowId]);

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

      // Initialize step statuses
      setStepStatuses((data || []).map(step => ({
        stepId: step.id,
        status: 'not_started',
        notes: ''
      })));
    } catch (error: any) {
      toast.error('Failed to load steps: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startExecution = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('test_flow_executions')
        .insert([{
          flow_id: flowId,
          executed_by: user.id,
          status: 'in_progress',
          environment: window.location.hostname.includes('localhost') ? 'development' : 'production'
        }])
        .select()
        .single();

      if (error) throw error;

      setExecutionId(data.id);
      setStartTime(new Date());
      setOverallStatus('in_progress');
      toast.success('Test execution started');
    } catch (error: any) {
      toast.error('Failed to start execution: ' + error.message);
    }
  };

  const updateStepStatus = (stepId: string, status: StepStatus['status'], notes: string = '') => {
    setStepStatuses(prev =>
      prev.map(s => s.stepId === stepId ? { ...s, status, notes } : s)
    );
  };

  const navigateToStep = (routePath: string) => {
    if (routePath) {
      navigate(routePath);
    }
  };

  const completeExecution = async () => {
    if (!executionId || !startTime) return;

    const durationMinutes = Math.round((new Date().getTime() - startTime.getTime()) / 60000);
    const allPassed = stepStatuses.every(s => s.status === 'passed');
    const anyFailed = stepStatuses.some(s => s.status === 'failed');
    const finalStatus = allPassed ? 'passed' : anyFailed ? 'failed' : 'in_progress';
    const failedStep = stepStatuses.find(s => s.status === 'failed');

    try {
      const { error } = await supabase
        .from('test_flow_executions')
        .update({
          status: finalStatus,
          duration_minutes: durationMinutes,
          notes: executionNotes,
          failed_step_id: failedStep?.stepId || null
        })
        .eq('id', executionId);

      if (error) throw error;

      setOverallStatus(finalStatus);
      toast.success(`Test execution completed: ${finalStatus.toUpperCase()}`);

      // Reset after short delay
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error: any) {
      toast.error('Failed to complete execution: ' + error.message);
    }
  };

  const getStatusIcon = (status: StepStatus['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading test flow...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <CardTitle>Execute Test Flow: {flowName}</CardTitle>
            <CardDescription>
              {overallStatus === 'not_started'
                ? 'Click Start to begin the test execution'
                : `Test Status: ${overallStatus.toUpperCase()}`}
            </CardDescription>
          </div>
          {overallStatus === 'not_started' && (
            <Button onClick={startExecution}>
              <Play className="w-4 h-4 mr-2" />
              Start Test
            </Button>
          )}
          {overallStatus === 'in_progress' && (
            <Button onClick={completeExecution} variant="default">
              <Save className="w-4 h-4 mr-2" />
              Complete Test
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No steps defined for this test flow.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Step #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expected Outcome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.map((step, index) => {
                  const stepStatus = stepStatuses.find(s => s.stepId === step.id);
                  return (
                    <TableRow key={step.id}>
                      <TableCell className="font-medium">{step.step_number}</TableCell>
                      <TableCell className="font-medium">{step.step_title}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">{step.step_description}</div>
                        {step.route_path && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Route: <span className="font-mono">{step.route_path}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs text-sm">{step.expected_outcome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stepStatus?.status || 'not_started')}
                          {overallStatus === 'in_progress' && (
                            <Select
                              value={stepStatus?.status || 'not_started'}
                              onValueChange={(value) => updateStepStatus(step.id, value as any)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="passed">Passed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {step.route_path && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateToStep(step.route_path)}
                            disabled={overallStatus !== 'in_progress'}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Go
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {overallStatus === 'in_progress' && (
              <div className="space-y-2">
                <Label htmlFor="execution_notes">Execution Notes</Label>
                <Textarea
                  id="execution_notes"
                  value={executionNotes}
                  onChange={(e) => setExecutionNotes(e.target.value)}
                  placeholder="Add any observations, issues, or notes about this test execution..."
                  rows={4}
                />
              </div>
            )}

            {startTime && (
              <div className="text-sm text-muted-foreground">
                Duration: {Math.round((new Date().getTime() - startTime.getTime()) / 60000)} minutes
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
