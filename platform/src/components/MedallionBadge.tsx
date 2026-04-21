import { Award } from 'lucide-react';

interface MedallionBadgeProps {
  funded: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MedallionBadge({ funded, size = 'md' }: MedallionBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} font-semibold rounded-full ${
      funded
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
    }`}>
      <Award className="w-4 h-4" />
      <span>Medallion {funded ? '✓' : '⚠'}</span>
    </div>
  );
}
