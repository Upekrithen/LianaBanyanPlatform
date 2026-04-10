import { motion } from 'framer-motion';

interface CatapultGaugeProps {
  currentCP: number;
  label: string;
}

/**
 * Describes an SVG arc path from startAngle to endAngle (radians).
 * PI = left, 0 = right for a top-opening semicircle.
 */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);
  const largeArcFlag = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

export function CatapultGauge({ currentCP, label }: CatapultGaugeProps) {
  const cp = Math.min(Math.max(currentCP, 0), 100);
  const isLaunched = cp >= 100;

  const centerX = 120;
  const centerY = 110;
  const radius = 90;
  const startAngle = Math.PI;
  const endAngle = 0;

  const progressAngle = startAngle - (cp / 100) * Math.PI;
  const bgArcPath = describeArc(centerX, centerY, radius, startAngle, endAngle);
  const progressArcPath = describeArc(centerX, centerY, radius, startAngle, progressAngle);

  const gradId = `catapult-grad-${label.replace(/\s/g, '-')}`;

  return (
    <div className="flex flex-col items-center p-4">
      <svg width="240" height="140" viewBox="0 0 240 140">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor={isLaunched ? '#10B981' : '#FBBF24'} />
          </linearGradient>
        </defs>

        <path
          d={bgArcPath}
          fill="none"
          stroke="#374151"
          strokeWidth="16"
          strokeLinecap="round"
        />

        <motion.path
          d={progressArcPath}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="16"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          className="fill-white"
          style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace' }}
        >
          {Math.round(cp)}
        </text>

        <text
          x={centerX}
          y={centerY + 14}
          textAnchor="middle"
          className="fill-gray-400"
          style={{ fontSize: '14px', fontFamily: 'sans-serif' }}
        >
          {isLaunched ? 'LAUNCHED' : 'CP'}
        </text>

        <text x="18" y={centerY + 30} className="fill-gray-500" style={{ fontSize: '12px' }}>0</text>
        <text x="212" y={centerY + 30} className="fill-gray-500" style={{ fontSize: '12px' }}>100</text>
      </svg>

      <p className="text-sm text-gray-300 mt-1 text-center max-w-[220px] truncate" title={label}>
        {label}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">
        {isLaunched ? 'Escape velocity reached' : `${Math.round(cp)} CP / 100 CP needed`}
      </p>
    </div>
  );
}

export default CatapultGauge;
