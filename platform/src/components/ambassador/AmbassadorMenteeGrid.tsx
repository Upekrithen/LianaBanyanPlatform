/**
 * AMBASSADOR MENTEE GRID — Level 2+ view: 10 mentee slots (V2).
 * data-xray-id: ambassador-mentee-grid
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AmbassadorLevelBadge } from "@/components/ambassador/AmbassadorLevelBadge";
import { cn } from "@/lib/utils";

export interface MenteeSlot {
  id: string;
  mentee_display_name: string;
  mentee_level: number;
  mentee_level_title: string | null;
  slot_number: number;
  status: string;
  onboarded_count?: number;
  last_active?: string | null;
}

export interface AmbassadorMenteeGridProps {
  level: number;
  slots: MenteeSlot[];
  onViewDashboard?: (menteeId: string) => void;
  onAssignMentee?: (slotNumber: number) => void;
  className?: string;
}

export function AmbassadorMenteeGrid({
  level,
  slots,
  onViewDashboard,
  onAssignMentee,
  className,
}: AmbassadorMenteeGridProps) {
  const levelLabel = level === 2 ? "Lamplighter" : level === 3 ? "Beacon Keeper" : level === 4 ? "Lighthouse Warden" : "Mentor";
  const slotsByNumber = Array.from({ length: 10 }, (_, i) => slots.find((s) => s.slot_number === i + 1));

  return (
    <div className={cn("space-y-3", className)} data-xray-id="ambassador-mentee-grid">
      <h2 className="font-semibold">Your mentees (Level {level} {levelLabel} view)</h2>
      <ul className="space-y-2">
        {slotsByNumber.map((slot, idx) => {
          const slotNum = idx + 1;
          const s = slot;
          return (
            <Card key={slotNum}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">Slot {slotNum}: </span>
                    {s ? (
                      <>
                        <span>{s.mentee_display_name}</span>
                        <AmbassadorLevelBadge level={s.mentee_level} levelTitle={s.mentee_level_title} className="ml-2" />
                        {s.onboarded_count != null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Progress: {s.onboarded_count}/10 onboarded
                            {s.last_active && ` | Last active: ${s.last_active}`}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Empty</span>
                    )}
                  </div>
                  {s ? (
                    onViewDashboard && (
                      <Button size="sm" variant="outline" onClick={() => onViewDashboard(s.id)}>
                        View their dashboard
                      </Button>
                    )
                  ) : (
                    onAssignMentee && (
                      <Button size="sm" variant="outline" onClick={() => onAssignMentee(slotNum)}>
                        Assign mentee
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </ul>
    </div>
  );
}
