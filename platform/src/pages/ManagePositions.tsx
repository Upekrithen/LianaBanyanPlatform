import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PositionActivationManager } from '@/components/PositionActivationManager';
import { AgentAuditLog } from '@/components/AgentAuditLog';
import { ProjectCategoryManager } from '@/components/ProjectCategoryManager';
import { toast } from 'sonner';
import { Loader2, Trash2, Edit, Plus } from 'lucide-react';

const CATEGORIES = [
  { value: 'create_idea', label: 'Create Idea' },
  { value: 'define_describe_document', label: 'Define & Document' },
  { value: 'research_development', label: 'R&D' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'legal_services', label: 'Legal' },
  { value: 'logistics_blockchain', label: 'Logistics & Blockchain' },
  { value: 'steward_owner', label: 'Steward/Owner' },
  { value: 'marketing_services', label: 'Marketing' },
  { value: 'accounting_services', label: 'Accounting' },
  { value: 'hr_staffing', label: 'HR/Staffing' },
  { value: 'materials_sourcing', label: 'Materials' },
  { value: 'manufacture_assembly', label: 'Manufacturing' },
  { value: 'kickstarter_campaign', label: 'Kickstarter' },
  { value: 'it_services', label: 'IT Services' },
  { value: 'delivery', label: 'Delivery' },
];

const STAGES = [
  { value: 'germination', label: 'Germination' },
  { value: 'seedling', label: 'Seedling' },
  { value: 'growth', label: 'Growth' },
  { value: 'maturity', label: 'Maturity' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'harvest', label: 'Harvest' },
];

export default function ManagePositions() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    position_title: '',
    position_description: '',
    compensation_type: 'participation',
    participation_percentage: 0,
    cash_amount: 0,
    credits_reserved: 100,
    required_stage: '',
    contract_xml_path: '',
  });

  useEffect(() => {
    checkAccess();
  }, [projectId, user]);

  const checkAccess = async () => {
    if (!projectId || !user) {
      navigate('/dashboard');
      return;
    }

    // Check if user is project owner
    const { data: project, error } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (error || project.owner_id !== user.id) {
      toast.error('Access denied. Project owner only.');
      navigate('/dashboard');
      return;
    }

    loadPositions();
  };

  const loadPositions = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('contract_position_templates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPositions(data || []);
    } catch (error: any) {
      console.error('Error loading positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.position_title) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('contract_position_templates')
          .update({
            category: formData.category as any,
            position_title: formData.position_title,
            position_description: formData.position_description,
            compensation_type: formData.compensation_type,
            participation_percentage: formData.participation_percentage,
            cash_amount: formData.cash_amount,
            credits_reserved: formData.credits_reserved,
            required_stage: formData.required_stage as any || null,
            contract_xml_path: formData.contract_xml_path,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Position updated successfully');
      } else {
        const insertData: any = {
          category: formData.category,
          position_title: formData.position_title,
          position_description: formData.position_description,
          compensation_type: formData.compensation_type,
          participation_percentage: formData.participation_percentage,
          cash_amount: formData.cash_amount,
          credits_reserved: formData.credits_reserved,
          required_stage: formData.required_stage || null,
          contract_xml_path: formData.contract_xml_path,
          project_id: projectId,
          created_by: user?.id,
        };
        
        const { error } = await supabase
          .from('contract_position_templates')
          .insert(insertData);

        if (error) throw error;
        toast.success('Position created successfully');
      }

      resetForm();
      loadPositions();
    } catch (error: any) {
      console.error('Error saving position:', error);
      toast.error('Failed to save position');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (position: any) => {
    setFormData({
      category: position.category,
      position_title: position.position_title,
      position_description: position.position_description || '',
      compensation_type: position.compensation_type,
      participation_percentage: position.participation_percentage || 0,
      cash_amount: position.cash_amount || 0,
      credits_reserved: position.credits_reserved || 100,
      required_stage: position.required_stage || '',
      contract_xml_path: position.contract_xml_path || '',
    });
    setEditingId(position.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this position?')) return;

    try {
      const { error } = await supabase
        .from('contract_position_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Position deleted');
      loadPositions();
    } catch (error: any) {
      console.error('Error deleting position:', error);
      toast.error('Failed to delete position');
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      position_title: '',
      position_description: '',
      compensation_type: 'participation',
      participation_percentage: 0,
      cash_amount: 0,
      credits_reserved: 100,
      required_stage: '',
      contract_xml_path: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manage Contract Positions</h1>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 mr-2" />
                {showForm ? 'Cancel' : 'Create Position'}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/admin/project`)}>
                Back to Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Tabs defaultValue="positions">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="activation">Activation Control</TabsTrigger>
            <TabsTrigger value="category">Category & Data</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-6">
            {/* Position Form */}
            {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit' : 'Create'} Position</CardTitle>
              <CardDescription>
                Define contract positions with compensation structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position_title">Position Title *</Label>
                    <Input
                      id="position_title"
                      value={formData.position_title}
                      onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                      placeholder="e.g., Senior Developer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position_description">Description</Label>
                  <Textarea
                    id="position_description"
                    value={formData.position_description}
                    onChange={(e) => setFormData({ ...formData, position_description: e.target.value })}
                    placeholder="Describe the position requirements and responsibilities"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="compensation_type">Compensation Type</Label>
                    <Select
                      value={formData.compensation_type}
                      onValueChange={(value) => setFormData({ ...formData, compensation_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equity">Participation</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="required_stage">Required Stage</Label>
                    <Select
                      value={formData.required_stage}
                      onValueChange={(value) => setFormData({ ...formData, required_stage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(formData.compensation_type === 'participation' || formData.compensation_type === 'mixed') && (
                  <div className="space-y-2">
                    <Label>Participation Percentage: {formData.participation_percentage}%</Label>
                    <Slider
                      value={[formData.participation_percentage]}
                      onValueChange={([value]) => setFormData({ ...formData, participation_percentage: value })}
                      max={100}
                      step={0.1}
                    />
                  </div>
                )}

                {(formData.compensation_type === 'cash' || formData.compensation_type === 'mixed') && (
                  <div className="space-y-2">
                    <Label htmlFor="cash_amount">Cash Amount ($)</Label>
                    <Input
                      id="cash_amount"
                      type="number"
                      value={formData.cash_amount}
                      onChange={(e) => setFormData({ ...formData, cash_amount: parseFloat(e.target.value) })}
                      step="0.01"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Credits Reserved: {formData.credits_reserved}</Label>
                  <Slider
                    value={[formData.credits_reserved]}
                    onValueChange={([value]) => setFormData({ ...formData, credits_reserved: value })}
                    max={1000}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_xml_path">Contract XML Path (optional)</Label>
                  <Input
                    id="contract_xml_path"
                    value={formData.contract_xml_path}
                    onChange={(e) => setFormData({ ...formData, contract_xml_path: e.target.value })}
                    placeholder="Path to contract in lockbox"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? 'Update' : 'Create'} Position
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Positions List */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Positions</CardTitle>
            <CardDescription>
              All positions configured for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No positions created yet. Click "Create Position" to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Compensation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{position.position_title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {position.position_description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CATEGORIES.find(c => c.value === position.category)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {position.participation_percentage > 0 && (
                            <div>{position.participation_percentage}% participation</div>
                          )}
                          {position.cash_amount > 0 && (
                            <div>${position.cash_amount}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={position.is_active ? 'default' : 'secondary'}>
                          {position.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(position)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(position.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="activation">
            {projectId && <PositionActivationManager projectId={projectId} />}
          </TabsContent>

          <TabsContent value="category">
            {projectId && <ProjectCategoryManager projectId={projectId} />}
          </TabsContent>

          <TabsContent value="audit">
            {projectId && <AgentAuditLog projectId={projectId} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
