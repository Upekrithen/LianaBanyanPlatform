/**
 * NODE REGISTRATION — Manufacturing Node Signup
 * ==============================================
 * Register as a manufacturing node in the decentralized factory network.
 *
 * Node Types:
 * - Prototype: Consumer 3D printer (FDM/SLA)
 * - Small Batch: Formlabs SLS
 * - Medium Run: Desktop injection molding
 * - Large Run: Industrial injection
 * - Mass Production: Factory line
 *
 * Pioneer Benefits (First 100):
 * - Subsidized equipment cost
 * - Priority bounty assignments
 * - Higher Joule allocation
 * - "Pioneer Node" badge + governance weight
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin, Printer, Factory, Package, Building2, Cpu,
  CheckCircle, Clock, Camera, FileText, Shield, Sparkles,
  ArrowRight, ArrowLeft, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// Equipment categories
const EQUIPMENT_TYPES = [
  {
    id: "fdm-printer",
    name: "FDM 3D Printer",
    tier: "prototype",
    examples: "Prusa, Ender, Bambu Lab",
    icon: Printer,
  },
  {
    id: "sla-printer",
    name: "SLA/Resin Printer",
    tier: "prototype",
    examples: "Elegoo, Anycubic, Formlabs Form",
    icon: Printer,
  },
  {
    id: "sls-printer",
    name: "SLS Printer",
    tier: "small-batch",
    examples: "Formlabs Fuse, Sinterit",
    icon: Package,
  },
  {
    id: "desktop-injection",
    name: "Desktop Injection Molding",
    tier: "medium-run",
    examples: "Galomb, LNS Technologies, Holipress",
    icon: Factory,
  },
  {
    id: "cnc-mill",
    name: "CNC Mill/Router",
    tier: "prototype",
    examples: "Shapeoko, X-Carve, Tormach",
    icon: Factory,
  },
  {
    id: "laser-cutter",
    name: "Laser Cutter/Engraver",
    tier: "prototype",
    examples: "Glowforge, Thunder Laser, Epilog",
    icon: Factory,
  },
  {
    id: "industrial-injection",
    name: "Industrial Injection Molding",
    tier: "large-run",
    examples: "Arburg, Engel, Haitian",
    icon: Building2,
  },
  {
    id: "factory-line",
    name: "Full Factory Line",
    tier: "mass-production",
    examples: "Multi-machine production facility",
    icon: Cpu,
  },
];

// Certification steps
const CERTIFICATION_STEPS = [
  { step: 1, title: "Equipment Info", description: "Tell us what you have" },
  { step: 2, title: "Location", description: "Where you operate" },
  { step: 3, title: "Verification", description: "Photos + test prints" },
  { step: 4, title: "Commitment", description: "Response time + availability" },
];

interface NodeFormData {
  equipmentTypes: string[];
  equipmentDetails: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  responseTimeHours: number;
  weeklyAvailabilityHours: number;
  hasInsurance: boolean;
  acceptsTerms: boolean;
  notes: string;
}

export default function NodeRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [formData, setFormData] = useState<NodeFormData>({
    equipmentTypes: [],
    equipmentDetails: "",
    businessName: "",
    contactName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    responseTimeHours: 24,
    weeklyAvailabilityHours: 20,
    hasInsurance: false,
    acceptsTerms: false,
    notes: "",
  });

  // Check pioneer slots remaining
  const { data: pioneerSlotsRemaining } = useQuery({
    queryKey: ["pioneer-slots"],
    queryFn: async () => {
      // In production, this would query the actual node count
      // For now, return 100 (all slots available)
      return 100;
    },
  });

  const submitRegistration = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      // In production, this would insert into production_nodes table
      const { error } = await supabase.from("production_nodes").insert({
        user_id: user.id,
        name: formData.businessName || formData.contactName,
        location: `${formData.city}, ${formData.state}, ${formData.country}`,
        capabilities: formData.equipmentTypes,
        status: "pending_verification",
        contact_info: {
          name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postalCode,
        },
        equipment_details: formData.equipmentDetails,
        response_time_hours: formData.responseTimeHours,
        weekly_availability_hours: formData.weeklyAvailabilityHours,
        has_insurance: formData.hasInsurance,
        notes: formData.notes,
        is_pioneer: (pioneerSlotsRemaining || 0) > 0,
      });

      if (error) throw error;
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

  const toggleEquipment = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentTypes: prev.equipmentTypes.includes(equipmentId)
        ? prev.equipmentTypes.filter(e => e !== equipmentId)
        : [...prev.equipmentTypes, equipmentId],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.equipmentTypes.length > 0;
      case 2:
        return formData.contactName && formData.email && formData.city && formData.country;
      case 3:
        return true; // Photos optional for now
      case 4:
        return formData.acceptsTerms;
      default:
        return false;
    }
  };

  const isPioneerEligible = (pioneerSlotsRemaining || 0) > 0;

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Become a Manufacturing Node</h1>
        </div>
        <p className="text-muted-foreground">
          Join the decentralized factory network. Get paid to manufacture.
        </p>
      </div>

      {/* Pioneer Banner */}
      {isPioneerEligible && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-500" />
              <div>
                <p className="font-bold text-amber-700">Pioneer Node Slots Available!</p>
                <p className="text-sm text-muted-foreground">
                  {pioneerSlotsRemaining} of 100 pioneer slots remaining. Get subsidized equipment, priority bounties, and governance weight.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {CERTIFICATION_STEPS.map((step, index) => (
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
            {index < CERTIFICATION_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-16 mx-2 ${currentStep > step.step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{CERTIFICATION_STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{CERTIFICATION_STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Equipment */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label>Select your equipment (check all that apply)</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {EQUIPMENT_TYPES.map((equipment) => (
                  <div
                    key={equipment.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.equipmentTypes.includes(equipment.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleEquipment(equipment.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={formData.equipmentTypes.includes(equipment.id)}
                        onCheckedChange={() => toggleEquipment(equipment.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <equipment.icon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{equipment.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{equipment.examples}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{equipment.tier}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment-details">Equipment Details</Label>
                <Textarea
                  id="equipment-details"
                  placeholder="Specific models, build volume, materials you can work with..."
                  value={formData.equipmentDetails}
                  onChange={(e) => updateField("equipmentDetails", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name (optional)</Label>
                  <Input
                    id="business-name"
                    placeholder="Your shop or business name"
                    value={formData.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact Name *</Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    value={formData.contactName}
                    onChange={(e) => updateField("contactName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="123 Maker Street"
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
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    placeholder="12345"
                    value={formData.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start gap-3">
                  <Camera className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Equipment Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload photos of your equipment setup. This helps us verify your capabilities.
                    </p>
                    <Button variant="outline" className="mt-3" disabled>
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Photos
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Test Print Submission</h4>
                    <p className="text-sm text-muted-foreground">
                      After registration, you'll receive a test file to print. Submit the result for quality verification.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Test file will be sent to your email after registration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-700">Verification is Optional for Now</h4>
                    <p className="text-sm text-muted-foreground">
                      During the cold-start phase, you can register without verification. Verified nodes get priority bounty assignments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Commitment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response-time">Response Time Commitment</Label>
                  <Select
                    value={formData.responseTimeHours.toString()}
                    onValueChange={(v) => updateField("responseTimeHours", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">Within 4 hours</SelectItem>
                      <SelectItem value="12">Within 12 hours</SelectItem>
                      <SelectItem value="24">Within 24 hours</SelectItem>
                      <SelectItem value="48">Within 48 hours</SelectItem>
                      <SelectItem value="72">Within 72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How quickly you can respond to bounty requests
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Weekly Availability</Label>
                  <Select
                    value={formData.weeklyAvailabilityHours.toString()}
                    onValueChange={(v) => updateField("weeklyAvailabilityHours", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 hours/week</SelectItem>
                      <SelectItem value="10">10 hours/week</SelectItem>
                      <SelectItem value="20">20 hours/week</SelectItem>
                      <SelectItem value="40">40 hours/week (full-time)</SelectItem>
                      <SelectItem value="60">60+ hours/week</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Hours per week you can dedicate to bounties
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="insurance"
                    checked={formData.hasInsurance}
                    onCheckedChange={(checked) => updateField("hasInsurance", checked === true)}
                  />
                  <div>
                    <Label htmlFor="insurance" className="cursor-pointer">
                      I have business/liability insurance
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Optional but recommended for larger jobs
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
                      I agree to the Node Operator Terms *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Including quality standards, response time commitments, and the 3/5 + 2/5 time split
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Anything else we should know about your capabilities..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </div>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Registration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equipment:</span>
                    <span>{formData.equipmentTypes.length} type(s) selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{formData.city}, {formData.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span>{formData.responseTimeHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Availability:</span>
                    <span>{formData.weeklyAvailabilityHours} hours/week</span>
                  </div>
                  {isPioneerEligible && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>Pioneer Status:</span>
                      <span>✓ Eligible</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep === 1 ? navigate("/factory") : setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Back to Factory" : "Previous"}
          </Button>

          {currentStep < 4 ? (
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
              Complete Registration
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
              Registration Submitted!
            </DialogTitle>
            <DialogDescription>
              Welcome to the manufacturing node network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>Your registration has been submitted. Here's what happens next:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>You'll receive a confirmation email</li>
              <li>A test file will be sent for quality verification</li>
              <li>Once verified, you'll start receiving bounty notifications</li>
              <li>Complete bounties to earn Credits, Marks, and Joules</li>
            </ol>
            {isPioneerEligible && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-700">
                  🎉 You've secured a Pioneer Node slot!
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/factory")}>
              Back to Factory
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
