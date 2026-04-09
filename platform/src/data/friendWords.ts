/**
 * friendWords.ts — 110+ language "friend" translations for the HEOHO keyhole.
 * "Speak Friend and Enter" — type the word for "friend" in any language to unlock Mirror Mirror.
 * Covers all Google Translate languages plus Sindarin, Klingon, and High Valyrian.
 */

export interface FriendWord {
  word: string;
  language: string;
  langCode: string;
  nativeName: string;
}

export const FRIEND_WORDS: FriendWord[] = [
  // ── A ──
  { word: "аишьа", language: "Abkhazian", langCode: "ab", nativeName: "Аԥсшәа" },
  { word: "ngon", language: "Acehnese", langCode: "ace", nativeName: "Bahsa Acèh" },
  { word: "raqo", language: "Afar", langCode: "aa", nativeName: "Qafar af" },
  { word: "vriend", language: "Afrikaans", langCode: "af", nativeName: "Afrikaans" },
  { word: "adamfo", language: "Akan", langCode: "ak", nativeName: "Akan" },
  { word: "mik", language: "Albanian", langCode: "sq", nativeName: "Shqip" },
  { word: "ጓደኛ", language: "Amharic", langCode: "am", nativeName: "አማርኛ" },
  { word: "صديق", language: "Arabic", langCode: "ar", nativeName: "العربية" },
  { word: "sadiq", language: "Arabic", langCode: "ar", nativeName: "العربية" },
  { word: "ընկdelays", language: "Armenian", langCode: "hy", nativeName: "Հայերեն" },
  { word: "বন্ধু", language: "Assamese", langCode: "as", nativeName: "অসমীয়া" },
  { word: "гьалмагъ", language: "Avaric", langCode: "av", nativeName: "Авар мацӀ" },
  { word: "yaar", language: "Awadhi", langCode: "awa", nativeName: "अवधी" },
  { word: "masuru", language: "Aymara", langCode: "ay", nativeName: "Aymar aru" },
  { word: "dost", language: "Azerbaijani", langCode: "az", nativeName: "Azərbaycan" },
  // ── B ──
  { word: "timpal", language: "Balinese", langCode: "ban", nativeName: "Basa Bali" },
  { word: "دوست", language: "Baluchi", langCode: "bal", nativeName: "بلوچی" },
  { word: "tericé", language: "Bambara", langCode: "bm", nativeName: "Bamanankan" },
  { word: "বন্ধু", language: "Bangla", langCode: "bn", nativeName: "বাংলা" },
  { word: "bondhu", language: "Bangla", langCode: "bn", nativeName: "বাংলা" },
  { word: "lagun", language: "Basque", langCode: "eu", nativeName: "Euskara" },
  { word: "сябар", language: "Belarusian", langCode: "be", nativeName: "Беларуская" },
  { word: "दोस्त", language: "Bhojpuri", langCode: "bho", nativeName: "भोजपुरी" },
  { word: "prijatelj", language: "Bosnian", langCode: "bs", nativeName: "Bosanski" },
  { word: "приятел", language: "Bulgarian", langCode: "bg", nativeName: "Български" },
  { word: "သူငယ်ချင်း", language: "Burmese", langCode: "my", nativeName: "မြန်မာ" },
  // ── C ──
  { word: "amic", language: "Catalan", langCode: "ca", nativeName: "Català" },
  { word: "higala", language: "Cebuano", langCode: "ceb", nativeName: "Cebuano" },
  { word: "朋友", language: "Chinese (Simplified)", langCode: "zh-CN", nativeName: "中文(简体)" },
  { word: "pengyou", language: "Chinese (Simplified)", langCode: "zh-CN", nativeName: "中文(简体)" },
  { word: "amicu", language: "Corsican", langCode: "co", nativeName: "Corsu" },
  { word: "prijatelj", language: "Croatian", langCode: "hr", nativeName: "Hrvatski" },
  { word: "přítel", language: "Czech", langCode: "cs", nativeName: "Čeština" },
  // ── D ──
  { word: "ven", language: "Danish", langCode: "da", nativeName: "Dansk" },
  { word: "ރައްޓެހި", language: "Dhivehi", langCode: "dv", nativeName: "ދިވެހި" },
  { word: "dogri", language: "Dogri", langCode: "doi", nativeName: "डोगरी" },
  { word: "vriend", language: "Dutch", langCode: "nl", nativeName: "Nederlands" },
  // ── E ──
  { word: "friend", language: "English", langCode: "en", nativeName: "English" },
  { word: "amiko", language: "Esperanto", langCode: "eo", nativeName: "Esperanto" },
  { word: "sõber", language: "Estonian", langCode: "et", nativeName: "Eesti" },
  { word: "xɔlɔ̃", language: "Ewe", langCode: "ee", nativeName: "Eʋegbe" },
  // ── F ──
  { word: "kaibigan", language: "Filipino", langCode: "fil", nativeName: "Filipino" },
  { word: "ystävä", language: "Finnish", langCode: "fi", nativeName: "Suomi" },
  { word: "ami", language: "French", langCode: "fr", nativeName: "Français" },
  { word: "freon", language: "Frisian", langCode: "fy", nativeName: "Frysk" },
  // ── G ──
  { word: "amigo", language: "Galician", langCode: "gl", nativeName: "Galego" },
  { word: "მეგობარი", language: "Georgian", langCode: "ka", nativeName: "ქართული" },
  { word: "freund", language: "German", langCode: "de", nativeName: "Deutsch" },
  { word: "φίλος", language: "Greek", langCode: "el", nativeName: "Ελληνικά" },
  { word: "filos", language: "Greek", langCode: "el", nativeName: "Ελληνικά" },
  { word: "iru", language: "Guarani", langCode: "gn", nativeName: "Avañe'ẽ" },
  { word: "મિત્ર", language: "Gujarati", langCode: "gu", nativeName: "ગુજરાતી" },
  // ── H ──
  { word: "zanmi", language: "Haitian Creole", langCode: "ht", nativeName: "Kreyòl Ayisyen" },
  { word: "hawile", language: "Hakha Chin", langCode: "cnh", nativeName: "Lai" },
  { word: "aboki", language: "Hausa", langCode: "ha", nativeName: "Hausa" },
  { word: "hoaaloha", language: "Hawaiian", langCode: "haw", nativeName: "ʻŌlelo Hawaiʻi" },
  { word: "חבר", language: "Hebrew", langCode: "he", nativeName: "עברית" },
  { word: "chaver", language: "Hebrew", langCode: "he", nativeName: "עברית" },
  { word: "abyan", language: "Hiligaynon", langCode: "hil", nativeName: "Hiligaynon" },
  { word: "दोस्त", language: "Hindi", langCode: "hi", nativeName: "हिन्दी" },
  { word: "mitra", language: "Hindi", langCode: "hi", nativeName: "हिन्दी" },
  { word: "phoojywg", language: "Hmong", langCode: "hmn", nativeName: "Hmoob" },
  { word: "barát", language: "Hungarian", langCode: "hu", nativeName: "Magyar" },
  { word: "freind", language: "Hunsrik", langCode: "hrx", nativeName: "Hunsrik" },
  // ── I ──
  { word: "pangan", language: "Iban", langCode: "iba", nativeName: "Iban" },
  { word: "vinur", language: "Icelandic", langCode: "is", nativeName: "Íslenska" },
  { word: "enyi", language: "Igbo", langCode: "ig", nativeName: "Igbo" },
  { word: "gayyem", language: "Iloko", langCode: "ilo", nativeName: "Iloko" },
  { word: "teman", language: "Indonesian", langCode: "id", nativeName: "Bahasa Indonesia" },
  { word: "cara", language: "Irish", langCode: "ga", nativeName: "Gaeilge" },
  { word: "amico", language: "Italian", langCode: "it", nativeName: "Italiano" },
  // ── J ──
  { word: "fren", language: "Jamaican Patois", langCode: "jam", nativeName: "Patwa" },
  { word: "友達", language: "Japanese", langCode: "ja", nativeName: "日本語" },
  { word: "tomodachi", language: "Japanese", langCode: "ja", nativeName: "日本語" },
  { word: "kanca", language: "Javanese", langCode: "jv", nativeName: "Basa Jawa" },
  { word: "hpunau", language: "Jingpo", langCode: "kac", nativeName: "Jingpho" },
  // ── K ──
  { word: "ಸ್ನೇಹಿತ", language: "Kannada", langCode: "kn", nativeName: "ಕನ್ನಡ" },
  { word: "дос", language: "Kazakh", langCode: "kk", nativeName: "Қазақша" },
  { word: "មិត្ត", language: "Khmer", langCode: "km", nativeName: "ភាសាខ្មែរ" },
  { word: "inshuti", language: "Kinyarwanda", langCode: "rw", nativeName: "Ikinyarwanda" },
  { word: "इश्ट", language: "Konkani", langCode: "kok", nativeName: "कोंकणी" },
  { word: "친구", language: "Korean", langCode: "ko", nativeName: "한국어" },
  { word: "chingu", language: "Korean", langCode: "ko", nativeName: "한국어" },
  { word: "padi", language: "Krio", langCode: "kri", nativeName: "Krio" },
  { word: "heval", language: "Kurdish (Kurmanji)", langCode: "ku", nativeName: "Kurmancî" },
  { word: "هاوڕێ", language: "Kurdish (Sorani)", langCode: "ckb", nativeName: "سۆرانی" },
  { word: "дос", language: "Kyrgyz", langCode: "ky", nativeName: "Кыргызча" },
  // ── L ──
  { word: "ເພື່ອນ", language: "Lao", langCode: "lo", nativeName: "ລາວ" },
  { word: "amicus", language: "Latin", langCode: "la", nativeName: "Latina" },
  { word: "draugs", language: "Latvian", langCode: "lv", nativeName: "Latviešu" },
  { word: "moninga", language: "Lingala", langCode: "ln", nativeName: "Lingála" },
  { word: "draugas", language: "Lithuanian", langCode: "lt", nativeName: "Lietuvių" },
  { word: "mukwano", language: "Luganda", langCode: "lg", nativeName: "Luganda" },
  { word: "frënd", language: "Luxembourgish", langCode: "lb", nativeName: "Lëtzebuergesch" },
  // ── M ──
  { word: "пријател", language: "Macedonian", langCode: "mk", nativeName: "Македонски" },
  { word: "मित्र", language: "Maithili", langCode: "mai", nativeName: "मैथिली" },
  { word: "namana", language: "Malagasy", langCode: "mg", nativeName: "Malagasy" },
  { word: "kawan", language: "Malay", langCode: "ms", nativeName: "Bahasa Melayu" },
  { word: "സുഹൃത്ത്", language: "Malayalam", langCode: "ml", nativeName: "മലയാളം" },
  { word: "ħabib", language: "Maltese", langCode: "mt", nativeName: "Malti" },
  { word: "hoa", language: "Maori", langCode: "mi", nativeName: "Te Reo Māori" },
  { word: "मित्र", language: "Marathi", langCode: "mr", nativeName: "मराठी" },
  { word: "kanba", language: "Meiteilon", langCode: "mni", nativeName: "মৈতৈলোন্" },
  { word: "thiante", language: "Mizo", langCode: "lus", nativeName: "Mizo" },
  { word: "найз", language: "Mongolian", langCode: "mn", nativeName: "Монгол" },
  // ── N ──
  { word: "साथी", language: "Nepali", langCode: "ne", nativeName: "नेपाली" },
  { word: "sathi", language: "Nepali", langCode: "ne", nativeName: "नेपाली" },
  { word: "venn", language: "Norwegian", langCode: "no", nativeName: "Norsk" },
  // ── O ──
  { word: "ବନ୍ଧୁ", language: "Odia", langCode: "or", nativeName: "ଓଡ଼ିଆ" },
  { word: "hiriyya", language: "Oromo", langCode: "om", nativeName: "Afaan Oromoo" },
  { word: "лимæн", language: "Ossetic", langCode: "os", nativeName: "Ирон æвзаг" },
  // ── P ──
  { word: "kaluguran", language: "Pampanga", langCode: "pam", nativeName: "Kapampangan" },
  { word: "kaaro", language: "Pangasinan", langCode: "pag", nativeName: "Pangasinan" },
  { word: "amigu", language: "Papiamento", langCode: "pap", nativeName: "Papiamentu" },
  { word: "ملګری", language: "Pashto", langCode: "ps", nativeName: "پښتو" },
  { word: "دوست", language: "Persian", langCode: "fa", nativeName: "فارسی" },
  { word: "doost", language: "Persian", langCode: "fa", nativeName: "فارسی" },
  { word: "przyjaciel", language: "Polish", langCode: "pl", nativeName: "Polski" },
  { word: "amigo", language: "Portuguese", langCode: "pt", nativeName: "Português" },
  { word: "ਮਿੱਤਰ", language: "Punjabi", langCode: "pa", nativeName: "ਪੰਜਾਬੀ" },
  // ── Q ──
  { word: "masiy", language: "Quechua", langCode: "qu", nativeName: "Runasimi" },
  // ── R ──
  { word: "prieten", language: "Romanian", langCode: "ro", nativeName: "Română" },
  { word: "maal", language: "Romany", langCode: "rom", nativeName: "Romani" },
  { word: "umugenzi", language: "Rundi", langCode: "rn", nativeName: "Ikirundi" },
  { word: "друг", language: "Russian", langCode: "ru", nativeName: "Русский" },
  { word: "drug", language: "Russian", langCode: "ru", nativeName: "Русский" },
  // ── S ──
  { word: "uo", language: "Samoan", langCode: "sm", nativeName: "Gagana Samoa" },
  { word: "zo", language: "Sango", langCode: "sg", nativeName: "Sängö" },
  { word: "मित्रम्", language: "Sanskrit", langCode: "sa", nativeName: "संस्कृतम्" },
  { word: "caraid", language: "Scots Gaelic", langCode: "gd", nativeName: "Gàidhlig" },
  { word: "пријатељ", language: "Serbian", langCode: "sr", nativeName: "Српски" },
  { word: "motswalle", language: "Sesotho", langCode: "st", nativeName: "Sesotho" },
  { word: "shamwari", language: "Shona", langCode: "sn", nativeName: "ChiShona" },
  { word: "سنڌي", language: "Sindhi", langCode: "sd", nativeName: "سنڌي" },
  { word: "මිතුරා", language: "Sinhala", langCode: "si", nativeName: "සිංහල" },
  { word: "priateľ", language: "Slovak", langCode: "sk", nativeName: "Slovenčina" },
  { word: "prijatelj", language: "Slovenian", langCode: "sl", nativeName: "Slovenščina" },
  { word: "saaxiib", language: "Somali", langCode: "so", nativeName: "Soomaali" },
  { word: "amigo", language: "Spanish", langCode: "es", nativeName: "Español" },
  { word: "babaturan", language: "Sundanese", langCode: "su", nativeName: "Basa Sunda" },
  { word: "rafiki", language: "Swahili", langCode: "sw", nativeName: "Kiswahili" },
  { word: "vän", language: "Swedish", langCode: "sv", nativeName: "Svenska" },
  // ── T ──
  { word: "дӯст", language: "Tajik", langCode: "tg", nativeName: "Тоҷикӣ" },
  { word: "நண்பன்", language: "Tamil", langCode: "ta", nativeName: "தமிழ்" },
  { word: "நண்பா", language: "Tamil", langCode: "ta", nativeName: "தமிழ்" },
  { word: "дус", language: "Tatar", langCode: "tt", nativeName: "Татар" },
  { word: "స్నేహితుడు", language: "Telugu", langCode: "te", nativeName: "తెలుగు" },
  { word: "เพื่อน", language: "Thai", langCode: "th", nativeName: "ไทย" },
  { word: "phuen", language: "Thai", langCode: "th", nativeName: "ไทย" },
  { word: "ዓርኪ", language: "Tigrinya", langCode: "ti", nativeName: "ትግርኛ" },
  { word: "munghana", language: "Tsonga", langCode: "ts", nativeName: "Xitsonga" },
  { word: "arkadaş", language: "Turkish", langCode: "tr", nativeName: "Türkçe" },
  { word: "arkadas", language: "Turkish", langCode: "tr", nativeName: "Türkçe" },
  { word: "dost", language: "Turkmen", langCode: "tk", nativeName: "Türkmen" },
  { word: "adamfo", language: "Twi", langCode: "tw", nativeName: "Twi" },
  // ── U ──
  { word: "друг", language: "Ukrainian", langCode: "uk", nativeName: "Українська" },
  { word: "دوست", language: "Urdu", langCode: "ur", nativeName: "اردو" },
  { word: "دوست", language: "Uyghur", langCode: "ug", nativeName: "ئۇيغۇرچە" },
  { word: "dost", language: "Uzbek", langCode: "uz", nativeName: "Oʻzbek" },
  // ── V ──
  { word: "bạn", language: "Vietnamese", langCode: "vi", nativeName: "Tiếng Việt" },
  { word: "ban", language: "Vietnamese", langCode: "vi", nativeName: "Tiếng Việt" },
  // ── W ──
  { word: "ffrind", language: "Welsh", langCode: "cy", nativeName: "Cymraeg" },
  // ── X ──
  { word: "umhlobo", language: "Xhosa", langCode: "xh", nativeName: "IsiXhosa" },
  // ── Y ──
  { word: "פרײַנד", language: "Yiddish", langCode: "yi", nativeName: "ייִדיש" },
  { word: "fraynd", language: "Yiddish", langCode: "yi", nativeName: "ייִדיש" },
  { word: "ọrẹ", language: "Yoruba", langCode: "yo", nativeName: "Yorùbá" },
  { word: "ore", language: "Yoruba", langCode: "yo", nativeName: "Yorùbá" },
  // ── Z ──
  { word: "umngane", language: "Zulu", langCode: "zu", nativeName: "IsiZulu" },

  // ══ Fictional languages ══
  { word: "mellon", language: "Sindarin (Elvish)", langCode: "sjn", nativeName: "Sindarin" },
  { word: "jup", language: "Klingon", langCode: "tlh", nativeName: "tlhIngan Hol" },
  { word: "raqiros", language: "High Valyrian", langCode: "val", nativeName: "Valyrio Eglie" },
];

/**
 * Lookup map keyed by lowercased word. First entry wins for collisions.
 * Supports both native script and romanized forms.
 */
export const FRIEND_WORDS_MAP: Record<string, FriendWord> = {};
for (const fw of FRIEND_WORDS) {
  const key = fw.word.toLowerCase();
  if (!FRIEND_WORDS_MAP[key]) {
    FRIEND_WORDS_MAP[key] = fw;
  }
}

/** Get unique languages (deduplicated by langCode) */
export function getUniqueLanguages(): FriendWord[] {
  const seen = new Set<string>();
  return FRIEND_WORDS.filter((fw) => {
    if (seen.has(fw.langCode)) return false;
    seen.add(fw.langCode);
    return true;
  });
}
