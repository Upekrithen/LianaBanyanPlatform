/**
 * DeckCardFrame — Museum-style picture frame with 4 corner locks
 *
 * Features:
 * - Wide ornate gold/bronze frame border like museum paintings
 * - Plaque underneath with card title
 * - 4 corner locks (top, right, bottom, left)
 * - Standard dimensions across all cards
 * - onClick handler when fully unlocked
 */

import { useState } from 'react';
import { isHelpTypeDismissed, HelpDialogType } from './ShowMeHelp';

interface DeckCardFrameProps {
  cardData: {
    topText?: string;
    bottomText?: string;
    icon?: string;
    image?: string;
    plaqueTitle: string;
    plaqueSubtitle?: string;
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  };
  initialUnlocked?: boolean;
  onCardClick?: () => void;
  cardId?: string;
  // Help mode props - when true, clicks show help dialogs instead of doing actions
  helpMode?: boolean;
  onHelpClick?: (elementName: string, description: string, actionName?: string, onProceed?: () => void, dialogType?: HelpDialogType) => void;
  // Custom help content for when card is clicked (overrides default)
  helpContent?: {
    locked?: { title: string; content: string; actionLabel?: string; onProceed?: () => void };
    unlocked?: { title: string; content: string; actionLabel?: string; onProceed?: () => void };
  };
}

const RARITY_COLORS = {
  common: {
    frame: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
    inner: '#1f2937',
    glow: 'rgba(107, 114, 128, 0.3)',
    plaque: '#4b5563'
  },
  uncommon: {
    frame: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
    inner: '#064e3b',
    glow: 'rgba(5, 150, 105, 0.3)',
    plaque: '#047857'
  },
  rare: {
    frame: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
    inner: '#1e3a8a',
    glow: 'rgba(59, 130, 246, 0.3)',
    plaque: '#2563eb'
  },
  epic: {
    frame: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
    inner: '#4c1d95',
    glow: 'rgba(139, 92, 246, 0.4)',
    plaque: '#7c3aed'
  },
  legendary: {
    frame: 'linear-gradient(145deg, #fcd34d 0%, #f59e0b 20%, #d97706 40%, #b45309 60%, #d97706 80%, #f59e0b 100%)',
    inner: '#78350f',
    glow: 'rgba(245, 158, 11, 0.5)',
    plaque: '#b45309'
  },
  mythic: {
    frame: 'linear-gradient(145deg, #fca5a5 0%, #ef4444 20%, #dc2626 40%, #b91c1c 60%, #dc2626 80%, #ef4444 100%)',
    inner: '#7f1d1d',
    glow: 'rgba(239, 68, 68, 0.6)',
    plaque: '#b91c1c'
  },
};

interface LockState {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

// Fixed dimensions for ALL cards to be uniform
const CARD_WIDTH = 220;
const CARD_HEIGHT = 280;
const FRAME_PADDING = 18;
const CANVAS_WIDTH = CARD_WIDTH - (FRAME_PADDING * 2) - 8; // 184px
const CANVAS_HEIGHT = CARD_HEIGHT - (FRAME_PADDING * 2) - 8; // 244px

export function DeckCardFrame({ cardData, initialUnlocked = false, onCardClick, helpMode = false, onHelpClick, helpContent }: DeckCardFrameProps) {
  const [locks, setLocks] = useState<LockState>({
    top: !initialUnlocked,
    right: !initialUnlocked,
    bottom: !initialUnlocked,
    left: !initialUnlocked
  });
  const [isCollected, setIsCollected] = useState(initialUnlocked);

  const rarity = cardData.rarity || 'legendary';
  const colors = RARITY_COLORS[rarity];

  function doUnlock(position: keyof LockState) {
    const newLocks = { ...locks, [position]: false };
    setLocks(newLocks);
    const allUnlocked = Object.values(newLocks).every(l => !l);
    if (allUnlocked) {
      setTimeout(() => setIsCollected(true), 300);
    }
  }

  function handleLockClick(position: keyof LockState, e: React.MouseEvent) {
    e.stopPropagation();
    if (isCollected || !locks[position]) return;

    // If help mode is on, show help dialog first (unless dismissed)
    if (helpMode && onHelpClick) {
      // Check if lock reminders are dismissed
      if (isHelpTypeDismissed('lock')) {
        // Skip the dialog, just unlock
        doUnlock(position);
        return;
      }

      const positionName = position.charAt(0).toUpperCase() + position.slice(1);
      onHelpClick(
        `${positionName} Lock`,
        `This is one of four locks on the "${cardData.plaqueTitle}" card. Clicking a lock unlocks that corner. Once all four corners are unlocked, the card becomes active and you can click it to proceed.\n\n**Tip:** Unlock all four corners to activate this card and see what's inside!`,
        `Unlock ${positionName} Lock`,
        () => doUnlock(position),
        'lock' // dialogType for "don't show again" checkbox
      );
      return;
    }

    doUnlock(position);
  }

  function handleCardClick() {
    // If help mode is on, ALWAYS show help dialog - even if not fully unlocked
    if (helpMode && onHelpClick) {
      const locksRemaining = Object.values(locks).filter(Boolean).length;

      if (locksRemaining > 0) {
        // Card is still locked - use custom content if provided
        if (helpContent?.locked) {
          onHelpClick(
            helpContent.locked.title,
            helpContent.locked.content + `\n\n**Status:** You still need to unlock ${locksRemaining} more ${locksRemaining === 1 ? 'lock' : 'locks'} to activate this card.\n\n**Tip:** Click each of the 🔒 locks around the card's corners to unlock them!`,
            helpContent.locked.actionLabel,
            helpContent.locked.onProceed
          );
        } else {
          // Default locked content
          const lockWord = locksRemaining === 1 ? 'lock' : 'locks';
          onHelpClick(
            cardData.plaqueTitle,
            `**${cardData.topText || cardData.plaqueTitle}**\n${cardData.bottomText || ''}\n\n**What this card does:**\nOnce unlocked, this card will take you to explore this section of the platform.\n\n**Status:** You still need to unlock ${locksRemaining} more ${lockWord} to activate this card.\n\n**Tip:** Click each of the 🔒 locks around the card's corners to unlock them!`,
            undefined,
            undefined
          );
        }
      } else {
        // Card is fully unlocked - use custom content if provided
        if (helpContent?.unlocked) {
          // Use custom onProceed if provided, otherwise fall back to onCardClick
          const proceedAction = helpContent.unlocked.onProceed || onCardClick;
          onHelpClick(
            helpContent.unlocked.title,
            helpContent.unlocked.content,
            helpContent.unlocked.actionLabel,
            proceedAction
          );
        } else if (isCollected && onCardClick) {
          // Default unlocked with action
          onHelpClick(
            cardData.plaqueTitle,
            `**${cardData.topText || cardData.plaqueTitle}**\n${cardData.bottomText || ''}\n\n**This card is unlocked!** ✓\n\nClicking "Proceed" will take you to this section of the platform where you can explore and learn more.`,
            `Go to ${cardData.plaqueTitle}`,
            onCardClick
          );
        } else {
          // Default unlocked without action
          onHelpClick(
            cardData.plaqueTitle,
            `**${cardData.topText || cardData.plaqueTitle}**\n${cardData.bottomText || ''}\n\n**This card is unlocked!** ✓\n\nThis is an informational card. It represents a key concept of the platform.`,
            undefined,
            undefined
          );
        }
      }
      return;
    }

    // Normal mode - only trigger if unlocked and has action
    if (isCollected && onCardClick) {
      onCardClick();
    }
  }

  const lockedCount = Object.values(locks).filter(Boolean).length;
  const isClickable = isCollected && onCardClick;
  // In help mode, the card is always clickable to show help
  const isHelpClickable = helpMode && onHelpClick;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      width: `${CARD_WIDTH}px`, // Fixed width for container
    }}>
      {/* The Frame - square outside corners */}
      <div
        onClick={handleCardClick}
        style={{
          position: 'relative',
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          padding: `${FRAME_PADDING}px`,
          background: colors.frame,
          borderRadius: '0', // Square outside corners
          boxShadow: `
            0 8px 32px ${colors.glow},
            inset 0 2px 4px rgba(255,255,255,0.3),
            inset 0 -2px 4px rgba(0,0,0,0.3),
            0 2px 8px rgba(0,0,0,0.5)
          `,
          cursor: (isClickable || isHelpClickable) ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          if (isClickable || isHelpClickable) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = `0 12px 40px ${colors.glow}, inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.6)`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = `0 8px 32px ${colors.glow}, inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.5)`;
        }}
      >
        {/* Inner frame border (darker inset) with rounded corners */}
        <div style={{
          padding: '4px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
          borderRadius: '12px', // Rounded inside transition
          height: '100%',
          boxSizing: 'border-box',
        }}>
          {/* The "canvas" area - rounded corners on the inside */}
          <div style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            background: colors.inner,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'hidden',
            padding: cardData.image ? '0' : '16px 12px',
            borderRadius: '8px', // Rounded inside corners
          }}>
            {cardData.image ? (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, #d4d4d4 0%, #a3a3a3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={cardData.image}
                  alt={cardData.plaqueTitle || 'Card image'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            ) : (
              <>
                {/* Top Text */}
                {cardData.topText && (
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    padding: '0 4px',
                  }}>
                    {cardData.topText}
                  </div>
                )}

                {/* Icon */}
                <div style={{
                  fontSize: '4.5rem',
                  lineHeight: 1,
                }}>
                  {cardData.icon || '🃏'}
                </div>

                {/* Bottom Text */}
                {cardData.bottomText && (
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.85)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    padding: '0 4px',
                  }}>
                    {cardData.bottomText}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Four corner locks */}
        <button
          onClick={(e) => handleLockClick('top', e)}
          disabled={!locks.top}
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: locks.top ? 'rgba(30, 30, 50, 0.95)' : 'rgba(34, 197, 94, 0.4)',
            border: `2px solid ${locks.top ? '#f59e0b' : '#22c55e'}`,
            borderRadius: '6px',
            padding: '2px 6px',
            cursor: locks.top ? 'pointer' : 'default',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          title={locks.top ? 'Click to unlock' : 'Unlocked'}
        >
          {locks.top ? '🔒' : '🔓'}
        </button>

        <button
          onClick={(e) => handleLockClick('right', e)}
          disabled={!locks.right}
          style={{
            position: 'absolute',
            right: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: locks.right ? 'rgba(30, 30, 50, 0.95)' : 'rgba(34, 197, 94, 0.4)',
            border: `2px solid ${locks.right ? '#f59e0b' : '#22c55e'}`,
            borderRadius: '6px',
            padding: '2px 6px',
            cursor: locks.right ? 'pointer' : 'default',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          title={locks.right ? 'Click to unlock' : 'Unlocked'}
        >
          {locks.right ? '🔒' : '🔓'}
        </button>

        <button
          onClick={(e) => handleLockClick('bottom', e)}
          disabled={!locks.bottom}
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: locks.bottom ? 'rgba(30, 30, 50, 0.95)' : 'rgba(34, 197, 94, 0.4)',
            border: `2px solid ${locks.bottom ? '#f59e0b' : '#22c55e'}`,
            borderRadius: '6px',
            padding: '2px 6px',
            cursor: locks.bottom ? 'pointer' : 'default',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          title={locks.bottom ? 'Click to unlock' : 'Unlocked'}
        >
          {locks.bottom ? '🔒' : '🔓'}
        </button>

        <button
          onClick={(e) => handleLockClick('left', e)}
          disabled={!locks.left}
          style={{
            position: 'absolute',
            left: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: locks.left ? 'rgba(30, 30, 50, 0.95)' : 'rgba(34, 197, 94, 0.4)',
            border: `2px solid ${locks.left ? '#f59e0b' : '#22c55e'}`,
            borderRadius: '6px',
            padding: '2px 6px',
            cursor: locks.left ? 'pointer' : 'default',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          title={locks.left ? 'Click to unlock' : 'Unlocked'}
        >
          {locks.left ? '🔒' : '🔓'}
        </button>

        {/* Lock count indicator */}
        {lockedCount > 0 && !isCollected && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            fontSize: '0.6rem',
            opacity: 0.6,
            background: 'rgba(0,0,0,0.5)',
            padding: '2px 5px',
            borderRadius: '3px',
            color: '#fff',
          }}>
            {lockedCount}/4
          </div>
        )}

        {/* Collected badge */}
        {isCollected && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '0.65rem',
            background: 'rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            padding: '2px 6px',
            borderRadius: '8px',
            fontWeight: 600,
          }}>
            ✓ In Deck
          </div>
        )}

        {/* Click hint when unlocked */}
        {isCollected && onCardClick && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.6rem',
            background: 'rgba(59, 130, 246, 0.4)',
            color: '#93c5fd',
            padding: '2px 8px',
            borderRadius: '8px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            Click to Enter
          </div>
        )}
      </div>

      {/* Museum Plaque - matches card width */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.plaque} 0%, ${colors.inner} 100%)`,
        padding: '10px 16px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
        textAlign: 'center',
        width: `${CARD_WIDTH}px`,
        height: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.3,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {cardData.plaqueTitle}
        </div>
        {cardData.plaqueSubtitle && (
          <div style={{
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '3px',
            lineHeight: 1.2,
          }}>
            {cardData.plaqueSubtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeckCardFrame;
