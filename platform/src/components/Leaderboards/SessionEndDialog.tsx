import React from "react";
import { useLogbook } from "@/components/Logbook";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Key, Flame, FileText, MapPin, Trophy, Feather, Crown, DollarSign } from "lucide-react";

interface SessionEndDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRecord?: {
    category: string;
    previousValue: number;
    previousHolder: string;
    featherNumber: number;
  };
  onEndSession: () => void;
  onPurchaseSession: () => void;
  onBecomeMember: () => void;
}

export function SessionEndDialog({
  open,
  onOpenChange,
  newRecord,
  onEndSession,
  onPurchaseSession,
  onBecomeMember,
}: SessionEndDialogProps) {
  const { session, sessionStats, isMember } = useLogbook();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getPurchasePrice = (durationMinutes: number) => {
    if (durationMinutes < 60) return 0.5;
    if (durationMinutes < 180) return 1.0;
    if (durationMinutes < 360) return 1.5;
    return 2.5;
  };

  const durationMinutes = Math.floor(sessionStats.duration / 60);
  const purchasePrice = getPurchasePrice(durationMinutes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Session Complete: {formatDuration(sessionStats.duration)}
          </DialogTitle>
          <DialogDescription>
            Your Ghost World session has ended
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">You collected:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-yellow-400" />
                <span>Golden Keys: {session.collected.filter(i => i.type === "golden_key").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span>Candles: {session.candlesEarned.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span>Friend Words: {session.wordsCollected}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span>Areas: {sessionStats.areasCount}</span>
              </div>
            </div>
          </div>

          {newRecord && (
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span className="font-bold text-amber-200">NEW RECORD!</span>
              </div>
              <p className="text-sm text-amber-200/80">
                {newRecord.category} ({formatDuration(sessionStats.duration)} category)
              </p>
              <p className="text-xs text-amber-200/60 mt-1">
                Previous: {newRecord.previousValue} by @{newRecord.previousHolder}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Feather className="h-4 w-4 text-amber-400" />
                <span className="text-sm">You earned: Crow Feather #{newRecord.featherNumber}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={onEndSession}
              className="w-full"
            >
              End Session
              <span className="ml-2 text-xs text-muted-foreground">(lose half)</span>
            </Button>

            {!isMember && (
              <>
                <Button
                  onClick={onPurchaseSession}
                  className="w-full bg-green-600 hover:bg-green-500"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Purchase & Keep - ${purchasePrice.toFixed(2)}
                  <span className="ml-2 text-xs">(keep everything)</span>
                </Button>

                <Button
                  onClick={onBecomeMember}
                  className="w-full bg-amber-600 hover:bg-amber-500"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Become a Member - $5/year
                  <span className="ml-2 text-xs">(keep everything + all future sessions)</span>
                </Button>
              </>
            )}
          </div>

          {!isMember && (
            <p className="text-center text-xs text-muted-foreground">
              Crow Feathers are permanent — even ghosts keep their records
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SessionEndDialog;
