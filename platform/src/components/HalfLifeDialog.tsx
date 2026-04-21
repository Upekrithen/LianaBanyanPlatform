import React from 'react';
import { SessionLoot } from '@/lib/ghostWorld';
import './HalfLifeDialog.css';

interface HalfLifeDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onBecomeMember: () => void;
  previousLoot: SessionLoot;
  remainingLoot: SessionLoot;
}

/**
 * Half-Life Welcome Back Dialog
 *
 * Shown when a Ghost (non-member) returns after their session expired.
 * Their loot has been halved — this dialog shows what was lost.
 *
 * "The crow remembers what the ghost forgets."
 */
export const HalfLifeDialog: React.FC<HalfLifeDialogProps> = ({
  isOpen,
  onContinue,
  onBecomeMember,
  previousLoot,
  remainingLoot,
}) => {
  if (!isOpen) return null;

  const lostGoldenKeys = previousLoot.goldenKeys - remainingLoot.goldenKeys;
  const lostCandles = previousLoot.candles - remainingLoot.candles;
  const lostFriendWords = previousLoot.friendWords.length - remainingLoot.friendWords.length;
  const lostAreas = previousLoot.areasDiscovered.length - remainingLoot.areasDiscovered.length;

  const totalPreviousItems =
    previousLoot.goldenKeys +
    Math.floor(previousLoot.candles) +
    previousLoot.friendWords.length +
    previousLoot.areasDiscovered.length +
    previousLoot.inventoryItems.length;

  const totalRemainingItems =
    remainingLoot.goldenKeys +
    Math.floor(remainingLoot.candles) +
    remainingLoot.friendWords.length +
    remainingLoot.areasDiscovered.length +
    remainingLoot.inventoryItems.length;

  return (
    <div className="halflife-overlay">
      <div className="halflife-dialog">
        <div className="halflife-header">
          <span className="halflife-icon">🪶</span>
          <h2>Welcome Back, Traveler</h2>
        </div>

        <p className="halflife-intro">
          Your logbook has faded while you were away.
          <br />
          <strong>Half your notes have been lost to time...</strong>
        </p>

        <div className="halflife-stats">
          <div className="halflife-stat-row">
            <span className="stat-label">Previous items:</span>
            <span className="stat-value previous">{totalPreviousItems}</span>
          </div>
          <div className="halflife-stat-row">
            <span className="stat-label">Remaining items:</span>
            <span className="stat-value remaining">{totalRemainingItems}</span>
          </div>
        </div>

        {(lostGoldenKeys > 0 || lostCandles > 0 || lostFriendWords > 0 || lostAreas > 0) && (
          <div className="halflife-losses">
            <h4>What Faded Away:</h4>
            <ul>
              {lostGoldenKeys > 0 && <li>🗝️ {lostGoldenKeys} Golden Keys</li>}
              {lostCandles > 0 && <li>🕯️ {lostCandles.toFixed(1)} Candles</li>}
              {lostFriendWords > 0 && <li>📜 {lostFriendWords} Friend Words</li>}
              {lostAreas > 0 && <li>🗺️ {lostAreas} Areas Discovered</li>}
            </ul>
          </div>
        )}

        <div className="halflife-actions">
          <button
            className="halflife-btn continue"
            onClick={onContinue}
          >
            Continue as Ghost
          </button>

          <button
            className="halflife-btn member"
            onClick={onBecomeMember}
          >
            Become a Member — $5/year
          </button>
        </div>

        <p className="halflife-tagline">
          <em>"Members never lose their logbooks."</em>
        </p>

        <div className="halflife-crow">
          <span>🪶</span>
          <p>The crow remembers what the ghost forgets.</p>
        </div>
      </div>
    </div>
  );
};

export default HalfLifeDialog;
