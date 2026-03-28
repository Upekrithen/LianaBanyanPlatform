import { HeroKeySVG } from '@/components/HeroKeySVG';
import { LINTEL_LANGUAGES, LINTEL_LANGUAGE_NAMES } from '@/data/translationBounties';

interface DoorFrameLintelProps {
  unlockedLanguages: Set<string>;
  onCenterKeyholeClick: () => void;
}

export function DoorFrameLintel({ unlockedLanguages, onCenterKeyholeClick }: DoorFrameLintelProps) {
  const left = LINTEL_LANGUAGES.slice(0, 6);
  const right = LINTEL_LANGUAGES.slice(6, 12);

  return (
    <div
      className="relative flex items-center justify-center gap-1 px-4 py-3 rounded-t-xl"
      style={{
        background: 'linear-gradient(180deg, #57534e 0%, #44403c 50%, #292524 100%)',
        borderBottom: '3px solid #78716c',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)',
      }}
      data-xray-id="durins-door-lintel"
    >
      {/* Left 6 keyholes */}
      <div className="flex items-center gap-1.5">
        {left.map((lang) => (
          <HeroKeySVG
            key={lang}
            size={24}
            lit={unlockedLanguages.has(lang)}
            tooltip={LINTEL_LANGUAGE_NAMES[lang]}
          />
        ))}
      </div>

      {/* Center big keyhole */}
      <div className="mx-3">
        <HeroKeySVG
          size={48}
          lit={unlockedLanguages.size >= 12}
          onClick={onCenterKeyholeClick}
          tooltip="Enter 'friend' in any language"
        />
      </div>

      {/* Right 6 keyholes */}
      <div className="flex items-center gap-1.5">
        {right.map((lang) => (
          <HeroKeySVG
            key={lang}
            size={24}
            lit={unlockedLanguages.has(lang)}
            tooltip={LINTEL_LANGUAGE_NAMES[lang]}
          />
        ))}
      </div>

      {/* Unlock counter */}
      {unlockedLanguages.size > 0 && unlockedLanguages.size < 12 && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-amber-400 whitespace-nowrap">
          {unlockedLanguages.size}/12 languages unlocked
        </div>
      )}
    </div>
  );
}

export default DoorFrameLintel;
