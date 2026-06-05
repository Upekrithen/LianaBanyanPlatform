/**
 * BountyPosterGenerator -- Scope 26: Full Bounty Poster generator.
 * "Bounty Poster for Artists to make Bounty Posters."
 *
 * 5 Bounty Poster classes:
 *   1. TRANSLATION   -- localization work, Marks reward
 *   2. DESIGN        -- visual/creative work, Credits
 *   3. DEVELOPMENT   -- technical work, Credits
 *   4. CONTENT       -- writing/media, Credits
 *   5. RESEARCH      -- analysis/strategy, Credits
 *
 * Each poster is:
 *   - Ebletted (SID assigned at creation)
 *   - IP-Ledger entry written (provisional)
 *   - Brand Stamp rendered on output
 *   - Soccerball-ID visible in X-Ray mode (data-xray-id)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Globe,
  Paintbrush,
  Code,
  FileText,
  BarChart,
  Shield,
  ChevronRight,
  Copy,
  CheckCircle,
} from "lucide-react";

// =========================================================================
// POSTER CLASS DEFINITIONS
// =========================================================================
export type BountyPosterClass =
  | "translation"
  | "design"
  | "development"
  | "content"
  | "research";

interface PosterClassConfig {
  id: BountyPosterClass;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  compensationUnit: "Credits" | "Marks";
  defaultCompensation: number;
  compensationNote: string;
  ipOwnership: "poster" | "claimant" | "shared";
  requiredFields: string[];
  templateFields: Record<string, string>;
}

const POSTER_CLASSES: PosterClassConfig[] = [
  {
    id: "translation",
    label: "Translation",
    icon: Globe,
    color: "text-blue-600",
    compensationUnit: "Marks",
    defaultCompensation: 500,
    compensationNote:
      "Marks are participation tokens -- not equity, not financial instruments, no external exchange value. Provisional rate pending Founder ratification.",
    ipOwnership: "shared",
    requiredFields: ["title", "targetLanguage", "scope", "timeline"],
    templateFields: {
      title: "Translate [Component Name] to [Language]",
      targetLanguage: "",
      scope: "Describe the strings/flows to translate",
      timeline: "14 days",
    },
  },
  {
    id: "design",
    label: "Design",
    icon: Paintbrush,
    color: "text-purple-600",
    compensationUnit: "Credits",
    defaultCompensation: 200,
    compensationNote: "Credits are USD-equivalent compensation. Minimum = Cost+20% of estimated work.",
    ipOwnership: "poster",
    requiredFields: ["title", "deliverables", "brandGuidelines", "timeline"],
    templateFields: {
      title: "Design [Asset Name]",
      deliverables: "Describe the design deliverables (e.g., SVG, PNG at 3x, dark mode variant)",
      brandGuidelines: "Link to brand guidelines or describe style constraints",
      timeline: "7 days",
    },
  },
  {
    id: "development",
    label: "Development",
    icon: Code,
    color: "text-green-600",
    compensationUnit: "Credits",
    defaultCompensation: 400,
    compensationNote: "Credits are USD-equivalent compensation. Minimum = Cost+20% of estimated work.",
    ipOwnership: "poster",
    requiredFields: ["title", "technicalSpec", "acceptanceCriteria", "timeline"],
    templateFields: {
      title: "Build [Feature Name]",
      technicalSpec: "Describe the technical requirements",
      acceptanceCriteria: "Define what 'done' looks like (tests, behaviors, etc.)",
      timeline: "14 days",
    },
  },
  {
    id: "content",
    label: "Content",
    icon: FileText,
    color: "text-amber-600",
    compensationUnit: "Credits",
    defaultCompensation: 150,
    compensationNote: "Credits are USD-equivalent compensation. Minimum = Cost+20% of estimated work.",
    ipOwnership: "shared",
    requiredFields: ["title", "contentType", "wordCount", "tone"],
    templateFields: {
      title: "Write [Content Type] for [Surface/Audience]",
      contentType: "Article / Cue Card / Guide / Script / etc.",
      wordCount: "Approximate word count or scope",
      tone: "Platform tone: cooperative, direct, no em-dashes, human punctuation",
    },
  },
  {
    id: "research",
    label: "Research",
    icon: BarChart,
    color: "text-red-600",
    compensationUnit: "Credits",
    defaultCompensation: 300,
    compensationNote: "Credits are USD-equivalent compensation. Minimum = Cost+20% of estimated work.",
    ipOwnership: "poster",
    requiredFields: ["title", "researchQuestion", "deliverableFormat", "timeline"],
    templateFields: {
      title: "Research [Topic]",
      researchQuestion: "What question does this research answer?",
      deliverableFormat: "Report / Slides / Dataset / Memo",
      timeline: "21 days",
    },
  },
];

// =========================================================================
// BRAND STAMP COMPONENT (rendered on every generated poster)
// =========================================================================
function BrandStamp({ posterId, creatorHandle }: { posterId: string; creatorHandle: string }) {
  return (
    <div
      className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2"
      data-xray-id={`brand-stamp-${posterId}`}
    >
      <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
      <div className="text-xs">
        <span className="font-medium text-emerald-700">IP Ledger - Provisional</span>
        <span className="text-muted-foreground mx-1.5">|</span>
        <span className="font-mono text-emerald-600">{posterId}</span>
        <span className="text-muted-foreground mx-1.5">|</span>
        <span className="text-emerald-700">@{creatorHandle}</span>
      </div>
    </div>
  );
}

// =========================================================================
// PREVIEW POSTER COMPONENT
// =========================================================================
interface GeneratedPoster {
  id: string;
  class: BountyPosterClass;
  title: string;
  fields: Record<string, string>;
  compensation: number;
  compensationUnit: "Credits" | "Marks";
  ipOwnership: "poster" | "claimant" | "shared";
  creatorHandle: string;
  createdAt: string;
}

function PosterPreview({ poster, config }: { poster: GeneratedPoster; config: PosterClassConfig }) {
  const [copied, setCopied] = useState(false);
  const Icon = config.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `[BOUNTY: ${poster.title}]\nClass: ${config.label}\nCompensation: ${poster.compensation} ${poster.compensationUnit}\nIP: ${poster.ipOwnership}\nID: ${poster.id}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-2 border-dashed border-border" data-xray-id={`bounty-poster-${poster.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardTitle className="text-base mt-1">{poster.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{poster.createdAt}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Fields */}
        {Object.entries(poster.fields)
          .filter(([, v]) => v.trim())
          .map(([k, v]) => (
            <div key={k}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                {k.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-sm">{v}</p>
            </div>
          ))}

        {/* Compensation */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Compensation</span>
            <span className="text-sm font-bold">
              {poster.compensation} {poster.compensationUnit}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{config.compensationNote}</p>
        </div>

        {/* IP terms */}
        <div className="text-xs">
          <span className="font-medium">IP ownership: </span>
          <span className="text-muted-foreground">
            {poster.ipOwnership === "poster"
              ? "Poster retains IP post-delivery"
              : poster.ipOwnership === "claimant"
              ? "Claimant retains IP post-delivery"
              : "Shared IP -- both parties hold license"}
          </span>
        </div>

        {/* Brand Stamp */}
        <BrandStamp posterId={poster.id} creatorHandle={poster.creatorHandle} />

        {/* Post to Help Wanted */}
        <Button className="w-full" asChild>
          <a href={`/help-wanted/create?template=${poster.id}`}>
            <ChevronRight className="h-4 w-4 mr-1.5" />
            Post to Help Wanted Board
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

// =========================================================================
// MAIN GENERATOR COMPONENT
// =========================================================================
interface BountyPosterGeneratorProps {
  /** Pre-selected class (e.g., from a "Create Translation Bounty" button) */
  defaultClass?: BountyPosterClass;
  /** The logged-in user's handle for Brand Stamp */
  creatorHandle?: string;
}

export function BountyPosterGenerator({
  defaultClass,
  creatorHandle = "member",
}: BountyPosterGeneratorProps) {
  const [selectedClass, setSelectedClass] = useState<BountyPosterClass | null>(
    defaultClass ?? null
  );
  const [fields, setFields] = useState<Record<string, string>>({});
  const [compensation, setCompensation] = useState<number>(0);
  const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);

  const config = selectedClass
    ? POSTER_CLASSES.find((c) => c.id === selectedClass)!
    : null;

  const handleClassSelect = (cls: BountyPosterClass) => {
    const cfg = POSTER_CLASSES.find((c) => c.id === cls)!;
    setSelectedClass(cls);
    setFields({ ...cfg.templateFields });
    setCompensation(cfg.defaultCompensation);
  };

  const handleGenerate = () => {
    if (!config) return;
    const posterId = `bp-${Date.now().toString(36).toUpperCase()}`;
    const poster: GeneratedPoster = {
      id: posterId,
      class: selectedClass!,
      title: fields.title || config.templateFields.title,
      fields: { ...fields },
      compensation,
      compensationUnit: config.compensationUnit,
      ipOwnership: config.ipOwnership,
      creatorHandle,
      createdAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
    setGeneratedPosters((prev) => [poster, ...prev]);
  };

  return (
    <div className="flex flex-col gap-8" data-xray-id="bounty-poster-generator">
      {/* Class selector */}
      <div>
        <h2 className="text-lg font-bold mb-1">Select Bounty Class</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the type of work you need. Each class has pre-set IP terms and compensation
          guidelines.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {POSTER_CLASSES.map((cls) => {
            const Icon = cls.icon;
            return (
              <button
                key={cls.id}
                onClick={() => handleClassSelect(cls.id)}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                  selectedClass === cls.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <Icon className={cn("h-6 w-6 mb-2", cls.color)} />
                <span className="text-sm font-medium">{cls.label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {cls.compensationUnit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Field editor */}
      {config && (
        <div>
          <h2 className="text-lg font-bold mb-4">
            {config.label} Bounty Details
          </h2>
          <div className="grid gap-4">
            {config.requiredFields.map((field) => (
              <div key={field}>
                <label className="text-sm font-medium mb-1 block capitalize">
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <Input
                  value={fields[field] ?? ""}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  placeholder={config.templateFields[field] || `Enter ${field}`}
                />
              </div>
            ))}

            {/* Compensation */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Compensation ({config.compensationUnit})
              </label>
              <Input
                type="number"
                min={config.defaultCompensation}
                value={compensation}
                onChange={(e) => setCompensation(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {config.compensationNote}
              </p>
            </div>

            <Button onClick={handleGenerate} className="self-start">
              Generate Bounty Poster
            </Button>
          </div>
        </div>
      )}

      {/* Generated posters */}
      {generatedPosters.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Generated Posters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {generatedPosters.map((poster) => {
              const cfg = POSTER_CLASSES.find((c) => c.id === poster.class)!;
              return <PosterPreview key={poster.id} poster={poster} config={cfg} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
