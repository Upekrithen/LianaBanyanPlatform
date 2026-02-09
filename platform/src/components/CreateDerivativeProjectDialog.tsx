import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GitBranch, AlertTriangle, Sparkles } from "lucide-react";

interface CreateDerivativeProjectFormData {
  name: string;
  description: string;
  derivative_type: 'accessory_trunk' | 'licensed_variant';
  target_market: string;
  planned_modifications: string;
  royalty_percentage: number;
}

interface CreateDerivativeProjectDialogProps {
  parentProjectId: string;
  parentProjectName: string;
  children?: React.ReactNode;
}

export const CreateDerivativeProjectDialog = ({ 
  parentProjectId, 
  parentProjectName,
  children 
}: CreateDerivativeProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateDerivativeProjectFormData>({
    defaultValues: {
      derivative_type: 'accessory_trunk',
      royalty_percentage: 20
    }
  });

  const createDerivativeMutation = useMutation({
    mutationFn: async (data: CreateDerivativeProjectFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create derivative project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          description: data.description,
          parent_project_id: parentProjectId,
          derivative_type: data.derivative_type,
          royalty_percentage: data.royalty_percentage,
          derivative_status: 'pending',
          owner_id: user.id,
          ip_compliance_rules: {
            enforce_tier_model: true,
            parent_equity_share: 10,
            contract_template_source: 'parent',
            dispute_resolution: 'parent_arbiter',
            revenue_share_percentage: data.royalty_percentage,
            governance_veto_rights: ['ip_changes', 'major_structural_changes']
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Run compliance validation
      const { data: validation } = await supabase.rpc('validate_derivative_compliance', {
        _derivative_project_id: project.id
      });

      return { project, validation };
    },
    onSuccess: (data) => {
      toast.success('Derivative project created! Awaiting approval.');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error('Failed to create derivative project', {
        description: error.message
      });
    }
  });

  const derivativeType = form.watch('derivative_type');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <GitBranch className="h-4 w-4 mr-2" />
            Create Accessory Trunk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Accessory Trunk
          </DialogTitle>
          <DialogDescription>
            Create a derivative organization based on <strong>{parentProjectName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>IP Compliance Required:</strong> All derivative projects must maintain the 3-Tier IP model and flow royalties back to the parent trunk.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createDerivativeMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Project name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Derivative Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., LianaBanyan Healthcare" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="derivative_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Derivative Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="accessory_trunk">
                        <div className="space-y-1">
                          <div className="font-medium">Accessory Trunk (Full Fork)</div>
                          <div className="text-xs text-muted-foreground">
                            Modify features, UX, branding, membership rules (15-25% royalty)
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="licensed_variant">
                        <div className="space-y-1">
                          <div className="font-medium">Licensed Variant (Partial Fork)</div>
                          <div className="text-xs text-muted-foreground">
                            Modify UI/UX and branding only (5-10% royalty)
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="royalty_percentage"
              rules={{ required: true, min: derivativeType === 'accessory_trunk' ? 15 : 5 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Royalty Percentage</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        min={derivativeType === 'accessory_trunk' ? 15 : 5}
                        max={derivativeType === 'accessory_trunk' ? 25 : 10}
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                      <Badge variant="secondary">
                        {derivativeType === 'accessory_trunk' ? '15-25%' : '5-10%'}
                      </Badge>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Percentage of revenue flowing to parent trunk
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_market"
              rules={{ required: 'Target market is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Market</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Healthcare professionals in EU" {...field} />
                  </FormControl>
                  <FormDescription>
                    Who will use this derivative trunk?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planned_modifications"
              rules={{ required: 'Please describe planned modifications' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Modifications</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe features you plan to add/modify..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What will you change compared to the parent trunk?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your derivative project..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createDerivativeMutation.isPending}>
                {createDerivativeMutation.isPending ? 'Creating...' : 'Submit for Approval'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
