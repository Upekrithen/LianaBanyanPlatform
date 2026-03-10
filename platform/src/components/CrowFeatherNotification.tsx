/**
 * CROW FEATHER NOTIFICATION
 * ==========================
 * Animated celebration when a user earns a Crow Feather.
 * Shows a dramatic reveal with the feather number and achievement details.
 * 
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { Feather, X } from 'lucide-react';
import { CrowFeather, FeatherCategory } from '@/lib/crowFeatherService';
import './CrowFeatherNotification.css';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CrowFeatherNotificationProps {
  feather: CrowFeather | null;
  onDismiss: () => void;
}

const CATEGORY_NAMES: Record<FeatherCategory, { name: string; verb: string }> = {
  chase_speed: { name: 'Speed Demon', verb: 'set the fastest chase time' },
  chase_streak: { name: 'Unstoppable', verb: 'achieved the longest win streak' },
  chase_earnings: { name: 'Big Winner', verb: 'earned the most Marks in a chase' },
  discovery: { name: 'Explorer', verb: 'discovered the most areas' },
  golden_keys: { name: 'Key Master', verb: 'collected the most golden keys' },
  candles: { name: 'Light Bearer', verb: 'collected the most candles' },
  mirror_travel: { name: 'Mirror Walker', verb: 'traversed the most mirrors' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CrowFeatherNotification: React.FC<CrowFeatherNotificationProps> = ({
  feather,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<'entering' | 'showing' | 'exiting'>('entering');

  useEffect(() => {
    if (feather) {
      setVisible(true);
      setStage('entering');
      
      // Transition to showing after entrance animation
      const showTimer = setTimeout(() => setStage('showing'), 600);
      
      // Auto-dismiss after 6 seconds
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 6000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [feather]);

  const handleDismiss = () => {
    setStage('exiting');
    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 400);
  };

  if (!visible || !feather) return null;

  const categoryInfo = CATEGORY_NAMES[feather.category];

  return (
    <div className={`crow-feather-notification ${stage}`} onClick={handleDismiss} onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') handleDismiss(); }} role="button" tabIndex={0} aria-label="Dismiss notification">
      <div className="cfn-backdrop" />
      
      <div className="cfn-content">
        {/* Particle effects */}
        <div className="cfn-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="cfn-particle"
              style={{
                '--delay': `${Math.random() * 0.5}s`,
                '--x': `${(Math.random() - 0.5) * 200}px`,
                '--y': `${(Math.random() - 0.5) * 200}px`,
                '--rotate': `${Math.random() * 360}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
        
        {/* Main feather icon */}
        <div className="cfn-feather-icon">
          <Feather className="w-16 h-16" />
        </div>
        
        {/* Title */}
        <h2 className="cfn-title">CROW FEATHER EARNED!</h2>
        
        {/* Feather number - the globally unique badge */}
        <div className="cfn-number">
          <span className="cfn-hash">#</span>
          <span className="cfn-digits">{feather.featherNumber}</span>
        </div>
        
        {/* Achievement details */}
        <div className="cfn-details">
          <div className="cfn-category">{categoryInfo.name}</div>
          <p className="cfn-verb">You {categoryInfo.verb}!</p>
          {feather.previousRecordValue && (
            <p className="cfn-previous">
              Previous record beaten: {formatValue(feather.category, feather.previousRecordValue)}
            </p>
          )}
        </div>
        
        {/* Close hint */}
        <p className="cfn-dismiss">Click anywhere to close</p>
        
        {/* Close button */}
        <button className="cfn-close" onClick={handleDismiss}>
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

function formatValue(category: FeatherCategory, value: number): string {
  switch (category) {
    case 'chase_speed':
      const seconds = Math.floor(value / 1000);
      const ms = value % 1000;
      return `${seconds}.${ms.toString().padStart(3, '0')}s`;
    case 'chase_earnings':
      return `${value} Marks`;
    case 'chase_streak':
      return `${value} wins`;
    default:
      return `${value}`;
  }
}

export default CrowFeatherNotification;
