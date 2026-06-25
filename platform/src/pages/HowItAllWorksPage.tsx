/**
 * HowItAllWorksPage -- Renderer #1: Full-page subsystem explainer browser.
 * Route: /how-it-all-works
 *
 * Shows all 22 subsystems in a searchable, filterable grid.
 * Each card is depth-switchable (Skipping Stones / Wading In / Deep Dive).
 * Narrator portraits are shown per depth.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SubsystemExplainerCard } from "@/components/explainer/SubsystemExplainerCard";
import { DepthSwitcher } from "@/components/explainer/DepthSwitcher";
import ShareCardButton from "@/components/ShareCardButton";
import { supabase } from "@/integrations/supabase/client";
import {
  EXPLAINER_CORPUS,
  CORPUS_MANIFEST,
  getExplainersByHost,
  getExplainersByTag,
} from "@/data/explainerCorpus";
import type { DepthLayer } from "@/data/explainerCorpus";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Grid, List, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_TAGS = Array.from(
  new Set(EXPLAINER_CORPUS.flatMap((e) => e.tags ?? []))
).sort();

type ViewMode = "grid" | "list";

export default function HowItAllWorksPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [globalDepth, setGlobalDepth] = useState<DepthLayer>("skipping-stones");
  const [view, setView] = useState<ViewMode>("grid");
  const [hostFilter, setHostFilter] = useState<"all" | "lrh" | "denken">("all");
  const { t } = useTranslation();

  // BP094 Mamba 6 - URL-hash landing + sender attribution banner
  const [senderName, setSenderName] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const focusedCardRef = useRef<string | null>(null);

  useEffect(() => {
    // Parse hash: #card-<cardId>?send=<memberId>
    const rawHash = window.location.hash;
    const search = rawHash.includes("?")
      ? rawHash.slice(rawHash.indexOf("?"))
      : window.location.search;
    const params = new URLSearchParams(search);
    const senderId = params.get("send");
    const rawCardId = rawHash.replace("#card-", "").split("?")[0];
    if (rawCardId && rawCardId.length > 2) {
      focusedCardRef.current = rawCardId;
      // Scroll to card after render
      setTimeout(() => {
        const el = document.getElementById(`explainer-card-${rawCardId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Switch global depth to deep-dive so the card opens to Deep Dive
          setGlobalDepth("deep-dive");
        }
      }, 300);
    }
    if (senderId && senderId !== "anon") {
      // Fetch sender display name from profiles via anon client
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", senderId)
        .maybeSingle()
        .then(({ data }) => {
          setSenderName(
            data?.display_name
              ? String(data.display_name)
              : "a cooperative member"
          );
        })
        .catch(() => setSenderName("a cooperative member"));
    }
  }, []);

  const filtered = useMemo(() => {
    let results = EXPLAINER_CORPUS;
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (e) =>
          e.subsystem.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.includes(q))
      );
    }
    if (activeTag) {
      results = results.filter((e) => e.tags?.includes(activeTag));
    }
    if (hostFilter !== "all") {
      results = results.filter((e) => e.host === hostFilter);
    }
    return results;
  }, [query, activeTag, hostFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* BP094 Mamba 6 - Sender attribution banner (shown only when ?send= param present) */}
      {senderName && !bannerDismissed && (
        <div className="bg-primary/10 border-b border-primary/30 px-4 py-2 flex items-center justify-between gap-4">
          <span className="text-sm text-primary">
            Sent by <strong>{senderName}</strong> - a cooperative member who thought you should know about this.
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="border-b bg-gradient-to-br from-amber-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start gap-4 mb-6">
            <BookOpen className="h-10 w-10 text-amber-600 shrink-0 mt-1" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {t("howItAllWorks.title")}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {t("howItAllWorks.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">22</span> subsystems
                </span>
                <span>-</span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">3</span> depths each
                </span>
                <span>-</span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">2,270</span> innovations tracked
                </span>
                <span>-</span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">228</span> Crown Jewels
                </span>
              </div>
            </div>
          </div>

          {/* Global depth switcher */}
          <div className="max-w-lg">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Set depth for all cards
            </p>
            <DepthSwitcher current={globalDepth} onChange={setGlobalDepth} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("howItAllWorks.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Host filter */}
          <div className="flex rounded-lg border overflow-hidden text-xs">
            {(["all", "lrh", "denken"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHostFilter(h)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  hostFilter === h
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {h === "all" ? "All" : h === "lrh" ? "LRH (South)" : "Denken (North)"}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full border transition-colors",
                  activeTag === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="ml-auto flex gap-1">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="max-w-7xl mx-auto px-4 pb-2">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {EXPLAINER_CORPUS.length} subsystems
          </p>
        </div>
      </div>

      {/* Subsystem grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No subsystems match your filters.</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setActiveTag(null);
                setHostFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              view === "grid"
                ? "grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-4"
            )}
          >
            {filtered.map((explainer) => (
              <div
                key={explainer.id}
                id={`explainer-card-${explainer.id}`}
              >
                <SubsystemExplainerCard
                  explainer={explainer}
                  initialDepth={
                    focusedCardRef.current === explainer.id
                      ? "deep-dive"
                      : globalDepth
                  }
                  mode="card"
                  showCrossRefs={view === "list"}
                  deepDiveExtra={
                    <ShareCardButton
                      cardId={explainer.id}
                      cardTitle={explainer.subsystem}
                    />
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Corpus manifest footer */}
      <div className="border-t bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Corpus Manifest
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {CORPUS_MANIFEST.map((entry) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <span className="font-mono text-[10px] text-muted-foreground/60 w-5 shrink-0">
                  {entry.number.toString().padStart(2, "0")}
                </span>
                <span className="truncate">{entry.subsystem}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
