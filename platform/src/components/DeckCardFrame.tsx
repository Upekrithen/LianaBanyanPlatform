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
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
      {/* Four locks */}
      <button
        className={`deck-lock top ${!locks.top ? 'unlocked' : ''}`}
        onClick={() => handleLockClick('top')}
        title={locks.top ? `Click to unlock (${unlockCost.type === 'free' ? 'free' : `${unlockCost.amount} ${unlockCost.type}`})` : 'Unlocked'}
        disabled={!locks.top}
      >
        {locks.top ? '🔒' : '🔓'}
      </button>
      <button
        className={`deck-lock right ${!locks.right ? 'unlocked' : ''}`}
        onClick={() => handleLockClick('right')}
        title={locks.right ? `Click to unlock` : 'Unlocked'}
        disabled={!locks.right}
      >
        {locks.right ? '🔒' : '🔓'}
      </button>
      <button
        className={`deck-lock bottom ${!locks.bottom ? 'unlocked' : ''}`}
        onClick={() => handleLockClick('bottom')}
        title={locks.bottom ? `Click to unlock` : 'Unlocked'}
        disabled={!locks.bottom}
      >
        {locks.bottom ? '🔒' : '🔓'}
      </button>
      <button
        className={`deck-lock left ${!locks.left ? 'unlocked' : ''}`}
        onClick={() => handleLockClick('left')}
        title={locks.left ? `Click to unlock` : 'Unlocked'}
        disabled={!locks.left}
      >
        {locks.left ? '🔒' : '🔓'}
      </button>

      {/* Card content */}
      <div style={styles.content}>
        {children || (
          <>
            <span style={styles.icon}>{icon}</span>
            <h3 style={styles.title}>{title}</h3>
            {description && <p style={styles.description}>{description}</p>}
            {isCollected && destinationRoute && (
              <a href={destinationRoute} style={styles.goButton}>
                Go →
              </a>
            )}
          </>
        )}
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
                width: `${socialProgress ? (socialProgress.locksUnlocked / 4) * 100 : 0}%`
              }}
            />
          </div>
          <div style={styles.progressText}>
            {socialProgress 
              ? `${socialProgress.totalClicks} clicks • ${4 - socialProgress.locksUnlocked} locks left`
              : 'Share to unlock'}
          </div>
          <button 
            onClick={handleShareToUnlock}
            style={styles.shareButton}
          >
            🔗 Share to Unlock
          </button>
        </div>
      )}

      {/* Collected badge */}
      {isCollected && (
        <div style={styles.collectedBadge}>
          ✓ In Deck
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  frame: {
    position: 'relative',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '1.5rem',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
    minHeight: '180px',
  },
  chalkFrame: {
    position: 'relative',
    background: 'transparent',
    borderRadius: '15px',
    padding: '1.5rem',
    border: '2px dashed rgba(255,255,255,0.3)',
    minHeight: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chalkContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    opacity: 0.4,
  },
  chalkIcon: {
    fontSize: '2rem',
  },
  chalkText: {
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
    gap: '0.5rem',
  },
  icon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: 0,
  },
  description: {
    fontSize: '0.85rem',
    opacity: 0.8,
    margin: 0,
    lineHeight: 1.4,
  },
  goButton: {
    marginTop: '0.75rem',
    padding: '0.4rem 1rem',
    background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'transform 0.2s',
  },
  lockIndicator: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    fontSize: '0.7rem',
    opacity: 0.5,
    background: 'rgba(0,0,0,0.3)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  collectedBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '0.7rem',
    background: 'rgba(52, 211, 153, 0.3)',
    color: '#34d399',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: 600,
  },
  socialProgress: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    right: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  progressBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
  },
  shareButton: {
    fontSize: '0.7rem',
    padding: '4px 8px',
    background: 'rgba(167, 139, 250, 0.2)',
    border: '1px solid rgba(167, 139, 250, 0.3)',
    borderRadius: '6px',
    color: '#a78bfa',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '2px',
  },
};

export default DeckCardFrame;
