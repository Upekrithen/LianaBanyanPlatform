/**
 * SERVICE NODE REGISTRATION — Cold Start Theseus Implementation
 * =============================================================
 * Economic Law #9: Pre-ordered capacity scheduling eliminates startup risk
 * 
 * "Risk = 0 when Demand(pre-sold) ≥ Capacity(scheduled) × 0.5"
 * 
 * Node Types:
 * - Church kitchens (unused weekdays)
 * - Food truck operators (provide license as Captain)
 * - Closed restaurants (off-hours rental)
 * - Home kitchens (cottage food laws)
 * - Shared facilities (pooled resources)
 * 
 * Key Principle: Node Operators and Captains are NOT employees.
 * It's THEIR project. Platform provides tools at cost + 20%.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChefHat, Church, Truck, Building2, Home, Users,
  CheckCircle, Clock, Shield, Sparkles, Target,
  ArrowRight, ArrowLeft, AlertCircle, MapPin, FileText,
  Percent, DollarSign, Calendar
} from "lucide-react";
import { toast } from "sonner";

// Infrastructure types with details
const INFRASTRUCTURE_TYPES = [
  {
    id: "church_kitchen",
    name: "Church Kitchen",
    description: "Commercial kitchen in a church, typically unused Tuesday-Thursday",
    icon: Church,
    licenseRequired: false,
    captainNeeded: true,
    example: "First Baptist Church kitchen, available Tue-Thu",
  },
  {
    id: "food_truck",
    name: "Food Truck",
    description: "Licensed food truck operator who can serve as Captain",
    icon: Truck,
    licenseRequired: true,
    captainNeeded: false, // They ARE the captain
    example: "Mobile kitchen with existing food service license",
  },
  {
    id: "restaurant",
    name: "Restaurant (Off-Hours)",
    description: "Restaurant kitchen available during closed hours",
    icon: Building2,
    licenseRequired: true,
    captainNeeded: false,
    example: "Local diner kitchen, available 2-5pm weekdays",
  },
  {
    id: "home_kitchen",
    name: "Home Kitchen",
    description: "Licensed home kitchen under cottage food laws",
    icon: Home,
    licenseRequired: true,
    captainNeeded: false,
    example: "Converted garage kitchen with cottage food permit",
  },
  {
    id: "shared_facility",
    name: "Shared Facility",
    description: "Pooled resources from multiple contributors (Stone Soup model)",
    icon: Users,
    licenseRequired: true,
    captainNeeded: true,
    example: "Community center kitchen with rotating captains",
  },
];

// Registration steps
const REGISTRATION_STEPS = [
  { step: 1, title: "Infrastructure", description: "What type of facility?" },
  { step: 2, title: "Location", description: "Where will you operate?" },
  { step: 3, title: "Capacity", description: "How much can you produce?" },
  { step: 4, title: "Leadership", description: "Captain & licensing" },
  { step: 5, title: "Commitment", description: "Review & confirm" },
];

interface NodeFormData {
  infrastructureType: string;
  facilityName: string;
  facilityDescription: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  
  // Capacity
  weeklyCapacity: number;
  availableDays: string[];
  availableHours: string;
  
  // Leadership
  isCaptain: boolean;
  captainName: string;
  captainEmail: string;
  licenseType: string;
  licenseNumber: string;
  
  // Commitment
  understandsOwnership: boolean;
  understandsPlatformRole: boolean;
  acceptsTerms: boolean;
  notes: string;
}

export default function ServiceNodeRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [formData, setFormData] = useState<NodeFormData>({
    infrastructureType: "",
    facilityName: "",
    facilityDescription: "",
    address: "",
    city: "",
    state: "",
    country: "USA",
    zipCode: "",
    weeklyCapacity: 50,
    availableDays: [],
    availableHours: "",
    isCaptain: false,
    captainName: "",
    captainEmail: "",
    licenseType: "",
    licenseNumber: "",
    understandsOwnership: false,
    understandsPlatformRole: false,
    acceptsTerms: false,
    notes: "",
  });

  // Check demand signals for the ZIP code
  const { data: demandSignals } = useQuery({
    queryKey: ["demand-signals", formData.zipCode],
    queryFn: async () => {
      if (!formData.zipCode || formData.zipCode.length < 5) return null;
      
      const { data, error } = await supabase
        .from("demand_signals")
        .select("*")
        .eq("zip_code", formData.zipCode)
        .eq("is_aggregated", false);
      
      if (error) return null;
      return data;
    },
    enabled: formData.zipCode.length >= 5,
  });

  const submitRegistration = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      
      // Get node type ID for LMD kitchen
      const { data: nodeType } = await supabase
        .from("service_node_types")
        .select("id")
        .eq("code", "lmd_kitchen")
        .single();
      
      // Create the service node
      const { data: node, error: nodeError } = await supabase
        .from("service_nodes")
        .insert({
          node_type_id: nodeType?.id,
          name: formData.facilityName,
          description: formData.facilityDescription,
          infrastructure_type: formData.infrastructureType,
          infrastructure_details: {
            available_days: formData.availableDays,
            available_hours: formData.availableHours,
          },
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip_code: formData.zipCode,
          weekly_capacity: formData.weeklyCapacity,
          owner_id: user.id,
          captain_id: formData.isCaptain ? user.id : null,
          status: "pending_activation",
        })
        .select()
        .single();

      if (nodeError) throw nodeError;

      // Add leadership record
      if (node) {
        await supabase.from("node_leadership").insert({
          node_id: node.id,
          user_id: user.id,
          role: formData.isCaptain ? "captain" : "owner",
          license_type: formData.licenseType || null,
          license_number: formData.licenseNumber || null,
          is_platform_employee: false, // NEVER true
          owns_project: true, // ALWAYS true
        });

        // If there's a separate captain, add them too
        if (!formData.isCaptain && formData.captainEmail) {
          // In production, this would send an invitation
          // For now, just note it in the node details
        }
      }

      return node;
    },
    onSuccess: () => {
      setShowSuccessDialog(true);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    },
  });

  const updateField = <K extends keyof NodeFormData>(field: K, value: NodeFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const selectedInfra = INFRASTRUCTURE_TYPES.find(i => i.id === formData.infrastructureType);
  const activationThreshold = Math.ceil(formData.weeklyCapacity * 0.5);
  const demandCount = demandSignals?.length || 0;
  const demandProgress = activationThreshold > 0 ? Math.min((demandCount / activationThreshold) * 100, 100) : 0;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.infrastructureType !== "";
      case 2:
        return formData.facilityName && formData.city && formData.zipCode;
      case 3:
        return formData.weeklyCapacity > 0 && formData.availableDays.length > 0;
      case 4:
        if (selectedInfra?.licenseRequired) {
          return formData.isCaptain 
            ? formData.licenseType !== ""
            : formData.captainName !== "";
        }
        return true;
      case 5:
        return formData.understandsOwnership && formData.understandsPlatformRole && formData.acceptsTerms;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Start a Let's Make Dinner Node</h1>
        </div>
        <p className="text-muted-foreground">
          Cold Start Theseus: Pre-sell 50% capacity, eliminate all risk but acts of God
        </p>
      </div>

      {/* The 50% Rule Explainer */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-700">The 50% Rule</p>
              <p className="text-sm text-muted-foreground">
                Your node activates when 50% of weekly capacity is pre-ordered. 
                You'll have guaranteed customers and upfront payment before you start.
                <span className="block mt-1 font-medium text-emerald-600">
                  We don't predict the market — we already sold it.
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {REGISTRATION_STEPS.map((step, index) => (
          <div key={step.step} className="flex items-center">
            <div className={`flex flex-col items-center ${currentStep >= step.step ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep > step.step ? 'bg-primary text-primary-foreground border-primary' :
                currentStep === step.step ? 'border-primary' : 'border-muted'
              }`}>
                {currentStep > step.step ? <CheckCircle className="h-5 w-5" /> : step.step}
              </div>
              <p className="text-xs mt-1 hidden sm:block">{step.title}</p>
            </div>
            {index < REGISTRATION_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 mx-2 ${currentStep > step.step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{REGISTRATION_STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{REGISTRATION_STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Infrastructure Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label>Select your infrastructure type</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {INFRASTRUCTURE_TYPES.map((infra) => (
                  <div
                    key={infra.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.infrastructureType === infra.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => updateField("infrastructureType", infra.id)}
                  >
                    <div className="flex items-start gap-3">
                      <infra.icon className="h-6 w-6 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{infra.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{infra.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-2 italic">e.g., {infra.example}</p>
                        <div className="flex gap-2 mt-2">
                          {infra.licenseRequired && (
                            <Badge variant="outline" className="text-xs">License Required</Badge>
                          )}
                          {infra.captainNeeded && (
                            <Badge variant="outline" className="text-xs">Captain Needed</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facility-name">Facility Name *</Label>
                <Input
                  id="facility-name"
                  placeholder="e.g., First Baptist Community Kitchen"
                  value={formData.facilityName}
                  onChange={(e) => updateField("facilityName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facility-desc">Description</Label>
                <Textarea
                  id="facility-desc"
                  placeholder="Tell us about your facility..."
                  value={formData.facilityDescription}
                  onChange={(e) => updateField("facilityDescription", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="USA"
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                  />
                </div>
              </div>

              {/* Demand Signal Preview */}
              {formData.zipCode.length >= 5 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">Demand in ZIP {formData.zipCode}</span>
                    </div>
                    {demandCount > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-bold">{demandCount}</span> people have expressed interest in meal delivery in this area!
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No demand signals yet. Your node will collect interest as you promote it.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Capacity */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="capacity">Weekly Capacity (meals)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={10}
                  max={1000}
                  value={formData.weeklyCapacity}
                  onChange={(e) => updateField("weeklyCapacity", parseInt(e.target.value) || 50)}
                />
                <p className="text-xs text-muted-foreground">
                  How many meals can you produce per week?
                </p>
              </div>

              {/* The 50% Rule Visualization */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Activation Threshold (50%)</span>
                    <span className="font-bold">{activationThreshold} meals pre-sold</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <div className="font-medium text-emerald-700">Pre-sold (50%)</div>
                      <div className="text-2xl font-bold">{activationThreshold}</div>
                      <div className="text-xs text-muted-foreground">Guaranteed revenue</div>
                    </div>
                    <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
                      <div className="font-medium text-amber-700">Reserved (50%)</div>
                      <div className="text-2xl font-bold">{formData.weeklyCapacity - activationThreshold}</div>
                      <div className="text-xs text-muted-foreground">Surge & growth</div>
                    </div>
                  </div>
                  {demandCount > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Current demand signals</span>
                        <span>{demandCount} / {activationThreshold}</span>
                      </div>
                      <Progress value={demandProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.availableDays.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Available Hours</Label>
                <Input
                  id="hours"
                  placeholder="e.g., 9am-3pm"
                  value={formData.availableHours}
                  onChange={(e) => updateField("availableHours", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Leadership */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Ownership Clarity Banner */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-700">Important: This is YOUR Project</p>
                      <p className="text-sm text-muted-foreground">
                        Node Operators and Captains are <strong>not</strong> employees of Liana Banyan.
                        You own your project. The platform provides tools, personnel coordination, 
                        and supplies at volume cost + 20% — as a facilitator, not an employer.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedInfra?.licenseRequired && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="is-captain"
                      checked={formData.isCaptain}
                      onCheckedChange={(checked) => updateField("isCaptain", checked === true)}
                    />
                    <div>
                      <Label htmlFor="is-captain" className="cursor-pointer font-medium">
                        I will serve as Captain (I have a food service license)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Captains provide the legal compliance umbrella for the node
                      </p>
                    </div>
                  </div>

                  {formData.isCaptain ? (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                      <div className="space-y-2">
                        <Label htmlFor="license-type">License Type</Label>
                        <Select
                          value={formData.licenseType}
                          onValueChange={(v) => updateField("licenseType", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select license type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="food_truck">Food Truck License</SelectItem>
                            <SelectItem value="commercial_kitchen">Commercial Kitchen License</SelectItem>
                            <SelectItem value="cottage_food">Cottage Food Permit</SelectItem>
                            <SelectItem value="restaurant">Restaurant License</SelectItem>
                            <SelectItem value="catering">Catering License</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license-number">License Number</Label>
                        <Input
                          id="license-number"
                          placeholder="License #"
                          value={formData.licenseNumber}
                          onChange={(e) => updateField("licenseNumber", e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pl-6 border-l-2 border-muted">
                      <p className="text-sm text-muted-foreground">
                        You'll need a Captain with a food service license. Enter their info below,
                        or leave blank to recruit one later.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="captain-name">Captain Name</Label>
                          <Input
                            id="captain-name"
                            placeholder="Captain's name"
                            value={formData.captainName}
                            onChange={(e) => updateField("captainName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="captain-email">Captain Email</Label>
                          <Input
                            id="captain-email"
                            type="email"
                            placeholder="captain@email.com"
                            value={formData.captainEmail}
                            onChange={(e) => updateField("captainEmail", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!selectedInfra?.licenseRequired && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    This infrastructure type doesn't require a separate license holder.
                    You'll be registered as the node owner.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Commitment */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Node Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facility:</span>
                    <span>{formData.facilityName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{selectedInfra?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{formData.city}, {formData.state} {formData.zipCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekly Capacity:</span>
                    <span>{formData.weeklyCapacity} meals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Activation Threshold:</span>
                    <span className="text-primary font-medium">{activationThreshold} pre-orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Days:</span>
                    <span>{formData.availableDays.join(", ") || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span>{formData.isCaptain ? "Captain (License Holder)" : "Node Owner"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Understanding Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ownership"
                    checked={formData.understandsOwnership}
                    onCheckedChange={(checked) => updateField("understandsOwnership", checked === true)}
                    required
                  />
                  <div>
                    <Label htmlFor="ownership" className="cursor-pointer">
                      I understand this is MY project *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I am not an employee of Liana Banyan. I own this node and its operations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="platform-role"
                    checked={formData.understandsPlatformRole}
                    onCheckedChange={(checked) => updateField("understandsPlatformRole", checked === true)}
                    required
                  />
                  <div>
                    <Label htmlFor="platform-role" className="cursor-pointer">
                      I understand the platform's role *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Liana Banyan provides tools, personnel coordination, and supplies at cost + 20%.
                      The platform is a facilitator, not an employer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptsTerms}
                    onCheckedChange={(checked) => updateField("acceptsTerms", checked === true)}
                    required
                  />
                  <div>
                    <Label htmlFor="terms" className="cursor-pointer">
                      I accept the Node Operator Agreement *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Including the 50% activation rule, 83.3% creator/worker share, and quality standards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Anything else we should know..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </div>

              {/* What Happens Next */}
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    What Happens Next
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Your node enters <strong>Pending Activation</strong> status</li>
                    <li>We'll help you promote to collect pre-orders in your ZIP code</li>
                    <li>When {activationThreshold} meals are pre-ordered (50%), your node <strong>activates</strong></li>
                    <li>You'll have guaranteed customers and 50% upfront payment</li>
                    <li>Start cooking! Keep 83.3% of every sale.</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep === 1 ? navigate("/lets-make-dinner") : setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Back" : "Previous"}
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => submitRegistration.mutate()}
              disabled={!canProceed() || submitRegistration.isPending}
            >
              {submitRegistration.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Create Node
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Node Created!
            </DialogTitle>
            <DialogDescription>
              Your Let's Make Dinner node is now in Pending Activation status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="font-medium text-emerald-700">The Cold Start begins!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your node will activate when {activationThreshold} meals are pre-ordered.
                Share your node link to start collecting orders!
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Next steps:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Share your node with potential customers</li>
              <li>Recruit volunteers and team members</li>
              <li>Prepare your facility for activation</li>
              <li>Watch the pre-order counter climb!</li>
            </ol>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/lets-make-dinner")}>
              Back to Let's Make Dinner
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
