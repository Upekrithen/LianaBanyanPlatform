import React, { useState } from 'react';
import './RosettaKeyboard.css';

// Language families with their "Friend" translations and character sets
const LANGUAGE_STONES: Record<string, {
  name: string;
  symbol: string;  // Indiana Jones style symbol or first/last letters
  languages: Record<string, {
    word: string;      // "Friend" in this language
    native: string;    // Native script name
    keyboard: string[]; // Characters for ghost keyboard
  }>;
}> = {
  romantic: {
    name: 'Romantic',
    symbol: 'A~Z',  // Latin script indicator
    languages: {
      english: { word: 'friend', native: 'English', keyboard: 'abcdefghijklmnopqrstuvwxyz'.split('') },
      spanish: { word: 'amigo', native: 'Español', keyboard: 'abcdefghijklmnñopqrstuvwxyz'.split('') },
      french: { word: 'ami', native: 'Français', keyboard: 'abcdefghijklmnopqrstuvwxyzàâæçéèêëîïôœùûü'.split('') },
      italian: { word: 'amico', native: 'Italiano', keyboard: 'abcdefghijklmnopqrstuvwxyzàèéìíîòóùú'.split('') },
      portuguese: { word: 'amigo', native: 'Português', keyboard: 'abcdefghijklmnopqrstuvwxyzàáâãçéêíóôõú'.split('') },
      romanian: { word: 'prieten', native: 'Română', keyboard: 'aăâbcdefghiîjklmnopqrsștțuvwxyz'.split('') },
    }
  },
  germanic: {
    name: 'Germanic',
    symbol: 'Ð~Þ',
    languages: {
      german: { word: 'freund', native: 'Deutsch', keyboard: 'abcdefghijklmnopqrstuvwxyzäöüß'.split('') },
      dutch: { word: 'vriend', native: 'Nederlands', keyboard: 'abcdefghijklmnopqrstuvwxyz'.split('') },
      swedish: { word: 'vän', native: 'Svenska', keyboard: 'abcdefghijklmnopqrstuvwxyzåäö'.split('') },
      norwegian: { word: 'ven', native: 'Norsk', keyboard: 'abcdefghijklmnopqrstuvwxyzæøå'.split('') },
      icelandic: { word: 'vinur', native: 'Íslenska', keyboard: 'aábdðeéfghiíjklmnoóprstuúvxyýþæö'.split('') },
    }
  },
  cyrillic: {
    name: 'Cyrillic',
    symbol: 'А~Я',
    languages: {
      russian: { word: 'друг', native: 'Русский', keyboard: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('') },
      ukrainian: { word: 'друг', native: 'Українська', keyboard: 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'.split('') },
      serbian: { word: 'пријатељ', native: 'Српски', keyboard: 'абвгдђежзијклљмнњопрстћуфхцчџш'.split('') },
    }
  },
  eastAsian: {
    name: 'East Asian',
    symbol: '亜~龠',
    languages: {
      chinese: { word: '朋友', native: '中文', keyboard: ['朋', '友', '你', '好', '我', '是', '的', '人', '在', '有', '这', '个', '上', '们', '来', '到', '时', '大', '地', '为'] },
      japanese: { word: '友達', native: '日本語', keyboard: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split('') },
      korean: { word: '친구', native: '한국어', keyboard: 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅓㅗㅜㅡㅣㅐㅔㅚㅟ'.split('') },
    }
  },
  arabic: {
    name: 'Arabic',
    symbol: 'ا~ي',
    languages: {
      arabic: { word: 'صديق', native: 'العربية', keyboard: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('') },
      persian: { word: 'دوست', native: 'فارسی', keyboard: 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('') },
    }
  },
  indic: {
    name: 'Indic',
    symbol: 'अ~ह',
    languages: {
      hindi: { word: 'मित्र', native: 'हिंदी', keyboard: 'अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'.split('') },
    }
  },
  thai: {
    name: 'Thai',
    symbol: 'ก~ฮ',
    languages: {
      thai: { word: 'เพื่อน', native: 'ไทย', keyboard: 'กขคฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ'.split('') },
    }
  },
  african: {
    name: 'African',
    symbol: 'R~I',  // Rafiki reference :)
    languages: {
      swahili: { word: 'rafiki', native: 'Kiswahili', keyboard: 'abcdefghijklmnopqrstuvwxyz'.split('') },
    }
  },
  other: {
    name: 'Other',
    symbol: '◊~◊',
    languages: {
      greek: { word: 'φίλος', native: 'Ελληνικά', keyboard: 'αβγδεζηθικλμνξοπρστυφχψω'.split('') },
      hebrew: { word: 'חבר', native: 'עברית', keyboard: 'אבגדהוזחטיכלמנסעפצקרשת'.split('') },
      georgian: { word: 'მეგობარი', native: 'ქართული', keyboard: 'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ'.split('') },
      vietnamese: { word: 'bạn', native: 'Tiếng Việt', keyboard: 'aăâbcdđeêghiklmnoôơpqrstuưvxy'.split('') },
      filipino: { word: 'kaibigan', native: 'Filipino', keyboard: 'abcdefghijklmnñopqrstuvwxyz'.split('') },
      hungarian: { word: 'barátom', native: 'Magyar', keyboard: 'aábcdeéfghiíjklmnoóöőpqrstuúüűvwxyz'.split('') },
      finnish: { word: 'ystävä', native: 'Suomi', keyboard: 'abcdefghijklmnopqrstuvwxyzäö'.split('') },
      polish: { word: 'przyjaciel', native: 'Polski', keyboard: 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż'.split('') },
      turkish: { word: 'arkadaş', native: 'Türkçe', keyboard: 'abcçdefgğhıijklmnoöprsştuüvyz'.split('') },
      esperanto: { word: 'amiko', native: 'Esperanto', keyboard: 'abcĉdefgĝhĥijĵklmnoprsŝtuŭvz'.split('') },
    }
  },
  fictional: {
    name: 'Fictional',
    symbol: '🧝~🖖',  // Elf and Vulcan salute
    languages: {
      sindarin: { word: 'mellon', native: 'Sindarin (Elvish)', keyboard: 'abcdefghilmnoprstuvwy'.split('') },
      quenya: { word: 'nildo', native: 'Quenya (Elvish)', keyboard: 'abcdefghilmnopqrstuvwy'.split('') },
      klingon: { word: 'jup', native: 'tlhIngan Hol (Klingon)', keyboard: 'abcDeghHIjlmnopqQrStuvwy\''.split('') },
      dothraki: { word: 'qoy', native: 'Dothraki', keyboard: 'abcdefghijklmnopqrstuvwxyz'.split('') },
      valyrian: { word: 'raqiros', native: 'High Valyrian', keyboard: 'abcdefghijklmnopqrstuvwxyzāēīōū'.split('') },
      navi: { word: 'tsmukan', native: 'Na\'vi', keyboard: 'aäefhiklmnoprstuvwyz\''.split('') },
      mandoa: { word: 'vod', native: 'Mando\'a', keyboard: 'abcdefghijklmnoprstuvwy\''.split('') },
      latin: { word: 'amicus', native: 'Latin (Wizard)', keyboard: 'abcdefghijklmnopqrstuvxyz'.split('') },
    }
  }
};

interface RosettaKeyboardProps {
  onCharacter: (char: string) => void;
  onWord: (word: string) => void;
  onClose: () => void;
}

export const RosettaKeyboard: React.FC<RosettaKeyboardProps> = ({ onCharacter, onWord, onClose }) => {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleStoneClick = (familyKey: string) => {
    setSelectedFamily(familyKey);
    setSelectedLanguage(null);
  };

  const handleLanguageClick = (langKey: string, word: string) => {
    setSelectedLanguage(langKey);
  };

  const handleQuickWord = (word: string) => {
    onWord(word);
    onClose();
  };

  const family = selectedFamily ? LANGUAGE_STONES[selectedFamily] : null;
  const language = family && selectedLanguage ? family.languages[selectedLanguage] : null;

  return (
    <div className="rosetta-overlay" onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} role="button" tabIndex={0} aria-label="Close keyboard">
      <div className="rosetta-panel" onClick={(e) => e.stopPropagation()}>
        <button className="rosetta-close" onClick={onClose}>×</button>
        
        <h3>🗿 Rosetta Stones</h3>
        <p className="rosetta-hint">Select a language family to reveal the Ghost Keyboard</p>

        {/* Stone Selector */}
        <div className="rosetta-stones">
          {Object.entries(LANGUAGE_STONES).map(([key, stone]) => (
            <button
              key={key}
              className={`rosetta-stone ${selectedFamily === key ? 'selected' : ''}`}
              onClick={() => handleStoneClick(key)}
              title={stone.name}
            >
              <span className="stone-symbol">{stone.symbol}</span>
              <span className="stone-name">{stone.name}</span>
            </button>
          ))}
        </div>

        {/* Language Selector (when family selected) */}
        {family && (
          <div className="rosetta-languages">
            <h4>{family.name} Languages</h4>
            <div className="language-list">
              {Object.entries(family.languages).map(([key, lang]) => (
                <button
                  key={key}
                  className={`language-btn ${selectedLanguage === key ? 'selected' : ''}`}
                  onClick={() => handleLanguageClick(key, lang.word)}
                >
                  <span className="lang-native">{lang.native}</span>
                  <span className="lang-word">"{lang.word}"</span>
                  <button 
                    className="quick-insert"
                    onClick={(e) => { e.stopPropagation(); handleQuickWord(lang.word); }}
                    title="Insert this word"
                  >
                    ↵
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ghost Keyboard (when language selected) */}
        {language && (
          <div className="ghost-keyboard">
            <h4>👻 Ghost Keyboard — {language.native}</h4>
            <p className="keyboard-hint">Tap characters to type, or click the word to insert "{language.word}"</p>
            <div className="keyboard-grid">
              {language.keyboard.map((char, i) => (
                <button
                  key={`${char}-${i}`}
                  className="key-btn"
                  onClick={() => onCharacter(char)}
                >
                  {char}
                </button>
              ))}
            </div>
            <button 
              className="insert-word-btn"
              onClick={() => handleQuickWord(language.word)}
            >
              Insert "{language.word}" (Friend in {language.native})
            </button>
          </div>
        )}

        {!selectedFamily && (
          <p className="rosetta-lore">
            <em>These stones were found in the labyrinth beneath the Main Guild Tower. 
            Each bears the marks of an ancient script family. Touch one to reveal its secrets.</em>
          </p>
        )}
      </div>
    </div>
  );
};

export default RosettaKeyboard;
