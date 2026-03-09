import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGate, FRIEND_WORDS_BY_LANGUAGE } from "./GateContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lintel } from "./Lintel";
import { cn } from "@/lib/utils";

interface GateEntryProps {
  gateId: string;
  destination: string;
  guildWord?: string;
  requireManualEntry?: boolean;
  onPass: () => void;
  className?: string;
}

export function GateEntry({
  gateId,
  destination,
  guildWord,
  requireManualEntry = false,
  onPass,
  className,
}: GateEntryProps) {
  const { passGate, friendWords, getLintelWords } = useGate();
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const lintelWords = getLintelWords(gateId);

  const isValidFriendWord = (word: string): { valid: boolean; language: string } => {
    const normalizedWord = word.toLowerCase().trim();

    for (const [language, words] of Object.entries(FRIEND_WORDS_BY_LANGUAGE)) {
      if (words.some((w) => w.toLowerCase() === normalizedWord)) {
        return { valid: true, language };
      }
    }

    if (guildWord && normalizedWord === guildWord.toLowerCase()) {
      return { valid: true, language: "guild" };
    }

    return { valid: false, language: "" };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, language } = isValidFriendWord(inputValue);

    if (!valid) {
      toast.error("That word doesn't open this gate...");
      return;
    }

    setIsAnimating(true);
    passGate(gateId, inputValue, language);

    setTimeout(() => {
      toast.success("The gate opens!");
      setIsAnimating(false);
      onPass();
    }, 1500);
  };

  return (
    <motion.div
      className={cn(
        "relative bg-slate-900 border border-amber-500/30 rounded-lg overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Gate header */}
      <div className="bg-slate-800/50 px-4 py-3 border-b border-amber-500/20">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">🪞</span>
          <span className="font-medium text-amber-400">
            GATE TO {destination.toUpperCase()}
          </span>
          <span className="text-xl">🪞</span>
        </div>
      </div>

      {/* Lintel */}
      <Lintel words={lintelWords} gateId={gateId} />

      {/* Gate content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {isAnimating ? (
            <motion.div
              key="animating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="text-5xl mb-4"
              >
                🚪
              </motion.div>
              <p className="text-amber-400">Opening the gate...</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-center text-slate-300 mb-4">
                {guildWord
                  ? `To enter, speak the guild word for "${guildWord}" in any language:`
                  : "To enter, speak the word for 'friend' in any language:"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder={requireManualEntry ? "Type the word..." : "Enter friend word..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="text-center text-lg"
                  autoComplete={requireManualEntry ? "off" : "on"}
                />

                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-500">
                  Enter
                </Button>
              </form>

              {lintelWords.length > 0 && (
                <p className="text-center text-xs text-slate-500 mt-4">
                  💡 Check the lintel for hints
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default GateEntry;
