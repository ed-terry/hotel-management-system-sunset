import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const trendColor = trend === 'up' ? 'text-orange-600' : 'text-red-600';
  const bgGradient = trend === 'up' 
    ? 'from-emerald-100/80 to-emerald-200/60' 
    : 'from-red-100/80 to-red-200/60';

  return (
    <div className={`group bg-gradient-to-br from-white/95 via-amber-50/50 to-orange-50/60 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/40 p-6 hover:shadow-2xl hover:border-amber-300/50 transition-all duration-300 transform hover:scale-[1.02] ring-2 ring-amber-100/30 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-amber-100/60 to-orange-100/60 group-hover:from-amber-200/80 group-hover:to-orange-200/80 transition-all duration-300 group-hover:scale-110 shadow-lg border border-amber-200/40`}>
          <Icon className="h-6 w-6 text-amber-600 group-hover:text-orange-600 transition-colors duration-300 drop-shadow-lg" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${bgGradient} ${trendColor} backdrop-blur-sm border-2 border-current/30 hover:scale-105 transition-transform duration-200 shadow-lg`}>
            {trend === 'up' ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-bold">
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-gray-600/80 text-sm font-bold uppercase tracking-wider group-hover:text-gray-700 transition-colors duration-300">
          {title}
        </h3>
        <div className="flex items-baseline">
          <span className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300 drop-shadow-sm">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
