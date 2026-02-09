import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Calendar, Package, Trash2 } from 'lucide-react';

interface ResourceAllocationProps {
  projectId: string;
}

type ScheduledResource = Database['public']['Tables']['scheduled_resources']['Row'];

export function ResourceAllocation({ projectId }: ResourceAllocationProps) {
  const [totalFunds, setTotalFunds] = useState(0);
  const [resources, setResources] = useState<ScheduledResource[]>([]);
  const [resourceType, setResourceType] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    loadFundingData();
    loadScheduledResources();
  }, [projectId]);

  const loadFundingData = async () => {
    // Get total votes across all production levels for this project
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('project_id', projectId);

    if (products && products.length > 0) {
      const productIds = products.map(p => p.id);
      
      const { data: levels } = await supabase
        .from('production_levels')
        .select('current_votes')
        .in('product_id', productIds);

      if (levels) {
        const total = levels.reduce((sum, level) => sum + Number(level.current_votes || 0), 0);
        setTotalFunds(total);
      }
    }
  };

  const loadScheduledResources = async () => {
    const { data, error } = await supabase
      .from('scheduled_resources')
      .select('*')
      .eq('project_id', projectId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error loading resources:', error);
    } else {
      setResources(data || []);
    }
  };

  const handleScheduleResource = async () => {
    if (!resourceType || !cost || !scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const costAmount = parseFloat(cost);
    if (isNaN(costAmount) || costAmount <= 0) {
      toast.error('Please enter a valid cost amount');
      return;
    }

    // Calculate if within the 1/3 allocation
    const allocationLimit = totalFunds / 3;
    const currentScheduled = resources.reduce((sum, r) => sum + Number(r.cost), 0);
    
    if (currentScheduled + costAmount > allocationLimit) {
      toast.error(`This exceeds the 1/3 allocation limit of $${allocationLimit.toFixed(2)}`);
      return;
    }

    const { error } = await supabase
      .from('scheduled_resources')
      .insert({
        project_id: projectId,
        resource_type: resourceType,
        description,
        cost: costAmount,
        scheduled_date: scheduledDate
      });

    if (error) {
      toast.error('Failed to schedule resource');
      console.error(error);
    } else {
      toast.success('Resource scheduled successfully');
      loadScheduledResources();
      setResourceType('');
      setDescription('');
      setCost('');
      setScheduledDate('');
    }
  };

  const handleDeleteResource = async (id: string) => {
    const { error } = await supabase
      .from('scheduled_resources')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete resource');
      console.error(error);
    } else {
      toast.success('Resource deleted');
      loadScheduledResources();
    }
  };

  const lianaAllocation = totalFunds / 3;
  const medallionAllocation = totalFunds / 3;
  const campaignAllocation = totalFunds / 3;
  const scheduledTotal = resources.reduce((sum, r) => sum + Number(r.cost), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>The 1/3 Rule: Banyan & Liana Funding Model</CardTitle>
          <CardDescription>
            Every dollar raised supports three goals: other projects (Lianas), Medallion matching funds, and your campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Liana Support</h3>
              </div>
              <p className="text-2xl font-bold text-primary">${lianaAllocation.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Equipment & Scheduling for Other Projects</p>
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm">Scheduled: ${scheduledTotal.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Available: ${(lianaAllocation - scheduledTotal).toFixed(2)}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏅</span>
                <h3 className="font-semibold">Medallion Match</h3>
              </div>
              <p className="text-2xl font-bold text-primary">${medallionAllocation.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Matching Funds for Medallion Program</p>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎯</span>
                <h3 className="font-semibold">Campaign Goals</h3>
              </div>
              <p className="text-2xl font-bold text-primary">${campaignAllocation.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Direct Support for This Project</p>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <strong>Total Raised:</strong> ${totalFunds.toFixed(2)} • 
              <strong className="ml-2">The Banyan Model:</strong> Your project is a Liana vine supported by the Banyan trunk, 
              while simultaneously supporting other Lianas through shared resources.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Equipment & Supplies</CardTitle>
          <CardDescription>
            Allocate funds from your Liana budget to schedule resources (1/3 allocation: ${lianaAllocation.toFixed(2)})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource-type">Resource Type</Label>
              <Input
                id="resource-type"
                placeholder="e.g., 3D Printer, Materials, Lab Time"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Details about the resource and its purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled-date">Scheduled Date</Label>
            <Input
              id="scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <Button onClick={handleScheduleResource} className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Resource
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Resources</CardTitle>
          <CardDescription>Equipment and supplies allocated from the Liana fund</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.resource_type}</TableCell>
                  <TableCell className="max-w-xs truncate">{resource.description}</TableCell>
                  <TableCell>${Number(resource.cost).toFixed(2)}</TableCell>
                  <TableCell>{new Date(resource.scheduled_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {resources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No resources scheduled yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
