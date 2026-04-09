# Knight Session K373 — Mirror Mirror: Multilingual Deck Card System (110 Languages)

**Bishop:** B091 | **Priority:** HIGH | **Depends on:** B089 (Deck Card schema done), Museum (deployed)

## Context

The Museum has a submarine door called "Mirror Mirror" at `/mirror`. Currently:
- User types "friend" in any of ~50 languages into the HEOHO keyhole → navigates to `/mirror`
- MirrorMirror.tsx shows a Deck Card explaining "This one opens Mirror Mirror, which translates the entire site into 50+ languages"
- Clicking "Go to Mirror Mirror →" navigates to `/library` (CephasBasement)

**Founder's vision (B091):**
When a user enters "amigo" (Spanish), the experience should respond IN SPANISH. The Cephas Library door should itself become a Deck Card — with **multiverse iterations for EACH language**. In each language's version, it should say (in that language) something about how we don't have everything translated yet, and the user can earn by helping translate or confirm translations on any page. Support **110 languages** (matching Google Translate's coverage).

**Key files:**
- `platform/src/components/museum/HEOHOFlipCard.tsx` — contains FRIEND_WORDS dictionary (~50 languages)
- `platform/src/pages/museum/MirrorMirror.tsx` — submarine door page (DeckCardShell wrapper)
- `platform/src/pages/museum/CephasBasement.tsx` — Cephas Library (destination after Mirror Mirror)
- `platform/src/components/museum/DeckCardShell.tsx` — card wrapper component
- `platform/src/MuseumApp.tsx` — museum routing

## What to Build

### TASK 1: Expand FRIEND_WORDS to 110 languages

In `HEOHOFlipCard.tsx`, expand the `FRIEND_WORDS` dictionary to cover all 110 Google Translate languages. Each entry should have:
```typescript
interface FriendWord {
  word: string;        // "amigo"
  language: string;    // "Spanish"
  langCode: string;    // "es"
  nativeName: string;  // "Espanol"
}
```

Use Google Translate's language list as the canonical reference. Include ALL of these (and their native scripts where applicable):
- Abkhazian, Acehnese, Afar, Afrikaans, Akan, Albanian, Amharic, Arabic, Armenian, Assamese, Avaric, Awadhi, Aymara, Azerbaijani, Balinese, Baluchi, Bambara, Bangla, Basque, Belarusian, Bhojpuri, Bosnian, Bulgarian, Burmese, Catalan, Cebuano, Chinese (Simplified), Chinese (Traditional), Corsican, Croatian, Czech, Danish, Dhivehi, Dogri, Dutch, English, Esperanto, Estonian, Ewe, Filipino, Finnish, French, Frisian, Galician, Georgian, German, Greek, Guarani, Gujarati, Haitian Creole, Hakha Chin, Hausa, Hawaiian, Hebrew, Hiligaynon, Hindi, Hmong, Hungarian, Hunsrik, Iban, Icelandic, Igbo, Iloko, Indonesian, Irish, Italian, Jamaican Patois, Japanese, Javanese, Jingpo, Kannada, Kazakh, Khmer, Kinyarwanda, Konkani, Korean, Krio, Kurdish (Kurmanji), Kurdish (Sorani), Kyrgyz, Lao, Latin, Latvian, Lingala, Lithuanian, Luganda, Luxembourgish, Macedonian, Maithili, Malagasy, Malay, Malayalam, Maltese, Maori, Marathi, Meiteilon, Mizo, Mongolian, Nepali, Norwegian, Odia, Oromo, Ossetic, Pampanga, Pangasinan, Papiamento, Pashto, Persian, Polish, Portuguese, Portuguese (Brazil), Punjabi, Quechua, Romanian, Romany, Rundi, Russian, Samoan, Sango, Sanskrit, Scots Gaelic, Serbian, Sesotho, Shona, Sindhi, Sinhala, Slovak, Slovenian, Somali, Spanish, Sundanese, Swahili, Swedish, Tajik, Tamil, Tatar, Telugu, Thai, Tigrinya, Tsonga, Turkish, Turkmen, Twi, Ukrainian, Urdu, Uyghur, Uzbek, Vietnamese, Welsh, Xhosa, Yiddish, Yoruba, Zulu

ALSO keep the fun ones already there: Sindarin ("mellon"), Klingon ("jup"), High Valyrian ("raqiros")

Move the dictionary to its own file: `platform/src/data/friendWords.ts` — it's too big for the component.

### TASK 2: Pass detected language to Mirror Mirror

When a user types a matching word:
1. Detect which language it matched
2. Store in a React context or URL param: `navigate("/mirror?lang=es")` or use a MirrorContext
3. MirrorMirror.tsx reads the detected language

### TASK 3: MirrorMirror becomes a language-aware Deck Card

Redesign `MirrorMirror.tsx`:

1. **Read the `lang` param** from URL or context
2. **Display the card IN THAT LANGUAGE.** Use a `translations` object with pre-written strings for each of the 110 languages. At minimum, translate these 4 strings:
   - Card title: "Mirror Mirror" (keep English, it's the feature name)
   - Greeting: "You said '{word}' — welcome, {nativeName} speaker!"
   - Description: "Liana Banyan isn't fully translated into {language} yet. But it will be — because you can help. Translate or confirm translations on any page and earn Marks for your contribution."
   - CTA: "Every language matters. Fair means everyone can read it."
3. **For languages we DON'T have pre-translated strings:** Use Google Translate's URL format to show the user how to use the built-in translation: `https://translate.google.com/translate?sl=en&tl={langCode}&u=https://museum.lianabanyan.com`
4. **Show the language flag/emoji** if available, or just the native script name
5. **Golden Key box** should say (in detected language if translated, English fallback): "Collect golden keys to unlock Easter Egg Knowledge"

### TASK 4: CephasBasement (Library) gets a language-aware header

When arriving at `/library` from Mirror Mirror with a language param:
1. Show a banner at top: "Viewing in {language} — Help translate this page" with a link to the translation contribution system
2. The "455+ publications" text should acknowledge: "Most content is in English. Help us bring it to {language}."
3. Add a "Translate This Page" button that opens Google Translate for the current URL

### TASK 5: Translation contribution tracking (database)

Create migration `20260409000003_k373_translation_contributions.sql`:
```sql
CREATE TABLE translation_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  page_route TEXT NOT NULL,
  source_lang TEXT NOT NULL DEFAULT 'en',
  target_lang TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  marks_awarded NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE translation_contributions ENABLE ROW LEVEL SECURITY;

-- Members can submit translations
CREATE POLICY "Members can submit translations"
  ON translation_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_id);

-- Members can view their own submissions
CREATE POLICY "Members can view own translations"
  ON translation_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

-- Create index for language pair lookups
CREATE INDEX idx_translation_lang_pair ON translation_contributions(source_lang, target_lang);
CREATE INDEX idx_translation_page ON translation_contributions(page_route, target_lang);
```

### TASK 6: Seed a Mirror Mirror Deck Card

Add to the deck_cards migration or create a new one:
```sql
INSERT INTO deck_cards (card_key, title, description, icon, card_type, rarity, destination_route, unlock_cost_type, unlock_cost_amount)
VALUES (
  'mirror-mirror-translate',
  'Mirror Mirror — The Translation Card',
  'Unlocked by speaking friend in any language. Every language matters.',
  '💎',
  'museum',
  'uncommon',
  '/mirror',
  'free',
  0
);
```

## Architecture Notes

- The `friendWords.ts` file will be ~500 lines. That's fine — it's data, not logic.
- Pre-translated strings for 110 languages is NOT feasible by hand. Provide translations for the TOP 20 languages (Spanish, French, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, German, Italian, Russian, Turkish, Vietnamese, Thai, Indonesian, Malay, Dutch, Polish, Swedish, Bengali). For the other 90, use English fallback + Google Translate link.
- The translation contribution system is a MARKS-earning activity — members earn differential Marks for confirmed translations. Wire this to the existing Marks system but don't build the Marks-awarding logic yet — just track contributions.

## Founder Corrections (MUST follow)

- Credits NEVER cash out to fiat. One-way valve.
- Marks are differential — earned through effort, not purchased.
- "Fair means everyone can read it" is the tagline for Mirror Mirror.
- HEOHO = Help Each Other Help Ourselves = Interdependence.
- Hexislo.com is INTENTIONAL — Spanish version of HexIsle. NOT a typo.

## Done-when

- [ ] friendWords.ts has 110+ languages (plus Sindarin/Klingon/Valyrian)
- [ ] Typing friend in ANY of 110 languages unlocks Mirror Mirror
- [ ] MirrorMirror page displays in detected language (top 20 translated, rest English+link)
- [ ] CephasBasement shows language-aware banner when arriving from Mirror Mirror
- [ ] translation_contributions table created with RLS
- [ ] Mirror Mirror Deck Card seeded
- [ ] Build passes
- [ ] TypeScript compiles cleanly
