import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANALYTICS_STATS_QUERY } from '../graphql/queries';

interface UseRealTimeAnalyticsOptions {
    period: string;
    refreshInterval?: number;
    enableNotifications?: boolean;
}

interface AnalyticsAlert {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    threshold?: number;
    currentValue?: number;
}

export const useRealTimeAnalytics = ({
    period,
    refreshInterval = 30000, // 30 seconds
    enableNotifications = true
}: UseRealTimeAnalyticsOptions) => {
    const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isConnected, setIsConnected] = useState(true);

    const { data, loading, error, refetch } = useQuery(GET_ANALYTICS_STATS_QUERY, {
        variables: { period },
        errorPolicy: 'ignore', // Ignore errors completely
        fetchPolicy: 'no-cache', // Don't cache failed requests
        notifyOnNetworkStatusChange: true,
        pollInterval: refreshInterval, // Always try to poll
        skip: false, // Try to fetch but handle gracefully
    });

    // Check for threshold breaches and generate alerts
    const checkThresholds = useCallback((analyticsData: any) => {
        const newAlerts: AnalyticsAlert[] = [];

        // Revenue threshold check
        if (analyticsData?.revenue?.change < -10) {
            newAlerts.push({
                id: `revenue-alert-${Date.now()}`,
                type: 'warning',
                title: 'Revenue Alert',
                message: `Revenue has dropped by ${Math.abs(analyticsData.revenue.change).toFixed(1)}%`,
                timestamp: new Date(),
                threshold: -10,
                currentValue: analyticsData.revenue.change
            });
        }

        // Occupancy threshold check
        if (analyticsData?.occupancy?.rate < 60) {
            newAlerts.push({
                id: `occupancy-alert-${Date.now()}`,
                type: 'error',
                title: 'Low Occupancy Alert',
                message: `Occupancy rate is critically low at ${analyticsData.occupancy.rate}%`,
                timestamp: new Date(),
                threshold: 60,
                currentValue: analyticsData.occupancy.rate
            });
        }

        // High performance alert
        if (analyticsData?.revenue?.change > 20) {
            newAlerts.push({
                id: `performance-alert-${Date.now()}`,
                type: 'success',
                title: 'Excellent Performance',
                message: `Revenue growth has exceeded 20% at ${analyticsData.revenue.change.toFixed(1)}%`,
                timestamp: new Date(),
                threshold: 20,
                currentValue: analyticsData.revenue.change
            });
        }

        return newAlerts;
    }, []);

    // Update alerts when data changes
    useEffect(() => {
        if (data?.analyticsStats && enableNotifications) {
            const newAlerts = checkThresholds(data.analyticsStats);
            if (newAlerts.length > 0) {
                setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // Keep only last 10 alerts
            }
        }
        setLastUpdated(new Date());
    }, [data, checkThresholds, enableNotifications]);

    // Connection status monitoring
    useEffect(() => {
        if (error) {
            setIsConnected(false);
        } else if (data) {
            setIsConnected(true);
        }
    }, [data, error]);

    // Manual refresh function
    const refreshData = useCallback(async () => {
        try {
            await refetch();
        } catch (err) {
            console.error('Failed to refresh analytics data:', err);
        }
    }, [refetch]);

    // Clear alerts function
    const clearAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    // Clear all alerts function
    const clearAllAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    return {
        data,
        loading,
        error,
        alerts,
        lastUpdated,
        isConnected,
        refreshData,
        clearAlert,
        clearAllAlerts,
    };
};

export default useRealTimeAnalytics;
