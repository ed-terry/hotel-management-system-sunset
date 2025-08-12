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
  <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-primary/20 hover:shadow-xl hover:border-primary/30 transition-all duration-200 group">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-base-content/70 text-sm font-medium">{title}</h3>
        {loading ? (
          <div className="mt-2 h-8 bg-base-300 rounded animate-pulse"></div>
        ) : (
          <p className="text-base-content text-2xl font-bold mt-2 group-hover:text-primary transition-colors duration-200">{value}</p>
        )}
      </div>
      {icon && (
        <div className="text-primary/80 group-hover:text-primary group-hover:scale-110 transition-all duration-200">
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
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-base-200 rounded-lg p-6 shadow-lg border border-base-300">
        <h3 className="text-base-content/70 text-sm">OCCUPANCY RATE</h3>
        <div className="flex items-center justify-center mt-4">
          <div className="relative">
            {loading ? (
              <div className="w-20 h-20 bg-base-300 rounded-full animate-pulse"></div>
            ) : (
              <>
                <CircularProgress
                  variant="determinate"
                  value={occupancyRate}
                  size={80}
                  thickness={4}
                  className="text-accent"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="text-base-content text-xl font-semibold">
                    {Math.round(occupancyRate)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        {error && !data && (
          <p className="text-xs text-warning mt-2 text-center">Offline data</p>
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
