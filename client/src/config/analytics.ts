// Analytics Dashboard Configuration
export const ANALYTICS_CONFIG = {
    // Refresh intervals (in milliseconds)
    REFRESH_INTERVALS: {
        REAL_TIME: 10000,      // 10 seconds for real-time data
        STANDARD: 30000,       // 30 seconds for standard updates
        BACKGROUND: 60000,     // 1 minute for background updates
    },

    // Alert thresholds
    THRESHOLDS: {
        REVENUE: {
            CRITICAL_DROP: -15,    // Alert if revenue drops by 15% or more
            WARNING_DROP: -10,     // Warning if revenue drops by 10% or more
            EXCELLENT_GROWTH: 20,  // Celebrate if revenue grows by 20% or more
        },
        OCCUPANCY: {
            CRITICAL_LOW: 50,      // Critical alert if occupancy below 50%
            WARNING_LOW: 60,       // Warning if occupancy below 60%
            OPTIMAL: 80,           // Optimal occupancy rate
            MAXIMUM: 95,           // Maximum realistic occupancy
        },
        BOOKINGS: {
            CRITICAL_DROP: -20,    // Critical if bookings drop by 20% or more
            WARNING_DROP: -10,     // Warning if bookings drop by 10% or more
            EXCELLENT_GROWTH: 25,  // Excellent if bookings grow by 25% or more
        },
    },

    // Chart colors
    CHART_COLORS: {
        PRIMARY: '#3B82F6',      // Blue
        SUCCESS: '#10B981',      // Green
        WARNING: '#F59E0B',      // Amber
        ERROR: '#EF4444',        // Red
        INFO: '#6366F1',         // Indigo
        SECONDARY: '#8B5CF6',    // Purple
    },

    // Export formats
    EXPORT_FORMATS: [
        { value: 'json', label: 'JSON Data', extension: 'json' },
        { value: 'csv', label: 'CSV Spreadsheet', extension: 'csv' },
        { value: 'pdf', label: 'PDF Report', extension: 'pdf' },
        { value: 'xlsx', label: 'Excel Workbook', extension: 'xlsx' },
    ],

    // Time periods
    TIME_PERIODS: [
        { value: '7d', label: 'Last 7 days', days: 7 },
        { value: '30d', label: 'Last 30 days', days: 30 },
        { value: '90d', label: 'Last 90 days', days: 90 },
        { value: '1y', label: 'Last year', days: 365 },
    ],

    // Metrics configuration
    METRICS: {
        REVENUE: {
            name: 'Revenue',
            icon: 'CurrencyDollarIcon',
            format: 'currency',
            color: 'primary',
            description: 'Total revenue generated',
        },
        OCCUPANCY: {
            name: 'Occupancy Rate',
            icon: 'HomeModernIcon',
            format: 'percentage',
            color: 'success',
            description: 'Percentage of rooms occupied',
        },
        BOOKINGS: {
            name: 'Bookings',
            icon: 'CalendarDaysIcon',
            format: 'number',
            color: 'info',
            description: 'Total number of bookings',
        },
        AVG_STAY: {
            name: 'Average Stay',
            icon: 'ClockIcon',
            format: 'days',
            color: 'warning',
            description: 'Average length of guest stays',
        },
    },

    // Dashboard layout
    LAYOUT: {
        GRID_COLS: {
            MOBILE: 1,
            TABLET: 2,
            DESKTOP: 4,
        },
        CHART_HEIGHT: 300,
        STAT_CARD_HEIGHT: 150,
    },

    // Performance benchmarks
    BENCHMARKS: {
        HOTEL_INDUSTRY: {
            OCCUPANCY_RATE: 75,    // Industry average occupancy rate
            REVENUE_PER_ROOM: 150, // Industry average revenue per room
            GUEST_SATISFACTION: 8.5, // Industry average satisfaction score
        },
        YOUR_HOTEL: {
            TARGET_OCCUPANCY: 85,  // Your hotel's target occupancy
            TARGET_REVENUE: 180,   // Your hotel's target revenue per room
            TARGET_SATISFACTION: 9.0, // Your hotel's target satisfaction
        },
    },

    // Notification settings
    NOTIFICATIONS: {
        MAX_ALERTS: 10,        // Maximum number of alerts to keep
        AUTO_DISMISS: 300000,  // Auto-dismiss alerts after 5 minutes
        SOUND_ENABLED: false,  // Enable sound notifications
        PUSH_ENABLED: true,    // Enable push notifications
    },

    // API endpoints (for future server integration)
    API_ENDPOINTS: {
        ANALYTICS: '/api/analytics',
        REAL_TIME: '/api/analytics/realtime',
        EXPORT: '/api/analytics/export',
        ALERTS: '/api/analytics/alerts',
    },
};

// Utility functions for analytics
export const analyticsUtils = {
    // Format currency values
    formatCurrency: (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    },

    // Format percentage values
    formatPercentage: (value: number): string => {
        return `${value.toFixed(1)}%`;
    },

    // Format number values
    formatNumber: (value: number): string => {
        return value.toLocaleString();
    },

    // Format days
    formatDays: (value: number): string => {
        return `${value.toFixed(1)} days`;
    },

    // Calculate trend
    calculateTrend: (current: number, previous: number): 'up' | 'down' => {
        return current >= previous ? 'up' : 'down';
    },

    // Calculate percentage change
    calculateChange: (current: number, previous: number): number => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    },

    // Determine alert level based on value and thresholds
    getAlertLevel: (value: number, thresholds: any): 'success' | 'warning' | 'error' | 'info' => {
        if (value <= thresholds.CRITICAL_LOW || value <= thresholds.CRITICAL_DROP) {
            return 'error';
        }
        if (value <= thresholds.WARNING_LOW || value <= thresholds.WARNING_DROP) {
            return 'warning';
        }
        if (value >= thresholds.EXCELLENT_GROWTH) {
            return 'success';
        }
        return 'info';
    },

    // Generate mock data for development
    generateMockData: (period: string) => {
        const days = ANALYTICS_CONFIG.TIME_PERIODS.find(p => p.value === period)?.days || 30;
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toISOString().split('T')[0],
                revenue: Math.floor(Math.random() * 50000) + 80000,
                bookings: Math.floor(Math.random() * 50) + 100,
                occupancy: Math.floor(Math.random() * 30) + 65,
                satisfaction: (Math.random() * 2) + 8,
            });
        }

        return data;
    },
};

export default ANALYTICS_CONFIG;
