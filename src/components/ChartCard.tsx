import React from 'react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onExport?: () => void;
  height?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  trend,
  onExport,
  height = '300px'
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-gray-800 dark:text-white mb-1">{title}</h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              {trend.isPositive ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-gray-600 dark:text-gray-400">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            title="Export chart data"
          >
            <Download size={18} />
          </button>
        )}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
};
