import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { GET_DASHBOARD_STATS_QUERY, REVENUE_STATS_QUERY } from '../graphql/queries';
import { sampleAnalyticsData } from '../utils/sampleAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const currentYear = new Date().getFullYear();
  
  const { data: dashboardData, loading: dashboardLoading } = useQuery(GET_DASHBOARD_STATS_QUERY, {
    pollInterval: 60000,
    errorPolicy: 'all',
  });

  const { data: revenueData, loading: revenueLoading } = useQuery(REVENUE_STATS_QUERY, {
    variables: { year: currentYear },
    errorPolicy: 'all',
  });

  // Use sample data as fallback or for development
  const currentAnalytics = sampleAnalyticsData[timeRange as keyof typeof sampleAnalyticsData];
  const stats = dashboardData?.dashboardStats;

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
  ];

  // Revenue Chart Data
  const revenueChartData = {
    labels: revenueData?.revenueStats?.map((stat: any) => stat.month) || 
            currentAnalytics.revenueStats.map(stat => new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData?.revenueStats?.map((stat: any) => stat.revenue) || 
              currentAnalytics.revenueStats.map(stat => stat.revenue),
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        borderColor: 'rgb(217, 119, 6)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Occupancy Chart Data (using seasonal trends)
  const occupancyChartData = {
    labels: currentAnalytics.seasonalTrends.map(trend => trend.month),
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: currentAnalytics.seasonalTrends.map(trend => trend.occupancy),
        backgroundColor: [
          'rgba(217, 119, 6, 0.8)',
          'rgba(5, 150, 105, 0.8)',
          'rgba(220, 38, 38, 0.8)',
          'rgba(217, 119, 6, 0.6)',
        ],
        borderColor: [
          'rgb(217, 119, 6)',
          'rgb(5, 150, 105)',
          'rgb(220, 38, 38)',
          'rgb(217, 119, 6)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Booking Trends Data
  const bookingTrendsData = {
    labels: currentAnalytics.bookingStats.map(stat => new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Bookings',
        data: currentAnalytics.bookingStats.map(stat => stat.bookings),
        backgroundColor: 'rgba(5, 150, 105, 0.6)',
        borderColor: 'rgb(5, 150, 105)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-primary/20 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base-content/70 text-sm font-medium">{title}</p>
          <p className="text-base-content text-2xl font-bold mt-2">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-base-content/70'
          }`}>
            <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {change}
          </div>
        </div>
        <div className="p-3 bg-primary/20 rounded-lg">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </div>
    </div>
  );

  if (dashboardLoading || revenueLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p className="text-white/90 text-lg">Business insights and performance metrics</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-base-content">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${stats?.revenue?.thisMonth?.toLocaleString() || '45,230'}`}
            change="+12.5% from last month"
            icon={CurrencyDollarIcon}
            trend="up"
          />
          <StatCard
            title="Bookings"
            value={stats?.checkInsToday + stats?.checkOutsToday || '156'}
            change="+8.2% from last month"
            icon={CalendarDaysIcon}
            trend="up"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${Math.round(stats?.occupancyRate || 78)}%`}
            change="+5.1% from last month"
            icon={HomeIcon}
            trend="up"
          />
          <StatCard
            title="Active Guests"
            value={stats?.totalGuests || '89'}
            change="-2.3% from last month"
            icon={UsersIcon}
            trend="down"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trends */}
          <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-primary/20">
            <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-2">
              <CurrencyDollarIcon className="h-6 w-6 text-primary" />
              Revenue Trends
            </h3>
            <div className="h-80">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Room Occupancy */}
          <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-primary/20">
            <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-2">
              <HomeIcon className="h-6 w-6 text-primary" />
              Room Occupancy
            </h3>
            <div className="h-80">
              <Doughnut data={occupancyChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-primary/20 mb-8">
          <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-primary" />
            Booking Trends
          </h3>
          <div className="h-80">
            <Bar data={bookingTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-primary/20">
          <h3 className="text-xl font-bold text-base-content mb-6">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">
                ${(stats?.revenue?.thisYear || 523000).toLocaleString()}
              </div>
              <div className="text-base-content/70">Total Revenue This Year</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalRooms || 120}
              </div>
              <div className="text-base-content/70">Total Rooms Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                ${Math.round(stats?.averageRoomRate || 180)}
              </div>
              <div className="text-base-content/70">Average Room Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;