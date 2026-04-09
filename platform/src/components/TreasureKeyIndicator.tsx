/**
 * TREASURE KEY INDICATOR
 * ======================
 * Drop-in component for any content page that has hidden treasure keys.
 *
 * Shows a subtle golden key icon that expands to reveal:
 * 1. How many keys are hidden on this page
 * 2. Hints for each key
 * 3. A submit box for answers
 *
 * Usage:
 *   <TreasureKeyIndicator documentPath="/academic-papers/muffled-rule" />
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, ChevronDown, ChevronUp, Send, Sparkles, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getActiveKeysForDocument, hasKeys } from "@/lib/treasureKeyEmbed";
import { useNotesOverlay } from "@/contexts/NotesOverlayContext";

interface TreasureKeyIndicatorProps {
  documentPath: string;
  className?: string;
  variant?: "floating" | "inline" | "minimal";
}

const tierColors: Record<string, string> = {
  common: "text-gray-400 border-gray-400/30",
  uncommon: "text-green-400 border-green-400/30",
  rare: "text-blue-400 border-blue-400/30",
  epic: "text-purple-400 border-purple-400/30",
  legendary: "text-amber-400 border-amber-400/30",
};

const tierBg: Record<string, string> = {
  common: "bg-gray-500/10",
  uncommon: "bg-green-500/10",
  rare: "bg-blue-500/10",
  epic: "bg-purple-500/10",
  legendary: "bg-amber-500/10",
};

export function TreasureKeyIndicator({
  documentPath,
  className = "",
  variant = "floating",
}: TreasureKeyIndicatorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { openCodebreaker } = useNotesOverlay();
  const [isExpanded, setIsExpanded] = useState(false);
  const [keyAnswer, setKeyAnswer] = useState("");

  // Fetch active keys for this document
  const { data: keys, isLoading } = useQuery({
    queryKey: ["treasure-keys-for-doc", documentPath],
    queryFn: () => getActiveKeysForDocument(documentPath),
    enabled: hasKeys(documentPath),
  });

  // Submit a key answer
  const submitKey = useMutation({
    mutationFn: async (keyWord: string) => {
      if (!user?.email) throw new Error("Must be logged in to submit keys");

      const { data, error } = await supabase
        .from("key_submissions")
        .insert({
          user_email: user.email,
          key_word: keyWord.trim().toUpperCase(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      if (data.is_correct) {
        toast.success(`Correct! +${data.feathers_awarded} feathers earned!`, {
          icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        });
      } else {
        toast.error("Not quite. Keep reading for the hidden key word.");
      }
      setKeyAnswer("");
      queryClient.invalidateQueries({ queryKey: ["treasure-keys-for-doc", documentPath] });
      queryClient.invalidateQueries({ queryKey: ["user-feathers"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Submission failed");
    },
  });

  // Don't render if no keys for this path
  if (!hasKeys(documentPath) || isLoading || !keys || keys.length === 0) {
    return null;
  }

  const foundCount = keys.filter(k => k.found_by).length;
  const totalCount = keys.length;
  const allFound = foundCount === totalCount;

  if (variant === "minimal") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <Key className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs text-amber-500/80">
          {totalCount - foundCount} key{totalCount - foundCount !== 1 ? "s" : ""} hidden
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`border border-amber-500/20 rounded-lg p-4 ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-full text-left"
        >
          <Key className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-400">
            {allFound
              ? "All keys found!"
              : `${totalCount - foundCount} treasure key${totalCount - foundCount !== 1 ? "s" : ""} hidden here`}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-amber-500/60 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-500/60 ml-auto" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`flex items-start gap-2 p-2 rounded-md ${tierBg[key.tier] || ""} ${!key.found_by ? 'cursor-pointer hover:ring-1 hover:ring-amber-400/40 transition-all' : ''}`}
                onClick={() => {
                  if (!key.found_by) {
                    openCodebreaker(key.id, key.hint, documentPath);
                  }
                }}
              >
                {key.found_by ? (
                  <Unlock className="w-4 h-4 text-green-400 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${tierColors[key.tier] || ""}`}>
                      {key.tier}
                    </Badge>
                    <span className="text-xs text-white/50">+{key.feathers} feathers</span>
                  </div>
                  <p className="text-xs text-white/70 mt-1">{key.hint}</p>
                  {!key.found_by && (
                    <p className="text-[10px] text-amber-400/60 mt-0.5">Click to open Codebreaker</p>
                  )}
                </div>
              </div>
            ))}

            {!allFound && user && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={keyAnswer}
                  onChange={(e) => setKeyAnswer(e.target.value)}
                  placeholder="Enter key word..."
                  className="text-sm h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && keyAnswer.trim()) {
                      submitKey.mutate(keyAnswer);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  disabled={!keyAnswer.trim() || submitKey.isPending}
                  onClick={() => submitKey.mutate(keyAnswer)}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {!user && !allFound && (
              <p className="text-xs text-white/40 italic">
                Sign in to submit key words and earn feathers.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default: floating variant (bottom-right corner)
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full
          bg-gradient-to-r from-amber-500/20 to-yellow-500/10
          border border-amber-500/30 backdrop-blur-sm
          hover:border-amber-500/50 transition-all
          shadow-lg shadow-amber-500/10
        `}
      >
        <Key className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-sm text-amber-300 font-medium">
          {allFound
            ? "All keys found!"
            : `${totalCount - foundCount} key${totalCount - foundCount !== 1 ? "s" : ""}`}
        </span>
      </button>

      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-80 p-4 rounded-xl bg-slate-900/95 border border-amber-500/20 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-white">Treasure Keys</h3>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`p-2 rounded-lg ${tierBg[key.tier] || ""} ${!key.found_by ? 'cursor-pointer hover:ring-1 hover:ring-amber-400/40 transition-all' : ''}`}
                onClick={() => {
                  if (!key.found_by) {
                    openCodebreaker(key.id, key.hint, documentPath);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {key.found_by ? (
                    <Unlock className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <Badge variant="outline" className={`text-xs ${tierColors[key.tier] || ""}`}>
                    {key.tier}
                  </Badge>
                  <span className="text-xs text-white/40">+{key.feathers}</span>
                </div>
                <p className="text-xs text-white/60 mt-1">{key.hint}</p>
                {!key.found_by && (
                  <p className="text-[10px] text-amber-400/50 mt-0.5">Click to open Codebreaker</p>
                )}
              </div>
            ))}
          </div>

          {!allFound && user && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
              <Input
                value={keyAnswer}
                onChange={(e) => setKeyAnswer(e.target.value)}
                placeholder="Key word..."
                className="text-sm h-8 bg-white/5"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keyAnswer.trim()) {
                    submitKey.mutate(keyAnswer);
                  }
                }}
              />
              <Button
                size="sm"
                className="h-8 bg-amber-500 hover:bg-amber-600 text-black"
                disabled={!keyAnswer.trim() || submitKey.isPending}
                onClick={() => submitKey.mutate(keyAnswer)}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {!user && !allFound && (
            <p className="text-xs text-white/40 italic mt-3 pt-3 border-t border-white/10">
              Sign in to submit answers and earn feathers.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TreasureKeyIndicator;
