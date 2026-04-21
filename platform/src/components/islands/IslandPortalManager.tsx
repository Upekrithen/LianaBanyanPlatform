import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DoorOpen, Target, Shield, Zap } from "lucide-react";

interface IslandPortalManagerProps {
  islandId: string;
  canManage: boolean;
}

export default function IslandPortalManager({ islandId, canManage }: IslandPortalManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [portalData, setPortalData] = useState({
    portal_name: "",
    portal_type: "project_embassy" as const,
    destination_island_id: null as string | null,
    destination_project_id: null as string | null,
    required_skill_level: 1,
    required_skills: [] as string[],
    dial_destinations: [] as any[]
  });

  const { data: portals } = useQuery({
    queryKey: ['island-portals', islandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('island_portals')
        .select(`
          *,
          destination_island:custom_islands!destination_island_id(island_name),
          destination_project:projects!destination_project_id(name)
        `)
        .eq('island_id', islandId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  const createPortalMutation = useMutation({
    mutationFn: async (portal: typeof portalData) => {
      const { error } = await supabase
        .from('island_portals')
        .insert({
          ...portal,
          island_id: islandId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['island-portals', islandId] });
      toast({
        title: "Portal Created!",
        description: "A new portal door has been established",
      });
      setOpen(false);
      setPortalData({
        portal_name: "",
        portal_type: "project_embassy",
        destination_island_id: null,
        destination_project_id: null,
        required_skill_level: 1,
        required_skills: [],
        dial_destinations: []
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreatePortal = () => {
    createPortalMutation.mutate(portalData);
  };

  const getPortalIcon = (type: string) => {
    switch (type) {
      case 'project_embassy': return <DoorOpen className="h-5 w-5" />;
      case 'guild_hall': return <Shield className="h-5 w-5" />;
      case 'factory_floor': return <Zap className="h-5 w-5" />;
      case 'island_gateway': return <Target className="h-5 w-5" />;
      default: return <DoorOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Portal Manager</h2>
            <p className="text-sm text-muted-foreground">
              Howl's Moving Castle style portal doors
            </p>
          </div>
          {canManage && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <DoorOpen className="mr-2 h-4 w-4" />
                  Create Portal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Portal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Portal Name</Label>
                    <Input
                      value={portalData.portal_name}
                      onChange={(e) => setPortalData(prev => ({ ...prev, portal_name: e.target.value }))}
                      placeholder="Embassy to Project Alpha"
                    />
                  </div>

                  <div>
                    <Label>Portal Type</Label>
                    <Select
                      value={portalData.portal_type}
                      onValueChange={(value: any) => setPortalData(prev => ({ ...prev, portal_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project_embassy">Project Embassy</SelectItem>
                        <SelectItem value="guild_hall">Guild Hall</SelectItem>
                        <SelectItem value="factory_floor">Factory Floor</SelectItem>
                        <SelectItem value="island_gateway">Island Gateway</SelectItem>
                        <SelectItem value="side_quest">Side Quest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Required Skill Level</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={portalData.required_skill_level}
                      onChange={(e) => setPortalData(prev => ({
                        ...prev,
                        required_skill_level: parseInt(e.target.value) || 1
                      }))}
                    />
                  </div>

                  <Button
                    onClick={handleCreatePortal}
                    disabled={createPortalMutation.isPending || !portalData.portal_name}
                    className="w-full"
                  >
                    {createPortalMutation.isPending ? "Creating..." : "Create Portal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portals?.map((portal) => (
            <Card key={portal.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPortalIcon(portal.portal_type)}
                  <div>
                    <h4 className="font-semibold">{portal.portal_name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {portal.portal_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Level {portal.required_skill_level}+</Badge>
              </div>

              <div className="space-y-2">
                {portal.destination_island && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>→ {portal.destination_island.island_name}</span>
                  </div>
                )}
                {portal.destination_project && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>→ {portal.destination_project.name}</span>
                  </div>
                )}
                {portal.dial_destinations && Array.isArray(portal.dial_destinations) && portal.dial_destinations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{portal.dial_destinations.length} dial destinations</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {(!portals || portals.length === 0) && (
            <p className="text-sm text-muted-foreground col-span-2">
              No portals created yet
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">How Portals Work</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Embassy Portals</strong>: Walk through to enter a project's factory floor or island
          </p>
          <p>
            • <strong>Dial Mechanism</strong>: Turn the dial to select different destinations based on your skill level
          </p>
          <p>
            • <strong>Access Control</strong>: Higher level portals require specific skills, guild membership, or reputation
          </p>
          <p>
            • <strong>Return Doors</strong>: You can always walk back out to where you started
          </p>
        </div>
      </Card>
    </div>
  );
}
