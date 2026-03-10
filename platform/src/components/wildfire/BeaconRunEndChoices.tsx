/**
 * BEACON RUN END CHOICES
 * =======================
 * Four-choice component displayed when a Wildfire Beacon Run completes.
 *
 * Options:
 * 1. Pick a new interest — return to Crow's Nest
 * 2. Go deeper — progressive depth / academic papers
 * 3. Keep on same track — next beacon run in sequence
 * 4. Register / Take action — begin engagement flow
 *
 * Innovation #1554: Interactive Showcase Simulation
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  BookOpen,
  ArrowRight,
  UserPlus,
  Sparkles,
  Trophy,
  Clock,
} from "lucide-react";

interface BeaconRunEndChoicesProps {
  runName: string;
  runCategory: string;
  interestKey?: string;
  elapsedSeconds: number;
  isCustomized: boolean;
  onPickNewInterest: () => void;
  onGoDeeper: () => void;
  onContinueTrack: () => void;
  onRegister: () => void;
  hasNextRun?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function BeaconRunEndChoices({
  runName,
  runCategory,
  interestKey,
  elapsedSeconds,
  isCustomized,
  onPickNewInterest,
  onGoDeeper,
  onContinueTrack,
  onRegister,
  hasNextRun = true,
}: BeaconRunEndChoicesProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Completion Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mx-auto">
          <Trophy className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold">Run Complete!</h2>
        <p className="text-muted-foreground">
          You finished the <strong>{runName}</strong> beacon run
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(elapsedSeconds)}
          </Badge>
          {isCustomized && (
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              Custom Numbers Applied
            </Badge>
          )}
        </div>
      </div>

      {/* Four Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Pick New Interest */}
        <button
          onClick={onPickNewInterest}
          className="group p-5 rounded-xl border-2 border-border hover:border-blue-500/50 bg-card hover:bg-blue-500/5 transition-all text-left space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Compass className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Pick a New Interest</h3>
              <p className="text-xs text-muted-foreground">
                Explore a different initiative
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Return to the Crow's Nest and select a different area to explore
            with a fresh showcase run.
          </p>
        </button>

        {/* 2. Go Deeper */}
        <button
          onClick={onGoDeeper}
          className="group p-5 rounded-xl border-2 border-border hover:border-emerald-500/50 bg-card hover:bg-emerald-500/5 transition-all text-left space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold">Go Deeper</h3>
              <p className="text-xs text-muted-foreground">
                Read the academic papers
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore the research and design documents behind this initiative on
            the Cephas academic library.
          </p>
        </button>

        {/* 3. Keep on Same Track */}
        <button
          onClick={onContinueTrack}
          disabled={!hasNextRun}
          className={`group p-5 rounded-xl border-2 border-border bg-card transition-all text-left space-y-3 ${
            hasNextRun
              ? "hover:border-amber-500/50 hover:bg-amber-500/5"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <ArrowRight className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Keep on This Track</h3>
              <p className="text-xs text-muted-foreground">
                {hasNextRun ? "Continue the sequence" : "No more runs in this track"}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {hasNextRun
              ? "Launch the next beacon run in this track to go even deeper into the details."
              : "You've explored all the beacon runs available for this interest area."}
          </p>
        </button>

        {/* 4. Register / Take Action */}
        <button
          onClick={onRegister}
          className="group p-5 rounded-xl border-2 border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 transition-all text-left space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <UserPlus className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Take Action</h3>
              <p className="text-xs text-muted-foreground">
                Join the platform
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ready to participate? Walk the Red Carpet and become a member. $5/year,
            full access to all platform services.
          </p>
        </button>
      </div>
    </div>
  );
}

export default BeaconRunEndChoices;
