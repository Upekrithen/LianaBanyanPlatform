import React from "react";
import { useSpotlight } from "./SpotlightContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Flashlight, RefreshCw, Lock } from "lucide-react";

export function SpotlightPreferences() {
  const {
    preferences,
    isMember,
    toggleRangerMode,
    resetAllSpotlights,
  } = useSpotlight();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flashlight className="h-5 w-5 text-amber-500" />
          Spotlight Ranger Mode
        </CardTitle>
        <CardDescription>
          Control how the platform introduces new features and places
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">Show Spotlights</div>
            <div className="text-sm text-muted-foreground">
              {preferences.rangerModeEnabled
                ? "Introductions shown for new features"
                : "Spotlights are turned off"}
            </div>
          </div>
          {isMember ? (
            <Switch
              checked={preferences.rangerModeEnabled}
              onCheckedChange={toggleRangerMode}
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Members only
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Dismissed Spotlights</div>
              <div className="text-sm text-muted-foreground">
                {preferences.dismissedSpotlights.length} spotlight
                {preferences.dismissedSpotlights.length !== 1 ? "s" : ""} won't show again
              </div>
            </div>
            {isMember ? (
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllSpotlights}
                disabled={preferences.dismissedSpotlights.length === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Members only
              </div>
            )}
          </div>
        </div>

        {!isMember && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              <strong>Become a member ($5/year)</strong> to control your spotlight
              experience. Turn them off, dismiss permanently, or reset anytime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SpotlightToggleButton() {
  const { preferences, isMember, toggleRangerMode } = useSpotlight();

  if (!isMember) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleRangerMode}
      title={preferences.rangerModeEnabled ? "Turn off spotlights" : "Turn on spotlights"}
      className="relative"
    >
      <Flashlight
        className={`h-5 w-5 ${
          preferences.rangerModeEnabled ? "text-amber-500" : "text-slate-500"
        }`}
      />
      {!preferences.rangerModeEnabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-0.5 bg-slate-500 rotate-45" />
        </div>
      )}
    </Button>
  );
}

export default SpotlightPreferences;
