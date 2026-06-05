/**
 * i18n Configuration — Full react-i18next Setup
 * ================================================
 * Option B: Build for the long haul.
 *
 * 58+ languages supported via Durin's Door language codes.
 * Community translation workflow:
 *   1. Member translates strings → earns Marks
 *   2. Second member verifies → stamps translation
 *   3. Consensus required before going live
 *   4. A-Aron Device flags pronunciation concerns
 *
 * Translations loaded from /public/locales/{lang}/translation.json
 * English is the fallback. New languages start empty and get
 * filled through community contribution.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

/**
 * All 58 languages from the Durin's Door system, plus extras.
 * Each maps to a standard BCP 47 language tag.
 *
 * The "thinking words" (denken, pensar, etc.) that trigger
 * language switching in Durin's Door map to these codes.
 */
export const SUPPORTED_LANGUAGES: {
  code: string;
  name: string;        // English name
  nativeName: string;  // Native name
  thinkingWord?: string; // Durin's Door "thinking word" password
  friendWord?: string;   // "Friend" in this language
}[] = [
  { code: "en", name: "English", nativeName: "English", thinkingWord: "think", friendWord: "friend" },
  { code: "es", name: "Spanish", nativeName: "Español", thinkingWord: "pensar", friendWord: "amigo" },
  { code: "de", name: "German", nativeName: "Deutsch", thinkingWord: "denken", friendWord: "freund" },
  { code: "fr", name: "French", nativeName: "Français", thinkingWord: "penser", friendWord: "ami" },
  { code: "ja", name: "Japanese", nativeName: "日本語", thinkingWord: "kangaeru", friendWord: "tomodachi" },
  { code: "zh", name: "Mandarin Chinese", nativeName: "中文", thinkingWord: "sīkǎo", friendWord: "pengyou" },
  { code: "ko", name: "Korean", nativeName: "한국어", thinkingWord: "saenggakhada", friendWord: "chingu" },
  { code: "ar", name: "Arabic", nativeName: "العربية", thinkingWord: "tafkir", friendWord: "sadiq" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", thinkingWord: "fikiri", friendWord: "rafiki" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", thinkingWord: "sochna", friendWord: "dost" },
  { code: "pt", name: "Portuguese", nativeName: "Português", thinkingWord: "pensar", friendWord: "amigo" },
  { code: "ru", name: "Russian", nativeName: "Русский", thinkingWord: "dumat", friendWord: "drug" },
  { code: "it", name: "Italian", nativeName: "Italiano", thinkingWord: "pensare", friendWord: "amico" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", thinkingWord: "denken", friendWord: "vriend" },
  { code: "pl", name: "Polish", nativeName: "Polski", thinkingWord: "myśleć", friendWord: "przyjaciel" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", thinkingWord: "düşünmek", friendWord: "arkadaş" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", thinkingWord: "suy nghĩ", friendWord: "bạn" },
  { code: "th", name: "Thai", nativeName: "ไทย", thinkingWord: "kit", friendWord: "phuan" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", thinkingWord: "dumaty", friendWord: "druh" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", thinkingWord: "skeftomái", friendWord: "filos" },
  { code: "he", name: "Hebrew", nativeName: "עברית", thinkingWord: "lachshov", friendWord: "chaver" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", thinkingWord: "berpikir", friendWord: "teman" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", thinkingWord: "berfikir", friendWord: "kawan" },
  { code: "tl", name: "Filipino", nativeName: "Filipino", thinkingWord: "mag-isip", friendWord: "kaibigan" },
  { code: "ro", name: "Romanian", nativeName: "Română", thinkingWord: "gândi", friendWord: "prieten" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", thinkingWord: "gondolkodni", friendWord: "barát" },
  { code: "cs", name: "Czech", nativeName: "Čeština", thinkingWord: "myslet", friendWord: "přítel" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", thinkingWord: "tänka", friendWord: "vän" },
  { code: "da", name: "Danish", nativeName: "Dansk", thinkingWord: "tænke", friendWord: "ven" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", thinkingWord: "ajatella", friendWord: "ystävä" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", thinkingWord: "tenke", friendWord: "venn" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", thinkingWord: "mislya", friendWord: "priyatel" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", thinkingWord: "misliti", friendWord: "prijatelj" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", thinkingWord: "myslieť", friendWord: "priateľ" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", thinkingWord: "misliti", friendWord: "prijatelj" },
  { code: "et", name: "Estonian", nativeName: "Eesti", thinkingWord: "mõtlema", friendWord: "sõber" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", thinkingWord: "domāt", friendWord: "draugs" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", thinkingWord: "galvoti", friendWord: "draugas" },
  { code: "ka", name: "Georgian", nativeName: "ქართული", thinkingWord: "pikri", friendWord: "megobari" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", thinkingWord: "maseb", friendWord: "guadegna" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá", thinkingWord: "ronú", friendWord: "ọrẹ" },
  { code: "ig", name: "Igbo", nativeName: "Igbo", thinkingWord: "chee", friendWord: "enyi" },
  { code: "ha", name: "Hausa", nativeName: "Hausa", thinkingWord: "tunani", friendWord: "aboki" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", thinkingWord: "cabanga", friendWord: "umngane" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa", thinkingWord: "cinga", friendWord: "umhlobo" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", thinkingWord: "bhaba", friendWord: "bondhu" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", thinkingWord: "yosi", friendWord: "nanbane" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", thinkingWord: "aalochana", friendWord: "snehitudu" },
  { code: "ur", name: "Urdu", nativeName: "اردو", thinkingWord: "sochna", friendWord: "dost" },
  { code: "fa", name: "Persian", nativeName: "فارسی", thinkingWord: "fekr kardan", friendWord: "doost" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", thinkingWord: "sochnu", friendWord: "saathi" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල", thinkingWord: "hithanawa", friendWord: "yaluwa" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ", thinkingWord: "kit", friendWord: "mitt" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ", thinkingWord: "sitkhae", friendWord: "thangein" },
  { code: "lo", name: "Lao", nativeName: "ລາວ", thinkingWord: "kit", friendWord: "moo" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол", thinkingWord: "bodoh", friendWord: "naiz" },
  { code: "sq", name: "Albanian", nativeName: "Shqip", thinkingWord: "mendoj", friendWord: "mik" },
  // Special entries (lore languages)
  { code: "qya", name: "Quenya (Elvish)", nativeName: "Quenya", friendWord: "mellon" },
  { code: "rap", name: "Rapa Nui", nativeName: "Vananga Rapa Nui", friendWord: "hoa" },

  // Wave D: 150-language expansion (no thinkingWord/friendWord yet -- community bounties)
  { code: "bn",  name: "Bengali",          nativeName: "বাংলা" },
  { code: "mr",  name: "Marathi",          nativeName: "मराठी" },
  { code: "te",  name: "Telugu",           nativeName: "తెలుగు" },
  { code: "tr",  name: "Turkish",          nativeName: "Türkçe" },
  { code: "yue", name: "Cantonese",        nativeName: "廣東話" },
  { code: "ta",  name: "Tamil",            nativeName: "தமிழ்" },
  { code: "vi",  name: "Vietnamese",       nativeName: "Tiếng Việt" },
  { code: "gu",  name: "Gujarati",         nativeName: "ગુજરાતી" },
  { code: "kn",  name: "Kannada",          nativeName: "ಕನ್ನಡ" },
  { code: "pa",  name: "Punjabi",          nativeName: "ਪੰਜਾਬੀ" },
  { code: "jv",  name: "Javanese",         nativeName: "Basa Jawa" },
  { code: "or",  name: "Odia",             nativeName: "ଓଡ଼ିଆ" },
  { code: "ff",  name: "Fula",             nativeName: "Fulfulde" },
  { code: "so",  name: "Somali",           nativeName: "Soomaali" },
  { code: "az",  name: "Azerbaijani",      nativeName: "Azərbaycan" },
  { code: "tl",  name: "Filipino",         nativeName: "Filipino" },
  { code: "ceb", name: "Cebuano",          nativeName: "Cebuano" },
  { code: "mg",  name: "Malagasy",         nativeName: "Malagasy" },
  { code: "sd",  name: "Sindhi",           nativeName: "سنڌي" },
  { code: "ku",  name: "Kurdish",          nativeName: "Kurdî" },
  { code: "kk",  name: "Kazakh",           nativeName: "Қазақша" },
  { code: "sn",  name: "Shona",            nativeName: "Shona" },
  { code: "bo",  name: "Tibetan",          nativeName: "བོད་སྐད།" },
  { code: "su",  name: "Sundanese",        nativeName: "Basa Sunda" },
  { code: "bho", name: "Bhojpuri",         nativeName: "भोजपुरी" },
  { code: "mai", name: "Maithili",         nativeName: "मैथिली" },
  { code: "ro",  name: "Romanian",         nativeName: "Română" },
  { code: "cs",  name: "Czech",            nativeName: "Čeština" },
  { code: "el",  name: "Greek",            nativeName: "Ελληνικά" },
  { code: "hu",  name: "Hungarian",        nativeName: "Magyar" },
  { code: "hr",  name: "Croatian",         nativeName: "Hrvatski" },
  { code: "sr",  name: "Serbian",          nativeName: "Српски" },
  { code: "bs",  name: "Bosnian",          nativeName: "Bosanski" },
  { code: "rw",  name: "Kinyarwanda",      nativeName: "Ikinyarwanda" },
  { code: "ln",  name: "Lingala",          nativeName: "Lingála" },
  { code: "ny",  name: "Chichewa",         nativeName: "Chichewa" },
  { code: "lo",  name: "Lao",              nativeName: "ລາວ" },
  { code: "fi",  name: "Finnish",          nativeName: "Suomi" },
  { code: "da",  name: "Danish",           nativeName: "Dansk" },
  { code: "no",  name: "Norwegian",        nativeName: "Norsk" },
  { code: "sk",  name: "Slovak",           nativeName: "Slovenčina" },
  { code: "sl",  name: "Slovenian",        nativeName: "Slovenščina" },
  { code: "et",  name: "Estonian",         nativeName: "Eesti" },
  { code: "lv",  name: "Latvian",          nativeName: "Latviešu" },
  { code: "lt",  name: "Lithuanian",       nativeName: "Lietuvių" },
  { code: "hy",  name: "Armenian",         nativeName: "Հայերեն" },
  { code: "ca",  name: "Catalan",          nativeName: "Català" },
  { code: "mk",  name: "Macedonian",       nativeName: "Македонски" },
  { code: "be",  name: "Belarusian",       nativeName: "Беларуская" },
  { code: "af",  name: "Afrikaans",        nativeName: "Afrikaans" },
  { code: "xh",  name: "Xhosa",            nativeName: "isiXhosa" },
  { code: "st",  name: "Sesotho",          nativeName: "Sesotho" },
  { code: "tn",  name: "Setswana",         nativeName: "Setswana" },
  { code: "wo",  name: "Wolof",            nativeName: "Wolof" },
  { code: "ak",  name: "Akan",             nativeName: "Akan" },
  { code: "ee",  name: "Ewe",              nativeName: "Eʋegbe" },
  { code: "ky",  name: "Kyrgyz",           nativeName: "Кыргызча" },
  { code: "tg",  name: "Tajik",            nativeName: "Тоҷикӣ" },
  { code: "tk",  name: "Turkmen",          nativeName: "Türkmen" },
  { code: "ug",  name: "Uyghur",           nativeName: "ئۇيغۇرچە" },
  { code: "yi",  name: "Yiddish",          nativeName: "ייִדיש" },
  { code: "mt",  name: "Maltese",          nativeName: "Malti" },
  { code: "eu",  name: "Basque",           nativeName: "Euskara" },
  { code: "gl",  name: "Galician",         nativeName: "Galego" },
  { code: "cy",  name: "Welsh",            nativeName: "Cymraeg" },
  { code: "ga",  name: "Irish",            nativeName: "Gaeilge" },
  { code: "is",  name: "Icelandic",        nativeName: "Íslenska" },
  { code: "lb",  name: "Luxembourgish",    nativeName: "Lëtzebuergesch" },
  { code: "ht",  name: "Haitian Creole",   nativeName: "Kreyol ayisyen" },
  { code: "qu",  name: "Quechua",          nativeName: "Runasimi" },
  { code: "war", name: "Waray",            nativeName: "Winaray" },
  { code: "nso", name: "Northern Sotho",   nativeName: "Sepedi" },
  { code: "lg",  name: "Luganda",          nativeName: "Luganda" },
  { code: "ts",  name: "Tsonga",           nativeName: "Xitsonga" },
  { code: "ss",  name: "Swati",            nativeName: "siSwati" },
  { code: "sat", name: "Santali",          nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "doi", name: "Dogri",            nativeName: "डोगरी" },
  { code: "kok", name: "Konkani",          nativeName: "कोंकणी" },
  { code: "mni", name: "Manipuri",         nativeName: "মেইতেই লোন্" },
  { code: "as",  name: "Assamese",         nativeName: "অসমীয়া" },
  { code: "ckb", name: "Central Kurdish",  nativeName: "کوردیی ناوەندی" },
  { code: "ay",  name: "Aymara",           nativeName: "Aymar aru" },
  { code: "sm",  name: "Samoan",           nativeName: "Gagana Samoa" },
  { code: "mi",  name: "Maori",            nativeName: "Te Reo Maori" },
  { code: "fj",  name: "Fijian",           nativeName: "Na Vosa Vakaviti" },
  { code: "to",  name: "Tongan",           nativeName: "Lea faka-Tonga" },
  { code: "haw", name: "Hawaiian",         nativeName: "Olelo Hawaii" },
  { code: "dv",  name: "Dhivehi",          nativeName: "ދިވެހި" },
  { code: "om",  name: "Oromo",            nativeName: "Afaan Oromoo" },
  { code: "ti",  name: "Tigrinya",         nativeName: "ትግርኛ" },
  { code: "rn",  name: "Kirundi",          nativeName: "Kirundi" },
  { code: "sg",  name: "Sango",            nativeName: "Sango" },
  { code: "lu",  name: "Luba-Katanga",     nativeName: "Kiluba" },
  { code: "kg",  name: "Kongo",            nativeName: "Kikongo" },
  { code: "gn",  name: "Guarani",          nativeName: "Avañe'e" },
  { code: "tet", name: "Tetum",            nativeName: "Tetun" },
  { code: "tpi", name: "Tok Pisin",        nativeName: "Tok Pisin" },
  { code: "ilo", name: "Ilocano",          nativeName: "Ilokano" },
  { code: "tt",  name: "Tatar",            nativeName: "Татар теле" },
  { code: "zgh", name: "Tamazight",        nativeName: "ⵜⴰⵎⴰⵣⵉⵖⵜ" },
  { code: "hil", name: "Hiligaynon",       nativeName: "Ilonggo" },
  { code: "min", name: "Minangkabau",      nativeName: "Baso Minangkabau" },
  { code: "bug", name: "Buginese",         nativeName: "Basa Ugi" },
  { code: "cv",  name: "Chuvash",          nativeName: "Чӑваш чӗлхи" },
  { code: "br",  name: "Breton",           nativeName: "Brezhoneg" },
  { code: "ve",  name: "Venda",            nativeName: "Tshivenda" },
  { code: "pam", name: "Kapampangan",      nativeName: "Kapampangan" },
  { code: "dz",  name: "Dzongkha",         nativeName: "རྫོང་ཁ" },
  { code: "nr",  name: "Southern Ndebele", nativeName: "isiNdebele" },
  { code: "gd",  name: "Scottish Gaelic",  nativeName: "Gaidhlig" },
  { code: "kab", name: "Kabyle",           nativeName: "Taqbaylit" },
  { code: "ps",  name: "Pashto",           nativeName: "پښتو" },
  { code: "uk",  name: "Ukrainian",        nativeName: "Українська" },
];

/**
 * Build a lookup map: thinkingWord → language code
 * Used by Durin's Door to switch languages.
 */
export const THINKING_WORD_MAP: Record<string, string> = {};
for (const lang of SUPPORTED_LANGUAGES) {
  if (lang.thinkingWord) {
    THINKING_WORD_MAP[lang.thinkingWord.toLowerCase()] = lang.code;
  }
}

/**
 * Build a lookup map: friendWord → language code
 * Used by the "Friend" page to render content in that language.
 */
export const FRIEND_WORD_MAP: Record<string, string> = {};
for (const lang of SUPPORTED_LANGUAGES) {
  if (lang.friendWord) {
    FRIEND_WORD_MAP[lang.friendWord.toLowerCase()] = lang.code;
  }
}

// ── Domain-based language detection ──
// hexislo.com and elsegundosegundo.com are Spanish-language portals.
// This custom detector runs before browser detection.

const domainLanguageDetector = {
  name: "domainDetector",
  lookup(): string | undefined {
    if (typeof window === "undefined") return undefined;
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname.includes("hexislo.com") ||
      hostname.includes("elsegundosegundo.com")
    ) {
      return "es";
    }
    return undefined;
  },
};

// ── Query-param language detector (?lang=es) ──
// Supports hreflang alternate URLs and direct locale links.
// Stores to lb_language so i18n caches the choice.

const queryParamDetector = {
  name: "queryParam",
  lookup(): string | undefined {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    return lang || undefined;
  },
};

// ── Initialize i18next ──

const languageDetector = new LanguageDetector();
languageDetector.addDetector(domainLanguageDetector);
languageDetector.addDetector(queryParamDetector);

i18n
  .use(HttpBackend)           // Load translations from /public/locales/
  .use(languageDetector)      // Detect user language (domain, localStorage, browser)
  .use(initReactI18next)      // React bindings
  .init({
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),

    // Detection order: domain → ?lang= query param → localStorage → browser
    detection: {
      order: ["domainDetector", "queryParam", "localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "lb_language",
      caches: ["localStorage"],
    },

    // Backend: load from /public/locales/{lang}/translation.json
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },

    // Namespace
    ns: ["translation"],
    defaultNS: "translation",

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Don't wait for all translations to load before rendering
    react: {
      useSuspense: false,
    },
  });

export default i18n;
