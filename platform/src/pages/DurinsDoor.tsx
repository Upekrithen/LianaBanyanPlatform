/**
 * DURIN'S DOOR — The International Portal & Password Gate
 * ========================================================
 * Redesigned: Door frame visual with lintel keyholes, bounty slideshow,
 * and doormat input. 12-language keyhole unlock mechanic.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Snowflake,
  Lock,
  Unlock,
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
import SnowDoorBeacons from "@/components/SnowDoorBeacons";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { HeroKeySVG } from '@/components/HeroKeySVG';
import { DoorFrameLintel } from '@/components/durins-door/DoorFrameLintel';
import { TranslationBountySlideshow } from '@/components/durins-door/TranslationBountySlideshow';
import { DoorFrameDoormat } from '@/components/durins-door/DoorFrameDoormat';
import { TRANSLATION_BOUNTIES, LINTEL_LANGUAGES } from '@/data/translationBounties';

// ── State interfaces ──

interface WrongTryState {
  active: boolean;
  destination: WrongTryDestination | null;
  count: number;
}

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

// ── Load/save lintel unlocks from localStorage ──

function loadLintelUnlocks(): Set<string> {
  try {
    const raw = localStorage.getItem('lb_durins_lintel_unlocked');
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveLintelUnlocks(langs: Set<string>) {
  localStorage.setItem('lb_durins_lintel_unlocked', JSON.stringify([...langs]));
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
  const [snowDoorUnlocked, setSnowDoorUnlocked] = useState(false);
  const [unlockedLanguages, setUnlockedLanguages] = useState<Set<string>>(loadLintelUnlocks);

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

      // 2. Check for "friend words" → Warp Room + lintel keyhole
      const friendLang = FRIEND_WORD_MAP[normalized];
      if (friendLang) {
        resetWrongTryCount();

        // Light up lintel keyhole if this language is one of the 12
        if ((LINTEL_LANGUAGES as readonly string[]).includes(friendLang)) {
          setUnlockedLanguages(prev => {
            const next = new Set(prev);
            next.add(friendLang);
            saveLintelUnlocks(next);
            return next;
          });
        }

        toast({
          title: t("durinsDoor.doorOpens"),
          description: `"${passphrase}" — Welcome, friend.`,
        });
        setTimeout(() => {
          setIsUnlocking(false);
          navigate(`/mirror?lang=${encodeURIComponent(friendLang)}&word=${encodeURIComponent(passphrase.trim())}`, { state: { fromDoor: true } });
        }, 1200);
        return;
      }

      // 3. Try password against all doors
      const result = tryPasswordAnywhere(passphrase);

      if (result) {
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

        if (door.doorId === "snow-door") {
          setSnowDoorUnlocked(true);
        }

        toast({
          title: t("durinsDoor.doorOpens"),
          description: `${door.name} — ${password.unlocks}`,
        });

        setPassphrase("");
        setIsUnlocking(false);
      } else {
        const count = incrementWrongTryCount();
        setAttemptsThisSession((prev) => prev + 1);

        if (count % 3 === 0) {
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
    <PortalPageLayout maxWidth="xl" xrayId="durins-door">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-3 mb-6">
        <HeroKeySVG size={40} lit={unlockedLanguages.size >= 12} />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Durin's Door</h1>
          <p className="text-sm text-muted-foreground">
            {t("durinsDoor.speakFriendAndEnter")}
          </p>
        </div>
      </div>

      {/* ═══ THE DOOR FRAME ═══ */}
      <div
        className="mx-auto max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{
          border: '4px solid #57534e',
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
        }}
      >
        {/* Lintel — 12+1 keyholes */}
        <DoorFrameLintel
          unlockedLanguages={unlockedLanguages}
          onCenterKeyholeClick={() => inputRef.current?.focus()}
        />

        {/* Door Interior */}
        <div className="relative min-h-[350px] flex flex-col" style={{ background: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)' }}>
          {/* Wrong-try overlay */}
          {wrongTry.active && wrongTry.destination && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-stone-900/95 animate-in fade-in duration-500">
              <div className="text-center space-y-3 max-w-sm">
                <div className="text-4xl">{wrongTry.destination.icon}</div>
                <h3 className="text-lg font-bold text-amber-200">
                  {wrongTry.destination.title}
                </h3>
                <p className="text-sm text-amber-300/80 italic">
                  {wrongTry.destination.description}
                </p>
                <div className="bg-stone-800 rounded-lg p-3 border border-amber-800/50 mt-3">
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">
                    Did you know?
                  </p>
                  <p className="text-sm text-stone-300">
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
                  className="mt-2 text-stone-400 hover:text-stone-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to the door
                </Button>
              </div>
            </div>
          )}

          {/* Unlock result overlay */}
          {unlockResult && !wrongTry.active && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-stone-900/95 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4 max-w-sm w-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{unlockResult.doorIcon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {unlockResult.doorName}
                      </h3>
                      <Badge variant="outline" className={unlockResult.tierColor}>
                        {unlockResult.passwordTier}
                      </Badge>
                    </div>
                  </div>
                  {unlockResult.isSnowDoor ? (
                    <Snowflake className="h-8 w-8 text-sky-400 animate-pulse" />
                  ) : (
                    <Unlock className="h-6 w-6 text-emerald-500" />
                  )}
                </div>

                <p className="text-sm text-stone-300">{unlockResult.unlocks}</p>

                <div className="flex gap-3 flex-wrap">
                  {unlockResult.reward.credits > 0 && (
                    <Badge className="bg-blue-900 text-blue-200 border-blue-800">
                      +{unlockResult.reward.credits} Credits
                    </Badge>
                  )}
                  {unlockResult.reward.marks > 0 && (
                    <Badge className="bg-emerald-900 text-emerald-200 border-emerald-800">
                      +{unlockResult.reward.marks} Marks
                    </Badge>
                  )}
                  {unlockResult.reward.joules > 0 && (
                    <Badge className="bg-amber-900 text-amber-200 border-amber-800">
                      +{unlockResult.reward.joules} Joules
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-600 text-stone-300 hover:text-stone-100"
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
              </div>
            </div>
          )}

          {/* Default: Translation Bounties slideshow */}
          {!wrongTry.active && !unlockResult && (
            <TranslationBountySlideshow
              bounties={TRANSLATION_BOUNTIES}
              allUnlocked={unlockedLanguages.size >= 12}
            />
          )}
        </div>

        {/* Doormat — password input */}
        <DoorFrameDoormat
          passphrase={passphrase}
          setPassphrase={setPassphrase}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onSubmit={handleSubmit}
          isUnlocking={isUnlocking}
          inputRef={inputRef}
          attemptsThisSession={attemptsThisSession}
        />
      </div>

      {/* Password collection stats */}
      {foundPasswords.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center mt-4">
          <Lock className="h-3 w-3" />
          <span>
            {foundPasswords.length} of 40+ passwords found across 10 doors
          </span>
        </div>
      )}

      {/* Snow Door teaser */}
      <Card className="mt-6 border border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50/50 to-white dark:from-sky-950/20 dark:to-slate-900">
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

      {/* Northern Path — Snow Door Beacon Chain */}
      <SnowDoorBeacons
        snowDoorUnlocked={snowDoorUnlocked}
        className="mt-2"
      />
    </PortalPageLayout>
  );
}
