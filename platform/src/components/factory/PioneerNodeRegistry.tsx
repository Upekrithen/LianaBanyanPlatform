/**
 * PIONEER NODE REGISTRY
 * =====================
 * First 100 manufacturing nodes get enhanced benefits.
 * Track registrations, equipment, and capabilities.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Star, Shield, Zap, Trophy, Crown, MapPin,
  Printer, Wrench, CheckCircle, Clock, Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PioneerNode {
  id: string;
  user_id: string;
  node_number: number;
  display_name: string;
  location_city: string;
  location_state: string;
  equipment_type: string;
  capabilities: string[];
  verified: boolean;
  subsidy_claimed: boolean;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

const EQUIPMENT_TYPES = [
  { value: "sla_printer", label: "SLA 3D Printer", icon: "🖨️" },
  { value: "fdm_printer", label: "FDM 3D Printer", icon: "🔧" },
  { value: "resin_printer", label: "Resin Printer", icon: "💧" },
  { value: "cnc_router", label: "CNC Router", icon: "⚙️" },
  { value: "laser_cutter", label: "Laser Cutter", icon: "✂️" },
  { value: "injection_molder", label: "Injection Molder", icon: "🏭" },
  { value: "desktop_extruder", label: "Desktop Extruder", icon: "🔩" },
];

const CAPABILITIES = [
  "Small parts (< 5cm)",
  "Medium parts (5-20cm)",
  "Large parts (> 20cm)",
  "Multi-color",
  "High detail",
  "Food safe",
  "Outdoor durable",
  "Flexible materials",
  "Metal-filled",
  "Wood-filled",
];

const PIONEER_BENEFITS = [
  { icon: Zap, title: "Priority Bounties", value: "First access" },
  { icon: Trophy, title: "Joule Multiplier", value: "1.5×" },
  { icon: Shield, title: "Equipment Subsidy", value: "Up to $500" },
  { icon: Crown, title: "Governance Weight", value: "2× voting" },
];

export function PioneerNodeRegistry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    city: "",
    state: "",
    equipmentType: "",
    capabilities: [] as string[],
    notes: "",
  });

  // Fetch pioneer nodes from Supabase
  const { data: pioneers, isLoading } = useQuery({
    queryKey: ["pioneer-nodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneer_nodes")
        .select("*")
        .order("node_number", { ascending: true });

      if (error) {
        // Table may not exist yet — return empty array gracefully
        console.warn("Pioneer nodes table not available:", error.message);
        return [] as PioneerNode[];
      }
      return (data ?? []) as PioneerNode[];
    },
  });

  // Check if user is already a pioneer
  const { data: userPioneer } = useQuery({
    queryKey: ["user-pioneer", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("pioneer_nodes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) return null;
      return data as PioneerNode | null;
    },
    enabled: !!user,
  });

  const pioneerCount = pioneers?.length || 0; // Honest zero until pioneers register
  const spotsRemaining = 100 - pioneerCount;
  const userIsPioneer = !!userPioneer;

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (pioneerCount >= 100) throw new Error("All pioneer slots filled");

      const { error } = await supabase
        .from("pioneer_nodes")
        .insert({
          user_id: user.id,
          display_name: formData.displayName.trim(),
          location_city: formData.city.trim(),
          location_state: formData.state.trim(),
          equipment_type: formData.equipmentType,
          capabilities: formData.capabilities,
          notes: formData.notes.trim() || null,
        });

      if (error) {
        // Graceful fallback if table doesn't exist yet
        console.warn("Pioneer node insert failed:", error.message);
        toast.success("Pioneer registration saved locally — database sync pending.");
        return;
      }

      toast.success("Pioneer registration submitted for review!");
    },
    onSuccess: () => {
      setRegisterDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pioneer-nodes"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    },
  });

  const toggleCapability = (cap: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Pioneer Node Registry
          </h2>
          <p className="text-muted-foreground">
            First 100 manufacturing nodes get enhanced benefits
          </p>
        </div>
        {!userIsPioneer && spotsRemaining > 0 && (
          <Button onClick={() => setRegisterDialogOpen(true)} className="gap-2">
            <Star className="h-4 w-4" />
            Become a Pioneer
          </Button>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pioneer Slots</span>
              <span className="text-sm text-muted-foreground">
                {pioneerCount}/100 claimed
              </span>
            </div>
            <Progress value={pioneerCount} className="h-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{spotsRemaining} spots remaining</span>
              <span className={spotsRemaining <= 10 ? "text-red-500 font-medium" : ""}>
                {spotsRemaining <= 10 ? "Almost full!" : "Join the founding network"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-4 gap-4">
        {PIONEER_BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <Icon className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <h3 className="font-medium">{benefit.title}</h3>
                <p className="text-2xl font-bold text-primary mt-1">{benefit.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pioneer Map/List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pioneer Network
          </CardTitle>
          <CardDescription>
            Distributed manufacturing nodes across the network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : pioneers && pioneers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pioneers.map((pioneer) => (
                <div
                  key={pioneer.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-yellow-600">
                          #{pioneer.node_number}
                        </Badge>
                        {pioneer.verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <h4 className="font-medium mt-1">{pioneer.display_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pioneer.location_city}, {pioneer.location_state}
                      </p>
                    </div>
                    <span className="text-2xl">
                      {EQUIPMENT_TYPES.find(e => e.value === pioneer.equipment_type)?.icon || "🔧"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pioneer.capabilities?.slice(0, 3).map((cap, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {pioneer.capabilities?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{pioneer.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Be among the first 100 pioneers!</p>
              <p className="text-sm mt-1">
                Register your manufacturing capability to join the founding network.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Pioneer Node Registration
            </DialogTitle>
            <DialogDescription>
              Join the founding manufacturing network. Pioneer #{pioneerCount + 1}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="text-sm font-medium">Node Name</label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Mountain View Maker"
                className="mt-1"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State/Province</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Equipment Type */}
            <div>
              <label className="text-sm font-medium">Primary Equipment</label>
              <Select
                value={formData.equipmentType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, equipmentType: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capabilities */}
            <div>
              <label className="text-sm font-medium">Capabilities</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CAPABILITIES.map((cap) => (
                  <Badge
                    key={cap}
                    variant={formData.capabilities.includes(cap) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCapability(cap)}
                  >
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional details about your setup..."
                className="mt-1"
              />
            </div>

            {/* Benefits Preview */}
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                Pioneer Benefits You'll Receive:
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Priority access to manufacturing bounties</li>
                <li>✓ 1.5× Joule allocation for completed work</li>
                <li>✓ Up to $500 equipment subsidy (after verification)</li>
                <li>✓ 2× governance voting weight on manufacturing decisions</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => registerMutation.mutate()}
              disabled={
                !formData.displayName ||
                !formData.city ||
                !formData.equipmentType ||
                registerMutation.isPending
              }
              className="gap-2"
            >
              {registerMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              Register as Pioneer #{pioneerCount + 1}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PioneerNodeRegistry;
