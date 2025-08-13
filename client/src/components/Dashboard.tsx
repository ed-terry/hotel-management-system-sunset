import React from 'react';
import { CircularProgress } from '@mui/material';
import { useQuery } from '@apollo/client';
import { 
  HomeIcon as Home, 
  CheckCircleIcon as CheckCircle, 
  CalendarIcon as Calendar, 
  ExclamationTriangleIcon as AlertCircle 
} from '@heroicons/react/24/outline';
import { GET_DASHBOARD_STATS_QUERY } from '../graphql/queries';
import { logger } from '../utils/logger';

// Type definitions
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalGuests: number;
  checkInsToday: number;
  checkOutsToday: number;
  revenue: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
  occupancyRate: number;
  averageRoomRate: number;
}

interface DashboardData {
  dashboardStats: DashboardStats;
}

// Enhanced StatCard component with better styling and accessibility
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading, className = '' }) => (
  <div className={`
    bg-gradient-to-br from-base-100/90 via-orange-50/30 to-red-50/20 
    dark:from-base-200/90 dark:via-orange-900/20 dark:to-red-900/10
    backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-xl 
    border border-orange-200/40 dark:border-orange-800/40 
    hover:shadow-2xl hover:border-orange-300/60 dark:hover:border-orange-700/60
    transition-all duration-300 group hover:scale-[1.02] 
    ring-2 ring-orange-100/30 dark:ring-orange-900/30
    ${className}
  `}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-base-content/70 text-xs sm:text-sm font-bold uppercase tracking-wider">
          {title}
        </h3>
        {loading ? (
          <div className="mt-2 h-6 sm:h-8 bg-gradient-to-r from-orange-200/50 via-orange-300/50 to-red-200/50 rounded animate-pulse"></div>
        ) : (
          <p className="text-base-content text-xl sm:text-2xl font-bold mt-2 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300 drop-shadow-sm">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}
      </div>
      {icon && (
        <div className="text-orange-500/70 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:scale-110 transition-all duration-300 drop-shadow-lg">
          {icon}
        </div>
      )}
    </div>
  </div>
);

// Main Dashboard component with improved error handling and performance
const Dashboard: React.FC = () => {
  const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_STATS_QUERY, {
    errorPolicy: 'all',
    pollInterval: 30000, // Refresh every 30 seconds
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      logger.error('Failed to fetch dashboard stats', error, {
        component: 'Dashboard',
        action: 'fetchStats',
      });
    },
  });

  // Memoized fallback data for offline scenarios
  const fallbackStats = React.useMemo(() => ({
    totalRooms: 100,
    occupiedRooms: 82,
    availableRooms: 18,
    checkInsToday: 12,
    checkOutsToday: 8,
    occupancyRate: 82,
  }), []);

  // Compute display data with fallback support
  const displayStats = React.useMemo(() => {
    const stats = data?.dashboardStats;
    return stats || (error ? fallbackStats : null);
  }, [data?.dashboardStats, error, fallbackStats]);

  const occupancyRate = displayStats?.occupancyRate || 0;

  // Log fallback mode for debugging
  React.useEffect(() => {
    if (error && !data) {
      logger.warn('Dashboard using fallback data', {
        component: 'Dashboard',
        action: 'fallbackMode',
      });
    }
  }, [error, data]);

  // Responsive occupancy gauge size
  const gaugeSize = React.useMemo(() => 
    (typeof window !== 'undefined' && window.innerWidth < 640) ? 64 : 80, 
    []
  );

  // Error state with enhanced styling
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100/80 via-red-50/50 to-orange-200/40 dark:from-base-300/10 dark:via-orange-900/20 dark:to-red-900/10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-error/10 border-l-4 border-error rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-error mr-3" />
              <div>
                <h3 className="text-error font-medium">Dashboard Unavailable</h3>
                <p className="text-error/70 text-sm mt-1">
                  Using cached data. {error.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100/80 via-red-50/50 to-orange-200/40 dark:from-base-300/10 dark:via-orange-900/20 dark:to-red-900/10 p-4 sm:p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-700 via-red-600 to-orange-800 bg-clip-text text-transparent drop-shadow-sm">
              Dashboard Overview
            </h1>
            <p className="text-base-content/70 mt-2 font-medium">
              Real-time hotel management insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full shadow-lg ${
              error ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'
            }`}></div>
            <span className="text-base-content/60 text-sm font-medium">
              {error ? 'Offline Mode' : 'Live Updates'}
            </span>
          </div>
        </div>

        {/* Stats Grid with Occupancy Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Occupancy Rate Card */}
          <div className="bg-gradient-to-br from-base-100/90 via-orange-50/30 to-red-50/20 
                          dark:from-base-200/90 dark:via-orange-900/20 dark:to-red-900/10
                          backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-xl 
                          border border-orange-200/40 dark:border-orange-800/40 
                          hover:shadow-2xl hover:border-orange-300/60 dark:hover:border-orange-700/60
                          transition-all duration-300 hover:scale-[1.02] 
                          ring-2 ring-orange-100/30 dark:ring-orange-900/30">
            <h3 className="text-base-content/70 text-xs sm:text-sm font-bold uppercase tracking-wider">
              OCCUPANCY RATE
            </h3>
            <div className="flex items-center justify-center mt-4">
              <div className="relative">
                {loading ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-200/50 via-orange-300/50 to-red-200/50 rounded-full animate-pulse"></div>
                ) : (
                  <>
                    <CircularProgress
                      variant="determinate"
                      value={occupancyRate}
                      size={gaugeSize}
                      thickness={4}
                      sx={{
                        color: '#ea580c', // orange-600
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="text-base-content text-lg sm:text-xl font-bold drop-shadow-sm">
                        {Math.round(occupancyRate)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {error && !data && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 text-center font-medium">
                Offline data
              </p>
            )}
          </div>
          
          {/* Other Stats Cards */}
          <StatCard 
            title="AVAILABLE ROOMS" 
            value={displayStats?.availableRooms || 0}
            loading={loading}
            icon={<Home className="w-6 h-6 sm:w-8 sm:h-8" />}
            className="animate-in slide-in-from-bottom-4 duration-500 delay-100"
          />
          <StatCard 
            title="CHECK-INS TODAY" 
            value={displayStats?.checkInsToday || 0}
            loading={loading}
            icon={<CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
            className="animate-in slide-in-from-bottom-4 duration-500 delay-200"
          />
          <StatCard 
            title="CHECK-OUTS TODAY" 
            value={displayStats?.checkOutsToday || 0}
            loading={loading}
            icon={<Calendar className="w-6 h-6 sm:w-8 sm:h-8" />}
            className="animate-in slide-in-from-bottom-4 duration-500 delay-300"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
