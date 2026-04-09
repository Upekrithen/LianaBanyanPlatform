import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Anchor, Zap, MapPin, Shield } from "lucide-react";
import { useBecomeCaptain } from "@/hooks/useBecomeCaptain";

const US_REGIONS = [
  "Northeast", "Southeast", "Midwest", "Southwest", "West Coast",
  "Pacific Northwest", "Mountain West", "Great Plains", "Mid-Atlantic",
];

export function CaptainStakeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [marks, setMarks] = useState("100");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const mutation = useBecomeCaptain();

  const marksNum = parseInt(marks) || 0;
  const joulesEquiv = Math.floor(marksNum * 0.8);
  const canSubmit = marksNum >= 100 && city.trim().length > 0 && region.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    mutation.mutate(
      { marks_staked: marksNum, region, city: city.trim() },
      { onSuccess }
    );
  };

  return (
    <Card className="border-blue-500/30 bg-slate-900/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-lg">Stake Your Marks</CardTitle>
        </div>
        <CardDescription>
          Skin in the game. Your stake backs your commitment to fulfill orders in your area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Marks to Stake (minimum 100)</Label>
          <div className="relative">
            <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <Input
              type="number"
              min={100}
              value={marks}
              onChange={e => setMarks(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600"
              placeholder="100"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Zap className="w-3 h-3 text-amber-400" />
            Joule backing: {joulesEquiv.toLocaleString()} J
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Your City</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <Input
              value={city}
              onChange={e => setCity(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600"
              placeholder="e.g., Boise"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600">
              <SelectValue placeholder="Select region..." />
            </SelectTrigger>
            <SelectContent>
              {US_REGIONS.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400/80">
          Your stake is operational collateral — it ensures you have skin in the game.
          Captains who fulfill orders earn reputation and can graduate to higher levels.
          This is <strong>not</strong> a speculative instrument. You are a leader, not an outside owner.
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || mutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          size="lg"
        >
          <Anchor className="w-4 h-4 mr-2" />
          {mutation.isPending ? "Setting Sail..." : "Stake Marks & Become a Captain"}
        </Button>
      </CardContent>
    </Card>
  );
}
