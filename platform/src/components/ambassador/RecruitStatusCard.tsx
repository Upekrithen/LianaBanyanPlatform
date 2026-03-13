/**
 * RECRUIT STATUS CARD — One of the Ambassador's 10 slots: name, status, progress, actions.
 * data-xray-id: recruit-status-card
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserPlus, Play, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["invited", "walkthrough_started", "signed_up", "crew_joined", "first_backing", "completed", "ambassador_ready", "declined"];
const PROGRESS_MAP: Record<string, number> = {
  invited: 10,
  walkthrough_started: 25,
  signed_up: 40,
  crew_joined: 55,
  first_backing: 75,
  completed: 100,
  ambassador_ready: 100,
  declined: 0,
};

export interface RecruitStatusCardProps {
  slotNumber: number;
  recruitName: string | null;
  recruitContact: string | null;
  status: string;
  notes: string | null;
  recruitId: string | null;
  onAddRecruit?: (slot: number) => void;
  onStartWalkthrough?: (recruitId: string) => void;
  onViewStatus?: (recruitId: string) => void;
}

export function RecruitStatusCard({
  slotNumber,
  recruitName,
  recruitContact,
  status,
  notes,
  recruitId,
  onAddRecruit,
  onStartWalkthrough,
  onViewStatus,
}: RecruitStatusCardProps) {
  const isEmpty = !recruitId && !recruitName;
  const progress = PROGRESS_MAP[status] ?? 0;
  const statusLabel = status.replace(/_/g, " ");

  return (
    <Card className="border-2 border-border" data-xray-id="recruit-status-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              Slot {slotNumber}: {isEmpty ? "Open" : recruitName || "Unnamed"}
            </p>
            {!isEmpty && (
              <p className="text-sm text-muted-foreground mt-0.5">{statusLabel}</p>
            )}
          </div>
          {!isEmpty && (
            <Progress value={progress} className="h-2 w-16 shrink-0" />
          )}
        </div>
        {notes && (
          <p className="text-xs text-muted-foreground mt-2 italic">Notes: {notes}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {isEmpty ? (
            onAddRecruit && (
              <Button size="sm" onClick={() => onAddRecruit(slotNumber)} data-xray-id="ambassador-add-recruit-btn">
                <UserPlus className="w-4 h-4 mr-1" /> Add recruit
              </Button>
            )
          ) : (
            <>
              {status === "invited" && onStartWalkthrough && recruitId && (
                <Button size="sm" variant="default" onClick={() => onStartWalkthrough(recruitId)} data-xray-id="ambassador-start-walkthrough-btn">
                  <Play className="w-4 h-4 mr-1" /> Start walkthrough
                </Button>
              )}
              {(status === "walkthrough_started" || status === "signed_up" || status === "crew_joined" || status === "first_backing") && onStartWalkthrough && recruitId && (
                <Button size="sm" variant="outline" onClick={() => onStartWalkthrough(recruitId)}>
                  Continue walkthrough
                </Button>
              )}
              {onViewStatus && recruitId && (
                <Button size="sm" variant="outline" onClick={() => onViewStatus(recruitId)}>
                  <Eye className="w-4 h-4 mr-1" /> View status
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
