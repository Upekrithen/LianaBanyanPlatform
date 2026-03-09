/**
 * DOCTRINE EXPLORER
 * =================
 * The main Areopagus knowledge interface.
 * Browse doctrine tree → see three-column positions → click dictionary terms → view CTAs.
 *
 * "Say what you Do. Do what you Say."
 *
 * Innovation #1518 — Doctrine Explorer UI (Session 7D)
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, ChevronRight, GitBranch, Search, Layers,
  BookMarked, FlaskConical, MessageCircle, Zap, ArrowRight,
  HelpCircle, Scale, GraduationCap, Users, Globe, Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  type DoctrineBranch,
  type DoctrinalPosition,
  type DepthLevel,
  type AreopagusTerm,
  DEPTH_CONFIG,
  DOMAIN_LABELS,
  EVIDENCE_TYPE_LABELS,
  SCHOLAR_LEVEL_LABELS,
  CHARITABLE_INITIATIVE_MAP,
  isPracticedEmpty,
  getChildBranches,
  getBranchBreadcrumb,
  type EvidenceType,
  type EvidenceBasis,
} from "@/lib/areopagusDoctrine";
import DictionaryPanel from "./DictionaryPanel";
import { FeatureTip, TIP_IDS } from "@/components/FeatureTip";

// ─── DEPTH SELECTOR ───

function DepthSelector({
  depth,
  onChange,
}: {
  depth: DepthLevel;
  onChange: (d: DepthLevel) => void;
}) {
  const levels: DepthLevel[] = ["overview", "standard", "deep", "scholarly"];

  return (
    <FeatureTip
      tipId={TIP_IDS.DOCTRINE_DEPTH_LEVEL}
      title="Depth Levels"
      description="Choose how much detail to see. Overview shows summaries. Scholarly shows full citations, LOC references, and peer-reviewed sources."
      side="left"
    >
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => onChange(lvl)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              depth === lvl
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {DEPTH_CONFIG[lvl].label}
          </button>
        ))}
      </div>
    </FeatureTip>
  );
}

// ─── BRANCH TREE ITEM ───

function BranchTreeItem({
  branch,
  allBranches,
  onSelect,
  isSelected,
}: {
  branch: DoctrineBranch;
  allBranches: DoctrineBranch[];
  onSelect: (b: DoctrineBranch) => void;
  isSelected: boolean;
}) {
  const children = getChildBranches(branch.id, allBranches);
  const domain = DOMAIN_LABELS[branch.domain as keyof typeof DOMAIN_LABELS];

  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(branch)}
        className={`w-full text-left flex items-start gap-2 p-2 rounded-lg transition-all text-sm ${
          isSelected
            ? "bg-primary/10 border border-primary/20"
            : "hover:bg-muted/50"
        }`}
      >
        {children.length > 0 ? (
          <GitBranch className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
        ) : (
          <BookMarked className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{branch.title}</span>
            {domain && <span className="text-xs">{domain.emoji}</span>}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {branch.divergencePoint}
          </p>
        </div>
        {children.length > 0 && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            {children.length}
          </Badge>
        )}
      </button>
      {children.length > 0 && (
        <div className="ml-4 pl-2 border-l border-muted space-y-1">
          {children.map((child) => (
            <BranchTreeItem
              key={child.id}
              branch={child}
              allBranches={allBranches}
              onSelect={onSelect}
              isSelected={isSelected && false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── THREE COLUMN POSITION CARD ───

function PositionCard({
  position,
  depth,
  onTermClick,
}: {
  position: DoctrinalPosition;
  depth: DepthLevel;
  onTermClick: (termId: string) => void;
}) {
  const config = DEPTH_CONFIG[depth];
  const scholarInfo = SCHOLAR_LEVEL_LABELS[position.scholarSupport];
  const empty = isPracticedEmpty(position.practiced);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{position.positionLabel}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${scholarInfo.color}`}>
              <GraduationCap className="w-3 h-3 mr-1" />
              {scholarInfo.label}
            </Badge>
            {position.estimatedAdherents && (
              <Badge variant="outline" className="text-[10px]">
                <Users className="w-3 h-3 mr-1" />
                {formatAdherents(position.estimatedAdherents)}
              </Badge>
            )}
          </div>
        </div>
        {/* Adherent groups */}
        {position.adherentGroups.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {position.adherentGroups.map((g, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {g.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ─── THE THREE COLUMNS ─── */}
        <div className="grid md:grid-cols-3 gap-3">
          {/* Column 1: Believed */}
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                What is Believed
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              <LinkedText
                text={position.believed}
                links={position.keyTermLinks?.filter(l => l.startOffset < position.believed.length) || []}
                onTermClick={onTermClick}
              />
            </p>
          </div>

          {/* Column 2: Taught */}
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                What is Taught
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {position.taught}
            </p>
          </div>

          {/* Column 3: Practiced OR CTA */}
          {empty ? (
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 border-dashed">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Call to Action
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                This column is empty. Want to change that?
              </p>
              {position.callToAction?.connectedInitiatives?.map((init, i) => (
                <a
                  key={i}
                  href={init.actionUrl}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-primary/5 transition-colors text-xs"
                >
                  <ArrowRight className="w-3 h-3 text-primary" />
                  <span className="font-medium">{init.initiativeName}</span>
                  <span className="text-muted-foreground">— {init.relevance}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Scale className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  What is Practiced
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {position.practiced}
              </p>
            </div>
          )}
        </div>

        {/* ─── EVIDENCE BASIS (if depth allows) ─── */}
        {config.showEvidence && position.evidenceBasis?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" />
              Evidence Basis — Why People Believe This
            </h4>
            <div className="flex flex-wrap gap-2">
              {(position.evidenceBasis as EvidenceBasis[]).map((ev, i) => {
                const typeInfo = EVIDENCE_TYPE_LABELS[ev.type as EvidenceType];
                return (
                  <div
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${
                      ev.weight === "primary"
                        ? "bg-primary/5 border-primary/20 font-medium"
                        : ev.weight === "secondary"
                          ? "bg-muted/50 border-muted"
                          : "bg-muted/30 border-transparent"
                    }`}
                  >
                    <span>{typeInfo?.emoji || "📌"}</span>
                    <span>{typeInfo?.label || ev.type}</span>
                    {ev.weight === "primary" && (
                      <span className="text-primary text-[10px]">PRIMARY</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── SCRIPTURE REFERENCES (if depth allows) ─── */}
        {config.showScripture && position.scriptureReferences?.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Scripture References
            </h4>
            <div className="flex flex-wrap gap-1">
              {(position.scriptureReferences as Array<{ book: string; chapter?: number; verse?: string }>).map((ref, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {ref.book} {ref.chapter ? `${ref.chapter}${ref.verse ? `:${ref.verse}` : ""}` : ""}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ─── SCHOLAR NOTES (if depth allows) ─── */}
        {config.showScholarNotes && position.scholarNotes && (
          <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
            <h4 className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">
              Scholar Notes
            </h4>
            <p className="text-xs text-muted-foreground">{position.scholarNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── LINKED TEXT (dictionary hyperlinks) ───

function LinkedText({
  text,
  links,
  onTermClick,
}: {
  text: string;
  links: Array<{ termId: string; startOffset: number; endOffset: number; displayText: string }>;
  onTermClick: (termId: string) => void;
}) {
  if (!links || links.length === 0) return <>{text}</>;

  // Sort by startOffset
  const sorted = [...links].sort((a, b) => a.startOffset - b.startOffset);
  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  sorted.forEach((link, i) => {
    // Text before the link
    if (link.startOffset > lastEnd) {
      parts.push(text.slice(lastEnd, link.startOffset));
    }
    // The linked term
    parts.push(
      <button
        key={`link-${i}`}
        onClick={() => onTermClick(link.termId)}
        className="font-semibold text-primary underline underline-offset-2 decoration-dotted hover:decoration-solid cursor-pointer"
        title="Click to see all definitions of this term"
      >
        {link.displayText}
      </button>,
    );
    lastEnd = link.endOffset;
  });

  // Remaining text
  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return <>{parts}</>;
}

// ─── HELPERS ───

function formatAdherents(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

// ─── MAIN COMPONENT ───

export default function DoctrineExplorer() {
  const [selectedBranch, setSelectedBranch] = useState<DoctrineBranch | null>(null);
  const [depth, setDepth] = useState<DepthLevel>("standard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [dictPanelOpen, setDictPanelOpen] = useState(false);

  // Load doctrine branches
  const { data: branches } = useQuery({
    queryKey: ["doctrine-branches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("doctrine_branches")
        .select("*")
        .order("depth_level")
        .order("title");
      return (data || []) as unknown as DoctrineBranch[];
    },
  });

  // Load positions for selected branch
  const { data: positions } = useQuery({
    queryKey: ["doctrinal-positions", selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch) return [];
      const { data } = await supabase
        .from("doctrinal_positions")
        .select("*")
        .eq("branch_id", selectedBranch.id)
        .order("quality_score", { ascending: false });
      return (data || []) as unknown as DoctrinalPosition[];
    },
    enabled: !!selectedBranch,
  });

  // Root branches (no parent)
  const rootBranches = useMemo(
    () => (branches || []).filter((b) => !b.parentBranchId),
    [branches],
  );

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    if (!selectedBranch || !branches) return [];
    return getBranchBreadcrumb(selectedBranch, branches);
  }, [selectedBranch, branches]);

  // Search filter
  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim() || !branches) return rootBranches;
    const q = searchQuery.toLowerCase();
    return branches.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.divergencePoint.toLowerCase().includes(q),
    );
  }, [searchQuery, branches, rootBranches]);

  const handleTermClick = (termId: string) => {
    setSelectedTermId(termId);
    setDictPanelOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Doctrine Explorer
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse by belief, not by denomination. Three columns: Believed | Taught | Practiced.
          </p>
        </div>
        <DepthSelector depth={depth} onChange={setDepth} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search doctrines, beliefs, traditions..."
          className="pl-10"
        />
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* LEFT: Branch Tree */}
        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Doctrine Tree
            </CardTitle>
            <CardDescription className="text-xs">
              Organized by belief at divergence points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filteredBranches.map((branch) => (
              <BranchTreeItem
                key={branch.id}
                branch={branch}
                allBranches={branches || []}
                onSelect={(b) => setSelectedBranch(b)}
                isSelected={selectedBranch?.id === branch.id}
              />
            ))}
            {filteredBranches.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No doctrines match your search.
              </p>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Position View */}
        <div className="space-y-4">
          {selectedBranch ? (
            <>
              {/* Breadcrumb */}
              {breadcrumb.length > 1 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                  {breadcrumb.map((b, i) => (
                    <span key={b.id} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="w-3 h-3" />}
                      <button
                        onClick={() => setSelectedBranch(b)}
                        className={`hover:text-foreground ${
                          b.id === selectedBranch.id ? "text-foreground font-medium" : ""
                        }`}
                      >
                        {b.title}
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Branch Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">
                      {DOMAIN_LABELS[selectedBranch.domain as keyof typeof DOMAIN_LABELS]?.emoji}
                    </span>
                    {selectedBranch.title}
                  </CardTitle>
                  <CardDescription>{selectedBranch.description}</CardDescription>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">
                      <HelpCircle className="w-3 h-3 mr-1" />
                      {selectedBranch.divergencePoint}
                    </Badge>
                    {selectedBranch.divergenceEvent && (
                      <Badge variant="secondary" className="text-[10px]">
                        {selectedBranch.divergenceEvent}
                      </Badge>
                    )}
                    {selectedBranch.divergenceDate && (
                      <Badge variant="secondary" className="text-[10px]">
                        {selectedBranch.divergenceDate}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      <Globe className="w-3 h-3 mr-1" />
                      {selectedBranch.scope}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Three-Column Positions */}
              <FeatureTip
                tipId={TIP_IDS.DOCTRINE_THREE_COLUMNS}
                title="Three Columns"
                description="Each position shows what is Believed (theology), what is Taught (instruction), and what is Practiced (action). An empty 'Practiced' column shows Calls to Action."
                side="top"
              >
                <div className="space-y-4">
                  {positions && positions.length > 0 ? (
                    positions.map((pos) => (
                      <PositionCard
                        key={pos.id}
                        position={pos}
                        depth={depth}
                        onTermClick={handleTermClick}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          No positions documented yet for this doctrine.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Be the first to contribute — earn an Areopagus stamp.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </FeatureTip>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Doctrine</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Choose a doctrine from the tree to see all positions,
                  evidence, and the three columns: what is believed,
                  what is taught, and what is practiced.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dictionary Panel (slide-out) */}
      {dictPanelOpen && selectedTermId && (
        <DictionaryPanel
          termId={selectedTermId}
          onClose={() => {
            setDictPanelOpen(false);
            setSelectedTermId(null);
          }}
        />
      )}
    </div>
  );
}
