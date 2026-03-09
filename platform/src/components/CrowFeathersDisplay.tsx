import React from 'react';
import { CrowFeather, CATEGORY_NAMES, TIME_BRACKET_NAMES, formatCompletionTime } from '@/lib/ghostWorld';
import './CrowFeathersDisplay.css';

interface CrowFeathersDisplayProps {
  feathers: CrowFeather[];
  compact?: boolean;
  showBeaconRunsOnly?: boolean;
}

const BEACON_RUN_CATEGORIES = ['beacon_run_speed', 'beacons_dropped', 'beacon_runs_created'];

const isBeaconRunFeather = (feather: CrowFeather): boolean => {
  return BEACON_RUN_CATEGORIES.includes(feather.category);
};

/**
 * Crow Feathers Display
 * 
 * Shows a user's permanent Ghost World achievements.
 * These are the ONLY persistent thing for non-members.
 * 
 * "The crow remembers what the ghost forgets."
 */
export const CrowFeathersDisplay: React.FC<CrowFeathersDisplayProps> = ({
  feathers,
  compact = false,
  showBeaconRunsOnly = false,
}) => {
  // Filter feathers based on showBeaconRunsOnly
  const displayFeathers = showBeaconRunsOnly 
    ? feathers.filter(isBeaconRunFeather)
    : feathers;

  if (displayFeathers.length === 0) {
    return (
      <div className={`crow-feathers ${compact ? 'compact' : ''}`}>
        <div className="crow-empty">
          <span className="crow-icon">{showBeaconRunsOnly ? '🏁' : '🪶'}</span>
          <p>{showBeaconRunsOnly ? 'No Beacon Run Feathers yet' : 'No Crow Feathers yet'}</p>
          <p className="crow-hint">
            {showBeaconRunsOnly 
              ? 'Complete a Beacon Run in Ghost Mode to earn your first feather!'
              : 'Set a Ghost World record to earn your first feather!'}
          </p>
        </div>
      </div>
    );
  }

  // Sort by most recent
  const sortedFeathers = [...displayFeathers].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );

  // Separate Beacon Run feathers for special display
  const beaconRunFeathers = sortedFeathers.filter(isBeaconRunFeather);
  const otherFeathers = sortedFeathers.filter(f => !isBeaconRunFeather(f));

  if (compact) {
    const beaconCount = beaconRunFeathers.length;
    return (
      <div className="crow-feathers compact">
        <div className="crow-header-compact">
          <span>🪶</span>
          <span className="crow-count">{displayFeathers.length}</span>
          {beaconCount > 0 && (
            <span className="beacon-run-badge" title="Beacon Run Feathers">
              🏁 {beaconCount}
            </span>
          )}
        </div>
      </div>
    );
  }

  const formatRecordValue = (feather: CrowFeather): { value: string; label: string } => {
    if (feather.category === 'beacon_run_speed' || feather.category === 'labyrinth_speed') {
      return { 
        value: formatCompletionTime(feather.recordValue * 1000), 
        label: 'completion' 
      };
    }
    if (feather.category === 'beacons_dropped') {
      return { value: String(feather.recordValue), label: 'beacons' };
    }
    if (feather.category === 'beacon_runs_created') {
      return { value: String(feather.recordValue), label: 'runs created' };
    }
    return { value: String(feather.recordValue), label: 'collected' };
  };

  return (
    <div className="crow-feathers">
      <div className="crow-header">
        <span className="crow-icon">{showBeaconRunsOnly ? '🏁' : '🪶'}</span>
        <h3>{showBeaconRunsOnly ? 'Beacon Run Feathers' : 'Crow Feathers'}</h3>
        <span className="crow-count">{displayFeathers.length}</span>
      </div>

      {/* Beacon Run Feathers Section */}
      {beaconRunFeathers.length > 0 && !showBeaconRunsOnly && (
        <div className="beacon-run-section">
          <div className="section-header">
            <span>🏁</span>
            <h4>Beacon Run Achievements</h4>
          </div>
          <div className="crow-list beacon-run-list">
            {beaconRunFeathers.map((feather) => {
              const { value, label } = formatRecordValue(feather);
              return (
                <div key={feather.id} className="crow-feather-card beacon-run-card">
                  <div className="feather-number">#{feather.id}</div>
                  <div className="feather-icon">🏁</div>
                  <div className="feather-details">
                    <div className="feather-category">
                      {CATEGORY_NAMES[feather.category]}
                    </div>
                    <div className="feather-bracket">
                      {TIME_BRACKET_NAMES[feather.timeBracket]}
                    </div>
                  </div>
                  <div className="feather-record">
                    <span className="record-value">{value}</span>
                    <span className="record-label">{label}</span>
                  </div>
                  <div className="feather-date">
                    {new Date(feather.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show only beacon run feathers if filtered */}
      {showBeaconRunsOnly && (
        <div className="crow-list beacon-run-list">
          {beaconRunFeathers.map((feather) => {
            const { value, label } = formatRecordValue(feather);
            return (
              <div key={feather.id} className="crow-feather-card beacon-run-card">
                <div className="feather-number">#{feather.id}</div>
                <div className="feather-icon">🏁</div>
                <div className="feather-details">
                  <div className="feather-category">
                    {CATEGORY_NAMES[feather.category]}
                  </div>
                  <div className="feather-bracket">
                    {TIME_BRACKET_NAMES[feather.timeBracket]}
                  </div>
                </div>
                <div className="feather-record">
                  <span className="record-value">{value}</span>
                  <span className="record-label">{label}</span>
                </div>
                <div className="feather-date">
                  {new Date(feather.earnedAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Other Feathers Section */}
      {otherFeathers.length > 0 && !showBeaconRunsOnly && (
        <div className="other-feathers-section">
          {beaconRunFeathers.length > 0 && (
            <div className="section-header">
              <span>🪶</span>
              <h4>Other Achievements</h4>
            </div>
          )}
          <div className="crow-list">
            {otherFeathers.map((feather) => (
              <div key={feather.id} className="crow-feather-card">
                <div className="feather-number">#{feather.id}</div>
                <div className="feather-details">
                  <div className="feather-category">
                    {CATEGORY_NAMES[feather.category]}
                  </div>
                  <div className="feather-bracket">
                    {TIME_BRACKET_NAMES[feather.timeBracket]}
                  </div>
                </div>
                <div className="feather-record">
                  <span className="record-value">{feather.recordValue}</span>
                  <span className="record-label">
                    {feather.category === 'labyrinth_speed' ? 'seconds' : 'collected'}
                  </span>
                </div>
                <div className="feather-date">
                  {new Date(feather.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="crow-tagline">
        <span>🪶</span>
        <p>"The crow remembers what the ghost forgets."</p>
      </div>
    </div>
  );
};

/**
 * New Crow Feather Notification
 * 
 * Shown when a user earns a new Crow Feather
 */
interface NewFeatherNotificationProps {
  feather: CrowFeather;
  onClose: () => void;
}

export const NewFeatherNotification: React.FC<NewFeatherNotificationProps> = ({
  feather,
  onClose,
}) => {
  return (
    <div className="new-feather-overlay" onClick={onClose}>
      <div className="new-feather-card" onClick={(e) => e.stopPropagation()}>
        <div className="new-feather-celebration">
          <span className="feather-burst">🪶</span>
          <div className="celebration-rays"></div>
        </div>

        <h2>NEW RECORD!</h2>
        <h3>Crow Feather #{feather.id}</h3>

        <div className="new-feather-details">
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{CATEGORY_NAMES[feather.category]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Bracket:</span>
            <span className="detail-value">{TIME_BRACKET_NAMES[feather.timeBracket]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Record:</span>
            <span className="detail-value highlight">{feather.recordValue}</span>
          </div>
        </div>

        <p className="new-feather-tagline">
          "The crow remembers what the ghost forgets."
        </p>

        <button className="new-feather-close" onClick={onClose}>
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default CrowFeathersDisplay;
