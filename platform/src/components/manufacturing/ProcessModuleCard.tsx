/**
 * ProcessModuleCard — Single manufacturing process module display
 * Process name, type icon, skill level, equipment (expandable), crew roster, Pioneer badge, role claim buttons.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Wrench, Star, User } from "lucide-react";

export interface ProcessModuleCardProps {
  id: string;
  process_name: string;
  process_type: string;
  description?: string | null;
  equipment_needed?: string[] | null;
  skill_level: string;
  primaryCount: number;
  secondaryCount: number;
  backupCount: number;
  maxPrimary: number;
  maxSecondary: number;
  hasPioneer: boolean;
  crewNames?: { role: string; name: string }[];
  onClaimPrimary?: () => void;
  onClaimSecondary?: () => void;
  onClaimBackup?: () => void;
  canClaim?: boolean;
  seekingSpices?: Array<{ emoji: string; label: string; domain: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  additive: "Additive",
  subtractive: "Subtractive",
  casting: "Casting",
  molding: "Molding",
  assembly: "Assembly",
  finishing: "Finishing",
  other: "Other",
};

export function ProcessModuleCard({
  process_name,
  process_type,
  description,
  equipment_needed = [],
  skill_level,
  primaryCount,
  secondaryCount,
  backupCount,
  maxPrimary,
  maxSecondary,
  hasPioneer,
  crewNames = [],
  onClaimPrimary,
  onClaimSecondary,
  onClaimBackup,
  canClaim = true,
  seekingSpices = [],
}: ProcessModuleCardProps) {
  const [equipmentOpen, setEquipmentOpen] = useState(false);

  const primaryOpen = primaryCount < maxPrimary;
  const secondaryOpen = secondaryCount < maxSecondary;

  return (
    <Card data-xray-id="process-module-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              {process_name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{TYPE_LABELS[process_type] ?? process_type}</Badge>
              <Badge variant="secondary">{skill_level}</Badge>
              {hasPioneer && (
                <Badge className="bg-amber-500/20 text-amber-700 gap-1">
                  <Star className="w-3 h-3" />
                  Pioneer
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Primary: {primaryCount}/{maxPrimary} {primaryOpen && <span className="text-green-600">Open</span>}</p>
            <p>Secondary: {secondaryCount}/{maxSecondary} {secondaryOpen && <span className="text-green-600">Open</span>}</p>
            <p>Backup: {backupCount}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {description && <p className="text-sm text-muted-foreground">{description}</p>}

        {seekingSpices.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Seeking{" "}
            {seekingSpices.map((spice, index) => (
              <span key={`${spice.label}-${index}`}>
                {index > 0 ? index === seekingSpices.length - 1 ? " and " : ", " : ""}
                <span className="font-medium text-foreground">{spice.emoji} {spice.label}</span>
                <span className="text-xs"> ({spice.domain})</span>
              </span>
            ))}
            .
          </p>
        )}

        {equipment_needed && equipment_needed.length > 0 && (
          <Collapsible open={equipmentOpen} onOpenChange={setEquipmentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                Equipment ({equipment_needed.length})
                {equipmentOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                {equipment_needed.map((eq, i) => (
                  <li key={i}>{eq}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {crewNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {crewNames.slice(0, 6).map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                <User className="w-3 h-3" />
                {c.name}
                <Badge variant="outline" className="text-[10px]">{c.role}</Badge>
              </span>
            ))}
          </div>
        )}

        {canClaim && (onClaimPrimary || onClaimSecondary || onClaimBackup) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {primaryOpen && onClaimPrimary && (
              <Button size="sm" onClick={onClaimPrimary}>Claim Primary</Button>
            )}
            {secondaryOpen && onClaimSecondary && (
              <Button size="sm" variant="outline" onClick={onClaimSecondary}>Claim Secondary</Button>
            )}
            {onClaimBackup && (
              <Button size="sm" variant="ghost" onClick={onClaimBackup}>Sign Up as Backup</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
