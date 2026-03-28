/**
 * FRIEND PAGE — The Warp Room
 * ============================
 * /friend — Where "friend words" from Durin's Door lead.
 *
 * Shows all 58+ languages with their word for "Friend."
 * Clicking any language:
 *   1. Switches the page to render IN that language
 *   2. Shows translation help request (earn Marks)
 *   3. Displays platform highlights (Wildfire shorts)
 *
 * Like Super Mario warp tunnels on World 3 — you enter
 * saying "friend" and you see all the places you can go.
 *
 * The implicit message: "We made a place and a consideration
 * for you, without explicitly saying that."
 */

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Globe2,
  Languages,
  Search,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ── Translation status (static for now — will be data-driven later) ──

type TranslationStatus = "complete" | "partial" | "needs_translators";

const TRANSLATION_STATUS: Record<string, TranslationStatus> = {
  en: "complete",
  es: "partial",
  fr: "partial",
  // Everything else defaults to "needs_translators"
};

function getStatus(code: string): TranslationStatus {
  return TRANSLATION_STATUS[code] || "needs_translators";
}

function getStatusBadge(status: TranslationStatus) {
  switch (status) {
    case "complete":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 text-[10px]">
          <CheckCircle2 className="h-3 w-3 mr-0.5" />
          Complete
        </Badge>
      );
    case "partial":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 text-[10px]">
          <AlertCircle className="h-3 w-3 mr-0.5" />
          Corrections Needed
        </Badge>
      );
    case "needs_translators":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800 text-[10px]">
          <Languages className="h-3 w-3 mr-0.5" />
          Needs Translators
        </Badge>
      );
  }
}

// ── Component ──

export default function FriendPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const fromDoor = (location.state as any)?.fromDoor === true;
  const incomingLang = (location.state as any)?.language as string | undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState<string | null>(
    incomingLang || null,
  );

  // Filter languages by search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        (lang.friendWord && lang.friendWord.toLowerCase().includes(q)) ||
        lang.code.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Switch to selected language
  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  const selectedLangInfo = selectedLang
    ? SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)
    : null;

  return (
    <PortalPageLayout>
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(fromDoor ? "/durins-door" : -1 as any)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {fromDoor ? "Back to Door" : t("common.goBack")}
        </Button>
      </div>

      <div className="text-center mb-10">
        <Globe2 className="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t("friendPage.title")}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
          {t("friendPage.subtitle")}
        </p>
      </div>

      {/* ═══ SELECTED LANGUAGE DETAIL CARD ═══ */}
      {selectedLangInfo && (
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedLangInfo.nativeName}
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    ({selectedLangInfo.name})
                  </span>
                </h2>
                {selectedLangInfo.friendWord && (
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mt-1">
                    "{selectedLangInfo.friendWord}" = Friend
                  </p>
                )}
                <div className="mt-2">
                  {getStatusBadge(getStatus(selectedLangInfo.code))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedLang(null);
                    i18n.changeLanguage("en");
                  }}
                >
                  Back to All
                </Button>
              </div>
            </div>

            {/* Translation help request */}
            <div className="mt-6 space-y-4">
              {getStatus(selectedLangInfo.code) === "needs_translators" ? (
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {t("friendPage.translationsMissing")}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {t("friendPage.needTranslators")}
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Award className="h-3.5 w-3.5" />
                        {t("friendPage.becomeTranslator")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : getStatus(selectedLangInfo.code) === "partial" ? (
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-amber-100 dark:border-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {t("friendPage.needCorrections")}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Help verify existing translations and fill in gaps. Earn
                        Marks for every correction you contribute.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 gap-1.5"
                      >
                        <Languages className="h-3.5 w-3.5" />
                        {t("friendPage.helpTranslate")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Translation complete
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        This language is fully translated and verified. Thank you
                        to all contributors!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform highlights — "Wildfire shorts" */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Platform Highlights
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded border">
                    <p className="font-medium text-slate-900 dark:text-white">
                      Cost + 20%
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Every price is transparent. No hidden fees.
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded border">
                    <p className="font-medium text-slate-900 dark:text-white">
                      1,511 Patent Claims
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your work is protected by the portfolio.
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded border">
                    <p className="font-medium text-slate-900 dark:text-white">
                      Three Currencies
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Credits, Marks, Joules — all equal value.
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded border">
                    <p className="font-medium text-slate-900 dark:text-white">
                      $5 Entry
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Not a barrier — a commitment. Everyone can participate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ SEARCH ═══ */}
      <div className="flex items-center gap-2 mb-6 max-w-md mx-auto">
        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <Input
          placeholder="Search by language, native name, or friend word..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* ═══ LANGUAGE GRID ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredLanguages.map((lang) => {
          const isSelected = selectedLang === lang.code;
          const status = getStatus(lang.code);
          return (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md"
                    : "border-transparent bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                }
              `}
            >
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {lang.nativeName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {lang.name}
              </p>
              {lang.friendWord && (
                <p
                  className={`text-xs mt-1 font-medium truncate ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400"
                  }`}
                >
                  "{lang.friendWord}"
                </p>
              )}
              {/* Status dot */}
              <div className="mt-1.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    status === "complete"
                      ? "bg-emerald-500"
                      : status === "partial"
                        ? "bg-amber-500"
                        : "bg-blue-400"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══ LEGEND ═══ */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Complete
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Corrections Needed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Needs Translators
        </span>
      </div>

      {/* ═══ FOOTER CTA ═══ */}
      <div className="text-center mt-10">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          {SUPPORTED_LANGUAGES.length} languages. One door. Everyone welcome.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/durins-door")}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Durin's Door
        </Button>
      </div>
    </PortalPageLayout>
  );
}
