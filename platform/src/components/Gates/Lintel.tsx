import React from "react";
import { motion } from "framer-motion";
import { useGate } from "./GateContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LintelProps {
  words: string[];
  gateId: string;
  className?: string;
}

export function Lintel({ words, gateId, className }: LintelProps) {
  const { addFriendWord, friendWords } = useGate();

  const handleWordClick = (word: string) => {
    const alreadyKnown = friendWords.some(
      (fw) => fw.word.toLowerCase() === word.toLowerCase()
    );

    if (alreadyKnown) {
      toast.info(`You already know "${word}"`);
      return;
    }

    addFriendWord(word, "unknown", "lintel");
    toast.success(`Added "${word}" to your satchel!`);
  };

  if (words.length === 0) {
    return (
      <div
        className={cn(
          "px-4 py-2 bg-slate-800/30 border-b border-amber-500/10 text-center",
          className
        )}
      >
        <span className="text-slate-500 text-sm italic">
          No travelers have passed through yet...
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-4 py-2 bg-slate-800/30 border-b border-amber-500/10",
        className
      )}
    >
      <div className="flex items-center justify-center gap-3">
        {words.map((word, index) => (
          <React.Fragment key={word}>
            <motion.button
              onClick={() => handleWordClick(word)}
              className="text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Click to add to your satchel"
            >
              {word}
            </motion.button>
            {index < words.length - 1 && (
              <span className="text-slate-600">·</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function FriendWordSatchel() {
  const { friendWords } = useGate();

  if (friendWords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <span className="text-4xl mb-4 block">👝</span>
        <p>Your satchel is empty</p>
        <p className="text-sm mt-2">
          Collect friend words from gate lintels as you travel
        </p>
      </div>
    );
  }

  const wordsByLanguage = friendWords.reduce((acc, fw) => {
    if (!acc[fw.language]) acc[fw.language] = [];
    acc[fw.language].push(fw);
    return acc;
  }, {} as Record<string, typeof friendWords>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👝</span>
        <h3 className="font-medium">Friend Word Satchel</h3>
        <span className="text-sm text-muted-foreground">
          ({friendWords.length} words)
        </span>
      </div>

      {Object.entries(wordsByLanguage).map(([language, words]) => (
        <div key={language} className="bg-slate-800/30 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-2 capitalize">
            {language}
          </div>
          <div className="flex flex-wrap gap-2">
            {words.map((fw) => (
              <span
                key={fw.word}
                className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-sm text-amber-300"
              >
                {fw.word}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Lintel;
