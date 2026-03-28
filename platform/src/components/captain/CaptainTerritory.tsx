import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Store, CheckCircle2, AlertCircle, Ban, Loader2 } from "lucide-react";
import {
  useCaptainCorridors,
  useAddCorridor,
  type CorridorWithStats,
} from "@/hooks/useCaptainCorridors";

const STATUS_COLORS: Record<string, string> = {
  onboarded: "text-emerald-400",
  campaign_active: "text-blue-400",
  not_approached: "text-slate-400",
  declined: "text-red-400",
  corporate_skip: "text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  onboarded: "onboarded",
  campaign_active: "active campaigns",
  not_approached: "not yet approached",
  declined: "declined",
  corporate_skip: "corporate (skip)",
};

export function CaptainTerritory() {
  const { data: corridors = [], isLoading } = useCaptainCorridors();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Active Corridors ({corridors.filter((c) => c.status === "active").length})
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Geographic areas you're working to onboard
          </p>
        </div>
        <AddCorridorDialog />
      </div>

      {corridors.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800/30">
          <CardContent className="p-8 text-center text-slate-500 space-y-3">
            <MapPin className="w-10 h-10 mx-auto text-slate-600" />
            <p>No corridors yet. Add a corridor to start tracking your territory.</p>
            <p className="text-xs text-slate-600">
              A corridor is a street, district, or area where you're onboarding businesses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {corridors.map((corridor) => (
            <CorridorCard key={corridor.id} corridor={corridor} />
          ))}
        </div>
      )}
    </div>
  );
}

function CorridorCard({ corridor }: { corridor: CorridorWithStats }) {
  return (
    <Card className="border-slate-700 bg-slate-800/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {corridor.name}
              {corridor.status !== "active" && (
                <Badge variant="outline" className="text-[10px]">{corridor.status}</Badge>
              )}
            </CardTitle>
            {corridor.description && (
              <p className="text-xs text-slate-500 mt-0.5">{corridor.description}</p>
            )}
          </div>
          <Badge variant="outline" className="text-blue-300 border-blue-500/30">
            {corridor.total} businesses
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Progress value={corridor.progressPct} className="h-2 flex-1" />
          <span className="text-sm font-medium text-slate-300 min-w-[3ch] text-right">
            {corridor.progressPct}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <StatusCount
            icon={<CheckCircle2 className="w-3 h-3" />}
            status="onboarded"
            count={corridor.onboarded}
          />
          <StatusCount
            icon={<Store className="w-3 h-3" />}
            status="campaign_active"
            count={corridor.campaignActive}
          />
          <StatusCount
            icon={<AlertCircle className="w-3 h-3" />}
            status="not_approached"
            count={corridor.notApproached}
          />
          <StatusCount
            icon={<Ban className="w-3 h-3" />}
            status="declined"
            count={corridor.declined}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusCount({
  icon,
  status,
  count,
}: {
  icon: React.ReactNode;
  status: string;
  count: number;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${STATUS_COLORS[status] ?? "text-slate-400"}`}>
      {icon}
      <span>
        {count} {STATUS_LABELS[status]}
      </span>
    </div>
  );
}

function AddCorridorDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const mutation = useAddCorridor();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await mutation.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
          <Plus className="w-4 h-4 mr-1" />
          Add Corridor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Corridor</DialogTitle>
          <DialogDescription>
            Define a geographic area you're working to onboard (e.g. "Bandera Road" or "Pearl District").
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Corridor Name</Label>
            <Input
              placeholder="e.g. Bandera Road"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input
              placeholder="e.g. Loop 410 to 1604"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-500"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Corridor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
