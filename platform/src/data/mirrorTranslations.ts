/**
 * mirrorTranslations.ts — Pre-translated Mirror Mirror strings for top-20 languages.
 * Other languages fall back to English + Google Translate link.
 *
 * Strings:
 *   greeting: "You said '{word}' — welcome, {nativeName} speaker!"
 *   description: "Liana Banyan isn't fully translated into {language} yet..."
 *   cta: "Every language matters. Fairest means everyone can read it."
 *   goldenKey: "Collect golden keys to unlock Easter Egg Knowledge"
 */

export interface MirrorStrings {
  greeting: string;       // uses {word} and {nativeName} placeholders
  description: string;    // uses {language} placeholder
  cta: string;
  goldenKey: string;
  mirrorWord: string;     // the word "Mirror" in this language (reflected under title)
  welcomeHelp: string;    // welcome + translate ask in this language
}

const FALLBACK: MirrorStrings = {
  greeting: "You said '{word}' — welcome, {nativeName} speaker!",
  description: "Liana Banyan isn't fully translated into {language} yet. But it will be — because you can help. Translate or confirm translations on any page and earn Marks for your contribution.",
  cta: "Every language matters. Fairest means everyone can read it.",
  goldenKey: "Collect golden keys to unlock Easter Egg Knowledge",
  mirrorWord: "Mirror",
  welcomeHelp: "Welcome! We need you! Can you help us translate?",
};

const TRANSLATIONS: Record<string, MirrorStrings> = {
  es: {
    greeting: "Dijiste '{word}' — ¡bienvenido, hablante de {nativeName}!",
    description: "Liana Banyan aún no está completamente traducida al {language}. Pero lo estará — porque tú puedes ayudar. Traduce o confirma traducciones en cualquier página y gana Marks por tu contribución.",
    cta: "Cada idioma importa. Justo significa que todos puedan leerlo.",
    goldenKey: "Colecciona llaves doradas para desbloquear conocimiento oculto",
    mirrorWord: "Espejo",
    welcomeHelp: "¡Bienvenidos! ¡Los necesitamos! ¿Pueden ayudarnos a traducir?",
  },
  fr: {
    greeting: "Vous avez dit '{word}' — bienvenue, locuteur {nativeName} !",
    description: "Liana Banyan n'est pas encore entièrement traduit en {language}. Mais ça viendra — car vous pouvez aider. Traduisez ou confirmez les traductions sur n'importe quelle page et gagnez des Marks pour votre contribution.",
    cta: "Chaque langue compte. L'équité, c'est que tout le monde puisse lire.",
    goldenKey: "Collectionnez les clés dorées pour débloquer des connaissances cachées",
    mirrorWord: "Miroir",
    welcomeHelp: "Bienvenue ! Nous avons besoin de vous ! Pouvez-vous nous aider à traduire ?",
  },
  pt: {
    greeting: "Você disse '{word}' — bem-vindo, falante de {nativeName}!",
    description: "O Liana Banyan ainda não está totalmente traduzido para {language}. Mas será — porque você pode ajudar. Traduza ou confirme traduções em qualquer página e ganhe Marks pela sua contribuição.",
    cta: "Todo idioma importa. Justo significa que todos possam ler.",
    goldenKey: "Colete chaves douradas para desbloquear conhecimento oculto",
    mirrorWord: "Espelho",
    welcomeHelp: "Bem-vindos! Precisamos de vocês! Podem nos ajudar a traduzir?",
  },
  "zh-CN": {
    greeting: "你说了'{word}' — 欢迎，{nativeName}使用者！",
    description: "Liana Banyan 尚未完全翻译成{language}。但会的——因为你可以帮忙。翻译或确认任何页面的翻译，赚取 Marks 作为你的贡献。",
    cta: "每种语言都重要。公平意味着每个人都能阅读。",
    goldenKey: "收集金钥匙解锁隐藏知识",
    mirrorWord: "镜子",
    welcomeHelp: "欢迎！我们需要你！你能帮我们翻译吗？",
  },
  ja: {
    greeting: "'{word}'と言いましたね — ようこそ、{nativeName}話者さん！",
    description: "Liana Banyanはまだ{language}に完全に翻訳されていません。でも、あなたの助けがあれば実現します。どのページでも翻訳・確認に参加してMarksを獲得しましょう。",
    cta: "すべての言語が大切です。公平とは、誰もが読めること。",
    goldenKey: "ゴールデンキーを集めて隠された知識を解放しよう",
    mirrorWord: "鏡",
    welcomeHelp: "ようこそ！あなたが必要です！翻訳を手伝ってもらえますか？",
  },
  ko: {
    greeting: "'{word}'라고 하셨네요 — 환영합니다, {nativeName} 사용자!",
    description: "Liana Banyan은 아직 {language}로 완전히 번역되지 않았습니다. 하지만 가능해질 것입니다 — 당신이 도울 수 있으니까요. 어떤 페이지에서든 번역하거나 번역을 확인하고 Marks를 획득하세요.",
    cta: "모든 언어가 중요합니다. 공정함은 모두가 읽을 수 있다는 뜻입니다.",
    goldenKey: "골든 키를 모아 숨겨진 지식을 잠금 해제하세요",
    mirrorWord: "거울",
    welcomeHelp: "환영합니다! 여러분이 필요해요! 번역을 도와주실 수 있나요?",
  },
  ar: {
    greeting: "قلت '{word}' — أهلاً وسهلاً، متحدث {nativeName}!",
    description: "لم تتم ترجمة Liana Banyan بالكامل إلى {language} بعد. لكنها ستُترجم — لأنك تستطيع المساعدة. ترجم أو أكّد الترجمات على أي صفحة واكسب Marks مقابل مساهمتك.",
    cta: "كل لغة مهمة. العدل يعني أن يستطيع الجميع القراءة.",
    goldenKey: "اجمع المفاتيح الذهبية لفتح المعرفة المخفية",
    mirrorWord: "مرآة",
    welcomeHelp: "أهلاً بكم! نحن بحاجة إليكم! هل يمكنكم مساعدتنا في الترجمة؟",
  },
  hi: {
    greeting: "आपने '{word}' कहा — स्वागत है, {nativeName} बोलने वाले!",
    description: "Liana Banyan अभी पूरी तरह {language} में अनुवादित नहीं है। लेकिन होगा — क्योंकि आप मदद कर सकते हैं। किसी भी पेज पर अनुवाद करें या अनुवाद की पुष्टि करें और Marks कमाएं।",
    cta: "हर भाषा मायने रखती है। निष्पक्षता का मतलब है कि सभी पढ़ सकें।",
    goldenKey: "छुपे हुए ज्ञान को अनलॉक करने के लिए सुनहरी चाबियाँ इकट्ठी करें",
    mirrorWord: "दर्पण",
    welcomeHelp: "स्वागत है! हमें आपकी ज़रूरत है! क्या आप हमें अनुवाद में मदद कर सकते हैं?",
  },
  de: {
    greeting: "Du hast '{word}' gesagt — willkommen, {nativeName}-Sprecher!",
    description: "Liana Banyan ist noch nicht vollständig ins {language} übersetzt. Aber das wird sich ändern — denn du kannst helfen. Übersetze oder bestätige Übersetzungen auf jeder Seite und verdiene Marks für deinen Beitrag.",
    cta: "Jede Sprache zählt. Fairness bedeutet, dass jeder lesen kann.",
    goldenKey: "Sammle goldene Schlüssel, um verborgenes Wissen freizuschalten",
    mirrorWord: "Spiegel",
    welcomeHelp: "Willkommen! Wir brauchen dich! Kannst du uns beim Übersetzen helfen?",
  },
  it: {
    greeting: "Hai detto '{word}' — benvenuto, parlante di {nativeName}!",
    description: "Liana Banyan non è ancora completamente tradotto in {language}. Ma lo sarà — perché puoi aiutare tu. Traduci o conferma traduzioni su qualsiasi pagina e guadagna Marks per il tuo contributo.",
    cta: "Ogni lingua conta. Equità significa che tutti possano leggere.",
    goldenKey: "Raccogli chiavi d'oro per sbloccare conoscenze nascoste",
    mirrorWord: "Specchio",
    welcomeHelp: "Benvenuti! Abbiamo bisogno di voi! Potete aiutarci a tradurre?",
  },
  ru: {
    greeting: "Вы сказали '{word}' — добро пожаловать, носитель {nativeName}!",
    description: "Liana Banyan ещё не полностью переведён на {language}. Но будет — потому что вы можете помочь. Переводите или подтверждайте переводы на любой странице и зарабатывайте Marks за свой вклад.",
    cta: "Каждый язык важен. Справедливость — это когда каждый может читать.",
    goldenKey: "Собирайте золотые ключи, чтобы открыть скрытые знания",
    mirrorWord: "Зеркало",
    welcomeHelp: "Добро пожаловать! Вы нам нужны! Можете помочь нам с переводом?",
  },
  tr: {
    greeting: "'{word}' dediniz — hoş geldiniz, {nativeName} konuşanı!",
    description: "Liana Banyan henüz tamamen {language} diline çevrilmedi. Ama olacak — çünkü siz yardım edebilirsiniz. Herhangi bir sayfada çeviri yapın veya onaylayın ve katkınız için Marks kazanın.",
    cta: "Her dil önemlidir. Adalet, herkesin okuyabilmesi demektir.",
    goldenKey: "Gizli bilgilerin kilidini açmak için altın anahtarlar toplayın",
    mirrorWord: "Ayna",
    welcomeHelp: "Hoş geldiniz! Size ihtiyacımız var! Çeviride bize yardım edebilir misiniz?",
  },
  vi: {
    greeting: "Bạn đã nói '{word}' — chào mừng, người nói {nativeName}!",
    description: "Liana Banyan chưa được dịch hoàn toàn sang {language}. Nhưng sẽ có — vì bạn có thể giúp. Dịch hoặc xác nhận bản dịch trên bất kỳ trang nào và nhận Marks cho đóng góp của bạn.",
    cta: "Mọi ngôn ngữ đều quan trọng. Công bằng nghĩa là ai cũng đọc được.",
    goldenKey: "Thu thập chìa khóa vàng để mở khóa kiến thức ẩn",
    mirrorWord: "Gương",
    welcomeHelp: "Chào mừng! Chúng tôi cần bạn! Bạn có thể giúp chúng tôi dịch không?",
  },
  th: {
    greeting: "คุณพูดว่า '{word}' — ยินดีต้อนรับ ผู้พูด{nativeName}!",
    description: "Liana Banyan ยังไม่ได้แปลเป็น{language}ทั้งหมด แต่จะเป็นเช่นนั้น — เพราะคุณสามารถช่วยได้ แปลหรือยืนยันคำแปลในหน้าใดก็ได้และรับ Marks จากการมีส่วนร่วม",
    cta: "ทุกภาษาสำคัญ ความยุติธรรมหมายถึงทุกคนสามารถอ่านได้",
    goldenKey: "สะสมกุญแจทองเพื่อปลดล็อกความรู้ที่ซ่อนอยู่",
    mirrorWord: "กระจก",
    welcomeHelp: "ยินดีต้อนรับ! เราต้องการคุณ! คุณช่วยเราแปลได้ไหม?",
  },
  id: {
    greeting: "Kamu bilang '{word}' — selamat datang, penutur {nativeName}!",
    description: "Liana Banyan belum sepenuhnya diterjemahkan ke {language}. Tapi akan — karena kamu bisa membantu. Terjemahkan atau konfirmasi terjemahan di halaman mana pun dan dapatkan Marks untuk kontribusimu.",
    cta: "Setiap bahasa penting. Adil berarti semua orang bisa membaca.",
    goldenKey: "Kumpulkan kunci emas untuk membuka pengetahuan tersembunyi",
    mirrorWord: "Cermin",
    welcomeHelp: "Selamat datang! Kami butuh kamu! Bisakah kamu membantu kami menerjemahkan?",
  },
  ms: {
    greeting: "Anda kata '{word}' — selamat datang, penutur {nativeName}!",
    description: "Liana Banyan belum diterjemahkan sepenuhnya ke {language}. Tetapi akan — kerana anda boleh membantu. Terjemah atau sahkan terjemahan di mana-mana halaman dan peroleh Marks untuk sumbangan anda.",
    cta: "Setiap bahasa penting. Adil bermakna semua orang boleh membaca.",
    goldenKey: "Kumpul kunci emas untuk membuka pengetahuan tersembunyi",
    mirrorWord: "Cermin",
    welcomeHelp: "Selamat datang! Kami perlukan anda! Bolehkah anda membantu kami menterjemah?",
  },
  nl: {
    greeting: "Je zei '{word}' — welkom, {nativeName}-spreker!",
    description: "Liana Banyan is nog niet volledig vertaald naar het {language}. Maar dat komt — want jij kunt helpen. Vertaal of bevestig vertalingen op elke pagina en verdien Marks voor je bijdrage.",
    cta: "Elke taal telt. Eerlijk betekent dat iedereen het kan lezen.",
    goldenKey: "Verzamel gouden sleutels om verborgen kennis te ontgrendelen",
    mirrorWord: "Spiegel",
    welcomeHelp: "Welkom! We hebben je nodig! Kun je ons helpen vertalen?",
  },
  pl: {
    greeting: "Powiedziałeś '{word}' — witaj, użytkowniku {nativeName}!",
    description: "Liana Banyan nie jest jeszcze w pełni przetłumaczony na {language}. Ale będzie — bo możesz pomóc. Tłumacz lub potwierdź tłumaczenia na dowolnej stronie i zdobywaj Marks za swój wkład.",
    cta: "Każdy język ma znaczenie. Sprawiedliwość oznacza, że każdy może czytać.",
    goldenKey: "Zbieraj złote klucze, aby odblokować ukrytą wiedzę",
    mirrorWord: "Lustro",
    welcomeHelp: "Witajcie! Potrzebujemy was! Czy możecie nam pomóc w tłumaczeniu?",
  },
  sv: {
    greeting: "Du sa '{word}' — välkommen, {nativeName}-talare!",
    description: "Liana Banyan är inte helt översatt till {language} ännu. Men det kommer att bli — för du kan hjälpa till. Översätt eller bekräfta översättningar på vilken sida som helst och tjäna Marks för ditt bidrag.",
    cta: "Varje språk räknas. Rättvisa innebär att alla kan läsa.",
    goldenKey: "Samla gyllene nycklar för att låsa upp dold kunskap",
    mirrorWord: "Spegel",
    welcomeHelp: "Välkomna! Vi behöver er! Kan ni hjälpa oss att översätta?",
  },
  bn: {
    greeting: "আপনি '{word}' বলেছেন — স্বাগতম, {nativeName} ভাষাভাষী!",
    description: "Liana Banyan এখনও সম্পূর্ণভাবে {language} ভাষায় অনুবাদ করা হয়নি। কিন্তু হবে — কারণ আপনি সাহায্য করতে পারেন। যেকোনো পেজে অনুবাদ করুন বা অনুবাদ নিশ্চিত করুন এবং আপনার অবদানের জন্য Marks অর্জন করুন।",
    cta: "প্রতিটি ভাষা গুরুত্বপূর্ণ। ন্যায্যতা মানে সবাই পড়তে পারে।",
    goldenKey: "লুকানো জ্ঞান আনলক করতে সোনার চাবি সংগ্রহ করুন",
    mirrorWord: "আয়না",
    welcomeHelp: "স্বাগতম! আমাদের আপনাকে দরকার! আপনি কি আমাদের অনুবাদে সাহায্য করতে পারেন?",
  },
};

/**
 * Get translated strings for a language code.
 * Falls back to English for untranslated languages.
 */
export function getMirrorStrings(langCode: string): MirrorStrings {
  return TRANSLATIONS[langCode] || FALLBACK;
}

/** Interpolate placeholders in a mirror string */
export function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key) => vars[key] ?? `{${key}}`
  );
}

/** Whether we have pre-translated strings for this language */
export function hasTranslation(langCode: string): boolean {
  return langCode in TRANSLATIONS;
}

export const TRANSLATED_LANG_CODES = Object.keys(TRANSLATIONS);
