import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  componentMountTime: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  isEnabled?: boolean;
  showInProduction?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

/**
 * Performance monitoring component for tracking render performance
 * and memory usage in development mode
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  isEnabled = import.meta.env.DEV,
  showInProduction = false,
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    componentMountTime: Date.now()
  });

  const renderTimesRef = useRef<number[]>([]);
  const lastRenderStartRef = useRef<number>(0);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Start performance measurement
  useEffect(() => {
    if (!isEnabled && !showInProduction) return;

    lastRenderStartRef.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - lastRenderStartRef.current;
      renderTimesRef.current.push(renderTime);
      
      // Keep only last 50 render times for average calculation
      if (renderTimesRef.current.length > 50) {
        renderTimesRef.current = renderTimesRef.current.slice(-50);
      }

      const newMetrics: PerformanceMetrics = {
        renderCount: metrics.renderCount + 1,
        lastRenderTime: renderTime,
        avgRenderTime: renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length,
        componentMountTime: metrics.componentMountTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
      };

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);
    };
  });

  // Setup Performance Observer for more detailed metrics
  useEffect(() => {
    if (!isEnabled || typeof PerformanceObserver === 'undefined') return;

    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes(componentName)) {
            console.log(`⚡ ${componentName} Performance:`, {
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        });
      });

      observerRef.current.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [componentName, isEnabled]);

  // Memory usage monitoring
  const checkMemoryUsage = useCallback(() => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  // Log performance warnings
  useEffect(() => {
    if (!isEnabled) return;

    if (metrics.lastRenderTime > 16) { // 60fps threshold
      console.warn(`🐌 Slow render detected in ${componentName}:`, {
        renderTime: `${metrics.lastRenderTime.toFixed(2)}ms`,
        renderCount: metrics.renderCount
      });
    }

    if (metrics.renderCount > 0 && metrics.renderCount % 100 === 0) {
      const memory = checkMemoryUsage();
      console.log(`📊 ${componentName} Performance Summary:`, {
        renderCount: metrics.renderCount,
        avgRenderTime: `${metrics.avgRenderTime.toFixed(2)}ms`,
        memoryUsage: memory ? `${(memory.used / 1024 / 1024).toFixed(2)}MB` : 'N/A'
      });
    }
  }, [metrics, componentName, isEnabled, checkMemoryUsage]);

  if (!isEnabled && !showInProduction) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-base-100 border border-orange-300/50 rounded-lg p-3 text-xs font-mono shadow-lg z-50 max-w-xs">
      <div className="font-bold text-orange-600 mb-2">🔧 {componentName}</div>
      <div className="space-y-1 text-base-content/70">
        <div>Renders: {metrics.renderCount}</div>
        <div>Last: {metrics.lastRenderTime.toFixed(2)}ms</div>
        <div>Avg: {metrics.avgRenderTime.toFixed(2)}ms</div>
        <div>Uptime: {((Date.now() - metrics.componentMountTime) / 1000).toFixed(1)}s</div>
        {metrics.memoryUsage && (
          <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
export type { PerformanceMetrics };
