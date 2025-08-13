// Sample Analytics Data for Sunset Hotel Management System
// This provides realistic sample data for demonstration purposes

export interface AnalyticsData {
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
    departmentPerformance: Array<{
        department: string;
        satisfaction: number;
        efficiency: number;
        revenue: number;
    }>;
    seasonalTrends: Array<{
        month: string;
        bookings: number;
        revenue: number;
        occupancy: number;
    }>;
}

export const generateSampleAnalyticsData = (period: string): AnalyticsData => {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

    // Generate realistic revenue data based on hotel industry patterns
    const revenueStats = [];
    const baseRevenue = 45000; // Base daily revenue for a mid-size hotel
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const seasonalMultiplier = Math.sin((date.getMonth() + 1) * Math.PI / 6) * 0.3 + 1;
        const weekendMultiplier = isWeekend ? 1.4 : 1.0;
        const randomVariation = (Math.random() - 0.5) * 0.2 + 1;

        revenueStats.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(baseRevenue * seasonalMultiplier * weekendMultiplier * randomVariation),
            period: period
        });
    }

    // Generate realistic booking data
    const bookingStats = [];
    const baseBookings = 25; // Base daily bookings
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const seasonalMultiplier = Math.sin((date.getMonth() + 1) * Math.PI / 6) * 0.3 + 1;
        const weekendMultiplier = isWeekend ? 1.3 : 1.0;
        const randomVariation = (Math.random() - 0.5) * 0.3 + 1;

        bookingStats.push({
            date: date.toISOString().split('T')[0],
            bookings: Math.floor(baseBookings * seasonalMultiplier * weekendMultiplier * randomVariation),
            period: period
        });
    }

    // Calculate performance metrics based on generated data
    const totalRevenue = revenueStats.reduce((sum, stat) => sum + stat.revenue, 0);
    const totalBookings = bookingStats.reduce((sum, stat) => sum + stat.bookings, 0);
    const averageOccupancy = 78; // 78% average occupancy rate

    const departmentPerformance = [
        { department: 'Front Desk', satisfaction: 4.6, efficiency: 92, revenue: totalRevenue * 0.15 },
        { department: 'Housekeeping', satisfaction: 4.4, efficiency: 88, revenue: totalRevenue * 0.08 },
        { department: 'Food & Beverage', satisfaction: 4.2, efficiency: 85, revenue: totalRevenue * 0.25 },
        { department: 'Maintenance', satisfaction: 4.3, efficiency: 90, revenue: totalRevenue * 0.05 },
        { department: 'Security', satisfaction: 4.5, efficiency: 95, revenue: totalRevenue * 0.02 },
        { department: 'Spa & Wellness', satisfaction: 4.7, efficiency: 87, revenue: totalRevenue * 0.12 },
    ];

    const seasonalTrends = [
        { month: 'Jan', bookings: 580, revenue: 920000, occupancy: 72 },
        { month: 'Feb', bookings: 620, revenue: 980000, occupancy: 75 },
        { month: 'Mar', bookings: 720, revenue: 1150000, occupancy: 82 },
        { month: 'Apr', bookings: 780, revenue: 1240000, occupancy: 85 },
        { month: 'May', bookings: 850, revenue: 1350000, occupancy: 88 },
        { month: 'Jun', bookings: 920, revenue: 1460000, occupancy: 92 },
        { month: 'Jul', bookings: 950, revenue: 1520000, occupancy: 95 },
        { month: 'Aug', bookings: 940, revenue: 1500000, occupancy: 94 },
        { month: 'Sep', bookings: 810, revenue: 1290000, occupancy: 86 },
        { month: 'Oct', bookings: 760, revenue: 1210000, occupancy: 83 },
        { month: 'Nov', bookings: 680, revenue: 1080000, occupancy: 78 },
        { month: 'Dec', bookings: 890, revenue: 1420000, occupancy: 90 },
    ];

    return {
        revenueStats,
        bookingStats,
        occupancyStats: {
            rate: averageOccupancy,
            change: 5.2, // 5.2% increase
            trend: 'up',
            occupancyRate: averageOccupancy
        },
        performanceMetrics: {
            totalRevenue,
            revenueChange: 8.3, // 8.3% increase
            totalBookings,
            bookingChange: 12.1, // 12.1% increase
            occupancyRate: averageOccupancy,
            occupancyChange: 5.2, // 5.2% increase
            averageStayDuration: 2.8, // 2.8 nights average
            stayDurationChange: 0.3 // 0.3 nights increase
        },
        departmentPerformance,
        seasonalTrends
    };
};

export const generateRealTimeUpdate = (currentData: AnalyticsData): Partial<AnalyticsData> => {
    // Generate small variations for real-time feel
    const occupancyVariation = (Math.random() - 0.5) * 2;

    return {
        occupancyStats: {
            ...currentData.occupancyStats,
            rate: Math.max(0, Math.min(100, currentData.occupancyStats.rate + occupancyVariation))
        }
    };
};

export const generateSampleAlerts = (data: AnalyticsData) => {
    const alerts = [];

    // Revenue-based alerts
    if (data.performanceMetrics.revenueChange < 0) {
        alerts.push({
            id: 'revenue-decline',
            type: 'warning',
            title: 'Revenue Decline',
            message: `Revenue has decreased by ${Math.abs(data.performanceMetrics.revenueChange).toFixed(1)}% compared to last period`,
            timestamp: new Date().toISOString(),
            severity: 'medium'
        });
    }

    // Occupancy-based alerts
    if (data.occupancyStats.rate < 70) {
        alerts.push({
            id: 'low-occupancy',
            type: 'warning',
            title: 'Low Occupancy Rate',
            message: `Current occupancy rate is ${data.occupancyStats.rate.toFixed(1)}%, below optimal threshold`,
            timestamp: new Date().toISOString(),
            severity: 'high'
        });
    }

    // Department performance alerts
    data.departmentPerformance.forEach(dept => {
        if (dept.satisfaction < 4.0) {
            alerts.push({
                id: `dept-satisfaction-${dept.department.toLowerCase().replace(/\s+/g, '-')}`,
                type: 'alert',
                title: `${dept.department} Satisfaction Alert`,
                message: `${dept.department} satisfaction rating is ${dept.satisfaction}/5, needs attention`,
                timestamp: new Date().toISOString(),
                severity: 'medium'
            });
        }
    });

    return alerts;
};

export const sampleAnalyticsData = {
    '7d': generateSampleAnalyticsData('7d'),
    '30d': generateSampleAnalyticsData('30d'),
    '90d': generateSampleAnalyticsData('90d'),
    '1y': generateSampleAnalyticsData('1y'),
};
