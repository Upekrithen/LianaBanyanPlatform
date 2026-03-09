/**
 * HELP WANTED — Chalk-Outline Progressive Disclosure
 * ===================================================
 * NOT a firehose. NOT tabs and sidebars.
 * 
 * Shows 3 discovered opportunity cards + 1 chalk outline.
 * Each card uses DeckCardFrame with 4 locks.
 * Unlock all 4 → card is collected → reveals next layer.
 * 
 * Ghost users: cards stored in localStorage
 * Members: cards stored in database portfolio
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DeckCardFrame } from "@/components/DeckCardFrame";
import { useAuth } from "@/contexts/AuthContext";
import '@/styles/landing.css';

// The discoverable opportunity cards in this layer
const OPPORTUNITY_CARDS = [
  {
    id: 'hw-lets-make-dinner',
    title: "Let's Make Dinner",
    description: "Cook meals. Deliver joy. Keep 83.3%.",
    icon: "🍽️",
    route: "/initiatives/lets-make-dinner",
  },
  {
    id: 'hw-defense-klaus',
    title: "Defense Klaus",
    description: "Protect someone you love.",
    icon: "🛡️",
    route: "/initiatives/defense-klaus",
  },
  {
    id: 'hw-matchtrade',
    title: "MatchTrade",
    description: "Trade skills. No money needed.",
    icon: "🤝",
    route: "/matchtrade",
  },
];

export default function HelpWanted() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collectedCards, setCollectedCards] = useState<Set<string>>(new Set());

  // Load collected cards on mount
  useEffect(() => {
    const loadCollected = async () => {
      if (user) {
        // Would load from database
        // For now, check localStorage as fallback
      }
      const ghostCards = JSON.parse(localStorage.getItem('ghost_collected_cards') || '[]');
      setCollectedCards(new Set(ghostCards));
    };
    loadCollected();
  }, [user]);

  const handleCollect = (cardId: string) => {
    setCollectedCards(prev => new Set([...prev, cardId]));
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh' }}>
      {/* Brand Title — Top Left */}
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="ghost-toggle"
        style={{ left: 20 }}
      >
        ← Back
      </button>

      <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <header className="landing-header" style={{ marginTop: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            📋 Help Wanted
          </h1>
          <p style={{ opacity: 0.8, maxWidth: 500, margin: '0 auto' }}>
            Real work. Fair pay. 83.3% to you. Locked forever.
          </p>
          <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Unlock cards to discover opportunities. Click all 4 locks to collect.
          </p>
        </header>

        {/* Opportunity Cards — 3 visible + 1 chalk outline */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#c4b5fd' }}>
            Opportunities
          </h2>
          
          <div className="path-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            {/* Discovered Opportunity Cards */}
            {OPPORTUNITY_CARDS.map((card) => (
              <DeckCardFrame
                key={card.id}
                cardId={card.id}
                cardType="quest"
                title={card.title}
                description={card.description}
                icon={card.icon}
                destinationRoute={card.route}
                unlockCost={{ type: 'free', amount: 0 }}
                onCollect={handleCollect}
              />
            ))}

            {/* Chalk Outline — Hints at more to discover */}
            <DeckCardFrame
              cardId="hw-next"
              title="More Coming"
              icon="❓"
              isChalkOutline={true}
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#c4b5fd' }}>
            How It Works
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1.5rem',
            textAlign: 'center',
            maxWidth: 700,
            margin: '0 auto'
          }}>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Unlock</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Click all 4 locks on a card</p>
            </div>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎴</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Collect</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Card joins your deck</p>
            </div>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Work</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>You keep 83.3%</p>
            </div>
          </div>
        </div>

        {/* Ghost Banner (if not logged in) */}
        {!user && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.9)',
            padding: '1rem',
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 100,
          }}>
            <span style={{ opacity: 0.7 }}>👻 Exploring as Ghost</span>
            <span style={{ margin: '0 1rem', opacity: 0.4 }}>—</span>
            <span style={{ opacity: 0.5 }}>Your progress saves when you join</span>
            <button 
              onClick={() => navigate('/auth')}
              className="btn"
              style={{ marginLeft: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              Join for $5/year
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="landing-footer" style={{ paddingBottom: user ? '2rem' : '5rem' }}>
          <p>© 2026 Liana Banyan Corporation</p>
        </footer>
      </div>
    </div>
  );
}
