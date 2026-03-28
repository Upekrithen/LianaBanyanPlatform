export interface TranslationBounty {
  id: string;
  document: string;
  language: string;
  languageCode: string;
  marks: number;
  status: 'open' | 'in-progress' | 'completed';
}

export const TRANSLATION_BOUNTIES: TranslationBounty[] = [
  { id: 'tb-1', document: 'The 9 Economic Laws', language: 'Spanish (es-MX)', languageCode: 'es', marks: 500, status: 'open' },
  { id: 'tb-2', document: 'A Considered Approach to Cooperative Commerce', language: 'French (fr-FR)', languageCode: 'fr', marks: 800, status: 'open' },
  { id: 'tb-3', document: 'The Little Red Hen Animation', language: 'Mandarin (zh-CN)', languageCode: 'zh', marks: 300, status: 'in-progress' },
  { id: 'tb-4', document: 'Platform Welcome Guide', language: 'Swahili (sw)', languageCode: 'sw', marks: 400, status: 'open' },
  { id: 'tb-5', document: 'Three-Currency Explainer', language: 'Hindi (hi)', languageCode: 'hi', marks: 350, status: 'open' },
  { id: 'tb-6', document: 'Cost+20% Whitepaper', language: 'Portuguese (pt-BR)', languageCode: 'pt', marks: 600, status: 'open' },
  { id: 'tb-7', document: 'Ghost Attribution Guide', language: 'German (de)', languageCode: 'de', marks: 450, status: 'open' },
  { id: 'tb-8', document: 'DNA Lock Architecture', language: 'Japanese (ja)', languageCode: 'ja', marks: 700, status: 'open' },
  { id: 'tb-9', document: 'Brewster Bonus Explainer', language: 'Korean (ko)', languageCode: 'ko', marks: 550, status: 'open' },
  { id: 'tb-10', document: 'The Fable of the Little Red Hen', language: 'Arabic (ar)', languageCode: 'ar', marks: 500, status: 'open' },
  { id: 'tb-11', document: 'Cooperative Bylaws Summary', language: 'Russian (ru)', languageCode: 'ru', marks: 650, status: 'open' },
  { id: 'tb-12', document: 'Mission ONE Primer', language: 'Italian (it)', languageCode: 'it', marks: 400, status: 'open' },
];

export const LINTEL_LANGUAGES = ['en', 'es', 'de', 'fr', 'ja', 'zh', 'ko', 'ar', 'sw', 'hi', 'pt', 'ru'] as const;

export const LINTEL_LANGUAGE_NAMES: Record<string, string> = {
  en: 'English (friend)',
  es: 'Spanish (amigo)',
  de: 'German (freund)',
  fr: 'French (ami)',
  ja: 'Japanese (tomodachi)',
  zh: 'Mandarin (pengyou)',
  ko: 'Korean (chingu)',
  ar: 'Arabic (sadiq)',
  sw: 'Swahili (rafiki)',
  hi: 'Hindi (dost)',
  pt: 'Portuguese (amigo)',
  ru: 'Russian (drug)',
};
