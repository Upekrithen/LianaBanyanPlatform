/**
 * AccessibilityMirror.tsx
 * "The Fairest of Them All" — Accessibility controls for Mirror Mirror
 *
 * Fair means everyone can use it:
 * - Font size scaling
 * - High contrast mode
 * - Dyslexia-friendly font
 * - Reduced motion
 *
 * Preferences persist in localStorage (guests) and could sync to Supabase (members).
 */
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lb_accessibility';

interface AccessibilityPrefs {
  fontSize: 'normal' | 'large' | 'xl' | 'xxl';
  contrast: 'normal' | 'high' | 'inverted';
  dyslexiaFont: boolean;
  reducedMotion: boolean;
}

const DEFAULTS: AccessibilityPrefs = {
  fontSize: 'normal',
  contrast: 'normal',
  dyslexiaFont: false,
  reducedMotion: false,
};

/**
 * Named & Numbered Accessibility Presets
 * One-click profiles — like Picasso's periods, each serves a different need.
 * "You cannot exclude based on nothing. You CAN include based on everything."
 */
interface AccessibilityPreset {
  id: number;
  name: string;
  emoji: string;
  description: string;
  prefs: AccessibilityPrefs;
}

const PRESETS: AccessibilityPreset[] = [
  {
    id: 0,
    name: 'Default',
    emoji: '🪞',
    description: 'Standard view — as designed',
    prefs: { fontSize: 'normal', contrast: 'normal', dyslexiaFont: false, reducedMotion: false },
  },
  {
    id: 1,
    name: 'Easy Read',
    emoji: '👓',
    description: 'Larger text for comfortable reading',
    prefs: { fontSize: 'large', contrast: 'normal', dyslexiaFont: false, reducedMotion: false },
  },
  {
    id: 2,
    name: 'High Visibility',
    emoji: '🔆',
    description: 'Enhanced contrast + larger text for low vision',
    prefs: { fontSize: 'xl', contrast: 'high', dyslexiaFont: false, reducedMotion: false },
  },
  {
    id: 3,
    name: 'Dyslexia Friendly',
    emoji: '🔤',
    description: 'OpenDyslexic font with extra spacing',
    prefs: { fontSize: 'large', contrast: 'normal', dyslexiaFont: true, reducedMotion: false },
  },
  {
    id: 4,
    name: 'Calm Mode',
    emoji: '🧘',
    description: 'No animations, gentle on the senses',
    prefs: { fontSize: 'normal', contrast: 'normal', dyslexiaFont: false, reducedMotion: true },
  },
  {
    id: 5,
    name: 'Maximum Clarity',
    emoji: '💎',
    description: 'Everything on — largest text, high contrast, clear font, no motion',
    prefs: { fontSize: 'xxl', contrast: 'high', dyslexiaFont: true, reducedMotion: true },
  },
  {
    id: 6,
    name: 'Light Mode',
    emoji: '☀️',
    description: 'Inverted colors — dark text on light background',
    prefs: { fontSize: 'normal', contrast: 'inverted', dyslexiaFont: false, reducedMotion: false },
  },
  {
    id: 7,
    name: 'Light + Large',
    emoji: '🌤️',
    description: 'Light background with bigger text',
    prefs: { fontSize: 'xl', contrast: 'inverted', dyslexiaFont: false, reducedMotion: false },
  },
];

const FONT_SCALE: Record<string, string> = {
  normal: '100%',
  large: '115%',
  xl: '130%',
  xxl: '150%',
};

const FONT_LABELS: Record<string, string> = {
  normal: 'A',
  large: 'A+',
  xl: 'A++',
  xxl: 'A+++',
};

/** Apply preferences to :root CSS custom properties */
function applyPrefs(prefs: AccessibilityPrefs) {
  const root = document.documentElement;

  // Font size
  root.style.fontSize = FONT_SCALE[prefs.fontSize] || '100%';

  // Contrast
  root.classList.remove('lb-high-contrast', 'lb-inverted');
  if (prefs.contrast === 'high') root.classList.add('lb-high-contrast');
  if (prefs.contrast === 'inverted') root.classList.add('lb-inverted');

  // Dyslexia font
  if (prefs.dyslexiaFont) {
    root.classList.add('lb-dyslexia-font');
  } else {
    root.classList.remove('lb-dyslexia-font');
  }

  // Reduced motion
  if (prefs.reducedMotion) {
    root.classList.add('lb-reduced-motion');
  } else {
    root.classList.remove('lb-reduced-motion');
  }
}

/** Load prefs from localStorage */
function loadPrefs(): AccessibilityPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

/** Save prefs to localStorage */
function savePrefs(prefs: AccessibilityPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

// Apply on initial load (before component mounts)
if (typeof window !== 'undefined') {
  applyPrefs(loadPrefs());
}

export function AccessibilityMirror() {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(loadPrefs);
  const [expanded, setExpanded] = useState(false);
  const [showManual, setShowManual] = useState(false);

  /** Check which preset matches current prefs (if any) */
  const activePresetId = PRESETS.find(
    p => JSON.stringify(p.prefs) === JSON.stringify(prefs)
  )?.id ?? -1;

  useEffect(() => {
    applyPrefs(prefs);
    savePrefs(prefs);
  }, [prefs]);

  const update = (partial: Partial<AccessibilityPrefs>) => {
    setPrefs(prev => ({ ...prev, ...partial }));
  };

  const isModified = JSON.stringify(prefs) !== JSON.stringify(DEFAULTS);

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: expanded ? '1rem' : '0.6rem 1rem',
    marginTop: '1rem',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none' as const,
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: `1.5px solid ${active ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.15)'}`,
    background: active ? 'rgba(52,211,153,0.2)' : 'rgba(0,0,0,0.2)',
    color: active ? '#34d399' : 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    fontWeight: active ? 600 : 400,
  });

  const fontBtnStyle = (size: string): React.CSSProperties => ({
    ...toggleBtnStyle(prefs.fontSize === size),
    fontSize: size === 'normal' ? '0.8rem' : size === 'large' ? '0.9rem' : size === 'xl' ? '1rem' : '1.1rem',
    minWidth: '3rem',
    textAlign: 'center' as const,
  });

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    opacity: 0.8,
    flex: '0 0 auto',
    marginRight: '0.75rem',
  };

  return (
    <div style={sectionStyle}>
      <div style={headerStyle} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>♿</span>
          <span style={{ fontWeight: 500 }}>Accessibility</span>
          <span style={{ opacity: 0.5, fontSize: '0.75rem', fontStyle: 'italic' }}>
            — fair means everyone can use it
          </span>
          {isModified && !expanded && (
            <span style={{
              background: 'rgba(52,211,153,0.3)',
              color: '#34d399',
              fontSize: '0.65rem',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              ACTIVE
            </span>
          )}
        </span>
        <span style={{
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          opacity: 0.5,
          fontSize: '0.8rem',
        }}>
          ▼
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem' }}>
          {/* ── Quick Presets ── */}
          <p style={{ opacity: 0.5, fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Quick Presets
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.4rem',
            marginBottom: '1rem',
          }}>
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                style={{
                  padding: '0.5rem 0.6rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${activePresetId === preset.id ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  background: activePresetId === preset.id ? 'rgba(52,211,153,0.15)' : 'rgba(0,0,0,0.2)',
                  color: activePresetId === preset.id ? '#34d399' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  textAlign: 'left' as const,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                onClick={() => setPrefs({ ...preset.prefs })}
                title={preset.description}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{preset.emoji}</span>
                <span>
                  <span style={{ fontWeight: 500, fontSize: '0.78rem' }}>#{preset.id} {preset.name}</span>
                  <br />
                  <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{preset.description}</span>
                </span>
              </button>
            ))}
          </div>

          {/* ── Manual Fine-Tuning Toggle ── */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: showManual ? '0.75rem' : 0,
            }}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
              }}
              onClick={() => setShowManual(!showManual)}
            >
              {showManual ? '▲ Hide manual controls' : '▼ Fine-tune manually'}
            </button>
          </div>

          {showManual && (
            <>
              {/* Font Size */}
              <div style={rowStyle}>
                <span style={labelStyle}>📏 Text Size</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['normal', 'large', 'xl', 'xxl'] as const).map(size => (
                    <button
                      key={size}
                      style={fontBtnStyle(size)}
                      onClick={() => update({ fontSize: size })}
                      title={`Font size: ${FONT_SCALE[size]}`}
                    >
                      {FONT_LABELS[size]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast */}
              <div style={rowStyle}>
                <span style={labelStyle}>🔆 Contrast</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['normal', 'high', 'inverted'] as const).map(mode => (
                    <button
                      key={mode}
                      style={toggleBtnStyle(prefs.contrast === mode)}
                      onClick={() => update({ contrast: mode })}
                    >
                      {mode === 'normal' ? 'Normal' : mode === 'high' ? 'High' : 'Light'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dyslexia Font */}
              <div style={rowStyle}>
                <span style={labelStyle}>🔤 Dyslexia Font</span>
                <button
                  style={toggleBtnStyle(prefs.dyslexiaFont)}
                  onClick={() => update({ dyslexiaFont: !prefs.dyslexiaFont })}
                >
                  {prefs.dyslexiaFont ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Reduced Motion */}
              <div style={rowStyle}>
                <span style={labelStyle}>🎞️ Reduced Motion</span>
                <button
                  style={toggleBtnStyle(prefs.reducedMotion)}
                  onClick={() => update({ reducedMotion: !prefs.reducedMotion })}
                >
                  {prefs.reducedMotion ? 'ON' : 'OFF'}
                </button>
              </div>
            </>
          )}

          {/* Reset */}
          {isModified && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textDecoration: 'underline',
                  padding: '0.25rem',
                }}
                onClick={() => setPrefs({ ...DEFAULTS })}
              >
                Reset to defaults
              </button>
            </div>
          )}

          {/* Fairest message */}
          <p style={{
            opacity: 0.4,
            fontSize: '0.7rem',
            textAlign: 'center',
            marginTop: '0.75rem',
            fontStyle: 'italic',
          }}>
            "The fairest of them all" — not beauty, but how we treat each other.
            <br />
            These settings are saved on your device.
          </p>
        </div>
      )}
    </div>
  );
}

export default AccessibilityMirror;
