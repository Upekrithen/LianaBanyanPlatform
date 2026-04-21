import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, AlertTriangle, Users, DollarSign } from "lucide-react";

interface MonthlyNeeds {
  rent?: number;
  utilities?: number;
  food?: number;
  medical?: number;
  transportation?: number;
  other?: number;
}

interface NominationFormData {
  title: string;
  description: string;
  recipientName: string;
  recipientRelationship: string;
  recipientLocation: string;
  medicalSituation: string;
  monthlyNeeds: MonthlyNeeds;
  goalAmount: number;
  verificationContactName: string;
  verificationContactRelationship: string;
  projectLeadName: string;
  projectLeadEmail: string;
  category: string;
  isSelfNomination: boolean;
  acknowledgeLegalTerms: boolean;
}

const RELATIONSHIP_OPTIONS = [
  { value: "self", label: "Myself" },
  { value: "spouse", label: "Spouse/Partner" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "friend", label: "Friend" },
  { value: "neighbor", label: "Neighbor" },
  { value: "coworker", label: "Coworker" },
  { value: "other", label: "Other" },
];

const CATEGORY_OPTIONS = [
  { value: "medical", label: "Medical Crisis" },
  { value: "housing", label: "Housing Emergency" },
  { value: "utilities", label: "Utility Shutoff" },
  { value: "food", label: "Food Insecurity" },
  { value: "transportation", label: "Transportation Need" },
  { value: "other", label: "Other Crisis" },
];

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50) + "-" + Date.now().toString(36);
};

export function SwoopNominationForm() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<NominationFormData>({
    title: "",
    description: "",
    recipientName: "",
    recipientRelationship: "",
    recipientLocation: "",
    medicalSituation: "",
    monthlyNeeds: {},
    goalAmount: 0,
    verificationContactName: "",
    verificationContactRelationship: "",
    projectLeadName: profile?.display_name || "",
    projectLeadEmail: user?.email || "",
    category: "medical",
    isSelfNomination: false,
    acknowledgeLegalTerms: false,
  });

  const submitNomination = useMutation({
    mutationFn: async (data: NominationFormData) => {
      if (!user) throw new Error("Must be logged in to nominate");

      const slug = generateSlug(data.title);

      const { data: project, error } = await supabase
        .from("swoop_projects")
        .insert({
          title: data.title,
          slug,
          description: data.description,
          short_description: data.description.substring(0, 200),
          recipient_name: data.recipientName,
          recipient_relationship: data.recipientRelationship,
          recipient_location: data.recipientLocation,
          medical_situation: data.medicalSituation,
          monthly_needs: data.monthlyNeeds,
          goal_amount: data.goalAmount,
          verification_contact_name: data.verificationContactName,
          verification_contact_relationship: data.verificationContactRelationship,
          project_lead_id: user.id,
          project_lead_name: data.projectLeadName,
          project_lead_email: data.projectLeadEmail,
          nominator_id: user.id,
          nominator_name: profile?.display_name || "Anonymous",
          category: data.category,
          status: "nomination",
        })
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: () => {
      toast.success("Nomination submitted! It will be reviewed before voting begins.");
      queryClient.invalidateQueries({ queryKey: ["swoop-projects"] });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to submit nomination: ${error.message}`);
    },
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      title: "",
      description: "",
      recipientName: "",
      recipientRelationship: "",
      recipientLocation: "",
      medicalSituation: "",
      monthlyNeeds: {},
      goalAmount: 0,
      verificationContactName: "",
      verificationContactRelationship: "",
      projectLeadName: profile?.display_name || "",
      projectLeadEmail: user?.email || "",
      category: "medical",
      isSelfNomination: false,
      acknowledgeLegalTerms: false,
    });
  };

  const updateMonthlyNeeds = (key: keyof MonthlyNeeds, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      monthlyNeeds: { ...prev.monthlyNeeds, [key]: numValue },
    }));
  };

  const calculateTotalMonthly = () => {
    return Object.values(formData.monthlyNeeds).reduce((sum, val) => sum + (val || 0), 0);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.category && formData.recipientRelationship;
      case 2:
        return formData.recipientName && formData.recipientLocation && formData.medicalSituation;
      case 3:
        return formData.goalAmount > 0;
      case 4:
        return formData.verificationContactName && formData.verificationContactRelationship;
      case 5:
        return formData.acknowledgeLegalTerms;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!formData.acknowledgeLegalTerms) {
      toast.error("Please acknowledge the legal terms");
      return;
    }
    submitNomination.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-rose-600 hover:bg-rose-700">
          <Heart className="w-4 h-4 mr-2" />
          Nominate Someone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Do The Swoop - Nominate for Support
          </DialogTitle>
          <DialogDescription>
            Step {step} of 5: {
              step === 1 ? "Basic Information" :
              step === 2 ? "Recipient Details" :
              step === 3 ? "Financial Needs" :
              step === 4 ? "Verification Contact" :
              "Review & Submit"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded ${
                s <= step ? "bg-rose-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Help the Johnson Family"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="relationship">Your Relationship to Recipient *</Label>
              <Select
                value={formData.recipientRelationship}
                onValueChange={(value) => setFormData({
                  ...formData,
                  recipientRelationship: value,
                  isSelfNomination: value === "self"
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Brief Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the situation and why support is needed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Step 2: Recipient Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                placeholder="Full name of person receiving support"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be displayed publicly
              </p>
            </div>

            <div>
              <Label htmlFor="recipientLocation">Location *</Label>
              <Input
                id="recipientLocation"
                placeholder="City, State (e.g., Nashville, TN)"
                value={formData.recipientLocation}
                onChange={(e) => setFormData({ ...formData, recipientLocation: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                City and state only - no full address
              </p>
            </div>

            <div>
              <Label htmlFor="medicalSituation">Situation Description *</Label>
              <Textarea
                id="medicalSituation"
                placeholder="Describe the crisis situation (medical diagnosis, emergency, etc.)..."
                value={formData.medicalSituation}
                onChange={(e) => setFormData({ ...formData, medicalSituation: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific but dignified. This helps voters understand the need.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Financial Needs */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Monthly Expenses</CardTitle>
                <CardDescription>
                  Estimate monthly costs that need coverage
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent">Rent/Mortgage</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="rent"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={formData.monthlyNeeds.rent || ""}
                      onChange={(e) => updateMonthlyNeeds("rent", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="utilities">Utilities</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="utilities"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={formData.monthlyNeeds.utilities || ""}
                      onChange={(e) => updateMonthlyNeeds("utilities", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="food">Food</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="food"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={formData.monthlyNeeds.food || ""}
                      onChange={(e) => updateMonthlyNeeds("food", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medical">Medical</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="medical"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={formData.monthlyNeeds.medical || ""}
                      onChange={(e) => updateMonthlyNeeds("medical", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="transportation">Transportation</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="transportation"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={formData.monthlyNeeds.transportation || ""}
                      onChange={(e) => updateMonthlyNeeds("transportation", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="other">Other</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="other"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={formData.monthlyNeeds.other || ""}
                      onChange={(e) => updateMonthlyNeeds("other", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Monthly Total:</span>
                <span className="text-xl font-bold">${calculateTotalMonthly().toLocaleString()}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="goalAmount">Fundraising Goal *</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="goalAmount"
                  type="number"
                  className="pl-8"
                  placeholder="Total amount needed"
                  value={formData.goalAmount || ""}
                  onChange={(e) => setFormData({ ...formData, goalAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Suggested: 3-6 months of expenses (${(calculateTotalMonthly() * 3).toLocaleString()} - ${(calculateTotalMonthly() * 6).toLocaleString()})
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Verification Contact */}
        {step === 4 && (
          <div className="space-y-4">
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Verification Contact
                </CardTitle>
                <CardDescription>
                  We'll contact this person to verify the situation before funds can be disbursed.
                  This protects everyone involved.
                </CardDescription>
              </CardHeader>
            </Card>

            <div>
              <Label htmlFor="verificationContactName">Contact Name *</Label>
              <Input
                id="verificationContactName"
                placeholder="Name of person who can verify"
                value={formData.verificationContactName}
                onChange={(e) => setFormData({ ...formData, verificationContactName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="verificationContactRelationship">Relationship to Recipient *</Label>
              <Select
                value={formData.verificationContactRelationship}
                onValueChange={(value) => setFormData({ ...formData, verificationContactRelationship: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse/Partner</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Adult Child</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="medical_provider">Medical Provider</SelectItem>
                  <SelectItem value="social_worker">Social Worker</SelectItem>
                  <SelectItem value="clergy">Clergy/Religious Leader</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Project Lead Information</h4>
              <p className="text-sm text-muted-foreground mb-4">
                The project lead manages fund disbursement. This can be you or someone else.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectLeadName">Project Lead Name</Label>
                  <Input
                    id="projectLeadName"
                    value={formData.projectLeadName}
                    onChange={(e) => setFormData({ ...formData, projectLeadName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="projectLeadEmail">Project Lead Email</Label>
                  <Input
                    id="projectLeadEmail"
                    type="email"
                    value={formData.projectLeadEmail}
                    onChange={(e) => setFormData({ ...formData, projectLeadEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Review Your Nomination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium">{formData.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{formData.recipientLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goal:</span>
                  <span className="font-medium">${formData.goalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{formData.category}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Legal Notice</p>
                    <p className="text-amber-700 mt-1">
                      Liana Banyan Corporation acts solely as a payment processor for Do The Swoop projects.
                      All funds are held in project-specific accounts controlled by the designated Project Lead.
                      LB does not own, manage, or make decisions about fund allocation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="acknowledgeLegalTerms"
                checked={formData.acknowledgeLegalTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acknowledgeLegalTerms: checked as boolean })
                }
              />
              <label
                htmlFor="acknowledgeLegalTerms"
                className="text-sm leading-tight cursor-pointer"
              >
                I understand that this nomination will be reviewed before voting begins,
                and that verification is required before any funds can be disbursed.
                I confirm that the information provided is accurate to the best of my knowledge.
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitNomination.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {submitNomination.isPending ? "Submitting..." : "Submit Nomination"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SwoopNominationForm;
