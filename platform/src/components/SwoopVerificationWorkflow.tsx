import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  User,
  FileText,
  AlertTriangle,
  Shield,
  UserCheck,
  Stethoscope,
} from "lucide-react";

interface SwoopProject {
  id: string;
  title: string;
  recipient_name: string;
  recipient_location: string;
  medical_situation: string;
  category: string;
  verification_status: string;
  verification_contact_name: string;
  verification_contact_relationship: string;
  project_lead_name: string;
  goal_amount: number;
}

interface VerificationStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
  category?: string[];
}

const VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: "contact_reached",
    label: "Contact Reached",
    description: "Verification contact has been reached by phone or email",
    icon: Phone,
    required: true,
  },
  {
    id: "identity_confirmed",
    label: "Identity Confirmed",
    description: "Recipient's identity has been confirmed",
    icon: User,
    required: true,
  },
  {
    id: "situation_verified",
    label: "Situation Verified",
    description: "The crisis situation has been verified as described",
    icon: FileText,
    required: true,
  },
  {
    id: "medical_verification",
    label: "Medical Verification",
    description: "Medical provider has confirmed the condition (health-related only)",
    icon: Stethoscope,
    required: false,
    category: ["medical"],
  },
  {
    id: "project_lead_verified",
    label: "Project Lead Verified",
    description: "Project lead identity and capability confirmed",
    icon: UserCheck,
    required: true,
  },
  {
    id: "consent_obtained",
    label: "Consent Obtained",
    description: "Family has consented to receiving community support",
    icon: Shield,
    required: true,
  },
];

interface SwoopVerificationWorkflowProps {
  project: SwoopProject;
  isAdmin?: boolean;
  onVerificationComplete?: () => void;
}

export function SwoopVerificationWorkflow({
  project,
  isAdmin = false,
  onVerificationComplete,
}: SwoopVerificationWorkflowProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [contactMethod, setContactMethod] = useState<"phone" | "email" | "video">("phone");
  const [contactDate, setContactDate] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const applicableSteps = VERIFICATION_STEPS.filter(
    (step) => !step.category || step.category.includes(project.category)
  );

  const requiredSteps = applicableSteps.filter((step) => step.required);
  const completedRequired = requiredSteps.filter((step) =>
    completedSteps.includes(step.id)
  ).length;
  const progress = (completedRequired / requiredSteps.length) * 100;

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const canApprove = requiredSteps.every((step) => completedSteps.includes(step.id));

  const updateVerification = useMutation({
    mutationFn: async (status: "verified" | "rejected") => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("swoop_projects")
        .update({
          verification_status: status,
          verification_date: new Date().toISOString(),
          verified_by: user.id,
          verification_notes: status === "rejected" ? rejectionReason : verificationNotes,
          verification_contact_reached: completedSteps.includes("contact_reached"),
          status: status === "verified" ? "active" : "cancelled",
        })
        .eq("id", project.id);

      if (error) throw error;

      // Log the verification action
      await supabase.from("swoop_project_updates").insert({
        project_id: project.id,
        author_id: user.id,
        author_name: "Verification Team",
        author_role: "lb_admin",
        update_type: status === "verified" ? "milestone" : "closure",
        title: status === "verified" ? "Project Verified" : "Verification Rejected",
        content:
          status === "verified"
            ? `Project has been verified and is now active for donations. Verification completed via ${contactMethod}.`
            : `Verification was not successful. Reason: ${rejectionReason}`,
        is_public: true,
      });
    },
    onSuccess: (_, status) => {
      toast.success(
        status === "verified"
          ? "Project verified and activated!"
          : "Project verification rejected"
      );
      queryClient.invalidateQueries({ queryKey: ["swoop-project"] });
      setVerificationDialogOpen(false);
      onVerificationComplete?.();
    },
    onError: (error) => {
      toast.error(`Verification failed: ${error.message}`);
    },
  });

  const getStatusBadge = () => {
    switch (project.verification_status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "in_review":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Review
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Status
              </CardTitle>
              <CardDescription>
                All projects must be verified before funds can be disbursed
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verification Contact Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Verification Contact</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium">{project.verification_contact_name || "Not provided"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Relationship:</span>{" "}
                <span className="font-medium capitalize">
                  {project.verification_contact_relationship?.replace("_", " ") || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* What We Verify */}
          <div className="space-y-2">
            <h4 className="font-medium">What We Verify</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Person exists
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Situation exists
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Family consents
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Project lead is real
              </div>
            </div>
          </div>

          {/* What We Don't Verify */}
          <div className="space-y-2">
            <h4 className="font-medium">What We Don't Verify</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Medical records
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Financial history
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Prognosis
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Credit score
              </div>
            </div>
          </div>

          {/* Admin Verification Button */}
          {isAdmin && project.verification_status === "pending" && (
            <Button
              onClick={() => setVerificationDialogOpen(true)}
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Begin Verification Process
            </Button>
          )}

          {project.verification_status === "in_review" && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                This project is currently being reviewed by our verification team.
                We'll contact the verification contact to confirm the situation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog (Admin Only) */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Workflow</DialogTitle>
            <DialogDescription>
              Complete the verification checklist for: {project.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Verification Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Project Summary */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Recipient:</span>{" "}
                    <span className="font-medium">{project.recipient_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>{" "}
                    <span className="font-medium">{project.recipient_location}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span className="font-medium capitalize">{project.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Goal:</span>{" "}
                    <span className="font-medium">${project.goal_amount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Steps */}
            <div className="space-y-3">
              <h4 className="font-medium">Verification Checklist</h4>
              {applicableSteps.map((step) => {
                const StepIcon = step.icon;
                const isCompleted = completedSteps.includes(step.id);

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      isCompleted ? "bg-green-50 border-green-200" : "bg-white"
                    }`}
                  >
                    <Checkbox
                      id={step.id}
                      checked={isCompleted}
                      onCheckedChange={() => toggleStep(step.id)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={step.id}
                        className="flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <StepIcon className="w-4 h-4" />
                        {step.label}
                        {step.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact Method */}
            <div>
              <Label>Contact Method Used</Label>
              <Select value={contactMethod} onValueChange={(v: any) => setContactMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contact Date */}
            <div>
              <Label>Date of Contact</Label>
              <Input
                type="date"
                value={contactDate}
                onChange={(e) => setContactDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Verification Notes</Label>
              <Textarea
                placeholder="Document any relevant details from the verification process..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Rejection Reason (if rejecting) */}
            <div>
              <Label>Rejection Reason (if applicable)</Label>
              <Textarea
                placeholder="If rejecting, explain why verification failed..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>

            {/* Warning */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Important</p>
                    <p>
                      Verification approval allows this project to receive donations.
                      Ensure all required steps are genuinely completed before approving.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setVerificationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => updateVerification.mutate("rejected")}
                disabled={!rejectionReason || updateVerification.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => updateVerification.mutate("verified")}
                disabled={!canApprove || updateVerification.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {updateVerification.isPending ? "Processing..." : "Approve & Activate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SwoopVerificationWorkflow;
