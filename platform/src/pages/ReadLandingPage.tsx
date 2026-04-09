import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BookOpenCheck, BookOpenText, DoorOpen, ScanLine } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type DeckCardRecord = {
  id: string;
  card_code?: string | null;
  card_type?: string | null;
  title?: string | null;
  hook_text?: string | null;
  deep_link_url?: string | null;
  paper_key?: string | null;
  section_anchor?: string | null;
};

type ScanResponse = {
  success?: boolean;
  is_member?: boolean;
  deep_link_url?: string;
  redirect_url?: string;
  error?: string;
};

export default function ReadLandingPage() {
  const { paperKey = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [card, setCard] = useState<DeckCardRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);

  const ref = searchParams.get("ref")?.trim() ?? "";
  const hashAnchor = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
  const sectionAnchor = card?.section_anchor || hashAnchor || "";
  const resolvedPaperKey = card?.paper_key || paperKey;

  const sourcePaperUrl = useMemo(() => {
    const base = `/economics/${encodeURIComponent(resolvedPaperKey)}`;
    return sectionAnchor ? `${base}#${encodeURIComponent(sectionAnchor)}` : base;
  }, [resolvedPaperKey, sectionAnchor]);

  const puddingUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (resolvedPaperKey) params.set("paper", resolvedPaperKey);
    if (sectionAnchor) params.set("section", sectionAnchor);
    return `/pudding${params.toString() ? `?${params.toString()}` : ""}`;
  }, [resolvedPaperKey, sectionAnchor]);

  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      setIsLoading(true);
      setScanError(null);

      try {
        if (!ref) {
          if (!isCancelled) setIsLoading(false);
          return;
        }

        const { data: foundCard, error: cardError } = await supabase
          .from("deck_cards" as never)
          .select("id, card_code, card_type, title, hook_text, deep_link_url, paper_key, section_anchor")
          .or(`id.eq.${ref},card_code.eq.${ref}`)
          .limit(1)
          .maybeSingle();
        if (cardError) throw cardError;

        if (!foundCard) {
          if (!isCancelled) {
            setScanError("No deck card was found for this reference code.");
            setIsLoading(false);
          }
          return;
        }

        const cardRecord = foundCard as unknown as DeckCardRecord;
        if (!isCancelled) setCard(cardRecord);

        const { data: scanData, error: scanInvokeError } = await supabase.functions.invoke(
          "track-deck-card-scan",
          {
            body: {
              card_id: cardRecord.id,
              scanned_by_member_id: user?.id ?? null,
            },
          },
        );

        if (scanInvokeError) throw scanInvokeError;
        const scan = (scanData ?? {}) as ScanResponse;
        if (scan.error) throw new Error(scan.error);
      } catch (error) {
        if (!isCancelled) {
          setScanError(error instanceof Error ? error.message : "Unable to track this scan.");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      isCancelled = true;
    };
  }, [ref, user?.id]);

  return (
    <PortalPageLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ScanLine className="h-6 w-6" />
              Proof is in the Pudding
            </CardTitle>
            <CardDescription>
              Deep-link landing for BST episodes and Skipping Stones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{resolvedPaperKey || "paper"}</Badge>
              {sectionAnchor ? <Badge variant="outline">#{sectionAnchor}</Badge> : null}
              {card?.card_type ? <Badge variant="outline">{card.card_type}</Badge> : null}
            </div>

            {card?.title ? <h2 className="text-lg font-semibold">{card.title}</h2> : null}
            {card?.hook_text ? <p className="text-sm text-muted-foreground">{card.hook_text}</p> : null}

            {scanError ? (
              <p className="text-sm text-destructive">{scanError}</p>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground">Tracking scan and preparing your reading path...</p>
            ) : null}
          </CardContent>
        </Card>

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5" />
                Continue Reading
              </CardTitle>
              <CardDescription>
                Your reading beacon is updated when this deck card is scanned.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={sourcePaperUrl}>Open Full Paper</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={puddingUrl}>Read the Pudding Layer</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Entry Point</CardTitle>
              <CardDescription>
                Read first, then join if you want your progress tracked.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Button variant="outline" asChild className="w-full">
                <Link to={puddingUrl}>
                  <BookOpenText className="mr-2 h-4 w-4" />
                  Read the Pudding
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to={sourcePaperUrl}>This is NOT Pudding</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to={`/join${card?.id ? `?card_id=${encodeURIComponent(card.id)}` : ""}`}>
                  <DoorOpen className="mr-2 h-4 w-4" />
                  Join to Track Reading
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground">
          Scanned by mistake? Return to <Link to="/" className="underline">home</Link>.
        </p>
      </div>
    </PortalPageLayout>
  );
}
