/**
 * DICTIONARY PANEL
 * ================
 * Slide-out panel showing all definitions for a term.
 * Shows WHY traditions disagree — different definitions of the same word.
 *
 * "eis" in Acts 2:38: "for the purpose of" vs "because of" vs "into"
 * Same word. Different definition. Different doctrine. Now you decide.
 *
 * Innovation #1519 — Areopagus Dictionary Panel (Session 7D)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X, BookOpen, Languages, GraduationCap, BookMarked,
  ArrowRight, Quote, ChevronRight,
} from "lucide-react";
import {
  type AreopagusTerm,
  type TermDefinition,
  type LexiconEntry,
  type ScriptureOccurrence,
  SCHOLAR_LEVEL_LABELS,
  type ScholarLevel,
} from "@/lib/areopagusDoctrine";

interface DictionaryPanelProps {
  termId: string;
  onClose: () => void;
}

export default function DictionaryPanel({ termId, onClose }: DictionaryPanelProps) {
  // Load term
  const { data: term } = useQuery({
    queryKey: ["areopagus-term", termId],
    queryFn: async () => {
      const { data } = await supabase
        .from("areopagus_dictionary")
        .select("*")
        .eq("id", termId)
        .single();
      return data as unknown as AreopagusTerm | null;
    },
  });

  if (!term) {
    return (
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-background border-l shadow-2xl z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const definitions = (term.definitions || []) as TermDefinition[];
  const lexicons = (term.lexiconEntries || []) as LexiconEntry[];
  const occurrences = (term.scriptureOccurrences || []) as ScriptureOccurrence[];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-background border-l shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <span className="text-2xl font-serif">{term.originalScript}</span>
                <span className="text-muted-foreground font-normal text-sm">
                  ({term.transliteration})
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {term.originalLanguage}
                {term.pronunciation && ` • ${term.pronunciation}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Etymology */}
        {(term.rootWord || term.historicalEvolution) && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Etymology
            </h3>
            {term.rootWord && (
              <p className="text-sm">
                <span className="text-muted-foreground">Root: </span>
                {term.rootWord}
              </p>
            )}
            {term.historicalEvolution && (
              <p className="text-sm text-muted-foreground">{term.historicalEvolution}</p>
            )}
            {term.cognates && term.cognates.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {term.cognates.map((c, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ALL DEFINITIONS ─── */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Definitions — Who Uses Which and Why
          </h3>

          {definitions.map((def, i) => {
            const scholarInfo = SCHOLAR_LEVEL_LABELS[def.scholarLevel as ScholarLevel];
            return (
              <Card key={def.id || i} className="overflow-hidden">
                <CardHeader className="pb-2 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">
                      {"\u201C"}{def.definition}{"\u201D"}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${scholarInfo?.color || ""}`}
                    >
                      {scholarInfo?.label || def.scholarLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  {/* Usage context */}
                  <p className="text-xs text-muted-foreground">{def.usageContext}</p>

                  {/* Traditions using this definition */}
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Used by:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {def.traditions.map((t, j) => (
                        <Badge key={j} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Doctrinal implication */}
                  <div className="p-2 rounded bg-primary/5 border border-primary/10">
                    <span className="text-[10px] font-semibold text-primary uppercase">
                      Doctrinal Implication:
                    </span>
                    <p className="text-xs mt-0.5">{def.doctrinalImplication}</p>
                  </div>

                  {/* Contextual argument */}
                  {def.contextualArgument && (
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Argument:
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {def.contextualArgument}
                      </p>
                    </div>
                  )}

                  {/* Counter-arguments */}
                  {def.counterArguments && def.counterArguments.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Counter-arguments:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {def.counterArguments.map((ca, k) => (
                          <li key={k} className="text-xs text-muted-foreground flex items-start gap-1">
                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                            {ca}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lexicon support */}
                  {def.lexiconSupport && def.lexiconSupport.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {def.lexiconSupport.map((ls, k) => (
                        <Badge key={k} variant="outline" className="text-[10px]">
                          <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                          {ls}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ─── SCRIPTURE OCCURRENCES ─── */}
        {occurrences.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Quote className="w-3.5 h-3.5" />
              Scripture Occurrences
            </h3>

            {occurrences.map((occ, i) => (
              <Card key={i}>
                <CardContent className="py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-[10px]">
                      {occ.reference?.book} {occ.reference?.chapter}:{occ.reference?.verse}
                    </Badge>
                  </div>
                  <p className="text-sm italic text-muted-foreground">
                    {"\u201C"}{occ.contextQuote}{"\u201D"}
                  </p>
                  {/* Translation comparison */}
                  {occ.translationComparison && occ.translationComparison.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Translation Comparison:
                      </span>
                      {occ.translationComparison.map((tv, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Badge variant="outline" className="text-[10px] w-12 justify-center">
                            {tv.translation}
                          </Badge>
                          <span className="text-muted-foreground">
                            {"\u201C"}{tv.rendering}{"\u201D"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ─── LEXICON ENTRIES ─── */}
        {lexicons.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <BookMarked className="w-3.5 h-3.5" />
              Academic Lexicons
            </h3>
            {lexicons.map((lex, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30">
                <Badge variant={lex.isAcademicStandard ? "default" : "outline"} className="text-[10px] shrink-0">
                  {lex.lexiconName}
                </Badge>
                <div>
                  {lex.entryNumber && (
                    <span className="text-muted-foreground">[{lex.entryNumber}] </span>
                  )}
                  <span>{lex.definition}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── "Now you decide" footer ─── */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 text-center">
          <p className="text-sm text-muted-foreground italic">
            Same word. Different definitions. Different doctrines.
          </p>
          <p className="text-sm font-medium mt-1">
            Now you decide.
          </p>
        </div>
      </div>
    </div>
  );
}
