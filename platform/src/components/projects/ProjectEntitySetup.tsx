/**
 * ProjectEntitySetup — Entity formation step in the project creation flow.
 * Collects business entity type, details, and confirmation before project launch.
 * Innovation #2035
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Building2,
  Landmark,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  Shield,
} from "lucide-react";

type EntityType = "sole_prop" | "llc" | "corporation";

interface EntityData {
  entityType: EntityType;
  entityName: string;
  stateOfFormation: string;
  taxId: string;
}

interface ProjectEntitySetupProps {
  onComplete: (data: EntityData) => void;
  onBack?: () => void;
  initialData?: Partial<EntityData>;
}

const ENTITY_OPTIONS: {
  id: EntityType;
  label: string;
  icon: typeof User;
  recommended?: string;
  pros: string[];
  cons: string[];
}[] = [
  {
    id: "sole_prop",
    label: "Sole Proprietorship",
    icon: User,
    recommended: "Recommended to start",
    pros: ["No filing required", "Simplest tax structure", "Start immediately"],
    cons: ["Personal liability", "Harder to raise capital"],
  },
  {
    id: "llc",
    label: "LLC",
    icon: Building2,
    recommended: "Recommended for growth",
    pros: ["Limited liability", "Tax flexibility", "Professional credibility"],
    cons: ["Filing fees (~$100)", "Annual reports in most states"],
  },
  {
    id: "corporation",
    label: "Corporation",
    icon: Landmark,
    pros: ["Strongest liability protection", "Easiest to raise funding", "Stock issuance"],
    cons: ["Complex tax structure", "More paperwork", "Double taxation risk"],
  },
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];

export function ProjectEntitySetup({ onComplete, onBack, initialData }: ProjectEntitySetupProps) {
  const [step, setStep] = useState(1);
  const [entityType, setEntityType] = useState<EntityType>(initialData?.entityType ?? "sole_prop");
  const [entityName, setEntityName] = useState(initialData?.entityName ?? "");
  const [stateOfFormation, setStateOfFormation] = useState(initialData?.stateOfFormation ?? "Wyoming");
  const [taxId, setTaxId] = useState(initialData?.taxId ?? "");

  const selectedEntity = ENTITY_OPTIONS.find((e) => e.id === entityType)!;

  const handleConfirm = () => {
    onComplete({ entityType, entityName, stateOfFormation, taxId });
  };

  return (
    <div className="space-y-6">

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              s === step ? "bg-primary text-primary-foreground" :
              s < step ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
            }`}>
              {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-emerald-500" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Entity Type */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold">Choose Your Entity Type</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Not sure? Start with Sole Proprietorship — you can upgrade anytime.
            </p>
          </div>

          <div className="grid gap-4">
            {ENTITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = entityType === opt.id;
              return (
                <Card
                  key={opt.id}
                  className={`cursor-pointer transition-all ${
                    selected ? "border-primary ring-1 ring-primary/30" : "border-border/50 hover:border-border"
                  }`}
                  onClick={() => setEntityType(opt.id)}
                >
                  <CardContent className="p-5 flex gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${selected ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-6 w-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{opt.label}</h4>
                        {opt.recommended && (
                          <Badge variant="secondary" className="text-[10px]">{opt.recommended}</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                        <div>
                          {opt.pros.map((p) => (
                            <p key={p} className="text-emerald-600 dark:text-emerald-400">✓ {p}</p>
                          ))}
                        </div>
                        <div>
                          {opt.cons.map((c) => (
                            <p key={c} className="text-muted-foreground">· {c}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <Button className="flex-1 gap-1" onClick={() => setStep(2)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Entity Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold">Entity Details</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {entityType === "sole_prop"
                ? "For sole proprietorships, you can use your personal name."
                : "Enter the legal name of your business entity."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>{entityType === "sole_prop" ? "Business or Personal Name" : "Entity Legal Name"}</Label>
              <Input
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder={entityType === "sole_prop" ? "Jane Smith" : "Smith Manufacturing LLC"}
                className="mt-1"
              />
            </div>

            {entityType !== "sole_prop" && (
              <div>
                <Label>State of Formation</Label>
                <Select value={stateOfFormation} onValueChange={setStateOfFormation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Wyoming is recommended for LLC formation — low fees, strong privacy.
                </p>
              </div>
            )}

            <div>
              <Label>EIN or SSN</Label>
              <Input
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="XX-XXXXXXX"
                className="mt-1"
                type="password"
              />
              <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Required for 1099 contractor payments. Never shared publicly. Encrypted at rest.</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1 gap-1"
              onClick={() => setStep(3)}
              disabled={!entityName.trim()}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold">Confirm Your Entity</h3>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <selectedEntity.icon className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-bold text-lg">{entityName || "—"}</p>
                  <p className="text-sm text-muted-foreground">{selectedEntity.label}</p>
                </div>
              </div>
              {entityType !== "sole_prop" && (
                <p className="text-sm text-muted-foreground">
                  State of formation: <span className="font-medium text-foreground">{stateOfFormation}</span>
                </p>
              )}
              <p className="text-sm">
                Your project will operate through <span className="font-semibold">{entityName}</span>{" "}
                (<span className="text-muted-foreground">{selectedEntity.label}</span>).
              </p>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              You can change your entity type later. Many members start as sole proprietors
              and upgrade to LLC after their first few sales. See the Business Formation Guide for details.
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button className="flex-1 gap-1" onClick={handleConfirm}>
              <CheckCircle2 className="h-4 w-4" /> Confirm & Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
