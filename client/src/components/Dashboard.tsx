import { CircularProgress } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS_QUERY } from '../graphql/queries';
import { logger } from '../utils/logger';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  loading?: boolean;
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

const StatCard = ({ title, value, icon, loading }: StatCardProps) => (
  <div className="bg-gradient-to-br from-white/90 via-amber-50/50 to-orange-50/60 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-xl border border-amber-200/40 hover:shadow-2xl hover:border-amber-300/50 transition-all duration-300 group hover:scale-[1.02] ring-2 ring-amber-100/30">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-gray-600/80 text-xs sm:text-sm font-bold uppercase tracking-wider">{title}</h3>
        {loading ? (
          <div className="mt-2 h-6 sm:h-8 bg-gradient-to-r from-amber-200/50 via-orange-200/50 to-red-200/50 rounded animate-pulse"></div>
        ) : (
          <p className="text-gray-800 text-xl sm:text-2xl font-bold mt-2 group-hover:text-amber-700 transition-colors duration-300 drop-shadow-sm">{value}</p>
        )}
      </div>
      {icon && (
        <div className="text-amber-500/70 group-hover:text-amber-600 group-hover:scale-110 transition-all duration-300 drop-shadow-lg">
          {icon}
        </div>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_STATS_QUERY, {
    errorPolicy: 'all',
    pollInterval: 30000, // Refresh every 30 seconds
    onError: (error) => {
      logger.error('Failed to fetch dashboard stats', error, {
        component: 'Dashboard',
        action: 'fetchStats',
      });
    },
  });

  const stats = data?.dashboardStats;
  const occupancyRate = stats?.occupancyRate || 0;

  // Fallback data when server is unavailable
  const fallbackStats = {
    totalRooms: 100,
    occupiedRooms: 82,
    availableRooms: 18,
    checkInsToday: 12,
    checkOutsToday: 8,
    occupancyRate: 82,
  };

  const displayStats = stats || (error ? fallbackStats : null);

  if (error && !data) {
    logger.warn('Dashboard using fallback data', {
      component: 'Dashboard',
      action: 'fallbackMode',
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <div className="bg-gradient-to-br from-white/90 via-amber-50/50 to-orange-50/60 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-xl border border-amber-200/40 hover:shadow-2xl hover:border-amber-300/50 transition-all duration-300 hover:scale-[1.02] ring-2 ring-amber-100/30">
        <h3 className="text-gray-600/80 text-xs sm:text-sm font-bold uppercase tracking-wider">OCCUPANCY RATE</h3>
        <div className="flex items-center justify-center mt-4">
          <div className="relative">
            {loading ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-amber-200/50 via-orange-200/50 to-red-200/50 rounded-full animate-pulse"></div>
            ) : (
              <>
                <CircularProgress
                  variant="determinate"
                  value={occupancyRate}
                  size={window.innerWidth < 640 ? 64 : 80}
                  thickness={4}
                  sx={{
                    color: '#f59e0b', // amber-500
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="text-gray-800 text-lg sm:text-xl font-bold drop-shadow-sm">
                    {Math.round(occupancyRate)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        {error && !data && (
          <p className="text-xs text-amber-600 mt-2 text-center font-medium">Offline data</p>
        )}
      </div>
      
      <StatCard 
        title="AVAILABLE ROOMS" 
        value={displayStats?.availableRooms || 0}
        loading={loading}
      />
      <StatCard 
        title="CHECK-INS TODAY" 
        value={displayStats?.checkInsToday || 0}
        loading={loading}
      />
      <StatCard 
        title="CHECK-OUTS TODAY" 
        value={displayStats?.checkOutsToday || 0}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
