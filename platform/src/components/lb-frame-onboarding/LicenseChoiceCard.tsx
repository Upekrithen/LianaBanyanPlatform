/**
 * LicenseChoiceCard — AGPL community door vs Apache 2.0 big-guy door picker
 * Per BRIDLE v11 Rule 5 + #2314 dual-license canon.
 * "Same 60/20/10/10 distribution. Same percentages, different doors."
 * data-xray-id: license-choice-card
 */

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LicenseDoor = "AGPL" | "Apache";

interface LicenseChoiceCardProps {
  value: LicenseDoor;
  onChange: (v: LicenseDoor) => void;
}

const DOORS = [
  {
    id: "AGPL" as LicenseDoor,
    icon: Users,
    title: "Community Door",
    subtitle: "LB Corp — AGPL v3",
    description:
      "For makers, builders, and cooperators. You keep your brand, customers, and IP. " +
      "Any modifications to the substrate must remain open-source.",
    highlight: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: "Apache" as LicenseDoor,
    icon: Building2,
    title: "Big-Guy Door",
    subtitle: "Upekrithen LLC — Apache 2.0",
    description:
      "For enterprises, chip makers, and robotics manufacturers. Permissive license — " +
      "integrate into proprietary products. Same 83.3% creator / Cost+20% cooperative terms.",
    highlight: "text-blue-600 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
] as const;

export function LicenseChoiceCard({ value, onChange }: LicenseChoiceCardProps) {
  return (
    <div className="space-y-2" data-xray-id="license-choice-card">
      <p className="text-sm font-medium">Which door fits them?</p>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as LicenseDoor)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {DOORS.map((door) => {
          const Icon = door.icon;
          const selected = value === door.id;
          return (
            <Label
              key={door.id}
              htmlFor={`license-${door.id}`}
              className="cursor-pointer"
            >
              <Card
                className={cn(
                  "transition-all",
                  selected
                    ? `${door.border} ${door.bg} ring-2 ring-offset-1`
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={door.id} id={`license-${door.id}`} className="sr-only" />
                    <Icon className={cn("w-4 h-4", selected ? door.highlight : "text-muted-foreground")} />
                    <div>
                      <p className={cn("text-sm font-semibold leading-none", selected ? door.highlight : "")}>
                        {door.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{door.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {door.description}
                  </p>
                </CardContent>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>
      <p className="text-xs text-muted-foreground text-center">
        Both doors: same cooperative terms, same participation allocation, different IP obligations.
      </p>
    </div>
  );
}
