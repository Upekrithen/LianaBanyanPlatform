import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DoorFrameDoormatProps {
  passphrase: string;
  setPassphrase: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUnlocking: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  attemptsThisSession: number;
}

export function DoorFrameDoormat({
  passphrase,
  setPassphrase,
  showPassword,
  setShowPassword,
  onSubmit,
  isUnlocking,
  inputRef,
  attemptsThisSession,
}: DoorFrameDoormatProps) {
  const { t } = useTranslation();

  return (
    <div
      className="px-6 py-4 rounded-b-xl"
      style={{
        background: 'linear-gradient(180deg, #78350f 0%, #451a03 100%)',
        borderTop: '3px solid #92400e',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.08)',
      }}
      data-xray-id="durins-door-doormat"
    >
      <p className="text-center text-amber-200/80 font-serif italic text-sm mb-3">
        Speak, Friend, and Enter
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative">
          <Input
            ref={inputRef}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('durinsDoor.enterWord', 'Enter the word...')}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="bg-amber-950/50 border-amber-800 text-amber-100 placeholder:text-amber-600/50 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-400"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button
          type="submit"
          disabled={isUnlocking || !passphrase.trim()}
          className="w-full bg-stone-800 hover:bg-stone-700 text-amber-100 border border-stone-600"
        >
          {isUnlocking ? '...' : t('durinsDoor.pushTheStone', 'Push the Stone')}
        </Button>
      </form>
      <p className="text-center text-amber-700/60 text-xs mt-2">
        Passwords work in many languages. Some change the door. Others change you.
      </p>
      {attemptsThisSession >= 5 && (
        <p className="text-center text-amber-500/50 text-xs mt-1">
          Hint: try saying "friend" in another language.
        </p>
      )}
    </div>
  );
}

export default DoorFrameDoormat;
