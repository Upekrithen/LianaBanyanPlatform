import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award, Crown, Shield, Hexagon, Puzzle, Wrench, Sparkles, Zap, Droplets, AlertTriangle, Ban, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import {
  type TerenoCertification as TCert, type TerenoExclusion,
  TIER_DEFINITIONS, PROCESS_TIER_MAP, SAMPLE_CERTIFICATIONS, SAMPLE_EXCLUSIONS,
  fetchCertifications, fetchExclusions,
} from "@/lib/terenoCertificationService";

const TIER_ICONS: Record<string, any> = { Crown, Shield, Hexagon, Puzzle, Wrench, Sparkles };

export default function TerenoCertification() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<TCert[]>(SAMPLE_CERTIFICATIONS);
  const [exclusions, setExclusions] = useState<TerenoExclusion[]>(SAMPLE_EXCLUSIONS);
  const [filterTier, setFilterTier] = useState<number | null>(null);

  useEffect(() => {
    fetchCertifications().then(setCerts);
    fetchExclusions().then(setExclusions);
  }, []);

  const filtered = filterTier ? certs.filter(c => c.tier === filterTier) : certs;
  const certifiedCerts = certs.filter(c => c.status === "certified");

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="tereno-certification">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-400" />
            Tereno Certification — The Gold Standard
          </h1>
          <p className="text-slate-400">Six tiers of compatibility. One ecosystem.</p>
        </header>

        {/* Six-Tier Display */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {TIER_DEFINITIONS.map(tier => {
            const Icon = TIER_ICONS[tier.icon] || Award;
            const count = certifiedCerts.filter(c => c.tier === tier.tier).length;
            const isActive = filterTier === tier.tier;
            return (
              <Card
                key={tier.tier}
                className={`cursor-pointer transition-all ${tier.bgColor} border-2 ${isActive ? tier.borderColor + " ring-2 ring-offset-2 ring-offset-slate-950" : "border-slate-800 hover:border-slate-600"}`}
                onClick={() => setFilterTier(isActive ? null : tier.tier)}
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`text-2xl font-bold ${tier.color}`}>{tier.tier}</div>
                    <Icon className={`w-5 h-5 ${tier.color}`} />
                  </div>
                  <p className="font-semibold text-sm">{tier.name}</p>
                  <p className="text-xs text-slate-400 mb-2">{tier.label}</p>
                  <p className="text-xs text-slate-500 mb-2">{tier.description}</p>
                  <Badge variant="outline" className="text-xs">{count} certified</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Certified Products Gallery */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {filterTier ? `Tier ${filterTier} Products` : "All Certified Products"}
            {filterTier && <Button variant="ghost" size="sm" className="ml-2 text-xs" onClick={() => setFilterTier(null)}>Show All</Button>}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map(cert => {
              const tierDef = TIER_DEFINITIONS.find(t => t.tier === cert.tier);
              return (
                <Card key={cert.id} className="bg-slate-900/60 border-slate-800">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-sm">{cert.productName}</p>
                        <p className="text-xs text-slate-400">{cert.designerName} &middot; {cert.manufacturingProcess}</p>
                      </div>
                      <Badge className={`${tierDef?.bgColor || ""} ${tierDef?.color || ""} border-0 text-xs`}>Tier {cert.tier}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{cert.productDescription}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "60mm", ok: cert.dimensionsCompliant },
                        { label: "Water-Safe", ok: cert.waterSafe },
                        { label: "Stack", ok: cert.stackCompatible },
                        { label: "Compliant", ok: cert.compliantMechanisms },
                        { label: "Cost ≤ Ceiling", ok: cert.costUnderCeiling },
                        { label: "Lithographic", ok: cert.lithographicManufacturing },
                      ].map(check => (
                        <span key={check.label} className={`text-xs px-1.5 py-0.5 rounded ${check.ok ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-500"}`}>
                          {check.ok ? "✓" : "✗"} {check.label}
                        </span>
                      ))}
                    </div>
                    {cert.deviationNotes && <p className="text-xs text-amber-400 mt-2">Note: {cert.deviationNotes}</p>}
                    {cert.status === "submitted" && <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs mt-2">Awaiting Review</Badge>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* Process-to-Tier Map */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Process-to-Tier Mapping</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800 text-slate-400"><th className="text-left py-2 pr-4">Process</th><th className="text-center py-2 px-4">Tier Range</th><th className="text-left py-2 pl-4">Notes</th></tr></thead>
              <tbody>
                {PROCESS_TIER_MAP.map(row => (
                  <tr key={row.process} className="border-b border-slate-800/50">
                    <td className="py-2 pr-4 font-medium">{row.process}</td>
                    <td className="py-2 px-4 text-center"><Badge variant="outline">{row.tierRange}</Badge></td>
                    <td className="py-2 pl-4 text-slate-400">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* Exclusions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Exclusions — Cannot Be Certified at ANY Tier
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { icon: Zap, label: "Electronics near water", desc: "Electrical hazard in water table environment", color: "text-red-400" },
              { icon: Droplets, label: "Water-soluble materials", desc: "Dissolves when exposed to water table", color: "text-red-400" },
              { icon: AlertTriangle, label: "Designs that damage other pieces", desc: "Sharp edges, corrosive materials, or abrasive surfaces", color: "text-red-400" },
              { icon: Ban, label: "Hydraulic channel obstruction", desc: "Blocks water flow in the terrain system", color: "text-red-400" },
            ].map(ex => (
              <Card key={ex.label} className="bg-red-950/20 border-red-900/30">
                <CardContent className="py-3 flex items-start gap-3">
                  <ex.icon className={`w-5 h-5 ${ex.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-medium text-sm text-red-400">{ex.label}</p>
                    <p className="text-xs text-slate-400">{ex.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* Piggy-Back Protocol */}
        <Card className="bg-gradient-to-r from-green-950/30 to-slate-900/60 border-green-800/30">
          <CardContent className="py-6">
            <h3 className="text-lg font-bold text-green-400 mb-2">Third-Party Maker? Welcome to the Ecosystem</h3>
            <p className="text-sm text-slate-400 mb-3">Submit your design → receive tier classification → earn IP ledger entry → receive tier-scaled deferred payment for design services.</p>
            <p className="text-xs text-slate-500">This is deferred compensation for services rendered — not a participation interest. SEC-safe by design.</p>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
