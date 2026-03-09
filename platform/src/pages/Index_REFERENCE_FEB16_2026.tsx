/**
 * INDEX PAGE — BLINDERS VIEW
 * ===========================
 * Unauthenticated: Full-page landing matching original landing.html
 * Authenticated: Minimal chalk-outline discovery view → leads to The Helm
 * 
 * The goal is to NOT overwhelm. Maximum 3-4 visible items at a time.
 * Chalk outlines hint at what's to come.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscovery } from '@/hooks/useDiscovery';
import { DeckCardFrame } from '@/components/DeckCardFrame';
import { WillOWisp } from '@/components/WillOWisp';
import { RosettaKeyboard } from '@/components/RosettaKeyboard';
import { ProfessionalLanding } from '@/components/ProfessionalLanding';
import '@/styles/landing.css';

// Durin's Door Dialog Component
function DurinsDoorDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [friendWord, setFriendWord] = useState('');
  const [message, setMessage] = useState('');
  const [lintel, setLintel] = useState<string[]>([]);
  const [collectedWords, setCollectedWords] = useState<Set<string>>(new Set());
  const [showRosetta, setShowRosetta] = useState(false);
  
  // Load lintel and collected words from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('durins_door_lintel');
    if (stored) {
      setLintel(JSON.parse(stored));
    } else {
      // Seed with some initial words
      setLintel(['ami', '朋友', 'rafiki']);
    }
    
    const collected = localStorage.getItem('satchel_friend_words');
    if (collected) {
      setCollectedWords(new Set(JSON.parse(collected)));
    }
  }, []);
  
  // Known translations of "Friend" in various languages
  const friendTranslations: Record<string, string> = {
    'friend': 'English',
    'amigo': 'Español',
    'ami': 'Français',
    'freund': 'Deutsch',
    '朋友': '中文',
    '友達': '日本語',
    'ともだち': '日本語',
    'tomodachi': '日本語',
    'صديق': 'العربية',
    'sadiq': 'العربية',
    'मित्र': 'हिंदी',
    'mitra': 'हिंदी',
    'dost': 'हिंदी',
    'amico': 'Italiano',
    'друг': 'Русский',
    'droog': 'Русский',
    '친구': '한국어',
    'chingu': '한국어',
    'bạn': 'Tiếng Việt',
    'ban': 'Tiếng Việt',
    'rafiki': 'Kiswahili',
    'vinur': 'Íslenska',
    'vriend': 'Nederlands',
    'przyjaciel': 'Polski',
    'prieten': 'Română',
    'arkadaş': 'Türkçe',
    'arkadas': 'Türkçe',
    'φίλος': 'Ελληνικά',
    'filos': 'Ελληνικά',
    'přítel': 'Čeština',
    'priatel': 'Slovenčina',
    'ystävä': 'Suomi',
    'vän': 'Svenska',
    'ven': 'Dansk/Norsk',
    'kawan': 'Bahasa',
    'kaibigan': 'Filipino',
    'เพื่อน': 'ไทย',
    'pheuan': 'ไทย',
    'bạn bè': 'Tiếng Việt',
    'חבר': 'עברית',
    'chaver': 'עברית',
    'دوست': 'فارسی',
    'doost': 'فارسی',
    'найз': 'Монгол',
    'naiz': 'Монгол',
    'barátom': 'Magyar',
    'sõber': 'Eesti',
    'draugs': 'Latviešu',
    'draugas': 'Lietuvių',
    'მეგობარი': 'ქართული',
    'megobari': 'ქართული',
    'ду|': 'Українська',
    'drug': 'Українська',
    'пријатељ': 'Српски',
    'prijatelj': 'Hrvatski/Srpski',
    // === FICTIONAL LANGUAGES ===
    // Tolkien - Elvish (Sindarin & Quenya)
    'mellon': 'Sindarin (Elvish)',
    'mellonar': 'Sindarin (Elvish)',
    'nildo': 'Quenya (Elvish)',
    'seron': 'Sindarin (Elvish)',
    // Star Trek - Klingon
    'jup': 'Klingon (tlhIngan Hol)',
    "jup'wI'": 'Klingon (tlhIngan Hol)',
    // Game of Thrones - Dothraki
    'qoy': 'Dothraki',
    'rakh': 'Dothraki',
    // Game of Thrones - High Valyrian
    'raqiros': 'High Valyrian',
    'ñuha raqiros': 'High Valyrian',
    // Avatar - Na'vi
    'tsmukan': 'Na\'vi',
    'tsmuke': 'Na\'vi',
    // Star Wars - Mando'a
    'vod': 'Mando\'a',
    // Doctor Who - Gallifreyan (phonetic)
    'gallifrey': 'Gallifreyan',
    // Harry Potter - Latin-ish spells (playful)
    'amicus': 'Latin (Wizard)',
    'socius': 'Latin (Wizard)',
    // Esperanto
    'amiko': 'Esperanto',
  };

  // Add word to lintel (last 3)
  const addToLintel = (word: string) => {
    const newLintel = [word, ...lintel.filter(w => w !== word)].slice(0, 3);
    setLintel(newLintel);
    localStorage.setItem('durins_door_lintel', JSON.stringify(newLintel));
  };

  // Collect word to satchel
  const collectWord = (word: string) => {
    if (!collectedWords.has(word)) {
      const newCollected = new Set(collectedWords);
      newCollected.add(word);
      setCollectedWords(newCollected);
      localStorage.setItem('satchel_friend_words', JSON.stringify([...newCollected]));
      setMessage(`📜 "${word}" added to your satchel!`);
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleSubmit = () => {
    const normalized = friendWord.toLowerCase().trim();
    const language = friendTranslations[normalized];
    
    if (language) {
      // Add to lintel
      addToLintel(normalized);
      // Also add to satchel
      collectWord(normalized);
      
      setMessage(`✅ Welcome, Friend! (${language})`);
      setTimeout(() => {
        onClose();
        navigate('/durins-door');
      }, 1500);
    } else {
      setMessage(`🔒 7/10 — Keep trying! Enter "Friend" in any language.`);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="durins-dialog-overlay" onClick={onClose}>
      <div className="durins-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="durins-close" onClick={onClose}>×</button>
        <h2>🪞 Mirror Mirror 🪞</h2>
        
        {/* THE LINTEL — shows last 3 friend words */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          {lintel.map((word, i) => (
            <span 
              key={word}
              onClick={() => collectWord(word)}
              style={{
                cursor: collectedWords.has(word) ? 'default' : 'pointer',
                opacity: collectedWords.has(word) ? 0.5 : 1,
                padding: '0.25rem 0.5rem',
                background: collectedWords.has(word) ? 'transparent' : 'rgba(52,211,153,0.15)',
                borderRadius: '4px',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              title={collectedWords.has(word) ? 'Already in satchel' : 'Click to add to satchel'}
            >
              {word}
              {i < lintel.length - 1 && <span style={{ opacity: 0.3, marginLeft: '0.75rem' }}>·</span>}
            </span>
          ))}
        </div>
        <p style={{ opacity: 0.4, fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.75rem' }}>
          ↑ The Lintel — tap to collect words from those who passed before
        </p>
        
        <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Speak friend and enter</p>
        <p style={{ opacity: 0.5, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Enter "Friend" in your language, and be Welcomed.
        </p>
        
        {/* Friend Input */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={friendWord}
              onChange={(e) => setFriendWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type 'Friend' in any language..."
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '1.1rem',
                borderRadius: '10px',
                border: '2px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                textAlign: 'center',
              }}
              autoFocus
            />
            <button
              onClick={() => setShowRosetta(true)}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '1.1rem',
                borderRadius: '10px',
                border: '2px solid rgba(255, 193, 68, 0.4)',
                background: 'rgba(255, 193, 68, 0.15)',
                color: '#ffc144',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="🗿 Rosetta Stones — Ghost Keyboard"
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 193, 68, 0.3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 193, 68, 0.15)'; }}
            >
              🗿
            </button>
          </div>
        </div>

        {/* Rosetta Keyboard Modal */}
        {showRosetta && (
          <RosettaKeyboard
            onCharacter={(char) => setFriendWord(prev => prev + char)}
            onWord={(word) => {
              setFriendWord(word);
              setShowRosetta(false);
            }}
            onClose={() => setShowRosetta(false)}
          />
        )}

        {message && (
          <p style={{ 
            textAlign: 'center', 
            marginBottom: '1rem',
            padding: '0.5rem',
            background: message.includes('✅') ? 'rgba(52,211,153,0.2)' : message.includes('📜') ? 'rgba(136,200,255,0.2)' : 'rgba(251,191,36,0.2)',
            borderRadius: '8px'
          }}>
            {message}
          </p>
        )}
        
        {/* Satchel indicator */}
        {collectedWords.size > 0 && (
          <p style={{ opacity: 0.5, fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.75rem' }}>
            📜 Satchel: {collectedWords.size} word{collectedWords.size !== 1 ? 's' : ''} collected
          </p>
        )}
        
        <div style={{ textAlign: 'center' }}>
          <button className="btn" onClick={handleSubmit}>
            Enter
          </button>
        </div>

        <p style={{ opacity: 0.4, fontSize: '0.75rem', marginTop: '1.5rem', textAlign: 'center' }}>
          50+ languages recognized · Icelandic, Swahili, Korean, Arabic, and more
        </p>
      </div>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { discoveries, discoveryLevel } = useDiscovery();

  // ─── AUTHENTICATED: Minimal Discovery View ───
  if (user) {
    return <AuthenticatedDiscoveryView navigate={navigate} discoveries={discoveries} discoveryLevel={discoveryLevel} />;
  }

  // ─── NOT AUTHENTICATED: Landing Page (matches landing.html) ───
  return <PublicLandingView navigate={navigate} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC LANDING VIEW — Matches landing.html exactly
// ═══════════════════════════════════════════════════════════════════════════
function PublicLandingView({ navigate }: { navigate: (path: string) => void }) {
  const [heroFlipped, setHeroFlipped] = useState(false);      // HEOHO card flip
  const [mainCardFlipped, setMainCardFlipped] = useState(false); // Main card (logo + G&G) flip
  const [heroBackExpanded, setHeroBackExpanded] = useState<string | null>(null);  // Expanded topic on Hero Card back
  const [mainBackExpanded, setMainBackExpanded] = useState<string | null>(null);  // Expanded topic on Main Card back
  const [showSignUpForm, setShowSignUpForm] = useState(false);  // Inline sign-up form on Hero Card back
  const [expandedInitiative, setExpandedInitiative] = useState<string | null>(null);  // Expanded initiative on Not Charity card back
  const [mainInitiativeExpanded, setMainInitiativeExpanded] = useState<string | null>(null);  // Expanded initiative on Main Card initiatives section
  const [wispActive, setWispActive] = useState(false);           // Will-o'-Wisp tutorial journey
  const [candleEarned, setCandleEarned] = useState(() => {
    // Check localStorage for previously earned candle
    return localStorage.getItem('liana_first_candle') === 'true';
  });
  const [explainerFlipped, setExplainerFlipped] = useState(false);  // Start unflipped showing white front (simple message), click to flip to dark back (16 initiatives)
  const [pathsSectionFlipped, setPathsSectionFlipped] = useState(false);  // Choose Your Path section flip (trunk-info)
  
  // Mobile detection for UI adjustments
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auto-trigger Spotlight Ranger (Will-o'-Wisp) on first session visit
  // DISABLED on mobile — users click "Walkthrough" link instead
  useEffect(() => {
    // Skip auto-trigger on mobile devices
    if (isMobile) return;
    
    const seenThisSession = sessionStorage.getItem('spotlight_session_landing');
    const neverShow = localStorage.getItem('spotlight_never_landing');
    
    if (!seenThisSession && !neverShow && !candleEarned) {
      // Delay to let page render first
      const timer = setTimeout(() => setWispActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [candleEarned, isMobile]);
  const [flippedPaths, setFlippedPaths] = useState<Set<number>>(new Set());
  const [durinsDoorOpen, setDurinsDoorOpen] = useState(false);
  
  // Professional Navigation State
  const [helmDropdownOpen, setHelmDropdownOpen] = useState(false);
  const [hoveredHelmItem, setHoveredHelmItem] = useState<string | null>(null);
  const [freeExploreDropdownOpen, setFreeExploreDropdownOpen] = useState(false);
  const [mirrorDropdownOpen, setMirrorDropdownOpen] = useState(false);
  const [pageToolsDropdownOpen, setPageToolsDropdownOpen] = useState(false);
  const [showPageTools, setShowPageTools] = useState<boolean>(() => {
    const cached = localStorage.getItem('lb_show_page_tools');
    return cached === 'true'; // Default to false (page tools hidden)
  });
  
  // Helm item explanations
  const helmItemDescriptions: Record<string, { icon: string; title: string; description: string }> = {
    '/feathers': {
      icon: '🪶',
      title: 'Crow Feathers',
      description: 'Your discoveries earn you platform marks which you can use to accomplish tasks, unlock deeper content and features. You earn them by exploring, completing quests, and helping others.',
    },
    '/deck-cards': {
      icon: '🃏',
      title: 'Deck Cards',
      description: 'Shareable info cards you can dispatch to friends, family, or on social media as Cue Cards. Each card acts as a collectible, placeable gateway to a concept, explainer, or invitation.',
    },
    '/hofund': {
      icon: '⚔️',
      title: 'Hofund Studio',
      description: 'The card-minting workshop. Create custom deck cards, cue cards, and dispatches. Named after the sword that guards the Bifrost.',
    },
    '/the-bridge': {
      icon: '🎡',
      title: 'The Bridge',
      description: 'Your command center. Place deck cards to connect to earned locations, view all your connections, scheduled dispatches, and incoming opportunities. The Bifrost to everywhere.',
    },
  };
  
  // ═══════════════════════════════════════════════════════════════════
  // REFACTOR THEME SYSTEM — Live Theme Switcher
  // ═══════════════════════════════════════════════════════════════════
  // Default to 001 (Professional) - Wife's favorite layout for lianabanyan.com
  const [currentTheme, setCurrentTheme] = useState<string>('001');
  const [refactorPanelOpen, setRefactorPanelOpen] = useState(false);
  const [customText, setCustomText] = useState<string>('Help Each Other Help Ourselves');
  const [useDocumentMode, setUseDocumentMode] = useState(false); // True when custom text differs from HEOHO

  const togglePath = (idx: number) => {
    setFlippedPaths(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Background text: alternating colors within each phrase
  // Line type A: white "Help Each Other" + green "Help Ourselves"
  // Line type B: green "Help Each Other" + white "Help Ourselves"
  const repeatCount = 15;
  
  // ═══════════════════════════════════════════════════════════════════
  // THEME DEFINITIONS — "Refactor" 
  // Themes are stored in user portfolios, can be tipped, entered in contests
  // ═══════════════════════════════════════════════════════════════════
  
  // LOCK 001: Original white/green (Founder's Default)
  // LOCK 002: White-dominant with logo accent colors
  // LOCK 003: Prismatic (red, brown, yellow, green, white, blue, purple, gold, charcoal)
  
  // Theme definitions - 3 palette options
  // mode: 'professional' = cream/green/darkerCream triplet pattern with chalk-outlined hero
  // mode: 'alternate' = phrases alternate colors, lines flip pattern
  const themes: Record<string, { name: string; creator: string; mode: string; colors: string[]; anchorColor?: string; background?: string; chalkOutline?: boolean; displayName?: string }> = {
    '001': {
      name: 'Professional',
      displayName: 'Professional',
      creator: 'founder',
      mode: 'professional',  // Special mode: solid deep navy background with chalk-outlined cards
      // Wife's favorite - "Ideas are Free" original static page aesthetic
      // Solid #0a1628 background (--color-deep), chalk outlined cards, Crimson Pro font
      // Pattern: "Help Each Other" (cream) → "Help Ourselves" (green) → "Help Each Other" (darker cream)
      anchorColor: 'rgba(56, 161, 105, 1)',    // --color-canopy: #38a169 for "Help Ourselves"
      colors: [
        'rgba(250, 245, 235, 1)',     // cream for first "Help Each Other"
        'rgba(56, 161, 105, 1)',      // canopy green for "Help Ourselves"  
        'rgba(210, 200, 180, 1)',     // darker cream for second "Help Each Other"
      ],
      // Additional config for professional mode — SOLID background, no gradient
      background: '#0a1628',  // --color-deep from original static page
      chalkOutline: true,
    },
    '002': {
      name: 'Prismatic',
      displayName: 'Prismatic',
      creator: 'founder',
      mode: 'alternate',
      // Ordered: DARK → LIGHT → DARK → LIGHT (no adjacent lights)
      colors: [
        'rgba(220, 38, 38, 0.175)',   // red (DARK)
        'rgba(255, 255, 255, 0.125)', // white (LIGHT)
        'rgba(168, 85, 247, 0.175)',  // purple (DARK)
        'rgba(234, 179, 8, 0.175)',   // yellow (LIGHT)
        'rgba(59, 130, 246, 0.175)',  // blue (DARK)
        'rgba(250, 204, 21, 0.175)',  // gold (LIGHT)
        'rgba(64, 64, 64, 0.15)',     // charcoal (DARK)
        'rgba(34, 197, 94, 0.175)',   // green (DARK)
        'rgba(180, 140, 75, 0.175)',  // brown (DARK)
      ],
    },
    '003': {
      name: 'Custom',
      displayName: 'Make\nYour\nOwn',
      creator: 'user',
      mode: 'alternate',
      // Default to simple white/green - user can customize
      colors: [
        'rgba(255, 255, 255, 0.10)',  // white
        'rgba(52, 211, 153, 0.125)',  // green
      ],
    },
  };
  
  const activeTheme = themes[currentTheme];
  const activeColors = activeTheme.colors;

  // Determine if a color is light (needs black outline) or dark (needs white outline)
  const getStrokeForColor = (rgbaColor: string): string => {
    const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '1px 1px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(0,0,0,0.3)';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    if (luminance > 0.5) {
      return '1px 1px 0 rgba(0,0,0,0.4), -1px -1px 0 rgba(0,0,0,0.4), 1px -1px 0 rgba(0,0,0,0.4), -1px 1px 0 rgba(0,0,0,0.4)';
    } else {
      return '1px 1px 0 rgba(255,255,255,0.4), -1px -1px 0 rgba(255,255,255,0.4), 1px -1px 0 rgba(255,255,255,0.4), -1px 1px 0 rgba(255,255,255,0.4)';
    }
  };

  // Charcoal shadow for non-anchor colors in green anchor modes
  const charcoalStroke = '1px 1px 0 rgba(40,40,40,0.5), -1px -1px 0 rgba(40,40,40,0.5), 1px -1px 0 rgba(40,40,40,0.5), -1px 1px 0 rgba(40,40,40,0.5)';
  // White outline for green anchor
  const whiteStroke = '1px 1px 0 rgba(255,255,255,0.5), -1px -1px 0 rgba(255,255,255,0.5), 1px -1px 0 rgba(255,255,255,0.5), -1px 1px 0 rgba(255,255,255,0.5)';

  // ═══════════════════════════════════════════════════════════════════
  // PARSE CUSTOM TEXT — Lines from document or HEOHO phrases
  // ═══════════════════════════════════════════════════════════════════
  
  // Check if using HEOHO mode (default phrases)
  const isHeohoMode = customText === 'Help Each Other Help Ourselves' || 
                      customText === 'Help Each Other Help Ourselves Help Each Other' ||
                      customText.trim() === '';
  
  // Parse lines from customText (split by newlines for document mode)
  const documentLines = customText.split('\n').filter(line => line.trim() !== '');
  
  // For stats display
  const textPhrases = isHeohoMode ? ['Help Each Other', 'Help Ourselves'] : documentLines;

  // ═══════════════════════════════════════════════════════════════════
  // LINE GENERATORS — Different modes for different themes
  // ═══════════════════════════════════════════════════════════════════
  
  // Document mode: each line from the textarea becomes a repeated line
  const createDocumentLine = (lineIndex: number) => {
    const output = [];
    const lineText = documentLines[lineIndex % documentLines.length] || customText;
    const color = activeColors[lineIndex % activeColors.length];
    
    // Repeat the line text enough times to fill the width
    for (let i = 0; i < repeatCount; i++) {
      const wordColor = activeColors[(lineIndex + i) % activeColors.length];
      output.push(
        <span key={`doc-${lineIndex}-${i}`} style={{ color: wordColor, textShadow: getStrokeForColor(wordColor) }}>
          {lineText}{' '}
        </span>
      );
    }
    return output;
  };
  
  // HEOHO Line A: "Help Each Other" = color[0], "Help Ourselves" = color[1]
  // HEOHO Line B: "Help Each Other" = color[1], "Help Ourselves" = color[0] (flipped)
  const createLineA = () => {
    // Document mode: use parsed lines
    if (!isHeohoMode) {
      return createDocumentLine(0);
    }
    
    const output = [];
    for (let i = 0; i < repeatCount; i++) {
      if (activeTheme.mode === 'professional') {
        // Professional: "Help Each Other" (cream) → "Help Ourselves" (green) → "Help Each Other" (darker cream)
        // Colors: [0] cream, [1] green, [2] darker cream
        const creamColor = activeColors[0];
        const greenColor = activeColors[1];
        const darkerCream = activeColors[2];
        output.push(
          <span key={`a-${i}`}>
            <span style={{ color: creamColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Help Each Other </span>
            <span style={{ color: greenColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Help Ourselves </span>
            <span style={{ color: darkerCream, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Help Each Other </span>
          </span>
        );
      } else if (activeTheme.mode === 'greenAnchor') {
        // "Help Ourselves" always green, "Help Each Other" rotates
        const rotateColor = activeColors[i % activeColors.length];
        output.push(
          <span key={`a-${i}`}>
            <span style={{ color: rotateColor, textShadow: charcoalStroke }}>Help Each Other </span>
            <span style={{ color: activeTheme.anchorColor, textShadow: whiteStroke }}>Help Ourselves </span>
          </span>
        );
      } else if (activeTheme.mode === 'greenAnchorFlip') {
        // Line A: "Help Ourselves" = green, "Help Each Other" = rotates
        const rotateColor = activeColors[i % activeColors.length];
        output.push(
          <span key={`a-${i}`}>
            <span style={{ color: rotateColor, textShadow: charcoalStroke }}>Help Each Other </span>
            <span style={{ color: activeTheme.anchorColor, textShadow: whiteStroke }}>Help Ourselves </span>
          </span>
        );
      } else {
        // 'alternate' mode: phrase 0 gets color at index i, phrase 1 gets color at index i+1
        const color1 = activeColors[i % activeColors.length];
        const color2 = activeColors[(i + 1) % activeColors.length];
        output.push(
          <span key={`a-${i}`}>
            <span style={{ color: color1, textShadow: getStrokeForColor(color1) }}>Help Each Other </span>
            <span style={{ color: color2, textShadow: getStrokeForColor(color2) }}>Help Ourselves </span>
          </span>
        );
      }
    }
    return output;
  };

  const createLineB = () => {
    // Document mode: use parsed lines
    if (!isHeohoMode) {
      return createDocumentLine(1);
    }
    
    const output = [];
    for (let i = 0; i < repeatCount; i++) {
      if (activeTheme.mode === 'professional') {
        // Professional Line B: Same triplet pattern, slightly offset
        const creamColor = activeColors[0];
        const greenColor = activeColors[1];
        const darkerCream = activeColors[2];
        output.push(
          <span key={`b-${i}`}>
            <span style={{ color: darkerCream, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Help Each Other </span>
            <span style={{ color: greenColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Help Ourselves </span>
            <span style={{ color: creamColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Help Each Other </span>
          </span>
        );
      } else if (activeTheme.mode === 'greenAnchor') {
        // Same as line A: "Help Ourselves" always green
        const rotateColor = activeColors[i % activeColors.length];
        output.push(
          <span key={`b-${i}`}>
            <span style={{ color: rotateColor, textShadow: charcoalStroke }}>Help Each Other </span>
            <span style={{ color: activeTheme.anchorColor, textShadow: whiteStroke }}>Help Ourselves </span>
          </span>
        );
      } else if (activeTheme.mode === 'greenAnchorFlip') {
        // Line B: FLIPPED - "Help Each Other" = green, "Help Ourselves" = rotates
        const rotateColor = activeColors[i % activeColors.length];
        output.push(
          <span key={`b-${i}`}>
            <span style={{ color: activeTheme.anchorColor, textShadow: whiteStroke }}>Help Each Other </span>
            <span style={{ color: rotateColor, textShadow: charcoalStroke }}>Help Ourselves </span>
          </span>
        );
      } else {
        // 'alternate' mode: FLIPPED - phrase 0 gets color at index i+1, phrase 1 gets color at index i
        const color1 = activeColors[(i + 1) % activeColors.length];
        const color2 = activeColors[i % activeColors.length];
        output.push(
          <span key={`b-${i}`}>
            <span style={{ color: color1, textShadow: getStrokeForColor(color1) }}>Help Each Other </span>
            <span style={{ color: color2, textShadow: getStrokeForColor(color2) }}>Help Ourselves </span>
          </span>
        );
      }
    }
    return output;
  };
  
  // Document mode line creator for any line index
  const createDocLine = (lineIdx: number) => {
    const output = [];
    const lineText = documentLines[lineIdx % Math.max(documentLines.length, 1)] || customText;
    for (let i = 0; i < repeatCount; i++) {
      const wordColor = activeColors[(lineIdx + i) % activeColors.length];
      output.push(
        <span key={`doc-${lineIdx}-${i}`} style={{ color: wordColor, textShadow: getStrokeForColor(wordColor) }}>
          {lineText}{' '}
        </span>
      );
    }
    return output;
  };
  
  // File upload handler for .md files
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCustomText(content);
      };
      reader.readAsText(file);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // PROFESSIONAL THEME (008) — Uses 007 layout with Professional styling
  // Deep navy gradient, chalk-outlined hero, cream/green text pattern
  // ═══════════════════════════════════════════════════════════════════
  const isProfessionalTheme = currentTheme === '001';
  // SOLID background - NO gradient, same #0a1628 everywhere
  const professionalBackground = isProfessionalTheme 
    ? '#0a1628'
    : undefined;
  
  return (
    <div 
      className={`landing-page ${isProfessionalTheme ? 'professional-mode' : ''}`}
      style={isProfessionalTheme ? { background: professionalBackground } : undefined}
    >
      {/* Animated Background Text — 18 lines (hidden for professional mode which uses static gradient) */}
      {!isProfessionalTheme && (
        <div className="landing-bg-text" aria-hidden="true">
          {isHeohoMode ? (
            // HEOHO mode: alternating line-a and line-b patterns
            <>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
              <span className="line line-a">{createLineA()}</span>
              <span className="line line-b">{createLineB()}</span>
            </>
          ) : (
            // Document mode: each line from the file becomes a display line
            Array.from({ length: 18 }, (_, i) => (
              <span key={`docline-${i}`} className={`line line-${i % 2 === 0 ? 'a' : 'b'}`}>
                {createDocLine(i)}
              </span>
            ))
          )}
        </div>
      )}
      
      {/* Brand Title — Top Left (with Page Tools dropdown for professional mode) */}
      <div 
        className="landing-title"
        style={{ position: 'relative' }}
        onMouseEnter={() => isProfessionalTheme && setPageToolsDropdownOpen(true)}
        onMouseLeave={() => isProfessionalTheme && setPageToolsDropdownOpen(false)}
      >
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
        
        {/* Page Tools Dropdown — Professional Mode Only */}
        {isProfessionalTheme && pageToolsDropdownOpen && (
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              paddingTop: '0.5rem', // Use padding instead of margin to maintain hover zone
            }}>
            <div style={{
              background: '#0a1628',
              border: '1px solid rgba(250, 245, 235, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              minWidth: '180px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}>
            <label 
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                color: '#faf5eb',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}>
              <input
                type="checkbox"
                checked={showPageTools}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setShowPageTools(newValue);
                  localStorage.setItem('lb_show_page_tools', String(newValue));
                  // Dispatch custom event for same-tab listeners
                  window.dispatchEvent(new Event('lb_page_tools_changed'));
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#38a169',
                  cursor: 'pointer',
                }}
              />
              Show Page Tools
            </label>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PROFESSIONAL MODE NAVIGATION — Top Right (like static site)
          Shows: The Helm | Free Explore | Mirror/Mirror
      ═══════════════════════════════════════════════════════════════════ */}
      {/* Professional Nav — Hidden on mobile unless showPageTools is true */}
      {isProfessionalTheme && (!isMobile || showPageTools) ? (
        <nav className="professional-nav" style={{
          position: 'fixed',
          top: '1.5rem',
          right: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '1rem' : '2rem',
          zIndex: 1001,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>
        {/* Note: Mobile styles in landing.css move this nav to bottom of screen */}
          {/* The Helm Dropdown — FIRST */}
          {/* Note: hoveredHelmItem is NOT cleared on dropdown leave - it persists to show in Hero Card */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => !isMobile && setHelmDropdownOpen(true)}
            onMouseLeave={() => !isMobile && setHelmDropdownOpen(false)}
            onClick={() => isMobile && setHelmDropdownOpen(!helmDropdownOpen)}
          >
            <a 
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: helmDropdownOpen ? '#faf5eb' : '#a0aec0',
                textDecoration: 'none',
                fontSize: isMobile ? '1.5rem' : '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
              }}
              title="The Helm"
            >
              {isMobile ? '🪖' : 'The Helm'}
            </a>
            {helmDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                paddingTop: '0.5rem', // Maintain hover zone
              }}>
                {/* Menu items - hovering shows explanation in Hero Card below */}
                <div style={{
                  background: '#0a1628',
                  border: '1px solid rgba(250, 245, 235, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0',
                  minWidth: '180px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}>
                  {[
                    { label: 'Feathers', path: '/feathers' },
                    { label: 'Deck Cards', path: '/deck-cards' },
                    { label: 'Hofund Studio', path: '/hofund' },
                    { label: 'Bridge', path: '/the-bridge' },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredHelmItem(item.path)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 1rem',
                        background: hoveredHelmItem === item.path ? 'rgba(250, 245, 235, 0.1)' : 'transparent',
                        border: 'none',
                        color: hoveredHelmItem === item.path ? '#faf5eb' : '#a0aec0',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Free Explore Dropdown — SECOND */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => !isMobile && setFreeExploreDropdownOpen(true)}
            onMouseLeave={() => !isMobile && setFreeExploreDropdownOpen(false)}
            onClick={() => isMobile && setFreeExploreDropdownOpen(!freeExploreDropdownOpen)}
          >
            <a 
              href="/ghost"
              onClick={(e) => { e.preventDefault(); if (!isMobile) navigate('/ghost'); }}
              style={{
                color: freeExploreDropdownOpen ? '#faf5eb' : '#a0aec0',
                textDecoration: 'none',
                fontSize: isMobile ? '1.5rem' : '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
              }}
              title="Free Explore (Ghost World)"
            >
              {isMobile ? '👻' : 'Free Explore'}
            </a>
            {freeExploreDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                paddingTop: '0.5rem', // Maintain hover zone
              }}>
                <div style={{
                  background: '#0a1628',
                  border: '1px solid rgba(250, 245, 235, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  width: '220px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}>
                  <h4 style={{ 
                    color: '#38a169', 
                    fontSize: '0.9rem', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                  }}>
                    👻 Ghost World
                  </h4>
                  <p style={{ 
                    color: '#a0aec0', 
                    fontSize: '0.8rem', 
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                  }}>
                    Browse everything without signing up. See how the platform works, explore initiatives, and discover opportunities — no commitment required.
                  </p>
                  <button
                    onClick={() => navigate('/ghost')}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'rgba(56, 161, 105, 0.2)',
                      border: '1px solid rgba(56, 161, 105, 0.4)',
                      borderRadius: '0.5rem',
                      color: '#38a169',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 161, 105, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 161, 105, 0.2)';
                    }}
                  >
                    Enter Ghost World →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mirror/Mirror Dropdown — THIRD */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => !isMobile && setMirrorDropdownOpen(true)}
            onMouseLeave={() => !isMobile && setMirrorDropdownOpen(false)}
            onClick={() => isMobile && setMirrorDropdownOpen(!mirrorDropdownOpen)}
          >
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); if (!isMobile) setDurinsDoorOpen(true); }}
              style={{
                color: mirrorDropdownOpen ? '#faf5eb' : '#a0aec0',
                textDecoration: 'none',
                fontSize: isMobile ? '1.5rem' : '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
              }}
              title="Mirror/Mirror (Durin's Door)"
            >
              {isMobile ? '🪞' : 'Mirror/Mirror'}
            </a>
            {mirrorDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                paddingTop: '0.5rem', // Maintain hover zone
              }}>
                <div style={{
                  background: '#0a1628',
                  border: '1px solid rgba(250, 245, 235, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  width: '220px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}>
                  <h4 style={{ 
                    color: '#d69e2e', 
                    fontSize: '0.9rem', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                  }}>
                    🪞 Durin's Door
                  </h4>
                  <p style={{ 
                    color: '#a0aec0', 
                    fontSize: '0.8rem', 
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                  }}>
                    "Speak friend and enter." Type "Friend" in any language to unlock the door. A password for those who know the way — or want to discover it.
                  </p>
                  <button
                    onClick={() => setDurinsDoorOpen(true)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'rgba(214, 158, 46, 0.2)',
                      border: '1px solid rgba(214, 158, 46, 0.4)',
                      borderRadius: '0.5rem',
                      color: '#d69e2e',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(214, 158, 46, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(214, 158, 46, 0.2)';
                    }}
                  >
                    Open the Mirror →
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      ) : (
        <>
          {/* Status Badge — Top Right (non-professional only) */}
          <div className="submarine-door-status">
            <span className="status-dot" />
            <span>Operational</span>
          </div>

          {/* Corner Toggle — Ghost only (non-professional only) */}
          <button className="ghost-toggle" onClick={() => navigate('/ghost')}>
            👻 Explore as Ghost
          </button>
          
          {/* Mirror Toggle — Bottom Right (non-professional only) */}
          <button className="mirror-toggle" onClick={() => setDurinsDoorOpen(true)} title="The Mirror">
            🪞
          </button>
        </>
      )}
      
      {/* Refactor Theme Toggle — HIDDEN when page tools off in Professional mode */}
      
      {(!isProfessionalTheme || showPageTools) && (
        <button 
          className="refactor-toggle" 
          onClick={() => setRefactorPanelOpen(!refactorPanelOpen)} 
          title="Theme Palette Switcher"
          style={{
            // Theme palette button - visible for switching between 8 themes
            position: 'fixed',
            bottom: '1.5rem',
            left: '1.5rem',
            background: refactorPanelOpen ? 'rgba(52, 211, 153, 0.3)' : (isProfessionalTheme ? 'rgba(10, 22, 40, 0.9)' : 'rgba(255,255,255,0.15)'),
            border: isProfessionalTheme ? '2px solid #d69e2e' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            fontSize: '1.2rem',
            zIndex: 100,
            transition: 'all 0.2s ease',
          }}
        >
          🎨
        </button>
      )}

      {/* Refactor Panel — Floating Theme Switcher (hidden when page tools off in Professional mode) */}
      {refactorPanelOpen && (!isProfessionalTheme || showPageTools) && (
        <div 
          className="refactor-panel"
          style={{
            position: 'fixed',
            bottom: '4.5rem',
            left: '1.5rem',
            background: 'rgba(20, 20, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '1rem',
            zIndex: 100,
            minWidth: '280px',
            maxWidth: '320px',
          }}
        >
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
            🎨 Refactor — Theme Studio
          </h4>
          
          {/* Theme Selector - 3 options */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>
              Theme Palette
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {Object.entries(themes).map(([id, theme]) => (
                <button
                  key={id}
                  onClick={() => setCurrentTheme(id)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: currentTheme === id ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.2)',
                    background: currentTheme === id ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    transition: 'all 0.2s ease',
                    minHeight: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Display name with line breaks for "Make Your Own" */}
                  {theme.displayName ? (
                    theme.displayName.split('\n').map((line, idx) => (
                      <span key={idx} style={{ display: 'block', lineHeight: 1.2 }}>{line}</span>
                    ))
                  ) : (
                    <span>{theme.name}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Input */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>
              Background Text {!isHeohoMode && <span style={{ color: 'rgba(52, 211, 153, 0.8)' }}>(Document Mode)</span>}
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter text (one line per row)..."
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: '0.85rem',
                resize: 'vertical',
                minHeight: '60px',
                fontFamily: 'monospace',
              }}
            />
            {/* File Upload Button */}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label 
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                📄 Upload .md
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>
                Each line fills one row
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {[
                { label: 'HEOHO', text: 'Help Each Other Help Ourselves' },
                { label: 'Golden Key', text: 'Help Each Other Help Ourselves Help Each Other' },
                { label: 'For The Keep', text: 'For The Keep!' },
                { label: 'Liana Banyan', text: 'Liana Banyan' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setCustomText(preset.text)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: customText === preset.text ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.6rem', opacity: 0.4, margin: '0.5rem 0 0 0' }}>
            {themes[currentTheme].name} · {isHeohoMode ? 'HEOHO Mode' : `${documentLines.length} lines`} · {activeColors.length} colors
          </p>

          {/* OK Button to close panel */}
          <button
            onClick={() => setRefactorPanelOpen(false)}
            style={{
              marginTop: '0.75rem',
              width: '100%',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(52, 211, 153, 0.5)',
              background: 'rgba(52, 211, 153, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ✓ OK
          </button>
        </div>
      )}
      
      {/* Durin's Door Dialog */}
      <DurinsDoorDialog isOpen={durinsDoorOpen} onClose={() => setDurinsDoorOpen(false)} />

      {/* Will-o'-the-Wisp Beacon Journey (Spotlight Ranger for landing page) */}
      <WillOWisp 
        isActive={wispActive} 
        onComplete={() => {
          setWispActive(false);
          setCandleEarned(true);
          // Mark as seen for this session
          sessionStorage.setItem('spotlight_session_landing', 'true');
          // Save candle to localStorage for persistence
          localStorage.setItem('liana_first_candle', 'true');
        }}
        onExit={() => {
          setWispActive(false);
          // Mark as seen for this session (even if exited early)
          sessionStorage.setItem('spotlight_session_landing', 'true');
        }}
      />

      <div className="container">
        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CARD (larger) — Contains Logo + Hero Card slot + G&G Button
            Flips independently to show "How It Works"
        ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className={`main-card-flip ${mainCardFlipped ? 'flipped' : ''} ${isProfessionalTheme ? 'professional-card' : ''}`}
        >
          <div className="main-card-inner">
            {/* FRONT: Logo + Hero Card + G&G Button — entire surface flips (except hero card) */}
            <div 
              className="main-card-front" 
              onClick={() => setMainCardFlipped(true)} 
              style={{ cursor: 'pointer' }}
            >
              {/* Logo at top (professional mode has no logo here - it's inside the Hero Card) */}
              {!isProfessionalTheme && (
                <img src="/logo.png" alt="Liana Banyan" className="logo" style={{ marginBottom: '1.5rem' }} />
              )}
              
              {/* ═══════════════════════════════════════════════════════════
                  HERO CARD (smaller) — HEOHO text, flips independently
                  Sits visually "on top" of the main card
                  Professional mode: chalk outline + cream/green colors
              ═══════════════════════════════════════════════════════════ */}
              <div 
                className={`hero-flip ${heroFlipped ? 'flipped' : ''}`}
                onClick={(e) => { e.stopPropagation(); setHeroFlipped(!heroFlipped); }}
              >
                <div className="hero-flip-inner">
                  {/* FRONT: Professional mode matches "Ideas are Free" layout exactly */}
                  {/* OR shows Helm item explanation when hovered from nav */}
                  <div className="hero-front" style={isProfessionalTheme ? { 
                    background: '#0a1628',  /* Same as page background */
                    padding: '4rem 3rem',  /* More vertical padding for taller card */
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  } : undefined}>
                    {isProfessionalTheme && hoveredHelmItem && helmItemDescriptions[hoveredHelmItem] ? (
                      /* HELM ITEM EXPLANATION - Replaces default content when hovering nav items */
                      <>
                        <span style={{ 
                          fontSize: '3rem',
                          marginBottom: '1rem',
                        }}>
                          {helmItemDescriptions[hoveredHelmItem].icon}
                        </span>
                        <h2 style={{ 
                          fontFamily: "'Crimson Pro', Georgia, serif",
                          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                          fontWeight: 700,
                          lineHeight: 1.15,
                          marginBottom: '1rem',
                          textAlign: 'center',
                          color: '#38a169'
                        }}>
                          {helmItemDescriptions[hoveredHelmItem].title}
                        </h2>
                        <p style={{ 
                          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                          color: '#faf5eb',
                          maxWidth: '450px',
                          margin: '0 auto 1.5rem auto',
                          lineHeight: 1.7,
                          textAlign: 'center'
                        }}>
                          {helmItemDescriptions[hoveredHelmItem].description}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setHoveredHelmItem(null); }}
                            style={{
                              padding: '0.6rem 1.2rem',
                              background: 'transparent',
                              border: '2px solid rgba(250, 245, 235, 0.3)',
                              borderRadius: '0.5rem',
                              color: '#faf5eb',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(250, 245, 235, 0.6)';
                              e.currentTarget.style.background = 'rgba(250, 245, 235, 0.1)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(250, 245, 235, 0.3)';
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            ← Go Back
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(hoveredHelmItem); }}
                            style={{
                              padding: '0.6rem 1.2rem',
                              background: 'rgba(56, 161, 105, 0.2)',
                              border: '2px solid rgba(56, 161, 105, 0.5)',
                              borderRadius: '0.5rem',
                              color: '#38a169',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(56, 161, 105, 0.3)';
                              e.currentTarget.style.borderColor = 'rgba(56, 161, 105, 0.7)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(56, 161, 105, 0.2)';
                              e.currentTarget.style.borderColor = 'rgba(56, 161, 105, 0.5)';
                            }}
                          >
                            Go to {helmItemDescriptions[hoveredHelmItem].title} →
                          </button>
                        </div>
                      </>
                    ) : isProfessionalTheme ? (
                      /* DEFAULT PROFESSIONAL CONTENT */
                      <>
                        {/* COOPERATIVE COMMERCE eyebrow - now inside Hero Card */}
                        <span className="cooperative-header" style={{ 
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 'clamp(0.6rem, 2.5vw, 0.8rem)',
                          color: '#d69e2e',
                          letterSpacing: '0.25em',
                          textTransform: 'uppercase',
                          marginBottom: '1.25rem',
                          display: 'block',
                          textAlign: 'center'
                        }}>
                          <span style={{ display: 'inline' }} className="coop-line">COOPERATIVE</span>
                          <br className="mobile-break" style={{ display: 'none' }} />
                          <span style={{ display: 'inline' }} className="coop-line"> COMMERCE</span>
                        </span>
                        {/* "Ideas are Free" style - large serif text */}
                        <h2 style={{ 
                          fontFamily: "'Crimson Pro', Georgia, serif",
                          fontSize: 'clamp(1.5rem, 6.4vw, 4.4rem)',  /* Responsive: 20% smaller - scales 1.5rem on tiny screens up to 4.4rem on large */
                          fontWeight: 700,
                          lineHeight: 1.1,
                          marginBottom: '1.5rem',
                          textAlign: 'center'
                        }}>
                          {/* Line 1: "Help Each Other" - white like "Ideas are Free" */}
                          <span style={{ color: '#faf5eb', display: 'block' }}>Help Each Other</span>
                          {/* Line 2: "Help Ourselves" - green like "Infrastructure" */}
                          <span style={{ color: '#38a169', display: 'block' }}>Help Ourselves.</span>
                        </h2>
                        {/* Subtitle - white text */}
                        <p style={{ 
                          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                          color: '#faf5eb',
                          maxWidth: '500px',
                          margin: '0 auto',
                          lineHeight: 1.7,
                          textAlign: 'center'
                        }}>
                          {/* Line 1 */}
                          <span style={{ display: 'block', marginBottom: '0.25rem' }}>
                            Ideas are Free. Infrastructure costs Money.
                          </span>
                          {/* Line 2 */}
                          <span style={{ display: 'block', marginBottom: '0.25rem' }}>
                            We Own what we Build for $5/yr.
                          </span>
                          {/* Line 3 - Join us link */}
                          <a 
                            href="/auth" 
                            onClick={(e) => { e.stopPropagation(); navigate('/auth'); e.preventDefault(); }}
                            style={{ 
                              display: 'block',
                              color: '#38a169', 
                              textDecoration: 'none',
                              fontWeight: 600,
                              transition: 'opacity 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            Join us.
                          </a>
                        </p>
                      </>
                    ) : (
                      /* NON-PROFESSIONAL MODE */
                      <h2>
                        <span style={{ color: '#ffffff' }}>Help Each Other</span>
                        <br />
                        <span style={{ color: '#34d399' }}>Help Ourselves</span>
                        <br />
                        <span style={{ color: '#ffffff', opacity: 0.6 }}>Help Each Other</span>
                      </h2>
                    )}
                    {/* Only show hand icon when not showing Helm item */}
                    {!(isProfessionalTheme && hoveredHelmItem) && <span className="hand">👉</span>}
                  </div>

                  {/* BACK: Two columns - GET & GIVE - with expandable topics */}
                  <div className="hero-back" style={isProfessionalTheme ? { 
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  } : undefined}>
                    {/* Expanded Topic View */}
                    {heroBackExpanded ? (
                      <div 
                        style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setHeroBackExpanded(null); }}
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); setHeroBackExpanded(null); }}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#38a169', 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            textAlign: 'left',
                            padding: '0 0 0.75rem 0',
                            fontWeight: 600
                          }}
                        >
                          ← Back
                        </button>
                        {heroBackExpanded === 'cost20' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🛒 Cost + 20%</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Every product and service on our platform is priced at <strong>Cost + 20%</strong>. 
                              We buy, From You & For You, in advance at wholesale prices from your preorders, and add exactly 20% — no hidden markups, no middlemen fees. 
                              The 20% margin funds platform operations and charitable initiatives.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Volume makes it work — 20% of 10,000 ( = 2,000) is a lot more than 80% of 1,000 ( = 800). 
                              Especially when your costs are now 50% lower. For everything except Payroll. 
                              We prepay PER JOB / ORDER CONTRACT 50% down, 50% upon completion; funded by 100% prefunded preorders. In Public.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              When larger preorder volume tiers are reached resulting in lower prices — the savings are automatically passed to you, 
                              and the difference in what you preorder paid is returned as platform credits to purchase more. 
                              You either get a good deal, or a better one.
                            </p>
                            <button 
                              className="gk-option"
                              style={{ 
                                background: 'linear-gradient(135deg, #38a169, #10b981)', 
                                fontSize: '0.9rem', 
                                padding: '0.6rem',
                                marginTop: 'auto'
                              }}
                              onClick={(e) => { e.stopPropagation(); setMainCardFlipped(true); }}
                            >
                              📊 See the Full Explanation
                            </button>
                          </div>
                        )}
                        {heroBackExpanded === 'volume' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>📦 Volume Savings</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Group buying power for <strong>food, medications, and shopping</strong>. 
                              When members buy together, everyone saves.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Let's Get Groceries aggregates orders for bulk discounts. LifeLine Medications negotiates 
                              manufacturer pricing. Let's Go Shopping pools demand for better deals.
                            </p>
                          </div>
                        )}
                        {heroBackExpanded === 'member' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🤝 Member Benefits</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              You're not a customer — <strong>you're a member-owner</strong>. 
                              $5/year membership gives you voting rights and governance participation. You can:
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Post ideas to get funded; Make products to sell (and get funded for making the products); 
                              Work for someone else's business, Start your OWN business with all the services provided by other Members to make it easy; 
                              Provide those services to other Members for THEIR businesses; Provide services AS your business, 
                              Plant seeds by voting on other Member's Projects of Ideas, or Businesses, or Products, or Services, 
                              AND have access to ALL the Charitable Initiatives provided.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Members elect representatives and propose changes. 
                              The people most affected by decisions help make them.
                            </p>
                          </div>
                        )}
                        {heroBackExpanded === 'keep83' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ color: '#8b5cf6', fontSize: '1.3rem', margin: 0 }}>💰 Keep 83.3%</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              When you earn on our platform, you keep <strong>83.3% of every dollar</strong>. 
                              Compare that to 50-70% on most gig platforms.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              On a $500 job: you get <strong>$416.67</strong>. The platform takes only $83.33 (16.7%) 
                              to cover operations and fund charitable initiatives.
                            </p>
                          </div>
                        )}
                        {heroBackExpanded === 'reputation' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ color: '#8b5cf6', fontSize: '1.3rem', margin: 0 }}>⭐ Build Reputation</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Quality work builds lasting reputation. <strong>Finish fast with quality</strong> and 
                              watch your opportunities grow.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Your reputation is portable and belongs to you. Verified reviews, completion rates, 
                              and skill endorsements follow you across all projects started or worked on as well as all 16 initiatives. 
                              <strong>Make a Name for Yourself.</strong>
                            </p>
                          </div>
                        )}
                        {heroBackExpanded === 'ownwork' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ color: '#8b5cf6', fontSize: '1.3rem', margin: 0 }}>📜 Own Your Work</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Your intellectual property stays yours. <strong>IP is protected</strong> through our ledger system.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Create content, recipes, designs, or code — it's registered to your account with timestamps. 
                              Earn platform credits when others create derivative works based on your contributions.
                            </p>
                          </div>
                        )}
                        {heroBackExpanded === 'explore' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ color: '#8b5cf6', fontSize: '1.3rem', margin: 0 }}>👻 Free Explore</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              Explore the platform without commitment. <strong>Ghost World</strong> lets you browse, 
                              discover, and learn how everything works before joining.
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              See available services, browse recipes, check out the marketplace, and understand the 
                              cooperative model. No signup required.
                            </p>
                            <button 
                              className="gk-option"
                              style={{ 
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', 
                                fontSize: '0.95rem', 
                                padding: '0.7rem',
                                marginTop: 'auto'
                              }}
                              onClick={(e) => { e.stopPropagation(); navigate('/ghost'); }}
                            >
                              👻 Enter Ghost World
                            </button>
                          </div>
                        )}
                      </div>
                    ) : showSignUpForm ? (
                      /* Inline Sign Up Form */
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowSignUpForm(false); }}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#38a169', 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            textAlign: 'left',
                            padding: '0 0 0.75rem 0',
                            fontWeight: 600
                          }}
                        >
                          ← Back
                        </button>
                        <h4 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', textAlign: 'center' }}>Join for $5/year</h4>
                        <p style={{ fontSize: '0.85rem', textAlign: 'center', margin: '0 0 1rem 0', opacity: 0.8 }}>
                          Become a member-owner
                        </p>
                        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/auth?signup=true'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                          <input 
                            type="email" 
                            placeholder="Email address" 
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              padding: '0.7rem', 
                              borderRadius: '0.4rem', 
                              border: '1px solid rgba(0,0,0,0.2)', 
                              fontSize: '0.9rem',
                              background: 'white',
                              color: '#0a1628'
                            }} 
                          />
                          <input 
                            type="password" 
                            placeholder="Create password" 
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              padding: '0.7rem', 
                              borderRadius: '0.4rem', 
                              border: '1px solid rgba(0,0,0,0.2)', 
                              fontSize: '0.9rem',
                              background: 'white',
                              color: '#0a1628'
                            }} 
                          />
                          <button 
                            type="submit"
                            className="gk-option"
                            style={{ 
                              background: 'linear-gradient(135deg, #34d399, #10b981)', 
                              color: '#022c22', 
                              fontSize: '0.95rem', 
                              padding: '0.7rem',
                              marginTop: 'auto'
                            }}
                          >
                            Sign Up — $5/year
                          </button>
                        </form>
                        <p style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '0.5rem', opacity: 0.6 }}>
                          Already have an account? <a href="/auth" onClick={(e) => { e.stopPropagation(); navigate('/auth'); e.preventDefault(); }} style={{ color: '#38a169' }}>Sign In</a>
                        </p>
                      </div>
                    ) : (
                      /* Default GET & GIVE Grid */
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                        {/* GET Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {/* GET/GIVE headers removed for cleaner layout */}
                          <div 
                            onClick={(e) => { e.stopPropagation(); setHeroBackExpanded('cost20'); }}
                            style={{ background: 'rgba(56, 161, 105, 0.2)', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <strong style={{ fontSize: '0.95rem' }}>Cost + 20%</strong>
                            <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>Wholesale on everything →</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setHeroBackExpanded('volume'); }}
                            style={{ background: 'rgba(56, 161, 105, 0.2)', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <strong style={{ fontSize: '0.95rem' }}>Volume Savings</strong>
                            <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>Food, meds, shopping →</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setHeroBackExpanded('member'); }}
                            style={{ background: 'rgba(56, 161, 105, 0.2)', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <strong style={{ fontSize: '0.95rem' }}>Member Benefits</strong>
                            <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>Not a customer—an owner →</span>
                          </div>
                          <button 
                            className="gk-option" 
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', fontSize: '0.85rem', padding: '0.5rem', width: '100%', marginTop: 'auto' }}
                            onClick={(e) => { e.stopPropagation(); setHeroBackExpanded('explore'); }}
                          >
                            👻 Explore Free
                          </button>
                        </div>
                        
                        {/* GIVE Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {/* GET/GIVE headers removed for cleaner layout */}
                          <div 
                            onClick={(e) => { e.stopPropagation(); setHeroBackExpanded('keep83'); }}
                            style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <strong style={{ fontSize: '0.95rem' }}>Keep 83.3%</strong>
                            <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>Of what you earn →</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setHeroBackExpanded('reputation'); }}
                            style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <strong style={{ fontSize: '0.95rem' }}>Build Reputation</strong>
                            <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>Finish fast with quality →</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setHeroBackExpanded('ownwork'); }}
                            style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <strong style={{ fontSize: '0.95rem' }}>Own Your Work</strong>
                            <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>IP & royalties protected →</span>
                          </div>
                          <button 
                            className="gk-option" 
                            style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', color: '#022c22', fontSize: '0.85rem', padding: '0.5rem', width: '100%', marginTop: 'auto' }}
                            onClick={(e) => { e.stopPropagation(); setShowSignUpForm(true); }}
                          >
                            💼 Join $5/yr
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* END HERO CARD */}
              
              {/* Button at bottom - Professional mode uses "How It Works" style from static page */}
              {isProfessionalTheme ? (
                <button 
                  className="how-it-works-btn"
                  onClick={(e) => { e.stopPropagation(); setMainCardFlipped(true); }}
                  style={{ 
                    cursor: 'pointer',
                    marginTop: '2rem',
                    padding: '0.875rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    fontFamily: "'Source Sans 3', system-ui, sans-serif",
                    color: '#faf5eb',  /* White text on green background */
                    background: '#38a169',  /* Green background */
                    border: '2px solid #38a169',
                    borderRadius: '0.5rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#faf5eb';  /* White on hover */
                    e.currentTarget.style.color = '#0a1628';  /* Black text */
                    e.currentTarget.style.borderColor = '#faf5eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#38a169';  /* Back to green */
                    e.currentTarget.style.color = '#faf5eb';  /* White text */
                    e.currentTarget.style.borderColor = '#38a169';
                  }}
                >
                  How Cost + 20% Works
                </button>
              ) : (
                <button 
                  className="yggdrasil-badge" 
                  onClick={(e) => { e.stopPropagation(); setMainCardFlipped(true); }}
                  style={{ cursor: 'pointer', border: 'none', marginTop: '1.5rem' }}
                >
                  <span style={{ display: 'block', fontWeight: 700 }}>Get & Give · Cost + 20%</span>
                  <span style={{ display: 'block', fontSize: '0.85rem', opacity: 0.9, marginTop: '2px' }}>For $5 a Year</span>
                </button>
              )}
              
              <span className="hand" style={{ position: 'absolute', bottom: '12px', right: '16px' }}>👉</span>
            </div>

            {/* BACK: How Cost + 20% Works - with expandable topics */}
            <div className="main-card-back" onClick={() => { if (!mainBackExpanded) setMainCardFlipped(false); }} style={{ 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%'
            }}>
              {/* Expanded Topic View with Root Return Navigation */}
              {mainBackExpanded ? (() => {
                // Define the topic order for Root Return navigation
                const mainTopics = ['transaction', 'wholesale', 'permanent', 'memberowned', 'initiatives'];
                const currentTopicIndex = mainTopics.indexOf(mainBackExpanded);
                const nextTopic = currentTopicIndex < mainTopics.length - 1 ? mainTopics[currentTopicIndex + 1] : null;
                
                return (
                <div 
                  style={{ display: 'flex', height: '100%', flex: 1, gap: '0.5rem' }}
                  onClick={(e) => { e.stopPropagation(); setMainBackExpanded(null); setMainInitiativeExpanded(null); }}
                >
                  {/* Left Chevron - Root Return (always goes back to Overview) */}
                  <div
                    onClick={(e) => { e.stopPropagation(); setMainBackExpanded(null); setMainInitiativeExpanded(null); }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.35)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.15)'; }}
                    style={{
                      width: '2.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(56, 161, 105, 0.15)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: '2.5rem', color: '#38a169', fontWeight: 300 }}>‹</span>
                  </div>
                  
                  {/* Content Area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto' }}>
                  {mainBackExpanded === 'transaction' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0, textAlign: 'center' }}>💰 On $500 of Transactions</h4>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                        When someone pays <strong>$500</strong> for your work on Liana Banyan, here's exactly where that money goes:
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                        <div style={{ background: 'rgba(56, 161, 105, 0.15)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>$416.67</div>
                          <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Goes directly to <strong>YOU</strong></div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>That's 83.3% of every dollar</div>
                        </div>
                        <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>$83.33</div>
                          <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Platform margin</div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>Funds operations + 16 initiatives</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, textAlign: 'center' }}>
                        Compare: Uber takes 25-30%. Etsy takes 20%+ plus fees. Fiverr takes 20% + payment fees.
                      </p>
                    </>
                  )}
                  {mainBackExpanded === 'wholesale' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>📦 Wholesale Everything</h4>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                        We negotiate <strong>manufacturer and distributor pricing</strong> on everything from groceries to medications to consumer goods.
                      </p>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                        Then we add exactly 20%. That's it. No additional markups, no hidden fees, no "convenience charges."
                      </p>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                        Our accounting is <strong>Transparent</strong> with Bank Account and Ledger Tickers for Every Transaction. 
                        What it was for, where it came from, where it went, when, and by whom — but only for Corporate. 
                        <em>Your Business is YOUR Business.</em>
                      </p>
                    </>
                  )}
                  {mainBackExpanded === 'permanent' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>🔒 Permanent 20% Cap</h4>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                        The 20% margin is <strong>hardcoded into our bylaws</strong>. It cannot be increased by management, 
                        investors, or even a majority vote.
                      </p>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                        Why? Because we've seen what happens when platforms grow: fees creep up, terms change, 
                        and creators get squeezed. We've built protection against that into our foundation.
                      </p>
                      <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '1.25rem', borderRadius: '1rem', marginTop: 'auto' }}>
                        <strong style={{ fontSize: '1.1rem' }}>⚠️ The Lock:</strong>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
                          Changing this would require unanimous board approval + 75% member vote + 
                          a 2-year waiting period. Designed to be nearly impossible.
                        </p>
                      </div>
                    </>
                  )}
                  {mainBackExpanded === 'memberowned' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>🤝 Member-Owned Cooperative</h4>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                        For <strong>$5/year</strong>, you become a member-owner with real ownership rights:
                      </p>
                      <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, margin: 0, paddingLeft: '1.5rem' }}>
                        <li><strong>Vote</strong> on platform decisions and elect representatives</li>
                        <li><strong>Propose</strong> new features, initiatives, and policy changes</li>
                        <li><strong>Share</strong> in platform success through earning platform credits</li>
                        <li><strong>Access</strong> wholesale pricing on everything</li>
                      </ul>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginTop: 'auto' }}>
                        This isn't a subscription — it's ownership. The people most affected by decisions help make them.
                      </p>
                    </>
                  )}
                  {mainBackExpanded === 'initiatives' && (() => {
                    const initiativesList = [
                      { key: 'dinner', emoji: '🍽️', name: "Let's Make Dinner" },
                      { key: 'groceries', emoji: '🛒', name: "Let's Get Groceries" },
                      { key: 'shopping', emoji: '🛍️', name: "Let's Go Shopping" },
                      { key: 'concierge', emoji: '🏠', name: 'Household Concierge' },
                      { key: 'family', emoji: '👨‍👩‍👧‍👦', name: 'Family Table' },
                      { key: 'medications', emoji: '💊', name: 'LifeLine Medications' },
                      { key: 'msa', emoji: '🏥', name: 'MSA' },
                      { key: 'defense', emoji: '🛡️', name: 'Defense Klaus' },
                      { key: 'rally', emoji: '📢', name: 'Rally Group' },
                      { key: 'vsl', emoji: '💳', name: 'VSL' },
                      { key: 'bread', emoji: '🍞', name: "Let's Make Bread" },
                      { key: 'harper', emoji: '📖', name: 'Harper Guild' },
                      { key: 'jukebox', emoji: '🎵', name: 'JukeBox' },
                      { key: 'didasko', emoji: '🎓', name: 'Didasko' },
                      { key: 'international', emoji: '🌍', name: 'International' },
                      { key: 'brasstacks', emoji: '🔩', name: 'Brass Tacks' }
                    ];
                    const currentIndex = initiativesList.findIndex(i => i.key === mainInitiativeExpanded);
                    const nextInitiative = currentIndex < initiativesList.length - 1 ? initiativesList[currentIndex + 1].key : null;
                    
                    return (
                    <div 
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}
                      onClick={(e) => { if (mainInitiativeExpanded) { e.stopPropagation(); setMainInitiativeExpanded(null); } }}
                    >
                      {mainInitiativeExpanded ? (
                        // Expanded initiative detail view with chevron navigation
                        <div style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
                          {/* Left Chevron - Go Back */}
                          <div
                            onClick={(e) => { e.stopPropagation(); setMainInitiativeExpanded(null); }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.35)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.15)'; }}
                            style={{
                              width: '2.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(56, 161, 105, 0.15)',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              flexShrink: 0
                            }}
                          >
                            <span style={{ fontSize: '2rem', color: '#38a169' }}>‹</span>
                          </div>
                          
                          {/* Content Area */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {mainInitiativeExpanded === 'dinner' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🍽️ Let's Make Dinner</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Community meal coordination that brings people together. Members share recipes, coordinate group meals, 
                                and build neighborhood food networks.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Professional chefs earn by teaching cooking classes. Home cooks earn by preparing meals for busy families. 
                                Everyone saves through bulk ingredient purchasing.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'groceries' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🛒 Let's Get Groceries</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Group grocery buying at wholesale prices. Members pool orders to access bulk discounts 
                                that are normally only available to restaurants and institutions.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Local coordinators earn by managing pickup points. Delivery drivers earn by bringing groceries to members. 
                                The more members participate, the lower everyone's costs.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'shopping' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🛍️ Let's Go Shopping</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Collective purchasing power for consumer goods. From electronics to furniture to clothing — 
                                members aggregate demand to negotiate manufacturer pricing.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Product researchers earn by finding the best deals. Personal shoppers earn by helping members make choices. 
                                Group buys mean individual savings.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'concierge' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🏠 Household Concierge</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Trusted help for home and life tasks. Vetted members provide services from house cleaning to pet sitting 
                                to errand running — all at fair rates with portable reputation.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Service providers keep 83.3% of what they earn. Clients get reliable help without platform gouging. 
                                Quality builds reputation across all initiatives.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'family' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>👨‍👩‍👧‍👦 The Family Table</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Supporting families through every stage. Childcare coordination, tutoring networks, 
                                eldercare resources, and family emergency support systems.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Caregivers earn fair wages. Families access affordable care. The community provides a safety net 
                                that catches people before they fall.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'medications' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>💊 LifeLine Medications</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Prescription medications at actual cost plus 20%. We negotiate directly with manufacturers and distributors 
                                to eliminate the markup that makes medications unaffordable.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                No middlemen taking their cut. No PBM games. Just the real cost of medicine plus a transparent margin 
                                that funds the platform serving you.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'msa' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🏥 MSA</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Member Services Account — healthcare cost sharing and coordination. Members contribute to shared pools 
                                that cover medical expenses, with transparent accounting.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Not insurance — a cooperative approach to healthcare costs. Members help members. 
                                Every dollar is tracked. The community decides together.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'defense' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🛡️ Defense Klaus</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                "For Someone You Love" — legal defense and protection services. Access to attorneys, 
                                legal document preparation, and collective bargaining for legal services.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                When members face legal challenges, they don't face them alone. The cooperative provides resources, 
                                connections, and support.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'rally' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>📢 Rally Group</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Collective voice and advocacy. When members face systemic issues — from predatory practices 
                                to policy problems — Rally Group organizes collective response.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                One voice is easy to ignore. Thousands of voices organized together create change. 
                                Members support each other's causes.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'vsl' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>💳 VSL</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Virtual Savings & Lending — community-based financial services. Members save together and lend to each other 
                                at fair rates, building alternatives to predatory financial products.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                No payday loan traps. No credit card gouging. Members helping members with transparent terms 
                                and community accountability.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'bread' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🍞 Let's Make Bread</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Micro-enterprise support and business incubation. Members with business ideas get funded through preorders, 
                                supported by the community, and mentored by experienced entrepreneurs.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Start a business without taking on crushing debt. Get customers before you make products. 
                                Build something real with community backing.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'harper' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>📖 Harper Guild</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Publishing and content creation cooperative. Writers, artists, and creators publish their work 
                                with fair terms — keeping their rights and earning real royalties.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                No exploitative publishing contracts. No algorithms hiding your work. 
                                Creators own what they create and get paid fairly when people enjoy it.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'jukebox' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🎵 JukeBox</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Music and performance cooperative. Musicians earn fairly from their work. 
                                Venues connect with performers. Fans support artists directly.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                No streaming services paying fractions of pennies. Real support for real artists. 
                                The music industry rebuilt to serve musicians and listeners.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'didasko' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🎓 Didasko</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Education and skill-sharing cooperative. Teachers earn by sharing knowledge. 
                                Learners access quality education at fair prices. Credentials that mean something.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                From academic subjects to practical skills to professional development — 
                                learning that serves learners, not extraction.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'international' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🌍 International</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Global coordination and cross-border support. Connecting members worldwide, 
                                facilitating international trade, and building cooperative infrastructure globally.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Fair remittances. International collaboration. A cooperative network that spans borders 
                                while respecting local needs and cultures.
                              </p>
                            </div>
                          )}
                          {mainInitiativeExpanded === 'brasstacks' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ color: '#38a169', fontSize: '1.3rem', margin: 0 }}>🔩 Brass Tacks</h4>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Platform infrastructure and technical operations. The nuts and bolts that make everything work — 
                                servers, software, security, and systems.
                              </p>
                              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                                Developers earn by building and maintaining the platform. Technical decisions made transparently. 
                                Infrastructure that serves the mission, not extraction.
                              </p>
                            </div>
                          )}
                          {/* Go to Initiative button */}
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                navigate('/initiatives/' + mainInitiativeExpanded);
                              }}
                              style={{ 
                                padding: '0.75rem', 
                                background: 'linear-gradient(135deg, #38a169, #10b981)', 
                                border: 'none', 
                                borderRadius: '0.5rem', 
                                color: '#fff', 
                                fontSize: '1rem', 
                                cursor: 'pointer',
                                fontWeight: 600,
                                marginTop: 'auto'
                              }}
                            >
                              Go to {initiativesList.find(i => i.key === mainInitiativeExpanded)?.name || 'Initiative'} →
                            </button>
                          </div>
                          
                          {/* Right Chevron - Next Initiative */}
                          <div
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (nextInitiative) {
                                setMainInitiativeExpanded(nextInitiative);
                              } else {
                                setMainInitiativeExpanded(null); // Loop back to grid if at end
                              }
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.35)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.15)'; }}
                            style={{
                              width: '2.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(56, 161, 105, 0.15)',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              flexShrink: 0
                            }}
                          >
                            <span style={{ fontSize: '2rem', color: '#38a169' }}>{nextInitiative ? '›' : '⟲'}</span>
                          </div>
                        </div>
                      ) : (
                        // Initiative grid with clickable buttons
                        <>
                          <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>🌿 16 Charitable Initiatives</h4>
                          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                            Our 20% margin doesn't go to extraction — it funds <strong>infrastructure for everyone</strong>:
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {initiativesList.map((init) => (
                              <button
                                key={init.key}
                                onClick={(e) => { e.stopPropagation(); setMainInitiativeExpanded(init.key); }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#38a169'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#2d3748'; e.currentTarget.style.transform = 'scale(1)'; }}
                                style={{
                                  background: '#2d3748',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  padding: '0.6rem 0.75rem',
                                  color: '#faf5eb',
                                  fontSize: '0.9rem',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {init.emoji} {init.name}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                  })()}
                  </div>
                  
                  {/* Right Chevron - Navigate to Next Topic */}
                  <div
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (nextTopic) {
                        setMainBackExpanded(nextTopic);
                        setMainInitiativeExpanded(null);
                      } else {
                        setMainBackExpanded(null);
                        setMainInitiativeExpanded(null);
                      }
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.35)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.15)'; }}
                    style={{
                      width: '2.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(56, 161, 105, 0.15)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: '2.5rem', color: '#38a169', fontWeight: 300 }}>{nextTopic ? '›' : '⟲'}</span>
                  </div>
                </div>
              );
              })() : (
                /* Default Overview - stretched to fill */
                <>
                  <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>How Cost + 20% Works</h3>
                  
                  {/* Visual example - clickable */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); setMainBackExpanded('transaction'); }}
                    style={{ 
                      background: 'rgba(56, 161, 105, 0.15)', 
                      borderRadius: '1rem', 
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>💰</span>
                      <strong style={{ fontSize: '1.25rem', marginLeft: '0.5rem' }}>On $500 of Transactions →</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                      <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38a169' }}>$416.67</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Creator/Worker keeps<br/><strong>83.3%</strong></div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>$83.33</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Platform margin<br/><strong>16.7%</strong></div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>$0</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Hidden fees<br/><strong>None</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Key points - clickable - stretched to fill */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('wholesale'); }}
                      style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <strong style={{ fontSize: '1rem' }}>📦 Wholesale Everything →</strong>
                      <p style={{ margin: '0.35rem 0 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
                        We buy at cost, add exactly 20%. No markups.
                      </p>
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('permanent'); }}
                      style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <strong style={{ fontSize: '1rem' }}>🔒 Permanent Cap →</strong>
                      <p style={{ margin: '0.35rem 0 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
                        20% margin is hardcoded. Can never increase.
                      </p>
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('memberowned'); }}
                      style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <strong style={{ fontSize: '1rem' }}>🤝 Member-Owned →</strong>
                      <p style={{ margin: '0.35rem 0 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
                        You're not a customer. You're an owner.
                      </p>
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('initiatives'); }}
                      style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <strong style={{ fontSize: '1rem' }}>🌿 Funds 16 Initiatives →</strong>
                      <p style={{ margin: '0.35rem 0 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
                        20% funds charitable infrastructure.
                      </p>
                    </div>
                  </div>

                  <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '1rem', textAlign: 'center' }}>
                    tap anywhere to flip back · click items to learn more
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        {/* END MAIN CARD */}

        {/* EXPLAINER FLIPCARD — Worker-Owned explanation on front, Not Charity initiatives on back */}
        <div 
          className={`explainer-flip ${explainerFlipped ? 'flipped' : ''}`}
          onClick={() => { if (!expandedInitiative) setExplainerFlipped(!explainerFlipped); }}
        >
          <div className="explainer-inner">
            {/* FRONT - DARK background with white text - Worker-Owned explanation ONLY */}
            <div className="explainer-front" style={isProfessionalTheme ? { 
              background: '#0a1628', 
              color: '#faf5eb',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            } : undefined}>
              <h3 className="worker-owned-heading" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.6rem)', marginBottom: '1.25rem', textAlign: 'center', color: '#faf5eb' }}>
                <span style={{ display: 'inline' }}>Worker-Owned.</span>
                <br className="mobile-break" style={{ display: 'none' }} />
                <span style={{ display: 'inline' }}> Member-Governed.</span>
              </h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9, marginBottom: '0.4rem' }}>
                You're an Owner.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9, marginBottom: '0.4rem' }}>
                Your ideas/services/products Preorder-Funded and Made by Members.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9, marginBottom: '0.4rem' }}>
                The 20% margin funds 16 charitable initiatives for Everyone.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9 }}>
                The People doing the Work make the Decisions and get the Benefits.
              </p>
              <span className="hand" style={{ color: '#faf5eb' }}>👉</span>
            </div>
            {/* BACK - WHITE background with black text header and 16 initiatives */}
            <div className="explainer-back" style={isProfessionalTheme ? { 
              background: '#faf5eb', 
              color: '#0a1628',
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center' 
            } : { padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {expandedInitiative ? (() => {
                const notCharityInitiatives = [
                  'lets-make-dinner', 'lets-get-groceries', 'lets-go-shopping', 'household-concierge',
                  'family-table', 'lifeline-medications', 'msa', 'defense-claws', 'rally-group', 'vsl',
                  'lets-make-bread', 'harper-guild', 'jukebox', 'didasko', 'international', 'brass-tacks'
                ];
                const currentIndex = notCharityInitiatives.indexOf(expandedInitiative);
                const nextInitiative = currentIndex < notCharityInitiatives.length - 1 
                  ? notCharityInitiatives[currentIndex + 1] 
                  : null;
                
                return (
                /* Expanded Initiative Detail View with Chevron Navigation */
                <div 
                  style={{ display: 'flex', height: '100%', cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); setExpandedInitiative(null); }}
                >
                  {/* Left Chevron - Back to Overview */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); setExpandedInitiative(null); }}
                    style={{
                      width: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'rgba(56, 161, 105, 0.15)',
                      borderRadius: '0.5rem 0 0 0.5rem',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                      marginLeft: '-1.5rem',
                      marginTop: '-1.5rem',
                      marginBottom: '-1.5rem'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.35)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.15)'; }}
                    title="Back to Overview"
                  >
                    <span style={{ fontSize: '1.5rem', color: '#38a169' }}>‹</span>
                  </div>

                  {/* Content Area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', justifyContent: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/${expandedInitiative}`); }}
                        style={{ 
                          background: '#38a169', 
                          color: '#faf5eb',
                          border: 'none', 
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.4rem',
                          fontWeight: 600
                        }}
                      >
                        Go to {expandedInitiative === 'lets-make-dinner' ? "Let's Make Dinner" :
                               expandedInitiative === 'lets-get-groceries' ? "Let's Get Groceries" :
                               expandedInitiative === 'lets-go-shopping' ? "Let's Go Shopping" :
                               expandedInitiative === 'household-concierge' ? 'Household Concierge' :
                               expandedInitiative === 'family-table' ? 'Family Table' :
                               expandedInitiative === 'lifeline-medications' ? 'LifeLine Meds' :
                               expandedInitiative === 'msa' ? 'MSA' :
                               expandedInitiative === 'defense-claws' ? 'Defense Klaus' :
                               expandedInitiative === 'rally-group' ? 'Rally Group' :
                               expandedInitiative === 'vsl' ? 'VSL' :
                               expandedInitiative === 'lets-make-bread' ? "Let's Make Bread" :
                               expandedInitiative === 'harper-guild' ? 'Harper Guild' :
                               expandedInitiative === 'jukebox' ? 'JukeBox' :
                               expandedInitiative === 'didasko' ? 'Didasko' :
                               expandedInitiative === 'international' ? 'International' :
                               expandedInitiative === 'brass-tacks' ? 'Brass Tacks' : expandedInitiative} →
                      </button>
                    </div>
                  {expandedInitiative === 'lets-make-dinner' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🍽️ Let's Make Dinner</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Community-powered meal sharing. Local cooks offer home-prepared meals at Cost + 20%. 
                        Order from neighbors, support local talent, eat better for less.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Cooks keep 83.3% of every sale. Reputation builds through verified reviews. 
                        Crown: Maneet Chauhan.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'lets-get-groceries' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🛒 Let's Get Groceries</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Group buying power for groceries. Members pool orders for bulk discounts from 
                        distributors and local farms. Wholesale pricing at Cost + 20%.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Save 20-40% on groceries through collective purchasing. 
                        Delivery or pickup options available.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'lets-go-shopping' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🛍️ Let's Go Shopping</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Consumer goods at wholesale prices. Household items, electronics, clothing — 
                        all at Cost + 20%. No retail markups.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Crown: Mary Beth Laughton. Pool demand for better manufacturer pricing.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'household-concierge' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🏠 Household Concierge</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Home services at fair rates. Cleaning, repairs, maintenance, yard work — 
                        workers keep 83.3%, you pay Cost + 20%.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Verified providers with reputation tracking. Background checks included.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'family-table' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>👨‍👩‍👧‍👦 Family Table</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Family coordination and care management. Shared calendars, resource pooling, 
                        elder care coordination, childcare networks.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Connect family members across households. Manage shared responsibilities together.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'lifeline-medications' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>💊 LifeLine Medications</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Prescription medications at manufacturer pricing plus 20%. 
                        Cut out pharmacy middlemen. Save 40-80% on many prescriptions.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Negotiated directly with manufacturers and licensed pharmacies.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'msa' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🏥 MSA (Medical Savings)</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Member-funded medical savings accounts with group negotiating power. 
                        Pool resources for better healthcare access.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Mutual aid for medical expenses. Transparent pricing on procedures.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'defense-claws' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🛡️ Defense Klaus</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Legal defense and advocacy for members. "For Someone You Love." 
                        Pooled resources for legal representation and protection.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Pre-paid legal services, document preparation, and advocacy coordination.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'rally-group' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>📢 Rally Group</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Community organizing and advocacy. Coordinate campaigns, 
                        amplify voices, build collective power.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Crown: Kimberly A. Williams. Tools for grassroots organizing.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'vsl' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>💳 VSL (Value Storage Layer)</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Member-owned financial services. Savings, loans, and payments 
                        at Cost + 20% — not bank extraction margins.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Crown: Cathie Mahon. Three-gear currency: Joules, Marks, Credits.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'lets-make-bread' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🍞 Let's Make Bread</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Microloans and community lending. Members fund each other's projects 
                        at fair rates. No predatory interest.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Peer-to-peer lending with reputation-based trust. Start businesses, fund projects.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'harper-guild' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>📖 Harper Guild</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Publishing and content creation. Authors, journalists, and creators 
                        keep 83.3% of sales. No publisher middlemen.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        IP protection, distribution, and royalty tracking built in.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'jukebox' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🎵 JukeBox</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Music and audio at fair rates. Artists keep 83.3% of streams and sales. 
                        No exploitative streaming deals.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Direct artist-to-listener connection. Fair compensation for creators.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'didasko' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🎓 Didasko</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Education and tutoring. Teachers and tutors keep 83.3%. 
                        Students pay Cost + 20%. Quality education, fairly priced.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Course creation, tutoring marketplace, credential verification.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'international' && (
                    <div style={{ flex: 1, color: '#0a1628' }}>
                      <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🌍 International</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        Cross-border cooperation and remittances. Send money home at Cost + 20% — 
                        not Western Union's 10% fees.
                      </p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                        Global member network. Fair exchange rates. Community support across borders.
                      </p>
                    </div>
                  )}
                  {expandedInitiative === 'brass-tacks' && (
                      <div style={{ flex: 1, color: '#0a1628' }}>
                        <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🔩 Brass Tacks</h4>
                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                          Skilled trades and professional services. Plumbers, electricians, accountants — 
                          keep 83.3% while clients pay fair rates.
                        </p>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>
                          Verified credentials. Reputation tracking. No platform exploitation.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Chevron - Next Initiative or back to overview */}
                  <div 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (nextInitiative) {
                        setExpandedInitiative(nextInitiative);
                      } else {
                        setExpandedInitiative(null);
                      }
                    }}
                    style={{
                      width: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'rgba(56, 161, 105, 0.15)',
                      borderRadius: '0 0.5rem 0.5rem 0',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                      marginRight: '-1.5rem',
                      marginTop: '-1.5rem',
                      marginBottom: '-1.5rem'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.35)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.15)'; }}
                    title={nextInitiative ? "Next Initiative" : "Back to Overview"}
                  >
                    <span style={{ fontSize: '1.5rem', color: '#38a169' }}>›</span>
                  </div>
                </div>
                );
              })() : (
                /* Two Dropdowns: Initiatives and Projects */
                <>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', textAlign: 'center', color: '#0a1628' }}>
                    <span style={{ fontSize: '1.5rem' }}>🌿</span> Not Charity TO the People
                  </h3>
                  <p style={{ fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.25rem', color: '#0a1628' }}>
                    But Infrastructure BY the People, FOR the People
                  </p>
                  
                  {/* Two Dropdowns Side by Side */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flex: 1 }}>
                    {/* INITIATIVES Dropdown */}
                    <div style={{ minWidth: '200px', display: 'flex', flexDirection: 'column' }}>
                      <details style={{ 
                        background: '#0a1628', 
                        borderRadius: '0.5rem', 
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}>
                        <summary 
                          style={{ 
                            padding: '0.75rem 1rem', 
                            color: '#faf5eb', 
                            fontSize: '1rem', 
                            fontWeight: 600,
                            listStyle: 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          INITIATIVES <span style={{ fontSize: '0.8rem' }}>▼</span>
                        </summary>
                        <div style={{ 
                          background: '#1a2744', 
                          padding: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          maxHeight: '105px',
                          overflowY: 'auto'
                        }}>
                          {[
                            { key: 'lets-make-dinner', icon: '🍽️', label: "Let's Make Dinner" },
                            { key: 'lets-get-groceries', icon: '🛒', label: "Let's Get Groceries" },
                            { key: 'lets-go-shopping', icon: '🛍️', label: "Let's Go Shopping" },
                            { key: 'household-concierge', icon: '🏠', label: 'Household Concierge' },
                            { key: 'family-table', icon: '👨‍👩‍👧‍👦', label: 'Family Table' },
                            { key: 'lifeline-medications', icon: '💊', label: 'LifeLine Medications' },
                            { key: 'msa', icon: '🏥', label: 'MSA' },
                            { key: 'defense-claws', icon: '🛡️', label: 'Defense Klaus' },
                            { key: 'rally-group', icon: '📢', label: 'Rally Group' },
                            { key: 'vsl', icon: '💳', label: 'VSL' },
                            { key: 'lets-make-bread', icon: '🍞', label: "Let's Make Bread" },
                            { key: 'harper-guild', icon: '📖', label: 'Harper Guild' },
                            { key: 'jukebox', icon: '🎵', label: 'JukeBox' },
                            { key: 'didasko', icon: '🎓', label: 'Didasko' },
                            { key: 'international', icon: '🌍', label: 'International' },
                            { key: 'brass-tacks', icon: '🔩', label: 'Brass Tacks' },
                          ].map((init) => (
                            <button 
                              key={init.key}
                              style={{ 
                                padding: '0.5rem 0.75rem', 
                                fontSize: '0.8rem', 
                                background: '#2d3748', 
                                color: '#faf5eb',
                                transition: 'background 0.2s',
                                cursor: 'pointer',
                                border: 'none',
                                borderRadius: '0.3rem',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                flexShrink: 0
                              }} 
                              onMouseOver={(e) => { e.currentTarget.style.background = '#38a169'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = '#2d3748'; }}
                              onClick={(e) => { e.stopPropagation(); navigate(`/initiatives/${init.key}`); }}
                            >
                              <span>{init.icon}</span> {init.label}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                    
                    {/* PROJECTS Dropdown */}
                    <div style={{ minWidth: '200px', display: 'flex', flexDirection: 'column' }}>
                      <details style={{ 
                        background: '#0a1628', 
                        borderRadius: '0.5rem', 
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}>
                        <summary 
                          style={{ 
                            padding: '0.75rem 1rem', 
                            color: '#faf5eb', 
                            fontSize: '1rem', 
                            fontWeight: 600,
                            listStyle: 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          PROJECTS <span style={{ fontSize: '0.8rem' }}>▼</span>
                        </summary>
                        <div style={{ 
                          background: '#1a2744', 
                          padding: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          maxHeight: '105px',
                          overflowY: 'auto'
                        }}>
                          {[
                            { key: 'farmer-warrior', icon: '⚔️', label: 'Farmer/Warrior' },
                            { key: 'healer-assassin', icon: '🗡️', label: 'Healer/Assassin' },
                            { key: 'warhorse', icon: '🐴', label: 'WarHorse' },
                            { key: 'pneumatic-palm', icon: '🌴', label: 'Pneumatic Palm Tree' },
                            { key: 'hexisle', icon: '⬡', label: 'HexIsle' },
                            { key: 'water-table', icon: '💧', label: 'Water Table' },
                          ].map((proj) => (
                            <button 
                              key={proj.key}
                              style={{ 
                                padding: '0.5rem 0.75rem', 
                                fontSize: '0.8rem', 
                                background: '#2d3748', 
                                color: '#faf5eb',
                                transition: 'background 0.2s',
                                cursor: 'pointer',
                                border: 'none',
                                borderRadius: '0.3rem',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                flexShrink: 0
                              }} 
                              onMouseOver={(e) => { e.currentTarget.style.background = '#38a169'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = '#2d3748'; }}
                              onClick={(e) => { e.stopPropagation(); navigate(`/projects/${proj.key}`); }}
                            >
                              <span>{proj.icon}</span> {proj.label}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                  
                  <p style={{ opacity: 0.5, fontSize: '0.65rem', marginTop: '0.75rem', textAlign: 'center', color: '#0a1628' }}>
                    tap to flip back · click dropdown to explore
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Three Paths — FLIP CARD (entire section swivels) */}
        <div 
          className={`paths-section-flip ${pathsSectionFlipped ? 'flipped' : ''}`}
          onClick={() => setPathsSectionFlipped(!pathsSectionFlipped)}
          style={isProfessionalTheme ? {
            background: 'transparent',  /* Background is on front/back faces, not wrapper */
            marginTop: '2rem',
            cursor: 'pointer',
          } : { cursor: 'pointer' }}
        >
          <div className="paths-section-inner">
            {/* FRONT: Choose Your Path with mirrors and 3 path cards */}
            <div className="paths-section-front" style={{ position: 'relative' }}>
              {/* Hand icon for flip indication */}
              <span className="hand" style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '1.1rem', opacity: 0.35 }}>👉</span>
              <div className="trunk-info" style={{ background: 'transparent', padding: 0 }}>
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '2rem',
                  width: '80%',
                  margin: '0 auto 2rem auto'
                }}>
                  <h2 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 700, 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}>
                    {/* LEFT MIRROR — Will-o-Wisp Tutorial Journey */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setWispActive(true); }}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '2.2rem',
                        lineHeight: 1,
                        transition: 'transform 0.3s, filter 0.3s',
                        padding: 0,
                        filter: 'hue-rotate(180deg) brightness(1.2)',
                        position: 'relative'
                      }}
                      title="🕯️ Will-o'-the-Wisp — follow the dancing light to learn"
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.filter = 'hue-rotate(180deg) brightness(1.5) drop-shadow(0 0 8px #88f)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'hue-rotate(180deg) brightness(1.2)'; }}
                    >
                      🪞
                    </button>

                    Choose Your Path

                    {/* RIGHT MIRROR — Durin's Door (existing) + Candle reward */}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDurinsDoorOpen(true); }}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '2.2rem',
                          lineHeight: 1,
                          transition: 'transform 0.3s',
                          padding: 0
                        }}
                        title="🚪 Durin's Door — speak friend and enter"
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        🪞
                      </button>
                      {candleEarned && (
                        <span 
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-12px',
                            fontSize: '1.2rem',
                            animation: 'wisp-flicker 2s ease-in-out infinite',
                            cursor: 'pointer',
                            filter: 'drop-shadow(0 0 6px #fbbf24)'
                          }}
                          title="🕯️ Your first candle! Click to collect."
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("🕯️ Candle Collected!\n\nYour first candle is now in your satchel.\n\nUse it to take short jumps to places you don't have a Deck Card for yet.\n\n(1/10 used per jump • 10 uses total)");
                          }}
                        >
                          🕯️
                        </span>
                      )}
                    </div>
                  </h2>
                </div>
                
                <div className="path-grid">
                  {/* Get a Job */}
                  <div className={`path-flip ${flippedPaths.has(0) ? 'flipped' : ''}`} onClick={(e) => { e.stopPropagation(); togglePath(0); }}>
                    <div className="path-inner">
                      <div className="path-front">
                        <h3>Get a Job</h3>
                        <p>Real work. Fair pay. You keep 83.3%.</p>
                        <button className="path-price-btn" onClick={(e) => { e.stopPropagation(); navigate('/discover/work'); }}>16 Initiatives Hiring →</button>
                        <span className="hand">👉</span>
                      </div>
                      <div className="path-back">
                        <h3>Get a Job</h3>
                        <p>Browse opportunities across 16 initiatives — meal delivery, safety services, manufacturing, and more. No middleman taking half. You keep 83.3% of every dollar charged.</p>
                        <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/discover/work'); }}>
                          Browse Opportunities
                        </button>
                        <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(0); }}>← flip back</span>
                      </div>
                    </div>
                  </div>

                  {/* Build a Business */}
                  <div className={`path-flip ${flippedPaths.has(1) ? 'flipped' : ''}`} onClick={(e) => { e.stopPropagation(); togglePath(1); }}>
                    <div className="path-inner">
                      <div className="path-front">
                        <h3>Build a Business</h3>
                        <p>Same terms as the Founder. Your ship, Captain — your rules.</p>
                        <button className="path-price-btn" onClick={(e) => { e.stopPropagation(); navigate('/auth'); }}>$5 to Start →</button>
                        <span className="hand">👉</span>
                      </div>
                      <div className="path-back">
                        <h3>Build a Business</h3>
                        <p>Launch your Keep for $5. Sell products and services, keep <strong>83.3%</strong>. Same deal as the Founder — no special treatment, no executive privilege. Your ship, Captain — your rules.</p>
                        <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/discover/build'); }}>
                          Start Building
                        </button>
                        <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(1); }}>← flip back</span>
                      </div>
                    </div>
                  </div>

                  {/* Plant Seeds */}
                  <div className={`path-flip ${flippedPaths.has(2) ? 'flipped' : ''}`} onClick={(e) => { e.stopPropagation(); togglePath(2); }}>
                    <div className="path-inner">
                      <div className="path-front">
                        <h3>Plant Seeds</h3>
                        <p>Support projects early. Gain more influence.</p>
                        <button className="path-price-btn" onClick={(e) => { e.stopPropagation(); navigate('/discover/sponsor'); }}>From $25 →</button>
                        <span className="hand">👉</span>
                      </div>
                      <div className="path-back">
                        <h3>Plant Seeds</h3>
                        <p>Back projects early and receive <strong>5× the Joules</strong> — more collateral, more governance weight. Or sponsor innovations in our <strong>patent portfolio</strong> starting at $25.</p>
                        <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/discover/sponsor'); }}>
                          Start Planting
                        </button>
                        <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(2); }}>← flip back</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flip hint for section */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button 
                    onClick={() => setPathsSectionFlipped(true)}
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    🔄 See Entry Points (Ghost World / Real World)
                  </button>
                </div>
              </div>
            </div>

            {/* BACK: Ghost World / Real World portals */}
            <div className="paths-section-back" onClick={() => setPathsSectionFlipped(false)}>
              <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Two Worlds. One Platform.</h3>
              
              <div className="gk-back-cols" style={{ gap: '2rem', padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
                {/* GHOST WORLD Portal */}
                <div 
                  className={`portal-flip ${flippedPaths.has(10) ? 'flipped' : ''}`}
                  onClick={(e) => { e.stopPropagation(); togglePath(10); }}
                  style={{ 
                    background: 'rgba(139, 92, 246, 0.15)', 
                    borderRadius: '1rem', 
                    padding: '1.5rem',
                    border: isProfessionalTheme ? '2px dashed rgba(139, 92, 246, 0.4)' : '1px solid rgba(139, 92, 246, 0.3)',
                    cursor: 'pointer',
                    minHeight: '200px'
                  }}
                >
                  <div className="portal-inner">
                    <div className="portal-front">
                      <h4 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>👻 Ghost World</h4>
                      <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '1rem', lineHeight: 1.5 }}>
                        Explore freely. No commitment. Test ideas. Hunt Golden Keys.
                      </p>
                      <button 
                        className="gk-option" 
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', width: '100%', padding: '0.75rem 1rem' }}
                        onClick={(e) => { e.stopPropagation(); navigate('/ghost'); }}
                      >
                        Enter Ghost World
                        <small>Browse everything first</small>
                      </button>
                      <span className="hand" style={{ position: 'absolute', bottom: '8px', right: '12px' }}>👉</span>
                    </div>
                    <div className="portal-back">
                      <h4 style={{ marginBottom: '0.5rem' }}>What is Ghost World?</h4>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Ghost World lets you explore everything without commitment. Browse initiatives, test ideas, hunt Golden Keys. 
                        When you're ready to participate for real, you become a member for $5/year.
                      </p>
                      <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(10); }}>← flip back</span>
                    </div>
                  </div>
                </div>

                {/* REAL WORLD Portal */}
                <div 
                  className={`portal-flip ${flippedPaths.has(11) ? 'flipped' : ''}`}
                  onClick={(e) => { e.stopPropagation(); togglePath(11); }}
                  style={{ 
                    background: 'rgba(52, 211, 153, 0.15)', 
                    borderRadius: '1rem', 
                    padding: '1.5rem',
                    border: isProfessionalTheme ? '2px dashed rgba(52, 211, 153, 0.4)' : '1px solid rgba(52, 211, 153, 0.3)',
                    cursor: 'pointer',
                    minHeight: '200px'
                  }}
                >
                  <div className="portal-inner">
                    <div className="portal-front">
                      <h4 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>💼 Real World</h4>
                      <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '1rem', lineHeight: 1.5 }}>
                        Get a real job. Build a real business. Plant real seeds.
                      </p>
                      <button 
                        className="gk-option" 
                        style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', color: '#022c22', width: '100%', padding: '0.75rem 1rem' }}
                        onClick={(e) => { e.stopPropagation(); navigate('/portal'); }}
                      >
                        Enter Real World
                        <small>$5/year to participate</small>
                      </button>
                      <span className="hand" style={{ position: 'absolute', bottom: '8px', right: '12px' }}>👉</span>
                    </div>
                    <div className="portal-back">
                      <h4 style={{ marginBottom: '0.5rem' }}>What is Real World?</h4>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Real World is where work happens. Get a job keeping 83.3%. Build a business on your terms. 
                        Plant seeds to back projects early. Same deal as the Founder — no special treatment.
                      </p>
                      <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(11); }}>← flip back</span>
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '1.5rem', textAlign: 'center' }}>
                tap anywhere to flip back to paths
              </p>
            </div>
          </div>
        </div>

        <footer className="landing-footer" style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          marginTop: '2rem',
          borderTop: '1px solid rgba(250, 245, 235, 0.1)',
          color: '#a0aec0',
          fontSize: '0.85rem'
        }}>
          <p style={{ margin: 0 }}>
            © 2026 Liana Banyan Corporation
            <span style={{ margin: '0 0.75rem', opacity: 0.5 }}>|</span>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); setWispActive(true); }}
              style={{
                color: '#38a169',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Walkthrough
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATED DISCOVERY VIEW — Minimal chalk-outline aesthetic
// ═══════════════════════════════════════════════════════════════════════════
function AuthenticatedDiscoveryView({ 
  navigate, 
  discoveries, 
  discoveryLevel 
}: { 
  navigate: (path: string) => void; 
  discoveries: Set<string>;
  discoveryLevel: number;
}) {
  // Get discovered items (max 3 shown)
  const discoveredItems = Array.from(discoveries).slice(0, 3);
  
  // Always show 3 items: discovered ones + empty chalk slots
  const totalSlots = 4; // 3 discovered + 1 empty chalk outline
  const emptySlots = totalSlots - discoveredItems.length - 1; // Reserve 1 for "next discovery"

  return (
    <div className="landing-page">
      {/* Brand Title — Top Left */}
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      {/* Status Badge */}
      <div className="submarine-door-status">
        <span className="status-dot" />
        <span>Level {discoveryLevel}</span>
      </div>

      {/* Corner Toggles */}
      <button className="ghost-toggle" onClick={() => navigate('/the-helm')}>
        🧭 The Helm
      </button>
      <button className="mirror-toggle" onClick={() => navigate('/dashboard')} title="Full Dashboard">
        📊 Dashboard
      </button>

      <div className="container">
        <header className="landing-header">
          <img src="/logo.png" alt="Liana Banyan" className="logo" />
          
          {/* Greeting */}
          <div className="golden-key-flip">
            <div className="golden-key-inner" style={{ minHeight: 'auto' }}>
              <div className="gk-front" style={{ position: 'relative', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '2rem' }}>
                  <span style={{ color: '#ffffff' }}>Your Keep</span>
                </h2>
                <p className="tagline" style={{ marginTop: '0.5rem' }}>
                  {discoveries.size} discoveries · Level {discoveryLevel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Discovery Grid — 3 discovered + 1 chalk outline */}
        <div className="trunk-info">
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Your Discoveries</h2>
          <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '1.5rem' }}>
            Explore to reveal more.
          </p>
          
          <div className="path-grid">
            {/* Discovered Items */}
            {discoveredItems.map((slug) => (
              <DiscoveredCard key={slug} slug={slug} navigate={navigate} />
            ))}

            {/* Empty Chalk Slots */}
            {Array.from({ length: Math.max(0, emptySlots) }).map((_, i) => (
              <ChalkOutlineSlot key={`empty-${i}`} />
            ))}

            {/* The "Next Discovery" Slot — always visible */}
            <NextDiscoverySlot navigate={navigate} />
          </div>
        </div>

        {/* Quick Actions — Just 2 */}
        <div className="trunk-info">
          <div style={{ textAlign: 'center' }}>
            <button className="btn" style={{ marginRight: '0.75rem' }} onClick={() => navigate('/the-helm')}>
              Enter The Helm
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
              Full Dashboard
            </button>
          </div>
        </div>

        <footer className="landing-footer">
          <p>© 2026 Liana Banyan Corporation</p>
        </footer>
      </div>
    </div>
  );
}

// ─── Discovered Card (now using DeckCardFrame) ───
function DiscoveredCard({ slug, navigate }: { slug: string; navigate: (path: string) => void }) {
  const cardMeta: Record<string, { title: string; desc: string; route: string; icon: string }> = {
    'membership-status': { title: 'Your Membership', desc: 'Active member', route: '/dashboard', icon: '🏠' },
    'guild-stake': { title: 'Guild Stake', desc: 'Your progression', route: '/guilds', icon: '⚔️' },
    'lets-make-dinner': { title: "Let's Make Dinner", desc: 'Community cooking', route: '/initiatives/lets-make-dinner', icon: '🍽️' },
    'defense-klaus': { title: 'Defense Klaus', desc: 'For Someone You Love', route: '/initiatives/defense-klaus', icon: '🛡️' },
    'crowdfunding-hub': { title: 'Crowdfunding', desc: 'Campaign tools', route: '/crowdfunding', icon: '💰' },
    'hofund-studio': { title: 'Hofund Studio', desc: 'QR & cue cards', route: '/hofund', icon: '🎴' },
  };

  const meta = cardMeta[slug] || { title: slug.replace(/-/g, ' '), desc: 'Discovered', route: '/dashboard', icon: '🎴' };

  return (
    <DeckCardFrame
      cardId={slug}
      cardType="location"
      title={meta.title}
      description={meta.desc}
      icon={meta.icon}
      destinationRoute={meta.route}
      unlockCost={{ type: 'free', amount: 0 }}
      onCollect={() => navigate(meta.route)}
    />
  );
}

// ─── Chalk Outline Slot (empty - uses DeckCardFrame) ───
function ChalkOutlineSlot() {
  return (
    <DeckCardFrame
      cardId={`empty-${Math.random().toString(36).slice(2)}`}
      title="Undiscovered"
      icon="?"
      isChalkOutline={true}
    />
  );
}

// ─── Next Discovery Slot (glowing hint - uses DeckCardFrame with special styling) ───
function NextDiscoverySlot({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div 
      onClick={() => navigate('/the-helm')}
      style={{ cursor: 'pointer' }}
    >
      <DeckCardFrame
        cardId="next-discovery"
        cardType="quest"
        title="What's Next?"
        description="Explore to discover"
        icon="❓"
        destinationRoute="/the-helm"
        unlockCost={{ type: 'free', amount: 0 }}
      />
    </div>
  );
}

export default Index;
