import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface AdaptRadarChartProps {
  scores: {
    effectiveness: number;
    adaptability: number;
    durability: number;
    alignment: number;
    participation: number;
    transmission: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  tierColor?: string;
}

const DIMENSIONS = [
  { key: 'effectiveness', short: 'E', full: 'Effectiveness' },
  { key: 'adaptability', short: 'A', full: 'Adaptability' },
  { key: 'durability', short: 'D', full: 'Durability' },
  { key: 'alignment', short: 'A₂', full: 'Alignment' },
  { key: 'participation', short: 'P', full: 'Participation' },
  { key: 'transmission', short: 'T', full: 'Transmission' },
] as const;

function getTierColor(composite: number): string {
  if (composite >= 90) return '#E5E4E2';
  if (composite >= 75) return '#FFD700';
  if (composite >= 60) return '#C0C0C0';
  if (composite >= 40) return '#CD7F32';
  return '#DC2626';
}

const SIZE_MAP = { sm: 200, md: 300, lg: 400 };

export function AdaptRadarChart({
  scores,
  size = 'md',
  showLabels = true,
  tierColor,
}: AdaptRadarChartProps) {
  const values = Object.values(scores);
  const composite = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const fillColor = tierColor ?? getTierColor(composite);
  const useFull = size === 'lg';

  const data = DIMENSIONS.map((d) => ({
    label: useFull ? d.full : d.short,
    value: scores[d.key as keyof typeof scores] ?? 0,
    fullMark: 100,
  }));

  const px = SIZE_MAP[size];

  return (
    <ResponsiveContainer width={px} height={px}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid gridType="polygon" />
        {showLabels && (
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: size === 'sm' ? 10 : 12, fill: '#888' }}
          />
        )}
        <Radar
          dataKey="value"
          stroke={fillColor}
          fill={fillColor}
          fillOpacity={0.6}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
