/**
 * DeckCardFrame — Reusable deck card with 4 corner locks
 *
 * Used throughout Liana Banyan for collectible cards.
 * Click all 4 locks to unlock and collect the card.
 * Some cards cost Marks or Joules to unlock each prong.
 *
 * SOCIAL UNLOCK: Cards can be unlocked by sharing Cue Cards.
 * When socialUnlock is provided, the card shows progress toward
 * unlock based on clicks on shared Cue Cards.
 *
 * V2 (Session 8H): Refined frame aesthetic — elegant museum-style
 * corners replacing emoji locks, inset border detail, subtle
 * metallic gradient. No more glassmorphism.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Unlock } from 'lucide-react';
import { getFrameLockProgress, getGhostFrameLockProgress, generateShareId } from '@/lib/cueCardClickTracking';

interface SocialUnlockConfig {
  type: 'personal' | 'global_pool';
  linkedCueCardId: string;
  clicksPerUnlock?: number; // Default 5
  linkedCueCardTitle?: string;
}

interface DeckCardFrameProps {
  cardId: string;
  cardType?: 'location' | 'ability' | 'treasure' | 'quest';
  title: string;
  description?: string;
  icon?: string;
  destinationRoute?: string;
  unlockCost?: {
    type: 'free' | 'marks' | 'joules' | 'social';
    amount: number;
  };
  socialUnlock?: SocialUnlockConfig; // NEW: Social unlock configuration
  isChalkOutline?: boolean; // Empty placeholder state
  onCollect?: (cardId: string) => void;
  onShareToUnlock?: (cardId: string, cueCardId: string) => void; // NEW: Callback when user wants to share
  children?: React.ReactNode;
}

interface LockState {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export function DeckCardFrame({
  cardId,
  cardType = 'location',
  title,
  description,
  icon = '🎴',
  destinationRoute,
  unlockCost = { type: 'free', amount: 0 },
  socialUnlock,
  isChalkOutline = false,
  onCollect,
  onShareToUnlock,
  children
}: DeckCardFrameProps) {
  const { toast } = useToast();
  const [locks, setLocks] = useState<LockState>({
    top: true,
    right: true,
    bottom: true,
    left: true
  });
  const [isCollected, setIsCollected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Social unlock state
  const [socialProgress, setSocialProgress] = useState<{
    totalClicks: number;
    clicksPerLock: number;
    locksUnlocked: number;
  } | null>(null);

  // Check if user already has this card
  useEffect(() => {
    checkIfCollected();
    if (socialUnlock) {
      loadSocialProgress();
    }
  }, [cardId, socialUnlock]);

  async function checkIfCollected() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Check localStorage for ghost users
      const ghostCards = JSON.parse(localStorage.getItem('ghost_collected_cards') || '[]');
      if (ghostCards.includes(cardId)) {
        setIsCollected(true);
        setLocks({ top: false, right: false, bottom: false, left: false });
      }
      return;
    }

    // Check database for real users
    const { data } = await supabase
      .from('user_discovered_cards')
      .select('id')
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .single();

    if (data) {
      setIsCollected(true);
      setLocks({ top: false, right: false, bottom: false, left: false });
    }
  }

  async function loadSocialProgress() {
    if (!socialUnlock) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Load from database for logged-in users
      const progress = await getFrameLockProgress(cardId, user.id);
      if (progress) {
        const locksUnlocked = [
          !progress.lockTop,
          !progress.lockRight,
          !progress.lockBottom,
          !progress.lockLeft
        ].filter(Boolean).length;
        
        setSocialProgress({
          totalClicks: progress.totalClicks,
          clicksPerLock: progress.clicksPerLock,
          locksUnlocked
        });
        
        // Update lock state based on social progress
        setLocks({
          top: progress.lockTop,
          right: progress.lockRight,
          bottom: progress.lockBottom,
          left: progress.lockLeft
        });
        
        if (progress.isFullyUnlocked) {
          setIsCollected(true);
        }
      }
    } else {
      // Load from localStorage for ghost users
      const progress = getGhostFrameLockProgress(cardId);
      if (progress) {
        const locksUnlocked = [
          !progress.lockTop,
          !progress.lockRight,
          !progress.lockBottom,
          !progress.lockLeft
        ].filter(Boolean).length;
        
        setSocialProgress({
          totalClicks: progress.totalClicks,
          clicksPerLock: progress.clicksPerLock,
          locksUnlocked
        });
        
        setLocks({
          top: progress.lockTop,
          right: progress.lockRight,
          bottom: progress.lockBottom,
          left: progress.lockLeft
        });
        
        if (progress.isFullyUnlocked) {
          setIsCollected(true);
        }
      }
    }
  }

  function handleShareToUnlock() {
    if (socialUnlock && onShareToUnlock) {
      onShareToUnlock(cardId, socialUnlock.linkedCueCardId);
    } else if (socialUnlock) {
      // Default behavior: show toast with instructions
      toast({
        title: "Share to Unlock",
        description: `Share the "${socialUnlock.linkedCueCardTitle || 'linked Cue Card'}" to earn clicks toward unlocking this card!`,
      });
    }
  }

  async function handleLockClick(position: keyof LockState) {
    if (isCollected || !locks[position]) return;

    // Check if unlock costs something
    if (unlockCost.type !== 'free' && unlockCost.amount > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: `Unlocking this lock costs ${unlockCost.amount} ${unlockCost.type}. Sign in to spend currency.`,
          variant: "destructive"
        });
        return;
      }

      // Check balance and deduct
      const currencyField = unlockCost.type === 'marks' ? 'marks_balance' : 'joules_balance';
      const { data: profile } = await supabase
        .from('profiles')
        .select(currencyField)
        .eq('id', user.id)
        .single();

      if (!profile || (profile as any)[currencyField] < unlockCost.amount) {
        toast({
          title: `Insufficient ${unlockCost.type}`,
          description: `You need ${unlockCost.amount} ${unlockCost.type} to unlock this lock.`,
          variant: "destructive"
        });
        return;
      }

      // Deduct currency
      await supabase
        .from('profiles')
        .update({ [currencyField]: (profile as any)[currencyField] - unlockCost.amount })
        .eq('id', user.id);
    }

    // Unlock this lock with animation
    setIsAnimating(true);
    const newLocks = { ...locks, [position]: false };
    setLocks(newLocks);

    // Play click sound effect (if we add one later)
    // playClickSound();

    // Check if all locks are now unlocked
    const allUnlocked = Object.values(newLocks).every(l => !l);
    if (allUnlocked) {
      setTimeout(() => {
        collectCard();
      }, 300);
    }

    setTimeout(() => setIsAnimating(false), 200);
  }

  async function collectCard() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Ghost user - store in localStorage
      const ghostCards = JSON.parse(localStorage.getItem('ghost_collected_cards') || '[]');
      if (!ghostCards.includes(cardId)) {
        ghostCards.push(cardId);
        localStorage.setItem('ghost_collected_cards', JSON.stringify(ghostCards));
      }
    } else {
      // Real user - store in database
      await supabase
        .from('user_discovered_cards')
        .upsert({
          user_id: user.id,
          card_id: cardId,
          discovered_at: new Date().toISOString()
        }, { onConflict: 'user_id,card_id' });
    }

    setIsCollected(true);
    toast({
      title: "Card Collected! 🎴",
      description: `"${title}" has been added to your deck.`,
    });

    onCollect?.(cardId);
  }

  const lockedCount = Object.values(locks).filter(Boolean).length;
  const frameClass = `deck-card-frame ${isCollected ? 'collected' : ''} ${isChalkOutline ? 'chalk-outline' : ''} ${isAnimating ? 'animating' : ''}`;

  if (isChalkOutline && !isCollected) {
    return (
      <div className={frameClass} style={styles.chalkFrame}>
        <div style={styles.chalkContent}>
          <span style={styles.chalkIcon}>?</span>
          <span style={styles.chalkText}>Undiscovered</span>
        </div>
        {/* Chalk outlines have no locks - they're pure placeholders */}
      </div>
    );
  }

  return (
    <div className={frameClass} style={styles.frame}>
      {/* Outer ornate border */}
      <div style={styles.outerBorder}>
        {/* Inner inset border */}
        <div style={styles.innerBorder}>

          {/* Four corner locks — positioned at corners of inner border */}
          {(['top', 'right', 'bottom', 'left'] as const).map((pos) => (
            <button
              key={pos}
              className={`deck-lock ${pos} ${!locks[pos] ? 'unlocked' : ''}`}
              onClick={() => handleLockClick(pos)}
              title={locks[pos]
                ? `Click to unlock (${unlockCost.type === 'free' ? 'free' : `${unlockCost.amount} ${unlockCost.type}`})`
                : 'Unlocked'}
              disabled={!locks[pos]}
              style={{
                ...styles.lockButton,
                ...styles[`lock_${pos}` as keyof typeof styles],
              }}
            >
              {locks[pos]
                ? <Lock className="h-3 w-3" />
                : <Unlock className="h-3 w-3" />}
            </button>
          ))}

          {/* Card content canvas */}
          <div style={styles.content}>
            {children || (
              <>
                <span style={styles.icon}>{icon}</span>
                <h3 style={styles.title}>{title}</h3>
                {description && <p style={styles.description}>{description}</p>}
                {isCollected && destinationRoute && (
                  <a href={destinationRoute} style={styles.goButton}>
                    Go &rarr;
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lock count indicator */}
      {lockedCount > 0 && !isCollected && !socialUnlock && (
        <div style={styles.lockIndicator}>
          {lockedCount}/4 locked
        </div>
      )}

      {/* Social unlock progress indicator */}
      {socialUnlock && !isCollected && (
        <div style={styles.socialProgress}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${socialProgress ? (socialProgress.locksUnlocked / 4) * 100 : 0}%`,
              }}
            />
          </div>
          <div style={styles.progressText}>
            {socialProgress
              ? `${socialProgress.totalClicks} clicks \u00b7 ${4 - socialProgress.locksUnlocked} locks remaining`
              : 'Share to unlock'}
          </div>
          <button onClick={handleShareToUnlock} style={styles.shareButton}>
            Share to Unlock
          </button>
        </div>
      )}

      {/* Collected badge */}
      {isCollected && (
        <div style={styles.collectedBadge}>
          <Unlock className="h-3 w-3 inline-block mr-1" style={{ verticalAlign: 'middle' }} />
          In Deck
        </div>
      )}
    </div>
  );
}

// ── Elegant Museum-Style Styling ──
const styles: { [key: string]: React.CSSProperties } = {
  frame: {
    position: 'relative',
    padding: '4px',
    // Subtle metallic gradient border via background on frame
    background: 'linear-gradient(145deg, hsl(var(--primary) / 0.15), hsl(var(--muted) / 0.3), hsl(var(--primary) / 0.10))',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    minHeight: '200px',
    boxShadow: '0 2px 8px hsl(var(--foreground) / 0.08), inset 0 1px 0 hsl(var(--background) / 0.5)',
  },
  outerBorder: {
    border: '1px solid hsl(var(--border))',
    borderRadius: '4px',
    padding: '6px',
    height: '100%',
    background: 'hsl(var(--card))',
  },
  innerBorder: {
    position: 'relative',
    border: '1px solid hsl(var(--border) / 0.5)',
    borderRadius: '2px',
    padding: '1.25rem',
    height: '100%',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column',
  },
  chalkFrame: {
    position: 'relative',
    padding: '4px',
    background: 'hsl(var(--muted) / 0.3)',
    borderRadius: '6px',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed hsl(var(--border) / 0.4)',
  },
  chalkContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    opacity: 0.35,
  },
  chalkIcon: {
    fontSize: '1.75rem',
    fontFamily: 'serif',
  },
  chalkText: {
    fontSize: '0.8rem',
    fontStyle: 'italic',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flex: 1,
    gap: '0.5rem',
  },
  icon: {
    fontSize: '1.75rem',
    marginBottom: '0.25rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
    letterSpacing: '0.01em',
    color: 'hsl(var(--foreground))',
  },
  description: {
    fontSize: '0.8rem',
    color: 'hsl(var(--muted-foreground))',
    margin: 0,
    lineHeight: 1.5,
    maxWidth: '90%',
  },
  goButton: {
    marginTop: '0.75rem',
    padding: '0.35rem 1rem',
    background: 'hsl(var(--primary))',
    borderRadius: '4px',
    color: 'hsl(var(--primary-foreground))',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },
  // Lock buttons — small, refined, positioned at corners
  lockButton: {
    position: 'absolute',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '1.5px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 2,
    padding: 0,
    boxShadow: '0 1px 3px hsl(var(--foreground) / 0.1)',
  },
  lock_top: { top: '-11px', left: '50%', transform: 'translateX(-50%)' },
  lock_right: { right: '-11px', top: '50%', transform: 'translateY(-50%)' },
  lock_bottom: { bottom: '-11px', left: '50%', transform: 'translateX(-50%)' },
  lock_left: { left: '-11px', top: '50%', transform: 'translateY(-50%)' },
  lockIndicator: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    fontSize: '0.65rem',
    color: 'hsl(var(--muted-foreground))',
    letterSpacing: '0.03em',
  },
  collectedBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '0.65rem',
    background: 'hsl(142 76% 36% / 0.12)',
    color: 'hsl(142 76% 36%)',
    padding: '2px 8px',
    borderRadius: '3px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    border: '1px solid hsl(142 76% 36% / 0.2)',
  },
  socialProgress: {
    position: 'absolute',
    bottom: '10px',
    left: '12px',
    right: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  progressBar: {
    height: '3px',
    background: 'hsl(var(--muted))',
    borderRadius: '1.5px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'hsl(var(--primary))',
    borderRadius: '1.5px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.6rem',
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center' as const,
    letterSpacing: '0.03em',
  },
  shareButton: {
    fontSize: '0.65rem',
    padding: '3px 8px',
    background: 'hsl(var(--primary) / 0.08)',
    border: '1px solid hsl(var(--primary) / 0.2)',
    borderRadius: '3px',
    color: 'hsl(var(--primary))',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '2px',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
};

export default DeckCardFrame;
