/**
 * STACK OVERFLOW FEED WIDGET
 * ===========================
 * Displays community Q&A from Stack Overflow for Liana Banyan.
 * Follows the same pattern as SubstackFeedWidget — fetch, cache, display.
 *
 * Two modes:
 *   - Feed mode: Shows latest questions with our tag
 *   - Search mode: Search within our tagged questions
 *
 * Used in: /support, Dashboard, Cold Start, Didasko learning pages
 *
 * Integration points:
 *   - Didasko: Tag-filtered tutorials ("lianabanyan" + "tutorial")
 *   - Harper Guild: Verified answers from team engineers
 *   - Dispatch: Support channel for onboarding
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Search,
  ArrowUpRight,
  HelpCircle,
  ThumbsUp,
  Eye,
  Plus,
} from "lucide-react";
import {
  fetchSOQuestionsCached,
  searchQuestions,
  formatSODate,
  generateAskUrl,
  SO_TAG_URL,
  LB_TAG,
  type SOQuestion,
  type SOSearchResult,
} from "@/lib/stackOverflowService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StackOverflowFeedWidgetProps {
  tag?: string;                  // Override default LB_TAG
  maxQuestions?: number;
  compact?: boolean;
  showHeader?: boolean;
  showSearch?: boolean;
  showAskButton?: boolean;
  extraTags?: string[];          // Additional tags to suggest when asking
  className?: string;
}

// ─── Question Row ─────────────────────────────────────────────────────────────

function QuestionRow({
  question,
  compact,
}: {
  question: SOQuestion;
  compact: boolean;
}) {
  return (
    <a
      href={question.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div
        className={`${
          compact ? "py-2" : "py-3"
        } border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors rounded-md px-2 -mx-2`}
      >
        <div className="flex items-start gap-3">
          {/* Vote/Answer indicator */}
          {!compact && (
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[44px] pt-0.5">
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <ThumbsUp className="h-3 w-3" />
                <span>{question.score}</span>
              </div>
              <div
                className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${
                  question.is_answered
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {question.is_answered ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <MessageSquare className="h-3 w-3" />
                )}
                <span>{question.answer_count}</span>
              </div>
            </div>
          )}

          {/* Question content */}
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium text-foreground group-hover:text-primary transition-colors leading-snug ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {question.is_answered && compact && (
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-emerald-500" />
              )}
              {question.title}
            </h4>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {formatSODate(question.creation_date)}
              </span>
              {question.owner?.display_name && (
                <span className="text-xs text-muted-foreground">
                  by {question.owner.display_name}
                </span>
              )}
              {!compact && question.view_count > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {question.view_count.toLocaleString()}
                </span>
              )}
            </div>

            {/* Tags */}
            {!compact && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {question.tags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${
                      tag === LB_TAG
                        ? "border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400"
                        : ""
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </div>
      </div>
    </a>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function StackOverflowFeedWidget({
  tag = LB_TAG,
  maxQuestions = 10,
  compact = false,
  showHeader = true,
  showSearch = true,
  showAskButton = true,
  extraTags = [],
  className = "",
}: StackOverflowFeedWidgetProps) {
  const [questions, setQuestions] = useState<SOQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);

  const loadQuestions = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        // Clear cache by fetching directly
        const { fetchQuestions: fetchDirect } = await import(
          "@/lib/stackOverflowService"
        );
        const result = await fetchDirect({ tag, pageSize: maxQuestions });
        setQuestions(result.items || []);
        setQuotaRemaining(result.quota_remaining);
        const { cacheApiQuestions } = await import(
          "@/lib/stackOverflowService"
        );
        cacheApiQuestions(tag, "activity", result);
      } else {
        const result = await fetchSOQuestionsCached(tag, "activity");
        setQuestions((result.items || []).slice(0, maxQuestions));
        setQuotaRemaining(result.quota_remaining);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadQuestions();
      return;
    }

    setSearching(true);
    try {
      const result = await searchQuestions(searchQuery.trim(), tag);
      setQuestions(result.items || []);
      setQuotaRemaining(result.quota_remaining);
      setError(null);
    } catch (err) {
      setError("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [tag, maxQuestions]);

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-4/5" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────

  if (error && questions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Could not load community Q&A
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The tag may not exist yet, or the API quota may be exhausted.
          </p>
          <div className="flex gap-2 justify-center mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                loadQuestions();
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
            <a href={SO_TAG_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" /> View on Stack Overflow
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className={compact ? "pb-2 pt-4 px-4" : "pb-3"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                <svg
                  className="h-4 w-4 text-orange-600 dark:text-orange-400"
                  viewBox="0 0 120 120"
                  fill="currentColor"
                >
                  <path d="M84.4 93.8V70.6h7.7v30.9H22.6V70.6h7.7v23.2z" />
                  <path d="M38.8 68.4l37.8 7.9 1.6-7.6-37.8-7.9-1.6 7.6zm5-18.1l35 16.3 3.2-7-35-16.4-3.2 7.1zm9.7-17.2l29.7 24.7 4.9-5.9-29.7-24.7-4.9 5.9zm19.2-18.3l-6.2 4.6 23 31 6.2-4.6-23-31zM38 86h38.6v-7.7H38V86z" />
                </svg>
              </div>
              <div>
                <CardTitle className={compact ? "text-sm" : "text-base"}>
                  Community Support
                </CardTitle>
                {!compact && (
                  <CardDescription className="text-xs">
                    Questions tagged [{tag}] on Stack Overflow
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {quotaRemaining !== null && quotaRemaining < 50 && (
                <Badge variant="outline" className="text-[10px] text-amber-600">
                  {quotaRemaining} API calls left
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadQuestions(true)}
                disabled={refreshing}
                className="h-7 w-7 p-0"
              >
                <RefreshCw
                  className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <a href={SO_TAG_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={compact ? "px-4 pb-4 pt-0" : "pt-0"}>
        {/* Search bar */}
        {showSearch && (
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search community questions..."
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              disabled={searching}
              className="h-8"
            >
              {searching ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        )}

        {/* Question list */}
        {questions.length > 0 ? (
          <div>
            {questions.map((q) => (
              <QuestionRow
                key={q.question_id}
                question={q}
                compact={compact}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No questions yet with the [{tag}] tag
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to ask! Questions build the community knowledge base.
            </p>
          </div>
        )}

        {/* Ask a Question button */}
        {showAskButton && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <a
              href={generateAskUrl(extraTags)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full text-sm group"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Ask a Question on Stack Overflow
                <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StackOverflowFeedWidget;
