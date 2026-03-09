import { motion } from 'framer-motion';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
  icon?: string;
}

interface DataVizBarProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  maxValue?: number;
  showValues?: boolean;
  showPercentages?: boolean;
  horizontal?: boolean;
  animated?: boolean;
  height?: number;
}

export function DataVizBar({
  data,
  title,
  subtitle,
  maxValue,
  showValues = true,
  showPercentages = false,
  horizontal = true,
  animated = true,
  height = 40
}: DataVizBarProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (horizontal) {
    return (
      <div className="my-8">
        {title && (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {subtitle}
          </p>
        )}

        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                {showValues && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.value.toLocaleString()}
                    {showPercentages && (
                      <span className="ml-1 text-gray-400">
                        ({((item.value / total) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </span>
                )}
              </div>
              
              <div 
                className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                style={{ height }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color || '#f97316' }}
                  initial={animated ? { width: 0 } : undefined}
                  animate={{ width: `${(item.value / max) * 100}%` }}
                  transition={{ 
                    duration: 0.8, 
                    delay: animated ? index * 0.1 : 0,
                    ease: 'easeOut'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {subtitle}
        </p>
      )}

      <div className="flex items-end justify-around gap-4 h-64">
        {data.map((item, index) => (
          <div key={item.label} className="flex flex-col items-center flex-1">
            <motion.div
              className="w-full rounded-t-lg"
              style={{ backgroundColor: item.color || '#f97316' }}
              initial={animated ? { height: 0 } : undefined}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ 
                duration: 0.8, 
                delay: animated ? index * 0.1 : 0,
                ease: 'easeOut'
              }}
            />
            <div className="mt-2 text-center">
              {item.icon && <span className="text-lg block">{item.icon}</span>}
              <span className="text-xs text-gray-600 dark:text-gray-400 block">
                {item.label}
              </span>
              {showValues && (
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.value.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ComparisonBarProps {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  leftColor?: string;
  rightColor?: string;
  title?: string;
}

export function ComparisonBar({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftColor = '#22c55e',
  rightColor = '#ef4444',
  title
}: ComparisonBarProps) {
  const total = leftValue + rightValue;
  const leftPercent = (leftValue / total) * 100;

  return (
    <div className="my-6">
      {title && (
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h4>
      )}
      
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: leftColor }}>{leftLabel}</span>
        <span style={{ color: rightColor }}>{rightLabel}</span>
      </div>
      
      <div className="h-8 rounded-full overflow-hidden flex">
        <motion.div
          className="h-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: leftColor }}
          initial={{ width: '50%' }}
          animate={{ width: `${leftPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {leftPercent > 15 && `${leftPercent.toFixed(0)}%`}
        </motion.div>
        <motion.div
          className="h-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: rightColor }}
          initial={{ width: '50%' }}
          animate={{ width: `${100 - leftPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {(100 - leftPercent) > 15 && `${(100 - leftPercent).toFixed(0)}%`}
        </motion.div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{leftValue.toLocaleString()}</span>
        <span>{rightValue.toLocaleString()}</span>
      </div>
    </div>
  );
}
