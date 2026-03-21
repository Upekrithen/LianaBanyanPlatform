import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Award, Shield, Package, Settings } from 'lucide-react';
import { MedallionDesignConfigurator } from '@/components/MedallionDesignConfigurator';
import { MedallionQRVerification } from '@/components/MedallionQRVerification';
import { MedallionProductionTracker } from '@/components/MedallionProductionTracker';
import { MedallionMintingManager } from '@/components/MedallionMintingManager';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function MedallionManagement() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: isOwner } = useQuery({
    queryKey: ['project-owner', projectId, user?.id],
    queryFn: async () => {
      if (!projectId || !user) return false;
      const { data } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .eq('owner_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!projectId && !!user,
  });

  if (!projectId) {
    return (
      <PortalPageLayout>
        <Alert variant="destructive">
          <AlertDescription>Invalid project ID</AlertDescription>
        </Alert>
      </PortalPageLayout>
    );
  }

  if (!user) {
    return (
      <PortalPageLayout>
        <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-3">Manage your medallion designs, production, and minting.</p>
        <button
          onClick={() => openOnboard({ reason: "Manage your medallion collection", actionLabel: "Manage Medallions" })}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Get Started
        </button>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Award className="w-8 h-8" />
          Medallion Management
        </h1>
        <p className="text-muted-foreground mt-2">
          {project?.name} - Design, verify, and track commemorative medallions
        </p>
      </div>

      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verify
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Production
          </TabsTrigger>
          <TabsTrigger value="minting" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Minting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-6">
          <MedallionDesignConfigurator projectId={projectId} />
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <MedallionQRVerification />
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <MedallionProductionTracker projectId={projectId} />
        </TabsContent>

        <TabsContent value="minting" className="space-y-6">
          {isOwner ? (
            <MedallionMintingManager projectId={projectId} />
          ) : (
            <Alert>
              <AlertDescription>
                Only project owners can mint medallions to the blockchain.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
