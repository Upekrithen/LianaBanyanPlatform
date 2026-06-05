/**
 * languages.ts -- Wave D / D1
 * ============================
 * TypeScript mirror of public/locales/languages.json.
 * Used by SpeakFriendPage and any component needing compile-time access to the
 * full 150-language manifest.
 *
 * Source of truth for CI: public/locales/languages.json
 * Source of truth for components: this file
 *
 * Keep these in sync. The generate-locale-stubs.cjs script uses languages.json.
 */

export interface LanguageEntry {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  rtl: boolean;
  speakerCount: number;
  region: string;
  ratified: boolean;
  speakFriendPhrase: string;
}

export const LANGUAGES: LanguageEntry[] = [
  { code: "en",  name: "English",            nativeName: "English",            script: "Latin",      rtl: false, speakerCount: 1500000000, region: "Global",                   ratified: true,  speakFriendPhrase: "Speak friend, and enter." },
  { code: "zh",  name: "Mandarin Chinese",   nativeName: "中文",               script: "Han",        rtl: false, speakerCount: 1100000000, region: "East Asia",                 ratified: true,  speakFriendPhrase: "说望朋友，即可进入。" },
  { code: "hi",  name: "Hindi",              nativeName: "हिन्दी",              script: "Devanagari", rtl: false, speakerCount: 600000000,  region: "South Asia",                ratified: true,  speakFriendPhrase: "मित्र कहो और प्रवेश करो।" },
  { code: "es",  name: "Spanish",            nativeName: "Español",            script: "Latin",      rtl: false, speakerCount: 540000000,  region: "Global",                   ratified: true,  speakFriendPhrase: "Di amigo, y entra." },
  { code: "fr",  name: "French",             nativeName: "Français",           script: "Latin",      rtl: false, speakerCount: 280000000,  region: "Global",                   ratified: true,  speakFriendPhrase: "Dis ami, et entre." },
  { code: "ar",  name: "Arabic",             nativeName: "العربية",            script: "Arabic",     rtl: true,  speakerCount: 274000000,  region: "Middle East/Africa",        ratified: true,  speakFriendPhrase: "قل صديق، وادخل." },
  { code: "bn",  name: "Bengali",            nativeName: "বাংলা",              script: "Bengali",    rtl: false, speakerCount: 270000000,  region: "South Asia",                ratified: false, speakFriendPhrase: "বন্ধু বলো, এবং প্রবেশ করো।" },
  { code: "ru",  name: "Russian",            nativeName: "Русский",            script: "Cyrillic",   rtl: false, speakerCount: 258000000,  region: "Europe/Asia",               ratified: true,  speakFriendPhrase: "Скажи «друг» -- и войдёшь." },
  { code: "pt",  name: "Portuguese",         nativeName: "Português",          script: "Latin",      rtl: false, speakerCount: 250000000,  region: "Global",                   ratified: true,  speakFriendPhrase: "Dize amigo, e entra." },
  { code: "ur",  name: "Urdu",               nativeName: "اردو",               script: "Arabic",     rtl: true,  speakerCount: 230000000,  region: "South Asia",                ratified: false, speakFriendPhrase: "دوست کہو، اور داخل ہو۔" },
  { code: "id",  name: "Indonesian",         nativeName: "Bahasa Indonesia",   script: "Latin",      rtl: false, speakerCount: 199000000,  region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Ucapkan teman, dan masuklah." },
  { code: "de",  name: "German",             nativeName: "Deutsch",            script: "Latin",      rtl: false, speakerCount: 135000000,  region: "Europe",                   ratified: true,  speakFriendPhrase: "Sprich Freund, und tritt ein." },
  { code: "ja",  name: "Japanese",           nativeName: "日本語",             script: "CJK",        rtl: false, speakerCount: 126000000,  region: "East Asia",                 ratified: true,  speakFriendPhrase: "友と言えば、入ることができる。" },
  { code: "sw",  name: "Swahili",            nativeName: "Kiswahili",          script: "Latin",      rtl: false, speakerCount: 100000000,  region: "Africa",                   ratified: false, speakFriendPhrase: "Sema rafiki, na uingie." },
  { code: "mr",  name: "Marathi",            nativeName: "मराठी",               script: "Devanagari", rtl: false, speakerCount: 95000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "मित्र म्हणा आणि आत या।" },
  { code: "te",  name: "Telugu",             nativeName: "తెలుగు",             script: "Telugu",     rtl: false, speakerCount: 95000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "స్నేహితుడా అని చెప్పి లోపలికి రా." },
  { code: "tr",  name: "Turkish",            nativeName: "Türkçe",             script: "Latin",      rtl: false, speakerCount: 88000000,   region: "Europe/Middle East",        ratified: false, speakFriendPhrase: "Dost de ve gir." },
  { code: "yue", name: "Cantonese",          nativeName: "廣東話",             script: "Han",        rtl: false, speakerCount: 84000000,   region: "East Asia",                 ratified: false, speakFriendPhrase: "講朋友，然後入嚟。" },
  { code: "ta",  name: "Tamil",              nativeName: "தமிழ்",              script: "Tamil",      rtl: false, speakerCount: 78000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "நண்பன் என்று சொல்லி உள்ளே வா." },
  { code: "vi",  name: "Vietnamese",         nativeName: "Tiếng Việt",         script: "Latin",      rtl: false, speakerCount: 77000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Nói bạn, và bước vào." },
  { code: "fa",  name: "Persian",            nativeName: "فارسی",              script: "Arabic",     rtl: true,  speakerCount: 77000000,   region: "Middle East",               ratified: false, speakFriendPhrase: "بگو دوست، و وارد شو." },
  { code: "ko",  name: "Korean",             nativeName: "한국어",              script: "Hangul",     rtl: false, speakerCount: 77000000,   region: "East Asia",                 ratified: true,  speakFriendPhrase: "친구라 말하면 들어갈 수 있습니다." },
  { code: "it",  name: "Italian",            nativeName: "Italiano",           script: "Latin",      rtl: false, speakerCount: 65000000,   region: "Europe",                   ratified: true,  speakFriendPhrase: "Di amico, ed entra." },
  { code: "ha",  name: "Hausa",              nativeName: "Hausa",              script: "Latin",      rtl: false, speakerCount: 63000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Ce aboki, ka shiga." },
  { code: "th",  name: "Thai",               nativeName: "ไทย",                script: "Thai",       rtl: false, speakerCount: 60000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "พูดว่าเพื่อน แล้วเข้ามา" },
  { code: "gu",  name: "Gujarati",           nativeName: "ગુજરાતી",            script: "Gujarati",   rtl: false, speakerCount: 57000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "મિત્ર કહો અને અંદર આવો." },
  { code: "am",  name: "Amharic",            nativeName: "አማርኛ",               script: "Ethiopic",   rtl: false, speakerCount: 57000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "ወዳጅ ብለህ ግባ።" },
  { code: "kn",  name: "Kannada",            nativeName: "ಕನ್ನಡ",              script: "Kannada",    rtl: false, speakerCount: 56000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "ಸ್ನೇಹಿತ ಎಂದು ಹೇಳಿ ಒಳಗೆ ಬಾ." },
  { code: "pl",  name: "Polish",             nativeName: "Polski",             script: "Latin",      rtl: false, speakerCount: 55000000,   region: "Europe",                   ratified: true,  speakFriendPhrase: "Mow przyjacielu i wejdz." },
  { code: "pa",  name: "Punjabi",            nativeName: "ਪੰਜਾਬੀ",             script: "Gurmukhi",   rtl: false, speakerCount: 54000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "ਦੋਸਤ ਕਹੋ ਅਤੇ ਅੰਦਰ ਆਓ।" },
  { code: "jv",  name: "Javanese",           nativeName: "Basa Jawa",          script: "Latin",      rtl: false, speakerCount: 82000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Kandha kanca, banjur mlebu." },
  { code: "or",  name: "Odia",               nativeName: "ଓଡ଼ିଆ",              script: "Odia",       rtl: false, speakerCount: 40000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "ବନ୍ଧୁ କୁହ ଏବଂ ଭିତରକୁ ଆସ।" },
  { code: "yo",  name: "Yoruba",             nativeName: "Yorùbá",             script: "Latin",      rtl: false, speakerCount: 45000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "So ore, ki o wole." },
  { code: "ml",  name: "Malayalam",          nativeName: "മലയാളം",             script: "Malayalam",  rtl: false, speakerCount: 36000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "കൂട്ടുകാരന്‍ എന്ന് പറഞ്ഞ് അകത്ത് കടക്കൂ." },
  { code: "ms",  name: "Malay",              nativeName: "Bahasa Melayu",      script: "Latin",      rtl: false, speakerCount: 33000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Sebut kawan, dan masuk." },
  { code: "uz",  name: "Uzbek",              nativeName: "O'zbek",             script: "Latin",      rtl: false, speakerCount: 34000000,   region: "Central Asia",              ratified: false, speakFriendPhrase: "Do'st de va kir." },
  { code: "ig",  name: "Igbo",               nativeName: "Igbo",               script: "Latin",      rtl: false, speakerCount: 44000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Kuo enyi, wee banye." },
  { code: "my",  name: "Burmese",            nativeName: "မြန်မာ",             script: "Myanmar",    rtl: false, speakerCount: 33000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "မိတ်ဆွေဟု ပြောပြီး ဝင်လာပါ။" },
  { code: "ne",  name: "Nepali",             nativeName: "नेपाली",             script: "Devanagari", rtl: false, speakerCount: 17000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "साथी भन र भित्र आउ।" },
  { code: "ps",  name: "Pashto",             nativeName: "پښتو",               script: "Arabic",     rtl: true,  speakerCount: 49000000,   region: "South Asia/Middle East",    ratified: false, speakFriendPhrase: "ملګری ووایه او ننوځه." },
  { code: "ff",  name: "Fula",               nativeName: "Fulfulde",           script: "Latin",      rtl: false, speakerCount: 40000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Wiy tappude, inna." },
  { code: "uk",  name: "Ukrainian",          nativeName: "Українська",         script: "Cyrillic",   rtl: false, speakerCount: 45000000,   region: "Europe",                   ratified: false, speakFriendPhrase: "Скажи «друг» -- і увійди." },
  { code: "nl",  name: "Dutch",              nativeName: "Nederlands",         script: "Latin",      rtl: false, speakerCount: 30000000,   region: "Europe",                   ratified: true,  speakFriendPhrase: "Spreek vriend en treed binnen." },
  { code: "so",  name: "Somali",             nativeName: "Soomaali",           script: "Latin",      rtl: false, speakerCount: 21000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Dheh saaxiib, oo gal." },
  { code: "az",  name: "Azerbaijani",        nativeName: "Azərbaycan",         script: "Latin",      rtl: false, speakerCount: 23000000,   region: "Caucasus",                  ratified: false, speakFriendPhrase: "Dost de, daxil ol." },
  { code: "tl",  name: "Filipino",           nativeName: "Filipino",           script: "Latin",      rtl: false, speakerCount: 82000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Sabihing kaibigan, at pumasok." },
  { code: "km",  name: "Khmer",              nativeName: "ខ្មែរ",              script: "Khmer",      rtl: false, speakerCount: 16000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "និយាយថា មិត្ត ហើយចូល។" },
  { code: "ceb", name: "Cebuano",            nativeName: "Cebuano",            script: "Latin",      rtl: false, speakerCount: 28000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Ingnon ang higala, ug sulod." },
  { code: "mg",  name: "Malagasy",           nativeName: "Malagasy",           script: "Latin",      rtl: false, speakerCount: 25000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Lazao hoe namana ianao, dia midira." },
  { code: "si",  name: "Sinhala",            nativeName: "සිංහල",              script: "Sinhala",    rtl: false, speakerCount: 17000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "යාළුවා කිව්ව, ඇතුල් වෙල්ලා." },
  { code: "sd",  name: "Sindhi",             nativeName: "سنڌي",               script: "Arabic",     rtl: true,  speakerCount: 32000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "دوست چئو ۽ اندر اچو." },
  { code: "ku",  name: "Kurdish (Kurmanji)", nativeName: "Kurdî",              script: "Latin",      rtl: false, speakerCount: 20000000,   region: "Middle East",               ratified: false, speakFriendPhrase: "Beje dost, û bikeve." },
  { code: "kk",  name: "Kazakh",             nativeName: "Қазақша",            script: "Cyrillic",   rtl: false, speakerCount: 13000000,   region: "Central Asia",              ratified: false, speakFriendPhrase: "Дос де, кір." },
  { code: "sn",  name: "Shona",              nativeName: "Shona",              script: "Latin",      rtl: false, speakerCount: 15000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Ti shamwari, upinde." },
  { code: "mn",  name: "Mongolian",          nativeName: "Монгол",             script: "Cyrillic",   rtl: false, speakerCount: 5000000,    region: "East Asia",                 ratified: false, speakFriendPhrase: "Найз гэж хэлж ор." },
  { code: "bo",  name: "Tibetan",            nativeName: "བོད་སྐད།",            script: "Tibetan",    rtl: false, speakerCount: 6000000,    region: "East Asia",                 ratified: false, speakFriendPhrase: "གྲོགས་པོ་ཟེར་ནས་ཁ་ཡར་བཤད།" },
  { code: "su",  name: "Sundanese",          nativeName: "Basa Sunda",         script: "Latin",      rtl: false, speakerCount: 34000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Sebutkeun babaturan, tuluy asup." },
  { code: "bho", name: "Bhojpuri",           nativeName: "भोजपुरी",            script: "Devanagari", rtl: false, speakerCount: 52000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "दोस्त कहो अउर अंदर जाव।" },
  { code: "mai", name: "Maithili",           nativeName: "मैथिली",             script: "Devanagari", rtl: false, speakerCount: 13000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "दोस्त कहू आ भीतर आबू।" },
  { code: "ro",  name: "Romanian",           nativeName: "Română",             script: "Latin",      rtl: false, speakerCount: 26000000,   region: "Europe",                   ratified: false, speakFriendPhrase: "Spune prieten si intra." },
  { code: "zu",  name: "Zulu",               nativeName: "isiZulu",            script: "Latin",      rtl: false, speakerCount: 12000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Sithi umngane, ungenele." },
  { code: "cs",  name: "Czech",              nativeName: "Čeština",            script: "Latin",      rtl: false, speakerCount: 11000000,   region: "Europe",                   ratified: false, speakFriendPhrase: "Rekni pritel a vstup." },
  { code: "el",  name: "Greek",              nativeName: "Ελληνικά",           script: "Greek",      rtl: false, speakerCount: 13000000,   region: "Europe",                   ratified: false, speakFriendPhrase: "Πες φίλος και μπες." },
  { code: "sv",  name: "Swedish",            nativeName: "Svenska",            script: "Latin",      rtl: false, speakerCount: 11000000,   region: "Europe",                   ratified: true,  speakFriendPhrase: "Sag van och ga in." },
  { code: "hu",  name: "Hungarian",          nativeName: "Magyar",             script: "Latin",      rtl: false, speakerCount: 13000000,   region: "Europe",                   ratified: false, speakFriendPhrase: "Mondj barát, és lépj be." },
  { code: "hr",  name: "Croatian",           nativeName: "Hrvatski",           script: "Latin",      rtl: false, speakerCount: 4000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Reci prijatelj i udi." },
  { code: "sr",  name: "Serbian",            nativeName: "Српски",             script: "Cyrillic",   rtl: false, speakerCount: 8000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Реци пријатељ и уђи." },
  { code: "he",  name: "Hebrew",             nativeName: "עברית",              script: "Hebrew",     rtl: true,  speakerCount: 9000000,    region: "Middle East",               ratified: true,  speakFriendPhrase: "אמור חבר, ובוא." },
  { code: "bs",  name: "Bosnian",            nativeName: "Bosanski",           script: "Latin",      rtl: false, speakerCount: 4000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Reci prijatelju i udi." },
  { code: "rw",  name: "Kinyarwanda",        nativeName: "Ikinyarwanda",       script: "Latin",      rtl: false, speakerCount: 10000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Vuga inshuti, winjire." },
  { code: "ln",  name: "Lingala",            nativeName: "Lingála",            script: "Latin",      rtl: false, speakerCount: 20000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Loba moninga, okota." },
  { code: "ny",  name: "Chichewa",           nativeName: "Chichewa",           script: "Latin",      rtl: false, speakerCount: 12000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Nena bwenzi, ndulowe." },
  { code: "lo",  name: "Lao",                nativeName: "ລາວ",                script: "Lao",        rtl: false, speakerCount: 7000000,    region: "Southeast Asia",            ratified: false, speakFriendPhrase: "ເວົ້າວ່າໝູ່, ແລ້ວເຂົ້າ." },
  { code: "sq",  name: "Albanian",           nativeName: "Shqip",              script: "Latin",      rtl: false, speakerCount: 7000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Thuaj mik dhe hyr." },
  { code: "fi",  name: "Finnish",            nativeName: "Suomi",              script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Sano ystava, ja astu sisaan." },
  { code: "da",  name: "Danish",             nativeName: "Dansk",              script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Sig ven, og gaa ind." },
  { code: "no",  name: "Norwegian",          nativeName: "Norsk",              script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Si venn, og gaa inn." },
  { code: "bg",  name: "Bulgarian",          nativeName: "Български",          script: "Cyrillic",   rtl: false, speakerCount: 7000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Кажи приятел и влез." },
  { code: "sk",  name: "Slovak",             nativeName: "Slovenčina",         script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Povedz priatel a vstup." },
  { code: "sl",  name: "Slovenian",          nativeName: "Slovenščina",        script: "Latin",      rtl: false, speakerCount: 2000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Reci prijatelj in vstopi." },
  { code: "et",  name: "Estonian",           nativeName: "Eesti",              script: "Latin",      rtl: false, speakerCount: 1000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Otle sober ja astu sisse." },
  { code: "lv",  name: "Latvian",            nativeName: "Latviešu",           script: "Latin",      rtl: false, speakerCount: 1500000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Saki draugs un ienac." },
  { code: "lt",  name: "Lithuanian",         nativeName: "Lietuvių",           script: "Latin",      rtl: false, speakerCount: 3000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Sakyk draugas ir eik vidun." },
  { code: "ka",  name: "Georgian",           nativeName: "ქართული",            script: "Georgian",   rtl: false, speakerCount: 4000000,    region: "Caucasus",                  ratified: false, speakFriendPhrase: "თქვი მეგობარი და შედი." },
  { code: "hy",  name: "Armenian",           nativeName: "Հայերեն",            script: "Armenian",   rtl: false, speakerCount: 7000000,    region: "Caucasus",                  ratified: false, speakFriendPhrase: "Ases barer, ews muts." },
  { code: "ca",  name: "Catalan",            nativeName: "Català",             script: "Latin",      rtl: false, speakerCount: 10000000,   region: "Europe",                   ratified: false, speakFriendPhrase: "Digues amic i entra." },
  { code: "mk",  name: "Macedonian",         nativeName: "Македонски",         script: "Cyrillic",   rtl: false, speakerCount: 2000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Кажи пријател и влези." },
  { code: "be",  name: "Belarusian",         nativeName: "Беларуская",         script: "Cyrillic",   rtl: false, speakerCount: 7000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Скажы сябар і ўвайдзі." },
  { code: "af",  name: "Afrikaans",          nativeName: "Afrikaans",          script: "Latin",      rtl: false, speakerCount: 8000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Se vriend en gaan in." },
  { code: "xh",  name: "Xhosa",              nativeName: "isiXhosa",           script: "Latin",      rtl: false, speakerCount: 8000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Thi umhlobo, uze ungene." },
  { code: "st",  name: "Sesotho",            nativeName: "Sesotho",            script: "Latin",      rtl: false, speakerCount: 4000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Re moratwi, o kene." },
  { code: "tn",  name: "Setswana",           nativeName: "Setswana",           script: "Latin",      rtl: false, speakerCount: 4000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Bua ga mogakolodi, o tsene." },
  { code: "wo",  name: "Wolof",              nativeName: "Wolof",              script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Wax jaaraama, dem ci biir." },
  { code: "ak",  name: "Akan",               nativeName: "Akan",               script: "Latin",      rtl: false, speakerCount: 11000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Ka onua, na wo ba." },
  { code: "ee",  name: "Ewe",                nativeName: "Eʋegbe",             script: "Latin",      rtl: false, speakerCount: 7000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Gblo nuvitso, eye nao me." },
  { code: "ky",  name: "Kyrgyz",             nativeName: "Кыргызча",           script: "Cyrillic",   rtl: false, speakerCount: 4000000,    region: "Central Asia",              ratified: false, speakFriendPhrase: "Дос де жана кир." },
  { code: "tg",  name: "Tajik",              nativeName: "Тоҷикӣ",             script: "Cyrillic",   rtl: false, speakerCount: 8000000,    region: "Central Asia",              ratified: false, speakFriendPhrase: "Дуст гу ва даром." },
  { code: "tk",  name: "Turkmen",            nativeName: "Türkmen",            script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Central Asia",              ratified: false, speakFriendPhrase: "Dost diyip git." },
  { code: "ug",  name: "Uyghur",             nativeName: "ئۇيغۇرچە",           script: "Arabic",     rtl: true,  speakerCount: 11000000,   region: "Central Asia",              ratified: false, speakFriendPhrase: "دوست دېگين، كېل كىر." },
  { code: "yi",  name: "Yiddish",            nativeName: "ייִדיש",             script: "Hebrew",     rtl: true,  speakerCount: 1500000,    region: "Global",                   ratified: false, speakFriendPhrase: "זאג פריינד, און אַרײַן." },
  { code: "mt",  name: "Maltese",            nativeName: "Malti",              script: "Latin",      rtl: false, speakerCount: 500000,     region: "Europe",                   ratified: false, speakFriendPhrase: "Qul habib, u idħol." },
  { code: "eu",  name: "Basque",             nativeName: "Euskara",            script: "Latin",      rtl: false, speakerCount: 1000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Esazu adiskide, eta sartu." },
  { code: "gl",  name: "Galician",           nativeName: "Galego",             script: "Latin",      rtl: false, speakerCount: 2500000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Di amigo e entra." },
  { code: "cy",  name: "Welsh",              nativeName: "Cymraeg",            script: "Latin",      rtl: false, speakerCount: 900000,     region: "Europe",                   ratified: false, speakFriendPhrase: "Dywed ffrind a dod i mewn." },
  { code: "ga",  name: "Irish",              nativeName: "Gaeilge",            script: "Latin",      rtl: false, speakerCount: 2000000,    region: "Europe",                   ratified: false, speakFriendPhrase: "Abair cara, agus tar isteach." },
  { code: "is",  name: "Icelandic",          nativeName: "Íslenska",           script: "Latin",      rtl: false, speakerCount: 400000,     region: "Europe",                   ratified: false, speakFriendPhrase: "Segjum vin og farum inn." },
  { code: "lb",  name: "Luxembourgish",      nativeName: "Lëtzebuergesch",     script: "Latin",      rtl: false, speakerCount: 400000,     region: "Europe",                   ratified: false, speakFriendPhrase: "Soe Frënd an geh eran." },
  { code: "ht",  name: "Haitian Creole",     nativeName: "Kreyol ayisyen",     script: "Latin",      rtl: false, speakerCount: 12000000,   region: "Americas",                  ratified: false, speakFriendPhrase: "Di zanmi, epi antre." },
  { code: "qu",  name: "Quechua",            nativeName: "Runasimi",           script: "Latin",      rtl: false, speakerCount: 8000000,    region: "Americas",                  ratified: false, speakFriendPhrase: "Niy masiy, yaykuy." },
  { code: "war", name: "Waray",              nativeName: "Winaray",            script: "Latin",      rtl: false, speakerCount: 3000000,    region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Igsiring kaiba, ug pag-anhi." },
  { code: "nso", name: "Northern Sotho",     nativeName: "Sepedi",             script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Botsa mogwera, o tsene." },
  { code: "lg",  name: "Luganda",            nativeName: "Luganda",            script: "Latin",      rtl: false, speakerCount: 4000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Gamba mukwano, ojje." },
  { code: "ts",  name: "Tsonga",             nativeName: "Xitsonga",           script: "Latin",      rtl: false, speakerCount: 2500000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Vula munghana, uya." },
  { code: "ss",  name: "Swati",              nativeName: "siSwati",            script: "Latin",      rtl: false, speakerCount: 1300000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Shono umngani, ungene." },
  { code: "sat", name: "Santali",            nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",           script: "Ol Chiki",   rtl: false, speakerCount: 7000000,    region: "South Asia",                ratified: false, speakFriendPhrase: "Idom mit baha, ar cal." },
  { code: "doi", name: "Dogri",              nativeName: "डोगरी",              script: "Devanagari", rtl: false, speakerCount: 3000000,    region: "South Asia",                ratified: false, speakFriendPhrase: "दोस्त कहो ते अंदर आओ।" },
  { code: "kok", name: "Konkani",            nativeName: "कोंकणी",             script: "Devanagari", rtl: false, speakerCount: 2000000,    region: "South Asia",                ratified: false, speakFriendPhrase: "मित्र म्हण आनी भितर ये." },
  { code: "mni", name: "Manipuri",           nativeName: "মেইতেই লোন্",        script: "Bengali",    rtl: false, speakerCount: 1800000,    region: "South Asia",                ratified: false, speakFriendPhrase: "Mit phi loi, chet." },
  { code: "as",  name: "Assamese",           nativeName: "অসমীয়া",            script: "Bengali",    rtl: false, speakerCount: 23000000,   region: "South Asia",                ratified: false, speakFriendPhrase: "বন্ধু বোলা আৰু ভিতৰলৈ আহা।" },
  { code: "ckb", name: "Central Kurdish",    nativeName: "کوردیی ناوەندی",     script: "Arabic",     rtl: true,  speakerCount: 8000000,    region: "Middle East",               ratified: false, speakFriendPhrase: "بڵێ هاوڕێ و بکەوە ژوورەوە." },
  { code: "ay",  name: "Aymara",             nativeName: "Aymar aru",          script: "Latin",      rtl: false, speakerCount: 2000000,    region: "Americas",                  ratified: false, speakFriendPhrase: "Sasa masicama, mantani." },
  { code: "sm",  name: "Samoan",             nativeName: "Gagana Samoa",       script: "Latin",      rtl: false, speakerCount: 500000,     region: "Pacific",                   ratified: false, speakFriendPhrase: "Fai e uo, e ulufale." },
  { code: "mi",  name: "Maori",              nativeName: "Te Reo Maori",       script: "Latin",      rtl: false, speakerCount: 100000,     region: "Pacific",                   ratified: false, speakFriendPhrase: "Ko hoa, tomokia." },
  { code: "fj",  name: "Fijian",             nativeName: "Na Vosa Vakaviti",   script: "Latin",      rtl: false, speakerCount: 500000,     region: "Pacific",                   ratified: false, speakFriendPhrase: "Kaya veiwekani, mai lako mai." },
  { code: "to",  name: "Tongan",             nativeName: "Lea faka-Tonga",     script: "Latin",      rtl: false, speakerCount: 100000,     region: "Pacific",                   ratified: false, speakFriendPhrase: "Pehe ko e kaungame'a, huu mai." },
  { code: "haw", name: "Hawaiian",           nativeName: "Olelo Hawaii",       script: "Latin",      rtl: false, speakerCount: 20000,      region: "Pacific",                   ratified: false, speakFriendPhrase: "I aku he hoaloha, e komo mai." },
  { code: "dv",  name: "Dhivehi",            nativeName: "ދިވެހި",             script: "Thaana",     rtl: true,  speakerCount: 300000,     region: "South Asia",                ratified: false, speakFriendPhrase: "ރަހުމަތްތެރިޔާ ބުނެ ވަދޭ." },
  { code: "om",  name: "Oromo",              nativeName: "Afaan Oromoo",       script: "Latin",      rtl: false, speakerCount: 40000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Jaalatamaa jedhi, gali." },
  { code: "ti",  name: "Tigrinya",           nativeName: "ትግርኛ",               script: "Ethiopic",   rtl: false, speakerCount: 7000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "ፈታዊ ኑ እለ ኣቱ።" },
  { code: "rn",  name: "Kirundi",            nativeName: "Kirundi",            script: "Latin",      rtl: false, speakerCount: 9000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Vuga incuti, injira." },
  { code: "sg",  name: "Sango",              nativeName: "Sango",              script: "Latin",      rtl: false, speakerCount: 500000,     region: "Africa",                   ratified: false, speakFriendPhrase: "Kwe zo, a sara." },
  { code: "lu",  name: "Luba-Katanga",       nativeName: "Kiluba",             script: "Latin",      rtl: false, speakerCount: 6000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Bela muntunsumba, kaba." },
  { code: "kg",  name: "Kongo",              nativeName: "Kikongo",            script: "Latin",      rtl: false, speakerCount: 6000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Vova nsinga, vanda." },
  { code: "gn",  name: "Guarani",            nativeName: "Avañe'e",            script: "Latin",      rtl: false, speakerCount: 5000000,    region: "Americas",                  ratified: false, speakFriendPhrase: "Echami amigo, ikove." },
  { code: "tet", name: "Tetum",              nativeName: "Tetun",              script: "Latin",      rtl: false, speakerCount: 800000,     region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Dehan belun, halo fali." },
  { code: "tpi", name: "Tok Pisin",          nativeName: "Tok Pisin",          script: "Latin",      rtl: false, speakerCount: 4000000,    region: "Pacific",                   ratified: false, speakFriendPhrase: "Tokim pren, i go insait." },
  { code: "ilo", name: "Ilocano",            nativeName: "Ilokano",            script: "Latin",      rtl: false, speakerCount: 10000000,   region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Sawen gagayyem, sumrek." },
  { code: "tt",  name: "Tatar",              nativeName: "Татар теле",         script: "Cyrillic",   rtl: false, speakerCount: 5000000,    region: "Europe/Asia",               ratified: false, speakFriendPhrase: "Yar di, ker." },
  { code: "zgh", name: "Tamazight",          nativeName: "ⵜⴰⵎⴰⵣⵉⵖⵜ",          script: "Tifinagh",   rtl: false, speakerCount: 14000000,   region: "Africa",                   ratified: false, speakFriendPhrase: "Ini amddakkal, urid." },
  { code: "hil", name: "Hiligaynon",         nativeName: "Ilonggo",            script: "Latin",      rtl: false, speakerCount: 9000000,    region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Silbi abyan, sulod." },
  { code: "min", name: "Minangkabau",        nativeName: "Baso Minangkabau",   script: "Latin",      rtl: false, speakerCount: 5500000,    region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Kecekkan kawan, masuak." },
  { code: "bug", name: "Buginese",           nativeName: "Basa Ugi",           script: "Lontara",    rtl: false, speakerCount: 5000000,    region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Mattitai ada, muttama." },
  { code: "cv",  name: "Chuvash",            nativeName: "Чӑваш чӗлхи",        script: "Cyrillic",   rtl: false, speakerCount: 1000000,    region: "Europe/Asia",               ratified: false, speakFriendPhrase: "Yytash te, kerek." },
  { code: "br",  name: "Breton",             nativeName: "Brezhoneg",          script: "Latin",      rtl: false, speakerCount: 200000,     region: "Europe",                   ratified: false, speakFriendPhrase: "Lavar mignon, ha deu e-barzh." },
  { code: "ve",  name: "Venda",              nativeName: "Tshivenda",          script: "Latin",      rtl: false, speakerCount: 1200000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Ri muhasho, zwi ite." },
  { code: "pam", name: "Kapampangan",        nativeName: "Kapampangan",        script: "Latin",      rtl: false, speakerCount: 2500000,    region: "Southeast Asia",            ratified: false, speakFriendPhrase: "Sabian amiku, malukluk ka." },
  { code: "dz",  name: "Dzongkha",           nativeName: "རྫོང་ཁ",             script: "Tibetan",    rtl: false, speakerCount: 600000,     region: "South Asia",                ratified: false, speakFriendPhrase: "གྲོགས་པོ་ལབ་ལ་ཤོག" },
  { code: "nr",  name: "Southern Ndebele",   nativeName: "isiNdebele",         script: "Latin",      rtl: false, speakerCount: 1100000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Thi umngane, ungenele." },
  { code: "gd",  name: "Scottish Gaelic",    nativeName: "Gaidhlig",           script: "Latin",      rtl: false, speakerCount: 60000,      region: "Europe",                   ratified: false, speakFriendPhrase: "Can caraid, agus thig a-steach." },
  { code: "kab", name: "Kabyle",             nativeName: "Taqbaylit",          script: "Latin",      rtl: false, speakerCount: 7000000,    region: "Africa",                   ratified: false, speakFriendPhrase: "Ini ameddakel, qqim-d." },
];

export const RATIFIED_LANGUAGES = LANGUAGES.filter((l) => l.ratified);
export const SEEKING_TRANSLATION = LANGUAGES.filter((l) => !l.ratified && l.code !== "en");
export const ALL_REGIONS = [...new Set(LANGUAGES.map((l) => l.region))].sort();
export const ALL_SCRIPTS = [...new Set(LANGUAGES.map((l) => l.script))].sort();

export function formatSpeakerCount(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(0)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toString();
}
