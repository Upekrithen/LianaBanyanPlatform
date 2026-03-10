/**
 * DURIN'S DOOR — The International Portal & Password Gate
 * ========================================================
 * the2ndsecond.com/durins-door | lianabanyan.com/durins-door
 *
 * Password system:
 *   - Uses tryPasswordAnywhere() for multi-door, multi-language validation
 *   - "Thinking words" (denken, pensar, penser...) switch the UI language
 *   - "Friend words" (mellon, amigo, freund...) open the Warp Room
 *   - Golden Keys have Mark numbers on handles (visual)
 *   - Snow Doors have snowflake corner seals (visual distinction)
 *   - 3 wrong tries → random destination from A-E, no repeats until exhausted
 *
 * Keyhole visual: the "O" in "DOOR" contains a keyhole SVG
 *
 * All content SEC-safe.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Globe2,
  Languages,
  Key,
  ArrowRight,
  ArrowLeft,
  Search,
  BookOpen,
  Snowflake,
  Sparkles,
  MapPin,
  Lock,
  Unlock,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  tryPasswordAnywhere,
  markPasswordFound,
  setLanguageFromDoor,
  getFoundPasswords,
  getTierColor,
  getTierLabel,
  getNextWrongTryDestination,
  incrementWrongTryCount,
  resetWrongTryCount,
  type WrongTryDestination,
} from "@/lib/durinsDoor";
import {
  THINKING_WORD_MAP,
  FRIEND_WORD_MAP,
  SUPPORTED_LANGUAGES,
} from "@/i18n";

// ── Wrong-try result state ──

interface WrongTryState {
  active: boolean;
  destination: WrongTryDestination | null;
  count: number;
}

// ── Door unlock result state ──

interface UnlockResult {
  doorName: string;
  doorIcon: string;
  passwordTier: string;
  tierColor: string;
  unlocks: string;
  reward: { credits: number; marks: number; joules: number };
  language: string;
  isSnowDoor: boolean;
  isFriendWord: boolean;
  isThinkingWord: boolean;
  matchedLanguage?: string;
}

// ── Keyhole SVG (embedded in the "O" of D-O-O-R) ──

function KeyholeSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 60"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Circle top */}
      <circle cx="20" cy="18" r="10" />
      {/* Trapezoid bottom */}
      <polygon points="12,24 28,24 24,55 16,55" />
    </svg>
  );
}

// ── Main Component ──

export default function DurinsDoor() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [passphrase, setPassphrase] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockResult, setUnlockResult] = useState<UnlockResult | null>(null);
  const [wrongTry, setWrongTry] = useState<WrongTryState>({
    active: false,
    destination: null,
    count: 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [attemptsThisSession, setAttemptsThisSession] = useState(0);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset wrong-try display after 8 seconds
  useEffect(() => {
    if (wrongTry.active) {
      const timer = setTimeout(() => {
        setWrongTry((prev) => ({ ...prev, active: false }));
        inputRef.current?.focus();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [wrongTry.active]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!passphrase.trim() || isUnlocking) return;

      const normalized = passphrase.trim().toLowerCase();
      setIsUnlocking(true);

      // 1. Check for "thinking words" → language switch
      const thinkingLang = THINKING_WORD_MAP[normalized];
      if (thinkingLang) {
        i18n.changeLanguage(thinkingLang);
        const langInfo = SUPPORTED_LANGUAGES.find(
          (l) => l.code === thinkingLang,
        );
        toast({
          title: t("durinsDoor.languageChanged", {
            language: langInfo?.nativeName || thinkingLang,
          }),
          description: `"${passphrase}" → ${langInfo?.name || thinkingLang}`,
        });
        setPassphrase("");
        setIsUnlocking(false);
        return;
      }

      // 2. Check for "friend words" → Warp Room
      const friendLang = FRIEND_WORD_MAP[normalized];
      if (friendLang) {
        resetWrongTryCount();
        toast({
          title: t("durinsDoor.doorOpens"),
          description: `"${passphrase}" — Welcome, friend.`,
        });
        setTimeout(() => {
          setIsUnlocking(false);
          navigate("/friend", { state: { fromDoor: true, language: friendLang } });
        }, 1200);
        return;
      }

      // 3. Try password against all doors
      const result = tryPasswordAnywhere(passphrase);

      if (result) {
        // SUCCESS — door unlocked
        const { door, password } = result;
        markPasswordFound(door.doorId, password.word);
        setLanguageFromDoor(password.language);
        resetWrongTryCount();

        setUnlockResult({
          doorName: door.name,
          doorIcon: door.icon,
          passwordTier: getTierLabel(password.tier),
          tierColor: getTierColor(password.tier),
          unlocks: password.unlocks,
          reward: password.reward,
          language: password.language,
          isSnowDoor: door.doorId === "snow-door",
          isFriendWord: false,
          isThinkingWord: false,
        });

        toast({
          title: t("durinsDoor.doorOpens"),
          description: `${door.name} — ${password.unlocks}`,
        });

        setPassphrase("");
        setIsUnlocking(false);
      } else {
        // WRONG — increment counter, show random destination
        const count = incrementWrongTryCount();
        setAttemptsThisSession((prev) => prev + 1);

        if (count % 3 === 0) {
          // Every 3rd wrong try → random destination
          const dest = getNextWrongTryDestination();
          setWrongTry({ active: true, destination: dest, count });
        }

        toast({
          title: t("durinsDoor.wrongPassword"),
          description:
            count % 3 === 0
              ? "The stone shifts... you stumble into a passage."
              : t("durinsDoor.attemptsRemaining", {
                  count: 3 - (count % 3),
                }),
          variant: "destructive",
        });

        setPassphrase("");
        setIsUnlocking(false);
      }
    },
    [passphrase, isUnlocking, i18n, t, toast, navigate],
  );

  const foundPasswords = getFoundPasswords();

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      {/* ═══ HEADER with Keyhole in the O ═══ */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-800 rounded-full text-slate-100">
          <Globe2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-baseline gap-0.5">
            <span>Durin's D</span>
            {/* The O contains a keyhole */}
            <span className="relative inline-block">
              <span className="opacity-0">o</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative w-[1.1em] h-[1.1em] rounded-full border-[3px] border-slate-900 dark:border-white flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <KeyholeSVG className="w-3 h-5 text-slate-900 dark:text-white" />
                </span>
              </span>
            </span>
            <span>or</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t("durinsDoor.speakFriendAndEnter")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ═══ LEFT COLUMN: The Door ═══ */}
        <div className="space-y-6">
          {/* Wrong-try destination overlay */}
          {wrongTry.active && wrongTry.destination && (
            <Card className="border-2 border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/30 animate-in fade-in duration-500">
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-4xl">{wrongTry.destination.icon}</div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                  {wrongTry.destination.title}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 italic">
                  {wrongTry.destination.description}
                </p>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-amber-200 dark:border-amber-800 mt-3">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Did you know?
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {wrongTry.destination.teaserFact}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setWrongTry((prev) => ({ ...prev, active: false }));
                    inputRef.current?.focus();
                  }}
                  className="mt-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to the door
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Unlock result display */}
          {unlockResult && !wrongTry.active && (
            <Card
              className={`border-2 ${unlockResult.isSnowDoor ? "border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/20" : "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{unlockResult.doorIcon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {unlockResult.doorName}
                      </h3>
                      <Badge
                        variant="outline"
                        className={unlockResult.tierColor}
                      >
                        {unlockResult.passwordTier}
                      </Badge>
                    </div>
                  </div>
                  {unlockResult.isSnowDoor && (
                    <Snowflake className="h-8 w-8 text-sky-400 animate-pulse" />
                  )}
                  {!unlockResult.isSnowDoor && (
                    <Unlock className="h-6 w-6 text-emerald-500" />
                  )}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {unlockResult.unlocks}
                </p>

                {/* Rewards */}
                <div className="flex gap-3 flex-wrap">
                  {unlockResult.reward.credits > 0 && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                      +{unlockResult.reward.credits} Credits
                    </Badge>
                  )}
                  {unlockResult.reward.marks > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800">
                      +{unlockResult.reward.marks} Marks
                    </Badge>
                  )}
                  {unlockResult.reward.joules > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                      +{unlockResult.reward.joules} Joules
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUnlockResult(null);
                      inputRef.current?.focus();
                    }}
                  >
                    Try Another Password
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/salt-mines")}
                    className="gap-1"
                  >
                    Enter <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* The Main Door Card */}
          {!wrongTry.active && !unlockResult && (
            <Card className="border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
              <CardHeader className="text-center pb-2">
                {/* Keyhole icon — the Golden Key universal indicator */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                    <KeyholeSVG className="w-6 h-10 text-slate-500 dark:text-slate-400" />
                  </div>
                  {/* Golden Key overlay hint */}
                  <div className="absolute -top-1 -right-1">
                    <Key className="h-5 w-5 text-amber-500 drop-shadow-sm" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-serif tracking-widest text-slate-700 dark:text-slate-300">
                  {t("durinsDoor.speakFriendAndEnter")}
                </CardTitle>
                <CardDescription className="text-base mt-2 font-mono">
                  {foundPasswords.length > 0 && (
                    <span className="block text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                      {foundPasswords.length} password
                      {foundPasswords.length !== 1 ? "s" : ""} discovered
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type={showPassword ? "text" : "password"}
                      placeholder={t("durinsDoor.enterPassword")}
                      className="text-center text-lg tracking-widest bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 pr-10"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                    disabled={isUnlocking || !passphrase.trim()}
                  >
                    {isUnlocking
                      ? "..."
                      : t("durinsDoor.pushTheStone")}
                  </Button>
                </form>

                {/* Hint: thinking words switch language */}
                <div className="mt-5 space-y-2">
                  <p className="text-xs text-center text-slate-500">
                    Passwords work in many languages. Some change the door.
                    Others change <em>you</em>.
                  </p>
                  {attemptsThisSession >= 2 && (
                    <p className="text-[10px] text-center text-slate-400 italic">
                      Hint: Try a word for "friend" in any language... or a word
                      for "think."
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password collection stats */}
          {foundPasswords.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <Lock className="h-3 w-3" />
              <span>
                {foundPasswords.length} of 40+ passwords found across 10 doors
              </span>
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN: Translation Bounties ═══ */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-6 w-6 text-blue-500" />
                {t("feedback.title") === "Suggestion Box"
                  ? "Translation Bounties"
                  : t("feedback.title")}
              </CardTitle>
              <CardDescription>
                Help us localize the platform into 58 languages. Earn Marks for
                verified translations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search languages (e.g., Spanish, Mandarin, Hindi)..."
                  className="h-8"
                />
              </div>

              {[
                {
                  lang: "Spanish (es-MX)",
                  doc: "The 9 Economic Laws",
                  bounty: 500,
                  status: "Open",
                },
                {
                  lang: "French (fr-FR)",
                  doc: "A Considered Approach...",
                  bounty: 800,
                  status: "Open",
                },
                {
                  lang: "Mandarin (zh-CN)",
                  doc: "The Little Red Hen Animation",
                  bounty: 300,
                  status: "In Progress",
                },
                {
                  lang: "Swahili (sw)",
                  doc: "Platform Welcome Guide",
                  bounty: 400,
                  status: "Open",
                },
                {
                  lang: "Hindi (hi)",
                  doc: "Three-Currency Explainer",
                  bounty: 350,
                  status: "Open",
                },
              ].map((bounty, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg hover:border-blue-300 transition-colors flex justify-between items-center bg-slate-50 dark:bg-slate-900"
                >
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      {bounty.doc}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Target: {bounty.lang}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">
                      {bounty.bounty} Marks
                    </div>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {bounty.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() =>
                  navigate("/friend", { state: { fromDoor: true } })
                }
              >
                <Globe2 className="h-4 w-4" />
                See All 58 Languages
              </Button>
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => navigate("/help-wanted")}
              >
                View All Translation Bounties{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Snow Door teaser */}
          <Card className="border border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50/50 to-white dark:from-sky-950/20 dark:to-slate-900">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="flex-shrink-0 relative">
                <Snowflake className="h-8 w-8 text-sky-400" />
                <Snowflake className="h-3 w-3 text-sky-300 absolute -top-1 -right-1" />
                <Snowflake className="h-3 w-3 text-sky-300 absolute -bottom-1 -left-1" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-sky-900 dark:text-sky-200">
                  The Snow Door
                </h4>
                <p className="text-xs text-sky-700 dark:text-sky-400 mt-1">
                  A rare passage rimmed with frost. Snowflake seals at every
                  corner. The word for "North" opens the way — in any language.
                  12 Joules to enter.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}