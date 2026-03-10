/**
 * A-Aron Device — Name Pronunciation & Accessibility System
 * ==========================================================
 * Named after Key & Peele's "The Substitute" skit.
 * Under Harper Guild for cross-board accessibility.
 *
 * Purpose: Everyone's name matters. This system helps members:
 *   1. Set a phonetic pronunciation guide for their display name
 *   2. Record an audio clip of their name pronunciation
 *   3. Flag common mispronunciations to avoid
 *   4. View how to pronounce other members' names
 *
 * Handles names like: Glyness, Na'im, Nilufar, Niamh, Saoirse,
 * Kgomotso, Xiulan, Anais, etc.
 *
 * Database: Uses user_profiles (existing) + a-aron_pronunciations table.
 * Harper Guild verifiers can flag and correct pronunciation entries.
 *
 * Part of the Accessibility Crown position — translation compliance
 * and name accessibility are both under Harper Guild oversight.
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Volume2,
  Mic,
  Check,
  AlertTriangle,
  Edit3,
  Shield,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Types ──

export interface NamePronunciation {
  /** The display name as written */
  displayName: string;
  /** IPA or phonetic spelling (e.g., "NEER-uh" for Niamh) */
  phoneticSpelling: string;
  /** Common mispronunciations to avoid */
  commonMistakes?: string[];
  /** Origin/language note (e.g., "Irish Gaelic") */
  languageOrigin?: string;
  /** Optional audio URL (Supabase storage) */
  audioUrl?: string;
  /** Harper Guild verified? */
  isVerified: boolean;
  /** User who set this */
  userId?: string;
}

// ── Example pronunciations (for the intro/explainer) ──

const EXAMPLE_NAMES: NamePronunciation[] = [
  {
    displayName: "Niamh",
    phoneticSpelling: "NEEV",
    commonMistakes: ["Nee-am", "Ny-am"],
    languageOrigin: "Irish Gaelic",
    isVerified: true,
  },
  {
    displayName: "Saoirse",
    phoneticSpelling: "SEER-sha",
    commonMistakes: ["Say-oar-see", "Sa-orse"],
    languageOrigin: "Irish Gaelic",
    isVerified: true,
  },
  {
    displayName: "Xiulan",
    phoneticSpelling: "SHYO-lahn",
    commonMistakes: ["Zoo-lan", "Ks-you-lan"],
    languageOrigin: "Mandarin Chinese",
    isVerified: true,
  },
  {
    displayName: "Na'im",
    phoneticSpelling: "nah-EEM",
    commonMistakes: ["Nay-im", "Name"],
    languageOrigin: "Arabic",
    isVerified: true,
  },
  {
    displayName: "Kgomotso",
    phoneticSpelling: "kho-MOT-so",
    commonMistakes: ["Ka-go-mot-so"],
    languageOrigin: "Setswana",
    isVerified: true,
  },
  {
    displayName: "Anais",
    phoneticSpelling: "ah-nah-EES",
    commonMistakes: ["Anna-is", "A-nays"],
    languageOrigin: "French",
    isVerified: true,
  },
];

// ── Name Card (read-only display) ──

function NameCard({ name }: { name: NamePronunciation }) {
  return (
    <div className="p-3 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            {name.displayName}
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-mono mt-0.5">
            /{name.phoneticSpelling}/
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {name.audioUrl && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Volume2 className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          )}
          {name.isVerified && (
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
            >
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              Verified
            </Badge>
          )}
        </div>
      </div>
      {name.languageOrigin && (
        <p className="text-[10px] text-slate-500 mt-1">{name.languageOrigin}</p>
      )}
      {name.commonMistakes && name.commonMistakes.length > 0 && (
        <div className="mt-2 flex items-start gap-1.5">
          <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500">
            <span className="font-medium">Not:</span>{" "}
            {name.commonMistakes.map((m, i) => (
              <span key={i}>
                <s className="text-red-400">{m}</s>
                {i < name.commonMistakes!.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Set Your Pronunciation Dialog ──

interface SetPronunciationDialogProps {
  currentName?: string;
  onSave?: (data: {
    phoneticSpelling: string;
    commonMistakes: string;
    languageOrigin: string;
  }) => void;
}

function SetPronunciationDialog({
  currentName = "",
  onSave,
}: SetPronunciationDialogProps) {
  const { toast } = useToast();
  const [phonetic, setPhonetic] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [origin, setOrigin] = useState("");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (!phonetic.trim()) {
      toast({
        title: "Phonetic spelling required",
        variant: "destructive",
      });
      return;
    }
    onSave?.({
      phoneticSpelling: phonetic.trim(),
      commonMistakes: mistakes.trim(),
      languageOrigin: origin.trim(),
    });
    toast({
      title: "Pronunciation saved",
      description:
        "Your name pronunciation has been submitted for Harper Guild verification.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm">
          <Edit3 className="h-4 w-4" />
          Set My Pronunciation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-500" />
            A-Aron Device
          </DialogTitle>
          <DialogDescription>
            Help others pronounce your name correctly. Your entry will be
            verified by the Harper Guild.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="display-name">Your Display Name</Label>
            <Input
              id="display-name"
              value={currentName}
              disabled
              className="bg-slate-100 dark:bg-slate-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phonetic">
              Phonetic Spelling{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phonetic"
              placeholder="e.g., NEEV, ah-nah-EES, SHYO-lahn"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
            />
            <p className="text-[10px] text-slate-500">
              Use capital letters for stressed syllables. Hyphens between
              syllables. This is how it should sound.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mistakes">
              Common Mispronunciations to Avoid
            </Label>
            <Input
              id="mistakes"
              placeholder="e.g., Nee-am, Ny-am (comma separated)"
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin">Language / Cultural Origin</Label>
            <Input
              id="origin"
              placeholder="e.g., Irish Gaelic, Mandarin Chinese, Arabic"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          {/* Audio recording placeholder */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 text-center">
            <Mic className="h-6 w-6 mx-auto text-slate-400 mb-1" />
            <p className="text-xs text-slate-500">
              Audio recording coming soon — record yourself saying your name.
            </p>
          </div>
          <Button onClick={handleSave} className="w-full">
            <Check className="h-4 w-4 mr-1.5" />
            Save Pronunciation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main A-Aron Device Component ──

interface AAronDeviceProps {
  /** Current user's display name (if authenticated) */
  userName?: string;
  /** Whether to show the full explainer or just the compact widget */
  variant?: "full" | "compact";
}

export function AAronDevice({
  userName,
  variant = "full",
}: AAronDeviceProps) {
  if (variant === "compact") {
    return (
      <Card className="border border-blue-200 dark:border-blue-800">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
            <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              A-Aron Device
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Name pronunciation guide. Everyone's name matters.
            </p>
            {userName && (
              <div className="mt-2">
                <SetPronunciationDialog currentName={userName} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <Volume2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              A-Aron Device
              <Badge
                variant="outline"
                className="text-[10px] border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-400"
              >
                Harper Guild
              </Badge>
            </CardTitle>
            <CardDescription>
              Name pronunciation and accessibility system. Everyone's name
              matters.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Explainer */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="mb-2">
                <strong>What is this?</strong> A system that helps everyone on
                the platform pronounce each other's names correctly. Named after
                the Key & Peele sketch where a substitute teacher
                mispronounces every student's name.
              </p>
              <p>
                Set your phonetic pronunciation, flag common mistakes, and
                optionally record an audio clip. Harper Guild members verify
                entries for accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Set your pronunciation */}
        {userName && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
            <div>
              <p className="font-medium text-sm text-slate-900 dark:text-white">
                Your name: <strong>{userName}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Help others say it right.
              </p>
            </div>
            <SetPronunciationDialog currentName={userName} />
          </div>
        )}

        {/* Example names */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Example Pronunciations
          </h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {EXAMPLE_NAMES.map((name) => (
              <NameCard key={name.displayName} name={name} />
            ))}
          </div>
        </div>

        {/* Harper Guild callout */}
        <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-100 dark:border-purple-900">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-purple-900 dark:text-purple-200">
                Harper Guild Verification
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                All pronunciation entries are verified by Harper Guild members
                for accuracy. This is part of the platform's cross-board
                accessibility initiative. The Accessibility Crown oversees
                both translation compliance and name pronunciation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
