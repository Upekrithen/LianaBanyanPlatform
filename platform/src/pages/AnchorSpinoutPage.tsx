/**
 * AnchorSpinoutPage -- Wave 22 Phase B
 * =====================================
 * Deep-build landing for the Anchor spinout at /spinouts/anchor.
 * Anchor = persistent context platform: ties content/conversations to permanent
 * yoke-bridge URNs. Every anchor is an IP-Ledger provenance record.
 *
 * Member flow: Create -> Share -> Build
 * IP-Ledger: every anchor is a hash-chained provenance entry
 * Marks for creating high-quality anchors others build on
 * Wires to: serializeAnchorForYoke / deserializeAnchorFromYoke
 *
 * Securities-clean: Marks = cooperative participation, NOT A FINANCIAL RETURN.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Anchor,
  Link2,
  Share2,
  Layers,
  CheckCircle,
  Copy,
  ShieldCheck,
  BookOpen,
  Users,
  AlertCircle,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { serializeAnchorForYoke, deserializeAnchorFromYoke } from "@/lib/skip-eblets";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useTranslation } from "react-i18next";

// ─── Static demo data ─────────────────────────────────────────────────────────

const DEMO_ANCHORS = [
  {
    urn: "urn:lb:anchor:coop-governance-2026-06",
    title: "Cooperative Governance Principles",
    creator: "member:atlas-node-7",
    builds: 14,
    createdAt: "2026-05-01",
    category: "Governance",
  },
  {
    urn: "urn:lb:anchor:lmd-recipe-cornbread-v2",
    title: "Cornbread Recipe (Let's Make Dinner)",
    creator: "member:family-table-sf",
    builds: 8,
    createdAt: "2026-05-12",
    category: "Initiative",
  },
  {
    urn: "urn:lb:anchor:untech-onboarding-path-2026",
    title: "unTech Onboarding Sequence v3",
    creator: "member:stewards-guild",
    builds: 31,
    createdAt: "2026-04-20",
    category: "Onboarding",
  },
];

const FLOW_STEPS = [
  {
    icon: Anchor,
    label: "Create",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
    description:
      "Bind any content, conversation, or contribution to a permanent URN. The anchor is logged to the IP-Ledger as a provenance record.",
    detail: "urn:lb:anchor:<unique-id>",
  },
  {
    icon: Share2,
    label: "Share",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    description:
      "Share your anchor URN across surfaces via the yoke-handoff protocol. The URN travels with its context -- permanent and portable.",
    detail: "yoke-handoff v1 payload",
  },
  {
    icon: Layers,
    label: "Build",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/30",
    description:
      "Other members cite-and-extend your anchor. You earn Marks each time someone builds on what you anchored. NOT A FINANCIAL RETURN.",
    detail: "cite-and-extend protocol",
  },
];

// ─── Live-data hook: anchor records ──────────────────────────────────────────

interface AnchorStats {
  total_anchors: number;
  total_builds: number;
  total_ipledger_entries: number;
}

function useAnchorStats() {
  return useQuery<AnchorStats>({
    queryKey: ["anchor-stats"],
    queryFn: async () => {
      const [anchorsResult, pledgerResult] = await Promise.all([
        (supabase as any).from("anchor_records").select("build_count"),
        (supabase as any).from("anchor_ipledger_entries").select("id", { count: "exact", head: true }),
      ]);
      const anchors = (anchorsResult.data as { build_count: number }[] | null) ?? [];
      return {
        total_anchors: anchors.length,
        total_builds: anchors.reduce((acc, a) => acc + (Number(a.build_count) || 0), 0),
        total_ipledger_entries: pledgerResult.count ?? 0,
      };
    },
    staleTime: 2 * 60_000,
  });
}

// ─── Live anchors list ────────────────────────────────────────────────────────

interface AnchorRecord {
  id: string;
  urn: string;
  title: string;
  category: string;
  build_count: number;
  created_at: string;
}

function useRecentAnchors() {
  return useQuery<AnchorRecord[]>({
    queryKey: ["anchor-records-recent"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("anchor_records")
        .select("id, urn, title, category, build_count, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(5);
      return (data as AnchorRecord[] | null) ?? [];
    },
    staleTime: 2 * 60_000,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnchorSpinoutPage() {
  usePageSEO({
    title: "Anchor | Liana Banyan Spinout",
    description: "Community anchoring and place-based cooperative services. A spinout seeded by the Liana Banyan platform.",
    canonical: "https://lianabanyan.com/spinouts/anchor",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: anchorStats } = useAnchorStats();
  const { data: recentAnchors } = useRecentAnchors();
  const [demoInput, setDemoInput] = useState("urn:lb:anchor:my-first-anchor");
  const [yokePayload, setYokePayload] = useState<string | null>(null);
  const [deserializedUrn, setDeserializedUrn] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  function handleSerialize() {
    const payload = serializeAnchorForYoke(demoInput.trim() || "urn:lb:anchor:example");
    setYokePayload(payload);
    setDeserializedUrn(null);
  }

  function handleDeserialize() {
    if (!yokePayload) return;
    try {
      const { anchorUrn } = deserializeAnchorFromYoke(yokePayload);
      setDeserializedUrn(anchorUrn);
    } catch {
      setDeserializedUrn("(parse error -- invalid yoke payload)");
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => undefined);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 1500);
  }

  return (
    <PortalPageLayout variant="stage" xrayId="anchor-spinout-page">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/spinouts")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All Spinouts
        </Button>

        {/* Hero */}
        <div className="rounded-2xl border-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-6 space-y-3">
          <div className="flex items-start gap-4">
            <span className="text-5xl">⚓</span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">Anchor</h1>
                <Badge variant="outline">Context & Provenance</Badge>
                <Badge className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10">
                  Forming
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-xl">
                Persistent context for every conversation and contribution.
                Anchors tie content to permanent URNs -- ideas that last, travel,
                and build upon each other.
              </p>
            </div>
          </div>
        </div>

        {/* Live Anchor Stats */}
        <Card className="border-cyan-500/20 bg-cyan-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Anchor className="h-4 w-4 text-cyan-400" />
              IP-Ledger -- Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400">{anchorStats?.total_anchors ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Anchors Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">{anchorStats?.total_builds ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Builds on Anchors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">{anchorStats?.total_ipledger_entries ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">IP-Ledger Entries</div>
              </div>
            </div>
            {recentAnchors && recentAnchors.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recent Public Anchors</p>
                {recentAnchors.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-400 truncate max-w-[60%]">{a.urn}</span>
                    <span className="text-muted-foreground">{a.build_count} builds</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Live from Supabase. Hash-chained IP-Ledger.
            </p>
          </CardContent>
        </Card>

        {/* What is an Anchor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-400" />
              What is an Anchor?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              An anchor is a permanent binding between a piece of content and a
              Uniform Resource Name (URN) in the format{" "}
              <code className="font-mono text-cyan-400 bg-cyan-500/10 px-1 rounded text-xs">
                urn:lb:anchor:&lt;unique-id&gt;
              </code>
              . Once created, an anchor URN never changes -- it is permanent and
              portable across all LianaBanyan surfaces.
            </p>
            <p>
              Every anchor is recorded in the IP-Ledger as a hash-chained
              provenance entry. Attribution is tamper-evident and permanent.
              When another member builds on your anchor (cite-and-extend), the
              ledger records the full provenance chain: who created the original,
              who extended it, and in what order.
            </p>
            <p>
              Anchors travel between surfaces using the{" "}
              <strong className="text-foreground">yoke-bridge protocol</strong> -- a
              lightweight handoff format that packages the URN with a timestamp
              for cross-surface coherence.
            </p>
          </CardContent>
        </Card>

        {/* Member Flow */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Member Flow</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {FLOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.label} className={`border ${step.bg}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className={`h-5 w-5 ${step.color}`} />
                      {step.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <code className={`text-xs font-mono ${step.color}`}>
                      {step.detail}
                    </code>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Live Yoke-Bridge Demo */}
        <Card className="border-cyan-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-5 w-5 text-cyan-400" />
              Live Yoke-Bridge Demo
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Serialize an anchor URN to the yoke-handoff wire format, then
              deserialize it back. This is exactly how anchors travel between
              surfaces.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">
                Anchor URN
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  className="flex-1 text-xs font-mono bg-background border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="urn:lb:anchor:my-anchor-id"
                />
                <Button size="sm" onClick={handleSerialize} className="shrink-0">
                  Serialize
                </Button>
              </div>
            </div>

            {yokePayload && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">
                  Yoke-Handoff Wire Payload
                </label>
                <div className="flex gap-2 items-start">
                  <pre className="flex-1 text-xs font-mono bg-muted/30 border border-border rounded p-3 text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all">
                    {yokePayload}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(yokePayload)}
                    className="shrink-0"
                  >
                    {copyDone ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={handleDeserialize}>
                  Deserialize
                </Button>
              </div>
            )}

            {deserializedUrn && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Recovered Anchor URN
                </label>
                <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  <code className="text-xs font-mono text-green-300">
                    {deserializedUrn}
                  </code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example Anchors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Anchors (Demo)</h2>
            <Badge variant="outline" className="text-xs">
              {DEMO_ANCHORS.reduce((n, a) => n + a.builds, 0)} total builds
            </Badge>
          </div>
          <div className="space-y-3">
            {DEMO_ANCHORS.map((anchor) => (
              <Card key={anchor.urn} className="border-border/50">
                <CardContent className="py-4 flex items-start gap-3">
                  <Anchor className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{anchor.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {anchor.category}
                      </Badge>
                    </div>
                    <code className="text-xs font-mono text-muted-foreground block truncate">
                      {anchor.urn}
                    </code>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{anchor.creator}</span>
                      <span className="text-border">|</span>
                      <span>{anchor.createdAt}</span>
                      <span className="text-border">|</span>
                      <span className="text-violet-400 font-medium">
                        {anchor.builds} builds
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* IP-Ledger Integration */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-primary" />
              IP-Ledger Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Every Anchor event is recorded in the hash-chained IP-Ledger:
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                {
                  type: "anchor.created",
                  desc: "New anchor bound to URN",
                  color: "text-cyan-400 bg-cyan-500/10",
                },
                {
                  type: "anchor.shared",
                  desc: "URN shared to another surface",
                  color: "text-blue-400 bg-blue-500/10",
                },
                {
                  type: "anchor.built_on",
                  desc: "Anchor extended by another member",
                  color: "text-violet-400 bg-violet-500/10",
                },
              ].map((entry) => (
                <div
                  key={entry.type}
                  className={`rounded-lg p-3 border border-border/50 ${entry.color.split(" ")[1]}`}
                >
                  <code
                    className={`text-xs font-mono block mb-1 ${entry.color.split(" ")[0]}`}
                  >
                    {entry.type}
                  </code>
                  <p className="text-xs text-muted-foreground">{entry.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Hash-chained: each entry references the hash of the previous one.
              Provenance is tamper-evident and permanently attributed.
            </p>
          </CardContent>
        </Card>

        {/* Marks Disclosure */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-yellow-400" />
              Marks for Anchor Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Members earn Marks when other members build on their anchors. The
              more a well-crafted anchor is built upon, the more Marks the
              original creator accumulates.
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-200">
                <strong>NOT A FINANCIAL RETURN.</strong> Marks represent
                cooperative participation only -- not equity, shares, dividends,
                or any guaranteed financial return. Marks rates are held for
                Founder review.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Plan Stub */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Business Plan Stub</CardTitle>
            <p className="text-xs text-muted-foreground">
              Cost+20% template. Marks = participation, not equity or guaranteed
              return.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Problem</p>
              <p className="text-muted-foreground">
                Content and ideas on the internet are ephemeral, unattributed,
                and unverifiable. Conversations disappear, contributions are
                forgotten, and there is no durable provenance layer that ties
                ideas to their creators across time and surfaces.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
              <p className="text-muted-foreground">
                Internal member use: included in $5/year membership. External
                provenance verification: Cost+20% per batch. 83.3% of
                coordination fees to the Anchor operations team.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Day 30: First 500 anchors created by early member cohort</li>
                <li>
                  Day 60: IP-Ledger integration verified -- every anchor produces
                  a provenance record
                </li>
                <li>
                  Day 90: First cross-surface anchor citation published (Anchor
                  to initiative page)
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Anchor Spinout -- legal entity forming. Canon: Wave 22 Phase B /
            yoke-bridge URN infrastructure.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Marks represent participation in the Liana Banyan cooperative -- not
            equity, shares, or guaranteed financial return.
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
