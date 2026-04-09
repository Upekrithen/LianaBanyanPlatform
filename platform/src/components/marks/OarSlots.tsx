import { useState } from 'react';
import { SHIP_TEMPLATES, type ShipTemplate, getMemberOarIndex } from '@/data/shipTemplates';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OarSlotsProps {
  templateId: string;
  memberRole: string;
  filledOars?: number;
  onInvite?: () => void;
  onFillAnother?: () => void;
}

export function OarSlots({ templateId, memberRole, filledOars = 1, onInvite, onFillAnother }: OarSlotsProps) {
  const template = SHIP_TEMPLATES.find(t => t.id === templateId) ?? SHIP_TEMPLATES[0];
  const memberOarIdx = getMemberOarIndex(template, memberRole);
  const [expandedOar, setExpandedOar] = useState<number | null>(null);

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[.03] p-5 space-y-5">
      <CanoeVsShip template={template} />

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Oar Slots for {template.name}
        </p>
        {template.oars.map((oar, i) => {
          const isFilled = i === memberOarIdx || i < filledOars;
          const isMe = i === memberOarIdx;
          return (
            <TooltipProvider key={i} delayDuration={300}>
              <div
                className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
                  isMe
                    ? 'bg-green-500/15 border border-green-500/30'
                    : isFilled
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-transparent border border-dashed border-white/10 hover:border-white/20'
                }`}
                onClick={() => setExpandedOar(expandedOar === i ? null : i)}
              >
                <span className="text-xl mt-0.5 shrink-0">
                  {isMe ? '🟢' : isFilled ? '🟡' : '⬜'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {oar.icon} {oar.role}
                      {isMe && <span className="text-green-400 ml-1.5 text-xs font-semibold">← YOU</span>}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {isFilled ? '✓ FILLED' : 'OPEN'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{oar.description}</p>

                  {expandedOar === i && (
                    <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">Solo: <span className="text-foreground font-medium">{oar.soloEarning}</span></span>
                        <span className="text-muted-foreground">Crew: <span className="text-green-400 font-medium">{oar.crewEarning}</span></span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-primary/80 cursor-help underline decoration-dotted">
                            Why more with a crew?
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-xs">{oar.whyMore}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </TooltipProvider>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        When all {template.totalOars} oars are filled, the ship launches<br />
        and everyone may earn 4–8× what they'd earn solo.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="default" size="sm" className="flex-1" onClick={onInvite}>
          Invite Someone to Fill a Slot →
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onFillAnother}>
          Fill Another Slot Yourself →
        </Button>
      </div>
    </div>
  );
}

function CanoeVsShip({ template }: { template: ShipTemplate }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-center">
        <p className="text-lg mb-0.5">{template.soloLabel}</p>
        <p className="text-sm font-semibold text-orange-300">{template.soloTotal}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">(just you)</p>
      </div>
      <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-center">
        <p className="text-lg mb-0.5">{template.crewLabel}</p>
        <p className="text-sm font-semibold text-green-300">{template.crewTotal}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">(each person)</p>
      </div>
    </div>
  );
}
