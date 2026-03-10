import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Award, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import SingleImageUpload from '@/components/SingleImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MedallionDesignConfiguratorProps {
  projectId: string;
}

export function MedallionDesignConfigurator({ projectId }: MedallionDesignConfiguratorProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [designType, setDesignType] = useState<'default' | 'custom'>('default');
  const [designName, setDesignName] = useState('');
  const [designNotes, setDesignNotes] = useState('');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState('hexagon');

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing medallion design
  const { data: existingDesign } = useQuery({
    queryKey: ['medallion-design', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medallion_designs')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const createDesignMutation = useMutation({
    mutationFn: async () => {
      const designData = {
        project_id: projectId,
        created_by: user!.id,
        design_type: designType,
        design_name: designName || `${project?.name} Medallion`,
        design_notes: designNotes,
        logo_url: logoFile,
        background_style: backgroundStyle,
        status: 'pending_approval',
      };

      if (existingDesign) {
        const { error } = await supabase
          .from('medallion_designs')
          .update(designData)
          .eq('id', existingDesign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medallion_designs')
          .insert(designData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medallion-design', projectId] });
      toast({
        title: 'Design Saved!',
        description: 'Your medallion design has been submitted for approval.',
      });
    },
  });

  const approveDesignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('medallion_designs')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user!.id,
        })
        .eq('id', existingDesign!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medallion-design', projectId] });
      toast({
        title: 'Design Approved!',
        description: 'Medallion design is ready for production.',
      });
    },
  });

  const statusColors = {
    pending_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    in_production: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-3">Design and configure custom medallions for your achievements.</p>
          <Button variant="outline" size="sm" onClick={() => openOnboard({ reason: "Configure your medallion designs", actionLabel: "Design Medallions" })}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              Medallion Design Configurator
            </CardTitle>
            <CardDescription>
              Design your project's commemorative medallions
            </CardDescription>
          </div>
          {existingDesign && (
            <Badge className={statusColors[existingDesign.status as keyof typeof statusColors]}>
              {existingDesign.status.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Design Type</Label>
                <RadioGroup value={designType} onValueChange={(v) => setDesignType(v as any)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="default" id="default" />
                    <Label htmlFor="default" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Default LB Medallion</div>
                      <div className="text-sm text-muted-foreground">
                        Standard hexagonal design with project branding
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="flex-1 cursor-pointer">
                      <div className="font-semibold flex items-center gap-2">
                        Custom Design <Sparkles className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Fully customized design service (additional fee)
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="design-name">Design Name</Label>
                <Input
                  id="design-name"
                  placeholder={`${project?.name || 'Project'} Commemorative Medallion`}
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                />
              </div>

              <div>
                <Label>Project Logo/Icon</Label>
                <SingleImageUpload
                  currentImageUrl={logoFile || undefined}
                  onUpload={setLogoFile}
                  label="Upload Logo"
                  description="This will be featured on your medallion"
                />
              </div>

              {designType === 'custom' && (
                <>
                  <div>
                    <Label htmlFor="design-notes">Custom Design Instructions</Label>
                    <Textarea
                      id="design-notes"
                      placeholder="Describe your vision: colors, themes, symbols, text, etc."
                      value={designNotes}
                      onChange={(e) => setDesignNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Background Style</Label>
                    <RadioGroup value={backgroundStyle} onValueChange={setBackgroundStyle}>
                      <div className="grid grid-cols-2 gap-4">
                        {['hexagon', 'circle', 'shield', 'square'].map((style) => (
                          <div key={style} className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value={style} id={style} />
                            <Label htmlFor={style} className="capitalize cursor-pointer">
                              {style}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              <Button
                onClick={() => createDesignMutation.mutate()}
                disabled={createDesignMutation.isPending}
                className="w-full"
              >
                {existingDesign ? 'Update Design' : 'Submit Design'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="p-8 bg-muted rounded-lg flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-4">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border-4 border-primary/30">
                  {logoFile ? (
                    <img src={logoFile} alt="Logo preview" className="w-32 h-32 object-contain" />
                  ) : (
                    <Award className="w-32 h-32 text-primary/40" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">
                    {designName || `${project?.name} Medallion`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {designType === 'custom' ? 'Custom Design' : 'Default LB Design'}
                  </p>
                </div>
              </div>
            </div>
            {existingDesign && existingDesign.status === 'approved' && (
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Design Files
              </Button>
            )}
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            {!existingDesign ? (
              <div className="text-center text-muted-foreground py-8">
                Submit a design to view production options
              </div>
            ) : existingDesign.status === 'pending_approval' ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    Design is pending approval. Once approved, you can proceed to production.
                  </p>
                </div>
                <Button
                  onClick={() => approveDesignMutation.mutate()}
                  disabled={approveDesignMutation.isPending}
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Design
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Design Approved
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your medallion design is ready for production. Connect with a production partner to begin manufacturing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold">Production Details</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Material:</strong> Premium metal alloy</p>
                      <p><strong>Size:</strong> 2.5" diameter</p>
                      <p><strong>Finish:</strong> Dual-tone with enamel</p>
                      <p><strong>QR Code:</strong> Laser-etched on reverse</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold">Estimated Timeline</h4>
                    <div className="text-sm space-y-1">
                      <p>• Design finalization: 1-2 weeks</p>
                      <p>• Die creation: 2-3 weeks</p>
                      <p>• Production: 3-4 weeks</p>
                      <p>• Shipping: 1-2 weeks</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
