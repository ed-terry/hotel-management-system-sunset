import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Advanced error tracking and analytics system
 */
export interface ErrorEvent {
    id: string;
    timestamp: number;
    type: 'error' | 'warning' | 'info';
    message: string;
    stack?: string;
    component?: string;
    userId?: string;
    sessionId: string;
    url: string;
    userAgent: string;
    metadata?: Record<string, any>;
}

export interface PerformanceMetric {
    id: string;
    timestamp: number;
    type: 'navigation' | 'paint' | 'layout' | 'render' | 'api' | 'user_interaction';
    name: string;
    value: number;
    unit: 'ms' | 'bytes' | 'count';
    component?: string;
    metadata?: Record<string, any>;
}

export interface AnalyticsEvent {
    id: string;
    timestamp: number;
    type: 'page_view' | 'user_action' | 'feature_usage' | 'performance' | 'error';
    category: string;
    action: string;
    label?: string;
    value?: number;
    component?: string;
    userId?: string;
    sessionId: string;
    metadata?: Record<string, any>;
}

class OptimizedAnalytics {
    private events: AnalyticsEvent[] = [];
    private errors: ErrorEvent[] = [];
    private metrics: PerformanceMetric[] = [];
    private batchSize = 50;
    private flushInterval = 30000; // 30 seconds
    private sessionId: string;
    private userId?: string;
    private flushTimer?: number;
    private debugMode: boolean;

    constructor(options: {
        batchSize?: number;
        flushInterval?: number;
        userId?: string;
        debugMode?: boolean;
    } = {}) {
        this.batchSize = options.batchSize ?? 50;
        this.flushInterval = options.flushInterval ?? 30000;
        this.userId = options.userId;
        this.debugMode = options.debugMode ?? import.meta.env.DEV;
        this.sessionId = this.generateSessionId();

        this.startFlushTimer();
        this.setupErrorHandlers();
        this.setupPerformanceObserver();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateEventId(): string {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private startFlushTimer(): void {
        this.flushTimer = window.setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    private setupErrorHandlers(): void {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.trackError({
                message: event.message,
                stack: event.error?.stack,
                component: 'window',
                metadata: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                },
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                message: `Unhandled Promise Rejection: ${event.reason}`,
                stack: event.reason?.stack,
                component: 'promise',
                metadata: {
                    reason: event.reason,
                },
            });
        });
    }

    private setupPerformanceObserver(): void {
        if ('PerformanceObserver' in window) {
            try {
                // Navigation timing
                const navObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'navigation') {
                            const navEntry = entry as PerformanceNavigationTiming;
                            this.trackMetric({
                                type: 'navigation',
                                name: 'page_load_time',
                                value: navEntry.loadEventEnd - navEntry.fetchStart,
                                unit: 'ms',
                                metadata: {
                                    domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                                    firstByte: navEntry.responseStart - navEntry.fetchStart,
                                },
                            });
                        }
                    });
                });
                navObserver.observe({ entryTypes: ['navigation'] });

                // Paint timing
                const paintObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        this.trackMetric({
                            type: 'paint',
                            name: entry.name,
                            value: entry.startTime,
                            unit: 'ms',
                        });
                    });
                });
                paintObserver.observe({ entryTypes: ['paint'] });

                // Layout shift
                const layoutObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                            this.trackMetric({
                                type: 'layout',
                                name: 'cumulative_layout_shift',
                                value: (entry as any).value,
                                unit: 'count',
                            });
                        }
                    });
                });
                layoutObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (error) {
                console.warn('Performance observer setup failed:', error);
            }
        }
    }

    setUserId(userId: string): void {
        this.userId = userId;
    }

    trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId' | 'userId'>): void {
        const fullEvent: AnalyticsEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
        };

        this.events.push(fullEvent);

        if (this.debugMode) {
            console.log('📊 Analytics event tracked:', fullEvent);
        }

        if (this.events.length >= this.batchSize) {
            this.flush();
        }
    }

    trackError(error: Omit<ErrorEvent, 'id' | 'timestamp' | 'sessionId' | 'userId' | 'url' | 'userAgent' | 'type'>): void {
        const errorEvent: ErrorEvent = {
            ...error,
            id: this.generateEventId(),
            timestamp: Date.now(),
            type: 'error',
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        this.errors.push(errorEvent);

        if (this.debugMode) {
            console.error('🔥 Error tracked:', errorEvent);
        }

        // Immediately flush critical errors
        if (this.errors.length >= 10) {
            this.flush();
        }
    }

    trackMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
        const fullMetric: PerformanceMetric = {
            ...metric,
            id: this.generateEventId(),
            timestamp: Date.now(),
        };

        this.metrics.push(fullMetric);

        if (this.debugMode) {
            console.log('⚡ Performance metric tracked:', fullMetric);
        }
    }

    trackPageView(page: string, metadata?: Record<string, any>): void {
        this.trackEvent({
            type: 'page_view',
            category: 'navigation',
            action: 'page_view',
            label: page,
            metadata: {
                ...metadata,
                referrer: document.referrer,
                title: document.title,
            },
        });
    }

    trackUserAction(action: string, category: string, label?: string, value?: number, metadata?: Record<string, any>): void {
        this.trackEvent({
            type: 'user_action',
            category,
            action,
            label,
            value,
            metadata,
        });
    }

    trackFeatureUsage(feature: string, component?: string, metadata?: Record<string, any>): void {
        this.trackEvent({
            type: 'feature_usage',
            category: 'feature',
            action: 'usage',
            label: feature,
            component,
            metadata,
        });
    }

    getAnalytics() {
        return {
            events: [...this.events],
            errors: [...this.errors],
            metrics: [...this.metrics],
            sessionId: this.sessionId,
            userId: this.userId,
        };
    }

    getErrorSummary() {
        const errorsByType = this.errors.reduce((acc, error) => {
            acc[error.message] = (acc[error.message] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const errorsByComponent = this.errors.reduce((acc, error) => {
            const component = error.component || 'unknown';
            acc[component] = (acc[component] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalErrors: this.errors.length,
            errorsByType,
            errorsByComponent,
            recentErrors: this.errors.slice(-10),
        };
    }

    getPerformanceSummary() {
        const metricsByType = this.metrics.reduce((acc, metric) => {
            acc[metric.type] = acc[metric.type] || [];
            acc[metric.type].push(metric);
            return acc;
        }, {} as Record<string, PerformanceMetric[]>);

        const averages = Object.entries(metricsByType).reduce((acc, [type, metrics]) => {
            const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
            acc[type] = total / metrics.length;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalMetrics: this.metrics.length,
            metricsByType,
            averages,
            recentMetrics: this.metrics.slice(-20),
        };
    }

    private async flush(): Promise<void> {
        if (this.events.length === 0 && this.errors.length === 0 && this.metrics.length === 0) {
            return;
        }

        const payload = {
            events: this.events.splice(0),
            errors: this.errors.splice(0),
            metrics: this.metrics.splice(0),
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: Date.now(),
        };

        try {
            // In a real app, you'd send this to your analytics endpoint
            if (this.debugMode) {
                console.log('📤 Analytics batch flushed:', payload);
            }

            // Store in localStorage as fallback
            const stored = localStorage.getItem('analytics_queue') || '[]';
            const queue = JSON.parse(stored);
            queue.push(payload);

            // Keep only last 10 batches in localStorage
            if (queue.length > 10) {
                queue.splice(0, queue.length - 10);
            }

            localStorage.setItem('analytics_queue', JSON.stringify(queue));
        } catch (error) {
            console.error('Failed to flush analytics:', error);
            // Re-add events back to the queue on failure
            this.events.unshift(...payload.events);
            this.errors.unshift(...payload.errors);
            this.metrics.unshift(...payload.metrics);
        }
    }

    destroy(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush();
    }
}

// Global analytics instance
export const analytics = new OptimizedAnalytics({
    debugMode: import.meta.env.DEV,
});

/**
 * React hook for component-level analytics
 */
export function useAnalytics(componentName: string) {
    const renderCount = useRef(0);
    const mountTime = useRef(Date.now());

    useEffect(() => {
        renderCount.current++;

        // Track component mount
        if (renderCount.current === 1) {
            analytics.trackEvent({
                type: 'feature_usage',
                category: 'component',
                action: 'mount',
                label: componentName,
                component: componentName,
            });
        }

        // Track render performance
        analytics.trackMetric({
            type: 'render',
            name: 'component_render',
            value: Date.now() - mountTime.current,
            unit: 'ms',
            component: componentName,
            metadata: {
                renderCount: renderCount.current,
            },
        });

        // Track component unmount
        return () => {
            if (renderCount.current === 1) {
                const lifetime = Date.now() - mountTime.current;
                analytics.trackEvent({
                    type: 'feature_usage',
                    category: 'component',
                    action: 'unmount',
                    label: componentName,
                    value: lifetime,
                    component: componentName,
                    metadata: {
                        lifetime,
                        renderCount: renderCount.current,
                    },
                });
            }
        };
    });

    const trackUserAction = useCallback((action: string, label?: string, value?: number, metadata?: Record<string, any>) => {
        analytics.trackUserAction(action, componentName, label, value, {
            ...metadata,
            component: componentName,
        });
    }, [componentName]);

    const trackError = useCallback((error: Error | string, metadata?: Record<string, any>) => {
        analytics.trackError({
            message: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'object' ? error.stack : undefined,
            component: componentName,
            metadata,
        });
    }, [componentName]);

    const trackFeature = useCallback((feature: string, metadata?: Record<string, any>) => {
        analytics.trackFeatureUsage(feature, componentName, metadata);
    }, [componentName]);

    return {
        trackUserAction,
        trackError,
        trackFeature,
        renderCount: renderCount.current,
    };
}

/**
 * Higher-order component for automatic analytics tracking
 */
export function withAnalytics<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
): React.ComponentType<P> {
    const AnalyticsWrapper: React.FC<P> = (props) => {
        const name = componentName || Component.displayName || Component.name || 'Unknown';
        useAnalytics(name);
        return React.createElement(Component, props);
    };

    AnalyticsWrapper.displayName = `withAnalytics(${componentName || Component.displayName || Component.name})`;

    return AnalyticsWrapper;
}

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
    private startTime: number;
    private marks: Map<string, number> = new Map();
    private label: string;

    constructor(label: string) {
        this.label = label;
        this.startTime = performance.now();
        this.marks.set('start', this.startTime);
    }

    mark(name: string): void {
        const time = performance.now();
        this.marks.set(name, time);

        analytics.trackMetric({
            type: 'user_interaction',
            name: `${this.label}_${name}`,
            value: time - this.startTime,
            unit: 'ms',
            metadata: {
                label: this.label,
                mark: name,
            },
        });
    }

    end(): number {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        this.marks.set('end', endTime);

        analytics.trackMetric({
            type: 'user_interaction',
            name: this.label,
            value: duration,
            unit: 'ms',
            metadata: {
                marks: Object.fromEntries(this.marks),
            },
        });

        return duration;
    }

    getMarks(): Record<string, number> {
        return Object.fromEntries(this.marks);
    }
}

/**
 * Hook for performance timing
 */
export function usePerformanceTimer(label: string) {
    const timer = useRef<PerformanceTimer | null>(null);

    const start = useCallback(() => {
        timer.current = new PerformanceTimer(label);
    }, [label]);

    const mark = useCallback((name: string) => {
        timer.current?.mark(name);
    }, []);

    const end = useCallback(() => {
        return timer.current?.end() || 0;
    }, []);

    const getMarks = useCallback(() => {
        return timer.current?.getMarks() || {};
    }, []);

    return { start, mark, end, getMarks };
}
