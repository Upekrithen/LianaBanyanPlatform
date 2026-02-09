import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Play, Edit, Trash2, FileText } from "lucide-react";
import { TestFlowSteps } from "./TestFlowSteps";
import { TestFlowExecutor } from "./TestFlowExecutor";

interface TestFlow {
  id: string;
  flow_name: string;
  description: string;
  user_role: string;
  created_at: string;
  is_active: boolean;
}

const USER_ROLES = [
  { value: 'new_user', label: 'New User' },
  { value: 'authenticated_user', label: 'Authenticated User' },
  { value: 'member', label: 'Member' },
  { value: 'project_owner', label: 'Project Owner' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'steward', label: 'Steward' },
  { value: 'applicant', label: 'Applicant' },
  { value: 'admin', label: 'Admin' }
];

export const TestFlowManager = () => {
  const { user } = useAuth();
  const [flows, setFlows] = useState<TestFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<TestFlow | null>(null);
  const [selectedFlowForSteps, setSelectedFlowForSteps] = useState<string | null>(null);
  const [selectedFlowForExecution, setSelectedFlowForExecution] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    flow_name: string;
    description: string;
    user_role: 'new_user' | 'authenticated_user' | 'member' | 'project_owner' | 'project_manager' | 'hr' | 'steward' | 'applicant' | 'admin';
  }>({
    flow_name: '',
    description: '',
    user_role: 'new_user'
  });

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      const { data, error } = await supabase
        .from('test_flows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlows(data || []);
    } catch (error: any) {
      toast.error('Failed to load test flows: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingFlow) {
        const { error } = await supabase
          .from('test_flows')
          .update(formData)
          .eq('id', editingFlow.id);

        if (error) throw error;
        toast.success('Test flow updated successfully');
      } else {
        const { error } = await supabase
          .from('test_flows')
          .insert([{ ...formData, created_by: user.id }]);

        if (error) throw error;
        toast.success('Test flow created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadFlows();
    } catch (error: any) {
      toast.error('Failed to save test flow: ' + error.message);
    }
  };

  const handleEdit = (flow: TestFlow) => {
    setEditingFlow(flow);
    setFormData({
      flow_name: flow.flow_name,
      description: flow.description || '',
      user_role: flow.user_role as typeof formData.user_role
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test flow?')) return;

    try {
      const { error } = await supabase
        .from('test_flows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Test flow deleted successfully');
      loadFlows();
    } catch (error: any) {
      toast.error('Failed to delete test flow: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      flow_name: '',
      description: '',
      user_role: 'new_user' as const
    });
    setEditingFlow(null);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'new_user': 'bg-slate-500',
      'authenticated_user': 'bg-blue-500',
      'member': 'bg-green-500',
      'project_owner': 'bg-purple-500',
      'project_manager': 'bg-orange-500',
      'hr': 'bg-pink-500',
      'steward': 'bg-teal-500',
      'applicant': 'bg-yellow-500',
      'admin': 'bg-red-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  if (selectedFlowForSteps) {
    return (
      <TestFlowSteps
        flowId={selectedFlowForSteps}
        onBack={() => setSelectedFlowForSteps(null)}
      />
    );
  }

  if (selectedFlowForExecution) {
    return (
      <TestFlowExecutor
        flowId={selectedFlowForExecution}
        onBack={() => setSelectedFlowForExecution(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Test Flow Management</CardTitle>
            <CardDescription>
              Create and manage user journey test flows for different roles
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Test Flow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFlow ? 'Edit' : 'Create'} Test Flow</DialogTitle>
                <DialogDescription>
                  Define a test flow for a specific user role
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="flow_name">Flow Name</Label>
                  <Input
                    id="flow_name"
                    value={formData.flow_name}
                    onChange={(e) => setFormData({ ...formData, flow_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="user_role">User Role</Label>
                  <Select
                    value={formData.user_role}
                    onValueChange={(value) => setFormData({ ...formData, user_role: value as typeof formData.user_role })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingFlow ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading test flows...</div>
        ) : flows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No test flows created yet. Create your first test flow to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flow Name</TableHead>
                <TableHead>User Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell className="font-medium">{flow.flow_name}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(flow.user_role)}>
                      {USER_ROLES.find(r => r.value === flow.user_role)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{flow.description}</TableCell>
                  <TableCell>{new Date(flow.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFlowForSteps(flow.id)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Steps
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFlowForExecution(flow.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Run
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(flow)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(flow.id)}
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
  );
};