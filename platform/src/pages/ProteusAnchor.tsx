import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anchor, ArrowRight, CheckCircle, AlertTriangle, FlaskConical, History, Factory, Hexagon, Shield } from "lucide-react";
import {
  fetchAnchors,
  fetchCompatMatrix,
  fetchTransformations,
  getCompatColor,
  getTransformIcon,
  MODULE_DISPLAY_NAMES,
  type ProteusAnchor as ProteusAnchorType,
  type ManufacturingCompat,
  type ProteusTransformation,
  type CompatLevel,
} from "@/lib/proteusAnchorService";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const COMPAT_ICONS: Record<CompatLevel, typeof CheckCircle> = {
  full: CheckCircle,
  partial: AlertTriangle,
  experimental: FlaskConical,
};

export default function ProteusAnchorPage() {
  const [anchors, setAnchors] = useState<ProteusAnchorType[]>([]);
  const [selectedAnchor, setSelectedAnchor] = useState<ProteusAnchorType | null>(null);
  const [compatMatrix, setCompatMatrix] = useState<ManufacturingCompat[]>([]);
  const [transformations, setTransformations] = useState<ProteusTransformation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnchors().then((data) => {
      setAnchors(data);
      if (data.length > 0) {
        setSelectedAnchor(data[0]);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedAnchor) return;
    Promise.all([
      fetchCompatMatrix(selectedAnchor.id),
      fetchTransformations(selectedAnchor.id),
    ]).then(([compat, transforms]) => {
      setCompatMatrix(compat);
      setTransformations(transforms);
    });
  }, [selectedAnchor]);

  if (loading) {
    return (
      <PortalPageLayout>
        <div className="text-slate-400 animate-pulse">Loading Proteus Anchors...</div>
      </PortalPageLayout>
    );
  }

  const fullCount = compatMatrix.filter((c) => c.compatibilityLevel === "full").length;
  const partialCount = compatMatrix.filter((c) => c.compatibilityLevel === "partial").length;
  const experimentalCount = compatMatrix.filter((c) => c.compatibilityLevel === "experimental").length;

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Anchor className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">Proteus Anchor System</h1>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
              Innovation #1553
            </Badge>
          </div>
          <p className="text-slate-400 max-w-2xl">
            A Proteus is a product that transforms and adapts. The Anchor ties it to the cooperative's
            manufacturing backbone — every method, every material, one ecosystem.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Anchor Cards */}
        <section data-xray-id="proteus-anchor-list">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Active Anchors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anchors.map((anchor) => (
              <Card
                key={anchor.id}
                className={`bg-slate-900/60 border cursor-pointer transition-all hover:border-cyan-500/50 ${
                  selectedAnchor?.id === anchor.id
                    ? "border-cyan-500/60 ring-1 ring-cyan-500/20"
                    : "border-slate-700/50"
                }`}
                onClick={() => setSelectedAnchor(anchor)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      {anchor.hexisleCompatible && <Hexagon className="w-4 h-4 text-emerald-400" />}
                      {anchor.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        anchor.anchorStatus === "active"
                          ? "border-emerald-500/30 text-emerald-400"
                          : anchor.anchorStatus === "draft"
                          ? "border-amber-500/30 text-amber-400"
                          : "border-slate-500/30 text-slate-400"
                      }
                    >
                      {anchor.anchorStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-3">{anchor.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {anchor.terenoTier && (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                        Tereno Tier {anchor.terenoTier}
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      {anchor.manufacturingProcesses.length} processes
                    </Badge>
                    {anchor.innovationNumber && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                        #{anchor.innovationNumber}
                      </Badge>
                    )}
                  </div>
                  {anchor.externalUrl && (
                    <Link
                      to={anchor.externalUrl}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-3"
                    >
                      View Dashboard <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Placeholder for future Proteus */}
            <Card className="bg-slate-900/30 border border-dashed border-slate-700/50 flex items-center justify-center min-h-[200px]">
              <div className="text-center text-slate-600">
                <Anchor className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Next Proteus Anchor</p>
                <p className="text-xs mt-1">Coming soon</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Manufacturing Compatibility Matrix */}
        {selectedAnchor && (
          <section data-xray-id="proteus-compat-matrix">
            <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Factory className="w-5 h-5 text-cyan-400" />
              Manufacturing Compatibility — {selectedAnchor.name}
            </h2>

            <div className="flex gap-4 mb-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Full ({fullCount})
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Partial ({partialCount})
              </span>
              <span className="flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-purple-400" /> Experimental ({experimentalCount})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {compatMatrix.map((compat) => {
                const Icon = COMPAT_ICONS[compat.compatibilityLevel];
                return (
                  <Card key={compat.id} className="bg-slate-900/40 border border-slate-700/40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${
                            compat.compatibilityLevel === "full" ? "text-emerald-400" :
                            compat.compatibilityLevel === "partial" ? "text-amber-400" :
                            "text-purple-400"
                          }`} />
                          <span className="font-medium text-white text-sm">
                            {MODULE_DISPLAY_NAMES[compat.moduleType] || compat.moduleType}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getCompatColor(compat.compatibilityLevel)}`}
                        >
                          {compat.compatibilityLevel}
                        </Badge>
                      </div>
                      {compat.notes && (
                        <p className="text-xs text-slate-400 mt-1">{compat.notes}</p>
                      )}
                      {compat.verifiedAt && (
                        <p className="text-[10px] text-slate-600 mt-2">
                          Verified {new Date(compat.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Transformation Timeline */}
        {selectedAnchor && transformations.length > 0 && (
          <section data-xray-id="proteus-transformations">
            <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              Transformation Timeline — {selectedAnchor.name}
            </h2>

            <div className="space-y-4">
              {transformations.map((t, idx) => (
                <div key={t.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
                      {getTransformIcon(t.transformationType)}
                    </div>
                    {idx < transformations.length - 1 && (
                      <div className="w-px flex-1 bg-slate-700/50 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <Card className="flex-1 bg-slate-900/40 border border-slate-700/40 mb-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white text-sm">{t.title}</h3>
                        <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px]">
                          {t.transformationType.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{t.description}</p>

                      {/* Before → After */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-red-400">
                          {Object.entries(t.beforeState).map(([k, v]) => (
                            <span key={k}>{k}: {typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                          ))}
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 text-emerald-400">
                          {Object.entries(t.afterState).map(([k, v]) => (
                            <span key={k}>{k}: {typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-600 mt-2">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cue Card Banner */}
        <Card className="bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-cyan-500/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Become a Test-Pilot</h3>
              <p className="text-sm text-slate-400">
                Proteus products need hands-on testing. Join the manufacturing crew and help shape the next generation.
              </p>
            </div>
            <Link
              to="/the-forge"
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              The Forge <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
