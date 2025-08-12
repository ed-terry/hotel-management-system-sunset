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
  const trendColor = trend === 'up' ? 'text-success' : 'text-error';
  const bgGradient = trend === 'up' 
    ? 'from-success/5 to-success/10' 
    : 'from-error/5 to-error/10';

  return (
    <div className={`group bg-gradient-to-br from-base-100 to-base-200/50 backdrop-blur-sm rounded-2xl shadow-lg border border-primary/20 p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300 transform hover:scale-[1.02] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300 group-hover:scale-110`}>
          <Icon className="h-6 w-6 text-primary group-hover:text-secondary transition-colors duration-300" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${bgGradient} ${trendColor} backdrop-blur-sm border border-current/20 hover:scale-105 transition-transform duration-200`}>
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
        <h3 className="text-base-content/70 text-sm font-bold uppercase tracking-wider group-hover:text-base-content transition-colors duration-300">
          {title}
        </h3>
        <div className="flex items-baseline">
          <span className="text-2xl sm:text-3xl font-bold text-base-content group-hover:text-primary transition-colors duration-300">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
