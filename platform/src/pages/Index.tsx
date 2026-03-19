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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscovery } from '@/hooks/useDiscovery';
import { DeckCardFrame } from '@/components/DeckCardFrame';
import SpotlightCarousel from '@/components/SpotlightCarousel';
import { SEED_CARDS, SPOTLIGHT_CATEGORIES, selectCards, type SpotlightCard as SpotlightCardType } from '@/lib/spotlightAlgorithm';
import { LemonadeStandFlipbook } from '@/components/LemonadeStandFlipbook';
import { FableFlipbook } from '@/components/FableFlipbook';
import { OriginStoryFlipbook } from '@/components/OriginStoryFlipbook';
import { WillOWisp } from '@/components/WillOWisp';
import { RosettaKeyboard } from '@/components/RosettaKeyboard';
import { AccessibilityMirror } from '@/components/AccessibilityMirror';
import { ProfessionalLanding } from '@/components/ProfessionalLanding';
import { RotatingQuotes } from '@/components/RotatingQuotes';
import { useLevelGatedNavigate, getRouteLevel } from '@/components/LevelGatedLink';
import { usePathwayProgress } from '@/contexts/PathwayProgressContext';
import { Lock, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import PortalGatewayPage from './PortalGateway';
import { SWEET_SIXTEEN } from '@/lib/daisyChainLink';
import '@/styles/landing.css';

const FABLE_SUBTITLES: Record<number, string> = {
  1: "The Little Red Hen\nfound some seeds.",
  2: "She asked the Dog, the Cat, and the Pig for help.\nThey refused.",
  3: "So she planted, tended, harvested, and baked —\nall by herself.",
  4: "Now everyone wanted her bread.",
  5: "But she had a bigger idea.",
  6: "\"Then I'll feed everyone —\nand we'll build something together.\"",
  7: "She came to a town\nwhere people were struggling.",
  8: "\"I'm making soup from a stone.\nWould you like to help?\"",
  9: "One brought salt. One brought a potato.\nOne brought herbs. Everyone gave a little.",
  10: "And everyone ate well.",
  11: "Over the meal, a small ant asked:\n\"How did you know what to do?\"",
  12: "\"I was daydreaming\nin my kitchen...\"",
  13: "\"...and I looked out my window and saw people\nlined up for food that had been locked away.\"",
  14: "\"So I reached into my daydream\nand pulled out something useful.\"",
  15: "\"To make bread,\nyou have to plant seeds.\"",
  16: "But outside the city, the ants were already harvesting —\nfor grasshoppers who only watched and took.",
  17: "The Hen called out to the ants.\nThe grasshoppers heard, too.",
  18: "She told the ants what they needed to do\nto make bread for themselves.",
  19: "And together — ants, city folk, and the Hen —\nthey planted, kneaded, baked, and shared.",
  20: "The grasshoppers noticed.",
  21: "\"It's not about food.\nIt's about keeping these ants IN LINE.\"",
  22: "They came to put a stop to it.",
  23: "But one ant looked around and realized:\nthey outnumbered the grasshoppers 10,000 to 1.",
  24: "Grasshoppers need ants.\nAnts don't need grasshoppers.",
  25: "WE ARE THE ANTS.",
  26: "\"You've got the makings of greatness in you.\nYou're gonna rattle the stars, you are.\"",
  27: "And when she looked down...\nher basket had been refilled.",
  28: "Speckles from the young ones' messy eating\ntook root and grew for others to harvest.",
  29: "Hopper sat alone.",
  30: "...",
  31: "",  // End card — "Where To Go From Here"
};

// Durin's Door Dialog Component
function DurinsDoorDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [friendWord, setFriendWord] = useState('');
  const [message, setMessage] = useState('');
  const [lintel, setLintel] = useState<string[]>([]);
  const [collectedWords, setCollectedWords] = useState<Set<string>>(new Set());
  const [showRosetta, setShowRosetta] = useState(false);
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = React.useRef({ x: 0, y: 0 });
  const elementStartPos = React.useRef({ x: 0, y: 0 });
  
  // Reset position when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);
  
  const handleDragStart = (e: React.MouseEvent) => {
    // Only start drag from the header area
    if ((e.target as HTMLElement).closest('.durins-drag-handle')) {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      elementStartPos.current = { x: position.x, y: position.y };
      e.preventDefault();
    }
  };
  
  React.useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      setPosition({
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY,
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
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
    <div className="durins-dialog-overlay" onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} role="button" tabIndex={0} aria-label="Close dialog">
      <div 
        className="durins-dialog" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleDragStart}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : undefined,
          userSelect: isDragging ? 'none' : undefined,
        }}
      >
        {/* Drag handle */}
        <div 
          className="durins-drag-handle"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40px',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ 
            color: 'rgba(255,255,255,0.3)', 
            fontSize: '1.2rem',
            letterSpacing: '2px',
          }}>⋮⋮</span>
        </div>
        <button className="durins-close" onClick={onClose}>×</button>
        <h2 className="durins-drag-handle" style={{ cursor: 'grab', marginTop: '0.5rem' }}>🪞 Mirror Mirror 🪞</h2>
        
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
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '10px',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            ← Back
          </button>
          <button className="btn" onClick={handleSubmit} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            ENTER
          </button>
        </div>

        <p style={{ opacity: 0.4, fontSize: '0.75rem', marginTop: '1.5rem', textAlign: 'center' }}>
          50+ languages recognized · Icelandic, Swahili, Korean, Arabic, and more
        </p>

        {/* Accessibility Mirror — "Fair means everyone can use it" */}
        <AccessibilityMirror />
      </div>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { discoveries, discoveryLevel } = useDiscovery();
  const [showWelcomeChoice, setShowWelcomeChoice] = useState<boolean | null>(null);
  const [userChoice, setUserChoice] = useState<'keep' | 'explore' | null>(null);

  // Check if user has made a session choice already
  useEffect(() => {
    if (user) {
      const sessionChoice = sessionStorage.getItem('lb_landing_choice');
      if (sessionChoice === 'keep') {
        setUserChoice('keep');
        setShowWelcomeChoice(false);
      } else if (sessionChoice === 'explore') {
        setUserChoice('explore');
        setShowWelcomeChoice(false);
      } else {
        // No choice yet — show the dialog
        setShowWelcomeChoice(true);
      }
    }
  }, [user]);

  const handleChoice = (choice: 'keep' | 'explore') => {
    sessionStorage.setItem('lb_landing_choice', choice);
    setUserChoice(choice);
    setShowWelcomeChoice(false);
  };

  // ─── AUTHENTICATED: Show choice dialog or chosen view ───
  if (user) {
    // Show welcome choice dialog
    if (showWelcomeChoice) {
      return (
        <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{
              background: 'rgba(26, 32, 44, 0.95)',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '400px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{ color: '#faf5eb', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Welcome back!
              </h2>
              <p style={{ color: '#a0aec0', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Where would you like to go?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => handleChoice('keep')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #38a169, #2f855a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  🏰 Go to My Keep
                </button>
                <button
                  onClick={() => handleChoice('explore')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#faf5eb',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  👻 Explore as Ghost
                </button>
              </div>
              <p style={{ color: '#718096', fontSize: '0.75rem', marginTop: '1rem' }}>
                This choice lasts for your session only.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // User chose to go to Keep — redirect to Dashboard
    if (userChoice === 'keep') {
      navigate('/dashboard');
      return null;
    }

    // User chose to explore — show public landing
    if (userChoice === 'explore') {
      return <PublicLandingView navigate={navigate} />;
    }

    // Still loading choice
    return null;
  }

  // ─── NOT AUTHENTICATED: Original HEOHO Landing with Hero flip + Fable ───
  // Session 25: Restored per Founder directive — returning visitors see the real landing.
  // PortalGatewayPage only accessible to authenticated users via /portal route.
  return <PublicLandingView navigate={navigate} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC LANDING VIEW — Matches landing.html exactly
// ═══════════════════════════════════════════════════════════════════════════
function PublicLandingView({ navigate }: { navigate: (path: string) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [heroFlipped, setHeroFlipped] = useState(false);      // HEOHO card flip

  const [fableFrame, setFableFrame] = useState(1);            // Fable frame index
  const [fableIsPlaying, setFableIsPlaying] = useState(false); // Fable playback state
  const [originFrame, setOriginFrame] = useState(0);          // Origin story frame index (0-based)
  const [originIsPlaying, setOriginIsPlaying] = useState(false);
  const [lemonadeFrame, setLemonadeFrame] = useState(0);      // Lemonade stand frame index (0-based)
  const [lemonadeIsPlaying, setLemonadeIsPlaying] = useState(false);

  // Origin Story scene data (12 scenes)
  const ORIGIN_SCENES = [
    { img: 'concept_01_idea.jpg', caption: 'A person has an idea —\na tiny seed of something.' },
    { img: 'concept_02_planting.jpg', caption: 'They plant it.\nJust one seed, in one spot of dirt.' },
    { img: 'concept_03_growing.jpg', caption: 'It grows. Slowly at first —\na sprout reaching for light.' },
    { img: 'concept_04_banyan.jpg', caption: 'Water it. Feed it.\nThe seed becomes a sapling.' },
    { img: 'concept_05_figs.jpg', caption: 'The sapling becomes a tree.\nAnd the tree bears fruit.' },
    { img: 'concept_06_harvest.jpg', caption: "The fruit fills a wheelbarrow.\nOne person's idea — harvested." },
    { img: 'concept_07_more_growth.jpg', caption: "A banyan doesn't stop at one trunk.\nIt sends down roots that become new trunks." },
    { img: 'concept_08_expansion.jpg', caption: 'One tree becomes two. Two become four.\nA forest from a single seed.' },
    { img: 'concept_09_more_harvest.jpg', caption: 'More trees, more fruit.\nMore wheelbarrows. More people harvesting.' },
    { img: 'concept_10_abundance.jpg', caption: 'The forest feeds everyone\nwho helped it grow.' },
    { img: 'concept_11_ecosystem.jpg', caption: 'It becomes an ecosystem.\nSelf-sustaining. Self-expanding. Alive.' },
    { img: 'concept_12_legacy.jpg', caption: 'And it all started with one person,\none idea, one seed.\nYOU.' },
    { img: '', caption: '' },  // End card — "Where To Go From Here"
  ];

  // Lemonade Stand scene data (8 scenes) — uses emoji placeholders until son's drawings arrive
  const LEMONADE_SCENES = [
    { caption: "The goat wants to build\nbut can't afford the supplies." },
    { caption: "One chicken and the dog\nput nickels in the goat's wheelbarrow." },
    { caption: "The goat uses the money\nto buy wood, nails, and tools." },
    { caption: "The goat, chicken, pig, and cat\nall work together to build." },
    { caption: "The new lemonade stand\nsells cups for five cents each." },
    { caption: "The goat, dog, and cat put money\nin the chef chicken's wheelbarrow." },
    { caption: "Six friends with lemonade and pizza\nhelp the dog start his dream." },
    { caption: '"A true selfless act\nalways sparks another." — Klaus' },
    { caption: '' },  // End card — "Where To Go From Here"
  ];

  useEffect(() => {
    if (!fableIsPlaying) return;
    const timer = setInterval(() => {
      setFableFrame((prev) => {
        if (prev >= 31) {
          setFableIsPlaying(false);
          return 31;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [fableIsPlaying]);

  useEffect(() => {
    if (!originIsPlaying) return;
    const timer = setInterval(() => {
      setOriginFrame((prev) => {
        if (prev >= ORIGIN_SCENES.length - 1) { setOriginIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [originIsPlaying]);

  useEffect(() => {
    if (!lemonadeIsPlaying) return;
    const timer = setInterval(() => {
      setLemonadeFrame((prev) => {
        if (prev >= LEMONADE_SCENES.length - 1) { setLemonadeIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [lemonadeIsPlaying]);
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
  const [charityFlipped, setCharityFlipped] = useState(false);  // Charity card flip — front shows 3 deck cards, back shows 16 initiative pills
  const [spotlightCard, setSpotlightCard] = useState<string | null>(null);  // Bottom card spotlight — replaces hero card face
  const [spotlightCategory, setSpotlightCategory] = useState('all');
  const spotlightCards = selectCards(SEED_CARDS, spotlightCategory);
  const activeSpotlight = spotlightCard ? SEED_CARDS.find(c => c.id === spotlightCard) : null;
  const [selectedInitiative, setSelectedInitiative] = useState<string | null>(null);  // Selected initiative on charity card back, null = pill grid
  const [explainerFlipped, setExplainerFlipped] = useState(false);  // Start unflipped showing white front (simple message), click to flip to dark back (16 initiatives)
  const [pathsSectionFlipped, setPathsSectionFlipped] = useState(false);  // Choose Your Path section flip (trunk-info)
  const [expandedWorldPortal, setExpandedWorldPortal] = useState<'ghost' | 'real' | null>(null);  // Which world portal is expanded on Choose Card back
  const [activeSlideshow, setActiveSlideshow] = useState<string | null>(null);  // Which content is showing: 'fable' | 'lemonade' | 'origin' | 'noads' | 'novc' | null
  const [watchDropdownOpen, setWatchDropdownOpen] = useState(false);  // WATCH button dropdown menu

  // Close WATCH dropdown when clicking anywhere else
  useEffect(() => {
    if (!watchDropdownOpen) return;
    const handleClickAway = () => setWatchDropdownOpen(false);
    const timer = setTimeout(() => document.addEventListener('click', handleClickAway), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handleClickAway); };
  }, [watchDropdownOpen]);
  
  // Level-gated navigation
  const levelGatedNavigate = useLevelGatedNavigate();
  const { progress, isLevelGatingEnabled } = usePathwayProgress();
  
  // Helper to check if a route is locked
  const isRouteLocked = (route: string) => {
    const requiredLevel = getRouteLevel(route);
    return isLevelGatingEnabled() && requiredLevel > progress.currentLevel;
  };
  
  // HOFUND Secret Entry System - Easter egg access via hand icon
  const [hofundCodeEntry, setHofundCodeEntry] = useState(false);  // Show code entry popup
  const [hofundCode, setHofundCode] = useState('');  // Code being entered
  const [hofundAccessGranted, setHofundAccessGranted] = useState(false);  // Valid code entered, show ship's wheel
  const [hofundCoordinates, setHofundCoordinates] = useState('');  // Coordinates being entered
  const [hofundWrongCodeMessage, setHofundWrongCodeMessage] = useState(false);  // Show explanation when wrong code entered
  const [foundationQuizIndex, setFoundationQuizIndex] = useState(() => Math.floor(Math.random() * 5));  // Random quiz question
  
  // Foundation Document Quiz Questions - cycle through these on wrong code page
  const foundationQuizzes = [
    {
      passage: "\"The platform margin is fixed at Cost + 20%. This cannot be changed by future leadership, investors, or market pressure. Ever.\"",
      question: "What percentage does a creator keep on every transaction?",
      options: [
        { text: "70%", correct: false, route: null },
        { text: "83.3%", correct: true, route: "/discover" },
        { text: "80%", correct: false, route: null },
        { text: "50%", correct: false, route: null }
      ],
      source: "Operating Agreement, Section 4.2"
    },
    {
      passage: "\"Ghost World lets you explore everything without commitment. Browse initiatives, test ideas, hunt Golden Keys, play and make Beacon Run games for Crow Feathers.\"",
      question: "What do you earn by playing Beacon Run games?",
      options: [
        { text: "Marks", correct: false, route: null },
        { text: "Crow Feathers", correct: true, route: "/feathers?ghost=true" },
        { text: "Joules", correct: false, route: null },
        { text: "Credits", correct: false, route: null }
      ],
      source: "Ghost World Documentation"
    },
    {
      passage: "\"Harper Guild provides independent HR and business ethics support. Every Guild and business MUST have a Care Coordinator from the Harper Guild. Non-negotiable.\"",
      question: "What role does Harper Guild serve?",
      options: [
        { text: "Music licensing", correct: false, route: null },
        { text: "Manufacturing coordination", correct: false, route: null },
        { text: "HR & ethics support for businesses", correct: true, route: "/initiatives/harper-guild" },
        { text: "Crisis response", correct: false, route: null }
      ],
      source: "Crown System Documentation"
    },
    {
      passage: "\"VSL — Voucher Short Loans. No-collateral, 0-5% interest, member-to-member microfinancing. Emergency support when you need it most.\"",
      question: "What is the interest rate range for VSL loans?",
      options: [
        { text: "5-10%", correct: false, route: null },
        { text: "0-5%", correct: true, route: "/initiatives/vsl" },
        { text: "10-15%", correct: false, route: null },
        { text: "No interest ever", correct: false, route: null }
      ],
      source: "VSL Initiative Charter"
    },
    {
      passage: "\"Let's Make Bread isn't about baking. It's a $5 business simulator that graduates to a real-life business incubator. Practice running a business before you risk real money.\"",
      question: "What does Let's Make Bread actually do?",
      options: [
        { text: "Baking collective", correct: false, route: null },
        { text: "Business simulator & incubator", correct: true, route: "/initiatives/bread" },
        { text: "Loan service", correct: false, route: null },
        { text: "Grocery delivery", correct: false, route: null }
      ],
      source: "Let's Make Bread Initiative"
    }
  ];
  
  // Valid Hofund access codes - can be expanded later
  const validHofundCodes = ['CAPTAIN', 'HOFUND', 'BIFROST', 'KEEPER'];  // Placeholder codes - user will assign
  
  // Special codes with unique behaviors
  const specialCodes: Record<string, { action: () => void }> = {
    'SCE-TO-AUX': {
      action: () => {
        // Navigate to Portfolio as Ghost with 5 Marks bonus and Wisp walkthrough
        // Store the bonus in sessionStorage so Portfolio page can read it
        sessionStorage.setItem('hofund_sce_bonus', JSON.stringify({ marks: 5, wisp: true }));
        navigate('/portfolio?ghost=true&wisp=true');
      }
    },
    'SCETOAUX': {
      action: () => {
        sessionStorage.setItem('hofund_sce_bonus', JSON.stringify({ marks: 5, wisp: true }));
        navigate('/portfolio?ghost=true&wisp=true');
      }
    },
    'CROW-FEATHERS': {
      action: () => {
        // Navigate to Crow Feathers / Beacon Games page as Ghost with Wisp walkthrough
        sessionStorage.setItem('hofund_crow_feathers', JSON.stringify({ ghost: true, wisp: true }));
        navigate('/feathers?ghost=true&wisp=true');
      }
    },
    'CROWFEATHERS': {
      action: () => {
        sessionStorage.setItem('hofund_crow_feathers', JSON.stringify({ ghost: true, wisp: true }));
        navigate('/feathers?ghost=true&wisp=true');
      }
    }
  };
  
  // Mobile detection for UI adjustments
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle URL parameter to open initiatives view directly (for back navigation from initiative pages)
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'initiatives') {
      // Flip the main card and expand the initiatives section
      setMainCardFlipped(true);
      setMainBackExpanded('initiatives');
      // Clear the URL parameter using window.history to avoid React re-render
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);
  
  // Auto-trigger Spotlight Ranger (Will-o'-Wisp) on first session visit
  // Will-o'-Wisp now only starts on explicit user request (click "Walkthrough" link)
  // Auto-start disabled per user feedback — let users explore freely first
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
    '/ghost': {
      icon: '👻',
      title: 'Free Explore',
      description: 'Explore the platform as a Guest (Ghost) without logging in. Browse initiatives, see how things work, and discover what membership participation looks like — no commitment required.',
    },
    '/durins-door': {
      icon: '🪞',
      title: 'Mirror Mirror',
      description: 'You found a keyhole. Hidden doors are scattered throughout — each one unlocks something different, all worth finding. This one opens Mirror Mirror — the fairest of them all. Not fairest as in beauty. Fairest as in how we treat each other. Mirror Mirror translates this entire site into 50+ languages — because fair means everyone can read it. And YOU can help translate. Enter to find out more.',
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
  // Warm off-white page background — Main Card stands out like a physical object on a table
  const professionalBackground = isProfessionalTheme
    ? 'linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 30%, #0a0a0a 70%, #0d0d1f 100%)'
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

      {/* Navigation, status badges, and floating toggles removed per homepage spec.
         Clean landing: only Main Card + ENTER/WATCH buttons visible.
         Entire block wrapped in false to suppress all three ternary branches. */}
      {false ? (
        null
      ) : false && isProfessionalTheme && (!isMobile || showPageTools) ? (
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
            <span
              role="button"
              tabIndex={0}
              style={{
                color: helmDropdownOpen ? '#faf5eb' : '#a0aec0',
                fontSize: isMobile ? '1.5rem' : '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
              }}
              title="The Helm"
            >
              {isMobile ? '🪖' : 'The Helm'}
            </span>
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
            <span
              role="button"
              tabIndex={0}
              onClick={() => { if (!isMobile) setDurinsDoorOpen(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isMobile) setDurinsDoorOpen(true); } }}
              style={{
                color: mirrorDropdownOpen ? '#faf5eb' : '#a0aec0',
                fontSize: isMobile ? '1.5rem' : '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
              }}
              title="Mirror/Mirror (Durin's Door)"
            >
              {isMobile ? '🪞' : 'Mirror/Mirror'}
            </span>
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
      ) : false && isProfessionalTheme && isMobile ? (
        /* Mobile Professional Mode - removed per homepage spec */
        <>
          {/* Mobile Explore Dropdown - replaces "Operational" badge */}
          <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1001,
          }}>
            <button
              onClick={() => setHelmDropdownOpen(!helmDropdownOpen)}
              style={{
                background: helmDropdownOpen ? 'rgba(56, 161, 105, 0.3)' : 'rgba(10, 22, 40, 0.95)',
                border: '1px solid rgba(250, 245, 235, 0.3)',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                color: '#faf5eb',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Explore <span style={{ fontSize: '0.7rem' }}>{helmDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {helmDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'rgba(10, 22, 40, 0.98)',
                border: '1px solid rgba(250, 245, 235, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.5rem 0',
                minWidth: '160px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}>
                <button
                  onClick={() => { setHelmDropdownOpen(false); levelGatedNavigate('/the-helm'); }}
                  onMouseEnter={() => setHoveredHelmItem('/the-helm')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#faf5eb',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  🪖 The Helm
                </button>
                <button
                  onClick={() => { setHelmDropdownOpen(false); navigate('/ghost'); }}
                  onMouseEnter={() => setHoveredHelmItem('/ghost')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#faf5eb',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  👻 Free Explore
                </button>
                <button
                  onClick={() => { setHelmDropdownOpen(false); setDurinsDoorOpen(true); }}
                  onMouseEnter={() => setHoveredHelmItem('/durins-door')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#faf5eb',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  🪞 Mirror/Mirror
                </button>
              </div>
            )}
          </div>

          {/* Ghost and Mirror toggles - ONLY show when showPageTools is true */}
          {showPageTools && (
            <>
              <button className="ghost-toggle" onClick={() => navigate('/ghost')}>
                👻
              </button>
              <button className="mirror-toggle" onClick={() => setDurinsDoorOpen(true)} title="The Mirror">
                🪞
              </button>
            </>
          )}
        </>
      ) : (
        null
      )}
      {/* END of suppressed floating UI block */}
      
        {/* Theme palette button removed per homepage spec — clean landing focus */}

      {/* Refactor Panel — hidden per homepage spec (clean landing) */}
      {false && refactorPanelOpen && (!isProfessionalTheme || showPageTools) && (
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

      <div className="container" style={isProfessionalTheme ? { maxWidth: '1060px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', width: '100%', position: 'relative', zIndex: 1, minHeight: '100vh', boxSizing: 'border-box' } : undefined}>
        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CARD (larger) — Contains Logo + Hero Card slot + G&G Button
            Flips independently to show "How It Works"
        ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className={`main-card-flip ${isProfessionalTheme ? 'professional-card' : ''}`}
        >
          <div className="main-card-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 }}>
            {/* FRONT: Logo + Hero Card + ENTER/WATCH — Main Card is static frame, does NOT flip */}
            <div
              className="main-card-front"
              data-xray-id="main-card"
              style={isProfessionalTheme ? {
                position: 'relative',
                boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.10)',
                padding: '2.5rem 2.5rem 2rem',
              } : undefined}
            >
              {/* Logo at top (professional mode has no logo here - it's inside the Hero Card) */}
              {!isProfessionalTheme && (
                <img src="/logo.png" alt="Liana Banyan" className="logo" style={{ marginBottom: '1.5rem' }} />
              )}
              
              {/* Rotating Quotes moved INSIDE Hero Card front — see below */}
              
              {/* ═══════════════════════════════════════════════════════════
                  HERO CARD (smaller) — HEOHO text, flips independently
                  Sits visually "on top" of the main card
                  Professional mode: chalk outline + cream/green colors
                  NOTE: Flip disabled in professional mode for V2 (preserved for Secret Access Door)
              ═══════════════════════════════════════════════════════════ */}
              <div
                className={`hero-flip ${heroFlipped || hofundAccessGranted ? 'flipped' : ''} ${isProfessionalTheme ? 'no-chalk-outline' : ''}`}
                data-xray-id="hero-card"
                onClick={(e) => { e.stopPropagation(); if (!hofundAccessGranted) setHeroFlipped(!heroFlipped); }}
              >
                <div className="hero-flip-inner" style={{ minHeight: 'auto', borderRadius: '1rem', overflow: 'visible', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', flexGrow: 1, border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                  {/* FRONT: Professional mode matches "Ideas are Free" layout exactly */}
                  {/* OR shows Helm item explanation when hovered from nav */}
                  <div className="hero-front" style={isProfessionalTheme ? { 
                    background: '#0a1628',  /* Same as page background */
                    padding: '1.5rem 2rem',  /* Compact padding */
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
                    ) : isProfessionalTheme && spotlightCard ? (
                      /* SPOTLIGHT CARD — Bottom button content replaces hero face */
                      <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSpotlightCard(null); }}
                          style={{
                            background: 'none', border: 'none', color: 'rgba(250,245,235,0.5)',
                            fontSize: '0.8rem', cursor: 'pointer', marginBottom: '1rem',
                            transition: 'color 0.2s', fontWeight: 600,
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.color = '#faf5eb'; }}
                          onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(250,245,235,0.5)'; }}
                        >
                          ← Back to Main
                        </button>
                        {spotlightCard === 'built' && (
                          <>
                            <h2 style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#faf5eb', marginBottom: '1.5rem' }}>
                              Built to Last
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                              <div style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>8</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(250,245,235,0.7)' }}>Patent Applications</div>
                              </div>
                              <div style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>1,754</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(250,245,235,0.7)' }}>Innovations</div>
                              </div>
                              <div style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>47</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(250,245,235,0.7)' }}>Creators Identified</div>
                              </div>
                            </div>
                            <p style={{ color: 'rgba(250,245,235,0.8)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                              Every system is documented, filed, and open for inspection. $116M in patent IP at the pessimist's floor — donated 80% to the cooperative.
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/patent-portfolio'); }}
                              style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              See the Patent Portfolio →
                            </button>
                          </>
                        )}
                        {spotlightCard === 'whats-in-it' && (
                          <>
                            <h2 style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#faf5eb', marginBottom: '1.5rem' }}>
                              What's In It For You?
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                              <div style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38a169', marginBottom: '0.25rem' }}>{'\u{1F6E0}\uFE0F'} Maker?</div>
                                <div style={{ color: 'rgba(250,245,235,0.8)', fontSize: '0.9rem' }}>Sell what you build. Keep 83.3% of every sale. No algorithms. No ad spend.</div>
                              </div>
                              <div style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38a169', marginBottom: '0.25rem' }}>{'\u{1F6D2}'} Shopper?</div>
                                <div style={{ color: 'rgba(250,245,235,0.8)', fontSize: '0.9rem' }}>Own the store you buy from. Cost+20% pricing. Every purchase funds something real.</div>
                              </div>
                              <div style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38a169', marginBottom: '0.25rem' }}>{'\u{1F331}'} Curious?</div>
                                <div style={{ color: 'rgba(250,245,235,0.8)', fontSize: '0.9rem' }}>$5/year. Explore everything. No risk. Cancel anytime.</div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/RedCarpet'); }}
                              style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Join for $5/year →
                            </button>
                          </>
                        )}
                        {spotlightCard === 'know-maker' && (
                          <>
                            <h2 style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#faf5eb', marginBottom: '1rem' }}>
                              Know a Maker?
                            </h2>
                            <p style={{ color: '#38a169', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                              Invite them. Earn 10 Marks.
                            </p>
                            <p style={{ color: 'rgba(250,245,235,0.8)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                              Six-tier referral rewards. Everyone gets something — forever. The first 100 members get Pioneer status and permanent founding badges.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                              <div style={{ background: 'rgba(56,161,105,0.1)', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ color: '#38a169', fontWeight: 700 }}>Pioneer</div>
                                <div style={{ color: 'rgba(250,245,235,0.6)', fontSize: '0.8rem' }}>First 100 · 10 Marks</div>
                              </div>
                              <div style={{ background: 'rgba(56,161,105,0.05)', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ color: 'rgba(250,245,235,0.7)', fontWeight: 700 }}>Ambassador</div>
                                <div style={{ color: 'rgba(250,245,235,0.5)', fontSize: '0.8rem' }}>50K+ · 1 Mark forever</div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/initiatives/brass-tacks'); }}
                              style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Learn About Referrals →
                            </button>
                          </>
                        )}
                        {spotlightCard && spotlightCard !== 'built' && spotlightCard !== 'whats-in-it' && spotlightCard !== 'know-maker' && activeSpotlight && (
                          <>
                            <h2 style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, color: '#faf5eb', marginBottom: '1rem' }}>
                              {activeSpotlight.title}
                            </h2>
                            {activeSpotlight.stats && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                {activeSpotlight.stats.map((s, i) => (
                                  <div key={i} style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color || '#38a169' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(250,245,235,0.7)' }}>{s.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p style={{ color: 'rgba(250,245,235,0.8)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                              {activeSpotlight.bodyPreview}
                            </p>
                            {activeSpotlight.ctaRoute && (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(activeSpotlight.ctaRoute!); }}
                                style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                {activeSpotlight.ctaLabel || 'Learn More'} →
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ) : isProfessionalTheme ? (
                      /* DEFAULT PROFESSIONAL CONTENT */
                      <>
                        {/* Rotating Quotes — inside Hero Card, flips with it */}
                        <div data-xray-id="rotating-quotes" style={{ marginBottom: '1rem', width: '100%', maxWidth: '500px', minHeight: '60px' }}>
                          <RotatingQuotes intervalMs={8000} />
                        </div>
                        {/* COOPERATIVE COMMERCE eyebrow — with No Ads / No V.C. flanking */}
                        <span className="cooperative-header" data-xray-id="cooperative-commerce-header" style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 'clamp(0.6rem, 2.5vw, 0.8rem)',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          marginBottom: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5em',
                          textAlign: 'center',
                          flexWrap: 'wrap',
                        }}>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setWatchDropdownOpen(false);
                              if (activeSlideshow === 'noads') {
                                setActiveSlideshow(null);
                                setHeroFlipped(false);
                                setFableIsPlaying(false);
                              } else {
                                setActiveSlideshow('noads');
                                setHeroFlipped(true);
                                setFableIsPlaying(false);
                              }
                            }}
                            style={{
                              color: activeSlideshow === 'noads' ? '#faf5eb' : 'rgba(250, 245, 235, 0.5)',
                              cursor: 'pointer',
                              transition: 'color 0.3s ease',
                              fontSize: 'clamp(0.55rem, 2vw, 0.7rem)',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = '#faf5eb'; }}
                            onMouseOut={(e) => { if (activeSlideshow !== 'noads') e.currentTarget.style.color = 'rgba(250, 245, 235, 0.5)'; }}
                          >No Ads</span>
                          <span style={{ color: 'rgba(250, 245, 235, 0.25)' }}>&middot;</span>
                          <span style={{ display: 'inline' }} className="coop-line"><span style={{ color: '#d69e2e' }}>COOPERATIVE</span></span>
                          <br className="mobile-break" style={{ display: 'none' }} />
                          <span style={{ display: 'inline' }} className="coop-line"><span style={{ color: '#d69e2e' }}> COMMERCE</span></span>
                          <span style={{ color: 'rgba(250, 245, 235, 0.25)' }}>&middot;</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setWatchDropdownOpen(false);
                              if (activeSlideshow === 'novc') {
                                setActiveSlideshow(null);
                                setHeroFlipped(false);
                                setFableIsPlaying(false);
                              } else {
                                setActiveSlideshow('novc');
                                setHeroFlipped(true);
                                setFableIsPlaying(false);
                              }
                            }}
                            style={{
                              color: activeSlideshow === 'novc' ? '#faf5eb' : 'rgba(250, 245, 235, 0.5)',
                              cursor: 'pointer',
                              transition: 'color 0.3s ease',
                              fontSize: 'clamp(0.55rem, 2vw, 0.7rem)',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = '#faf5eb'; }}
                            onMouseOut={(e) => { if (activeSlideshow !== 'novc') e.currentTarget.style.color = 'rgba(250, 245, 235, 0.5)'; }}
                          >No V.C.</span>
                        </span>
                        {/* "Ideas are Free" style - large serif text - CLICKABLE to philosophy page */}
                        <h2 
                          style={{ 
                            fontFamily: "'Crimson Pro', Georgia, serif",
                            fontSize: 'clamp(1.5rem, 6.4vw, 4.4rem)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                          }}
                        >
                          {/* Line 1: "Help Each Other" - white like "Ideas are Free" */}
                          <span style={{ color: '#faf5eb', display: 'block' }} data-xray-id="heoho-headline">Help Each Other</span>
                          {/* Line 2: "Help Ourselves" - green. The "O" is Durin's Door keyhole */}
                          <span style={{ color: '#38a169', display: 'block' }}>Help <span
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setHofundCodeEntry(true); setHofundWrongCodeMessage(false); setHofundCode(''); }}
                            style={{ cursor: 'pointer', position: 'relative', display: 'inline', transition: 'color 0.3s ease, filter 0.3s ease', color: 'inherit' }}
                            onMouseOver={(e) => {
                              const el = e.currentTarget;
                              el.style.color = '#d69e2e';
                              el.style.filter = 'drop-shadow(0 0 8px rgba(214, 158, 46, 0.7))';
                              const bg = el.querySelector('.keyhole-bg');
                              if (bg) bg.setAttribute('fill', '#d69e2e');
                              const outline = el.querySelector('.keyhole-outline');
                              if (outline) outline.setAttribute('stroke', '#0a1628');
                              const fills = el.querySelectorAll('.keyhole-fill');
                              fills.forEach(f => f.setAttribute('fill', '#0a1628'));
                            }}
                            onMouseOut={(e) => {
                              const el = e.currentTarget;
                              el.style.color = 'inherit';
                              el.style.filter = 'none';
                              const bg = el.querySelector('.keyhole-bg');
                              if (bg) bg.setAttribute('fill', '#0a1628');
                              const outline = el.querySelector('.keyhole-outline');
                              if (outline) outline.setAttribute('stroke', '#0a1628');
                              const fills = el.querySelectorAll('.keyhole-fill');
                              fills.forEach(f => f.setAttribute('fill', '#8b7355'));
                            }}
                            title="Speak friend and enter"
                            role="button"
                            aria-label="Hidden keyhole in the O of Ourselves. Click to open Mirror Mirror — accessibility options including language translation, text sizing, high contrast, and dyslexia-friendly font. Keyboard: press Enter to activate."
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setHofundCodeEntry(true); setHofundWrongCodeMessage(false); setHofundCode(''); }}}
                          ><span style={{ position: 'relative', display: 'inline-block', isolation: 'isolate', WebkitTextStroke: '2px #0a1628', paintOrder: 'stroke fill' }}>O<svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}><ellipse cx="50" cy="50" rx="36" ry="38" fill="#0a1628" className="keyhole-bg" style={{ transition: 'fill 0.3s ease' }}/><circle cx="50.5" cy="50" r="8" fill="#8b7355" className="keyhole-fill" style={{ transition: 'fill 0.3s ease' }}/><polygon points="46.75,55 41.5,73 59.5,73 54.25,55" fill="#8b7355" className="keyhole-fill" style={{ transition: 'fill 0.3s ease' }}/></svg></span></span>urselves.</span>
                        </h2>
                        <p style={{ 
                          fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)',
                          color: '#faf5eb',
                          maxWidth: '500px',
                          margin: '0 auto',
                          lineHeight: 1.7,
                          textAlign: 'center',
                          fontWeight: 600
                        }}>
                          Own your Work. Member-Governed.
                        </p>
                        <p style={{ 
                          fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
                          color: '#faf5eb',
                          maxWidth: '500px',
                          margin: '0.75rem auto 0',
                          lineHeight: 1.7,
                          textAlign: 'center'
                        }}>
                          <span style={{ display: 'block' }}>Your ideas/services/products</span>
                          <span style={{ display: 'block' }}>Preorder-Funded &amp; Made by Members</span>
                        </p>
                        <p style={{ 
                          fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
                          color: '#38a169',
                          maxWidth: '500px',
                          margin: '0.75rem auto 1.5rem',
                          lineHeight: 1.7,
                          textAlign: 'center',
                          fontWeight: 600
                        }}>
                          The 20% margin funds 16 charitable initiatives for Everyone.
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
                    {/* Hand icon removed — keyhole in "O" is the Durin's Door entry now */}
                    
                    {/* Durin's Door Keyhole Popup — "Speak Friend in Your Language" */}
                    {hofundCodeEntry && !hofundAccessGranted && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === 'Escape') { setHofundCodeEntry(false); setHofundCode(''); } }}
                        style={{
                          position: 'absolute',
                          bottom: '60px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(20, 18, 30, 0.98)',
                          border: '1px solid rgba(139, 92, 246, 0.5)',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          zIndex: 100,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                          minWidth: hofundWrongCodeMessage ? '320px' : '220px',
                          maxWidth: '360px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {hofundWrongCodeMessage ? (
                          /* Wrong Code Explanation + Foundation Quiz */
                          <>
                            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0, color: '#faf5eb' }}>
                              <strong style={{ color: '#f59e0b' }}>Keys are assigned for special purposes.</strong>
                            </p>
                            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, margin: '0.5rem 0', color: 'rgba(250,245,235,0.8)' }}>
                              Many time-specific Codes can be found within Cephas documents. Like the story of John Aaron — 
                              the engineer who saved Apollo 12 because he was always curious about things outside his immediate concerns.
                            </p>
                            <a 
                              href="https://cephas.lianabanyan.com/articles/sce-to-aux-apollo-12/"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.8rem',
                                color: '#8b5cf6',
                                textDecoration: 'underline',
                                marginBottom: '0.75rem',
                                display: 'block'
                              }}
                            >
                              Read: SCE-to-AUX — The Call That Saved Apollo 12 →
                            </a>
                            
                            {/* Foundation Document Quiz */}
                            <div style={{
                              background: 'rgba(56, 161, 105, 0.15)',
                              border: '1px solid rgba(56, 161, 105, 0.3)',
                              borderRadius: '0.5rem',
                              padding: '0.75rem',
                              marginBottom: '0.75rem'
                            }}>
                              <p style={{ 
                                fontSize: '0.75rem', 
                                fontStyle: 'italic', 
                                color: 'rgba(250,245,235,0.9)', 
                                margin: '0 0 0.5rem 0',
                                lineHeight: 1.5
                              }}>
                                {foundationQuizzes[foundationQuizIndex].passage}
                              </p>
                              <p style={{ 
                                fontSize: '0.65rem', 
                                color: 'rgba(250,245,235,0.5)', 
                                margin: '0 0 0.5rem 0'
                              }}>
                                — {foundationQuizzes[foundationQuizIndex].source}
                              </p>
                              <p style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                color: '#38a169', 
                                margin: '0.5rem 0'
                              }}>
                                {foundationQuizzes[foundationQuizIndex].question}
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {foundationQuizzes[foundationQuizIndex].options.map((opt, i) => (
                                  <button
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (opt.correct && opt.route) {
                                        setHofundCodeEntry(false);
                                        setHofundWrongCodeMessage(false);
                                        setHofundCode('');
                                        navigate(opt.route);
                                      } else if (!opt.correct) {
                                        // Wrong answer - just cycle to next question
                                        setFoundationQuizIndex((prev) => (prev + 1) % foundationQuizzes.length);
                                      }
                                    }}
                                    style={{
                                      background: 'rgba(255,255,255,0.08)',
                                      border: '1px solid rgba(255,255,255,0.15)',
                                      borderRadius: '0.35rem',
                                      padding: '0.4rem 0.6rem',
                                      color: '#faf5eb',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 161, 105, 0.3)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                  >
                                    {opt.text}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFoundationQuizIndex((prev) => (prev + 1) % foundationQuizzes.length);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'rgba(250,245,235,0.5)',
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  marginTop: '0.5rem',
                                  textDecoration: 'underline'
                                }}
                              >
                                🔄 Different question
                              </button>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                value={hofundCode}
                                onChange={(e) => setHofundCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const code = hofundCode.trim();
                                    if (validHofundCodes.includes(code)) {
                                      setHofundAccessGranted(true);
                                      setHofundCodeEntry(false);
                                      setHofundWrongCodeMessage(false);
                                      setHeroFlipped(true);
                                    } else if (specialCodes[code]) {
                                      specialCodes[code].action();
                                      setHofundCodeEntry(false);
                                      setHofundWrongCodeMessage(false);
                                      setHofundCode('');
                                    } else {
                                      setHofundCode('');
                                    }
                                  } else if (e.key === 'Escape') {
                                    setHofundCodeEntry(false);
                                    setHofundWrongCodeMessage(false);
                                    setHofundCode('');
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                  borderRadius: '0.5rem',
                                  padding: '0.5rem 0.75rem',
                                  color: '#faf5eb',
                                  fontSize: '0.9rem',
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.1em',
                                  outline: 'none',
                                }}
                                placeholder="TRY AGAIN"
                              />
                              <button
                                onClick={() => { setHofundCodeEntry(false); setHofundWrongCodeMessage(false); setHofundCode(''); }}
                                style={{
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '0.5rem',
                                  padding: '0.5rem 0.75rem',
                                  color: 'rgba(255,255,255,0.6)',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Close
                              </button>
                            </div>
                          </>
                        ) : (
                          /* Speak Friend and Enter */
                          <>
                            <label style={{ fontSize: '0.7rem', opacity: 0.7, letterSpacing: '0.05em', textAlign: 'center', color: '#faf5eb' }}>
                              Speak "Friend" in Your Language
                            </label>
                            <input
                              type="text"
                              value={hofundCode}
                              onChange={(e) => setHofundCode(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const word = hofundCode.trim().toLowerCase();
                                  const friendTranslations: Record<string, string> = {
                                    'friend': 'English', 'amigo': 'Español', 'ami': 'Français', 'freund': 'Deutsch',
                                    '朋友': '中文', '友達': '日本語', 'tomodachi': '日本語', 'amico': 'Italiano',
                                    'друг': 'Русский', '친구': '한국어', 'chingu': '한국어', 'rafiki': 'Kiswahili',
                                    'vinur': 'Íslenska', 'vriend': 'Nederlands', 'przyjaciel': 'Polski',
                                    'arkadas': 'Türkçe', 'mellon': 'Sindarin (Elvish)', 'amiko': 'Esperanto',
                                    'amicus': 'Latin', 'dost': 'हिंदी', 'ban': 'Tiếng Việt', 'kawan': 'Bahasa',
                                    'kaibigan': 'Filipino', 'chaver': 'עברית', 'doost': 'فارسی',
                                    'jup': 'Klingon', 'vod': "Mando'a", 'raqiros': 'High Valyrian',
                                  };
                                  const lang = friendTranslations[word];
                                  if (lang) {
                                    setHofundCodeEntry(false);
                                    setHofundCode('');
                                    setHoveredHelmItem('/durins-door');
                                  } else {
                                    setHofundWrongCodeMessage(true);
                                    setHofundCode('');
                                  }
                                } else if (e.key === 'Escape') {
                                  setHofundCodeEntry(false);
                                  setHofundCode('');
                                }
                              }}
                              autoFocus
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                color: '#faf5eb',
                                fontSize: '0.95rem',
                                outline: 'none',
                                textAlign: 'center',
                              }}
                              placeholder="friend, ami, 朋友, mellon..."
                            />
                            <button
                              onClick={() => { setHofundCodeEntry(false); setHofundCode(''); }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                textAlign: 'center',
                                padding: '0.25rem 0 0 0'
                              }}
                            >
                              [ESC to close]
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BACK: Two columns - GET & GIVE - with expandable topics */}
                  {/* OR: HOFUND SubSystem when access granted via secret code */}
                  <div className="hero-back" style={isProfessionalTheme ? { 
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    background: '#ffffff',
                    overflow: 'hidden',
                    minHeight: 'auto',
                    borderRadius: '1rem',
                    width: '100%',
                    flex: 1,
                    flexGrow: 1,
                    boxShadow: 'none',
                    border: 'none'
                  } : undefined}>
                    {isProfessionalTheme ? (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', height: '100%' }}>
                        {/* Close button — always visible top right */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setFableIsPlaying(false); setActiveSlideshow(null); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-slate-600 hover:text-white flex items-center justify-center transition-colors z-20"
                          style={{ border: 'none', cursor: 'pointer' }}
                          title="Close"
                        >
                          ×
                        </button>

                        {/* FABLE VIEW — default when WATCH is clicked or 'fable' pill selected */}
                        {(!activeSlideshow || activeSlideshow === 'fable') && (
                          fableFrame === 31 ? (
                            /* END CARD — "Where To Go From Here" */
                            <div data-dark-theme style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a1628 0%, #1a2332 100%)', padding: '1.5rem', gap: '1rem' }}>
                              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#faf5eb', fontFamily: "'Source Sans 3', system-ui, sans-serif", margin: 0 }}>Where To Go From Here</p>
                              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <button onClick={(e) => { e.stopPropagation(); setFableFrame(1); setFableIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>🔄 Watch Again</button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveSlideshow('origin'); setOriginFrame(0); setOriginIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>🌱 Origin Story</button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveSlideshow('lemonade'); setLemonadeFrame(0); setLemonadeIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>🍋 Lemonade Stand</button>
                                <button onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setActiveSlideshow(null); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>✖ Close</button>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setFableFrame(30); }} style={{ background: 'none', border: 'none', color: 'rgba(250,245,235,0.5)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.25rem' }}>← Back</button>
                            </div>
                          ) : (
                          <div data-dark-theme onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setFableIsPlaying(false); setActiveSlideshow(null); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%', cursor: 'pointer', background: '#0a1628' }}>
                            {/* Controls above image */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '0.5rem 1rem 0.25rem' }} onClick={(e) => e.stopPropagation()}>
                              <button onClick={(e) => { e.stopPropagation(); setFableFrame(prev => Math.max(1, prev - 1)); setFableIsPlaying(false); }} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#faf5eb', padding: '0.25rem', borderRadius: '50%' }}><ChevronLeft className="w-7 h-7 opacity-70 hover:opacity-100" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setFableIsPlaying(!fableIsPlaying); }} style={{ border: '1px solid rgba(250,245,235,0.2)', cursor: 'pointer', background: 'transparent', color: '#faf5eb', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fableIsPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />}</button>
                              <button onClick={(e) => { e.stopPropagation(); setFableFrame(prev => Math.min(31, prev + 1)); setFableIsPlaying(false); }} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#faf5eb', padding: '0.25rem', borderRadius: '50%' }}><ChevronRight className="w-7 h-7 opacity-70 hover:opacity-100" /></button>
                            </div>
                            {/* Clean image */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <img src={`/images/fable/${fableFrame}.png`} alt={`Fable Frame ${fableFrame}`} style={{ maxWidth: '90%', maxHeight: '85%', objectFit: 'contain' }} />
                            </div>
                            {FABLE_SUBTITLES[fableFrame] && (
                              <div style={{ textAlign: 'center', padding: '0.25rem 1rem 0.5rem' }}>
                                <p style={{ background: 'rgba(255, 255, 255, 0.85)', color: '#0a1628', padding: '0.5rem 1rem', borderRadius: '0.35rem', fontSize: 'clamp(0.75rem, 1.6vw, 0.9rem)', fontFamily: "'Source Sans 3', system-ui, sans-serif", maxWidth: '95%', margin: '0 auto', lineHeight: 1.4, fontWeight: 500, whiteSpace: 'pre-line' }}>
                                  {FABLE_SUBTITLES[fableFrame]}
                                </p>
                              </div>
                            )}
                          </div>
                          )
                        )}

                        {/* ORIGIN STORY VIEW — same pattern as Fable */}
                        {activeSlideshow === 'origin' && (
                          originFrame === ORIGIN_SCENES.length - 1 ? (
                            /* END CARD — Origin Story */
                            <div data-dark-theme style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a1628 0%, #1a2332 100%)', padding: '1.5rem', gap: '1rem' }}>
                              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#faf5eb', fontFamily: "'Source Sans 3', system-ui, sans-serif", margin: 0 }}>Where To Go From Here</p>
                              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <button onClick={(e) => { e.stopPropagation(); setOriginFrame(0); setOriginIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>🔄 Watch Again</button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveSlideshow('fable'); setFableFrame(1); setFableIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>📖 The Fable</button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveSlideshow('lemonade'); setLemonadeFrame(0); setLemonadeIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>🍋 Lemonade Stand</button>
                                <button onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setActiveSlideshow(null); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>✖ Close</button>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setOriginFrame(ORIGIN_SCENES.length - 2); }} style={{ background: 'none', border: 'none', color: 'rgba(250,245,235,0.5)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.25rem' }}>← Back</button>
                            </div>
                          ) : (
                          <div onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setOriginIsPlaying(false); setActiveSlideshow(null); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%', cursor: 'pointer', background: '#f5f0e8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '0.5rem 1rem 0.25rem' }} onClick={(e) => e.stopPropagation()}>
                              <button onClick={(e) => { e.stopPropagation(); setOriginFrame(prev => Math.max(0, prev - 1)); setOriginIsPlaying(false); }} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#333', padding: '0.25rem', borderRadius: '50%' }}><ChevronLeft className="w-7 h-7 opacity-70 hover:opacity-100" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setOriginIsPlaying(!originIsPlaying); }} style={{ border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', background: 'transparent', color: '#333', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{originIsPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />}</button>
                              <button onClick={(e) => { e.stopPropagation(); setOriginFrame(prev => Math.min(ORIGIN_SCENES.length - 1, prev + 1)); setOriginIsPlaying(false); }} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#333', padding: '0.25rem', borderRadius: '50%' }}><ChevronRight className="w-7 h-7 opacity-70 hover:opacity-100" /></button>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <img src={`/origin-story/${ORIGIN_SCENES[originFrame].img}`} alt={`Origin Story ${originFrame + 1}`} style={{ maxWidth: '90%', maxHeight: '85%', objectFit: 'contain' }} />
                            </div>
                            {ORIGIN_SCENES[originFrame].caption && (
                              <div style={{ textAlign: 'center', padding: '0.25rem 1rem 0.5rem' }}>
                                <p style={{ background: 'rgba(255, 255, 255, 0.85)', color: '#0a1628', padding: '0.5rem 1rem', borderRadius: '0.35rem', fontSize: 'clamp(0.75rem, 1.6vw, 0.9rem)', fontFamily: "'Source Sans 3', system-ui, sans-serif", maxWidth: '95%', margin: '0 auto', lineHeight: 1.4, fontWeight: 500, whiteSpace: 'pre-line' }}>
                                  {ORIGIN_SCENES[originFrame].caption}
                                </p>
                              </div>
                            )}
                          </div>
                          )
                        )}

                        {/* LEMONADE STAND VIEW — same pattern as Fable (emoji placeholders until drawings arrive) */}
                        {activeSlideshow === 'lemonade' && (
                          lemonadeFrame === LEMONADE_SCENES.length - 1 ? (
                            /* END CARD — Lemonade Stand */
                            <div data-dark-theme style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a1628 0%, #1a2332 100%)', padding: '1.5rem', gap: '1rem' }}>
                              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#faf5eb', fontFamily: "'Source Sans 3', system-ui, sans-serif", margin: 0 }}>Where To Go From Here</p>
                              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <button onClick={(e) => { e.stopPropagation(); setLemonadeFrame(0); setLemonadeIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>🔄 Watch Again</button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveSlideshow('fable'); setFableFrame(1); setFableIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>📖 The Fable</button>
                                <button onClick={(e) => { e.stopPropagation(); setActiveSlideshow('origin'); setOriginFrame(0); setOriginIsPlaying(true); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>🌱 Origin Story</button>
                                <button onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setActiveSlideshow(null); }} style={{ padding: '0.5rem 1.25rem', background: 'rgba(250,245,235,0.15)', border: '1px solid rgba(250,245,235,0.3)', borderRadius: '0.5rem', color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>✖ Close</button>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setLemonadeFrame(LEMONADE_SCENES.length - 2); }} style={{ background: 'none', border: 'none', color: 'rgba(250,245,235,0.5)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.25rem' }}>← Back</button>
                            </div>
                          ) : (
                          <div onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setLemonadeIsPlaying(false); setActiveSlideshow(null); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%', cursor: 'pointer', background: '#fff8e7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '0.5rem 1rem 0.25rem' }} onClick={(e) => e.stopPropagation()}>
                              <button onClick={(e) => { e.stopPropagation(); setLemonadeFrame(prev => Math.max(0, prev - 1)); setLemonadeIsPlaying(false); }} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#333', padding: '0.25rem', borderRadius: '50%' }}><ChevronLeft className="w-7 h-7 opacity-70 hover:opacity-100" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setLemonadeIsPlaying(!lemonadeIsPlaying); }} style={{ border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', background: 'transparent', color: '#333', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{lemonadeIsPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />}</button>
                              <button onClick={(e) => { e.stopPropagation(); setLemonadeFrame(prev => Math.min(LEMONADE_SCENES.length - 1, prev + 1)); setLemonadeIsPlaying(false); }} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#333', padding: '0.25rem', borderRadius: '50%' }}><ChevronRight className="w-7 h-7 opacity-70 hover:opacity-100" /></button>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              <img
                                src={`/images/Lemonade Stand/goat (${lemonadeFrame + 1}).png`}
                                alt={`Lemonade Stand scene ${lemonadeFrame + 1}`}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                            </div>
                            {LEMONADE_SCENES[lemonadeFrame].caption && (
                              <div style={{ textAlign: 'center', padding: '0.25rem 1rem 0.5rem' }}>
                                <p style={{ background: 'rgba(255, 255, 255, 0.85)', color: '#0a1628', padding: '0.5rem 1rem', borderRadius: '0.35rem', fontSize: 'clamp(0.75rem, 1.6vw, 0.9rem)', fontFamily: "'Source Sans 3', system-ui, sans-serif", maxWidth: '95%', margin: '0 auto', lineHeight: 1.4, fontWeight: 500, whiteSpace: 'pre-line' }}>
                                  {LEMONADE_SCENES[lemonadeFrame].caption}
                                </p>
                              </div>
                            )}
                          </div>
                          )
                        )}

                        {/* WHY NO ADS — inline summary — click anywhere to flip back */}
                        {activeSlideshow === 'noads' && (
                          <div data-dark-theme onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setActiveSlideshow(null); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem 1.75rem', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', cursor: 'pointer', justifyContent: 'center' }}>
                            <h3 style={{ color: '#faf5eb', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: "'Source Sans 3', system-ui, sans-serif", textAlign: 'center' }}>
                              🚫 Why No Outside Advertising?
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderRadius: '0.5rem', padding: '0.6rem 1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <p style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>The Ad-Funded Trap</p>
                                <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.45 }}>Ad-funded platforms sell your attention. They optimize for addiction, not help.</p>
                              </div>
                              <div style={{ background: 'rgba(34, 197, 94, 0.15)', borderRadius: '0.5rem', padding: '0.6rem 1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                <p style={{ color: '#86efac', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>Our Engine Instead</p>
                                <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.45 }}><strong style={{ color: '#fb923c' }}>The Furnace</strong> verifies Cue Cards → <strong style={{ color: '#fbbf24' }}>$5/yr Deck</strong> arms members → <strong style={{ color: '#4ade80' }}>The Cue Card Drop</strong> seeds 10 locations.</p>
                              </div>
                              <div style={{ background: 'rgba(139, 92, 246, 0.15)', borderRadius: '0.5rem', padding: '0.6rem 1rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                <p style={{ color: '#c4b5fd', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>What It Means For You</p>
                                <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.45 }}>No creepy targeting. Earn 25 Marks per referral. Every ad dollar goes to members instead.</p>
                              </div>
                            </div>
                            <a
                              href="/faq#no-ads"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: "'Source Sans 3', system-ui, sans-serif", alignSelf: 'center', transition: 'background 0.2s', textDecoration: 'none', display: 'inline-block' }}
                              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#b91c1c'; }}
                              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = '#dc2626'; }}
                            >
                              Read Full Explanation →
                            </a>
                          </div>
                        )}

                        {/* WHY NO V.C. — inline summary — click anywhere to flip back */}
                        {activeSlideshow === 'novc' && (
                          <div data-dark-theme onClick={(e) => { e.stopPropagation(); setHeroFlipped(false); setActiveSlideshow(null); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem 1.75rem', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', cursor: 'pointer', justifyContent: 'center' }}>
                            <h3 style={{ color: '#faf5eb', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: "'Source Sans 3', system-ui, sans-serif", textAlign: 'center' }}>
                              🛡️ Why No V.C.?
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderRadius: '0.5rem', padding: '0.6rem 1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <p style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>V.C. Money Comes With Strings</p>
                                <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.45 }}>10x return demands force unsustainable growth. Exit pressure = selling you in 5-7 years. Each round dilutes everyone.</p>
                              </div>
                              <div style={{ background: 'rgba(34, 197, 94, 0.15)', borderRadius: '0.5rem', padding: '0.6rem 1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                <p style={{ color: '#86efac', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>Patent-Backed Bootstrap</p>
                                <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.45 }}><strong style={{ color: '#fbbf24' }}>8 provisionals, 1,754 innovations</strong>. Started with $1K. No burn rate. We own 100% — forever. And WE means You're <a href="https://cephas.lianabanyan.com/articles/one-of-us-building-trust-through-shared-economics/" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#fbbf24', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}>ONE OF US</a>.</p>
                              </div>
                              <div style={{ background: 'rgba(139, 92, 246, 0.15)', borderRadius: '0.5rem', padding: '0.6rem 1rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                <p style={{ color: '#c4b5fd', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>The Math</p>
                                <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.45 }}>VC at $500M, we'd own ~$25M. Organic at $250M, we own <strong style={{ color: '#4ade80' }}>all of it</strong>. Your early contribution = permanent credit.</p>
                              </div>
                            </div>
                            <a
                              href="/faq#no-vc"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: "'Source Sans 3', system-ui, sans-serif", alignSelf: 'center', transition: 'background 0.2s', textDecoration: 'none', display: 'inline-block' }}
                              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#6d28d9'; }}
                              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = '#7c3aed'; }}
                            >
                              Read Full Explanation →
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', background: '#0a1628' }}>
                        {/* Non-professional theme back content */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* END HERO CARD */}
              {/* ENTER + WATCH buttons + No Ads / No VC pills */}
              <div data-xray-id="enter-watch-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/portal'); }}
                  style={{
                    cursor: 'pointer',
                    padding: '0.875rem 2.5rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: "'Source Sans 3', system-ui, sans-serif",
                    color: '#faf5eb',
                    background: '#38a169',
                    border: '2px solid #38a169',
                    borderRadius: '0.5rem',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.1em',
                    minWidth: '180px',
                    textAlign: 'center' as const
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#faf5eb';
                    e.currentTarget.style.color = '#0a1628';
                    e.currentTarget.style.borderColor = '#faf5eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#38a169';
                    e.currentTarget.style.color = '#faf5eb';
                    e.currentTarget.style.borderColor = '#38a169';
                  }}
                >
                  ENTER
                </button>

                {/* WATCH dropdown button */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setWatchDropdownOpen(!watchDropdownOpen); }}
                    style={{
                      cursor: 'pointer',
                      padding: '0.875rem 2.5rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: "'Source Sans 3', system-ui, sans-serif",
                      color: '#faf5eb',
                      background: 'transparent',
                      border: '2px solid rgba(250, 245, 235, 0.4)',
                      borderRadius: '0.5rem',
                      transition: 'all 0.3s ease',
                      letterSpacing: '0.1em',
                      minWidth: '180px',
                      textAlign: 'center' as const
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#faf5eb';
                      e.currentTarget.style.background = 'rgba(250, 245, 235, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      if (!watchDropdownOpen) {
                        e.currentTarget.style.borderColor = 'rgba(250, 245, 235, 0.4)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    WATCH ▾
                  </button>

                  {/* Dropdown menu */}
                  {watchDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 0.5rem)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1a2332',
                        border: '1px solid rgba(250, 245, 235, 0.2)',
                        borderRadius: '0.75rem',
                        padding: '0.5rem',
                        minWidth: '200px',
                        zIndex: 100,
                        boxShadow: '0 -10px 30px rgba(0,0,0,0.4)',
                      }}
                    >
                      {[
                        { id: 'origin', label: '🌱 Origin Story' },
                        { id: 'fable', label: '📖 The Fable' },
                        { id: 'lemonade', label: '🍋 Lemonade Stand' },
                        { id: 'office', label: '🎬 Founder\'s Office' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setWatchDropdownOpen(false);
                            if (item.id === 'office') {
                              window.open('https://youtube.com/@lianabanyan', '_blank', 'noopener,noreferrer');
                            } else {
                              setActiveSlideshow(item.id);
                              setHeroFlipped(true);
                              if (item.id === 'fable') {
                                setFableFrame(1);
                                setFableIsPlaying(true);
                              } else if (item.id === 'origin') {
                                setOriginFrame(0);
                                setOriginIsPlaying(true);
                                setFableIsPlaying(false);
                              } else if (item.id === 'lemonade') {
                                setLemonadeFrame(0);
                                setLemonadeIsPlaying(true);
                                setFableIsPlaying(false);
                              } else {
                                setFableIsPlaying(false);
                              }
                            }
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.65rem 1rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            fontFamily: "'Source Sans 3', system-ui, sans-serif",
                            color: activeSlideshow === item.id ? '#d69e2e' : '#faf5eb',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.2s',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(250, 245, 235, 0.1)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* No Ads / No VC pills moved up to COOPERATIVE COMMERCE eyebrow line */}
              
              {/* Hand icon removed — Main Card is static frame, no flip */}
            </div>

            {/* BACK: How Liana Banyan Works - with expandable topics in SINGLE COLUMN */}
            <div className="main-card-back" onClick={() => { if (!mainBackExpanded) setMainCardFlipped(false); }} style={{ 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              overflow: 'auto'
            }}>
              {/* Expanded Topic View - NO CHEVRONS, click anywhere to go back */}
              {mainBackExpanded ? (
                <div 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  onClick={(e) => { e.stopPropagation(); setMainBackExpanded(null); setMainInitiativeExpanded(null); }}
                >
                  {/* Back button at top - styled like "How Liana Banyan Works" buttons */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMainBackExpanded(null); setMainInitiativeExpanded(null); }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(88, 60, 180, 0.6)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(88, 60, 180, 0.4)'; }}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'rgba(88, 60, 180, 0.4)',
                      border: 'none',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1.25rem',
                      color: '#faf5eb',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      transition: 'all 0.2s ease',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}
                  >
                    ← Back
                  </button>
                  
                  {/* Content Area - scrollable */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto' }}>
                  {mainBackExpanded === 'costplus' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0, textAlign: 'center' }}>🛒 Cost + 20%</h4>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        Every product and service on our platform is priced at <strong>Cost + 20%</strong>. We buy, From You & For You, 
                        in advance at wholesale prices from your preorders, and add exactly 20% — no hidden markups, no middlemen fees.
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        The 20% margin funds platform operations and charitable initiatives.
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        <strong>Volume makes it work</strong> — 20% of 10,000 (= 2,000) is a lot more than 80% of 1,000 (= 800). 
                        Especially when your costs are now 50% lower.
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        <strong>For everything except Payroll.</strong> We prepay PER JOB / ORDER CONTRACT 50% down, 50% upon completion; 
                        funded by 100% prefunded preorders. In Public.
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        When larger preorder volume tiers are reached resulting in lower prices — the savings are automatically passed to you, 
                        and the difference in what you preorder paid is returned as platform credits to purchase more.
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic', color: '#38a169' }}>
                        You either get a good deal, or a better one.
                      </p>
                      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                        <a 
                          href="https://cephas.lianabanyan.com/under-the-hood/cost-plus-twenty/"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(56, 161, 105, 0.2)',
                            border: '1px solid rgba(56, 161, 105, 0.4)',
                            borderRadius: '0.5rem',
                            color: '#38a169',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          📊 See the Full Explanation →
                        </a>
                      </div>
                    </>
                  )}
                  {mainBackExpanded === 'wholesale' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>📦 Wholesale Everything</h4>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        We negotiate <strong>manufacturer and distributor pricing</strong> on everything from groceries to medications to consumer goods.
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        Then we add exactly 20%. That's it. No additional markups, no hidden fees, no "convenience charges."
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        Our accounting is <strong>Transparent</strong> with Bank Account and Ledger Tickers for Every Transaction. 
                        What it was for, where it came from, where it went, when, and by whom — but only for Corporate. 
                        <em> Your Business is YOUR Business.</em>
                      </p>
                    </>
                  )}
                  {mainBackExpanded === 'permanent' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>🔒 Permanent 20% Cap</h4>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        The 20% margin is <strong>hardcoded into our bylaws</strong>. It cannot be increased by management, 
                        investors, or even a majority vote.
                      </p>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        Why? Because we've seen what happens when platforms grow: fees creep up, terms change, 
                        and creators, workers, and users get squeezed. We've built protection against that into our foundation.
                      </p>
                      <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '1.25rem', borderRadius: '1rem', marginTop: 'auto' }}>
                        <strong style={{ fontSize: '1rem' }}>⚠️ The Lock:</strong>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
                          Changing this would require unanimous board approval + 75% member vote + 
                          a 2-year waiting period. Designed to be nearly impossible.
                        </p>
                      </div>
                    </>
                  )}
                  {mainBackExpanded === 'memberowned' && (
                    <>
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>🤝 Member-Owned Cooperative</h4>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        For <strong>$5/year</strong>, you become a member-participant with real membership rights:
                      </p>
                      <ul style={{ fontSize: '1rem', lineHeight: 1.8, margin: 0, paddingLeft: '1.5rem' }}>
                        <li><strong>Vote</strong> on platform decisions and elect representatives</li>
                        <li><strong>Propose</strong> new features, initiatives, and policy changes</li>
                        <li><strong>Share</strong> in platform success through earning platform credits</li>
                        <li><strong>Access</strong> wholesale pricing on everything</li>
                      </ul>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, marginTop: 'auto' }}>
                        This isn't a subscription — it's membership participation. The people most affected by decisions help make them.
                      </p>
                    </>
                  )}
                  {mainBackExpanded === 'initiatives' && (() => {
                    const initiativesList = [
                      { key: 'lets-make-dinner', emoji: '🍽️', name: "Let's Make Dinner", desc: "Neighbors Paid to Feed Neighbors" },
                      { key: 'lets-get-groceries', emoji: '🛒', name: "Let's Get Groceries", desc: "Volume Discount Grocery Runs & Delivery" },
                      { key: 'lets-go-shopping', emoji: '🛍️', name: "Let's Go Shopping", desc: "Volume Discount Product Purchases & Holiday Specials" },
                      { key: 'household-concierge', emoji: '🏠', name: 'Household Concierge', desc: "Home Services by Vetted Members" },
                      { key: 'family-table', emoji: '👨‍👩‍👧‍👦', name: 'Family Table', desc: "Meal Planning, Shared Schedules, Connected Portfolios" },
                      { key: 'tatiana-schlossburg-health-accords', emoji: '💊', name: 'Tatiana Schlossburg Health Accords', desc: "Cost+20% Prescriptions & Supplies" },
                      { key: 'msa', emoji: '🏥', name: 'MSA', desc: "Member Savings Accounts for Healthcare" },
                      { key: 'defense-klaus', emoji: '🛡️', name: 'Defense Klaus', desc: "Personal Protection & Pooled Legal Defense Fund" },
                      { key: 'rally-group', emoji: '📢', name: 'Rally Group', desc: "Crisis Response & Community Mobilization" },
                      { key: 'vsl', emoji: '💳', name: 'VSL', desc: "Voucher No-Collateral 0-5% Short Loans Member to Member" },
                      { key: 'bread', emoji: '🍞', name: "Let's Make Bread", desc: "$5 Business Simulator to Real Life Business Incubator" },
                      { key: 'harper-guild', emoji: '⚖️', name: 'Harper Guild', desc: "HR & Ethics Support for Small Businesses" },
                      { key: 'jukebox', emoji: '🎵', name: 'JukeBox', desc: "Cooperative Music Licensing for Artist-Controlled Royalties" },
                      { key: 'didasko', emoji: '🎓', name: 'Didasko', desc: "College of Hard Knocks: Skills, Tutoring, Mentoring" },
                      { key: 'brass-tacks', emoji: '🔩', name: 'Brass Tacks', desc: "Manufacturing, Tooling, Makers, Mechanics, Physical Products" },
                      { key: 'power-to-the-people', emoji: '⚡', name: 'Power to the People', desc: "Citizen Advocacy, Congressional Tracking, Cooperative Energy", hasSwitzerlandLink: true }
                    ];
                    
                    return (
                    <div 
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h4 style={{ color: '#38a169', fontSize: '1.5rem', margin: 0 }}>🌿 16 Charitable Initiatives</h4>
                      <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        Our 20% margin doesn't go to extraction — it funds <strong>infrastructure for everyone</strong>:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {initiativesList.map((init) => {
                          const route = '/initiatives/' + init.key;
                          const locked = isRouteLocked(route);
                          return (
                          <button
                            key={init.key}
                            onClick={(e) => { e.stopPropagation(); levelGatedNavigate(route); }}
                            onMouseOver={(e) => { if (!locked) e.currentTarget.style.background = '#38a169'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = locked ? 'rgba(60, 60, 80, 0.4)' : 'rgba(88, 60, 180, 0.4)'; }}
                            style={{
                              background: locked ? 'rgba(60, 60, 80, 0.4)' : 'rgba(88, 60, 180, 0.4)',
                              border: 'none',
                              borderRadius: '0.5rem',
                              padding: '0.75rem 1rem',
                              color: locked ? '#888' : '#faf5eb',
                              fontSize: '1rem',
                              cursor: locked ? 'not-allowed' : 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.15rem',
                              opacity: locked ? 0.6 : 1,
                            }}
                          >
                            <span style={{ fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {locked && <Lock size={14} />}
                              {init.emoji} {init.name}
                              {locked && <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: 'auto' }}>Lvl 2</span>}
                            </span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.85, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                              {(init as any).hasSwitzerlandLink ? (
                                <>
                                  <a 
                                    href="https://cephas.lianabanyan.com/under-the-hood/switzerland-protocol/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ color: '#38a169', textDecoration: 'underline' }}
                                  >
                                    Per the Switzerland Protocol
                                  </a>
                                  {': ' + init.desc}
                                </>
                              ) : init.desc}
                            </span>
                          </button>
                        );})}
                      </div>
                    </div>
                  );
                  })()}
                  </div>
                  
                  <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '1rem', textAlign: 'center' }}>
                    tap anywhere to go back
                  </p>
                </div>
              ) : (
                /* Default Overview - SINGLE COLUMN of styled buttons */
                <>
                  <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>How Liana Banyan Works</h3>
                  
                  {/* Single column of expandable buttons - styled like current back buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    {/* Cost + 20% - FIRST and OPEN by default style - DARKER BACKGROUND */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('costplus'); }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.background = 'rgba(16, 80, 52, 0.7)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(22, 101, 65, 0.45)'; }}
                      style={{ 
                        background: 'rgba(22, 101, 65, 0.45)', 
                        border: 'none',
                        borderRadius: '0.75rem', 
                        padding: '1rem 1.25rem',
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        color: '#faf5eb'
                      }}
                    >
                      <strong style={{ fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)' }}>🛒 Cost + 20%</strong>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        Every product and service priced transparently. No hidden fees.
                      </p>
                    </button>

                    {/* Wholesale Everything - DARKER BACKGROUND */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('wholesale'); }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.background = 'rgba(60, 40, 140, 0.7)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(88, 60, 180, 0.4)'; }}
                      style={{ 
                        background: 'rgba(88, 60, 180, 0.4)', 
                        border: 'none',
                        borderRadius: '0.75rem', 
                        padding: '1rem 1.25rem',
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        color: '#faf5eb'
                      }}
                    >
                      <strong style={{ fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)' }}>📦 Wholesale Everything</strong>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        We buy at cost, add exactly 20%. No markups.
                      </p>
                    </button>

                    {/* Permanent Cap - DARKER BACKGROUND */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('permanent'); }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.background = 'rgba(60, 40, 140, 0.7)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(88, 60, 180, 0.4)'; }}
                      style={{ 
                        background: 'rgba(88, 60, 180, 0.4)', 
                        border: 'none',
                        borderRadius: '0.75rem', 
                        padding: '1rem 1.25rem',
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        color: '#faf5eb'
                      }}
                    >
                      <strong style={{ fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)' }}>🔒 Permanent Cap</strong>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        20% margin is hardcoded. Can never increase.
                      </p>
                    </button>

                    {/* Member-Owned - DARKER BACKGROUND */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('memberowned'); }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.background = 'rgba(60, 40, 140, 0.7)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(88, 60, 180, 0.4)'; }}
                      style={{ 
                        background: 'rgba(88, 60, 180, 0.4)', 
                        border: 'none',
                        borderRadius: '0.75rem', 
                        padding: '1rem 1.25rem',
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        color: '#faf5eb'
                      }}
                    >
                      <strong style={{ fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)' }}>🤝 Member-Owned</strong>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        You're not a customer. You're an owner.
                      </p>
                    </button>

                    {/* Funds 16 Initiatives - DARKER BACKGROUND */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMainBackExpanded('initiatives'); }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.background = 'rgba(60, 40, 140, 0.7)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(88, 60, 180, 0.4)'; }}
                      style={{ 
                        background: 'rgba(88, 60, 180, 0.4)', 
                        border: 'none',
                        borderRadius: '0.75rem', 
                        padding: '1rem 1.25rem',
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        color: '#faf5eb'
                      }}
                    >
                      <strong style={{ fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)' }}>🌿 Funds 16 Initiatives</strong>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        20% funds charitable infrastructure.
                      </p>
                    </button>
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

        {/* EXPLAINER FLIPCARD — REMOVED IN V2 (consolidated into Choose Card back) */}

        {/* FOUNDER DECISION: Bottom "explainer" card commented out — slot reserved for Charity Card */}
        {false && (
        <div
          className={`paths-section-flip ${pathsSectionFlipped ? 'flipped' : ''}`}
          onClick={() => { setPathsSectionFlipped(!pathsSectionFlipped); setExpandedWorldPortal(null); }}
          style={isProfessionalTheme ? {
            background: 'transparent',  /* Background is on front/back faces, not wrapper */
            marginTop: '2rem',
            cursor: 'pointer',
          } : { cursor: 'pointer' }}
        >
          <div className="paths-section-inner">
            {/* FRONT: Worker-Owned content + Choose Your Path with mirrors and 3 path cards */}
            <div className="paths-section-front" style={{ position: 'relative' }}>
              {/* Hand icon for flip indication */}
              <span className="hand" style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '1.1rem', opacity: 0.35 }}>👉</span>
              
              {/* Worker-Owned. Member-Governed. section - moved from old Not Charity card front */}
              <div style={{ 
                padding: '2rem 2rem 1.5rem 2rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <h3 className="worker-owned-heading" style={{ 
                  fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', 
                  marginBottom: '1.25rem', 
                  textAlign: 'center', 
                  color: '#faf5eb',
                  fontWeight: 700
                }}>
                  <span style={{ display: 'inline' }}>Worker-Owned.</span>
                  <span style={{ display: 'inline' }}> Member-Governed.</span>
                </h3>
                <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9, marginBottom: '0.4rem' }}>
                  You're an Owner.
                </p>
                <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9, marginBottom: '0.4rem' }}>
                  Your ideas/services/products Preorder-Funded and Made by Members.
                </p>
                <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9, marginBottom: '0.4rem' }}>
                  The 20% margin funds 16 charitable initiatives for Everyone.
                </p>
                <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', lineHeight: 1.6, textAlign: 'center', color: '#faf5eb', opacity: 0.9 }}>
                  The People doing the Work make the Decisions and get the Benefits.
                </p>
              </div>

              {/* Divider line */}
              <div style={{ 
                width: '60%', 
                height: '1px', 
                background: 'rgba(250, 245, 235, 0.2)', 
                margin: '0 auto 1.5rem auto' 
              }} />

              <div className="trunk-info" style={{ background: 'transparent', padding: 0 }}>
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '2rem',
                  width: '80%',
                  margin: '0 auto 2rem auto'
                }}>
                  <h2 style={{ 
                    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
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
                  <div className={`path-flip ${flippedPaths.has(0) ? 'flipped' : ''}`} onClick={(e) => { e.stopPropagation(); togglePath(0); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); togglePath(0); }}} role="button" tabIndex={0}>
                    <div className="path-inner">
                      <div className="path-front">
                        <h3>Get a Job</h3>
                        <p>Real work. Fair pay. You keep 83.3%.</p>
                        <button className="path-price-btn" onClick={(e) => { e.stopPropagation(); navigate('/get-a-job'); }}>The Salt Mines →</button>
                        <span className="hand">👉</span>
                      </div>
                      <div className="path-back">
                        <h3>Get a Job</h3>
                        <p>Browse bounties across all 16 initiatives AND MEMBER'S PROJECTS. No middleman taking half. You keep 83.3% of every dollar charged. 500-2000 Credits = $500-$2000.</p>
                        <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/get-a-job'); }}>
                          Browse Bounties
                        </button>
                        <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(0); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); togglePath(0); }}} role="button" tabIndex={0}>← flip back</span>
                      </div>
                    </div>
                  </div>

                  {/* Build a Business */}
                  <div className={`path-flip ${flippedPaths.has(1) ? 'flipped' : ''}`} onClick={(e) => { e.stopPropagation(); togglePath(1); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); togglePath(1); }}} role="button" tabIndex={0}>
                    <div className="path-inner">
                      <div className="path-front">
                        <h3>Build a Business</h3>
                        <p>Same terms as the Founder. Your ship, Captain — your rules.</p>
                        <button className="path-price-btn" onClick={(e) => { e.stopPropagation(); navigate('/build-a-business'); }}>$5 to Start →</button>
                        <span className="hand">👉</span>
                      </div>
                      <div className="path-back">
                        <h3>Build a Business</h3>
                        <p>Launch your Keep for $5. 6 production levels, volume discounts, early backer Joules. Same deal as the Founder — no special treatment. Your ship, Captain — your rules.</p>
                        <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/build-a-business'); }}>
                          Start Building
                        </button>
                        <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(1); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); togglePath(1); }}} role="button" tabIndex={0}>← flip back</span>
                      </div>
                    </div>
                  </div>

                  {/* Plant Seeds */}
                  <div className={`path-flip ${flippedPaths.has(2) ? 'flipped' : ''}`} onClick={(e) => { e.stopPropagation(); togglePath(2); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); togglePath(2); }}} role="button" tabIndex={0}>
                    <div className="path-inner">
                      <div className="path-front">
                        <h3>Plant Seeds</h3>
                        <p>Support projects early. Gain more influence.</p>
                        <button className="path-price-btn" onClick={(e) => { e.stopPropagation(); navigate('/plant-seeds'); }}>5x Multiplier →</button>
                        <span className="hand">👉</span>
                      </div>
                      <div className="path-back">
                        <h3>Plant Seeds</h3>
                        <p>Back projects early and receive <strong>5× the Joules</strong>. Multipliers stack up to 15x. Fractional IP participation when you sponsor. Help others = participate in something real.</p>
                        <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/plant-seeds'); }}>
                          Start Planting
                        </button>
                        <span className="flip-back" onClick={(e) => { e.stopPropagation(); togglePath(2); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); togglePath(2); }}} role="button" tabIndex={0}>← flip back</span>
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

            {/* BACK: Not Charity header + Two Worlds + stacked Ghost/Real buttons */}
            <div className="paths-section-back" onClick={() => { if (!expandedWorldPortal) setPathsSectionFlipped(false); }} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '2rem',
            }}>
              {/* Not Charity Header - moved from old explainer card */}
              <h3 style={{ 
                fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
                marginBottom: '0.25rem', 
                textAlign: 'center', 
                color: '#faf5eb',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🌿</span> Not Charity TO the People
              </h3>
              <p style={{ 
                fontSize: 'clamp(1rem, 3vw, 1.15rem)', 
                textAlign: 'center', 
                marginBottom: '1.5rem', 
                color: '#faf5eb',
                opacity: 0.9,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}>
                But Infrastructure BY the People, FOR the People
              </p>
              
              <h4 style={{ 
                textAlign: 'center', 
                marginBottom: '1.25rem', 
                fontSize: '1.25rem', 
                color: '#38a169',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}>
                Two Worlds. One Platform.
              </h4>
              
              {/* STACKED Ghost/Real World buttons - Ghost on top - with flip-to-expand */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem', 
                width: '100%', 
                maxWidth: '480px'
              }}>
                {expandedWorldPortal === 'ghost' ? (
                  /* GHOST WORLD Expanded - takes full space */
                  <div 
                    onClick={(e) => { e.stopPropagation(); setExpandedWorldPortal(null); }}
                    style={{ 
                      background: 'rgba(88, 60, 180, 0.5)', 
                      borderRadius: '1rem', 
                      padding: '1.5rem',
                      border: '2px solid rgba(139, 92, 246, 0.7)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem',
                      color: '#faf5eb',
                      minHeight: '240px',
                    }}
                  >
                    <h4 style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: 700, 
                      margin: 0,
                      color: '#faf5eb'
                    }}>
                      👻 What is Ghost World?
                    </h4>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      lineHeight: 1.6, 
                      textAlign: 'center', 
                      margin: 0,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      Ghost World lets you explore everything without commitment. Browse initiatives, test ideas, hunt Golden Keys, play and make Beacon Run games for Crow Feathers. When you're ready to participate for real, you become a member for $5/year.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedWorldPortal(null); }}
                        style={{
                          padding: '0.6rem 1.2rem',
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '0.5rem',
                          color: '#faf5eb',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/ghost'); }}
                        style={{
                          padding: '0.6rem 1.2rem',
                          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Enter Ghost World →
                      </button>
                    </div>
                  </div>
                ) : expandedWorldPortal === 'real' ? (
                  /* REAL WORLD Expanded - takes full space */
                  <div 
                    onClick={(e) => { e.stopPropagation(); setExpandedWorldPortal(null); }}
                    style={{ 
                      background: 'rgba(16, 120, 90, 0.5)', 
                      borderRadius: '1rem', 
                      padding: '1.5rem',
                      border: '2px solid rgba(52, 211, 153, 0.7)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem',
                      color: '#faf5eb',
                      minHeight: '240px',
                    }}
                  >
                    <h4 style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: 700, 
                      margin: 0,
                      color: '#faf5eb'
                    }}>
                      💼 What is Real World?
                    </h4>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      lineHeight: 1.6, 
                      textAlign: 'center', 
                      margin: 0,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      Real World is where work happens. Get a job keeping 83.3%. Build a business on your terms and Post Jobs to hire. Plant seeds to back projects early. Same deal as the Founder — no special treatment: But you get to use all the patent I.P. freely - within Liana Banyan.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedWorldPortal(null); }}
                        style={{
                          padding: '0.6rem 1.2rem',
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '0.5rem',
                          color: '#faf5eb',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                        }}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/portal'); }}
                        style={{
                          padding: '0.6rem 1.2rem',
                          background: 'linear-gradient(135deg, #34d399, #10b981)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: '#022c22',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Enter Real World →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* DEFAULT: Both buttons visible */
                  <>
                    {/* GHOST WORLD Button - darker color, text shadow */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setExpandedWorldPortal('ghost'); }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = 'rgba(88, 60, 180, 0.6)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(88, 60, 180, 0.45)'; }}
                      style={{ 
                        background: 'rgba(88, 60, 180, 0.45)', 
                        borderRadius: '1rem', 
                        padding: '1.25rem 1.5rem',
                        border: '2px solid rgba(139, 92, 246, 0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#faf5eb',
                      }}
                    >
                      <span style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.3)'
                      }}>
                        👻 Ghost World
                      </span>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                      }}>
                        Explore freely. No commitment. Test ideas.
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.35rem 0.75rem', 
                        background: 'rgba(139, 92, 246, 0.5)', 
                        borderRadius: '0.5rem',
                        marginTop: '0.25rem',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                      }}>
                        Browse everything first
                      </span>
                    </button>

                    {/* REAL WORLD Button - darker color, text shadow */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setExpandedWorldPortal('real'); }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = 'rgba(16, 120, 90, 0.6)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(16, 120, 90, 0.45)'; }}
                      style={{ 
                        background: 'rgba(16, 120, 90, 0.45)', 
                        borderRadius: '1rem', 
                        padding: '1.25rem 1.5rem',
                        border: '2px solid rgba(52, 211, 153, 0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#faf5eb',
                      }}
                    >
                      <span style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.3)'
                      }}>
                        💼 Real World
                      </span>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                      }}>
                        Get a real job. Build a real business. Plant real seeds.
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.35rem 0.75rem', 
                        background: 'rgba(52, 211, 153, 0.5)', 
                        borderRadius: '0.5rem',
                        marginTop: '0.25rem',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                      }}>
                        $5/year to participate
                      </span>
                    </button>
                  </>
                )}
              </div>

              <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '1.5rem', textAlign: 'center' }}>
                {expandedWorldPortal ? 'tap anywhere to go back' : 'tap anywhere to flip back to paths'}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* ═══ CHARITY CARD — CSS 3D Flip: front = 3 deck cards, back = 16 initiative pills ═══ */}
        <div className="charity-flip-container">
          <div className={`charity-flip-inner${charityFlipped ? ' flipped' : ''}`}>
            {/* ─── FRONT FACE ─── */}
            <div className="charity-flip-front">
              <SpotlightCarousel
                cards={spotlightCards}
                category={spotlightCategory}
                categories={SPOTLIGHT_CATEGORIES}
                onCategoryChange={setSpotlightCategory}
                onCardClick={(card) => { setSpotlightCard(card.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                activeCardId={spotlightCard}
              />

              <p
                onClick={() => { setCharityFlipped(true); setSelectedInitiative(null); }}
                style={{
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  color: '#38a169',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  fontWeight: 600,
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#68d391'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#38a169'; }}
              >
                The 20% margin funds 16 charitable initiatives for Everyone.
              </p>
            </div>

            {/* ─── BACK FACE ─── */}
            <div className="charity-flip-back">
              <p style={{
                textAlign: 'center',
                color: '#38a169',
                fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
                fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
                marginBottom: '1rem',
                marginTop: 0,
                lineHeight: 1.4,
              }}>
                {'\u{1F33F}'} Not Charity <span style={{ fontWeight: 700, color: '#faf5eb' }}>TO</span> the People {'\u2014'} but Infrastructure <span style={{ fontWeight: 700, color: '#faf5eb' }}>BY</span> the People, <span style={{ fontWeight: 700, color: '#faf5eb' }}>FOR</span> the People
              </p>
              {selectedInitiative === null ? (
                <>
                  <h3 style={{ color: '#faf5eb', textAlign: 'center', fontSize: '1.15rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>
                    16 Initiatives &middot; Click to Explore
                  </h3>
                  <div className="charity-pill-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.75rem',
                  }}>
                    {SWEET_SIXTEEN.map((init) => (
                      <button
                        key={init.slug}
                        onClick={() => setSelectedInitiative(init.slug)}
                        style={{
                          background: 'rgba(250, 245, 235, 0.08)',
                          border: '1px solid rgba(250, 245, 235, 0.15)',
                          borderRadius: '0.75rem',
                          padding: '0.6rem 0.5rem',
                          color: '#faf5eb',
                          cursor: 'pointer',
                          fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          lineHeight: 1.3,
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(56, 161, 105, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(56, 161, 105, 0.5)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(250, 245, 235, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(250, 245, 235, 0.15)';
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.25rem' }}>{init.emoji}</span>
                        {init.name}
                      </button>
                    ))}
                  </div>
                  <p
                    onClick={() => setCharityFlipped(false)}
                    style={{
                      textAlign: 'center',
                      color: 'rgba(250, 245, 235, 0.5)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      margin: '1.25rem 0 0 0',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = '#faf5eb'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(250, 245, 235, 0.5)'; }}
                  >
                    {'\u2190'} Back
                  </p>
                </>
              ) : (
                (() => {
                  const sel = SWEET_SIXTEEN.find(i => i.slug === selectedInitiative);
                  if (!sel) return null;
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ color: '#faf5eb', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                        {sel.emoji} {sel.name}
                      </h3>
                      <p style={{ color: 'rgba(250, 245, 235, 0.7)', fontSize: '0.85rem', margin: '0 0 0.3rem 0' }}>
                        {sel.category}
                      </p>
                      <p style={{ color: 'rgba(250, 245, 235, 0.8)', fontSize: '1.05rem', margin: '0 0 1.5rem 0' }}>
                        {sel.tagline}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => setSelectedInitiative(null)}
                          style={{
                            background: 'rgba(250, 245, 235, 0.1)',
                            border: '1px solid rgba(250, 245, 235, 0.25)',
                            borderRadius: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            color: '#faf5eb',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'background 0.2s',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(250, 245, 235, 0.2)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(250, 245, 235, 0.1)'; }}
                        >
                          {'\u2190'} Back to All
                        </button>
                        <button
                          onClick={() => window.open(`/initiatives/${selectedInitiative}`, '_blank')}
                          style={{
                            background: 'linear-gradient(135deg, #38a169, #2f855a)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'opacity 0.2s',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                          onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                          Explore {'\u2192'}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
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
            <button
              onClick={() => setWispActive(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#38a169',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                font: 'inherit',
                fontSize: 'inherit',
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Walkthrough
            </button>
            <span style={{ margin: '0 0.75rem', opacity: 0.5 }}>|</span>
            <a href="/terms" style={{ color: '#a0aec0', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>Terms</a>
            <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>·</span>
            <a href="/privacy" style={{ color: '#a0aec0', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>Privacy</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATED DISCOVERY VIEW — Minimal chalk-outline aesthetic
// ═══════════════════════════════════════════════════════════════════════════
export function KeepView({ 
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
      <button className="ghost-toggle" onClick={() => levelGatedNavigate('/the-helm')}>
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
            <button className="btn" style={{ marginRight: '0.75rem' }} onClick={() => levelGatedNavigate('/the-helm')}>
              Enter The Helm
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
              Full Dashboard
            </button>
          </div>
        </div>

        {/* NotCents Economy Banner */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(245,158,11,0.1) 100%)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Powered by NotCents™ <span style={{ fontFamily: 'monospace' }}>Ↄ‖</span></p>
            <p style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '1rem' }}>Three currencies. One fair economy. Credits for buying, Marks for effort, Joules for the future.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(16,185,129,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem' }}>💰 Credits — Buy with fiat</span>
              <span style={{ background: 'rgba(59,130,246,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem' }}>⚡ Marks — Earn through effort</span>
              <span style={{ background: 'rgba(245,158,11,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem' }}>🔒 Joules — Store for the future</span>
            </div>
            <button className="btn btn-outline" style={{ marginTop: '1rem', fontSize: '0.75rem' }} onClick={() => navigate('/c-plus-20')}>
              Learn More — C+20 Reciprocity
            </button>
          </div>
        </div>

        {/* Quick Navigation Grid */}
        <div className="trunk-info" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Explore the Platform</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Main Square', path: '/main-square', emoji: '🏪' },
              { label: 'BandWagon', path: '/bandwagon', emoji: '🚀' },
              { label: 'C+20 Pricing', path: '/c-plus-20', emoji: '⚖️' },
              { label: 'XP Board', path: '/xp-leaderboard', emoji: '🏆' },
              { label: 'The Forge', path: '/the-forge', emoji: '🏭' },
              { label: 'Tereno Cert', path: '/tereno-certification', emoji: '🏅' },
              { label: 'Daily News', path: '/daily-news', emoji: '📰' },
              { label: 'Vouch', path: '/vouch', emoji: '❤️' },
              { label: 'Star Chamber', path: '/star-chamber', emoji: '⚖️' },
              { label: 'Steward Post', path: '/steward', emoji: '🛡️' },
              { label: 'Node Captain', path: '/node-captain', emoji: '⚓' },
              { label: 'Santa Ever After', path: '/santa', emoji: '🎁' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem', color: 'inherit' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.9)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(148,163,184,0.2)'; }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
                <div>{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        <footer className="landing-footer">
          <p>
            © 2026 Liana Banyan Corporation
            <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>·</span>
            <a href="/terms" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Terms</a>
            <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>·</span>
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Privacy</a>
          </p>
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
  const levelGatedNavigate = useLevelGatedNavigate();
  return (
    <div 
      onClick={() => levelGatedNavigate('/the-helm')}
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
