// Mock Analytics Data Generator
// This provides fallback data when the server analytics endpoint is not available

export interface MockAnalyticsData {
    revenueStats: Array<{
        date: string;
        revenue: number;
        period: string;
    }>;
    bookingStats: Array<{
        date: string;
        bookings: number;
        period: string;
    }>;
    occupancyStats: {
        rate: number;
        change: number;
        trend: 'up' | 'down';
        occupancyRate: number;
    };
    performanceMetrics: {
        totalRevenue: number;
        revenueChange: number;
        totalBookings: number;
        bookingChange: number;
        occupancyRate: number;
        occupancyChange: number;
        averageStayDuration: number;
        stayDurationChange: number;
    };
}

export const generateMockAnalyticsData = (period: string): MockAnalyticsData => {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

    // Generate revenue data
    const revenueStats = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        revenueStats.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 50000) + 80000,
            period: period
        });
    }

    // Generate booking data
    const bookingStats = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        bookingStats.push({
            date: date.toISOString().split('T')[0],
            bookings: Math.floor(Math.random() * 50) + 100,
            period: period
        });
    }

    // Base metrics
    const baseOccupancy = 78.2;
    const baseRevenue = 125000;
    const baseBookings = 340;
    const baseStayDuration = 2.4;

    // Adjust for period
    const periodMultiplier = period === '7d' ? 0.25 : period === '90d' ? 3 : period === '1y' ? 12 : 1;

    return {
        revenueStats,
        bookingStats,
        occupancyStats: {
            rate: baseOccupancy + (Math.random() - 0.5) * 10,
            change: (Math.random() - 0.5) * 20,
            trend: Math.random() > 0.5 ? 'up' : 'down',
            occupancyRate: baseOccupancy
        },
        performanceMetrics: {
            totalRevenue: baseRevenue * periodMultiplier,
            revenueChange: (Math.random() - 0.3) * 30, // Slight positive bias
            totalBookings: Math.floor(baseBookings * periodMultiplier),
            bookingChange: (Math.random() - 0.3) * 25,
            occupancyRate: baseOccupancy,
            occupancyChange: (Math.random() - 0.5) * 15,
            averageStayDuration: baseStayDuration + (Math.random() - 0.5) * 1,
            stayDurationChange: (Math.random() - 0.5) * 2
        }
    };
};

// Real-time mock data updates
export const generateRealTimeUpdate = (currentData: MockAnalyticsData): Partial<MockAnalyticsData> => {
    return {
        performanceMetrics: {
            ...currentData.performanceMetrics,
            // Simulate small fluctuations
            totalRevenue: currentData.performanceMetrics.totalRevenue + (Math.random() - 0.5) * 1000,
            revenueChange: currentData.performanceMetrics.revenueChange + (Math.random() - 0.5) * 2,
            totalBookings: currentData.performanceMetrics.totalBookings + Math.floor((Math.random() - 0.5) * 10),
            bookingChange: currentData.performanceMetrics.bookingChange + (Math.random() - 0.5) * 1,
            occupancyRate: Math.max(0, Math.min(100, currentData.performanceMetrics.occupancyRate + (Math.random() - 0.5) * 2)),
            occupancyChange: currentData.performanceMetrics.occupancyChange + (Math.random() - 0.5) * 1,
        }
    };
};

// Simulate alerts based on thresholds
export const generateMockAlerts = (data: MockAnalyticsData) => {
    const alerts = [];
    const timestamp = new Date();

    // Revenue alerts
    if (data.performanceMetrics.revenueChange < -10) {
        alerts.push({
            id: `revenue-alert-${Date.now()}`,
            type: 'warning' as const,
            title: 'Revenue Alert',
            message: `Revenue has dropped by ${Math.abs(data.performanceMetrics.revenueChange).toFixed(1)}%`,
            timestamp,
            threshold: -10,
            currentValue: data.performanceMetrics.revenueChange
        });
    }

    // Occupancy alerts
    if (data.performanceMetrics.occupancyRate < 60) {
        alerts.push({
            id: `occupancy-alert-${Date.now()}`,
            type: 'error' as const,
            title: 'Low Occupancy Alert',
            message: `Occupancy rate is critically low at ${data.performanceMetrics.occupancyRate.toFixed(1)}%`,
            timestamp,
            threshold: 60,
            currentValue: data.performanceMetrics.occupancyRate
        });
    }

    // Success alerts
    if (data.performanceMetrics.revenueChange > 20) {
        alerts.push({
            id: `success-alert-${Date.now()}`,
            type: 'success' as const,
            title: 'Excellent Performance',
            message: `Revenue growth has exceeded 20% at ${data.performanceMetrics.revenueChange.toFixed(1)}%`,
            timestamp,
            threshold: 20,
            currentValue: data.performanceMetrics.revenueChange
        });
    }

    return alerts;
};

// Simple mock data for charts
export const mockAnalyticsData = {
    revenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [42000, 38000, 45000, 52000, 48000, 55000, 58000, 62000, 59000, 65000, 70000, 68000],
    },
    occupancy: {
        labels: ['Available', 'Occupied', 'Maintenance', 'Cleaning'],
        data: [35, 78, 5, 12],
    },
    bookingTrends: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        data: [45, 52, 48, 61, 55, 67],
    },
};
