import React, { ComponentType, memo, useMemo } from 'react';
import { useLifecycleTracking } from '../hooks/usePerformanceOptimization';

/**
 * Higher-order component that adds advanced optimization features
 */
export function withPerformanceOptimization<P extends object>(
  Component: ComponentType<P>,
  options: {
    displayName?: string;
    shouldUpdate?: (prevProps: P, nextProps: P) => boolean;
    debugMode?: boolean;
    trackLifecycle?: boolean;
  } = {}
) {
  const {
    displayName = Component.displayName || Component.name || 'Component',
    shouldUpdate,
    debugMode = import.meta.env.DEV,
    trackLifecycle = true,
  } = options;

  const OptimizedComponent = memo<P>((props) => {
    const lifecycle = trackLifecycle ? useLifecycleTracking(displayName) : null;

    if (debugMode && lifecycle) {
      console.log(`🔧 ${displayName} render #${lifecycle.renderCount} (uptime: ${lifecycle.uptime}ms)`);
    }

    return <Component {...props} />;
  }, shouldUpdate);

  OptimizedComponent.displayName = `withPerformanceOptimization(${displayName})`;

  return OptimizedComponent;
}

/**
 * Utility for creating optimized React contexts
 */
export function createOptimizedContext<T>(
  defaultValue: T,
  options: {
    displayName?: string;
    debugMode?: boolean;
  } = {}
) {
  const { displayName = 'OptimizedContext', debugMode = import.meta.env.DEV } = options;
  
  const Context = React.createContext<T>(defaultValue);
  Context.displayName = displayName;

  const Provider: React.FC<{ value: T; children: React.ReactNode }> = ({ value, children }) => {
    const memoizedValue = useMemo(() => {
      if (debugMode) {
        console.log(`🔄 ${displayName} value updated:`, value);
      }
      return value;
    }, [value]);

    return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
  };

  Provider.displayName = `${displayName}.Provider`;

  return {
    Context,
    Provider,
    Consumer: Context.Consumer,
  };
}

/**
 * Component wrapper that prevents unnecessary re-renders
 */
export const PureComponent: React.FC<{
  children: React.ReactNode;
  dependencies?: unknown[];
  debugLabel?: string;
}> = memo(({ children, dependencies = [], debugLabel }) => {
  const memoizedChildren = useMemo(() => {
    if (debugLabel && import.meta.env.DEV) {
      console.log(`🎯 PureComponent render: ${debugLabel}`);
    }
    return children;
  }, dependencies);

  return <>{memoizedChildren}</>;
});

PureComponent.displayName = 'PureComponent';

/**
 * Optimized list renderer with virtual scrolling support
 */
export interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
  debugLabel?: string;
}

export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  itemHeight = 50,
  containerHeight = 400,
  className = '',
  debugLabel = 'OptimizedList',
}: OptimizedListProps<T>) {
  const memoizedItems = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log(`📊 ${debugLabel} rendering ${items.length} items`);
    }
    
    return items.map((item, index) => (
      <div
        key={keyExtractor(item, index)}
        style={{ height: itemHeight }}
        className="flex-shrink-0"
      >
        {renderItem(item, index)}
      </div>
    ));
  }, [items, renderItem, keyExtractor, itemHeight, debugLabel]);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      {memoizedItems}
    </div>
  );
}

/**
 * Lazy component loader with error boundary
 */
interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  debugLabel?: string;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  loader,
  fallback = <div className="animate-pulse bg-base-200 h-20 rounded"></div>,
  errorFallback = <div className="text-error">Failed to load component</div>,
  debugLabel = 'LazyComponent',
}) => {
  const LazyLoadedComponent = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log(`🔄 Loading lazy component: ${debugLabel}`);
    }
    
    return React.lazy(() =>
      loader().catch((error) => {
        console.error(`❌ Failed to load ${debugLabel}:`, error);
        return { default: () => errorFallback };
      })
    );
  }, [loader, errorFallback, debugLabel]);

  return (
    <React.Suspense fallback={fallback}>
      <LazyLoadedComponent />
    </React.Suspense>
  );
};

/**
 * Performance-optimized form component
 */
export interface OptimizedFormProps {
  children: React.ReactNode;
  onSubmit?: (data: FormData) => void;
  debounceMs?: number;
  className?: string;
  debugLabel?: string;
}

export const OptimizedForm: React.FC<OptimizedFormProps> = memo(({
  children,
  onSubmit,
  debounceMs = 300,
  className = '',
  debugLabel = 'OptimizedForm',
}) => {
  const submitTimeoutRef = React.useRef<number>();

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    submitTimeoutRef.current = window.setTimeout(() => {
      const formData = new FormData(event.currentTarget);
      
      if (import.meta.env.DEV) {
        console.log(`📝 ${debugLabel} submitted`);
      }
      
      onSubmit?.(formData);
    }, debounceMs);
  }, [onSubmit, debounceMs, debugLabel]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
});

OptimizedForm.displayName = 'OptimizedForm';

/**
 * Image component with lazy loading and optimization
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  quality?: number;
  lazy?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  lazy = true,
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = React.useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = React.useCallback(() => {
    setError(true);
  }, []);

  if (error) {
    return (
      <div
        className={`bg-base-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-base-content/50 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!loaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
