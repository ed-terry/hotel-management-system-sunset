/**
 * Performance Optimization Utilities Index
 * 
 * This file exports all performance optimization utilities for easy importing
 * throughout the application.
 */

// React Component Optimizations
export {
    withPerformanceOptimization,
    createOptimizedContext,
    PureComponent,
    OptimizedList,
    LazyComponent,
    OptimizedForm,
    OptimizedImage,
} from './reactOptimizations';

// Performance Hooks
export {
    useSmartMemo,
    useSmartDebounce,
    useVirtualScrolling,
    useLifecycleTracking,
    useLazyLoading,
} from '../hooks/usePerformanceOptimization';

// State Management Optimizations
export {
    createStateManager,
    useStateManager,
    useAsyncReducer,
    useOptimizedForm,
    OptimizedCache,
    globalCache,
} from './stateOptimizations';

// Analytics and Tracking
export {
    analytics,
    useAnalytics,
    withAnalytics,
    PerformanceTimer,
    usePerformanceTimer,
} from './analyticsOptimizations';

// Performance Testing
export {
    MemoryLeakDetector,
    BundleAnalyzer,
    PerformanceBenchmark,
    SimplePerformanceMeasurer,
    NetworkPerformanceMonitor,
    testAccessibilityPerformance,
} from './performanceTestingUtils';

// Type exports
export type {
    PerformanceTestResult,
    PerformanceTestOptions,
    MemoryLeakReport,
    BundleAnalysis,
    BenchmarkResult,
    BenchmarkComparison,
    A11yPerformanceResult,
    NetworkPerformanceReport,
} from './performanceTestingUtils';

export type {
    StateManagerOptions,
    StateManager,
    AsyncAction,
    FormField,
    FormState,
    FormOptions,
} from './stateOptimizations';

export type {
    ErrorEvent,
    PerformanceMetric,
    AnalyticsEvent,
} from './analyticsOptimizations';

export type {
    OptimizedListProps,
    OptimizedFormProps,
    OptimizedImageProps,
} from './reactOptimizations';

/**
 * Quick setup for performance monitoring
 */
export const setupPerformanceMonitoring = () => {
    if (import.meta.env.DEV) {
        console.log('🚀 Performance monitoring initialized');

        // Dynamic imports to avoid circular dependencies
        import('./analyticsOptimizations').then(({ analytics }) => {
            // Initialize global performance tracking
            window.addEventListener('load', () => {
                analytics.trackPageView(window.location.pathname);
            });

            // Track unhandled errors
            window.addEventListener('error', (event) => {
                analytics.trackError({
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

            // Performance observer setup
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'largest-contentful-paint') {
                            analytics.trackMetric({
                                type: 'paint',
                                name: 'largest_contentful_paint',
                                value: entry.startTime,
                                unit: 'ms',
                            });
                        }
                    });
                });

                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            }
        });
    }
};

/**
 * Development utilities
 */
export const devUtils = {
    logCacheStats: async () => {
        if (import.meta.env.DEV) {
            const { globalCache } = await import('./stateOptimizations');
            console.table(globalCache.getStats());
        }
    },

    logAnalytics: async () => {
        if (import.meta.env.DEV) {
            const { analytics } = await import('./analyticsOptimizations');
            console.log('Analytics Summary:', analytics.getAnalytics());
            console.log('Error Summary:', analytics.getErrorSummary());
            console.log('Performance Summary:', analytics.getPerformanceSummary());
        }
    },

    clearCaches: async () => {
        if (import.meta.env.DEV) {
            const { globalCache } = await import('./stateOptimizations');
            globalCache.clear();
            console.log('🗑️ All caches cleared');
        }
    },

    measureMemory: () => {
        if (import.meta.env.DEV && 'memory' in performance) {
            const memory = (performance as any).memory;
            console.log('Memory Usage:', {
                used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
            });
        }
    },
};

// Make dev utils available globally in development
if (import.meta.env.DEV) {
    (window as any).__PERFORMANCE_DEV_UTILS__ = devUtils;
}

/**
 * Performance constants and thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
    // Render performance (in milliseconds)
    GOOD_RENDER_TIME: 16, // 60fps target
    ACCEPTABLE_RENDER_TIME: 33, // 30fps
    POOR_RENDER_TIME: 100,

    // Memory usage (in bytes)
    GOOD_MEMORY_USAGE: 10 * 1024 * 1024, // 10MB
    ACCEPTABLE_MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
    POOR_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB

    // Network performance (in milliseconds)
    GOOD_API_RESPONSE: 100,
    ACCEPTABLE_API_RESPONSE: 500,
    POOR_API_RESPONSE: 2000,

    // Bundle sizes (in bytes)
    GOOD_CHUNK_SIZE: 100 * 1024, // 100KB
    ACCEPTABLE_CHUNK_SIZE: 250 * 1024, // 250KB
    POOR_CHUNK_SIZE: 500 * 1024, // 500KB
};

/**
 * Helper functions for performance evaluation
 */
export const performanceHelpers = {
    evaluateRenderTime: (time: number) => {
        if (time <= PERFORMANCE_THRESHOLDS.GOOD_RENDER_TIME) return 'good';
        if (time <= PERFORMANCE_THRESHOLDS.ACCEPTABLE_RENDER_TIME) return 'acceptable';
        return 'poor';
    },

    evaluateMemoryUsage: (usage: number) => {
        if (usage <= PERFORMANCE_THRESHOLDS.GOOD_MEMORY_USAGE) return 'good';
        if (usage <= PERFORMANCE_THRESHOLDS.ACCEPTABLE_MEMORY_USAGE) return 'acceptable';
        return 'poor';
    },

    evaluateApiResponse: (time: number) => {
        if (time <= PERFORMANCE_THRESHOLDS.GOOD_API_RESPONSE) return 'good';
        if (time <= PERFORMANCE_THRESHOLDS.ACCEPTABLE_API_RESPONSE) return 'acceptable';
        return 'poor';
    },

    formatBytes: (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatTime: (ms: number) => {
        if (ms < 1000) return `${ms.toFixed(2)}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${(ms / 60000).toFixed(2)}m`;
    },
};
