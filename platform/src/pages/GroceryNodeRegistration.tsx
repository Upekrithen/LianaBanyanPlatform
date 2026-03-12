/**
 * GROCERY NODE REGISTRATION — Let's Get Groceries Distribution Hub
 * ================================================================
 * Modeled on ServiceNodeRegistration but for grocery distribution.
 * Steps: Vehicle/Storage → Coverage Area → Capacity → Leadership → Commitment
 * Lighter than LMD (no kitchen licensing needed).
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Car,
  Truck,
  Warehouse,
  Home,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Target,
  DollarSign,
  Package,
} from "lucide-react";
import { toast } from "sonner";

const VEHICLE_TYPES = [
  {
    id: "personal_car",
    name: "Personal Vehicle",
    description: "Sedan, SUV, or hatchback for smaller deliveries",
    icon: Car,
    capacity: "10-30 orders/trip",
    storageNeeded: true,
  },
  {
    id: "van",
    name: "Cargo Van",
    description: "Dedicated delivery van for medium-volume runs",
    icon: Truck,
    capacity: "30-80 orders/trip",
    storageNeeded: true,
  },
  {
    id: "box_truck",
    name: "Box Truck",
    description: "Large vehicle for high-volume distribution",
    icon: Truck,
    capacity: "80-200 orders/trip",
    storageNeeded: false,
  },
  {
    id: "warehouse_pickup",
    name: "Warehouse / Pickup Point",
    description: "Stationary hub — customers pick up aggregated orders",
    icon: Warehouse,
    capacity: "Unlimited (pickup-based)",
    storageNeeded: false,
  },
  {
    id: "home_garage",
    name: "Home Garage / Storage",
    description: "Use your garage or spare room as a micro-hub",
    icon: Home,
    capacity: "20-50 orders/week",
    storageNeeded: false,
  },
];

const REGISTRATION_STEPS = [
  { step: 1, title: "Vehicle & Storage", description: "What's your setup?" },
  { step: 2, title: "Coverage Area", description: "Where will you deliver?" },
  { step: 3, title: "Capacity", description: "How much can you handle?" },
  { step: 4, title: "Leadership", description: "Who runs this node?" },
  { step: 5, title: "Commitment", description: "Review & confirm" },
];

interface GroceryFormData {
  vehicleType: string;
  vehicleDescription: string;
  hasRefrigeration: boolean;
  storageAddress: string;
  storageCity: string;
  storageState: string;
  storageZip: string;
  deliveryRadiusMiles: number;
  deliveryZips: string;
  weeklyDeliveryRuns: number;
  ordersPerRun: number;
  availableDays: string[];
  operatorName: string;
  operatorPhone: string;
  operatorEmail: string;
  hasDrivingRecord: boolean;
  notes: string;
  agreeOwnership: boolean;
  agreePlatformRole: boolean;
  agreeTerms: boolean;
}

const INITIAL_FORM: GroceryFormData = {
  vehicleType: "",
  vehicleDescription: "",
  hasRefrigeration: false,
  storageAddress: "",
  storageCity: "",
  storageState: "",
  storageZip: "",
  deliveryRadiusMiles: 10,
  deliveryZips: "",
  weeklyDeliveryRuns: 2,
  ordersPerRun: 20,
  availableDays: [],
  operatorName: "",
  operatorPhone: "",
  operatorEmail: "",
  hasDrivingRecord: true,
  notes: "",
  agreeOwnership: false,
  agreePlatformRole: false,
  agreeTerms: false,
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function GroceryNodeRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<GroceryFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const update = (fields: Partial<GroceryFormData>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!form.vehicleType;
      case 2:
        return !!form.storageCity && !!form.storageState && !!form.storageZip;
      case 3:
        return (
          form.weeklyDeliveryRuns > 0 &&
          form.ordersPerRun > 0 &&
          form.availableDays.length > 0
        );
      case 4:
        return !!form.operatorName && !!form.operatorEmail;
      case 5:
        return (
          form.agreeOwnership && form.agreePlatformRole && form.agreeTerms
        );
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      toast.success(
        "Grocery Node registered! We'll be in touch within 48 hours.",
      );
      setTimeout(() => navigate("/initiatives/lets-get-groceries"), 1500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    update({
      availableDays: form.availableDays.includes(day)
        ? form.availableDays.filter((d) => d !== day)
        : [...form.availableDays, day],
    });
  };

  const weeklyCapacity = form.weeklyDeliveryRuns * form.ordersPerRun;
  const activationThreshold = Math.ceil(weeklyCapacity * 0.5);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/launch/run-a-node")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Initiative Nodes
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Start a Grocery Distribution Node
          </h1>
          <p className="text-muted-foreground">
            Let's Get Groceries — aggregate buying power, deliver savings
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between">
            {REGISTRATION_STEPS.map((s) => (
              <div
                key={s.step}
                className={`text-center flex-1 ${s.step <= currentStep ? "text-green-500" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                    s.step < currentStep
                      ? "bg-green-500 text-white"
                      : s.step === currentStep
                        ? "bg-green-500/20 text-green-500 border-2 border-green-500"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.step < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    s.step
                  )}
                </div>
                <p className="text-xs hidden md:block">{s.title}</p>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {REGISTRATION_STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ── Step 1: Vehicle & Storage ── */}
            {currentStep === 1 && (
              <>
                <p className="text-sm text-muted-foreground">
                  What will you use for distribution? Pick the option closest to
                  your setup.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VEHICLE_TYPES.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => update({ vehicleType: v.id })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.vehicleType === v.id
                          ? "border-green-500 bg-green-500/5"
                          : "border-border hover:border-green-500/50"
                      }`}
                    >
                      <v.icon
                        className={`w-6 h-6 mb-2 ${form.vehicleType === v.id ? "text-green-500" : "text-muted-foreground"}`}
                      />
                      <p className="font-semibold text-sm">{v.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.description}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {v.capacity}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Additional details about your setup (optional)</Label>
                  <Textarea
                    value={form.vehicleDescription}
                    onChange={(e) =>
                      update({ vehicleDescription: e.target.value })
                    }
                    placeholder="e.g., 2020 Honda CR-V with insulated bags, garage available for staging..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.hasRefrigeration}
                    onCheckedChange={(c) =>
                      update({ hasRefrigeration: c === true })
                    }
                  />
                  <Label>I have refrigeration capability (cooler, refrigerated vehicle, etc.)</Label>
                </div>
              </>
            )}

            {/* ── Step 2: Coverage Area ── */}
            {currentStep === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Where will you operate? This helps us match you with local
                  demand.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Hub/Storage Address (optional)</Label>
                    <Input
                      value={form.storageAddress}
                      onChange={(e) =>
                        update({ storageAddress: e.target.value })
                      }
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      value={form.storageCity}
                      onChange={(e) => update({ storageCity: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input
                      value={form.storageState}
                      onChange={(e) => update({ storageState: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code *</Label>
                    <Input
                      value={form.storageZip}
                      onChange={(e) => update({ storageZip: e.target.value })}
                      placeholder="ZIP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Radius (miles)</Label>
                    <Input
                      type="number"
                      value={form.deliveryRadiusMiles}
                      onChange={(e) =>
                        update({
                          deliveryRadiusMiles: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Additional ZIP codes you can serve (comma-separated)</Label>
                  <Input
                    value={form.deliveryZips}
                    onChange={(e) => update({ deliveryZips: e.target.value })}
                    placeholder="37064, 37067, 37069"
                  />
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                  <MapPin className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    We'll use your location and radius to show demand signals —
                    how many people in your area want grocery delivery.
                  </p>
                </div>
              </>
            )}

            {/* ── Step 3: Capacity ── */}
            {currentStep === 3 && (
              <>
                <p className="text-sm text-muted-foreground">
                  How many deliveries can you handle? The 50% pre-sold rule
                  means your node activates when half your capacity is
                  pre-ordered.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delivery runs per week</Label>
                    <Input
                      type="number"
                      value={form.weeklyDeliveryRuns}
                      onChange={(e) =>
                        update({
                          weeklyDeliveryRuns: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Orders per run</Label>
                    <Input
                      type="number"
                      value={form.ordersPerRun}
                      onChange={(e) =>
                        update({ ordersPerRun: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="p-4 bg-card border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weekly capacity</span>
                    <span className="font-bold text-lg">
                      {weeklyCapacity} orders
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Target className="w-4 h-4 text-green-500" /> Activation
                      threshold (50%)
                    </span>
                    <span className="font-bold text-green-500">
                      {activationThreshold} pre-orders
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-amber-500" />{" "}
                      Estimated weekly revenue
                    </span>
                    <span className="font-bold text-amber-500">
                      ${(weeklyCapacity * 8).toLocaleString()}–$
                      {(weeklyCapacity * 15).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available days *</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          form.availableDays.includes(day)
                            ? "bg-green-500 text-white border-green-500"
                            : "border-border text-muted-foreground hover:border-green-500/50"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Step 4: Leadership ── */}
            {currentStep === 4 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Who will operate this node? Remember: this is YOUR project.
                  The platform provides tools at cost + 20%.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Node Operator Name *</Label>
                    <Input
                      value={form.operatorName}
                      onChange={(e) =>
                        update({ operatorName: e.target.value })
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={form.operatorEmail}
                      onChange={(e) =>
                        update({ operatorEmail: e.target.value })
                      }
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={form.operatorPhone}
                      onChange={(e) =>
                        update({ operatorPhone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.hasDrivingRecord}
                    onCheckedChange={(c) =>
                      update({ hasDrivingRecord: c === true })
                    }
                  />
                  <Label>I have a clean driving record</Label>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <Shield className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Node operators are NOT employees. You own your node, set
                    your hours, and keep 83.3% of revenue. Platform provides
                    logistics tools, order aggregation, and payment processing
                    at cost + 20%.
                  </p>
                </div>
              </>
            )}

            {/* ── Step 5: Commitment ── */}
            {currentStep === 5 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Review your registration and confirm.
                </p>
                <div className="space-y-4 p-4 bg-card border rounded-lg">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-medium">
                      {VEHICLE_TYPES.find((v) => v.id === form.vehicleType)
                        ?.name || "—"}
                    </span>
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">
                      {form.storageCity}, {form.storageState} {form.storageZip}
                    </span>
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">
                      {weeklyCapacity} orders/week
                    </span>
                    <span className="text-muted-foreground">Days</span>
                    <span className="font-medium">
                      {form.availableDays.map((d) => d.slice(0, 3)).join(", ") ||
                        "—"}
                    </span>
                    <span className="text-muted-foreground">Operator</span>
                    <span className="font-medium">{form.operatorName}</span>
                    <span className="text-muted-foreground">Activation</span>
                    <span className="font-medium text-green-500">
                      {activationThreshold} pre-orders needed
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={form.agreeOwnership}
                      onCheckedChange={(c) =>
                        update({ agreeOwnership: c === true })
                      }
                    />
                    <Label className="text-sm">
                      I understand this is MY node — I am not an employee of
                      Liana Banyan Corporation.
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={form.agreePlatformRole}
                      onCheckedChange={(c) =>
                        update({ agreePlatformRole: c === true })
                      }
                    />
                    <Label className="text-sm">
                      I understand the platform provides tools at cost + 20%
                      and I keep 83.3% of revenue.
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={form.agreeTerms}
                      onCheckedChange={(c) =>
                        update({ agreeTerms: c === true })
                      }
                    />
                    <Label className="text-sm">
                      I agree to the terms of service and cooperative commerce
                      principles.
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional notes (optional)</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder="Anything else we should know?"
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="bg-green-600 hover:bg-green-500"
            >
              <Package className="w-4 h-4 mr-2" />
              {submitting ? "Registering..." : "Register My Node"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
