/**
 * HeroKeySVG — Reusable keyhole icon extracted from the hero card "O" in Ourselves.
 * Used on Durin's Door lintel and as page icon.
 */
interface HeroKeySVGProps {
  size?: number;
  lit?: boolean;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
}

export function HeroKeySVG({ size = 32, lit = false, onClick, className = '', tooltip }: HeroKeySVGProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : undefined,
        filter: lit ? 'drop-shadow(0 0 6px rgba(214, 158, 46, 0.7))' : undefined,
        transition: 'filter 0.3s ease',
      }}
      onClick={onClick}
      title={tooltip}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      onMouseOver={(e) => {
        if (!lit) {
          const svg = e.currentTarget.querySelector('svg');
          if (svg) {
            const bg = svg.querySelector('.key-bg');
            if (bg) bg.setAttribute('fill', '#d69e2e');
            svg.querySelectorAll('.key-fill').forEach(f => f.setAttribute('fill', '#0a1628'));
          }
          e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(214, 158, 46, 0.7))';
        }
      }}
      onMouseOut={(e) => {
        if (!lit) {
          const svg = e.currentTarget.querySelector('svg');
          if (svg) {
            const bg = svg.querySelector('.key-bg');
            if (bg) bg.setAttribute('fill', '#0a1628');
            svg.querySelectorAll('.key-fill').forEach(f => f.setAttribute('fill', '#8b7355'));
          }
          e.currentTarget.style.filter = 'none';
        }
      }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        <ellipse
          cx="50" cy="50" rx="42" ry="44"
          fill={lit ? '#d69e2e' : '#0a1628'}
          className="key-bg"
          style={{ transition: 'fill 0.3s ease' }}
        />
        <circle
          cx="50" cy="44" r="10"
          fill={lit ? '#0a1628' : '#8b7355'}
          className="key-fill"
          style={{ transition: 'fill 0.3s ease' }}
        />
        <polygon
          points="44,52 38,78 62,78 56,52"
          fill={lit ? '#0a1628' : '#8b7355'}
          className="key-fill"
          style={{ transition: 'fill 0.3s ease' }}
        />
      </svg>
    </span>
  );
}

export default HeroKeySVG;
