/**
 * PROFESSIONAL LANDING — Wife's Favorite Layout
 * ==============================================
 * Based on the original December 2025 static page:
 * - "Ideas are Free. Infrastructure Costs Money."
 * - Deep navy/green gradient background
 * - Crimson Pro serif font for headings
 * - Clean, professional business aesthetic
 * - Chalk-outlined hero flipcards for interactivity
 * 
 * Content uses current messaging but with static page's visual style.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import './ProfessionalLanding.css';

// Theme definitions for palette switcher
const THEMES = [
  { id: '001', name: "Founder's Classic" },
  { id: '002', name: 'Logo Leaves' },
  { id: '003', name: 'Prismatic' },
  { id: '004', name: 'Green Anchor' },
  { id: '005', name: 'Green Anchor Flip' },
  { id: '006', name: 'Subtle Anchor Flip' },
  { id: '007', name: 'VIVID WHITE v2' },
  { id: '008', name: 'Professional' },
];

interface ProfessionalLandingProps {
  onThemeChange?: (themeId: string) => void;
  currentTheme?: string;
}

export function ProfessionalLanding({ onThemeChange, currentTheme = '008' }: ProfessionalLandingProps) {
  const navigate = useNavigate();
  const { openOnboard } = useSeamlessOnboard();
  const [heroFlipped, setHeroFlipped] = useState(false);
  const [pathFlipped, setPathFlipped] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Load fonts
  useEffect(() => {
    // Check if fonts are already loaded
    const fontLink = document.querySelector('link[href*="Crimson+Pro"]');
    if (!fontLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Source+Sans+3:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const togglePath = (id: string) => {
    setPathFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleThemeSelect = (themeId: string) => {
    if (onThemeChange) {
      onThemeChange(themeId);
    }
    setPaletteOpen(false);
  };

  return (
    <div className="professional-landing">
      {/* Theme Palette Toggle - Bottom Left */}
      <button 
        className="professional-palette-btn"
        onClick={() => setPaletteOpen(!paletteOpen)}
        title="Switch Theme"
      >
        🎨
      </button>

      {/* Theme Palette Panel */}
      {paletteOpen && (
        <div className="professional-palette-panel">
          <h4>🎨 Theme Palette</h4>
          <div className="palette-grid">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`palette-option ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <span className="palette-id">{theme.id}</span>
                <span className="palette-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="professional-nav">
        <a href="/" className="professional-logo">
          Liana<span>Banyan</span>
        </a>
        <ul className="professional-nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#paths">Choose Your Path</a></li>
          <li><a href="#initiatives">Initiatives</a></li>
          <li><a href="/ghost">Explore</a></li>
        </ul>
      </nav>

      {/* Hero Section with Flipcard */}
      <section className="professional-hero">
        <span className="professional-eyebrow">Member-Owned · Community-Governed</span>
        
        {/* Hero Flipcard */}
        <div
          className={`professional-hero-flip ${heroFlipped ? 'flipped' : ''}`}
          onClick={() => setHeroFlipped(!heroFlipped)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHeroFlipped(!heroFlipped); }}}
          role="button"
          tabIndex={0}
          aria-label={heroFlipped ? "Flip card back" : "Flip card to see options"}
        >
          <div className="professional-hero-inner">
            {/* FRONT */}
            <div className="professional-hero-front">
              <h1>
                <span className="hero-white">Help Each Other</span>
                <br />
                <span className="hero-green">Help Ourselves</span>
              </h1>
              <span className="flip-hint">👉</span>
            </div>
            
            {/* BACK - Two Portals */}
            <div className="professional-hero-back">
              <h3>Two Worlds. One Platform.</h3>
              <div className="professional-portal-row">
                <div className="professional-portal ghost-portal" onClick={(e) => { e.stopPropagation(); navigate('/ghost'); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); navigate('/ghost'); }}} role="button" tabIndex={0}>
                  <span className="portal-icon">👻</span>
                  <h4>Ghost World</h4>
                  <p>Explore freely. No commitment. Test ideas. Hunt Golden Keys.</p>
                  <button className="portal-btn ghost-btn">Enter Ghost World</button>
                </div>
                <div className="professional-portal real-portal" onClick={(e) => { e.stopPropagation(); openOnboard({ reason: "get started", actionLabel: "Join", membershipIncluded: true }); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openOnboard({ reason: "get started", actionLabel: "Join", membershipIncluded: true }); }}} role="button" tabIndex={0}>
                  <span className="portal-icon">💼</span>
                  <h4>Real World</h4>
                  <p>Get a real job. Build a real business. Plant real seeds.</p>
                  <button className="portal-btn real-btn">Join for $5/year</button>
                </div>
              </div>
              <span className="flip-hint-back">tap to flip back</span>
            </div>
          </div>
        </div>

        <p className="professional-subtitle">
          Creators and Workers keep 83.3%. Constitutionally locked. $5/year.
        </p>
        <div className="professional-badge">Cost + 20% — DNA Locked</div>
      </section>

      {/* The Model Section */}
      <section id="how-it-works" className="professional-section">
        <span className="professional-label">The Model</span>
        <h2>Cost + 20%. That's it.</h2>
        <p className="professional-intro">
          Traditional platforms take 30-50% of creator revenue. We take 20%. 
          Creators and Workers keep 83.3%. The math isn't complicated—it's just fair.
        </p>
        
        <div className="professional-model-grid">
          <div className="professional-model-card">
            <span className="model-number">83.3%</span>
            <h3>Creator Revenue</h3>
            <p>Every dollar you earn, you keep 83 cents. Not 50. Not 70. Eighty-three.</p>
          </div>
          <div className="professional-model-card">
            <span className="model-number">$5</span>
            <h3>Entry Point</h3>
            <p>Everyone should be able to participate. $5 isn't a barrier—it's a commitment.</p>
          </div>
          <div className="professional-model-card">
            <span className="model-number">1,227</span>
            <h3>Innovations</h3>
            <p>Patent-pending systems for dual-currency economics, collective membership, and transparent governance.</p>
          </div>
          <div className="professional-model-card">
            <span className="model-number">∞</span>
            <h3>Keeps</h3>
            <p>Every project is a Keep—a castle where creators maintain sovereignty over their work.</p>
          </div>
        </div>

        {/* Pool Benefits Callout */}
        <div className="professional-model-card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <span className="model-number">4x</span>
          <h3>Shared Pool Access</h3>
          <p style={{ fontStyle: 'italic' }}>
            "At C20 per pool, a member in 4 pools pays C80/month but gets 4x what they'd
            have individually. With strangers, even. The pool doesn't care WHO is in it,
            just that the economics work."
          </p>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
            AI tools, software licenses, equipment, services — pooled across your guild chapter,
            tribe, and project teams at volume-discounted rates.
          </p>
        </div>
      </section>

      {/* Four Paths Section with Flipcards */}
      <section id="paths" className="professional-section">
        <span className="professional-label">Choose Your Path</span>
        <h2>Four ways in. All keep 83.3%.</h2>
        
        <div className="professional-path-grid four-cards">
          {/* Get a Job */}
          <div 
            className={`professional-path-flip ${pathFlipped['job'] ? 'flipped' : ''}`}
            onClick={() => togglePath('job')}
          >
            <div className="professional-path-inner">
              <div className="professional-path-front">
                <h3>💼 Get a Job</h3>
                <p>Join an existing initiative. Real work, fair pay.</p>
                <span className="path-price">Keep 83.3%</span>
                <span className="flip-hint">👉</span>
              </div>
              <div className="professional-path-back">
                <h3>Get a Job</h3>
                <p>Browse real opportunities across all 16 initiatives. From meal delivery to safety services. No gig economy extraction — you keep 83.3% of every dollar you earn.</p>
                <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/discover/work'); }}>
                  Browse Opportunities
                </button>
                <span className="flip-hint-back">← flip back</span>
              </div>
            </div>
          </div>

          {/* Build a Business */}
          <div 
            className={`professional-path-flip ${pathFlipped['build'] ? 'flipped' : ''}`}
            onClick={() => togglePath('build')}
          >
            <div className="professional-path-inner">
              <div className="professional-path-front">
                <h3>🏰 Build a Business</h3>
                <p>Same terms as the Founder. Keep 83.3%. Earn IP royalties.</p>
                <span className="path-price">$5 to Start</span>
                <span className="flip-hint">👉</span>
              </div>
              <div className="professional-path-back">
                <h3>Build a Business</h3>
                <p>Launch your Keep with just $5. Sell products, keep 83.3%. Create innovations, earn IP royalties at the same rates as the Founder. Your castle, your rules.</p>
                <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/discover/build'); }}>
                  Start Building
                </button>
                <span className="flip-hint-back">← flip back</span>
              </div>
            </div>
          </div>

          {/* Plant Seeds */}
          <div 
            className={`professional-path-flip ${pathFlipped['seed'] ? 'flipped' : ''}`}
            onClick={() => togglePath('seed')}
          >
            <div className="professional-path-inner">
              <div className="professional-path-front">
                <h3>🌱 Plant Seeds</h3>
                <p>Sponsor memberships. Fund initiatives. Own fractional patents.</p>
                <span className="path-price">From $5</span>
                <span className="flip-hint">👉</span>
              </div>
              <div className="professional-path-back">
                <h3>Plant Seeds</h3>
                <p>Be a Johnny Appleseed — sponsor memberships for people who need a start. Fund initiatives you believe in. Own fractional patent participation. Watch your forest grow.</p>
                <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/sponsor'); }}>
                  Start Planting
                </button>
                <span className="flip-hint-back">← flip back</span>
              </div>
            </div>
          </div>

          {/* Discover Initiatives - NEW 4th Card */}
          <div 
            className={`professional-path-flip ${pathFlipped['discover'] ? 'flipped' : ''}`}
            onClick={() => togglePath('discover')}
          >
            <div className="professional-path-inner">
              <div className="professional-path-front">
                <h3>🧭 Discover Initiatives</h3>
                <p>16 ways to help each other. Explore the ecosystem.</p>
                <span className="path-price">Sweet Sixteen</span>
                <span className="flip-hint">👉</span>
              </div>
              <div className="professional-path-back">
                <h3>Discover Initiatives</h3>
                <p>From meal sharing to music licensing, from safety services to academic research. Each initiative is a community solving real problems. Find where you fit.</p>
                <button className="path-btn" onClick={(e) => { e.stopPropagation(); navigate('/initiatives'); }}>
                  Explore All 16
                </button>
                <span className="flip-hint-back">← flip back</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sweet Sixteen Section */}
      <section id="initiatives" className="professional-section">
        <span className="professional-label">The Sweet Sixteen</span>
        <h2>16 initiatives. One ecosystem.</h2>
        
        <div className="professional-initiatives-grid">
          <div className="initiative-card">
            <h3>🍽️ Let's Make Dinner</h3>
            <p>Community meal sharing where home cooks serve neighbors.</p>
          </div>
          <div className="initiative-card">
            <h3>🛒 Let's Get Groceries</h3>
            <p>Aggregate orders for volume discounts. The more who join, the more everyone saves.</p>
          </div>
          <div className="initiative-card">
            <h3>💊 Tatiana Schlossburg Health Accords</h3>
            <p>Collective buying power for insulin and essential medications.</p>
          </div>
          <div className="initiative-card">
            <h3>🛡️ Defense Klaus</h3>
            <p>For someone you love. Safety infrastructure for vulnerable populations.</p>
          </div>
          <div className="initiative-card">
            <h3>🎵 JukeBox</h3>
            <p>Fair music licensing. Artists keep 83.3%.</p>
          </div>
          <div className="initiative-card">
            <h3>📚 Didasko</h3>
            <p>BOUNTY-based learning. Earn while you learn.</p>
          </div>
        </div>
        
        <div className="professional-cta-row">
          <button className="professional-btn primary" onClick={() => navigate('/initiatives')}>
            Explore All 16 Initiatives
          </button>
          <button className="professional-btn secondary" onClick={() => navigate('/ghost')}>
            👻 Explore as Ghost
          </button>
        </div>
      </section>

      {/* Origin Story */}
      <section className="professional-origin">
        <div className="origin-visual">
          <span className="tree-icon">🌳</span>
          <blockquote>
            "A boy reads a book about a magical kingdom held together by trees. 
            Decades later, he builds that kingdom."
          </blockquote>
        </div>
        <div className="origin-text">
          <span className="professional-label">Origin</span>
          <h2>Why "Liana Banyan"?</h2>
          <div className="etymology">
            <p><strong>Liana:</strong> A vine that starts in soil and climbs by supporting other plants.</p>
            <p><strong>Banyan:</strong> From Sanskrit, meaning "merchant." Originally the tree under which traders built their pagoda.</p>
          </div>
          <p>As the banyan tree grows trunks from aerial roots, this platform grows businesses. One tree becomes a forest. One idea becomes an ecosystem.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="professional-footer">
        <p className="footer-motto">"Help each other, Help ourselves."</p>
        <p className="footer-info">LIANA BANYAN CORPORATION · Wyoming C-Corp · EIN 41-2797446</p>
        <p className="footer-links">
          <a href="https://the2ndsecond.com">Cephas Archive</a> · 
          <a href="/fly-on-the-wall">Transparency Dashboard</a>
        </p>
      </footer>
    </div>
  );
}

export default ProfessionalLanding;
