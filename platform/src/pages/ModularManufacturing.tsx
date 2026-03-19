import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Factory, Droplets, Mountain, Zap, Layers, Box, Printer, Cog, Scissors, Star, Users, ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import {
  type ManufacturingModule, type ModuleStatus, type ModuleType,
  MODULE_ICONS, SAMPLE_MODULES,
  fetchModules,
} from "@/lib/manufacturingService";

const MODULE_ICON_COMPONENTS: Record<string, any> = {
  Droplets, Mountain, Zap, Layers, Box, Printer, Cog, Scissors,
};

const STATUS_STYLES: Record<ModuleStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-500/20", text: "text-green-400", label: "Active" },
  inactive: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Inactive" },
  maintenance: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Maintenance" },
};

function CrewSlot({ label, hasOperator }: { label: string; hasOperator: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className={`w-2 h-2 rounded-full ${hasOperator ? "bg-green-400" : "bg-slate-600"}`} />
      <span className={hasOperator ? "text-slate-300" : "text-slate-500"}>
        {label}: {hasOperator ? "Filled" : "OPEN"}
      </span>
    </div>
  );
}

export default function ModularManufacturing() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ManufacturingModule[]>(SAMPLE_MODULES);

  useEffect(() => { fetchModules().then(setModules); }, []);

  const activeModules = modules.filter(m => m.status === "active");
  const totalCapacity = activeModules.reduce((acc, m) => acc + m.capacityPerDay, 0);
  const totalQueue = modules.reduce((acc, m) => acc + m.currentQueue, 0);
  const pioneers = modules.filter(m => m.processPioneerName);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <Card className="bg-slate-900/80 border-slate-800 max-w-md"><CardContent className="py-8 text-center"><p className="text-slate-400 mb-4">Sign in to access The Forge.</p><Button asChild><Link to="/auth">Sign in</Link></Button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" data-xray-id="modular-manufacturing">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Factory className="w-8 h-8 text-orange-400" />
            The Forge — Modular Manufacturing
          </h1>
          <p className="text-slate-400">Swappable stations. Expert operators. Continuous production.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Stations", value: activeModules.length, icon: Factory },
            { label: "Total Capacity", value: `${totalCapacity}/day`, icon: Layers },
            { label: "Queue", value: totalQueue, icon: Box },
            { label: "Pioneers", value: pioneers.length, icon: Star },
          ].map(s => (
            <Card key={s.label} className="bg-slate-900/60 border-slate-800">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Module Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Process Modules</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map(mod => {
              const iconName = MODULE_ICONS[mod.moduleType];
              const Icon = MODULE_ICON_COMPONENTS[iconName] || Factory;
              const status = STATUS_STYLES[mod.status];
              const isBottleneck = mod.status === "active" && mod.currentQueue > mod.capacityPerDay;
              return (
                <Card key={mod.id} className={`bg-slate-900/60 border-slate-800 ${mod.status !== "active" ? "opacity-60" : ""} ${isBottleneck ? "ring-1 ring-red-500/50" : ""}`}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-6 h-6 ${mod.status === "active" ? "text-orange-400" : "text-slate-500"}`} />
                      <Badge className={`${status.bg} ${status.text} border-0 text-xs`}>{status.label}</Badge>
                    </div>
                    <p className="font-semibold text-sm mb-1">{mod.displayName}</p>
                    {mod.location && <p className="text-xs text-slate-400 mb-2">{mod.location}</p>}
                    <div className="space-y-1 mb-2">
                      <CrewSlot label="Primary" hasOperator={!!mod.primaryOperatorUserId} />
                      <CrewSlot label="Secondary" hasOperator={!!mod.secondaryOperatorUserId} />
                      <CrewSlot label="Backup" hasOperator={!!mod.backupOperatorUserId} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Cap: {mod.capacityPerDay}/day</span>
                      <span>Queue: {mod.currentQueue}</span>
                    </div>
                    {mod.processPioneerName && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                        <Star className="w-3 h-3" />
                        <span>Pioneer: {mod.processPioneerName}</span>
                      </div>
                    )}
                    {isBottleneck && <p className="text-xs text-red-400 mt-1">Bottleneck</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Assembly Line Flow */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Assembly Line Flow</h2>
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                {modules.filter(m => m.status === "active").map((mod, i, arr) => {
                  const iconName = MODULE_ICONS[mod.moduleType];
                  const Icon = MODULE_ICON_COMPONENTS[iconName] || Factory;
                  return (
                    <div key={mod.id} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1 bg-slate-800 rounded-lg p-3 min-w-[80px]">
                        <Icon className="w-5 h-5 text-orange-400" />
                        <span className="text-xs text-center">{mod.displayName.split(" ")[0]}</span>
                        <span className="text-xs text-slate-400">{mod.currentQueue} queued</span>
                      </div>
                      {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="border-slate-800" />

        {/* Crew Call */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Crew Call — "We Need You To Do What You're Already Good At"
          </h2>
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader><CardTitle className="text-base">Open Positions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {modules.flatMap(mod =>
                  (["primary", "secondary", "backup"] as const).filter(role => {
                    if (role === "primary" && !mod.primaryOperatorUserId) return true;
                    if (role === "secondary" && !mod.secondaryOperatorUserId) return true;
                    if (role === "backup" && !mod.backupOperatorUserId) return true;
                    return false;
                  }).map(role => (
                    <div key={`${mod.id}-${role}`} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                      <div>
                        <span className="font-medium text-sm">{mod.displayName}</span>
                        <span className="text-xs text-slate-400 ml-2 capitalize">{role}</span>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">Apply</Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="border-slate-800" />

        {/* Process Pioneers */}
        {pioneers.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Process Pioneers — "These Makers Blazed the Trail"
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {pioneers.map(mod => (
                <Card key={mod.id} className="bg-amber-950/20 border-amber-800/30">
                  <CardContent className="py-4 text-center">
                    <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="font-bold">{mod.processPioneerName}</p>
                    <p className="text-sm text-slate-400">{mod.displayName}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Production Calendar Placeholder */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="py-8 text-center">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">Production scheduling launches with first active campaigns</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
