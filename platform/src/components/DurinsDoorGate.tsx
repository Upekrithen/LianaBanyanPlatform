import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ArrowRight, Sparkles } from 'lucide-react';
import { DoorRule, evaluateDoorRule } from '@/hooks/useDurinsDoor';

interface DurinsDoorGateProps {
  rules: DoorRule[];
  sponsorName?: string;
  onMatch: (rule: DoorRule) => void;
  onSkip: () => void;
}

export function DurinsDoorGate({ rules, sponsorName, onMatch, onSkip }: DurinsDoorGateProps) {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const matched = evaluateDoorRule(rules, input.trim());
    if (matched) {
      onMatch(matched);
    } else {
      setShake(true);
      setAttempts((a) => a + 1);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/30 border border-amber-700/50 mb-4">
          <KeyRound className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Speak, Friend, and Enter</h2>
        {sponsorName && (
          <p className="text-amber-200/70 text-sm mb-1">
            {sponsorName} left something for you behind a door.
          </p>
        )}
        <p className="text-white/50 text-sm">
          Enter a phrase, email, or code — or skip to the public welcome.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className={`transition-transform ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter the word..."
            className="bg-stone-900/60 border-amber-800/50 text-amber-100 placeholder:text-amber-700/40 text-center text-lg h-12"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          disabled={!input.trim()}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white h-11"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Open the Door
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-white/40 hover:text-white/70 text-sm inline-flex items-center gap-1 transition-colors"
        >
          Skip — show me the welcome <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {attempts >= 3 && (
        <p className="text-center text-amber-600/50 text-xs">
          Hint: the person who gave you this card may have told you a word.
        </p>
      )}
    </div>
  );
}
